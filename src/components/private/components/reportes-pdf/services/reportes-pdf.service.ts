/**
 * Servicio para generación de reportes PDF
 *
 * @description
 * Maneja la comunicación con el backend para generar y descargar reportes en formato PDF.
 * Utiliza el httpHelper centralizado para las peticiones HTTP.
 *
 * @pattern API-First
 * @version 1.0.0
 * @since 2025-11-04
 *
 * @security
 * - Todas las peticiones incluyen token de autenticación automáticamente (via httpHelper)
 * - Validación de parámetros antes de enviar al backend
 * - Sanitización de inputs
 *
 * @author Senior Full-Stack Developer
 */

import httpHelper from '../../../../../helper/http/http.helper';
import { sanitizeInput } from '../../../../../helper/security/security.helper';
import { logInfo, logError, logHttp } from '../../../../../helper/log/logger.helper';
import type { IReportePdfResponse, IReporteFiltros } from '../../../../../interfaces/IReporte';
import { REPORTES_TIEMPOS, REPORTES_NOMBRES_ARCHIVO } from '../config/constants';

/**
 * Genera un reporte PDF desde el backend
 *
 * @param endpoint - Endpoint del backend para generar el PDF
 * @param filtros - Filtros opcionales para el reporte
 * @param nombreReporte - Nombre descriptivo del reporte (para logging)
 * @returns Respuesta con el blob del PDF y metadata
 *
 * @throws Error si la generación falla o el servidor no responde
 *
 * @example
 * ```typescript
 * const response = await generarReportePdf(
 *   '/api/reportes/justicia-civica',
 *   {
 *     fechaInicio: '2025-01-01',
 *     fechaFin: '2025-01-31',
 *     periodo: 'mes'
 *   },
 *   'Justicia Cívica'
 * );
 *
 * if (response.success && response.blob) {
 *   descargarPdf(response.blob, response.filename);
 * }
 * ```
 */
