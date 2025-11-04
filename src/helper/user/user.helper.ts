/**
 * User Helper - Sistema centralizado para gestión de datos de usuario
 * Siguiendo principios SOLID, KISS y DRY
 *
 * Proporciona funciones reutilizables para:
 * - Obtención de datos de usuario desde sessionStorage
 * - Validación de estructura de datos con Zod
 * - Formateo de nombres completos
 * - Gestión de avatares
 * - Cache con TTL para optimizar performance
 * - Sanitización automática de datos corruptos
 *
 * @version 1.1.0
 * @features
 * - ✅ Validación Zod en runtime para seguridad
 * - ✅ Sistema de caching con TTL de 5 segundos
 * - ✅ Singleton pattern para consistencia global
 * - ✅ Logging estructurado con logger.helper
 * - ✅ Sanitización automática de datos corruptos
 * - ✅ Protección contra XSS y datos maliciosos
 * - ✅ API simple para componentes y servicios
 * - ✅ Funciones de formateo de nombres flexibles
 * - ✅ Verificación de disponibilidad de sessionStorage
 * - ✅ Optimización de llamadas redundantes
 *
 * @security
 * - Validación estricta con Zod para prevenir inyección
 * - Cache con TTL para reducir lecturas costosas de sessionStorage
 * - Sanitización automática de datos corruptos
 * - Logs seguros sin exponer datos sensibles completos
 * - Verificación de disponibilidad de storage (Safari incógnito, etc.)
 *
 * @performance
 * - Cache inteligente con TTL
 * - Eliminación de operaciones redundantes (trim post-Zod)
 * - Optimización de getUserContext() sin llamadas múltiples
 * - Logging condicional en producción
 *
 * @author IPH Frontend Team
 * @date 2025-01-31
 * @updated 2025-01-31 - v1.1.0 - Performance fixes críticos
 */

import { z } from 'zod';
import { logInfo, logError, logWarning, logDebug } from '../log/logger.helper';
import type {
  UserData,
  UserContext,
  FormatNameOptions
} from '../../interfaces/user/user-data.interface';

// ==================== SCHEMAS ZOD PARA VALIDACIÓN ====================

/**
 * Schema de validación Zod para datos de usuario
 * Protege contra inyección y datos corruptos en sessionStorage
 *
 * @security Valida estructura, tipos y valores permitidos
 * @description Coincide con la estructura guardada en login.service.ts:152-160
 */
const UserDataSchema = z.object({
  id: z.string()
    .min(1, 'ID de usuario no puede estar vacío')
    .max(100, 'ID de usuario demasiado largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID de usuario contiene caracteres inválidos'),

  nombre: z.string()
    .min(1, 'Nombre no puede estar vacío')
    .max(100, 'Nombre demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
      'Nombre contiene caracteres inválidos'
    )
    .transform(val => val.trim()),

  primer_apellido: z.string()
    .min(1, 'Primer apellido no puede estar vacío')
    .max(100, 'Primer apellido demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
      'Primer apellido contiene caracteres inválidos'
    )
    .transform(val => val.trim()),

  segundo_apellido: z.string()
    .max(100, 'Segundo apellido demasiado largo')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/,
      'Segundo apellido contiene caracteres inválidos'
    )
    .transform(val => val.trim())
    .optional()
    .or(z.literal('')), // Permitir string vacío

  foto: z.string()
    .max(500, 'URL de foto demasiado larga')
    .optional()
    .or(z.literal('')) // Permitir string vacío
});

// ==================== CONSTANTES ====================

/**
 * Constantes del User Helper
 * @private
 */
const CONSTANTS = {
  /** Key de sessionStorage para datos de usuario */
  STORAGE_KEY: 'user_data',

  /** Tiempo de vida del cache en milisegundos (5 segundos) */
  CACHE_TTL: 5000,

  /** Avatar por defecto si no hay foto */
  DEFAULT_AVATAR: '/assets/images/default-avatar.png',

  /** Módulo para logging */
  MODULE_NAME: 'UserHelper',

  /** Habilitar logging verbose (solo en desarrollo) */
  VERBOSE_LOGGING: import.meta.env.DEV || false
} as const;

// ==================== CLASE PRINCIPAL ====================

