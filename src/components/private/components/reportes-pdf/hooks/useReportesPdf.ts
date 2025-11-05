/**
 * Hook personalizado para manejo de reportes PDF
 *
 * @description
 * Encapsula toda la lógica de negocio para generar, descargar y gestionar reportes PDF.
 * Maneja estados de carga, errores y notificaciones.
 *
 * @pattern Custom Hook + State Management
 * @version 1.0.0
 * @since 2025-11-04
 *
 * @author Senior Full-Stack Developer
 */

import { useState, useCallback, useMemo } from 'react';
import type { IReporteCard, IReporteFiltros, IReporteEstado } from '../../../../../interfaces/IReporte';
import { generarReportePdf, descargarPdf, previsualizarPdf, validarFiltros } from '../services/reportes-pdf.service';
import { showSuccess, showError, showInfo } from '../../../../../helper/notification/notification.helper';
import { logInfo, logWarning } from '../../../../../helper/log/logger.helper';
import { getUserRoles } from '../../../../../helper/role/role.helper';
import { canAccessSuperior } from '../../../../../config/permissions.config';

/**
 * Hook useReportesPdf
 *
 * @returns Objeto con estado y funciones para manejar reportes PDF
 *
 * @example
 * ```typescript
 * const {
 *   estado,
 *   hasAccess,
 *   generarReporte,
 *   cancelarGeneracion
 * } = useReportesPdf();
 *
 * // Generar reporte
 * await generarReporte(reporteCard, filtros);
 * ```
 */
