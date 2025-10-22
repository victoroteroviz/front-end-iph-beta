/**
 * @fileoverview Servicio para gestión de grupos
 * @version 2.0.0
 * @description Servicios que conectan con la API de grupos del backend
 *
 * @changelog
 * v2.0.0 - Optimización de logging siguiendo mejores prácticas:
 *  - Uso de constante MODULE_NAME para consistencia
 *  - Implementación de logHttp para operaciones HTTP
 *  - Tracking de duración de peticiones
 *  - Helper para manejo de errores HTTP (DRY)
 *  - Logs WARN en validaciones críticas
 *  - Reducción de logs DEBUG innecesarios
 *  - Opcionalmente incluye contexto de usuario en operaciones sensibles
 */

//+ Helpers
import { HttpHelper } from "../../helper/http/http.helper";
import {
  logDebug,
  logInfo,
  logError,
  logWarning,
  logHttp
} from "../../helper/log/logger.helper";

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

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const MODULE_NAME = 'grupos.service';
const BASE_URL = '/api/grupo';

const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

/**
 * @description Helper para manejar errores HTTP de manera consistente (DRY)
 * @param error Error capturado
 * @param operacion Nombre de la operación (e.g., "obtener", "crear", "actualizar")
 * @returns Error personalizado con mensaje apropiado
 */
const handleHttpError = (error: unknown, operacion: string): Error => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('401')) {
      return new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
    }
    if (message.includes('403')) {
      return new Error(`No tienes permisos para ${operacion} grupos`);
    }
    if (message.includes('404')) {
      return new Error(operacion === 'obtener'
        ? 'No se encontraron grupos'
        : 'Grupo no encontrado'
      );
    }
    if (message.includes('409')) {
      return new Error(operacion === 'eliminar'
        ? 'El grupo ya se encuentra eliminado'
        : 'Ya existe un grupo con ese nombre'
      );
    }
    if (message.includes('400')) {
      return new Error('Datos del grupo inválidos');
    }
    if (message.includes('500')) {
      return new Error('Error interno del servidor. Intenta nuevamente más tarde');
    }

    return new Error(error.message || `Error al ${operacion} el grupo`);
  }

  return new Error(`Error desconocido al ${operacion} el grupo. Contacta con soporte`);
};

/**
 * @description Helper para validar campos requeridos y loggear warnings
 * @param field Valor del campo
 * @param fieldName Nombre del campo para el mensaje
 * @throws Error si la validación falla
 */
const validateRequiredField = (field: string | undefined, fieldName: string): void => {
  if (!field || field.trim() === '') {
    logWarning(MODULE_NAME, `Validación fallida: ${fieldName} es requerido`, { fieldName });
    throw new Error(`El ${fieldName} es requerido`);
  }
};

/**
 * @description Obtiene el ID de usuario actual para auditoría (opcional)
 * @returns ID del usuario o 'unknown' si no está disponible
 */
const getCurrentUserId = (): string => {
  try {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed?.id || parsed?.usuario_id || 'unknown';
    }
  } catch {
    // Silent fail
  }
  return 'unknown';
};

// ============================================================================
// FUNCIONES PÚBLICAS DEL SERVICIO
// ============================================================================

/**
 * @description Obtiene todos los grupos del sistema
 * @returns Promise<IGrupo[]> Lista de grupos
 *
 * @example
 * const grupos = await getGrupos();
 * console.log(grupos.length); // 42
 */
export const getGrupos = async (): Promise<IGrupo[]> => {
  const startTime = performance.now();
  logInfo(MODULE_NAME, 'Iniciando obtención de grupos');

  try {
    const url = BASE_URL;
    logDebug(MODULE_NAME, 'Petición GET', { url });

    const response = await http.get<IGrupo[]>(url);
    const duration = Math.round(performance.now() - startTime);

    // Log HTTP especializado
    logHttp('GET', url, response.status, duration);

    const grupos: IGrupo[] = response.data;

    // Validación de datos sin loop excesivo
    const validGrupos = grupos.filter(g => g.id && g.nombre);
    const invalidCount = grupos.length - validGrupos.length;

    if (invalidCount > 0) {
      logWarning(MODULE_NAME, 'Grupos con datos incompletos detectados', {
        total: grupos.length,
        invalidos: invalidCount,
        ejemploInvalido: grupos.find(g => !g.id || !g.nombre)
      });
    }

    logInfo(MODULE_NAME, 'Grupos obtenidos exitosamente', {
      total: validGrupos.length,
      duracionMs: duration
    });

    return validGrupos;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logError(MODULE_NAME, error, `Error al obtener grupos (${duration}ms)`);
    throw handleHttpError(error, 'obtener');
  }
};

/**
 * @description Crea un nuevo grupo
 * @param grupoData Datos del grupo a crear
 * @returns Promise<IResponseGrupo> Respuesta de creación
 *
 * @example
 * const response = await createGrupo({
 *   nombre: 'Grupo Alpha',
 *   descripcion: 'Descripción del grupo'
 * });
 */