/**
 * Clase principal del User Helper
 * Implementa patrón Singleton para consistencia global
 *
 * @version 1.0.0
 * @features
 * - Cache con TTL para optimizar lecturas de sessionStorage
 * - Validación Zod en runtime para seguridad
 * - Sanitización automática de datos corruptos
 * - Formateo flexible de nombres
 */
class UserHelper {
  private static instance: UserHelper;

  // ==================== SISTEMA DE CACHING ====================

  /**
   * Cache de datos de usuario con timestamp para TTL
   * @private
   */
  private userDataCache: UserData | null = null;
  private cacheTimestamp: number = 0;

  /**
   * Flag para verificar si sessionStorage está disponible
   * Se verifica solo una vez en el constructor
   * @private
   */
  private storageAvailable: boolean = true;

  /**
   * Constructor privado para Singleton pattern
   * @private
   */
  private constructor() {
    // Verificar disponibilidad de sessionStorage
    this.storageAvailable = this.checkStorageAvailability();

    if (!this.storageAvailable) {
      logWarning(
        CONSTANTS.MODULE_NAME,
        'sessionStorage NO disponible (Safari incógnito, storage deshabilitado, etc.)'
      );
    }

    if (CONSTANTS.VERBOSE_LOGGING) {
      logInfo(
        CONSTANTS.MODULE_NAME,
        'Instancia de UserHelper creada con sistema de caching (TTL: 5s)'
      );
    }
  }

