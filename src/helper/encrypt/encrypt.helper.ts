/**
 * Encrypt Helper - Sistema de encriptación y hashing para IPH Frontend
 * 
 * Características:
 * - Hashing seguro de passwords con salt
 * - Encriptación/desencriptación de datos sensibles
 * - Generación de tokens seguros
 * - Integración con logger helper
 * - Configuración por ambiente
 * 
 * Patrones implementados:
 * - Singleton Pattern
 * - Configuration Management Pattern
 * - Error Handling Standardized
 * - Logger Integration Pattern
 * 
 * @author Sistema IPH Frontend
 * @version 1.0.0
 */

import { logInfo, logError, logWarning } from '../log/logger.helper';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

/**
 * Configuración del Encrypt Helper
 */
export interface EncryptHelperConfig {
  /** Algoritmo de hashing por defecto */
  defaultHashAlgorithm: 'SHA-256' | 'SHA-512';
  /** Longitud del salt para passwords */
  saltLength: number;
  /** Iteraciones para PBKDF2 */
  hashIterations: number;
  /** Algoritmo de encriptación simétrica */
  encryptionAlgorithm: 'AES-GCM' | 'AES-CBC';
  /** Longitud de la clave de encriptación */
  keyLength: number;
  /** Habilitar logging de operaciones */
  enableLogging: boolean;
  /** Ambiente de ejecución */
  environment: 'development' | 'staging' | 'production';
  /** Passphrase por defecto desde variables de entorno */
  defaultPassphrase?: string;
  /** Usar passphrase de variables de entorno automáticamente */
  useEnvironmentPassphrase: boolean;
}

/**
 * Resultado de operación de hashing
 */
export interface HashResult {
  /** Hash resultante */
  hash: string;
  /** Salt utilizado */
  salt: string;
  /** Algoritmo utilizado */
  algorithm: string;
  /** Número de iteraciones */
  iterations: number;
}

/**
 * Resultado de operación de encriptación
 */
export interface EncryptionResult {
  /** Datos encriptados (base64) */
  encrypted: string;
  /** Vector de inicialización (base64) */
  iv: string;
  /** Algoritmo utilizado */
  algorithm: string;
  /** Timestamp de la operación */
  timestamp: number;
}

/**
 * Resultado de verificación de password
 */
export interface PasswordVerification {
  /** Si la verificación fue exitosa */
  isValid: boolean;
  /** Tiempo que tomó la verificación (ms) */
  verificationTime: number;
  /** Si necesita rehashing (algoritmo obsoleto) */
  needsRehash: boolean;
}

// =====================================================
// CONFIGURACIÓN Y VARIABLES DE ENTORNO
// =====================================================

/**
 * Variables de entorno para configuración de seguridad
 */
const ENV_VARIABLES = {
  // Variable principal de passphrase para encriptación
  ENCRYPT_PASSPHRASE: 'VITE_ENCRYPT_PASSPHRASE',
  // Variable alternativa para compatibilidad
  ENCRYPTION_KEY: 'VITE_ENCRYPTION_KEY',
  // Variable de configuración de seguridad
  ENCRYPT_CONFIG: 'VITE_ENCRYPT_CONFIG'
} as const;

/**
 * Obtiene la passphrase desde variables de entorno
 * Prioriza VITE_ENCRYPT_PASSPHRASE, luego VITE_ENCRYPTION_KEY
 */
const getEnvironmentPassphrase = (): string | undefined => {
  try {
    // Verificar variables de entorno de Vite (import.meta.env) - Método principal en frontend
    const globalWithImport = globalThis as { import?: { meta?: { env?: Record<string, string> } } };
    if (typeof globalThis !== 'undefined' && globalWithImport.import?.meta?.env) {
      const env = globalWithImport.import.meta.env;
      return env[ENV_VARIABLES.ENCRYPT_PASSPHRASE] || env[ENV_VARIABLES.ENCRYPTION_KEY];
    }
    
    // Verificar si estamos en entorno Node.js y process está disponible
    const globalWithProcess = globalThis as { process?: { env?: Record<string, string> } };
    if (typeof globalThis !== 'undefined' && globalWithProcess.process?.env) {
      const env = globalWithProcess.process.env;
      return env[ENV_VARIABLES.ENCRYPT_PASSPHRASE] || env[ENV_VARIABLES.ENCRYPTION_KEY];
    }
    
    // Fallback para entornos que exponen variables globalmente en window
    const windowWithEnv = window as Window & { __ENV__?: Record<string, string> };
    if (typeof window !== 'undefined' && windowWithEnv.__ENV__) {
      const envVars = windowWithEnv.__ENV__;
      return envVars[ENV_VARIABLES.ENCRYPT_PASSPHRASE] || 
             envVars[ENV_VARIABLES.ENCRYPTION_KEY];
    }
    
    return undefined;
  } catch {
    // Si hay error accediendo a variables de entorno, devolver undefined
    return undefined;
  }
};