export const generarReportePdf = async (
  endpoint: string,
  filtros?: IReporteFiltros,
  nombreReporte: string = 'Reporte'
): Promise<IReportePdfResponse> => {
  const startTime = Date.now();

  try {
    logInfo('ReportesPdfService', `Generando reporte: ${nombreReporte}`, {
      endpoint,
      filtros: filtros ? Object.keys(filtros) : 'sin filtros'
    });

    // Sanitizar filtros si existen
    const filtrosSanitizados = filtros ? sanitizarFiltros(filtros) : {};

    // Realizar petición al backend
    // NOTA: httpHelper detecta automáticamente el tipo de respuesta según Content-Type header
    // Si el backend responde con 'application/pdf', httpHelper retornará un Blob automáticamente
    const response = await httpHelper.post<Blob>(
      endpoint,
      filtrosSanitizados,
      {
        timeout: REPORTES_TIEMPOS.TIMEOUT_GENERACION,
        retries: 1 // Solo 1 reintento para generación de PDFs
      }
    );

    const duration = Date.now() - startTime;

    // Log HTTP exitoso
    logHttp('POST', endpoint, 200, duration, {
      reporteSize: response.data.size,
      reporte: nombreReporte
    });

    // Generar nombre de archivo
    const filename = generarNombreArchivo(nombreReporte, filtros);

    logInfo('ReportesPdfService', `Reporte generado exitosamente: ${nombreReporte}`, {
      filename,
      size: `${(response.data.size / 1024).toFixed(2)} KB`,
      duration: `${duration}ms`
    });

    return {
      success: true,
      message: 'Reporte PDF generado exitosamente',
      blob: response.data,
      filename
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    logError(
      'ReportesPdfService',
      error as Error,
      `Error generando reporte ${nombreReporte} - endpoint: ${endpoint} - duration: ${duration}ms`
    );

    // Log HTTP con error
    logHttp('POST', endpoint, 500, duration, {
      error: (error as Error).message,
      reporte: nombreReporte
    });

    return {
      success: false,
      message: `Error al generar el reporte: ${(error as Error).message}`
    };
  }
};

/**
 * Descarga un blob de PDF en el navegador
 *
 * @param blob - Blob del PDF a descargar
 * @param filename - Nombre del archivo a descargar
 *
 * @description
 * Crea un enlace temporal en el DOM para descargar el archivo,
 * lo clickea automáticamente y luego lo remueve.
 *
 * @example
 * ```typescript
 * descargarPdf(pdfBlob, 'reporte-justicia-civica-2025-01.pdf');
 * ```
 */
export const descargarPdf = (blob: Blob, filename: string): void => {
  try {
    logInfo('ReportesPdfService', 'Descargando PDF', { filename });

    // Crear URL temporal del blob
    const url = window.URL.createObjectURL(blob);

    // Crear elemento de enlace temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // Agregar al DOM, clickear y remover
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar memoria del blob URL
    window.URL.revokeObjectURL(url);

    logInfo('ReportesPdfService', 'PDF descargado exitosamente', { filename });
  } catch (error) {
    logError(
      'ReportesPdfService',
      error as Error,
      `Error al descargar PDF - filename: ${filename}`
    );
    throw error;
  }
};

/**
 * Sanitiza los filtros del reporte
 *
 * @param filtros - Filtros sin sanitizar
 * @returns Filtros sanitizados
 *
 * @security
 * Sanitiza todos los valores string para prevenir inyecciones
 */
const sanitizarFiltros = (filtros: IReporteFiltros): IReporteFiltros => {
  const filtrosSanitizados: IReporteFiltros = {};

  for (const [key, value] of Object.entries(filtros)) {
    if (typeof value === 'string') {
      filtrosSanitizados[key] = sanitizeInput(value);
    } else if (value instanceof Date) {
      filtrosSanitizados[key] = value.toISOString();
    } else {
      filtrosSanitizados[key] = value;
    }
  }

  return filtrosSanitizados;
};

/**
 * Genera un nombre de archivo para el PDF
 *
 * @param nombreReporte - Nombre base del reporte
 * @param filtros - Filtros aplicados al reporte
 * @returns Nombre de archivo con fecha y extensión .pdf
 *
 * @example
 * ```typescript
 * generarNombreArchivo('Justicia Cívica', { periodo: 'mes' })
 * // => 'reporte-justicia-civica-2025-11-04.pdf'
 * ```
 */
const generarNombreArchivo = (
  nombreReporte: string,
  filtros?: IReporteFiltros
): string => {
  // Normalizar nombre: lowercase, sin espacios, sin acentos
  const nombreNormalizado = nombreReporte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Fecha actual en formato YYYY-MM-DD
  const fecha = new Date().toISOString().split('T')[0];

  // Si hay filtros de periodo, agregarlo al nombre
  let sufijo = '';
  if (filtros?.periodo) {
    sufijo = `-${filtros.periodo}`;
  }

  return `reporte-${nombreNormalizado}${sufijo}-${fecha}.pdf`;
};

/**
 * Valida si los filtros son válidos para generar el reporte
 *
 * @param filtros - Filtros a validar
 * @returns true si los filtros son válidos, false en caso contrario
 *
 * @example
 * ```typescript
 * const filtrosValidos = validarFiltros({
 *   fechaInicio: '2025-01-01',
 *   fechaFin: '2025-01-31'
 * });
 * ```
 */
export const validarFiltros = (filtros: IReporteFiltros): boolean => {
  // Validar que fechaInicio sea anterior a fechaFin
  if (filtros.fechaInicio && filtros.fechaFin) {
    const inicio = new Date(filtros.fechaInicio);
    const fin = new Date(filtros.fechaFin);

    if (inicio > fin) {
      logError(
        'ReportesPdfService',
        new Error('Fecha de inicio posterior a fecha de fin'),
        `Validación de filtros - fechaInicio: ${filtros.fechaInicio}, fechaFin: ${filtros.fechaFin}`
      );
      return false;
    }
  }

  // Validar que el periodo sea válido
  if (filtros.periodo) {
    const periodosValidos = ['dia', 'semana', 'mes', 'anio', 'personalizado'];
    if (!periodosValidos.includes(filtros.periodo)) {
      logError(
        'ReportesPdfService',
        new Error('Periodo inválido'),
        `Validación de periodo - valor recibido: ${filtros.periodo}`
      );
      return false;
    }
  }

  return true;
};

/**
 * Previsualiza un reporte PDF en una nueva ventana (sin descargarlo)
 *
 * @param blob - Blob del PDF a previsualizar
 *
 * @description
 * Abre el PDF en una nueva pestaña del navegador para vista previa
 *
 * @example
 * ```typescript
 * previsualizarPdf(pdfBlob);
 * ```
 */
export const previsualizarPdf = (blob: Blob): void => {
  try {
    logInfo('ReportesPdfService', 'Previsualizando PDF');

    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');

    // Nota: No revocamos el URL inmediatamente porque la nueva ventana lo necesita
    // El navegador lo limpiará automáticamente cuando cierre la pestaña
  } catch (error) {
    logError(
      'ReportesPdfService',
      error as Error,
      'Error al previsualizar PDF'
    );
    throw error;
  }
};
