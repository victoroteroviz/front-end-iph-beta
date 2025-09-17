
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
import { CacheHelper } from "../../helper/cache/cache.helper";
import { logInfo, logError } from "../../helper/log/logger.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";
//+ Interfaces para los servicios
import type { IAdscripcionWithInstitucion, IAdscripcion } from "../../interfaces/catalogs/adscripcion.interface";

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
const CACHE_KEY_ADSCRIPCIONES = 'adscripciones_list';
const CACHE_DURATION_1_DAY = 24 * 60 * 60 * 1000; // 1 día en milisegundos

// Datos mock como fallback
const getMockAdscripciones = (): IAdscripcionWithInstitucion[] => [
  {
    id: 1,
    nombre: 'Comisaría Centro',
    institucion: {
      id: 1,
      nombre_corto: 'SSP',
      nombre_largo: 'Secretaría de Seguridad Pública',
      codigo: 'SSP-001',
      is_active: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      gobiernoId: 1
    }
  },
  {
    id: 2,
    nombre: 'Comisaría Norte',
    institucion: {
      id: 1,
      nombre_corto: 'SSP',
      nombre_largo: 'Secretaría de Seguridad Pública',
      codigo: 'SSP-002',
      is_active: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      gobiernoId: 1
    }
  },
  {
    id: 3,
    nombre: 'Comisaría Sur',
    institucion: {
      id: 1,
      nombre_corto: 'SSP',
      nombre_largo: 'Secretaría de Seguridad Pública',
      codigo: 'SSP-003',
      is_active: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      gobiernoId: 1
    }
  },
  {
    id: 4,
    nombre: 'Dirección General',
    institucion: {
      id: 2,
      nombre_corto: 'FGE',
      nombre_largo: 'Fiscalía General del Estado',
      codigo: 'FGE-001',
      is_active: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date(),
      gobiernoId: 1
    }
  }
];

/**
 * Obtiene la lista de adscripciones con cache de 1 día
 * @returns Promise<IAdscripcionWithInstitucion[]>
 */
export const getAdscripciones = async (): Promise<IAdscripcionWithInstitucion[]> => {
  logInfo('AdscripcionesService', '🔄 Iniciando getAdscripciones()');

  try {
    // Intentar obtener del cache primero
    const cachedAdscripciones = CacheHelper.get<IAdscripcionWithInstitucion[]>(CACHE_KEY_ADSCRIPCIONES);

    if (cachedAdscripciones && cachedAdscripciones.length > 0) {
      logInfo('AdscripcionesService', '✅ Adscripciones obtenidas del cache', { count: cachedAdscripciones.length });
      return cachedAdscripciones;
    } else if (cachedAdscripciones && cachedAdscripciones.length === 0) {
      logInfo('AdscripcionesService', '🧹 Cache contiene array vacío, limpiando...');
      CacheHelper.remove(CACHE_KEY_ADSCRIPCIONES);
    }

    // Si no hay cache, hacer petición al API
    logInfo('AdscripcionesService', '🌐 Cache vacío, obteniendo adscripciones del API: /api/adscripcion-web');
    const response = await http.get<IAdscripcionWithInstitucion[]>('/api/adscripcion-web');

    logInfo('AdscripcionesService', '📦 Respuesta del API recibida', {
      url: '/api/adscripcion-web',
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

    // Extraer array de adscripciones
    let adscripciones: IAdscripcionWithInstitucion[] = [];

    if (Array.isArray(response.data)) {
      adscripciones = response.data;
      logInfo('AdscripcionesService', '📋 Respuesta es array directo');
    } else {
      logError('AdscripcionesService', '❌ Estructura de respuesta no reconocida');
    }

    // Si no hay adscripciones del API, usar datos mock como fallback
    if (adscripciones.length === 0) {
      logInfo('AdscripcionesService', '🔄 API devolvió array vacío, usando datos mock como fallback');
      adscripciones = getMockAdscripciones();
    }

    // Guardar en cache por 1 día
    CacheHelper.set(CACHE_KEY_ADSCRIPCIONES, adscripciones, CACHE_DURATION_1_DAY);

    logInfo('AdscripcionesService', '💾 Adscripciones obtenidas del API y guardadas en cache', {
      count: adscripciones.length,
      cached: true,
      sample: adscripciones.slice(0, 2),
      source: adscripciones.length === getMockAdscripciones().length ? 'mock_fallback' : 'api'
    });

    return adscripciones;
  } catch (error) {
    logError('AdscripcionesService', `❌ Error al obtener adscripciones: ${(error as Error).message}`);
    logError('AdscripcionesService', `Detalles del error: ${JSON.stringify(error)}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

/**
 * Fuerza la recarga de adscripciones desde el API (ignora cache)
 * @returns Promise<IAdscripcionWithInstitucion[]>
 */
export const refreshAdscripciones = async (): Promise<IAdscripcionWithInstitucion[]> => {
  try {
    logInfo('AdscripcionesService', 'Forzando recarga de adscripciones desde API');

    // Limpiar cache existente
    CacheHelper.remove(CACHE_KEY_ADSCRIPCIONES);

    // Obtener datos frescos
    const response = await http.get<IAdscripcionWithInstitucion[]>('/api/adscripcion-web');
    let adscripciones: IAdscripcionWithInstitucion[] = Array.isArray(response.data) ? response.data : [];

    // Fallback a mock si está vacío
    if (adscripciones.length === 0) {
      adscripciones = getMockAdscripciones();
    }

    // Guardar en cache
    CacheHelper.set(CACHE_KEY_ADSCRIPCIONES, adscripciones, CACHE_DURATION_1_DAY);

    logInfo('AdscripcionesService', 'Adscripciones recargadas y guardadas en cache', {
      count: adscripciones.length
    });

    return adscripciones;
  } catch (error) {
    logError('AdscripcionesService', `Error al recargar adscripciones: ${(error as Error).message}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getAdscripcionById = async (id: string): Promise<IAdscripcion | null> => {
  try {
    const response = await http.get<IAdscripcion>(`/api/adscripcion-web/${id}`);
    const adscripcion: IAdscripcion = response.data as IAdscripcion;
    return adscripcion;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const createAdscripcion = async (nombre: string, institucionId: number): Promise<IAdscripcion> => {
  try {
    const response = await http.post<IAdscripcion>('/api/adscripcion-web', { nombre, institucionId });
    const adscripcionCreada: IAdscripcion = response.data as IAdscripcion;
    return adscripcionCreada;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateAdscripcion = async (id: string, nombre: string, institucionId: number): Promise<IAdscripcion> => {
  try {
    const response = await http.patch<IAdscripcion>(`/api/adscripcion-web/${id}`, { nombre, institucionId });
    const adscripcionActualizada: IAdscripcion = response.data as IAdscripcion;
    return adscripcionActualizada;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const deleteAdscripcion = async (id: string): Promise<void> => {
  try {
    await http.delete(`/api/adscripcion-web/${id}`);
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};
