/**
 * Componente HistorialIPH SUPER OPTIMIZADO
 *
 * Características implementadas:
 * - TypeScript completo con interfaces tipadas
 * - Hook personalizado para lógica de negocio
 * - Componentes atómicos separados y memoizados
 * - Estados de carga y error optimizados
 * - Servicios integrados con backend
 * - Sistema de roles (Admin/SuperAdmin only)
 * - Vista detalle dummy para futuro desarrollo
 * - Logging completo de eventos
 * - Accesibilidad mejorada
 * - Diseño responsivo
 * - Filtros avanzados optimizados
 * - Paginación completa optimizada
 * - React.memo y callbacks optimizados
 * - Prevención de re-renders innecesarios
 */

import React, { useEffect, useCallback, useMemo } from 'react';
import { FileText, RefreshCw, Shield } from 'lucide-react';

// Hook personalizado
import useHistorialIPH from './hooks/useHistorialIPH';

// Componentes atómicos
import FiltrosHistorial from './components/FiltrosHistorial';
import HistorialTable from './table/HistorialTable';
import PaginacionHistorial from './components/PaginacionHistorial';
import DetalleIPH from './components/DetalleIPH';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { HistorialIPHProps } from '../../../../interfaces/components/historialIph.interface';

/**
 * Componente principal de HistorialIPH - SUPER OPTIMIZADO
 *
 * @param props - Props del componente
 * @returns JSX.Element del componente completo
 */
