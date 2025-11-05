/**
 * Cache Helper Optimizado v2.3.0 - TWO-LEVEL CACHE + ENCRYPTION
 *
 * Helper avanzado para manejo de cache con arquitectura de dos niveles:
 *
 * 📦 L1 CACHE (Memoria - Ultra Rápido):
 * - Map en memoria para acceso O(1)
 * - ~0.1-1ms de latencia
 * - LRU eviction automático
 * - Máximo 100 items por defecto (configurable)
 * - Volátil (se pierde al recargar)
 *
 * 💾 L2 CACHE (Storage - Persistente):
 * - localStorage/sessionStorage
 * - ~5-10ms de latencia (JSON parse/stringify)
 * - Persistente entre recargas
 * - Límite de 5MB por defecto (configurable)
 *
 * 🚀 CARACTERÍSTICAS:
 * - Auto-cleanup de items expirados
 * - Sistema de prioridades (low/normal/high/critical)
 * - Métricas de performance (L1 hits, L2 hits, miss rate)
 * - Gestión de memoria inteligente
 * - Namespaces para organización
 * - Preload de datos
 * - Logging integrado
 * - Método destroy() para prevenir memory leaks
 * - Gestión robusta del ciclo de vida
 * - Safety checks para uso después de destroy
 * - 🔐 Encriptación AES-GCM opcional para datos sensibles
 * - TypeScript strict mode
 * - Backward compatible
 *
 * @author Sistema IPH
 * @version 2.3.0
 *
 * @changelog
 * v2.3.0 (2025-01-31) 🔐 ENCRYPTION SUPPORT
 * - ✅ Encriptación AES-GCM opcional para datos sensibles
 * - ✅ Integración con EncryptHelper existente
 * - ✅ Opción `encrypt: true` en CacheSetOptions
 * - ✅ Desencriptación automática en get()
 * - ✅ Almacenamiento seguro de IV (Initialization Vector)
 * - ✅ Backward compatible (encriptación opt-in)
 *
 * v2.2.0 (2025-01-31) 🚀 TWO-LEVEL CACHE
 * - ✅ Implementado L1 cache en memoria (Map) para performance
 * - ✅ get() ahora busca en L1 primero, luego L2 (90-95% más rápido)
 * - ✅ set() guarda en L1 y L2 simultáneamente
 * - ✅ LRU eviction automático en L1 cuando está lleno
 * - ✅ Promoción automática L2→L1 en cache hits
 * - ✅ Métricas detalladas: l1Hits, l2Hits, hit rates separados
 * - ✅ clearMemoryCache() para limpiar solo L1
 * - ✅ destroy() actualizado para limpiar L1
 * - ✅ Stats mejorados con información de L1 cache
 *
 * v2.1.0 (2025-01-31)
 * - ✅ Agregado método destroy() público para cleanup de recursos
 * - ✅ Prevención de memory leaks en timers de auto-cleanup
 * - ✅ Mejorada gestión del ciclo de vida (initialized/destroyed states)
 * - ✅ Safety checks en métodos get/set para prevenir uso post-destroy
 * - ✅ Documentación extendida con ejemplos de uso en React
 */

import { logInfo, logWarning, logError } from '../log/logger.helper';
import EncryptHelper from '../encrypt/encrypt.helper';

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
  /** Si los datos están encriptados */
  encrypted?: boolean;
  /** IV usado para encriptación (si encrypted es true) */
  encryptionIV?: string;
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
  /** Encriptar los datos antes de guardarlos (recomendado para datos sensibles) */
  encrypt?: boolean;
  /** Metadata adicional */
  metadata?: Record<string, unknown>;
};

/**
 * Estadísticas del cache
 */
export type CacheStats = {
  /** Total de items en cache L2 (storage) */
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
  /** Estadísticas de L1 cache (memoria) */
  l1Cache?: {
    /** Items en L1 cache */
    items: number;
    /** Hits desde L1 */
    hits: number;
    /** Porcentaje de hits desde L1 */
    hitRate: number;
    /** Tamaño máximo configurado */
    maxItems: number;
    /** Uso como porcentaje */
    usage: number;
  };
};

/**
 * Configuración del cache
 */
type CacheConfig = {
  /** Prefijo para las keys */
  prefix: string;
  /** Tamaño máximo del cache L2 (storage) en bytes (default: 5MB) */
  maxSize: number;
  /** Intervalo de auto-cleanup en milisegundos (default: 5 minutos) */
  cleanupInterval: number;
  /** Habilitar auto-cleanup */
  enableAutoCleanup: boolean;
  /** Habilitar logging */
  enableLogging: boolean;
  /** Tiempo de expiración por defecto (1 día) */
  defaultExpiration: number;
  /** Habilitar L1 cache en memoria (default: true) */
  enableMemoryCache: boolean;
  /** Número máximo de items en L1 cache (default: 100) */
  memoryCacheMaxItems: number;
};

// =====================================================
// CACHE HELPER CLASS
// =====================================================

/**
 * Helper optimizado para gestión de cache con arquitectura Two-Level
 *
 * Características:
 * - ✅ Two-Level Cache: L1 (memoria) + L2 (storage)
 * - ✅ Auto-cleanup de items expirados
 * - ✅ Sistema de prioridades para LRU inteligente
 * - ✅ Métricas de performance (L1/L2 hits, miss rate)
 * - ✅ Gestión de memoria con límite configurable
 * - ✅ Namespaces para organización
 * - ✅ Preload de datos
 * - ✅ Logging integrado
 * - ✅ TypeScript strict mode
 * - ✅ Backward compatible con API anterior
 * - ✅ Prevención de memory leaks con método destroy()
 *
 * @example
 * ```typescript
 * // Uso básico (ahora async)
 * await CacheHelper.set('myKey', myData);
 * const data = await CacheHelper.get('myKey'); // ← Busca en L1, luego L2
 *
 * // Uso avanzado con opciones
 * await CacheHelper.set('routeData', data, {
 *   expiresIn: 10 * 60 * 1000, // 10 minutos
 *   priority: 'high',
 *   namespace: 'routes'
 * });
 *
 * // Con encriptación para datos sensibles
 * await CacheHelper.set('creditCard', cardData, {
 *   expiresIn: 5 * 60 * 1000,
 *   priority: 'critical',
 *   namespace: 'user',
 *   encrypt: true // 🔐 Encriptación AES-GCM automática
 * });
 *
 * const card = await CacheHelper.get('creditCard'); // Desencriptación automática
 *
 * // Preload de datos
 * await CacheHelper.preload('userData', fetchUserData);
 *
 * // Ver métricas completas (L1 + L2)
 * const stats = CacheHelper.getStats();
 * console.log(`Hit rate total: ${stats.hitRate}%`);
 * console.log(`L1 hit rate: ${stats.l1Cache?.hitRate}%`);
 * console.log(`L1 usage: ${stats.l1Cache?.usage}%`);
 *
 * // Limpiar solo L1 cache (memoria)
 * CacheHelper.clearMemoryCache();
 *
 * // IMPORTANTE: Cleanup al desmontar (previene memory leaks)
 * // En tu componente raíz de React:
 * useEffect(() => {
 *   return () => CacheHelper.destroy();
 * }, []);
 * ```
 *
 * @performance
 * ```typescript
 * // BENCHMARKS (aproximados):
 * // - L1 Hit: 0.1-1ms (90-95% más rápido que L2)
 * // - L2 Hit: 5-10ms (requiere JSON.parse)
 * // - Miss: 5-10ms (búsqueda en storage)
 *
 * // Ejemplo real: 100 lecturas del mismo dato
 * // SIN L1: 100 * 10ms = 1000ms (1 segundo)
 * // CON L1: 1 * 10ms + 99 * 0.5ms = 59.5ms (94% más rápido)
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
    defaultExpiration: 24 * 60 * 60 * 1000, // 1 día
    enableMemoryCache: true, // L1 cache habilitado por defecto
    memoryCacheMaxItems: 100 // Máximo 100 items en memoria
  };

  // L1 Cache: Memoria (ultra rápido, volátil)
  // Map<cacheKey, CacheItem>
  private static memoryCache = new Map<string, CacheItem<unknown>>();

  // Métricas de performance
  private static metrics = {
    hits: 0, // Total de hits (L1 + L2)
    misses: 0, // Total de misses
    l1Hits: 0, // Hits específicos de L1 (memoria)
    l2Hits: 0, // Hits específicos de L2 (storage)
    lastCleanup: Date.now()
  };

  // Timer para auto-cleanup
  private static cleanupTimer: NodeJS.Timeout | null = null;

  // Inicialización y estado
  private static initialized = false;
  private static destroyed = false;

  /**
   * Inicializa el cache helper con configuración opcional
   * Se llama automáticamente en el primer uso
   *
   * @param config - Configuración personalizada
   *
   * @example
   * ```typescript
   * // Inicialización manual con configuración personalizada
   * CacheHelper.initialize({
   *   maxSize: 10 * 1024 * 1024, // 10MB
   *   enableAutoCleanup: true,
   *   cleanupInterval: 10 * 60 * 1000 // 10 minutos
   * });
   * ```
   */
  static initialize(config?: Partial<CacheConfig>): void {
    // Verificar si fue destruido previamente
    if (this.destroyed) {
      this.log('warn', 'Cache fue destruido previamente. Reinicializando...');
      this.destroyed = false;
    }

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
   * Destruye el cache helper y libera todos los recursos
   *
   * IMPORTANTE: Este método debe ser llamado cuando la aplicación se desmonta
   * o antes de recargar para prevenir memory leaks. Es especialmente crítico
   * en entornos de desarrollo con HMR (Hot Module Replacement).
   *
   * Al destruir el helper:
   * - ✅ Detiene el timer de auto-cleanup (previene memory leak)
   * - ✅ Limpia L1 cache (memoria) completamente
   * - ✅ Resetea las métricas
   * - ✅ Marca el helper como no inicializado
   * - ✅ Permite re-inicialización posterior si es necesario
   *
   * @example
   * ```typescript
   * // En el componente raíz de React
   * import { useEffect } from 'react';
   * import CacheHelper from '@/helper/cache/cache.helper';
   *
   * function App() {
   *   useEffect(() => {
   *     // Cleanup al desmontar
   *     return () => {
   *       CacheHelper.destroy();
   *     };
   *   }, []);
   *
   *   return <YourApp />;
   * }
   * ```
   *
   * @example
   * ```typescript
   * // En tests
   * afterEach(() => {
   *   CacheHelper.destroy();
   * });
   * ```
   */
  static destroy(): void {
    if (this.destroyed) {
      this.log('warn', 'Cache ya fue destruido previamente');
      return;
    }

    // 1. Detener auto-cleanup (previene memory leak)
    this.stopAutoCleanup();

    // 2. Limpiar L1 cache (memoria) - IMPORTANTE para liberar memoria
    const l1Size = this.memoryCache.size;
    this.memoryCache.clear();

    // 3. Resetear métricas
    this.resetMetrics();

    // 4. Marcar como destruido y no inicializado
    this.destroyed = true;
    this.initialized = false;

    this.log('info', 'Cache Helper destruido - recursos liberados', {
      timerStopped: this.cleanupTimer === null,
      l1CacheCleared: l1Size,
      metricsReset: this.metrics.hits === 0 && this.metrics.misses === 0
    });
  }

  /**
   * Verifica si el cache helper está activo y listo para usar
   *
   * @returns true si está inicializado y no destruido
   */
  static isActive(): boolean {
    return this.initialized && !this.destroyed;
  }

  /**
   * Guarda un item en cache (API v2.0 - con opciones)
   *
   * @param key - Clave del cache
   * @param data - Datos a almacenar
   * @param options - Opciones de cache
   * @returns Promise<true> si se guardó exitosamente, Promise<false> en caso contrario
   *
   * @example
   * ```typescript
   * // Sin encriptación (backward compatible)
   * await CacheHelper.set('userData', user, {
   *   expiresIn: 15 * 60 * 1000, // 15 minutos
   *   priority: 'high',
   *   namespace: 'user'
   * });
   *
   * // Con encriptación (datos sensibles)
   * await CacheHelper.set('creditCard', cardData, {
   *   expiresIn: 5 * 60 * 1000, // 5 minutos
   *   priority: 'critical',
   *   namespace: 'user',
   *   encrypt: true // 🔐 Encriptación AES-GCM
   * });
   * ```
   */
  static set<T>(
    key: string,
    data: T,
    options?: CacheSetOptions
  ): Promise<boolean>;

  /**
   * Guarda un item en cache (API v1.0 - backward compatible)
   *
   * @param key - Clave del cache
   * @param data - Datos a almacenar
   * @param expiresInMs - Tiempo de expiración en milisegundos
   * @param useSessionStorage - Si usar sessionStorage
   * @returns Promise<true> si se guardó exitosamente
   */
  static set<T>(
    key: string,
    data: T,
    expiresInMs?: number,
    useSessionStorage?: boolean
  ): Promise<boolean>;

  /**
   * Implementación de set (sobrecarga)
   */
  static async set<T>(
    key: string,
    data: T,
    optionsOrExpiration?: CacheSetOptions | number,
    useSessionStorage?: boolean
  ): Promise<boolean> {
    // Auto-inicializar si no se ha hecho
    if (!this.initialized) {
      this.initialize();
    }

    // Verificar estado (si fue destruido)
    if (!this.checkState()) {
      return false;
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

      // Encriptar datos si se solicita
      let dataToStore: T = data;
      let encryptionIV: string | undefined;
      let isEncrypted = false;

      if (options.encrypt === true) {
        try {
          // Convertir data a string para encriptar
          const dataStr = JSON.stringify(data);

          // Encriptar usando EncryptHelper
          const encryptResult = await EncryptHelper.encryptData(dataStr);

          // Guardar datos encriptados y el IV
          dataToStore = encryptResult.encrypted as T;
          encryptionIV = encryptResult.iv;
          isEncrypted = true;

          this.log('info', `Datos encriptados para "${key}" usando AES-GCM`);
        } catch (error) {
          this.log('error', `Error encriptando datos para "${key}"`, error);
          // Si falla la encriptación, no guardar los datos (seguridad primero)
          return false;
        }
      }

      // Crear item de cache
      const cacheItem: CacheItem<T> = {
        data: dataToStore,
        timestamp: Date.now(),
        expiresIn: options.expiresIn || this.config.defaultExpiration,
        priority: options.priority || 'normal',
        namespace: options.namespace || 'data',
        accessCount: 0,
        lastAccess: Date.now(),
        size,
        encrypted: isEncrypted,
        encryptionIV,
        metadata: options.metadata
      };

      const cacheKey = this.buildKey(key);

      // ========================================
      // PASO 1: Guardar en L1 Cache (Memoria)
      // ========================================
      this.addToMemoryCache(cacheKey, cacheItem);

      // ========================================
      // PASO 2: Guardar en L2 Cache (Storage)
      // ========================================
      const storage = options.useSessionStorage ? sessionStorage : localStorage;
      storage.setItem(cacheKey, JSON.stringify(cacheItem));

      this.log('info', `Cache set: "${key}" (L1 + L2)`, {
        size,
        namespace: cacheItem.namespace,
        priority: cacheItem.priority,
        l1Enabled: this.config.enableMemoryCache
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
   * ARQUITECTURA TWO-LEVEL CACHE:
   * 1. Primero busca en L1 (memoria) - Ultra rápido O(1), ~0.1-1ms
   * 2. Si no está en L1, busca en L2 (storage) - Más lento (JSON parse), ~5-10ms
   * 3. Si encuentra en L2, lo guarda en L1 para próximas lecturas
   * 4. Si los datos están encriptados, los desencripta automáticamente
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
   *
   * // Datos encriptados se desencriptan automáticamente
   * const creditCard = CacheHelper.get<CardData>('creditCard');
   * // creditCard ya está desencriptado y listo para usar
   * ```
   */
  static async get<T>(key: string, useSessionStorage: boolean = false): Promise<T | null> {
    // Auto-inicializar
    if (!this.initialized) {
      this.initialize();
    }

    // Verificar estado (si fue destruido)
    if (!this.checkState()) {
      return null;
    }

    try {
      const cacheKey = this.buildKey(key);
      const now = Date.now();

      // ========================================
      // PASO 1: Buscar en L1 Cache (Memoria)
      // ========================================
      const l1Item = this.getFromMemoryCache<T>(cacheKey);

      if (l1Item) {
        // ✅ L1 HIT - Ultra rápido
        l1Item.accessCount++;
        l1Item.lastAccess = now;

        // Actualizar en L1 con nueva metadata
        this.memoryCache.set(cacheKey, l1Item);

        this.metrics.hits++;
        this.metrics.l1Hits++;

        this.log('info', `L1 Cache hit: "${key}" (${l1Item.accessCount} accesos)`);

        // Desencriptar si es necesario
        if (l1Item.encrypted && l1Item.encryptionIV) {
          try {
            const decryptResult = await EncryptHelper.decryptData({
              encrypted: l1Item.data as string,
              iv: l1Item.encryptionIV,
              algorithm: 'AES-GCM',
              timestamp: l1Item.timestamp
            });

            const decryptedData = JSON.parse(decryptResult.decrypted) as T;
            this.log('info', `Datos desencriptados desde L1: "${key}"`);
            return decryptedData;
          } catch (error) {
            this.log('error', `Error desencriptando desde L1: "${key}"`, error);
            // Si falla la desencriptación, remover item corrupto
            this.remove(key, useSessionStorage);
            this.metrics.misses++;
            return null;
          }
        }

        return l1Item.data;
      }

      // ========================================
      // PASO 2: Buscar en L2 Cache (Storage)
      // ========================================
      const storage = useSessionStorage ? sessionStorage : localStorage;
      const cached = storage.getItem(cacheKey);

      if (!cached) {
        this.metrics.misses++;
        return null;
      }

      // Parse desde storage (operación costosa)
      const cacheItem: CacheItem<T> = JSON.parse(cached);

      // Verificar si ha expirado
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key, useSessionStorage);
        this.metrics.misses++;
        this.log('info', `Cache expired: "${key}"`);
        return null;
      }

      // ✅ L2 HIT - Guardar en L1 para próximas lecturas
      cacheItem.accessCount++;
      cacheItem.lastAccess = now;

      // Promover a L1 (memoria)
      this.addToMemoryCache(cacheKey, cacheItem);

      // Actualizar L2 de forma asíncrona (no bloquea)
      setTimeout(() => {
        storage.setItem(cacheKey, JSON.stringify(cacheItem));
      }, 0);

      this.metrics.hits++;
      this.metrics.l2Hits++;

      this.log('info', `L2 Cache hit: "${key}" → promoted to L1`);

      // Desencriptar si es necesario
      if (cacheItem.encrypted && cacheItem.encryptionIV) {
        try {
          const decryptResult = await EncryptHelper.decryptData({
            encrypted: cacheItem.data as string,
            iv: cacheItem.encryptionIV,
            algorithm: 'AES-GCM',
            timestamp: cacheItem.timestamp
          });

          const decryptedData = JSON.parse(decryptResult.decrypted) as T;
          this.log('info', `Datos desencriptados desde L2: "${key}"`);
          return decryptedData;
        } catch (error) {
          this.log('error', `Error desencriptando desde L2: "${key}"`, error);
          // Si falla la desencriptación, remover item corrupto
          this.remove(key, useSessionStorage);
          this.metrics.misses++;
          return null;
        }
      }

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
    const cached = await this.get<T>(key, options?.useSessionStorage);
    if (cached !== null) {
      return cached;
    }

    // Si no está en cache, ejecutar factory
    const data = await factory();

    // Guardar en cache
    await this.set(key, data, options);

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
      const exists = await this.has(key, options?.useSessionStorage);
      if (exists) {
        this.log('info', `Preload skipped (already cached): "${key}"`);
        return;
      }

      this.log('info', `Preloading: "${key}"`);
      const data = await factory();
      await this.set(key, data, options);
      this.log('info', `Preload complete: "${key}"`);

    } catch (error) {
      this.log('error', `Error en preload: "${key}"`, error);
    }
  }

  /**
   * Elimina un item del cache (L1 y L2)
   *
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage
   */
  static remove(key: string, useSessionStorage: boolean = false): void {
    try {
      const cacheKey = this.buildKey(key);

      // Eliminar de L1 (memoria)
      this.removeFromMemoryCache(cacheKey);

      // Eliminar de L2 (storage)
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.removeItem(cacheKey);

      this.log('info', `Cache removed: "${key}" (L1 + L2)`);
    } catch (error) {
      this.log('error', `Error eliminando cache: "${key}"`, error);
    }
  }

  /**
   * Verifica si un item existe en cache y no ha expirado
   *
   * @param key - Clave del cache
   * @param useSessionStorage - Si usar sessionStorage
   * @returns Promise<true> si existe y es válido
   */
  static async has(key: string, useSessionStorage: boolean = false): Promise<boolean> {
    const result = await this.get(key, useSessionStorage);
    return result !== null;
  }

  /**
   * Limpia todo el cache con el prefijo IPH (L1 y L2)
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
                // Eliminar de L2 (storage)
                storage.removeItem(key);

                // Eliminar de L1 (memoria)
                this.removeFromMemoryCache(key);

                removedCount++;
              }
            }
          } catch {
            // Si hay error parseando, eliminar de ambos
            storage.removeItem(key);
            this.removeFromMemoryCache(key);
            removedCount++;
          }
        } else {
          // Limpiar todo de L2
          storage.removeItem(key);

          // Eliminar de L1
          this.removeFromMemoryCache(key);

          removedCount++;
        }
      });

      // Si no hay namespace específico, limpiar todo L1
      if (!namespace) {
        this.clearMemoryCache();
      }

      this.log('info', `Cache cleared (L1 + L2): ${removedCount} items`, { namespace });

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

      // Calcular hit rate general
      const totalAccesses = this.metrics.hits + this.metrics.misses;
      const hitRate = totalAccesses > 0
        ? Math.round((this.metrics.hits / totalAccesses) * 100 * 100) / 100
        : 0;

      // Calcular estadísticas de L1 cache
      const l1CacheStats = this.config.enableMemoryCache ? {
        items: this.memoryCache.size,
        hits: this.metrics.l1Hits,
        hitRate: this.metrics.hits > 0
          ? Math.round((this.metrics.l1Hits / this.metrics.hits) * 100 * 100) / 100
          : 0,
        maxItems: this.config.memoryCacheMaxItems,
        usage: Math.round((this.memoryCache.size / this.config.memoryCacheMaxItems) * 100 * 100) / 100
      } : undefined;

      return {
        totalItems,
        expiredItems,
        validItems,
        hits: this.metrics.hits,
        misses: this.metrics.misses,
        hitRate,
        totalSize,
        itemsByNamespace,
        itemsByPriority,
        l1Cache: l1CacheStats
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
    this.metrics.l1Hits = 0;
    this.metrics.l2Hits = 0;
    this.log('info', 'Métricas reseteadas');
  }

  /**
   * Limpia completamente el L1 cache (memoria)
   *
   * @example
   * ```typescript
   * CacheHelper.clearMemoryCache();
   * console.log('L1 cache limpiado');
   * ```
   */
  static clearMemoryCache(): void {
    const size = this.memoryCache.size;
    this.memoryCache.clear();
    this.log('info', `L1 cache limpiado: ${size} items removidos`);
  }

  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================

  /**
   * Verifica que el helper esté en estado válido para operar
   * Si fue destruido, loggea una advertencia
   *
   * @returns true si está en estado válido, false si fue destruido
   */
  private static checkState(): boolean {
    if (this.destroyed) {
      this.log('warn', 'Intento de usar CacheHelper después de destroy(). Considera re-inicializar.');
      return false;
    }
    return true;
  }

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
   * Agrega un item al L1 cache (memoria) con LRU eviction
   *
   * Si el cache está lleno, elimina el item menos recientemente usado
   * que no tenga prioridad 'critical'.
   *
   * @param key - Clave del cache (con prefijo)
   * @param item - Item a guardar
   */
  private static addToMemoryCache(key: string, item: CacheItem<unknown>): void {
    if (!this.config.enableMemoryCache) return;

    // Si el cache está lleno, aplicar LRU eviction
    if (this.memoryCache.size >= this.config.memoryCacheMaxItems) {
      // Encontrar el item con menor lastAccess que no sea critical
      let oldestKey: string | null = null;
      let oldestTime = Infinity;

      for (const [k, v] of this.memoryCache.entries()) {
        // No eliminar items críticos
        if (v.priority === 'critical') continue;

        if (v.lastAccess < oldestTime) {
          oldestTime = v.lastAccess;
          oldestKey = k;
        }
      }

      // Eliminar el más antiguo
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
        this.log('info', `L1 eviction: "${oldestKey}" (LRU)`, {
          lastAccess: new Date(oldestTime).toISOString()
        });
      }
    }

    // Agregar el nuevo item
    this.memoryCache.set(key, item);
  }

  /**
   * Obtiene un item del L1 cache (memoria) si existe y no ha expirado
   *
   * @param key - Clave del cache (con prefijo)
   * @returns Item si existe y es válido, null en caso contrario
   */
  private static getFromMemoryCache<T>(key: string): CacheItem<T> | null {
    if (!this.config.enableMemoryCache) return null;

    const item = this.memoryCache.get(key) as CacheItem<T> | undefined;
    if (!item) return null;

    // Verificar expiración
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      // Expirado, remover de L1
      this.memoryCache.delete(key);
      return null;
    }

    return item;
  }

  /**
   * Elimina un item del L1 cache (memoria)
   *
   * @param key - Clave del cache (con prefijo)
   */
  private static removeFromMemoryCache(key: string): void {
    if (this.config.enableMemoryCache) {
      this.memoryCache.delete(key);
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
   *
   * IMPORTANTE: Siempre limpia el timer anterior antes de crear uno nuevo
   * para prevenir múltiples timers activos simultáneamente (memory leak)
   */
  private static startAutoCleanup(): void {
    // CRÍTICO: Siempre limpiar timer anterior antes de crear uno nuevo
    // Esto previene memory leaks si se llama múltiples veces
    if (this.cleanupTimer !== null) {
      this.log('warn', 'Timer de auto-cleanup ya existe, limpiando antes de crear nuevo');
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.cleanupTimer = setInterval(() => {
      this.log('info', 'Auto-cleanup ejecutándose...');
      const removed = this.cleanup(false) + this.cleanup(true);
      if (removed > 0) {
        this.log('info', `Auto-cleanup: ${removed} items eliminados`);
      }
    }, this.config.cleanupInterval);

    this.log('info', `Auto-cleanup iniciado (intervalo: ${this.config.cleanupInterval}ms)`, {
      timerId: this.cleanupTimer
    });
  }

  /**
   * Detiene el timer de auto-cleanup
   *
   * IMPORTANTE: Limpia completamente el timer y resetea la referencia a null
   * para prevenir memory leaks y permitir garbage collection
   */
  private static stopAutoCleanup(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
      this.log('info', 'Auto-cleanup detenido correctamente');
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

    if (level === 'error') {
      logError('CacheHelper', data || new Error(message), message);
    } else if (level === 'warn') {
      logWarning('CacheHelper', message, data);
    } else {
      logInfo('CacheHelper', message, data);
    }
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default CacheHelper;
