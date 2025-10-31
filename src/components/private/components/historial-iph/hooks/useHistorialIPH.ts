/**
 * Hook personalizado para el manejo del HistorialIPH
 *
 * @fileoverview Hook que encapsula toda la lógica de negocio para el componente
 * HistorialIPH, incluyendo gestión de estado, filtros, paginación y operaciones CRUD.
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2024-01-30
 *
 * @changes v2.0.0
 * - ✅ Validación de roles centralizada (de 41 líneas a 3)
 * - ✅ Usa canAccessElemento() del helper con cache + Zod
 * - ✅ Eliminada lógica manual de parsing de sessionStorage
 * - ✅ Usa getUserRoles() centralizado del role.helper
 * - ✅ Logging movido a useEffect separado
 *
 * @author Sistema IPH Frontend
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Helpers
import { logInfo, logError, logWarning } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { getUserRoles } from '../../../../../helper/role/role.helper';
import { canAccessElemento } from '../../../../../config/permissions.config';

// Services
import {
  getHistorialIPH,
  updateEstatusIPH,
  getRegistroIPHById,
  getEstatusOptions,
  getEstadisticasHistorial
} from '../services/historial-iph.service';

// Interfaces
import type {
  UseHistorialIPHReturn,
  UseHistorialIPHParams,
  RegistroHistorialIPH,
  EstadisticasHistorial,
  FiltrosHistorial,
  PaginacionHistorial
} from '../../../../../interfaces/components/historialIph.interface';

// Comentadas temporalmente - no se usan con el servicio actualizado
// import type {
//   QueryHistorialDto,
//   ResHistorialIphResponse
// } from '../../../../../interfaces/estatus-iph';


// ==================== CONFIGURACIÓN ====================

/**
 * Configuración por defecto del hook
 */
const DEFAULT_CONFIG = {
  itemsPerPage: 10,
  maxRetries: 3,
  debounceTime: 3000,
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
 * Estadísticas iniciales vacías (adaptadas al nuevo formato del servicio)
 */
const INITIAL_ESTADISTICAS: EstadisticasHistorial = {
  total: 0,
  promedioPorDia: 0,
  registroPorMes: 0,
  estatusPorIph: []
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
  const [estatusOptions, setEstatusOptions] = useState<string[]>([]);

  // ==================== VALIDACIONES DE ROLES ====================
  // #region 🔐 VALIDACIÓN DE ACCESO v2.0 - Centralizado

  /**
   * Verifica si el usuario tiene permisos para acceder al historial
   * TODOS los roles tienen acceso (SuperAdmin, Admin, Superior, Elemento)
   *
   * @refactored v2.0.0 - Reducido de 41 líneas a 3 (-93%)
   * @security Validación Zod + cache 5s + jerarquía automática
   */
  const hasAccess = useMemo(() => canAccessElemento(getUserRoles()), []);

  // #endregion

  /**
   * Logging de acceso - separado del useMemo para mejor performance
   */
  useEffect(() => {
    if (hasAccess) {
      logInfo('useHistorialIPH', 'Hook inicializado con acceso autorizado');
    } else {
      logWarning('useHistorialIPH', 'Hook inicializado sin acceso - usuario sin roles válidos');
    }
  }, [hasAccess]);

  // ==================== FUNCIONES INTERNAS ====================

  /**
   * Carga las opciones de estatus desde el backend
   */
  const loadEstatusOptions = useCallback(async () => {
    try {
      logInfo('useHistorialIPH', 'Cargando opciones de estatus desde el backend');
      const opciones = await getEstatusOptions();
      setEstatusOptions(opciones);

      logInfo('useHistorialIPH', 'Opciones de estatus cargadas exitosamente', {
        totalOpciones: opciones.length,
        opciones: opciones
      });
    } catch (error) {
      logError('useHistorialIPH', error, 'Error cargando opciones de estatus');
      // Las opciones por defecto ya están en el servicio como fallback
    }
  }, []);

  /**
   * Convierte filtros del formato local al formato de parámetros del servicio actualizado
   * Limpia valores vacíos para evitar errores de validación en el backend
   */
  const convertirFiltrosAParams = useCallback((filtrosLocal: FiltrosHistorial, pagina: number) => {
    // Limpiar filtros vacíos para evitar enviar strings vacíos al backend
    const filtrosLimpios: FiltrosHistorial = {};
    
    // Solo agregar filtros con valores válidos (no vacíos)
    if (filtrosLocal.fechaInicio && filtrosLocal.fechaInicio.trim() !== '') {
      filtrosLimpios.fechaInicio = filtrosLocal.fechaInicio.trim();
    }
    if (filtrosLocal.fechaFin && filtrosLocal.fechaFin.trim() !== '') {
      filtrosLimpios.fechaFin = filtrosLocal.fechaFin.trim();
    }
    if (filtrosLocal.estatus && filtrosLocal.estatus.trim() !== '') {
      filtrosLimpios.estatus = filtrosLocal.estatus.trim();
    }
    if (filtrosLocal.tipoDelito && filtrosLocal.tipoDelito.trim() !== '') {
      filtrosLimpios.tipoDelito = filtrosLocal.tipoDelito.trim();
    }
    if (filtrosLocal.usuario && filtrosLocal.usuario.trim() !== '') {
      filtrosLimpios.usuario = filtrosLocal.usuario.trim();
    }
    if (filtrosLocal.busqueda && filtrosLocal.busqueda.trim() !== '') {
      filtrosLimpios.busqueda = filtrosLocal.busqueda.trim();
      // Solo incluir busquedaPor si hay búsqueda
      if (filtrosLocal.busquedaPor) {
        filtrosLimpios.busquedaPor = filtrosLocal.busquedaPor;
      }
    }
    
    return {
      page: pagina,
      limit: paginacion.limit,
      filtros: filtrosLimpios
    };
  }, [paginacion.limit]);

  /**
   * Obtiene ÚNICAMENTE las estadísticas desde /estatus-iph (independiente de la tabla)
   */
  const fetchEstadisticas = useCallback(async () => {
    try {
      logInfo('useHistorialIPH', 'Obteniendo estadísticas ÚNICAMENTE desde /estatus-iph');

      // Obtener estadísticas SOLO del endpoint estatus-iph (sin cruzar con iph-history)
      const estadisticasResponse = await getEstadisticasHistorial();

      setEstadisticas(estadisticasResponse);

      logInfo('useHistorialIPH', 'Estadísticas obtenidas exitosamente desde /estatus-iph', {
        total: estadisticasResponse.total,
        estatusCount: estadisticasResponse.estatusPorIph.length
      });

    } catch (error) {
      logError('useHistorialIPH', error, 'Error obteniendo estadísticas desde /estatus-iph');
      // No afectar el error general, solo las estadísticas
    }
  }, []);

  /**
   * Obtiene ÚNICAMENTE los datos de la tabla desde /iph-history (independiente de estadísticas)
   */
  const fetchData = useCallback(async (showLoadingState = true, currentRetryCount = 0) => {
    if (!hasAccess) {
      setError('No tienes permisos para acceder a esta información');
      return;
    }

    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

      logInfo('useHistorialIPH', 'Obteniendo ÚNICAMENTE datos de tabla desde /iph-history', {
        filtros: filtros,
        paginacion: { page: paginacion.page, limit: paginacion.limit }
      });

      // Convertir filtros al formato del servicio actualizado
      const params = convertirFiltrosAParams(filtros, paginacion.page);

      // Obtener SOLO datos de la tabla desde /iph-history (SIN estadísticas)
      const historialResponse = await getHistorialIPH(params);

      setRegistros(historialResponse.registros);
      // NO setear estadísticas aquí - se obtienen independientemente
      setPaginacion(historialResponse.paginacion);

      // Reset retry count on success solo si es diferente de 0
      if (currentRetryCount > 0) {
        setRetryCount(0);
      }

      logInfo('useHistorialIPH', 'Datos obtenidos exitosamente con servicio actualizado', {
        totalRegistros: historialResponse.registros.length,
        totalFiltrados: historialResponse.paginacion.total,
        pagina: historialResponse.paginacion.page,
        totalEstatus: historialResponse.estadisticas.total,
        estatusCount: historialResponse.estadisticas.estatusPorIph.length
      });

      // Mostrar notificación solo si no hay datos
      if (historialResponse.registros.length === 0 && Object.values(filtros).some(f => f)) {
        showWarning('No se encontraron registros con los filtros aplicados');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('useHistorialIPH', error, 'Error obteniendo datos del historial con servicio actualizado');

      // Implementar retry logic
      if (currentRetryCount < DEFAULT_CONFIG.maxRetries) {
        const nextRetryCount = currentRetryCount + 1;
        logInfo('useHistorialIPH', `Reintentando obtener datos (intento ${nextRetryCount}/${DEFAULT_CONFIG.maxRetries})`);

        // Usar setTimeout para evitar llamadas inmediatas que puedan crear bucles
        setTimeout(() => {
          fetchData(false, nextRetryCount);
        }, 1000 * nextRetryCount);
        return;
      }

      setError(`Error cargando el historial: ${errorMessage}`);
      showError(`No se pudieron cargar los datos: ${errorMessage}`);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [hasAccess, filtros, paginacion.page, paginacion.limit, convertirFiltrosAParams]);

  // ==================== EFECTOS ====================

  /**
   * Efecto para cargar opciones de estatus al montar el componente
   */
  useEffect(() => {
    if (hasAccess) {
      loadEstatusOptions();
    }
  }, [hasAccess, loadEstatusOptions]);

  /**
   * Ref para manejar debounce de las peticiones
   */
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Efecto para cargar datos cuando cambien filtros, paginación o retry (con debounce)
   */
  useEffect(() => {
    if (hasAccess) {
      // Limpiar timeout anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Solo aplicar debounce a cambios de filtros, no a paginación
      const isFilterChange = JSON.stringify(filtros) !== JSON.stringify(INITIAL_FILTERS);
      const debounceTime = isFilterChange ? 300 : 0; // 300ms para filtros, inmediato para paginación

      debounceRef.current = setTimeout(() => {
        // Obtener datos de tabla y estadísticas por separado
        fetchData();
        fetchEstadisticas();
      }, debounceTime);

      // Cleanup
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }
  }, [hasAccess, filtros, paginacion.page, paginacion.limit, retryCount, fetchData, fetchEstadisticas]);

  /**
   * Efecto para limpiar error cuando cambien filtros
   */
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [filtros, error]);

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
   * Limpia todos los filtros
   */
  const clearAllFilters = useCallback(() => {
    logInfo('useHistorialIPH', 'Limpiando todos los filtros');

    // Restablecer completamente el estado de filtros
    setFiltrosState({
      fechaInicio: '',
      fechaFin: '',
      estatus: '',
      tipoDelito: '',
      usuario: '',
      busqueda: ''
    });

    // Resetear página al limpiar filtros
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
    // Obtener datos de tabla y estadísticas por separado
    await Promise.all([
      fetchData(),
      fetchEstadisticas()
    ]);
    showSuccess('Datos actualizados correctamente');
  }, [fetchData, fetchEstadisticas]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Muestra el detalle de un registro
   * @note La carga de datos básicos se maneja en el componente DetalleIPH con useDetalleIPH
   */
  const verDetalle = useCallback(async (registro: RegistroHistorialIPH) => {
    try {
      logInfo('useHistorialIPH', 'Abriendo detalle de registro', { registroId: registro.id });

      // Abrir modal con el registro - los datos básicos se cargan en el componente DetalleIPH
      setRegistroSeleccionado(registro);

    } catch (error) {
      logError('useHistorialIPH', error, `Error abriendo detalle del registro ID: ${registro.id}`);
      showError('No se pudo abrir el detalle del registro');
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
    id: string,
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
      logError('useHistorialIPH', error, `Error editando estatus ID: ${id} a ${nuevoEstatus}`);
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
    estatusOptions,

    // Acciones
    setFiltros,
    clearAllFilters,
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