/**
 * Barrel export para utilidades de historial IPH
 *
 * @fileoverview Exporta todas las utilidades de transformación y validación
 * para el módulo de historial de IPH.
 */

// Transformaciones
export {
  transformCoordenadasToUbicacion,
  transformUbicacionToCoordenadas,
  transformResHistoryToRegistro,
  transformResHistoryDataToRegistro,
  convertRegistroToResHistory,
  convertRegistroToResHistoryData,
  transformIPHToRegistro,
  calcularEstatusPorIph,
  transformInfoToHistorialResponse,
  transformPaginatedResponseToHistorialResponse,
  validateCoordinates,
  // Nuevas transformaciones para BasicDataDto
  transformUbicacionDto,
  buildFullName,
  transformBasicDataDtoToRegistro
} from './transformations.util';

// Validaciones
export {
  validateMonthYear,
  createMonthDateRange,
  buildQueryParams,
  DATE_VALIDATION,
  DEFAULT_PAGINATION
} from './validation.util';