/**
 * Genera passphrase por defecto si no se encuentra en variables de entorno
 */
const generateDefaultPassphrase = (): string => {
  // En desarrollo, usar una clave predecible para facilitar debugging
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `iph-frontend-${hostname}-default-passphrase-2024`;
  }
  
  // Fallback genérico
  return 'iph-frontend-default-passphrase-2024-secure';
};

/**
 * Configuración por defecto del Encrypt Helper
 */
const DEFAULT_ENCRYPT_CONFIG: EncryptHelperConfig = {
  defaultHashAlgorithm: 'SHA-256',
  saltLength: 32,
  hashIterations: 100000, // Recomendación OWASP 2024
  encryptionAlgorithm: 'AES-GCM',
  keyLength: 256,
  enableLogging: true,
  environment: 'development',
  defaultPassphrase: getEnvironmentPassphrase() || generateDefaultPassphrase(),
  useEnvironmentPassphrase: true
};

/**
 * Configuraciones específicas por ambiente
 */
const ENVIRONMENT_CONFIGS: Record<string, Partial<EncryptHelperConfig>> = {
  development: {
    hashIterations: 10000, // Menor para desarrollo
    enableLogging: true
  },
  staging: {
    hashIterations: 50000, // Intermedio para staging
    enableLogging: true
  },
  production: {
    hashIterations: 100000, // Máximo para producción
    enableLogging: false // Sin logs detallados en producción
  }
};

// =====================================================
// CONSTANTES
// =====================================================

// Nombres de algoritmos para uso futuro en implementación
// const ALGORITHM_NAMES = {
//   'SHA-256': 'SHA-256',
//   'SHA-512': 'SHA-512',
//   'AES-GCM': 'AES-GCM',
//   'AES-CBC': 'AES-CBC'
// } as const;

const ERROR_MESSAGES = {
  HASH_GENERATION_FAILED: 'Error al generar hash',
  HASH_VERIFICATION_FAILED: 'Error al verificar hash',
  ENCRYPTION_FAILED: 'Error al encriptar datos',
  DECRYPTION_FAILED: 'Error al desencriptar datos',
  INVALID_INPUT: 'Entrada inválida',
  CRYPTO_NOT_SUPPORTED: 'Web Crypto API no soportada en este navegador',
  INVALID_HASH_FORMAT: 'Formato de hash inválido'
} as const;

// =====================================================
// CLASE PRINCIPAL
// =====================================================

/**
 * Helper principal para operaciones de encriptación y hashing
 * Implementa patrón Singleton con configuración flexible
 */
export class EncryptHelper {
  /** Instancia única del helper */
  private static instance: EncryptHelper;
  
  /** Configuración actual del helper */
  private config: EncryptHelperConfig;
  
  /** Cache de claves derivadas para performance */
  private keyCache: Map<string, CryptoKey> = new Map();

  /**
   * Constructor privado para implementar Singleton
   * @param config Configuración opcional inicial
   */
  private constructor(config?: Partial<EncryptHelperConfig>) {
    this.config = this.initializeConfig(config);
    this.validateCryptoSupport();
    
    if (this.config.enableLogging) {
      logInfo('EncryptHelper', 'Encrypt Helper inicializado correctamente', {
        algorithm: this.config.defaultHashAlgorithm,
        iterations: this.config.hashIterations,
        environment: this.config.environment
      });
    }
  }

  /**
   * Obtiene la instancia única del EncryptHelper
   * @param config Configuración opcional inicial (solo en primera llamada)
   * @returns Instancia del EncryptHelper
   */
  public static getInstance(config?: Partial<EncryptHelperConfig>): EncryptHelper {
    if (!EncryptHelper.instance) {
      EncryptHelper.instance = new EncryptHelper(config);
    }
    return EncryptHelper.instance;
  }

