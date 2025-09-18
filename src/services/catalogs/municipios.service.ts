
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
import { CacheHelper } from "../../helper/cache/cache.helper";
import { logInfo, logError } from "../../helper/log/logger.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";

//+ Interfaces
import type { IMunicipioRequest, IMunicipios, IMunicipiosAllData } from "../../interfaces/catalogs/municipios.interface";

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
const CACHE_KEY_MUNICIPIOS = 'municipios_list';
const CACHE_DURATION_1_DAY = 24 * 60 * 60 * 1000; // 1 día en milisegundos

// Datos mock como fallback
const getMockMunicipios = (): IMunicipios[] => [
  {
    id: '1',
    nombre: 'Guadalajara',
    codigo: 'GDL',
    estado: {
      id: 1,
      nombre: 'Jalisco',
      codigo: 'JAL',
      is_active: true,
      fecha_creacion: '2024-01-01T00:00:00Z',
      fecha_actualizacion: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '2',
    nombre: 'Zapopan',
    codigo: 'ZAP',
    estado: {
      id: 1,
      nombre: 'Jalisco',
      codigo: 'JAL',
      is_active: true,
      fecha_creacion: '2024-01-01T00:00:00Z',
      fecha_actualizacion: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '3',
    nombre: 'Monterrey',
    codigo: 'MTY',
    estado: {
      id: 2,
      nombre: 'Nuevo León',
      codigo: 'NL',
      is_active: true,
      fecha_creacion: '2024-01-01T00:00:00Z',
      fecha_actualizacion: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '4',
    nombre: 'San Pedro Garza García',
    codigo: 'SPG',
    estado: {
      id: 2,
      nombre: 'Nuevo León',
      codigo: 'NL',
      is_active: true,
      fecha_creacion: '2024-01-01T00:00:00Z',
      fecha_actualizacion: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: '5',
    nombre: 'Ciudad de México',
    codigo: 'CDMX',
    estado: {
      id: 3,
      nombre: 'Ciudad de México',
      codigo: 'CDMX',
      is_active: true,
      fecha_creacion: '2024-01-01T00:00:00Z',
      fecha_actualizacion: '2024-01-01T00:00:00Z'
    }
  }
];

/**
 * Obtiene la lista de municipios con cache de 1 día
 * @returns Promise<IMunicipios[]>
 */
export const getMunicipios = async (): Promise<IMunicipios[]> => {
  logInfo('MunicipiosService', '🔄 Iniciando getMunicipios()');

  try {
    // Intentar obtener del cache primero
    const cachedMunicipios = CacheHelper.get<IMunicipios[]>(CACHE_KEY_MUNICIPIOS);

    if (cachedMunicipios && cachedMunicipios.length > 0) {
      logInfo('MunicipiosService', '✅ Municipios obtenidos del cache', { count: cachedMunicipios.length });
      return cachedMunicipios;
    } else if (cachedMunicipios && cachedMunicipios.length === 0) {
      logInfo('MunicipiosService', '🧹 Cache contiene array vacío, limpiando...');
      CacheHelper.remove(CACHE_KEY_MUNICIPIOS);
    }

    // Si no hay cache, hacer petición al API
    logInfo('MunicipiosService', '🌐 Cache vacío, obteniendo municipios del API: /api/municipios-web');
    const response = await http.get<IMunicipiosAllData>('/api/municipios-web');

    logInfo('MunicipiosService', '📦 Respuesta del API recibida', {
      url: '/api/municipios-web',
      statusCode: response.status,
      dataType: typeof response.data,
      isObject: typeof response.data === 'object' && response.data !== null,
      hasData: response.data && 'data' in response.data,
      isHTML: typeof response.data === 'string' && (response.data as string).includes('<!doctype html>'),
      dataPreview: typeof response.data === 'string' ? (response.data as string).substring(0, 100) + '...' : response.data
    });

    // Validar que la respuesta no sea HTML
    if (typeof response.data === 'string' && (response.data as string).includes('<!doctype html>')) {
      throw new Error('El servidor devolvió HTML en lugar de JSON. Posible problema de routing o CORS.');
    }

    // Analizar estructura de la respuesta
    logInfo('MunicipiosService', '🔍 Analizando estructura de respuesta', {
      responseType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasDataProperty: response.data && 'data' in response.data,
      keys: Object.keys(response.data || {}),
      firstItems: Array.isArray(response.data) ? response.data.slice(0, 2) : 'N/A'
    });

    // Extraer array de municipios - adaptarse a diferentes estructuras
    let municipios: IMunicipios[] = [];

    if (Array.isArray(response.data)) {
      // Si la respuesta es directamente un array
      municipios = response.data;
      logInfo('MunicipiosService', '📋 Respuesta es array directo');
    } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      // Si la respuesta tiene estructura { data: [...] }
      const municipiosData = response.data as IMunicipiosAllData;
      municipios = municipiosData.data || [];
      logInfo('MunicipiosService', '📋 Respuesta tiene propiedad data');
    } else {
      logError('MunicipiosService', '❌ Estructura de respuesta no reconocida');
    }

    // Si no hay municipios del API, usar datos mock como fallback
    if (municipios.length === 0) {
      logInfo('MunicipiosService', '🔄 API devolvió array vacío, usando datos mock como fallback');
      municipios = getMockMunicipios();
    }

    // Guardar en cache por 1 día
    CacheHelper.set(CACHE_KEY_MUNICIPIOS, municipios, CACHE_DURATION_1_DAY);

    logInfo('MunicipiosService', '💾 Municipios obtenidos del API y guardados en cache', {
      count: municipios.length,
      cached: true,
      sample: municipios.slice(0, 2),
      source: municipios.length === getMockMunicipios().length ? 'mock_fallback' : 'api'
    });

    return municipios;
  } catch (error) {
    logError('MunicipiosService', `❌ Error al obtener municipios: ${(error as Error).message}`);
    logError('MunicipiosService', `Detalles del error: ${JSON.stringify(error)}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

/**
 * Fuerza la recarga de municipios desde el API (ignora cache)
 * @returns Promise<IMunicipios[]>
 */
export const refreshMunicipios = async (): Promise<IMunicipios[]> => {
  try {
    logInfo('MunicipiosService', 'Forzando recarga de municipios desde API');

    // Limpiar cache existente
    CacheHelper.remove(CACHE_KEY_MUNICIPIOS);

    // Obtener datos frescos
    const response = await http.get<IMunicipiosAllData>('/api/municipios-web');
    const municipiosData = response.data as IMunicipiosAllData;
    const municipios: IMunicipios[] = municipiosData.data || [];

    // Guardar en cache
    CacheHelper.set(CACHE_KEY_MUNICIPIOS, municipios, CACHE_DURATION_1_DAY);

    logInfo('MunicipiosService', 'Municipios recargados y guardados en cache', {
      count: municipios.length
    });

    return municipios;
  } catch (error) {
    logError('MunicipiosService', `Error al recargar municipios: ${(error as Error).message}`);
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getMunicipioById = async (id: string): Promise<IMunicipios | null> => {
  try {
    const response = await http.get<IMunicipios>(`/api/municipios-web/${id}`);
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const createMunicipio = async (municipio: IMunicipioRequest): Promise<IMunicipios> => {
  try {
    const response = await http.post<IMunicipios>('/api/municipios-web', { ...municipio });
    const municipioCreado: IMunicipios = response.data as IMunicipios;
    return municipioCreado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const updateMunicipio = async (id: string, municipio: IMunicipioRequest): Promise<IMunicipios | null> => {
  try {
    const response = await http.put<IMunicipios>(`/api/municipios-web/${id}`, { ...municipio });
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const deleteMunicipio = async (id: string): Promise<boolean> => {
  try {
    await http.delete(`/api/municipios-web/${id}`);
    return true;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};