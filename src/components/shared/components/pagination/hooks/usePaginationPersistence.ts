/**
 * Hook usePaginationPersistence - Persistencia automática de estado de paginación
 *
 * @description
 * Custom hook reutilizable que proporciona persistencia automática del estado de paginación
 * usando sessionStorage. Permite que el usuario mantenga su posición en la paginación
 * al navegar entre vistas, abrir modales, o refrescar componentes.
 *
 * **Características:**
 * - ✅ Persistencia automática en sessionStorage
 * - ✅ Restauración automática al montar el componente
 * - ✅ Validación de datos con seguridad de tipos
 * - ✅ Logging detallado para debugging
 * - ✅ Limpieza automática de datos obsoletos
 * - ✅ API simple y intuitiva
 * - ✅ Completamente tipado con TypeScript
 * - ✅ Zero dependencies (solo React)
 *
 * @version 1.0.0
 * @since 2025-01-31
 * @author Claude Code - Senior Software Engineer
 *
 * @example
 * ```typescript
 * // Uso básico en un componente
 * const MyComponent = () => {
 *   const {
 *     currentPage,
 *     setCurrentPage,
 *     resetPagination,
 *     clearPersistence
 *   } = usePaginationPersistence({
 *     key: 'my-component-pagination',
 *     itemsPerPage: 10
 *   });
 *
 *   return (
 *     <Pagination
 *       currentPage={currentPage}
 *       totalPages={totalPages}
 *       onPageChange={setCurrentPage}
 *     />
 *   );
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Uso en un hook personalizado (como useHistorialIPH)
 * export const useHistorialIPH = (params) => {
 *   const {
 *     currentPage,
 *     setCurrentPage,
 *     resetPagination
 *   } = usePaginationPersistence({
 *     key: 'historial-iph-pagination',
 *     itemsPerPage: params.itemsPerPage,
 *     logging: true
 *   });
 *
 *   // Usar currentPage y setCurrentPage en lugar de useState local
 *   // ...resto de la lógica
 * };
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logInfo, logDebug, logWarning, logError } from '../../../../../helper/log/logger.helper';

// ==================== INTERFACES ====================

/**
 * Configuración del hook usePaginationPersistence
 */
export interface UsePaginationPersistenceConfig {
  /**
   * Clave única para identificar la paginación en sessionStorage
   * Debe ser única por componente/vista
   *
   * @example 'historial-iph-pagination'
   * @example 'usuarios-table-pagination'
   */
  key: string;

  /**
   * Número de items por página
   * Usado para validar y restaurar la paginación correctamente
   *
   * @default 10
   */
  itemsPerPage?: number;

  /**
   * Página inicial si no hay nada guardado
   *
   * @default 1
   */
  initialPage?: number;

  /**
   * Habilitar logging detallado para debugging
   * Útil durante desarrollo para ver el flujo de persistencia
   *
   * @default false
   */
  logging?: boolean;

  /**
   * Tiempo de vida de la paginación guardada en milisegundos
   * Después de este tiempo, se considera obsoleta y se elimina
   *
   * @default 3600000 (1 hora)
   */
  ttl?: number;
}

/**
 * Valor retornado por el hook usePaginationPersistence
 */
export interface UsePaginationPersistenceReturn {
  /**
   * Página actual (1-indexed)
   */
  currentPage: number;

  /**
   * Función para cambiar la página actual
   * Automáticamente persiste en sessionStorage
   *
   * @param page - Nueva página (1-indexed)
   */
  setCurrentPage: (page: number) => void;

  /**
   * Resetea la paginación a la página inicial
   * Útil al limpiar filtros o recargar datos
   */
  resetPagination: () => void;

  /**
   * Limpia completamente la persistencia de sessionStorage
   * Útil al desmontar componente o cambiar de vista
   */
  clearPersistence: () => void;

  /**
   * Indica si la paginación fue restaurada desde sessionStorage
   * Útil para mostrar feedback al usuario
   */
  wasRestored: boolean;
}

/**
 * Estructura de datos guardada en sessionStorage
 */
interface PersistedPaginationData {
  /** Página guardada */
  page: number;
  /** Items por página */
  limit: number;
  /** Timestamp de cuando se guardó */
  timestamp: number;
  /** Versión del formato de datos (para migraciones futuras) */
  version: number;
}

// ==================== CONSTANTES ====================

/**
 * Configuración por defecto del hook
 */