const HistorialIPH: React.FC<HistorialIPHProps> = React.memo(({
  className = '',
  initialFilters,
  itemsPerPage = 10
}) => {
  // Hook personalizado con toda la lógica
  const {
    registros,
    // estadisticas, // No se usa más, el componente EstadisticasCards está en InformePolicial
    loading,
    error,
    filtros,
    paginacion,
    registroSeleccionado,
    estatusOptions,
    setFiltros,
    clearAllFilters,
    setCurrentPage,
    refetchData,
    verDetalle,
    cerrarDetalle,
    editarEstatus,
    canGoToNextPage,
    canGoToPreviousPage,
    goToNextPage,
    goToPreviousPage,
    hasData
  } = useHistorialIPH({
    initialFilters,
    itemsPerPage
  });

  // Optimizar handleRefresh con useCallback
  const handleRefresh = useCallback(async () => {
    logInfo('HistorialIPH', 'Recarga manual solicitada por usuario');
    await refetchData();
  }, [refetchData]);

  // Optimizar handler de editar estatus para modal
  const handleEditarEstatusModal = useCallback((nuevoEstatus: string) => {
    if (registroSeleccionado) {
      editarEstatus(registroSeleccionado.id, nuevoEstatus);
    }
  }, [registroSeleccionado, editarEstatus]);

  // Memoizar valores booleanos para optimizar renders
  const showPermissionError = useMemo(() =>
    error && error.includes('permisos'), [error]
  );

  const showEmptyState = useMemo(() =>
    !loading && !error && !hasData, [loading, error, hasData]
  );

  const showMainContent = useMemo(() =>
    !showEmptyState, [showEmptyState]
  );

  const hasFiltersApplied = useMemo(() =>
    Object.values(filtros).some(f => f), [filtros]
  );

  const showPagination = useMemo(() =>
    paginacion.totalPages > 1, [paginacion.totalPages]
  );

  // Efecto para logging inicial - optimizado
  useEffect(() => {
    logInfo('HistorialIPH', 'Componente montado', {
      initialFilters,
      itemsPerPage
    });

    return () => {
      logInfo('HistorialIPH', 'Componente desmontado');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta una vez al montar

  // Breadcrumbs items
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Historial de IPH', isActive: true }
  ];

  // Componente de error de permisos memoizado
  const PermissionErrorComponent = useMemo(() => {
    if (!showPermissionError) return null;

    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <Shield size={64} className="mx-auto text-red-400 mb-6" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Acceso Restringido
          </h2>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder al historial de IPHs.
            Esta funcionalidad está disponible únicamente para usuarios con rol de
            Administrador o SuperAdmin.
          </p>
          <div className="text-sm text-gray-500">
            Si crees que esto es un error, contacta al administrador del sistema.
          </div>
        </div>
      </div>
    );
  }, [showPermissionError]);

  // Early return optimizado
  if (showPermissionError) {
    return PermissionErrorComponent;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="historial-iph">
      <div className={`max-w-7xl mx-auto ${className}`}>

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#948b54] rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                  Historial de IPH
                </h1>
                <p className="text-gray-600 font-poppins">
                  Gestión y seguimiento de Informes Policiales Homologados
                </p>
              </div>
            </div>
            {/* Botón de actualización */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-[#4d4725] rounded-lg
                hover:bg-[#3a3519] disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 font-poppins
              "
              aria-label="Actualizar datos del historial"
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                {loading ? 'Actualizando...' : 'Actualizar'}
              </span>
            </button>
          </div>
        </div>

        {/* Búsqueda y Lista */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header de filtros */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#4d4725] font-poppins">
                Filtros de Búsqueda
              </h2>
            </div>
            <FiltrosHistorial
              filtros={filtros}
              onFiltrosChange={setFiltros}
              loading={loading}
              estatusOptions={estatusOptions}
            />
          </div>

          {/* Contenido de la lista */}
          <div className="p-6">
            {showEmptyState ? (
              // Estado sin datos - MEMOIZADO
              <div className="text-center py-12">
                <FileText size={64} className="mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-medium text-gray-900 mb-3 font-poppins">
                  No se encontraron registros
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto font-poppins">
                  No hay registros de IPH que coincidan con los filtros aplicados.
                  Intenta ajustar los criterios de búsqueda o verificar el rango de fechas.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-2 bg-[#4d4725] text-white rounded-lg hover:bg-[#3a3519] transition-colors flex items-center gap-2 cursor-pointer font-poppins"
                  >
                    <RefreshCw size={16} />
                    Intentar nuevamente
                  </button>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-poppins"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            ) : showMainContent ? (
              <>
                {/* Tabla de registros */}
                <HistorialTable
                  registros={registros}
                  loading={loading}
                  onVerDetalle={verDetalle}
                  onEditarEstatus={editarEstatus}
                  className="relative"
                />
              </>
            ) : null}
          </div>

          {/* Paginación - OPTIMIZADA */}
          {showPagination && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4">
              <PaginacionHistorial
                currentPage={paginacion.page}
                totalPages={paginacion.totalPages}
                canGoToNext={canGoToNextPage}
                canGoToPrevious={canGoToPreviousPage}
                onPageChange={setCurrentPage}
                onNext={goToNextPage}
                onPrevious={goToPreviousPage}
                loading={loading}
              />
            </div>
          )}

          {/* Información adicional - OPTIMIZADA */}
          {showMainContent && (
            <div className="px-6 pb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600 font-poppins">
                  <div className="flex items-center gap-4">
                    <span>
                      Mostrando <strong>{registros.length}</strong> de{' '}
                      <strong>{paginacion.total}</strong> registros
                    </span>
                    {hasFiltersApplied && (
                      <span className="text-[#4d4725]">
                        (con filtros aplicados)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de detalle - OPTIMIZADO */}
        {registroSeleccionado && (
          <DetalleIPH
            registro={registroSeleccionado}
            onClose={cerrarDetalle}
            onEditarEstatus={handleEditarEstatusModal}
          />
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para React.memo
  return (
    prevProps.className === nextProps.className &&
    prevProps.itemsPerPage === nextProps.itemsPerPage &&
    JSON.stringify(prevProps.initialFilters) === JSON.stringify(nextProps.initialFilters)
  );
});

// Nombre para debugging
HistorialIPH.displayName = 'HistorialIPH';

export default HistorialIPH;