/**
 * Helper de Seguridad - Principios SOLID, KISS, DRY
 * 
 * Proporciona funciones de seguridad reutilizables para:
 * - Sanitización de inputs
 * - Validación de formatos
 * - Prevención de ataques comunes
 * - Rate limiting básico
 */

import { logError, logInfo, logWarning } from '../log/logger.helper';
import { generateSecureToken, encryptData, decryptData } from '../encrypt/encrypt.helper';
import type { EncryptionResult } from '../encrypt/encrypt.helper';
import { validatePassword, BASIC_VALIDATION } from '@/utils/validators/password-validator.util';
import type { ValidationResult } from '@/utils/validators/password-validator.util';

// Tipos para configuración de seguridad
export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  passwordMinLength: number;
  passwordMaxLength: number;
}

// Configuración por defecto
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 3,
  lockoutDurationMs: 15 * 60 * 1000, // ✅ 15 minutos (CORREGIDO)
  passwordMinLength: 8,
  passwordMaxLength: 128
};

/**
 * Clase principal para manejo de seguridad
 * Implementa patrón Singleton para configuración consistente
 */
class SecurityHelper {
  private static instance: SecurityHelper;
  private config: SecurityConfig;
  private readonly ATTEMPTS_STORAGE_KEY = 'login_attempts';
  private readonly LOCKOUT_STORAGE_KEY = 'account_lockout';

