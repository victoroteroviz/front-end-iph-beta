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
    <div className={className}>
      {/* Indicador de búsqueda activa mejorado */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full shadow-sm mb-6 w-fit">
          <div className="relative">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm font-medium text-blue-700 font-poppins">Filtros aplicados</span>
        </div>
      )}

      {/* Controles de filtro mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">

        {/* Campo de búsqueda principal */}
        <div className="lg:col-span-6 xl:col-span-7">
          <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
            Término de búsqueda
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                localSearch ? 'text-[#b8ab84]' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              placeholder="Buscar por referencia o folio del sistema..."
              value={localSearch}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`
                w-full pl-12 pr-12 py-3 border-2 rounded-xl
                bg-white/70 backdrop-blur-sm
                focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
                disabled:opacity-50 disabled:cursor-not-allowed
                font-poppins text-sm placeholder-gray-400
                transition-all duration-200 group-hover:shadow-md
                ${localSearch
                  ? 'border-[#b8ab84] shadow-md bg-[#fdf7f1]/50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              disabled={loading}
              maxLength={100}
            />
            {localSearch && (
              <button
                onClick={() => handleSearchInputChange('')}
                className="
                  absolute inset-y-0 right-0 pr-4 flex items-center
                  text-gray-400 hover:text-red-500 transition-colors duration-200
                  hover:scale-110 transform
                "
                disabled={loading}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Selector de campo de búsqueda */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
            Buscar en
          </label>
          <select
            value={filters.searchBy}
            onChange={(e) => handleSearchByChange(e.target.value as 'n_referencia' | 'n_folio_sist')}
            className={`
              w-full px-4 py-3 border-2 rounded-xl cursor-pointer
              bg-white/70 backdrop-blur-sm
              focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
              disabled:opacity-50 disabled:cursor-not-allowed
              font-poppins text-sm transition-all duration-200
              ${hasActiveFilters
                ? 'border-[#b8ab84] shadow-md bg-[#fdf7f1]/50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }
            `}
            disabled={loading}
          >
            {SEARCH_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Controles de ordenamiento */}
        <div className="lg:col-span-4 xl:col-span-3">
          <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
            Ordenar por
          </label>
          <div className={`flex items-stretch rounded-xl overflow-hidden shadow-sm border-2 transition-colors duration-200 ${
            hasActiveFilters
              ? 'border-[#b8ab84] shadow-md'
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <select
              value={filters.orderBy}
              onChange={(e) => handleOrderByChange(e.target.value as 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion')}
              className={`
                flex-1 px-4 py-3 border-0 cursor-pointer backdrop-blur-sm
                focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
                disabled:opacity-50 disabled:cursor-not-allowed
                font-poppins text-sm transition-all duration-200
                ${hasActiveFilters
                  ? 'bg-[#fdf7f1]/50'
                  : 'bg-white/70'
                }
              `}
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
              className={`
                px-4 py-3
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer transition-all duration-200 min-w-[52px]
                flex items-center justify-center border-l border-gray-200
                focus:ring-4 focus:ring-[#b8ab84]/20
                ${hasActiveFilters
                  ? 'bg-gradient-to-r from-[#b8ab84]/10 to-[#b8ab84]/20'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#b8ab84]/10 hover:to-[#b8ab84]/20'
                }
              `}
              disabled={loading}
              title={`Ordenar ${filters.order === 'ASC' ? 'descendente' : 'ascendente'}`}
            >
              {filters.order === 'ASC' ?
                <SortAsc className="h-5 w-5 text-gray-600" /> :
                <SortDesc className="h-5 w-5 text-gray-600" />
              }
            </button>
          </div>
        </div>
      </div>


      {/* Botones de acción mejorados */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-between items-stretch sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botón Buscar */}
          <button
            onClick={onSearch}
            disabled={loading}
            className={`
              group relative flex items-center gap-2 px-4 py-2 text-xs font-medium
              text-white border rounded-lg shadow-sm
              hover:shadow-md hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              focus:ring-2 focus:ring-[#c2b186]/30
              cursor-pointer transition-all duration-200 font-poppins
              ${hasActiveFilters
                ? 'bg-[#4d4725] border-[#4d4725] hover:bg-[#2d2713] hover:border-[#2d2713]'
                : 'bg-[#c2b186] border-[#c2b186] hover:bg-[#4d4725] hover:border-[#4d4725]'
              }
            `}
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>

          {/* Botón Limpiar */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                if (debounceRef.current) {
                  clearTimeout(debounceRef.current);
                }
                setLocalSearch('');
                onClear();
              }}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 text-xs font-medium
                text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm
                hover:bg-red-50 hover:border-red-300 hover:text-red-700
                hover:shadow-md hover:scale-105
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                focus:ring-2 focus:ring-gray-300/30
                cursor-pointer transition-all duration-200 font-poppins
              "
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Botón Actualizar */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`
            flex items-center gap-2 px-4 py-2 text-xs font-medium
            text-white border rounded-lg shadow-sm
            hover:shadow-md hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            focus:ring-2 focus:ring-[#c2b186]/30
            cursor-pointer transition-all duration-200 font-poppins
            ${hasActiveFilters
              ? 'bg-[#4d4725] border-[#4d4725] hover:bg-[#2d2713] hover:border-[#2d2713]'
              : 'bg-[#c2b186] border-[#c2b186] hover:bg-[#4d4725] hover:border-[#4d4725]'
            }
          `}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Indicadores de filtros activos mejorados */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-semibold text-gray-700 font-poppins">Filtros activos:</span>
            </div>

            {/* Filtro de búsqueda */}
            {filters.search && filters.search.length > 0 && (
              <div className="
                inline-flex items-center gap-2 px-4 py-2
                bg-gradient-to-r from-blue-50 to-blue-100
                border border-blue-200 rounded-full text-xs font-medium
                text-blue-800 shadow-sm transition-all duration-200
                hover:shadow-md hover:scale-105
              ">
                <Search className="h-3 w-3" />
                <span>
                  {SEARCH_OPTIONS.find(opt => opt.value === filters.searchBy)?.label}:
                </span>
                <span className="font-bold">"{filters.search}"</span>
                <button
                  onClick={() => {
                    if (debounceRef.current) {
                      clearTimeout(debounceRef.current);
                    }
                    setLocalSearch('');
                    onClear();
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}


            {/* Indicador de ordenamiento activo */}
            <div className="
              inline-flex items-center gap-2 px-3 py-1
              bg-gradient-to-r from-gray-50 to-gray-100
              border border-gray-200 rounded-full text-xs
              text-gray-600 shadow-sm
            ">
              {filters.order === 'ASC' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
              <span>
                {ORDER_OPTIONS.find(opt => opt.value === filters.orderBy)?.label}
                ({filters.order === 'ASC' ? 'A-Z' : 'Z-A'})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPHFilters;