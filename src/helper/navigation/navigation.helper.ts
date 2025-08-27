/**
 * Helper de Navegación - Principios SOLID, KISS, DRY
 * 
 * Maneja la navegación de la aplicación de forma consistente:
 * - Redirección basada en roles (simplificada)
 * - Validación de rutas
 * - Historial de navegación
 * - Logging de navegación
 */

import { logInfo, logError } from '../log/logger.helper';
import type { Token } from '../../interfaces/token/token.interface';
import { ALLOWED_ROLES } from '../../config/env.config';

// Tipos para el helper de navegación
export interface NavigationConfig {
  defaultRoute: string;
  loginRoute: string;
  enableNavigationLogging: boolean;
}

import type { IRole } from '../../interfaces/role/role.interface';

export interface UserData {
  id: string;
  nombre: string;
  roles: IRole[];
}

// Configuración por defecto
const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  defaultRoute: '/inicio',
  loginRoute: '/',
  enableNavigationLogging: true
};

/**
 * Clase principal para manejo de navegación
 * Implementa patrón Singleton para configuración consistente
 */
class NavigationHelper {
  private static instance: NavigationHelper;
  private config: NavigationConfig;

  private constructor(config?: Partial<NavigationConfig>) {
    this.config = { ...DEFAULT_NAVIGATION_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<NavigationConfig>): NavigationHelper {
    if (!NavigationHelper.instance) {
      NavigationHelper.instance = new NavigationHelper(config);
    }
    return NavigationHelper.instance;
  }

  /**
   * Actualiza la configuración del helper
   */
  public updateConfig(newConfig: Partial<NavigationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene la ruta para un usuario basado en sus roles
   * SIMPLIFICADO: Todos los usuarios van a /inicio
   */
  public getRouteForUser(userData: UserData | Token): string {
    try {
      // Log de navegación si está habilitado
      if (this.config.enableNavigationLogging) {
        const userId = 'id' in userData ? userData.id : userData.data.id;
        logInfo('NavigationHelper', 'Determinando ruta para usuario', { userId });
      }

      // Por ahora, todos van a inicio
      // En el futuro, el componente /inicio manejará los roles internamente
      return this.config.defaultRoute;

    } catch (error) {
      logError('NavigationHelper', error, 'Error determinando ruta para usuario');
      return this.config.defaultRoute;
    }
  }

  /**
   * Valida si un usuario tiene acceso a una ruta específica
   * Funcionalidad básica, puede expandirse en el futuro
   */
  public hasAccessToRoute(userRoles: IRole[], targetRoute: string): boolean {
    try {
      // Por ahora validación básica - si tiene roles válidos, puede acceder
      const hasValidRole = userRoles.some(userRole => 
        ALLOWED_ROLES.some(allowedRole => allowedRole.id === userRole.id)
      );

      if (this.config.enableNavigationLogging) {
        logInfo('NavigationHelper', 'Validando acceso a ruta', {
          targetRoute,
          hasValidRole,
          rolesCount: userRoles.length
        });
      }

      return hasValidRole;

    } catch (error) {
      logError('NavigationHelper', error, 'Error validando acceso a ruta');
      return false;
    }
  }

  /**
   * Obtiene datos de usuario del sessionStorage
   */
  public getUserFromStorage(): UserData | null {
    try {
      const userData = sessionStorage.getItem('user_data');
      const rolesData = sessionStorage.getItem('roles');
      
      if (!userData || !rolesData) return null;

      const user = JSON.parse(userData);
      const roles = JSON.parse(rolesData);

      return {
        id: user.id,
        nombre: user.nombre,
        roles: roles
      };

    } catch (error) {
      logError('NavigationHelper', error, 'Error obteniendo usuario del storage');
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  public isUserAuthenticated(): boolean {
    try {
      const token = sessionStorage.getItem('token');
      const userData = sessionStorage.getItem('user_data');
      const roles = sessionStorage.getItem('roles');

      return !!(token && userData && roles);

    } catch (error) {
      logError('NavigationHelper', error, 'Error verificando autenticación');
      return false;
    }
  }

  /**
   * Limpia datos de navegación (logout)
   */
  public clearNavigationData(): void {
    try {
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('roles');
      sessionStorage.removeItem('token');
      
      if (this.config.enableNavigationLogging) {
        logInfo('NavigationHelper', 'Datos de navegación limpiados');
      }

    } catch (error) {
      logError('NavigationHelper', error, 'Error limpiando datos de navegación');
    }
  }

  /**
   * Construye URL completa con base path si es necesario
   */
  public buildFullUrl(relativePath: string): string {
    // Para aplicaciones SPA, generalmente no necesitamos base path
    // Pero puede ser útil para despliegues en subdirectorios
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }

  /**
   * Valida si una ruta es válida (formato básico)
   */
  public isValidRoute(route: string): boolean {
    if (!route || typeof route !== 'string') return false;
    
    // Validación básica de formato de ruta
    const routeRegex = /^\/[a-zA-Z0-9\-_\/]*$/;
    return routeRegex.test(route) && route.length <= 100;
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): NavigationConfig {
    return { ...this.config };
  }
}

// Instancia por defecto
const navigationHelper = NavigationHelper.getInstance();

// Funciones helper para uso directo
export const getRouteForUser = (userData: UserData | Token): string => 
  navigationHelper.getRouteForUser(userData);

export const hasAccessToRoute = (userRoles: IRole[], targetRoute: string): boolean => 
  navigationHelper.hasAccessToRoute(userRoles, targetRoute);

export const getUserFromStorage = (): UserData | null => 
  navigationHelper.getUserFromStorage();

export const isUserAuthenticated = (): boolean => 
  navigationHelper.isUserAuthenticated();

export const clearNavigationData = (): void => 
  navigationHelper.clearNavigationData();

export const buildFullUrl = (relativePath: string): string => 
  navigationHelper.buildFullUrl(relativePath);

export const isValidRoute = (route: string): boolean => 
  navigationHelper.isValidRoute(route);

// Exportaciones
export { NavigationHelper, navigationHelper };
export default navigationHelper;