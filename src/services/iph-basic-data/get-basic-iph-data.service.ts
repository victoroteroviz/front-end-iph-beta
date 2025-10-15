/**
 * Servicio para obtener datos básicos de IPH
 * Siguiendo arquitectura SOLID, KISS y DRY del proyecto
 *
 * @module IphBasicDataService
 */

import { API_BASE_URL } from '../../config/env.config';
import { HttpHelper } from '../../helper/http/http.helper';
import { logDebug, logError, logInfo, logVerbose } from '../../helper/log/logger.helper';

// Interfaces
import type { I_BasicDataDto } from '../../interfaces/iph-basic-data';

// Mocks (para desarrollo)
import { getMockBasicIphData } from '../../mock/iph-basic-data';

// Constantes del servicio
const SERVICE_NAME = 'IphBasicDataService';
const API_ROUTE = '/api/iph-web';

/**
 * Flag para alternar entre datos mock y API real
 * @todo Cambiar a false cuando el endpoint del backend esté disponible
 */
const USE_MOCK_DATA = false;

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
  useMockData: USE_MOCK_DATA,
  apiRoute: API_ROUTE
});

/**
 * Obtiene los datos básicos de un IPH por su ID
 *
 * @param id - UUID del IPH a consultar
 * @returns Promise con los datos básicos del IPH
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

  // Validación de entrada
  if (!id || typeof id !== 'string') {
    const errorMsg = 'ID de IPH inválido o no proporcionado';
    logError(SERVICE_NAME, errorMsg, { id });
    throw new Error(errorMsg);
  }

  try {
    // Usar mock data si está habilitado
    if (USE_MOCK_DATA) {
      logInfo(SERVICE_NAME, `${functionName} - Usando datos mock`, { id });
      return await getMockBasicIphData(id);
    }

    // Consultar API real
    const endpoint = `${API_ROUTE}/getBasicDataByIph/${id}`;

    logVerbose(SERVICE_NAME, `${functionName} - Realizando petición HTTP`, {
      method: 'GET',
      endpoint,
      fullUrl: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint
    });

    const response = await http.get<I_BasicDataDto>(endpoint);

    // Validación de respuesta
    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }

    if (!response.data.id) {
      throw new Error('Datos incompletos recibidos del servidor');
    }

    logInfo(SERVICE_NAME, `${functionName} - Datos obtenidos exitosamente`, {
      iphId: response.data.id,
      numero: response.data.numero,
      estatus: response.data.estatus,
      tipoIph: response.data.tipoIph,
      duration: `${response.duration}ms`
    });

    // Transformar fechas si vienen como string
    if (response.data.fechaCreacion && typeof response.data.fechaCreacion === 'string') {
      response.data.fechaCreacion = new Date(response.data.fechaCreacion);
    }

    if (response.data.horaPuestaDisposicion && typeof response.data.horaPuestaDisposicion === 'string') {
      response.data.horaPuestaDisposicion = new Date(response.data.horaPuestaDisposicion);
    }

    return response.data;

  } catch (error) {
    const errorMessage = (error as Error).message || 'Error desconocido al obtener datos básicos del IPH';

    logError(SERVICE_NAME, errorMessage, {
      function: functionName,
      id,
      error,
      stack: (error as Error).stack
    });

    // Lanzar error con mensaje más específico si es posible
    if (errorMessage.includes('409') || errorMessage.includes('ConflictException')) {
      throw new Error(`El IPH con ID ${id} no está finalizado y no se pueden obtener sus datos básicos`);
    }

    if (errorMessage.includes('404') || errorMessage.includes('NotFoundException')) {
      throw new Error(`No se encontró el IPH con ID ${id}`);
    }

    throw new Error(errorMessage);
  }
};
