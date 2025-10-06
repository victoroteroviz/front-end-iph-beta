/**
 * @fileoverview Componente atómico FiltroAjustes
 * @version 1.0.0
 * @description Componente de búsqueda y filtros para secciones de ajustes
 */

import React from 'react';
import { Search, X, Filter } from 'lucide-react';

/**
 * @interface FiltroAjustesProps
 * @description Props del componente FiltroAjustes
 */
interface FiltroAjustesProps {
  /** Valor actual del filtro */
  filtro: string;
  /** Función para actualizar el filtro */
  onFiltroChange: (filtro: string) => void;
  /** Función para limpiar filtros */
  onLimpiarFiltros: () => void;
  /** Placeholder del input de búsqueda */
  placeholder?: string;
  /** Total de resultados */
  totalResultados?: number;
  /** Total de secciones disponibles */
  totalSecciones?: number;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * @component FiltroAjustes
 * @description Componente que proporciona funcionalidad de búsqueda y filtrado
 *
 * @param {FiltroAjustesProps} props - Props del componente
 * @returns {JSX.Element} Componente FiltroAjustes
 *
 * @example
 * ```tsx
 * <FiltroAjustes
 *   filtro={filtroActual}
 *   onFiltroChange={handleFiltroChange}
 *   onLimpiarFiltros={handleLimpiarFiltros}
 *   totalResultados={5}
 *   totalSecciones={8}
 * />
 * ```
 */
export const FiltroAjustes: React.FC<FiltroAjustesProps> = ({
  filtro,
  onFiltroChange,
  onLimpiarFiltros,
  placeholder = 'Buscar sección de ajustes...',
  totalResultados,
  totalSecciones,
  className = ''
}) => {
  /**
   * @function handleInputChange
   * @description Maneja el cambio en el input de búsqueda
   * @param {React.ChangeEvent<HTMLInputElement>} event - Evento de cambio
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onFiltroChange(event.target.value);
  };

  /**
   * @function handleClearClick
   * @description Maneja el clic en el botón de limpiar
   */
  const handleClearClick = (): void => {
    onLimpiarFiltros();
  };

  /**
   * @function handleKeyDown
   * @description Maneja eventos de teclado en el input
   * @param {React.KeyboardEvent<HTMLInputElement>} event - Evento de teclado
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Escape') {
      onLimpiarFiltros();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="relative flex items-center">
          {/* Icono de búsqueda */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>

          {/* Input de búsqueda */}
          <input
            type="text"
            value={filtro}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />

          {/* Botón de limpiar (solo si hay filtro) */}
          {filtro && (
            <button
              onClick={handleClearClick}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Limpiar búsqueda"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Información de resultados y filtros activos */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        {/* Contador de resultados */}
        <div className="flex items-center space-x-2">
          <Filter size={16} />
          <span>
            {totalResultados !== undefined && totalSecciones !== undefined ? (
              filtro ? (
                `${totalResultados} de ${totalSecciones} secciones`
              ) : (
                `${totalSecciones} secciones disponibles`
              )
            ) : (
              'Cargando secciones...'
            )}
          </span>
        </div>

        {/* Indicador de filtro activo */}
        {filtro && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
              <span>Filtro: "{filtro}"</span>
              <button
                onClick={handleClearClick}
                className="hover:text-blue-900 transition-colors duration-200"
                title="Quitar filtro"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filtro && totalResultados === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron secciones
          </h3>
          <p className="text-gray-600 mb-4">
            No hay secciones que coincidan con "{filtro}"
          </p>
          <button
            onClick={handleClearClick}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <X size={16} />
            <span>Limpiar búsqueda</span>
          </button>
        </div>
      )}
    </div>
  );
};