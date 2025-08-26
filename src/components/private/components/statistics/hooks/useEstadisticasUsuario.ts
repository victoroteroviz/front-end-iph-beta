/**
 * Hook personalizado para el componente EstadisticasUsuario
 * Maneja toda la lógica de negocio y estado
 * 
 * Características:
 * - Integración con servicio refactorizado
 * - Estados de carga y error
 * - Paginación automática
 * - Filtros reactivos
 * - Error handling robusto
 * - Logging de eventos
 */

import { useState, useEffect, useCallback } from 'react';

// Servicios refactorizados
import { getIphCountByUsers } from '../../../../../services/statistics/iph/statistics.service';

// Helpers
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { showError } from '../../../../../helper/notification/notification.helper';

// Interfaces
import type { 
  UseEstadisticasUsuarioConfig,
  UseEstadisticasUsuarioReturn,
  EstadisticasUsuarioState
} from '../../../../../interfaces/components/estadisticasUsuario.interface';
import type { IUsuarioIphCount } from '../../../../../interfaces/statistics/statistics.interface';

/**
 * Hook personalizado para manejar estadísticas de usuario
 * 
 * @param config - Configuración inicial del hook
 * @returns Estado y funciones para el componente
 */
const useEstadisticasUsuario = (config: UseEstadisticasUsuarioConfig = {}): UseEstadisticasUsuarioReturn => {
  const {
    initialMes = new Date().getMonth() + 1, // Mes actual
    initialAnio = new Date().getFullYear(), // Año actual
    itemsPerPage = 10,
    autoLoad = true
  } = config;

  // Estado principal
  const [state, setState] = useState<EstadisticasUsuarioState>({
    usuarios: [],
    loading: autoLoad,
    error: null,
    totalPages: 1,
    currentPage: 1,
    mes: initialMes,
    anio: initialAnio,
    hasData: false
  });

  /**
   * Función para cargar datos de estadísticas
   */
  const loadData = useCallback(async (mes: number, anio: number, page: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      logInfo('useEstadisticasUsuario', 'Cargando estadísticas de usuarios', {
        mes,
        anio,
        page,
        limit: itemsPerPage
      });

      const response = await getIphCountByUsers(mes, anio, page, itemsPerPage);
      
      if (!response.data || response.data.length === 0) {
        setState(prev => ({
          ...prev,
          usuarios: [],
          totalPages: 1,
          loading: false,
          hasData: false
        }));

        logInfo('useEstadisticasUsuario', 'No se encontraron datos para los filtros especificados', {
          mes,
          anio,
          page
        });

        return;
      }

      // Calcular total de páginas basado en la respuesta
      const totalPages = response.total ? Math.ceil(response.total / itemsPerPage) : 
                         (response.page && response.limit) ? Math.ceil(response.total || response.data.length / response.limit) : 1;

      setState(prev => ({
        ...prev,
        usuarios: response.data,
        totalPages: Math.max(totalPages, 1),
        loading: false,
        hasData: true
      }));

      logInfo('useEstadisticasUsuario', 'Estadísticas cargadas exitosamente', {
        usuariosCount: response.data.length,
        totalPages: totalPages,
        currentPage: page
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error cargando estadísticas de usuarios';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        hasData: false
      }));

      logError('useEstadisticasUsuario', error, 'Error cargando estadísticas de usuarios', {
        mes,
        anio,
        page
      });

      showError(errorMessage, 'Error en Estadísticas');
    }
  }, [itemsPerPage]);

  /**
   * Efecto para cargar datos cuando cambian los filtros
   */
  useEffect(() => {
    if (autoLoad) {
      loadData(state.mes, state.anio, state.currentPage);
    }
  }, [state.mes, state.anio, state.currentPage, loadData, autoLoad]);

  /**
   * Función para cambiar el mes
   */
  const setMes = useCallback((mes: number) => {
    logInfo('useEstadisticasUsuario', 'Cambiando filtro de mes', { 
      from: state.mes, 
      to: mes 
    });

    setState(prev => ({
      ...prev,
      mes,
      currentPage: 1, // Reset página al cambiar filtros
      error: null
    }));
  }, [state.mes]);

  /**
   * Función para cambiar el año
   */
  const setAnio = useCallback((anio: number) => {
    logInfo('useEstadisticasUsuario', 'Cambiando filtro de año', { 
      from: state.anio, 
      to: anio 
    });

    setState(prev => ({
      ...prev,
      anio,
      currentPage: 1, // Reset página al cambiar filtros
      error: null
    }));
  }, [state.anio]);

  /**
   * Función para cambiar la página actual
   */
  const setCurrentPage = useCallback((page: number) => {
    if (page < 1 || page > state.totalPages) return;

    logInfo('useEstadisticasUsuario', 'Cambiando página', { 
      from: state.currentPage, 
      to: page 
    });

    setState(prev => ({
      ...prev,
      currentPage: page,
      error: null
    }));
  }, [state.currentPage, state.totalPages]);

  /**
   * Función para recargar datos manualmente
   */
  const refetchData = useCallback(async () => {
    logInfo('useEstadisticasUsuario', 'Recarga manual de datos solicitada');
    await loadData(state.mes, state.anio, state.currentPage);
  }, [loadData, state.mes, state.anio, state.currentPage]);

  /**
   * Función para limpiar errores
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Helpers para navegación de páginas
   */
  const canGoToNextPage = state.currentPage < state.totalPages && !state.loading;
  const canGoToPreviousPage = state.currentPage > 1 && !state.loading;

  const goToNextPage = useCallback(() => {
    if (canGoToNextPage) {
      setCurrentPage(state.currentPage + 1);
    }
  }, [canGoToNextPage, setCurrentPage, state.currentPage]);

  const goToPreviousPage = useCallback(() => {
    if (canGoToPreviousPage) {
      setCurrentPage(state.currentPage - 1);
    }
  }, [canGoToPreviousPage, setCurrentPage, state.currentPage]);

  return {
    // Estados
    usuarios: state.usuarios,
    loading: state.loading,
    error: state.error,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    mes: state.mes,
    anio: state.anio,
    hasData: state.hasData,

    // Acciones
    setMes,
    setAnio,
    setCurrentPage,
    refetchData,
    clearError,

    // Helpers de navegación
    canGoToNextPage,
    canGoToPreviousPage,
    goToNextPage,
    goToPreviousPage
  };
};

export default useEstadisticasUsuario;