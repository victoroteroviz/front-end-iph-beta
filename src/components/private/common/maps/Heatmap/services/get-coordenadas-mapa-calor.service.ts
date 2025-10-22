/**
 * Servicio para obtener coordenadas de lugar de intervención con clustering
 * Endpoint: GET /mapa-calor/lugar-intervencion
 *
 * @module MapaCalorService
 * @description Obtiene coordenadas clustered según el nivel de zoom para mapa de calor
 */

import { httpHelper } from '../../../../../../helper/http/http.helper';
import { logInfo, logError, logDebug } from '../../../../../../helper/log/logger.helper';
import type {
  I_CoordenadaCluster,
  I_GetCoordenadasQuery,
  I_MapaCalorResponse
} from '../../../../../../interfaces/mapa-calor';

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

    // Log de debug con parámetros de entrada detallados
    logDebug(MODULE_NAME, 'Parámetros de entrada completos', {
      query: {
        zoom: query.zoom,
        north: query.north,
        south: query.south,
        east: query.east,
        west: query.west
      },
      queryValidation: {
        hasAllBounds: !!(query.north && query.south && query.east && query.west),
        hasPartialBounds: !!(query.north || query.south || query.east || query.west),
        zoomValid: query.zoom >= 1 && query.zoom <= 20
      }
    });

    // Construir query params
    const queryParams = new URLSearchParams();
    queryParams.append('zoom', query.zoom.toString());

    // Agregar bounds si están presentes
    if (query.north !== undefined) queryParams.append('north', query.north.toString());
    if (query.south !== undefined) queryParams.append('south', query.south.toString());
    if (query.east !== undefined) queryParams.append('east', query.east.toString());
    if (query.west !== undefined) queryParams.append('west', query.west.toString());

    const finalUrl = `/api/mapa-calor/lugar-intervencion?${queryParams.toString()}`;

    // Log de debug con URL y parámetros finales
    logDebug(MODULE_NAME, 'URL de petición construida', {
      url: finalUrl,
      queryString: queryParams.toString(),
      parametersCount: Array.from(queryParams.entries()).length,
      parameters: Object.fromEntries(queryParams.entries())
    });

    // Realizar petición GET con query params
    const response = await httpHelper.get<I_CoordenadaCluster[]>(finalUrl);

    // Log de debug con análisis detallado de coordenadas recibidas
    logDebug(MODULE_NAME, 'Respuesta HTTP recibida', {
      httpStatus: response.status || 'unknown',
      duration: response.duration,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      rawDataLength: response.data?.length || 0
    });

    // Análisis detallado de las coordenadas
    if (Array.isArray(response.data) && response.data.length > 0) {
      const coordenadas = response.data;
      
      // Estadísticas de las coordenadas
      const stats = {
        total: coordenadas.length,
        firstCoordinate: coordenadas[0],
        lastCoordinate: coordenadas[coordenadas.length - 1],
        countRange: {
          min: Math.min(...coordenadas.map(c => c.count)),
          max: Math.max(...coordenadas.map(c => c.count)),
          avg: coordenadas.reduce((sum, c) => sum + c.count, 0) / coordenadas.length
        },
        latitudeRange: {
          min: Math.min(...coordenadas.map(c => c.latitud)),
          max: Math.max(...coordenadas.map(c => c.latitud))
        },
        longitudeRange: {
          min: Math.min(...coordenadas.map(c => c.longitud)),
          max: Math.max(...coordenadas.map(c => c.longitud))
        }
      };

      logDebug(MODULE_NAME, 'Estadísticas de coordenadas recibidas', stats);

      // Log de las primeras 5 coordenadas para inspección
      const sampleCoordinates = coordenadas.slice(0, 5).map((coord, index) => ({
        index,
        latitud: coord.latitud,
        longitud: coord.longitud,
        count: coord.count,
        dataTypes: {
          latitud: typeof coord.latitud,
          longitud: typeof coord.longitud,
          count: typeof coord.count
        },
        validation: {
          latitudValid: typeof coord.latitud === 'number' && coord.latitud >= -90 && coord.latitud <= 90,
          longitudValid: typeof coord.longitud === 'number' && coord.longitud >= -180 && coord.longitud <= 180,
          countValid: typeof coord.count === 'number' && coord.count >= 0
        }
      }));

      logDebug(MODULE_NAME, 'Muestra de coordenadas (primeras 5)', {
        sampleSize: sampleCoordinates.length,
        coordinates: sampleCoordinates
      });

      // Validar integridad de datos
      const invalidCoordinates = coordenadas.filter((coord) => {
        const latValid = typeof coord.latitud === 'number' && coord.latitud >= -90 && coord.latitud <= 90;
        const lngValid = typeof coord.longitud === 'number' && coord.longitud >= -180 && coord.longitud <= 180;
        const countValid = typeof coord.count === 'number' && coord.count >= 0;
        return !latValid || !lngValid || !countValid;
      });

      if (invalidCoordinates.length > 0) {
        logDebug(MODULE_NAME, 'Coordenadas inválidas detectadas', {
          invalidCount: invalidCoordinates.length,
          invalidCoordinates: invalidCoordinates.slice(0, 3), // Solo las primeras 3
          percentage: ((invalidCoordinates.length / coordenadas.length) * 100).toFixed(2) + '%'
        });
      }

    } else {
      logDebug(MODULE_NAME, 'Respuesta vacía o inválida', {
        dataReceived: response.data,
        isEmpty: !response.data || response.data.length === 0,
        dataStructure: response.data ? Object.keys(response.data) : 'no keys'
      });
    }

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
    // Log de debug con detalles del error
    logDebug(MODULE_NAME, 'Error detallado en petición de coordenadas', {
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      },
      request: {
        zoom: query.zoom,
        bounds: {
          north: query.north,
          south: query.south,
          east: query.east,
          west: query.west
        },
        queryString: new URLSearchParams({
          zoom: query.zoom.toString(),
          ...(query.north !== undefined && { north: query.north.toString() }),
          ...(query.south !== undefined && { south: query.south.toString() }),
          ...(query.east !== undefined && { east: query.east.toString() }),
          ...(query.west !== undefined && { west: query.west.toString() })
        }).toString()
      },
      timestamp: new Date().toISOString()
    });

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
  const MODULE_NAME = 'MapaCalorService';
  
  logDebug(MODULE_NAME, 'Iniciando getCoordenadasMapaCalorEnriquecido', {
    query,
    timestamp: new Date().toISOString()
  });

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

  logDebug(MODULE_NAME, 'Respuesta enriquecida construida', {
    response: {
      coordenadasCount: response.coordenadas.length,
      zoom: response.zoom,
      total: response.total,
      hasBounds: !!response.bounds
    },
    bounds: response.bounds,
    timestamp: new Date().toISOString()
  });

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
