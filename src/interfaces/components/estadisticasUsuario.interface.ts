/**
 * Interfaces para el componente EstadisticasUsuario refactorizado
 */

// Re-export de interfaces existentes
export type { IUsuarioIphCount, IUsuarioIphCountResponse } from '../statistics/statistics.interface';

/**
 * Props del componente EstadisticasUsuario
 */
export interface EstadisticasUsuarioProps {
  className?: string;
  initialMes?: number;
  initialAnio?: number;
  itemsPerPage?: number;
}

/**
 * Estado del hook useEstadisticasUsuario
 */
export interface EstadisticasUsuarioState {
  usuarios: IUsuarioIphCount[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  mes: number;
  anio: number;
  hasData: boolean;
}

/**
 * Filtros para las estadísticas
 */
export interface EstadisticasFilters {
  mes: number;
  anio: number;
  page: number;
}

/**
 * Configuración del hook useEstadisticasUsuario
 */
export interface UseEstadisticasUsuarioConfig {
  initialMes?: number;
  initialAnio?: number;
  itemsPerPage?: number;
  autoLoad?: boolean;
}

/**
 * Return type del hook useEstadisticasUsuario
 */
export interface UseEstadisticasUsuarioReturn {
  // Estados
  usuarios: IUsuarioIphCount[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  mes: number;
  anio: number;
  hasData: boolean;

  // Acciones
  setMes: (mes: number) => void;
  setAnio: (anio: number) => void;
  setCurrentPage: (page: number) => void;
  refetchData: () => Promise<void>;
  clearError: () => void;

  // Helpers
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

/**
 * Props para componente UsuarioCard
 */
export interface UsuarioCardProps {
  usuario: IUsuarioIphCount;
  className?: string;
  onClick?: (usuario: IUsuarioIphCount) => void;
}

/**
 * Props para componente filtros
 */
export interface EstadisticasFiltersProps {
  mes: number;
  anio: number;
  onMesChange: (mes: number) => void;
  onAnioChange: (anio: number) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Props para componente paginación
 */
export interface PaginationProps {
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

// Re-export para conveniencia
import type { IUsuarioIphCount } from '../statistics/statistics.interface';
export type Usuario = IUsuarioIphCount;