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
   * Genera array de meses para el selector (solo para el mensaje de información)
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
   * Maneja el cambio de mes
   */
  const handleMesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoMes = Number(e.target.value);
    // Validar que el mes esté entre 1 y 12
    if (nuevoMes >= 1 && nuevoMes <= 12) {
      onMesChange(nuevoMes);
    }
  };

  /**
   * Maneja el cambio de año
   */
  const handleAnioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoAnio = Number(e.target.value);
    // Validar que el año sea razonable (desde 2000)
    if (nuevoAnio >= 2000) {
      onAnioChange(nuevoAnio);
    }
  };

  /**
   * Maneja el cambio de día
   */
  const handleDiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onDiaChange) {
      const nuevoDia = Number(e.target.value);
      const diasEnMes = new Date(anio, mes, 0).getDate();
      // Validar que el día esté dentro del rango del mes
      if (nuevoDia >= 1 && nuevoDia <= diasEnMes) {
        onDiaChange(nuevoDia);
      }
    }
  };

  // Si es modo inline, renderizar versión compacta
  if (inline) {
    return (
      <div className={`flex items-center gap-4 flex-wrap ${className}`}>
        {/* Input de Año */}
        <div className="flex items-center gap-2">
          <label htmlFor="anio-input-inline" className="text-sm font-semibold text-gray-700">
            Año:
          </label>
          <input
            id="anio-input-inline"
            type="number"
            value={anio}
            onChange={handleAnioChange}
            disabled={loading}
            min={2000}
            placeholder="Año"
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Ingresar año"
          />
        </div>

        {/* Input de Mes */}
        <div className="flex items-center gap-2">
          <label htmlFor="mes-input-inline" className="text-sm font-semibold text-gray-700">
            Mes:
          </label>
          <input
            id="mes-input-inline"
            type="number"
            value={mes}
            onChange={handleMesChange}
            disabled={loading}
            min={1}
            max={12}
            placeholder="Mes"
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Ingresar mes (1-12)"
          />
        </div>

        {/* Input de Día (solo si dia y onDiaChange están definidos) */}
        {dia !== undefined && onDiaChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="dia-input-inline" className="text-sm font-semibold text-gray-700">
              Día:
            </label>
            <input
              id="dia-input-inline"
              type="number"
              value={dia}
              onChange={handleDiaChange}
              disabled={loading}
              min={1}
              max={new Date(anio, mes, 0).getDate()}
              placeholder="Día"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725] hover:border-[#4d4725]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Ingresar día"
            />
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
          {/* Input de Mes */}
          <div className="group">
            <label 
              htmlFor="mes-input" 
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
            >
              <Calendar size={16} className="text-[#4d4725]" />
              Mes (1-12)
            </label>
            <input
              id="mes-input"
              type="number"
              value={mes}
              onChange={handleMesChange}
              disabled={loading}
              min={1}
              max={12}
              placeholder="Ingresa el mes"
              className="
                w-full px-4 py-3
                border-2 border-gray-200 rounded-xl
                bg-gradient-to-r from-white to-gray-50
                text-gray-900 font-medium text-center
                focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725]
                hover:border-[#4d4725]/40 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 ease-out
                group-hover:shadow-md
              "
              aria-label="Ingresar mes (1-12)"
            />
          </div>

          {/* Input de Año */}
          <div className="group">
            <label 
              htmlFor="anio-input" 
              className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"
            >
              <Calendar size={16} className="text-[#4d4725]" />
              Año
            </label>
            <input
              id="anio-input"
              type="number"
              value={anio}
              onChange={handleAnioChange}
              disabled={loading}
              min={2000}
              placeholder="Ingresa el año"
              className="
                w-full px-4 py-3
                border-2 border-gray-200 rounded-xl
                bg-gradient-to-r from-white to-gray-50
                text-gray-900 font-medium text-center
                focus:outline-none focus:ring-2 focus:ring-[#4d4725]/30 focus:border-[#4d4725]
                hover:border-[#4d4725]/40 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 ease-out
                group-hover:shadow-md
              "
              aria-label="Ingresar año"
            />
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