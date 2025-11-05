/**
 * Tests para Password Validator Utility
 *
 * Suite completa de tests para validar todas las funcionalidades
 * del password-validator utility.
 *
 * @module PasswordValidatorTests
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  validatePassword,
  validatePasswordOrThrow,
  calculatePasswordStrength,
  getStrengthCategory,
  evaluatePasswordStrength,
  BASIC_VALIDATION,
  MODERATE_VALIDATION,
  STRONG_VALIDATION,
  PASSPHRASE_VALIDATION
} from './password-validator.util';

describe('Password Validator Utility', () => {
  // =====================================================
  // TESTS DE validatePassword()
  // =====================================================

  describe('validatePassword()', () => {
    describe('Validación Básica', () => {
      it('debe validar password correcto con reglas básicas', () => {
        const result = validatePassword('MyPassword123', {
          rules: BASIC_VALIDATION
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('debe rechazar password vacío', () => {
        const result = validatePassword('', {
          rules: BASIC_VALIDATION
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('El campo es requerido');
      });

      it('debe rechazar password null/undefined', () => {
        const result1 = validatePassword(null as any, {
          rules: BASIC_VALIDATION
        });
        const result2 = validatePassword(undefined as any, {
          rules: BASIC_VALIDATION
        });

        expect(result1.isValid).toBe(false);
        expect(result2.isValid).toBe(false);
      });
    });

    describe('Validación de Longitud', () => {
      it('debe rechazar password menor a minLength', () => {
        const result = validatePassword('short', {
          rules: { minLength: 8 }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Debe tener al menos 8 caracteres');
      });

      it('debe rechazar password mayor a maxLength', () => {
        const result = validatePassword('a'.repeat(130), {
          rules: { minLength: 8, maxLength: 128 }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('No puede tener más de 128 caracteres');
      });

      it('debe validar password en rango correcto', () => {
        const result = validatePassword('ValidPassword123!', {
          rules: { minLength: 8, maxLength: 128 }
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Validación de Caracteres', () => {
      it('debe rechazar password sin mayúsculas cuando se requieren', () => {
        const result = validatePassword('password123!', {
          rules: { requireUppercase: true }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Debe contener al menos una letra mayúscula');
      });

      it('debe rechazar password sin minúsculas cuando se requieren', () => {
        const result = validatePassword('PASSWORD123!', {
          rules: { requireLowercase: true }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Debe contener al menos una letra minúscula');
      });

      it('debe rechazar password sin números cuando se requieren', () => {
        const result = validatePassword('Password!', {
          rules: { requireNumbers: true }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Debe contener al menos un número');
      });

      it('debe rechazar password sin caracteres especiales cuando se requieren', () => {
        const result = validatePassword('Password123', {
          rules: { requireSpecialChars: true }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Debe contener al menos un carácter especial');
      });

      it('debe validar password con todos los tipos de caracteres', () => {
        const result = validatePassword('MyP@ssw0rd!', {
          rules: {
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          }
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Validación con Pattern Custom', () => {
      it('debe validar pattern custom exitosamente', () => {
        const result = validatePassword('MyPassword123', {
          rules: {
            customPattern: {
              pattern: /^[A-Za-z0-9]+$/,
              message: 'Solo letras y números'
            }
          }
        });

        expect(result.isValid).toBe(true);
      });

      it('debe rechazar password que no cumple pattern custom', () => {
        const result = validatePassword('MyPassword!', {
          rules: {
            customPattern: {
              pattern: /^[A-Za-z0-9]+$/,
              message: 'Solo letras y números'
            }
          }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Solo letras y números');
      });
    });

    describe('Validadores Custom', () => {
      it('debe validar con validators custom exitosamente', () => {
        const result = validatePassword('MyPassword123', {
          rules: {
            customValidators: [
              {
                validator: (pwd) => !pwd.toLowerCase().includes('password'),
                message: 'No debe contener la palabra "password"'
              }
            ]
          }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('No debe contener la palabra "password"');
      });

      it('debe validar múltiples validators custom', () => {
        const result = validatePassword('Test1234', {
          rules: {
            customValidators: [
              {
                validator: (pwd) => pwd.length >= 8,
                message: 'Mínimo 8 caracteres'
              },
              {
                validator: (pwd) => /[A-Z]/.test(pwd),
                message: 'Debe contener mayúscula'
              },
              {
                validator: (pwd) => /\d/.test(pwd),
                message: 'Debe contener número'
              }
            ]
          }
        });

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('Mensajes Personalizados', () => {
      it('debe usar mensajes personalizados', () => {
        const result = validatePassword('short', {
          rules: { minLength: 8 },
          customMessages: {
            minLength: 'La contraseña debe tener al menos 8 caracteres para mayor seguridad'
          }
        });

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          'La contraseña debe tener al menos 8 caracteres para mayor seguridad'
        );
      });
    });

    describe('Presets de Validación', () => {
      it('BASIC_VALIDATION debe validar correctamente', () => {
        const valid = validatePassword('MyPassword123', {
          rules: BASIC_VALIDATION
        });
        const invalid = validatePassword('short', {
          rules: BASIC_VALIDATION
        });

        expect(valid.isValid).toBe(true);
        expect(invalid.isValid).toBe(false);
      });

      it('MODERATE_VALIDATION debe validar correctamente', () => {
        const valid = validatePassword('MyPassword123', {
          rules: MODERATE_VALIDATION
        });
        const invalid = validatePassword('password', {
          rules: MODERATE_VALIDATION
        });

        expect(valid.isValid).toBe(true);
        expect(invalid.isValid).toBe(false);
      });

      it('STRONG_VALIDATION debe validar correctamente', () => {
        const valid = validatePassword('MyP@ssw0rd123!', {
          rules: STRONG_VALIDATION
        });
        const invalid = validatePassword('Password123', {
          rules: STRONG_VALIDATION
        });

        expect(valid.isValid).toBe(true);
        expect(invalid.isValid).toBe(false);
      });

      it('PASSPHRASE_VALIDATION debe validar correctamente', () => {
        const valid = validatePassword('my-secure-passphrase-2024', {
          rules: PASSPHRASE_VALIDATION
        });
        const invalid = validatePassword('short', {
          rules: PASSPHRASE_VALIDATION
        });

        expect(valid.isValid).toBe(true);
        expect(invalid.isValid).toBe(false);
      });
    });
  });

  // =====================================================
  // TESTS DE validatePasswordOrThrow()
  // =====================================================

  describe('validatePasswordOrThrow()', () => {
    it('no debe lanzar error con password válido', () => {
      expect(() => {
        validatePasswordOrThrow('ValidPassword123!', {
          rules: BASIC_VALIDATION
        });
      }).not.toThrow();
    });

    it('debe lanzar error con password inválido', () => {
      expect(() => {
        validatePasswordOrThrow('short', {
          rules: BASIC_VALIDATION
        });
      }).toThrow('Debe tener al menos 8 caracteres');
    });

    it('debe lanzar error con múltiples mensajes concatenados', () => {
      expect(() => {
        validatePasswordOrThrow('short', {
          rules: {
            minLength: 8,
            requireUppercase: true,
            requireNumbers: true
          }
        });
      }).toThrow(/Debe tener al menos 8 caracteres.*mayúscula.*número/);
    });
  });

  // =====================================================
  // TESTS DE calculatePasswordStrength()
  // =====================================================

  describe('calculatePasswordStrength()', () => {
    it('debe retornar 0 para password vacío', () => {
      expect(calculatePasswordStrength('')).toBe(0);
      expect(calculatePasswordStrength(null as any)).toBe(0);
      expect(calculatePasswordStrength(undefined as any)).toBe(0);
    });

    it('debe retornar score bajo para password débil', () => {
      const score = calculatePasswordStrength('password');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(30);
    });

    it('debe retornar score medio para password moderado', () => {
      const score = calculatePasswordStrength('Password123');
      expect(score).toBeGreaterThan(30);
      expect(score).toBeLessThan(70);
    });

    it('debe retornar score alto para password fuerte', () => {
      const score = calculatePasswordStrength('MyP@ssw0rd!2024');
      expect(score).toBeGreaterThan(70);
    });

    it('debe penalizar patrones comunes', () => {
      const weak = calculatePasswordStrength('password123');
      const strong = calculatePasswordStrength('MySecurePass123!');

      expect(weak).toBeLessThan(strong);
    });

    it('debe normalizar score a rango 0-100', () => {
      const score1 = calculatePasswordStrength('a');
      const score2 = calculatePasswordStrength('MyP@ssw0rd!2024VeryLongAndSecure');

      expect(score1).toBeGreaterThanOrEqual(0);
      expect(score1).toBeLessThanOrEqual(100);
      expect(score2).toBeGreaterThanOrEqual(0);
      expect(score2).toBeLessThanOrEqual(100);
    });
  });

  // =====================================================
  // TESTS DE getStrengthCategory()
  // =====================================================

  describe('getStrengthCategory()', () => {
    it('debe categorizar score muy bajo como very-weak', () => {
      expect(getStrengthCategory(10)).toBe('very-weak');
      expect(getStrengthCategory(19)).toBe('very-weak');
    });

    it('debe categorizar score bajo como weak', () => {
      expect(getStrengthCategory(20)).toBe('weak');
      expect(getStrengthCategory(39)).toBe('weak');
    });

    it('debe categorizar score medio como medium', () => {
      expect(getStrengthCategory(40)).toBe('medium');
      expect(getStrengthCategory(59)).toBe('medium');
    });

    it('debe categorizar score alto como strong', () => {
      expect(getStrengthCategory(60)).toBe('strong');
      expect(getStrengthCategory(79)).toBe('strong');
    });

    it('debe categorizar score muy alto como very-strong', () => {
      expect(getStrengthCategory(80)).toBe('very-strong');
      expect(getStrengthCategory(100)).toBe('very-strong');
    });
  });

  // =====================================================
  // TESTS DE evaluatePasswordStrength()
  // =====================================================

  describe('evaluatePasswordStrength()', () => {
    it('debe evaluar password débil con sugerencias', () => {
      const evaluation = evaluatePasswordStrength('password');

      expect(evaluation.score).toBeGreaterThan(0);
      expect(evaluation.category).toBe('weak');
      expect(evaluation.suggestions).toContain('Usa al menos 12 caracteres para mayor seguridad');
      expect(evaluation.suggestions).toContain('Agrega letras mayúsculas');
      expect(evaluation.suggestions).toContain('Agrega números');
    });

    it('debe evaluar password moderado con menos sugerencias', () => {
      const evaluation = evaluatePasswordStrength('Password123');

      expect(evaluation.score).toBeGreaterThan(30);
      expect(evaluation.category).toMatch(/medium|strong/);
      expect(evaluation.suggestions).toContain('Agrega caracteres especiales (!@#$%^&*)');
    });

    it('debe evaluar password fuerte con pocas sugerencias', () => {
      const evaluation = evaluatePasswordStrength('MyP@ssw0rd!2024');

      expect(evaluation.score).toBeGreaterThan(70);
      expect(evaluation.category).toMatch(/strong|very-strong/);
      expect(evaluation.suggestions.length).toBeLessThanOrEqual(2);
    });

    it('debe detectar patrones comunes en sugerencias', () => {
      const evaluation = evaluatePasswordStrength('password123');

      expect(evaluation.suggestions).toContain('Evita patrones comunes y predecibles');
    });

    it('debe detectar caracteres repetidos en sugerencias', () => {
      const evaluation = evaluatePasswordStrength('Passsword111');

      expect(evaluation.suggestions).toContain('Evita repetir caracteres consecutivamente');
    });

    it('debe retornar sugerencias vacías para password perfecto', () => {
      const evaluation = evaluatePasswordStrength('MySecureP@ssw0rd!2024Advanced');

      expect(evaluation.score).toBeGreaterThan(80);
      expect(evaluation.category).toBe('very-strong');
      expect(evaluation.suggestions).toHaveLength(0);
    });
  });

  // =====================================================
  // TESTS DE INTEGRACIÓN
  // =====================================================

  describe('Integración con Helpers', () => {
    it('debe funcionar con configuración de SecurityHelper', () => {
      // Simular configuración de SecurityHelper
      const securityConfig = {
        passwordMinLength: 8,
        passwordMaxLength: 128
      };

      const result = validatePassword('MyPassword123', {
        rules: {
          minLength: securityConfig.passwordMinLength,
          maxLength: securityConfig.passwordMaxLength
        }
      });

      expect(result.isValid).toBe(true);
    });

    it('debe funcionar con configuración de EncryptHelper', () => {
      // Simular validación de passphrase en EncryptHelper
      const passphraseResult = validatePassword('my-secure-passphrase-2024', {
        rules: PASSPHRASE_VALIDATION
      });

      expect(passphraseResult.isValid).toBe(true);
    });

    it('debe lanzar error consistente con EncryptHelper', () => {
      expect(() => {
        validatePasswordOrThrow('short', {
          rules: PASSPHRASE_VALIDATION,
          customMessages: {
            minLength: 'Passphrase debe tener al menos 8 caracteres'
          }
        });
      }).toThrow('Passphrase debe tener al menos 8 caracteres');
    });
  });

  // =====================================================
  // TESTS DE EDGE CASES
  // =====================================================

  describe('Edge Cases', () => {
    it('debe manejar strings con caracteres especiales Unicode', () => {
      const result = validatePassword('Contraseña123!', {
        rules: BASIC_VALIDATION
      });

      expect(result.isValid).toBe(true);
    });

    it('debe manejar strings muy largos (passphrases)', () => {
      const longPassphrase = 'a'.repeat(500);
      const result = validatePassword(longPassphrase, {
        rules: { minLength: 8 } // Sin maxLength
      });

      expect(result.isValid).toBe(true);
    });

    it('debe manejar todos los errores simultáneamente', () => {
      const result = validatePassword('a', {
        rules: STRONG_VALIDATION
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('debe calcular strength correctamente con caracteres especiales Unicode', () => {
      const score = calculatePasswordStrength('MiContraseña123!');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
