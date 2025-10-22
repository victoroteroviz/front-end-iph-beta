/**
 * @fileoverview Servicio para gestión de usuarios y grupos
 * @version 1.0.0
 * @description Servicios que conectan con la API de usuario-grupo del backend
 */

//+ Helpers
import { HttpHelper } from "../../../../../helper/http/http.helper";
import { logDebug, logInfo, logError } from "../../../../../helper/log/logger.helper";

//+ Environment
import { API_BASE_URL } from "../../../../../config/env.config";

//+ Interfaces
import type {
  IGrupoUsuario,
  IGrupoUsuarioCreado,
  IObtenerUsuariosPorGrupo,
  IAsignarUsuarioGrupoRequest,
  IUsuarioGrupoFilters,
  IEstadisticasUsuarioGrupo
} from "../../../../../interfaces/usuario-grupo";

//+ Mocks
import {
  obtenerUsuariosPorGrupoMock,
  obtenerUsuariosGruposPorIdMock,
  asignarUsuarioAGrupoMock,
  obtenerEstadisticasUsuarioGrupoMock
} from "../../../../../mock/usuario-grupo";

// Flag para cambiar entre mock y API real
const USE_MOCK_DATA = false; // TODO: Cambiar a false para usar API real

// Configuración del HTTP helper
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});

const BASE_URL = '/api/usuario-grupo';

/**
 * @description Busca un usuario por nombre
 * @param nombre Nombre del usuario a buscar
 * @returns Promise<any> Información del usuario encontrado
 */
export const buscarUsuarioPorNombre = async (nombre: string): Promise<any> => {
  logInfo('usuario-grupo.service', 'Iniciando búsqueda de usuario por nombre', { nombre });

  // Validaciones básicas
  if (!nombre || nombre.trim() === '') {
    throw new Error('El nombre del usuario es requerido');
  }

  try {
    const url = `/api/users-web/buscar-usuario-nombre/${encodeURIComponent(nombre.trim())}`;
    logDebug('usuario-grupo.service', 'Realizando petición GET a', { url });

    const response = await http.get<any>(url);

    logInfo('usuario-grupo.service', 'Usuario encontrado exitosamente', {
      nombre,
      data: response.data
    });

    return response.data;
  } catch (error) {
    logError('usuario-grupo.service', error, 'Error al buscar usuario por nombre');

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Usuario no encontrado');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para buscar usuarios');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }
      if (error.message.includes('500')) {
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde');
      }

      throw new Error(error.message || 'Error al buscar el usuario');
    }

    throw new Error('Error desconocido al buscar el usuario. Contacta con soporte');
  }
};

/**
 * @description Obtiene todos los grupos con estadísticas de usuarios
 * @returns Promise<IGrupoUsuario[]> Lista de grupos con información de usuarios
 */
export const obtenerUsuariosPorGrupo = async (): Promise<IGrupoUsuario[]> => {
  logInfo('usuario-grupo.service', 'Iniciando obtención de usuarios por grupo');

  try {
    if (USE_MOCK_DATA) {
      logDebug('usuario-grupo.service', 'Usando datos mock para obtenerUsuariosPorGrupo');
      const grupos = await obtenerUsuariosPorGrupoMock();
      logInfo('usuario-grupo.service', 'Grupos con usuarios obtenidos exitosamente (mock)', {
        total: grupos.length,
        totalUsuarios: grupos.reduce((sum, grupo) => sum + grupo.cantidadUsuarios, 0)
      });
      return grupos;
    }

    // Código para API real
    const url = `${BASE_URL}/obtener-usuarios-por-grupo`;
    logDebug('usuario-grupo.service', 'Realizando petición GET a', { url });

    const response = await http.get<IGrupoUsuario[]>(url);

    // Log detallado para debug
    logDebug('usuario-grupo.service', 'Respuesta del servidor', {
      status: response.status,
      data: response.data,
      totalGrupos: response.data.length
    });

    const grupos: IGrupoUsuario[] = response.data;

    logInfo('usuario-grupo.service', 'Grupos con usuarios obtenidos exitosamente desde API', {
      total: grupos.length,
      totalUsuarios: grupos.reduce((sum, grupo) => sum + grupo.cantidadUsuarios, 0)
    });

    return grupos;
  } catch (error) {
    logError('usuario-grupo.service', error, 'Error al obtener usuarios por grupo');

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('No se encontraron grupos');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para ver los grupos');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }
      if (error.message.includes('500')) {
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde');
      }

      throw new Error(error.message || 'Error al obtener los grupos');
    }

    throw new Error('Error desconocido al obtener los grupos. Contacta con soporte');
  }
};