const DEFAULT_CONFIG = {
  itemsPerPage: 10,
  initialPage: 1,
  logging: false,
  ttl: 3600000 // 1 hora
} as const;

/**
 * Versión actual del formato de datos persistidos
 * Incrementar si cambia la estructura de PersistedPaginationData
 */
const CURRENT_DATA_VERSION = 1;

/**
 * Prefijo para las claves de sessionStorage
 * Ayuda a identificar y limpiar datos relacionados con paginación
 */
const STORAGE_KEY_PREFIX = 'pagination:';

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Construye la clave completa de sessionStorage
 *
 * @param key - Clave base proporcionada por el usuario
 * @returns Clave completa con prefijo
 */
const buildStorageKey = (key: string): string => {
  return `${STORAGE_KEY_PREFIX}${key}`;
};

/**
 * Valida que los datos restaurados sean válidos
 *
 * @param data - Datos a validar
 * @param ttl - Tiempo de vida máximo en ms
 * @returns true si los datos son válidos
 */
const isValidPersistedData = (
  data: any,
  ttl: number
): data is PersistedPaginationData => {
  // Validar estructura
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Validar campos requeridos
  if (
    typeof data.page !== 'number' ||
    typeof data.limit !== 'number' ||
    typeof data.timestamp !== 'number' ||
    typeof data.version !== 'number'
  ) {
    return false;
  }

  // Validar valores lógicos
  if (data.page < 1 || data.limit < 1) {
    return false;
  }

  // Validar versión (por ahora solo hay v1)
  if (data.version !== CURRENT_DATA_VERSION) {
    return false;
  }

  // Validar TTL
  const now = Date.now();
  const age = now - data.timestamp;
  if (age > ttl) {
    return false; // Datos obsoletos
  }

  return true;
};

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook para persistencia automática de paginación en sessionStorage
 *
 * @param config - Configuración del hook
 * @returns Estado y acciones de paginación con persistencia
 *
 * @example
 * ```typescript
 * const { currentPage, setCurrentPage, resetPagination } = usePaginationPersistence({
 *   key: 'historial-iph-pagination',
 *   itemsPerPage: 10,
 *   logging: true
 * });
 * ```
 */
