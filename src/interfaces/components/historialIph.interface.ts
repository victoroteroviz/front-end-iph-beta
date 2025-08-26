/**
 * Interfaces para el componente HistorialIPH
 * Manejo de historiales y estadísticas de IPHs
 */

// ==================== INTERFACES BASE ====================

/**
 * Interface para un registro individual de IPH
 */
export interface RegistroHistorialIPH {
  id: number;
  numero_reporte: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  tipo_delito: string;
  estatus: 'Activo' | 'Inactivo' | 'Pendiente' | 'Cancelado';
  usuario: string;
  observaciones?: string;
}

/**
 * Interface para estadísticas del historial
 */
export interface EstadisticasHistorial {
  total_registros: number;
  activos: number;
  inactivos: number;
  pendientes: number;
  cancelados: number;
  total_mes_actual: number;
  promedio_diario: number;
}

/**
 * Filtros para el historial
 */
export interface FiltrosHistorial {
  fechaInicio?: string;
  fechaFin?: string;
  estatus?: string;
  tipoDelito?: string;
  usuario?: string;
  busqueda?: string;
}

/**
 * Paginación para el historial
 */
export interface PaginacionHistorial {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response del servicio de historial
 */
export interface HistorialIPHResponse {
  registros: RegistroHistorialIPH[];
  estadisticas: EstadisticasHistorial;
  paginacion: PaginacionHistorial;
}

// ==================== INTERFACES DE COMPONENTES ====================

/**
 * Props del componente principal HistorialIPH
 */
export interface HistorialIPHProps {
  className?: string;
  initialFilters?: Partial<FiltrosHistorial>;
  itemsPerPage?: number;
}

/**
 * Props para el componente de tabla de historial
 */
export interface HistorialTableProps {
  registros: RegistroHistorialIPH[];
  loading?: boolean;
  onVerDetalle: (registro: RegistroHistorialIPH) => void;
  onEditarEstatus?: (id: number, nuevoEstatus: RegistroHistorialIPH['estatus']) => void;
  className?: string;
}

/**
 * Props para las tarjetas de estadísticas
 */
export interface EstadisticasCardsProps {
  estadisticas: EstadisticasHistorial;
  loading?: boolean;
  className?: string;
}

/**
 * Props para el componente de filtros
 */
export interface FiltrosHistorialProps {
  filtros: FiltrosHistorial;
  onFiltrosChange: (filtros: FiltrosHistorial) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Props para el componente de paginación del historial
 */
export interface PaginacionHistorialProps {
  currentPage: number;
  totalPages: number;
  canGoToNext: boolean;
  canGoToPrevious: boolean;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Props para la vista de detalle de IPH
 */
export interface DetalleIPHProps {
  registro: RegistroHistorialIPH;
  onClose: () => void;
  onEditarEstatus?: (nuevoEstatus: RegistroHistorialIPH['estatus']) => void;
  className?: string;
}

// ==================== INTERFACES DE HOOKS ====================

/**
 * State del hook useHistorialIPH
 */
export interface UseHistorialIPHState {
  registros: RegistroHistorialIPH[];
  estadisticas: EstadisticasHistorial;
  loading: boolean;
  error: string | null;
  filtros: FiltrosHistorial;
  paginacion: PaginacionHistorial;
  registroSeleccionado: RegistroHistorialIPH | null;
}

/**
 * Actions del hook useHistorialIPH
 */
export interface UseHistorialIPHActions {
  setFiltros: (filtros: Partial<FiltrosHistorial>) => void;
  setCurrentPage: (page: number) => void;
  refetchData: () => Promise<void>;
  clearError: () => void;
  verDetalle: (registro: RegistroHistorialIPH) => void;
  cerrarDetalle: () => void;
  editarEstatus: (id: number, nuevoEstatus: RegistroHistorialIPH['estatus']) => Promise<void>;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  hasData: boolean;
}

/**
 * Return type completo del hook useHistorialIPH
 */
export type UseHistorialIPHReturn = UseHistorialIPHState & UseHistorialIPHActions;

/**
 * Parámetros de inicialización del hook
 */
export interface UseHistorialIPHParams {
  initialFilters?: Partial<FiltrosHistorial>;
  itemsPerPage?: number;
}

// ==================== INTERFACES DE SERVICIOS ====================

/**
 * Parámetros para obtener el historial
 */
export interface GetHistorialIPHParams {
  page?: number;
  limit?: number;
  filtros?: FiltrosHistorial;
}

/**
 * Parámetros para actualizar el estatus de un IPH
 */
export interface UpdateEstatusIPHParams {
  id: number;
  nuevoEstatus: RegistroHistorialIPH['estatus'];
  observaciones?: string;
}