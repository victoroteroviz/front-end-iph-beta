/**
 * Interface para eliminación de usuario de grupo
 * Endpoint: DELETE /api/usuario-grupo/eliminar-usuario-de-grupo/:id/:grupoId
 *
 * @example
 * DELETE /api/usuario-grupo/eliminar-usuario-de-grupo/uuid-usuario/uuid-grupo
 */

/**
 * Parámetros para eliminar usuario de grupo
 */
export interface IEliminarUsuarioGrupoParams {
  /** ID del usuario a eliminar del grupo */
  id: string;
  /** ID del grupo del cual se eliminará el usuario */
  grupoId: string;
}

/**
 * Datos retornados al eliminar usuario del grupo
 */
export interface IEliminarUsuarioGrupoData {
  /** Nombre completo del usuario eliminado */
  nombreUsuario: string;
  /** Nombre del grupo del cual se eliminó */
  nombreGrupo: string;
}

/**
 * Respuesta exitosa de eliminación de usuario de grupo
 */
export interface IEliminarUsuarioGrupoResponse {
  /** Indica si la operación fue exitosa */
  status: boolean;
  /** Mensaje descriptivo de la operación */
  message: string;
  /** Datos del usuario y grupo */
  data: IEliminarUsuarioGrupoData;
}

/**
 * Respuesta de error en eliminación
 */
export interface IEliminarUsuarioGrupoError {
  status: false;
  message: string;
  error?: string;
}