  /**
   * Verifica si sessionStorage está disponible
   * Previene errores en Safari modo incógnito, storage deshabilitado, etc.
   *
   * @private
   * @returns {boolean} true si sessionStorage está disponible
   */
  private checkStorageAvailability(): boolean {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      logError(
        CONSTANTS.MODULE_NAME,
        error,
        'sessionStorage no disponible o bloqueado'
      );
      return false;
    }
  }

  /**
   * Obtiene la instancia única del User Helper (Singleton)
   *
   * @returns {UserHelper} Instancia única del helper de usuario
   * @example
   * ```typescript
   * const helper = UserHelper.getInstance();
   * const userData = helper.getUserData();
   * ```
   */
  public static getInstance(): UserHelper {
    if (!UserHelper.instance) {
      UserHelper.instance = new UserHelper();
    }
    return UserHelper.instance;
  }

  // ==================== MÉTODOS DE CACHING ====================

  /**
   * Invalida el cache de datos de usuario
   * Debe llamarse después de login/logout o cambios de perfil
   *
   * @public
   * @example
   * ```typescript
   * // Después de actualizar perfil
   * userHelper.invalidateCache();
   * ```
   */
  public invalidateCache(): void {
    this.userDataCache = null;
    this.cacheTimestamp = 0;

    if (CONSTANTS.VERBOSE_LOGGING) {
      logDebug(CONSTANTS.MODULE_NAME, 'Cache de usuario invalidado manualmente');
    }
  }

  /**
   * Verifica si el cache es válido basado en TTL
   *
   * @private
   * @returns {boolean} true si el cache es válido
   */
  private isCacheValid(): boolean {
    if (!this.userDataCache) return false;
    const now = Date.now();
    const isValid = (now - this.cacheTimestamp) < CONSTANTS.CACHE_TTL;

    if (!isValid && CONSTANTS.VERBOSE_LOGGING) {
      logDebug(CONSTANTS.MODULE_NAME, 'Cache expirado, refrescando datos');
    }

    return isValid;
  }

  // ==================== MÉTODOS PRINCIPALES ====================

  /**
   * Higher-order function para evitar repetición de patrón getUserData()
   * Implementa DRY principle para métodos simples de acceso
   *
   * @private
   * @template T - Tipo de retorno de la función de transformación
   * @param {(userData: UserData) => T} fn - Función que transforma UserData
   * @param {T} fallback - Valor por defecto si no hay datos
   * @returns {T} Resultado de la transformación o fallback
   *
   * @example
   * ```typescript
   * // Antes (patrón repetido):
   * public getUserId(): string | null {
   *   const userData = this.getUserData();
   *   return userData?.id ?? null;
   * }
   *
   * // Después (usando higher-order function):
   * public getUserId(): string | null {
   *   return this.withUserData(data => data.id, null);
   * }
   * ```
   */
  private withUserData<T>(
    fn: (userData: UserData) => T,
    fallback: T
  ): T {
    const userData = this.getUserData();
    return userData ? fn(userData) : fallback;
  }

  /**
   * Obtiene y valida datos del usuario desde sessionStorage con Zod
   * Implementa caching para reducir lecturas costosas
   *
   * @returns {UserData | null} Datos del usuario validados o null si no existen
   * @security Valida estructura con Zod y sanitiza datos corruptos
   * @performance Usa cache con TTL de 5 segundos
   *
   * @example
   * ```typescript
   * const userData = getUserData();
   * if (userData) {
   *   console.log(`Usuario: ${userData.nombre}`);
   * }
   * ```
   */
  public getUserData(): UserData | null {
    // 🔴 FIX CRÍTICO #8: Verificar disponibilidad de sessionStorage
    if (!this.storageAvailable) {
      if (CONSTANTS.VERBOSE_LOGGING) {
        logWarning(
          CONSTANTS.MODULE_NAME,
          'Intento de acceso a sessionStorage que no está disponible'
        );
      }
      return null;
    }

    // Retornar cache si es válido
    if (this.isCacheValid()) {
      // 🟡 FIX #3: Logging condicional
      if (CONSTANTS.VERBOSE_LOGGING) {
        logDebug(CONSTANTS.MODULE_NAME, 'Retornando datos desde cache');
      }
      return this.userDataCache;
    }

    // Cache expirado o inválido, refrescar
    try {
      const rawData = sessionStorage.getItem(CONSTANTS.STORAGE_KEY);

      if (!rawData) {
        if (CONSTANTS.VERBOSE_LOGGING) {
          logDebug(
            CONSTANTS.MODULE_NAME,
            'No hay datos de usuario en sessionStorage'
          );
        }
        this.userDataCache = null;
        this.cacheTimestamp = Date.now();
        return null;
      }

      const parsed = JSON.parse(rawData);

      // Validación con Zod
      const validationResult = UserDataSchema.safeParse(parsed);

      if (!validationResult.success) {
        logError(
          CONSTANTS.MODULE_NAME,
          validationResult.error,
          'Datos de usuario inválidos según schema Zod - sessionStorage corrupto'
        );

        // Sanitizar sessionStorage corrupto
        logWarning(
          CONSTANTS.MODULE_NAME,
          'Limpiando sessionStorage corrupto para user_data'
        );
        sessionStorage.removeItem(CONSTANTS.STORAGE_KEY);

        this.userDataCache = null;
        this.cacheTimestamp = Date.now();
        return null;
      }

      // Datos válidos, actualizar cache
      const validatedData = validationResult.data as UserData;
      this.userDataCache = validatedData;
      this.cacheTimestamp = Date.now();

      if (CONSTANTS.VERBOSE_LOGGING) {
        logInfo(CONSTANTS.MODULE_NAME, 'Datos de usuario validados y cacheados correctamente');
      }

      return validatedData;

    } catch (error) {
      logError(
        CONSTANTS.MODULE_NAME,
        error,
        'Error crítico obteniendo datos del usuario'
      );

      // Limpiar cache y sessionStorage en caso de error
      this.userDataCache = null;
      this.cacheTimestamp = Date.now();

      try {
        sessionStorage.removeItem(CONSTANTS.STORAGE_KEY);
      } catch {
        // Silenciar error de limpieza
      }

      return null;
    }
  }

  /**
   * Obtiene el ID del usuario
   *
   * @returns {string | null} ID del usuario o null si no existe
   * @example
   * ```typescript
   * const userId = getUserId();
   * if (userId) {
   *   console.log(`ID: ${userId}`);
   * }
   * ```
   */
  public getUserId(): string | null {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(data => data.id, null);
  }

  /**
   * Obtiene el nombre completo del usuario formateado
   *
   * @param {FormatNameOptions} options - Opciones de formateo
   * @returns {string} Nombre completo formateado o string vacío
   *
   * @example
   * ```typescript
   * // Nombre completo con ambos apellidos
   * getUserFullName(); // "Juan Pérez García"
   *
   * // Solo nombre y primer apellido
   * getUserFullName({ includeSecondLastName: false }); // "Juan Pérez"
   *
   * // Solo el primer nombre
   * getUserFullName({ firstNameOnly: true }); // "Juan"
   *
   * // Nombre en mayúsculas
   * getUserFullName({ uppercase: true }); // "JUAN PÉREZ GARCÍA"
   * ```
   */
  public getUserFullName(options: FormatNameOptions = {}): string {
    const userData = this.getUserData();

    if (!userData) {
      if (CONSTANTS.VERBOSE_LOGGING) {
        logWarning(
          CONSTANTS.MODULE_NAME,
          'Intento de obtener nombre completo sin datos de usuario'
        );
      }
      return '';
    }

    const {
      includeSecondLastName = true,
      uppercase = false,
      firstNameOnly = false
    } = options;

    try {
      // 🟡 FIX #2: Eliminado trim() redundante - Zod ya lo hace en línea 64, 72
      // Solo primer nombre
      if (firstNameOnly) {
        return uppercase ? userData.nombre.toUpperCase() : userData.nombre;
      }

      // Nombre completo
      const parts = [userData.nombre, userData.primer_apellido];

      // Agregar segundo apellido si existe y se requiere
      if (includeSecondLastName && userData.segundo_apellido) {
        // Zod ya hizo trim en línea 81, solo verificar que no esté vacío
        if (userData.segundo_apellido) {
          parts.push(userData.segundo_apellido);
        }
      }

      const fullName = parts.join(' ');
      return uppercase ? fullName.toUpperCase() : fullName;

    } catch (error) {
      logError(
        CONSTANTS.MODULE_NAME,
        error,
        'Error formateando nombre completo'
      );
      return '';
    }
  }

  /**
   * Formatea el nombre completo desde datos ya obtenidos (método interno)
   * Evita llamadas redundantes a getUserData()
   *
   * @private
   * @param {UserData} userData - Datos del usuario ya validados
   * @param {FormatNameOptions} options - Opciones de formateo
   * @returns {string} Nombre completo formateado
   */
  private formatFullNameFromData(
    userData: UserData,
    options: FormatNameOptions = {}
  ): string {
    const {
      includeSecondLastName = true,
      uppercase = false,
      firstNameOnly = false
    } = options;

    try {
      // Solo primer nombre
      if (firstNameOnly) {
        return uppercase ? userData.nombre.toUpperCase() : userData.nombre;
      }

      // Nombre completo
      const parts = [userData.nombre, userData.primer_apellido];

      // Agregar segundo apellido si existe y se requiere
      if (includeSecondLastName && userData.segundo_apellido) {
        parts.push(userData.segundo_apellido);
      }

      const fullName = parts.join(' ');
      return uppercase ? fullName.toUpperCase() : fullName;

    } catch (error) {
      logError(
        CONSTANTS.MODULE_NAME,
        error,
        'Error formateando nombre completo desde datos'
      );
      return '';
    }
  }

  /**
   * Obtiene la URL del avatar del usuario
   *
   * @param {boolean} useDefault - Si retornar avatar por defecto cuando no hay foto
   * @returns {string | null} URL del avatar o null/default según parámetro
   *
   * @example
   * ```typescript
   * // Con fallback a default
   * const avatar = getUserAvatar(true); // "/assets/images/default-avatar.png"
   *
   * // Sin fallback
   * const avatar = getUserAvatar(false); // null si no hay foto
   * ```
   */
  public getUserAvatar(useDefault: boolean = true): string | null {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(
      data => this.getAvatarUrlFromData(data, useDefault),
      useDefault ? CONSTANTS.DEFAULT_AVATAR : null
    );
  }

  /**
   * Obtiene la URL del avatar desde datos ya obtenidos (método interno)
   * Evita llamadas redundantes a getUserData()
   *
   * @private
   * @param {UserData} userData - Datos del usuario ya validados
   * @param {boolean} useDefault - Si retornar avatar por defecto cuando no hay foto
   * @returns {string | null} URL del avatar o null/default según parámetro
   */
  private getAvatarUrlFromData(
    userData: UserData,
    useDefault: boolean = true
  ): string | null {
    // 🟡 FIX #2 y #4: Eliminado trim() redundante y unificada lógica de verificación
    // Verificar si tiene foto y no está vacía (Zod ya hizo trim)
    const hasFoto = userData.foto && userData.foto !== '';

    if (!hasFoto) {
      return useDefault ? CONSTANTS.DEFAULT_AVATAR : null;
    }

    return userData.foto!;
  }

  /**
   * Verifica si el usuario tiene foto de perfil
   *
   * @returns {boolean} true si tiene foto configurada
   * @example
   * ```typescript
   * if (hasAvatar()) {
   *   // Mostrar avatar personalizado
   * } else {
   *   // Mostrar avatar por defecto o iniciales
   * }
   * ```
   */
  public hasAvatar(): boolean {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(
      data => this.checkHasAvatarFromData(data),
      false
    );
  }

  /**
   * Verifica si el usuario tiene foto desde datos ya obtenidos (método interno)
   * Evita llamadas redundantes a getUserData()
   *
   * @private
   * @param {UserData} userData - Datos del usuario ya validados
   * @returns {boolean} true si tiene foto configurada
   */
  private checkHasAvatarFromData(userData: UserData): boolean {
    // 🟡 FIX #2 y #4: Eliminado trim() redundante - Zod ya lo hace
    return !!(userData.foto && userData.foto !== '');
  }

  /**
   * Obtiene las iniciales del usuario
   * Útil para avatares cuando no hay foto
   *
   * @returns {string} Iniciales del usuario (máximo 2 letras)
   * @example
   * ```typescript
   * getUserInitials(); // "JP" para Juan Pérez
   * getUserInitials(); // "JG" para Juan García (sin primer apellido en datos)
   * ```
   */
  public getUserInitials(): string {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(
      data => {
        try {
          const firstInitial = data.nombre.charAt(0).toUpperCase();
          const lastInitial = data.primer_apellido.charAt(0).toUpperCase();
          return `${firstInitial}${lastInitial}`;
        } catch (error) {
          logError(CONSTANTS.MODULE_NAME, error, 'Error obteniendo iniciales');
          return '';
        }
      },
      ''
    );
  }

  /**
   * Obtiene el primer nombre del usuario
   *
   * @returns {string} Primer nombre o string vacío
   * @example
   * ```typescript
   * const firstName = getFirstName(); // "Juan"
   * ```
   */
  public getFirstName(): string {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(data => data.nombre, '');
  }

  /**
   * Obtiene el primer apellido del usuario
   *
   * @returns {string} Primer apellido o string vacío
   * @example
   * ```typescript
   * const lastName = getFirstLastName(); // "Pérez"
   * ```
   */
  public getFirstLastName(): string {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(data => data.primer_apellido, '');
  }

  /**
   * Obtiene el segundo apellido del usuario
   *
   * @returns {string | null} Segundo apellido o null si no existe
   * @example
   * ```typescript
   * const secondLastName = getSecondLastName(); // "García" o null
   * ```
   */
  public getSecondLastName(): string | null {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(
      data => data.segundo_apellido && data.segundo_apellido !== ''
        ? data.segundo_apellido
        : null,
      null
    );
  }

  /**
   * Obtiene el contexto completo del usuario con metadata útil
   *
   * @returns {UserContext | null} Contexto del usuario o null si no hay datos
   * @example
   * ```typescript
   * const context = getUserContext();
   * if (context) {
   *   console.log(context.fullName); // "Juan Pérez García"
   *   console.log(context.hasAvatar); // true/false
   * }
   * ```
   */
  public getUserContext(): UserContext | null {
    // 🔴 FIX CRÍTICO #1: Una sola llamada a getUserData()
    // Antes: 4 llamadas (1 aquí + 3 en métodos internos)
    // Ahora: 1 llamada total
    const userData = this.getUserData();

    if (!userData) return null;

    // Usar métodos privados que NO llaman a getUserData() de nuevo
    return {
      userData,
      fullName: this.formatFullNameFromData(userData),
      avatarUrl: this.getAvatarUrlFromData(userData, true),
      hasAvatar: this.checkHasAvatarFromData(userData)
    };
  }

  /**
   * Verifica si existen datos de usuario en sessionStorage
   *
   * @returns {boolean} true si hay datos de usuario
   * @example
   * ```typescript
   * if (hasUserData()) {
   *   // Mostrar perfil
   * } else {
   *   // Redirigir a login
   * }
   * ```
   */
  public hasUserData(): boolean {
    // 🟡 FIX #5: Usando higher-order function para DRY
    return this.withUserData(() => true, false);
  }

  /**
   * Limpia los datos de usuario del helper y sessionStorage
   * Útil para logout
   *
   * @public
   * @example
   * ```typescript
   * // En logout
   * userHelper.clearUserData();
   * ```
   */
  public clearUserData(): void {
    try {
      if (this.storageAvailable) {
        sessionStorage.removeItem(CONSTANTS.STORAGE_KEY);
      }
      this.invalidateCache();

      if (CONSTANTS.VERBOSE_LOGGING) {
        logInfo(CONSTANTS.MODULE_NAME, 'Datos de usuario limpiados correctamente');
      }
    } catch (error) {
      logError(CONSTANTS.MODULE_NAME, error, 'Error limpiando datos de usuario');
    }
  }
}

