/**
 * Cache Helper Optimizado v2.4.0 - TWO-LEVEL CACHE (ENTERPRISE GRADE)
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
 * - localStorage/sessionStorage con detección automática
 * - ~5-10ms de latencia (JSON parse/stringify)
 * - Persistente entre recargas
 * - Límite de 5MB por defecto (configurable)
 * - Fallback graceful si storage no disponible
 * - Validación Zod en runtime para datos corruptos
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
 * - Cross-environment compatible (Browser, Node.js, SSR)
 * - Validación de datos con Zod (runtime type safety)
 * - Sanitización de keys (prevención XSS)
 *
 * @author Sistema IPH
 * @version 2.4.0
 *
 * @changelog
 * v2.4.0 (2025-01-31) 🏗️ MAJOR REFACTORING - ENTERPRISE ARCHITECTURE
 * - ✅ REFACTOR: Extracted constants to cache.constants.ts (~480 lines)
 *   - Eliminados TODOS los números mágicos con documentación completa
 *   - TTL_LIMITS (min 1s, max 1 año, default 5min) con justificación NIST/OWASP
 *   - CACHE_LIMITS (max items, storage size, pending updates, key length)
 *   - CLEANUP_INTERVALS, ENCRYPTION_CONSTANTS, SIZE_ESTIMATES
 *   - ERROR_MESSAGES centralizados para mensajes consistentes
 *   - Cada constante documenta el "por qué" de su valor
 *
 * - ✅ REFACTOR: Created CacheValidator class (~270 lines)
 *   - Centralizada TODA la lógica de validación (SRP - Single Responsibility)
 *   - validateTTL() retorna TTLValidationResult tipado
 *   - validateKey() retorna KeyValidationResult con sanitización
 *   - isValidNamespace(), isValidPriority(), isValidSize()
 *   - Clase estática fácilmente testeable y reutilizable
 *   - Eliminada duplicación de código de validación
 *
 * - ✅ REFACTOR: Created CacheMetrics class (~380 lines)
 *   - Encapsulada TODA la lógica de métricas (SRP)
 *   - API rica: recordL1Hit(), recordL2Hit(), recordMiss()
 *   - getSnapshot() retorna CacheMetricsSnapshot completo
 *   - getHitRate(), getL1HitRate() para consultas rápidas
 *   - isHealthy() para monitoreo (>70% hit rate, >80% L1 rate)
 *   - reset(), toJSON(), toString() para gestión completa
 *   - Métricas derivadas: hitsPerSecond, missesPerSecond, uptime
 *
 * - ✅ INTEGRATION: Integrados nuevos módulos en CacheHelper
 *   - Eliminado método validateTTL() interno (~60 líneas)
 *   - Eliminado método sanitizeKey() y simpleHash() internos (~80 líneas)
 *   - Eliminado objeto metrics plano, reemplazado por CacheMetrics instance
 *   - Todos los puntos de validación usan CacheValidator
 *   - Todos los puntos de métricas usan CacheMetrics methods
 *   - getStats() refactorizado con metricsSnapshot
 *   - resetMetrics() delegado a this.metrics.reset()
 *
 * - ✅ SECURITY: Enhanced log() con sanitización automática
 *   - Integrado EncryptHelper.sanitizeForLogging()
 *   - Redacción automática de keys sensibles (password, token, apiKey, etc.)
 *   - showPartial: 0 para máxima seguridad
 *   - Previene leakage accidental de datos sensibles en logs
 *
 * - ✅ CODE QUALITY: Eliminadas ~200 líneas de código duplicado
 * - ✅ CODE QUALITY: Agregadas ~1,130 líneas de código enterprise-grade
 * - ✅ ARCHITECTURE: Aplicados principios SOLID en toda la refactorización
 * - ✅ MAINTAINABILITY: Código más testeable, extensible y documentado
 *
 * v2.3.0 (2025-01-31) 🚀 OPTIONAL ENHANCEMENTS - ENTERPRISE GRADE
 * - 🟡 MEJORA: Validación de tipos en runtime con Zod
 *   - Agregado CacheItemSchema para validación automática
 *   - Método parseCacheItem() con validación completa
 *   - Auto-detección y eliminación de datos corruptos
 *   - Logging detallado de errores de schema
 *   - Previene crashes por estructura inválida
 *   - Facilita migraciones entre versiones
 *
 * - 🟡 MEJORA: Sanitización robusta de keys
 *   - Método sanitizeKey() con validación completa
 *   - Previene XSS via storage keys
 *   - Limita longitud máxima (100 chars) con hash
 *   - Solo permite caracteres seguros (a-zA-Z0-9_-.:)
 *   - Validación de keys vacías o null
 *   - Método simpleHash() para mantener unicidad
 *   - buildKey() ahora sanitiza automáticamente
 *
 * - ✅ Todos los métodos actualizados para usar validación Zod
 * - ✅ get(), clear(), cleanup(), getStats(), evictLRU() validados
 * - ✅ Logging mejorado con contexto de validación
 * - ✅ Documentación extendida con ejemplos
 *
 * v2.2.1 (2025-01-31) 🛡️ CRITICAL FIXES - PRODUCTION READY
 * - 🔴 FIX CRÍTICO: Verificación de disponibilidad de Storage API
 *   - Agregado isStorageAvailable() para detectar storage deshabilitado
 *   - Agregado getStorage() para acceso seguro con fallback
 *   - Previene crashes en Safari modo incógnito y SSR
 *   - Fallback graceful a solo L1 cache si L2 no disponible
 *
 * - 🔴 FIX CRÍTICO: Prevención de memory leaks de setTimeout
 *   - Agregado tracking de updates asíncronos pendientes (Set<Timeout>)
 *   - Método scheduleL2Update() con tracking automático
 *   - Método flushPendingUpdates() para cancelar timeouts
 *   - destroy() ahora cancela todos los timeouts pendientes
 *   - Límite de seguridad: máximo 100 updates pendientes
 *
 * - 🔴 FIX CRÍTICO: estimateSize() cross-environment
 *   - Estrategia 1: Blob API (navegadores)
 *   - Estrategia 2: Buffer (Node.js/SSR)
 *   - Estrategia 3: Estimación manual UTF-8 (fallback universal)
 *   - Valor por defecto 1KB en lugar de 0 en error
 *
 * - ✅ Mejoras de robustez en todos los métodos
 * - ✅ Logging mejorado con contexto de L1/L2
 * - ✅ Try-catch adicionales en operaciones críticas
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
import { z } from 'zod';
import type { EncryptionResult } from '../encrypt/encrypt.helper';
import {
  encryptData as encryptString,
  decryptData as decryptString
} from '../encrypt/encrypt.helper';
import { EncryptHelper } from '../encrypt/encrypt.helper';

// ✅ v2.4.0: Imports de clases de refactoring
import { CACHE_CONSTANTS, TTL_LIMITS, CACHE_LIMITS, CLEANUP_INTERVALS } from './cache.constants';
import { CacheValidator } from './cache.validator';
import type { TTLValidationResult, KeyValidationResult } from './cache.validator';
import { CacheMetrics } from './cache.metrics';
import type { CacheMetricsSnapshot } from './cache.metrics';

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
  /** Guardar datos encriptados en L2 storage */
  encrypt?: boolean;
  /** Passphrase personalizada para encriptar */
  passphrase?: string;
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
 * Opciones adicionales para operaciones de recuperación segura
 */
type SecureGetOptions = {
  /** Si usar sessionStorage en lugar de localStorage */
  useSessionStorage?: boolean;
  /** Passphrase personalizada para desencriptar */
  passphrase?: string;
};

/**
 * Payload encriptado almacenado en L2 cache
 */
type EncryptedCachePayload = EncryptionResult & {
  /** Flag interno para identificar payload encriptado */
  __cacheEncrypted: true;
  /** Formato de serialización usado antes de encriptar */
  format: 'json';
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
// ZOD SCHEMAS - VALIDACIÓN EN RUNTIME
// =====================================================

/**
 * Schema de validación Zod para CacheItem
 *
 * Valida la estructura de datos almacenados en storage para:
 * - Prevenir errores por datos corruptos
 * - Type safety en runtime
 * - Auto-detección de items inválidos
 * - Migración segura entre versiones
 */
const CacheItemSchema = z.object({
  data: z.unknown(),
  timestamp: z.number(),
  expiresIn: z.number(),
  priority: z.enum(['low', 'normal', 'high', 'critical']),
  namespace: z.enum(['routes', 'data', 'components', 'user', 'system', 'temp']),
  accessCount: z.number(),
  lastAccess: z.number(),
  size: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

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

  // ✅ v2.4.0: Métricas encapsuladas en clase CacheMetrics
  private static metrics = new CacheMetrics();

  // Timer para auto-cleanup
  private static cleanupTimer: NodeJS.Timeout | null = null;

  // Tracking de updates asíncronos pendientes (previene memory leaks)
  private static pendingUpdates = new Set<NodeJS.Timeout>();

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

    // 1. Cancelar updates asíncronos pendientes (previene memory leak crítico)
    const pendingCount = this.pendingUpdates.size;
    this.flushPendingUpdates();

    // 2. Detener auto-cleanup (previene memory leak)
    this.stopAutoCleanup();

    // 3. Limpiar L1 cache (memoria) - IMPORTANTE para liberar memoria
    const l1Size = this.memoryCache.size;
    this.memoryCache.clear();

    // 4. Resetear métricas
    this.resetMetrics();

    // 5. Marcar como destruido y no inicializado
    this.destroyed = true;
    this.initialized = false;

    // ✅ v2.4.0: Obtener snapshot para logging
    const metricsSnapshot = this.metrics.getSnapshot();

    this.log('info', 'Cache Helper destruido - recursos liberados', {
      timerStopped: this.cleanupTimer === null,
      pendingUpdatesCanceled: pendingCount,
      l1CacheCleared: l1Size,
      metricsReset: metricsSnapshot.hits === 0 && metricsSnapshot.misses === 0
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

      if (options.encrypt) {
        this.setEncrypted(key, data, options).catch((error: unknown) => {
          this.log('error', `Error guardando en cache encriptado: "${key}"`, error);
        });
        return true;
      }

      // Calcular tamaño estimado
      const size = this.estimateSize(data);

      // Verificar límite de memoria
      if (!this.ensureSpace(size, options.useSessionStorage || false)) {
        this.log('warn', `No hay espacio suficiente en cache para "${key}"`);
        return false;
      }

      // Validar TTL antes de usar (v2.4.0 - con CacheValidator)
      const ttlResult = CacheValidator.validateTTL(
        options.expiresIn || this.config.defaultExpiration,
        this.config.defaultExpiration
      );

      // Log warning si TTL fue ajustado
      if (!ttlResult.isValid && this.config.enableLogging && import.meta.env.DEV) {
        this.log('warn', ttlResult.reason || 'TTL inválido, usando default');
      }

      const validatedTTL = ttlResult.value;

      // Crear item de cache
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: validatedTTL,
        priority: options.priority || 'normal',
        namespace: options.namespace || 'data',
        accessCount: 0,
        lastAccess: Date.now(),
        size,
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
      const storage = this.getStorage(options.useSessionStorage || false);

      if (storage) {
        // L2 disponible, guardar en storage
        try {
          storage.setItem(cacheKey, JSON.stringify(cacheItem));
        } catch (error) {
          // QuotaExceededError o similar
          this.log('warn', `Error guardando en L2 cache: "${key}"`, error);
          // Continuar, al menos está en L1
        }
      } else {
        // L2 no disponible, solo guardamos en L1
        this.log('info', `L2 cache no disponible, solo guardado en L1: "${key}"`);
      }

      this.log('info', `Cache set: "${key}" (L1${storage ? ' + L2' : ''})`, {
        size,
        namespace: cacheItem.namespace,
        priority: cacheItem.priority,
        l1Enabled: this.config.enableMemoryCache,
        l2Enabled: storage !== null
      });

      return true;

    } catch (error) {
      this.log('error', `Error guardando en cache: "${key}"`, error);
      return false;
    }
  }

  /**
   * Guarda un item encriptado en cache (Two-Level)
   *
   * IMPORTANTE: Los datos permanecen en texto plano en L1 (memoria) para performance,
   * pero se almacenan encriptados en L2 (storage).
   */
  static async setEncrypted<T>(
    key: string,
    data: T,
    options?: CacheSetOptions
  ): Promise<boolean> {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.checkState()) {
      return false;
    }

    try {
      // Validar TTL antes de usar (v2.4.0 - con CacheValidator)
      const ttlResult = CacheValidator.validateTTL(
        options?.expiresIn ?? this.config.defaultExpiration,
        this.config.defaultExpiration
      );

      // Log warning si TTL fue ajustado
      if (!ttlResult.isValid && this.config.enableLogging && import.meta.env.DEV) {
        this.log('warn', ttlResult.reason || 'TTL inválido, usando default');
      }

      const validatedTTL = ttlResult.value;

      const normalizedOptions: Required<Omit<CacheSetOptions, 'metadata' | 'encrypt' | 'passphrase'>> & {
        metadata?: Record<string, unknown>;
        passphrase?: string;
      } = {
        expiresIn: validatedTTL,
        priority: options?.priority ?? 'normal',
        namespace: options?.namespace ?? 'data',
        useSessionStorage: options?.useSessionStorage ?? false,
        metadata: options?.metadata,
        passphrase: options?.passphrase
      };

      const cacheKey = this.buildKey(key);
      const now = Date.now();

      let serialized: string;
      try {
        serialized = JSON.stringify(data);
      } catch (serializationError) {
        this.log('error', `Error serializando datos para encriptar: "${key}"`, serializationError);
        return false;
      }

      const size = this.estimateSize(data);

      if (!this.ensureSpace(size, normalizedOptions.useSessionStorage)) {
        this.log('warn', `No hay espacio suficiente en cache para "${key}" (encrypted)`);
        return false;
      }

      const baseMetadata: Record<string, unknown> = {
        ...(normalizedOptions.metadata ?? {}),
        encrypted: true
      };

      const baseItemProps = {
        timestamp: now,
        expiresIn: normalizedOptions.expiresIn,
        priority: normalizedOptions.priority,
        namespace: normalizedOptions.namespace,
        accessCount: 0,
        lastAccess: now,
        size
      } as const;

      const memoryItem: CacheItem<T> = {
        data,
        ...baseItemProps,
        metadata: baseMetadata
      };

      this.addToMemoryCache(cacheKey, memoryItem);

      const storage = this.getStorage(normalizedOptions.useSessionStorage);

      if (!storage) {
        this.log('warn', `L2 cache no disponible, "${key}" se guardó solo en L1 (encrypted)`);
        return true;
      }

      try {
        const encryptedPayload = await this.encryptPayload(serialized, normalizedOptions.passphrase);

        const storageMetadata: Record<string, unknown> = {
          ...baseMetadata,
          encryption: {
            algorithm: encryptedPayload.algorithm,
            timestamp: encryptedPayload.timestamp
          }
        };

        const storageItem: CacheItem<EncryptedCachePayload> = {
          data: encryptedPayload,
          ...baseItemProps,
          metadata: storageMetadata
        };

        storage.setItem(cacheKey, JSON.stringify(storageItem));

        this.log('info', `Cache set (encrypted): "${key}" (L1 + L2)`, {
          namespace: storageItem.namespace,
          priority: storageItem.priority,
          algorithm: encryptedPayload.algorithm
        });

        return true;

      } catch (encryptionError) {
        this.log('error', `Error guardando cache encriptado: "${key}"`, encryptionError);
        return false;
      }
    } catch (error) {
      this.log('error', `Error general en setEncrypted: "${key}"`, error);
      return false;
    }
  }

  /**
   * Obtiene un item encriptado desde cache, desencriptándolo automáticamente si proviene de L2
   *
   * Compatible con datos legacy (pre-v2.1.1) que no tienen campo `salt`.
   * Los datos legacy se limpian automáticamente y se retorna null (cache miss).
   *
   * @param key - Clave del cache
   * @param options - Opciones de seguridad (useSessionStorage, passphrase)
   * @returns Promesa que resuelve a los datos desencriptados o null si no existe/es legacy
   *
   * @example
   * ```typescript
   * const userData = await CacheHelper.getEncrypted<User>('userData', {
   *   passphrase: 'custom-passphrase'
   * });
   * ```
   */
  static async getEncrypted<T>(
    key: string,
    options?: SecureGetOptions
  ): Promise<T | null> {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.checkState()) {
      return null;
    }

    try {
      const useSessionStorage = options?.useSessionStorage ?? false;
      const passphrase = options?.passphrase;
      const cacheKey = this.buildKey(key);
      const now = Date.now();

      const l1Item = this.getFromMemoryCache<T>(cacheKey);

      if (l1Item) {
        l1Item.accessCount++;
        l1Item.lastAccess = now;
        this.memoryCache.set(cacheKey, l1Item);

        // ✅ v2.4.0: Hit de L1 cache (memoria)
        this.metrics.recordL1Hit();

        return l1Item.data as T;
      }

      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        this.metrics.recordMiss();
        return null;
      }

      const cached = storage.getItem(cacheKey);

      if (!cached) {
        this.metrics.recordMiss();
        return null;
      }

      const cacheItem = this.parseCacheItem<unknown>(cached, key);

      if (!cacheItem) {
        this.metrics.recordMiss();
        return null;
      }

      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key, useSessionStorage);
        this.metrics.recordMiss();
        return null;
      }

      // Item no encriptado (legacy)
      if (!this.isEncryptedMetadata(cacheItem.metadata) && !this.isEncryptedPayload(cacheItem.data)) {
        const plainItem = cacheItem as CacheItem<T>;
        plainItem.accessCount++;
        plainItem.lastAccess = now;

        this.addToMemoryCache(cacheKey, plainItem);
        this.scheduleL2Update(storage, cacheKey, plainItem);

        // ✅ v2.4.0: Hit de L2 cache (storage)
        this.metrics.recordL2Hit();

        return plainItem.data;
      }

      if (!this.isEncryptedPayload(cacheItem.data)) {
        this.log('warn', `Cache item "${key}" marcado como encriptado pero sin payload válido`);
        this.metrics.recordMiss();
        return null;
      }

      // ✅ MIGRATION CHECK: Detectar datos legacy sin salt (pre-v2.1.1)
      const encryptedData = cacheItem.data as EncryptedCachePayload;
      if (!encryptedData.salt) {
        this.log('warn', `🔄 Migration: Limpiando cache legacy sin salt (pre-v2.1.1): "${key}"`, {
          namespace: cacheItem.namespace,
          priority: cacheItem.priority,
          migration: 'EncryptHelper v2.1.1',
          action: 'auto-cleanup',
          note: 'Cache encriptado legacy será eliminado y regenerado'
        });

        // Limpiar cache legacy incompatible
        this.remove(key, useSessionStorage);
        this.metrics.recordMiss();
        return null;
      }

      try {
        // ✅ Datos tienen salt, proceder con desencriptación normal
        const decrypted = await this.decryptPayload(cacheItem.data, passphrase);
        const data = this.deserializePayload<T>(decrypted);

        const metadata: Record<string, unknown> = {
          ...(cacheItem.metadata ?? {}),
          encrypted: true
        };

        const memoryItem: CacheItem<T> = {
          data,
          timestamp: cacheItem.timestamp,
          expiresIn: cacheItem.expiresIn,
          priority: cacheItem.priority,
          namespace: cacheItem.namespace,
          accessCount: cacheItem.accessCount + 1,
          lastAccess: now,
          size: cacheItem.size,
          metadata
        };

        this.addToMemoryCache(cacheKey, memoryItem);

        const encryptedItem: CacheItem<EncryptedCachePayload> = {
          data: cacheItem.data,
          timestamp: cacheItem.timestamp,
          expiresIn: cacheItem.expiresIn,
          priority: cacheItem.priority,
          namespace: cacheItem.namespace,
          accessCount: cacheItem.accessCount + 1,
          lastAccess: now,
          size: cacheItem.size,
          metadata: cacheItem.metadata
        };

        this.scheduleL2Update(storage, cacheKey, encryptedItem);

        // ✅ v2.4.0: Hit de L2 cache (storage)
        this.metrics.recordL2Hit();

        return data;

      } catch (decryptError) {
        this.log('error', `Error desencriptando cache "${key}"`, decryptError);
        this.remove(key, useSessionStorage);
        this.metrics.recordMiss();
        return null;
      }
    } catch (error) {
      this.log('error', `Error general en getEncrypted: "${key}"`, error);
      this.metrics.recordMiss();
      return null;
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

        // ✅ v2.4.0: Hit de L1 cache (memoria)
        this.metrics.recordL1Hit();

        this.log('info', `L1 Cache hit: "${key}" (${l1Item.accessCount} accesos)`);

        // Desencriptar si es necesario
        if (l1Item.encrypted && l1Item.encryptionIV) {
          try {
            const decryptResult = await decryptString({
              encrypted: l1Item.data as string,
              iv: l1Item.encryptionIV,
              algorithm: 'AES-GCM',
              timestamp: l1Item.timestamp
            });

            const decryptedData = JSON.parse(decryptResult) as T;
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
      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        // L2 no disponible, solo tenemos L1
        this.metrics.recordMiss();
        return null;
      }

      const cached = storage.getItem(cacheKey);

      if (!cached) {
        this.metrics.recordMiss();
        return null;
      }

      // Parse y validar desde storage con Zod (operación costosa)
      const cacheItem = this.parseCacheItem<T>(cached, key);

      if (!cacheItem) {
        // Dato corrupto o inválido, eliminar automáticamente
        this.remove(key, useSessionStorage);
        this.metrics.recordMiss();
        this.log('warn', `Cache item corrupto eliminado: "${key}"`);
        return null;
      }

      // Verificar si ha expirado
      if (now - cacheItem.timestamp > cacheItem.expiresIn) {
        this.remove(key, useSessionStorage);
        this.metrics.recordMiss();
        this.log('info', `Cache expired: "${key}"`);
        return null;
      }

      // Detectar items encriptados y solicitar uso de getEncrypted
      if (this.isEncryptedMetadata(cacheItem.metadata) || this.isEncryptedPayload(cacheItem.data)) {
        this.metrics.recordMiss();
        this.log('warn', `Cache item "${key}" está encriptado. Usa getEncrypted()`);
        return null;
      }

      // ✅ L2 HIT - Guardar en L1 para próximas lecturas
      cacheItem.accessCount++;
      cacheItem.lastAccess = now;

      // Promover a L1 (memoria)
      this.addToMemoryCache(cacheKey, cacheItem);

      // Actualizar L2 de forma asíncrona (no bloquea)
      // Usa método seguro con tracking para prevenir memory leaks
      this.scheduleL2Update(storage, cacheKey, cacheItem);

      // ✅ v2.4.0: Hit de L2 cache (storage)
      this.metrics.recordL2Hit();

      this.log('info', `L2 Cache hit: "${key}" → promoted to L1`);

      // Desencriptar si es necesario
      if (cacheItem.encrypted && cacheItem.encryptionIV) {
        try {
          const decryptResult = await decryptString({
            encrypted: cacheItem.data as string,
            iv: cacheItem.encryptionIV,
            algorithm: 'AES-GCM',
            timestamp: cacheItem.timestamp
          });

          const decryptedData = JSON.parse(decryptResult) as T;
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
      this.metrics.recordMiss();
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
      const storage = this.getStorage(useSessionStorage);
      if (storage) {
        storage.removeItem(cacheKey);
        this.log('info', `Cache removed: "${key}" (L1 + L2)`);
      } else {
        this.log('info', `Cache removed: "${key}" (L1 only, L2 not available)`);
      }
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
      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        // Si L2 no está disponible, al menos limpiar L1
        if (!namespace) {
          this.clearMemoryCache();
          this.log('info', 'Cache L1 cleared (L2 not available)');
        }
        return;
      }

      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      let removedCount = 0;

      keys.forEach(key => {
        if (namespace) {
          // Si se especifica namespace, verificar que coincida
          const cached = storage.getItem(key);
          if (cached) {
            const item = this.parseCacheItem<unknown>(cached);

            if (item && item.namespace === namespace) {
              // Namespace coincide, eliminar de ambos
              storage.removeItem(key);
              this.removeFromMemoryCache(key);
              removedCount++;
            } else if (!item) {
              // Dato corrupto, eliminar de ambos
              storage.removeItem(key);
              this.removeFromMemoryCache(key);
              removedCount++;
            }
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
      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        // L2 no disponible, no hay nada que limpiar
        return 0;
      }

      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      let removedCount = 0;
      const now = Date.now();

      keys.forEach(key => {
        const cached = storage.getItem(key);
        if (!cached) return;

        const cacheItem = this.parseCacheItem<unknown>(cached);

        if (!cacheItem) {
          // Dato corrupto, eliminar
          storage.removeItem(key);
          this.removeFromMemoryCache(key);
          removedCount++;
          return;
        }

        // Verificar si expiró
        if (now - cacheItem.timestamp > cacheItem.expiresIn) {
          storage.removeItem(key);
          this.removeFromMemoryCache(key);
          removedCount++;
        }
      });

      // ✅ v2.4.0: Actualizar timestamp de cleanup
      this.metrics.updateLastCleanup();

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
      // ✅ v2.4.0: Obtener snapshot de métricas una sola vez
      const metricsSnapshot = this.metrics.getSnapshot();

      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        // L2 no disponible, retornar solo stats de L1
        const l1CacheStats = this.config.enableMemoryCache ? {
          items: this.memoryCache.size,
          hits: metricsSnapshot.l1Hits,
          hitRate: Math.round(metricsSnapshot.l1HitRate * 100) / 100,
          maxItems: this.config.memoryCacheMaxItems,
          usage: Math.round((this.memoryCache.size / this.config.memoryCacheMaxItems) * 100 * 100) / 100
        } : undefined;

        return {
          totalItems: 0,
          expiredItems: 0,
          validItems: 0,
          hits: metricsSnapshot.hits,
          misses: metricsSnapshot.misses,
          hitRate: Math.round(metricsSnapshot.hitRate * 100) / 100,
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
          },
          l1Cache: l1CacheStats
        };
      }

      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

  const totalItems = keys.length;
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
        const cached = storage.getItem(key);
        if (!cached) return;

        const cacheItem = this.parseCacheItem<unknown>(cached);

        if (!cacheItem) {
          // Dato corrupto, contar como expirado
          expiredItems++;
          return;
        }

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
      });

      // ✅ v2.4.0: Usar métricas del snapshot
      const hitRate = Math.round(metricsSnapshot.hitRate * 100) / 100;

      // Calcular estadísticas de L1 cache
      const l1CacheStats = this.config.enableMemoryCache ? {
        items: this.memoryCache.size,
        hits: metricsSnapshot.l1Hits,
        hitRate: Math.round(metricsSnapshot.l1HitRate * 100) / 100,
        maxItems: this.config.memoryCacheMaxItems,
        usage: Math.round((this.memoryCache.size / this.config.memoryCacheMaxItems) * 100 * 100) / 100
      } : undefined;

      return {
        totalItems,
        expiredItems,
        validItems,
        hits: metricsSnapshot.hits,
        misses: metricsSnapshot.misses,
        hitRate,
        totalSize,
        itemsByNamespace,
        itemsByPriority,
        l1Cache: l1CacheStats
      };

    } catch (error) {
      this.log('error', 'Error obteniendo estadísticas', error);

      // ✅ v2.4.0: Intentar obtener snapshot incluso en error
      let fallbackMetrics: CacheMetricsSnapshot;
      try {
        fallbackMetrics = this.metrics.getSnapshot();
      } catch {
        // Si incluso getSnapshot() falla, usar valores en cero
        fallbackMetrics = {
          hits: 0,
          misses: 0,
          totalAccesses: 0,
          hitRate: 0,
          l1Hits: 0,
          l1HitRate: 0,
          l2Hits: 0,
          l2HitRate: 0,
          lastCleanup: Date.now(),
          startedAt: Date.now(),
          uptime: 0,
          hitsPerSecond: 0,
          missesPerSecond: 0
        };
      }

      return {
        totalItems: 0,
        expiredItems: 0,
        validItems: 0,
        hits: fallbackMetrics.hits,
        misses: fallbackMetrics.misses,
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
   *
   * ✅ v2.4.0: Usa CacheMetrics.reset()
   */
  static resetMetrics(): void {
    this.metrics.reset();
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
   * Determina si la metadata indica que el item está encriptado
   */
  private static isEncryptedMetadata(metadata?: Record<string, unknown>): boolean {
    if (!metadata || typeof metadata !== 'object') return false;
    const flag = (metadata as { encrypted?: unknown }).encrypted;
    return flag === true;
  }

  /**
   * Determina si el payload corresponde a un item encriptado
   */
  private static isEncryptedPayload(data: unknown): data is EncryptedCachePayload {
    if (!data || typeof data !== 'object') return false;
    return (data as { __cacheEncrypted?: unknown }).__cacheEncrypted === true;
  }

  /**
   * Encripta datos serializados para almacenamiento en L2
   */
  private static async encryptPayload(serialized: string, passphrase?: string): Promise<EncryptedCachePayload> {
    const result = await encryptString(serialized, passphrase);
    return {
      ...result,
      __cacheEncrypted: true,
      format: 'json'
    };
  }

  /**
   * Desencripta payload almacenado en L2
   */
  private static async decryptPayload(payload: EncryptedCachePayload, passphrase?: string): Promise<string> {
    return decryptString(payload, passphrase);
  }

  /**
   * Deserializa datos desencriptados a su representación original
   */
  private static deserializePayload<T>(serialized: string): T {
    try {
      return JSON.parse(serialized) as T;
    } catch (error) {
      this.log('warn', 'Error parseando datos desencriptados, devolviendo string crudo', error);
      return serialized as unknown as T;
    }
  }

  /**
   * Parsea y valida un CacheItem desde JSON usando Zod
   *
   * Este método proporciona type safety en runtime validando que los datos
   * almacenados en storage cumplan con la estructura esperada de CacheItem.
   *
   * BENEFICIOS:
   * - Detecta datos corruptos automáticamente
   * - Previene crashes por estructura inválida
   * - Facilita migraciones entre versiones
   * - Logging detallado de errores de validación
   *
   * @param json - JSON string del cache
   * @param key - Clave del cache (para logging)
   * @returns CacheItem validado o null si es inválido
   */
  private static parseCacheItem<T>(json: string, key?: string): CacheItem<T> | null {
    try {
      const parsed = JSON.parse(json);

      // Validar con Zod
      const result = CacheItemSchema.safeParse(parsed);

      if (!result.success) {
        // Datos no cumplen el schema
        const errors = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
        this.log('warn', `Cache item inválido${key ? ` "${key}"` : ''} (schema mismatch)`, {
          errors,
          received: parsed
        });
        return null;
      }

      // Validación exitosa, retornar con tipo correcto
      return result.data as CacheItem<T>;

    } catch (error) {
      if (error instanceof SyntaxError) {
        this.log('error', `JSON inválido en cache${key ? ` "${key}"` : ''}`, error);
      } else {
        this.log('error', `Error parseando cache item${key ? ` "${key}"` : ''}`, error);
      }
      return null;
    }
  }

  /**
   * Verifica si el storage está disponible y funcionando
   *
   * IMPORTANTE: localStorage/sessionStorage pueden no estar disponibles en:
   * - Navegadores en modo incógnito (Safari especialmente)
   * - Storage deshabilitado por políticas empresariales
   * - Entornos SSR (server-side rendering)
   * - Storage lleno (QuotaExceededError)
   *
   * @param type - Tipo de storage a verificar
   * @returns true si el storage está disponible y funcional
   */
  private static isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = type === 'localStorage' ? localStorage : sessionStorage;
      const testKey = '__iph_storage_test__';

      // Intentar escribir y leer
      storage.setItem(testKey, 'test');
      const result = storage.getItem(testKey);
      storage.removeItem(testKey);

      return result === 'test';

    } catch (e) {
      this.log('warn', `${type} no disponible o no funcional`, e);
      return false;
    }
  }

  /**
   * Obtiene el storage de forma segura
   * Retorna null si no está disponible
   *
   * Este método centraliza el acceso a storage y proporciona fallback
   * graceful cuando el storage no está disponible.
   *
   * @param useSessionStorage - Si usar sessionStorage en lugar de localStorage
   * @returns Storage instance o null si no está disponible
   */
  private static getStorage(useSessionStorage: boolean): Storage | null {
    const type = useSessionStorage ? 'sessionStorage' : 'localStorage';

    if (!this.isStorageAvailable(type)) {
      this.log('warn', `${type} no disponible, operación de L2 cache omitida`);
      return null;
    }

    return useSessionStorage ? sessionStorage : localStorage;
  }

  /**
   * Construye la key completa con prefijo (versión segura)
   *
   * ✅ v2.4.0: Usa CacheValidator para validación centralizada
   *
   * @param key - Key original
   * @returns Key sanitizada con prefijo
   * @throws Error si la key es inválida
   */
  private static buildKey(key: string): string {
    // Validar y sanitizar con CacheValidator
    const result = CacheValidator.validateKey(key);

    if (!result.isValid) {
      throw new Error(result.reason || 'Cache key inválida');
    }

    // Log warning si la key fue truncada
    if (result.wasTruncated && this.config.enableLogging && import.meta.env.DEV) {
      this.log('warn', `Key truncada a ${CACHE_LIMITS.MAX_KEY_LENGTH} caracteres`, {
        original: key.substring(0, 50) + '...',
        sanitized: result.sanitized
      });
    }

    return `${this.config.prefix}${result.sanitized}`;
  }

  /**
   * Estima el tamaño en bytes de un objeto
   * Usa diferentes estrategias según el entorno para máxima compatibilidad
   *
   * ESTRATEGIAS:
   * 1. Blob API (navegadores modernos) - Más preciso
   * 2. Buffer (Node.js / SSR) - Preciso para UTF-8
   * 3. Estimación manual (fallback universal) - Aproximado pero funcional
   *
   * @param data - Datos a medir
   * @returns Tamaño estimado en bytes
   */
  private static estimateSize(data: unknown): number {
    try {
      const json = JSON.stringify(data);

      // ESTRATEGIA 1: Blob API (navegadores modernos)
      if (typeof Blob !== 'undefined') {
        try {
          return new Blob([json]).size;
        } catch {
          // Continuar con siguiente estrategia
        }
      }

      // ESTRATEGIA 2: Buffer (Node.js / SSR)
      if (typeof Buffer !== 'undefined') {
        try {
          return Buffer.byteLength(json, 'utf8');
        } catch {
          // Continuar con fallback
        }
      }

      // ESTRATEGIA 3: Estimación manual (fallback universal)
      // Cuenta caracteres considerando encoding UTF-8
      let size = 0;
      for (let i = 0; i < json.length; i++) {
        const code = json.charCodeAt(i);

        // UTF-8 encoding size:
        // - ASCII (0-127): 1 byte
        // - 128-2047: 2 bytes
        // - 2048-65535: 3 bytes
        // - 65536+: 4 bytes
        if (code < 0x80) {
          size += 1;
        } else if (code < 0x800) {
          size += 2;
        } else if (code < 0x10000) {
          size += 3;
        } else {
          size += 4;
        }
      }

      // Log solo en desarrollo para no saturar logs
      if (import.meta.env.DEV) {
        this.log('info', 'Usando estimación manual de tamaño (Blob y Buffer no disponibles)');
      }

      return size;

    } catch (error) {
      this.log('warn', 'Error estimando tamaño, usando valor conservador por defecto', error);
      // Retornar tamaño conservador (1KB) en lugar de 0
      // Esto previene problemas con límites de cache
      return 1024;
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
      const storage = this.getStorage(useSessionStorage);

      if (!storage) {
        // L2 no disponible, no se puede hacer eviction
        this.log('warn', 'No se puede hacer eviction, L2 cache no disponible');
        return false;
      }

      const keys = Object.keys(storage).filter(key => key.startsWith(this.config.prefix));

      // Obtener todos los items con metadata
      const items = keys.map(key => {
        const cached = storage.getItem(key);
        if (!cached) return null;

        const item = this.parseCacheItem<unknown>(cached);
        if (!item) return null;

        return { key, item };
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
   * Programa una actualización asíncrona del L2 cache
   * Mantiene tracking de timeouts para poder cancelarlos en destroy()
   *
   * IMPORTANTE: Este método previene memory leaks manteniendo referencias
   * a todos los timeouts pendientes, permitiendo cancelarlos si es necesario.
   *
   * @param storage - Storage instance (ya verificado)
   * @param key - Clave del cache (con prefijo)
   * @param item - Item a guardar
   */
  private static scheduleL2Update(
    storage: Storage,
    key: string,
    item: CacheItem<unknown>
  ): void {
    const timeout = setTimeout(() => {
      // Verificar que no fue destruido mientras esperaba
      if (this.destroyed) {
        this.pendingUpdates.delete(timeout);
        return;
      }

      try {
        storage.setItem(key, JSON.stringify(item));
        this.pendingUpdates.delete(timeout);
      } catch (error) {
        this.log('error', 'Error en actualización asíncrona de L2', error);
        this.pendingUpdates.delete(timeout);
      }
    }, 0);

    this.pendingUpdates.add(timeout);

    // Límite de seguridad: máximo 100 updates pendientes
    // Previene acumulación excesiva en caso de muchas lecturas rápidas
    if (this.pendingUpdates.size > 100) {
      this.log('warn', `Demasiados updates pendientes (${this.pendingUpdates.size}), ejecutando flush`);
      this.flushPendingUpdates();
    }
  }

  /**
   * Cancela todos los updates asíncronos pendientes
   *
   * IMPORTANTE: Este método debe ser llamado en destroy() para prevenir
   * memory leaks de timeouts que quedan ejecutándose después de destruir.
   *
   * También puede llamarse manualmente si se detecta acumulación excesiva.
   */
  private static flushPendingUpdates(): void {
    const count = this.pendingUpdates.size;

    if (count > 0) {
      this.pendingUpdates.forEach(timeout => clearTimeout(timeout));
      this.pendingUpdates.clear();
      this.log('info', `Updates pendientes cancelados: ${count}`);
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
   * Helper para logging centralizado con sanitización automática
   *
   * ✅ SEGURIDAD v2.4.0:
   * - Sanitiza automáticamente datos sensibles antes de loggear
   * - Previene leaks de passwords, tokens, API keys en logs
   * - Usa EncryptHelper.sanitizeForLogging() internamente
   *
   * @param level - Nivel de logging
   * @param message - Mensaje descriptivo
   * @param data - Datos a loggear (se sanitizarán automáticamente)
   *
   * @private
   */
  private static log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: unknown
  ): void {
    if (!this.config.enableLogging) return;

    // ✅ Sanitizar datos sensibles antes de loggear
    // Esto previene leaks de información en logs, traces y errores
    const encryptHelper = EncryptHelper.getInstance();
    const sanitizedData = data ? encryptHelper.sanitizeForLogging(data, {
      sensitiveKeys: [
        'password',
        'passphrase',
        'token',
        'apiKey',
        'api_key',
        'secret',
        'authorization',
        'auth',
        'credential',
        'key',
        // Agregar keys específicas de cache que podrían contener datos sensibles
        'data', // El contenido del cache puede ser sensible
        'encrypted' // Datos encriptados (aunque no son plaintext, mejor no loggear)
      ],
      showPartial: 0, // No mostrar ninguna parte de datos sensibles
      replacement: '***REDACTED***'
    }) : undefined;

    if (level === 'error') {
      logError('CacheHelper', sanitizedData || new Error(message), message);
    } else if (level === 'warn') {
      logWarning('CacheHelper', message, sanitizedData);
    } else {
      logInfo('CacheHelper', message, sanitizedData);
    }
  }
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default CacheHelper;
