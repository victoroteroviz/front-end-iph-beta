/**
 * Servicio para el manejo del historial de IPHs
 *
 * @fileoverview Este servicio maneja todas las operaciones relacionadas con el historial
 * de Informes Policiales Homologados (IPH), incluyendo obtención de registros,
 * filtrado, paginación y actualización de estatus.
 *
 * @version 2.0.0
 * @since 2024-01-30
 *
 * @author Sistema IPH Frontend
 */

import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { HttpHelper } from '../../../../../helper/http/http.helper';
import { getStoredToken } from '../../../../../helper/security/jwt.helper';
import {
  API_BASE_URL
} from '../../../../../config/env.config';
import { API_BASE_ROUTES } from '../../../../../config/routes.config';
import { getValidStatuses } from '../../../../../config/status.config';

// Configuración del cliente HTTP
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL || '',
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json"
  }
});

const buildAuthHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

// Interfaces
import type {
  HistorialIPHResponse,
  GetHistorialIPHParams,
  UpdateEstatusIPHParams,
  RegistroHistorialIPH,
  EstadisticasHistorial,
  PaginacionHistorial,
  // Interfaces del API
  info,
  ResHistory,
  ResHistoryData,
  PaginatedResHistory
} from '../../../../../interfaces/components/historialIph.interface';

// Utilidades de transformación y validación
import {
  transformCoordenadasToUbicacion,
  transformUbicacionToCoordenadas,
  transformResHistoryToRegistro,
  transformResHistoryDataToRegistro,
  transformIPHToRegistro,
  calcularEstatusPorIph,
  transformInfoToHistorialResponse,
  transformPaginatedResponseToHistorialResponse,
  convertRegistroToResHistory,
  convertRegistroToResHistoryData,
  validateCoordinates,
  validateMonthYear,
  createMonthDateRange,
  buildQueryParams,
  DATE_VALIDATION,
  DEFAULT_PAGINATION
} from '../../../../../utils/historial-iph';

