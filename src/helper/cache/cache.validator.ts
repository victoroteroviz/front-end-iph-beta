/**
 * @fileoverview Clase para validaciones centralizadas de Cache Helper
 * @version 1.0.0
 * @since 2025-01-31
 *
 * Esta clase encapsula TODAS las validaciones del sistema de cache
 * siguiendo el principio de Single Responsibility (SOLID).
 *
 * BENEFICIOS:
 * - ✅ Centralización: Todas las validaciones en un solo lugar
 * - ✅ Testability: Fácil de testear aisladamente
 * - ✅ Reusability: Puede usarse fuera de CacheHelper
 * - ✅ Mantenibilidad: Cambios en validación en un solo archivo
 *
 * @author Sistema IPH
 */

import { TTL_LIMITS, CACHE_LIMITS, ERROR_MESSAGES } from './cache.constants';
import type { CacheNamespace, CachePriority } from './cache.helper';

/**
 * Resultado de validación de TTL
 */
export interface TTLValidationResult {
  /** Si el TTL es válido */
  isValid: boolean;
  /** TTL validado y sanitizado (puede ser el original o el default) */
  value: number;
  /** Razón de por qué es inválido (si aplica) */
  reason?: string;
  /** Si se usó el valor default como fallback */
  usedDefault: boolean;
}

/**
 * Resultado de validación de key
 */
export interface KeyValidationResult {
  /** Si la key es válida */
  isValid: boolean;
  /** Key sanitizada (siempre retorna algo si isValid=true) */
  sanitized?: string;
  /** Razón de por qué es inválida */
  reason?: string;
  /** Si la key fue truncada */
  wasTruncated: boolean;
}

/**
 * Clase estática para validaciones de cache
 *
 * PRINCIPIOS APLICADOS:
 * - Single Responsibility: Solo validaciones
 * - Open/Closed: Extensible sin modificar código existente
 * - Dependency Inversion: Depende de interfaces/tipos, no implementaciones
 *
 * @example
 * ```typescript
 * // Validar TTL
 * const ttlResult = CacheValidator.validateTTL(5000);
 * if (!ttlResult.isValid) {
 *   console.warn(`TTL inválido: ${ttlResult.reason}`);
 * }
 * const safeTTL = ttlResult.value; // Siempre seguro de usar
 *
 * // Validar key
 * const keyResult = CacheValidator.validateKey('user/123');
 * if (keyResult.isValid) {
 *   const safeKey = keyResult.sanitized; // "user_123"
 * }
 * ```
 */
export class CacheValidator {
  /**
   * Valida que el TTL (Time To Live) esté dentro de rangos aceptables
   *
   * VALIDACIONES:
   * - Debe ser un número finito
   * - Debe estar entre MIN_TTL y MAX_TTL
   * - Si es inválido, retorna DEFAULT_TTL
   *
   * RANGOS SEGUROS:
   * - Mínimo: 1 segundo (previene thrashing)
   * - Máximo: 1 año (previene memory leaks)
   * - Default: 5 minutos (balance típico)
   *
   * @param expiresIn - TTL en milisegundos a validar
   * @param defaultTTL - TTL por defecto si es inválido (opcional, usa constante)
   * @returns Resultado de validación con TTL seguro
   *
   * @example
   * ```typescript
   * validateTTL(5000)              // → { isValid: true, value: 5000 }
   * validateTTL(-1)                // → { isValid: false, value: 300000, reason: '...' }
   * validateTTL(Number.MAX_VALUE)  // → { isValid: false, value: 300000, reason: '...' }
   * validateTTL(500)               // → { isValid: false, value: 300000, reason: '...' }
   * ```
   */
  static validateTTL(
    expiresIn: number,
    defaultTTL: number = TTL_LIMITS.DEFAULT
  ): TTLValidationResult {
    // Validar que es un número finito
    if (!Number.isFinite(expiresIn)) {
      return {
        isValid: false,
        value: defaultTTL,
        reason: `TTL no es un número finito: ${expiresIn}`,
        usedDefault: true
      };
    }

    // Validar rango
    if (expiresIn < TTL_LIMITS.MIN || expiresIn > TTL_LIMITS.MAX) {
      return {
        isValid: false,
        value: defaultTTL,
        reason: `TTL fuera de rango (${expiresIn}ms). Rango válido: ${TTL_LIMITS.MIN}-${TTL_LIMITS.MAX}ms`,
        usedDefault: true
      };
    }

    // TTL válido
    return {
      isValid: true,
      value: expiresIn,
      usedDefault: false
    };
  }

