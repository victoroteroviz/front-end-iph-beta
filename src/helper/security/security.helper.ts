/**
 * Helper de Seguridad - Principios SOLID, KISS, DRY
 * 
 * Proporciona funciones de seguridad reutilizables para:
 * - Sanitización de inputs
 * - Validación de formatos
 * - Prevención de ataques comunes
 * - Rate limiting básico
 */

import { logError, logInfo } from '../log/logger.helper';

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
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutos
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
   * Sanitiza strings removiendo caracteres peligrosos
   * Previene ataques XSS básicos
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .substring(0, 1000); // Limitar longitud
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
   * Valida fortaleza de contraseña
   * Configurable según requerimientos
   */
  public isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('La contraseña es requerida');
      return { isValid: false, errors };
    }

    if (password.length < this.config.passwordMinLength) {
      errors.push(`La contraseña debe tener al menos ${this.config.passwordMinLength} caracteres`);
    }

    if (password.length > this.config.passwordMaxLength) {
      errors.push(`La contraseña no puede tener más de ${this.config.passwordMaxLength} caracteres`);
    }

    // Validaciones adicionales pueden agregarse aquí
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Maneja intentos de login fallidos
   * Implementa rate limiting básico
   */
  public recordFailedAttempt(identifier: string): void {
    try {
      const attempts = this.getFailedAttempts(identifier);
      const newAttempts = attempts + 1;
      
      sessionStorage.setItem(
        `${this.ATTEMPTS_STORAGE_KEY}_${identifier}`,
        JSON.stringify({
          count: newAttempts,
          timestamp: Date.now()
        })
      );

      if (newAttempts >= this.config.maxLoginAttempts) {
        this.lockAccount(identifier);
      }

      logInfo('SecurityHelper', `Failed attempt recorded for ${identifier}`, { attempts: newAttempts });
    } catch (error) {
      logError('SecurityHelper', error, 'Error recording failed attempt');
    }
  }

  /**
   * Obtiene número de intentos fallidos
   */
  public getFailedAttempts(identifier: string): number {
    try {
      const data = sessionStorage.getItem(`${this.ATTEMPTS_STORAGE_KEY}_${identifier}`);
      if (!data) return 0;
      
      const parsed = JSON.parse(data);
      return parsed.count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Verifica si la cuenta está bloqueada
   */
  public isAccountLocked(identifier: string): boolean {
    try {
      const lockData = sessionStorage.getItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      if (!lockData) return false;

      const parsed = JSON.parse(lockData);
      const lockUntil = parsed.lockUntil || 0;
      
      if (Date.now() < lockUntil) {
        return true;
      } else {
        // Lockout expiró, limpiar datos
        this.clearFailedAttempts(identifier);
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Obtiene tiempo restante de bloqueo en minutos
   */
  public getLockoutTimeRemaining(identifier: string): number {
    try {
      const lockData = sessionStorage.getItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      if (!lockData) return 0;

      const parsed = JSON.parse(lockData);
      const lockUntil = parsed.lockUntil || 0;
      const remaining = lockUntil - Date.now();
      
      return remaining > 0 ? Math.ceil(remaining / (60 * 1000)) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Bloquea cuenta temporalmente
   */
  private lockAccount(identifier: string): void {
    try {
      const lockUntil = Date.now() + this.config.lockoutDurationMs;
      
      sessionStorage.setItem(
        `${this.LOCKOUT_STORAGE_KEY}_${identifier}`,
        JSON.stringify({ lockUntil })
      );

      logInfo('SecurityHelper', `Account locked for ${identifier}`, { 
        lockUntil: new Date(lockUntil).toISOString() 
      });
    } catch (error) {
      logError('SecurityHelper', error, 'Error locking account');
    }
  }

  /**
   * Limpia intentos fallidos (tras login exitoso)
   */
  public clearFailedAttempts(identifier: string): void {
    try {
      sessionStorage.removeItem(`${this.ATTEMPTS_STORAGE_KEY}_${identifier}`);
      sessionStorage.removeItem(`${this.LOCKOUT_STORAGE_KEY}_${identifier}`);
      logInfo('SecurityHelper', `Cleared failed attempts for ${identifier}`);
    } catch (error) {
      logError('SecurityHelper', error, 'Error clearing failed attempts');
    }
  }

  /**
   * Genera un token CSRF simple para formularios
   */
  public generateCSRFToken(): string {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2);
    return `${timestamp}_${randomString}`;
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
}

// Instancia por defecto
const securityHelper = SecurityHelper.getInstance();

// Funciones helper para uso directo
export const sanitizeInput = (input: string): string => securityHelper.sanitizeInput(input);

export const isValidEmail = (email: string): boolean => securityHelper.isValidEmail(email);

export const isValidPassword = (password: string) => securityHelper.isValidPassword(password);

export const recordFailedAttempt = (identifier: string): void => securityHelper.recordFailedAttempt(identifier);

export const getFailedAttempts = (identifier: string): number => securityHelper.getFailedAttempts(identifier);

export const isAccountLocked = (identifier: string): boolean => securityHelper.isAccountLocked(identifier);

export const getLockoutTimeRemaining = (identifier: string): number => securityHelper.getLockoutTimeRemaining(identifier);

export const clearFailedAttempts = (identifier: string): void => securityHelper.clearFailedAttempts(identifier);

export const generateCSRFToken = (): string => securityHelper.generateCSRFToken();

export const validateCSRFToken = (token: string): boolean => securityHelper.validateCSRFToken(token);

// Exportaciones
export { SecurityHelper, securityHelper };
export default securityHelper;