  /**
   * Actualiza la configuración del helper
   * @param newConfig Nueva configuración a aplicar
   */
  public updateConfig(newConfig: Partial<EncryptHelperConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Limpiar cache si cambió algoritmo o parámetros clave
    if (
      oldConfig.defaultHashAlgorithm !== this.config.defaultHashAlgorithm ||
      oldConfig.hashIterations !== this.config.hashIterations ||
      oldConfig.encryptionAlgorithm !== this.config.encryptionAlgorithm
    ) {
      this.keyCache.clear();
    }

    if (this.config.enableLogging) {
      logInfo('EncryptHelper', 'Configuración actualizada', { 
        changes: newConfig,
        keyCacheCleared: this.keyCache.size === 0 
      });
    }
  }

  /**
   * Obtiene una copia de la configuración actual
   * @returns Configuración actual del helper
   */
  public getConfig(): EncryptHelperConfig {
    return { ...this.config };
  }

  // =====================================================
  // MÉTODOS PRIVADOS DE INICIALIZACIÓN
  // =====================================================

  /**
   * Inicializa la configuración basada en el ambiente
   * @param userConfig Configuración proporcionada por el usuario
   * @returns Configuración final del helper
   */
  private initializeConfig(userConfig?: Partial<EncryptHelperConfig>): EncryptHelperConfig {
    // Detectar ambiente actual
    const currentEnv = this.detectEnvironment();
    const envConfig = ENVIRONMENT_CONFIGS[currentEnv] || {};
    
    // Combinar configuraciones: default < environment < user
    return {
      ...DEFAULT_ENCRYPT_CONFIG,
      ...envConfig,
      ...userConfig,
      environment: currentEnv
    };
  }

  /**
   * Detecta el ambiente actual de ejecución
   * @returns Ambiente detectado
   */
  private detectEnvironment(): 'development' | 'staging' | 'production' {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
      switch (process.env.NODE_ENV) {
        case 'production': return 'production';
        case 'staging': return 'staging';
        default: return 'development';
      }
    }
    