export const usePaginationPersistence = (
  config: UsePaginationPersistenceConfig
): UsePaginationPersistenceReturn => {
  // ==================== CONFIGURACIÓN ====================

  const {
    key,
    itemsPerPage = DEFAULT_CONFIG.itemsPerPage,
    initialPage = DEFAULT_CONFIG.initialPage,
    logging = DEFAULT_CONFIG.logging,
    ttl = DEFAULT_CONFIG.ttl
  } = config;

  // Construir clave de storage
  const storageKey = buildStorageKey(key);

  // ==================== ESTADO ====================

  /**
   * Estado local de la página actual
   * Inicializado mediante función lazy para restaurar desde storage
   */
  const [currentPage, setCurrentPageState] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);

      if (!stored) {
        if (logging) {
          logDebug('usePaginationPersistence', 'No hay paginación guardada, usando página inicial', {
            key,
            initialPage
          });
        }
        return initialPage;
      }

      const parsed: unknown = JSON.parse(stored);

      // Validar datos restaurados
      if (!isValidPersistedData(parsed, ttl)) {
        if (logging) {
          logWarning('usePaginationPersistence', 'Datos de paginación inválidos o obsoletos, usando página inicial', {
            key,
            datosRecibidos: parsed
          });
        }
        // Limpiar datos inválidos
        sessionStorage.removeItem(storageKey);
        return initialPage;
      }

      // Validar que el limit coincida (previene errores al cambiar itemsPerPage)
      if (parsed.limit !== itemsPerPage) {
        if (logging) {
          logWarning('usePaginationPersistence', 'Items por página cambió, reseteando paginación', {
            key,
            limitGuardado: parsed.limit,
            limitActual: itemsPerPage
          });
        }
        sessionStorage.removeItem(storageKey);
        return initialPage;
      }

      if (logging) {
        logInfo('usePaginationPersistence', '✅ Paginación RESTAURADA exitosamente desde sessionStorage', {
          key,
          pageRestaurada: parsed.page,
          limit: parsed.limit,
          timestamp: new Date(parsed.timestamp).toISOString(),
          edadDatos: `${Math.floor((Date.now() - parsed.timestamp) / 1000)}s`
        });
      }

      return parsed.page;

    } catch (error) {
      logError('usePaginationPersistence', error, `Error al restaurar paginación para key: ${key}`);
      return initialPage;
    }
  });

  /**
   * Flag para indicar si la paginación fue restaurada
   */
  const [wasRestored] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) return false;

      const parsed: unknown = JSON.parse(stored);
      return isValidPersistedData(parsed, ttl) && parsed.limit === itemsPerPage;
    } catch {
      return false;
    }
  });

  /**
   * Ref para prevenir logging en el primer render
   */
  const isFirstRender = useRef(true);

  // ==================== EFECTOS ====================

  /**
   * Efecto para persistir cambios de paginación en sessionStorage
   *
   * IMPORTANTE: Se ejecuta en CADA cambio de currentPage o itemsPerPage
   * para mantener sessionStorage sincronizado, excepto en el primer render
   * donde ya se cargó el valor inicial desde storage.
   */
  useEffect(() => {
    // No guardar en el primer render (ya se cargó desde storage)
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (logging) {
        logDebug('usePaginationPersistence', 'Primer render - omitiendo guardado', {
          key,
          currentPage,
          razon: 'Valor inicial ya cargado desde storage o configuración inicial'
        });
      }
      return;
    }

    // Guardar en sessionStorage en cada cambio subsecuente
    try {
      const dataToSave: PersistedPaginationData = {
        page: currentPage,
        limit: itemsPerPage,
        timestamp: Date.now(),
        version: CURRENT_DATA_VERSION
      };

      sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));

      if (logging) {
        logInfo('usePaginationPersistence', '✅ Paginación guardada en sessionStorage', {
          key,
          page: currentPage,
          limit: itemsPerPage,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logError('usePaginationPersistence', error, `Error al guardar paginación para key: ${key}`);
    }
  }, [currentPage, itemsPerPage, storageKey, key, logging]);

  /**
   * Efecto de limpieza al desmontar el componente
   * OPCIONAL: Comentar si se quiere que persista entre montajes
   */
  useEffect(() => {
    return () => {
      if (logging) {
        logDebug('usePaginationPersistence', 'Hook desmontado (paginación persistida)', { key });
      }
      // NO limpiar sessionStorage aquí para permitir persistencia entre navegaciones
    };
  }, [key, logging]);

  // ==================== ACCIONES ====================

  /**
   * Actualiza la página actual con validación
   */
  const setCurrentPage = useCallback((page: number) => {
    // Validar entrada
    if (!Number.isInteger(page) || page < 1) {
      logWarning('usePaginationPersistence', 'Intento de establecer página inválida', {
        key,
        pageRecibida: page
      });
      return;
    }

    if (logging) {
      logInfo('usePaginationPersistence', 'Cambiando página', {
        key,
        paginaAnterior: currentPage,
        paginaNueva: page
      });
    }

    setCurrentPageState(page);
  }, [key, logging, currentPage]);

  /**
   * Resetea la paginación a la página inicial
   */
  const resetPagination = useCallback(() => {
    if (logging) {
      logInfo('usePaginationPersistence', 'Reseteando paginación a página inicial', {
        key,
        paginaAnterior: currentPage,
        paginaInicial: initialPage
      });
    }

    setCurrentPageState(initialPage);
  }, [key, logging, currentPage, initialPage]);

  /**
   * Limpia completamente la persistencia de sessionStorage
   */
  const clearPersistence = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);

      if (logging) {
        logInfo('usePaginationPersistence', 'Persistencia limpiada de sessionStorage', {
          key
        });
      }
    } catch (error) {
      logError('usePaginationPersistence', error, `Error al limpiar persistencia para key: ${key}`);
    }
  }, [storageKey, key, logging]);

  // ==================== RETURN ====================

  return {
    currentPage,
    setCurrentPage,
    resetPagination,
    clearPersistence,
    wasRestored
  };
};

// ==================== EXPORTS ====================

export default usePaginationPersistence;

/**
 * Utilidad para limpiar todas las paginaciones persistidas
 * Útil para limpieza global o logout
 */
export const clearAllPaginationPersistence = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    const paginationKeys = keys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));

    paginationKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    logInfo('usePaginationPersistence', 'Todas las paginaciones persistidas han sido limpiadas', {
      cantidadLimpiada: paginationKeys.length
    });
  } catch (error) {
    logError('usePaginationPersistence', error, 'Error al limpiar todas las paginaciones persistidas');
  }
};
