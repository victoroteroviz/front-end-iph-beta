/**
 * Servicio para obtener coordenadas de lugar de intervención con clustering
 * Endpoint: GET /mapa-calor/lugar-intervencion
 *
 * @module MapaCalorService
 * @description Obtiene coordenadas clustered según el nivel de zoom para mapa de calor
 */

import { httpHelper } from '../../helper/http/http.helper';
import { logInfo, logError } from '../../helper/log/logger.helper';
import type {
  I_CoordenadaCluster,
  I_GetCoordenadasQuery,
  I_MapaCalorResponse
} from '../../interfaces/mapa-calor';

/**
 * Obtiene coordenadas de lugar de intervención con clustering dinámico
 *
 * @param {I_GetCoordenadasQuery} query - Parámetros de consulta (zoom, bounds opcionales)
 * @returns {Promise<I_CoordenadaCluster[]>} Array de coordenadas clustered
 *
 * @example
 * ```typescript
 * // Consulta básica con solo zoom
 * const coordenadas = await getCoordenadasMapaCalor({ zoom: 10 });
 *
 * // Consulta con bounds específicos
 * const coordenadas = await getCoordenadasMapaCalor({
 *   zoom: 15,
 *   north: 19.5,
 *   south: 19.0,
 *   east: -99.0,
 *   west: -99.5
 * });
 * ```
 *
 * @throws {HttpError} Error HTTP con tipo y detalles del error
 *
 * **Estrategia de Clustering por Zoom:**
 * - Zoom 1-11: Agrupación agresiva (1 decimal ~10km)
 * - Zoom 12-14: Semi-agrupación (2 decimales ~1km)
 * - Zoom 15+: Puntos individuales (máximo 3000)
 */
export const getCoordenadasMapaCalor = async (
  query: I_GetCoordenadasQuery
): Promise<I_CoordenadaCluster[]> => {
  const MODULE_NAME = 'MapaCalorService';

  try {
    logInfo(
      MODULE_NAME,
      'Obteniendo coordenadas de lugar de intervención',
      { zoom: query.zoom, hasBounds: !!(query.north && query.south && query.east && query.west) }
    );

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('zoom', query.zoom.toString());

    // Agregar bounds si están presentes
    if (query.north !== undefined) queryParams.append('north', query.north.toString());
    if (query.south !== undefined) queryParams.append('south', query.south.toString());
    if (query.east !== undefined) queryParams.append('east', query.east.toString());
    if (query.west !== undefined) queryParams.append('west', query.west.toString());

    // Realizar petición GET con query params
    const response = await httpHelper.get<I_CoordenadaCluster[]>(
      `/api/mapa-calor/lugar-intervencion?${queryParams.toString()}`
    );

    logInfo(
      MODULE_NAME,
      'Coordenadas obtenidas exitosamente',
      {
        total: response.data.length,
        zoom: query.zoom,
        duration: response.duration
      }
    );

    return response.data;

  } catch (error) {
    logError(MODULE_NAME, error, 'Error al obtener coordenadas de mapa de calor');
    throw error;
  }
};

/**
 * Obtiene coordenadas con respuesta enriquecida (incluye metadata)
 *
 * @param {I_GetCoordenadasQuery} query - Parámetros de consulta
 * @returns {Promise<I_MapaCalorResponse>} Respuesta con coordenadas y metadata
 *
 * @example
 * ```typescript
 * const response = await getCoordenadasMapaCalorEnriquecido({ zoom: 12 });
 * console.log(`Total clusters: ${response.total}`);
 * console.log(`Coordenadas:`, response.coordenadas);
 * ```
 */
export const getCoordenadasMapaCalorEnriquecido = async (
  query: I_GetCoordenadasQuery
): Promise<I_MapaCalorResponse> => {
  const coordenadas = await getCoordenadasMapaCalor(query);

  const response: I_MapaCalorResponse = {
    coordenadas,
    zoom: query.zoom,
    total: coordenadas.length
  };

  // Agregar bounds si están presentes en la query
  if (query.north !== undefined && query.south !== undefined &&
      query.east !== undefined && query.west !== undefined) {
    response.bounds = {
      north: query.north,
      south: query.south,
      east: query.east,
      west: query.west
    };
  }

  return response;
};

/**
 * Helper para validar parámetros de zoom
 *
 * @param {number} zoom - Nivel de zoom a validar
 * @returns {boolean} true si el zoom es válido (1-20)
 */
export const isValidZoom = (zoom: number): boolean => {
  return zoom >= 1 && zoom <= 20;
};

/**
 * Helper para validar bounds geográficos
 *
 * @param {Partial<I_GetCoordenadasQuery>} query - Query con bounds parciales
 * @returns {boolean} true si los bounds son válidos o no están presentes
 */
export const hasValidBounds = (query: Partial<I_GetCoordenadasQuery>): boolean => {
  const { north, south, east, west } = query;

  // Si no hay bounds, es válido
  if (north === undefined && south === undefined && east === undefined && west === undefined) {
    return true;
  }

  // Si hay bounds, todos deben estar presentes
  if (north === undefined || south === undefined || east === undefined || west === undefined) {
    return false;
  }

  // Validar rangos
  const isLatValid = south >= -90 && south <= 90 && north >= -90 && north <= 90 && south < north;
  const isLngValid = west >= -180 && west <= 180 && east >= -180 && east <= 180 && west < east;

  return isLatValid && isLngValid;
};
