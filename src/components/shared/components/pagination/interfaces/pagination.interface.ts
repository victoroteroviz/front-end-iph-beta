/**
 * Interfaces y tipos para el componente Pagination genérico
 * Sistema flexible de temas, configuración y labels
 *
 * @version 1.0.0
 * @author Claude Code
 */

// =====================================================
// TIPOS DE TEMA
// =====================================================

/**
 * Colores configurables para el componente de paginación
 */
export type PaginationColors = {
  /** Color principal para elementos activos */
  primary: string;
  /** Color de hover del principal */
  primaryHover: string;
  /** Color de fondo del contenedor */
  background: string;
  /** Color de bordes */
  border: string;
  /** Color de texto en elementos activos */
  text: string;
  /** Color de texto en elementos inactivos */
  textInactive: string;
  /** Color de gradiente secundario (opcional) */
  gradientSecondary?: string;
};

// =====================================================
// CONFIGURACIÓN DE COMPORTAMIENTO
// =====================================================

/**
 * Configuración del comportamiento del componente
 */
export type PaginationConfig = {
  /** Número de páginas visibles a cada lado de la página actual (default: 2) */
  delta?: number;
  /** Mostrar información de "Página X de Y" (default: true) */
  showInfo?: boolean;
  /** Mostrar contador de elementos totales (default: true) */
  showTotalItems?: boolean;
  /** Mostrar botones de números de página (default: true) */
  showPageNumbers?: boolean;
  /** Mostrar botones Anterior/Siguiente (default: true) */
  showNavigationButtons?: boolean;
  /** Ocultar componente si solo hay 1 página (default: true) */
  hideOnSinglePage?: boolean;
  /** Máximo de páginas visibles antes de usar ellipsis (default: 7) */
  maxVisiblePages?: number;
  /** Mostrar efecto de brillo en hover (default: true) */
  showHoverEffect?: boolean;
  /** Mostrar indicador de página activa (punto pulsante) (default: true) */
  showActiveIndicator?: boolean;
};

// =====================================================
// LABELS (i18n)
// =====================================================

/**
 * Textos configurables para internacionalización
 */
export type PaginationLabels = {
  /** Texto del botón "Anterior" (default: "Anterior") */
  previous?: string;
  /** Texto del botón "Siguiente" (default: "Siguiente") */
  next?: string;
  /** Texto "Página" (default: "Página") */
  page?: string;
  /** Texto "de" (default: "de") */
  of?: string;
  /** Texto para elementos totales (default: "elemento") */
  item?: string;
  /** Texto para elementos totales plural (default: "elementos") */
  items?: string;
  /** Texto "en total" (default: "en total") */
  inTotal?: string;
  /** Texto para aria-label "Ir a página" (default: "Ir a página") */
  goToPage?: string;
  /** Texto "Página anterior" (default: "Página anterior") */
  previousPage?: string;
  /** Texto "Página siguiente" (default: "Página siguiente") */
  nextPage?: string;
  /** Texto "Cargando páginas..." (default: "Cargando páginas...") */
  loading?: string;
  /** Texto para items per page (default: "Elementos por página") */
  itemsPerPage?: string;
};

// =====================================================
// ITEMS PER PAGE
// =====================================================

/**
 * Configuración para el selector de items por página
 */
export type ItemsPerPageConfig = {
  /** Número actual de items por página */
  current: number;
  /** Opciones disponibles (ej: [10, 20, 50, 100]) */
  options: number[];
  /** Callback cuando cambia el número de items */
  onChange: (items: number) => void;
  /** Mostrar el selector (default: true si se proporciona config) */
  show?: boolean;
};

// =====================================================
// PROPS DEL COMPONENTE
// =====================================================

/**
 * Props del componente Pagination genérico
 */
export interface PaginationProps {
  // ========== PROPS OBLIGATORIAS ==========
  /** Página actual (1-indexed) */
  currentPage: number;
  /** Total de páginas disponibles */
  totalPages: number;
  /** Callback cuando cambia la página */
  onPageChange: (page: number) => void;

  // ========== PROPS OPCIONALES DE DATOS ==========
  /** Total de elementos (para mostrar contador) */
  totalItems?: number;
  /** Estado de carga (deshabilita interacciones) */
  loading?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;

  // ========== CONFIGURACIÓN DE TEMA ==========
  /** Colores personalizados (sobrescribe defaults) */
  colors?: Partial<PaginationColors>;
  /** Fuente personalizada (default: 'font-poppins') */
  fontFamily?: string;

  // ========== CONFIGURACIÓN DE COMPORTAMIENTO ==========
  /** Configuración de comportamiento del componente */
  config?: Partial<PaginationConfig>;

  // ========== TEXTOS PERSONALIZADOS (i18n) ==========
  /** Labels personalizados para internacionalización */
  labels?: Partial<PaginationLabels>;

  // ========== ITEMS PER PAGE ==========
  /** Configuración del selector de items por página */
  itemsPerPageConfig?: ItemsPerPageConfig;
}

// =====================================================
// VALORES POR DEFECTO
// =====================================================

/**
 * Colores por defecto (tema IPH)
 */
export const DEFAULT_COLORS: PaginationColors = {
  primary: '#c2b186',
  primaryHover: '#4d4725',
  background: '#fdf7f1',
  border: '#c2b186',
  text: 'white',
  textInactive: '#6b7280',
  gradientSecondary: '#b8ab84'
};

/**
 * Configuración por defecto
 */
export const DEFAULT_CONFIG: Required<PaginationConfig> = {
  delta: 2,
  showInfo: true,
  showTotalItems: true,
  showPageNumbers: true,
  showNavigationButtons: true,
  hideOnSinglePage: true,
  maxVisiblePages: 7,
  showHoverEffect: true,
  showActiveIndicator: true
};

/**
 * Labels por defecto (español)
 */
export const DEFAULT_LABELS: Required<PaginationLabels> = {
  previous: 'Anterior',
  next: 'Siguiente',
  page: 'Página',
  of: 'de',
  item: 'elemento',
  items: 'elementos',
  inTotal: 'en total',
  goToPage: 'Ir a página',
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  loading: 'Cargando páginas...',
  itemsPerPage: 'Elementos por página'
};

// =====================================================
// TIPOS AUXILIARES
// =====================================================

/**
 * Tipo para páginas visibles (números o ellipsis)
 */
export type VisiblePage = number | '...';

/**
 * Resultado del cálculo de páginas visibles
 */
export type VisiblePagesResult = {
  pages: VisiblePage[];
  hasEllipsisLeft: boolean;
  hasEllipsisRight: boolean;
};
