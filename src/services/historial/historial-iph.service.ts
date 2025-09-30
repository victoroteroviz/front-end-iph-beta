/**
 * Servicio para el manejo del historial de IPHs
 * 
 * @fileoverview Este servicio maneja todas las operaciones relacionadas con el historial
 * de Informes Policiales Homologados (IPH), incluyendo obtención de registros,
 * filtrado, paginación y actualización de estatus.
 * 
 * @version 1.0.0
 * @since 2024-01-29
 * 
 * @author Sistema IPH Frontend
 */

import { logInfo, logError, logWarning } from '../../helper/log/logger.helper';
import { HttpHelper } from '../../helper/http/http.helper';
import {
  API_BASE_URL
} from '../../config/env.config';
import { API_BASE_ROUTES } from '../../config/routes.config';

// Configuración del cliente HTTP
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL || '',
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json"
  }
});

// Interfaces
import type {
  HistorialIPHResponse,
  GetHistorialIPHParams,
  UpdateEstatusIPHParams,
  RegistroHistorialIPH,
  EstadisticasHistorial,
  FiltrosHistorial,
  PaginacionHistorial,
  UbicacionHistorialIPH,
  // Nuevas interfaces para API
  info,
  ResHistory,
  ResHistoryData,
  PaginatedResHistory,
  Coordenadas
} from '../../interfaces/components/historialIph.interface';

// Mock data imports
import {
  registrosMockData,
  getRegistrosPaginated,
  filterRegistros,
  getRegistroById,
  estadisticasMockData,
  getEstadisticasWithFilters
} from '../../mock/historial-iph';

// ==================== CONFIGURACIÓN ====================

/**
 * Configuración del servicio
 * @constant {boolean} USE_MOCK_DATA - Flag para usar datos mock en lugar del API
 */
const USE_MOCK_DATA = false; // Cambiado a false para usar datos reales del API

/**
 * Endpoints del API para historial IPH
 * @constant {Object} HISTORIAL_ENDPOINTS - Rutas del API
 */
const HISTORIAL_ENDPOINTS = {
  GET_HISTORIAL: '/historial',
  GET_ESTADISTICAS: '/historial/estadisticas',
  UPDATE_ESTATUS: '/historial/estatus',
  GET_DETALLE: '/historial'
} as const;

// ==================== FUNCIONES DE TRANSFORMACIÓN ====================

/**
 * Convierte coordenadas string a number para uso interno
 * @param {Coordenadas} coordenadas - Coordenadas en formato string
 * @returns {UbicacionHistorialIPH | undefined}
 */
const transformCoordenadasToUbicacion = (coordenadas?: Coordenadas): UbicacionHistorialIPH | undefined => {
  if (!coordenadas) return undefined;

  return {
    latitud: parseFloat(coordenadas.latitud),
    longitud: parseFloat(coordenadas.longitud)
  };
};

/**
 * Convierte ubicación interna a coordenadas string para API
 * @param {UbicacionHistorialIPH} ubicacion - Ubicación en formato number
 * @returns {Coordenadas | undefined}
 */
const transformUbicacionToCoordenadas = (ubicacion?: UbicacionHistorialIPH): Coordenadas | undefined => {
  if (!ubicacion) return undefined;

  return {
    latitud: ubicacion.latitud.toString(),
    longitud: ubicacion.longitud.toString()
  };
};

/**
 * Convierte ResHistory a RegistroHistorialIPH
 * @param {ResHistory} data - Datos del API
 * @returns {RegistroHistorialIPH}
 */
const transformResHistoryToRegistro = (data: ResHistory): RegistroHistorialIPH => {
  return {
    id: data.id,
    numeroReferencia: data.nReferencia,
    fechaCreacion: new Date(data.fechaCreacion),
    ubicacion: transformCoordenadasToUbicacion(data.ubicacion),
    tipoDelito: data.tipoDelito || 'No especificado',
    estatus: data.estatus,
    usuario: data.usuario,
    observaciones: '',
    archivosAdjuntos: []
  };
};

