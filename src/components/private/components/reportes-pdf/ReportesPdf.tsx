/**
 * Componente principal de Generación de Reportes PDF
 *
 * @component
 * @pattern Atomic Design + Custom Hook
 * @version 1.0.0
 * @since 2025-11-04
 *
 * @description
 * Panel principal para generar y descargar reportes en formato PDF.
 * Muestra un grid de tarjetas interactivas con diferentes tipos de reportes disponibles.
 *
 * @uses useReportesPdf - Hook personalizado para lógica de generación de PDFs
 *
 * @security
 * - Primera línea: PrivateRoute valida en guard de ruta
 * - Segunda línea: Validación defensiva interna con helper
 * - Validación Zod automática + cache 5s
 *
 * @roles
 * - SuperAdmin: Acceso completo
 * - Administrador: Acceso completo
 * - Superior: Acceso completo
 * - Elemento: SIN ACCESO
 *
 * @structure
 * - ReportesHeader: Header con título y métricas
 * - ReportesGrid: Grid de tarjetas de reportes
 * - ReporteCard: Tarjeta individual (atómico)
 *
 * @author Senior Full-Stack Developer
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { IReporteCard } from '../../../../interfaces/IReporte';
import { reportesCardsConfig } from './config/reportesConfig';
import { REPORTES_ENDPOINTS } from './config/constants';
import { ReportesHeader, ReportesGrid } from './components/layout';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';
import AccessDenied from '../../../shared/components/access-denied';
import useReportesPdf from './hooks/useReportesPdf';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/ReportesPdf.css';
import ReporteDiarioForm from './components/form/ReporteDiarioForm';
import { useSearchParams } from 'react-router-dom';

/**
 * ReportesPdf Component
 *
 * @returns {JSX.Element} Componente de reportes PDF renderizado
 *
 * @example
 * ```tsx
 * <Route path="/reportes-pdf" element={<ReportesPdf />} />
 * ```
 */
