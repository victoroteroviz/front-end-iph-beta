/**
 * Componente HistorialIPH refactorizado
 * 
 * Características implementadas:
 * - TypeScript completo con interfaces tipadas
 * - Hook personalizado para lógica de negocio
 * - Componentes atómicos separados
 * - Estados de carga y error
 * - Servicios integrados con backend
 * - Sistema de roles (Admin/SuperAdmin only)
 * - Vista detalle dummy para futuro desarrollo
 * - Logging completo de eventos
 * - Accesibilidad mejorada
 * - Diseño responsivo
 * - Filtros avanzados
 * - Paginación completa
 */

import React, { useEffect } from 'react';
import { FileText, AlertCircle, Users, RefreshCw, Shield } from 'lucide-react';

// Hook personalizado
import useHistorialIPH from './hooks/useHistorialIPH';

// Componentes atómicos
import EstadisticasCards from './cards/EstadisticasCards';
import FiltrosHistorial from './components/FiltrosHistorial';
import HistorialTable from './table/HistorialTable';
import PaginacionHistorial from './components/PaginacionHistorial';
import DetalleIPH from './components/DetalleIPH';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { HistorialIPHProps } from '../../../../interfaces/components/historialIph.interface';

/**
 * Componente principal de HistorialIPH
 * 
 * @param props - Props del componente
 * @returns JSX.Element del componente completo
 */
const HistorialIPH: React.FC<HistorialIPHProps> = ({
  className = '',
  initialFilters,
  itemsPerPage = 10
}) => {
  // Hook personalizado con toda la lógica
  const {
    registros,
    estadisticas,
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
    clearError,
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

  // Efecto para logging inicial
  useEffect(() => {
    logInfo('HistorialIPH', 'Componente montado', {
      initialFilters,
      itemsPerPage
    });
    
    return () => {
      logInfo('HistorialIPH', 'Componente desmontado');
    };
  }, [initialFilters, itemsPerPage]);

  /**
   * Maneja la recarga manual de datos
   */
  const handleRefresh = async () => {
    logInfo('HistorialIPH', 'Recarga manual solicitada por usuario');
    await refetchData();
  };

  /**
   * Verifica acceso del usuario (ya manejado en el hook)
   */
  if (error && error.includes('permisos')) {
    return (
      <div className={`p-6 bg-[#f8f0e7] min-h-screen ${className}`}>
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
  }

  return (
    <div className={`p-6 bg-[#f8f0e7] min-h-screen text-[#4d4725] ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#4d4725] flex items-center gap-3">
            <FileText size={32} aria-hidden="true" />
            Historial de IPH
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión y seguimiento de Informes Policiales Homologados
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Users size={14} />
            <span>Solo para Administradores y SuperAdmin</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botón de actualización */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="
              flex items-center gap-2 px-4 py-2
              bg-[#4d4725] text-white rounded-lg
              hover:bg-[#3a3519] transition-colors duration-200
              cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
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

      {/* Tarjetas de estadísticas */}
      <EstadisticasCards
        estadisticas={estadisticas}
        loading={loading}
        className="mb-6"
      />

      {/* Filtros */}
      <FiltrosHistorial
        filtros={filtros}
        onFiltrosChange={setFiltros}
        loading={loading}
        estatusOptions={estatusOptions}
        className="mb-6"
      />

      {/* Estado de error */}
      {error && !error.includes('permisos') && (
        <div className="
          bg-red-50 border border-red-200 rounded-lg p-4 mb-6
          flex items-start gap-3
        ">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error cargando datos</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={clearError}
                className="
                  text-sm text-red-600 hover:text-red-800
                  underline transition-colors cursor-pointer
                "
              >
                Ocultar error
              </button>
              <button
                onClick={handleRefresh}
                className="
                  text-sm text-red-600 hover:text-red-800
                  underline transition-colors cursor-pointer
                "
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && !hasData ? (
        // Estado sin datos
        <div className="
          bg-white rounded-lg shadow-sm border border-gray-200 p-12
          text-center
        ">
          <FileText size={64} className="mx-auto text-gray-300 mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            No se encontraron registros
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            No hay registros de IPH que coincidan con los filtros aplicados. 
            Intenta ajustar los criterios de búsqueda o verificar el rango de fechas.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="
                px-6 py-2 bg-[#4d4725] text-white rounded-lg
                hover:bg-[#3a3519] transition-colors
                flex items-center gap-2 cursor-pointer
              "
            >
              <RefreshCw size={16} />
              Intentar nuevamente
            </button>
            <button
              onClick={clearAllFilters}
              className="
                px-6 py-2 border border-gray-300 text-gray-700 rounded-lg
                hover:bg-gray-50 transition-colors cursor-pointer
              "
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabla de registros */}
          <HistorialTable
            registros={registros}
            loading={loading}
            onVerDetalle={verDetalle}
            onEditarEstatus={editarEstatus}
            className="relative"
          />

          {/* Paginación */}
          {paginacion.totalPages > 1 && (
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
          )}

          {/* Información adicional */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>
                  Mostrando <strong>{registros.length}</strong> de{' '}
                  <strong>{paginacion.total}</strong> registros
                </span>
                {Object.values(filtros).some(f => f) && (
                  <span className="text-[#4d4725]">
                    (con filtros aplicados)
                  </span>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {registroSeleccionado && (
        <DetalleIPH
          registro={registroSeleccionado}
          onClose={cerrarDetalle}
          onEditarEstatus={(nuevoEstatus) => editarEstatus(registroSeleccionado.id, nuevoEstatus)}
        />
      )}
    </div>
  );
};

export default HistorialIPH;