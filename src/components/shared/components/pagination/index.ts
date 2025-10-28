/**
 * Barrel export para el componente Pagination genérico
 * Facilita las importaciones y expone toda la API pública
 *
 * @example
 * // Importación básica
 * import Pagination from '@/components/shared/components/pagination';
 *
 * @example
 * // Importación con tipos
 * import Pagination, { PaginationProps, PaginationColors } from '@/components/shared/components/pagination';
 *
 * @example
 * // Importación de utilidades
 * import { getVisiblePages, formatItemsCount } from '@/components/shared/components/pagination';
 */

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export { default } from './Pagination';
export { default as Pagination } from './Pagination';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

export type {
  PaginationProps,
  PaginationColors,
  PaginationConfig,
  PaginationLabels,
  ItemsPerPageConfig,
  VisiblePage,
  VisiblePagesResult
} from './interfaces/pagination.interface';

// =====================================================
// CONSTANTES
// =====================================================

export {
  DEFAULT_COLORS,
  DEFAULT_CONFIG,
  DEFAULT_LABELS
} from './interfaces/pagination.interface';

// =====================================================
// UTILIDADES
// =====================================================

export {
  // Cálculo de páginas
  getVisiblePages,

  // Validaciones
  isPageChangeValid,
  canGoPrevious,
  canGoNext,

  // Formateo
  formatItemsCount,
  formatPageRange,

  // Cálculos de items
  getItemsRange,
  calculateTotalPages,

  // Helpers
  getButtonStyles
  // handleKeyboardNavigation - ELIMINADO: Navegación solo con mouse
} from './utils/pagination.utils';
