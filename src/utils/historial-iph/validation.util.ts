/**
 * Utilidades de validación para el historial de IPH
 *
 * @fileoverview Funciones de validación de datos, fechas y parámetros
 * para el módulo de historial de IPH.
 *
 * @version 1.0.0
 * @since 2024-01-30
 */

import type { GetHistorialIPHParamsEnhanced } from '../../components/private/components/historial-iph/services/historial-iph.service';

// ==================== CONFIGURACIONES ====================

/**
 * Configuración de validación de fechas
 */
export const DATE_VALIDATION = {
  MIN_YEAR: 1900,
  MAX_YEAR: 2100,
  MIN_MONTH: 1,
  MAX_MONTH: 12
} as const;

/**
 * Configuración de paginación por defecto
 */
export const DEFAULT_PAGINATION = {
  ITEMS_PER_PAGE: 10,
  DEFAULT_PAGE: 1,
  DEFAULT_ORDER_BY: 'fecha_creacion' as const,
  DEFAULT_ORDER: 'DESC' as const
} as const;

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Valida el mes y año para estadísticas
 * @param {number} month - Mes (1-12)
 * @param {number} year - Año
 * @throws {Error} Si los valores son inválidos
 */
export const validateMonthYear = (month: number, year: number): void => {
  if (month < DATE_VALIDATION.MIN_MONTH || month > DATE_VALIDATION.MAX_MONTH) {
    throw new Error('El mes debe estar entre 1 y 12');
  }

  if (year < DATE_VALIDATION.MIN_YEAR || year > DATE_VALIDATION.MAX_YEAR) {
    throw new Error(`El año debe estar entre ${DATE_VALIDATION.MIN_YEAR} y ${DATE_VALIDATION.MAX_YEAR}`);
  }
};

/**
 * Valida coordenadas geográficas
 * @param {string} longitud - Longitud como string
 * @param {string} latitud - Latitud como string
 * @returns {boolean} True si las coordenadas son válidas
 */
export const validateCoordinates = (longitud?: string, latitud?: string): boolean => {
  return !!(longitud &&
    latitud &&
    longitud.trim() !== '' &&
    latitud.trim() !== '' &&
    !isNaN(parseFloat(longitud)) &&
    !isNaN(parseFloat(latitud)));
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Crea fechas de inicio y fin para un mes específico
 * @param {number} month - Mes (1-12)
 * @param {number} year - Año
 * @returns {Object} Objeto con fechas de inicio y fin
 */
export const createMonthDateRange = (month: number, year: number): { startDate: Date; endDate: Date; daysInMonth: number } => {
  validateMonthYear(month, year);

  // Inicio del mes: día 1 a las 00:00:00
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);

  // Fin del mes: último día a las 23:59:59.999
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Obtener días del mes
  const daysInMonth = new Date(year, month, 0).getDate();

  return { startDate, endDate, daysInMonth };
};

/**
 * Construye query parameters para las consultas al API
 * @param {GetHistorialIPHParamsEnhanced} params - Parámetros de consulta
 * @returns {URLSearchParams} Query parameters construidos
 */
export const buildQueryParams = (params: GetHistorialIPHParamsEnhanced): URLSearchParams => {
  const {
    page = DEFAULT_PAGINATION.DEFAULT_PAGE,
    ordernaPor = DEFAULT_PAGINATION.DEFAULT_ORDER_BY,
    orden = DEFAULT_PAGINATION.DEFAULT_ORDER,
    busqueda,
    busquedaPor,
    estatus,
    tipoDelito,
    usuario,
    fechaInicio,
    fechaFin
  } = params;

  // Solo agregar pagina como obligatorio según el backend NestJS
  const queryParams = new URLSearchParams({
    pagina: page.toString()
  });

  // Agregar parámetros opcionales SOLO si tienen valores válidos (no vacíos)
  if (ordernaPor && ordernaPor !== DEFAULT_PAGINATION.DEFAULT_ORDER_BY) {
    queryParams.append('ordernaPor', ordernaPor);
  }
  if (orden && orden !== DEFAULT_PAGINATION.DEFAULT_ORDER) {
    queryParams.append('orden', orden);
  }
  if (busqueda && busqueda.trim() !== '') {
    queryParams.append('busqueda', busqueda.trim());
  }
  if (busquedaPor && busqueda && busqueda.trim() !== '') {
    queryParams.append('busquedaPor', busquedaPor);
  }
  if (estatus && estatus.trim() !== '') {
    queryParams.append('estatus', estatus.trim());
  }
  if (tipoDelito && tipoDelito.trim() !== '') {
    queryParams.append('tipoDelito', tipoDelito.trim());
  }
  if (usuario && usuario.trim() !== '') {
    queryParams.append('usuario', usuario.trim());
  }
  if (fechaInicio && fechaInicio.trim() !== '') {
    queryParams.append('fechaInicio', fechaInicio.trim());
  }
  if (fechaFin && fechaFin.trim() !== '') {
    queryParams.append('fechaFin', fechaFin.trim());
  }

  return queryParams;
};
