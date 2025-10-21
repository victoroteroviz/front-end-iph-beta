/**
 * Componente Pagination
 * Navegación por páginas reutilizable
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Interfaces
import type { PaginationProps } from '../../../../../../interfaces/components/estadisticasUsuario.interface';

/**
 * Componente de paginación
 * 
 * @param props - Props del componente de paginación
 * @returns JSX.Element de la paginación
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  canGoToNext,
  canGoToPrevious,
  onPageChange,
  onNext,
  onPrevious,
  loading = false,
  className = ''
}) => {
  /**
   * Genera números de páginas para mostrar
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica más compleja para muchas páginas
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`
      flex items-center justify-center gap-2
      bg-white rounded-lg shadow-sm border border-gray-200 p-4
      ${className}
    `}>
      {/* Botón Anterior */}
      <button
        onClick={onPrevious}
        disabled={!canGoToPrevious || loading}
        className="
          flex items-center gap-2 px-3 py-2
          border border-gray-300 rounded-md
          bg-white hover:bg-gray-50
          text-gray-700 hover:text-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#4d4725]
        "
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                ...
              </span>
            );
          }

          const isCurrentPage = pageNumber === currentPage;
          
          return (
            <button
              key={pageNumber}
              onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
              disabled={loading || isCurrentPage}
              className={`
                px-3 py-2 rounded-md text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#4d4725]
                ${isCurrentPage
                  ? 'bg-[#4d4725] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
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
        onClick={onNext}
        disabled={!canGoToNext || loading}
        className="
          flex items-center gap-2 px-3 py-2
          border border-gray-300 rounded-md
          bg-white hover:bg-gray-50
          text-gray-700 hover:text-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#4d4725]
        "
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      {/* Información de página */}
      <div className="hidden md:flex items-center ml-4 text-sm text-gray-600">
        <span>
          Página {currentPage} de {totalPages}
        </span>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 ml-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4d4725]"></div>
          <span className="text-sm text-gray-600">Cargando...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;