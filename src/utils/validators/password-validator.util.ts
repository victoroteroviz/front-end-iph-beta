/**
 * Password Validator Utility - Validaciones centralizadas para passwords y passphrases
 *
 * Este utility consolida la lógica de validación de passwords/passphrases
 * que previamente estaba duplicada entre SecurityHelper y EncryptHelper.
 *
 * Características:
 * - Validaciones configurables y extensibles
 * - Soporte para múltiples reglas de validación
 * - Mensajes de error personalizables
 * - Type-safe con TypeScript
 * - Zero dependencies
 *
 * Principios aplicados:
 * - DRY: Elimina duplicación de código
 * - SOLID (SRP): Una sola responsabilidad - validar passwords
 * - KISS: Simple y directo
 *
 * @module PasswordValidator
 * @version 1.0.0
 * @author Sistema IPH Frontend
 */

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

/**
 * Resultado de validación de password
 */
export interface ValidationResult {
  /** Si la validación fue exitosa */
  isValid: boolean;
  /** Lista de errores de validación */
  errors: string[];
}

/**
 * Reglas de validación configurables
 */
export interface PasswordValidationRules {
  /** Longitud mínima requerida */
  minLength?: number;
  /** Longitud máxima permitida (undefined = sin límite) */
  maxLength?: number;
  /** Requiere al menos una letra mayúscula */
  requireUppercase?: boolean;
  /** Requiere al menos una letra minúscula */
  requireLowercase?: boolean;
  /** Requiere al menos un número */
  requireNumbers?: boolean;
  /** Requiere al menos un carácter especial */
  requireSpecialChars?: boolean;
  /** Pattern regex personalizado */
  customPattern?: {
    pattern: RegExp;
    message: string;
  };
  /** Validaciones custom adicionales */
  customValidators?: Array<{
    validator: (password: string) => boolean;
    message: string;
  }>;
}

/**
 * Opciones de configuración del validador
 */
export interface ValidatorOptions {
  /** Reglas de validación a aplicar */
  rules: PasswordValidationRules;
  /** Mensajes de error personalizados (opcional) */
  customMessages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    requireUppercase?: string;
    requireLowercase?: string;
    requireNumbers?: string;
    requireSpecialChars?: string;
  };
}

// =====================================================
// MENSAJES DE ERROR POR DEFECTO
// =====================================================

const DEFAULT_MESSAGES = {
  required: 'El campo es requerido',
  minLength: (length: number) => `Debe tener al menos ${length} caracteres`,
  maxLength: (length: number) => `No puede tener más de ${length} caracteres`,
  requireUppercase: 'Debe contener al menos una letra mayúscula',
  requireLowercase: 'Debe contener al menos una letra minúscula',
  requireNumbers: 'Debe contener al menos un número',
  requireSpecialChars: 'Debe contener al menos un carácter especial'
} as const;

// =====================================================
// EXPRESIONES REGULARES
// =====================================================

const REGEX_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  numbers: /\d/,
  specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
} as const;

// =====================================================
// FUNCIONES DE VALIDACIÓN
// =====================================================

/**
 * Valida un password según reglas configurables
 *
 * Función principal que ejecuta todas las validaciones configuradas
 * y retorna un resultado estructurado con errores detallados.
 *
 * @param password Password o passphrase a validar
 * @param options Opciones de configuración con reglas
 * @returns Resultado de validación con lista de errores
 *
 * @example
 * ```typescript
 * // Validación básica
 * const result = validatePassword('MyPass123!', {
 *   rules: {
 *     minLength: 8,
 *     maxLength: 128,
 *     requireUppercase: true,
 *     requireNumbers: true
 *   }
 * });
 *
 * if (result.isValid) {
 *   console.log('Password válido');
 * } else {
 *   console.log('Errores:', result.errors);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validación con mensajes personalizados
 * const result = validatePassword('weak', {
 *   rules: {
 *     minLength: 8,
 *     requireUppercase: true
 *   },
 *   customMessages: {
 *     minLength: 'La contraseña debe tener al menos 8 caracteres para mayor seguridad',
 *     requireUppercase: 'Por favor incluye al menos una letra mayúscula'
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Validación con reglas custom
 * const result = validatePassword('MyPassword123', {
 *   rules: {
 *     minLength: 8,
 *     customValidators: [
 *       {
 *         validator: (pwd) => !pwd.toLowerCase().includes('password'),
 *         message: 'No debe contener la palabra "password"'
 *       }
 *     ]
 *   }
 * });
 * ```
 */
