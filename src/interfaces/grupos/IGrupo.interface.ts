/**
 * @fileoverview Interfaces para el manejo de grupos
 * @version 1.0.0
 * @description Interfaces TypeScript basadas en la API del backend
 */

/**
 * Interface para el modelo de grupo (basada en IGrupos del backend)
 */
export interface IGrupo {
  id?: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Interface para la respuesta del backend al crear/actualizar/eliminar grupo
 */
export interface IResponseGrupo {
  status: boolean;
  message: string;
  data: {
    nombre: string;
    descripcion?: string;
  };
}

/**
 * Interface para los datos del formulario de creación/edición de grupo
 */
export interface IGrupoFormData {
  nombre: string;
  descripcion?: string;
}

/**
 * Interface para los parámetros de actualización de grupo
 */
export interface IUpdateGrupoRequest {
  id: string;
  nombre: string;
  descripcion?: string;
}

/**
 * Interface para los filtros de búsqueda de grupos
 */
export interface IGrupoFilters {
  search?: string;
  isActive?: boolean;
}

/**
 * Interface para la respuesta paginada de grupos (para futuro uso)
 */
export interface IGruposPaginatedResponse {
  grupos: IGrupo[];
  total: number;
  page: number;
  limit: number;
}