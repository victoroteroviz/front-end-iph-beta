/**
 * Utilidades de transformación de datos para el historial de IPH
 *
 * @fileoverview Funciones para transformar datos entre diferentes formatos
 * del API y las interfaces internas del sistema.
 *
 * @version 1.0.0
 * @since 2024-01-30
 */

import type {
  RegistroHistorialIPH,
  UbicacionHistorialIPH,
  ResHistory,
  ResHistoryData,
  Coordenadas,
  EstadisticasHistorial,
  PaginacionHistorial,
  HistorialIPHResponse,
  info,
  PaginatedResHistory
} from '../../interfaces/components/historialIph.interface';

// ==================== COORDENADAS ====================

/**
 * Convierte coordenadas string a number para uso interno
 * @param {Coordenadas} coordenadas - Coordenadas en formato string
 * @returns {UbicacionHistorialIPH | undefined}
 */
export const transformCoordenadasToUbicacion = (coordenadas?: Coordenadas): UbicacionHistorialIPH | undefined => {
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
export const transformUbicacionToCoordenadas = (ubicacion?: UbicacionHistorialIPH): Coordenadas | undefined => {
  if (!ubicacion) return undefined;

  return {
    latitud: ubicacion.latitud.toString(),
    longitud: ubicacion.longitud.toString()
  };
};

// ==================== REGISTROS ====================

/**
 * Convierte ResHistory a RegistroHistorialIPH
 * @param {ResHistory} data - Datos del API
 * @returns {RegistroHistorialIPH}
 */
export const transformResHistoryToRegistro = (data: ResHistory): RegistroHistorialIPH => {
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
export const transformResHistoryDataToRegistro = (data: ResHistoryData): RegistroHistorialIPH => {
  return transformResHistoryToRegistro(data);
};

/**
 * Convierte RegistroHistorialIPH a ResHistory
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
 * Convierte RegistroHistorialIPH a ResHistoryData (compatibilidad)
 * @param {RegistroHistorialIPH} registro - Registro interno
 * @returns {ResHistoryData}
 */
export const convertRegistroToResHistoryData = (registro: RegistroHistorialIPH): ResHistoryData => {
  return convertRegistroToResHistory(registro);
};

// Interface para datos del IPH del API
interface IPHDataFromAPI {
  id: number | string;
  n_referencia: string;
  fecha_creacion: string;
  longitud?: string;
  latitud?: string;
  tipo?: { nombre: string };
  estatus?: { nombre: string };
  finalizaciones?: { delito: string };
  primer_respondiente?: {
    usuario?: {
      nombre: string;
      primer_apellido?: string;
      segundo_apellido?: string;
    };
  };
  observaciones?: string;
}

/**
 * Valida coordenadas geográficas
 * @param {string} longitud - Longitud como string
 * @param {string} latitud - Latitud como string
 * @returns {boolean} True si las coordenadas son válidas
 */
export const validateCoordinates = (longitud?: string, latitud?: string): boolean => {
  return !!(longitud &&
    latitud &&
    longitud.trim() !== '' &&
    latitud.trim() !== '' &&
    !isNaN(parseFloat(longitud)) &&
    !isNaN(parseFloat(latitud)));
};

/**
 * Convierte un IPH del API existente a RegistroHistorialIPH
 * @param {IPHDataFromAPI} iphData - Datos del IPH del API
 * @returns {RegistroHistorialIPH}
 */
export const transformIPHToRegistro = (iphData: IPHDataFromAPI): RegistroHistorialIPH => {
  // Validar coordenadas antes de convertir
  const hasValidCoordinates = validateCoordinates(iphData.longitud, iphData.latitud);

  return {
    id: typeof iphData.id === 'number' ? iphData.id.toString() : iphData.id,
    numeroReferencia: iphData.n_referencia || '',
    fechaCreacion: iphData.fecha_creacion ? new Date(iphData.fecha_creacion) : new Date(),
    ubicacion: hasValidCoordinates && iphData.latitud && iphData.longitud ? {
      latitud: parseFloat(iphData.latitud.trim()),
      longitud: parseFloat(iphData.longitud.trim())
    } : undefined,
    tipoDelito: iphData.tipo?.nombre || iphData.finalizaciones?.delito || 'N/D',
    estatus: iphData.estatus?.nombre || 'N/D',
    usuario: iphData.primer_respondiente?.usuario ?
      `${iphData.primer_respondiente.usuario.nombre} ${iphData.primer_respondiente.usuario.primer_apellido || ''} ${iphData.primer_respondiente.usuario.segundo_apellido || ''}`.trim() :
      iphData.n_referencia || 'N/D',
    observaciones: iphData.observaciones || '',
    archivosAdjuntos: []
  };
};

// ==================== ESTADÍSTICAS ====================

/**
 * Calcula estadísticas de estatus basadas en los registros
 * @param {RegistroHistorialIPH[]} registros - Registros para analizar
 * @returns {Array<{estatus: string, cantidad: number}>}
 */
export const calcularEstatusPorIph = (registros: RegistroHistorialIPH[]): Array<{estatus: string, cantidad: number}> => {
  const estatusCount: Record<string, number> = {};

  registros.forEach(registro => {
    estatusCount[registro.estatus] = (estatusCount[registro.estatus] || 0) + 1;
  });

  return Object.entries(estatusCount).map(([estatus, cantidad]) => ({
    estatus,
    cantidad
  }));
};

// ==================== RESPUESTAS API ====================

/**
 * Convierte info a HistorialIPHResponse
 * @param {info} apiResponse - Nueva respuesta del API
 * @param {number} page - Página actual
 * @param {number} limit - Elementos por página
 * @returns {Promise<HistorialIPHResponse>}
 */
export const transformInfoToHistorialResponse = async (apiResponse: info, page: number = 1, limit: number = 10): Promise<HistorialIPHResponse> => {
  const registros = apiResponse.iph.map(transformResHistoryToRegistro);

  // NO obtener estadísticas aquí - se obtienen independientemente desde /estatus-iph
  // Solo transformar datos de tabla del endpoint /iph-history
  const estadisticas: EstadisticasHistorial = {
    total: 0,
    promedioPorDia: 0,
    registroPorMes: 0,
    estatusPorIph: []
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
export const transformPaginatedResponseToHistorialResponse = (apiResponse: PaginatedResHistory): HistorialIPHResponse => {
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
