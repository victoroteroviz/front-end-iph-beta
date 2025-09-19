/**
 * Componente IPHFilters
 * Barra de filtros con búsqueda, ordenamiento y acciones
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react';
import type { IIPHFiltersProps } from '../../../../../interfaces/components/informe-policial.interface';
import { SEARCH_OPTIONS, ORDER_OPTIONS } from '../../../../../interfaces/components/informe-policial.interface';
const IPHFilters: React.FC<IIPHFiltersProps> = ({
  filters,
  loading,
  onFiltersChange,
  onSearch,
  onClear,
  onRefresh,
  className = ''
}) => {
  // Estado local para el campo de búsqueda
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Hook de debounce para búsqueda con corrección para campos vacíos
   */
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Normalizar el término de búsqueda
    const normalizedTerm = searchTerm.trim();
    
    // Si el campo está vacío, limpiar el filtro de búsqueda
    if (normalizedTerm === '') {
      // Enviar cadena vacía para indicar que no hay filtro (patrón de este componente)
      onFiltersChange({ search: '' }); // Limpiar filtro inmediatamente
      return;
    }
    
    // Para búsquedas con contenido, aplicar debounce de .5 segundos (más responsive)
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ search: normalizedTerm });
    }, 500);
  }, [onFiltersChange]);

  /**
   * Maneja cambios en la búsqueda con debounce inteligente
   */
  const handleSearchInputChange = useCallback((value: string) => {
    setLocalSearch(value);
    debouncedSearch(value);
  }, [debouncedSearch]);


  /**
   * Efecto para sincronizar estado local con filtros externos
   */
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  /**
   * Cleanup del debounce al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearchByChange = (searchBy: 'n_referencia' | 'n_folio_sist') => {
    onFiltersChange({ searchBy });
  };

  const handleOrderByChange = (orderBy: 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion') => {
    onFiltersChange({ orderBy });
  };

  const handleOrderChange = () => {
    const newOrder = filters.order === 'ASC' ? 'DESC' : 'ASC';
    onFiltersChange({ order: newOrder });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const hasActiveFilters = (filters.search && filters.search.length > 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-6 ${className}`}>
      {/* Título */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#4d4725] font-poppins flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
        </h2>
        
        {/* Indicador de búsqueda activa */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-blue-600 font-poppins">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Filtros aplicados</span>
          </div>
        )}
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-wrap gap-3 items-center">
        
        {/* Campo de búsqueda */}
        <div className="relative flex-1 min-w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por referencia o folio del sistema"
            value={localSearch}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="
              w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-[#b8ab84] focus:border-[#b8ab84] 
              disabled:opacity-50 disabled:cursor-not-allowed
              font-poppins text-sm
            "
            disabled={loading}
            maxLength={100}
          />
          {localSearch && (
            <button
              onClick={() => handleSearchInputChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Selector de campo de búsqueda */}
        <select
          value={filters.searchBy}
          onChange={(e) => handleSearchByChange(e.target.value as 'n_referencia' | 'n_folio_sist')}
          className="
            px-3 py-2 border border-gray-300 rounded-lg cursor-pointer
            focus:ring-2 focus:ring-[#b8ab84] focus:border-[#b8ab84]
            disabled:opacity-50 disabled:cursor-not-allowed
            font-poppins text-sm min-w-32
          "
          disabled={loading}
        >
          {SEARCH_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>


        {/* Ordenamiento */}
        <div className="flex items-stretch">
          <select
            value={filters.orderBy}
            onChange={(e) => handleOrderByChange(e.target.value as 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion')}
            className="
              px-3 py-2 border border-gray-300 rounded-l-lg border-r-0 cursor-pointer
              focus:ring-2 focus:ring-[#b8ab84] focus:border-[#b8ab84]
              disabled:opacity-50 disabled:cursor-not-allowed
              font-poppins text-sm min-w-[120px]
            "
            disabled={loading}
          >
            {ORDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleOrderChange}
            className="
              px-3 py-2 border border-gray-300 rounded-r-lg
              hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer transition-colors duration-200 min-w-[44px]
              flex items-center justify-center
              focus:ring-2 focus:ring-[#b8ab84] focus:border-[#b8ab84]
            "
            disabled={loading}
            title={`Ordenar ${filters.order === 'ASC' ? 'descendente' : 'ascendente'}`}
          >
            {filters.order === 'ASC' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 mt-4 justify-between items-center">
        <div className="flex gap-2">
          {/* Botón Buscar */}
          <button
            onClick={onSearch}
            disabled={loading}
            className="
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              text-white bg-[#c2b186] border border-[#c2b186] rounded-lg
              hover:bg-[#4d4725] hover:border-[#4d4725]
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer transition-colors duration-200 font-poppins shadow-sm
            "
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>

          {/* Botón Limpiar */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                // Limpiar debounce pendiente
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                setLocalSearch('');
                onClear();
              }}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-[#4d4725] bg-gray-100 border border-gray-300 rounded-lg
                hover:bg-gray-200 hover:border-gray-400
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer transition-colors duration-200 font-poppins
              "
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          )}
        </div>

        {/* Botón Actualizar */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            text-white bg-[#c2b186] border border-[#c2b186] rounded-lg
            hover:bg-[#4d4725] hover:border-[#4d4725]
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer transition-colors duration-200 font-poppins shadow-sm
          "
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <span className="font-medium">Filtros activos:</span>

            {/* Filtro de búsqueda */}
            {filters.search && filters.search.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                Búsqueda por {SEARCH_OPTIONS.find(opt => opt.value === filters.searchBy)?.label}: "{filters.search}"
              </span>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default IPHFilters;