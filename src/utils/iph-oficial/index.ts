/**
 * Barrel export para utilidades de IPH Oficial
 * Centraliza todas las funciones de validación y transformación
 *
 * @module IphOficialUtils
 * @version 1.0.0
 */

// Validaciones
export {
  validateIphOficialParams,
  validateServerResponse,
  validateIphId
} from './validation.util';

// Transformaciones
export {
  transformServerDataToComponent,
  normalizeObservaciones,
  extractBasicInfo,
  getSectionStats
} from './transformation.util';
