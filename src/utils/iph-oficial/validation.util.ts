/**
 * Utilidades de validación para IPH Oficial
 * Siguiendo principios SOLID - Single Responsibility
 *
 * @module IphOficialValidation
 * @version 1.0.0
 */

import type { GetIphOficialParams } from '../../interfaces/components/iphOficial.interface';
import type { ResponseIphData } from '../../interfaces/iph/iph.interface';

/**
 * Valida los parámetros de consulta de IPH Oficial
 *
 * @param params - Parámetros a validar
 * @throws Error si los parámetros son inválidos
 *
 * @example
 * ```typescript
 * validateIphOficialParams({ id: 'GUGN01123060520252247' }); // OK
 * validateIphOficialParams({ id: '' }); // Error: ID de IPH es requerido
 * validateIphOficialParams({ id: '   ' }); // Error: ID de IPH no puede estar vacío
 * ```
 */
export const validateIphOficialParams = (params: GetIphOficialParams): void => {
  if (!params) {
    throw new Error('Parámetros de consulta no proporcionados');
  }

  if (!params.id) {
    throw new Error('ID de IPH es requerido');
  }

  if (typeof params.id !== 'string') {
    throw new Error('ID de IPH debe ser una cadena de texto');
  }

  if (params.id.trim() === '') {
    throw new Error('ID de IPH no puede estar vacío');
  }

  // Validación de formato de ID (patrón común en el sistema)
  // Ejemplo: GUGN01123060520252247 (4 letras + dígitos)
  const idPattern = /^[A-Z]{4}\d+$/;
  if (!idPattern.test(params.id)) {
    throw new Error('ID de IPH con formato inválido (debe comenzar con 4 letras mayúsculas seguidas de números)');
  }
};

/**
 * Valida que la respuesta del servidor contenga datos válidos de IPH
 *
 * @param serverData - Datos recibidos del servidor
 * @throws Error si los datos son inválidos o incompletos
 *
 * @example
 * ```typescript
 * validateServerResponse(null); // Error: Respuesta del servidor es nula o indefinida
 * validateServerResponse({}); // Error: Respuesta del servidor no contiene datos de IPH
 * validateServerResponse({ iph: { id: '123' } }); // OK
 * ```
 */
export const validateServerResponse = (serverData: ResponseIphData | null | undefined): void => {
  if (!serverData) {
    throw new Error('Respuesta del servidor es nula o indefinida');
  }

  // Validar que tenga la estructura básica
  if (!serverData.iph) {
    throw new Error('Respuesta del servidor no contiene datos de IPH');
  }

  // Si iph es un array, es inválido (debe ser un objeto)
  if (Array.isArray(serverData.iph)) {
    throw new Error('Datos de IPH con formato inválido (se esperaba objeto, se recibió array)');
  }

  const iphData = serverData.iph;

  // Validar campos mínimos requeridos
  if (!iphData.id) {
    throw new Error('IPH sin ID en la respuesta');
  }

  if (!iphData.nReferencia && !iphData.nFolioSist) {
    throw new Error('IPH sin número de referencia ni folio de sistema');
  }
};

/**
 * Valida un ID de IPH
 * Útil para validaciones rápidas sin necesidad de crear objeto de parámetros
 *
 * @param id - ID a validar
 * @throws Error si el ID es inválido
 *
 * @example
 * ```typescript
 * validateIphId('GUGN01123060520252247'); // OK
 * validateIphId(''); // Error
 * validateIphId('invalid'); // Error
 * ```
 */
export const validateIphId = (id: string): void => {
  validateIphOficialParams({ id });
};
