/**
 * Componente IPHFilters - VERSIÓN OPTIMIZADA
 * Barra de filtros con búsqueda, ordenamiento y acciones
 * 
 * @performance Optimizaciones implementadas:
 * - React.memo con comparación shallow de props
 * - useMemo para cálculos derivados (hasActiveFilters)
 * - useCallback para todos los handlers
 * - Clases CSS memoizadas para evitar re-renders
 * - Sincronización externa de filtros sin loops infinitos
 * - Validación de input con Zod para seguridad
 * 
 * @security
 * - Validación de longitud máxima de búsqueda (100 caracteres)
 * - Sanitización de input con Zod
 * - XSS prevention en valores de búsqueda
 */

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import { Search, X, RefreshCw, SortAsc, SortDesc } from 'lucide-react';
import { z } from 'zod';
import type { IIPHFiltersProps } from '../../../../../interfaces/components/informe-policial.interface';
import { SEARCH_OPTIONS, ORDER_OPTIONS } from '../../../../../interfaces/components/informe-policial.interface';

// =====================================================
// CONSTANTES DE CONFIGURACIÓN
// =====================================================

/**
 * Configuración de validación y UX
 */
const FILTER_CONFIG = {
  /** Longitud máxima del campo de búsqueda */
  MAX_SEARCH_LENGTH: 100,
  /** Delay del debounce en milisegundos */
  DEBOUNCE_DELAY: 500,
  /** Ancho mínimo del botón de ordenamiento */
  SORT_BUTTON_MIN_WIDTH: '52px'
} as const;

// =====================================================
// ESQUEMA DE VALIDACIÓN ZOD
// =====================================================

/**
 * Esquema Zod para validar el input de búsqueda
 * @security Previene XSS y valida longitud
 */
const SearchInputSchema = z.string()
  .max(FILTER_CONFIG.MAX_SEARCH_LENGTH, 'Búsqueda muy larga')
  .transform(val => {
    // Sanitizar scripts maliciosos (XSS prevention)
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  });

// =====================================================
// TIPOS INTERNOS
// =====================================================

type SearchByValue = 'n_referencia' | 'n_folio_sist';
type OrderByValue = 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

/**
 * Componente de filtros para IPH
 * @memoized Comparación shallow de props para evitar re-renders innecesarios
 */
const IPHFilters: React.FC<IIPHFiltersProps> = memo(({
  filters,
  loading,
  onFiltersChange,
  onSearch,
  onClear,
  onRefresh,
  className = ''
}) => {
  // =====================================================
  // ESTADO LOCAL
  // =====================================================

  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // =====================================================
  // VALORES MEMOIZADOS
  // =====================================================

  /**
   * Calcula si hay filtros activos
   * @memoized Solo re-calcula cuando filters.search cambia
   */
  const hasActiveFilters = useMemo(() => {
    return !!(filters.search && filters.search.length > 0);
  }, [filters.search]);

  // =====================================================
  // CLASES CSS MEMOIZADAS
  // =====================================================

  /**
   * Clases del input de búsqueda principal
   * @memoized Evita crear strings nuevos en cada render
   */
  const inputClasses = useMemo(() => {
    const baseClasses = `
      w-full pl-12 pr-12 py-3 border-2 rounded-xl
      bg-white/70 backdrop-blur-sm
      focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
      disabled:opacity-50 disabled:cursor-not-allowed
      font-poppins text-sm placeholder-gray-400
      transition-all duration-200 group-hover:shadow-md
    `;

    const statusClasses = localSearch
      ? 'border-[#b8ab84] shadow-md bg-[#fdf7f1]/50'
      : 'border-gray-200 hover:border-gray-300 hover:shadow-md';

    return `${baseClasses} ${statusClasses}`;
  }, [localSearch]);

  /**
   * Clases del selector "Buscar en"
   * @memoized Evita crear strings nuevos en cada render
   */
  const selectClasses = useMemo(() => {
    const baseClasses = `
      w-full px-4 py-3 border-2 rounded-xl cursor-pointer
      bg-white/70 backdrop-blur-sm
      focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
      disabled:opacity-50 disabled:cursor-not-allowed
      font-poppins text-sm transition-all duration-200
    `;

    const statusClasses = hasActiveFilters
      ? 'border-[#b8ab84] shadow-md bg-[#fdf7f1]/50'
      : 'border-gray-200 hover:border-gray-300 hover:shadow-md';

    return `${baseClasses} ${statusClasses}`;
  }, [hasActiveFilters]);

  /**
   * Clases del contenedor de ordenamiento
   * @memoized Evita crear strings nuevos en cada render
   */
  const orderContainerClasses = useMemo(() => {
    const baseClasses = 'flex items-stretch rounded-xl overflow-hidden shadow-sm border-2 transition-colors duration-200';
    
    const statusClasses = hasActiveFilters
      ? 'border-[#b8ab84] shadow-md'
      : 'border-gray-200 hover:border-gray-300';

    return `${baseClasses} ${statusClasses}`;
  }, [hasActiveFilters]);

  /**
   * Clases del select de ordenamiento
   * @memoized Evita crear strings nuevos en cada render
   */
  const orderSelectClasses = useMemo(() => {
    const baseClasses = `
      flex-1 px-4 py-3 border-0 cursor-pointer backdrop-blur-sm
      focus:ring-4 focus:ring-[#b8ab84]/20 focus:border-[#b8ab84]
      disabled:opacity-50 disabled:cursor-not-allowed
      font-poppins text-sm transition-all duration-200
    `;

    const bgClasses = hasActiveFilters
      ? 'bg-[#fdf7f1]/50'
      : 'bg-white/70';

    return `${baseClasses} ${bgClasses}`;
  }, [hasActiveFilters]);

  /**
   * Clases del botón de ordenamiento
   * @memoized Evita crear strings nuevos en cada render
   */
  const orderButtonClasses = useMemo(() => {
    const baseClasses = `
      px-4 py-3
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer transition-all duration-200 min-w-[${FILTER_CONFIG.SORT_BUTTON_MIN_WIDTH}]
      flex items-center justify-center border-l border-gray-200
      focus:ring-4 focus:ring-[#b8ab84]/20
    `;

    const bgClasses = hasActiveFilters
      ? 'bg-gradient-to-r from-[#b8ab84]/10 to-[#b8ab84]/20'
      : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-[#b8ab84]/10 hover:to-[#b8ab84]/20';

    return `${baseClasses} ${bgClasses}`;
  }, [hasActiveFilters]);

  /**
   * Clases del botón "Buscar"
   * @memoized Evita crear strings nuevos en cada render
   */
  const searchButtonClasses = useMemo(() => {
    const baseClasses = `
      group relative flex items-center gap-2 px-4 py-2 text-xs font-medium
      text-white border rounded-lg shadow-sm
      hover:shadow-md hover:scale-105
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus:ring-2 focus:ring-[#c2b186]/30
      cursor-pointer transition-all duration-200 font-poppins
    `;

    const statusClasses = hasActiveFilters
      ? 'bg-[#4d4725] border-[#4d4725] hover:bg-[#2d2713] hover:border-[#2d2713]'
      : 'bg-[#c2b186] border-[#c2b186] hover:bg-[#4d4725] hover:border-[#4d4725]';

    return `${baseClasses} ${statusClasses}`;
  }, [hasActiveFilters]);

  /**
   * Clases del botón "Actualizar"
   * @memoized Evita crear strings nuevos en cada render
   */
  const refreshButtonClasses = useMemo(() => {
    const baseClasses = `
      flex items-center gap-2 px-4 py-2 text-xs font-medium
      text-white border rounded-lg shadow-sm
      hover:shadow-md hover:scale-105
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus:ring-2 focus:ring-[#c2b186]/30
      cursor-pointer transition-all duration-200 font-poppins
    `;

    const statusClasses = hasActiveFilters
      ? 'bg-[#4d4725] border-[#4d4725] hover:bg-[#2d2713] hover:border-[#2d2713]'
      : 'bg-[#c2b186] border-[#c2b186] hover:bg-[#4d4725] hover:border-[#4d4725]';

    return `${baseClasses} ${statusClasses}`;
  }, [hasActiveFilters]);

  /**
   * Color del icono de búsqueda
   * @memoized Evita comparación en cada render
   */
  const searchIconColor = useMemo(() => {
    return localSearch ? 'text-[#b8ab84]' : 'text-gray-400';
  }, [localSearch]);

  // =====================================================
  // HANDLERS MEMOIZADOS
  // =====================================================

  /**
   * Maneja el debounce de búsqueda con validación Zod
   * @performance Memoizado con useCallback
   * @security Valida y sanitiza input con Zod
   */
  const debouncedSearch = useCallback((searchTerm: string) => {
    // Limpiar timer anterior
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Validar con Zod
    const validationResult = SearchInputSchema.safeParse(searchTerm);
    
    if (!validationResult.success) {
      console.warn('IPHFilters: Invalid search input', validationResult.error);
      return;
    }

    const sanitizedTerm = validationResult.data.trim();
    
    // Aplicar debounce solo para búsquedas con contenido
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ search: sanitizedTerm });
    }, FILTER_CONFIG.DEBOUNCE_DELAY);
  }, [onFiltersChange]);

  /**
   * Maneja cambios en el input de búsqueda
   * @performance Memoizado con useCallback
   */
  const handleSearchInputChange = useCallback((value: string) => {
    setLocalSearch(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  /**
   * Limpia el campo de búsqueda
   * @performance Memoizado con useCallback
   */
  const handleClearSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setLocalSearch('');
    onFiltersChange({ search: '' });
  }, [onFiltersChange]);

  /**
   * Maneja el cambio del campo de búsqueda (referencia/folio)
   * @performance Memoizado con useCallback
   */
  const handleSearchByChange = useCallback((searchBy: SearchByValue) => {
    onFiltersChange({ searchBy });
  }, [onFiltersChange]);

  /**
   * Maneja el cambio del campo de ordenamiento
   * @performance Memoizado con useCallback
   */
  const handleOrderByChange = useCallback((orderBy: OrderByValue) => {
    onFiltersChange({ orderBy });
  }, [onFiltersChange]);

  /**
   * Invierte el orden de ordenamiento (ASC ↔ DESC)
   * @performance Memoizado con useCallback
   */
  const handleOrderToggle = useCallback(() => {
    const newOrder = filters.order === 'ASC' ? 'DESC' : 'ASC';
    onFiltersChange({ order: newOrder });
  }, [filters.order, onFiltersChange]);

  /**
   * Maneja la tecla Enter para buscar
   * @performance Memoizado con useCallback
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  }, [onSearch]);

  /**
   * Limpia filtros completamente
   * @performance Memoizado con useCallback
   */
  const handleClearAll = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setLocalSearch('');
    onClear();
  }, [onClear]);

  // =====================================================
  // EFECTOS
  // =====================================================

  /**
   * Sincroniza estado local con filtros externos
   * @performance Evita loops infinitos comparando valores
   * @description Necesario porque el padre puede resetear filtros con handleClearFilters
   */
  useEffect(() => {
    // Solo actualizar si el valor es diferente (evitar loops)
    const externalSearch = filters.search || '';
    if (localSearch !== externalSearch) {
      setLocalSearch(externalSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]); // ✅ Solo depende de filters.search, NO de localSearch (intencional)

  /**
   * Cleanup del debounce al desmontar
   * @performance Evita memory leaks
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // =====================================================
  // RENDERIZADO
  // =====================================================

  return (
    <div className={className}>
      {/* Indicador de búsqueda activa */}
      {hasActiveFilters && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-full shadow-sm mb-6 w-fit">
          <div className="relative">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-sm font-medium text-blue-700 font-poppins">Filtros aplicados</span>
        </div>
      )}

      {/* Controles de filtro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">

        {/* Campo de búsqueda principal */}
        <div className="lg:col-span-6 xl:col-span-7">
          <label className="block text-sm font-medium text-gray-700 font-poppins mb-2">
            Término de búsqueda
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors duration-200 ${searchIconColor}`} />
            </div>
            <input
              type="text"
              placeholder="Buscar por referencia o folio del sistema..."
              value={localSearch}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={inputClasses}
              disabled={loading}
              maxLength={FILTER_CONFIG.MAX_SEARCH_LENGTH}
              aria-label="Campo de búsqueda"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="
                  absolute inset-y-0 right-0 pr-4 flex items-center
                  text-gray-400 hover:text-red-500 transition-colors duration-200
                  hover:scale-105 transform
                "
                disabled={loading}
                aria-label="Limpiar búsqueda"
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
            onChange={(e) => handleSearchByChange(e.target.value as SearchByValue)}
            className={selectClasses}
            disabled={loading}
            aria-label="Campo donde buscar"
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
          <div className={orderContainerClasses}>
            <select
              value={filters.orderBy}
              onChange={(e) => handleOrderByChange(e.target.value as OrderByValue)}
              className={orderSelectClasses}
              disabled={loading}
              aria-label="Campo de ordenamiento"
            >
              {ORDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleOrderToggle}
              className={orderButtonClasses}
              disabled={loading}
              title={`Ordenar ${filters.order === 'ASC' ? 'descendente' : 'ascendente'}`}
              aria-label={`Cambiar orden a ${filters.order === 'ASC' ? 'descendente' : 'ascendente'}`}
            >
              {filters.order === 'ASC' ?
                <SortAsc className="h-5 w-5 text-gray-600" /> :
                <SortDesc className="h-5 w-5 text-gray-600" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-between items-stretch sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botón Buscar */}
          <button
            onClick={onSearch}
            disabled={loading}
            className={searchButtonClasses}
            aria-label="Ejecutar búsqueda"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>

          {/* Botón Limpiar */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
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
              aria-label="Limpiar todos los filtros"
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
          className={refreshButtonClasses}
          aria-label="Actualizar lista"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Indicadores de filtros activos */}
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
                  onClick={handleClearAll}
                  className="ml-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  aria-label="Eliminar filtro de búsqueda"
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
}, (prevProps, nextProps) => {
  /**
   * Comparación personalizada para React.memo
   * @performance Solo re-renderiza si cambian props relevantes
   */
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.filters.search === nextProps.filters.search &&
    prevProps.filters.searchBy === nextProps.filters.searchBy &&
    prevProps.filters.orderBy === nextProps.filters.orderBy &&
    prevProps.filters.order === nextProps.filters.order &&
    prevProps.className === nextProps.className
  );
});

// Nombre para debugging
IPHFilters.displayName = 'IPHFilters';

export default IPHFilters;
