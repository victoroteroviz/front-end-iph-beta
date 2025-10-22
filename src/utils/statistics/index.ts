/**
 * @file index.ts
 * @description Barrel export para utilidades de estadísticas
 * @author Claude Code
 * @version 1.0.0
 * @created 2025-01-30
 *
 * Exporta todas las utilidades reutilizables del módulo de estadísticas:
 * - Transformaciones de datos
 * - Validaciones y builders de parámetros
 */

// ============================================================================
// TRANSFORMACIONES
// ============================================================================

export {
  // Funciones de ordenamiento
  sortByIphCountDesc,
  sortByIphCountAsc,
  sortByNameAlpha,

  // Funciones de cálculo de estadísticas
  calculateStatisticsSummary,
  calculateUserPercentile,

  // Funciones de agrupación y filtrado
  groupByIphRange,
  filterByMinIphs,
  getTopPerformers,

  // Funciones de mapeo y transformación
  addPercentageContribution,

  // Tipos
  type IStatisticsSummary
} from './transformations.util';

// ============================================================================
// VALIDACIONES
// ============================================================================

export {
  // Constantes de validación
  VALID_MONTH_RANGE,
  PAGINATION_LIMITS,
  MIN_YEAR,
  getMaxYear,

  // Validaciones de fechas
  isValidMonth,
  isValidYear,
  normalizeMonth,
  normalizeYear,

  // Validaciones de paginación
  validatePagination,
  calculatePaginationIndices,
  paginateArray,

  // Builders de query params
  buildIphCountQueryParams,
  buildVariationQueryParams,
  buildQueryString,

  // Validaciones de datos
  isValidUsuarioIphCount,
  sanitizeUsuarioIphCountArray,
  isValidApiResponse,

  // Tipos
  type IStatisticsQueryParams
} from './validation.util';
