/**
 * PrivateRoute Component
 *
 * Componente de protección de rutas con validación de autenticación y roles
 *
 * @description
 * Guard de rutas que valida JWT, autenticación y permisos de roles.
 * Utiliza el sistema centralizado de roles (role.helper.ts) para garantizar
 * consistencia, seguridad y rendimiento en toda la aplicación.
 *
 * @version 2.0.0
 * @refactored 2025-01-30
 *
 * @changes v2.0.0
 * - ✅ Centralizado con role.helper.ts
 * - ✅ Eliminadas funciones locales getUserRoles() y validateUserRoles()
 * - ✅ Usa validateRolesByName() del helper centralizado
 * - ✅ Validación Zod automática desde helper
 * - ✅ Cache optimizado con TTL de 5 segundos
 * - ✅ Reducción de ~30 líneas de código duplicado
 * - ✅ JSDoc completo con ejemplos
 * - ✅ Regiones organizadas para mantenibilidad
 *
 * @features
 * - Validación de JWT con expiración
 * - Validación de autenticación básica
 * - Control de acceso basado en roles
 * - Redirección automática a login o inicio
 * - Logging estructurado de accesos
 * - Performance optimizado con cache
 *
 * @security
 * - Validación JWT con expiración
 * - Validación de roles con Zod (desde helper)
 * - Validación doble ID + nombre (desde helper)
 * - Logging de intentos de acceso
 * - Cache seguro con TTL
 *
 * @author Sistema IPH
 */

import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';

// Helpers
import { isTokenExpired, getStoredToken } from '../../../helper/security/jwt.helper';
import { isUserAuthenticated } from '../../../helper/navigation/navigation.helper';
import { validateRolesByName } from '../../../helper/role/role.helper';
import { logInfo, logWarning } from '../../../helper/log/logger.helper';

// Components
import { RouteLoadingFallback } from '../components/loading';

// =====================================================
// #region 📋 INTERFACES Y TYPES
// =====================================================

/**
 * Props del componente PrivateRoute
 *
 * @interface PrivateRouteProps
 */
export interface PrivateRouteProps {
  /**
   * Componentes hijos a renderizar si tiene acceso
   */
  children: React.ReactNode;

  /**
   * Roles requeridos para acceder a la ruta
   *
   * @description
   * - Array vacío o undefined: Solo valida autenticación (cualquier usuario autenticado)
   * - Con valores: Valida que el usuario tenga AL MENOS UNO de los roles especificados
   *
   * @example
   * requiredRoles={['SuperAdmin', 'Administrador']}
   */
  requiredRoles?: string[];

  /**
   * Ruta de redirección si no tiene acceso
   *
   * @default '/'
   */
  redirectTo?: string;

  /**
   * Mostrar loader mientras valida (reservado para futura implementación)
   *
   * @default true
   * @deprecated No implementado en v2.0
   */
  showLoading?: boolean;
}

// #endregion

// =====================================================
// #region 🛡️ COMPONENTE PRINCIPAL - PrivateRoute v2.0
// =====================================================

/**
 * Componente de ruta privada con validación de roles
 *
 * @description
 * Guard que protege rutas validando JWT, autenticación y roles.
 * Usa el sistema centralizado de roles para garantizar consistencia.
 *
 * @param {PrivateRouteProps} props - Propiedades del componente
 * @returns {React.ReactElement} Componente protegido o redirección
 *
 * @refactored v2.0.0
 * - ✅ Usa validateRolesByName() del helper centralizado
 * - ✅ Eliminadas funciones locales duplicadas
 * - ✅ Validación Zod automática
 * - ✅ Cache optimizado
 *
 * @example
 * // Solo autenticación (cualquier usuario autenticado)
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
   *
   * @description
   * Implementa validación en tres capas:
   * 1. JWT - Verifica que el token no esté expirado
   * 2. Autenticación - Verifica que el usuario esté autenticado
   * 3. Roles - Verifica que tenga al menos uno de los roles requeridos
   *
   * @refactored v2.0.0 - Usa helper centralizado para validación de roles
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
    // ✅ v2.0.0: Usa helper centralizado con validación Zod y cache
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = validateRolesByName(requiredRoles);

      if (!hasRequiredRole) {
        logWarning('PrivateRoute', 'Acceso denegado: Rol insuficiente', {
          requiredRoles
        });
        return {
          hasAccess: false,
          reason: 'insufficient_roles',
          redirectTo: '/inicio'
        };
      }

      logInfo('PrivateRoute', 'Acceso concedido con validación de roles', {
        requiredRoles
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

// #endregion

// =====================================================
// #region 🪝 HOOK PERSONALIZADO - usePrivateRoute v2.0
// =====================================================

/**
 * Hook personalizado para validación programática de acceso a rutas
 *
 * @description
 * Permite validar acceso a rutas desde componentes sin usar el componente PrivateRoute.
 * Útil para mostrar/ocultar elementos de UI según permisos.
 *
 * @param {string[]} [requiredRoles] - Array de nombres de roles requeridos (opcional)
 * @returns {Object} Objeto con información de acceso
 * @returns {boolean} canAccess - true si el usuario tiene acceso
 * @returns {boolean} isAuthenticated - true si el usuario está autenticado
 * @returns {boolean} isTokenExpired - true si el token JWT está expirado
 *
 * @refactored v2.0.0
 * - ✅ Usa validateRolesByName() del helper centralizado
 * - ✅ Eliminadas funciones locales duplicadas
 * - ✅ Validación Zod automática
 * - ✅ Cache optimizado
 *
 * @performance
 * - Memoizado con useMemo
 * - Cache automático del helper (TTL 5s)
 * - Re-calcula solo si cambian dependencias
 *
 * @security
 * - Validación JWT con expiración
 * - Validación de roles con Zod
 * - Validación doble ID + nombre
 *
 * @example
 * // Validar acceso a funcionalidad específica
 * const { canAccess } = usePrivateRoute(['SuperAdmin', 'Administrador']);
 * if (!canAccess) {
 *   navigate('/acceso-denegado');
 * }
 *
 * @example
 * // Mostrar/ocultar botón según permisos
 * const { canAccess } = usePrivateRoute(['SuperAdmin']);
 * return (
 *   <>
 *     {canAccess && <button>Eliminar Usuario</button>}
 *   </>
 * );
 *
 * @example
 * // Solo validar autenticación
 * const { isAuthenticated, isTokenExpired } = usePrivateRoute();
 * if (isTokenExpired) {
 *   showWarning('Tu sesión ha expirado');
 * }
 *
 * @version 2.0.0
 * @since 2025-01-30
 */
export const usePrivateRoute = (requiredRoles?: string[]) => {
  const token = getStoredToken();
  const isAuthenticated = isUserAuthenticated();
  const isExpired = isTokenExpired(token);

  /**
   * Calcula si el usuario tiene acceso
   * Memoizado para optimizar re-renders
   */
  const canAccess = useMemo(() => {
    // Validar autenticación y token
    if (isExpired || !isAuthenticated) return false;

    // Si se especificaron roles, validar con helper centralizado
    // ✅ v2.0.0: Usa validateRolesByName() con validación Zod y cache
    if (requiredRoles && requiredRoles.length > 0) {
      return validateRolesByName(requiredRoles);
    }

    // Sin roles requeridos = solo autenticación
    return true;
  }, [isExpired, isAuthenticated, requiredRoles]);

  return {
    canAccess,
    isAuthenticated,
    isTokenExpired: isExpired
  };
};

// #endregion

export default PrivateRoute;
