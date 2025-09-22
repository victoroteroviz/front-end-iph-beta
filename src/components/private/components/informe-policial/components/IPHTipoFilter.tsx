/**
 * Componente IPHTipoFilter
 * Filtro de botones horizontales para seleccionar tipo de IPH
 */

import React, { useCallback } from 'react';
import { Filter, Check, X } from 'lucide-react';
import type { IIPHTipoFilterProps } from '../../../../../interfaces/components/informe-policial.interface';

// =====================================================
// CONFIGURACIÓN DE COLORES POR TIPO
// =====================================================

/**
 * Determina los colores de un tipo IPH basado en su nombre
 * Estados: normal (ligero), hover (borde), seleccionado (oscuro)
 */
const getTipoColors = (nombre: string) => {
  if (nombre.includes('Justicia Cívica')) {
    return {
      border: '#fcd34d',     // amber-300
      bgLight: '#fef3c7',    // amber-100
      bgNormal: '#fcd34d',   // amber-300 (primario)
      bgDark: '#f59e0b',     // amber-400 (secundario)
      textLight: '#92400e',  // amber-800
      textNormal: '#1f2937', // gray-800 (mejor contraste)
      textDark: '#1f2937'    // gray-800
    };
  } else if (nombre.includes('Hechos Probablemente Delictivos')) {
    return {
      border: '#fb923c',     // orange-300
      bgLight: '#fed7aa',    // orange-100
      bgNormal: '#fb923c',   // orange-300 (primario)
      bgDark: '#f97316',     // orange-400 (secundario)
      textLight: '#c2410c',  // orange-700
      textNormal: '#ffffff', // white (buen contraste con naranja)
      textDark: '#ffffff'    // white
    };
  }

  // Fallback para otros tipos (si los hubiera)
  return {
    border: '#c2b186',
    bgLight: '#F5F1E8',
    bgNormal: '#c2b186',
    bgDark: '#4d4725',
    textLight: '#4d4725',
    textNormal: '#FFFFFF',
    textDark: '#FFFFFF'
  };
};

const IPHTipoFilter: React.FC<IIPHTipoFilterProps> = ({
  tipos,
  selectedTipoId,
  loading,
  onTipoChange,
  className = ''
}) => {

  /**
   * Maneja el clic en un botón de tipo
   */
  const handleTipoClick = useCallback((tipoId: string) => {
    // Si ya está seleccionado, deseleccionar
    const newTipoId = selectedTipoId === tipoId ? '' : tipoId;
    onTipoChange(newTipoId);
  }, [selectedTipoId, onTipoChange]);

  /**
   * Limpia el filtro de tipo
   */
  const handleClearAll = useCallback(() => {
    onTipoChange('');
  }, [onTipoChange]);

  const hasSelectedTipo = selectedTipoId && selectedTipoId.trim() !== '';

  return (
    <div className={`bg-gradient-to-br from-white via-[#fdf7f1] to-white rounded-xl shadow-lg border border-gray-100 p-6 backdrop-blur-sm ${className}`}>
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#c2b186] to-[#4d4725] rounded-lg shadow-md">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#4d4725] font-poppins">
              Tipo de IPH
            </h3>
          </div>
        </div>

        {/* Botón limpiar todo mejorado */}
        {hasSelectedTipo && (
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="
              group flex items-center gap-2 px-4 py-2 text-sm font-medium
              text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50
              border-2 border-gray-300 rounded-xl shadow-lg
              hover:from-red-50 hover:to-red-100 hover:border-red-300 hover:text-red-700
              hover:shadow-xl hover:scale-105 hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              focus:ring-4 focus:ring-gray-300/30
              cursor-pointer transition-all duration-300 font-poppins
              overflow-hidden
            "
            aria-label="Limpiar filtros"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-100/0 to-red-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <X className="h-4 w-4 relative z-10" />
            <span className="relative z-10">Limpiar</span>
          </button>
        )}
      </div>

      {/* Botones de tipos mejorados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tipos?.map((tipo) => {
          const isSelected = selectedTipoId === tipo.id;
          const isLoading = loading;
          
          // Obtener colores específicos para este tipo
          const colors = getTipoColors(tipo.nombre);
          
          // Crear nombre abreviado para la UI
          const nombreAbreviado = tipo.nombre
            .replace('IPH para ', '')
            .replace('IPH de ', '')
            .replace(' con detenido', ' (c/det.)')
            .replace(' sin detenido', ' (s/det.)');
          
          return (
            <button
              key={tipo.id}
              onClick={() => handleTipoClick(tipo.id)}
              disabled={isLoading}
              className={`
                group relative flex items-center gap-2 px-3 py-2 rounded-lg font-poppins text-xs font-medium
                transition-all duration-200 min-h-[36px] cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                border-2 shadow-sm overflow-hidden
                ${isSelected
                  ? 'shadow-md'
                  : 'hover:scale-105 hover:shadow-sm'
                }
              `}
              style={{
                backgroundColor: isSelected ? colors.bgNormal : colors.bgLight,
                borderColor: colors.border,
                color: isSelected ? colors.textNormal : colors.textLight
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isLoading) {
                  e.currentTarget.style.backgroundColor = colors.bgNormal;
                  e.currentTarget.style.color = colors.textNormal;
                  e.currentTarget.style.borderColor = colors.border;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isLoading) {
                  e.currentTarget.style.backgroundColor = colors.bgLight;
                  e.currentTarget.style.color = colors.textLight;
                  e.currentTarget.style.borderColor = colors.border;
                }
              }}
              aria-label={`Filtrar por ${tipo.nombre}`}
              aria-pressed={isSelected}
              title={tipo.nombre}
            >
              {/* Indicador de selección */}
              {isSelected && (
                <Check className="h-3 w-3 flex-shrink-0" />
              )}

              {/* Nombre abreviado */}
              <span className="truncate text-left leading-tight">
                {nombreAbreviado}
              </span>

              {/* Código opcional */}
              {tipo.codigo && (
                <span
                  className="text-[10px] px-1 py-0.5 rounded font-mono flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isSelected
                      ? 'rgba(255,255,255,0.25)'
                      : 'rgba(0,0,0,0.1)',
                    color: isSelected ? colors.textNormal : colors.textLight
                  }}
                >
                  {tipo.codigo}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Estado de carga */}
        {loading && (!tipos || tipos.length === 0) && (
          <div className="flex items-center gap-2 text-gray-500 text-sm font-poppins">
            <div className="w-4 h-4 border-2 border-[#c2b186] border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando tipos...</span>
          </div>
        )}
      </div>

      {/* Información de estado */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500 font-poppins">
          {/* Contador de tipos */}
          <span>
            {tipos && tipos.length > 0
              ? `${tipos.length} tipo${tipos.length !== 1 ? 's' : ''} disponible${tipos.length !== 1 ? 's' : ''}`
              : loading
                ? 'Cargando...'
                : 'Sin tipos disponibles'
            }
          </span>
          
          {/* Filtro activo */}
          {hasSelectedTipo && (() => {
            const tipoSeleccionado = tipos?.find(t => t.id === selectedTipoId);
            const colors = tipoSeleccionado ? getTipoColors(tipoSeleccionado.nombre) : null;
            
            return (
              <div className="flex items-center gap-1" style={{ color: colors?.border || '#c2b186' }}>
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: colors?.border || '#c2b186' }}
                />
                <span>
                  Mostrando: {tipoSeleccionado?.nombre || 'Desconocido'}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Estado vacío */}
      {!loading && (!tipos || tipos.length === 0) && (
        <div className="text-center text-sm text-gray-500 font-poppins py-4">
          No hay tipos de IPH disponibles
        </div>
      )}
    </div>
  );
};

export default IPHTipoFilter;