/**
 * Interfaces para el componente HistorialIPH
 * Manejo de historiales y estadísticas de IPHs
 */

// ==================== INTERFACES BASE ====================

/**
 * Interface para la ubicación de un IPH
 */
export interface UbicacionHistorialIPH {
  latitud: number;
  longitud: number;
}

/**
 * Interface para un registro individual de IPH (actualizada para servicio real)
 */
export interface RegistroHistorialIPH {
  id: string;
  numeroReferencia: string;
  fechaCreacion: Date;
  ubicacion?: UbicacionHistorialIPH;
  tipoDelito: string;
  estatus: string;
  usuario: string;
  observaciones?: string;
  archivosAdjuntos?: string[];
}

/**
 * Interface para estadísticas del historial (adaptada para datos dinámicos del servicio)
 */
export interface EstadisticasHistorial {
  total: number;
  promedioPorDia: number;
  registroPorMes: number;
  estatusPorIph: Array<{
    estatus: string;
    cantidad: number;
  }>;
}

/**
 * Filtros para el historial (actualizada para servicio real)
 */
export interface FiltrosHistorial {
  fechaInicio?: string;
  fechaFin?: string;
  estatus?: string;
  tipoDelito?: string;
  usuario?: string;
  busqueda?: string;
  busquedaPor?: 'estatus' | 'tipoDelito' | 'usuario';
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
  onEditarEstatus?: (id: string, nuevoEstatus: RegistroHistorialIPH['estatus']) => void;
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
  onFiltrosChange: (filtros: Partial<FiltrosHistorial>) => void;
  loading?: boolean;
  estatusOptions?: string[];
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
  estatusOptions: string[];
}

/**
 * Actions del hook useHistorialIPH
 */
export interface UseHistorialIPHActions {
  setFiltros: (filtros: Partial<FiltrosHistorial>) => void;
  clearAllFilters: () => void;
  setCurrentPage: (page: number) => void;
  refetchData: () => Promise<void>;
  clearError: () => void;
  verDetalle: (registro: RegistroHistorialIPH) => void;
  cerrarDetalle: () => void;
  editarEstatus: (id: string, nuevoEstatus: RegistroHistorialIPH['estatus']) => Promise<void>;
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
  id: string;
  nuevoEstatus: RegistroHistorialIPH['estatus'];
  observaciones?: string;
}

// ==================== NUEVAS INTERFACES PARA API ====================

/**
 * Interface para las coordenadas geográficas
 */
export interface Coordenadas {
  longitud: string;
  latitud: string;
}

/**
 * Interface principal de respuesta del servicio de historial
 */
export interface info {
  paginas: number;
  total: number;
  iph: ResHistory[];
}

/**
 * Interface para los datos de historial (elementos individuales)
 */
export interface ResHistory {
  id: string;
  nReferencia: string;
  fechaCreacion: string;
  ubicacion: Coordenadas | undefined;
  tipoDelito: string | undefined;
  estatus: string;
  usuario: string;
}

/**
 * Interface para la respuesta paginada del historial (compatibilidad)
 */
export interface PaginatedResHistory {
  data: ResHistoryData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interface para los datos de historial (alias de ResHistory para compatibilidad)
 */
export interface ResHistoryData {
  id: string;
  nReferencia: string;
  fechaCreacion: string;
  ubicacion: Coordenadas | undefined;
  tipoDelito: string | undefined;
  estatus: string;
  usuario: string;
}