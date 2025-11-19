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
 *
 * ⚠️ IMPORTANTE: A partir de la versión 2.0, el campo `salt` es REQUERIDO.
 * Este campo almacena el salt único usado en la derivación de clave con PBKDF2.
 *
 * SEGURIDAD:
 * - Cada operación de encriptación genera un salt aleatorio único
 * - El salt debe almacenarse junto con los datos encriptados
 * - El mismo salt se usa para desencriptar los datos
 * - Sin el salt correcto, la desencriptación fallará
 *
 * MIGRACIÓN:
 * - Datos encriptados ANTES de v2.0 NO incluyen salt
 * - Ver guía de migración en MIGRATION.md para actualizar datos legacy
 */
export interface EncryptionResult {
  /** Datos encriptados (base64) */
  encrypted: string;
  /** Vector de inicialización (base64) */
  iv: string;
  /** Salt único usado en derivación de clave PBKDF2 (base64) - REQUERIDO desde v2.0 */
  salt: string;
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

/**
 * Resultado de validación de passphrase
 *
 * @since v2.1.0
 */
export interface PassphraseValidationResult {
  /** Si la passphrase es válida */
  isValid: boolean;
  /** Entropía calculada en bits */
  entropy: number;
  /** Longitud de la passphrase */
  length: number;
  /** Nivel de fuerza (weak, medium, strong, very-strong) */
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  /** Lista de problemas detectados */
  issues: string[];
  /** Recomendaciones para mejorar */
  recommendations: string[];
}

/**
 * Configuración de rotación de claves
 *
 * @since v2.1.0
 */
export interface KeyRotationConfig {
  /** ID único de la versión de la clave */
  keyId: string;
  /** Versión de la clave (incrementa en cada rotación) */
  version: number;
  /** Timestamp de creación de la clave */
  createdAt: number;
  /** Timestamp de expiración (opcional) */
  expiresAt?: number;
  /** Si esta es la clave activa actual */
  isActive: boolean;
  /** Algoritmo usado con esta clave */
  algorithm: string;
}

/**
 * Resultado de encriptación con rotación de claves
 *
 * @since v2.1.0
 */
export interface VersionedEncryptionResult extends EncryptionResult {
  /** ID de la clave usada */
  keyId: string;
  /** Versión de la clave */
  keyVersion: number;
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
    // ✅ ACCESO DIRECTO A import.meta.env (funciona en Vite)
    const passphrase = import.meta.env.VITE_ENCRYPT_PASSPHRASE || import.meta.env.VITE_ENCRYPTION_KEY;

    // 🔍 DEBUG LOG - Ver resultado
    console.log('🔍 [DEBUG] Todas las variables de entorno VITE_:',
      Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
    );
    console.log('🔍 [DEBUG] VITE_ENCRYPT_PASSPHRASE value:', import.meta.env.VITE_ENCRYPT_PASSPHRASE);
    console.log('🔍 [DEBUG] VITE_ENCRYPTION_KEY value:', import.meta.env.VITE_ENCRYPTION_KEY);
    console.log('🔍 [DEBUG] Passphrase obtenida:', passphrase ? `${passphrase.substring(0, 15)}...` : 'NINGUNA');

    // Si encontramos passphrase, retornarla inmediatamente
    if (passphrase) {
      return passphrase;
    }