/**
 * Convierte ResHistoryData a RegistroHistorialIPH (compatibilidad)
 * @param {ResHistoryData} data - Datos del API
 * @returns {RegistroHistorialIPH}
 */
const transformResHistoryDataToRegistro = (data: ResHistoryData): RegistroHistorialIPH => {
  return transformResHistoryToRegistro(data);
};

/**
 * Convierte la respuesta del API '/api/iph-web' al formato interno HistorialIPHResponse
 * @param {any[]} apiResponse - Array de IPHs del API existente
 * @param {number} page - Página actual
 * @param {number} limit - Límite de registros por página
 * @param {FiltrosHistorial} filtros - Filtros aplicados
 * @returns {HistorialIPHResponse}
 */
const transformIPHArrayToHistorialResponse = (apiResponse: any[], page: number, limit: number, filtros: FiltrosHistorial = {}): HistorialIPHResponse => {
  // Aplicar filtros a los datos
  let filteredData = apiResponse;

  // Filtro por fecha de inicio
  if (filtros.fechaInicio) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.fecha_creacion);
      const filterDate = new Date(filtros.fechaInicio!);
      return itemDate >= filterDate;
    });
  }

  // Filtro por fecha de fin
  if (filtros.fechaFin) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.fecha_creacion);
      const filterDate = new Date(filtros.fechaFin!);
      return itemDate <= filterDate;
    });
  }

  // Filtro por estatus
  if (filtros.estatus) {
    filteredData = filteredData.filter(item =>
      item.estatus.nombre.toLowerCase().includes(filtros.estatus!.toLowerCase())
    );
  }

  // Filtro por tipo de delito
  if (filtros.tipoDelito) {
    filteredData = filteredData.filter(item =>
      item.tipo.nombre.toLowerCase().includes(filtros.tipoDelito!.toLowerCase())
    );
  }

  // Filtro por búsqueda general
  if (filtros.busqueda && filtros.busquedaPor) {
    const searchTerm = filtros.busqueda.toLowerCase();
    filteredData = filteredData.filter(item => {
      switch (filtros.busquedaPor) {
        case 'usuario':
          // Nota: No tenemos campo usuario en el API, usar referencia como fallback
          return item.n_referencia.toLowerCase().includes(searchTerm);
        case 'estatus':
          return item.estatus.nombre.toLowerCase().includes(searchTerm);
        case 'tipoDelito':
          return item.tipo.nombre.toLowerCase().includes(searchTerm);
        default:
          return false;
      }
    });
  }

  // Aplicar paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Transformar cada IPH a RegistroHistorialIPH
  const registros: RegistroHistorialIPH[] = paginatedData.map(item => transformIPHToRegistro(item));

  // Calcular estadísticas basadas en datos filtrados
  const estadisticas: EstadisticasHistorial = {
    total: filteredData.length,
    promedioPorDia: Math.round(filteredData.length / 30), // Estimación básica
    registroPorMes: Math.round(filteredData.length / 12), // Estimación básica
    estatusPorIph: calcularEstatusPorIph(registros)
  };

  // Crear paginación
  const totalPages = Math.ceil(filteredData.length / limit);
  const paginacion: PaginacionHistorial = {
    page,
    limit,
    total: filteredData.length,
    totalPages
  };

  return {
    registros,
    estadisticas,
    paginacion
  };
};

/**
 * Convierte un IPH del API existente a RegistroHistorialIPH
 * @param {any} iphData - Datos del IPH del API
 * @returns {RegistroHistorialIPH}
 */
