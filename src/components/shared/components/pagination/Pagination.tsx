/**
 * Componente Pagination Genérico
 * Sistema flexible con temas configurables, i18n y comportamiento customizable
 *
 * @version 1.0.0
 * @author Claude Code
 *
 * @example
 * // Uso básico
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={handlePageChange}
 * />
 *
 * @example
 * // Uso completo con todas las opciones
 * <Pagination
 *   currentPage={2}
 *   totalPages={20}
 *   totalItems={200}
 *   onPageChange={handlePageChange}
 *   loading={false}
 *   colors={{
 *     primary: '#3b82f6',
 *     primaryHover: '#2563eb',
 *   }}
 *   config={{
 *     delta: 3,
 *     showTotalItems: true,
 *   }}
 *   labels={{
 *     previous: 'Prev',
 *     next: 'Next',
 *   }}
 *   itemsPerPageConfig={{
 *     current: 20,
 *     options: [10, 20, 50, 100],
 *     onChange: handleItemsPerPageChange,
 *   }}
 * />
 */

import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// Interfaces y utils
import type {
  PaginationProps,
  PaginationColors,
  PaginationConfig,
  PaginationLabels
} from './interfaces/pagination.interface';
import {
  DEFAULT_COLORS,
  DEFAULT_CONFIG,
  DEFAULT_LABELS
} from './interfaces/pagination.interface';
import {
  getVisiblePages,
  isPageChangeValid,
  canGoPrevious,
  canGoNext,
  formatItemsCount
} from './utils/pagination.utils';

// =====================================================
// CONSTANTES DE DISEÑO
// =====================================================

/**
 * Constantes para prevenir números mágicos y facilitar mantenimiento
 */
