/**
 * Interfaces para el componente InformePolicial
 * Sistema completo de tipos para lista de IPH con filtros y paginación
 */

// =====================================================
// INTERFACES DE DATOS BASE
// =====================================================

export interface ITipoIPH {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
}

export interface IEstatusIPH {
  id: string;
  nombre: string;
  is_active?: 'Online' | 'Offline' | string;
  color?: string;
  codigo?: string;
}

export interface IRegistroIPH {
  id: string;
  n_referencia: string;
  n_folio_sist: string;
  tipo?: ITipoIPH;
  estatus?: IEstatusIPH;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  usuario_id?: string;
  // Campos adicionales que puedan venir del servidor
  hechos?: string;
  observaciones?: string;
  latitud?: number;
  longitud?: number;
}

// =====================================================
// INTERFACES DE FILTROS Y PARÁMETROS
// =====================================================

export interface IInformePolicialFilters {
  page: number;
  orderBy: 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion';
  order: 'ASC' | 'DESC';
  search: string;
  searchBy: 'n_referencia' | 'n_folio_sist';
  tipoId?: string; // Filtro por tipo de IPH
}

export interface IInformePolicialPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// =====================================================
// INTERFACES DE COMPONENTES
// =====================================================

export interface IInformePolicialProps {
  className?: string;
  autoRefreshInterval?: number; // en milisegundos, default: 300000 (5 min)
  showAutoRefreshIndicator?: boolean;
}

export interface IIPHFiltersProps {
  filters: IInformePolicialFilters;
  loading: boolean;
  onFiltersChange: (filters: Partial<IInformePolicialFilters>) => void;
  onSearch: () => void;
  onClear: () => void;
  onRefresh: () => void;
  className?: string;
}

export interface IIPHCardProps {
  registro: IRegistroIPH;
  onClick: (registro: IRegistroIPH) => void;
  loading?: boolean;
  className?: string;
}

export interface IIPHCardsGridProps {
  registros: IRegistroIPH[];
  loading: boolean;
  onCardClick: (registro: IRegistroIPH) => void;
  className?: string;
}