const transformIPHToRegistro = (iphData: any): RegistroHistorialIPH => {
  return {
    id: iphData.id,
    numeroReferencia: iphData.n_referencia,
    fechaCreacion: new Date(iphData.fecha_creacion),
    ubicacion: {
      latitud: parseFloat(iphData.latitud),
      longitud: parseFloat(iphData.longitud)
    },
    tipoDelito: iphData.tipo.nombre,
    estatus: iphData.estatus.nombre,
    usuario: iphData.n_referencia, // Usar referencia como usuario por ahora
    observaciones: iphData.observaciones,
    archivosAdjuntos: []
  };
};

/**
 * Convierte info a HistorialIPHResponse
 * @param {info} apiResponse - Nueva respuesta del API
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @returns {HistorialIPHResponse}
 */
const transformInfoToHistorialResponse = (apiResponse: info, page: number = 1, limit: number = 10): HistorialIPHResponse => {
  const registros = apiResponse.iph.map(transformResHistoryToRegistro);

  // Calcular estadísticas básicas basadas en los datos recibidos
  const estadisticas: EstadisticasHistorial = {
    total: apiResponse.total,
    promedioPorDia: Math.round(apiResponse.total / 30), // Aproximación
    registroPorMes: apiResponse.total,
    estatusPorIph: calcularEstatusPorIph(registros)
  };

  const paginacion: PaginacionHistorial = {
    page: page,
    limit: limit,
    total: apiResponse.total,
    totalPages: apiResponse.paginas
  };

  return {
    registros,
    estadisticas,
    paginacion
  };
};

/**
 * Convierte PaginatedResHistory a HistorialIPHResponse (compatibilidad)
 * @param {PaginatedResHistory} apiResponse - Respuesta del API
 * @returns {HistorialIPHResponse}
 */
const transformPaginatedResponseToHistorialResponse = (apiResponse: PaginatedResHistory): HistorialIPHResponse => {
  const registros = apiResponse.data.map(transformResHistoryDataToRegistro);

  // Calcular estadísticas básicas basadas en los datos recibidos
  const estadisticas: EstadisticasHistorial = {
    total: apiResponse.pagination.total,
    promedioPorDia: Math.round(apiResponse.pagination.total / 30), // Aproximación
    registroPorMes: apiResponse.pagination.total,
    estatusPorIph: calcularEstatusPorIph(registros)
  };

  const paginacion: PaginacionHistorial = {
    page: apiResponse.pagination.page,
    limit: apiResponse.pagination.limit,
    total: apiResponse.pagination.total,
    totalPages: apiResponse.pagination.totalPages
  };

  return {
    registros,
    estadisticas,
    paginacion
  };
};

/**
 * Calcula estadísticas de estatus basadas en los registros
 * @param {RegistroHistorialIPH[]} registros - Registros para analizar
 * @returns {Array<{estatus: string, cantidad: number}>}
 */
const calcularEstatusPorIph = (registros: RegistroHistorialIPH[]): Array<{estatus: string, cantidad: number}> => {
  const estatusCount: Record<string, number> = {};

  registros.forEach(registro => {
    estatusCount[registro.estatus] = (estatusCount[registro.estatus] || 0) + 1;
  });

  return Object.entries(estatusCount).map(([estatus, cantidad]) => ({
    estatus,
    cantidad
  }));
};

// ==================== FUNCIONES MOCK ====================

/**
 * Simula delay de red para operaciones mock
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>}
 */
const mockDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtiene historial usando datos mock
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<HistorialIPHResponse>}
 */
const getHistorialMock = async (params: GetHistorialIPHParams): Promise<HistorialIPHResponse> => {
  logInfo('HistorialIPH Service', 'Obteniendo historial con datos mock', { params });
  
  await mockDelay(600);
  
  const { page = 1, limit = 10, filtros = {} } = params;
  
  // Aplicar filtros
  const registrosFiltrados = filterRegistros(registrosMockData, filtros);
  
  // Aplicar paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const registrosPaginados = registrosFiltrados.slice(startIndex, endIndex);
  
  // Calcular estadísticas basadas en filtros
  const estadisticas = getEstadisticasWithFilters(registrosFiltrados);
  
  // Crear paginación
  const totalPages = Math.ceil(registrosFiltrados.length / limit);
  const paginacion: PaginacionHistorial = {
    page,
    limit,
    total: registrosFiltrados.length,
    totalPages
  };
  
  const response: HistorialIPHResponse = {
    registros: registrosPaginados,
    estadisticas,
    paginacion
  };
  
  logInfo('HistorialIPH Service', 'Historial obtenido exitosamente (mock)', {
    totalRegistros: registrosPaginados.length,
    totalFiltrados: registrosFiltrados.length,
    pagina: page
  });
  
  return response;
};

