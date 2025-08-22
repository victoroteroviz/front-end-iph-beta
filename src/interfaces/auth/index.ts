/**
 * Archivo de índice para las interfaces de autenticación
 * Centraliza todas las exportaciones relacionadas con auth
 */

export type {
  LoginCredentials,
  LoginApiResponse,
  Privilegio,
  UserRole,
  JwtUserData,
  DecodedJWT,
  UserProfile,
  ProcessedUserRole,
  UserRolesData,
  LoginResult,
  LoginServiceConfig,
  StorageSession,
  StorageKey
} from './auth.interface';

export { STORAGE_KEYS } from './auth.interface';