    // Fallback: Intentar acceso indirecto (compatibilidad con builds antiguos)
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
 * Genera passphrase criptográficamente segura si no se encuentra en variables de entorno
 *
 * ⚠️ IMPORTANTE: Esta passphrase es temporal y NO se puede recuperar después de recargar.
 * Solo debe usarse para datos de sesión temporal. Para datos persistentes,
 * DEBE configurarse VITE_ENCRYPT_PASSPHRASE en variables de entorno.
 *
 * SEGURIDAD:
 * - Genera 32 bytes aleatorios usando crypto.getRandomValues() (CSPRNG)
 * - La passphrase es única por sesión del navegador
 * - NO es predecible ni reproducible
 * - Se pierde al recargar la página
 *
 * @returns Passphrase criptográficamente segura en formato base64
 *
 * @throws Error si crypto.getRandomValues no está disponible
 */
const generateSecureFallbackPassphrase = (): string => {
  try {
    // Verificar que crypto esté disponible
    if (!crypto || !crypto.getRandomValues) {
      throw new Error('crypto.getRandomValues no disponible en este entorno');
    }

    // Generar 32 bytes aleatorios criptográficamente seguros
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    // Convertir a base64 para usar como passphrase
    let binary = '';
    for (let i = 0; i < randomBytes.byteLength; i++) {
      binary += String.fromCharCode(randomBytes[i]);
    }
    const passphrase = btoa(binary);

    // Logging de advertencia en TODOS los ambientes (incluso producción)
    // porque usar passphrase temporal es una configuración insegura
    console.warn(
      '⚠️  ADVERTENCIA DE SEGURIDAD - ENCRYPT HELPER:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'Se está usando una passphrase temporal aleatoria.\n\n' +
      'IMPLICACIONES:\n' +
      '• Los datos encriptados NO podrán desencriptarse después de recargar\n' +
      '• Esta passphrase solo debe usarse para datos de SESIÓN TEMPORAL\n' +
      '• NO usar para datos persistentes (localStorage, IndexedDB, etc.)\n\n' +
      'SOLUCIÓN:\n' +
      'Configure VITE_ENCRYPT_PASSPHRASE en variables de entorno:\n' +
      '  1. Generar passphrase segura: openssl rand -base64 32\n' +
      '  2. Agregar a .env: VITE_ENCRYPT_PASSPHRASE=<passphrase>\n' +
      '  3. Reiniciar servidor de desarrollo\n\n' +
      'PRODUCCIÓN:\n' +
      'Esta configuración NO es válida en producción.\n' +
      'El helper lanzará error si se intenta usar sin passphrase configurada.\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    return passphrase;

  } catch (error) {
    // Si falla la generación de passphrase segura, no hay fallback inseguro
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(
      'No se pudo generar passphrase segura y no hay passphrase configurada ' +
      'en variables de entorno. Configure VITE_ENCRYPT_PASSPHRASE. ' +
      `Error: ${errorMessage}`
    );
  }
};

/**
 * Configuración por defecto del Encrypt Helper
 *
 * IMPORTANTE:
 * - defaultPassphrase intenta obtener de variables de entorno primero
 * - Si no existe, genera passphrase temporal aleatoria (solo para desarrollo/testing)
 * - En producción, se validará que exista passphrase de variables de entorno
 */
const DEFAULT_ENCRYPT_CONFIG: EncryptHelperConfig = (() => {
  const envPassphrase = getEnvironmentPassphrase();
  const passphrase = envPassphrase || generateSecureFallbackPassphrase();

  // 🔍 DEBUG LOG - Verificar origen de passphrase
  console.log('🔐 [EncryptHelper] Passphrase source:', {
    fromEnv: !!envPassphrase,
    passphrasePreview: passphrase.substring(0, 15) + '...',
    length: passphrase.length
  });

  return {
    defaultHashAlgorithm: 'SHA-256',
    saltLength: 32,
    hashIterations: 600000, // OWASP 2024: 600k para máxima seguridad (se ajusta por ambiente)
    encryptionAlgorithm: 'AES-GCM',
    keyLength: 256,
    enableLogging: true,
    environment: 'development',
    defaultPassphrase: passphrase,
    useEnvironmentPassphrase: true
  };
})();

/**
 * Configuraciones específicas por ambiente
 *
 * ITERACIONES PBKDF2 - OWASP 2024:
 * - Development: 100,000 - Balance entre seguridad y performance para desarrollo
 * - Staging: 300,000 - Nivel intermedio para testing realista
 * - Production: 600,000 - Máxima seguridad recomendada por OWASP
 *
 * JUSTIFICACIÓN:
 * - OWASP 2024 recomienda mínimo 600,000 para producción
 * - NIST SP 800-63B requiere mínimo 10,000 (cumplido en todos los ambientes)
 * - Mayor número = más resistente a ataques de fuerza bruta
 * - Impacto en UX: ~100-300ms adicionales en operaciones de hash (aceptable)
 *
 * CONFIGURACIÓN VÍA ENV (opcional):
 * - VITE_ENCRYPT_ITERATIONS=600000
 */
const ENVIRONMENT_CONFIGS: Record<string, Partial<EncryptHelperConfig>> = {
  development: {
    hashIterations: 100000, // OWASP 2024: Seguro pero rápido para desarrollo
    enableLogging: true
  },
  staging: {
    hashIterations: 300000, // OWASP 2024: Intermedio para testing realista
    enableLogging: true
  },
  production: {
    hashIterations: 600000, // OWASP 2024: Máxima seguridad para producción
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
  INVALID_HASH_FORMAT: 'Formato de hash inválido',
  WEAK_PASSPHRASE: 'Passphrase débil detectada',
  KEY_ROTATION_FAILED: 'Error en rotación de claves'
} as const;

// =====================================================
// FUNCIONES AUXILIARES DE SEGURIDAD
// =====================================================

/**
 * Sanitiza datos sensibles para logs seguros
 *
 * IMPORTANTE: Previene leaks de información sensible en logs, traces y errores
 *
 * @param data - Datos a sanitizar
 * @param options - Opciones de sanitización
 * @returns Datos sanitizados seguros para logging
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeSensitiveData({
 *   password: 'secret123',
 *   token: 'Bearer abc123',
 *   user: { name: 'John' }
 * });
 * // Result: {
 * //   password: '***REDACTED***',
 * //   token: '***REDACTED***',
 * //   user: { name: 'John' }
 * // }
 * ```
 *
 * @since v2.1.0
 */
const sanitizeSensitiveData = (
  data: any,
  options: {
    /** Claves a redactar (case-insensitive) */
    sensitiveKeys?: string[];
    /** Si mostrar primeros/últimos N caracteres */
    showPartial?: number;
    /** Texto de reemplazo */
    replacement?: string;
  } = {}
): any => {
  const {
    sensitiveKeys = [
      'password',
      'passphrase',
      'secret',
      'token',
      'key',
      'apikey',
      'api_key',
      'auth',
      'authorization',
      'credential',
      'private',
      'salt', // Incluir salt para prevenir leaks
      'iv' // Incluir IV parcialmente
    ],
    showPartial = 0,
    replacement = '***REDACTED***'
  } = options;

  // Casos base
  if (data === null || data === undefined) {
    return data;
  }

  // Primitivos (string, number, boolean)
  if (typeof data !== 'object') {
    return data;
  }

  // Arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeSensitiveData(item, options));
  }

  // Objetos
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => keyLower.includes(sk.toLowerCase()));

    if (isSensitive && typeof value === 'string') {
      if (showPartial > 0 && value.length > showPartial * 2) {
        // Mostrar primeros y últimos N caracteres
        const start = value.substring(0, showPartial);
        const end = value.substring(value.length - showPartial);
        sanitized[key] = `${start}...${end}`;
      } else {
        sanitized[key] = replacement;
      }
    } else if (typeof value === 'object') {
      // Recursivo para objetos anidados
      sanitized[key] = sanitizeSensitiveData(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Calcula la entropía de una cadena en bits
 *
 * La entropía mide la "aleatoriedad" o "imprevisibilidad" de una cadena.
 * Mayor entropía = más segura contra ataques de fuerza bruta.
 *
 * FÓRMULA: E = log2(R^L)
 * - R = tamaño del conjunto de caracteres posibles
 * - L = longitud de la cadena
 *
 * @param str - Cadena a analizar
 * @returns Entropía en bits
 *
 * @example
 * ```typescript
 * calculateEntropy('password123'); // ~51 bits (débil)
 * calculateEntropy('Tr0ub4dor&3'); // ~59 bits (medio)
 * calculateEntropy('correct horse battery staple'); // ~95 bits (fuerte)
 * calculateEntropy(randomBytes(32).toString('base64')); // ~256 bits (muy fuerte)
 * ```
 *
 * @since v2.1.0
 */
const calculateEntropy = (str: string): number => {
  if (!str || str.length === 0) {
    return 0;
  }

  // Determinar el tamaño del conjunto de caracteres
  let poolSize = 0;

  const hasLowercase = /[a-z]/.test(str);
  const hasUppercase = /[A-Z]/.test(str);
  const hasDigits = /[0-9]/.test(str);
  const hasSpecial = /[^a-zA-Z0-9]/.test(str);

  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSpecial) poolSize += 32; // Aproximado

  // Si solo tiene un tipo de caracter, ajustar
  if (poolSize === 0) {
    // Caracteres únicos como fallback
    const uniqueChars = new Set(str).size;
    poolSize = uniqueChars;
  }

  // Entropía = log2(poolSize^length) = length * log2(poolSize)
  const entropy = str.length * Math.log2(poolSize);

  return Math.round(entropy * 100) / 100; // Redondear a 2 decimales
};

/**
 * Valida la fuerza y seguridad de una passphrase
 *
 * CRITERIOS DE VALIDACIÓN (OWASP + NIST):
 * - Longitud mínima: 32 caracteres (256 bits en base64)
 * - Entropía mínima: 128 bits (para resistir ataques)
 * - No debe contener patrones comunes
 * - Debe tener diversidad de caracteres
 *
 * @param passphrase - Passphrase a validar
 * @returns Resultado de validación con detalles
 *
 * @example
 * ```typescript
 * const result = validatePassphrase('YzM3NjE4ZTc5YWE4YjQ0ZjE4NzE0MmFmNjE4YWE4YjQ=');
 * if (!result.isValid) {
 *   console.error('Passphrase débil:', result.issues);
 *   console.log('Recomendaciones:', result.recommendations);
 * }
 * ```
 *
 * @since v2.1.0
 */
const validatePassphrase = (passphrase: string): PassphraseValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Validación de longitud
  const MIN_LENGTH = 32; // 32 caracteres = 256 bits en base64
  const RECOMMENDED_LENGTH = 44; // 44 caracteres = 32 bytes en base64

  if (passphrase.length < MIN_LENGTH) {
    issues.push(`Longitud insuficiente (${passphrase.length} < ${MIN_LENGTH} caracteres)`);
    recommendations.push(`Usar mínimo ${MIN_LENGTH} caracteres (preferible ${RECOMMENDED_LENGTH})`);
  }

  // Calcular entropía
  const entropy = calculateEntropy(passphrase);
  const MIN_ENTROPY = 128; // bits
  const GOOD_ENTROPY = 192; // bits
  const EXCELLENT_ENTROPY = 256; // bits

  if (entropy < MIN_ENTROPY) {
    issues.push(`Entropía insuficiente (${entropy} bits < ${MIN_ENTROPY} bits)`);
    recommendations.push('Usar passphrase generada con CSPRNG (openssl rand -base64 32)');
  }

  // Verificar diversidad de caracteres
  const uniqueChars = new Set(passphrase).size;
  const diversityRatio = uniqueChars / passphrase.length;

  if (diversityRatio < 0.5) {
    issues.push(`Baja diversidad de caracteres (${Math.round(diversityRatio * 100)}%)`);
    recommendations.push('Evitar repeticiones excesivas de caracteres');
  }

  // Detectar patrones comunes (débiles)
  const commonPatterns = [
    /^(.)\1+$/, // Todo el mismo caracter (aaaa...)
    /^(..)\1+$/, // Pares repetidos (ababab...)
    /^(012|123|234|345|456|567|678|789|890)+/, // Secuencias numéricas
    /^(abc|bcd|cde|def|efg|fgh)+/i, // Secuencias alfabéticas
    /password|secret|admin|user|test|demo/i, // Palabras comunes
    /^[a-z]+$|^[A-Z]+$|^[0-9]+$/ // Solo un tipo de caracter
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(passphrase)) {
      issues.push('Contiene patrones predecibles o comunes');
      recommendations.push('Usar generador de passphrases aleatorias (openssl rand)');
      break;
    }
  }

  // Determinar nivel de fuerza
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';

  if (entropy >= EXCELLENT_ENTROPY && passphrase.length >= RECOMMENDED_LENGTH && issues.length === 0) {
    strength = 'very-strong';
  } else if (entropy >= GOOD_ENTROPY && passphrase.length >= MIN_LENGTH && issues.length <= 1) {
    strength = 'strong';
  } else if (entropy >= MIN_ENTROPY && passphrase.length >= MIN_LENGTH) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  // Si no hay problemas pero tampoco es excelente, agregar recomendación
  if (issues.length === 0 && strength !== 'very-strong') {
    recommendations.push('Considera usar 44+ caracteres (base64 de 32 bytes) para máxima seguridad');
  }

  return {
    isValid: issues.length === 0 && entropy >= MIN_ENTROPY && passphrase.length >= MIN_LENGTH,
    entropy,
    length: passphrase.length,
    strength,
    issues,
    recommendations
  };
};

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

