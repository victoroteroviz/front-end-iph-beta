/**
 * @file get-jc.service.ts
 * @description Servicio para obtener estadísticas de Justicia Cívica
 * @module services/estadisticas-jc
 *
 * @pattern SOLID, DRY, KISS
 * @uses httpHelper - Para peticiones HTTP
 * @uses logInfo, logError - Para logging estructurado
 *
 * @endpoints
 * - GET /api/estadisticas/getJusticiaCivicaDiaria/?anio=2025&mes=10&dia=10
 * - GET /api/estadisticas/getJusticiaCivicaMensual/?anio=2025&mes=10
 * - GET /api/estadisticas/getJusticiaCivicaAnual/?anio=2025
 */

import { HttpHelper } from '../../../../../helper/http/http.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { API_BASE_URL } from '../../../../../config/env.config';
import { API_BASE_ROUTES } from '../../../../../config/routes.config';

// Interfaces
import type {
  RespuestaJC,
  ParamsJCDiaria,
  ParamsJCMensual,
  ParamsJCAnual
} from '../../../../../interfaces/estadisticas-jc';

// Constantes del módulo
const MODULE_NAME = 'EstadisticasJC';

/**
 * Instancia singleton de HttpHelper configurada para este servicio
 */
const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
});

/**
 * @function getJusticiaCivicaDiaria
 * @description Obtiene estadísticas de Justicia Cívica para un día específico
 *
 * @param {ParamsJCDiaria} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 * @param {number} params.mes - Mes a consultar (1-12)
 * @param {number} params.dia - Día a consultar (1-31)
 *
 * @returns {Promise<RespuestaJC>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getJusticiaCivicaDiaria({
 *   anio: 2025,
 *   mes: 10,
 *   dia: 10
 * });
 * console.log(estadisticas.data.totalConDetenido); // 15
 */
export const getJusticiaCivicaDiaria = async (
  params: ParamsJCDiaria
): Promise<RespuestaJC> => {
  const { anio, mes, dia } = params;
  const url = `/${API_BASE_ROUTES.ESTADISTICAS}/getJusticiaCivicaDiaria/?anio=${anio}&mes=${mes}&dia=${dia}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas diarias de JC', { anio, mes, dia });

  try {
    const response = await http.get<RespuestaJC>(url);
    const data: RespuestaJC = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas diarias');
    }

    logInfo(MODULE_NAME, 'Estadísticas diarias obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas diarias (${anio}-${mes}-${dia})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas diarias');
  }
};

/**
 * @function getJusticiaCivicaMensual
 * @description Obtiene estadísticas de Justicia Cívica para un mes específico
 *
 * @param {ParamsJCMensual} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 * @param {number} params.mes - Mes a consultar (1-12)
 *
 * @returns {Promise<RespuestaJC>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getJusticiaCivicaMensual({
 *   anio: 2025,
 *   mes: 10
 * });
 * console.log(estadisticas.data.totalSinDetenido); // 120
 */
export const getJusticiaCivicaMensual = async (
  params: ParamsJCMensual
): Promise<RespuestaJC> => {
  const { anio, mes } = params;
  const url = `/${API_BASE_ROUTES.ESTADISTICAS}/getJusticiaCivicaMensual/?anio=${anio}&mes=${mes}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas mensuales de JC', { anio, mes });

  try {
    const response = await http.get<RespuestaJC>(url);
    const data: RespuestaJC = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas mensuales');
    }

    logInfo(MODULE_NAME, 'Estadísticas mensuales obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas mensuales (${anio}-${mes})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas mensuales');
  }
};

/**
 * @function getJusticiaCivicaAnual
 * @description Obtiene estadísticas de Justicia Cívica para un año específico
 *
 * @param {ParamsJCAnual} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 *
 * @returns {Promise<RespuestaJC>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getJusticiaCivicaAnual({ anio: 2025 });
 * console.log(estadisticas.data.totalConDetenido); // 1450
 */
export const getJusticiaCivicaAnual = async (
  params: ParamsJCAnual
): Promise<RespuestaJC> => {
  const { anio } = params;
  const url = `/${API_BASE_ROUTES.ESTADISTICAS}/getJusticiaCivicaAnual/?anio=${anio}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas anuales de JC', { anio });

  try {
    const response = await http.get<RespuestaJC>(url);
    const data: RespuestaJC = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas anuales');
    }

    logInfo(MODULE_NAME, 'Estadísticas anuales obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas anuales (${anio})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas anuales');
  }
};
