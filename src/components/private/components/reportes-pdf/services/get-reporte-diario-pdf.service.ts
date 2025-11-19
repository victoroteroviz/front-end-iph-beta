/**
 * Servicio para Generar PDF del Reporte Diario
 *
 * Este servicio consume el endpoint `/api/pdf-reporte/reporte-diario` que genera
 * PDFs del reporte diario de uso de la aplicación y actividades.
 *
 * @module get-reporte-diario-pdf.service
 * @version 1.0.0
 * @author Sistema IPH
 *
 * @features
 * - ✅ TypeScript interfaces completas con validación Zod (Enterprise Grade)
 * - ✅ Soporte multipart/form-data + application/json
 * - ✅ Retorna Blob para máxima flexibilidad (descarga/preview)
 * - ✅ Cache DESHABILITADO (PDFs siempre frescos)
 * - ✅ Logging nivel DEBUG + INFO
 * - ✅ Error handling robusto con tipos específicos
 * - ✅ Retries automáticos (3 intentos)
 * - ✅ Timeout 60s (generación de PDF puede ser pesada)
 * - ✅ Helpers de utilidad incluidos
 * - ✅ Integración con PDFViewer component
 *
 * @example
 * ```typescript
 * // Uso básico - JSON
 * const pdfBlob = await generateReporteDiarioPDF({
 *   reportDate: '2025-11-18',
 *   usoApp: {
 *     tabletsEnUso: 18,
 *     totalTablets: 30
 *   },
 *   activities: [
 *     {
 *       title: 'Operativo preventivo',
 *       description: 'Recorrido en zona centro',
 *       imageUrls: ['https://example.com/img1.jpg']
 *     }
 *   ]
 * });
 *
 * // Descargar PDF
 * downloadPDFBlob(pdfBlob, 'reporte-diario.pdf');
 *
 * // Preview en PDFViewer
 * const url = createBlobUrl(pdfBlob);
 * <PDFViewer url={url} fileName="reporte-diario.pdf" />
 * ```
 *
 * @example
 * ```typescript
 * // Uso con FormData (multipart/form-data)
 * const formData = new FormData();
 * formData.append('reportDate', '2025-11-18');
 * formData.append('usoApp[tabletsEnUso]', '18');
 * formData.append('activities[0][title]', 'Operativo');
 * formData.append('activities[0]', imageFile1); // Archivo
 *
 * const pdfBlob = await generateReporteDiarioPDFMultipart(formData);
 * ```
 */

import { z } from 'zod';
import httpHelper from '@/helper/http/http.helper';
import type { HttpResponse } from '@/helper/http/http.helper';
import { logDebug, logInfo, logWarning, logError } from '@/helper/log/logger.helper';
import { showError, showSuccess } from '@/helper/notification/notification.helper';

// =====================================================
// ZOD SCHEMAS - VALIDACIÓN RUNTIME ENTERPRISE GRADE
// =====================================================

/**
 * Schema de validación para sección de Uso de Aplicación
 *
 * Aplica para tanto tablets como laptops.
 * Todos los campos son opcionales según la documentación de la API.
 */
const UsoAppSchema = z.object({
  /** Número de dispositivos en uso actualmente (provisto por cliente) */
  tabletsEnUso: z.number().int().nonnegative().optional(),

  /** Total de dispositivos disponibles (provisto por cliente) */
  totalTablets: z.number().int().nonnegative().optional(),

  /** Título personalizado para la sección (máx 50 caracteres) */
  devicesTitle: z.string().max(50).optional(),

  /** Registros elaborados totales (auto-poblado si disponible) */
  registrosElaborados: z.number().int().nonnegative().optional(),

  /** Registros de Justicia Cívica (auto-poblado) */
  registrosJusticiaCivica: z.number().int().nonnegative().optional(),

  /** Registros de Probable Delictivo (auto-poblado) */
  registrosProbableDelictivo: z.number().int().nonnegative().optional(),

  /** IPH de Justicia Cívica totales (auto-poblado) */
  iphJusticiaCivica: z.number().int().nonnegative().optional(),

  /** IPH con detenidos (auto-poblado) */
  iphJusticiaConDetenidos: z.number().int().nonnegative().optional(),

  /** IPH sin detenidos (auto-poblado) */
  iphJusticiaSinDetenidos: z.number().int().nonnegative().optional(),

  /** IPH Probable Delictivo (auto-poblado) */
  iphProbableDelictivo: z.number().int().nonnegative().optional(),

  /** IPH delictivo con detenidos (auto-poblado) */
  iphDelictivoConDetenidos: z.number().int().nonnegative().optional(),

  /** IPH delictivo sin detenidos (auto-poblado) */
  iphDelictivoSinDetenidos: z.number().int().nonnegative().optional(),

  /** Registros nuevos de la semana (auto-poblado) */
  registrosNuevosSemana: z.number().int().nonnegative().optional(),

  /** Registros nuevos del día (auto-poblado) */
  registrosNuevosDia: z.number().int().nonnegative().optional(),
}).strict();

