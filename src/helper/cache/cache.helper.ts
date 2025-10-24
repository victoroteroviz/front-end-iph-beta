/**
 * Cache Helper Optimizado v2.0.0
 *
 * Helper avanzado para manejo de cache con soporte para:
 * - Auto-cleanup de items expirados
 * - Sistema de prioridades
 * - Métricas de performance (hit/miss rate)
 * - Gestión de memoria inteligente
 * - Namespaces para organización
 * - Preload de datos
 * - Logging integrado
 *
 * @author Sistema IPH
 * @version 2.0.0
 */

import { logInfo, logWarning, logError } from '../log/logger.helper';

// =====================================================
// TYPES Y CONSTANTES
// =====================================================

/**
 * Prioridad de un item en cache
 * - low: Se elimina primero cuando el cache está lleno
 * - normal: Prioridad estándar
 * - high: Se mantiene más tiempo, se elimina solo si es necesario
 * - critical: Nunca se elimina automáticamente
 */
export type CachePriority = 'low' | 'normal' | 'high' | 'critical';

/**
 * Namespace para organizar tipos de cache
 */
export type CacheNamespace = 'routes' | 'data' | 'components' | 'user' | 'system' | 'temp';

/**
 * Item de cache con metadata completa
 */
export type CacheItem<T> = {
  /** Datos almacenados */
  data: T;
  /** Timestamp de creación */
  timestamp: number;
  /** Tiempo de expiración en milisegundos */
  expiresIn: number;
  /** Prioridad del item */
  priority: CachePriority;
  /** Namespace al que pertenece */
  namespace: CacheNamespace;
  /** Número de accesos (para LRU) */
  accessCount: number;
  /** Último acceso */
  lastAccess: number;
  /** Tamaño estimado en bytes */
  size: number;
  /** Metadata adicional opcional */
  metadata?: Record<string, unknown>;
};

/**
 * Opciones para guardar en cache
 */
export type CacheSetOptions = {
  /** Tiempo de expiración en milisegundos */
  expiresIn?: number;
  /** Prioridad del item */
  priority?: CachePriority;
  /** Namespace del item */
  namespace?: CacheNamespace;
  /** Usar sessionStorage en lugar de localStorage */
  useSessionStorage?: boolean;
  /** Metadata adicional */
  metadata?: Record<string, unknown>;
};

/**
 * Estadísticas del cache
 */
export type CacheStats = {
  /** Total de items en cache */
  totalItems: number;
  /** Items expirados */
  expiredItems: number;
  /** Items válidos */
  validItems: number;
  /** Total de hits (aciertos) */
  hits: number;
  /** Total de misses (fallos) */
  misses: number;
  /** Hit rate (porcentaje) */
  hitRate: number;
  /** Tamaño total estimado en bytes */
  totalSize: number;
  /** Items por namespace */
  itemsByNamespace: Record<CacheNamespace, number>;
  /** Items por prioridad */
  itemsByPriority: Record<CachePriority, number>;
};

/**
 * Configuración del cache
 */
type CacheConfig = {
  /** Prefijo para las keys */
  prefix: string;
  /** Tamaño máximo del cache en bytes (default: 5MB) */
  maxSize: number;
  /** Intervalo de auto-cleanup en milisegundos (default: 5 minutos) */
  cleanupInterval: number;
  /** Habilitar auto-cleanup */
  enableAutoCleanup: boolean;
  /** Habilitar logging */
  enableLogging: boolean;
  /** Tiempo de expiración por defecto (1 día) */
  defaultExpiration: number;
};

// =====================================================
// CACHE HELPER CLASS
// =====================================================

/**
 * Helper optimizado para gestión de cache
 *
 * Características:
 * - ✅ Auto-cleanup de items expirados
 * - ✅ Sistema de prioridades para LRU inteligente
 * - ✅ Métricas de performance (hit/miss rate)
 * - ✅ Gestión de memoria con límite configurable
 * - ✅ Namespaces para organización
 * - ✅ Preload de datos
 * - ✅ Logging integrado
 * - ✅ TypeScript strict mode
 * - ✅ Backward compatible con API anterior
 *
 * @example
 * ```typescript
 * // Uso básico (compatible con versión anterior)
 * CacheHelper.set('myKey', myData);
 * const data = CacheHelper.get('myKey');
 *
 * // Uso avanzado con opciones
 * CacheHelper.set('routeData', data, {
 *   expiresIn: 10 * 60 * 1000, // 10 minutos
 *   priority: 'high',
 *   namespace: 'routes'
 * });
 *
 * // Preload de datos
 * await CacheHelper.preload('userData', fetchUserData);
 *
 * // Ver métricas
 * const stats = CacheHelper.getStats();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 * ```
 */
export class CacheHelper {
  // Configuración por defecto
  private static config: CacheConfig = {
    prefix: 'iph_cache_',
    maxSize: 5 * 1024 * 1024, // 5MB
    cleanupInterval: 5 * 60 * 1000, // 5 minutos
    enableAutoCleanup: true,
    enableLogging: true,
    defaultExpiration: 24 * 60 * 60 * 1000 // 1 día
  };

  // Métricas de performance
  private static metrics = {
    hits: 0,
    misses: 0,
    lastCleanup: Date.now()
  };

  // Timer para auto-cleanup
  private static cleanupTimer: NodeJS.Timeout | null = null;

  // Inicialización
  private static initialized = false;

  /**
   * Inicializa el cache helper con configuración opcional
   * Se llama automáticamente en el primer uso
   *
   * @param config - Configuración personalizada
   */
  static initialize(config?: Partial<CacheConfig>): void {
    if (this.initialized) {
      this.log('warn', 'Cache ya inicializado, actualizando configuración');
    }

    // Merge config
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Iniciar auto-cleanup si está habilitado
    if (this.config.enableAutoCleanup) {
      this.startAutoCleanup();
    }

    this.initialized = true;
    this.log('info', 'Cache Helper inicializado', this.config);
  }

  /**
   * Configura el cache helper
   *
   * @param config - Configuración parcial
   */
  static configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };

    // Reiniciar auto-cleanup si cambió la configuración
    if (config.enableAutoCleanup !== undefined || config.cleanupInterval !== undefined) {
      this.stopAutoCleanup();
      if (this.config.enableAutoCleanup) {
        this.startAutoCleanup();
      }
    }
  }

  /**
   * Guarda un item en cache (API v2.0 - con opciones)
   *
   * @param key - Clave del cache
   * @param data - Datos a almacenar
   * @param options - Opciones de cache
   * @returns true si se guardó exitosamente
   *
   * @example
   * ```typescript
   * CacheHelper.set('userData', user, {
   *   expiresIn: 15 * 60 * 1000, // 15 minutos
   *   priority: 'high',
   *   namespace: 'user'
   * });
   * ```
   */
  static set<T>(
    key: string,
    data: T,
    options?: CacheSetOptions
  ): boolean;

  /**
   * Guarda un item en cache (API v1.0 - backward compatible)
   *
   * @param key - Clave del cache
   * @param data - Datos a almacenar
   * @param expiresInMs - Tiempo de expiración en milisegundos
   * @param useSessionStorage - Si usar sessionStorage
   * @returns true si se guardó exitosamente
   */
  static set<T>(
    key: string,
    data: T,
    expiresInMs?: number,
    useSessionStorage?: boolean
  ): boolean;

  /**
   * Implementación de set (sobrecarga)
   */
  static set<T>(
    key: string,
    data: T,
    optionsOrExpiration?: CacheSetOptions | number,
    useSessionStorage?: boolean
  ): boolean {
    // Auto-inicializar si no se ha hecho
    if (!this.initialized) {
      this.initialize();
    }

    try {
      // Parsear opciones (backward compatible)
      let options: CacheSetOptions;

      if (typeof optionsOrExpiration === 'number') {
        // API v1.0 (backward compatible)
        options = {
          expiresIn: optionsOrExpiration,
          useSessionStorage: useSessionStorage || false,
          priority: 'normal',
          namespace: 'data'
        };
      } else {
        // API v2.0
        options = {
          expiresIn: this.config.defaultExpiration,
          priority: 'normal',
          namespace: 'data',
          useSessionStorage: false,
          ...optionsOrExpiration
        };
      }

      // Calcular tamaño estimado
      const size = this.estimateSize(data);

      // Verificar límite de memoria
      if (!this.ensureSpace(size, options.useSessionStorage || false)) {
        this.log('warn', `No hay espacio suficiente en cache para "${key}"`);
        return false;
      }

      // Crear item de cache
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: options.expiresIn || this.config.defaultExpiration,
        priority: options.priority || 'normal',
        namespace: options.namespace || 'data',
        accessCount: 0,
        lastAccess: Date.now(),
        size,
        metadata: options.metadata
      };

      // Guardar en storage
      const storage = options.useSessionStorage ? sessionStorage : localStorage;
      const cacheKey = this.buildKey(key);

      storage.setItem(cacheKey, JSON.stringify(cacheItem));

      this.log('info', `Cache set: "${key}"`, {
        size,
        namespace: cacheItem.namespace,
        priority: cacheItem.priority
      });

      return true;

    } catch (error) {
      this.log('error', `Error guardando en cache: "${key}"`, error);
      return false;
    }
  }

  /**
   * Obtiene un item del cache si no ha expirado
   *
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage
   * @returns Los datos o null si no existe o expiró
   *
   * @example
   * ```typescript
   * const userData = CacheHelper.get<User>('userData');
   * if (userData) {
   *   console.log('Cache hit!', userData);
   * }
   * ```
   */
  static get<T>(key: string, useSessionStorage: boolean = false): T | null {
    // Auto-inicializar
    if (!this.initialized) {
      this.initialize();
    }

    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const cacheKey = this.buildKey(key);

      const cached = storage.getItem(cacheKey);
      if (!cached) {
        this.metrics.misses++;
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Verificar si ha expirado
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key, useSessionStorage);
        this.metrics.misses++;
        this.log('info', `Cache expired: "${key}"`);
        return null;
      }

      // Actualizar metadata de acceso
      cacheItem.accessCount++;
      cacheItem.lastAccess = now;
      storage.setItem(cacheKey, JSON.stringify(cacheItem));

      this.metrics.hits++;
      return cacheItem.data;

    } catch (error) {
      this.log('error', `Error leyendo cache: "${key}"`, error);
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Obtiene un item o ejecuta una función para obtenerlo si no existe
   * (Get or Set pattern)
   *
   * @param key - Clave del cache
   * @param factory - Función para obtener los datos si no están en cache
   * @param options - Opciones de cache
   * @returns Los datos (desde cache o desde factory)
   *
   * @example
   * ```typescript
   * const userData = await CacheHelper.getOrSet(
   *   'userData',
   *   async () => await fetchUserData(),
   *   { expiresIn: 10 * 60 * 1000 }
   * );
   * ```
   */
  static async getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    options?: CacheSetOptions
  ): Promise<T> {
    // Intentar obtener desde cache
    const cached = this.get<T>(key, options?.useSessionStorage);
    if (cached !== null) {
      return cached;
    }

    // Si no está en cache, ejecutar factory
    const data = await factory();

    // Guardar en cache
    this.set(key, data, options);

    return data;
  }

  /**
   * Precarga datos en cache ejecutando una función
   * Útil para cargar datos antes de que se necesiten
   *
   * @param key - Clave del cache
   * @param factory - Función para obtener los datos
   * @param options - Opciones de cache
   * @returns Promise que se resuelve cuando se carga
   *
   * @example
   * ```typescript
   * // Precargar datos del usuario
   * CacheHelper.preload('userData', fetchUserData, {
   *   priority: 'high',
   *   namespace: 'user'
   * });
   * ```
   */
  static async preload<T>(
    key: string,
    factory: () => T | Promise<T>,
    options?: CacheSetOptions
  ): Promise<void> {
    try {
      // Si ya existe y no ha expirado, no hacer nada
      if (this.has(key, options?.useSessionStorage)) {
        this.log('info', `Preload skipped (already cached): "${key}"`);
        return;
      }

      this.log('info', `Preloading: "${key}"`);
      const data = await factory();
      this.set(key, data, options);
      this.log('info', `Preload complete: "${key}"`);

    } catch (error) {
      this.log('error', `Error en preload: "${key}"`, error);
    }
  }

  /**
   * Elimina un item del cache
   *
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage
   */
  static remove(key: string, useSessionStorage: boolean = false): void {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const cacheKey = this.buildKey(key);
      storage.removeItem(cacheKey);
      this.log('info', `Cache removed: "${key}"`);
    } catch (error) {
      this.log('error', `Error eliminando cache: "${key}"`, error);
    }
  }

  /**
   * Verifica si un item existe en cache y no ha expirado
   *
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage
   * @returns true si existe y es válido
   */
  static has(key: string, useSessionStorage: boolean = false): boolean {
    return this.get(key, useSessionStorage) !== null;
  }

  /**
   * Limpia todo el cache con el prefijo IPH
   *
   * @param useSessionStorage - Si usar sessionStorage
   * @param namespace - Opcional: limpiar solo un namespace específico
   */
  static clear(useSessionStorage: boolean = false, namespace?: CacheNamespace): void {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      let removedCount = 0;

      keys.forEach(key => {
        if (namespace) {
          // Si se especifica namespace, verificar que coincida
          try {
            const cached = storage.getItem(key);
            if (cached) {
              const item: CacheItem<unknown> = JSON.parse(cached);
              if (item.namespace === namespace) {
                storage.removeItem(key);
                removedCount++;
              }
            }
          } catch {
            // Si hay error parseando, eliminar
            storage.removeItem(key);
            removedCount++;
          }
        } else {
          // Limpiar todo
          storage.removeItem(key);
          removedCount++;
        }
      });

      this.log('info', `Cache cleared: ${removedCount} items`, { namespace });

    } catch (error) {
      this.log('error', 'Error limpiando cache', error);
    }
  }

  /**
   * Limpia items expirados del cache (manual)
   *
   * @param useSessionStorage - Si usar sessionStorage
   * @returns Número de items eliminados
   */
  static cleanup(useSessionStorage: boolean = false): number {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      let removedCount = 0;
      const now = Date.now();

      keys.forEach(key => {
        try {
          const cached = storage.getItem(key);
          if (!cached) return;

          const cacheItem: CacheItem<unknown> = JSON.parse(cached);

          // Verificar si expiró
          if (now - cacheItem.timestamp > cacheItem.expiresIn) {
            storage.removeItem(key);
            removedCount++;
          }
        } catch {
          // Si hay error parseando, eliminar
          storage.removeItem(key);
          removedCount++;
        }
      });

      this.metrics.lastCleanup = now;

      if (removedCount > 0) {
        this.log('info', `Cleanup completed: ${removedCount} items removed`);
      }

      return removedCount;

    } catch (error) {
      this.log('error', 'Error en cleanup', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas completas del cache
   *
   * @param useSessionStorage - Si usar sessionStorage
   * @returns Estadísticas del cache
   */
  static getStats(useSessionStorage: boolean = false): CacheStats {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      let totalItems = keys.length;
      let expiredItems = 0;
      let validItems = 0;
      let totalSize = 0;

      const itemsByNamespace: Record<CacheNamespace, number> = {
        routes: 0,
        data: 0,
        components: 0,
        user: 0,
        system: 0,
        temp: 0
      };

      const itemsByPriority: Record<CachePriority, number> = {
        low: 0,
        normal: 0,
        high: 0,
        critical: 0
      };

      const now = Date.now();

      keys.forEach(key => {
        try {
          const cached = storage.getItem(key);
          if (!cached) return;

          const cacheItem: CacheItem<unknown> = JSON.parse(cached);

          // Contar por namespace
          itemsByNamespace[cacheItem.namespace]++;

          // Contar por prioridad
          itemsByPriority[cacheItem.priority]++;

          // Sumar tamaño
          totalSize += cacheItem.size || 0;

          // Verificar expiración
          if (now - cacheItem.timestamp > cacheItem.expiresIn) {
            expiredItems++;
          } else {
            validItems++;
          }
        } catch {
          expiredItems++;
        }
      });

      // Calcular hit rate
      const totalAccesses = this.metrics.hits + this.metrics.misses;
      const hitRate = totalAccesses > 0
        ? Math.round((this.metrics.hits / totalAccesses) * 100 * 100) / 100
        : 0;

      return {
        totalItems,
        expiredItems,
        validItems,
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate,
        totalSize,
        itemsByNamespace,
        itemsByPriority
      };

    } catch (error) {
      this.log('error', 'Error obteniendo estadísticas', error);

      return {
        totalItems: 0,
        expiredItems: 0,
        validItems: 0,
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate: 0,
        totalSize: 0,
        itemsByNamespace: {
          routes: 0,
          data: 0,
          components: 0,
          user: 0,
          system: 0,
          temp: 0
        },
        itemsByPriority: {
          low: 0,
          normal: 0,
          high: 0,
          critical: 0
        }
      };
    }
  }

  /**
   * Resetea las métricas de performance
   */
  static resetMetrics(): void {
    this.metrics.hits = 0;
    this.metrics.misses = 0;
    this.log('info', 'Métricas reseteadas');
  }

  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================

  /**
   * Construye la key completa con prefijo
   */
  private static buildKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  /**
   * Estima el tamaño en bytes de un objeto
   */
  private static estimateSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Asegura que hay espacio suficiente en cache
   * Si no hay espacio, elimina items de menor prioridad (LRU)
   */
  private static ensureSpace(requiredSize: number, useSessionStorage: boolean): boolean {
    const stats = this.getStats(useSessionStorage);

    // Si hay espacio, ok
    if (stats.totalSize + requiredSize <= this.config.maxSize) {
      return true;
    }

    // Intentar limpiar expirados primero
    this.cleanup(useSessionStorage);

    // Verificar de nuevo
    const newStats = this.getStats(useSessionStorage);
    if (newStats.totalSize + requiredSize <= this.config.maxSize) {
      return true;
    }

    // Si aún no hay espacio, eliminar items de baja prioridad (LRU)
    this.log('warn', 'Cache lleno, eliminando items de baja prioridad');
    return this.evictLRU(requiredSize, useSessionStorage);
  }

  /**
   * Elimina items usando estrategia LRU (Least Recently Used)
   * Prioriza eliminar items de baja prioridad y menos accedidos
   */
  private static evictLRU(requiredSize: number, useSessionStorage: boolean): boolean {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      // Obtener todos los items con metadata
      const items = keys.map(key => {
        try {
          const cached = storage.getItem(key);
          if (!cached) return null;

          const item = JSON.parse(cached);
          return { key, item };
        } catch {
          return null;
        }
      }).filter(Boolean) as Array<{ key: string; item: CacheItem<unknown> }>;

      // Ordenar por prioridad (low primero) y luego por último acceso
      const priorityOrder: Record<CachePriority, number> = {
        low: 0,
        normal: 1,
        high: 2,
        critical: 999 // Nunca eliminar critical
      };

      items.sort((a, b) => {
        const priorityDiff = priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Mismo priority, ordenar por último acceso (LRU)
        return a.item.lastAccess - b.item.lastAccess;
      });

      // Eliminar items hasta tener espacio
      let freedSpace = 0;
      let removedCount = 0;

      for (const { key, item } of items) {
        if (item.priority === 'critical') break; // No eliminar critical

        storage.removeItem(key);
        freedSpace += item.size || 0;
        removedCount++;

        if (freedSpace >= requiredSize) {
          this.log('info', `Evicted ${removedCount} items (LRU), freed ${freedSpace} bytes`);
          return true;
        }
      }

      // Si llegamos aquí, no pudimos liberar suficiente espacio
      this.log('warn', `No se pudo liberar espacio suficiente (required: ${requiredSize}, freed: ${freedSpace})`);
      return false;

    } catch (error) {
      this.log('error', 'Error en evictLRU', error);
      return false;
    }
  }

  /**
   * Inicia el timer de auto-cleanup
   */
  private static startAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.log('info', 'Auto-cleanup ejecutándose...');
      const removed = this.cleanup(false) + this.cleanup(true);
      if (removed > 0) {
        this.log('info', `Auto-cleanup: ${removed} items eliminados`);
      }
    }, this.config.cleanupInterval);

    this.log('info', `Auto-cleanup iniciado (intervalo: ${this.config.cleanupInterval}ms)`);
  }

  /**
   * Detiene el timer de auto-cleanup
   */
  private static stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      this.log('info', 'Auto-cleanup detenido');
    }
  }

  /**
   * Helper para logging centralizado
   */
  private static log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: unknown
  ): void {
    if (!this.config.enableLogging) return;

    const logFn = level === 'info' ? logInfo : level === 'warn' ? logWarning : logError;
    logFn('CacheHelper', message, data);
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default CacheHelper;
