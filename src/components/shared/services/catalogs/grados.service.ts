
//+Helpers
import {HttpHelper} from "../../../../helper/http/http.helper";
import { CacheHelper } from "../../../../helper/cache/cache.helper";
import { logInfo, logError } from "../../../../helper/log/logger.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../../../config/env.config";
import type { IGrados, IGradosAllData } from "../../../../interfaces/catalogs/grados.interface";

// Configuración del cliente HTTP con baseURL desde variables de entorno
const http : HttpHelper = HttpHelper.getInstance(
  {
    baseURL: API_BASE_URL || '', // Usar proxy en desarrollo, URL completa en producción
    timeout: 10000,
    retries: 3,
    defaultHeaders:{
      "Content-Type": "application/json"
    }
  }
);

// Constantes para cache
const CACHE_KEY_GRADOS = 'grados_list';
const CACHE_DURATION_1_DAY = 24 * 60 * 60 * 1000; // 1 día en milisegundos

/**
 * Obtiene la lista de grados con cache de 1 día
 * @returns Promise<IGrados[]>
 */
export const getGrados = async (): Promise<IGrados[]> => {
  logInfo('GradosService', '🔄 Iniciando getGrados()');

  try {
    // Intentar obtener del cache primero
    const cachedGrados = await CacheHelper.get<IGrados[]>(CACHE_KEY_GRADOS);

    if (cachedGrados) {
      logInfo('GradosService', '✅ Grados obtenidos del cache', { count: cachedGrados.length });
      return cachedGrados;
    }

    // Si no hay cache, hacer petición al API
    logInfo('GradosService', '🌐 Cache vacío, obteniendo grados del API: /api/grados-web');
    const response = await http.get<IGrados[]>('/api/grados-web');

    logInfo('GradosService', '📦 Respuesta del API recibida', {
      url: '/api/grados-web',
      statusCode: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      isString: typeof response.data === 'string',
      isHTML: typeof response.data === 'string' && (response.data as string).includes('<!doctype html>'),
      count: Array.isArray(response.data) ? response.data.length : 'N/A',
      dataPreview: typeof response.data === 'string' ? (response.data as string).substring(0, 100) + '...' : response.data
    });

    // Validar que la respuesta no sea HTML
    if (typeof response.data === 'string' && (response.data as string).includes('<!doctype html>')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON. Posible problema de routing o CORS.');
    }

    const grados: IGrados[] = response.data;

    // Guardar en cache por 1 día
    CacheHelper.set(CACHE_KEY_GRADOS, grados, CACHE_DURATION_1_DAY);

    logInfo('GradosService', '💾 Grados obtenidos del API y guardados en cache', {
      count: grados.length,
      cached: true
    });

    return grados;
  } catch (error) {
    logError('GradosService', `❌ Error al obtener grados: ${(error as Error).message}`);
    logError('GradosService', `Detalles del error: ${JSON.stringify(error)}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

/**
 * Fuerza la recarga de grados desde el API (ignora cache)
 * @returns Promise<IGrados[]>
 */
export const refreshGrados = async (): Promise<IGrados[]> => {
  try {
    logInfo('GradosService', 'Forzando recarga de grados desde API');

    // Limpiar cache existente
    CacheHelper.remove(CACHE_KEY_GRADOS);

    // Obtener datos frescos
    const response = await http.get<IGrados[]>('/api/grados-web');
    const grados: IGrados[] = response.data;

    // Guardar en cache
    CacheHelper.set(CACHE_KEY_GRADOS, grados, CACHE_DURATION_1_DAY);

    logInfo('GradosService', 'Grados recargados y guardados en cache', {
      count: grados.length
    });

    return grados;
  } catch (error) {
    logError('GradosService', `Error al recargar grados: ${(error as Error).message}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getGradoById = async (id: string): Promise<IGrados | null> => {
  try {
    const response = await http.get<IGradosAllData>(`/api/grados-web/${id}`);
    const grado:  IGradosAllData= response.data;
    return grado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const createGrado = async (nombre: string): Promise<IGradosAllData> => {
  try {
    const response = await http.post<IGrados>('/api/grados-web', {nombre});
    const gradoCreado : IGradosAllData = response.data as IGradosAllData;
    return gradoCreado;

  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateGrado = async (id: string, nombre: string): Promise<IGradosAllData> => {
  try {
    const response = await http.patch<IGradosAllData>(`/api/grados-web/${id}`, {nombre});
    const gradoActualizado: IGradosAllData = response.data as IGradosAllData;
    return gradoActualizado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
