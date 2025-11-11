/**
 * Servicio para obtener datos básicos de IPH
 * Siguiendo arquitectura SOLID, KISS y DRY del proyecto
 *
 * @module IphBasicDataService
 * @version 2.0.0
 */

import { API_BASE_URL } from '../../../../../config/env.config';
import CacheHelper from '../../../../../helper/cache/cache.helper';
import { HttpHelper } from '../../../../../helper/http/http.helper';
import { logDebug, logError, logInfo, logVerbose, logWarning } from '../../../../../helper/log/logger.helper';

// Interfaces
import type { I_BasicDataDto } from '../../../../../interfaces/iph-basic-data';

// Utils
import {
  validateIphId,
  validateBasicDataResponse,
  parseHttpError,
  transformBasicData
} from '../../../../../utils/iph-basic-data';

// Constantes del servicio
const SERVICE_NAME = 'IphBasicDataService';
const API_ROUTE = '/api/iph-web';
const CACHE_NAMESPACE = 'data';
const CACHE_KEY_PREFIX = `${SERVICE_NAME}:basic`;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Configuración del HttpHelper para este servicio
 */
const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos para operaciones de IPH
  retries: 3,
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
});

// Log de inicialización del servicio
logDebug(SERVICE_NAME, 'Servicio inicializado', {
  baseURL: API_BASE_URL,
  apiRoute: API_ROUTE
});

/**
 * Obtiene los datos básicos de un IPH por su ID
 *
 * @param id - UUID del IPH a consultar
 * @returns Promise con los datos básicos del IPH transformados y normalizados
 * @throws Error si el IPH no existe, no está finalizado o hay error en la petición
 *
 * @example
 * ```typescript
 * const basicData = await getBasicDataByIphId('123e4567-e89b-12d3-a456-426614174000');
 * console.log(basicData.numero, basicData.tipoIph);
 * ```
 */
export const getBasicDataByIphId = async (id: string): Promise<I_BasicDataDto> => {
  const functionName = 'getBasicDataByIphId';

  logDebug(SERVICE_NAME, `${functionName} - Iniciando consulta`, { id });

  try {
    // Validación de entrada con utils
    validateIphId(id);

    const cacheKey = `${CACHE_KEY_PREFIX}:${id}`;

    const cachedData = CacheHelper.get<I_BasicDataDto>(cacheKey, true);

    if (cachedData) {
      const cachedClone = JSON.parse(JSON.stringify(cachedData)) as I_BasicDataDto;

      logInfo(SERVICE_NAME, `${functionName} - Datos obtenidos desde cache`, {
        iphId: cachedData.id,
        cacheKey,
        source: 'sessionStorage'
      });

      return transformBasicData(cachedClone);
    }

    // Consultar API
    const endpoint = `${API_ROUTE}/getBasicDataByIph/${id}`;

    logVerbose(SERVICE_NAME, `${functionName} - Realizando petición HTTP`, {
      method: 'GET',
      endpoint,
      fullUrl: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint
    });

    const response = await http.get<I_BasicDataDto>(endpoint);

    // Validación de respuesta con utils
    validateBasicDataResponse(response.data);

    logInfo(SERVICE_NAME, `${functionName} - Datos obtenidos exitosamente`, {
      iphId: response.data.id,
      numero: response.data.numero,
      estatus: response.data.estatus,
      tipoIph: response.data.tipoIph,
      duration: `${response.duration}ms`
    });

    // Transformar y normalizar datos con utils
  const transformedData = transformBasicData({ ...response.data });

    const stored = CacheHelper.set<I_BasicDataDto>(cacheKey, transformedData, {
      expiresIn: CACHE_TTL_MS,
      priority: 'high',
      namespace: CACHE_NAMESPACE,
      useSessionStorage: true,
      metadata: {
        service: SERVICE_NAME,
        version: '2.0.0',
        cachedAt: new Date().toISOString()
      }
    });

    if (!stored) {
      logWarning(SERVICE_NAME, `${functionName} - No se pudo almacenar en cache`, {
        cacheKey
      });
    }

    return transformedData;

  } catch (error) {
    const errorMessage = (error as Error).message || 'Error desconocido al obtener datos básicos del IPH';

    logError(SERVICE_NAME, error, `function: ${functionName}, id: ${id}, stack: ${(error as Error).stack || 'N/A'}`);

    // Parsear error HTTP con utils y lanzar error específico
    const specificError = parseHttpError(errorMessage, id);
    throw new Error(specificError);
  }
};