const DESIGN_CONSTANTS = {
  /** Ancho mínimo de botón de página en px */
  BUTTON_SIZE: 44,
  /** Ancho de botones de navegación (Anterior/Siguiente) en px */
  NAVIGATION_BUTTON_WIDTH: 100,
  /** Gap entre botones en px (equivalente a space-x-2 de Tailwind) */
  BUTTON_GAP: 8,
  /** Gap estándar en contenedores (equivalente a gap-4 de Tailwind) */
  CONTAINER_GAP: 16,
  /** Radio de focus ring */
  FOCUS_RING_WIDTH: 2,
  /** Offset de focus ring */
  FOCUS_RING_OFFSET: 2
} as const;

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const Pagination: React.FC<PaginationProps> = ({
  // Props obligatorias
  currentPage,
  totalPages,
  onPageChange,

  // Props opcionales
  totalItems,
  loading = false,
  className = '',

  // Configuración de tema
  colors: customColors,
  fontFamily = 'font-poppins',

  // Configuración de comportamiento
  config: customConfig,

  // Labels personalizados
  labels: customLabels,

  // Items per page
  itemsPerPageConfig
}) => {
  // =====================================================
  // MERGE DE CONFIGURACIONES
  // =====================================================

  const colors: PaginationColors = useMemo(
    () => ({ ...DEFAULT_COLORS, ...customColors }),
    [customColors]
  );

  const config: Required<PaginationConfig> = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...customConfig }),
    [customConfig]
  );

  const labels: Required<PaginationLabels> = useMemo(
    () => ({ ...DEFAULT_LABELS, ...customLabels }),
    [customLabels]
  );

  // =====================================================
  // HANDLERS (SIEMPRE DEBEN EJECUTARSE - RULES OF HOOKS)
  // =====================================================

  const handlePageChange = useCallback(
    (page: number) => {
      if (!isPageChangeValid(page, currentPage, totalPages, loading)) {
        return;
      }
      onPageChange(page);
    },
    [currentPage, totalPages, loading, onPageChange]
  );

  // =====================================================
  // VALORES COMPUTADOS (SIEMPRE DEBEN EJECUTARSE)
  // =====================================================

  const visiblePagesResult = useMemo(
    () => getVisiblePages(currentPage, totalPages, config.delta),
    [currentPage, totalPages, config.delta]
  );

  const canPrev = useMemo(
    () => canGoPrevious(currentPage, loading),
    [currentPage, loading]
  );

  const canNext = useMemo(
    () => canGoNext(currentPage, totalPages, loading),
    [currentPage, totalPages, loading]
  );

  // =====================================================
  // CÁLCULO DE ANCHO MÍNIMO PARA EVITAR LAYOUT SHIFT
  // =====================================================

  /**
   * Calcula el ancho mínimo del contenedor de botones
   * Basado en el máximo número de botones que pueden aparecer
   *
   * Estructura peor caso: [Anterior] [1] [...] [N-2] [N-1] [N] [N+1] [N+2] [...] [Total] [Siguiente]
   * - 2 botones de navegación: 100px cada uno
   * - Máximo de botones de página: delta*2 + 5 (primera + ellipsis + rango + ellipsis + última)
   * - Gap entre botones: 8px
   */
  const { minWidth, maxButtons } = useMemo(() => {
    // Si hay pocas páginas, mostrar todas (sin ellipsis)
    if (totalPages <= config.delta * 2 + 3) {
      const buttons = totalPages;
      return {
        maxButtons: buttons,
        minWidth: config.showNavigationButtons
          ? (DESIGN_CONSTANTS.NAVIGATION_BUTTON_WIDTH * 2) + // Anterior + Siguiente
            (buttons * DESIGN_CONSTANTS.BUTTON_SIZE) + // Botones de página
            ((buttons + 1) * DESIGN_CONSTANTS.BUTTON_GAP) // Gaps entre todos
          : (buttons * DESIGN_CONSTANTS.BUTTON_SIZE) +
            ((buttons - 1) * DESIGN_CONSTANTS.BUTTON_GAP)
      };
    }

    // Peor caso: [1] [...] [N-delta] ... [N+delta] [...] [total]
    // = 1 + 1 (ellipsis) + (delta*2 + 1) + 1 (ellipsis) + 1 = delta*2 + 5
    const buttons = config.delta * 2 + 5;

    return {
      maxButtons: buttons,
      minWidth: config.showNavigationButtons
        ? (DESIGN_CONSTANTS.NAVIGATION_BUTTON_WIDTH * 2) + // Anterior + Siguiente
          (buttons * DESIGN_CONSTANTS.BUTTON_SIZE) + // Botones de página
          ((buttons + 1) * DESIGN_CONSTANTS.BUTTON_GAP) // Gaps entre todos
        : (buttons * DESIGN_CONSTANTS.BUTTON_SIZE) +
          ((buttons - 1) * DESIGN_CONSTANTS.BUTTON_GAP)
    };
  }, [totalPages, config.delta, config.showNavigationButtons]);

  // =====================================================
  // CLASES CSS BASE (MEMOIZADAS PARA EVITAR RE-RENDERS)
  // =====================================================

  const buttonBaseClasses = useMemo(() => `
    px-3 py-2 text-sm font-medium border-2 rounded-lg backdrop-blur-sm
    transition-all duration-300 shadow-sm cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fontFamily} focus:outline-none focus:ring-2 focus:ring-offset-2
  `.trim(), [fontFamily]);

  const pageButtonClasses = useMemo(() => `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:shadow-md hover:scale-105 hover:-translate-y-0.5
    min-w-[${DESIGN_CONSTANTS.BUTTON_SIZE}px] flex items-center justify-center
  `.trim(), [buttonBaseClasses]);

  const navigationButtonClasses = useMemo(() => `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:shadow-md hover:scale-105
    flex items-center gap-2
    min-w-[${DESIGN_CONSTANTS.NAVIGATION_BUTTON_WIDTH}px] justify-center
  `.trim(), [buttonBaseClasses]);

  // =====================================================
  // CLASES Y ESTILOS DEL CONTENEDOR PRINCIPAL (MEMOIZADOS)
  // =====================================================

  const containerClasses = useMemo(() =>
    `rounded-xl shadow-lg border border-gray-100 p-4 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`.trim(),
    [className]
  );

  const containerStyles = useMemo(() => ({
    background: `linear-gradient(to right, white, ${colors.background}, white)`,
    width: '100%'
  }), [colors.background]);

  // =====================================================
  // HANDLERS DE MOUSE MEMOIZADOS (PARA EVITAR RE-CREACIONES)
  // =====================================================

  const handleMouseEnterButton = useCallback((
    e: React.MouseEvent<HTMLButtonElement>,
    isEnabled: boolean
  ) => {
    if (isEnabled) {
      e.currentTarget.style.backgroundColor = colors.background;
      e.currentTarget.style.color = colors.primaryHover;
      e.currentTarget.style.borderColor = colors.primary;
    }
  }, [colors.background, colors.primaryHover, colors.primary]);

  const handleMouseLeaveButton = useCallback((
    e: React.MouseEvent<HTMLButtonElement>,
    isEnabled: boolean,
    isCurrentPage: boolean = false
  ) => {
    if (isEnabled && !isCurrentPage) {
      e.currentTarget.style.backgroundColor = '';
      e.currentTarget.style.color = colors.primary;
      e.currentTarget.style.borderColor = colors.border;
    }
  }, [colors.primary, colors.border]);

  const handleMouseEnterPageButton = useCallback((
    e: React.MouseEvent<HTMLButtonElement>,
    isCurrentPage: boolean
  ) => {
    if (!isCurrentPage && !loading) {
      e.currentTarget.style.backgroundColor = colors.background;
      e.currentTarget.style.color = colors.primaryHover;
      e.currentTarget.style.borderColor = colors.primary;
    }
  }, [loading, colors.background, colors.primaryHover, colors.primary]);

  const handleMouseLeavePageButton = useCallback((
    e: React.MouseEvent<HTMLButtonElement>,
    isCurrentPage: boolean
  ) => {
    if (!isCurrentPage && !loading) {
      e.currentTarget.style.backgroundColor = '';
      e.currentTarget.style.color = colors.textInactive;
      e.currentTarget.style.borderColor = colors.border;
    }
  }, [loading, colors.textInactive, colors.border]);

  // =====================================================
  // ESTILOS DE BOTONES MEMOIZADOS (PARA EVITAR RE-CREACIONES EN MAP)
  // =====================================================

  const activePageStyle = useMemo(() => ({
    background: `linear-gradient(to right, ${colors.primary}, ${colors.gradientSecondary || colors.primary})`,
    borderColor: colors.border,
    color: colors.text,
    transform: 'scale(1.05)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '--tw-ring-color': colors.primary
  } as React.CSSProperties), [colors.primary, colors.gradientSecondary, colors.border, colors.text]);

  const inactivePageStyle = useMemo(() => ({
    borderColor: colors.border,
    color: colors.textInactive,
    '--tw-ring-color': colors.primary
  } as React.CSSProperties), [colors.border, colors.textInactive, colors.primary]);

  const navigationButtonStyle = useMemo(() => ({
    '--tw-ring-color': colors.primary
  } as React.CSSProperties), [colors.primary]);

  // =====================================================
  // VALIDACIONES Y EARLY RETURNS (DESPUÉS DE TODOS LOS HOOKS)
  // =====================================================

  // Ocultar si solo hay 1 página y está configurado así
  if (config.hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  // =====================================================
  // RENDER CON DISEÑO RESPONSIVE
  // =====================================================

  return (
    <div
      className={containerClasses}
      style={containerStyles}
    >
      {/* ========== INFORMACIÓN DE PAGINACIÓN ========== */}
      {config.showInfo && (
        <div
          className={`flex items-center gap-4 text-sm text-gray-700 ${fontFamily} order-2 sm:order-1`}
        >
          {/* Badge de página actual (ancho fijo) */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shadow-md flex-shrink-0"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryHover})`
            }}
          >
            <span className="text-xs font-bold text-white tabular-nums">{currentPage}</span>
          </div>

          {/* Texto de paginación con números monoespaciados */}
          <div>
            <div className="tabular-nums whitespace-nowrap">
              <span>{labels.page} </span>
              <span className="font-semibold" style={{ color: colors.primaryHover }}>
                {currentPage}
              </span>
              <span> {labels.of} </span>
              <span className="font-semibold" style={{ color: colors.primaryHover }}>
                {totalPages}
              </span>
            </div>

            {/* Total de items */}
            {config.showTotalItems && totalItems && totalItems > 0 && (
              <div className="text-xs text-gray-500 mt-0.5 tabular-nums whitespace-nowrap">
                {formatItemsCount(totalItems, labels.item, labels.items)} {labels.inTotal}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== CONTROLES DE PAGINACIÓN (CON ANCHO FIJO PARA EVITAR LAYOUT SHIFT) ========== */}
      <div
        className="flex items-center justify-center space-x-2 order-1 sm:order-2 bg-white/50 rounded-lg p-2 shadow-inner overflow-x-auto"
        style={{
          minWidth: `${minWidth}px`,
          maxWidth: '100%'
        }}
      >
        {/* Botón Anterior */}
        {config.showNavigationButtons && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPrev}
            className={navigationButtonClasses}
            style={{
              ...navigationButtonStyle,
              borderColor: colors.border,
              color: canPrev ? colors.primary : colors.textInactive
            }}
            onMouseEnter={(e) => handleMouseEnterButton(e, canPrev)}
            onMouseLeave={(e) => handleMouseLeaveButton(e, canPrev)}
            aria-label={labels.previousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.previous}</span>
          </button>
        )}

        {/* Botones de páginas (CON ANCHO FIJO) */}
        {config.showPageNumbers && (
          <div className="flex items-center space-x-1">
            {visiblePagesResult.pages.map((page, index) => {
              // Ellipsis
              if (page === '...') {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className={`px-3 py-2 text-gray-400 flex items-center justify-center min-w-[${DESIGN_CONSTANTS.BUTTON_SIZE}px]`}
                  >
                    <MoreHorizontal className="h-4 w-4 animate-pulse" />
                  </div>
                );
              }

              // Botón de página
              const pageNumber = page as number;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={loading}
                  className={`group relative overflow-hidden ${pageButtonClasses}`}
                  style={isCurrentPage ? activePageStyle : inactivePageStyle}
                  onMouseEnter={(e) => handleMouseEnterPageButton(e, isCurrentPage)}
                  onMouseLeave={(e) => handleMouseLeavePageButton(e, isCurrentPage)}
                  aria-label={`${labels.goToPage} ${pageNumber}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {/* Efecto de brillo en hover */}
                  {config.showHoverEffect && !isCurrentPage && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  <span className="relative z-10 font-medium">{pageNumber}</span>

                  {/* Indicador de página activa */}
                  {config.showActiveIndicator && isCurrentPage && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Botón Siguiente */}
        {config.showNavigationButtons && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNext}
            className={navigationButtonClasses}
            style={{
              ...navigationButtonStyle,
              borderColor: colors.border,
              color: canNext ? colors.primary : colors.textInactive
            }}
            onMouseEnter={(e) => handleMouseEnterButton(e, canNext)}
            onMouseLeave={(e) => handleMouseLeaveButton(e, canNext)}
            aria-label={labels.nextPage}
          >
            <span className="hidden sm:inline">{labels.next}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ========== ITEMS PER PAGE SELECTOR ========== */}
      {itemsPerPageConfig && itemsPerPageConfig.show !== false && (
        <div
          className={`flex items-center gap-2 text-sm ${fontFamily} order-3`}
        >
          <span className="text-gray-600 whitespace-nowrap">{labels.itemsPerPage}:</span>
          <select
            value={itemsPerPageConfig.current}
            onChange={(e) => itemsPerPageConfig.onChange(Number(e.target.value))}
            disabled={loading}
            className={`
              px-3 py-2 border-2 rounded-lg backdrop-blur-sm
              ${fontFamily} text-sm font-medium cursor-pointer
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:outline-none focus:ring-offset-2
            `.trim()}
            style={{
              borderColor: colors.border,
              color: colors.primary,
              '--tw-ring-color': colors.primary
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.borderColor = colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
          >
            {itemsPerPageConfig.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ========== INDICADOR DE CARGA ========== */}
      {loading && (
        <div
          className={`
            text-sm font-medium ${fontFamily} flex items-center gap-3 order-4
            px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100
            border border-blue-200 rounded-full shadow-sm
            text-blue-700
          `}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent animate-ping opacity-75"></div>
          </div>
          <span>{labels.loading}</span>
        </div>
      )}
    </div>
  );
};

// Nombre para debugging
Pagination.displayName = 'Pagination';

export default Pagination;
