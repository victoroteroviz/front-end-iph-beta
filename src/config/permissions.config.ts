/**
 * Configuración de Permisos - Sistema híbrido hardcodeado pero flexible
 * Estructura hardcodeada para DX óptimo con validación dinámica contra ALLOWED_ROLES
 * 
 * Características:
 * - Roles hardcodeados para TypeScript y autocompletado
 * - Jerarquía automática por orden de definición
 * - Validación segura por ID y nombre
 * - Performance optimizada
 */

import { ALLOWED_ROLES } from './env.config';
import type { IRole } from '../interfaces/role/role.interface';
import { logInfo, logWarning, logError } from '../helper/log/logger.helper';

/**
 * Definición hardcodeada de roles del sistema con jerarquía automática
 * Orden = Jerarquía (primero = mayor privilegio)
 */
export const SYSTEM_ROLES = {
  SUPERADMIN: [
    { id: 1, nombre: 'SuperAdmin' }
  ],
  ADMIN: [
    { id: 2, nombre: 'Administrador' }
  ],
  SUPERIOR: [
    { id: 3, nombre: 'Superior' }
  ],
  ELEMENTO: [
    { id: 4, nombre: 'Elemento' }
  ]
} as const;

/**
 * Tipo derivado para nombres de roles (con autocomplete)
 */
export type SystemRoleType = keyof typeof SYSTEM_ROLES;

/**
 * Niveles jerárquicos automáticos (basados en orden de definición)
 */
const ROLE_LEVELS = {
  SUPERADMIN: 1,
  ADMIN: 2,
  SUPERIOR: 3,
  ELEMENTO: 4
} as const;

/**
 * Interface simplificada para configuración de rol
 */
export interface RoleConfig {
  roleType: SystemRoleType;
  roles: readonly { readonly id: number; readonly nombre: string }[];
  level: number;
  hierarchicalAccess: SystemRoleType[];
}

/**
 * Clase para gestión híbrida de roles
 */
class RoleManager {
  private static instance: RoleManager;
  private validatedRoles: Map<SystemRoleType, IRole[]> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  /**
   * Inicializa y valida roles contra ALLOWED_ROLES
   */
  public initialize(): void {
    if (this.initialized) return;

    try {
      logInfo('RoleManager', 'Inicializando validación de roles contra ALLOWED_ROLES');

      if (!ALLOWED_ROLES || !Array.isArray(ALLOWED_ROLES) || ALLOWED_ROLES.length === 0) {
        logWarning('RoleManager', 'ALLOWED_ROLES está vacío o no es válido');
        this.initialized = true;
        return;
      }

      // Validar cada rol del sistema contra ALLOWED_ROLES
      Object.entries(SYSTEM_ROLES).forEach(([roleType, systemRoles]) => {
        const validRoles = systemRoles.filter(systemRole => 
          ALLOWED_ROLES.some((allowedRole: IRole) => 
            allowedRole.id === systemRole.id && allowedRole.nombre === systemRole.nombre
          )
        );
        
        if (validRoles.length > 0) {
          this.validatedRoles.set(roleType as SystemRoleType, validRoles);
          logInfo('RoleManager', `Rol ${roleType} validado correctamente`, { validRoles });
        } else {
          logWarning('RoleManager', `Rol ${roleType} no encontrado en ALLOWED_ROLES`);
        }
      });

      this.initialized = true;
      logInfo('RoleManager', 'Validación de roles completada', {
        totalValidated: this.validatedRoles.size,
        validRoles: Array.from(this.validatedRoles.keys())
      });

    } catch (error) {
      logError('RoleManager', error, 'Error inicializando validación de roles');
      this.initialized = true;
    }
  }

  /**
   * Verifica si un usuario tiene un rol específico (validación por id y nombre)
   */
  public hasRole(userRoles: IRole[], roleType: SystemRoleType): boolean {
    if (!this.initialized) this.initialize();
    
    const validRoles = this.validatedRoles.get(roleType);
    if (!validRoles || validRoles.length === 0) return false;

    return userRoles.some(userRole => 
      validRoles.some(validRole => 
        validRole.id === userRole.id && validRole.nombre === userRole.nombre
      )
    );
  }