/**
 * Actualiza estatus usando datos mock
 * @param {UpdateEstatusIPHParams} params - Parámetros de actualización
 * @returns {Promise<RegistroHistorialIPH>}
 */
const updateEstatusMock = async (params: UpdateEstatusIPHParams): Promise<RegistroHistorialIPH> => {
  logInfo('HistorialIPH Service', 'Actualizando estatus con datos mock', { params });
  
  await mockDelay(400);
  
  const registro = getRegistroById(params.id);
  
  if (!registro) {
    const error = `Registro con ID ${params.id} no encontrado`;
    logError('HistorialIPH Service', error);
    throw new Error(error);
  }
  
  // Simular actualización
  const registroActualizado: RegistroHistorialIPH = {
    ...registro,
    estatus: params.nuevoEstatus,
    observaciones: params.observaciones || registro.observaciones
  };
  
  logInfo('HistorialIPH Service', 'Estatus actualizado exitosamente (mock)', {
    id: params.id,
    nuevoEstatus: params.nuevoEstatus
  });
  
  return registroActualizado;
};

// ==================== FUNCIONES API ====================

/**
 * TODO: Implementar cuando el endpoint esté disponible
 * 
 * @description Obtiene el historial de IPHs desde el API
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<HistorialIPHResponse>}
 * 
 * @example
 * ```typescript
 * const response = await getHistorialFromAPI({
 *   page: 1,
 *   limit: 10,
 *   filtros: {
 *     estatus: 'Activo',
 *     fechaInicio: '2024-01-01'
 *   }
 * });
 * ```
 * 
 * @endpoint GET /api/historial
 * @permissions Requiere rol Admin o SuperAdmin
 * @ratelimit 100 requests/minute
 */
