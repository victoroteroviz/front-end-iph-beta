/**
 * @fileoverview Interfaces para gestión de grupos de usuarios
 * @version 1.0.0
 * @description Define las interfaces para CRUD de grupos y asignación de usuarios
 */

import { ReactNode } from 'react';

/**
 * @interface IGrupo
 * @description Estructura de un grupo de usuarios
 */
export interface IGrupo {
  /** ID único del grupo */
  id: number;
  /** Nombre del grupo */
  nombre: string;
  /** Descripción del grupo */
  descripcion: string;
  /** Color identificativo del grupo */
  color: string;
  /** Estado activo/inactivo */
  activo: boolean;
  /** Número de usuarios asignados al grupo */
  cantidadUsuarios: number;
  /** Fecha de creación */
  fechaCreacion: string;
  /** Fecha de última actualización */
  fechaActualizacion?: string;
  /** Usuario que creó el grupo */
  creadoPor: string;
  /** Permisos especiales del grupo */
  permisos?: string[];
}

/**
 * @interface IUsuarioGrupo
 * @description Usuario asignado a un grupo
 */
export interface IUsuarioGrupo {
  /** ID único del usuario */
  id: number;
  /** Nombre completo del usuario */
  nombre: string;
  /** Email del usuario */
  email: string;
  /** Rol principal del usuario */
  rol: string;
  /** Avatar del usuario */
  avatar?: string;
  /** Fecha de asignación al grupo */
  fechaAsignacion: string;
  /** Estado activo/inactivo en el grupo */
  activoEnGrupo: boolean;
}

/**
 * @interface IGrupoDetalle
 * @description Información detallada de un grupo con usuarios
 */
export interface IGrupoDetalle extends IGrupo {
  /** Lista de usuarios asignados al grupo */
  usuarios: IUsuarioGrupo[];
}

/**
 * @interface IGrupoCrear
 * @description Datos para crear un nuevo grupo
 */
export interface IGrupoCrear {
  /** Nombre del grupo */
  nombre: string;
  /** Descripción del grupo */
  descripcion: string;
  /** Color identificativo del grupo */
  color: string;
  /** Estado inicial activo/inactivo */
  activo: boolean;
  /** Permisos especiales del grupo */
  permisos?: string[];
}

/**
 * @interface IGrupoActualizar
 * @description Datos para actualizar un grupo existente
 */
export interface IGrupoActualizar extends Partial<IGrupoCrear> {
  /** ID del grupo a actualizar */
  id: number;
}

/**
 * @interface IAsignacionGrupo
 * @description Estructura para asignar/desasignar usuarios a grupos
 */
export interface IAsignacionGrupo {
  /** ID del grupo */
  grupoId: number;
  /** IDs de usuarios a asignar */
  usuarioIds: number[];
  /** Tipo de operación */
  accion: 'asignar' | 'desasignar';
}

/**
 * @interface IGruposResponse
 * @description Respuesta del servicio de grupos
 */
export interface IGruposResponse {
  /** Lista de grupos */
  grupos: IGrupo[];
  /** Total de grupos */
  total: number;
  /** Página actual */
  pagina: number;
  /** Total de páginas */
  totalPaginas: number;
  /** Estado de la respuesta */
  success: boolean;
  /** Mensaje de la respuesta */
  message: string;
}

/**
 * @interface IGrupoDetalleResponse
 * @description Respuesta del servicio para detalles de grupo
 */
export interface IGrupoDetalleResponse {
  /** Información detallada del grupo */
  grupo: IGrupoDetalle;
  /** Estado de la respuesta */
  success: boolean;
  /** Mensaje de la respuesta */
  message: string;
}

/**
 * @interface IUsuariosDisponiblesResponse
 * @description Respuesta para usuarios disponibles para asignar
 */
export interface IUsuariosDisponiblesResponse {
  /** Lista de usuarios disponibles */
  usuarios: IUsuarioGrupo[];
  /** Total de usuarios disponibles */
  total: number;
  /** Estado de la respuesta */
  success: boolean;
  /** Mensaje de la respuesta */
  message: string;
}

/**
 * @interface IGruposEstadisticas
 * @description Estadísticas de grupos del sistema
 */
export interface IGruposEstadisticas {
  /** Total de grupos en el sistema */
  totalGrupos: number;
  /** Grupos activos */
  gruposActivos: number;
  /** Grupos inactivos */
  gruposInactivos: number;
  /** Total de usuarios asignados a grupos */
  usuariosEnGrupos: number;
  /** Usuarios sin grupo asignado */
  usuariosSinGrupo: number;
  /** Grupo con más usuarios */
  grupoMasGrande?: {
    nombre: string;
    cantidadUsuarios: number;
  };
}

/**
 * @interface IFiltrosGrupos
 * @description Filtros para búsqueda de grupos
 */
export interface IFiltrosGrupos {
  /** Búsqueda por nombre */
  busqueda?: string;
  /** Filtrar por estado */
  activo?: boolean;
  /** Ordenar por campo */
  ordenarPor?: 'nombre' | 'fechaCreacion' | 'cantidadUsuarios';
  /** Dirección del ordenamiento */
  direccion?: 'asc' | 'desc';
  /** Página */
  pagina?: number;
  /** Elementos por página */
  limite?: number;
}

/**
 * @interface IGrupoPermiso
 * @description Permisos disponibles para asignar a grupos
 */
export interface IGrupoPermiso {
  /** ID único del permiso */
  id: string;
  /** Nombre del permiso */
  nombre: string;
  /** Descripción del permiso */
  descripcion: string;
  /** Categoría del permiso */
  categoria: string;
  /** Nivel de acceso requerido */
  nivelAcceso: string[];
}