const ReportesPdf: React.FC = () => {
  // =====================================================
  // #region 🔐 HOOK DE REPORTES PDF
  // =====================================================
  /**
   * Hook personalizado que maneja toda la lógica de reportes
   *
   * @description
   * - Validación de acceso por roles
   * - Generación de reportes PDF
   * - Gestión de estados (loading, error, success)
   * - Descarga automática de archivos
   */
  const {
    hasAccess,
    estado,
    generarReporte,
    generando,
    reporteActual
  } = useReportesPdf();
  // #endregion

  // =====================================================
  // #region 📊 ESTADO LOCAL
  // =====================================================
  /**
   * Configuración de las tarjetas de reportes
   * Importada desde config/reportesConfig.tsx
   */
  const [reportes] = useState<IReporteCard[]>(reportesCardsConfig);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<IReporteCard | null>(null);
  const reporteSeleccionadoRef = useRef<IReporteCard | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    reporteSeleccionadoRef.current = reporteSeleccionado;
  }, [reporteSeleccionado]);

  useEffect(() => {
    const reporteIdParam = searchParams.get('reporteId');
    if (!reporteIdParam) {
      return;
    }

    const reporteConfig = reportes.find(reporte => reporte.id === reporteIdParam);
    const admiteFormulario = reporteConfig?.endpoint === REPORTES_ENDPOINTS.DIARIO || reporteConfig?.parametros?.requiereFormulario;

    if (!reporteConfig || !admiteFormulario) {
      setSearchParams(prevParams => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.delete('reporteId');
        return nextParams;
      }, { replace: true });
      return;
    }

    if (!reporteSeleccionadoRef.current || reporteSeleccionadoRef.current.id !== reporteConfig.id) {
      setReporteSeleccionado(reporteConfig);
    }
  }, [reportes, searchParams, setSearchParams]);
  // #endregion

  // =====================================================
  // #region 🎯 HANDLERS
  // =====================================================
  /**
   * Maneja el click en una tarjeta de reporte
   * Genera y descarga el PDF correspondiente
   *
   * @param reporte - Configuración del reporte seleccionado
   */
  const handleCardClick = useCallback(async (reporte: IReporteCard) => {
    if (!reporte.habilitado) {
      logDebug('ReportesPdf', 'Tarjeta deshabilitada', { reporteId: reporte.id });
      return;
    }

    if (reporte.endpoint === REPORTES_ENDPOINTS.DIARIO || reporte.parametros?.requiereFormulario) {
      logDebug('ReportesPdf', 'Abriendo formulario de reporte diario', {
        reporteId: reporte.id,
        endpoint: reporte.endpoint
      });
      setReporteSeleccionado(reporte);
      setSearchParams(prevParams => {
        const nextParams = new URLSearchParams(prevParams);
        nextParams.set('reporteId', reporte.id);
        return nextParams;
      }, { replace: true });
      return;
    }

    logDebug('ReportesPdf', 'Generando reporte PDF', {
      reporteId: reporte.id,
      reporteTitulo: reporte.titulo,
      endpoint: reporte.endpoint
    });

    const filtros = undefined;
    await generarReporte(reporte, filtros);
  }, [generarReporte, setSearchParams]);

  const handleCerrarFormulario = useCallback(() => {
    setReporteSeleccionado(null);
    setSearchParams(prevParams => {
      const nextParams = new URLSearchParams(prevParams);
      nextParams.delete('reporteId');
      return nextParams;
    }, { replace: true });
  }, [setSearchParams]);
  // #endregion

  // =====================================================
  // #region 📐 CÁLCULOS MEMOIZADOS
  // =====================================================
  /**
   * Breadcrumbs para navegación
   */
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [{ label: 'Generación de Reportes PDF', isActive: true }],
    []
  );

  /**
   * Calcular métricas rápidas
   * Memoizado para evitar recálculo innecesario
   */
  const { enabledCount, totalCount } = useMemo(() => ({
    enabledCount: reportes.filter(r => r.habilitado).length,
    totalCount: reportes.length
  }), [reportes]);
  // #endregion

  // =====================================================
  // #region 🚫 VALIDACIÓN DEFENSIVA - Return Early Pattern
  // =====================================================
  /**
   * Si no tiene acceso, mostrar pantalla de acceso denegado
   *
   * @pattern Return Early - Manejo de error antes de lógica principal
   */
  if (!hasAccess) {
    return (
      <AccessDenied
        title="Acceso Restringido"
        message="Esta sección está disponible solo para Administradores, SuperAdmins y Superiores."
        iconType="shield"
      />
    );
  }

  if (reporteSeleccionado && reporteSeleccionado.endpoint === REPORTES_ENDPOINTS.DIARIO) {
    return (
      <ReporteDiarioForm
        reporte={reporteSeleccionado}
        onClose={handleCerrarFormulario}
      />
    );
  }
  // #endregion

  // =====================================================
  // #region 🎨 RENDERIZADO PRINCIPAL
  // =====================================================
  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8 font-poppins"
      data-component="reportes-pdf"
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal - DISEÑO MEJORADO con gradientes */}
        <div className="relative bg-gradient-to-br from-white via-[#eef1ff] to-white rounded-xl border border-[#787dff]/30 p-6 mb-6 shadow-md overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4246b2]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#787dff]/5 rounded-full blur-3xl -z-10" />

          <div className="relative z-10">
            <ReportesHeader
              enabledCount={enabledCount}
              totalCount={totalCount}
            />
          </div>
        </div>

        {/* Indicador de generación activa */}
        {generando && (
          <div className="mb-6 bg-[#eef1ff] border-l-4 border-[#4246b2] p-4 rounded-r-lg animate-fadeIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 border-3 border-[#4246b2] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-[#1a2744] font-poppins">
                  {estado.mensaje || 'Generando reporte...'}
                </p>
                {estado.progreso !== undefined && estado.progreso > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-[#787dff]/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#4246b2] to-[#1a2744] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${estado.progreso}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#1a2744] font-poppins mt-1">{estado.progreso}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {estado.error && !generando && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg animate-fadeIn">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-red-700 font-poppins">
                  {estado.error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid de tarjetas de reportes */}
        <ReportesGrid
          reportes={reportes}
          onCardClick={handleCardClick}
          generando={generando}
          reporteGenerando={reporteActual}
        />

        {/* Nota informativa */}
        <div className="mt-8 bg-[#eef1ff] border border-[#787dff]/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-[#4246b2] to-[#1a2744] rounded-full flex items-center justify-center mt-0.5 shadow-sm">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1a2744] font-poppins mb-1">
                Información sobre Reportes PDF
              </h4>
              <p className="text-sm text-gray-600 font-poppins">
                Los reportes se generan directamente desde el backend con los datos más actualizados del sistema.
                El tiempo de generación puede variar según la cantidad de datos y filtros aplicados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // #endregion
};

export default ReportesPdf;