const useReportesPdf = () => {
  // =====================================================
  // #region 🔐 VALIDACIÓN DE ACCESO
  // =====================================================
  /**
   * Validación de acceso a reportes
   *
   * @description
   * Solo SuperAdmin, Admin y Superior pueden generar reportes
   * Usa helper centralizado con cache 5s + Zod
   */
  const hasAccess = useMemo(() => canAccessSuperior(getUserRoles()), []);
  // #endregion

  // =====================================================
  // #region 📊 ESTADO DEL HOOK
  // =====================================================
  /**
   * Estado de generación del reporte
   */
  const [estado, setEstado] = useState<IReporteEstado>({
    generando: false,
    progreso: 0,
    mensaje: '',
    error: null,
    reporteId: null
  });
  // #endregion

  // =====================================================
  // #region 🔧 FUNCIONES PRINCIPALES
  // =====================================================

  /**
   * Genera un reporte PDF
   *
   * @param reporte - Configuración del reporte a generar
   * @param filtros - Filtros opcionales para el reporte
   * @param descargar - Si debe descargarse automáticamente (default: true)
   * @returns Promise<boolean> - true si se generó exitosamente
   *
   * @throws No lanza errores, los maneja internamente
   */
  const generarReporte = useCallback(
    async (
      reporte: IReporteCard,
      filtros?: IReporteFiltros,
      descargar: boolean = true
    ): Promise<boolean> => {
      // Validar acceso
      if (!hasAccess) {
        showError('No tienes permisos para generar reportes');
        logWarning('useReportesPdf', 'Intento de generar reporte sin permisos', {
          reporteId: reporte.id
        });
        return false;
      }

      // Validar que el reporte esté habilitado
      if (!reporte.habilitado) {
        showInfo('Este reporte no está disponible actualmente');
        logInfo('useReportesPdf', 'Intento de generar reporte deshabilitado', {
          reporteId: reporte.id,
          titulo: reporte.titulo
        });
        return false;
      }

      // Validar filtros si el reporte los requiere
      if (reporte.requiereFiltros && filtros && !validarFiltros(filtros)) {
        showError('Los filtros proporcionados no son válidos');
        return false;
      }

      // Iniciar generación
      setEstado({
        generando: true,
        progreso: 0,
        mensaje: `Generando ${reporte.titulo}...`,
        error: null,
        reporteId: reporte.id
      });

      logInfo('useReportesPdf', 'Iniciando generación de reporte', {
        reporteId: reporte.id,
        titulo: reporte.titulo,
        endpoint: reporte.endpoint
      });

      try {
        // Simular progreso inicial
        setEstado(prev => ({ ...prev, progreso: 25, mensaje: 'Procesando datos...' }));

        // Generar reporte
        const response = await generarReportePdf(
          reporte.endpoint,
          filtros,
          reporte.titulo
        );

        if (!response.success || !response.blob) {
          throw new Error(response.message || 'Error al generar el reporte');
        }

        // Progreso a 75%
        setEstado(prev => ({ ...prev, progreso: 75, mensaje: 'Reporte generado...' }));

        // Descargar o previsualizar
        if (descargar && response.blob && response.filename) {
          descargarPdf(response.blob, response.filename);
          showSuccess(`Reporte "${reporte.titulo}" descargado exitosamente`);
        } else if (response.blob) {
          previsualizarPdf(response.blob);
          showSuccess(`Reporte "${reporte.titulo}" generado exitosamente`);
        }

        // Completar
        setEstado({
          generando: false,
          progreso: 100,
          mensaje: 'Reporte generado exitosamente',
          error: null,
          reporteId: null
        });

        logInfo('useReportesPdf', 'Reporte generado exitosamente', {
          reporteId: reporte.id,
          titulo: reporte.titulo
        });

        return true;

      } catch (error) {
        const errorMessage = (error as Error).message || 'Error desconocido al generar el reporte';

        setEstado({
          generando: false,
          progreso: 0,
          mensaje: '',
          error: errorMessage,
          reporteId: null
        });

        showError(`Error al generar el reporte: ${errorMessage}`);

        logWarning('useReportesPdf', 'Error al generar reporte', {
          reporteId: reporte.id,
          titulo: reporte.titulo,
          error: errorMessage
        });

        return false;
      }
    },
    [hasAccess]
  );

  /**
   * Cancela la generación del reporte actual
   *
   * @description
   * Resetea el estado de generación. Nota: No puede cancelar peticiones HTTP en curso.
   */
  const cancelarGeneracion = useCallback(() => {
    setEstado({
      generando: false,
      progreso: 0,
      mensaje: '',
      error: null,
      reporteId: null
    });

    showInfo('Generación de reporte cancelada');

    logInfo('useReportesPdf', 'Generación de reporte cancelada por el usuario');
  }, []);

  /**
   * Resetea el estado de errores
   */
  const resetearError = useCallback(() => {
    setEstado(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Genera reporte con preview (no descarga, abre en nueva ventana)
   *
   * @param reporte - Configuración del reporte
   * @param filtros - Filtros opcionales
   * @returns Promise<boolean>
   */
  const previsualizarReporte = useCallback(
    async (reporte: IReporteCard, filtros?: IReporteFiltros): Promise<boolean> => {
      return generarReporte(reporte, filtros, false);
    },
    [generarReporte]
  );

  // #endregion

  // =====================================================
  // #region 📤 RETURN DEL HOOK
  // =====================================================
  return {
    /** Estado actual de generación del reporte */
    estado,

    /** Indica si el usuario tiene acceso a generar reportes */
    hasAccess,

    /** Función para generar y descargar un reporte */
    generarReporte,

    /** Función para previsualizar un reporte sin descargarlo */
    previsualizarReporte,

    /** Función para cancelar la generación actual */
    cancelarGeneracion,

    /** Función para resetear errores */
    resetearError,

    /** Indica si hay una generación en progreso */
    generando: estado.generando,

    /** Porcentaje de progreso (0-100) */
    progreso: estado.progreso || 0,

    /** Mensaje de estado actual */
    mensaje: estado.mensaje || '',

    /** Error actual si existe */
    error: estado.error,

    /** ID del reporte siendo generado */
    reporteActual: estado.reporteId,
  };
  // #endregion
};

export default useReportesPdf;
