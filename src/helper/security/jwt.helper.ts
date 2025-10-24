/**
 * Helper de JWT - Validación de Tokens
 *
 * Proporciona funciones de seguridad para validar JWT tokens:
 * - Validación de expiración
 * - Decodificación segura
 * - Verificación de estructura
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { jwtDecode } from 'jwt-decode';
import { logError, logInfo, logWarning } from '../log/logger.helper';

/**
 * Interface para el payload decodificado del JWT
 */
export interface JWTPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

/**
 * Resultado de la validación del token
 */
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresIn?: number; // Milisegundos hasta expiración
  error?: string;
}

/**
 * Clase principal para manejo de JWT
 * Implementa patrón Singleton para configuración consistente
 */
class JWTHelper {
  private static instance: JWTHelper;
  private readonly TOKEN_STORAGE_KEY = 'token';

  private constructor() {}

  public static getInstance(): JWTHelper {
    if (!JWTHelper.instance) {
      JWTHelper.instance = new JWTHelper();
    }
    return JWTHelper.instance;
  }

  /**
   * Verifica si un token está expirado
   *
   * @param token - Token JWT a verificar
   * @returns true si el token está expirado, false en caso contrario
   *
   * @example
   * const token = sessionStorage.getItem('token');
   * if (isTokenExpired(token)) {
   *   // Redirigir a login
   * }
   */
  public isTokenExpired(token: string | null): boolean {
    if (!token) {
      logWarning('JWTHelper', 'No token provided for expiration check');
      return true;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);

      if (!decoded.exp) {
        logWarning('JWTHelper', 'Token does not contain expiration claim');
        return true;
      }

      // exp viene en segundos, Date.now() en milisegundos
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        logInfo('JWTHelper', 'Token expired', {
          expiredAt: new Date(decoded.exp * 1000).toISOString()
        });
      }

      return isExpired;

    } catch (error) {
      logError('JWTHelper', error, 'Error decoding token for expiration check');
      return true;
    }
  }

  /**
   * Valida completamente un token JWT
   *
   * @param token - Token JWT a validar
   * @returns Resultado de la validación con información detallada
   *
   * @example
   * const result = validateToken(token);
   * if (!result.isValid) {
   *   console.error(result.error);
   * }
   */
  public validateToken(token: string | null): TokenValidationResult {
    // Validación básica de existencia
    if (!token || typeof token !== 'string') {
      return {
        isValid: false,
        isExpired: true,
        error: 'Token no proporcionado o inválido'
      };
    }

    // Validación de formato básico (3 partes separadas por punto)
    const parts = token.split('.');
    if (parts.length !== 3) {
      logWarning('JWTHelper', 'Token has invalid format (not 3 parts)');
      return {
        isValid: false,
        isExpired: true,
        error: 'Formato de token inválido'
      };
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Verificar si tiene claim de expiración
      if (!decoded.exp) {
        logWarning('JWTHelper', 'Token missing expiration claim');
        return {
          isValid: false,
          isExpired: true,
          error: 'Token sin fecha de expiración'
        };
      }

      // Verificar expiración
      const expTimestamp = decoded.exp * 1000;
      const now = Date.now();
      const isExpired = expTimestamp < now;
      const expiresIn = expTimestamp - now;

      if (isExpired) {
        logInfo('JWTHelper', 'Token validation failed: expired', {
          expiredAt: new Date(expTimestamp).toISOString()
        });
        return {
          isValid: false,
          isExpired: true,
          expiresIn: 0,
          error: 'Token expirado'
        };
      }

      // Token válido
      logInfo('JWTHelper', 'Token validated successfully', {
        expiresIn: Math.floor(expiresIn / 1000 / 60) + ' minutes'
      });

      return {
        isValid: true,
        isExpired: false,
        expiresIn
      };

    } catch (error) {
      logError('JWTHelper', error, 'Error validating token');
      return {
        isValid: false,
        isExpired: true,
        error: 'Error al decodificar token'
      };
    }
  }

  /**
   * Decodifica un token JWT de forma segura
   *
   * @param token - Token JWT a decodificar
   * @returns Payload decodificado o null si hay error
   *
   * @example
   * const payload = decodeToken(token);
   * if (payload) {
   *   console.log('User ID:', payload.userId);
   * }
   */
  public decodeToken<T = JWTPayload>(token: string | null): T | null {
    if (!token) {
      return null;
    }

    try {
      return jwtDecode<T>(token);
    } catch (error) {
      logError('JWTHelper', error, 'Error decoding token');
      return null;
    }
  }

  /**
   * Obtiene el token almacenado en sessionStorage
   *
   * @returns Token almacenado o null
   */
  public getStoredToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
    } catch (error) {
      logError('JWTHelper', error, 'Error retrieving stored token');
      return null;
    }
  }

  /**
   * Verifica si el token almacenado es válido
   *
   * @returns true si hay un token válido almacenado
   *
   * @example
   * if (!hasValidStoredToken()) {
   *   navigate('/');
   * }
   */
  public hasValidStoredToken(): boolean {
    const token = this.getStoredToken();
    if (!token) {
      return false;
    }

    const validation = this.validateToken(token);
    return validation.isValid;
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del token
   *
   * @param token - Token JWT
   * @returns Milisegundos hasta expiración o 0 si está expirado
   */
  public getTimeUntilExpiration(token: string | null): number {
    if (!token) {
      return 0;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded.exp) {
        return 0;
      }

      const expiresIn = (decoded.exp * 1000) - Date.now();
      return Math.max(0, expiresIn);

    } catch {
      return 0;
    }
  }

  /**
   * Verifica si el token expirará pronto (dentro de X minutos)
   * Útil para implementar refresh de token
   *
   * @param token - Token JWT
   * @param minutesThreshold - Minutos de umbral (por defecto 5)
   * @returns true si expira pronto
   */
  public willExpireSoon(token: string | null, minutesThreshold: number = 5): boolean {
    const timeUntilExpiration = this.getTimeUntilExpiration(token);
    const thresholdMs = minutesThreshold * 60 * 1000;

    return timeUntilExpiration > 0 && timeUntilExpiration < thresholdMs;
  }
}

