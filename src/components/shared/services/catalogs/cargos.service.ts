
//+Helpers
import {HttpHelper} from "../../../../helper/http/http.helper";
import { CacheHelper } from "../../../../helper/cache/cache.helper";
import { logInfo, logError } from "../../../../helper/log/logger.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../../../config/env.config";
import type { ICargos, ICargosAllData } from "../../../../interfaces/catalogs/cargos.interface";

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
const CACHE_KEY_CARGOS = 'cargos_list';
const CACHE_DURATION_1_DAY = 24 * 60 * 60 * 1000; // 1 día en milisegundos

/**
 * Obtiene la lista de cargos con cache de 1 día
 * @returns Promise<ICargos[]>
 */
export const getCargos = async (): Promise<ICargos[]> => {
  logInfo('CargosService', '🔄 Iniciando getCargos()');

  try {
    // Intentar obtener del cache primero
    const cachedCargos = CacheHelper.get<ICargos[]>(CACHE_KEY_CARGOS);

    if (cachedCargos) {
      logInfo('CargosService', '✅ Cargos obtenidos del cache', { count: cachedCargos.length });
      return cachedCargos;
    }

    // Si no hay cache, hacer petición al API
    logInfo('CargosService', '🌐 Cache vacío, obteniendo cargos del API: /api/cargos-web');
    const response = await http.get<ICargos[]>('/api/cargos-web');

    logInfo('CargosService', '📦 Respuesta del API recibida', {
      url: '/api/cargos-web',
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

    const cargos: ICargos[] = response.data;

    // Guardar en cache por 1 día
    CacheHelper.set(CACHE_KEY_CARGOS, cargos, CACHE_DURATION_1_DAY);

    logInfo('CargosService', '💾 Cargos obtenidos del API y guardados en cache', {
      count: cargos.length,
      cached: true
    });

    return cargos;
  } catch (error) {
    logError('CargosService', `❌ Error al obtener cargos: ${(error as Error).message}`);
    logError('CargosService', `Detalles del error: ${JSON.stringify(error)}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

/**
 * Fuerza la recarga de cargos desde el API (ignora cache)
 * @returns Promise<ICargos[]>
 */
export const refreshCargos = async (): Promise<ICargos[]> => {
  try {
    logInfo('CargosService', 'Forzando recarga de cargos desde API');

    // Limpiar cache existente
    CacheHelper.remove(CACHE_KEY_CARGOS);

    // Obtener datos frescos
    const response = await http.get<ICargos[]>('/api/cargos-web');
    const cargos: ICargos[] = response.data;

    // Guardar en cache
    CacheHelper.set(CACHE_KEY_CARGOS, cargos, CACHE_DURATION_1_DAY);

    logInfo('CargosService', 'Cargos recargados y guardados en cache', {
      count: cargos.length
    });

    return cargos;
  } catch (error) {
    logError('CargosService', `Error al recargar cargos: ${(error as Error).message}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
export const getCargoById = async (id: string): Promise<ICargos | null> => {
  try {
    const response = await http.get<ICargosAllData>(`/api/cargos-web/${id}`);
    const cargo: ICargosAllData = response.data;
    return cargo;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const createCargo = async (nombre: string): Promise<ICargosAllData> => {
  try {
    const response = await http.post<ICargos>('/api/cargos-web', {nombre});
    const cargoCreado : ICargosAllData = response.data as ICargosAllData;
    return cargoCreado;

  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateCargo = async (id: string, nombre: string): Promise<ICargosAllData> => {
  try {
    const response = await http.patch<ICargosAllData>(`/api/cargos-web/${id}`, {nombre});
    const cargoActualizado: ICargosAllData = response.data as ICargosAllData;
    return cargoActualizado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}