  /**
   * Verifica acceso jerárquico automático
   */
  public hasHierarchicalAccess(userRoles: IRole[], targetRoleType: SystemRoleType): boolean {
    if (!this.initialized) this.initialize();

    // Verificar si tiene el rol exacto
    if (this.hasRole(userRoles, targetRoleType)) return true;

    // Verificar jerarquía automática (nivel menor puede acceder a nivel mayor)
    const targetLevel = ROLE_LEVELS[targetRoleType];
    
    return Object.entries(ROLE_LEVELS).some(([roleType, level]) => {
      return level < targetLevel && this.hasRole(userRoles, roleType as SystemRoleType);
    });
  }

  /**
   * Obtiene todos los roles válidos del sistema
   */
  public getValidRoles(): Map<SystemRoleType, IRole[]> {
    if (!this.initialized) this.initialize();
    return new Map(this.validatedRoles);
  }

  /**
   * Refresca la validación de roles
   */
  public refresh(): void {
    this.initialized = false;
    this.validatedRoles.clear();
    this.initialize();
  }

  /**
   * Obtiene el nivel jerárquico de un rol
   */
  public getRoleLevel(roleType: SystemRoleType): number {
    return ROLE_LEVELS[roleType] || 999;
  }

  /**
   * Obtiene todas las claves de roles del sistema
   */
  public getSystemRoleTypes(): SystemRoleType[] {
    return Object.keys(SYSTEM_ROLES) as SystemRoleType[];
  }

  /**
   * Obtiene la definición completa de un rol del sistema
   */
  public getSystemRoleDefinition(roleType: SystemRoleType): readonly { readonly id: number; readonly nombre: string }[] {
    return SYSTEM_ROLES[roleType];
  }
}

// Instancia única del manager
const roleManager = RoleManager.getInstance();

// Funciones de conveniencia para uso directo con autocompletado
export const hasRole = (userRoles: IRole[], roleType: SystemRoleType): boolean => 
  roleManager.hasRole(userRoles, roleType);

export const hasHierarchicalAccess = (userRoles: IRole[], targetRoleType: SystemRoleType): boolean => 
  roleManager.hasHierarchicalAccess(userRoles, targetRoleType);

export const getRoleLevel = (roleType: SystemRoleType): number => 
  roleManager.getRoleLevel(roleType);

export const getValidRoles = (): Map<SystemRoleType, IRole[]> => 
  roleManager.getValidRoles();

export const refreshRoles = (): void => 
  roleManager.refresh();

export const getSystemRoleTypes = (): SystemRoleType[] => 
  roleManager.getSystemRoleTypes();

export const getSystemRoleDefinition = (roleType: SystemRoleType): readonly { readonly id: number; readonly nombre: string }[] => 
  roleManager.getSystemRoleDefinition(roleType);

// Funciones específicas de roles con autocompletado
export const isSuperAdmin = (userRoles: IRole[]): boolean => 
  hasRole(userRoles, 'SUPERADMIN');

export const isAdmin = (userRoles: IRole[]): boolean => 
  hasRole(userRoles, 'ADMIN');

export const isSuperior = (userRoles: IRole[]): boolean => 
  hasRole(userRoles, 'SUPERIOR');

export const isElemento = (userRoles: IRole[]): boolean => 
  hasRole(userRoles, 'ELEMENTO');

// Funciones de acceso jerárquico
export const canAccessSuperAdmin = (userRoles: IRole[]): boolean => 
  hasHierarchicalAccess(userRoles, 'SUPERADMIN');

export const canAccessAdmin = (userRoles: IRole[]): boolean => 
  hasHierarchicalAccess(userRoles, 'ADMIN');

export const canAccessSuperior = (userRoles: IRole[]): boolean => 
  hasHierarchicalAccess(userRoles, 'SUPERIOR');

export const canAccessElemento = (userRoles: IRole[]): boolean => 
  hasHierarchicalAccess(userRoles, 'ELEMENTO');

// Inicializar al importar el módulo
roleManager.initialize();

logInfo('RoleManager', 'Sistema de roles híbrido inicializado correctamente');

// Exportaciones principales
export { RoleManager, roleManager };
export default roleManager;