    // Fallback basado en hostname para entornos web
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('prod') || hostname.includes('www.')) {
        return 'production';
      } else if (hostname.includes('staging') || hostname.includes('stg')) {
        return 'staging';
      }
    }
    
    return 'development';
  }

  /**
   * Valida que Web Crypto API esté disponible
   * @throws Error si Web Crypto API no está soportada
   */
  private validateCryptoSupport(): void {
    if (!crypto || !crypto.subtle) {
      const error = new Error(ERROR_MESSAGES.CRYPTO_NOT_SUPPORTED);
      logError('EncryptHelper', ERROR_MESSAGES.CRYPTO_NOT_SUPPORTED);
      throw error;
    }
  }

  // =====================================================
  // MÉTODOS DE UTILIDADES DE PASSPHRASE
  // =====================================================

  /**
   * Obtiene la passphrase a usar para una operación
   * @param userPassphrase Passphrase proporcionada por el usuario (opcional)
   * @returns Passphrase final a utilizar
   */
  private resolvePassphrase(userPassphrase?: string): string {
    // 1. Si el usuario proporciona passphrase, usarla
    if (userPassphrase && typeof userPassphrase === 'string' && userPassphrase.length > 0) {
      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Usando passphrase proporcionada por usuario');
      }
      return userPassphrase;
    }

    // 2. Si está configurado para usar variables de entorno, intentar obtenerla
    if (this.config.useEnvironmentPassphrase && this.config.defaultPassphrase) {
      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Usando passphrase desde configuración/variables de entorno');
      }
      return this.config.defaultPassphrase;
    }

    // 3. Fallback a passphrase generada dinámicamente
    const fallbackPassphrase = this.generateFallbackPassphrase();
    if (this.config.enableLogging) {
      logWarning('EncryptHelper', 'Usando passphrase fallback generada dinámicamente');
    }
    return fallbackPassphrase;
  }

  /**
   * Genera una passphrase fallback basada en datos del navegador/sesión
   * @returns Passphrase fallback
   */
  private generateFallbackPassphrase(): string {
    const components: string[] = [
      'iph-frontend-fallback',
      this.config.environment,
      Date.now().toString().slice(-6) // Últimos 6 dígitos del timestamp
    ];

    // Agregar información del navegador si está disponible
    if (typeof window !== 'undefined') {
      components.push(window.location.hostname);
      components.push(navigator.userAgent.slice(-10)); // Últimos 10 chars del user agent
    }

    return components.join('-');
  }

  /**
   * Valida que una passphrase cumpla con los requisitos mínimos
   * @param passphrase Passphrase a validar
   * @throws Error si la passphrase no es válida
   */
  private validatePassphrase(passphrase: string): void {
    if (!passphrase || typeof passphrase !== 'string') {
      throw new Error('Passphrase debe ser una cadena no vacía');
    }

    if (passphrase.length < 8) {
      throw new Error('Passphrase debe tener al menos 8 caracteres');
    }

    // Sin límite máximo para permitir encriptación de datos grandes de sessionStorage
    // if (passphrase.length > 256) {
    //   throw new Error('Passphrase demasiado larga (máximo 256 caracteres)');
    // }
  }

  /**
   * Refresca la passphrase desde variables de entorno
   * Útil para actualizaciones en tiempo de ejecución
   */
  public refreshEnvironmentPassphrase(): void {
    const newPassphrase = getEnvironmentPassphrase();
    
    if (newPassphrase) {
      const oldPassphrase = this.config.defaultPassphrase;
      this.config.defaultPassphrase = newPassphrase;
      
      // Limpiar cache si la passphrase cambió
      if (oldPassphrase !== newPassphrase) {
        this.keyCache.clear();
        
        if (this.config.enableLogging) {
          logInfo('EncryptHelper', 'Passphrase actualizada desde variables de entorno', {
            keysCacheCleared: true,
            passphraseChanged: true
          });
        }
      }
    } else if (this.config.enableLogging) {
      logWarning('EncryptHelper', 'No se encontró passphrase en variables de entorno durante refresh');
    }
  }

  /**
   * Verifica si hay una passphrase configurada desde variables de entorno
   * @returns true si hay passphrase desde variables de entorno
   */
  public hasEnvironmentPassphrase(): boolean {
    const envPassphrase = getEnvironmentPassphrase();
    return !!envPassphrase;
  }

  // =====================================================
  // MÉTODOS PÚBLICOS (Stubs para implementación siguiente)
  // =====================================================

  /**
   * Genera hash seguro de password con salt
   * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async hashPassword(_password: string): Promise<HashResult> {
    throw new Error('Método no implementado - Parte 2');
  }

  /**
   * Verifica password contra hash almacenado
   * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async verifyPassword(_password: string, _hash: string): Promise<PasswordVerification> {
    throw new Error('Método no implementado - Parte 2');
  }

  /**
   * Encripta datos sensibles
   * Si no se proporciona passphrase, usa la de variables de entorno
   * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async encryptData(_data: string, _passphrase?: string): Promise<EncryptionResult> {
    throw new Error('Método no implementado - Parte 3');
  }

  /**
   * Desencripta datos sensibles
   * Si no se proporciona passphrase, usa la de variables de entorno
   * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async decryptData(_encryptedData: EncryptionResult, _passphrase?: string): Promise<string> {
    throw new Error('Método no implementado - Parte 3');
  }

  /**
   * Genera token seguro aleatorio
   * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public generateSecureToken(_length: number = 32): string {
    throw new Error('Método no implementado - Parte 3');
  }
}

// =====================================================
// HELPER FUNCTIONS PARA API FUNCIONAL
// =====================================================

/**
 * Instancia global del helper para funciones de conveniencia
 */
let globalEncryptHelper: EncryptHelper;

/**
 * Obtiene la instancia global del encrypt helper
 * @returns Instancia del EncryptHelper
 */
const getEncryptHelper = (): EncryptHelper => {
  if (!globalEncryptHelper) {
    globalEncryptHelper = EncryptHelper.getInstance();
  }
  return globalEncryptHelper;
};

// =====================================================
// API FUNCIONAL DE CONVENIENCIA (Stubs)
// =====================================================

/**
 * Genera hash de password de manera funcional
 * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
 */
export const hashPassword = async (password: string): Promise<HashResult> => {
  return getEncryptHelper().hashPassword(password);
};

/**
 * Verifica password de manera funcional
 * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
 */
export const verifyPassword = async (password: string, hash: string): Promise<PasswordVerification> => {
  return getEncryptHelper().verifyPassword(password, hash);
};

/**
 * Encripta datos de manera funcional
 * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
 */
export const encryptData = async (data: string, passphrase?: string): Promise<EncryptionResult> => {
  return getEncryptHelper().encryptData(data, passphrase);
};

/**
 * Desencripta datos de manera funcional
 * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
 */
export const decryptData = async (encryptedData: EncryptionResult, passphrase?: string): Promise<string> => {
  return getEncryptHelper().decryptData(encryptedData, passphrase);
};

/**
 * Genera token seguro de manera funcional
 * [IMPLEMENTACIÓN EN PRÓXIMA PARTE]
 */
export const generateSecureToken = (length: number = 32): string => {
  return getEncryptHelper().generateSecureToken(length);
};

// =====================================================
// EXPORTS
// =====================================================

export default EncryptHelper;