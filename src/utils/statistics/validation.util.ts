/**
 * @file validation.util.ts
 * @description Utilidades de validación y construcción de parámetros para estadísticas
 * @author Claude Code
 * @version 1.0.0
 * @created 2025-01-30
 *
 * Funciones de validación y builders para:
 * - Validación de parámetros de fechas (mes, año)
 * - Validación de parámetros de paginación
 * - Construcción de query params para APIs
 */

import type { IUsuarioIphCount } from '../../interfaces/statistics/statistics.interface';

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

/** Rango válido de meses (1-12) */
export const VALID_MONTH_RANGE = { min: 1, max: 12 } as const;

/** Límites de paginación */
export const PAGINATION_LIMITS = {
  minPage: 1,
  maxPage: 10000, // Límite razonable para evitar abusos
  minLimit: 1,
  maxLimit: 100, // Máximo de registros por página
  defaultLimit: 10
} as const;

/** Año mínimo válido (inicio del sistema) */
export const MIN_YEAR = 2020;

/** Año máximo válido (año actual + 1 para previsiones) */
export const getMaxYear = (): number => new Date().getFullYear() + 1;

// ============================================================================
// VALIDACIONES DE FECHAS
// ============================================================================

/**
 * @description Valida si un mes está en el rango válido (1-12)
 * @param mes - Número del mes a validar
 * @returns true si es válido, false si no
 * @example
 * ```typescript
 * isValidMonth(5);  // → true
 * isValidMonth(13); // → false
 * isValidMonth(0);  // → false
 * ```
 */
export const isValidMonth = (mes: number): boolean => {
  return (
    Number.isInteger(mes) &&
    mes >= VALID_MONTH_RANGE.min &&
    mes <= VALID_MONTH_RANGE.max
  );
};

/**
 * @description Valida si un año está en el rango válido del sistema
 * @param anio - Año a validar
 * @returns true si es válido, false si no
 * @example
 * ```typescript
 * isValidYear(2024); // → true
 * isValidYear(2019); // → false (menor al mínimo)
 * isValidYear(2030); // → false (mayor al máximo)
 * ```
 */
export const isValidYear = (anio: number): boolean => {
  return Number.isInteger(anio) && anio >= MIN_YEAR && anio <= getMaxYear();
};

/**
 * @description Normaliza un mes al rango válido (1-12), ajustando valores fuera de rango
 * @param mes - Mes a normalizar
 * @returns Mes normalizado o mes actual si es inválido
 * @example
 * ```typescript
 * normalizeMonth(5);   // → 5
 * normalizeMonth(13);  // → 1 (ajusta al mes actual si inválido)
 * normalizeMonth(-2);  // → 1 (ajusta al mes actual si inválido)
 * ```
 */
export const normalizeMonth = (mes: number): number => {
  if (isValidMonth(mes)) return mes;
  return new Date().getMonth() + 1; // Retornar mes actual si es inválido
};

/**
 * @description Normaliza un año al rango válido del sistema
 * @param anio - Año a normalizar
 * @returns Año normalizado o año actual si es inválido
 * @example
 * ```typescript
 * normalizeYear(2024); // → 2024
 * normalizeYear(2019); // → 2025 (año actual si inválido)
 * normalizeYear(2030); // → 2025 (año actual si inválido)
 * ```
 */
export const normalizeYear = (anio: number): number => {
  if (isValidYear(anio)) return anio;
  return new Date().getFullYear();
};

// ============================================================================
// VALIDACIONES DE PAGINACIÓN
// ============================================================================

/**
 * @description Valida parámetros de paginación
 * @param page - Número de página
 * @param limit - Límite de registros por página
 * @returns Objeto con valores validados y normalizados
 * @example
 * ```typescript
 * validatePagination(1, 10);    // → { page: 1, limit: 10, isValid: true }
 * validatePagination(-1, 200);  // → { page: 1, limit: 10, isValid: false }
 * validatePagination(5, 50);    // → { page: 5, limit: 50, isValid: true }
 * ```
 */
