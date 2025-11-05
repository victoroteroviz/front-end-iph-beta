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
import { validatePasswordOrThrow, PASSPHRASE_VALIDATION } from '@/utils/validators/password-validator.util';

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
   *
   * Usa el password-validator utility centralizado para mantener
   * consistencia y eliminar duplicación de código (DRY).
   *
   * @param passphrase Passphrase a validar
   * @throws Error si la passphrase no es válida
   *
   * @example
   * ```typescript
   * // Internamente usado por encryptData() y otros métodos
   * this.validatePassphrase('my-secure-passphrase-2024');
   * ```
   */
  private validatePassphrase(passphrase: string): void {
    // Usa PASSPHRASE_VALIDATION preset (min 8 chars, sin max)
    validatePasswordOrThrow(passphrase, {
      rules: PASSPHRASE_VALIDATION,
      customMessages: {
        minLength: 'Passphrase debe tener al menos 8 caracteres'
      }
    });
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
  // MÉTODOS AUXILIARES PRIVADOS DE CONVERSIÓN
  // =====================================================

  /**
   * Convierte ArrayBuffer a string base64
   * @param buffer ArrayBuffer a convertir
   * @returns String en formato base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convierte string base64 a ArrayBuffer
   * @param base64 String en formato base64
   * @returns ArrayBuffer decodificado
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Convierte Uint8Array a string hexadecimal
   * @param buffer Uint8Array a convertir
   * @returns String en formato hexadecimal
   */
  private uint8ArrayToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // =====================================================
  // MÉTODOS PRIVADOS DE CRIPTOGRAFÍA
  // =====================================================

  /**
   * Deriva clave criptográfica desde passphrase usando PBKDF2
   * Implementa cache para mejorar performance en operaciones repetidas
   *
   * @param passphrase Passphrase desde la cual derivar la clave
   * @param salt Salt opcional (si no se proporciona, usa salt fijo)
   * @returns Promesa que resuelve a CryptoKey para AES-GCM
   *
   * @throws Error si falla la derivación de clave
   *
   * @example
   * ```typescript
   * const key = await this.deriveKey('mi-passphrase-segura');
   * // Usa key para operaciones de encriptación/desencriptación
   * ```
   */
  private async deriveKey(passphrase: string, salt?: Uint8Array): Promise<CryptoKey> {
    const startTime = performance.now();

    try {
      // Generar clave única de cache basada en passphrase y salt
      // NOTA: En producción, considerar hashear la passphrase para el cache key
      const cacheKey = salt
        ? `${passphrase}_${this.uint8ArrayToHex(salt)}`
        : `${passphrase}_default`;

      // Verificar cache primero para performance
      if (this.keyCache.has(cacheKey)) {
        if (this.config.enableLogging) {
          logInfo('EncryptHelper', 'Clave obtenida desde cache', {
            cacheHit: true,
            duration: `${(performance.now() - startTime).toFixed(2)}ms`
          });
        }
        return this.keyCache.get(cacheKey)!;
      }

      // Preparar passphrase como ArrayBuffer
      const encoder = new TextEncoder();
      const passphraseBuffer = encoder.encode(passphrase);

      // Importar passphrase como CryptoKey base para PBKDF2
      const baseKey = await crypto.subtle.importKey(
        'raw',
        passphraseBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      // Usar salt proporcionado o salt fijo desde configuración
      const derivationSalt = salt || encoder.encode('iph-frontend-encryption-salt-v1-2024');

      // Derivar clave final usando PBKDF2
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: derivationSalt,
          iterations: this.config.hashIterations,
          hash: this.config.defaultHashAlgorithm
        },
        baseKey,
        {
          name: this.config.encryptionAlgorithm,
          length: this.config.keyLength
        },
        false, // No exportable por seguridad
        ['encrypt', 'decrypt']
      );

      // Guardar en cache para futuras operaciones
      this.keyCache.set(cacheKey, derivedKey);

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Clave derivada exitosamente', {
          algorithm: this.config.encryptionAlgorithm,
          iterations: this.config.hashIterations,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`,
          cached: true
        });
      }

      return derivedKey;

    } catch (error) {
      logError('EncryptHelper', error, 'Error al derivar clave criptográfica');
      throw new Error('Error al derivar clave de encriptación');
    }
  }

  // =====================================================
  // MÉTODOS PÚBLICOS DE TOKENS
  // =====================================================

  /**
   * Genera token seguro aleatorio usando Web Crypto API
   *
   * Utiliza crypto.getRandomValues() que es criptográficamente seguro,
   * a diferencia de Math.random() que es predecible y NO debe usarse
   * para propósitos de seguridad.
   *
   * @param length Longitud del token en bytes (default 32 bytes = 64 caracteres hex)
   * @returns Token en formato hexadecimal
   *
   * @throws Error si length es inválido o falla la generación
   *
   * @example
   * ```typescript
   * // Generar token de sesión
   * const sessionToken = encryptHelper.generateSecureToken(32);
   * // → "a3f5d8e2b1c4... (64 caracteres hex)"
   *
   * // Generar token corto para CSRF
   * const csrfToken = encryptHelper.generateSecureToken(16);
   * // → "9f2a... (32 caracteres hex)"
   * ```
   */
  public generateSecureToken(length: number = 32): string {
    const startTime = performance.now();

    try {
      // Validación de entrada
      if (!Number.isInteger(length) || length <= 0 || length > 256) {
        throw new Error('Longitud de token debe ser entero positivo entre 1 y 256 bytes');
      }

      // Generar bytes aleatorios criptográficamente seguros
      const buffer = new Uint8Array(length);
      crypto.getRandomValues(buffer);

      // Convertir a hexadecimal (cada byte = 2 caracteres hex)
      const token = this.uint8ArrayToHex(buffer);

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Token seguro generado', {
          lengthBytes: length,
          lengthChars: token.length,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return token;

    } catch (error) {
      logError('EncryptHelper', error, 'Error al generar token seguro');
      throw new Error('Error al generar token de seguridad');
    }
  }

  // =====================================================
  // MÉTODOS PÚBLICOS DE HASHING DE PASSWORDS
  // =====================================================

  /**
   * Genera hash seguro de password con salt aleatorio usando PBKDF2
   *
   * Este método implementa las mejores prácticas de OWASP para hashing de passwords:
   * - Salt único aleatorio por password
   * - PBKDF2 con SHA-256/SHA-512 (configurable)
   * - Iteraciones configurables por ambiente (10k dev, 100k prod)
   * - Hash y salt almacenados en formato base64
   *
   * @param password Password en texto plano a hashear
   * @returns Promesa que resuelve a HashResult con hash, salt y metadatos
   *
   * @throws Error si el password es inválido o falla el hashing
   *
   * @example
   * ```typescript
   * const result = await encryptHelper.hashPassword('MiPassword123!');
   * // → {
   * //   hash: "base64EncodedHash...",
   * //   salt: "base64EncodedSalt...",
   * //   algorithm: "SHA-256",
   * //   iterations: 100000
   * // }
   *
   * // Guardar en base de datos
   * await db.users.update({ passwordHash: result.hash, passwordSalt: result.salt });
   * ```
   */
  public async hashPassword(password: string): Promise<HashResult> {
    const startTime = performance.now();

    try {
      // Validar entrada
      if (!password || typeof password !== 'string') {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
      }

      if (password.length < 1 || password.length > 1024) {
        throw new Error('Password debe tener entre 1 y 1024 caracteres');
      }

      // 1. Generar salt aleatorio criptográficamente seguro
      const salt = new Uint8Array(this.config.saltLength);
      crypto.getRandomValues(salt);

      // 2. Convertir password a ArrayBuffer
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // 3. Importar password como CryptoKey para PBKDF2
      const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // 4. Derivar hash usando PBKDF2
      // Genera 256 bits (32 bytes) de hash
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: this.config.hashIterations,
          hash: this.config.defaultHashAlgorithm
        },
        baseKey,
        256 // 256 bits de output
      );

      // 5. Convertir a base64 para almacenamiento
      const hashBase64 = this.arrayBufferToBase64(hashBuffer);
      const saltBase64 = this.arrayBufferToBase64(salt.buffer);

      const result: HashResult = {
        hash: hashBase64,
        salt: saltBase64,
        algorithm: this.config.defaultHashAlgorithm,
        iterations: this.config.hashIterations
      };

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Password hasheado exitosamente', {
          algorithm: result.algorithm,
          iterations: result.iterations,
          saltLength: this.config.saltLength,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return result;

    } catch (error) {
      logError('EncryptHelper', error, ERROR_MESSAGES.HASH_GENERATION_FAILED);
      throw new Error(ERROR_MESSAGES.HASH_GENERATION_FAILED);
    }
  }

  /**
   * Verifica password contra hash almacenado con protección contra timing attacks
   *
   * Implementa verificación segura recalculando el hash con el mismo salt
   * y comparando de manera constant-time para prevenir timing attacks.
   *
   * @param password Password en texto plano a verificar
   * @param storedHashResult Hash almacenado (formato "hash:salt:algorithm:iterations")
   * @returns Promesa que resuelve a PasswordVerification
   *
   * @throws Error si el formato del hash es inválido o falla la verificación
   *
   * @example
   * ```typescript
   * // Formato de almacenamiento recomendado: "hash:salt:algorithm:iterations"
   * const stored = `${hashResult.hash}:${hashResult.salt}:${hashResult.algorithm}:${hashResult.iterations}`;
   *
   * // Verificar durante login
   * const verification = await encryptHelper.verifyPassword(inputPassword, stored);
   *
   * if (verification.isValid) {
   *   console.log('Login exitoso');
   *
   *   if (verification.needsRehash) {
   *     // El algoritmo cambió, rehashear con nuevos parámetros
   *     const newHash = await encryptHelper.hashPassword(inputPassword);
   *     await db.users.update({ passwordHash: newHash.hash, passwordSalt: newHash.salt });
   *   }
   * }
   * ```
   */
  public async verifyPassword(password: string, storedHashResult: string): Promise<PasswordVerification> {
    const startTime = performance.now();

    try {
      // Validar entrada
      if (!password || typeof password !== 'string') {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
      }

      if (!storedHashResult || typeof storedHashResult !== 'string') {
        throw new Error(ERROR_MESSAGES.INVALID_HASH_FORMAT);
      }

      // Parsear formato "hash:salt:algorithm:iterations"
      const parts = storedHashResult.split(':');
      if (parts.length !== 4) {
        throw new Error(ERROR_MESSAGES.INVALID_HASH_FORMAT);
      }

      const [storedHash, storedSalt, algorithm, iterationsStr] = parts;
      const iterations = parseInt(iterationsStr, 10);

      if (isNaN(iterations) || iterations <= 0) {
        throw new Error(ERROR_MESSAGES.INVALID_HASH_FORMAT);
      }

      // Recalcular hash con el mismo salt e iteraciones
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      const saltBuffer = this.base64ToArrayBuffer(storedSalt);

      const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: iterations,
          hash: algorithm as 'SHA-256' | 'SHA-512'
        },
        baseKey,
        256
      );

      const calculatedHash = this.arrayBufferToBase64(hashBuffer);

      // Comparación constant-time para prevenir timing attacks
      const isValid = this.constantTimeCompare(calculatedHash, storedHash);

      // Verificar si necesita rehash (algoritmo o iteraciones cambiaron)
      const needsRehash =
        algorithm !== this.config.defaultHashAlgorithm ||
        iterations !== this.config.hashIterations;

      const verificationTime = performance.now() - startTime;

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Verificación de password completada', {
          isValid,
          needsRehash,
          algorithm,
          iterations,
          duration: `${verificationTime.toFixed(2)}ms`
        });
      }

      return {
        isValid,
        verificationTime,
        needsRehash
      };

    } catch (error) {
      logError('EncryptHelper', error, ERROR_MESSAGES.HASH_VERIFICATION_FAILED);

      // Retornar false en lugar de throw para evitar leakage de información
      return {
        isValid: false,
        verificationTime: performance.now() - startTime,
        needsRehash: false
      };
    }
  }

  /**
   * Comparación constant-time de strings para prevenir timing attacks
   *
   * @param a Primera cadena
   * @param b Segunda cadena
   * @returns true si son iguales, false si son diferentes
   *
   * @private
   */
  private constantTimeCompare(a: string, b: string): boolean {
    // Si las longitudes difieren, aún recorremos para mantener tiempo constante
    const length = Math.max(a.length, b.length);
    let result = a.length === b.length ? 0 : 1;

    for (let i = 0; i < length; i++) {
      const charA = i < a.length ? a.charCodeAt(i) : 0;
      const charB = i < b.length ? b.charCodeAt(i) : 0;
      result |= charA ^ charB;
    }

    return result === 0;
  }

  // =====================================================
  // MÉTODOS PÚBLICOS DE ENCRIPTACIÓN/DESENCRIPTACIÓN
  // =====================================================

  /**
   * Encripta datos sensibles usando AES-GCM (Authenticated Encryption)
   *
   * AES-GCM proporciona:
   * - Confidencialidad (los datos están encriptados)
   * - Integridad (detecta modificaciones)
   * - Autenticación (verifica el origen)
   *
   * Si no se proporciona passphrase, usa la de variables de entorno configurada.
   *
   * @param data Datos en texto plano a encriptar (string)
   * @param passphrase Passphrase opcional (usa env si no se proporciona)
   * @returns Promesa que resuelve a EncryptionResult con datos encriptados e IV
   *
   * @throws Error si los datos son inválidos o falla la encriptación
   *
   * @example
   * ```typescript
   * // Encriptar token de sesión
   * const encrypted = await encryptHelper.encryptData(sessionToken);
   * sessionStorage.setItem('secure_token', JSON.stringify(encrypted));
   *
   * // Encriptar con passphrase custom
   * const encrypted2 = await encryptHelper.encryptData(sensitiveData, 'my-custom-key');
   * ```
   */
  public async encryptData(data: string, passphrase?: string): Promise<EncryptionResult> {
    const startTime = performance.now();

    try {
      // Validar entrada
      if (!data || typeof data !== 'string') {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
      }

      // Resolver passphrase (user > env > fallback)
      const resolvedPassphrase = this.resolvePassphrase(passphrase);
      this.validatePassphrase(resolvedPassphrase);

      // 1. Derivar clave desde passphrase
      const key = await this.deriveKey(resolvedPassphrase);

      // 2. Generar IV aleatorio (12 bytes es óptimo para AES-GCM)
      const iv = new Uint8Array(12);
      crypto.getRandomValues(iv);

      // 3. Convertir datos a ArrayBuffer
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // 4. Encriptar con AES-GCM
      // AES-GCM incluye autenticación, no necesita HMAC separado
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.config.encryptionAlgorithm,
          iv: iv
        },
        key,
        dataBuffer
      );

      // 5. Convertir a base64 para almacenamiento
      const encryptedBase64 = this.arrayBufferToBase64(encryptedBuffer);
      const ivBase64 = this.arrayBufferToBase64(iv.buffer);

      const result: EncryptionResult = {
        encrypted: encryptedBase64,
        iv: ivBase64,
        algorithm: this.config.encryptionAlgorithm,
        timestamp: Date.now()
      };

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Datos encriptados exitosamente', {
          algorithm: result.algorithm,
          dataLength: data.length,
          encryptedLength: encryptedBase64.length,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return result;

    } catch (error) {
      logError('EncryptHelper', error, ERROR_MESSAGES.ENCRYPTION_FAILED);
      throw new Error(ERROR_MESSAGES.ENCRYPTION_FAILED);
    }
  }

  /**
   * Desencripta datos previamente encriptados con encryptData()
   *
   * Verifica la integridad y autenticación de los datos usando AES-GCM.
   * Si los datos fueron modificados, la desencriptación fallará.
   *
   * @param encryptedData Resultado de encryptData() a desencriptar
   * @param passphrase Passphrase opcional (debe ser la misma usada en encriptación)
   * @returns Promesa que resuelve a string con datos desencriptados
   *
   * @throws Error si los datos son inválidos, fueron modificados, o la passphrase es incorrecta
   *
   * @example
   * ```typescript
   * // Recuperar y desencriptar
   * const stored = JSON.parse(sessionStorage.getItem('secure_token'));
   * const decrypted = await encryptHelper.decryptData(stored);
   * console.log('Token original:', decrypted);
   *
   * // Con passphrase custom
   * const decrypted2 = await encryptHelper.decryptData(encrypted, 'my-custom-key');
   * ```
   */
  public async decryptData(encryptedData: EncryptionResult, passphrase?: string): Promise<string> {
    const startTime = performance.now();

    try {
      // Validar entrada
      if (!encryptedData || typeof encryptedData !== 'object') {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
      }

      if (!encryptedData.encrypted || !encryptedData.iv) {
        throw new Error('Datos de encriptación incompletos');
      }

      // Resolver passphrase (debe ser la misma usada en encriptación)
      const resolvedPassphrase = this.resolvePassphrase(passphrase);
      this.validatePassphrase(resolvedPassphrase);

      // 1. Derivar clave desde passphrase (obtenida de cache si existe)
      const key = await this.deriveKey(resolvedPassphrase);

      // 2. Convertir datos de base64 a ArrayBuffer
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.encrypted);
      const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);

      // 3. Desencriptar con AES-GCM
      // Si los datos fueron modificados, esto lanzará error automáticamente
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm || this.config.encryptionAlgorithm,
          iv: ivBuffer
        },
        key,
        encryptedBuffer
      );

      // 4. Convertir ArrayBuffer a string
      const decoder = new TextDecoder();
      const decryptedData = decoder.decode(decryptedBuffer);

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Datos desencriptados exitosamente', {
          algorithm: encryptedData.algorithm,
          encryptedLength: encryptedData.encrypted.length,
          decryptedLength: decryptedData.length,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return decryptedData;

    } catch (error) {
      logError('EncryptHelper', error, ERROR_MESSAGES.DECRYPTION_FAILED);
      throw new Error(ERROR_MESSAGES.DECRYPTION_FAILED);
    }
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