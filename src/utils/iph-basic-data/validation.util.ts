/**
 * Utilidades de validación para datos básicos de IPH
 * Siguiendo principios SOLID - Single Responsibility
 *
 * @module IphBasicDataValidation
 * @version 1.0.0
 */

import type { I_BasicDataDto } from '../../interfaces/iph-basic-data';

/**
 * Expresión regular para validar UUID v4
 * Formato: 8-4-4-4-12 caracteres hexadecimales
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida si una cadena es un UUID v4 válido
 *
 * @param id - Cadena a validar
 * @returns true si es un UUID válido, false en caso contrario
 *
 * @example
 * ```typescript
 * isValidUUID('123e4567-e89b-12d3-a456-426614174000'); // true
 * isValidUUID('invalid-uuid'); // false
 * ```
 */
export const isValidUUID = (id: string): boolean => {
  return UUID_V4_REGEX.test(id);
};

/**
 * Valida que el ID del IPH sea válido
 *
 * @param id - ID a validar
 * @throws Error si el ID es inválido
 *
 * @example
 * ```typescript
 * validateIphId('123e4567-e89b-12d3-a456-426614174000'); // OK
 * validateIphId(''); // Error: ID de IPH no proporcionado
 * validateIphId('invalid'); // Error: ID de IPH con formato inválido
 * ```
 */
export const validateIphId = (id: string): void => {
  if (!id) {
    throw new Error('ID de IPH no proporcionado');
  }

  if (typeof id !== 'string') {
    throw new Error('ID de IPH debe ser una cadena de texto');
  }

  if (!isValidUUID(id)) {
    throw new Error('ID de IPH con formato inválido (debe ser UUID v4)');
  }
};

/**
 * Valida que la respuesta del servidor contenga los datos mínimos requeridos
 * IMPORTANTE: Solo valida que los campos EXISTAN, no que tengan contenido
 * Los campos vacíos (null, undefined, "") se transforman a "N/D" en la transformación
 *
 * @param data - Datos recibidos del servidor
 * @throws Error si los datos son inválidos o incompletos
 *
 * @example
 * ```typescript
 * validateBasicDataResponse(null); // Error: Respuesta vacía del servidor
 * validateBasicDataResponse({}); // Error: ID del IPH no presente en la respuesta
 * validateBasicDataResponse({ id: '123', numero: '', tipoIph: '', ... }); // OK (campos vacíos permitidos)
 * ```
 */
export const validateBasicDataResponse = (data: I_BasicDataDto | null | undefined): void => {
  if (!data) {
    throw new Error('Respuesta vacía del servidor');
  }

  // Validar solo que los campos EXISTAN en la respuesta
  // No importa si están vacíos (null, undefined, "") - se transformarán a "N/D"

  // Campo obligatorio: ID (debe existir y no estar vacío)
  if (!data.id || (typeof data.id === 'string' && data.id.trim() === '')) {
    throw new Error('ID del IPH no presente en la respuesta');
  }

  // Campo obligatorio: Número de referencia (debe existir en la respuesta, puede estar vacío)
  if (!('numero' in data)) {
    throw new Error('Número de referencia del IPH no presente en la respuesta');
  }

  // Campos opcionales: Solo verificar que existan en la respuesta (pueden ser null, undefined o "")
  if (!('tipoIph' in data)) {
    throw new Error('Campo tipoIph no presente en la respuesta');
  }

  if (!('delito' in data)) {
    throw new Error('Campo delito no presente en la respuesta');
  }

  if (!('estatus' in data)) {
    throw new Error('Campo estatus no presente en la respuesta');
  }

  if (!('tipoDelito' in data)) {
    throw new Error('Campo tipoDelito no presente en la respuesta');
  }

  if (!('fechaCreacion' in data)) {
    throw new Error('Fecha de creación no presente en la respuesta');
  }

  // Evidencias: debe ser un array (puede estar vacío)
  if (!('evidencias' in data) || !Array.isArray(data.evidencias)) {
    throw new Error('Evidencias deben ser un arreglo');
  }

  // Observaciones: debe ser un string (puede estar vacío)
  if (!('observaciones' in data) || (data.observaciones !== null && data.observaciones !== undefined && typeof data.observaciones !== 'string')) {
    throw new Error('Observaciones deben ser una cadena de texto o null');
  }
};

/**
 * Analiza el mensaje de error HTTP y retorna un mensaje específico
 *
 * @param errorMessage - Mensaje de error original
 * @param iphId - ID del IPH que causó el error
 * @returns Mensaje de error específico según el código HTTP
 *
 * @example
 * ```typescript
 * parseHttpError('404 Not Found', 'abc-123');
 * // → 'No se encontró el IPH con ID abc-123'
 *
 * parseHttpError('409 Conflict', 'abc-123');
 * // → 'El IPH con ID abc-123 no está finalizado...'
 * ```
 */
export const parseHttpError = (errorMessage: string, iphId: string): string => {
  // Error 409: IPH no finalizado
  if (errorMessage.includes('409') || errorMessage.includes('ConflictException')) {
    return `El IPH con ID ${iphId} no está finalizado y no se pueden obtener sus datos básicos`;
  }

  // Error 404: IPH no encontrado
  if (errorMessage.includes('404') || errorMessage.includes('NotFoundException')) {
    return `No se encontró el IPH con ID ${iphId}`;
  }

  // Error 403: Sin permisos
  if (errorMessage.includes('403') || errorMessage.includes('ForbiddenException')) {
    return `No tiene permisos para acceder a los datos del IPH con ID ${iphId}`;
  }

  // Error 401: No autenticado
  if (errorMessage.includes('401') || errorMessage.includes('UnauthorizedException')) {
    return 'Sesión expirada. Por favor, inicie sesión nuevamente';
  }

  // Error 500: Error del servidor
  if (errorMessage.includes('500') || errorMessage.includes('InternalServerError')) {
    return 'Error interno del servidor al obtener los datos del IPH. Intente nuevamente más tarde';
  }

  // Error de red/timeout
  if (errorMessage.includes('Network Error') || errorMessage.includes('timeout')) {
    return 'Error de conexión. Verifique su conexión a internet e intente nuevamente';
  }

  // Error genérico
  return errorMessage;
};
