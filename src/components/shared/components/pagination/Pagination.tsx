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
  // VALIDACIONES Y EARLY RETURNS
  // =====================================================

  // Ocultar si solo hay 1 página y está configurado así
  if (config.hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  // =====================================================
  // HANDLERS
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
  // VALORES COMPUTADOS
  // =====================================================

  const visiblePagesResult = useMemo(
    () => getVisiblePages(currentPage, totalPages, config.delta),
    [currentPage, totalPages, config.delta]
  );

  const canPrev = canGoPrevious(currentPage, loading);
  const canNext = canGoNext(currentPage, totalPages, loading);

  // =====================================================
  // CLASES CSS BASE
  // =====================================================

  const buttonBaseClasses = `
    px-3 py-2 text-sm font-medium border-2 rounded-lg backdrop-blur-sm
    transition-all duration-300 shadow-sm cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fontFamily} focus:ring-2 focus:outline-none
  `;

  const pageButtonClasses = `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:shadow-md hover:scale-105 hover:-translate-y-0.5
  `;

  const navigationButtonClasses = `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:shadow-md hover:scale-105
    flex items-center gap-2
  `;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={`
        bg-gradient-to-r from-white via-[${colors.background}] to-white
        rounded-xl shadow-lg border border-gray-100 p-4 backdrop-blur-sm
        flex flex-col sm:flex-row items-center justify-between gap-6 ${className}
      `}
      style={{
        background: `linear-gradient(to right, white, ${colors.background}, white)`
      }}
    >
      {/* ========== INFORMACIÓN DE PAGINACIÓN ========== */}
      {config.showInfo && (
        <div
          className={`flex items-center gap-3 text-sm text-gray-700 ${fontFamily} order-2 sm:order-1`}
        >
          {/* Badge de página actual */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shadow-md"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryHover})`
            }}
          >
            <span className="text-xs font-bold text-white">{currentPage}</span>
          </div>

          {/* Texto de paginación */}
          <div>
            <span>{labels.page} </span>
            <span className="font-semibold" style={{ color: colors.primaryHover }}>
              {currentPage}
            </span>
            <span> {labels.of} </span>
            <span className="font-semibold" style={{ color: colors.primaryHover }}>
              {totalPages}
            </span>

            {/* Total de items */}
            {config.showTotalItems && totalItems && totalItems > 0 && (
              <div className="text-xs text-gray-500 mt-0.5">
                {formatItemsCount(totalItems, labels.item, labels.items)} {labels.inTotal}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== CONTROLES DE PAGINACIÓN ========== */}
      <div className="flex items-center space-x-2 order-1 sm:order-2 bg-white/50 rounded-lg p-2 shadow-inner">
        {/* Botón Anterior */}
        {config.showNavigationButtons && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPrev}
            className={navigationButtonClasses}
            style={{
              borderColor: colors.border,
              color: canPrev ? colors.primary : colors.textInactive
            }}
            onMouseEnter={(e) => {
              if (canPrev) {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.color = colors.primaryHover;
                e.currentTarget.style.borderColor = colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (canPrev) {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = colors.primary;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
            aria-label={labels.previousPage}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{labels.previous}</span>
          </button>
        )}

        {/* Botones de páginas */}
        {config.showPageNumbers && (
          <div className="flex items-center space-x-1">
            {visiblePagesResult.pages.map((page, index) => {
              // Ellipsis
              if (page === '...') {
                return (
                  <div
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-400 flex items-center justify-center"
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
                  className={`
                    group relative overflow-hidden
                    ${pageButtonClasses}
                  `}
                  style={
                    isCurrentPage
                      ? {
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.gradientSecondary || colors.primary})`,
                          borderColor: colors.border,
                          color: colors.text,
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }
                      : {
                          borderColor: colors.border,
                          color: colors.textInactive
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isCurrentPage && !loading) {
                      e.currentTarget.style.backgroundColor = colors.background;
                      e.currentTarget.style.color = colors.primaryHover;
                      e.currentTarget.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrentPage && !loading) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = colors.textInactive;
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
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
              borderColor: colors.border,
              color: canNext ? colors.primary : colors.textInactive
            }}
            onMouseEnter={(e) => {
              if (canNext) {
                e.currentTarget.style.backgroundColor = colors.background;
                e.currentTarget.style.color = colors.primaryHover;
                e.currentTarget.style.borderColor = colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (canNext) {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = colors.primary;
                e.currentTarget.style.borderColor = colors.border;
              }
            }}
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
          className={`flex items-center gap-2 text-sm ${fontFamily} order-3 sm:order-3`}
        >
          <span className="text-gray-600">{labels.itemsPerPage}:</span>
          <select
            value={itemsPerPageConfig.current}
            onChange={(e) => itemsPerPageConfig.onChange(Number(e.target.value))}
            disabled={loading}
            className={`
              px-3 py-2 border-2 rounded-lg backdrop-blur-sm
              ${fontFamily} text-sm font-medium cursor-pointer
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:ring-2 focus:outline-none
            `}
            style={{
              borderColor: colors.border,
              color: colors.primary
            }}
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
