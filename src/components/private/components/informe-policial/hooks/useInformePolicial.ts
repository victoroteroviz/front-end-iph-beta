/**
 * Hook personalizado para InformePolicial
 * Maneja toda la lógica de negocio separada de la presentación
 * Incluye auto-refresh configurable y control de acceso por roles
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { informePolicialService, getCurrentUserInfo } from '../../../../../services/informe-policial/informe-policial.service';
import { getTiposIPH } from '../../../../../services/informe-policial/tipos-iph.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';

// Interfaces
import type { 
  IInformePolicialState,
  IUseInformePolicialReturn,
  IInformePolicialFilters,
  IRegistroIPH
} from '../../../../../interfaces/components/informe-policial.interface';

// Constantes
import { 
  DEFAULT_FILTERS,
  INFORME_POLICIAL_CONFIG
} from '../../../../../interfaces/components/informe-policial.interface';

// =====================================================
// ESTADO INICIAL
// =====================================================

const createInitialState = (): IInformePolicialState => {
  const userInfo = getCurrentUserInfo();
  
  return {
    registros: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: INFORME_POLICIAL_CONFIG.ITEMS_PER_PAGE
    },
    filters: { ...DEFAULT_FILTERS },
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    autoRefreshEnabled: true,
    nextAutoRefresh: Date.now() + INFORME_POLICIAL_CONFIG.AUTO_REFRESH_INTERVAL,
    userCanViewAll: userInfo.canViewAll,
    currentUserId: userInfo.userId,
    tiposIPH: [],
    tiposLoading: false
  };
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================

const useInformePolicial = (
  autoRefreshInterval: number = INFORME_POLICIAL_CONFIG.AUTO_REFRESH_INTERVAL
): IUseInformePolicialReturn => {
  const navigate = useNavigate();
  const [state, setState] = useState<IInformePolicialState>(createInitialState);
  
  // Referencias para timers
  const autoRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================

  const checkAccess = useCallback(() => {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    
    // Verificar que el usuario tenga roles válidos para ver IPH
    const hasValidRole = userRoles.some((role: any) => 
      ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(role.nombre)
    );

    if (!hasValidRole) {
      showWarning('No tienes permisos para ver informes policiales', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    logInfo('InformePolicial', 'Access granted to user', {
      userId: userData?.id,
      roles: userRoles.map((r: any) => r.nombre),
      canViewAll: state.userCanViewAll
    });

    return true;
  }, [navigate, state.userCanViewAll]);

  const canViewRecord = useCallback((registro: IRegistroIPH): boolean => {
    // Los SuperAdmin, Admin y Superior pueden ver todos los registros
    if (state.userCanViewAll) {
      return true;
    }

    // Los Elemento solo pueden ver sus propios registros
    return registro.usuario_id === state.currentUserId;
  }, [state.userCanViewAll, state.currentUserId]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  /**
   * Carga los tipos de IPH disponibles
   */
  const loadTiposIPH = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, tiposLoading: true }));

      logInfo('InformePolicial', 'Loading IPH types');

      const tipos = await getTiposIPH();

      setState(prev => ({
        ...prev,
        tiposIPH: tipos,
        tiposLoading: false
      }));

      logInfo('InformePolicial', 'IPH types loaded successfully', {
        count: tipos.length,
        types: tipos.map(t => ({ id: t.id, nombre: t.nombre }))
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar tipos de IPH';
      
      logError('InformePolicial', 'Error loading IPH types', { 
        error: errorMessage
      });

      setState(prev => ({
        ...prev,
        tiposLoading: false,
        tiposIPH: [] // Array vacío en caso de error
      }));
    }
  }, []);

  const loadIPHs = useCallback(async (showLoadingIndicator: boolean = true) => {
    try {
      if (showLoadingIndicator) {
        setState(prev => ({ 
          ...prev, 
          isLoading: true, 
          error: null 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          isRefreshing: true, 
          error: null 
        }));
      }

      logInfo('InformePolicial', 'Loading IPH list', {
        filters: state.filters,
        userCanViewAll: state.userCanViewAll,
        userId: state.currentUserId
      });

      const response = await informePolicialService.getIPHList(
        state.filters,
        state.userCanViewAll ? undefined : state.currentUserId || undefined
      );

      setState(prev => ({
        ...prev,
        registros: response.data,
        pagination: {
          ...prev.pagination,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems
        },
        isLoading: false,
        isRefreshing: false,
        lastUpdated: new Date(),
        nextAutoRefresh: Date.now() + autoRefreshInterval,
        error: null
      }));

      logInfo('InformePolicial', 'IPH list loaded successfully', {
        recordsCount: response.data.length,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        currentPage: response.currentPage
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar los informes';
      
      logError('InformePolicial', 'Error loading IPH list', { 
        error: errorMessage,
        filters: state.filters
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: errorMessage
      }));

      if (showLoadingIndicator) {
        showError(errorMessage, 'Error de Carga');
      }
    }
  }, [state.filters, state.userCanViewAll, state.currentUserId, autoRefreshInterval]);

  // =====================================================
  // FUNCIONES DE FILTROS
  // =====================================================

  const updateFilters = useCallback((filters: Partial<IInformePolicialFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { 
        ...prev.filters, 
        ...filters,
        // Reset page cuando se cambian otros filtros (excepto si se está cambiando la página)
        page: filters.page !== undefined ? filters.page : 1
      }
    }));

    logInfo('InformePolicial', 'Filters updated', { 
      updatedFilters: filters,
      newFilters: { ...state.filters, ...filters }
    });

    // La carga se maneja en el useEffect de filtros
  }, [state.filters]);

  const handleSearch = useCallback(() => {
    // Cancelar debounce si existe para búsqueda inmediata
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Mostrar loading inmediatamente para mejor UX
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      filters: { ...prev.filters, page: 1 } 
    }));
    
    logInfo('InformePolicial', 'Manual search triggered', {
      search: state.filters.search,
      searchBy: state.filters.searchBy,
      orderBy: state.filters.orderBy,
      order: state.filters.order
    });
    
    // Ejecutar búsqueda inmediatamente
    loadIPHs(true);
  }, [state.filters, loadIPHs]);

  const handleClearFilters = useCallback(() => {
    // Cancelar debounce si existe
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Mostrar loading inmediatamente
    setState(prev => ({
      ...prev,
      isLoading: true,
      filters: { ...DEFAULT_FILTERS }
    }));

    logInfo('InformePolicial', 'Filters cleared', { 
      previousFilters: state.filters,
      newFilters: DEFAULT_FILTERS 
    });
    
    // La recarga se maneja automáticamente por el useEffect de filtros
  }, [state.filters]);

  // =====================================================
  // FUNCIONES DE PAGINACIÓN
  // =====================================================

  const handlePageChange = useCallback((page: number) => {
    // Comparar con el número de página actual en los filtros, no en la paginación
    if (page < 1 || page > state.pagination.totalPages || page === state.filters.page) {
      return;
    }
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page }
    }));

    logInfo('InformePolicial', 'Page changed', { 
      page, 
      totalPages: state.pagination.totalPages,
      previousPage: state.filters.page 
    });
  }, [state.pagination.totalPages, state.filters.page]);

  // =====================================================
  // FUNCIONES DE NAVEGACIÓN
  // =====================================================

  const handleCardClick = useCallback((registro: IRegistroIPH) => {
    if (!canViewRecord(registro)) {
      showWarning('No tienes permisos para ver este informe', 'Acceso Denegado');
      return;
    }

    logAuth('iph_view_accessed', true, {
      iphId: registro.id,
      referencia: registro.n_referencia,
      tipo: registro.tipo?.nombre
    });

    navigate(`/informeejecutivo/${registro.id}`);
  }, [canViewRecord, navigate]);

  // =====================================================
  // FUNCIONES DE AUTO-REFRESH
  // =====================================================

  const toggleAutoRefresh = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.autoRefreshEnabled;
      const nextRefresh = newEnabled 
        ? Date.now() + autoRefreshInterval
        : prev.nextAutoRefresh;

      logInfo('InformePolicial', 'Auto-refresh toggled', {
        enabled: newEnabled,
        nextRefreshIn: newEnabled ? Math.floor(autoRefreshInterval / 1000) : 0
      });

      return {
        ...prev,
        autoRefreshEnabled: newEnabled,
        nextAutoRefresh: nextRefresh
      };
    });
  }, [autoRefreshInterval]);

  const handleManualRefresh = useCallback(async () => {
    logInfo('InformePolicial', 'Manual refresh triggered by user');
    
    setState(prev => ({
      ...prev,
      nextAutoRefresh: Date.now() + autoRefreshInterval
    }));

    await loadIPHs(false); // Sin loading indicator, usa refreshing
    
    showSuccess('Lista actualizada correctamente', 'Actualización');
  }, [autoRefreshInterval, loadIPHs]);

  // =====================================================
  // EFECTOS
  // =====================================================

  // Efecto de inicialización
  useEffect(() => {
    const hasAccess = checkAccess();
    if (!hasAccess) return;

    // Cargar tipos y datos iniciales
    loadTiposIPH();
    loadIPHs();
  }, [checkAccess, loadTiposIPH]); // Solo en mount

  // Efecto de filtros - escucha TODOS los cambios de filtros
  useEffect(() => {
    // Cancelar debounce anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Solo aplicar debounce para búsquedas, cargar inmediatamente para otros filtros
    if (state.filters.search && state.filters.search.trim() !== '') {
      // Búsqueda con debounce
      debounceTimer.current = setTimeout(() => {
        loadIPHs();
      }, INFORME_POLICIAL_CONFIG.SEARCH_DEBOUNCE_DELAY);
    } else {
      // Sin búsqueda o filtros de ordenamiento/paginación - cargar inmediatamente
      loadIPHs();
    }
  }, [state.filters.search, state.filters.searchBy, state.filters.orderBy, state.filters.order, state.filters.page, state.filters.tipoId, loadIPHs]);

  // Efecto de auto-refresh
  useEffect(() => {
    if (!state.autoRefreshEnabled) {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
      return;
    }

    const setupAutoRefresh = () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }

      autoRefreshTimer.current = setInterval(() => {
        const now = Date.now();
        if (now >= state.nextAutoRefresh) {
          logInfo('InformePolicial', 'Auto-refresh triggered');
          loadIPHs(false); // Silent refresh
          setState(prev => ({
            ...prev,
            nextAutoRefresh: now + autoRefreshInterval
          }));
        }
      }, 1000); // Check every second
    };

    setupAutoRefresh();

    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
    };
  }, [state.autoRefreshEnabled, state.nextAutoRefresh, autoRefreshInterval, loadIPHs]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  const hasData = useMemo(() => state.registros.length > 0, [state.registros.length]);
  
  const isAnyLoading = useMemo(() => state.isLoading || state.isRefreshing, [state.isLoading, state.isRefreshing]);

  const timeUntilNextRefresh = useMemo(() => {
    if (!state.autoRefreshEnabled) return 0;
    return Math.max(0, Math.floor((state.nextAutoRefresh - Date.now()) / 1000));
  }, [state.autoRefreshEnabled, state.nextAutoRefresh]);

  const visibleRecords = useMemo(() => {
    return state.registros.filter(canViewRecord);
  }, [state.registros, canViewRecord]);

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    state,
    updateFilters,
    handleSearch,
    handleClearFilters,
    handlePageChange,
    handleCardClick,
    handleManualRefresh,
    toggleAutoRefresh,
    loadIPHs,
    canViewRecord,
    hasData,
    isAnyLoading,
    timeUntilNextRefresh,
    visibleRecords
  };
};

export default useInformePolicial;