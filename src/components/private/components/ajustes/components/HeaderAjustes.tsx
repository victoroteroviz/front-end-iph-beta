/**
 * @fileoverview Componente atómico HeaderAjustes
 * @version 1.0.0
 * @description Header principal del componente de ajustes con estadísticas
 */

import React from 'react';
import { Settings, RefreshCw, Filter } from 'lucide-react';
import type { IAjustesConfig, IAjustesEstadisticas } from '../../../../../interfaces/ajustes';

/**
 * @interface HeaderAjustesProps
 * @description Props del componente HeaderAjustes
 */
interface HeaderAjustesProps {
  /** Configuración de ajustes */
  configuracion: IAjustesConfig | null;
  /** Estadísticas del sistema */
  estadisticas: IAjustesEstadisticas | null;
  /** Función para recargar datos */
  onRecargar: () => void;
  /** Estado de carga */
  loading?: boolean;
  /** Indica si hay filtros activos */
  hasActiveFilters?: boolean;
  /** Función para limpiar filtros */
  onLimpiarFiltros?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * @component HeaderAjustes
 * @description Componente que muestra el header principal de ajustes
 *
 * @param {HeaderAjustesProps} props - Props del componente
 * @returns {JSX.Element} Componente HeaderAjustes
 */
export const HeaderAjustes: React.FC<HeaderAjustesProps> = ({
  configuracion,
  estadisticas,
  onRecargar,
  loading = false,
  hasActiveFilters = false,
  onLimpiarFiltros,
  className = ''
}) => {
  if (loading || !configuracion) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 mb-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded" />
              <div>
                <div className="h-6 bg-gray-300 rounded w-64 mb-2" />
                <div className="h-4 bg-gray-300 rounded w-96" />
              </div>
            </div>
            <div className="w-24 h-9 bg-gray-300 rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
                <div className="h-6 bg-gray-300 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 mb-6 ${className}`}>
      {/* Header principal */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{
              backgroundColor: `${configuracion.temas.primario}15`,
              color: configuracion.temas.primario
            }}
          >
            <Settings size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {configuracion.titulo}
            </h1>
            <p className="text-gray-600 mt-1">
              {configuracion.subtitulo}
            </p>
          </div>
        </div>

        {/* Controles del header */}
        <div className="flex items-center space-x-3">
          {/* Botón para limpiar filtros */}
          {hasActiveFilters && onLimpiarFiltros && (
            <button
              onClick={onLimpiarFiltros}
              className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              title="Limpiar filtros"
            >
              <Filter size={16} />
              <span>Limpiar filtros</span>
            </button>
          )}

          {/* Botón de recarga */}
          <button
            onClick={onRecargar}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{
              backgroundColor: configuracion.temas.primario,
              borderColor: configuracion.temas.primario
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#3d3620';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = configuracion.temas.primario;
              }
            }}
          >
            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {configuracion.mostrarEstadisticas && estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total de secciones */}
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${configuracion.temas.fondo}`,
              borderColor: `${configuracion.temas.secundario}40`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: configuracion.temas.primario }}
                >
                  Secciones Disponibles
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: configuracion.temas.primario }}
                >
                  {estadisticas.totalSecciones}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${configuracion.temas.secundario}30`,
                  color: configuracion.temas.primario
                }}
              >
                <Settings size={16} />
              </div>
            </div>
          </div>

          {/* Total de opciones */}
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${configuracion.temas.fondo}`,
              borderColor: `${configuracion.temas.secundario}40`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: configuracion.temas.primario }}
                >
                  Opciones Configurables
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: configuracion.temas.primario }}
                >
                  {estadisticas.totalOpciones}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${configuracion.temas.secundario}30`,
                  color: configuracion.temas.primario
                }}
              >
                <Filter size={16} />
              </div>
            </div>
          </div>

          {/* Sección más utilizada */}
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: `${configuracion.temas.fondo}`,
              borderColor: `${configuracion.temas.secundario}40`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: configuracion.temas.primario }}
                >
                  Más Utilizada
                </p>
                <p
                  className="text-sm font-bold truncate"
                  style={{ color: configuracion.temas.primario }}
                >
                  {estadisticas.seccionesMasUsadas.length > 0
                    ? estadisticas.seccionesMasUsadas[0].nombre
                    : 'N/A'
                  }
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${configuracion.temas.secundario}30`,
                  color: configuracion.temas.primario
                }}
              >
                <RefreshCw size={16} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};