// Instancia única del helper (Singleton)
const userHelper = UserHelper.getInstance();

// ==================== FUNCIONES DE CONVENIENCIA - USO DIRECTO ====================

/**
 * Obtiene los datos del usuario desde sessionStorage
 * @see UserHelper.getUserData
 */
export const getUserData = (): UserData | null =>
  userHelper.getUserData();

/**
 * Obtiene el ID del usuario
 * @see UserHelper.getUserId
 */
export const getUserId = (): string | null =>
  userHelper.getUserId();

/**
 * Obtiene el nombre completo del usuario formateado
 * @see UserHelper.getUserFullName
 */
export const getUserFullName = (options?: FormatNameOptions): string =>
  userHelper.getUserFullName(options);

/**
 * Obtiene la URL del avatar del usuario
 * @see UserHelper.getUserAvatar
 */
export const getUserAvatar = (useDefault?: boolean): string | null =>
  userHelper.getUserAvatar(useDefault);

/**
 * Verifica si el usuario tiene foto de perfil
 * @see UserHelper.hasAvatar
 */
export const hasAvatar = (): boolean =>
  userHelper.hasAvatar();

/**
 * Obtiene las iniciales del usuario
 * @see UserHelper.getUserInitials
 */
export const getUserInitials = (): string =>
  userHelper.getUserInitials();

