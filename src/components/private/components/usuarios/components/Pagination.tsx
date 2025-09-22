/**
 * Componente atómico Pagination
 * Paginación reutilizable con navegación e información
 */

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { IPaginationProps } from '../../../../../interfaces/components/usuarios.interface';

const Pagination: React.FC<IPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading = false,
  className = ''
}) => {
  // No mostrar paginación si hay una sola página o menos
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (loading || page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  // Generar array de páginas a mostrar
  const getVisiblePages = (): (number | string)[] => {
    const delta = 2; // Páginas a mostrar a cada lado de la página actual
    const rangeWithDots = [];
    const range = [];

    // Lógica para páginas visibles
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    // Página 1 siempre visible
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Páginas del rango
    rangeWithDots.push(...range);

    // Última página siempre visible
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const buttonBaseClasses = `
    px-3 py-2 text-sm font-medium border-2 rounded-lg backdrop-blur-sm
    transition-all duration-300 shadow-sm cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    font-poppins focus:ring-2 focus:outline-none
  `;

  const pageButtonClasses = `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:border-[#c2b186] hover:bg-[#fdf7f1] hover:text-[#4d4725]
    hover:shadow-md hover:scale-105 hover:-translate-y-0.5
    focus:ring-[#c2b186]/30
  `;

  const activePageClasses = `
    ${buttonBaseClasses}
    border-[#c2b186] bg-gradient-to-r from-[#c2b186] to-[#b8ab84] text-white
    shadow-lg transform scale-105
    hover:from-[#4d4725] hover:to-[#3a3520] hover:border-[#4d4725]
    focus:ring-[#c2b186]/50
  `;

  const navigationButtonClasses = `
    ${buttonBaseClasses}
    border-gray-200 bg-white/70 text-gray-600
    hover:border-[#c2b186] hover:bg-[#fdf7f1] hover:text-[#4d4725]
    hover:shadow-md hover:scale-105
    focus:ring-[#c2b186]/30
    flex items-center gap-2
  `;

  return (
    <div className={`
      bg-gradient-to-r from-white via-[#fdf7f1] to-white
      rounded-xl shadow-lg border border-gray-100 p-4 backdrop-blur-sm
      flex flex-col sm:flex-row items-center justify-between gap-6 ${className}
    `}>

      {/* Información de paginación mejorada */}
      <div className="flex items-center gap-3 text-sm text-gray-700 font-poppins order-2 sm:order-1">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#c2b186] to-[#4d4725] rounded-lg shadow-md">
          <span className="text-xs font-bold text-white">{currentPage}</span>
        </div>
        <div>
          <span>Página </span>
          <span className="font-semibold text-[#4d4725]">{currentPage}</span>
          <span> de </span>
          <span className="font-semibold text-[#4d4725]">{totalPages}</span>
          {totalItems > 0 && (
            <div className="text-xs text-gray-500 mt-0.5">
              {totalItems} elemento{totalItems !== 1 ? 's' : ''} en total
            </div>
          )}
        </div>
      </div>

      {/* Controles de paginación mejorados */}
      <div className="flex items-center space-x-2 order-1 sm:order-2 bg-white/50 rounded-lg p-2 shadow-inner">

        {/* Botón Anterior */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={loading || currentPage === 1}
          className={navigationButtonClasses}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Botones de páginas */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
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

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={loading}
                className={`
                  group relative overflow-hidden
                  ${isCurrentPage ? activePageClasses : pageButtonClasses}
                `}
                aria-label={`Ir a página ${pageNumber}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {/* Efecto de brillo */}
                {!isCurrentPage && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <span className="relative z-10 font-medium">{pageNumber}</span>

                {/* Indicador de página activa */}
                {isCurrentPage && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={loading || currentPage === totalPages}
          className={navigationButtonClasses}
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Indicador de carga mejorado */}
      {loading && (
        <div className="
          text-sm font-medium font-poppins flex items-center gap-3 order-3
          px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100
          border border-blue-200 rounded-full shadow-sm
          text-blue-700
        ">
          <div className="relative">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent animate-ping opacity-75"></div>
          </div>
          <span>Cargando páginas...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;