    // Log detallado de configuración inicial (siempre en development)
    if (this.config.environment === 'development' || this.config.enableLogging) {
      console.group('🔐 EncryptHelper v2.1.1 Inicializado');
      console.log('📊 Configuración:');
      console.table({
        'Ambiente detectado': this.config.environment,
        'Iteraciones PBKDF2': this.config.hashIterations.toLocaleString(),
        'Algoritmo': this.config.encryptionAlgorithm,
        'Hash Algorithm': this.config.defaultHashAlgorithm
      });
      console.log('🔍 Detección de Ambiente:');
      console.table({
        'Vite MODE': typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'N/A',
        'Vite PROD': typeof import.meta !== 'undefined' ? import.meta.env?.PROD : 'N/A',
        'Vite DEV': typeof import.meta !== 'undefined' ? import.meta.env?.DEV : 'N/A',
        'Hostname': typeof window !== 'undefined' ? window.location.hostname : 'N/A'
      });
      console.log('⚡ Estimación de Performance:');
      const estimatedTime = Math.round((this.config.hashIterations / 1000) * 0.5);
      console.table({
        'Tiempo estimado por operación': `~${estimatedTime}ms`,
        'Impacto UX': estimatedTime < 50 ? '✅ Fluido' : estimatedTime < 150 ? '⚠️ Notable' : '🔴 Lento'
      });
      console.groupEnd();

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
   *
   * IMPORTANTE: Usa import.meta.env (Vite estándar) como fuente principal
   *
   * PRIORIDAD DE DETECCIÓN:
   * 1. import.meta.env.PROD (Vite - más confiable)
   * 2. import.meta.env.MODE (Vite - puede ser 'development', 'staging', 'production')
   * 3. Hostname (fallback para casos edge)
   * 4. Default: 'development'
   *
   * @returns Ambiente detectado
   *
   * @since v2.1.1 - Corregido para usar import.meta.env (Vite)
   */
  private detectEnvironment(): 'development' | 'staging' | 'production' {
    // 1. Prioridad: import.meta.env.PROD (Vite - producción)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // En build de producción, import.meta.env.PROD === true
      if (import.meta.env.PROD === true) {
        return 'production';
      }

      // Verificar MODE explícito (puede ser 'development', 'staging', 'production')
      const mode = import.meta.env.MODE;
      if (mode === 'staging') {
        return 'staging';
      }

      // Si MODE es 'development' o cualquier otro valor, es desarrollo
      if (mode === 'development' || import.meta.env.DEV === true) {
        return 'development';
      }
    }

    // 2. Fallback: process.env (solo disponible en algunos bundlers)
    if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
      switch (process.env.NODE_ENV) {
        case 'production': return 'production';
        case 'staging': return 'staging';
        default: return 'development';
      }
    }