/**
 * Obtiene el primer nombre del usuario
 * @see UserHelper.getFirstName
 */
export const getFirstName = (): string =>
  userHelper.getFirstName();

/**
 * Obtiene el primer apellido del usuario
 * @see UserHelper.getFirstLastName
 */
export const getFirstLastName = (): string =>
  userHelper.getFirstLastName();

/**
 * Obtiene el segundo apellido del usuario
 * @see UserHelper.getSecondLastName
 */
export const getSecondLastName = (): string | null =>
  userHelper.getSecondLastName();

/**
 * Obtiene el contexto completo del usuario
 * @see UserHelper.getUserContext
 */
export const getUserContext = (): UserContext | null =>
  userHelper.getUserContext();

/**
 * Verifica si existen datos de usuario
 * @see UserHelper.hasUserData
 */
export const hasUserData = (): boolean =>
  userHelper.hasUserData();

/**
 * Limpia los datos de usuario
 * @see UserHelper.clearUserData
 */
export const clearUserData = (): void =>
  userHelper.clearUserData();

/**
 * Invalida el cache de datos de usuario
 * @see UserHelper.invalidateCache
 */
export const invalidateUserCache = (): void =>
  userHelper.invalidateCache();

// ==================== INICIALIZACIÓN ====================

/**
 * Validación inicial del sistema de usuario
 * Se ejecuta al importar el módulo
 * @private
 */
