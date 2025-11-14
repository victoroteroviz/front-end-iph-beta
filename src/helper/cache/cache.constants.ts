/**
 * @fileoverview Constantes centralizadas para Cache Helper
 * @version 1.0.0
 * @since 2025-01-31
 *
 * Este archivo centraliza TODAS las constantes numéricas y mágicas
 * del sistema de cache para mejorar mantenibilidad y documentación.
 *
 * BENEFICIOS:
 * - ✅ Elimina "números mágicos" dispersos en el código
 * - ✅ Documentación clara del "por qué" de cada valor
 * - ✅ Fácil de ajustar configuración en un solo lugar
 * - ✅ Type-safe con TypeScript
 *
 * @author Sistema IPH
 */

// =====================================================
// LÍMITES DE TTL (Time To Live)
// =====================================================

/**
 * Constantes para validación de TTL (Time To Live)
 *
 * RANGOS SEGUROS:
 * - Mínimo: 1 segundo (previene thrashing de cache)
 * - Máximo: 1 año (previene memory leaks de items permanentes)
 */
export const TTL_LIMITS = {
  /**
   * TTL mínimo permitido en milisegundos
   *
   * JUSTIFICACIÓN:
   * - Valores menores causan thrashing (cache inútil)
   * - 1 segundo es el mínimo práctico para cualquier operación
   */
  MIN: 1000, // 1 segundo

  /**
   * TTL máximo permitido en milisegundos
   *
   * JUSTIFICACIÓN:
   * - 1 año es suficiente para datos "permanentes"
   * - Previene configuraciones erróneas (Number.MAX_VALUE)
   * - Fuerza revisión anual de datos en cache
   */
  MAX: 365 * 24 * 60 * 60 * 1000, // 1 año

  /**
   * TTL por defecto si no se especifica
   *
   * JUSTIFICACIÓN:
   * - 5 minutos es un buen balance para la mayoría de casos
   * - Suficientemente largo para reducir requests
   * - Suficientemente corto para datos actualizados
   */
  DEFAULT: 5 * 60 * 1000 // 5 minutos
} as const;

// =====================================================
// LÍMITES DE CACHE
// =====================================================

/**
 * Límites de tamaño y cantidad para cache L1 y L2
 *
 * OPTIMIZADOS PARA:
 * - Balance entre performance y memoria
 * - Compatibilidad con navegadores modernos
 * - Prevención de QuotaExceededError
 */
export const CACHE_LIMITS = {
  /**
   * Máximo de items en L1 cache (memoria)
   *
   * JUSTIFICACIÓN:
   * - 100 items = ~10-50MB típico en memoria
   * - Suficiente para hot data sin saturar RAM
   * - Eviction LRU mantiene items más usados
   */
  MAX_MEMORY_CACHE_ITEMS: 100,

  /**
   * Tamaño máximo total de L2 cache (localStorage/sessionStorage)
   *
   * JUSTIFICACIÓN:
   * - 5MB es ~50% del límite típico de localStorage (10MB)
   * - Deja espacio para otros datos de la app
   * - Compatible con todos los navegadores modernos
   *
   * REFERENCIA: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
   */
  MAX_STORAGE_SIZE: 5 * 1024 * 1024, // 5MB

  /**
   * Máximo de actualizaciones L2 pendientes simultáneas
   *
   * JUSTIFICACIÓN:
   * - 100 timeouts pendientes = ~400 bytes de overhead
   * - Previene acumulación excesiva en lecturas muy frecuentes
   * - Al exceder, se hace flush automático
   */
  MAX_PENDING_UPDATES: 100,

  /**
   * Longitud máxima de key de cache
   *
   * JUSTIFICACIÓN:
   * - 100 caracteres es suficiente para keys descriptivas
   * - Previene keys excesivamente largas que causen problemas
   * - Si se excede, se trunca y se agrega hash para unicidad
   */
  MAX_KEY_LENGTH: 100
} as const;

// =====================================================
// INTERVALOS DE LIMPIEZA
// =====================================================

/**
 * Intervalos de tiempo para operaciones de mantenimiento
 */
export const CLEANUP_INTERVALS = {
  /**
   * Intervalo de auto-cleanup de items expirados
   *
   * JUSTIFICACIÓN:
   * - 5 minutos balancea frecuencia vs overhead
   * - Previene acumulación de items expirados
   * - No impacta performance (corre en background)
   */
  AUTO_CLEANUP: 5 * 60 * 1000, // 5 minutos

  /**
   * Delay para actualizar L2 de forma asíncrona
   *
   * JUSTIFICACIÓN:
   * - 0ms = próximo tick del event loop
   * - Permite respuesta inmediata al usuario
   * - L2 se actualiza sin bloquear
   */
  L2_UPDATE_DELAY: 0 // setTimeout con 0 = próximo tick
} as const;

// =====================================================
// CONSTANTES DE ENCRIPTACIÓN
// =====================================================

/**
 * Constantes para operaciones de encriptación en cache
 *
 * REFERENCIA: Web Crypto API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
 */
export const ENCRYPTION_CONSTANTS = {
  /**
   * Longitud óptima de IV (Initialization Vector) para AES-GCM
   *
   * JUSTIFICACIÓN (NIST):
   * - 96 bits (12 bytes) es el tamaño recomendado por NIST para AES-GCM
   * - Maximiza performance sin comprometer seguridad
   * - Usado por EncryptHelper
   *
   * REFERENCIA: NIST SP 800-38D Section 5.2.1.1
   */
  IV_LENGTH_BYTES: 12,

  /**
   * Longitud de salt para derivación de claves (PBKDF2)
   *
   * JUSTIFICACIÓN (OWASP):
   * - OWASP recomienda mínimo 16 bytes
   * - Usamos 32 bytes (256 bits) para máxima seguridad
   * - Previene ataques de rainbow table
   *
   * REFERENCIA: OWASP Password Storage Cheat Sheet
   */
  SALT_LENGTH_BYTES: 32
} as const;

// =====================================================
// CONSTANTES DE HASHING
// =====================================================

/**
 * Constantes para generación de hashes
 */
export const HASH_CONSTANTS = {
  /**
   * Longitud de hash simple para truncar keys
   *
   * JUSTIFICACIÓN:
   * - 7 caracteres alfanuméricos = ~42 bits de entropía
   * - Suficiente para evitar colisiones en keys truncadas
   * - Mantiene keys legibles y compactas
   */
  SIMPLE_HASH_LENGTH: 7
} as const;

// =====================================================
// PREFIJOS Y NAMESPACES
// =====================================================

/**
 * Prefijos para keys en storage
 */
export const STORAGE_PREFIXES = {
  /**
   * Prefijo por defecto para todas las keys de cache
   *
   * JUSTIFICACIÓN:
   * - Previene colisiones con otras librerías
   * - Facilita debugging (todas las keys empiezan igual)
   * - Permite limpiar solo cache de IPH
   */
  DEFAULT: 'iph_cache_'
} as const;

// =====================================================
// TAMAÑOS ESTIMADOS (para cálculos de memoria)
// =====================================================

/**
 * Tamaños estimados de caracteres en diferentes encodings
 *
 * USADO POR: estimateSize() para calcular tamaño en bytes
 */
export const SIZE_ESTIMATES = {
  /**
   * Bytes por carácter ASCII
   *
   * JUSTIFICACIÓN:
   * - Caracteres ASCII puros son 1 byte
   * - Usado para optimización de cálculo rápido
   */
  BYTES_PER_ASCII_CHAR: 1,

  /**
   * Bytes promedio por carácter UTF-8
   *
   * JUSTIFICACIÓN:
   * - UTF-8 variable: 1-4 bytes por carácter
   * - 2 bytes es un promedio conservador
   * - Español típicamente usa 1-2 bytes por carácter
   */
  BYTES_PER_UTF8_CHAR: 2,

  /**
   * Bytes máximos por carácter UTF-8
   *
   * JUSTIFICACIÓN:
   * - UTF-8 puede usar hasta 4 bytes (emojis, caracteres raros)
   * - Usado para estimación conservadora cuando hay chars especiales
   */
  BYTES_PER_UTF8_CHAR_MAX: 4
} as const;

// =====================================================
// PORCENTAJES Y RATIOS
// =====================================================

/**
 * Porcentajes usados en cálculos de cache
 */
export const CACHE_RATIOS = {
  /**
   * Porcentaje de capacidad al cual triggear eviction
   *
   * JUSTIFICACIÓN:
   * - 90% permite overhead para operaciones en curso
   * - Previene QuotaExceededError en storage
   * - Eviction proactiva vs reactiva
   */
  EVICTION_THRESHOLD_PERCENT: 90,

  /**
   * Porcentaje de memoria a liberar durante eviction
   *
   * JUSTIFICACIÓN:
   * - Liberar 20% permite varias operaciones antes de next eviction
   * - No es tan agresivo que elimine datos útiles
   */
  EVICTION_TARGET_PERCENT: 20
} as const;

// =====================================================
// CÓDIGOS DE ERROR Y VALIDACIÓN
// =====================================================

/**
 * Mensajes de error estandarizados
 */
export const ERROR_MESSAGES = {
  INVALID_KEY_EMPTY: 'Cache key debe ser un string no vacío',
  INVALID_KEY_TYPE: 'Cache key debe ser un string',
  INVALID_TTL: 'TTL debe ser un número finito',
  TTL_OUT_OF_RANGE: 'TTL fuera de rango permitido',
  STORAGE_NOT_AVAILABLE: 'Storage no disponible',
  QUOTA_EXCEEDED: 'Cuota de storage excedida',
  HELPER_DESTROYED: 'CacheHelper ha sido destruido',
  SERIALIZATION_FAILED: 'Error al serializar datos para cache'
} as const;

// =====================================================
// EXPORT POR DEFECTO (objeto completo)
// =====================================================

/**
 * Todas las constantes agrupadas para import conveniente
 *
 * @example
 * ```typescript
 * import CACHE_CONSTANTS from './cache.constants';
 *
 * const ttl = CACHE_CONSTANTS.TTL_LIMITS.DEFAULT;
 * const maxItems = CACHE_CONSTANTS.CACHE_LIMITS.MAX_MEMORY_CACHE_ITEMS;
 * ```
 */
export const CACHE_CONSTANTS = {
  TTL_LIMITS,
  CACHE_LIMITS,
  CLEANUP_INTERVALS,
  ENCRYPTION_CONSTANTS,
  HASH_CONSTANTS,
  STORAGE_PREFIXES,
  SIZE_ESTIMATES,
  CACHE_RATIOS,
  ERROR_MESSAGES
} as const;

export default CACHE_CONSTANTS;