/**
 * @description Obtiene los usuarios de un grupo específico por ID
 * @param id ID del grupo
 * @returns Promise<IObtenerUsuariosPorGrupo> Información del grupo y sus usuarios
 */
export const obtenerUsuariosGruposPorId = async (id: string): Promise<IObtenerUsuariosPorGrupo> => {
  logInfo('usuario-grupo.service', 'Iniciando obtención de usuarios del grupo', { grupoId: id });

  // Validaciones básicas
  if (!id || id.trim() === '') {
    throw new Error('El ID del grupo es requerido');
  }

  try {
    if (USE_MOCK_DATA) {
      logDebug('usuario-grupo.service', 'Usando datos mock para obtenerUsuariosGruposPorId');
      const resultado = await obtenerUsuariosGruposPorIdMock(id);
      logInfo('usuario-grupo.service', 'Usuarios del grupo obtenidos exitosamente (mock)', {
        grupoId: id,
        grupoNombre: resultado.nombre,
        totalUsuarios: resultado.data?.length || 0
      });
      return resultado;
    }

    // Código para API real
    const url = `${BASE_URL}/obtener-usuarios-por-grupo/${encodeURIComponent(id)}`;
    logDebug('usuario-grupo.service', 'Realizando petición GET a', { url });

    const response = await http.get<IObtenerUsuariosPorGrupo>(url);
    const resultado: IObtenerUsuariosPorGrupo = response.data;

    logInfo('usuario-grupo.service', 'Usuarios del grupo obtenidos exitosamente desde API', {
      grupoId: id,
      grupoNombre: resultado.nombre,
      totalUsuarios: resultado.data?.length || 0
    });

    return resultado;
  } catch (error) {
    logError('usuario-grupo.service', error, 'Error al obtener usuarios del grupo');

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Grupo no encontrado');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para ver este grupo');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }

      throw new Error(error.message || 'Error al obtener los usuarios del grupo');
    }

    throw new Error('Error desconocido al obtener los usuarios del grupo. Contacta con soporte');
  }
};

/**
 * @description Asigna un usuario a un grupo
 * @param request Datos de la asignación (usuarioId y grupoId)
 * @returns Promise<IGrupoUsuarioCreado> Respuesta de la asignación
 */
export const asignarUsuarioAGrupo = async (request: IAsignarUsuarioGrupoRequest): Promise<IGrupoUsuarioCreado> => {
  logInfo('usuario-grupo.service', 'Iniciando asignación de usuario a grupo', {
    usuarioId: request.usuarioId,
    grupoId: request.grupoId
  });

  // Validaciones básicas
  if (!request.usuarioId || request.usuarioId.trim() === '') {
    throw new Error('El ID del usuario es requerido y no puede estar vacío');
  }

  if (!request.grupoId || request.grupoId.trim() === '') {
    throw new Error('El ID del grupo es requerido y no puede estar vacío');
  }

  try {
    if (USE_MOCK_DATA) {
      logDebug('usuario-grupo.service', 'Usando datos mock para asignarUsuarioAGrupo');
      const response = await asignarUsuarioAGrupoMock(request.usuarioId, request.grupoId);
      logInfo('usuario-grupo.service', 'Usuario asignado al grupo exitosamente (mock)', {
        usuarioId: request.usuarioId,
        grupoId: request.grupoId,
        nombreUsuario: response.data.nombreUsuario,
        nombreGrupo: response.data.nombreGrupo
      });
      return response;
    }

    // Código para API real
    const url = `${BASE_URL}/asignar-usuario-a-grupo`;
    const payload = {
      usuarioId: request.usuarioId.trim(),
      grupoId: request.grupoId.trim()
    };

    logDebug('usuario-grupo.service', 'Realizando petición POST a', { url, payload });

    const response = await http.post<IGrupoUsuarioCreado>(url, payload);
    const result: IGrupoUsuarioCreado = response.data;

    logInfo('usuario-grupo.service', 'Usuario asignado al grupo exitosamente desde API', {
      usuarioId: request.usuarioId,
      grupoId: request.grupoId,
      response: result
    });

    return result;
  } catch (error) {
    logError('usuario-grupo.service', error, 'Error al asignar usuario al grupo');

    // Re-lanzar el error original sin transformarlo
    // Esto permite que el componente use parseBackendError para extraer el mensaje correcto
    throw error;
  }
};

