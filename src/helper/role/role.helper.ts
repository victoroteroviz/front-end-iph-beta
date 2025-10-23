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
 *
 * @version 2.0.0
 * @features
 * - ✅ Validación de roles externos (props)
 * - ✅ Validación de roles desde sessionStorage
 * - ✅ API simple para componentes y servicios
 * - ✅ Compatibilidad con código existente
 */

import { logInfo, logError, logWarning } from '../log/logger.helper';
import {
  hasRole as configHasRole,
  hasHierarchicalAccess as configHasHierarchicalAccess,
  getRoleLevel,
  getValidRoles,
  getSystemRoleTypes,
  getSystemRoleDefinition,
  isSuperAdmin as configIsSuperAdmin,
  isAdmin as configIsAdmin,
  isSuperior as configIsSuperior,
  isElemento as configIsElemento,
  canAccessSuperAdmin as configCanAccessSuperAdmin,
  canAccessAdmin as configCanAccessAdmin,
  canAccessSuperior as configCanAccessSuperior,
  canAccessElemento as configCanAccessElemento
} from '../../config/permissions.config';
import { ALLOWED_ROLES } from '../../config/env.config';
import type { IRole } from '../../interfaces/role/role.interface';
import type { SystemRoleType, RoleConfig } from '../../config/permissions.config';

/**
 * Interface para el contexto de usuario con roles
 */
export interface UserRoleContext {
  userId?: string;
  roles: IRole[];
}

/**
 * Interface para resultado de validación
 */
export interface RoleValidationResult {
  isValid: boolean;
  message: string;
  matchedRole?: string;
  userRoles?: string[];
}

/**
 * Obtiene nombres de roles dinámicamente desde la configuración
 * @returns Array con nombres de roles disponibles
 */
export const getRoleNames = (): string[] => getSystemRoleTypes();

/**
 * Obtiene roles completos dinámicamente desde la configuración (.env)
 * @returns Array con roles permitidos según ALLOWED_ROLES
 */
export const getSystemRoles = (): IRole[] => {
  if (!Array.isArray(ALLOWED_ROLES)) {
    logWarning('RoleHelper', 'ALLOWED_ROLES no es un array válido');
    return [];
  }
  return ALLOWED_ROLES as IRole[];
};

/**
 * Type helper para nombres de roles (dinámico)
 */
export type RoleName = string;

/**
 * Clase principal del Role Helper
 * Implementa patrón Singleton para consistencia global
 */
class RoleHelper {
  private static instance: RoleHelper;
  private readonly STORAGE_KEYS = {
    ROLES: 'roles',
    USER_DATA: 'user_data'
  } as const;

  private constructor() {}

  /**
   * Obtiene la instancia única del Role Helper (Singleton)
   */
  public static getInstance(): RoleHelper {
    if (!RoleHelper.instance) {
      RoleHelper.instance = new RoleHelper();
    }
    return RoleHelper.instance;
  }

  /**
   * Obtiene los roles del usuario desde sessionStorage
   * 
   * @returns Array de roles o array vacío si no hay datos
   */
  public getUserRoles(): IRole[] {
    try {
      const rolesData = sessionStorage.getItem(this.STORAGE_KEYS.ROLES);
      if (!rolesData) return [];

      const roles: IRole[] = JSON.parse(rolesData);
      return Array.isArray(roles) ? roles : [];

    } catch (error) {
      logError('RoleHelper', error, 'Error obteniendo roles del usuario');
      return [];
    }
  }

  /**
   * Obtiene el contexto completo del usuario con roles
   * 
   * @returns Contexto del usuario o null si no hay datos
   */
  public getUserRoleContext(): UserRoleContext | null {
    try {
      const userData = sessionStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      const roles = this.getUserRoles();

      if (!userData || roles.length === 0) return null;

      const user = JSON.parse(userData);
      return {
        userId: user.id,
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
   * 
   * @param requiredRoleName - Nombre del rol requerido
   * @param userRoles - Roles del usuario (opcional)
   * @returns true si tiene acceso jerárquico
   */
  public hasHierarchicalAccess(requiredRoleName: string, userRoles?: IRole[]): boolean {
    try {
      const roles = userRoles || this.getUserRoles();
      
      // Verificar si tiene el rol exacto
      if (roles.some(role => role.nombre === requiredRoleName)) {
        return true;
      }

      // Verificar acceso jerárquico para cada rol del usuario
      return roles.some(userRole =>
        hasHierarchicalAccess([userRole], requiredRoleName as SystemRoleType)
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
   *
   * @param roles - Roles a validar (pueden venir de props externos)
   * @returns Array de roles válidos o array vacío si ninguno es válido
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

      // Comparar contra ALLOWED_ROLES desde .env (fuente de verdad)
      const systemRoles = ALLOWED_ROLES as IRole[];

      if (!Array.isArray(systemRoles) || systemRoles.length === 0) {
        logError('RoleHelper', new Error('ALLOWED_ROLES no configurado'), 'ALLOWED_ROLES vacío o inválido');
        return [];
      }

      const validRoles = roles.filter(externalRole =>
        systemRoles.some((systemRole: IRole) =>
          systemRole.id === externalRole.id &&
          systemRole.nombre === externalRole.nombre
        )
      );

      if (validRoles.length === 0) {
        logWarning('RoleHelper', 'Ningún rol externo es válido según ALLOWED_ROLES', {
          rolesRecibidos: roles,
          rolesPermitidos: systemRoles
        });
      } else {
        logInfo('RoleHelper', `${validRoles.length} rol(es) externo(s) validado(s)`, { validRoles });
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

// Logging de inicialización
logInfo('RoleHelper', 'Role Helper inicializado correctamente', {
  availableRoles: getSystemRoleTypes(),
  totalRoles: getSystemRoles().length
});

// Exportaciones principales
export { RoleHelper, roleHelper };
export default roleHelper;