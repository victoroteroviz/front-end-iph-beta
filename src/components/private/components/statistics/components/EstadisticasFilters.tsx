/**
 * Componente EstadisticasFilters
 * Filtros para seleccionar día, mes y año en estadísticas
 */

import React, { useMemo } from 'react';
import { Calendar, Filter } from 'lucide-react';

// Interfaces
import type { EstadisticasFiltersProps } from '../../../../../interfaces/components/estadisticasUsuario.interface';

/**
 * Componente de filtros para estadísticas
 * 
 * @param props - Props del componente de filtros
 * @returns JSX.Element de los filtros
 */
const EstadisticasFilters: React.FC<EstadisticasFiltersProps> = ({
  mes,
  anio,
  dia,
  onMesChange,
  onAnioChange,
  onDiaChange,
  loading = false,
  className = '',
  inline = false
}) => {
  /**
   * Genera array de meses para el selector
   */
  const meses = useMemo(() => {
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return nombresMeses.map((nombre, index) => ({
      value: index + 1,
      label: nombre
    }));
  }, []);

  /**
   * Genera array de años para el selector
   */
  const anios = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Incluir años desde 2020 hasta el año actual + 2
    for (let year = 2020; year <= currentYear + 2; year++) {
      years.push(year);
    }
    
    return years;
  }, []);

  /**
   * Calcula los días disponibles según el mes y año seleccionados
   */
  const dias = useMemo(() => {
    const diasEnMes = new Date(anio, mes, 0).getDate();
    return Array.from({ length: diasEnMes }, (_, i) => i + 1);
  }, [anio, mes]);

  /**
   * Maneja el cambio de mes
   */
  const handleMesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoMes = Number(e.target.value);
    onMesChange(nuevoMes);
  };

  /**
   * Maneja el cambio de año
   */
  const handleAnioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoAnio = Number(e.target.value);
    onAnioChange(nuevoAnio);
  };

  /**
   * Maneja el cambio de día
   */
  const handleDiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onDiaChange) {
      const nuevoDia = Number(e.target.value);
      onDiaChange(nuevoDia);
    }
  };

  // Si es modo inline, renderizar versión compacta
  if (inline) {
    return (
      <div className={`flex items-center gap-4 flex-wrap ${className}`}>
        {/* Selector de Año */}
        <div className="flex items-center gap-2">
          <label htmlFor="anio-selector-inline" className="text-sm font-semibold text-gray-700">
            Año:
          </label>
          <select
            id="anio-selector-inline"
            value={anio}
            onChange={handleAnioChange}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            aria-label="Seleccionar año"
          >
            {anios.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Selector de Mes */}
        <div className="flex items-center gap-2">
          <label htmlFor="mes-selector-inline" className="text-sm font-semibold text-gray-700">
            Mes:
          </label>
          <select
            id="mes-selector-inline"
            value={mes}
            onChange={handleMesChange}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
            aria-label="Seleccionar mes"
          >
            {meses.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Selector de Día (solo si dia y onDiaChange están definidos) */}
        {dia !== undefined && onDiaChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="dia-selector-inline" className="text-sm font-semibold text-gray-700">
              Día:
            </label>
            <select
              id="dia-selector-inline"
              value={dia}
              onChange={handleDiaChange}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
              aria-label="Seleccionar día"
            >
              {dias.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {/* Indicador de carga inline */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#4d4725]">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#4d4725]/30 border-t-[#4d4725]"></div>
            <span>Actualizando...</span>
          </div>
        )}
      </div>
    );
  }

  // Renderizado normal (no inline)

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Filter size={20} className="text-[#4d4725] flex-shrink-0" aria-hidden="true" />
        <h3 className="font-semibold text-[#4d4725] text-base sm:text-lg">
          Filtros de Búsqueda
        </h3>
      </div>

      {/* Filtros */}
      <div className="space-y-6">
        {/* Contenedor principal de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selector de Mes */}
          <div className="group">
            <label 
              htmlFor="mes-selector" 
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
            >
              <Calendar size={16} className="text-[#4d4725]" />
              Seleccionar Mes
            </label>
            <div className="relative">
              <select
                id="mes-selector"
                value={mes}
                onChange={handleMesChange}
                disabled={loading}
                className="
                  w-full px-4 py-3 pr-10
                  border-2 border-gray-200 rounded-xl
                  bg-gradient-to-r from-white to-gray-50
                  text-gray-900 font-medium
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725]
                  hover:border-[#4d4725]/40 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer transition-all duration-300 ease-out
                  appearance-none text-center
                  group-hover:shadow-md
                "
                aria-label="Seleccionar mes"
              >
                {meses.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Selector de Año */}
          <div className="group">
            <label 
              htmlFor="anio-selector" 
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
            >
              <Calendar size={16} className="text-[#4d4725]" />
              Seleccionar Año
            </label>
            <div className="relative">
              <select
                id="anio-selector"
                value={anio}
                onChange={handleAnioChange}
                disabled={loading}
                className="
                  w-full px-4 py-3 pr-10
                  border-2 border-gray-200 rounded-xl
                  bg-gradient-to-r from-white to-gray-50
                  text-gray-900 font-medium
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725]
                  hover:border-[#4d4725]/40 hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer transition-all duration-300 ease-out
                  appearance-none text-center
                  group-hover:shadow-md
                "
                aria-label="Seleccionar año"
              >
                {anios.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de estado mejorado */}
        {loading && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3 bg-[#4d4725]/5 border border-[#4d4725]/20 px-6 py-3 rounded-full text-sm text-[#4d4725] font-medium">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4d4725]/30 border-t-[#4d4725]"></div>
              <span>Actualizando estadísticas...</span>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs sm:text-sm text-gray-500">
            Mostrando estadísticas para <span className="font-medium">{meses.find(m => m.value === mes)?.label || 'Mes no válido'} {anio}</span>
          </p>
          <div className="text-xs text-gray-400 hidden sm:block">
            Actualizar filtros para ver nuevos datos
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasFilters;