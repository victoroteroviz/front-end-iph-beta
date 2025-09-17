/**
 * Componente atómico UsuariosFilters
 * Filtros de búsqueda y acciones para la lista de usuarios
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, UserPlus, RefreshCw } from 'lucide-react';
import type { IUsuariosFiltersProps } from '../../../../../interfaces/components/usuarios.interface';
import { USUARIOS_SEARCH_OPTIONS } from '../../../../../interfaces/components/usuarios.interface';

const UsuariosFilters: React.FC<IUsuariosFiltersProps> = ({
  filters,
  loading,
  canCreate,
  onFiltersChange,
  onSearch,
  onClear,
  onCreate,
  className = ''
}) => {
  // Estado local para el input de búsqueda (para debounce)
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce: actualizar filtros después de 500ms sin cambios
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ search: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.search, onFiltersChange]);

  // Sincronizar estado local con filtros externos
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleSearchByChange = (searchBy: 'nombre' | 'cuip' | 'cup' | 'grado' | 'cargo') => {
    onFiltersChange({ searchBy });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const hasActiveFilters = filters.search.length > 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        {/* Sección de búsqueda */}
        <div className="flex-1 flex flex-col sm:flex-row gap-3 min-w-0">
          
          {/* Campo de búsqueda */}
          <div className="relative flex-1 min-w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="
                w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54]
                disabled:opacity-50 disabled:cursor-not-allowed
                font-poppins text-sm
              "
              disabled={loading}
              maxLength={100}
            />
            {searchInput && (
              <button
                onClick={() => handleSearchInputChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Selector de campo de búsqueda */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={filters.searchBy}
              onChange={(e) => handleSearchByChange(e.target.value as 'nombre' | 'cuip' | 'cup' | 'grado' | 'cargo')}
              className="
                pl-10 pr-8 py-2 border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54]
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer font-poppins text-sm min-w-32
              "
              disabled={loading}
            >
              {USUARIOS_SEARCH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-row gap-2 flex-shrink-0">
          
          {/* Botón Buscar */}
          <button
            onClick={onSearch}
            disabled={loading}
            className="
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              text-blue-700 bg-blue-50 border border-blue-200 rounded-lg
              hover:bg-blue-100 hover:border-blue-300
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer transition-colors duration-200 font-poppins
            "
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>

          {/* Botón Limpiar */}
          {hasActiveFilters && (
            <button
              onClick={onClear}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-gray-700 bg-gray-50 border border-gray-200 rounded-lg
                hover:bg-gray-100 hover:border-gray-300
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer transition-colors duration-200 font-poppins
              "
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          )}

          {/* Botón Crear Usuario */}
          {canCreate && (
            <button
              onClick={onCreate}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-[#948b54] border border-[#948b54] rounded-lg
                hover:bg-[#7d7548] hover:border-[#7d7548]
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer transition-colors duration-200 font-poppins
                shadow-sm hover:shadow-md
              "
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Usuario
            </button>
          )}
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Filtrando por <span className="font-medium">{filters.searchBy}</span>: 
            <span className="font-medium ml-1">"{filters.search}"</span>
          </span>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Buscando usuarios...</span>
        </div>
      )}
    </div>
  );
};

export default UsuariosFilters;