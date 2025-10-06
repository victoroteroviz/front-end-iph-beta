/**
 * @fileoverview Componente principal de Ajustes del sistema IPH
 * @version 1.0.0
 * @description Sistema de configuración y administración del sistema IPH
 */

import React, { useEffect } from 'react';
import { useAjustes } from './hooks/useAjustes';
import { HeaderAjustes } from './components/HeaderAjustes';
import { FiltroAjustes } from './components/FiltroAjustes';
import { GridSecciones } from './components/GridSecciones';

/**
 * @component Ajustes
 * @description Componente principal para la gestión de ajustes del sistema
 *
 * Características principales:
 * - Lista de secciones de configuración según roles del usuario
 * - Búsqueda y filtrado de secciones
 * - Estadísticas del sistema de ajustes
 * - Control de acceso granular por roles
 * - Navegación a subsecciones específicas
 *
 * @returns {JSX.Element} Componente de ajustes del sistema
 *
 * @example
 * ```tsx
 * // Uso básico en las rutas
 * <Route path="/ajustes" element={<Ajustes />} />
 * ```
 */
const Ajustes: React.FC = () => {
  // Hook personalizado con toda la lógica de negocio
  const {
    // Datos principales
    configuracion,
    seccionesFiltradas,
    estadisticas,

    // Estados de carga
    loading,
    loadingSeccion,
    error,

    // Estado de filtros
    filtroSeccion,

    // Acciones
    navegarASeccion,
    recargarDatos,
    filtrarSecciones,
    limpiarFiltros,
    verificarAccesoSeccion,

    // Permisos
    tienePermisoAdmin,
    tienePermisoSuperAdmin
  } = useAjustes();

  /**
   * @function handleSeccionClick
   * @description Maneja el clic en una sección de ajustes
   * @param {string} seccionId - ID de la sección clickeada
   */
  const handleSeccionClick = async (seccionId: string): Promise<void> => {
    await navegarASeccion(seccionId);
  };

  /**
   * @function handleRecargar
   * @description Maneja la recarga de datos
   */
  const handleRecargar = async (): Promise<void> => {
    await recargarDatos();
  };

  /**
   * @function verificarAcceso
   * @description Verifica si el usuario tiene acceso a una sección específica
   * @param {string} seccionId - ID de la sección
   * @returns {boolean} true si tiene acceso
   */
  const verificarAcceso = (seccionId: string): boolean => {
    // Esta función se ejecuta de forma síncrona para el grid
    // La verificación asíncrona se hace en el hook
    const seccion = seccionesFiltradas.find(s => s.id === seccionId);
    if (!seccion) return false;

    // Verificación básica basada en permisos del usuario
    if (seccion.nivelAcceso.includes('SuperAdmin') && !tienePermisoSuperAdmin) {
      if (!tienePermisoAdmin && !seccion.nivelAcceso.includes('Administrador')) {
        return false;
      }
    }

    return seccion.habilitado;
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar ajustes
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRecargar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header principal con estadísticas rápidas */}
        <HeaderAjustes
          configuracion={configuracion?.configuracion || null}
          estadisticas={estadisticas}
          onRecargar={handleRecargar}
          loading={loading}
          hasActiveFilters={!!filtroSeccion}
          onLimpiarFiltros={limpiarFiltros}
        />

        {/* Barra de búsqueda y filtros */}
        <div className="mb-6">
          <FiltroAjustes
            filtro={filtroSeccion}
            onFiltroChange={filtrarSecciones}
            onLimpiarFiltros={limpiarFiltros}
            totalResultados={seccionesFiltradas.length}
            totalSecciones={configuracion?.secciones.length}
            placeholder="Buscar sección de ajustes..."
          />
        </div>

        {/* Grid principal de secciones */}
        <div className="w-full">
          <GridSecciones
            secciones={seccionesFiltradas}
            onSeccionClick={handleSeccionClick}
            loadingSeccionId={loadingSeccion}
            verificarAcceso={verificarAcceso}
            loading={loading}
            skeletonCount={6}
          />
        </div>

        {/* Footer informativo */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Sistema de Configuración IPH v3.0.0 ·
            {tienePermisoSuperAdmin && ' SuperAdmin'}
            {tienePermisoAdmin && !tienePermisoSuperAdmin && ' Administrador'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Ajustes;