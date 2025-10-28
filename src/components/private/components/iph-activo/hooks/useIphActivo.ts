/**
 * Hook personalizado para InformePolicial
 * Maneja toda la lógica de negocio separada de la presentación
 * Incluye auto-refresh configurable y control de acceso por roles
 * Cache LRU con límite de 10 páginas y TTL de 1 minuto
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { informePolicialService, getCurrentUserInfo } from '../services/informe-policial.service';
import { getTiposIPH } from '../services/tipos-iph.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth, logDebug } from '../../../../../helper/log/logger.helper';

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
// CACHE MANAGER PARA IPH (LRU CON LÍMITE DE 10 PÁGINAS)
// =====================================================

/**
 * Datos almacenados en el cache
 */
interface IPHCachedData {
  data: IRegistroIPH[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  timestamp: number;
}

/**
 * Interfaz para entradas del cache
 */
interface IPHCacheEntry {
  data: IPHCachedData;
  timestamp: number;
  filters: IInformePolicialFilters;
  accessCount: number;
  lastAccess: number;
}

/**
 * Cache Manager especializado para IPH
 * - Límite: 10 páginas
 * - TTL: 1 minuto (60,000 ms)
 * - Estrategia: LRU (Least Recently Used)
 */
class IPHCacheManager {
  private cache: Map<string, IPHCacheEntry> = new Map();
  private readonly MAX_PAGES = 10;
  private readonly TTL = 60 * 1000; // 1 minuto

  /**
   * Genera una clave única basada en página + filtros
   */
  private generateKey(page: number, filters: IInformePolicialFilters): string {
    return JSON.stringify({
      page,
      search: filters.search || '',
      searchBy: filters.searchBy || 'n_referencia',
      tipoId: filters.tipoId || null
    });
  }

  /**
   * Verifica si una entrada está expirada
   */
  private isExpired(entry: IPHCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.TTL;
  }

  /**
   * Elimina la entrada menos usada (LRU)
   */
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let lruKey: string | null = null;
    let lruAccessCount = Infinity;
    let lruLastAccess = Infinity;

    // Encontrar la entrada menos usada
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < lruAccessCount || 
          (entry.accessCount === lruAccessCount && entry.lastAccess < lruLastAccess)) {
        lruKey = key;
        lruAccessCount = entry.accessCount;
        lruLastAccess = entry.lastAccess;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      logDebug('IPHCache', 'LRU eviction', { evictedKey: lruKey });
    }
  }

  /**
   * Limpia entradas expiradas
   */
  private cleanExpired(): void {
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logDebug('IPHCache', 'Expired entries cleaned', { count: expiredCount });
    }
  }

  /**
   * Obtiene datos del cache si existen y no están expirados
   */
  get(page: number, filters: IInformePolicialFilters): IPHCachedData | null {
    this.cleanExpired();

    const key = this.generateKey(page, filters);
    const entry = this.cache.get(key);

    if (!entry) {
      logDebug('IPHCache', 'Cache MISS', { page, filters });
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      logDebug('IPHCache', 'Cache EXPIRED', { page, filters });
      return null;
    }

    // Actualizar métricas LRU
    entry.accessCount++;
    entry.lastAccess = Date.now();

    logInfo('IPHCache', 'Cache HIT', { 
      page, 
      age: Math.floor((Date.now() - entry.timestamp) / 1000) + 's',
      accessCount: entry.accessCount
    });

    return entry.data;
  }

  /**
   * Guarda datos en el cache
   */
  set(page: number, filters: IInformePolicialFilters, data: IPHCachedData): void {
    this.cleanExpired();

    // Si alcanzamos el límite, eliminar LRU
    if (this.cache.size >= this.MAX_PAGES) {
      this.evictLRU();
    }

    const key = this.generateKey(page, filters);
    const entry: IPHCacheEntry = {
      data,
      timestamp: Date.now(),
      filters: { ...filters },
      accessCount: 1,
      lastAccess: Date.now()
    };

    this.cache.set(key, entry);

    logInfo('IPHCache', 'Cache SET', { 
      page, 
      cacheSize: this.cache.size,
      maxSize: this.MAX_PAGES 
    });
  }

  /**
   * Invalida todo el cache
   */
  clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    
    if (previousSize > 0) {
      logInfo('IPHCache', 'Cache cleared', { previousSize });
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_PAGES,
      ttl: this.TTL
    };
  }
}