export const validatePassword = (
  password: string,
  options: ValidatorOptions
): ValidationResult => {
  const errors: string[] = [];
  const { rules, customMessages = {} } = options;

  // Validación 1: Verificar que no sea nulo/undefined/vacío
  if (!password || typeof password !== 'string') {
    errors.push(customMessages.required || DEFAULT_MESSAGES.required);
    return { isValid: false, errors };
  }

  // Validación 2: Longitud mínima
  if (rules.minLength !== undefined && password.length < rules.minLength) {
    const message = customMessages.minLength || DEFAULT_MESSAGES.minLength(rules.minLength);
    errors.push(message);
  }

  // Validación 3: Longitud máxima (opcional)
  if (rules.maxLength !== undefined && password.length > rules.maxLength) {
    const message = customMessages.maxLength || DEFAULT_MESSAGES.maxLength(rules.maxLength);
    errors.push(message);
  }

  // Validación 4: Mayúsculas requeridas
  if (rules.requireUppercase && !REGEX_PATTERNS.uppercase.test(password)) {
    const message = customMessages.requireUppercase || DEFAULT_MESSAGES.requireUppercase;
    errors.push(message);
  }

  // Validación 5: Minúsculas requeridas
  if (rules.requireLowercase && !REGEX_PATTERNS.lowercase.test(password)) {
    const message = customMessages.requireLowercase || DEFAULT_MESSAGES.requireLowercase;
    errors.push(message);
  }

  // Validación 6: Números requeridos
  if (rules.requireNumbers && !REGEX_PATTERNS.numbers.test(password)) {
    const message = customMessages.requireNumbers || DEFAULT_MESSAGES.requireNumbers;
    errors.push(message);
  }

  // Validación 7: Caracteres especiales requeridos
  if (rules.requireSpecialChars && !REGEX_PATTERNS.specialChars.test(password)) {
    const message = customMessages.requireSpecialChars || DEFAULT_MESSAGES.requireSpecialChars;
    errors.push(message);
  }

  // Validación 8: Pattern custom
  if (rules.customPattern) {
    if (!rules.customPattern.pattern.test(password)) {
      errors.push(rules.customPattern.message);
    }
  }

  // Validación 9: Validadores custom
  if (rules.customValidators) {
    for (const customValidator of rules.customValidators) {
      if (!customValidator.validator(password)) {
        errors.push(customValidator.message);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un password y lanza error si no es válido
 *
 * Versión alternativa de validatePassword que lanza excepciones
 * en lugar de retornar un objeto. Útil para flujos donde se
 * prefiere manejo de errores con try/catch.
 *
 * @param password Password a validar
 * @param options Opciones de configuración con reglas
 * @throws Error con mensaje concatenado de todos los errores
 *
 * @example
 * ```typescript
 * try {
 *   validatePasswordOrThrow('weak', {
 *     rules: { minLength: 8, requireUppercase: true }
 *   });
 *   console.log('Password válido');
 * } catch (error) {
 *   console.error('Password inválido:', error.message);
 *   // → "Debe tener al menos 8 caracteres, Debe contener al menos una letra mayúscula"
 * }
 * ```
 */
export const validatePasswordOrThrow = (
  password: string,
  options: ValidatorOptions
): void => {
  const result = validatePassword(password, options);

  if (!result.isValid) {
    throw new Error(result.errors.join(', '));
  }
};

// =====================================================
// VALIDADORES PRESET (Configuraciones Comunes)
// =====================================================

/**
 * Preset de validación básica (mínima seguridad)
 * - Mínimo 8 caracteres
 * - Máximo 128 caracteres
 */
export const BASIC_VALIDATION: PasswordValidationRules = {
  minLength: 8,
  maxLength: 128
};

/**
 * Preset de validación moderada (seguridad media)
 * - Mínimo 8 caracteres
 * - Máximo 128 caracteres
 * - Al menos una mayúscula
 * - Al menos un número
 */
export const MODERATE_VALIDATION: PasswordValidationRules = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireNumbers: true
};

/**
 * Preset de validación fuerte (alta seguridad)
 * - Mínimo 12 caracteres
 * - Máximo 128 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export const STRONG_VALIDATION: PasswordValidationRules = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

/**
 * Preset para validación de passphrases (encriptación)
 * - Mínimo 8 caracteres
 * - Sin máximo (permite encriptación de datos grandes)
 */
export const PASSPHRASE_VALIDATION: PasswordValidationRules = {
  minLength: 8
  // Sin maxLength para permitir passphrases largas
};

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Calcula la fortaleza de un password (0-100)
 *
 * Proporciona un score numérico basado en:
 * - Longitud
 * - Variedad de caracteres (mayúsculas, minúsculas, números, especiales)
 * - Patrones comunes
 *
 * @param password Password a evaluar
 * @returns Score de 0 a 100 (0 = muy débil, 100 = muy fuerte)
 *
 * @example
 * ```typescript
 * calculatePasswordStrength('password');      // → ~20 (muy débil)
 * calculatePasswordStrength('Password123');   // → ~50 (medio)
 * calculatePasswordStrength('MyP@ssw0rd!23'); // → ~80 (fuerte)
 * ```
 */
export const calculatePasswordStrength = (password: string): number => {
  if (!password || typeof password !== 'string') {
    return 0;
  }

  let score = 0;

  // Factor 1: Longitud (máximo 30 puntos)
  const lengthScore = Math.min(password.length * 2, 30);
  score += lengthScore;

  // Factor 2: Mayúsculas (10 puntos)
  if (REGEX_PATTERNS.uppercase.test(password)) {
    score += 10;
  }

  // Factor 3: Minúsculas (10 puntos)
  if (REGEX_PATTERNS.lowercase.test(password)) {
    score += 10;
  }

  // Factor 4: Números (15 puntos)
  if (REGEX_PATTERNS.numbers.test(password)) {
    score += 15;
  }

  // Factor 5: Caracteres especiales (20 puntos)
  if (REGEX_PATTERNS.specialChars.test(password)) {
    score += 20;
  }

  // Factor 6: Variedad de caracteres (15 puntos)
  const uniqueChars = new Set(password.split('')).size;
  const varietyScore = Math.min((uniqueChars / password.length) * 15, 15);
  score += varietyScore;

  // Penalizaciones por patrones comunes
  const commonPatterns = [
    /password/i,
    /123456/,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/ // Caracteres repetidos (aaa, 111, etc.)
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 10; // Penalización por cada patrón común
    }
  }

  // Normalizar a rango 0-100
  return Math.max(0, Math.min(score, 100));
};

/**
 * Obtiene categoría de fortaleza basada en el score
 *
 * @param score Score de fortaleza (0-100)
 * @returns Categoría descriptiva
 *
 * @example
 * ```typescript
 * getStrengthCategory(20);  // → 'very-weak'
 * getStrengthCategory(50);  // → 'medium'
 * getStrengthCategory(85);  // → 'strong'
 * ```
 */
export const getStrengthCategory = (
  score: number
): 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong' => {
  if (score < 20) return 'very-weak';
  if (score < 40) return 'weak';
  if (score < 60) return 'medium';
  if (score < 80) return 'strong';
  return 'very-strong';
};

/**
 * Evalúa fortaleza completa del password con detalles
 *
 * @param password Password a evaluar
 * @returns Objeto con score, categoría y sugerencias
 *
 * @example
 * ```typescript
 * const evaluation = evaluatePasswordStrength('MyPass123');
 * console.log(evaluation);
 * // {
 * //   score: 55,
 * //   category: 'medium',
 * //   suggestions: ['Agrega caracteres especiales para mayor seguridad']
 * // }
 * ```
 */
export const evaluatePasswordStrength = (password: string): {
  score: number;
  category: 'very-weak' | 'weak' | 'medium' | 'strong' | 'very-strong';
  suggestions: string[];
} => {
  const score = calculatePasswordStrength(password);
  const category = getStrengthCategory(score);
  const suggestions: string[] = [];

  // Generar sugerencias basadas en lo que falta
  if (password.length < 12) {
    suggestions.push('Usa al menos 12 caracteres para mayor seguridad');
  }

  if (!REGEX_PATTERNS.uppercase.test(password)) {
    suggestions.push('Agrega letras mayúsculas');
  }

  if (!REGEX_PATTERNS.lowercase.test(password)) {
    suggestions.push('Agrega letras minúsculas');
  }

  if (!REGEX_PATTERNS.numbers.test(password)) {
    suggestions.push('Agrega números');
  }

  if (!REGEX_PATTERNS.specialChars.test(password)) {
    suggestions.push('Agrega caracteres especiales (!@#$%^&*)');
  }

  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Evita repetir caracteres consecutivamente');
  }

  if (/password|123456|qwerty|abc123/i.test(password)) {
    suggestions.push('Evita patrones comunes y predecibles');
  }

  return {
    score,
    category,
    suggestions
  };
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  validatePassword,
  validatePasswordOrThrow,
  calculatePasswordStrength,
  getStrengthCategory,
  evaluatePasswordStrength,
  // Presets
  BASIC_VALIDATION,
  MODERATE_VALIDATION,
  STRONG_VALIDATION,
  PASSPHRASE_VALIDATION
};
