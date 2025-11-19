/**
 * Interfaces para el componente Usuarios
 * Define todos los tipos necesarios para la gestión de lista de usuarios
 */

import type { IPaginatedUsers } from '../user/crud/get-paginated.users.interface';

// =====================================================
// INTERFACES DE FILTROS Y BÚSQUEDA
// =====================================================

export type SortableColumn = 'nombre' | 'cuip' | 'cup' | 'gradoId' | 'cargoId';

export interface IUsuariosFilters {
  search: string;
  searchBy: 'nombre' | 'cuip' | 'cup' | 'grado' | 'cargo';
  orderBy: SortableColumn;
  order: 'ASC' | 'DESC';
  page: number;
  limit: number; // Items per page for pagination
}

export interface IUsuariosParams {
  page?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
  searchBy?: string;
}

// =====================================================
// INTERFACES DE ESTADÍSTICAS (DUMMY)
// =====================================================

export interface IUsuarioEstadistica {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

export interface IEstadisticasUsuarios {
  masIph: IUsuarioEstadistica;
  mejorTiempo: IUsuarioEstadistica;
  peorRendimiento: IUsuarioEstadistica;
}

export interface IUsuarioMetricas {
  totalIph: number;
  iphCompletados: number;
  iphPendientes: number;
  tiempoPromedio: string;
  efectividad: string;
  ranking: number;
  tendencia: 'up' | 'down' | 'stable';
}

// =====================================================
// INTERFACES DE ESTADO
// =====================================================

export interface IUsuariosState {
  // Datos principales
  usuarios: IPaginatedUsers[];

  // Estados de carga
  isLoading: boolean;
  isDeleting: string | null; // ID del usuario siendo eliminado

  // Estados de error
  error: string | null;
  deleteError: string | null;

  // Filtros y búsqueda
  filters: IUsuariosFilters;

  // Paginación
  totalPages: number;
  totalUsers: number;
  
  // Control de acceso
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewAllUsers: boolean;

  // Modal de eliminación
  deleteModalOpen: boolean;
  usuarioToDelete: IPaginatedUsers | null;
}

// =====================================================
// INTERFACES DE PROPS
// =====================================================

export interface IUsuariosProps {
  className?: string;
  showStatistics?: boolean;
  compactView?: boolean;
}

export interface IUsuariosTableProps {
  usuarios: IPaginatedUsers[];
  loading: boolean;
  filters: IUsuariosFilters;
  canEdit: boolean;
  canDelete: boolean;
  onSort: (column: SortableColumn) => void;
  onEdit: (usuario: IPaginatedUsers) => void;
  onDelete: (usuario: IPaginatedUsers) => void;
  className?: string;
}

export interface IUsuariosFiltersProps {
  filters: IUsuariosFilters;
  loading: boolean;
  canCreate: boolean;
  onFiltersChange: (filters: Partial<IUsuariosFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
  onCreate: () => void;
  className?: string;
}

export interface IEstadisticasCardsProps {
  estadisticas: IEstadisticasUsuarios | null;
  loading: boolean;
  className?: string;
}

export interface IUsuarioStatsModalProps {
  usuario: IPaginatedUsers | null;
  metricas: IUsuarioMetricas | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
}

export interface IPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
}

// =====================================================
// INTERFACES DE RESPUESTA API
// =====================================================

export interface IUsuariosResponse {
  data: IPaginatedUsers[];
  totalPages: number;
  totalUsers: number;
  currentPage: number;
}

export interface IEstadisticasResponse {
  success: boolean;
  data: IEstadisticasUsuarios;
  message?: string;
}

export interface IUsuarioMetricasResponse {
  success: boolean;
  data: IUsuarioMetricas;
  message?: string;
}

// =====================================================
// INTERFACES DEL HOOK
// =====================================================

export interface IUseUsuariosReturn {
  // Estado
  state: IUsuariosState;

  // Funciones de filtros
  updateFilters: (filters: Partial<IUsuariosFilters>) => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
  handleSort: (column: SortableColumn) => void;

  // Funciones de paginación
  handlePageChange: (page: number) => void;

  // Funciones de acciones
  handleCreateUser: () => void;
  handleEditUser: (usuario: IPaginatedUsers) => void;
  handleDeleteUser: (usuario: IPaginatedUsers) => void;
  
  // Funciones del modal de eliminación
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  
  // Utilidades
  refreshData: () => Promise<void>;
  canPerformAction: (action: string) => boolean;
}

// =====================================================
// INTERFACES DE VALIDACIÓN
// =====================================================

export interface IUsuariosValidation {
  isValidSearchTerm: (term: string) => boolean;
  isValidOrderBy: (orderBy: string) => boolean;
  isValidPage: (page: number, totalPages: number) => boolean;
}

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export const UsuariosAction = {
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  VIEW_STATS: 'view_stats',
  EXPORT: 'export'
} as const;

export type UsuariosAction = typeof UsuariosAction[keyof typeof UsuariosAction];

export const UsuariosPermission = {
  MANAGE_ALL_USERS: 'manage_all_users',
  MANAGE_TEAM_USERS: 'manage_team_users',
  VIEW_ALL_USERS: 'view_all_users',
  VIEW_TEAM_USERS: 'view_team_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  VIEW_USER_STATS: 'view_user_stats'
} as const;

export type UsuariosPermission = typeof UsuariosPermission[keyof typeof UsuariosPermission];

export const USUARIOS_SEARCH_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'cuip', label: 'CUIP' },
  { value: 'cup', label: 'CUP' },
  { value: 'grado', label: 'Grado' },
  { value: 'cargo', label: 'Cargo' }
] as const;

export const USUARIOS_ORDER_OPTIONS = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'cuip', label: 'CUIP' },
  { value: 'cup', label: 'CUP' },
  { value: 'gradoId', label: 'Grado' },
  { value: 'cargoId', label: 'Cargo' }
] as const;

export const DEFAULT_USUARIOS_FILTERS: IUsuariosFilters = {
  search: '',
  searchBy: 'nombre',
  orderBy: 'nombre',
  order: 'ASC',
  page: 1,
  limit: 20 // Default items per page
};

// =====================================================
// INTERFACES DE CONFIGURACIÓN
// =====================================================

export interface IUsuariosConfig {
  pageSize: number;
  maxSearchLength: number;
  debounceDelay: number;
  enableVirtualization: boolean;
  virtualItemHeight: number;
  showStatistics: boolean;
}

export const DEFAULT_USUARIOS_CONFIG: IUsuariosConfig = {
  pageSize: 20,
  maxSearchLength: 100,
  debounceDelay: 500,
  enableVirtualization: true,
  virtualItemHeight: 60,
  showStatistics: true
};