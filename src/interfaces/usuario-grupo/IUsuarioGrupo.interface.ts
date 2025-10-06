/**
 * @fileoverview Interfaces para el manejo de usuarios y grupos
 * @version 1.0.0
 * @description Interfaces TypeScript basadas en la API del backend usuario-grupo
 */

/**
 * Interface base para respuestas del backend
 */
export interface IResponse {
  status: boolean;
  message: string;
}

/**
 * Interface para la respuesta de asignación de usuario a grupo
 */
export interface IGrupoUsuarioCreado extends IResponse {
  data: {
    nombreUsuario: string;
    nombreGrupo: string;
  };
}

/**
 * Interface para los datos de usuario dentro de un grupo
 */
export interface IUsuarioGrupo {
  id: string;
  nombreCompleto: string;
  cuip?: string;
  cup?: string;
  telefono?: string;
}

/**
 * Interface para la respuesta de obtener usuarios por grupo ID
 */
export interface IObtenerUsuariosPorGrupo extends IResponse {
  id: string;
  nombre: string;
  data: IUsuarioGrupo[] | undefined;
}

/**
 * Interface para información de grupo con estadísticas de usuarios
 */
export interface IGrupoUsuario {
  id: string;
  nombreGrupo: string;
  estatus: boolean;
  descripcionGrupo: string;
  cantidadUsuarios: number;
}

/**
 * Interface para los parámetros de asignación de usuario a grupo
 */
export interface IAsignarUsuarioGrupoRequest {
  usuarioId: string;
  grupoId: string;
}

/**
 * Interface para filtros de búsqueda de usuarios en grupos
 */
export interface IUsuarioGrupoFilters {
  search?: string;
  grupoId?: string;
  activos?: boolean;
}

/**
 * Interface para estadísticas de usuarios y grupos
 */
export interface IEstadisticasUsuarioGrupo {
  totalGrupos: number;
  totalUsuarios: number;
  usuariosAsignados: number;
  usuariosSinGrupo: number;
  gruposActivos: number;
  gruposInactivos: number;
}