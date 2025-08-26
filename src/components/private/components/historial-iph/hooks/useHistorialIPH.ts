/**
 * Hook personalizado para el manejo del HistorialIPH
 * 
 * @fileoverview Hook que encapsula toda la lógica de negocio para el componente
 * HistorialIPH, incluyendo gestión de estado, filtros, paginación y operaciones CRUD.
 * 
 * @version 1.0.0
 * @since 2024-01-29
 * 
 * @author Sistema IPH Frontend
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Helpers
import { logInfo, logError, logWarning } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';

// Services
import {
  getHistorialIPH,
  updateEstatusIPH,
  getRegistroIPHById
} from '../../../../../services/historial/historial-iph.service';

// Interfaces
import type {
  UseHistorialIPHReturn,
  UseHistorialIPHParams,
  RegistroHistorialIPH,
  EstadisticasHistorial,
  FiltrosHistorial,
  PaginacionHistorial
} from '../../../../../interfaces/components/historialIph.interface';

// Role system
import { ALLOWED_ROLES } from '../../../../../config/env.config';
import { getRouteForUser } from '../../../../../helper/navigation/navigation.helper';

// ==================== CONFIGURACIÓN ====================

/**
 * Configuración por defecto del hook
 */
const DEFAULT_CONFIG = {
  itemsPerPage: 10,
  maxRetries: 3,
  debounceTime: 500,
  autoRefreshInterval: 300000 // 5 minutos
} as const;

/**
 * Filtros iniciales por defecto
 */
const INITIAL_FILTERS: FiltrosHistorial = {
  fechaInicio: '',
  fechaFin: '',
  estatus: '',
  tipoDelito: '',
  usuario: '',
  busqueda: ''
};

/**
 * Estadísticas iniciales vacías
 */
const INITIAL_ESTADISTICAS: EstadisticasHistorial = {
  total_registros: 0,
  activos: 0,
  inactivos: 0,
  pendientes: 0,
  cancelados: 0,
  total_mes_actual: 0,
  promedio_diario: 0
};

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook personalizado para manejo del HistorialIPH
 * 
 * @param {UseHistorialIPHParams} params - Parámetros de configuración
 * @returns {UseHistorialIPHReturn} Estado y acciones del hook
 * 
 * @example
 * ```typescript
 * const {
 *   registros,
 *   loading,
 *   error,
 *   estadisticas,
 *   filtros,
 *   setFiltros,
 *   refetchData,
 *   verDetalle
 * } = useHistorialIPH({
 *   itemsPerPage: 15,
 *   initialFilters: { estatus: 'Activo' }
 * });
 * ```
 */