export interface IIPHPaginationProps {
  pagination: IInformePolicialPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface IIPHSkeletonCardProps {
  className?: string;
}

export interface IAutoRefreshIndicatorProps {
  isActive: boolean;
  nextRefreshIn: number; // segundos restantes
  onToggle: () => void;
  className?: string;
}

export interface IIPHTipoFilterProps {
  tipos: ITipoIPH[];
  selectedTipoId: string;
  loading: boolean;
  onTipoChange: (tipoId: string) => void;
  className?: string;
}

// =====================================================
// INTERFACES DE HOOK Y ESTADO
// =====================================================

export interface IInformePolicialState {
  registros: IRegistroIPH[];
  pagination: IInformePolicialPagination;
  filters: IInformePolicialFilters;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  autoRefreshEnabled: boolean;
  nextAutoRefresh: number; // timestamp
  userCanViewAll: boolean; // true para SuperAdmin/Admin/Superior, false para Elemento
  currentUserId: string | null;
  tiposIPH: ITipoIPH[]; // Tipos de IPH disponibles
  tiposLoading: boolean; // Estado de carga de tipos
}

export interface IUseInformePolicialReturn {
  state: IInformePolicialState;
  updateFilters: (filters: Partial<IInformePolicialFilters>) => void;
  handleSearch: () => void;
  handleClearFilters: () => void;
  handlePageChange: (page: number) => void;
  handleCardClick: (registro: IRegistroIPH) => void;
  handleManualRefresh: () => Promise<void>;
  toggleAutoRefresh: () => void;
  loadIPHs: (showLoadingIndicator?: boolean) => Promise<void>;
  canViewRecord: (registro: IRegistroIPH) => boolean;
  hasData: boolean;
  isAnyLoading: boolean;
  timeUntilNextRefresh: number;
  visibleRecords: IRegistroIPH[];
}

// =====================================================
// INTERFACES DE SERVICIOS
// =====================================================

export interface IInformePolicialService {
  getIPHList: (params: IInformePolicialFilters, userId?: string) => Promise<{
    data: IRegistroIPH[];
    totalPages: number;
    totalItems: number;
    currentPage: number;
  }>;
}

// =====================================================
// TIPOS AUXILIARES
// =====================================================

export type IPHIconType = 'delictivo' | 'administrativo' | 'default';

export type InformePolicialError = 
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED_ACCESS'
  | 'INVALID_FILTERS'
  | 'SERVICE_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export type SortDirection = 'ASC' | 'DESC';

export type SearchField = 'n_referencia' | 'n_folio_sist';

// =====================================================
// CONFIGURACIONES Y CONSTANTES
// =====================================================

export const INFORME_POLICIAL_CONFIG = {
  AUTO_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutos
  SEARCH_DEBOUNCE_DELAY: 500, // 500ms
  ITEMS_PER_PAGE: 12,
  MAX_PAGES_VISIBLE: 7,
  SKELETON_CARDS_COUNT: 6,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

export const DEFAULT_FILTERS: IInformePolicialFilters = {
  page: 1,
  orderBy: 'fecha_creacion',
  order: 'DESC',
  search: '',
  searchBy: 'n_referencia',
  tipoId: '' // Sin filtro por tipo por defecto
};

export const SEARCH_OPTIONS = [
  { value: 'n_referencia' as const, label: 'Referencia' },
  { value: 'n_folio_sist' as const, label: 'Folio' }
];

export const ORDER_OPTIONS = [
  { value: 'fecha_creacion' as const, label: 'Fecha' },
  { value: 'estatus' as const, label: 'Estatus' },
  { value: 'n_referencia' as const, label: 'Referencia' },
  { value: 'n_folio_sist' as const, label: 'Folio' }
];

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Determina el tipo de icono basado en el nombre del tipo
 * @param tipoNombre - Nombre del tipo de IPH
 * @returns Tipo de icono a mostrar
 */
export const getIPHIconType = (tipoNombre?: string): IPHIconType => {
  if (!tipoNombre) return 'default';
  return tipoNombre.toLowerCase().includes('delictivo') ? 'delictivo' : 'administrativo';
};

/**
 * Verifica si un estatus está activo/online
 * @param estatus - Objeto estatus del IPH
 * @returns true si está online
 */
export const isStatusActive = (estatus?: IEstatusIPH): boolean => {
  return estatus?.is_active === 'Online';
};

/**
 * Calcula el tiempo restante para el próximo auto-refresh
 * @param nextRefreshTimestamp - Timestamp del próximo refresh
 * @returns Segundos restantes
 */
export const getTimeUntilNextRefresh = (nextRefreshTimestamp: number): number => {
  const now = Date.now();
  const remaining = Math.max(0, Math.floor((nextRefreshTimestamp - now) / 1000));
  return remaining;
};

/**
 * Genera texto descriptivo para el estado del registro
 * @param registro - Registro IPH
 * @returns Descripción del estado
 */
export const getStatusDescription = (registro: IRegistroIPH): string => {
  const isActive = isStatusActive(registro.estatus);
  const statusName = registro.estatus?.nombre || 'Sin estado';
  return `${statusName} ${isActive ? '(Activo)' : '(Inactivo)'}`;
};

/**
 * Formatea la fecha de creación para mostrar
 * @param fecha - Fecha en formato ISO string
 * @returns Fecha formateada para mostrar
 */
export const formatCreationDate = (fecha?: string): string => {
  if (!fecha) return 'Sin fecha';
  
  try {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

// =====================================================
// VALIDADORES
// =====================================================

/**
 * Valida si los filtros son válidos
 * @param filters - Filtros a validar
 * @returns true si son válidos
 */
export const areFiltersValid = (filters: IInformePolicialFilters): boolean => {
  return (
    filters.page > 0 &&
    ['ASC', 'DESC'].includes(filters.order) &&
    ['estatus', 'n_referencia', 'n_folio_sist', 'fecha_creacion'].includes(filters.orderBy) &&
    ['n_referencia', 'n_folio_sist'].includes(filters.searchBy) &&
    typeof filters.search === 'string'
  );
};

/**
 * Valida si un registro IPH es válido
 * @param registro - Registro a validar
 * @returns true si es válido
 */
export const isValidIPHRecord = (registro: IRegistroIPH): boolean => {
  return !!(
    registro &&
    registro.id &&
    registro.n_referencia &&
    registro.n_folio_sist
  );
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  INFORME_POLICIAL_CONFIG,
  DEFAULT_FILTERS,
  SEARCH_OPTIONS,
  ORDER_OPTIONS,
  getIPHIconType,
  isStatusActive,
  getTimeUntilNextRefresh,
  getStatusDescription,
  formatCreationDate,
  areFiltersValid,
  isValidIPHRecord
};