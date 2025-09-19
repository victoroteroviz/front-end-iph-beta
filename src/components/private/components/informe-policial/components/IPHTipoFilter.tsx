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
      border: '#FDD835',     // Color del borde (ARGB 255, 253, 216, 53)
      bgLight: '#FEF7CD',    // Versión ligera para estado normal
      bgNormal: '#FDD835',   // Color del borde para hover
      bgDark: '#F9A825',     // Versión oscura para seleccionado
      textLight: '#92400E',  // Texto para fondo ligero
      textNormal: '#1A1A1A', // Texto para hover (contraste con amarillo)
      textDark: '#1A1A1A'    // Texto para seleccionado
    };
  } else if (nombre.includes('Hechos Probablemente Delictivos')) {
    return {
      border: '#FF6F00',     // Color del borde (ARGB 255, 255, 111, 0)
      bgLight: '#FFF3E0',    // Versión ligera para estado normal
      bgNormal: '#FF6F00',   // Color del borde para hover
      bgDark: '#E65100',     // Versión oscura para seleccionado
      textLight: '#BF360C',  // Texto para fondo ligero
      textNormal: '#FFFFFF', // Texto para hover (contraste con naranja)
      textDark: '#FFFFFF'    // Texto para seleccionado
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
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#4d4725] font-poppins flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Tipo de IPH
        </h3>
        
        {/* Botón limpiar todo */}
        {hasSelectedTipo && (
          <button
            onClick={handleClearAll}
            disabled={loading}
            className="
              flex items-center gap-1 px-2 py-1 text-xs text-gray-500
              hover:text-gray-700 hover:bg-gray-100 rounded cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 font-poppins
            "
            aria-label="Limpiar filtros"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>

      {/* Botones de tipos */}
      <div className="flex flex-wrap gap-3">
        {tipos.map((tipo) => {
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
                flex items-center gap-2 px-3 py-2 rounded-lg font-poppins text-xs font-medium
                transition-all duration-200 min-h-[36px] cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                max-w-[280px] flex-shrink-0 border-2
                ${isSelected 
                  ? 'shadow-md' 
                  : 'hover:scale-105 hover:shadow-sm'
                }
              `}
              style={{
                // Estado seleccionado: fondo oscuro
                backgroundColor: isSelected ? colors.bgDark : colors.bgLight,
                borderColor: colors.border,
                color: isSelected ? colors.textDark : colors.textLight
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !isLoading) {
                  // Hover: usar color del borde y texto contrastante
                  e.currentTarget.style.backgroundColor = colors.bgNormal;
                  e.currentTarget.style.color = colors.textNormal;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !isLoading) {
                  // Volver al estado normal: fondo ligero
                  e.currentTarget.style.backgroundColor = colors.bgLight;
                  e.currentTarget.style.color = colors.textLight;
                }
              }}
              aria-label={`Filtrar por ${tipo.nombre}`}
              aria-pressed={isSelected}
              title={tipo.nombre} // Tooltip con nombre completo
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
                    color: isSelected ? colors.textDark : colors.textLight
                  }}
                >
                  {tipo.codigo}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Estado de carga */}
        {loading && tipos.length === 0 && (
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
            {tipos.length > 0 
              ? `${tipos.length} tipo${tipos.length !== 1 ? 's' : ''} disponible${tipos.length !== 1 ? 's' : ''}`
              : loading 
                ? 'Cargando...' 
                : 'Sin tipos disponibles'
            }
          </span>
          
          {/* Filtro activo */}
          {hasSelectedTipo && (() => {
            const tipoSeleccionado = tipos.find(t => t.id === selectedTipoId);
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
      {!loading && tipos.length === 0 && (
        <div className="text-center text-sm text-gray-500 font-poppins py-4">
          No hay tipos de IPH disponibles
        </div>
      )}
    </div>
  );
};

export default IPHTipoFilter;