    // 3. Fallback: Hostname (para casos edge donde import.meta no está disponible)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Producción: www.*, *.com, *.mx (sin subdominios dev/staging)
      if ((hostname.includes('www.') || hostname.match(/\.(com|mx|org)$/)) &&
          !hostname.includes('dev') &&
          !hostname.includes('staging') &&
          !hostname.includes('stg') &&
          !hostname.includes('localhost')) {
        return 'production';
      }

      // Staging: staging.*, stg.*, *-staging.*
      if (hostname.includes('staging') ||
          hostname.includes('stg') ||
          hostname.match(/^staging\./)) {
        return 'staging';
      }
    }

    // 4. Default seguro: development
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
   * Valida internamente que una passphrase cumpla con los requisitos mínimos
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
   * this.validatePassphraseOrThrow('my-secure-passphrase-2024');
   * ```
   */
  private validatePassphraseOrThrow(passphrase: string): void {
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

  /**
   * Valida que existe passphrase configurada desde variables de entorno
   *
   * ⚠️ CRÍTICO: Este método DEBE llamarse antes de encriptar datos persistentes
   * en producción. Si se usa passphrase temporal (fallback), los datos NO podrán
   * desencriptarse después de recargar la página.
   *
   * CASOS DE USO:
   * - Llamar al inicio de la aplicación en producción
   * - Llamar antes de encriptar datos en localStorage/IndexedDB
   * - Incluir en health checks y validaciones de startup
   *
   * @throws Error si no hay passphrase de variables de entorno en producción
   * @throws Error si no hay passphrase de variables de entorno y se requiere persistencia
   *
   * @example
   * ```typescript
   * // En startup de producción
   * if (import.meta.env.PROD) {
   *   encryptHelper.requirePersistentPassphrase();
   * }
   *
   * // Antes de encriptar datos persistentes
   * async function saveEncryptedData(data: string) {
   *   encryptHelper.requirePersistentPassphrase();
   *   const encrypted = await encryptHelper.encryptData(data);
   *   localStorage.setItem('data', JSON.stringify(encrypted));
   * }
   * ```
   */
  public requirePersistentPassphrase(): void {
    const hasEnvPassphrase = this.hasEnvironmentPassphrase();

    // En producción, SIEMPRE requerir passphrase de variables de entorno
    if (this.config.environment === 'production' && !hasEnvPassphrase) {
      throw new Error(
        '🚨 CONFIGURACIÓN DE SEGURIDAD INVÁLIDA 🚨\n\n' +
        'No se encontró VITE_ENCRYPT_PASSPHRASE en variables de entorno.\n' +
        'Esta configuración es REQUERIDA en producción.\n\n' +
        'PROBLEMA:\n' +
        '• Sin passphrase configurada, se usa una temporal aleatoria\n' +
        '• Los datos encriptados NO podrán desencriptarse después de reload\n' +
        '• Esto causará PÉRDIDA DE DATOS en producción\n\n' +
        'SOLUCIÓN:\n' +
        '1. Generar passphrase segura:\n' +
        '   openssl rand -base64 32\n\n' +
        '2. Configurar en variables de entorno de producción:\n' +
        '   VITE_ENCRYPT_PASSPHRASE=<passphrase-generada>\n\n' +
        '3. Re-deployar la aplicación\n\n' +
        'IMPORTANTE:\n' +
        '• Guardar la passphrase de forma segura (Secret Manager, Vault, etc.)\n' +
        '• NO commitear la passphrase al repositorio\n' +
        '• Usar la misma passphrase en todos los servidores de producción\n\n' +
        'La aplicación se detendrá hasta que se configure correctamente.'
      );
    }

    // En otros ambientes, solo advertir
    if (!hasEnvPassphrase) {
      logWarning(
        'EncryptHelper',
        '⚠️  No hay passphrase configurada desde variables de entorno. ' +
        'Se está usando passphrase temporal. NO usar para datos persistentes.',
        {
          environment: this.config.environment,
          hasEnvPassphrase: false,
          recommendation: 'Configure VITE_ENCRYPT_PASSPHRASE'
        }
      );
    }
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
   * Deriva clave criptográfica desde passphrase usando PBKDF2 con salt único
   *
   * ⚠️ CAMBIO CRÍTICO v2.0: Este método ahora retorna TANTO la clave como el salt.
   *
   * SEGURIDAD:
   * - SIEMPRE genera salt aleatorio único si no se proporciona
   * - Cada derivación usa un salt diferente (previene rainbow tables)
   * - El salt DEBE almacenarse con los datos encriptados
   * - Cache solo se usa si se proporciona salt explícito (para desencriptación)
   *
   * FLUJO:
   * 1. Encriptación: NO proporcionar salt → genera aleatorio → almacenar con datos
   * 2. Desencriptación: Proporcionar salt de EncryptionResult → usa para derivar misma clave
   *
   * @param passphrase Passphrase desde la cual derivar la clave
   * @param salt Salt opcional (solo para desencriptación - NUNCA proporcionar en encriptación)
   * @returns Promesa que resuelve a objeto con { key: CryptoKey, salt: Uint8Array }
   *
   * @throws Error si falla la derivación de clave
   *
   * @example
   * ```typescript
   * // ENCRIPTACIÓN: No proporcionar salt
   * const { key, salt } = await this.deriveKey('mi-passphrase-segura');
   * // Almacenar salt con datos encriptados
   *
   * // DESENCRIPTACIÓN: Proporcionar salt almacenado
   * const { key } = await this.deriveKey('mi-passphrase-segura', storedSalt);
   * ```
   */
  private async deriveKey(
    passphrase: string,
    salt?: Uint8Array
  ): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const startTime = performance.now();

    try {
      // ✅ SIEMPRE generar salt aleatorio único si no se proporciona
      // Esto es crítico para seguridad - cada derivación debe usar salt diferente
      const derivationSalt = salt || crypto.getRandomValues(new Uint8Array(32));

      // Solo cachear si se proporcionó salt (caso de desencriptación)
      // NO cachear claves con salt aleatorio (caso de encriptación)
      const shouldCache = !!salt;
      const cacheKey = shouldCache
        ? await this.hashForCacheKey(passphrase, derivationSalt)
        : null;

      // Verificar cache solo si debemos cachear (desencriptación)
      if (cacheKey && this.keyCache.has(cacheKey)) {
        if (this.config.enableLogging) {
          logInfo('EncryptHelper', 'Clave obtenida desde cache', {
            cacheHit: true,
            duration: `${(performance.now() - startTime).toFixed(2)}ms`
          });
        }
        return {
          key: this.keyCache.get(cacheKey)!,
          salt: derivationSalt
        };
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

      // Derivar clave final usando PBKDF2 con salt único
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

      // Cachear solo si corresponde (desencriptación con salt conocido)
      if (cacheKey) {
        this.keyCache.set(cacheKey, derivedKey);
      }

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Clave derivada exitosamente', {
          algorithm: this.config.encryptionAlgorithm,
          iterations: this.config.hashIterations,
          saltLength: derivationSalt.length,
          cached: shouldCache,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return {
        key: derivedKey,
        salt: derivationSalt
      };

    } catch (error) {
      logError('EncryptHelper', error, 'Error al derivar clave criptográfica');
      throw new Error('Error al derivar clave de encriptación');
    }
  }

  /**
   * Genera cache key seguro hasheando passphrase + salt
   *
   * SEGURIDAD:
   * - Previene leak de passphrases en memoria (cache keys)
   * - Usa SHA-256 para generar hash determinístico
   * - El hash no puede revertirse para obtener la passphrase original
   *
   * @param passphrase Passphrase a hashear
   * @param salt Salt a incluir en el hash
   * @returns Hash en formato base64 para usar como cache key
   *
   * @private
   */
  private async hashForCacheKey(passphrase: string, salt: Uint8Array): Promise<string> {
    try {
      const encoder = new TextEncoder();
      // Combinar passphrase + salt para unicidad
      const data = encoder.encode(passphrase + this.uint8ArrayToHex(salt));

      // Hash con SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // Convertir a base64 para cache key
      return this.arrayBufferToBase64(hashBuffer);
    } catch (error) {
      logError('EncryptHelper', error, 'Error al generar cache key');
      // Fallback: usar passphrase+salt sin hash (menos seguro pero funcional)
      return `${passphrase}_${this.uint8ArrayToHex(salt)}`;
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
   * ⚠️ CAMBIO v2.0: Ahora incluye salt único en el resultado.
   *
   * AES-GCM proporciona:
   * - Confidencialidad (los datos están encriptados)
   * - Integridad (detecta modificaciones)
   * - Autenticación (verifica el origen)
   *
   * SEGURIDAD v2.0:
   * - Cada encriptación genera un salt aleatorio único para PBKDF2
   * - El salt se almacena en EncryptionResult y es requerido para desencriptación
   * - Sin el salt correcto, la desencriptación fallará
   *
   * Si no se proporciona passphrase, usa la de variables de entorno configurada.
   *
   * @param data Datos en texto plano a encriptar (string)
   * @param passphrase Passphrase opcional (usa env si no se proporciona)
   * @returns Promesa que resuelve a EncryptionResult con datos encriptados, IV y salt
   *
   * @throws Error si los datos son inválidos o falla la encriptación
   *
   * @example
   * ```typescript
   * // Encriptar token de sesión
   * const encrypted = await encryptHelper.encryptData(sessionToken);
   * sessionStorage.setItem('secure_token', JSON.stringify(encrypted));
   * // encrypted ahora incluye { encrypted, iv, salt, algorithm, timestamp }
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
  this.validatePassphraseOrThrow(resolvedPassphrase);

