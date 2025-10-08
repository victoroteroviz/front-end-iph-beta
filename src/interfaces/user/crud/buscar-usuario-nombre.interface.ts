/**
 * Interface para búsqueda de usuarios por nombre
 * Endpoint: GET /api/users-web/buscar-usuario-nombre/:term
 *
 * @example
 * GET /api/users-web/buscar-usuario-nombre/Juan
 */

/**
 * Parámetros de búsqueda por nombre
 */
export interface IBuscarUsuarioNombreParams {
  /** Término de búsqueda (nombre, apellido o combinación) */
  termino: string;
}

/**
 * Usuario simplificado retornado por el endpoint de búsqueda
 */
export interface IUsuarioBusqueda {
  /** ID único del usuario */
  id: string;
  /** Primer apellido */
  primer_apellido: string;
  /** Segundo apellido */
  segundo_apellido: string;
  /** Nombre(s) del usuario */
  nombre: string;
  /** CUIP del usuario */
  cuip: string;
  /** CUP del usuario */
  cup: string;
}

/**
 * Respuesta de búsqueda de usuarios por nombre
 * El endpoint devuelve directamente un array de usuarios
 */
export type IBuscarUsuarioNombreResponse = IUsuarioBusqueda[];
