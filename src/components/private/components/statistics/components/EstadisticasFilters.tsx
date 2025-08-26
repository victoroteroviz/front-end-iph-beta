/**
 * Componente EstadisticasFilters
 * Filtros para seleccionar mes y año en estadísticas
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
  onMesChange,
  onAnioChange,
  loading = false,
  className = ''
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

  return (
    <div className={`
      bg-white rounded-lg shadow-sm border border-gray-200 p-4
      ${className}
    `}>
      <div className="flex items-center gap-3 mb-4">
        <Filter size={20} className="text-[#4d4725]" aria-hidden="true" />
        <h3 className="font-semibold text-[#4d4725]">
          Filtros de Búsqueda
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Selector de Mes */}
        <div className="flex-1 min-w-[150px]">
          <label 
            htmlFor="mes-selector" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mes
          </label>
          <div className="relative">
            <select
              id="mes-selector"
              value={mes}
              onChange={handleMesChange}
              disabled={loading}
              className="
                w-full px-3 py-2 pr-8
                border border-gray-300 rounded-md
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
              aria-label="Seleccionar mes"
            >
              {meses.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Calendar 
              size={16} 
              className="absolute right-2 top-3 text-gray-400 pointer-events-none" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Selector de Año */}
        <div className="flex-1 min-w-[120px]">
          <label 
            htmlFor="anio-selector" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Año
          </label>
          <div className="relative">
            <select
              id="anio-selector"
              value={anio}
              onChange={handleAnioChange}
              disabled={loading}
              className="
                w-full px-3 py-2 pr-8
                border border-gray-300 rounded-md
                bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
              aria-label="Seleccionar año"
            >
              {anios.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Calendar 
              size={16} 
              className="absolute right-2 top-3 text-gray-400 pointer-events-none" 
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Indicador de estado */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {loading && (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4d4725]"></div>
              <span>Cargando...</span>
            </>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Mostrando estadísticas para {meses.find(m => m.value === mes)?.label} {anio}
        </p>
      </div>
    </div>
  );
};

export default EstadisticasFilters;