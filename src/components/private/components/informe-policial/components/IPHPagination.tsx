/**
 * Componente IPHPagination
 * Paginación mejorada con información de elementos
 */

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { IIPHPaginationProps } from '../../../../../interfaces/components/informe-policial.interface';
import { INFORME_POLICIAL_CONFIG } from '../../../../../interfaces/components/informe-policial.interface';

const IPHPagination: React.FC<IIPHPaginationProps> = ({
  pagination,
  loading,
  onPageChange,
  className = ''
}) => {

  const { currentPage, totalPages, totalItems } = pagination;

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
    const maxVisible = INFORME_POLICIAL_CONFIG.MAX_PAGES_VISIBLE;
    const delta = Math.floor(maxVisible / 2);
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
    px-3 py-2 text-sm font-medium border transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed font-poppins
  `;

  const pageButtonClasses = `
    ${buttonBaseClasses}
    border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#4d4725]
  `;

  const activePageClasses = `
    ${buttonBaseClasses}
    border-[#4d4725] bg-[#4d4725] text-white hover:bg-[#3a3419]
  `;

  const navigationButtonClasses = `
    ${buttonBaseClasses}
    border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#4d4725]
    flex items-center gap-1
  `;

  // Calcular elementos mostrados
  const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(currentPage * pagination.itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      
      {/* Información de paginación */}
      <div className="text-sm text-gray-700 font-poppins order-2 sm:order-1">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems}</span> informes
        {totalPages > 1 && (
          <>
            {' '}(página <span className="font-medium">{currentPage}</span> de{' '}
            <span className="font-medium">{totalPages}</span>)
          </>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        
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
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-gray-400"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              );
            }

            const pageNumber = page as number;
            const isCurrentPage = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                disabled={loading}
                className={isCurrentPage ? activePageClasses : pageButtonClasses}
                aria-label={`Ir a página ${pageNumber}`}
                aria-current={isCurrentPage ? 'page' : undefined}
              >
                {pageNumber}
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
    </div>
  );
};

export default IPHPagination;