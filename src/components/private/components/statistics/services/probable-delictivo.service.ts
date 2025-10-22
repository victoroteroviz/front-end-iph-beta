/**
 * @file probable-delictivo.service.ts
 * @description Servicio para obtener estadísticas de Probable Delictivo
 * @module services/probable-delictivo
 *
 * @pattern SOLID, DRY, KISS
 * @uses httpHelper - Para peticiones HTTP
 * @uses logInfo, logError - Para logging estructurado
 *
 * @endpoints
 * - GET /api/probable-delictivo/getProbableDelictivoDiario?anio=2025&mes=10&dia=10
 * - GET /api/probable-delictivo/getProbableDelictivoMensual?anio=2025&mes=10
 * - GET /api/probable-delictivo/getProbableDelictivoAnual?anio=2025
 */

import { HttpHelper } from '../../../../../helper/http/http.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { API_BASE_URL } from '../../../../../config/env.config';

// Interfaces
import type {
  RespuestaProbableDelictivo,
  ParamsProbableDelictivoDiario,
  ParamsProbableDelictivoMensual,
  ParamsProbableDelictivoAnual
} from '../../../../../interfaces/probable-delictivo';

// Constantes del módulo
const MODULE_NAME = 'ProbableDelictivo';
const ENDPOINT_BASE = 'probable-delictivo';

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
 * @function getProbableDelictivoDiario
 * @description Obtiene estadísticas de Probable Delictivo para un día específico
 *
 * @param {ParamsProbableDelictivoDiario} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 * @param {number} params.mes - Mes a consultar (1-12)
 * @param {number} params.dia - Día a consultar (1-31)
 *
 * @returns {Promise<RespuestaProbableDelictivo>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getProbableDelictivoDiario({
 *   anio: 2025,
 *   mes: 10,
 *   dia: 10
 * });
 * console.log(estadisticas.data.totalConDetenido); // 8
 */
export const getProbableDelictivoDiario = async (
  params: ParamsProbableDelictivoDiario
): Promise<RespuestaProbableDelictivo> => {
  const { anio, mes, dia } = params;
  const url = `/api/${ENDPOINT_BASE}/getProbableDelictivoDiario?anio=${anio}&mes=${mes}&dia=${dia}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas diarias de Probable Delictivo', { anio, mes, dia });

  try {
    const response = await http.get<RespuestaProbableDelictivo>(url);
    const data: RespuestaProbableDelictivo = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas diarias de Probable Delictivo');
    }

    logInfo(MODULE_NAME, 'Estadísticas diarias obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas diarias de Probable Delictivo (${anio}-${mes}-${dia})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas diarias de Probable Delictivo');
  }
};

/**
 * @function getProbableDelictivoMensual
 * @description Obtiene estadísticas de Probable Delictivo para un mes específico
 *
 * @param {ParamsProbableDelictivoMensual} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 * @param {number} params.mes - Mes a consultar (1-12)
 *
 * @returns {Promise<RespuestaProbableDelictivo>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getProbableDelictivoMensual({
 *   anio: 2025,
 *   mes: 10
 * });
 * console.log(estadisticas.data.totalSinDetenido); // 95
 */
export const getProbableDelictivoMensual = async (
  params: ParamsProbableDelictivoMensual
): Promise<RespuestaProbableDelictivo> => {
  const { anio, mes } = params;
  const url = `/api/${ENDPOINT_BASE}/getProbableDelictivoMensual?anio=${anio}&mes=${mes}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas mensuales de Probable Delictivo', { anio, mes });

  try {
    const response = await http.get<RespuestaProbableDelictivo>(url);
    const data: RespuestaProbableDelictivo = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas mensuales de Probable Delictivo');
    }

    logInfo(MODULE_NAME, 'Estadísticas mensuales obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas mensuales de Probable Delictivo (${anio}-${mes})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas mensuales de Probable Delictivo');
  }
};

/**
 * @function getProbableDelictivoAnual
 * @description Obtiene estadísticas de Probable Delictivo para un año específico
 *
 * @param {ParamsProbableDelictivoAnual} params - Parámetros de consulta
 * @param {number} params.anio - Año a consultar
 *
 * @returns {Promise<RespuestaProbableDelictivo>} Respuesta con totales con y sin detenido
 *
 * @throws {Error} Si hay error en la petición o no se encuentran datos
 *
 * @example
 * const estadisticas = await getProbableDelictivoAnual({ anio: 2025 });
 * console.log(estadisticas.data.totalConDetenido); // 1140
 */
export const getProbableDelictivoAnual = async (
  params: ParamsProbableDelictivoAnual
): Promise<RespuestaProbableDelictivo> => {
  const { anio } = params;
  const url = `/api/${ENDPOINT_BASE}/getProbableDelictivoAnual?anio=${anio}`;

  logInfo(MODULE_NAME, 'Consultando estadísticas anuales de Probable Delictivo', { anio });

  try {
    const response = await http.get<RespuestaProbableDelictivo>(url);
    const data: RespuestaProbableDelictivo = response.data;

    if (!data || !data.status) {
      throw new Error(data?.message || 'No se encontraron estadísticas anuales de Probable Delictivo');
    }

    logInfo(MODULE_NAME, 'Estadísticas anuales obtenidas exitosamente', {
      totalConDetenido: data.data.totalConDetenido,
      totalSinDetenido: data.data.totalSinDetenido
    });

    return data;
  } catch (error) {
    logError(MODULE_NAME, error, `Error al obtener estadísticas anuales de Probable Delictivo (${anio})`);
    throw new Error((error as Error).message || 'Error desconocido al consultar estadísticas anuales de Probable Delictivo');
  }
};
