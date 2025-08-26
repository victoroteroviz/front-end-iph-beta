/**
 * Componente EstadisticasUsuario refactorizado
 * 
 * Características implementadas:
 * - TypeScript completo con interfaces tipadas
 * - Hook personalizado para lógica de negocio
 * - Componentes atómicos separados
 * - Estados de carga y error
 * - Servicios refactorizados integrados
 * - Logging completo de eventos
 * - Accesibilidad mejorada
 * - Diseño responsivo
 */

import React from 'react';
import { RefreshCw, Users, TrendingUp, AlertCircle } from 'lucide-react';

// Hook personalizado
import useEstadisticasUsuario from './hooks/useEstadisticasUsuario';

// Componentes atómicos
import UsuarioCard from './cards/UsuarioCard';
import EstadisticasFilters from './components/EstadisticasFilters';
import Pagination from './components/Pagination';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { 
  EstadisticasUsuarioProps,
  Usuario 
} from '../../../../interfaces/components/estadisticasUsuario.interface';

/**
 * Componente principal de EstadisticasUsuario
 * 
 * @param props - Props del componente
 * @returns JSX.Element del componente completo
 */
const EstadisticasUsuario: React.FC<EstadisticasUsuarioProps> = ({
  className = '',
  initialMes,
  initialAnio,
  itemsPerPage = 10
}) => {
  // Hook personalizado con toda la lógica
  const {
    usuarios,
    loading,
    error,
    totalPages,
    currentPage,
    mes,
    anio,
    hasData,
    setMes,
    setAnio,
    setCurrentPage,
    refetchData,
    clearError,
    canGoToNextPage,
    canGoToPreviousPage,
    goToNextPage,
    goToPreviousPage
  } = useEstadisticasUsuario({
    initialMes,
    initialAnio,
    itemsPerPage
  });

  /**
   * Maneja el click en una tarjeta de usuario
   */
  const handleUsuarioClick = (usuario: Usuario) => {
    logInfo('EstadisticasUsuario', 'Usuario seleccionado', {
      usuarioId: usuario.nombre_completo,
      totalIphs: usuario.total_iphs
    });

    // TODO: Implementar navegación al perfil del usuario
    console.log('Navegar a perfil de usuario:', usuario);
  };

  /**
   * Maneja la recarga manual de datos
   */
  const handleRefresh = async () => {
    logInfo('EstadisticasUsuario', 'Recarga manual solicitada por usuario');
    await refetchData();
  };

  return (
    <div className={`p-6 bg-[#f8f0e7] min-h-screen text-[#4d4725] ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#4d4725] flex items-center gap-2">
            <Users size={28} aria-hidden="true" />
            Estadísticas por Usuario
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza el rendimiento de usuarios por período
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="
            flex items-center gap-2 px-4 py-2
            bg-[#4d4725] text-white rounded-lg
            hover:bg-[#3a3519] transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
          "
          aria-label="Actualizar datos"
        >
          <RefreshCw 
            size={16} 
            className={loading ? 'animate-spin' : ''} 
            aria-hidden="true" 
          />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Filtros */}
      <EstadisticasFilters
        mes={mes}
        anio={anio}
        onMesChange={setMes}
        onAnioChange={setAnio}
        loading={loading}
        className="mb-6"
      />

      {/* Estado de error */}
      {error && (
        <div className="
          bg-red-50 border border-red-200 rounded-lg p-4 mb-6
          flex items-start gap-3
        ">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error cargando datos</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={clearError}
              className="
                mt-2 text-sm text-red-600 hover:text-red-800
                underline transition-colors
              "
            >
              Ocultar error
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && !hasData ? (
        // Estado sin datos
        <div className="
          bg-white rounded-lg shadow-sm border border-gray-200 p-8
          text-center
        ">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron datos
          </h3>
          <p className="text-gray-600 mb-4">
            No hay estadísticas disponibles para el período seleccionado.
          </p>
          <button
            onClick={handleRefresh}
            className="
              px-4 py-2 bg-[#4d4725] text-white rounded-lg
              hover:bg-[#3a3519] transition-colors
            "
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <>
          {/* Grid de usuarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {usuarios.map((usuario) => (
              <UsuarioCard
                key={`${usuario.nombre_completo}-${usuario.total_iphs}`}
                usuario={usuario}
                onClick={handleUsuarioClick}
                className="transition-opacity duration-200"
                style={{
                  opacity: loading ? 0.6 : 1
                }}
              />
            ))}
          </div>

          {/* Loading overlay para grid */}
          {loading && usuarios.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4d4725]"></div>
                  <span className="text-[#4d4725]">Cargando nuevos datos...</span>
                </div>
              </div>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              canGoToNext={canGoToNextPage}
              canGoToPrevious={canGoToPreviousPage}
              onPageChange={setCurrentPage}
              onNext={goToNextPage}
              onPrevious={goToPreviousPage}
              loading={loading}
            />
          )}

          {/* Estadísticas adicionales */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-[#4d4725] mb-2">
              Resumen del período
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de usuarios:</span>
                <span className="ml-2 font-semibold text-[#4d4725]">
                  {usuarios.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total IPHs:</span>
                <span className="ml-2 font-semibold text-[#4d4725]">
                  {usuarios.reduce((sum, u) => sum + u.total_iphs, 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Promedio por usuario:</span>
                <span className="ml-2 font-semibold text-[#4d4725]">
                  {usuarios.length > 0 
                    ? Math.round(usuarios.reduce((sum, u) => sum + u.total_iphs, 0) / usuarios.length * 10) / 10
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EstadisticasUsuario;