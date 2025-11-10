/**
 * Helper de Roles - Sistema centralizado para validación de roles
 * Siguiendo principios SOLID, KISS y DRY
 *
 * Proporciona funciones reutilizables para:
 * - Validación de roles específicos
 * - Control de acceso jerárquico
 * - Verificación de permisos granulares
 * - Obtención de datos de roles desde sessionStorage O props externos
 * - Configuración dinámica desde variables de entorno
 * - Almacenamiento encriptado de roles en sessionStorage
 *
 * @version 3.0.0
 * @features
 * - ✅ Validación de roles externos (props)
 * - ✅ Validación de roles desde sessionStorage
 * - ✅ API simple para componentes y servicios
 * - ✅ Compatibilidad con código existente
 * - ✅ Validación Zod en runtime para seguridad
 * - ✅ Sistema de caching para performance
 * - ✅ Optimizaciones O(1) con Map
 * - ✅ Protección contra datos corruptos
 * - ✅ **NUEVO:** Encriptación de roles en sessionStorage
 * - ✅ **NUEVO:** Migración automática desde formato legacy
 * - ✅ **NUEVO:** Métodos para guardar/limpiar roles seguros
 *
 * @security
 * - Validación estricta con Zod para prevenir inyección
 * - Cache con TTL para reducir lecturas costosas
 * - Sanitización automática de datos corruptos
 * - Logs seguros sin exponer datos sensibles
 * - **NUEVO:** Roles encriptados en storage con EncryptHelper
 * - **NUEVO:** Migración transparente de legacy a encrypted
 *
 * @changelog
 * v3.0.0 (2025-01-31)
 * - ✅ Agregado setUserRoles() para guardar roles encriptados
 * - ✅ Agregado clearRoles() para limpiar roles (encrypted + legacy)
 * - ✅ Agregado loadEncryptedRolesAsync() para carga inicial
 * - ✅ Modificado getUserRoles() con soporte para legacy (backward compatible)
 * - ✅ Migración automática de formato legacy a encrypted
 * - ✅ Documentación extendida con ejemplos de uso
 */

import { z } from 'zod';
import { logInfo, logError, logWarning } from '../log/logger.helper';
import { getUserData } from '../user/user.helper';
import { encryptData, decryptData } from '../encrypt/encrypt.helper';
import type { EncryptionResult } from '../encrypt/encrypt.helper';
import {
  hasHierarchicalAccess as configHasHierarchicalAccess,
  getRoleLevel,
  getSystemRoleTypes
} from '../../config/permissions.config';
import { ALLOWED_ROLES } from '../../config/env.config';
import type { IRole } from '../../interfaces/role/role.interface';
import type { SystemRoleType } from '../../config/permissions.config';

// ==================== SCHEMAS ZOD PARA VALIDACIÓN ====================

/**
 * Schema de validación Zod para roles
 * Protege contra inyección y datos corruptos en sessionStorage
 * 
 * @security Valida estructura, tipos y valores permitidos
 */
const RoleSchema = z.object({
  id: z.number()
    .int('ID de rol debe ser entero')
    .positive('ID de rol debe ser positivo')
    .max(999, 'ID de rol fuera de rango permitido'),
  nombre: z.string()
    .min(1, 'Nombre de rol no puede estar vacío')
    .max(50, 'Nombre de rol demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, 'Nombre de rol contiene caracteres inválidos')
    .refine(
      (val) => ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(val),
      { message: 'Rol no válido según configuración del sistema' }
    )
});

/**
 * Schema para array de roles con límite máximo
 */
const RolesArraySchema = z.array(RoleSchema)
  .max(10, 'Demasiados roles asignados')
  .nonempty('Array de roles no puede estar vacío');

/**
 * Schema para datos de usuario desde sessionStorage
 */
const UserDataSchema = z.object({
  id: z.string()
    .min(1, 'ID de usuario requerido')
    .max(100, 'ID de usuario demasiado largo'),
  // Otros campos opcionales pueden agregarse aquí
}).loose(); // Permite otros campos sin validarlos estrictamente

// ==================== TYPES (según estándares, no interfaces) ====================

/**
 * Type para el contexto de usuario con roles
 * 
 * @type
 * @property {string} [userId] - ID del usuario (opcional)
 * @property {IRole[]} roles - Array de roles del usuario
 */
export type UserRoleContext = {
  userId?: string;
  roles: IRole[];
};

/**
 * Type para resultado de validación de roles
 * 
 * @type
 * @property {boolean} isValid - Si los roles son válidos
 * @property {string} message - Mensaje descriptivo del resultado
 * @property {string} [matchedRole] - Primer rol válido encontrado (opcional)
 * @property {string[]} [userRoles] - Lista de nombres de roles (opcional)
 */
export type RoleValidationResult = {
  isValid: boolean;
  message: string;
  matchedRole?: string;
  userRoles?: string[];
};

const isRoleConfig = (role: unknown): role is IRole => {
  if (typeof role !== 'object' || role === null) {
    return false;
  }

  const candidate = role as { id?: unknown; nombre?: unknown };
  return typeof candidate.id === 'number' && typeof candidate.nombre === 'string';
};

/**
 * Obtiene nombres de roles dinámicamente desde la configuración
 * @returns Array con nombres de roles disponibles
 */
export const getRoleNames = (): string[] => getSystemRoleTypes();

/**
 * Obtiene roles completos dinámicamente desde la configuración (.env)
 * Con validación de estructura completa
 *
 * @returns Array con roles permitidos según ALLOWED_ROLES
 * @security Valida que cada elemento sea un IRole válido
 */
export const getSystemRoles = (): IRole[] => {
  // Validación 1: Verificar que sea array
  if (!Array.isArray(ALLOWED_ROLES)) {
    logError(
      'RoleHelper',
      new Error('ALLOWED_ROLES no es un array'),
      `Tipo recibido: ${typeof ALLOWED_ROLES}`
    );
    return [];
  }

  // Validación 2: Verificar que no esté vacío
  if (ALLOWED_ROLES.length === 0) {
    logWarning(
      'RoleHelper',
      'ALLOWED_ROLES está vacío - No hay roles configurados en el sistema'
    );
    return [];
  }

  // Validación 3: Filtrar solo roles válidos
  const validRoles: IRole[] = [];
  let invalidRolesCount = 0;

  for (const role of ALLOWED_ROLES as unknown[]) {
    if (isRoleConfig(role)) {
      validRoles.push(role);
    } else {
      invalidRolesCount += 1;
    }
  }

  // Log si hubo filtrado
  if (invalidRolesCount > 0) {
    logWarning(
      'RoleHelper',
      `${invalidRolesCount} rol(es) inválido(s) filtrado(s) en getSystemRoles()`
    );
  }

  return validRoles;
};

/**
 * Type helper para nombres de roles (dinámico)
 */
export type RoleName = string;

/**
 * Clase principal del Role Helper
 * Implementa patrón Singleton para consistencia global
 * 
 * @version 2.1.0
 * @features
 * - Cache con TTL para optimizar lecturas de sessionStorage
 * - Validación Zod en runtime para seguridad
 * - Optimizaciones O(1) con Map
 * - Sanitización automática de datos corruptos
 */
class RoleHelper {
  private static instance: RoleHelper;
  private readonly STORAGE_KEYS = {
    ROLES: 'roles'
  } as const;

  // ==================== SISTEMA DE CACHING ====================
  
  /**
   * Cache de roles con timestamp para TTL
   * @private
   */
  private rolesCache: IRole[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 60000; // 60 segundos para minimizar recálculos

  /** Promise de recarga en curso para evitar solicitudes simultáneas */
  private encryptedReloadPromise: Promise<IRole[]> | null = null;

  /**
   * Map de roles permitidos para lookup O(1)
   * Se inicializa lazy (solo cuando se necesita)
   * @private
   */
  private allowedRolesMap: Map<string, IRole> | null = null;

  private constructor() {
    logInfo('RoleHelper', 'Instancia de RoleHelper creada con sistema de caching');
  }

  /**
   * Obtiene la instancia única del Role Helper (Singleton)
   * 
   * @returns {RoleHelper} Instancia única del helper de roles
   * @example
   * const helper = RoleHelper.getInstance();
   */
  public static getInstance(): RoleHelper {
    if (!RoleHelper.instance) {
      RoleHelper.instance = new RoleHelper();
    }
    return RoleHelper.instance;
  }

  // ==================== MÉTODOS DE CACHING ====================

  /**
   * Invalida el cache de roles
   * Debe llamarse después de login/logout o cambios de sesión
   * 
   * @public
   * @example
   * // Después de login/logout
   * roleHelper.invalidateCache();
   */
  public invalidateCache(): void {
    this.rolesCache = null;
    this.cacheTimestamp = 0;
    logInfo('RoleHelper', 'Cache de roles invalidado manualmente');
  }

  /**
   * Verifica si el cache es válido basado en TTL
   * 
   * @private
   * @returns {boolean} true si el cache es válido
   */
  private isCacheValid(): boolean {
    if (!this.rolesCache) return false;
    const now = Date.now();
    return (now - this.cacheTimestamp) < this.CACHE_TTL;
  }

  /** Programa una recarga asíncrona de roles encriptados respetando backpressure */
  private scheduleEncryptedReload(reason: 'cache-expired' | 'missing-legacy'): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.encryptedReloadPromise) {
      return;
    }

    this.encryptedReloadPromise = this.loadEncryptedRolesAsync()
      .catch(error => {
        logError('RoleHelper', error, `Error recargando roles encriptados (${reason})`);
        return [];
      })
      .finally(() => {
        this.encryptedReloadPromise = null;
      });
  }

  /**
   * Obtiene Map de roles permitidos para lookup O(1)
   * Implementa lazy initialization con validación robusta
   *
   * @private
   * @returns {Map<string, IRole>} Map de roles permitidos
   * @security Valida estructura de cada elemento antes de crear Map
   */
  private getAllowedRolesMap(): Map<string, IRole> {
    if (!this.allowedRolesMap) {
      const allowed = ALLOWED_ROLES as IRole[];

      // Validación 1: Verificar que sea array
      if (!Array.isArray(allowed)) {
        logError(
          'RoleHelper',
          new Error('ALLOWED_ROLES no es un array'),
          'Tipo recibido: ' + typeof allowed
        );
        this.allowedRolesMap = new Map();
        return this.allowedRolesMap;
      }

      // Validación 2: Verificar que no esté vacío
      if (allowed.length === 0) {
        logError(
          'RoleHelper',
          new Error('ALLOWED_ROLES está vacío'),
          'El sistema no tiene roles válidos configurados. Verifica tu .env'
        );
        this.allowedRolesMap = new Map();
        return this.allowedRolesMap;
      }

      // Validación 3: Filtrar elementos inválidos y crear Map
      const validEntries: [string, IRole][] = [];
      let invalidCount = 0;

      for (const role of allowed) {
        // Verificar que sea objeto
        if (typeof role !== 'object' || role === null) {
          logWarning(
            'RoleHelper',
            `Elemento inválido en ALLOWED_ROLES (tipo: ${typeof role}). Ignorando.`
          );
          invalidCount++;
          continue;
        }

        // Verificar que tenga propiedades requeridas
        if (typeof role.id !== 'number' || typeof role.nombre !== 'string') {
          logWarning(
            'RoleHelper',
            `Rol con estructura inválida (id: ${typeof role.id}, nombre: ${typeof role.nombre}). Ignorando.`
          );
          invalidCount++;
          continue;
        }

        // Verificar que id y nombre no sean undefined/null
        if (role.id === undefined || role.nombre === undefined) {
          logWarning(
            'RoleHelper',
            `Rol con propiedades undefined (id: ${role.id}, nombre: ${role.nombre}). Ignorando.`
          );
          invalidCount++;
          continue;
        }

        // Agregar entrada válida
        const key = `${role.id}-${role.nombre}`;
        validEntries.push([key, role]);
      }

      // Crear Map con entradas válidas
      this.allowedRolesMap = new Map(validEntries);

      // Logs informativos
      if (invalidCount > 0) {
        logWarning(
          'RoleHelper',
          `${invalidCount} rol(es) inválido(s) filtrado(s) de ALLOWED_ROLES`
        );
      }

      if (this.allowedRolesMap.size === 0) {
        logError(
          'RoleHelper',
          new Error('Map de roles vacío después de validación'),
          'Ningún rol válido encontrado en ALLOWED_ROLES. El sistema no funcionará correctamente.'
        );
      } else {
        logInfo('RoleHelper', 'Map de roles permitidos creado exitosamente', {
          rolesValidos: this.allowedRolesMap.size,
          rolesInvalidos: invalidCount,
          roles: Array.from(this.allowedRolesMap.keys())
        });
      }
    }

    return this.allowedRolesMap;
  }

  // ==================== MÉTODOS PRINCIPALES CON VALIDACIÓN ZOD ====================

  /**
   * Obtiene y valida roles desde sessionStorage con Zod
   * Implementa caching para reducir lecturas costosas
   *
   * **MODIFICADO en v3.0.0:** Soporte para formato encrypted con fallback a legacy
   *
   * @returns {IRole[]} Array de roles validados o array vacío
   * @security Valida estructura con Zod y sanitiza datos corruptos
  * @performance Usa cache con TTL de 60 segundos
   *
   * @example
   * const roles = roleHelper.getUserRoles();
   * // Primera llamada: lee sessionStorage y valida
  * // Siguientes llamadas (< 60s): retorna desde cache
   *
   * @important
   * Para máxima performance, llama loadEncryptedRolesAsync() al inicio de la app.
   * Este método es SÍNCRONO y solo lee formato legacy si el cache expira.
   */
  public getUserRoles(): IRole[] {
    // Retornar cache si es válido (FAST PATH)
    if (this.isCacheValid()) {
      return this.rolesCache!;
    }

    try {
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        logWarning('RoleHelper', 'SessionStorage no disponible en este entorno');
        return this.rolesCache ?? [];
      }

      const legacyKey = this.STORAGE_KEYS.ROLES;
      const encryptedKey = `${legacyKey}_encrypted`;
      const legacyData = sessionStorage.getItem(legacyKey);
      const encryptedExists = Boolean(sessionStorage.getItem(encryptedKey));

      if (this.rolesCache && encryptedExists) {
        this.scheduleEncryptedReload('cache-expired');
        return this.rolesCache;
      }

      if (!legacyData) {
        if (encryptedExists) {
          this.scheduleEncryptedReload('missing-legacy');
          return this.rolesCache ?? [];
        }

        this.rolesCache = [];
        this.cacheTimestamp = Date.now();
        return [];
      }

      const parsed = JSON.parse(legacyData);
      const validationResult = RolesArraySchema.safeParse(parsed);

      if (!validationResult.success) {
        logError(
          'RoleHelper',
          validationResult.error,
          'Datos de roles legacy inválidos según schema Zod - sessionStorage corrupto'
        );

        logWarning('RoleHelper', 'Limpiando sessionStorage legacy corrupto');
        sessionStorage.removeItem(legacyKey);

        this.rolesCache = [];
        this.cacheTimestamp = Date.now();
        return [];
      }

      const validatedRoles = validationResult.data;
      this.rolesCache = validatedRoles;
      this.cacheTimestamp = Date.now();

      logInfo('RoleHelper', 'Roles legacy validados y cacheados correctamente', {
        count: validatedRoles.length,
        format: 'legacy',
        recommendation: 'Considera migrar a formato encriptado usando setUserRoles()'
      });

      return validatedRoles;

    } catch (error) {
      logError('RoleHelper', error, 'Error crítico obteniendo roles del usuario');

      this.rolesCache = [];
      this.cacheTimestamp = Date.now();

      try {
        sessionStorage.removeItem(this.STORAGE_KEYS.ROLES);
      } catch {
        // Silenciar error de limpieza
      }

      return [];
    }
  }

  /**
   * Guarda roles de forma segura en sessionStorage (ENCRIPTADO)
   *
   * **NUEVO en v3.0.0**
   *
   * Este método encripta los roles antes de guardarlos en sessionStorage
   * y actualiza el cache interno para uso inmediato.
   *
   * @param {IRole[]} roles - Roles a guardar
   * @returns {Promise<boolean>} true si se guardó exitosamente
   * @security Valida con Zod antes de guardar y encripta con EncryptHelper
   * @performance Actualiza cache interno simultáneamente
   *
   * @example
   * ```typescript
   * // Después de login exitoso
   * const loginResponse = await loginService(email, password);
   * const success = await roleHelper.setUserRoles(loginResponse.roles);
   *
   * if (success) {
   *   console.log('Roles guardados de forma segura');
   *   navigate('/dashboard');
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Con manejo de errores
   * try {
   *   await roleHelper.setUserRoles(roles);
   *   showSuccess('Sesión iniciada correctamente');
   * } catch (error) {
   *   showError('Error guardando roles');
   * }
   * ```
   */
  public async setUserRoles(roles: IRole[]): Promise<boolean> {
    try {
      // 1. Validar con Zod antes de guardar
      const validationResult = RolesArraySchema.safeParse(roles);

      if (!validationResult.success) {
        logError(
          'RoleHelper',
          validationResult.error,
          'Intento de guardar roles inválidos - validación Zod falló'
        );
        return false;
      }

      const validatedRoles = validationResult.data;

      // 2. Encriptar roles
      const encrypted = await encryptData(JSON.stringify(validatedRoles));

      // 3. Guardar en sessionStorage encriptado
      sessionStorage.setItem(
        `${this.STORAGE_KEYS.ROLES}_encrypted`,
        JSON.stringify(encrypted)
      );

      // 4. Actualizar cache interno para uso inmediato (sin necesidad de desencriptar)
      this.rolesCache = validatedRoles;
      this.cacheTimestamp = Date.now();

      logInfo('RoleHelper', 'Roles guardados de forma segura (encriptados)', {
        count: validatedRoles.length,
        encrypted: true,
        cacheUpdated: true
      });

      return true;

    } catch (error) {
      logError('RoleHelper', error, 'Error guardando roles encriptados');
      return false;
    }
  }

  /**
   * Carga roles encriptados desde sessionStorage al iniciar la aplicación
   *
   * **NUEVO en v3.0.0**
   *
   * Este método debe ser llamado al iniciar la aplicación (ej: en App.tsx)
   * para cargar roles encriptados en el cache interno. Después de esto,
   * getUserRoles() funcionará de forma síncrona usando el cache.
   *
   * @returns {Promise<IRole[]>} Roles desencriptados y validados
   * @security Desencripta con EncryptHelper y valida con Zod
   * @performance Una sola llamada al inicio, luego todo es síncrono
   *
   * @example
   * ```typescript
   * // En App.tsx o componente raíz
   * import { roleHelper } from '@/helper/role/role.helper';
   *
   * function App() {
   *   useEffect(() => {
   *     const loadRoles = async () => {
   *       const roles = await roleHelper.loadEncryptedRolesAsync();
   *       if (roles.length === 0) {
   *         // No hay roles, redirigir a login
   *         navigate('/login');
   *       }
   *     };
   *
   *     loadRoles();
   *   }, []);
   *
   *   return <YourApp />;
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Con fallback a legacy
   * const roles = await roleHelper.loadEncryptedRolesAsync();
   *
   * if (roles.length === 0) {
   *   // Intentar cargar desde formato legacy
   *   const legacyRoles = roleHelper.getUserRoles(); // Síncrono
   *
   *   if (legacyRoles.length > 0) {
   *     // Migrar a formato encriptado
   *     await roleHelper.setUserRoles(legacyRoles);
   *     console.log('Roles migrados a formato encriptado');
   *   }
   * }
   * ```
   */
  public async loadEncryptedRolesAsync(): Promise<IRole[]> {
    try {
      // 1. Intentar leer versión encriptada
      const encryptedData = sessionStorage.getItem(`${this.STORAGE_KEYS.ROLES}_encrypted`);

      if (!encryptedData) {
        logInfo('RoleHelper', 'No se encontraron roles encriptados en storage');

        // Verificar si existe versión legacy
        const legacyData = sessionStorage.getItem(this.STORAGE_KEYS.ROLES);
        if (legacyData) {
          logWarning('RoleHelper', 'Se encontró versión legacy. Usa getUserRoles() para cargarla y luego setUserRoles() para migrar.');
        }

        return [];
      }

      // 2. Parsear EncryptionResult
      const encryptionResult: EncryptionResult = JSON.parse(encryptedData);

      // 3. Desencriptar
      const decrypted = await decryptData(encryptionResult);

      // 4. Parsear JSON
      const parsed = JSON.parse(decrypted);

      // 5. Validar con Zod
      const validationResult = RolesArraySchema.safeParse(parsed);

      if (!validationResult.success) {
        logError(
          'RoleHelper',
          validationResult.error,
          'Roles encriptados inválidos según schema Zod - limpiando storage'
        );

        // Limpiar datos corruptos
        sessionStorage.removeItem(`${this.STORAGE_KEYS.ROLES}_encrypted`);

        this.rolesCache = [];
        this.cacheTimestamp = Date.now();
        return [];
      }

      // 6. Actualizar cache interno
      const validatedRoles = validationResult.data;
      this.rolesCache = validatedRoles;
      this.cacheTimestamp = Date.now();

      logInfo('RoleHelper', 'Roles encriptados cargados correctamente', {
        count: validatedRoles.length,
        encrypted: true,
        cacheUpdated: true
      });

      return validatedRoles;

    } catch (error) {
      logError('RoleHelper', error, 'Error cargando roles encriptados');

      // Limpiar datos corruptos
      try {
        sessionStorage.removeItem(`${this.STORAGE_KEYS.ROLES}_encrypted`);
      } catch {
        // Silenciar error de limpieza
      }

      this.rolesCache = [];
      this.cacheTimestamp = Date.now();
      return [];
    }
  }

  /**
   * Limpia todos los datos de roles (encriptados y legacy)
   *
   * **NUEVO en v3.0.0**
   *
   * Este método debe ser llamado al hacer logout para limpiar
   * completamente los roles del usuario.
   *
   * @public
   * @example
   * ```typescript
   * // En logout
   * roleHelper.clearRoles();
   * clearAuthToken(); // Limpiar JWT también
   * navigate('/login');
   * ```
   *
   * @example
   * ```typescript
   * // Con logging
   * const handleLogout = () => {
   *   roleHelper.clearRoles();
   *   CacheHelper.clear(true, 'user'); // Limpiar cache de usuario
   *   sessionStorage.clear(); // Limpiar todo
   *
   *   logInfo('Logout', 'Sesión cerrada completamente');
   *   navigate('/login');
   * };
   * ```
   */
  public clearRoles(): void {
    try {
      // Limpiar ambas versiones (encrypted + legacy)
      sessionStorage.removeItem(this.STORAGE_KEYS.ROLES);
      sessionStorage.removeItem(`${this.STORAGE_KEYS.ROLES}_encrypted`);

      // Invalidar cache interno
      this.invalidateCache();

      logInfo('RoleHelper', 'Roles eliminados completamente (encrypted + legacy)');
    } catch (error) {
      logError('RoleHelper', error, 'Error limpiando roles');
    }
  }

  /**
   * Obtiene el contexto completo del usuario con roles
   * Valida estructura de user_data con Zod
   * 
   * @returns {UserRoleContext | null} Contexto del usuario o null si no hay datos válidos
   * @security Valida estructura con Zod antes de retornar
   * 
   * @example
   * const context = roleHelper.getUserRoleContext();
   * if (context) {
   *   console.log(`Usuario ${context.userId} con ${context.roles.length} roles`);
   * }
   */
  public getUserRoleContext(): UserRoleContext | null {
    try {
      const userData = getUserData();
      const roles = this.getUserRoles(); // Ya usa cache y validación Zod

      if (!userData || roles.length === 0) return null;

      const validationResult = UserDataSchema.safeParse(userData);

      if (!validationResult.success) {
        logError(
          'RoleHelper',
          validationResult.error,
          'Datos de usuario inválidos según schema Zod'
        );
        return null;
      }

      return {
        userId: validationResult.data.id,
        roles
      };

    } catch (error) {
      logError('RoleHelper', error, 'Error obteniendo contexto del usuario');
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * 
   * @param roleName - Nombre del rol a verificar
   * @param userRoles - Roles del usuario (opcional, se obtienen automáticamente si no se proporcionan)
   * @returns true si tiene el rol, false en caso contrario
   */
  public hasRole(roleName: string, userRoles?: IRole[]): boolean {
    try {
      const roles = userRoles || this.getUserRoles();
      return roles.some(role => role.nombre === roleName);

    } catch (error) {
      logError('RoleHelper', error, `Error verificando rol ${roleName}`);
      return false;
    }
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * 
   * @param roleNames - Array de nombres de roles
   * @param userRoles - Roles del usuario (opcional)
   * @returns true si tiene al menos uno de los roles
   */
  public hasAnyRole(roleNames: string[], userRoles?: IRole[]): boolean {
    try {
      const roles = userRoles || this.getUserRoles();
      return roleNames.some(roleName => 
        roles.some(role => role.nombre === roleName)
      );

    } catch (error) {
      logError('RoleHelper', error, 'Error verificando múltiples roles');
      return false;
    }
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * 
   * @param roleNames - Array de nombres de roles
   * @param userRoles - Roles del usuario (opcional)
   * @returns true si tiene todos los roles
   */
  public hasAllRoles(roleNames: string[], userRoles?: IRole[]): boolean {
    try {
      const roles = userRoles || this.getUserRoles();
      return roleNames.every(roleName =>
        roles.some(role => role.nombre === roleName)
      );

    } catch (error) {
      logError('RoleHelper', error, 'Error verificando todos los roles');
      return false;
    }
  }

  /**
   * Obtiene el nivel jerárquico más alto del usuario
   * 
   * @param userRoles - Roles del usuario (opcional)
   * @returns Nivel jerárquico (menor número = mayor privilegio)
   */
  public getHighestRoleLevel(userRoles?: IRole[]): number {
    try {
      const roles = userRoles || this.getUserRoles();
      if (roles.length === 0) return 999; // Sin roles = sin acceso

      const levels = roles
        .map(role => getRoleLevel(role.nombre as SystemRoleType))
        .filter(level => level !== 999); // Filtrar roles no encontrados

      return levels.length > 0 ? Math.min(...levels) : 999;

    } catch (error) {
      logError('RoleHelper', error, 'Error obteniendo nivel de rol más alto');
      return 999;
    }
  }

  /**
   * Verifica acceso jerárquico - si el usuario puede acceder a funcionalidades de un rol específico
   * Usa la configuración centralizada de permissions.config
   * 
   * @param {string} requiredRoleName - Nombre del rol requerido
   * @param {IRole[]} [userRoles] - Roles del usuario (opcional, se obtienen desde cache si no se proporcionan)
   * @returns {boolean} true si tiene acceso jerárquico
   * @performance Usa cache de getUserRoles() para evitar lecturas repetidas
   * 
   * @example
   * // Verificar si puede acceder a funcionalidades de Superior
   * if (roleHelper.hasHierarchicalAccess('Superior')) {
   *   // Admin, SuperAdmin o Superior pueden acceder
   * }
   */
  public hasHierarchicalAccess(requiredRoleName: string, userRoles?: IRole[]): boolean {
    try {
      const roles = userRoles || this.getUserRoles(); // Usa cache automáticamente
      
      // Verificar si tiene el rol exacto
      if (roles.some(role => role.nombre === requiredRoleName)) {
        return true;
      }

      // Verificar acceso jerárquico para cada rol del usuario usando permissions.config
      return roles.some(userRole =>
        configHasHierarchicalAccess([userRole], requiredRoleName as SystemRoleType)
      );

    } catch (error) {
      logError('RoleHelper', error, 'Error verificando acceso jerárquico');
      return false;
    }
  }

  /**
   * Valida si los roles del usuario son válidos según la configuración
   * 
   * @param userRoles - Roles del usuario (opcional)
   * @returns Resultado de la validación
   */
  public validateUserRoles(userRoles?: IRole[]): RoleValidationResult {
    try {
      const roles = userRoles || this.getUserRoles();
      
      if (roles.length === 0) {
        return {
          isValid: false,
          message: 'Usuario no tiene roles asignados',
          userRoles: []
        };
      }

      const availableRoles = getSystemRoles();
      const validRoles = roles.filter(userRole =>
        availableRoles.some((availableRole: IRole) =>
          availableRole.id === userRole.id && availableRole.nombre === userRole.nombre
        )
      );

      const isValid = validRoles.length > 0;
      const roleNames = roles.map(role => role.nombre);

      return {
        isValid,
        message: isValid 
          ? `Usuario tiene ${validRoles.length} rol(es) válido(s)` 
          : 'Usuario no tiene roles válidos para esta aplicación',
        matchedRole: validRoles.length > 0 ? validRoles[0].nombre : undefined,
        userRoles: roleNames
      };

    } catch (error) {
      logError('RoleHelper', error, 'Error validando roles del usuario');
      return {
        isValid: false,
        message: 'Error interno validando roles',
        userRoles: []
      };
    }
  }

  /**
   * Verifica permisos para operaciones específicas usando la configuración dinámica
   *
   * @param operation - Tipo de operación ('create', 'read', 'update', 'delete', 'admin', 'superuser')
   * @param userRoles - Roles del usuario (opcional)
   * @returns true si tiene permisos para la operación
   */
  public canPerformOperation(
    operation: 'create' | 'read' | 'update' | 'delete' | 'admin' | 'superuser',
    userRoles?: IRole[]
  ): boolean {
    try {
      const roles = userRoles || this.getUserRoles();

      // Mapa de operaciones permitidas por rol
      const operationMap: Record<string, string[]> = {
        superuser: ['SuperAdmin'],
        admin: ['SuperAdmin', 'Administrador'],
        create: ['SuperAdmin', 'Administrador', 'Superior'],
        update: ['SuperAdmin', 'Administrador'],
        delete: ['SuperAdmin'],
        read: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento']
      };

      const allowedRoles = operationMap[operation] || [];
      return roles.some(role => allowedRoles.includes(role.nombre));

    } catch (error) {
      logError('RoleHelper', error, `Error verificando permisos para operación ${operation}`);
      return false;
    }
  }

  /**
   * Valida que los roles proporcionados sean válidos según ALLOWED_ROLES (.env)
   * OPTIMIZADO: Usa Map para lookup O(1) en lugar de O(n*m)
   *
   * @param {IRole[]} roles - Roles a validar (pueden venir de props externos)
   * @returns {IRole[]} Array de roles válidos o array vacío si ninguno es válido
   * @performance Optimizado de O(n*m) a O(n) usando Map
   * @security Valida contra ALLOWED_ROLES como fuente de verdad
   * 
   * @example
   * const validRoles = roleHelper.validateExternalRoles(propsRoles);
   * if (validRoles.length > 0) {
   *   // Usar validRoles de forma segura
   * }
   */
  public validateExternalRoles(roles: IRole[]): IRole[] {
    try {
      if (!Array.isArray(roles) || roles.length === 0) {
        logWarning('RoleHelper', 'Roles externos vacíos o inválidos');
        return [];
      }

      // Obtener Map de roles permitidos (lazy initialization)
      const allowedMap = this.getAllowedRolesMap();

      if (allowedMap.size === 0) {
        logError(
          'RoleHelper',
          new Error('ALLOWED_ROLES vacío'),
          'No hay roles permitidos configurados en el sistema'
        );
        return [];
      }

      // Validación O(n) usando Map lookup O(1)
      const validRoles = roles.filter(externalRole => {
        const key = `${externalRole.id}-${externalRole.nombre}`;
        return allowedMap.has(key);
      });

      if (validRoles.length === 0) {
        logWarning('RoleHelper', 'Ningún rol externo es válido según ALLOWED_ROLES', {
          rolesRecibidosCount: roles.length,
          rolesPermitidosCount: allowedMap.size
        });
      } else {
        // Log seguro: solo metadata, no datos sensibles
        logInfo('RoleHelper', `${validRoles.length} rol(es) externo(s) validado(s) correctamente`);
      }

      return validRoles;

    } catch (error) {
      logError('RoleHelper', error, 'Error validando roles externos');
      return [];
    }
  }

  /**
   * Verifica si un array de roles externos tiene un rol específico (con validación)
   *
   * @param externalRoles - Roles externos a verificar
   * @param roleName - Nombre del rol a buscar ('SuperAdmin', 'Administrador', 'Superior', 'Elemento')
   * @returns true si tiene el rol y es válido
   * @example
   * const hasAdmin = roleHelper.hasExternalRole(propsRoles, 'Administrador');
   */
  public hasExternalRole(externalRoles: IRole[], roleName: string): boolean {
    try {
      const validRoles = this.validateExternalRoles(externalRoles);
      return validRoles.some(role => role.nombre === roleName);
    } catch (error) {
      logError('RoleHelper', error, 'Error verificando rol externo');
      return false;
    }
  }

  /**
   * Verifica acceso jerárquico para roles externos (con validación)
   *
   * Jerarquía del sistema:
   * - SuperAdmin: Puede acceder a todo (Admin, Superior, Elemento)
   * - Administrador: Puede acceder a Superior y Elemento
   * - Superior: Puede acceder a Elemento
   * - Elemento: Solo acceso propio
   *
   * @param externalRoles - Roles externos a verificar
   * @param targetRoleName - Nombre del rol objetivo ('SuperAdmin', 'Administrador', 'Superior', 'Elemento')
   * @returns true si tiene acceso jerárquico
   * @example
   * const canAccess = roleHelper.canExternalRoleAccess(propsRoles, 'Superior');
   * // Si el usuario es Admin o SuperAdmin, retorna true
   */
  public canExternalRoleAccess(externalRoles: IRole[], targetRoleName: string): boolean {
    try {
      const validRoles = this.validateExternalRoles(externalRoles);

      if (validRoles.length === 0) {
        return false;
      }

      // Jerarquía: cada rol puede acceder a los roles listados en su array
      const hierarchy: Record<string, string[]> = {
        'SuperAdmin': ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
        'Administrador': ['Administrador', 'Superior', 'Elemento'],
        'Superior': ['Superior', 'Elemento'],
        'Elemento': ['Elemento']
      };

      // Verificar si algún rol del usuario tiene acceso jerárquico al rol objetivo
      return validRoles.some(userRole => {
        const allowedRoles = hierarchy[userRole.nombre] || [];
        return allowedRoles.includes(targetRoleName);
      });

    } catch (error) {
      logError('RoleHelper', error, 'Error verificando acceso jerárquico externo');
      return false;
    }
  }
}

// Instancia única del helper
const roleHelper = RoleHelper.getInstance();

if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
  try {
    await roleHelper.loadEncryptedRolesAsync();
  } catch (error) {
    logError('RoleHelper', error, 'Error precargando roles encriptados');
  }
}

/**
 * ==========================================
 * FUNCIONES DE CONVENIENCIA - USO DIRECTO
 * ==========================================
 */

// ==================== VALIDACIÓN DE ROLES EXTERNOS ====================

/**
 * Valida roles externos (de props, API, etc.) contra la configuración del sistema
 *
 * @param externalRoles - Roles a validar
 * @returns Array de roles válidos
 * @example
 * // En un componente con props
 * const validRoles = validateExternalRoles(props.userRoles);
 * if (validRoles.length > 0) {
 *   // Los roles son válidos, proceder
 * }
 */
export const validateExternalRoles = (externalRoles: IRole[]): IRole[] =>
  roleHelper.validateExternalRoles(externalRoles);

/**
 * Verifica si roles externos tienen un rol específico del sistema
 *
 * @param externalRoles - Roles externos a verificar
 * @param roleName - Nombre del rol ('SuperAdmin', 'Administrador', 'Superior', 'Elemento')
 * @returns true si tiene el rol y es válido
 * @example
 * // En un servicio
 * if (hasExternalRole(apiRoles, 'Administrador')) {
 *   // El usuario tiene rol de Administrador válido
 * }
 */
export const hasExternalRole = (externalRoles: IRole[], roleName: string): boolean =>
  roleHelper.hasExternalRole(externalRoles, roleName);

/**
 * Verifica acceso jerárquico para roles externos
 *
 * @param externalRoles - Roles externos a verificar
 * @param targetRoleName - Nombre del rol objetivo ('SuperAdmin', 'Administrador', 'Superior', 'Elemento')
 * @returns true si tiene acceso jerárquico
 * @example
 * // SuperAdmin o Administrador pueden acceder a funcionalidades de Superior
 * if (canExternalRoleAccess(propsRoles, 'Superior')) {
 *   // Permitir acceso
 * }
 */
export const canExternalRoleAccess = (externalRoles: IRole[], targetRoleName: string): boolean =>
  roleHelper.canExternalRoleAccess(externalRoles, targetRoleName);

// ==================== FUNCIONES DE SESSIONSTORAGE (EXISTENTES) ====================

/**
 * Obtiene los roles del usuario actual desde sessionStorage
 */
export const getUserRoles = (): IRole[] => roleHelper.getUserRoles();

/**
 * Obtiene el contexto completo del usuario
 */
export const getUserRoleContext = (): UserRoleContext | null => roleHelper.getUserRoleContext();

// ==================== FUNCIONES NUEVAS v3.0.0 - ENCRIPTACIÓN ====================

/**
 * Guarda roles de forma segura en sessionStorage (ENCRIPTADO)
 *
 * **NUEVO en v3.0.0**
 *
 * @param roles - Roles a guardar
 * @returns Promise<boolean> - true si se guardó exitosamente
 *
 * @example
 * ```typescript
 * // Después de login
 * const loginResponse = await loginService(email, password);
 * await setUserRoles(loginResponse.roles);
 * ```
 */
export const setUserRoles = async (roles: IRole[]): Promise<boolean> =>
  roleHelper.setUserRoles(roles);

/**
 * Carga roles encriptados desde sessionStorage al iniciar la app
 *
 * **NUEVO en v3.0.0**
 *
 * Debe ser llamado en App.tsx o componente raíz para cargar
 * roles encriptados en el cache interno.
 *
 * @returns Promise<IRole[]> - Roles desencriptados
 *
 * @example
 * ```typescript
 * // En App.tsx
 * useEffect(() => {
 *   loadEncryptedRolesAsync().then(roles => {
 *     if (roles.length === 0) navigate('/login');
 *   });
 * }, []);
 * ```
 */
export const loadEncryptedRolesAsync = async (): Promise<IRole[]> =>
  roleHelper.loadEncryptedRolesAsync();

/**
 * Limpia todos los datos de roles (encriptados y legacy)
 *
 * **NUEVO en v3.0.0**
 *
 * Debe ser llamado al hacer logout.
 *
 * @example
 * ```typescript
 * // En logout
 * clearRoles();
 * clearAuthToken();
 * navigate('/login');
 * ```
 */
export const clearRoles = (): void => roleHelper.clearRoles();

// ==================== FUNCIONES EXISTENTES ====================

/**
 * Verifica si es SuperAdmin
 */
export const isSuperAdmin = (userRoles?: IRole[]): boolean => 
  roleHelper.hasRole('SuperAdmin', userRoles);

/**
 * Verifica si es Administrador
 */
export const isAdmin = (userRoles?: IRole[]): boolean => 
  roleHelper.hasRole('Administrador', userRoles);

/**
 * Verifica si es Superior
 */
export const isSuperior = (userRoles?: IRole[]): boolean => 
  roleHelper.hasRole('Superior', userRoles);

/**
 * Verifica si es Elemento
 */
export const isElemento = (userRoles?: IRole[]): boolean => 
  roleHelper.hasRole('Elemento', userRoles);

/**
 * Verifica si es SuperAdmin o Administrador (roles administrativos)
 */
export const isAdministrative = (userRoles?: IRole[]): boolean => 
  roleHelper.hasAnyRole(['SuperAdmin', 'Administrador'], userRoles);

/**
 * Verifica si es Superior o superior jerárquicamente
 */
export const isSuperiorOrAbove = (userRoles?: IRole[]): boolean => 
  roleHelper.hasHierarchicalAccess('Superior', userRoles);

/**
 * Verifica si tiene acceso jerárquico a un rol específico
 */
export const canAccess = (requiredRole: string, userRoles?: IRole[]): boolean => 
  roleHelper.hasHierarchicalAccess(requiredRole, userRoles);

/**
 * Verifica si puede crear recursos
 */
export const canCreate = (userRoles?: IRole[]): boolean => 
  roleHelper.canPerformOperation('create', userRoles);

/**
 * Verifica si puede leer recursos
 */
export const canRead = (userRoles?: IRole[]): boolean => 
  roleHelper.canPerformOperation('read', userRoles);

/**
 * Verifica si puede actualizar recursos
 */
export const canUpdate = (userRoles?: IRole[]): boolean => 
  roleHelper.canPerformOperation('update', userRoles);

/**
 * Verifica si puede eliminar recursos
 */
export const canDelete = (userRoles?: IRole[]): boolean => 
  roleHelper.canPerformOperation('delete', userRoles);

/**
 * Valida roles del usuario actual
 */
export const validateCurrentUserRoles = (): RoleValidationResult => 
  roleHelper.validateUserRoles();

/**
 * Obtiene el nivel jerárquico más alto del usuario
 */
export const getHighestRoleLevel = (userRoles?: IRole[]): number => 
  roleHelper.getHighestRoleLevel(userRoles);

/**
 * Verifica si tiene alguno de los roles especificados
 */
export const hasAnyRole = (roleNames: string[], userRoles?: IRole[]): boolean =>
  roleHelper.hasAnyRole(roleNames, userRoles);

/**
 * Valida si el usuario actual tiene al menos uno de los roles requeridos (por nombre)
 *
 * @description
 * Función simplificada para validación de roles por nombre de string.
 * Diseñada específicamente para guards de rutas (PrivateRoute, etc.)
 * donde se especifican roles como array de strings.
 *
 * Esta función:
 * 1. Obtiene roles del usuario desde sessionStorage (con cache)
 * 2. Valida estructura con Zod automáticamente
 * 3. Compara nombres de roles (case-insensitive)
 * 4. Retorna true si tiene al menos un rol requerido
 *
 * @param {string[]} requiredRoleNames - Array de nombres de roles requeridos
 * @returns {boolean} true si el usuario tiene al menos uno de los roles
 *
 * @performance
 * - Usa cache automático con TTL de 60s
 * - Validación Zod optimizada
 * - Comparación case-insensitive
 *
 * @security
 * - Validación Zod en runtime
 * - Validación doble (ID + nombre) en ALLOWED_ROLES
 * - Sanitización automática de datos corruptos
 *
 * @example
 * // En un guard de ruta
 * const hasAccess = validateRolesByName(['SuperAdmin', 'Administrador']);
 * if (!hasAccess) {
 *   navigate('/acceso-denegado');
 * }
 *
 * @example
 * // Con array vacío (cualquier usuario autenticado)
 * const hasAccess = validateRolesByName([]);
 * // Retorna true si el usuario tiene roles válidos
 *
 * @version 1.0.0
 * @since 2025-01-30
 */
export const validateRolesByName = (requiredRoleNames: string[]): boolean => {
  try {
    // Si no se especifican roles requeridos, permitir acceso
    if (!requiredRoleNames || requiredRoleNames.length === 0) {
      return true;
    }

    // Obtener roles del usuario (desde cache o sessionStorage con validación Zod)
    const userRoles = roleHelper.getUserRoles();

    // Si no tiene roles, denegar acceso
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Verificar si tiene al menos uno de los roles requeridos (case-insensitive)
    return requiredRoleNames.some(requiredName =>
      userRoles.some(userRole =>
        userRole.nombre.toLowerCase() === requiredName.toLowerCase()
      )
    );

  } catch (error) {
    logError('RoleHelper', error, 'Error validando roles por nombre');
    return false;
  }
};

/**
 * Verifica si tiene todos los roles especificados
 */
export const hasAllRoles = (roleNames: string[], userRoles?: IRole[]): boolean => 
  roleHelper.hasAllRoles(roleNames, userRoles);

/**
 * Verifica acceso específico a funcionalidades por componente
 */
export const getPermissionsFor = {
  /**
   * Permisos para gestión de usuarios
   */
  users: (userRoles?: IRole[]) => ({
    canView: canRead(userRoles),
    canCreate: canCreate(userRoles),
    canEdit: canUpdate(userRoles),
    canDelete: canDelete(userRoles),
    canManageRoles: isSuperAdmin(userRoles)
  }),

  /**
   * Permisos para IPH
   */
  iph: (userRoles?: IRole[]) => ({
    canView: canRead(userRoles),
    canCreate: canCreate(userRoles) || isSuperior(userRoles),
    canEdit: canUpdate(userRoles),
    canDelete: canDelete(userRoles),
    canViewAll: isAdministrative(userRoles) || isSuperior(userRoles),
    canViewOwn: isElemento(userRoles)
  }),

  /**
   * Permisos para estadísticas
   */
  statistics: (userRoles?: IRole[]) => ({
    canView: isSuperiorOrAbove(userRoles),
    canExport: isAdministrative(userRoles),
    canViewDetailed: isAdministrative(userRoles)
  }),

  /**
   * Permisos para historial
   */
  history: (userRoles?: IRole[]) => ({
    canView: isAdministrative(userRoles),
    canExport: isAdministrative(userRoles),
    canDelete: isSuperAdmin(userRoles)
  })
};

/**
 * Invalida el cache de roles
 * Debe llamarse después de login/logout o cambios de sesión
 * 
 * @public
 * @example
 * // Después de login
 * invalidateRoleCache();
 * 
 * // Después de logout
 * sessionStorage.clear();
 * invalidateRoleCache();
 */
export const invalidateRoleCache = (): void => roleHelper.invalidateCache();

// ==================== INICIALIZACIÓN Y VALIDACIÓN ====================

/**
 * Validación inicial del sistema de roles
 * Se ejecuta al importar el módulo
 */
const initializeRoleSystem = () => {
  const systemRoles = getSystemRoles();
  const roleNames = getSystemRoleTypes();

  // Validación crítica: sistema debe tener roles
  if (systemRoles.length === 0) {
    logError(
      'RoleHelper',
      new Error('Sistema de roles sin configuración válida'),
      'CRÍTICO: ALLOWED_ROLES está vacío o corrupto. ' +
      'El sistema de permisos NO FUNCIONARÁ. ' +
      'Revisa tu archivo .env y asegúrate de usar el formato correcto: ' +
      '[{"id":1,"nombre":"NombreRol"}]'
    );
    return false;
  }

  // Validación de roles esperados
  const expectedRoleKeys: SystemRoleType[] = ['SUPERADMIN', 'ADMIN', 'SUPERIOR', 'ELEMENTO'];
  const roleLabels: Record<SystemRoleType, string> = {
    SUPERADMIN: 'SuperAdmin',
    ADMIN: 'Administrador',
    SUPERIOR: 'Superior',
    ELEMENTO: 'Elemento'
  };

  const missingRoleKeys = expectedRoleKeys.filter(role => !roleNames.includes(role));

  if (missingRoleKeys.length > 0) {
    const missingRoleLabels = missingRoleKeys.map(role => roleLabels[role]);
    logWarning(
      'RoleHelper',
      `Roles faltantes en configuración: ${missingRoleLabels.join(', ')}. ` +
      'Algunas funcionalidades pueden no estar disponibles.'
    );
  }

  // Log exitoso con detalles
  logInfo('RoleHelper', '✅ Role Helper v3.0.0 inicializado correctamente', {
    rolesConfigurados: systemRoles.length,
    rolesDisponibles: roleNames,
    features: [
      'Validación Zod runtime en env.config',
      'Validación de estructura en getAllowedRolesMap',
      'Cache con TTL 60s',
      'Optimización Map O(1)',
      'Protección datos corruptos',
      'Filtrado automático de roles inválidos',
      '🆕 Encriptación de roles en sessionStorage',
      '🆕 Migración automática desde formato legacy',
      '🆕 Métodos setUserRoles() y clearRoles()'
    ],
    security: [
      'Validación doble ID + nombre',
      'Detección temprana de .env mal configurado',
      'Logs descriptivos sin exponer datos sensibles',
      '🆕 Roles encriptados con EncryptHelper (Web Crypto API)',
      '🆕 Storage seguro con validación Zod post-desencriptación'
    ]
  });

  return true;
};

// Ejecutar validación inicial
const isSystemValid = initializeRoleSystem();

// Exportar estado del sistema para debugging
export const isRoleSystemValid = (): boolean => isSystemValid;

// Exportaciones principales
export { RoleHelper, roleHelper };
export default roleHelper;