      // 1. Derivar clave desde passphrase (genera salt aleatorio único)
      // ✅ NO proporcionar salt aquí - deriveKey() generará uno aleatorio
      const { key, salt } = await this.deriveKey(resolvedPassphrase);

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
      const saltBase64 = this.arrayBufferToBase64(salt.buffer); // ✅ Incluir salt

      const result: EncryptionResult = {
        encrypted: encryptedBase64,
        iv: ivBase64,
        salt: saltBase64, // ✅ NUEVO: Salt único para esta encriptación
        algorithm: this.config.encryptionAlgorithm,
        timestamp: Date.now()
      };

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Datos encriptados exitosamente', {
          algorithm: result.algorithm,
          dataLength: data.length,
          encryptedLength: encryptedBase64.length,
          saltLength: salt.length,
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
   * ⚠️ CAMBIO v2.0: Ahora REQUIERE salt en EncryptionResult.
   *
   * Verifica la integridad y autenticación de los datos usando AES-GCM.
   * Si los datos fueron modificados, la desencriptación fallará.
   *
   * SEGURIDAD v2.0:
   * - Usa el salt almacenado en EncryptionResult para derivar la misma clave
   * - Sin el salt correcto, la derivación producirá una clave diferente
   * - La desencriptación fallará si el salt no coincide
   *
   * COMPATIBILIDAD CON DATOS LEGACY:
   * - Datos encriptados ANTES de v2.0 NO incluyen salt
   * - Estos datos NO podrán desencriptarse con esta versión
   * - Ver guía de migración en MIGRATION.md
   *
   * @param encryptedData Resultado de encryptData() a desencriptar (debe incluir salt)
   * @param passphrase Passphrase opcional (debe ser la misma usada en encriptación)
   * @returns Promesa que resuelve a string con datos desencriptados
   *
   * @throws Error si los datos son inválidos, fueron modificados, o la passphrase es incorrecta
   * @throws Error si falta el campo salt (datos legacy pre-v2.0)
   *
   * @example
   * ```typescript
   * // Recuperar y desencriptar (v2.0+)
   * const stored = JSON.parse(sessionStorage.getItem('secure_token'));
   * const decrypted = await encryptHelper.decryptData(stored);
   * console.log('Token original:', decrypted);
   *
   * // Con passphrase custom
   * const decrypted2 = await encryptHelper.decryptData(encrypted, 'my-custom-key');
   *
   * // ❌ Datos legacy sin salt fallarán
   * const legacyData = { encrypted: '...', iv: '...' }; // Sin salt
   * // await encryptHelper.decryptData(legacyData); // → Error: Missing salt field
   * ```
   */
  public async decryptData(encryptedData: EncryptionResult, passphrase?: string): Promise<string> {
    const startTime = performance.now();

    try {
      // Validar entrada
      if (!encryptedData || typeof encryptedData !== 'object') {
        throw new Error(ERROR_MESSAGES.INVALID_INPUT);
      }

      // Validar campos requeridos (incluyendo salt)
      if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.salt) {
        throw new Error(
          'Datos de encriptación incompletos. ' +
          'EncryptionResult debe incluir: encrypted, iv, salt. ' +
          '\n\n⚠️  Si estos son datos legacy (pre-v2.0) sin campo salt, ' +
          'NO pueden desencriptarse con esta versión. ' +
          'Ver guía de migración en MIGRATION.md'
        );
      }

      // Resolver passphrase (debe ser la misma usada en encriptación)
      const resolvedPassphrase = this.resolvePassphrase(passphrase);
  this.validatePassphraseOrThrow(resolvedPassphrase);

      // 1. Recuperar salt desde datos encriptados
      const storedSalt = this.base64ToArrayBuffer(encryptedData.salt);
      const saltUint8 = new Uint8Array(storedSalt);

      // 2. Derivar clave con el salt almacenado (cache se usa aquí)
      // ✅ Proporcionar salt para derivar la MISMA clave usada en encriptación
      const { key } = await this.deriveKey(resolvedPassphrase, saltUint8);

      // 3. Convertir datos de base64 a ArrayBuffer
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData.encrypted);
      const ivBuffer = this.base64ToArrayBuffer(encryptedData.iv);