export const useHistorialIPH = (params: UseHistorialIPHParams = {}): UseHistorialIPHReturn => {
  const {
    initialFilters = {},
    itemsPerPage = DEFAULT_CONFIG.itemsPerPage
  } = params;

  // ==================== ESTADO ====================

  const [registros, setRegistros] = useState<RegistroHistorialIPH[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasHistorial>(INITIAL_ESTADISTICAS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltrosState] = useState<FiltrosHistorial>({
    ...INITIAL_FILTERS,
    ...initialFilters
  });
  const [paginacion, setPaginacion] = useState<PaginacionHistorial>({
    page: 1,
    limit: itemsPerPage,
    total: 0,
    totalPages: 0
  });
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroHistorialIPH | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // ==================== VALIDACIONES DE ROLES ====================

  /**
   * Verifica si el usuario tiene permisos para acceder al historial
   */
  const hasAccess = useMemo(() => {
    const userDataStr = sessionStorage.getItem('userData');
    if (!userDataStr) {
      logWarning('useHistorialIPH', 'No hay datos de usuario en sessionStorage');
      return false;
    }

    try {
      const userData = JSON.parse(userDataStr);
      const userRoles = userData.roles || [];
      
      // Solo Admin y SuperAdmin pueden acceder
      const allowedRoleNames = ['Administrador', 'SuperAdmin'];
      const hasPermission = userRoles.some((role: any) => 
        allowedRoleNames.includes(role.nombre)
      );

      if (!hasPermission) {
        logWarning('useHistorialIPH', 'Usuario sin permisos para acceder al historial', {
          userRoles: userRoles.map((r: any) => r.nombre)
        });
      }

      return hasPermission;
    } catch (error) {
      logError('useHistorialIPH', 'Error parseando datos de usuario', { error });
      return false;
    }
  }, []);

  // ==================== FUNCIONES INTERNAS ====================

  /**
   * Obtiene los datos del historial
   */
  const fetchData = useCallback(async (showLoadingState = true) => {
    if (!hasAccess) {
      setError('No tienes permisos para acceder a esta información');
      return;
    }

    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

      logInfo('useHistorialIPH', 'Obteniendo datos del historial', {
        filtros,
        paginacion: { page: paginacion.page, limit: paginacion.limit }
      });

      const response = await getHistorialIPH({
        page: paginacion.page,
        limit: paginacion.limit,
        filtros
      });

      setRegistros(response.registros);
      setEstadisticas(response.estadisticas);
      setPaginacion(response.paginacion);
      setRetryCount(0); // Reset retry count on success

      logInfo('useHistorialIPH', 'Datos obtenidos exitosamente', {
        totalRegistros: response.registros.length,
        totalFiltrados: response.paginacion.total,
        pagina: response.paginacion.page
      });

      // Mostrar notificación solo si no hay datos
      if (response.registros.length === 0 && Object.values(filtros).some(f => f)) {
        showWarning('No se encontraron registros con los filtros aplicados');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('useHistorialIPH', 'Error obteniendo datos del historial', { error, filtros });
      
      // Implementar retry logic
      if (retryCount < DEFAULT_CONFIG.maxRetries) {
        logInfo('useHistorialIPH', `Reintentando obtener datos (intento ${retryCount + 1}/${DEFAULT_CONFIG.maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(false), 1000 * (retryCount + 1)); // Backoff exponencial
        return;
      }

      setError(`Error cargando el historial: ${errorMessage}`);
      showError(`No se pudieron cargar los datos: ${errorMessage}`);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [hasAccess, filtros, paginacion.page, paginacion.limit, retryCount]);

  // ==================== EFECTOS ====================

  /**
   * Efecto para cargar datos iniciales y cuando cambien filtros/página
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Efecto para limpiar error cuando cambien filtros
   */
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [filtros]);

  // ==================== ACCIONES PÚBLICAS ====================

  /**
   * Actualiza filtros y resetea la página
   */
  const setFiltros = useCallback((nuevosFiltros: Partial<FiltrosHistorial>) => {
    logInfo('useHistorialIPH', 'Actualizando filtros', { nuevosFiltros });
    
    setFiltrosState(prev => ({
      ...prev,
      ...nuevosFiltros
    }));

    // Resetear página al cambiar filtros
    setPaginacion(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  /**
   * Cambia la página actual
   */
  const setCurrentPage = useCallback((page: number) => {
    if (page < 1 || page > paginacion.totalPages) return;
    
    logInfo('useHistorialIPH', 'Cambiando página', { page, totalPages: paginacion.totalPages });
    
    setPaginacion(prev => ({
      ...prev,
      page
    }));
  }, [paginacion.totalPages]);

  /**
   * Recarga los datos manualmente
   */
  const refetchData = useCallback(async () => {
    logInfo('useHistorialIPH', 'Recarga manual solicitada');
    setRetryCount(0); // Reset retry count for manual refresh
    await fetchData();
    showSuccess('Datos actualizados correctamente');
  }, [fetchData]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Muestra el detalle de un registro
   */
  const verDetalle = useCallback(async (registro: RegistroHistorialIPH) => {
    try {
      logInfo('useHistorialIPH', 'Abriendo detalle de registro', { registroId: registro.id });
      
      // Obtener datos completos del registro si es necesario
      const registroCompleto = await getRegistroIPHById(registro.id);
      setRegistroSeleccionado(registroCompleto || registro);
      
    } catch (error) {
      logError('useHistorialIPH', 'Error obteniendo detalle del registro', { error, registroId: registro.id });
      showError('No se pudo cargar el detalle del registro');
      setRegistroSeleccionado(registro); // Fallback al registro original
    }
  }, []);

  /**
   * Cierra el detalle
   */
  const cerrarDetalle = useCallback(() => {
    logInfo('useHistorialIPH', 'Cerrando detalle de registro');
    setRegistroSeleccionado(null);
  }, []);

  /**
   * Edita el estatus de un registro
   */
  const editarEstatus = useCallback(async (
    id: number, 
    nuevoEstatus: RegistroHistorialIPH['estatus']
  ): Promise<void> => {
    if (!hasAccess) {
      showError('No tienes permisos para editar registros');
      return;
    }

    try {
      logInfo('useHistorialIPH', 'Editando estatus de registro', { id, nuevoEstatus });
      
      setLoading(true);
      
      const registroActualizado = await updateEstatusIPH({
        id,
        nuevoEstatus,
        observaciones: `Estatus actualizado a ${nuevoEstatus}`
      });

      // Actualizar el registro en la lista
      setRegistros(prev => prev.map(registro => 
        registro.id === id ? registroActualizado : registro
      ));

      // Actualizar el registro seleccionado si coincide
      if (registroSeleccionado?.id === id) {
        setRegistroSeleccionado(registroActualizado);
      }

      // Recargar estadísticas
      await fetchData(false);

      showSuccess(`Estatus actualizado a "${nuevoEstatus}" correctamente`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('useHistorialIPH', 'Error editando estatus', { error, id, nuevoEstatus });
      showError(`Error actualizando estatus: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [hasAccess, registroSeleccionado, fetchData]);

  // ==================== COMPUTED VALUES ====================

  /**
   * Navegación de paginación
   */
  const canGoToNextPage = useMemo(() => 
    paginacion.page < paginacion.totalPages, 
    [paginacion.page, paginacion.totalPages]
  );

  const canGoToPreviousPage = useMemo(() => 
    paginacion.page > 1, 
    [paginacion.page]
  );

  const goToNextPage = useCallback(() => {
    if (canGoToNextPage) {
      setCurrentPage(paginacion.page + 1);
    }
  }, [canGoToNextPage, paginacion.page, setCurrentPage]);

  const goToPreviousPage = useCallback(() => {
    if (canGoToPreviousPage) {
      setCurrentPage(paginacion.page - 1);
    }
  }, [canGoToPreviousPage, paginacion.page, setCurrentPage]);

  /**
   * Indica si hay datos para mostrar
   */
  const hasData = useMemo(() => 
    registros.length > 0, 
    [registros.length]
  );

  // ==================== RETURN ====================

  return {
    // Estado
    registros,
    estadisticas,
    loading,
    error,
    filtros,
    paginacion,
    registroSeleccionado,
    
    // Acciones
    setFiltros,
    setCurrentPage,
    refetchData,
    clearError,
    verDetalle,
    cerrarDetalle,
    editarEstatus,
    
    // Navegación
    canGoToNextPage,
    canGoToPreviousPage,
    goToNextPage,
    goToPreviousPage,
    
    // Computed
    hasData
  };
};

export default useHistorialIPH;