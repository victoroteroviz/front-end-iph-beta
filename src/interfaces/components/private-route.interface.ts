/**
 * Interfaces para el componente PrivateRoute
 * Define todos los tipos necesarios para la protección de rutas
 */

import type { ReactNode } from 'react';
import type { UserRole } from '../token/token.interface';

// =====================================================
// INTERFACES DE PROPS
// =====================================================

export interface IPrivateRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
  showLoading?: boolean;
  className?: string;
}

// =====================================================
// INTERFACES DE ESTADO
// =====================================================

export interface IPrivateRouteState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRequiredRoles: boolean;
  userRoles: UserRole[];
  error: string | null;
}

// =====================================================
// INTERFACES DE CONFIGURACIÓN
// =====================================================

export interface IAuthValidationConfig {
  validateRoles: boolean;
  strictRoleCheck: boolean;
  enableLogging: boolean;
  redirectTimeout: number;
}

export interface IPrivateRouteConfig {
  defaultRedirect: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
  authValidation: IAuthValidationConfig;
}

// =====================================================
// INTERFACES DEL HOOK
// =====================================================

export interface IUsePrivateRouteParams {
  requiredRoles?: string[];
  redirectTo?: string;
  config?: Partial<IPrivateRouteConfig>;
}

export interface IUsePrivateRouteReturn {
  state: IPrivateRouteState;
  canAccess: boolean;
  shouldRedirect: boolean;
  redirectPath: string;
  validateAccess: () => void;
  refreshAuth: () => Promise<void>;
}

// =====================================================
// INTERFACES DE VALIDACIÓN
// =====================================================

export interface IAuthValidationResult {
  isValid: boolean;
  hasAuth: boolean;
  hasRoles: boolean;
  missingRoles: string[];
  errorMessage?: string;
}

export interface IRouteAccessCheck {
  path: string;
  userRoles: UserRole[];
  requiredRoles?: string[];
  result: IAuthValidationResult;
}

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export const AuthValidationError = {
  NO_TOKEN: 'no_token',
  NO_USER_DATA: 'no_user_data',
  NO_ROLES: 'no_roles',
  INSUFFICIENT_ROLES: 'insufficient_roles',
  EXPIRED_SESSION: 'expired_session',
  INVALID_DATA: 'invalid_data'
} as const;

export type AuthValidationError = typeof AuthValidationError[keyof typeof AuthValidationError];

export const RedirectReason = {
  NOT_AUTHENTICATED: 'not_authenticated',
  INSUFFICIENT_ROLES: 'insufficient_roles',
  EXPIRED_SESSION: 'expired_session',
  ERROR: 'error'
} as const;

export type RedirectReason = typeof RedirectReason[keyof typeof RedirectReason];

// =====================================================
// CONFIGURACIONES POR DEFECTO
// =====================================================

export const DEFAULT_AUTH_VALIDATION_CONFIG: IAuthValidationConfig = {
  validateRoles: true,
  strictRoleCheck: false,
  enableLogging: true,
  redirectTimeout: 0
};

export const DEFAULT_PRIVATE_ROUTE_CONFIG: IPrivateRouteConfig = {
  defaultRedirect: '/',
  authValidation: DEFAULT_AUTH_VALIDATION_CONFIG
};

// =====================================================
// INTERFACES DE UTILIDADES
// =====================================================

export interface IPrivateRouteUtils {
  validateUserRoles: (userRoles: UserRole[], requiredRoles: string[]) => boolean;
  formatRoleName: (role: string) => string;
  logAccessAttempt: (path: string, success: boolean, reason?: string) => void;
  buildRedirectUrl: (basePath: string, reason?: RedirectReason) => string;
}

// =====================================================
// TIPOS AUXILIARES
// =====================================================

export type PrivateRouteChildren = ReactNode | ((props: { isLoading: boolean }) => ReactNode);

export type AuthCheckCallback = (result: IAuthValidationResult) => void;

export type AccessDeniedHandler = (reason: RedirectReason, requiredRoles?: string[]) => void;