export const createGrupo = async (grupoData: IGrupoFormData): Promise<IResponseGrupo> => {
  const startTime = performance.now();
  const userId = getCurrentUserId(); // Para auditoría

  logInfo(MODULE_NAME, 'Iniciando creación de grupo', {
    nombre: grupoData.nombre,
    tieneDescripcion: !!grupoData.descripcion,
    usuarioId: userId
  });

  // Validaciones con logging
  validateRequiredField(grupoData.nombre, 'nombre del grupo');

  try {
    const url = BASE_URL;
    const payload = {
      nombre: grupoData.nombre.trim(),
      ...(grupoData.descripcion && { descripcion: grupoData.descripcion.trim() })
    };

    logDebug(MODULE_NAME, 'Petición POST', { url, payloadKeys: Object.keys(payload) });

    const response = await http.post<IResponseGrupo>(url, payload);
    const duration = Math.round(performance.now() - startTime);

    // Log HTTP especializado
    logHttp('POST', url, response.status, duration);

    const result: IResponseGrupo = response.data;

    logInfo(MODULE_NAME, 'Grupo creado exitosamente', {
      nombre: grupoData.nombre,
      status: result.status,
      duracionMs: duration
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logError(MODULE_NAME, error, `Error al crear grupo (${duration}ms)`);
    throw handleHttpError(error, 'crear');
  }
};

/**
 * @description Actualiza un grupo existente
 * @param updateData Datos de actualización del grupo
 * @returns Promise<IResponseGrupo> Respuesta de actualización
 *
 * @example
 * const response = await updateGrupo({
 *   id: 'abc-123',
 *   nombre: 'Grupo Beta',
 *   descripcion: 'Nueva descripción'
 * });
 */
export const updateGrupo = async (updateData: IUpdateGrupoRequest): Promise<IResponseGrupo> => {
  const startTime = performance.now();
  const userId = getCurrentUserId();

  logInfo(MODULE_NAME, 'Iniciando actualización de grupo', {
    id: updateData.id,
    nombre: updateData.nombre,
    tieneDescripcion: !!updateData.descripcion,
    usuarioId: userId
  });

  // Validaciones con logging
  validateRequiredField(updateData.id, 'ID del grupo');
  validateRequiredField(updateData.nombre, 'nombre del grupo');

  try {
    const url = `${BASE_URL}/${encodeURIComponent(updateData.id)}`;
    const payload = {
      nombre: updateData.nombre.trim(),
      ...(updateData.descripcion && { descripcion: updateData.descripcion.trim() })
    };

    logDebug(MODULE_NAME, 'Petición PATCH', { url, payloadKeys: Object.keys(payload) });

    const response = await http.patch<IResponseGrupo>(url, payload);
    const duration = Math.round(performance.now() - startTime);

    // Log HTTP especializado
    logHttp('PATCH', url, response.status, duration);

    const result: IResponseGrupo = response.data;

    logInfo(MODULE_NAME, 'Grupo actualizado exitosamente', {
      id: updateData.id,
      status: result.status,
      duracionMs: duration
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logError(MODULE_NAME, error, `Error al actualizar grupo (${duration}ms)`);
    throw handleHttpError(error, 'actualizar');
  }
};

/**
 * @description Elimina un grupo (soft delete)
 * @param id ID del grupo a eliminar
 * @returns Promise<IResponseGrupo> Respuesta de eliminación
 *
 * @example
 * const response = await deleteGrupo('abc-123');
 */
export const deleteGrupo = async (id: string): Promise<IResponseGrupo> => {
  const startTime = performance.now();
  const userId = getCurrentUserId();

  logInfo(MODULE_NAME, 'Iniciando eliminación de grupo', {
    id,
    usuarioId: userId // IMPORTANTE para auditoría de seguridad
  });

  // Validación con logging
  validateRequiredField(id, 'ID del grupo');

  try {
    const url = `${BASE_URL}/${encodeURIComponent(id)}`;

    logDebug(MODULE_NAME, 'Petición DELETE', { url });

    const response = await http.delete<IResponseGrupo>(url);
    const duration = Math.round(performance.now() - startTime);

    // Log HTTP especializado
    logHttp('DELETE', url, response.status, duration);

    const result: IResponseGrupo = response.data;

    logInfo(MODULE_NAME, 'Grupo eliminado exitosamente', {
      id,
      status: result.status,
      duracionMs: duration
    });

    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logError(MODULE_NAME, error, `Error al eliminar grupo (${duration}ms)`);
    throw handleHttpError(error, 'eliminar');
  }
};

/**
 * @description Filtra grupos según criterios específicos (operación client-side)
 * @param grupos Lista de grupos a filtrar
 * @param filters Filtros a aplicar
 * @returns IGrupo[] Grupos filtrados
 *
 * @example
 * const filtrados = filterGrupos(grupos, { search: 'alpha' });
 */
export const filterGrupos = (grupos: IGrupo[], filters: IGrupoFilters): IGrupo[] => {
  // Log mínimo para función client-side sin side effects
  // Solo loggear si hay muchos grupos o filtros complejos
  const shouldLog = grupos.length > 100 || (filters.search && filters.search.length > 3);

  if (shouldLog) {
    logDebug(MODULE_NAME, 'Aplicando filtros a grupos', {
      totalGrupos: grupos.length,
      tieneBusqueda: !!filters.search
    });
  }

  let filteredGrupos = [...grupos];

  // Filtro por búsqueda de texto
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredGrupos = filteredGrupos.filter(grupo =>
      grupo.nombre.toLowerCase().includes(searchTerm)
    );
  }

  // Solo loggear resultados si la reducción es significativa
  if (shouldLog && filteredGrupos.length < grupos.length * 0.5) {
    logDebug(MODULE_NAME, 'Filtrado completado con reducción significativa', {
      originales: grupos.length,
      filtrados: filteredGrupos.length,
      reduccionPorcentaje: Math.round((1 - filteredGrupos.length / grupos.length) * 100)
    });
  }

  return filteredGrupos;
};
