/**
 * @fileoverview Custom hook para obtener datos de usuario con estado reactivo
 * @version 1.0.0
 * @description Hook React que proporciona acceso a datos del usuario con actualización automática
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUserData,
  getUserFullName,
  getUserAvatar,
  getUserInitials,
  hasAvatar,
  getUserContext,
  invalidateUserCache,
  type UserData,
  type UserContext,
  type FormatNameOptions
} from '@/helper/user/user.helper';
import { logDebug } from '@/helper/log/logger.helper';

/**
 * Opciones de configuración del hook
 *
 * @interface UseUserDataOptions
 */
export interface UseUserDataOptions {
  /** Si debe cargar datos inmediatamente al montar */
  immediate?: boolean;
  /** Formato del nombre completo */
  nameFormat?: FormatNameOptions;
  /** Usar avatar por defecto si no hay foto */
  useDefaultAvatar?: boolean;
}

/**
 * Resultado del hook useUserData
 *
 * @interface UseUserDataResult
 */
export interface UseUserDataResult {
  /** Datos crudos del usuario */
  userData: UserData | null;
  /** Contexto completo del usuario */
  context: UserContext | null;
  /** Nombre completo formateado */
  fullName: string;
  /** URL del avatar */
  avatar: string | null;
  /** Iniciales del usuario */
  initials: string;
  /** Si tiene foto de perfil */
  hasProfilePhoto: boolean;
  /** Si hay datos de usuario */
  hasData: boolean;
  /** Estado de carga */
  isLoading: boolean;
  /** Función para refrescar datos manualmente */
  refresh: () => void;
}

const MODULE_NAME = 'useUserData';

/**
 * Custom hook para gestionar datos de usuario con estado reactivo
 * Proporciona acceso a datos del usuario con actualización automática
 *
 * @param {UseUserDataOptions} options - Opciones de configuración
 * @returns {UseUserDataResult} Datos y funciones para gestionar usuario
 *
 * @example
 * ```tsx
 * // Uso básico
 * const { fullName, avatar, hasData } = useUserData();
 *
 * if (!hasData) {
 *   return <Navigate to="/login" />;
 * }
 *
 * return (
 *   <div>
 *     <img src={avatar} alt="Avatar" />
 *     <span>{fullName}</span>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Con formato personalizado de nombre
 * const { fullName, refresh } = useUserData({
 *   nameFormat: { includeSecondLastName: false, uppercase: true }
 * });
 *
 * return (
 *   <div>
 *     <h1>{fullName}</h1>
 *     <button onClick={refresh}>Actualizar</button>
 *   </div>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Acceso a contexto completo
 * const { context, hasProfilePhoto, initials } = useUserData();
 *
 * return (
 *   <div>
 *     {hasProfilePhoto ? (
 *       <img src={context?.avatarUrl} />
 *     ) : (
 *       <div className="avatar-initials">{initials}</div>
 *     )}
 *   </div>
 * );
 * ```
 */
export const useUserData = (options: UseUserDataOptions = {}): UseUserDataResult => {
  const {
    immediate = true,
    nameFormat = {},
    useDefaultAvatar = true
  } = options;

  // Estado
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);

  /**
   * Función para cargar/refrescar datos del usuario
   */
  const loadUserData = useCallback(() => {
    setIsLoading(true);

    try {
      // Obtener datos del helper
      const data = getUserData();
      setUserData(data);

      if (import.meta.env.DEV) {
        logDebug(MODULE_NAME, 'Datos de usuario cargados', {
          hasData: !!data,
          userId: data?.id
        });
      }
    } catch (error) {
      console.error('[useUserData] Error cargando datos:', error);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Función para refrescar datos invalidando el cache
   */
  const refresh = useCallback(() => {
    invalidateUserCache();
    loadUserData();
  }, [loadUserData]);

  // Cargar datos al montar si immediate=true
  useEffect(() => {
    if (immediate) {
      loadUserData();
    }
  }, [immediate, loadUserData]);

  // Calcular valores derivados
  const fullName = getUserFullName(nameFormat);
  const avatar = getUserAvatar(useDefaultAvatar);
  const initials = getUserInitials();
  const hasProfilePhoto = hasAvatar();
  const context = getUserContext();
  const hasData = userData !== null;

  return {
    userData,
    context,
    fullName,
    avatar,
    initials,
    hasProfilePhoto,
    hasData,
    isLoading,
    refresh
  };
};

/**
 * Hook simplificado para solo verificar si hay datos de usuario
 * Útil para guards de autenticación
 *
 * @returns {boolean} true si hay datos de usuario válidos
 *
 * @example
 * ```tsx
 * const PrivateRoute = ({ children }) => {
 *   const hasUser = useHasUserData();
 *
 *   if (!hasUser) {
 *     return <Navigate to="/login" />;
 *   }
 *
 *   return <>{children}</>;
 * };
 * ```
 */
export const useHasUserData = (): boolean => {
  const { hasData } = useUserData({ immediate: true });
  return hasData;
};

/**
 * Hook para obtener solo el nombre completo del usuario
 * Optimizado para casos simples
 *
 * @param {FormatNameOptions} options - Opciones de formato
 * @returns {string} Nombre completo formateado
 *
 * @example
 * ```tsx
 * const Navbar = () => {
 *   const userName = useUserFullName({ includeSecondLastName: false });
 *
 *   return (
 *     <nav>
 *       <span>Bienvenido, {userName}</span>
 *     </nav>
 *   );
 * };
 * ```
 */
export const useUserFullName = (options?: FormatNameOptions): string => {
  const { fullName } = useUserData({ nameFormat: options, immediate: true });
  return fullName;
};

/**
 * Hook para obtener solo el avatar del usuario
 * Optimizado para casos simples
 *
 * @param {boolean} useDefault - Si usar avatar por defecto
 * @returns {string | null} URL del avatar
 *
 * @example
 * ```tsx
 * const UserAvatar = () => {
 *   const avatar = useUserAvatar();
 *
 *   return <img src={avatar} alt="Avatar" className="rounded-full" />;
 * };
 * ```
 */
export const useUserAvatar = (useDefault: boolean = true): string | null => {
  const { avatar } = useUserData({ useDefaultAvatar: useDefault, immediate: true });
  return avatar;
};

export default useUserData;
