/**
 * Barrel export para utilidades de datos básicos de IPH
 * Centraliza todas las funciones de validación y transformación
 *
 * @module IphBasicDataUtils
 * @version 1.0.0
 */

// Validaciones
export {
  isValidUUID,
  validateIphId,
  validateBasicDataResponse,
  parseHttpError
} from './validation.util';

// Transformaciones
export {
  convertToDate,
  transformDates,
  normalizeEvidencias,
  normalizeObservaciones,
  transformBasicData
} from './transformation.util';