/**
 * Schema de validación para una Actividad individual
 */
const ActivitySchema = z.object({
  /** Título de la actividad */
  title: z.string().min(1).max(200).optional(),

  /** Descripción detallada de la actividad */
  description: z.string().max(2000).optional(),

  /** URLs de imágenes (para application/json) */
  imageUrls: z.array(z.string().url()).max(5).optional(),
}).strict();

/**
 * Schema principal para el payload del reporte diario (application/json)
 *
 * Todas las secciones son opcionales individualmente, pero al menos UNA debe
 * tener datos válidos para generar el reporte.
 */
const ReporteDiarioPayloadSchema = z.object({
  /** Fecha del reporte (formato YYYY-MM-DD). Si no se envía, usa fecha actual del servidor */
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (esperado: YYYY-MM-DD)').optional(),

  /** Sección de uso de aplicación en tablets */
  usoApp: UsoAppSchema.optional(),

  /** Sección de uso de aplicación en laptops */
  usoLaptopApp: UsoAppSchema.optional(),

  /** Lista de actividades realizadas */
  activities: z.array(ActivitySchema).max(20).optional(),

  /** Si incluir salto de página antes de actividades */
  activitiesIncludePageBreak: z.boolean().optional(),
}).strict();

// =====================================================
// TYPESCRIPT INTERFACES (inferidas de Zod)
// =====================================================

/**
 * Interface para sección de Uso de Aplicación (Tablets o Laptops)
 */
export type UsoApp = z.infer<typeof UsoAppSchema>;

/**
 * Interface para una Actividad
 */
export type Activity = z.infer<typeof ActivitySchema>;

/**
 * Interface principal para el payload del reporte diario
 */
export type ReporteDiarioPayload = z.infer<typeof ReporteDiarioPayloadSchema>;

/**
 * Opciones de configuración para la generación del PDF
 */
export interface GeneratePDFOptions {
  /** Timeout personalizado en milisegundos (default: 60000ms = 60s) */
  timeout?: number;

  /** Número de reintentos (default: 3) */
  retries?: number;

  /** Mostrar notificaciones automáticas de éxito/error (default: true) */
  showNotifications?: boolean;

  /** Nombre sugerido para el archivo al descargar (default: 'reporte-diario.pdf') */
  suggestedFileName?: string;
}

/**
 * Resultado de la generación del PDF
 */
export interface GeneratePDFResult {
  /** Blob del PDF generado */
  blob: Blob;

  /** URL del Blob (debe ser revocada después de usar con URL.revokeObjectURL) */
  url: string;

  /** Tamaño del PDF en bytes */
  size: number;

  /** Content-Type del response */
  contentType: string;

  /** Nombre del archivo extraído del Content-Disposition header (si existe) */
  fileName?: string;

  /** Duración de la generación en milisegundos */
  duration: number;

  /** HTTP status code */
  status: number;
}

/**
 * Tipos de errores específicos del servicio
 */
export enum PDFErrorType {
  /** Error de validación de datos de entrada */
  VALIDATION = 'VALIDATION',

  /** No se proporcionó información suficiente para generar el reporte */
  NO_DATA = 'NO_DATA',

  /** Error de red o timeout */
  NETWORK = 'NETWORK',

  /** Error del servidor (500) */
  SERVER = 'SERVER',

  /** Error de autenticación */
  AUTH = 'AUTH',

  /** El response no es un PDF válido */
  INVALID_PDF = 'INVALID_PDF',

  /** Error desconocido */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Error personalizado para operaciones de PDF
 */
export class PDFServiceError extends Error {
  constructor(
    public type: PDFErrorType,
    message: string,
    public originalError?: unknown,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PDFServiceError';
  }
}

// =====================================================
// CONSTANTES DE CONFIGURACIÓN
// =====================================================

/**
 * Configuración por defecto del servicio
 */
const DEFAULT_CONFIG = {
  /** Endpoint del servicio */
  ENDPOINT: '/api/pdf-reporte/reporte-diario',

  /** Timeout por defecto: 60 segundos (generación de PDF puede ser pesada) */
  DEFAULT_TIMEOUT: 60000,

  /** Reintentos por defecto */
  DEFAULT_RETRIES: 3,

  /** Nombre de archivo por defecto */
  DEFAULT_FILENAME: 'reporte-diario.pdf',

  /** Content-Types aceptados */
  ACCEPTED_CONTENT_TYPES: ['application/pdf'],

  /** Tamaño máximo esperado del PDF (50MB) */
  MAX_PDF_SIZE: 50 * 1024 * 1024,

  /** Tamaño mínimo esperado del PDF (1KB) */
  MIN_PDF_SIZE: 1024,
} as const;

// =====================================================
// FUNCIONES DE VALIDACIÓN
// =====================================================

/**
 * Valida el payload del reporte diario usando Zod
 *
 * @param payload - Datos a validar
 * @returns Payload validado y tipado
 * @throws PDFServiceError si la validación falla
 *
 * @example
 * ```typescript
 * const validated = validatePayload({
 *   reportDate: '2025-11-18',
 *   usoApp: { tabletsEnUso: 18 }
 * });
 * ```
 */
export function validatePayload(payload: unknown): ReporteDiarioPayload {
  const MODULE = 'ReporteDiarioPDFService';

  logDebug(MODULE, 'Validando payload con Zod', {
    hasReportDate: !!(payload as any)?.reportDate,
    hasUsoApp: !!(payload as any)?.usoApp,
    hasUsoLaptopApp: !!(payload as any)?.usoLaptopApp,
    hasActivities: !!(payload as any)?.activities,
  });

  try {
    const validated = ReporteDiarioPayloadSchema.parse(payload);

    // Validación adicional: al menos una sección con datos
    const hasUsoApp = validated.usoApp && Object.keys(validated.usoApp).length > 0;
    const hasUsoLaptopApp = validated.usoLaptopApp && Object.keys(validated.usoLaptopApp).length > 0;
    const hasActivities = validated.activities && validated.activities.length > 0;

    if (!hasUsoApp && !hasUsoLaptopApp && !hasActivities) {
      logWarning(MODULE, 'Payload válido pero sin datos significativos', {
        usoApp: validated.usoApp,
        usoLaptopApp: validated.usoLaptopApp,
        activities: validated.activities
      });

      throw new PDFServiceError(
        PDFErrorType.NO_DATA,
        'Debe proporcionar al menos una sección con datos: usoApp, usoLaptopApp o activities',
        undefined,
        { validated }
      );
    }

    logDebug(MODULE, 'Payload validado exitosamente', {
      reportDate: validated.reportDate,
      sections: {
        usoApp: hasUsoApp,
        usoLaptopApp: hasUsoLaptopApp,
        activities: hasActivities
      }
    });

    return validated;

  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      logError(MODULE, 'Error de validación Zod', {
        errors: formattedErrors,
        payload
      });

      throw new PDFServiceError(
        PDFErrorType.VALIDATION,
        `Datos inválidos: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`,
        error,
        { formattedErrors }
      );
    }

    // Re-throw PDFServiceError
    if (error instanceof PDFServiceError) {
      throw error;
    }

    // Error desconocido
    logError(MODULE, 'Error desconocido en validación', error);
    throw new PDFServiceError(
      PDFErrorType.UNKNOWN,
      `Error inesperado en validación: ${String(error)}`,
      error
    );
  }
}

/**
 * Valida que el response sea un PDF válido
 *
 * @param response - Response HTTP a validar
 * @param blob - Blob del PDF
 * @returns true si es válido
 * @throws PDFServiceError si no es válido
 */
function validatePDFResponse(response: HttpResponse<Blob>, blob: Blob): void {
  const MODULE = 'ReporteDiarioPDFService';

  // Validar Content-Type
  const contentType = response.headers.get('Content-Type') || '';
  const isValidContentType = DEFAULT_CONFIG.ACCEPTED_CONTENT_TYPES.some(
    type => contentType.includes(type)
  );

  if (!isValidContentType) {
    logError(MODULE, 'Content-Type inválido en response', {
      contentType,
      expected: DEFAULT_CONFIG.ACCEPTED_CONTENT_TYPES,
      status: response.status
    });

    throw new PDFServiceError(
      PDFErrorType.INVALID_PDF,
      `Response no es un PDF. Content-Type recibido: ${contentType}`,
      undefined,
      { contentType, status: response.status }
    );
  }

  // Validar tamaño del Blob
  if (blob.size < DEFAULT_CONFIG.MIN_PDF_SIZE) {
    logError(MODULE, 'PDF demasiado pequeño (posible error)', {
      size: blob.size,
      minSize: DEFAULT_CONFIG.MIN_PDF_SIZE
    });

    throw new PDFServiceError(
      PDFErrorType.INVALID_PDF,
      `PDF inválido: tamaño demasiado pequeño (${blob.size} bytes)`,
      undefined,
      { size: blob.size, minSize: DEFAULT_CONFIG.MIN_PDF_SIZE }
    );
  }

  if (blob.size > DEFAULT_CONFIG.MAX_PDF_SIZE) {
    logWarning(MODULE, 'PDF excede tamaño máximo esperado', {
      size: blob.size,
      maxSize: DEFAULT_CONFIG.MAX_PDF_SIZE
    });
  }

  // Validar que el Blob sea de tipo PDF
  if (blob.type && !blob.type.includes('pdf')) {
    logWarning(MODULE, 'Blob type no indica PDF', {
      blobType: blob.type,
      contentType
    });
  }

  logDebug(MODULE, 'PDF validado exitosamente', {
    contentType,
    size: blob.size,
    sizeFormatted: formatBytes(blob.size)
  });
}

// =====================================================
// HELPERS DE UTILIDAD
// =====================================================

/**
 * Extrae el nombre del archivo del header Content-Disposition
 *
 * @param headers - Headers del response
 * @returns Nombre del archivo o undefined si no se encuentra
 *
 * @example
 * Content-Disposition: inline; filename="reporte-diario.pdf"
 * → "reporte-diario.pdf"
 */
function extractFileNameFromHeaders(headers: Headers): string | undefined {
  const contentDisposition = headers.get('Content-Disposition');

  if (!contentDisposition) {
    logDebug('ReporteDiarioPDFService', 'No Content-Disposition header encontrado');
    return undefined;
  }

  // Regex para extraer filename (con o sin comillas)
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition);

  if (matches && matches[1]) {
    // Remover comillas si existen
    const filename = matches[1].replace(/['"]/g, '');
    logDebug('ReporteDiarioPDFService', 'Filename extraído de Content-Disposition', {
      filename,
      contentDisposition
    });
    return filename;
  }

  logDebug('ReporteDiarioPDFService', 'No se pudo extraer filename de Content-Disposition', {
    contentDisposition
  });

  return undefined;
}

/**
 * Formatea bytes a formato legible
 *
 * @param bytes - Número de bytes
 * @returns String formateado (ej: "1.5 MB")
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Crea una URL de objeto desde un Blob
 *
 * IMPORTANTE: Debe ser revocada después de usar con URL.revokeObjectURL(url)
 *
 * @param blob - Blob del PDF
 * @returns URL de objeto
 *
 * @example
 * ```typescript
 * const url = createBlobUrl(blob);
 * // Usar url...
 * URL.revokeObjectURL(url); // Limpiar cuando termine
 * ```
 */
export function createBlobUrl(blob: Blob): string {
  const url = URL.createObjectURL(blob);
  logDebug('ReporteDiarioPDFService', 'Blob URL creada', {
    size: blob.size,
    type: blob.type,
    url: url.substring(0, 50) + '...'
  });
  return url;
}

/**
 * Descarga un Blob como archivo
 *
 * @param blob - Blob a descargar
 * @param fileName - Nombre del archivo
 *
 * @example
 * ```typescript
 * downloadPDFBlob(pdfBlob, 'mi-reporte.pdf');
 * ```
 */
export function downloadPDFBlob(blob: Blob, fileName: string = DEFAULT_CONFIG.DEFAULT_FILENAME): void {
  const MODULE = 'ReporteDiarioPDFService';

  try {
    logInfo(MODULE, 'Iniciando descarga de PDF', {
      fileName,
      size: blob.size,
      sizeFormatted: formatBytes(blob.size)
    });

    // Crear URL temporal
    const url = createBlobUrl(blob);

    // Crear elemento <a> temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    // Agregar al DOM, hacer click y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
      logDebug(MODULE, 'Blob URL revocada después de descarga');
    }, 1000);

    logInfo(MODULE, 'Descarga iniciada exitosamente', { fileName });

  } catch (error) {
    logError(MODULE, 'Error en descarga de PDF', error);
    throw new PDFServiceError(
      PDFErrorType.UNKNOWN,
      `Error al descargar PDF: ${String(error)}`,
      error
    );
  }
}

/**
 * Abre un Blob PDF en nueva pestaña para preview
 *
 * @param blob - Blob del PDF
 *
 * @example
 * ```typescript
 * openPDFInNewTab(pdfBlob);
 * ```
 */
export function openPDFInNewTab(blob: Blob): void {
  const MODULE = 'ReporteDiarioPDFService';

  try {
    logInfo(MODULE, 'Abriendo PDF en nueva pestaña', {
      size: blob.size,
      sizeFormatted: formatBytes(blob.size)
    });

    const url = createBlobUrl(blob);

    const newWindow = window.open(url, '_blank');

    if (!newWindow) {
      throw new Error('El navegador bloqueó la ventana emergente. Permita ventanas emergentes para este sitio.');
    }

    // Limpiar URL después de que la ventana cargue
    newWindow.addEventListener('load', () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        logDebug(MODULE, 'Blob URL revocada después de abrir en nueva pestaña');
      }, 5000);
    });

    logInfo(MODULE, 'PDF abierto en nueva pestaña exitosamente');

  } catch (error) {
    logError(MODULE, 'Error al abrir PDF en nueva pestaña', error);
    throw new PDFServiceError(
      PDFErrorType.UNKNOWN,
      `Error al abrir PDF: ${String(error)}`,
      error
    );
  }
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

/**
 * Genera un PDF del reporte diario usando application/json
 *
 * Este es el método principal para generar PDFs. Usa application/json
 * para enviar datos estructurados al servidor.
 *
 * CARACTERÍSTICAS:
 * - ✅ Validación Zod automática
 * - ✅ Retries automáticos (3 por defecto)
 * - ✅ Timeout 60s por defecto
 * - ✅ Cache deshabilitado (PDFs siempre frescos)
 * - ✅ Logging detallado (debug + info)
 * - ✅ Retorna Blob + URL para máxima flexibilidad
 *
 * @param payload - Datos del reporte diario
 * @param options - Opciones de configuración
 * @returns Resultado con Blob, URL y metadata
 * @throws PDFServiceError en caso de error
 *
 * @example
 * ```typescript
 * // Generar reporte básico
 * const result = await generateReporteDiarioPDF({
 *   reportDate: '2025-11-18',
 *   usoApp: {
 *     tabletsEnUso: 18,
 *     totalTablets: 30,
 *     registrosElaborados: 150
 *   }
 * });
 *
 * // Descargar
 * downloadPDFBlob(result.blob, result.fileName || 'reporte.pdf');
 *
 * // O usar en PDFViewer
 * <PDFViewer
 *   url={result.url}
 *   fileName={result.fileName}
 * />
 *
 * // IMPORTANTE: Limpiar URL cuando termine
 * URL.revokeObjectURL(result.url);
 * ```
 *
 * @example
 * ```typescript
 * // Generar reporte con actividades e imágenes
 * const result = await generateReporteDiarioPDF({
 *   reportDate: '2025-11-18',
 *   usoApp: { tabletsEnUso: 18, totalTablets: 30 },
 *   usoLaptopApp: { laptopsEnUso: 6, totalLaptops: 10 },
 *   activities: [
 *     {
 *       title: 'Operativo vespertino',
 *       description: 'Cobertura en sector norte',
 *       imageUrls: [
 *         'https://cdn.example.com/foto1.jpg',
 *         'https://cdn.example.com/foto2.jpg'
 *       ]
 *     }
 *   ],
 *   activitiesIncludePageBreak: true
 * }, {
 *   timeout: 90000, // 90 segundos para reportes grandes
 *   showNotifications: true
 * });
 * ```
 */
export async function generateReporteDiarioPDF(
  payload: ReporteDiarioPayload,
  options: GeneratePDFOptions = {}
): Promise<GeneratePDFResult> {
  const MODULE = 'ReporteDiarioPDFService';
  const startTime = Date.now();

  // Configuración
  const config = {
    timeout: options.timeout ?? DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    retries: options.retries ?? DEFAULT_CONFIG.DEFAULT_RETRIES,
    showNotifications: options.showNotifications ?? true,
    suggestedFileName: options.suggestedFileName ?? DEFAULT_CONFIG.DEFAULT_FILENAME,
  };

  logInfo(MODULE, 'Generando PDF de reporte diario (application/json)', {
    reportDate: payload.reportDate,
    sections: {
      usoApp: !!payload.usoApp,
      usoLaptopApp: !!payload.usoLaptopApp,
      activities: payload.activities?.length || 0
    },
    config: {
      timeout: config.timeout,
      retries: config.retries
    }
  });

  try {
    // PASO 1: Validar payload con Zod
    const validatedPayload = validatePayload(payload);

    // PASO 2: Realizar request HTTP
    logDebug(MODULE, 'Enviando request HTTP POST', {
      endpoint: DEFAULT_CONFIG.ENDPOINT,
      contentType: 'application/json',
      timeout: config.timeout,
      retries: config.retries
    });

    const response = await httpHelper.post<Blob>(
      DEFAULT_CONFIG.ENDPOINT,
      validatedPayload,
      {
        timeout: config.timeout,
        retries: config.retries,
        cache: false, // ❌ Sin cache - PDFs siempre frescos
        contentType: 'application/json',
        includeAuth: true, // Incluir token de autenticación
      }
    );

    logDebug(MODULE, 'Response HTTP recibido', {
      status: response.status,
      ok: response.ok,
      duration: response.duration,
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length')
    });

    // PASO 3: Validar response
    if (!response.ok) {
      const errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;

      logError(MODULE, errorMessage, {
        status: response.status,
        statusText: response.statusText,
        duration: response.duration
      });

      // Determinar tipo de error
      let errorType: PDFErrorType;
      if (response.status === 400) {
        errorType = PDFErrorType.NO_DATA;
      } else if (response.status === 401 || response.status === 403) {
        errorType = PDFErrorType.AUTH;
      } else if (response.status >= 500) {
        errorType = PDFErrorType.SERVER;
      } else {
        errorType = PDFErrorType.UNKNOWN;
      }

      if (config.showNotifications) {
        showError(`Error al generar PDF: ${errorMessage}`);
      }

      throw new PDFServiceError(
        errorType,
        errorMessage,
        undefined,
        { status: response.status, statusText: response.statusText }
      );
    }

    // PASO 4: Obtener Blob del response
    const blob = response.data;

    // PASO 5: Validar PDF
    validatePDFResponse(response, blob);

    // PASO 6: Crear URL de objeto
    const url = createBlobUrl(blob);

    // PASO 7: Extraer nombre de archivo
    const fileName = extractFileNameFromHeaders(response.headers) || config.suggestedFileName;

    // PASO 8: Preparar resultado
    const duration = Date.now() - startTime;

    const result: GeneratePDFResult = {
      blob,
      url,
      size: blob.size,
      contentType: response.headers.get('Content-Type') || 'application/pdf',
      fileName,
      duration,
      status: response.status
    };

    logInfo(MODULE, 'PDF generado exitosamente', {
      fileName,
      size: blob.size,
      sizeFormatted: formatBytes(blob.size),
      duration: `${duration}ms`,
      status: response.status
    });

    if (config.showNotifications) {
      showSuccess(`PDF generado exitosamente: ${fileName}`);
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    // Si ya es PDFServiceError, re-throw
    if (error instanceof PDFServiceError) {
      logError(MODULE, `Error generando PDF [${error.type}]`, {
        message: error.message,
        type: error.type,
        duration: `${duration}ms`,
        details: error.details
      });

      if (config.showNotifications) {
        showError(error.message);
      }

      throw error;
    }

    // Error HTTP del httpHelper
    if (error && typeof error === 'object' && 'type' in error) {
      const httpError = error as any;

      logError(MODULE, 'Error HTTP en generación de PDF', {
        type: httpError.type,
        message: httpError.message,
        status: httpError.status,
        duration: `${duration}ms`
      });

      // Mapear error HTTP a PDFServiceError
      let pdfErrorType: PDFErrorType;
      if (httpError.type === 'TIMEOUT' || httpError.type === 'NETWORK') {
        pdfErrorType = PDFErrorType.NETWORK;
      } else if (httpError.type === 'AUTH') {
        pdfErrorType = PDFErrorType.AUTH;
      } else if (httpError.type === 'SERVER') {
        pdfErrorType = PDFErrorType.SERVER;
      } else {
        pdfErrorType = PDFErrorType.UNKNOWN;
      }

      const pdfError = new PDFServiceError(
        pdfErrorType,
        httpError.message || 'Error en request HTTP',
        httpError,
        { httpErrorType: httpError.type, status: httpError.status }
      );

      if (config.showNotifications) {
        showError(pdfError.message);
      }

      throw pdfError;
    }

    // Error desconocido
    logError(MODULE, 'Error desconocido generando PDF', error);

    const unknownError = new PDFServiceError(
      PDFErrorType.UNKNOWN,
      `Error inesperado: ${String(error)}`,
      error
    );

    if (config.showNotifications) {
      showError(unknownError.message);
    }

    throw unknownError;
  }
}

/**
 * Genera un PDF del reporte diario usando multipart/form-data
 *
 * Este método es útil cuando necesitas subir archivos de imagen junto con
 * los datos del reporte. Soporta hasta 5 imágenes totales.
 *
 * CARACTERÍSTICAS:
 * - ✅ Soporte para archivos de imagen (JPEG, PNG, JPG)
 * - ✅ Máximo 5 imágenes totales
 * - ✅ Mismo comportamiento que generateReporteDiarioPDF
 *
 * @param formData - FormData con los campos del reporte
 * @param options - Opciones de configuración
 * @returns Resultado con Blob, URL y metadata
 * @throws PDFServiceError en caso de error
 *
 * @example
 * ```typescript
 * // Crear FormData
 * const formData = new FormData();
 * formData.append('reportDate', '2025-11-18');
 * formData.append('usoApp[tabletsEnUso]', '18');
 * formData.append('usoApp[totalTablets]', '30');
 *
 * // Agregar actividades con imágenes
 * formData.append('activities[0][title]', 'Operativo vespertino');
 * formData.append('activities[0][description]', 'Cobertura en sector norte');
 * formData.append('activities[0]', imageFile1); // File object
 * formData.append('activities[0]', imageFile2); // File object
 *
 * // Generar PDF
 * const result = await generateReporteDiarioPDFMultipart(formData);
 *
 * // Descargar
 * downloadPDFBlob(result.blob, result.fileName || 'reporte.pdf');
 * ```
 */
export async function generateReporteDiarioPDFMultipart(
  formData: FormData,
  options: GeneratePDFOptions = {}
): Promise<GeneratePDFResult> {
  const MODULE = 'ReporteDiarioPDFService';
  const startTime = Date.now();

  // Configuración
  const config = {
    timeout: options.timeout ?? DEFAULT_CONFIG.DEFAULT_TIMEOUT,
    retries: options.retries ?? DEFAULT_CONFIG.DEFAULT_RETRIES,
    showNotifications: options.showNotifications ?? true,
    suggestedFileName: options.suggestedFileName ?? DEFAULT_CONFIG.DEFAULT_FILENAME,
  };

  // Contar archivos en FormData para logging
  let fileCount = 0;
  let fieldCount = 0;
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      fileCount++;
    } else {
      fieldCount++;
    }
  }

  logInfo(MODULE, 'Generando PDF de reporte diario (multipart/form-data)', {
    fileCount,
    fieldCount,
    config: {
      timeout: config.timeout,
      retries: config.retries
    }
  });

  try {
    // PASO 1: Realizar request HTTP con multipart/form-data
    logDebug(MODULE, 'Enviando request HTTP POST (multipart)', {
      endpoint: DEFAULT_CONFIG.ENDPOINT,
      contentType: 'multipart/form-data',
      timeout: config.timeout,
      retries: config.retries,
      fileCount,
      fieldCount
    });

    const response = await httpHelper.post<Blob>(
      DEFAULT_CONFIG.ENDPOINT,
      formData,
      {
        timeout: config.timeout,
        retries: config.retries,
        cache: false, // ❌ Sin cache - PDFs siempre frescos
        contentType: 'multipart/form-data',
        includeAuth: true,
      }
    );

    logDebug(MODULE, 'Response HTTP recibido', {
      status: response.status,
      ok: response.ok,
      duration: response.duration,
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length')
    });

    // PASO 2: Validar response
    if (!response.ok) {
      const errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;

      logError(MODULE, errorMessage, {
        status: response.status,
        statusText: response.statusText,
        duration: response.duration
      });

      // Determinar tipo de error
      let errorType: PDFErrorType;
      if (response.status === 400) {
        errorType = PDFErrorType.NO_DATA;
      } else if (response.status === 401 || response.status === 403) {
        errorType = PDFErrorType.AUTH;
      } else if (response.status >= 500) {
        errorType = PDFErrorType.SERVER;
      } else {
        errorType = PDFErrorType.UNKNOWN;
      }

      if (config.showNotifications) {
        showError(`Error al generar PDF: ${errorMessage}`);
      }

      throw new PDFServiceError(
        errorType,
        errorMessage,
        undefined,
        { status: response.status, statusText: response.statusText }
      );
    }

    // PASO 3: Obtener Blob del response
    const blob = response.data;

    // PASO 4: Validar PDF
    validatePDFResponse(response, blob);

    // PASO 5: Crear URL de objeto
    const url = createBlobUrl(blob);

    // PASO 6: Extraer nombre de archivo
    const fileName = extractFileNameFromHeaders(response.headers) || config.suggestedFileName;

    // PASO 7: Preparar resultado
    const duration = Date.now() - startTime;

    const result: GeneratePDFResult = {
      blob,
      url,
      size: blob.size,
      contentType: response.headers.get('Content-Type') || 'application/pdf',
      fileName,
      duration,
      status: response.status
    };

    logInfo(MODULE, 'PDF generado exitosamente (multipart)', {
      fileName,
      size: blob.size,
      sizeFormatted: formatBytes(blob.size),
      duration: `${duration}ms`,
      status: response.status,
      fileCount
    });

    if (config.showNotifications) {
      showSuccess(`PDF generado exitosamente: ${fileName}`);
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    // Si ya es PDFServiceError, re-throw
    if (error instanceof PDFServiceError) {
      logError(MODULE, `Error generando PDF multipart [${error.type}]`, {
        message: error.message,
        type: error.type,
        duration: `${duration}ms`,
        details: error.details
      });

      if (config.showNotifications) {
        showError(error.message);
      }

      throw error;
    }

    // Error HTTP del httpHelper
    if (error && typeof error === 'object' && 'type' in error) {
      const httpError = error as any;

      logError(MODULE, 'Error HTTP en generación de PDF multipart', {
        type: httpError.type,
        message: httpError.message,
        status: httpError.status,
        duration: `${duration}ms`
      });

      // Mapear error HTTP a PDFServiceError
      let pdfErrorType: PDFErrorType;
      if (httpError.type === 'TIMEOUT' || httpError.type === 'NETWORK') {
        pdfErrorType = PDFErrorType.NETWORK;
      } else if (httpError.type === 'AUTH') {
        pdfErrorType = PDFErrorType.AUTH;
      } else if (httpError.type === 'SERVER') {
        pdfErrorType = PDFErrorType.SERVER;
      } else {
        pdfErrorType = PDFErrorType.UNKNOWN;
      }

      const pdfError = new PDFServiceError(
        pdfErrorType,
        httpError.message || 'Error en request HTTP',
        httpError,
        { httpErrorType: httpError.type, status: httpError.status }
      );

      if (config.showNotifications) {
        showError(pdfError.message);
      }

      throw pdfError;
    }

    // Error desconocido
    logError(MODULE, 'Error desconocido generando PDF multipart', error);

    const unknownError = new PDFServiceError(
      PDFErrorType.UNKNOWN,
      `Error inesperado: ${String(error)}`,
      error
    );

    if (config.showNotifications) {
      showError(unknownError.message);
    }

    throw unknownError;
  }
}

/**
 * Genera y descarga automáticamente un PDF del reporte diario
 *
 * Helper de conveniencia que genera el PDF y automáticamente inicia la descarga.
 *
 * @param payload - Datos del reporte diario
 * @param fileName - Nombre del archivo (opcional)
 * @param options - Opciones de configuración
 * @returns Resultado de la generación
 * @throws PDFServiceError en caso de error
 *
 * @example
 * ```typescript
 * // Generar y descargar en un solo paso
 * await generateAndDownloadPDF({
 *   reportDate: '2025-11-18',
 *   usoApp: { tabletsEnUso: 18, totalTablets: 30 }
 * }, 'mi-reporte-diario.pdf');
 * ```
 */
export async function generateAndDownloadPDF(
  payload: ReporteDiarioPayload,
  fileName?: string,
  options: GeneratePDFOptions = {}
): Promise<GeneratePDFResult> {
  const result = await generateReporteDiarioPDF(payload, {
    ...options,
    showNotifications: options.showNotifications ?? true
  });

  try {
    downloadPDFBlob(result.blob, fileName || result.fileName || DEFAULT_CONFIG.DEFAULT_FILENAME);
    return result;
  } finally {
    // Limpiar URL después de descargar
    setTimeout(() => {
      URL.revokeObjectURL(result.url);
    }, 2000);
  }
}

/**
 * Genera y abre un PDF del reporte diario en nueva pestaña
 *
 * Helper de conveniencia que genera el PDF y automáticamente lo abre para preview.
 *
 * @param payload - Datos del reporte diario
 * @param options - Opciones de configuración
 * @returns Resultado de la generación
 * @throws PDFServiceError en caso de error
 *
 * @example
 * ```typescript
 * // Generar y previsualizar en un solo paso
 * await generateAndPreviewPDF({
 *   reportDate: '2025-11-18',
 *   usoApp: { tabletsEnUso: 18, totalTablets: 30 }
 * });
 * ```
 */
export async function generateAndPreviewPDF(
  payload: ReporteDiarioPayload,
  options: GeneratePDFOptions = {}
): Promise<GeneratePDFResult> {
  const result = await generateReporteDiarioPDF(payload, {
    ...options,
    showNotifications: options.showNotifications ?? true
  });

  try {
    openPDFInNewTab(result.blob);
    return result;
  } catch (error) {
    // Si falla abrir en nueva pestaña, limpiar URL
    URL.revokeObjectURL(result.url);
    throw error;
  }
}
