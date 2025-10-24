/**
 * PrivateRoute Component
 *
 * Componente de protección de rutas con validación de autenticación y roles
 *
 * Características:
 * - Validación de JWT
 * - Validación de autenticación
 * - Control de acceso basado en roles
 * - Redirección automática a login o inicio
 * - Estados de carga optimizados
 * - Logging de accesos
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';

// Helpers
import { isTokenExpired, getStoredToken } from '../../../helper/security/jwt.helper';
import { isUserAuthenticated } from '../../../helper/navigation/navigation.helper';
import { logInfo, logWarning } from '../../../helper/log/logger.helper';

// Components
import { RouteLoadingFallback } from '../components/loading';

// Interfaces
export interface PrivateRouteProps {
  /** Componentes hijos a renderizar si tiene acceso */
  children: React.ReactNode;
  /** Roles requeridos para acceder (opcional - si no se especifica, solo valida autenticación) */
  requiredRoles?: string[];
  /** Ruta de redirección si no tiene acceso (default: '/') */
  redirectTo?: string;
  /** Mostrar loader mientras valida (default: true) */
  showLoading?: boolean;
}

/**
 * Componente de ruta privada con validación de roles
 *
 * @example
 * // Solo autenticación
 * <PrivateRoute>
 *   <MiComponente />
 * </PrivateRoute>
 *
 * @example
 * // Con roles específicos
 * <PrivateRoute requiredRoles={['SuperAdmin', 'Administrador']}>
 *   <Usuarios />
 * </PrivateRoute>
 *
 * @example
 * // Con redirección personalizada
 * <PrivateRoute requiredRoles={['SuperAdmin']} redirectTo="/inicio">
 *   <ConfiguracionAvanzada />
 * </PrivateRoute>
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRoles,
  redirectTo = '/'
  // showLoading parameter reservado para futura implementación
}) => {
  /**
   * Valida si el usuario tiene acceso a la ruta
   */
  const accessValidation = useMemo(() => {
    // 1️⃣ Validar JWT expirado
    const token = getStoredToken();
    if (isTokenExpired(token)) {
      logWarning('PrivateRoute', 'Acceso denegado: Token expirado');
      return {
        hasAccess: false,
        reason: 'token_expired',
        redirectTo: '/'
      };
    }

    // 2️⃣ Validar autenticación básica
    if (!isUserAuthenticated()) {
      logWarning('PrivateRoute', 'Acceso denegado: Usuario no autenticado');
      return {
        hasAccess: false,
        reason: 'not_authenticated',
        redirectTo: '/'
      };
    }

    // 3️⃣ Validar roles (si se especificaron)
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = getUserRoles();
      const hasRequiredRole = validateUserRoles(userRoles, requiredRoles);

      if (!hasRequiredRole) {
        logWarning('PrivateRoute', 'Acceso denegado: Rol insuficiente', {
          requiredRoles,
          userRoles
        });
        return {
          hasAccess: false,
          reason: 'insufficient_roles',
          redirectTo: '/inicio'
        };
      }

      logInfo('PrivateRoute', 'Acceso concedido con validación de roles', {
        requiredRoles,
        userRoles
      });
    } else {
      logInfo('PrivateRoute', 'Acceso concedido (solo autenticación)');
    }

    // ✅ Acceso concedido
    return {
      hasAccess: true,
      reason: 'authorized',
      redirectTo: null
    };
  }, [requiredRoles]);

  // Si no tiene acceso, redirigir
  if (!accessValidation.hasAccess) {
    return <Navigate to={accessValidation.redirectTo || redirectTo} replace />;
  }

  // ✅ Renderizar children si tiene acceso
  return <>{children}</>;
};

/**
 * Obtiene los roles del usuario desde sessionStorage
 */
const getUserRoles = (): string[] => {
  try {
    const rolesData = sessionStorage.getItem('roles');
    if (!rolesData) return [];

    const roles = JSON.parse(rolesData);
    return Array.isArray(roles)
      ? roles.map((role: { nombre: string }) => role.nombre || '').filter(Boolean)
      : [];
  } catch (error) {
    logWarning('PrivateRoute', 'Error obteniendo roles del usuario', { error });
    return [];
  }
};

/**
 * Valida si el usuario tiene al menos uno de los roles requeridos
 *
 * @param userRoles - Roles del usuario
 * @param requiredRoles - Roles requeridos
 * @returns true si tiene al menos un rol requerido
 */
const validateUserRoles = (userRoles: string[], requiredRoles: string[]): boolean => {
  if (!userRoles || userRoles.length === 0) return false;
  if (!requiredRoles || requiredRoles.length === 0) return true;

  return requiredRoles.some(requiredRole =>
    userRoles.some(userRole =>
      userRole.toLowerCase() === requiredRole.toLowerCase()
    )
  );
};

/**
 * Hook personalizado para usar PrivateRoute programáticamente
 *
 * @example
 * const { canAccess } = usePrivateRoute(['SuperAdmin']);
 * if (!canAccess) {
 *   navigate('/inicio');
 * }
 */
export const usePrivateRoute = (requiredRoles?: string[]) => {
  const token = getStoredToken();
  const isAuthenticated = isUserAuthenticated();
  const isExpired = isTokenExpired(token);

  const canAccess = useMemo(() => {
    if (isExpired || !isAuthenticated) return false;

    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = getUserRoles();
      return validateUserRoles(userRoles, requiredRoles);
    }

    return true;
  }, [isExpired, isAuthenticated, requiredRoles]);

  return {
    canAccess,
    isAuthenticated,
    isTokenExpired: isExpired
  };
};

export default PrivateRoute;
