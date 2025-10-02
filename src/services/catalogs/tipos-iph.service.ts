import { API_BASE_URL } from "../../config/env.config";
import { HttpHelper } from "../../helper/http/http.helper";
import { logHttp, logInfo, logError } from "../../helper/log/logger.helper";

/**
 * Interface para los tipos de IPH
 */
export interface ITiposIph {
  id: number;
  nombre: string;
  descripcion: string;
}

/**
 * Instancia del HTTP Helper configurada para tipos de IPH
 */
const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json"
  }
});

/**
 * Obtiene todos los tipos de IPH disponibles
 * @returns Promise<ITiposIph[]> Lista de tipos de IPH
 * @throws Error si no se pueden obtener los tipos de IPH
 *
 * @example
 * ```typescript
 * try {
 *   const tiposIph = await getTiposIph();
 *   console.log('Tipos de IPH:', tiposIph);
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 * ```
 */
export const getTiposIph = async (): Promise<ITiposIph[]> => {
  const url: string = `/api/tipos-iph`;
  const startTime = performance.now();

  logInfo('TiposIphService', 'Iniciando petición GET tipos de IPH', {
    url,
    timestamp: new Date().toISOString(),
    method: 'GET'
  });

  try {
    const response = await http.get<ITiposIph[]>(url);
    const duration = performance.now() - startTime;

    // Log HTTP detallado
    logHttp('GET', url, response.status, duration, {
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseSize: JSON.stringify(response.data).length,
      ok: response.ok,
      statusText: response.statusText
    });

    const tiposIph: ITiposIph[] = response.data;

    if (!tiposIph || !Array.isArray(tiposIph)) {
      const errorContext = `URL: ${url}, Received: ${typeof tiposIph}, IsArray: ${Array.isArray(tiposIph)}`;
      logError('TiposIphService', 'Respuesta inválida del servidor', errorContext);
      logInfo('TiposIphService', 'Datos recibidos del servidor', {
        receivedData: tiposIph,
        isArray: Array.isArray(tiposIph),
        dataType: typeof tiposIph,
        url
      });
      throw new Error('No se encontraron tipos de IPH válidos');
    }

    logInfo('TiposIphService', 'Tipos de IPH obtenidos exitosamente', {
      totalTipos: tiposIph.length,
      tiposIds: tiposIph.map(t => t.id),
      tiposNombres: tiposIph.map(t => t.nombre),
      duration: Math.round(duration),
      url
    });

    return tiposIph;
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorContext = `GET ${url} - Duration: ${Math.round(duration)}ms`;

    logError('TiposIphService', error, errorContext);
    logInfo('TiposIphService', 'Detalles del error en petición', {
      url,
      method: 'GET',
      duration: Math.round(duration),
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
      timestamp: new Date().toISOString()
    });

    throw new Error((error as Error).message || 'Error desconocido al obtener tipos de IPH, habla con soporte');
  }
};

/**
 * Obtiene un tipo de IPH específico por ID
 * @param id - ID del tipo de IPH a obtener
 * @returns Promise<ITiposIph> Tipo de IPH encontrado
 * @throws Error si no se encuentra el tipo de IPH
 *
 * @example
 * ```typescript
 * try {
 *   const tipoIph = await getTipoIphById(1);
 *   console.log('Tipo de IPH:', tipoIph);
 * } catch (error) {
 *   console.error('Error:', error.message);
 * }
 * ```
 */
export const getTipoIphById = async (id: number): Promise<ITiposIph> => {
  if (!id || id <= 0) {
    const errorContext = `ID inválido: ${id} (tipo: ${typeof id})`;
    logError('TiposIphService', 'ID inválido proporcionado', errorContext);
    logInfo('TiposIphService', 'Validación de ID falló', {
      providedId: id,
      idType: typeof id
    });
    throw new Error('ID de tipo de IPH debe ser un número positivo');
  }

  const url: string = `/api/tipos-iph/${id}`;
  const startTime = performance.now();

  logInfo('TiposIphService', 'Iniciando petición GET tipo de IPH por ID', {
    url,
    id,
    timestamp: new Date().toISOString(),
    method: 'GET'
  });

  try {
    const response = await http.get<ITiposIph>(url);
    const duration = performance.now() - startTime;

    // Log HTTP detallado
    logHttp('GET', url, response.status, duration, {
      responseHeaders: Object.fromEntries(response.headers.entries()),
      responseSize: JSON.stringify(response.data).length,
      ok: response.ok,
      statusText: response.statusText
    });

    const tipoIph: ITiposIph = response.data;

    if (!tipoIph) {
      const errorContext = `Tipo de IPH no encontrado - ID: ${id}, URL: ${url}`;
      logError('TiposIphService', 'Tipo de IPH no encontrado', errorContext);
      logInfo('TiposIphService', 'Datos recibidos para tipo específico', {
        id,
        url,
        receivedData: tipoIph
      });
      throw new Error(`No se encontró el tipo de IPH con ID: ${id}`);
    }

    logInfo('TiposIphService', 'Tipo de IPH obtenido exitosamente', {
      id: tipoIph.id,
      nombre: tipoIph.nombre,
      descripcion: tipoIph.descripcion,
      duration: Math.round(duration),
      url
    });

    return tipoIph;
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorContext = `GET ${url} - ID: ${id} - Duration: ${Math.round(duration)}ms`;

    logError('TiposIphService', error, errorContext);
    logInfo('TiposIphService', 'Detalles del error en petición por ID', {
      url,
      method: 'GET',
      id,
      duration: Math.round(duration),
      errorMessage: (error as Error).message,
      errorStack: (error as Error).stack,
      timestamp: new Date().toISOString()
    });

    throw new Error((error as Error).message || `Error desconocido al obtener tipo de IPH con ID: ${id}, habla con soporte`);
  }
};