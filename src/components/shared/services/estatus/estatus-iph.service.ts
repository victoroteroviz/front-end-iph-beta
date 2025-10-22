/**
 * Servicio para obtener estad�sticas de estatus de IPH
 * Implementa patr�n Singleton y principios SOLID
 */

import httpHelper from '../../../../helper/http/http.helper';
import { API_BASE_URL } from '../../../../config/env.config';
import { logInfo, logError } from '../../../../helper/log/logger.helper';
import type { ResEstatusIph, ResHistorialIphResponse, QueryHistorialDto, ResHistory } from '../../../../interfaces/estatus-iph';

/**
 * Configuraci�n del servicio
 */
const ESTATUS_IPH_ENDPOINT = '/api/historial/estatus-iph';
const IPH_HISTORY_ENDPOINT = '/api/historial/iph-history';

/**
 * Servicio para obtener estad�sticas de estatus de IPH
 *
 * @example
 * ```typescript
 * import { getEstatusIph } from '@/services/estatus-iph/estatus-iph.service';
 *
 * const estadisticas = await getEstatusIph();
 * console.log('Total de IPH:', estadisticas.data.total);
 * console.log('Promedio por d�a:', estadisticas.data.promedioPorDia);
 * ```
 */
export const getEstatusIph = async (): Promise<ResEstatusIph> => {
  try {
    logInfo('EstatusIphService', 'Iniciando petici�n para obtener estad�sticas de estatus IPH');

    // Configurar el helper HTTP con la URL base
    httpHelper.updateConfig({
      baseURL: API_BASE_URL
    });

    const response = await httpHelper.get<ResEstatusIph>(ESTATUS_IPH_ENDPOINT, {
      includeAuth: true,
      timeout: 15000,
      retries: 2
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const { data: estatusData } = response;

    // Validar estructura de respuesta
    if (!estatusData || typeof estatusData.status === 'undefined') {
      throw new Error('Respuesta del servidor inv�lida: estructura incorrecta');
    }

    if (!estatusData.status) {
      throw new Error(estatusData.message || 'Error en el servidor al obtener estad�sticas de estatus');
    }

    // Validar datos obligatorios
    if (!estatusData.data) {
      throw new Error('No se recibieron datos de estad�sticas de estatus');
    }

    const { total, promedioPorDia, registroPorMes, estatusPorIph } = estatusData.data;

    // Validar tipos de datos
    if (typeof total !== 'number' || typeof promedioPorDia !== 'number' || typeof registroPorMes !== 'number') {
      throw new Error('Tipos de datos incorrectos en la respuesta del servidor');
    }

    if (!Array.isArray(estatusPorIph)) {
      throw new Error('El campo estatusPorIph debe ser un array');
    }

    // Validar estructura de cada elemento de estatusPorIph
    estatusPorIph.forEach((item, index) => {
      if (!item || typeof item.estatus !== 'string' || typeof item.cantidad !== 'number') {
        throw new Error(`Elemento inv�lido en estatusPorIph[${index}]: debe contener estatus (string) y cantidad (number)`);
      }
    });

    logInfo('EstatusIphService', 'Estad�sticas de estatus IPH obtenidas exitosamente', {
      total,
      promedioPorDia,
      registroPorMes,
      cantidadEstatus: estatusPorIph.length,
      duracion: `${response.duration}ms`
    });

    return estatusData;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    logError('EstatusIphService', error, 'Error al obtener estadísticas de estatus IPH');

    // Re-lanzar el error para que el componente pueda manejarlo
    throw new Error(`Error al obtener estad�sticas de estatus IPH: ${errorMessage}`);
  }
};

/**
 * Servicio para obtener historial de IPH con filtros y paginación
 *
 * @example
 * ```typescript
 * import { getIphHistory } from '@/services/estatus-iph/estatus-iph.service';
 *
 * const filtros = {
 *   pagina: 1,
 *   estatus: 'Activo',
 *   ordernaPor: 'fecha_creacion',
 *   orden: 'DESC'
 * };
 *
 * const historial = await getIphHistory(filtros);
 * console.log('Total de registros:', historial.meta.total);
 * console.log('Datos:', historial.data);
 * ```
 */
export const getIphHistory = async (query: QueryHistorialDto): Promise<ResHistorialIphResponse> => {
  try {
    logInfo('EstatusIphService', 'Iniciando petición para obtener historial de IPH', query);

    // Configurar el helper HTTP con la URL base
    httpHelper.updateConfig({
      baseURL: API_BASE_URL
    });

    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();

    // Parámetros requeridos
    queryParams.append('pagina', query.pagina.toString());

    // Parámetros opcionales
    if (query.ordernaPor) queryParams.append('ordernaPor', query.ordernaPor);
    if (query.orden) queryParams.append('orden', query.orden);
    if (query.busqueda) queryParams.append('busqueda', query.busqueda);
    if (query.busquedaPor) queryParams.append('busquedaPor', query.busquedaPor);
    if (query.estatus) queryParams.append('estatus', query.estatus);
    if (query.tipoDelito) queryParams.append('tipoDelito', query.tipoDelito);
    if (query.usuario) queryParams.append('usuario', query.usuario);
    if (query.fechaInicio) queryParams.append('fechaInicio', query.fechaInicio);
    if (query.fechaFin) queryParams.append('fechaFin', query.fechaFin);

    const url = `${IPH_HISTORY_ENDPOINT}?${queryParams.toString()}`;

    const response = await httpHelper.get<ResHistory[]>(url, {
      includeAuth: true,
      timeout: 15000,
      retries: 2
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const { data: historialData } = response;

    // Validar que recibimos un array
    if (!Array.isArray(historialData)) {
      throw new Error('Respuesta del servidor inválida: se esperaba un array de registros');
    }

    // Validar estructura de cada registro
    historialData.forEach((item, index) => {
      if (!item || typeof item.nReferencia !== 'string' || typeof item.fechaCreacion !== 'string') {
        throw new Error(`Elemento inválido en posición ${index}: estructura incorrecta`);
      }

      // Validar campos requeridos (tipoDelito es opcional)
      if (typeof item.estatus !== 'string' || typeof item.usuario !== 'string') {
        throw new Error(`Elemento inválido en posición ${index}: campos requeridos faltantes`);
      }

      // Validar tipoDelito si existe
      if (item.tipoDelito !== undefined && typeof item.tipoDelito !== 'string') {
        throw new Error(`Elemento inválido en posición ${index}: tipoDelito debe ser string`);
      }

      // Validar ubicación si existe
      if (item.ubicacion) {
        // Las coordenadas vienen como strings del backend, validar que sean strings válidos
        if (typeof item.ubicacion.longitud !== 'string' || typeof item.ubicacion.latitud !== 'string') {
          throw new Error(`Elemento inválido en posición ${index}: coordenadas deben ser strings`);
        }

        // Validar que las coordenadas sean números válidos en formato string
        const longitud = parseFloat(item.ubicacion.longitud);
        const latitud = parseFloat(item.ubicacion.latitud);

        if (isNaN(longitud) || isNaN(latitud)) {
          throw new Error(`Elemento inválido en posición ${index}: coordenadas no son números válidos`);
        }
      }
    });

    // Como el backend actual devuelve solo el array, simularemos los metadatos de paginación
    // TODO: Actualizar cuando el backend incluya metadatos de paginación
    const itemsPorPagina = 10;

    // Lógica mejorada: si recibimos menos elementos que itemsPorPagina,
    // significa que estamos en la última página
    const esUltimaPagina = historialData.length < itemsPorPagina;

    // Calcular total estimado basado en si es la última página o no
    const totalEstimado = esUltimaPagina
      ? ((query.pagina - 1) * itemsPorPagina) + historialData.length  // Página final: cálculo exacto
      : query.pagina * itemsPorPagina + 1; // Página intermedia: asumimos que hay más

    const totalPaginas = Math.ceil(totalEstimado / itemsPorPagina);

    const responseWithMeta: ResHistorialIphResponse = {
      status: true,
      message: 'Historial de IPH obtenido exitosamente',
      data: historialData,
      meta: {
        total: totalEstimado,
        pagina: query.pagina,
        itemsPorPagina,
        totalPaginas
      }
    };

    logInfo('EstatusIphService', 'Historial de IPH obtenido exitosamente', {
      totalRegistros: historialData.length,
      pagina: query.pagina,
      duracion: `${response.duration}ms`
    });

    return responseWithMeta;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    logError('EstatusIphService', error, 'Error al obtener historial de IPH');

    // Re-lanzar el error para que el componente pueda manejarlo
    throw new Error(`Error al obtener historial de IPH: ${errorMessage}`);
  }
};

/**
 * Servicio para obtener opciones de estatus disponibles
 *
 * @example
 * ```typescript
 * import { getEstatusOptions } from '@/services/estatus-iph/estatus-iph.service';
 *
 * const opciones = await getEstatusOptions();
 * console.log('Estatus disponibles:', opciones);
 * ```
 */
export const getEstatusOptions = async (): Promise<string[]> => {
  try {
    logInfo('EstatusIphService', 'Iniciando petición para obtener opciones de estatus');

    // Configurar el helper HTTP con la URL base
    httpHelper.updateConfig({
      baseURL: API_BASE_URL
    });

    // Endpoint para obtener opciones de estatus
    const response = await httpHelper.get<{status: boolean, data: string[]}>('/api/historial/estatus-options', {
      includeAuth: true,
      timeout: 10000,
      retries: 2
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const { data: estatusData } = response;

    // Validar estructura de respuesta
    if (!estatusData || typeof estatusData.status === 'undefined') {
      throw new Error('Respuesta del servidor inválida: estructura incorrecta');
    }

    if (!estatusData.status) {
      throw new Error('Error en el servidor al obtener opciones de estatus');
    }

    // Validar que recibimos un array
    if (!Array.isArray(estatusData.data)) {
      throw new Error('Respuesta del servidor inválida: se esperaba un array de opciones');
    }

    // Validar que todos los elementos son strings
    estatusData.data.forEach((item, index) => {
      if (typeof item !== 'string') {
        throw new Error(`Elemento inválido en posición ${index}: debe ser string`);
      }
    });

    logInfo('EstatusIphService', 'Opciones de estatus obtenidas exitosamente', {
      totalOpciones: estatusData.data.length,
      opciones: estatusData.data,
      duracion: `${response.duration}ms`
    });

    return estatusData.data;

  } catch (error) {
    logError('EstatusIphService', error, 'Error al obtener opciones de estatus');

    // Fallback a opciones estáticas si hay error de red
    logInfo('EstatusIphService', 'Usando opciones de estatus por defecto como fallback');

    // Opciones por defecto basadas en los estatus más comunes
    return [
      'Activo',
      'Inactivo',
      'Pendiente',
      'Completado',
      'En Proceso',
      'Cancelado',
      'N/D'
    ];
  }
};

/**
 * Exportaciones del servicio
 */
export default {
  getEstatusIph,
  getIphHistory,
  getEstatusOptions
};