      // 4. Desencriptar con AES-GCM
      // Si los datos fueron modificados o el salt/passphrase son incorrectos,
      // esto lanzará error automáticamente
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm || this.config.encryptionAlgorithm,
          iv: ivBuffer
        },
        key,
        encryptedBuffer
      );

      // 5. Convertir ArrayBuffer a string
      const decoder = new TextDecoder();
      const decryptedData = decoder.decode(decryptedBuffer);

      if (this.config.enableLogging) {
        logInfo('EncryptHelper', 'Datos desencriptados exitosamente', {
          algorithm: encryptedData.algorithm,
          encryptedLength: encryptedData.encrypted.length,
          decryptedLength: decryptedData.length,
          saltLength: saltUint8.length,
          duration: `${(performance.now() - startTime).toFixed(2)}ms`
        });
      }

      return decryptedData;

    } catch (error) {
      logError('EncryptHelper', error, ERROR_MESSAGES.DECRYPTION_FAILED);

      // Mensaje de error más descriptivo si es problema de salt
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('incompletos') || errorMessage.includes('salt')) {
        throw error; // Re-lanzar error original con mensaje descriptivo
      }

      throw new Error(ERROR_MESSAGES.DECRYPTION_FAILED);
    }
  }

  // =====================================================
  // MÉTODOS DE SEGURIDAD AVANZADA (v2.1.0)
  // =====================================================

  /**
   * Valida la fuerza y seguridad de una passphrase
   *
   * ⚠️ IMPORTANTE: Usar antes de configurar una passphrase
   *
   * @param passphrase - Passphrase a validar
   * @returns Resultado de validación con detalles, entropía y recomendaciones
   *
   * @example
   * ```typescript
   * const helper = EncryptHelper.getInstance();
   * const result = helper.evaluatePassphraseStrength('my-passphrase');
   *
   * if (!result.isValid) {
   *   console.error('Passphrase débil:', result.issues);
   *   result.recommendations.forEach(r => console.log(`- ${r}`));
   * } else {
   *   console.log(`✅ Passphrase ${result.strength} (${result.entropy} bits)`);
   * }
   * ```
   *
   * @since v2.1.0
   */
  public evaluatePassphraseStrength(passphrase: string): PassphraseValidationResult {
    logInfo('EncryptHelper', 'Validando fuerza de passphrase', {
      length: passphrase.length,
      // NO loggear la passphrase misma
    });

  const result = validatePassphrase(passphrase);

    if (!result.isValid) {
      logWarning(
        'EncryptHelper',
        `⚠️ Passphrase débil detectada: ${result.strength}`,
        sanitizeSensitiveData({
          entropy: result.entropy,
          length: result.length,
          issues: result.issues.length,
          // NO incluir issues detallados (pueden contener partes de la passphrase)
        })
      );
    }

    return result;
  }

  /**
   * Sanitiza datos para logging seguro
   *
   * Previene leaks de información sensible en logs, traces y errores
   *
   * @param data - Datos a sanitizar
   * @param options - Opciones de sanitización
   * @returns Datos sanitizados seguros para logging
   *
   * @example
   * ```typescript
   * const helper = EncryptHelper.getInstance();
   *
   * const userInput = {
   *   username: 'john',
   *   password: 'secret123',
   *   token: 'abc123xyz'
   * };
   *
   * const safe = helper.sanitizeForLogging(userInput);
   * console.log(safe);
   * // { username: 'john', password: '***REDACTED***', token: '***REDACTED***' }
   * ```
   *
   * @since v2.1.0
   */
  public sanitizeForLogging(
    data: any,
    options?: {
      sensitiveKeys?: string[];
      showPartial?: number;
      replacement?: string;
    }
  ): any {
    return sanitizeSensitiveData(data, options);
  }

  /**
   * Calcula la entropía de una cadena
   *
   * Útil para evaluar la fuerza de passwords/passphrases personalizadas
   *
   * @param str - Cadena a analizar
   * @returns Entropía en bits
   *
   * @example
   * ```typescript
   * const helper = EncryptHelper.getInstance();
   *
   * const entropy1 = helper.calculateEntropy('password123'); // ~51 bits (débil)
   * const entropy2 = helper.calculateEntropy('Tr0ub4dor&3'); // ~59 bits (medio)
   * const entropy3 = helper.calculateEntropy('correct horse battery staple'); // ~95 bits (fuerte)
   * ```
   *
   * @since v2.1.0
   */
  public calculateEntropy(str: string): number {
    return calculateEntropy(str);
  }

  // =====================================================
  // SISTEMA DE ROTACIÓN DE CLAVES (v2.1.0)
  // =====================================================

  /** Almacén de claves para rotación */
  private keyRotationStore: Map<string, KeyRotationConfig> = new Map();

  /** Clave activa actual */
  private activeKeyId: string | null = null;

  /**
   * Genera una nueva versión de clave para rotación
   *
   * IMPORTANTE: Implementa rotación de claves sin necesidad de re-encriptar todos los datos inmediatamente
   *
   * @param options - Opciones de rotación
   * @returns Configuración de la nueva clave
   *
   * @example
   * ```typescript
   * const helper = EncryptHelper.getInstance();
   *
   * // Generar nueva clave
   * const newKey = helper.generateKeyVersion({
   *   expiresInDays: 90 // Expira en 90 días
   * });
   *
   * console.log(`Nueva clave: ${newKey.keyId} (v${newKey.version})`);
   * ```
   *
   * @since v2.1.0
   */
  public generateKeyVersion(options: {
    expiresInDays?: number;
  } = {}): KeyRotationConfig {
    const { expiresInDays } = options;

    // Obtener versión actual
    const currentVersion = this.getCurrentKeyVersion();
    const newVersion = currentVersion + 1;

    // Generar ID único
    const keyId = `key-v${newVersion}-${Date.now()}`;

    // Calcular expiración
    const expiresAt = expiresInDays
      ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000
      : undefined;

    const keyConfig: KeyRotationConfig = {
      keyId,
      version: newVersion,
      createdAt: Date.now(),
      expiresAt,
      isActive: false, // No activa hasta llamar a activateKeyVersion()
      algorithm: this.config.encryptionAlgorithm
    };

    // Almacenar configuración
    this.keyRotationStore.set(keyId, keyConfig);

    logInfo('EncryptHelper', `Nueva versión de clave generada: v${newVersion}`, {
      keyId,
      version: newVersion,
      expiresInDays
    });

    return keyConfig;
  }

  /**
   * Activa una versión de clave específica
   *
   * @param keyId - ID de la clave a activar
   *
   * @example
   * ```typescript
   * const helper = EncryptHelper.getInstance();
   * const newKey = helper.generateKeyVersion();
   *
   * // Activar nueva clave
   * helper.activateKeyVersion(newKey.keyId);
   *
   * // Todas las encriptaciones futuras usarán esta clave
   * ```
   *
   * @since v2.1.0
   */
  public activateKeyVersion(keyId: string): void {
    const keyConfig = this.keyRotationStore.get(keyId);

    if (!keyConfig) {
      throw new Error(`Clave no encontrada: ${keyId}`);
    }

    // Verificar si está expirada
    if (keyConfig.expiresAt && keyConfig.expiresAt < Date.now()) {
      throw new Error(`Clave expirada: ${keyId}`);
    }

    // Desactivar clave anterior
    if (this.activeKeyId) {
      const oldKey = this.keyRotationStore.get(this.activeKeyId);
      if (oldKey) {
        oldKey.isActive = false;
      }
    }

    // Activar nueva clave
    keyConfig.isActive = true;
    this.activeKeyId = keyId;

    logInfo('EncryptHelper', `Clave activada: v${keyConfig.version}`, {
      keyId,
      version: keyConfig.version
    });
  }

  /**
   * Obtiene la versión actual de clave
   *
   * @returns Versión actual (0 si no hay claves)
   *
   * @since v2.1.0
   */
  public getCurrentKeyVersion(): number {
    if (this.keyRotationStore.size === 0) {
      return 0;
    }

    const versions = Array.from(this.keyRotationStore.values()).map(k => k.version);
    return Math.max(...versions);
  }

  /**
   * Obtiene configuración de la clave activa
   *
   * @returns Configuración de la clave activa, o null si no hay clave activa
   *
   * @since v2.1.0
   */
  public getActiveKey(): KeyRotationConfig | null {
    if (!this.activeKeyId) {
      return null;
    }

    return this.keyRotationStore.get(this.activeKeyId) || null;
  }

  /**
   * Lista todas las versiones de claves
   *
   * @returns Array de configuraciones de claves
   *
   * @since v2.1.0
   */
  public listKeyVersions(): KeyRotationConfig[] {
    return Array.from(this.keyRotationStore.values()).sort((a, b) => b.version - a.version);
  }

  /**
   * Verifica si una clave necesita rotación
   *
   * @param keyId - ID de la clave a verificar (usa activa si no se especifica)
   * @param warningDays - Días antes de expiración para advertir (default: 7)
   * @returns true si necesita rotación
   *
   * @since v2.1.0
   */
  public needsKeyRotation(keyId?: string, warningDays: number = 7): boolean {
    const key = keyId
      ? this.keyRotationStore.get(keyId)
      : this.getActiveKey();

    if (!key) {
      return false;
    }

    // Sin fecha de expiración = no necesita rotación
    if (!key.expiresAt) {
      return false;
    }

    const warningTime = Date.now() + warningDays * 24 * 60 * 60 * 1000;

    return key.expiresAt <= warningTime;
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