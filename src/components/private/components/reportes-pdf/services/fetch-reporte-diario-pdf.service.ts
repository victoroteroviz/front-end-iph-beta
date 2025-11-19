/**
 * Servicio atómico para obtener el PDF del reporte diario.
 *
 * @description
 * Realiza una petición `POST` multipart/form-data al endpoint `/api/pdf-reporte/reporte-diario`
 * y retorna el Blob del PDF junto con metadatos útiles para consumo en visores como `PDFViewer`.
 * La función prioriza logs en nivel DEBUG para facilitar el trazado del flujo y depuración.
 *
 * @module fetch-reporte-diario-pdf.service
 * @version 1.0.0
 * @since 2025-11-19
 */

import httpHelper, { type HttpResponse } from '@/helper/http/http.helper';
import { logDebug, logInfo, logError } from '@/helper/log/logger.helper';

const MODULE = 'ReporteDiarioPdfMultipartService';
const ENDPOINT = '/api/pdf-reporte/reporte-diario';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 2;
const FALLBACK_FILENAME_PREFIX = 'reporta_dia_';

/**
 * Opciones avanzadas para la solicitud del PDF.
 */
export interface FetchReporteDiarioPdfOptions {
  /** Timeout en milisegundos (default: 60 segundos). */
  timeoutMs?: number;
  /** Número de reintentos ante fallos recuperables (default: 2). */
  retries?: number;
  /** Cuando es `true` crea un ObjectURL automáticamente (default). */
  createObjectUrl?: boolean;
  /** Controla si se adjunta el token de autenticación (default: true). */
  includeAuth?: boolean;
}

/**
 * Estructura de la respuesta del servicio.
 */
export interface FetchReporteDiarioPdfResult {
  /** Blob binario con el contenido del PDF. */
  blob: Blob;
  /** Nombre de archivo determinado a partir de headers o fallback. */
  fileName: string;
  /** URL de objeto utilizable en componentes como `PDFViewer`. */
  objectUrl?: string;
  /** Función para liberar memoria del `objectUrl` (no-op si no se creó). */
  revokeObjectUrl: () => void;
  /** Headers completos retornados por el backend. */
  headers: Headers;
  /** Content-Type detectado (normalmente `application/pdf`). */
  contentType: string;
  /** Código de estado HTTP. */
  status: number;
  /** Duración total de la solicitud en milisegundos. */
  duration: number;
}

/**
 * Solicita el PDF del reporte diario vía `multipart/form-data`.
 *
 * @param formData Payload multipart con la estructura documentada.
 * @param options Configuración avanzada de la petición.
 * @returns Blob y metadatos del PDF generado.
 *
 * @throws Error con `cause` para distinguir fallos HTTP o de red.
 *
 * @example
 * ```ts
 * const formData = new FormData();
 * formData.append('reportDate', '2025-11-18');
 * formData.append('usoApp[tabletsEnUso]', '18');
 * formData.append('activities[0][title]', 'Operativo');
 * formData.append('activities[0]', fileInput.files?.[0] ?? new File([], 'dummy.jpg'));
 *
 * const result = await fetchReporteDiarioPdf(formData);
 *
 * try {
 *   setPdfUrl(result.objectUrl);
 * } finally {
 *   result.revokeObjectUrl();
 * }
 * ```
 */
export async function fetchReporteDiarioPdf(
  formData: FormData,
  options: FetchReporteDiarioPdfOptions = {}
): Promise<FetchReporteDiarioPdfResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const includeAuth = options.includeAuth ?? true;
  const shouldCreateObjectUrl = options.createObjectUrl ?? true;

  const { fields, files } = summarizeFormData(formData);

  logDebug(MODULE, 'Preparando solicitud de reporte diario (multipart)', {
    endpoint: ENDPOINT,
    timeoutMs,
    retries,
    includeAuth,
    shouldCreateObjectUrl,
    fields,
    files
  });

  try {
    const response = await httpHelper.post<Blob>(ENDPOINT, formData, {
      timeout: timeoutMs,
      retries,
      cache: false,
      includeAuth,
      contentType: 'multipart/form-data'
    });

    logDebug(MODULE, 'Respuesta HTTP recibida', {
      status: response.status,
      ok: response.ok,
      duration: response.duration,
      contentType: response.headers.get('Content-Type')
    });

    validateResponse(response);

    const blob = response.data;
    const contentType = response.headers.get('Content-Type') ?? 'application/pdf';
    const fileName = resolveFileName(response, formData);

    let objectUrl: string | undefined;
    if (shouldCreateObjectUrl) {
      objectUrl = URL.createObjectURL(blob);
      logDebug(MODULE, 'ObjectURL generado para el PDF', {
        objectUrl: objectUrl.substring(0, 60) + '…',
        sizeBytes: blob.size
      });
    }

    logInfo(MODULE, 'Reporte diario PDF obtenido exitosamente', {
      status: response.status,
      duration: response.duration,
      fileName,
      sizeBytes: blob.size,
      fields,
      files
    });

    return {
      blob,
      fileName,
      objectUrl,
      revokeObjectUrl: () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          logDebug(MODULE, 'ObjectURL revocado manualmente');
        }
      },
      headers: response.headers,
      contentType,
      status: response.status,
      duration: response.duration
    };
  } catch (error) {
    logError(MODULE, error, 'Fallo al solicitar el PDF del reporte diario');
    logDebug(MODULE, 'Detalles del fallo al solicitar el PDF del reporte diario', {
      message: error instanceof Error ? error.message : String(error),
      fields,
      files,
      timeoutMs,
      retries
    });

    throw new Error('No fue posible obtener el PDF del reporte diario.', {
      cause: error
    });
  }
}

/**
 * Valida status y tamaño básico del blob.
 */
function validateResponse(response: HttpResponse<Blob>): void {
  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
  }

  if (response.data.size === 0) {
    throw new Error('El servidor respondió con un PDF vacío.');
  }
}

/**
 * Obtiene estadísticas de campos/archivos para logging.
 */
function summarizeFormData(formData: FormData): { fields: number; files: number } {
  let fields = 0;
  let files = 0;

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      files += 1;
    } else {
      fields += 1;
    }
  }

  return { fields, files };
}

/**
 * Determina el nombre de archivo final a partir de headers o fallback.
 */
function resolveFileName(response: HttpResponse<Blob>, formData: FormData): string {
  const headerFileName = extractFilenameFromHeaders(response.headers);
  if (headerFileName) {
    return headerFileName;
  }

  const reportDate = inferReportDate(formData);
  return `${FALLBACK_FILENAME_PREFIX}${reportDate}.pdf`;
}

/**
 * Busca `filename` o `filename*` en Content-Disposition.
 */
function extractFilenameFromHeaders(headers: Headers): string | undefined {
  const contentDisposition = headers.get('Content-Disposition');
  if (!contentDisposition) {
    return undefined;
  }

  const utfMatch = /filename\*=(?:UTF-8''|)([^;]+)/i.exec(contentDisposition);
  if (utfMatch && utfMatch[1]) {
    return decodeContentDispositionValue(utfMatch[1]);
  }

  const asciiMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
  if (asciiMatch && asciiMatch[1]) {
    return decodeContentDispositionValue(asciiMatch[1]);
  }

  return undefined;
}

function decodeContentDispositionValue(raw: string): string {
  const sanitized = raw.trim().replace(/^"|"$/g, '');
  try {
    return decodeURIComponent(sanitized);
  } catch {
    return sanitized;
  }
}

/**
 * Extrae `reportDate` de FormData o usa la fecha actual.
 */
function inferReportDate(formData: FormData): string {
  const value = formData.get('reportDate');

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
