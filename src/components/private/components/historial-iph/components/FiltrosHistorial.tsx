/**
 * Componente FiltrosHistorial
 * Filtros avanzados para el historial de IPH
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  Filter, 
  Search, 
  Calendar, 
  User, 
  AlertTriangle,
  X
} from 'lucide-react';

// Interfaces
import type { FiltrosHistorialProps } from '../../../../../interfaces/components/historialIph.interface';

// Mock data
import { tiposDelitoOptions, estatusConfig } from '../../../../../mock/historial-iph';

/**
 * Componente de filtros para el historial
 * 
 * @param props - Props del componente de filtros
 * @returns JSX.Element de los filtros
 */
const FiltrosHistorial: React.FC<FiltrosHistorialProps> = ({
  filtros,
  onFiltrosChange,
  loading = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localBusqueda, setLocalBusqueda] = useState(filtros.busqueda || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Opciones de estatus para el selector
   */
  const estatusOptions = useMemo(() => {
    return Object.entries(estatusConfig).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.color
    }));
  }, []);

  /**
   * Genera fechas de rango rápido
   */
  const quickDateRanges = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return {
      today: {
        inicio: today.toISOString().split('T')[0],
        fin: today.toISOString().split('T')[0],
        label: 'Hoy'
      },
      thisWeek: {
        inicio: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fin: today.toISOString().split('T')[0],
        label: 'Últimos 7 días'
      },
      thisMonth: {
        inicio: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
        fin: today.toISOString().split('T')[0],
        label: 'Este mes'
      },
      lastMonth: {
        inicio: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
        fin: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0],
        label: 'Mes anterior'
      }
    };
  }, []);

  /**
   * Hook de debounce para búsqueda con corrección para campos vacíos
   */
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Normalizar el término de búsqueda (quitar espacios extra)
    const normalizedTerm = searchTerm.trim();
    
    // Si el campo está vacío, remover completamente el filtro de búsqueda
    if (normalizedTerm === '') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { busqueda, ...filtrosSinBusqueda } = filtros;
      onFiltrosChange(filtrosSinBusqueda);
      return;
    }
    
    // Para búsquedas con contenido, aplicar debounce de 3 segundos
    debounceRef.current = setTimeout(() => {
      onFiltrosChange({
        ...filtros,
        busqueda: normalizedTerm
      });
    }, 3000);
  }, [filtros, onFiltrosChange]);

  /**
   * Maneja cambios en la búsqueda con debounce inteligente
   * - Actualiza inmediatamente el estado local para mostrar el valor al usuario
   * - Aplica debounce para enviar cambios al filtro (3s para contenido, inmediato para vacío)
   */
  const handleBusquedaChange = useCallback((value: string) => {
    setLocalBusqueda(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  /**
   * Maneja cambios en otros filtros (sin debounce)
   */
  const handleFilterChange = useCallback((key: string, value: string) => {
    onFiltrosChange({
      ...filtros,
      [key]: value
    });
  }, [filtros, onFiltrosChange]);

  /**
   * Aplica rango de fechas rápido
   */
  const applyQuickDateRange = useCallback((range: keyof typeof quickDateRanges) => {
    const dateRange = quickDateRanges[range];
    onFiltrosChange({
      ...filtros,
      fechaInicio: dateRange.inicio,
      fechaFin: dateRange.fin
    });
  }, [filtros, onFiltrosChange, quickDateRanges]);

  /**
   * Limpia todos los filtros removiendo todas las propiedades
   */
  const clearAllFilters = useCallback(() => {
    // Limpiar debounce pendiente
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    setLocalBusqueda('');
    onFiltrosChange({}); // Objeto vacío para remover todos los filtros
  }, [onFiltrosChange]);

  /**
   * Verifica si hay filtros aplicados
   */
  const hasActiveFilters = useMemo(() => {
    return Object.values(filtros).some(value => value && value.trim() !== '');
  }, [filtros]);

  /**
   * Efecto para sincronizar estado local con filtros externos
   */
  useEffect(() => {
    setLocalBusqueda(filtros.busqueda || '');
  }, [filtros.busqueda]);

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

  /**
   * Efecto para sincronizar estado local con filtros externos
   */
  useEffect(() => {
    setLocalBusqueda(filtros.busqueda || '');
  }, [filtros.busqueda]);

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

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header de filtros */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Filter size={20} className="text-[#4d4725]" aria-hidden="true" />
          <h3 className="font-semibold text-[#4d4725]">
            Filtros de Búsqueda
          </h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#4d4725] text-white">
              Activos
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              disabled={loading}
              className="
                flex items-center gap-1 px-3 py-1.5 text-sm
                text-gray-600 hover:text-gray-800
                bg-gray-100 hover:bg-gray-200
                rounded-md transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              title="Limpiar filtros"
            >
              <X size={14} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              flex items-center gap-2 px-3 py-1.5 text-sm
              text-[#4d4725] hover:text-[#3a3519]
              bg-[#f8f0e7] hover:bg-[#f0e6d7]
              rounded-md transition-colors
            "
          >
            <span>{isExpanded ? 'Menos' : 'Más'} filtros</span>
            <Filter size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filtros básicos (siempre visibles) */}
      <div className="p-4 space-y-4">
        {/* Búsqueda general */}
        <div className="relative">
          <label htmlFor="busqueda-general" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar IPH
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
            <input
              id="busqueda-general"
              type="text"
              value={localBusqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              disabled={loading}
              placeholder="Buscar por número de reporte, ubicación o tipo de delito"
              className="
                w-full pl-10 pr-4 py-2
                border border-gray-300 rounded-md
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            />
            {loading && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4d4725]"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filtros en línea */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Estatus */}
          <div>
            <label htmlFor="estatus-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estatus-filter"
              value={filtros.estatus || ''}
              onChange={(e) => handleFilterChange('estatus', e.target.value)}
              disabled={loading}
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-md
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              <option value="">Todos los estados</option>
              {estatusOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de delito */}
          <div>
            <label htmlFor="tipo-delito-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Delito
            </label>
            <select
              id="tipo-delito-filter"
              value={filtros.tipoDelito || ''}
              onChange={(e) => handleFilterChange('tipoDelito', e.target.value)}
              disabled={loading}
              className="
                w-full px-3 py-2
                border border-gray-300 rounded-md
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              <option value="">Cualquier tipo de delito</option>
              {tiposDelitoOptions.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario */}
          <div>
            <label htmlFor="usuario-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" aria-hidden="true" />
              <input
                id="usuario-filter"
                type="text"
                value={filtros.usuario || ''}
                onChange={(e) => handleFilterChange('usuario', e.target.value)}
                disabled={loading}
                placeholder="Nombre completo o usuario"
                className="
                  w-full pl-10 pr-4 py-2
                  border border-gray-300 rounded-md
                  bg-white text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros avanzados (expandibles) */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          {/* Rango de fechas */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} />
              Rango de Fechas
            </h4>
            
            {/* Botones de rango rápido */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(quickDateRanges).map(([key, range]) => (
                <button
                  key={key}
                  onClick={() => applyQuickDateRange(key as keyof typeof quickDateRanges)}
                  disabled={loading}
                  className="
                    px-3 py-1 text-sm
                    text-[#4d4725] hover:text-white
                    bg-white hover:bg-[#4d4725]
                    border border-[#4d4725] rounded-md
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Selectores de fecha manual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha-inicio" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  id="fecha-inicio"
                  type="date"
                  value={filtros.fechaInicio || ''}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                  disabled={loading}
                  className="
                    w-full px-3 py-2
                    border border-gray-300 rounded-md
                    bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                />
              </div>
              
              <div>
                <label htmlFor="fecha-fin" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  id="fecha-fin"
                  type="date"
                  value={filtros.fechaFin || ''}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                  disabled={loading}
                  className="
                    w-full px-3 py-2
                    border border-gray-300 rounded-md
                    bg-white text-gray-900
                    focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200
                  "
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer con información */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#4d4725]"></div>
                <span>Aplicando filtros...</span>
              </>
            ) : (
              <>
                <AlertTriangle size={12} />
                <span>Los filtros se aplican automáticamente</span>
              </>
            )}
          </div>
          
          {hasActiveFilters && (
            <span className="text-[#4d4725] font-medium">
              Filtros activos aplicados
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltrosHistorial;