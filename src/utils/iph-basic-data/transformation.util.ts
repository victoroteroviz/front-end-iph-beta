/**
 * Utilidades de transformación para datos básicos de IPH
 * Siguiendo principios SOLID - Single Responsibility
 *
 * @module IphBasicDataTransformation
 * @version 1.0.0
 */

import type { I_BasicDataDto } from '../../interfaces/iph-basic-data';

/**
 * Convierte una cadena de fecha a objeto Date
 * Maneja diferentes formatos y casos edge
 *
 * @param dateValue - Valor de fecha (string o Date)
 * @returns Objeto Date o undefined si no es convertible
 *
 * @example
 * ```typescript
 * convertToDate('2024-01-30T10:30:00Z'); // Date object
 * convertToDate(new Date()); // Date object (sin cambios)
 * convertToDate(undefined); // undefined
 * ```
 */
export const convertToDate = (dateValue: string | Date | undefined): Date | undefined => {
  if (!dateValue) {
    return undefined;
  }

  // Si ya es Date, retornar tal cual
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Si es string, convertir a Date
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);

      // Validar que la fecha sea válida
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida recibida: ${dateValue}`);
        return undefined;
      }

      return date;
    } catch (error) {
      console.error(`Error al convertir fecha: ${dateValue}`, error);
      return undefined;
    }
  }

  return undefined;
};

/**
 * Transforma las fechas de string a Date en los datos básicos del IPH
 * Mutación in-place para mejor performance
 *
 * @param data - Datos básicos del IPH a transformar
 * @returns Los mismos datos con fechas transformadas
 *
 * @example
 * ```typescript
 * const data = {
 *   id: '123',
 *   fechaCreacion: '2024-01-30T10:30:00Z',
 *   horaPuestaDisposicion: '2024-01-30T12:00:00Z',
 *   // ... otros campos
 * };
 *
 * transformDates(data);
 * // data.fechaCreacion ahora es Date object
 * // data.horaPuestaDisposicion ahora es Date object
 * ```
 */
export const transformDates = (data: I_BasicDataDto): I_BasicDataDto => {
  // Transformar fechaCreacion
  if (data.fechaCreacion && typeof data.fechaCreacion === 'string') {
    const converted = convertToDate(data.fechaCreacion);
    if (converted) {
      data.fechaCreacion = converted;
    }
  }

  // Transformar horaPuestaDisposicion
  if (data.horaPuestaDisposicion && typeof data.horaPuestaDisposicion === 'string') {
    const converted = convertToDate(data.horaPuestaDisposicion);
    if (converted) {
      data.horaPuestaDisposicion = converted;
    }
  }

  return data;
};

/**
 * Normaliza las evidencias (URLs de fotos) del IPH
 * Filtra URLs vacías o inválidas
 *
 * @param evidencias - Arreglo de URLs de evidencias
 * @returns Arreglo normalizado sin valores vacíos
 *
 * @example
 * ```typescript
 * normalizeEvidencias(['url1.jpg', '', 'url2.jpg', null, 'url3.jpg']);
 * // → ['url1.jpg', 'url2.jpg', 'url3.jpg']
 * ```
 */
export const normalizeEvidencias = (evidencias: string[] | undefined | null): string[] => {
  if (!evidencias || !Array.isArray(evidencias)) {
    return [];
  }

  return evidencias.filter(url => {
    return url && typeof url === 'string' && url.trim().length > 0;
  });
};

/**
 * Normaliza las observaciones del IPH
 * Recorta espacios y maneja casos edge
 *
 * @param observaciones - Texto de observaciones
 * @returns Texto normalizado
 *
 * @example
 * ```typescript
 * normalizeObservaciones('  Observación con espacios  ');
 * // → 'Observación con espacios'
 *
 * normalizeObservaciones(null);
 * // → ''
 * ```
 */
export const normalizeObservaciones = (observaciones: string | undefined | null): string => {
  if (!observaciones || typeof observaciones !== 'string') {
    return '';
  }

  return observaciones.trim();
};

/**
 * Transforma y normaliza completamente los datos básicos del IPH
 * Aplica todas las transformaciones necesarias
 *
 * @param data - Datos básicos del IPH recibidos del servidor
 * @returns Datos transformados y normalizados
 *
 * @example
 * ```typescript
 * const rawData = {
 *   id: '123',
 *   fechaCreacion: '2024-01-30T10:30:00Z',
 *   evidencias: ['url1.jpg', '', 'url2.jpg'],
 *   observaciones: '  Observación  ',
 *   // ... otros campos
 * };
 *
 * const normalized = transformBasicData(rawData);
 * // normalized.fechaCreacion → Date object
 * // normalized.evidencias → ['url1.jpg', 'url2.jpg']
 * // normalized.observaciones → 'Observación'
 * ```
 */
export const transformBasicData = (data: I_BasicDataDto): I_BasicDataDto => {
  // Transformar fechas
  transformDates(data);

  // Normalizar evidencias
  data.evidencias = normalizeEvidencias(data.evidencias);

  // Normalizar observaciones
  data.observaciones = normalizeObservaciones(data.observaciones);

  return data;
};