// Instancia global del cache
const iphCache = new IPHCacheManager();

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
    tiposLoading: false,
    isFromCache: false
  };
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================

/**
 * Hook para manejar la lógica del módulo de Informe Policial
 * 
 * @param autoRefreshInterval - Intervalo de auto-refresh en ms (default: 5min)
 * @param enabled - Si false, no ejecuta API calls ni efectos (default: true)
 * @returns Estado y funciones del módulo
 * 
 * @security El parámetro 'enabled' debe ser false cuando el usuario no tiene permisos
 */
const useInformePolicial = (
  autoRefreshInterval: number = INFORME_POLICIAL_CONFIG.AUTO_REFRESH_INTERVAL,
  enabled: boolean = true
): IUseInformePolicialReturn => {
  const navigate = useNavigate();
  const [state, setState] = useState<IInformePolicialState>(createInitialState);

  // Referencias para timers
  const autoRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Ref para filtros actuales (evita dependencias circulares)
  const currentFiltersRef = useRef<IInformePolicialFilters>(state.filters);
  const userCanViewAllRef = useRef<boolean>(state.userCanViewAll);
  const currentUserIdRef = useRef<string | null>(state.currentUserId);

  // Sincronizar refs con el estado
  useEffect(() => {
    currentFiltersRef.current = state.filters;
    userCanViewAllRef.current = state.userCanViewAll;
    currentUserIdRef.current = state.currentUserId;
  }, [state.filters, state.userCanViewAll, state.currentUserId]);

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================

  const checkAccess = useCallback(() => {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]') as Array<{ nombre: string }>;
    
    // Verificar que el usuario tenga roles válidos para ver IPH
    const hasValidRole = userRoles.some((role) => 
      ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(role.nombre)
    );

    if (!hasValidRole) {
      showWarning('No tienes permisos para ver informes policiales', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    logInfo('InformePolicial', 'Access granted to user', {
      userId: userData?.id,
      roles: userRoles.map((r) => r.nombre),
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
      
      logError('InformePolicial', errorMessage, 'Error loading IPH types');

      setState(prev => ({
        ...prev,
        tiposLoading: false,
        tiposIPH: [] // Array vacío en caso de error
      }));
    }
  }, []);

  const loadIPHs = useCallback(async (showLoadingIndicator: boolean = true, bypassCache: boolean = false) => {
    try {
      // Usar refs en lugar de state para evitar dependencias circulares
      const filters = currentFiltersRef.current;
      const canViewAll = userCanViewAllRef.current;
      const userId = currentUserIdRef.current;

      // =====================================================
      // VERIFICAR CACHE PRIMERO (si no es bypass)
      // =====================================================
      
      if (!bypassCache) {
        const cachedData = iphCache.get(filters.page, filters);
        
        if (cachedData) {
          // Datos encontrados en cache, actualizar estado sin API call
          setState(prev => ({
            ...prev,
            registros: cachedData.data,
            pagination: {
              ...prev.pagination,
              currentPage: cachedData.currentPage,
              totalPages: cachedData.totalPages,
              totalItems: cachedData.totalItems
            },
            isLoading: false,
            isRefreshing: false,
            lastUpdated: new Date(cachedData.timestamp), // Usar timestamp del cache
            nextAutoRefresh: Date.now() + autoRefreshInterval,
            error: null,
            isFromCache: true // ✅ Marcar como datos del cache
          }));

          logInfo('InformePolicial', '✅ Data loaded from CACHE', {
            page: filters.page,
            recordsCount: cachedData.data.length,
            cacheAge: Math.floor((Date.now() - cachedData.timestamp) / 1000) + 's'
          });

          return; // Salir sin hacer API call
        }
      }

      // =====================================================
      // CACHE MISS O BYPASS - HACER API CALL
      // =====================================================

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

      logDebug('InformePolicial', '🌐 Loading IPH list from API', {
        filters,
        userCanViewAll: canViewAll,
        userId,
        bypassCache
      });

      const response = await informePolicialService.getIPHList(
        filters,
        canViewAll ? undefined : userId || undefined
      );

      // =====================================================
      // GUARDAR EN CACHE
      // =====================================================
      
      iphCache.set(filters.page, filters, {
        data: response.data,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        timestamp: Date.now()
      });

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
        error: null,
        isFromCache: false // ✅ Marcar como datos frescos de la API
      }));

      logInfo('InformePolicial', '✅ IPH list loaded from API and CACHED', {
        recordsCount: response.data.length,
        totalPages: response.totalPages,
        totalItems: response.totalItems,
        currentPage: response.currentPage,
        cacheStats: iphCache.getStats()
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar los informes';

      logError('InformePolicial', errorMessage, 'Error loading IPH list');

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
  }, [autoRefreshInterval]); // ✅ Solo depende de autoRefreshInterval (estable)

  // =====================================================
  // FUNCIONES DE FILTROS
  // =====================================================

  const updateFilters = useCallback((filters: Partial<IInformePolicialFilters>) => {
    // ✅ Invalidar cache cuando cambian filtros (excepto página)
    const filtersChanged = Object.keys(filters).some(key => 
      key !== 'page' && filters[key as keyof IInformePolicialFilters] !== undefined
    );
    
    if (filtersChanged) {
      iphCache.clear();
      logInfo('InformePolicial', '🗑️ Cache cleared due to filter change');
    }

    setState(prev => {
      const newFilters = {
        ...prev.filters,
        ...filters,
        // Reset page cuando se cambian otros filtros (excepto si se está cambiando la página)
        page: filters.page !== undefined ? filters.page : 1
      };

      // Log simplificado (solo en dev, se descarta en prod)
      logDebug('InformePolicial', 'Filters updated', {
        updatedFilters: filters
      });

      return {
        ...prev,
        filters: newFilters
      };
    });

    // La carga se maneja en el useEffect de filtros
  }, []); // ✅ Sin dependencias - función estable

  const handleSearch = useCallback(() => {
    // Cancelar debounce si existe para búsqueda inmediata
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // ✅ Invalidar cache en búsqueda manual
    iphCache.clear();
    logInfo('InformePolicial', '🗑️ Cache cleared due to manual search');

    // Mostrar loading inmediatamente para mejor UX
    setState(prev => {
      // Log simplificado (solo en dev, se descarta en prod)
      logDebug('InformePolicial', 'Manual search triggered', {
        search: prev.filters.search,
        searchBy: prev.filters.searchBy
      });

      return {
        ...prev,
        isLoading: true,
        filters: { ...prev.filters, page: 1 }
      };
    });

    // Ejecutar búsqueda inmediatamente
    loadIPHs(true);
  }, [loadIPHs]); // ✅ Solo depende de loadIPHs

  const handleClearFilters = useCallback(() => {
    // Cancelar debounce si existe
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // ✅ Invalidar cache cuando se limpian filtros
    iphCache.clear();
    logInfo('InformePolicial', '🗑️ Cache cleared due to filters reset');

    // Mostrar loading inmediatamente
    setState(prev => {
      // Log simplificado (solo en dev, se descarta en prod)
      logDebug('InformePolicial', 'Filters cleared');

      return {
        ...prev,
        isLoading: true,
        filters: { ...DEFAULT_FILTERS }
      };
    });

    // La recarga se maneja automáticamente por el useEffect de filtros
  }, []); // ✅ Sin dependencias - función estable

  // =====================================================
  // FUNCIONES DE PAGINACIÓN
  // =====================================================

  const handlePageChange = useCallback((page: number) => {
    setState(prev => {
      // Validar antes de cambiar
      if (page < 1 || page > prev.pagination.totalPages || page === prev.filters.page) {
        return prev; // No hay cambios
      }

      // Log simplificado (solo en dev, se descarta en prod)
      logDebug('InformePolicial', 'Page changed', {
        from: prev.filters.page,
        to: page
      });

      return {
        ...prev,
        filters: { ...prev.filters, page }
      };
    });
  }, []); // ✅ Sin dependencias - usa prev para validación

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
    logInfo('InformePolicial', '🔄 Manual refresh triggered by user');
    
    // ✅ Invalidar cache en refresh manual
    iphCache.clear();
    logInfo('InformePolicial', '🗑️ Cache cleared due to manual refresh');
    
    setState(prev => ({
      ...prev,
      nextAutoRefresh: Date.now() + autoRefreshInterval
    }));

    await loadIPHs(false, true); // Sin loading indicator, usa refreshing, bypass cache
    
    showSuccess('Lista actualizada correctamente', 'Actualización');
  }, [autoRefreshInterval, loadIPHs]);

  // =====================================================
  // EFECTOS
  // =====================================================

  // Efecto de inicialización
  useEffect(() => {
    // Si el hook está deshabilitado, no ejecutar nada
    if (!enabled) {
      logInfo('InformePolicial', 'Hook disabled - skipping initialization');
      return;
    }

    const hasAccess = checkAccess();
    if (!hasAccess) return;

    // Cargar tipos y datos iniciales
    loadTiposIPH();
    loadIPHs();
  }, [enabled, checkAccess, loadTiposIPH, loadIPHs]); // Incluir 'enabled' en dependencias

  // Efecto de filtros - escucha TODOS los cambios de filtros
  // NOTA: loadIPHs lee de refs (currentFiltersRef) que se sincronizan antes de este efecto
  useEffect(() => {
    // Si el hook está deshabilitado, no ejecutar
    if (!enabled) {
      return;
    }

    // Cancelar debounce anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Solo aplicar debounce para búsquedas, cargar inmediatamente para otros filtros
    if (state.filters.search && state.filters.search.trim() !== '') {
      // Búsqueda con debounce - detecta cuando el usuario deja de escribir
      debounceTimer.current = setTimeout(() => {
        loadIPHs();
      }, INFORME_POLICIAL_CONFIG.SEARCH_DEBOUNCE_DELAY);
    } else {
      // Sin búsqueda o filtros de ordenamiento/paginación - cargar inmediatamente
      loadIPHs();
    }
  }, [
    enabled,
    state.filters.search,
    state.filters.searchBy,
    state.filters.orderBy,
    state.filters.order,
    state.filters.page,
    state.filters.tipoId,
    loadIPHs
  ]); // ✅ loadIPHs ahora es estable (solo depende de autoRefreshInterval)

  // Efecto de auto-refresh optimizado con setTimeout recursivo
  // ✅ OPTIMIZACIÓN: Usa setTimeout exacto en lugar de setInterval cada segundo
  // Esto reduce el consumo de CPU de 60 checks/minuto a 1 check cada 5 minutos
  useEffect(() => {
    // Si el hook está deshabilitado, limpiar timers y salir
    if (!enabled || !state.autoRefreshEnabled) {
      if (autoRefreshTimer.current) {
        clearTimeout(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
      return;
    }

    const scheduleNextRefresh = () => {
      // Limpiar timeout anterior si existe
      if (autoRefreshTimer.current) {
        clearTimeout(autoRefreshTimer.current);
      }

      // Calcular tiempo exacto hasta el próximo refresh
      const now = Date.now();
      const timeUntilRefresh = Math.max(0, state.nextAutoRefresh - now);

      // Permitir tolerancia de ~5 segundos como indicaste (ajuste para UX)
      // Si el tiempo es muy pequeño (<5s), usar 5s como mínimo
      const adjustedTime = timeUntilRefresh < 5000 ? 5000 : timeUntilRefresh;

      logDebug('InformePolicial', 'Auto-refresh scheduled', {
        timeUntilRefresh: Math.round(adjustedTime / 1000) + 's',
        nextRefreshAt: new Date(state.nextAutoRefresh).toLocaleTimeString()
      });

      // Programar el próximo refresh exactamente cuando debe ocurrir
      autoRefreshTimer.current = setTimeout(() => {
        logInfo('InformePolicial', 'Auto-refresh triggered');
        loadIPHs(false); // Silent refresh

        // Actualizar el timestamp del próximo refresh
        setState(prev => ({
          ...prev,
          nextAutoRefresh: Date.now() + autoRefreshInterval
        }));

        // Programar el siguiente (recursivo)
        scheduleNextRefresh();
      }, adjustedTime);
    };

    scheduleNextRefresh();

    return () => {
      if (autoRefreshTimer.current) {
        clearTimeout(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
    };
  }, [enabled, state.autoRefreshEnabled, state.nextAutoRefresh, autoRefreshInterval, loadIPHs]);

  // Cleanup effect - Limpia todos los timers al desmontar el componente
  useEffect(() => {
    return () => {
      if (autoRefreshTimer.current) {
        clearTimeout(autoRefreshTimer.current); // ✅ Cambiado de clearInterval a clearTimeout
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