// Instancia por defecto
const jwtHelper = JWTHelper.getInstance();

// =====================================================
// FUNCIONES HELPER PARA USO DIRECTO
// =====================================================

/**
 * Verifica si un token está expirado
 * @param token - Token JWT a verificar
 * @returns true si está expirado
 */
export const isTokenExpired = (token: string | null): boolean =>
  jwtHelper.isTokenExpired(token);

/**
 * Valida un token JWT completamente
 * @param token - Token JWT a validar
 * @returns Resultado de validación
 */
export const validateToken = (token: string | null): TokenValidationResult =>
  jwtHelper.validateToken(token);

/**
 * Decodifica un token JWT de forma segura
 * @param token - Token JWT a decodificar
 * @returns Payload decodificado o null
 */
export const decodeToken = <T = JWTPayload>(token: string | null): T | null =>
  jwtHelper.decodeToken<T>(token);

/**
 * Obtiene el token almacenado en sessionStorage
 * @returns Token almacenado o null
 */
export const getStoredToken = (): string | null =>
  jwtHelper.getStoredToken();

/**
 * Verifica si hay un token válido almacenado
 * @returns true si hay un token válido
 */
export const hasValidStoredToken = (): boolean =>
  jwtHelper.hasValidStoredToken();

/**
 * Obtiene tiempo hasta expiración en milisegundos
 * @param token - Token JWT
 * @returns Milisegundos hasta expiración
 */
export const getTimeUntilExpiration = (token: string | null): number =>
  jwtHelper.getTimeUntilExpiration(token);

/**
 * Verifica si el token expirará pronto
 * @param token - Token JWT
 * @param minutesThreshold - Minutos de umbral
 * @returns true si expira pronto
 */
export const willExpireSoon = (token: string | null, minutesThreshold?: number): boolean =>
  jwtHelper.willExpireSoon(token, minutesThreshold);

// Exportaciones
export { JWTHelper, jwtHelper };
export default jwtHelper;
