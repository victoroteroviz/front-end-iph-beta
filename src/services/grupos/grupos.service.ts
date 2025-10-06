/**
 * @fileoverview Servicio para gestión de grupos
 * @version 1.0.0
 * @description Servicios que conectan con la API de grupos del backend
 */

//+ Helpers
import { HttpHelper } from "../../helper/http/http.helper";
import { logDebug, logInfo, logError } from "../../helper/log/logger.helper";

//+ Environment
import { API_BASE_URL } from "../../config/env.config";

//+ Interfaces
import type {
  IGrupo,
  IResponseGrupo,
  IGrupoFormData,
  IUpdateGrupoRequest,
  IGrupoFilters
} from "../../interfaces/grupos";

//+ Mocks
import {
  getGruposMock,
  createGrupoMock,
  updateGrupoMock,
  deleteGrupoMock
} from "../../mock/grupos";

// Flag para cambiar entre mock y API real
const USE_MOCK_DATA = true; // Temporalmente en true para debug

// Configuración del HTTP helper
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});

const BASE_URL = '/api/grupo';

/**
 * @description Obtiene todos los grupos del sistema
 * @returns Promise<IGrupo[]> Lista de grupos
 */
export const getGrupos = async (): Promise<IGrupo[]> => {
  logInfo('grupos.service', 'Iniciando obtención de grupos');

  try {
    if (USE_MOCK_DATA) {
      logDebug('grupos.service', 'Usando datos mock para getGrupos');
      const grupos = await getGruposMock();
      logInfo('grupos.service', 'Grupos obtenidos exitosamente (mock)', {
        total: grupos.length
      });
      return grupos;
    }

    // Código para API real
    const url = BASE_URL;
    logDebug('grupos.service', 'Realizando petición GET a', { url });

    const response = await http.get<IGrupo[]>(url);

    // Log detallado para debug
    logDebug('grupos.service', 'Respuesta del servidor', {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data)
    });

    const grupos: IGrupo[] = response.data;

    // Validar que cada grupo tenga los campos necesarios
    grupos.forEach((grupo, index) => {
      logDebug('grupos.service', `Grupo ${index}`, {
        id: grupo.id,
        nombre: grupo.nombre,
        hasId: !!grupo.id,
        hasNombre: !!grupo.nombre
      });
    });

    logInfo('grupos.service', 'Grupos obtenidos exitosamente desde API', {
      total: grupos.length
    });

    return grupos;
  } catch (error) {
    logError('grupos.service', 'Error al obtener grupos', error);

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
 * @description Crea un nuevo grupo
 * @param grupoData Datos del grupo a crear
 * @returns Promise<IResponseGrupo> Respuesta de creación
 */
export const createGrupo = async (grupoData: IGrupoFormData): Promise<IResponseGrupo> => {
  logInfo('grupos.service', 'Iniciando creación de grupo', {
    nombre: grupoData.nombre,
    descripcion: grupoData.descripcion
  });

  // Validaciones básicas
  if (!grupoData.nombre || grupoData.nombre.trim() === '') {
    throw new Error('El nombre del grupo es requerido');
  }

  try {
    if (USE_MOCK_DATA) {
      logDebug('grupos.service', 'Usando datos mock para createGrupo');
      const response = await createGrupoMock(grupoData.nombre.trim(), grupoData.descripcion?.trim());
      logInfo('grupos.service', 'Grupo creado exitosamente (mock)', {
        nombre: grupoData.nombre,
        descripcion: grupoData.descripcion
      });
      return response;
    }

    // Código para API real
    const url = BASE_URL;
    const payload = {
      nombre: grupoData.nombre.trim(),
      ...(grupoData.descripcion && { descripcion: grupoData.descripcion.trim() })
    };

    logDebug('grupos.service', 'Realizando petición POST a', { url, payload });

    const response = await http.post<IResponseGrupo>(url, payload);
    const result: IResponseGrupo = response.data;

    logInfo('grupos.service', 'Grupo creado exitosamente desde API', {
      nombre: grupoData.nombre,
      descripcion: grupoData.descripcion,
      response: result
    });

    return result;
  } catch (error) {
    logError('grupos.service', 'Error al crear grupo', error);

    if (error instanceof Error) {
      if (error.message.includes('400')) {
        throw new Error('Datos del grupo inválidos');
      }
      if (error.message.includes('409')) {
        throw new Error('Ya existe un grupo con ese nombre');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para crear grupos');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }

      throw new Error(error.message || 'Error al crear el grupo');
    }

    throw new Error('Error desconocido al crear el grupo. Contacta con soporte');
  }
};

/**
 * @description Actualiza un grupo existente
 * @param updateData Datos de actualización del grupo
 * @returns Promise<IResponseGrupo> Respuesta de actualización
 */
export const updateGrupo = async (updateData: IUpdateGrupoRequest): Promise<IResponseGrupo> => {
  logInfo('grupos.service', 'Iniciando actualización de grupo', {
    id: updateData.id,
    nombre: updateData.nombre,
    descripcion: updateData.descripcion
  });

  // Validaciones básicas
  if (!updateData.id || updateData.id.trim() === '') {
    throw new Error('El ID del grupo es requerido');
  }
  if (!updateData.nombre || updateData.nombre.trim() === '') {
    throw new Error('El nombre del grupo es requerido');
  }

  try {
    if (USE_MOCK_DATA) {
      logDebug('grupos.service', 'Usando datos mock para updateGrupo');
      const response = await updateGrupoMock(updateData.id, updateData.nombre.trim(), updateData.descripcion?.trim());
      logInfo('grupos.service', 'Grupo actualizado exitosamente (mock)', {
        id: updateData.id,
        nombre: updateData.nombre,
        descripcion: updateData.descripcion
      });
      return response;
    }

    // Código para API real
    const url = `${BASE_URL}/${encodeURIComponent(updateData.id)}`;
    const payload = {
      nombre: updateData.nombre.trim(),
      ...(updateData.descripcion && { descripcion: updateData.descripcion.trim() })
    };

    logDebug('grupos.service', 'Realizando petición PATCH a', { url, payload });

    const response = await http.patch<IResponseGrupo>(url, payload);
    const result: IResponseGrupo = response.data;

    logInfo('grupos.service', 'Grupo actualizado exitosamente desde API', {
      id: updateData.id,
      nombre: updateData.nombre,
      descripcion: updateData.descripcion,
      response: result
    });

    return result;
  } catch (error) {
    logError('grupos.service', 'Error al actualizar grupo', error);

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Grupo no encontrado');
      }
      if (error.message.includes('400')) {
        throw new Error('Datos del grupo inválidos');
      }
      if (error.message.includes('409')) {
        throw new Error('Ya existe un grupo con ese nombre');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para actualizar grupos');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }

      throw new Error(error.message || 'Error al actualizar el grupo');
    }

    throw new Error('Error desconocido al actualizar el grupo. Contacta con soporte');
  }
};

/**
 * @description Elimina un grupo (soft delete)
 * @param id ID del grupo a eliminar
 * @returns Promise<IResponseGrupo> Respuesta de eliminación
 */
export const deleteGrupo = async (id: string): Promise<IResponseGrupo> => {
  logInfo('grupos.service', 'Iniciando eliminación de grupo', { id });

  // Validaciones básicas
  if (!id || id.trim() === '') {
    throw new Error('El ID del grupo es requerido');
  }

  try {
    if (USE_MOCK_DATA) {
      logDebug('grupos.service', 'Usando datos mock para deleteGrupo');
      const response = await deleteGrupoMock(id);
      logInfo('grupos.service', 'Grupo eliminado exitosamente (mock)', { id });
      return response;
    }

    // Código para API real
    const url = `${BASE_URL}/${encodeURIComponent(id)}`;

    logDebug('grupos.service', 'Realizando petición DELETE a', { url });

    const response = await http.delete<IResponseGrupo>(url);
    const result: IResponseGrupo = response.data;

    logInfo('grupos.service', 'Grupo eliminado exitosamente desde API', {
      id,
      response: result
    });

    return result;
  } catch (error) {
    logError('grupos.service', 'Error al eliminar grupo', error);

    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Grupo no encontrado');
      }
      if (error.message.includes('409')) {
        throw new Error('El grupo ya se encuentra eliminado');
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para eliminar grupos');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }

      throw new Error(error.message || 'Error al eliminar el grupo');
    }

    throw new Error('Error desconocido al eliminar el grupo. Contacta con soporte');
  }
};

/**
 * @description Filtra grupos según criterios específicos
 * @param grupos Lista de grupos a filtrar
 * @param filters Filtros a aplicar
 * @returns IGrupo[] Grupos filtrados
 */
export const filterGrupos = (grupos: IGrupo[], filters: IGrupoFilters): IGrupo[] => {
  logDebug('grupos.service', 'Aplicando filtros a grupos', { filters, totalGrupos: grupos.length });

  let filteredGrupos = [...grupos];

  // Filtro por búsqueda de texto
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredGrupos = filteredGrupos.filter(grupo =>
      grupo.nombre.toLowerCase().includes(searchTerm)
    );
  }

  logDebug('grupos.service', 'Filtros aplicados', {
    gruposOriginales: grupos.length,
    gruposFiltrados: filteredGrupos.length
  });

  return filteredGrupos;
};