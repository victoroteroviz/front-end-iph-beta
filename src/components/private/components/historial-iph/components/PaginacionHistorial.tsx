/**
 * Componente PaginacionHistorial
 * Navegación por páginas específica para el historial de IPH
 */

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

// Interfaces
import type { PaginacionHistorialProps } from '../../../../../interfaces/components/historialIph.interface';

/**
 * Componente de paginación para el historial
 * 
 * @param props - Props del componente de paginación
 * @returns JSX.Element de la paginación
 */
const PaginacionHistorial: React.FC<PaginacionHistorialProps> = ({
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

  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`
      flex flex-col sm:flex-row items-center justify-between gap-4
      bg-white rounded-lg shadow-sm border border-gray-200 p-4
      ${className}
    `}>
      {/* Información de página (móvil arriba, desktop izquierda) */}
      <div className="flex items-center text-sm text-gray-600 order-2 sm:order-1">
        <span>
          Página <span className="font-medium text-[#4d4725]">{currentPage}</span> de{' '}
          <span className="font-medium text-[#4d4725]">{totalPages}</span>
        </span>
        {loading && (
          <div className="flex items-center gap-2 ml-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4d4725]"></div>
            <span className="text-[#4d4725]">Cargando...</span>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
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
            focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
          "
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                  <MoreHorizontal size={16} />
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
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
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

        {/* Selector de página en móvil */}
        <div className="sm:hidden">
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            disabled={loading}
            className="
              px-3 py-2 border border-gray-300 rounded-md
              bg-white text-gray-900
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="Seleccionar página"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <option key={pageNum} value={pageNum}>
                Página {pageNum}
              </option>
            ))}
          </select>
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
            focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-1
          "
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default PaginacionHistorial;