// Interfaces mejoradas para alinearse con el backend
export interface GetHistorialIPHParamsEnhanced extends Omit<GetHistorialIPHParams, 'filtros'> {
  page?: number;
  limit?: number;
  ordernaPor?: 'fecha_creacion' | 'estatus' | 'tipoDelito' | 'usuario' | 'n_referencia';
  orden?: 'ASC' | 'DESC';
  busqueda?: string;
  busquedaPor?: 'estatus' | 'tipoDelito' | 'usuario' | 'n_referencia';
  estatus?: string;
  tipoDelito?: string;
  usuario?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface EstadisticasParams {
  month?: number;
  year?: number;
}

export interface MonthlyIphStatistics {
  totalIph: number;
  averagePerDay: number;
  daysInMonth: number;
  month: number;
  year: number;
}

// ==================== CONFIGURACIÓN ====================

/**
 * Endpoints del API para historial IPH
 * @constant {Object} HISTORIAL_ENDPOINTS - Rutas del API
 */
const HISTORIAL_ENDPOINTS = {
  GET_HISTORIAL: '/historial',
  GET_IPH_HISTORY: '/historial/iph-history',
  GET_PAGINATED_HISTORY: '/historial/paginated',
  GET_ESTADISTICAS: '/historial/estatus-iph',
  GET_TIPOS_HIS: '/historial/tipos-his',
  UPDATE_ESTATUS: '/historial/estatus',
  GET_DETALLE: '/historial',
  GET_MONTHLY_STATS: '/historial/monthly-stats'
} as const;

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Obtiene opciones de estatus únicas desde el endpoint de estadísticas
 * @returns {Promise<string[]>}
 */
const getEstatusOptionsFromAPI = async (): Promise<string[]> => {
  try {
    logInfo('HistorialIPH Service', 'Obteniendo opciones de estatus desde endpoint de estadísticas');

    const url = `/${API_BASE_ROUTES.HISTORIAL}/estatus-iph`;

    const response = await http.get<{
      status: boolean;
      message: string;
      data: {
        total: number;
        registroPorMes: number;
        promedioPorDia: number;
        estatusPorIph: Array<{
          estatus: string;
          cantidad: number;
        }>;
      };
    }>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    // Verificar que la respuesta sea exitosa
    if (!response.data.status) {
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }

    // Extraer estatus desde las estadísticas
    const estatusArray = response.data.data.estatusPorIph
      .map(item => item.estatus)
      .filter(estatus => estatus && estatus.trim() !== '')
      .sort();

    logInfo('HistorialIPH Service', 'Opciones de estatus obtenidas exitosamente desde estadísticas', {
      totalOpciones: estatusArray.length,
      opciones: estatusArray,
      totalRegistros: response.data.data.total
    });

    return estatusArray;

  } catch (error) {
    logError('HistorialIPH Service', error, 'Error obteniendo opciones de estatus desde endpoint de estadísticas');

    // Fallback a valores del status.config.ts
    const validStatuses = getValidStatuses();
    return validStatuses;
  }
};

// ==================== FUNCIONES API ====================

/**
 * Obtiene el historial de IPHs desde el API
 *
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<HistorialIPHResponse>}
 *
 * @example
 * ```typescript
 * const response = await getHistorialFromAPI({
 *   page: 1,
 *   limit: 10,
 *   filtros: {
 *     estatus: 'Procesando',
 *     fechaInicio: '2024-01-01'
 *   }
 * });
 * ```
 *
 * @endpoint GET /api/historial/iph-history
 * @permissions Requiere rol Admin o SuperAdmin
 * @ratelimit 100 requests/minute
 */
const getHistorialFromAPI = async (params: GetHistorialIPHParams): Promise<HistorialIPHResponse> => {
  logInfo('HistorialIPH Service', 'Obteniendo historial desde API', { params });

  try {
    const { page = DEFAULT_PAGINATION.DEFAULT_PAGE, limit = DEFAULT_PAGINATION.ITEMS_PER_PAGE, filtros = {} } = params;

    // Convertir parámetros al formato mejorado
    const enhancedParams: GetHistorialIPHParamsEnhanced = {
      page,
      limit,
      ordernaPor: DEFAULT_PAGINATION.DEFAULT_ORDER_BY,
      orden: DEFAULT_PAGINATION.DEFAULT_ORDER,
      fechaInicio: filtros.fechaInicio,
      fechaFin: filtros.fechaFin,
      estatus: filtros.estatus,
      tipoDelito: filtros.tipoDelito,
      usuario: filtros.usuario,
      busqueda: filtros.busqueda,
      busquedaPor: filtros.busquedaPor || undefined
    };

    // Construir query parameters usando la función auxiliar
    const queryParams = buildQueryParams(enhancedParams);

    // Usar el endpoint correcto de historial
    const url = `/${API_BASE_ROUTES.HISTORIAL}/iph-history?${queryParams}`;

    logInfo('HistorialIPH Service', 'URL construida para solicitud', {
      url,
      queryParamsString: queryParams.toString(),
      enhancedParams
    });

    const response = await http.get<info>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    // Transformar la respuesta del API usando la función correcta para el formato 'info'
    const transformedResponse = await transformInfoToHistorialResponse(response.data, page, limit);

    logInfo('HistorialIPH Service', 'Historial obtenido exitosamente desde API', {
      totalRegistros: transformedResponse.registros.length,
      pagina: page,
      totalAPI: response.data.total,
      totalPaginas: response.data.paginas,
      filtrosAplicados: Object.keys(filtros).length
    });

    return transformedResponse;

  } catch (error) {
    logError('HistorialIPH Service', error, `Error obteniendo historial desde API - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Actualiza el estatus de un IPH
 *
 * @param {UpdateEstatusIPHParams} params - Parámetros de actualización
 * @returns {Promise<RegistroHistorialIPH>}
 *
 * @example
 * ```typescript
 * const registroActualizado = await updateEstatusFromAPI({
 *   id: 123,
 *   nuevoEstatus: 'Finalizado',
 *   observaciones: 'Caso cerrado por resolución'
 * });
 * ```
 *
 * @endpoint PUT /api/historial/estatus
 * @permissions Requiere rol Admin o SuperAdmin
 * @ratelimit 50 requests/minute
 */
const updateEstatusFromAPI = async (params: UpdateEstatusIPHParams): Promise<RegistroHistorialIPH> => {
  logInfo('HistorialIPH Service', 'Actualizando estatus desde API', { params });

  try {
    const url = `${API_BASE_URL}${API_BASE_ROUTES.HISTORIAL}${HISTORIAL_ENDPOINTS.UPDATE_ESTATUS}`;

    const body = {
      id: params.id,
      nuevo_estatus: params.nuevoEstatus,
      observaciones: params.observaciones
    };

    const response = await http.put<RegistroHistorialIPH>(url, body, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    logInfo('HistorialIPH Service', 'Estatus actualizado exitosamente desde API', {
      id: params.id,
      nuevoEstatus: params.nuevoEstatus
    });

    return response.data;

  } catch (error) {
    logError('HistorialIPH Service', error, `Error actualizando estatus desde API - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

// ==================== FUNCIONES PÚBLICAS ====================

/**
 * Obtiene el historial de IPHs desde el API
 *
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<HistorialIPHResponse>}
 *
 * @throws {Error} Si hay error en la consulta
 */
export const getHistorialIPH = async (params: GetHistorialIPHParams = {}): Promise<HistorialIPHResponse> => {
  try {
    return await getHistorialFromAPI(params);
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en getHistorialIPH - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Actualiza el estatus de un registro IPH
 *
 * @param {UpdateEstatusIPHParams} params - Parámetros de actualización
 * @returns {Promise<RegistroHistorialIPH>}
 *
 * @throws {Error} Si hay error en la actualización
 */
export const updateEstatusIPH = async (params: UpdateEstatusIPHParams): Promise<RegistroHistorialIPH> => {
  try {
    return await updateEstatusFromAPI(params);
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en updateEstatusIPH - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Obtiene un registro específico por ID
 *
 * @param {string} id - ID del registro
 * @returns {Promise<RegistroHistorialIPH | null>}
 */
export const getRegistroIPHById = async (id: string): Promise<RegistroHistorialIPH | null> => {
  try {
    logInfo('HistorialIPH Service', 'Obteniendo registro por ID', { id });

    const url = `${API_BASE_URL}${API_BASE_ROUTES.HISTORIAL}${HISTORIAL_ENDPOINTS.GET_DETALLE}/${id}`;

    const response = await http.get<RegistroHistorialIPH>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    return response.data;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error obteniendo registro por ID - id: ${id}`);
    throw error;
  }
};

/**
 * Obtiene estadísticas generales del historial
 *
 * @returns {Promise<EstadisticasHistorial>}
 */
export const getEstadisticasHistorial = async (): Promise<EstadisticasHistorial> => {
  try {
    logInfo('HistorialIPH Service', 'Obteniendo estadísticas generales');

    const url = `/${API_BASE_ROUTES.HISTORIAL}/estatus-iph`;

    const response = await http.get<{
      status: boolean;
      message: string;
      data: {
        total: number;
        registroPorMes: number;
        promedioPorDia: number;
        estatusPorIph: Array<{
          estatus: string;
          cantidad: number;
        }>;
      };
    }>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    // Verificar que la respuesta sea exitosa
    if (!response.data.status) {
      throw new Error(response.data.message || 'Error en la respuesta del servidor');
    }

    const { data } = response.data;

    const estadisticas: EstadisticasHistorial = {
      total: data.total,
      promedioPorDia: data.promedioPorDia,
      registroPorMes: data.registroPorMes,
      estatusPorIph: data.estatusPorIph
    };

    logInfo('HistorialIPH Service', 'Estadísticas generales obtenidas exitosamente desde API', {
      total: estadisticas.total,
      promedioPorDia: estadisticas.promedioPorDia,
      cantidadEstatus: estadisticas.estatusPorIph.length
    });

    return estadisticas;
  } catch (error) {
    logError('HistorialIPH Service', error, 'Error obteniendo estadísticas');
    throw error;
  }
};

// ==================== FUNCIONES AUXILIARES PARA INTERFACES DEL API ====================

/**
 * Obtiene historial en formato API (info)
 * Útil para componentes que trabajen directamente con la estructura del API
 *
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<info>}
 */
export const getHistorialIPHRaw = async (params: GetHistorialIPHParams = {}): Promise<info> => {
  try {
    const { page = 1, limit = 10, filtros = {} } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filtros.fechaInicio && { fecha_inicio: filtros.fechaInicio }),
      ...(filtros.fechaFin && { fecha_fin: filtros.fechaFin }),
      ...(filtros.estatus && { estatus: filtros.estatus }),
      ...(filtros.tipoDelito && { tipo_delito: filtros.tipoDelito }),
      ...(filtros.usuario && { usuario: filtros.usuario }),
      ...(filtros.busqueda && { busqueda: filtros.busqueda })
    });

    const url = `${API_BASE_URL}${API_BASE_ROUTES.HISTORIAL}${HISTORIAL_ENDPOINTS.GET_HISTORIAL}?${queryParams}`;

    const response = await http.get<info>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    return response.data;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en getHistorialIPHRaw - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Obtiene opciones de estatus desde datos reales del API
 * @returns {Promise<string[]>}
 */
export const getEstatusOptions = async (): Promise<string[]> => {
  return await getEstatusOptionsFromAPI();
};

/**
 * Obtiene historial paginado usando el formato PaginatedResHistory
 * Basado en el método getPaginatedIphHistory del backend
 *
 * @param {GetHistorialIPHParamsEnhanced} params - Parámetros de consulta mejorados
 * @returns {Promise<PaginatedResHistory>}
 */
export const getPaginatedHistorialIPH = async (params: GetHistorialIPHParamsEnhanced = {}): Promise<PaginatedResHistory> => {
  try {
    logInfo('HistorialIPH Service', 'Obteniendo historial paginado', { params });

    const queryParams = buildQueryParams(params);
    const url = `/${API_BASE_ROUTES.HISTORIAL}/paginated?${queryParams}`;

    const response = await http.get<PaginatedResHistory>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    logInfo('HistorialIPH Service', 'Historial paginado obtenido exitosamente desde API', {
      totalRegistros: response.data.data.length,
      pagina: response.data.pagination.page,
      totalAPI: response.data.pagination.total
    });

    return response.data;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en getPaginatedHistorialIPH - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Calcula el promedio mensual de IPH para un mes específico
 * Basado en el método calculateMonthlyAverage del backend
 *
 * @param {number} month - Mes (1-12), por defecto mes actual
 * @param {number} year - Año, por defecto año actual
 * @returns {Promise<number>}
 */
export const calculateMonthlyAverage = async (
  month: number = new Date().getMonth() + 1,
  year: number = new Date().getFullYear()
): Promise<number> => {
  try {
    validateMonthYear(month, year);

    logInfo('HistorialIPH Service', `Calculando promedio mensual para ${month}/${year}`);

    const url = `/${API_BASE_ROUTES.HISTORIAL}/monthly-stats`;
    const queryParams = new URLSearchParams({
      month: month.toString(),
      year: year.toString()
    });

    const response = await http.get<MonthlyIphStatistics>(`${url}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    return response.data.averagePerDay;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error calculando promedio mensual para ${month}/${year}`);
    throw error;
  }
};

/**
 * Obtiene estadísticas completas de IPH para un mes específico
 * Basado en el método getMonthlyIphStatistics del backend
 *
 * @param {EstadisticasParams} params - Parámetros de mes y año
 * @returns {Promise<MonthlyIphStatistics>}
 */
export const getMonthlyIphStatistics = async (params: EstadisticasParams = {}): Promise<MonthlyIphStatistics> => {
  try {
    const now = new Date();
    const targetMonth = params.month ?? now.getMonth() + 1;
    const targetYear = params.year ?? now.getFullYear();

    validateMonthYear(targetMonth, targetYear);

    logInfo('HistorialIPH Service', `Obteniendo estadísticas mensuales para ${targetMonth}/${targetYear}`);

    const url = `/${API_BASE_ROUTES.HISTORIAL}/monthly-stats`;
    const queryParams = new URLSearchParams({
      month: targetMonth.toString(),
      year: targetYear.toString()
    });

    const response = await http.get<MonthlyIphStatistics>(`${url}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    logInfo('HistorialIPH Service', 'Estadísticas mensuales obtenidas exitosamente desde API', {
      totalIph: response.data.totalIph,
      averagePerDay: response.data.averagePerDay,
      month: targetMonth,
      year: targetYear
    });

    return response.data;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error obteniendo estadísticas mensuales - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Obtiene estadísticas usando el formato del backend (getTiposHis)
 * Incluye totales, promedio por día, registros por mes y estatus por IPH
 *
 * @param {EstadisticasParams} params - Parámetros de mes y año
 * @returns {Promise<{ status: boolean; message: string; data: EstadisticasHistorial & { registroPorMes: number } }>}
 */
export const getTiposHistorial = async (params: EstadisticasParams = {}): Promise<{
  status: boolean;
  message: string;
  data: EstadisticasHistorial & { registroPorMes: number };
}> => {
  try {
    const now = new Date();
    const targetMonth = params.month ?? now.getMonth() + 1;
    const targetYear = params.year ?? now.getFullYear();

    logInfo('HistorialIPH Service', `Obteniendo tipos de historial para ${targetMonth}/${targetYear}`);

    const url = `/${API_BASE_ROUTES.HISTORIAL}/tipos-his`;
    const queryParams = new URLSearchParams({
      month: targetMonth.toString(),
      year: targetYear.toString()
    });

    const response = await http.get<{
      status: boolean;
      message: string;
      data: {
        total: number;
        registroPorMes: number;
        promedioPorDia: number;
        estatusPorIph: Array<{ estatus: string; cantidad: number }>;
      };
    }>(`${url}?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders()
      }
    });

    const transformedData = {
      status: response.data.status,
      message: response.data.message,
      data: {
        total: response.data.data.total,
        promedioPorDia: response.data.data.promedioPorDia,
        registroPorMes: response.data.data.registroPorMes,
        estatusPorIph: response.data.data.estatusPorIph
      }
    };

    logInfo('HistorialIPH Service', 'Tipos de historial obtenidos exitosamente desde API', {
      total: transformedData.data.total,
      registroPorMes: transformedData.data.registroPorMes,
      cantidadEstatus: transformedData.data.estatusPorIph.length
    });

    return transformedData;
  } catch (error) {
    logError('HistorialIPH Service', error, `Error obteniendo tipos de historial - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

// ==================== UTILIDADES EXPORT ====================

/**
 * Exporta las configuraciones y utilidades del servicio
 */
export const HistorialIPHServiceConfig = {
  DEFAULT_PAGINATION,
  HISTORIAL_ENDPOINTS,
  DATE_VALIDATION,
  // Funciones de validación
  validateMonthYear,
  validateCoordinates,
  createMonthDateRange,
  buildQueryParams,
  // Funciones de transformación principales
  transformCoordenadasToUbicacion,
  transformUbicacionToCoordenadas,
  transformInfoToHistorialResponse,
  transformResHistoryToRegistro,
  transformIPHToRegistro,
  // Funciones de compatibilidad
  transformPaginatedResponseToHistorialResponse,
  transformResHistoryDataToRegistro,
  // Funciones de conversión
  convertRegistroToResHistory,
  convertRegistroToResHistoryData
} as const;