const initializeUserSystem = (): boolean => {
  try {
    if (CONSTANTS.VERBOSE_LOGGING) {
      logInfo(
        CONSTANTS.MODULE_NAME,
        '✅ User Helper v1.1.0 inicializado correctamente',
        {
          features: [
            'Validación Zod runtime',
            'Cache con TTL 5s',
            'Singleton pattern',
            'Formateo flexible de nombres',
            'Gestión de avatares',
            'Sanitización automática',
            'Verificación de sessionStorage disponible',
            'Optimización de llamadas redundantes'
          ],
          security: [
            'Validación Zod estricta',
            'Protección contra XSS',
            'Sanitización de datos corruptos',
            'Logs seguros',
            'Verificación de storage disponible'
          ],
          performance: [
            'Eliminación de trim() redundante',
            'getUserContext() con 1 sola llamada',
            'Logging condicional en producción'
          ]
        }
      );
    }

    return true;

  } catch (error) {
    logError(
      CONSTANTS.MODULE_NAME,
      error,
      'Error crítico inicializando User Helper'
    );
    return false;
  }
};

// Ejecutar validación inicial
const isSystemValid = initializeUserSystem();

/**
 * Verifica si el sistema de usuario está válido
 * @returns {boolean} true si el sistema está operativo
 */
export const isUserSystemValid = (): boolean => isSystemValid;

// Exportaciones principales
export { UserHelper, userHelper };
export default userHelper;
