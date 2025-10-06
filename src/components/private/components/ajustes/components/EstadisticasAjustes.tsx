/**
 * @fileoverview Componente atómico EstadisticasAjustes
 * @version 1.0.0
 * @description Muestra estadísticas del sistema de ajustes
 */

import React from 'react';
import { Settings, Database, TrendingUp, Clock } from 'lucide-react';
import type { IAjustesEstadisticas } from '../../../../../interfaces/ajustes';

/**
 * @interface EstadisticasAjustesProps
 * @description Props del componente EstadisticasAjustes
 */
interface EstadisticasAjustesProps {
  /** Datos de estadísticas */
  estadisticas: IAjustesEstadisticas | null;
  /** Estado de carga */
  loading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * @component EstadisticasAjustes
 * @description Componente que muestra estadísticas del sistema de ajustes
 *
 * @param {EstadisticasAjustesProps} props - Props del componente
 * @returns {JSX.Element} Componente EstadisticasAjustes
 */
export const EstadisticasAjustes: React.FC<EstadisticasAjustesProps> = ({
  estadisticas,
  loading = false,
  className = ''
}) => {
  /**
   * @function formatearFecha
   * @description Formatea la fecha de última actividad
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (loading || !estadisticas) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-24" />
                <div className="h-8 bg-gray-300 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Título de la sección */}
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp size={20} style={{ color: '#4d4725' }} />
        <h2 className="text-lg font-semibold" style={{ color: '#4d4725' }}>
          Estadísticas del Sistema
        </h2>
      </div>

      {/* Grid de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total de secciones */}
        <div className="text-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-3"
            style={{
              backgroundColor: '#b8ab8430',
              color: '#4d4725'
            }}
          >
            <Settings size={24} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#4d4725' }}>
            {estadisticas.totalSecciones}
          </p>
          <p className="text-sm" style={{ color: '#8b7355' }}>Secciones Disponibles</p>
        </div>

        {/* Total de opciones */}
        <div className="text-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-3"
            style={{
              backgroundColor: '#b8ab8430',
              color: '#4d4725'
            }}
          >
            <Database size={24} />
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#4d4725' }}>
            {estadisticas.totalOpciones}
          </p>
          <p className="text-sm" style={{ color: '#8b7355' }}>Opciones Configurables</p>
        </div>

        {/* Última actividad */}
        <div className="text-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg mx-auto mb-3"
            style={{
              backgroundColor: '#b8ab8430',
              color: '#4d4725'
            }}
          >
            <Clock size={24} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#4d4725' }}>
            Última Actividad
          </p>
          <p className="text-xs" style={{ color: '#8b7355' }}>
            {formatearFecha(estadisticas.ultimaActividad)}
          </p>
        </div>
      </div>

      {/* Secciones más utilizadas */}
      {estadisticas.seccionesMasUsadas && estadisticas.seccionesMasUsadas.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-4" style={{ color: '#4d4725' }}>
            Secciones Más Utilizadas
          </h3>
          <div className="space-y-3">
            {estadisticas.seccionesMasUsadas.map((seccion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: '#f8f0e7' }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                    style={{
                      backgroundColor: '#b8ab8430',
                      color: '#4d4725'
                    }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#4d4725' }}>
                    {seccion.nombre}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm" style={{ color: '#8b7355' }}>{seccion.usos} usos</span>
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#b8ab8440' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: '#b8ab84',
                        width: `${(seccion.usos / Math.max(...estadisticas.seccionesMasUsadas.map(s => s.usos))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};