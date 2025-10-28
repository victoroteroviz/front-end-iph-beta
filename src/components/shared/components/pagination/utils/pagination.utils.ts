/**
 * Utilidades para el componente Pagination
 * Lógica pura y reutilizable para cálculos de paginación
 *
 * @version 1.0.0
 * @author Claude Code
 */

import type { VisiblePage, VisiblePagesResult } from '../interfaces/pagination.interface';

// =====================================================
// CÁLCULO DE PÁGINAS VISIBLES
// =====================================================

/**
 * Calcula qué páginas deben ser visibles con ellipsis
 *
 * @param currentPage - Página actual (1-indexed)
 * @param totalPages - Total de páginas
 * @param delta - Páginas visibles a cada lado de la actual
 * @returns Array con números de página y ellipsis ('...')
 *
 * @example
 * getVisiblePages(5, 10, 2)
 * // Returns: [1, '...', 3, 4, 5, 6, 7, '...', 10]
 */
export const getVisiblePages = (
  currentPage: number,
  totalPages: number,
  delta: number = 2
): VisiblePagesResult => {
  const rangeWithDots: VisiblePage[] = [];
  const range: number[] = [];

  // Si hay muy pocas páginas, mostrar todas
  if (totalPages <= delta * 2 + 3) {
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i);
    }
    return {
      pages: rangeWithDots,
      hasEllipsisLeft: false,
      hasEllipsisRight: false
    };
  }

  // Calcular rango de páginas visibles alrededor de la actual
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  // Determinar si necesitamos ellipsis a la izquierda
  const hasEllipsisLeft = currentPage - delta > 2;

  // Determinar si necesitamos ellipsis a la derecha
  const hasEllipsisRight = currentPage + delta < totalPages - 1;

  // Primera página siempre visible
  if (hasEllipsisLeft) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  // Páginas del rango central
  rangeWithDots.push(...range);

  // Última página siempre visible
  if (hasEllipsisRight) {
    rangeWithDots.push('...', totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return {
    pages: rangeWithDots,
    hasEllipsisLeft,
    hasEllipsisRight
  };
};

// =====================================================
// VALIDACIONES
// =====================================================

/**
 * Valida si un cambio de página es permitido
 *
 * @param targetPage - Página objetivo
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param loading - Si está cargando
 * @returns true si el cambio es válido
 */
export const isPageChangeValid = (
  targetPage: number,
  currentPage: number,
  totalPages: number,
  loading: boolean = false
): boolean => {
  // No permitir si está cargando
  if (loading) return false;

  // No permitir si es la misma página
  if (targetPage === currentPage) return false;

  // No permitir si está fuera del rango
  if (targetPage < 1 || targetPage > totalPages) return false;

  return true;
};

/**
 * Valida si se puede ir a la página anterior
 *
 * @param currentPage - Página actual
 * @param loading - Si está cargando
 * @returns true si se puede ir atrás
 */
export const canGoPrevious = (
  currentPage: number,
  loading: boolean = false
): boolean => {
  return !loading && currentPage > 1;
};

/**
 * Valida si se puede ir a la página siguiente
 *
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param loading - Si está cargando
 * @returns true si se puede ir adelante
 */
export const canGoNext = (
  currentPage: number,
  totalPages: number,
  loading: boolean = false
): boolean => {
  return !loading && currentPage < totalPages;
};

// =====================================================
// FORMATEO
// =====================================================

/**
 * Formatea el contador de elementos con singular/plural
 *
 * @param count - Número de elementos
 * @param singular - Texto singular (ej: "elemento")
 * @param plural - Texto plural (ej: "elementos")
 * @returns Texto formateado
 *
 * @example
 * formatItemsCount(1, 'elemento', 'elementos')
 * // Returns: "1 elemento"
 *
 * formatItemsCount(10, 'elemento', 'elementos')
 * // Returns: "10 elementos"
 */
export const formatItemsCount = (
  count: number,
  singular: string = 'elemento',
  plural: string = 'elementos'
): string => {
  return `${count} ${count === 1 ? singular : plural}`;
};

/**
 * Formatea el rango de páginas actual
 *
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param pageLabel - Texto "Página"
 * @param ofLabel - Texto "de"
 * @returns Texto formateado
 *
 * @example
 * formatPageRange(3, 10, 'Página', 'de')
 * // Returns: "Página 3 de 10"
 */
export const formatPageRange = (
  currentPage: number,
  totalPages: number,
  pageLabel: string = 'Página',
  ofLabel: string = 'de'
): string => {
  return `${pageLabel} ${currentPage} ${ofLabel} ${totalPages}`;
};

// =====================================================
// CÁLCULOS DE ITEMS
// =====================================================

/**
 * Calcula el rango de items mostrados en la página actual
 *
 * @param currentPage - Página actual (1-indexed)
 * @param itemsPerPage - Items por página
 * @param totalItems - Total de items
 * @returns Objeto con { start, end }
 *
 * @example
 * getItemsRange(2, 10, 25)
 * // Returns: { start: 11, end: 20 }
 */
export const getItemsRange = (
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): { start: number; end: number } => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return { start, end };
};

/**
 * Calcula el total de páginas basado en items
 *
 * @param totalItems - Total de items
 * @param itemsPerPage - Items por página
 * @returns Total de páginas
 */
export const calculateTotalPages = (
  totalItems: number,
  itemsPerPage: number
): number => {
  if (itemsPerPage <= 0) return 1;
  return Math.ceil(totalItems / itemsPerPage);
};

// =====================================================
// CLASES CSS HELPERS
// =====================================================

/**
 * Genera clases CSS para botones con colores personalizados
 *
 * @param colors - Objeto con colores
 * @param isActive - Si el botón está activo
 * @returns String con clases CSS inline
 */
export const getButtonStyles = (
  colors: {
    primary: string;
    primaryHover: string;
    border: string;
  },
  isActive: boolean = false
): React.CSSProperties => {
  if (isActive) {
    return {
      backgroundColor: colors.primary,
      borderColor: colors.border,
      color: 'white'
    };
  }

  return {
    borderColor: colors.border,
    color: colors.primary
  };
};

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

/**
 * Maneja la navegación por teclado en paginación
 *
 * @param event - Evento de teclado
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas
 * @param onPageChange - Callback para cambiar página
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  currentPage: number,
  totalPages: number,
  onPageChange: (page: number) => void
): void => {
  switch (event.key) {
    case 'ArrowLeft':
      if (currentPage > 1) {
        event.preventDefault();
        onPageChange(currentPage - 1);
      }
      break;
    case 'ArrowRight':
      if (currentPage < totalPages) {
        event.preventDefault();
        onPageChange(currentPage + 1);
      }
      break;
    case 'Home':
      if (currentPage !== 1) {
        event.preventDefault();
        onPageChange(1);
      }
      break;
    case 'End':
      if (currentPage !== totalPages) {
        event.preventDefault();
        onPageChange(totalPages);
      }
      break;
  }
};