  private constructor(config?: Partial<SecurityConfig>) {
    this.config = { ...DEFAULT_SECURITY_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<SecurityConfig>): SecurityHelper {
    if (!SecurityHelper.instance) {
      SecurityHelper.instance = new SecurityHelper(config);
    }
    return SecurityHelper.instance;
  }

  /**
   * Sanitiza strings removiendo caracteres peligrosos para formularios
   * Previene ataques XSS manteniendo acentos y caracteres especiales comunes
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      // Remover tags HTML peligrosos
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remover caracteres HTML básicos peligrosos
      .replace(/[<>]/g, '')
      // Remover protocolos peligrosos
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/data:/gi, '')
      // Remover event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remover atributos peligrosos
      .replace(/src\s*=/gi, '')
      .replace(/href\s*=/gi, '')
      // Limitar longitud
      .substring(0, 1000);
  }

  /**
   * Valida formato de email
   * Usa regex robusta pero no extrema
   */
  public isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim()) && email.length <= 254;
  }

  /**
   * Valida fortaleza de contraseña usando password-validator utility
   *
   * Usa el validator centralizado para mantener consistencia
   * y eliminar duplicación de código (DRY).
   *
   * @param password Contraseña a validar
   * @returns Objeto con isValid y lista de errores
   *
   * @example
   * ```typescript
   * const validation = securityHelper.isValidPassword('MyPass123');
   * if (!validation.isValid) {
   *   console.log('Errores:', validation.errors);
   * }
   * ```
   */
  public isValidPassword(password: string): ValidationResult {
    return validatePassword(password, {
      rules: {
        minLength: this.config.passwordMinLength,
        maxLength: this.config.passwordMaxLength
      },
      customMessages: {
        minLength: `La contraseña debe tener al menos ${this.config.passwordMinLength} caracteres`,
        maxLength: `La contraseña no puede tener más de ${this.config.passwordMaxLength} caracteres`
      }
    });
  }

  /**
   * Maneja intentos de login fallidos con encriptación
   *
   * Implementa rate limiting básico almacenando datos encriptados
   * en sessionStorage para prevenir manipulación.
   *
   * @param identifier Identificador único del usuario (email o userId)
   * @returns Promesa que resuelve cuando se guarda el intento
   *
   * @example
   * ```typescript
   * await securityHelper.recordFailedAttempt('user@example.com');
   * ```
   */
  public async recordFailedAttempt(identifier: string): Promise<void> {
    try {
      const attempts = await this.getFailedAttempts(identifier);
      const newAttempts = attempts + 1;

      // Crear objeto de datos
      const data = JSON.stringify({
        count: newAttempts,
        timestamp: Date.now()
      });

      // Encriptar datos antes de guardar
      const encrypted = await encryptData(data);

      sessionStorage.setItem(
        `${this.ATTEMPTS_STORAGE_KEY}_${identifier}`,
        JSON.stringify(encrypted)
      );

      if (newAttempts >= this.config.maxLoginAttempts) {
        await this.lockAccount(identifier);
      }

      logInfo('SecurityHelper', `Failed attempt recorded for ${identifier}`, {
        attempts: newAttempts,
        encrypted: true
      });
    } catch (error) {
      logError('SecurityHelper', error, 'Error recording failed attempt');
    }
  }

  /**
   * Obtiene número de intentos fallidos desencriptando datos
   *
   * @param identifier Identificador único del usuario
   * @returns Promesa que resuelve al número de intentos fallidos
   *
   * @example
   * ```typescript
   * const attempts = await securityHelper.getFailedAttempts('user@example.com');
   * console.log('Intentos fallidos:', attempts);
   * ```
   */
  public async getFailedAttempts(identifier: string): Promise<number> {
    try {
      const encryptedData = sessionStorage.getItem(`${this.ATTEMPTS_STORAGE_KEY}_${identifier}`);
      if (!encryptedData) return 0;

      // Parsear EncryptionResult
      const encryptionResult: EncryptionResult = JSON.parse(encryptedData);

      // Desencriptar datos
      const decrypted = await decryptData(encryptionResult);
      const parsed = JSON.parse(decrypted);

      return parsed.count || 0;
    } catch (error) {
      // Si falla la desencriptación (datos corruptos/modificados), retornar 0
      logWarning('SecurityHelper', 'Error al obtener intentos fallidos (datos corruptos)', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Limpiar datos corruptos
      sessionStorage.removeItem(`${this.ATTEMPTS_STORAGE_KEY}_${identifier}`);

      return 0;
    }
  }

  /**
   * Verifica si la cuenta está bloqueada desencriptando datos
   *
   * @param identifier Identificador único del usuario
   * @returns Promesa que resuelve a true si está bloqueada, false si no
   *
   * @example
   * ```typescript
   * const isLocked = await securityHelper.isAccountLocked('user@example.com');
   * if (isLocked) {
   *   const remaining = await securityHelper.getLockoutTimeRemaining('user@example.com');
   *   console.log(`Cuenta bloqueada por ${remaining} minutos`);
   * }
   * ```
   */
  public async isAccountLocked(identifier: string): Promise<boolean> {
    try {
      const lockData = sessionStorage.getItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      if (!lockData) return false;

      // Parsear EncryptionResult
      const encryptionResult: EncryptionResult = JSON.parse(lockData);

      // Desencriptar datos
      const decrypted = await decryptData(encryptionResult);
      const parsed = JSON.parse(decrypted);
      const lockUntil = parsed.lockUntil || 0;

      if (Date.now() < lockUntil) {
        return true;
      } else {
        // Lockout expiró, limpiar datos
        await this.clearFailedAttempts(identifier);
        return false;
      }
    } catch (error) {
      // Si falla la desencriptación (datos corruptos), asumir no bloqueado
      logWarning('SecurityHelper', 'Error al verificar bloqueo de cuenta (datos corruptos)', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Limpiar datos corruptos
      sessionStorage.removeItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);

      return false;
    }
  }

  /**
   * Obtiene tiempo restante de bloqueo en minutos desencriptando datos
   *
   * @param identifier Identificador único del usuario
   * @returns Promesa que resuelve al tiempo restante en minutos
   *
   * @example
   * ```typescript
   * const remaining = await securityHelper.getLockoutTimeRemaining('user@example.com');
   * if (remaining > 0) {
   *   console.log(`Intente nuevamente en ${remaining} minutos`);
   * }
   * ```
   */
  public async getLockoutTimeRemaining(identifier: string): Promise<number> {
    try {
      const lockData = sessionStorage.getItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      if (!lockData) return 0;

      // Parsear EncryptionResult
      const encryptionResult: EncryptionResult = JSON.parse(lockData);

      // Desencriptar datos
      const decrypted = await decryptData(encryptionResult);
      const parsed = JSON.parse(decrypted);
      const lockUntil = parsed.lockUntil || 0;
      const remaining = lockUntil - Date.now();

      return remaining > 0 ? Math.ceil(remaining / (60 * 1000)) : 0;
    } catch (error) {
      // Si falla la desencriptación, retornar 0
      logWarning('SecurityHelper', 'Error al obtener tiempo de bloqueo (datos corruptos)', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Limpiar datos corruptos
      sessionStorage.removeItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);

      return 0;
    }
  }

  /**
   * Bloquea cuenta temporalmente con encriptación
   *
   * @param identifier Identificador único del usuario
   * @returns Promesa que resuelve cuando se bloquea la cuenta
   *
   * @private
   */
  private async lockAccount(identifier: string): Promise<void> {
    try {
      const lockUntil = Date.now() + this.config.lockoutDurationMs;

      // Crear objeto de datos
      const data = JSON.stringify({ lockUntil });

      // Encriptar datos antes de guardar
      const encrypted = await encryptData(data);

      sessionStorage.setItem(
        `${this.LOCKOUT_STORAGE_KEY}_${identifier}`,
        JSON.stringify(encrypted)
      );

      logInfo('SecurityHelper', `Account locked for ${identifier}`, {
        lockUntil: new Date(lockUntil).toISOString(),
        durationMinutes: Math.ceil(this.config.lockoutDurationMs / (60 * 1000)),
        encrypted: true
      });
    } catch (error) {
      logError('SecurityHelper', error, 'Error locking account');
    }
  }

  /**
   * Limpia intentos fallidos y bloqueos (tras login exitoso)
   *
   * Remueve datos encriptados de sessionStorage
   *
   * @param identifier Identificador único del usuario
   * @returns Promesa que resuelve cuando se limpian los datos
   *
   * @example
   * ```typescript
   * // Después de login exitoso
   * await securityHelper.clearFailedAttempts('user@example.com');
   * ```
   */
  public async clearFailedAttempts(identifier: string): Promise<void> {
    try {
      sessionStorage.removeItem(`${this.ATTEMPTS_STORAGE_KEY}_${identifier}`);
      sessionStorage.removeItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      logInfo('SecurityHelper', `Cleared failed attempts for ${identifier}`, {
        encrypted: true
      });
    } catch (error) {
      logError('SecurityHelper', error, 'Error clearing failed attempts');
    }
  }

  /**
   * Genera token CSRF criptográficamente seguro
   *
   * Usa EncryptHelper para generar tokens seguros con Web Crypto API
   * en lugar de Math.random() que es predecible y NO debe usarse
   * para propósitos de seguridad.
   *
   * Formato: timestamp_secureToken
   *
   * @returns Token CSRF en formato timestamp_token (ej: "m8x1a2_9f2a5c...")
   *
   * @example
   * ```typescript
   * const csrfToken = securityHelper.generateCSRFToken();
   * // → "m8x1a2_9f2a5c7e1b3d8f6a4c2e5a7b9d1f3e5c"
   *
   * // Incluir en meta tag
   * document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', csrfToken);
   *
   * // Incluir en requests
   * fetch('/api/action', {
   *   headers: { 'X-CSRF-Token': csrfToken }
   * });
   * ```
   */
  public generateCSRFToken(): string {
    const timestamp = Date.now().toString(36);
    const secureToken = generateSecureToken(16); // 16 bytes = 32 chars hex (criptográficamente seguro)
    return `${timestamp}_${secureToken}`;
  }

  /**
   * Valida token CSRF (validación básica de formato)
   */
  public validateCSRFToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('_');
    if (parts.length !== 2) return false;

    const timestamp = parseInt(parts[0], 36);
    const maxAge = 60 * 60 * 1000; // 1 hora

    return !isNaN(timestamp) && (Date.now() - timestamp) < maxAge;
  }

  /**
   * Sanitiza coordenadas geográficas para logging seguro
   * Convierte coordenadas exactas a área aproximada (~10km precisión)
   *
   * @param lat - Latitud (-90 a 90)
   * @param lng - Longitud (-180 a 180)
   * @returns Objeto con datos sanitizados para logging
   *
   * @example
   * ```typescript
   * // Coordenadas exactas
   * const exact = { lat: 19.432608, lng: -99.133209 };
   *
   * // Sanitizadas para log
   * const sanitized = sanitizeCoordinatesForLog(exact.lat, exact.lng);
   * // → { approximateArea: "19.4, -99.1", precision: "~10km", hasCoordinates: true }
   * ```
   */
  public sanitizeCoordinatesForLog(lat: number, lng: number): {
    approximateArea: string;
    precision: string;
    hasCoordinates: boolean;
    validRange: boolean;
  } {
    // Validar que las coordenadas estén en rango válido
    const validLat = !isNaN(lat) && lat >= -90 && lat <= 90;
    const validLng = !isNaN(lng) && lng >= -180 && lng <= 180;
    const validRange = validLat && validLng;

    if (!validRange) {
      return {
        approximateArea: 'Invalid coordinates',
        precision: 'N/A',
        hasCoordinates: false,
        validRange: false
      };
    }

    // Redondear a 1 decimal (~10km de precisión)
    // Esto oculta la ubicación exacta pero mantiene contexto útil para debugging
    const approxLat = lat.toFixed(1);
    const approxLng = lng.toFixed(1);

    return {
      approximateArea: `${approxLat}, ${approxLng}`,
      precision: '~10km',
      hasCoordinates: true,
      validRange: true
    };
  }
}