export const validatePagination = (
  page: number,
  limit: number
): { page: number; limit: number; isValid: boolean } => {
  const isPageValid =
    Number.isInteger(page) &&
    page >= PAGINATION_LIMITS.minPage &&
    page <= PAGINATION_LIMITS.maxPage;

  const isLimitValid =
    Number.isInteger(limit) &&
    limit >= PAGINATION_LIMITS.minLimit &&
    limit <= PAGINATION_LIMITS.maxLimit;

  return {
    page: isPageValid ? page : PAGINATION_LIMITS.minPage,
    limit: isLimitValid ? limit : PAGINATION_LIMITS.defaultLimit,
    isValid: isPageValid && isLimitValid
  };
};

/**
 * @description Calcula índices de paginación (inicio y fin) para slicing de arrays
 * @param page - Número de página (base 1)
 * @param limit - Límite de registros por página
 * @returns Objeto con startIndex y endIndex
 * @example
 * ```typescript
 * calculatePaginationIndices(1, 10); // → { startIndex: 0, endIndex: 10 }
 * calculatePaginationIndices(2, 10); // → { startIndex: 10, endIndex: 20 }
 * calculatePaginationIndices(3, 5);  // → { startIndex: 10, endIndex: 15 }
 * ```
 */
export const calculatePaginationIndices = (
  page: number,
  limit: number
): { startIndex: number; endIndex: number } => {
  const validated = validatePagination(page, limit);
  const startIndex = (validated.page - 1) * validated.limit;
  const endIndex = startIndex + validated.limit;

  return { startIndex, endIndex };
};

/**
 * @description Aplica paginación a un array de datos
 * @param data - Array de datos a paginar
 * @param page - Número de página (base 1)
 * @param limit - Límite de registros por página
 * @returns Slice del array correspondiente a la página solicitada
 * @example
 * ```typescript
 * const usuarios = [/* 100 usuarios *\/];
 * const pagina1 = paginateArray(usuarios, 1, 10); // → primeros 10 usuarios
 * const pagina2 = paginateArray(usuarios, 2, 10); // → usuarios 11-20
 * ```
 */
export const paginateArray = <T>(data: T[], page: number, limit: number): T[] => {
  const { startIndex, endIndex } = calculatePaginationIndices(page, limit);
  return data.slice(startIndex, endIndex);
};

// ============================================================================
// BUILDERS DE QUERY PARAMS
// ============================================================================

/**
 * @interface IStatisticsQueryParams
 * @description Parámetros de consulta para endpoints de estadísticas
 */
export interface IStatisticsQueryParams {
  mes?: number;
  anio?: number;
  page?: number;
  limit?: number;
  year?: number; // Alias para anio en algunos endpoints
  compareTo?: number; // Para comparaciones de variación
  offset?: number; // Para consultas por semana
}

/**
 * @description Construye query params validados para getIphCountByUsers
 * @param params - Parámetros opcionales de consulta
 * @returns Objeto con parámetros validados y normalizados
 * @example
 * ```typescript
 * buildIphCountQueryParams({ mes: 5, anio: 2024, page: 1, limit: 10 });
 * // → { mes: 5, anio: 2024, page: 1, limit: 10 }
 *
 * buildIphCountQueryParams({ mes: 13, page: -1 });
 * // → { mes: 1 (actual), anio: 2025 (actual), page: 1, limit: 10 }
 * ```
 */
export const buildIphCountQueryParams = (
  params: Partial<IStatisticsQueryParams> = {}
): Required<Pick<IStatisticsQueryParams, 'mes' | 'anio' | 'page' | 'limit'>> => {
  const now = new Date();
  const defaultMes = now.getMonth() + 1;
  const defaultAnio = now.getFullYear();

  const mes = normalizeMonth(params.mes ?? defaultMes);
  const anio = normalizeYear(params.anio ?? defaultAnio);
  const { page, limit } = validatePagination(
    params.page ?? PAGINATION_LIMITS.minPage,
    params.limit ?? PAGINATION_LIMITS.defaultLimit
  );

  return { mes, anio, page, limit };
};