/**
 * @description Obtiene estadísticas generales de usuarios y grupos
 * @returns Promise<IEstadisticasUsuarioGrupo> Estadísticas del sistema
 */
export const obtenerEstadisticasUsuarioGrupo = async (): Promise<IEstadisticasUsuarioGrupo> => {
  logInfo('usuario-grupo.service', 'Iniciando obtención de estadísticas');

  try {
    if (USE_MOCK_DATA) {
      logDebug('usuario-grupo.service', 'Usando datos mock para estadísticas');
      const estadisticas = await obtenerEstadisticasUsuarioGrupoMock();
      logInfo('usuario-grupo.service', 'Estadísticas obtenidas exitosamente (mock)', estadisticas);
      return estadisticas;
    }

    // Para API real, necesitaríamos hacer múltiples peticiones o tener un endpoint específico
    // Por ahora, calcularemos las estadísticas basándose en los datos de grupos
    const grupos = await obtenerUsuariosPorGrupo();

    const totalUsuarios = grupos.reduce((sum, grupo) => sum + grupo.cantidadUsuarios, 0);
    const gruposActivos = grupos.filter(g => g.estatus).length;
    const gruposInactivos = grupos.filter(g => !g.estatus).length;

    const estadisticas: IEstadisticasUsuarioGrupo = {
      totalGrupos: grupos.length,
      totalUsuarios: totalUsuarios,
      usuariosAsignados: totalUsuarios,
      usuariosSinGrupo: 0, // Este dato requeriría un endpoint específico
      gruposActivos,
      gruposInactivos
    };

    logInfo('usuario-grupo.service', 'Estadísticas calculadas desde API', estadisticas);
    return estadisticas;
  } catch (error) {
    logError('usuario-grupo.service', error, 'Error al obtener estadísticas');
    throw new Error('Error al obtener las estadísticas del sistema');
  }
};

/**
 * @description Filtra grupos según criterios específicos
 * @param grupos Lista de grupos a filtrar
 * @param filters Filtros a aplicar
 * @returns IGrupoUsuario[] Grupos filtrados
 */
export const filtrarGruposUsuarios = (grupos: IGrupoUsuario[], filters: IUsuarioGrupoFilters): IGrupoUsuario[] => {
  logDebug('usuario-grupo.service', 'Aplicando filtros a grupos', { filters, totalGrupos: grupos.length });

  let filteredGrupos = [...grupos];

  // Filtro por búsqueda de texto
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredGrupos = filteredGrupos.filter(grupo =>
      grupo.nombreGrupo.toLowerCase().includes(searchTerm) ||
      grupo.descripcionGrupo.toLowerCase().includes(searchTerm)
    );
  }

  // Filtro por grupos activos/inactivos
  if (filters.activos !== undefined) {
    filteredGrupos = filteredGrupos.filter(grupo => grupo.estatus === filters.activos);
  }

  logDebug('usuario-grupo.service', 'Filtros aplicados', {
    gruposOriginales: grupos.length,
    gruposFiltrados: filteredGrupos.length
  });

  return filteredGrupos;
};