// Instancia por defecto
const securityHelper = SecurityHelper.getInstance();

// Funciones helper para uso directo

/**
 * Sanitiza strings removiendo caracteres peligrosos
 */
export const sanitizeInput = (input: string): string => securityHelper.sanitizeInput(input);

/**
 * Valida formato de email
 */
export const isValidEmail = (email: string): boolean => securityHelper.isValidEmail(email);

/**
 * Valida fortaleza de contraseña
 */
export const isValidPassword = (password: string) => securityHelper.isValidPassword(password);

/**
 * Registra intento de login fallido (con encriptación)
 * @returns Promesa que resuelve cuando se guarda el intento
 */
export const recordFailedAttempt = async (identifier: string): Promise<void> =>
  securityHelper.recordFailedAttempt(identifier);

/**
 * Obtiene número de intentos fallidos (desencripta datos)
 * @returns Promesa que resuelve al número de intentos
 */
export const getFailedAttempts = async (identifier: string): Promise<number> =>
  securityHelper.getFailedAttempts(identifier);

/**
 * Verifica si la cuenta está bloqueada (desencripta datos)
 * @returns Promesa que resuelve a true si está bloqueada
 */
export const isAccountLocked = async (identifier: string): Promise<boolean> =>
  securityHelper.isAccountLocked(identifier);

/**
 * Obtiene tiempo restante de bloqueo en minutos (desencripta datos)
 * @returns Promesa que resuelve al tiempo restante en minutos
 */
export const getLockoutTimeRemaining = async (identifier: string): Promise<number> =>
  securityHelper.getLockoutTimeRemaining(identifier);

/**
 * Limpia intentos fallidos tras login exitoso
 * @returns Promesa que resuelve cuando se limpian los datos
 */
export const clearFailedAttempts = async (identifier: string): Promise<void> =>
  securityHelper.clearFailedAttempts(identifier);

/**
 * Genera token CSRF criptográficamente seguro (usa EncryptHelper)
 */
export const generateCSRFToken = (): string => securityHelper.generateCSRFToken();

/**
 * Valida token CSRF (validación básica de formato)
 */
export const validateCSRFToken = (token: string): boolean => securityHelper.validateCSRFToken(token);

/**
 * Sanitiza coordenadas geográficas para logging seguro
 */
export const sanitizeCoordinatesForLog = (lat: number, lng: number) =>
  securityHelper.sanitizeCoordinatesForLog(lat, lng);

// Exportaciones
export { SecurityHelper, securityHelper };
export default securityHelper;