/**
 * @description Construye query params para consultas de variación
 * @param year - Año principal
 * @param compareTo - Año de comparación (opcional, por defecto año anterior)
 * @returns Objeto con parámetros validados
 * @example
 * ```typescript
 * buildVariationQueryParams(2024);
 * // → { year: 2024, compareTo: 2023 }
 *
 * buildVariationQueryParams(2024, 2022);
 * // → { year: 2024, compareTo: 2022 }
 * ```
 */
export const buildVariationQueryParams = (
  year?: number,
  compareTo?: number
): { year: number; compareTo: number } => {
  const validYear = normalizeYear(year ?? new Date().getFullYear());
  const validCompareTo = normalizeYear(compareTo ?? validYear - 1);

  return { year: validYear, compareTo: validCompareTo };
};

/**
 * @description Construye query string a partir de objeto de parámetros
 * @param params - Objeto con parámetros de consulta
 * @returns Query string (ej: "mes=5&anio=2024&page=1&limit=10")
 * @example
 * ```typescript
 * buildQueryString({ mes: 5, anio: 2024, page: 1, limit: 10 });
 * // → "mes=5&anio=2024&page=1&limit=10"
 * ```
 */
export const buildQueryString = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
};

// ============================================================================
// VALIDACIONES DE DATOS
// ============================================================================

/**
 * @description Valida si un objeto cumple con la estructura de IUsuarioIphCount
 * @param obj - Objeto a validar
 * @returns true si cumple con la estructura, false si no
 * @example
 * ```typescript
 * isValidUsuarioIphCount({ nombre_completo: 'Juan', total_iphs: 10 });
 * // → true
 *
 * isValidUsuarioIphCount({ nombre: 'Juan' });
 * // → false (falta total_iphs)
 * ```
 */
export const isValidUsuarioIphCount = (obj: any): obj is IUsuarioIphCount => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.nombre_completo === 'string' &&
    obj.nombre_completo.trim().length > 0 &&
    typeof obj.total_iphs === 'number' &&
    Number.isInteger(obj.total_iphs) &&
    obj.total_iphs >= 0
  );
};

/**
 * @description Filtra un array removiendo objetos inválidos de IUsuarioIphCount
 * @param data - Array de objetos a filtrar
 * @returns Array solo con objetos válidos
 * @example
 * ```typescript
 * const datos = [
 *   { nombre_completo: 'Juan', total_iphs: 10 },
 *   { nombre_completo: '', total_iphs: 5 }, // inválido
 *   { nombre_completo: 'Ana', total_iphs: -1 } // inválido
 * ];
 * sanitizeUsuarioIphCountArray(datos);
 * // → [{ nombre_completo: 'Juan', total_iphs: 10 }]
 * ```
 */
export const sanitizeUsuarioIphCountArray = (data: any[]): IUsuarioIphCount[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(isValidUsuarioIphCount);
};

/**
 * @description Valida la estructura completa de una respuesta de API
 * @param response - Objeto de respuesta a validar
 * @returns true si la respuesta es válida, false si no
 * @example
 * ```typescript
 * const response = {
 *   data: [{ nombre_completo: 'Juan', total_iphs: 10 }],
 *   total: 1,
 *   page: 1,
 *   limit: 10
 * };
 * isValidApiResponse(response); // → true
 * ```
 */
export const isValidApiResponse = (response: any): boolean => {
  return (
    typeof response === 'object' &&
    response !== null &&
    Array.isArray(response.data) &&
    typeof response.total === 'number' &&
    typeof response.page === 'number' &&
    typeof response.limit === 'number' &&
    response.total >= 0 &&
    response.page >= 1 &&
    response.limit >= 1
  );
};