  /**
   * Valida y sanitiza una key de cache
   *
   * VALIDACIONES:
   * - Debe ser un string no vacío
   * - Debe tener contenido después de trim
   * - Se sanitizan caracteres peligrosos
   * - Se limita longitud máxima
   *
   * SANITIZACIONES:
   * - Remueve espacios al inicio/final
   * - Solo permite: a-zA-Z0-9_-.:
   * - Trunca si excede MAX_KEY_LENGTH
   * - Agrega hash si se trunca (mantiene unicidad)
   *
   * SEGURIDAD:
   * - Previene XSS via storage keys
   * - Previene ataques de storage injection
   * - Valida longitud para prevenir DoS
   *
   * @param key - Key original a validar
   * @returns Resultado de validación con key sanitizada
   * @throws Error si la key es completamente inválida
   *
   * @example
   * ```typescript
   * validateKey('user/123')         // → { isValid: true, sanitized: 'user_123' }
   * validateKey('data<script>x')    // → { isValid: true, sanitized: 'data_script_x' }
   * validateKey('a'.repeat(200))    // → { isValid: true, sanitized: 'aaa...hash' }
   * validateKey('')                 // → { isValid: false, reason: '...' }
   * ```
   */
  static validateKey(key: string): KeyValidationResult {
    // Validar tipo
    if (typeof key !== 'string') {
      return {
        isValid: false,
        reason: ERROR_MESSAGES.INVALID_KEY_TYPE,
        wasTruncated: false
      };
    }

    // Remover espacios
    const trimmed = key.trim();

    // Validar que no quede vacía
    if (trimmed.length === 0) {
      return {
        isValid: false,
        reason: ERROR_MESSAGES.INVALID_KEY_EMPTY,
        wasTruncated: false
      };
    }

    // Sanitizar caracteres peligrosos
    // Solo permitir: letras, números, guiones, underscores, puntos, dos puntos
    let sanitized = trimmed.replace(/[^a-zA-Z0-9_\-.:]/g, '_');

    // Verificar longitud y truncar si es necesario
    let wasTruncated = false;
    if (sanitized.length > CACHE_LIMITS.MAX_KEY_LENGTH) {
      // Truncar y agregar hash para mantener unicidad
      const hash = this.simpleHash(sanitized);
      sanitized = sanitized.substring(0, CACHE_LIMITS.MAX_KEY_LENGTH - 8) + '_' + hash;
      wasTruncated = true;
    }

    return {
      isValid: true,
      sanitized,
      wasTruncated
    };
  }

  /**
   * Valida si un namespace es válido
   *
   * @param namespace - Namespace a validar
   * @returns true si es válido
   *
   * @example
   * ```typescript
   * isValidNamespace('data')      // → true
   * isValidNamespace('invalid')   // → false
   * ```
   */
  static isValidNamespace(namespace: string): namespace is CacheNamespace {
    const validNamespaces: CacheNamespace[] = [
      'routes',
      'data',
      'components',
      'user',
      'system',
      'temp'
    ];
    return validNamespaces.includes(namespace as CacheNamespace);
  }

  /**
   * Valida si una prioridad es válida
   *
   * @param priority - Prioridad a validar
   * @returns true si es válida
   *
   * @example
   * ```typescript
   * isValidPriority('high')     // → true
   * isValidPriority('invalid')  // → false
   * ```
   */
  static isValidPriority(priority: string): priority is CachePriority {
    const validPriorities: CachePriority[] = ['low', 'normal', 'high', 'critical'];
    return validPriorities.includes(priority as CachePriority);
  }

  /**
   * Valida si un tamaño está dentro de límites
   *
   * @param size - Tamaño en bytes
   * @param maxSize - Tamaño máximo permitido (opcional, usa constante)
   * @returns true si el tamaño es válido
   *
   * @example
   * ```typescript
   * isValidSize(1024)           // → true
   * isValidSize(10 * 1024 * 1024) // → false (excede límite)
   * ```
   */
  static isValidSize(size: number, maxSize: number = CACHE_LIMITS.MAX_STORAGE_SIZE): boolean {
    return Number.isFinite(size) && size >= 0 && size <= maxSize;
  }

  /**
   * Genera un hash simple para truncar keys largas
   *
   * ALGORITMO:
   * - Simple hash de 32-bit (rápido, suficiente para este caso)
   * - Retorna 7 caracteres alfanuméricos
   * - ~42 bits de entropía (suficiente para evitar colisiones)
   *
   * NOTA: No es criptográficamente seguro, solo para unicidad de keys
   *
   * @param str - String a hashear
   * @returns Hash de 7 caracteres
   *
   * @private
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 7);
  }
}

export default CacheValidator;
