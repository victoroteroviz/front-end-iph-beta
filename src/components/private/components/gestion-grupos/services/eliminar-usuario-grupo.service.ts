/**
 * Servicio para eliminar usuario de un grupo
 * Endpoint: DELETE /api/usuario-grupo/eliminar-usuario-de-grupo/:id/:grupoId
 * Implementa patrón mock/real para facilitar migración futura a API real
 *
 * @example
 * // Eliminar usuario de grupo
 * DELETE /api/usuario-grupo/eliminar-usuario-de-grupo/uuid-usuario/uuid-grupo
 */

import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { HttpHelper } from '../../../../../helper/http/http.helper';
import { API_BASE_URL } from '../../../../../config/env.config';
import type {
  IEliminarUsuarioGrupoParams,
  IEliminarUsuarioGrupoResponse
} from '../../../../../interfaces/grupo';

// =====================================================
// CONFIGURACIÓN MOCK/REAL
// =====================================================

const USE_MOCK_DATA = false; // Cambiar a true solo para testing

// Instancia de HttpHelper configurada
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL || '',
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
});

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Elimina un usuario de un grupo específico
 *
 * **Características del backend:**
 * - Transaccional con READ COMMITTED
 * - Valida existencia de usuario en el grupo
 * - Usa preload para actualizar entidad
 * - Retorna nombre completo del usuario y grupo
 * - NotFoundException si usuario no existe en grupo
 *
 * @param params - IDs del usuario y grupo
 * @returns Respuesta con status, mensaje y datos del usuario/grupo
 *
 * @example
 * ```typescript
 * const resultado = await eliminarUsuarioDeGrupo({
 *   id: 'uuid-usuario',
 *   grupoId: 'uuid-grupo'
 * });
 *
 * ```
 */
export const eliminarUsuarioDeGrupo = async (
  params: IEliminarUsuarioGrupoParams
): Promise<IEliminarUsuarioGrupoResponse> => {
  logInfo('EliminarUsuarioGrupoService', 'Iniciando eliminación de usuario de grupo', {
    usuarioId: params.id,
    grupoId: params.grupoId
  });

  try {
    if (USE_MOCK_DATA) {
      return await getMockEliminar(params);
    } else {
      return await getRealEliminar(params);
    }
  } catch (error) {
    logError(
      'EliminarUsuarioGrupoService',
      'Error al eliminar usuario de grupo',
      `${error}`
    );
    throw error;
  }
};

// =====================================================
// FUNCIONES REALES (API BACKEND)
// =====================================================

/**
 * Realiza eliminación real contra el backend
 * @param params - IDs del usuario y grupo
 * @returns Respuesta del servidor con confirmación
 */
const getRealEliminar = async (
  params: IEliminarUsuarioGrupoParams
): Promise<IEliminarUsuarioGrupoResponse> => {
  try {
    // Validar UUIDs
    if (!params.id || !params.grupoId) {
      throw new Error('ID de usuario y grupo son requeridos');
    }

    // Validar formato UUID básico
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.id)) {
      throw new Error('ID de usuario no es un UUID válido');
    }
    if (!uuidRegex.test(params.grupoId)) {
      throw new Error('ID de grupo no es un UUID válido');
    }

    const endpoint = `/api/usuario-grupo/eliminar-usuario-de-grupo/${params.id}/${params.grupoId}`;

    logInfo('EliminarUsuarioGrupoService', 'Realizando petición DELETE', {
      endpoint,
      usuarioId: params.id,
      grupoId: params.grupoId
    });

    const response = await http.delete<IEliminarUsuarioGrupoResponse>(endpoint);

    logInfo('EliminarUsuarioGrupoService', 'Eliminación exitosa', {
      status: response.data.status,
      nombreUsuario: response.data.data.nombreUsuario,
      nombreGrupo: response.data.data.nombreGrupo,
      httpStatus: response.status
    });

    return response.data;

  } catch (error) {
    logError(
      'EliminarUsuarioGrupoService',
      'Error en petición al backend',
      `${error}`
    );

    // Manejar errores HTTP específicos
    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status?: number; message?: string };

      if (httpError.status === 404) {
        throw new Error('Usuario no encontrado en el grupo especificado');
      }

      if (httpError.status === 400) {
        throw new Error('Parámetros inválidos');
      }
    }

    throw new Error(
      error instanceof Error ? error.message : 'Error al eliminar usuario del grupo'
    );
  }
};

// =====================================================
// FUNCIONES MOCK (DATOS DE DESARROLLO)
// =====================================================

// TODO: Remover cuando API real esté completamente implementada
// @JSDoc - Estas funciones simulan respuestas del backend

/**
 * Simula eliminación de usuario de grupo (solo para desarrollo)
 * @param params - IDs del usuario y grupo
 * @returns Mock de respuesta exitosa
 */
const getMockEliminar = async (
  params: IEliminarUsuarioGrupoParams
): Promise<IEliminarUsuarioGrupoResponse> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  logInfo('EliminarUsuarioGrupoService', 'Usando datos MOCK', {
    usuarioId: params.id,
    grupoId: params.grupoId,
    advertencia: 'Cambiar USE_MOCK_DATA a false para usar API real'
  });

  // Simular error si IDs no son válidos
  if (!params.id || !params.grupoId) {
    throw new Error('ID de usuario y grupo son requeridos');
  }

  return {
    status: true,
    message: 'Usuario eliminado del grupo correctamente',
    data: {
      nombreUsuario: 'Maria Linda (MOCK)',
      nombreGrupo: 'Grupo de Ejemplo (MOCK)'
    }
  };
};

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Valida parámetros de eliminación
 * @param params - Parámetros a validar
 * @returns Objeto con resultado de validación
 */
export const validarParametrosEliminacion = (
  params: IEliminarUsuarioGrupoParams
): { valido: boolean; error?: string } => {
  if (!params.id) {
    return {
      valido: false,
      error: 'ID de usuario es requerido'
    };
  }

  if (!params.grupoId) {
    return {
      valido: false,
      error: 'ID de grupo es requerido'
    };
  }

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(params.id)) {
    return {
      valido: false,
      error: 'ID de usuario no es un UUID válido'
    };
  }

  if (!uuidRegex.test(params.grupoId)) {
    return {
      valido: false,
      error: 'ID de grupo no es un UUID válido'
    };
  }

  return { valido: true };
};

/**
 * Formatea el mensaje de confirmación para el usuario
 * @param response - Respuesta del servidor
 * @returns Mensaje formateado para mostrar
 */
export const formatearMensajeConfirmacion = (
  response: IEliminarUsuarioGrupoResponse
): string => {
  return `${response.data.nombreUsuario} ha sido eliminado del grupo "${response.data.nombreGrupo}" exitosamente.`;
};

/**
 * Verifica si la operación fue exitosa
 * @param response - Respuesta del servidor
 * @returns true si fue exitosa
 */
export const esEliminacionExitosa = (
  response: IEliminarUsuarioGrupoResponse
): boolean => {
  return response.status === true && !!response.data.nombreUsuario;
};