const getHistorialFromAPI = async (params: GetHistorialIPHParams): Promise<HistorialIPHResponse> => {
  logInfo('HistorialIPH Service', 'Obteniendo historial desde API', { params });
  
  try {
    const { page = 1, limit = 10, filtros = {} } = params;
    
    // Construir query parameters
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
    
    // Usar el endpoint existente de IPH que ya funciona
    const url = `${API_BASE_URL}/${API_BASE_ROUTES.IPH}`;

    const response = await http.get<any[]>(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
      }
    });

    // Transformar la respuesta del API al formato interno usando los datos del endpoint existente
    const transformedResponse = transformIPHArrayToHistorialResponse(response.data, page, limit, filtros);

    logInfo('HistorialIPH Service', 'Historial obtenido exitosamente desde API', {
      totalRegistros: transformedResponse.registros.length,
      pagina: page,
      totalAPI: response.data.total,
      totalPaginas: response.data.paginas
    });

    return transformedResponse;
    
  } catch (error) {
    logError('HistorialIPH Service', error, `Error obteniendo historial desde API - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * TODO: Implementar cuando el endpoint esté disponible
 * 
 * @description Actualiza el estatus de un IPH
 * @param {UpdateEstatusIPHParams} params - Parámetros de actualización
 * @returns {Promise<RegistroHistorialIPH>}
 * 
 * @example
 * ```typescript
 * const registroActualizado = await updateEstatusFromAPI({
 *   id: 123,
 *   nuevoEstatus: 'Inactivo',
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
        'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
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
 * Obtiene el historial de IPHs
 * Utiliza mock o API según la configuración
 * 
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<HistorialIPHResponse>}
 * 
 * @throws {Error} Si hay error en la consulta
 */
export const getHistorialIPH = async (params: GetHistorialIPHParams = {}): Promise<HistorialIPHResponse> => {
  try {
    if (USE_MOCK_DATA) {
      logWarning('HistorialIPH Service', 'Usando datos mock - cambiar USE_MOCK_DATA a false para API real');
      return await getHistorialMock(params);
    } else {
      return await getHistorialFromAPI(params);
    }
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en getHistorialIPH - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Actualiza el estatus de un registro IPH
 * Utiliza mock o API según la configuración
 * 
 * @param {UpdateEstatusIPHParams} params - Parámetros de actualización
 * @returns {Promise<RegistroHistorialIPH>}
 * 
 * @throws {Error} Si hay error en la actualización
 */
export const updateEstatusIPH = async (params: UpdateEstatusIPHParams): Promise<RegistroHistorialIPH> => {
  try {
    if (USE_MOCK_DATA) {
      logWarning('HistorialIPH Service', 'Usando datos mock - cambiar USE_MOCK_DATA a false para API real');
      return await updateEstatusMock(params);
    } else {
      return await updateEstatusFromAPI(params);
    }
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
    
    if (USE_MOCK_DATA) {
      await mockDelay(300);
      const registro = getRegistroById(id);
      return registro || null;
    } else {
      // TODO: Implementar llamada al API
      const url = `${API_BASE_URL}${API_BASE_ROUTES.HISTORIAL}${HISTORIAL_ENDPOINTS.GET_DETALLE}/${id}`;
      
      const response = await http.get<RegistroHistorialIPH>(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      
      return response.data;
    }
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
    
    if (USE_MOCK_DATA) {
      await mockDelay(200);
      return estadisticasMockData;
    } else {
      // TODO: Implementar llamada al API
      const url = `${API_BASE_URL}${API_BASE_ROUTES.HISTORIAL}${HISTORIAL_ENDPOINTS.GET_ESTADISTICAS}`;
      
      const response = await http.get<EstadisticasHistorial>(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });
      
      return response.data;
    }
  } catch (error) {
    logError('HistorialIPH Service', error, 'Error obteniendo estadísticas');
    throw error;
  }
};

// ==================== FUNCIONES AUXILIARES PARA NUEVAS INTERFACES ====================

/**
 * Obtiene historial en formato API (info)
 * Útil para componentes que trabajen directamente con la estructura del API
 *
 * @param {GetHistorialIPHParams} params - Parámetros de consulta
 * @returns {Promise<info>}
 */
export const getHistorialIPHRaw = async (params: GetHistorialIPHParams = {}): Promise<info> => {
  try {
    if (USE_MOCK_DATA) {
      logWarning('HistorialIPH Service', 'Simulando respuesta API con datos mock');

      // Simular respuesta del API con datos mock
      const historialResponse = await getHistorialMock(params);

      // Convertir respuesta interna a formato API (info)
      const mockApiResponse: info = {
        paginas: historialResponse.paginacion.totalPages,
        total: historialResponse.paginacion.total,
        iph: historialResponse.registros.map(registro => ({
          id: registro.id,
          nReferencia: registro.numeroReferencia,
          fechaCreacion: registro.fechaCreacion.toISOString(),
          ubicacion: transformUbicacionToCoordenadas(registro.ubicacion),
          tipoDelito: registro.tipoDelito,
          estatus: registro.estatus,
          usuario: registro.usuario
        }))
      };

      return mockApiResponse;
    } else {
      // Llamada real al API
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
          'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
        }
      });

      return response.data;
    }
  } catch (error) {
    logError('HistorialIPH Service', error, `Error en getHistorialIPHRaw - params: ${JSON.stringify(params)}`);
    throw error;
  }
};

/**
 * Convierte un RegistroHistorialIPH a ResHistory
 * Útil para envío de datos al API
 *
 * @param {RegistroHistorialIPH} registro - Registro interno
 * @returns {ResHistory}
 */
export const convertRegistroToResHistory = (registro: RegistroHistorialIPH): ResHistory => {
  return {
    id: registro.id,
    nReferencia: registro.numeroReferencia,
    fechaCreacion: registro.fechaCreacion.toISOString(),
    ubicacion: transformUbicacionToCoordenadas(registro.ubicacion),
    tipoDelito: registro.tipoDelito,
    estatus: registro.estatus,
    usuario: registro.usuario
  };
};

/**
 * Convierte ResHistory a RegistroHistorialIPH
 * Útil para recepción de datos del API
 *
 * @param {ResHistory} data - Datos del API
 * @returns {RegistroHistorialIPH}
 */
export const convertResHistoryToRegistro = (data: ResHistory): RegistroHistorialIPH => {
  return transformResHistoryToRegistro(data);
};

/**
 * Convierte un RegistroHistorialIPH a ResHistoryData (compatibilidad)
 * Útil para envío de datos al API
 *
 * @param {RegistroHistorialIPH} registro - Registro interno
 * @returns {ResHistoryData}
 */
export const convertRegistroToResHistoryData = (registro: RegistroHistorialIPH): ResHistoryData => {
  return convertRegistroToResHistory(registro);
};

/**
 * Convierte ResHistoryData a RegistroHistorialIPH (compatibilidad)
 * Útil para recepción de datos del API
 *
 * @param {ResHistoryData} data - Datos del API
 * @returns {RegistroHistorialIPH}
 */
export const convertResHistoryDataToRegistro = (data: ResHistoryData): RegistroHistorialIPH => {
  return transformResHistoryDataToRegistro(data);
};

// ==================== UTILIDADES EXPORT ====================

/**
 * Exporta las configuraciones y utilidades del servicio
 */
export const HistorialIPHServiceConfig = {
  USE_MOCK_DATA,
  HISTORIAL_ENDPOINTS,
  mockDelay,
  // Funciones de transformación principales
  transformCoordenadasToUbicacion,
  transformUbicacionToCoordenadas,
  transformInfoToHistorialResponse,
  transformResHistoryToRegistro,
  // Funciones de compatibilidad
  transformPaginatedResponseToHistorialResponse,
  transformResHistoryDataToRegistro
} as const;

/**
 * TODO LIST PARA IMPLEMENTACIÓN COMPLETA:
 * 
 * 1. ✅ Configurar endpoints del API real
 * 2. ⏳ Implementar autenticación y autorización completa
 * 3. ⏳ Agregar validación de roles (Admin/SuperAdmin only)
 * 4. ⏳ Implementar rate limiting en el cliente
 * 5. ⏳ Agregar cache para optimizar consultas frecuentes
 * 6. ⏳ Implementar retry logic para fallos de red
 * 7. ⏳ Agregar transformación de datos si el API usa formato diferente
 * 8. ⏳ Implementar paginación avanzada (cursor-based)
 * 9. ⏳ Agregar filtros avanzados y búsqueda full-text
 * 10. ⏳ Implementar webhooks para actualizaciones en tiempo real
 * 11. ⏳ Agregar exportación de datos (PDF, Excel)
 * 12. ⏳ Implementar auditoria de cambios de estatus
 * 
 * ENDPOINTS A IMPLEMENTAR:
 * - GET    /api/historial                    - Lista de registros con filtros
 * - GET    /api/historial/:id               - Detalle de un registro
 * - PUT    /api/historial/:id/estatus       - Actualizar estatus
 * - GET    /api/historial/estadisticas      - Estadísticas generales
 * - POST   /api/historial/export            - Exportar datos
 * - GET    /api/historial/tipos-delito      - Catálogo de tipos de delito
 * - GET    /api/historial/usuarios          - Lista de usuarios para filtros
 */