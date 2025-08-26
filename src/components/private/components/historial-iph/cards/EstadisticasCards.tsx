/**
 * Componente EstadisticasCards
 * Tarjetas de estadísticas para el historial de IPH
 */

import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Ban,
  TrendingUp,
  Calendar
} from 'lucide-react';

// Interfaces
import type { EstadisticasCardsProps } from '../../../../../interfaces/components/historialIph.interface';

// Mock data para configuración
import { estatusConfig } from '../../../../../mock/historial-iph';

/**
 * Componente de tarjetas de estadísticas
 * 
 * @param props - Props del componente
 * @returns JSX.Element de las tarjetas de estadísticas
 */
const EstadisticasCards: React.FC<EstadisticasCardsProps> = ({
  estadisticas,
  loading = false,
  className = ''
}) => {
  /**
   * Configuración de las tarjetas de estadísticas
   */
  const cardsConfig = [
    {
      key: 'total_registros',
      label: 'Total Registros',
      value: estadisticas.total_registros,
      icon: FileText,
      color: '#4f46e5', // indigo-600
      bgColor: '#e0e7ff', // indigo-100
      description: 'Registros totales'
    },
    {
      key: 'activos',
      label: 'Activos',
      value: estadisticas.activos,
      icon: CheckCircle,
      color: estatusConfig.Activo.color,
      bgColor: estatusConfig.Activo.bgColor,
      description: 'Casos activos'
    },
    {
      key: 'pendientes',
      label: 'Pendientes',
      value: estadisticas.pendientes,
      icon: Clock,
      color: estatusConfig.Pendiente.color,
      bgColor: estatusConfig.Pendiente.bgColor,
      description: 'Casos pendientes'
    },
    {
      key: 'inactivos',
      label: 'Inactivos',
      value: estadisticas.inactivos,
      icon: XCircle,
      color: estatusConfig.Inactivo.color,
      bgColor: estatusConfig.Inactivo.bgColor,
      description: 'Casos inactivos'
    },
    {
      key: 'cancelados',
      label: 'Cancelados',
      value: estadisticas.cancelados,
      icon: Ban,
      color: estatusConfig.Cancelado.color,
      bgColor: estatusConfig.Cancelado.bgColor,
      description: 'Casos cancelados'
    },
    {
      key: 'total_mes_actual',
      label: 'Este Mes',
      value: estadisticas.total_mes_actual,
      icon: Calendar,
      color: '#059669', // emerald-600
      bgColor: '#d1fae5', // emerald-100
      description: 'Registros del mes'
    },
    {
      key: 'promedio_diario',
      label: 'Promedio Diario',
      value: estadisticas.promedio_diario,
      icon: TrendingUp,
      color: '#7c3aed', // violet-600
      bgColor: '#ede9fe', // violet-100
      description: 'Promedio por día',
      suffix: ' reg/día'
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 ${className}`}>
      {cardsConfig.map(({ key, label, value, icon: Icon, color, bgColor, description, suffix = '' }) => (
        <div
          key={key}
          className={`
            bg-white rounded-lg shadow-sm border border-gray-200 p-4
            transition-all duration-200 hover:shadow-md hover:scale-[1.02]
            ${loading ? 'animate-pulse' : ''}
          `}
        >
          {/* Header con icono */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: bgColor }}
            >
              <Icon 
                size={20} 
                style={{ color: color }}
                aria-hidden="true"
              />
            </div>
            
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            )}
          </div>

          {/* Contenido principal */}
          <div className="space-y-1">
            {loading ? (
              <>
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900">
                  {value.toLocaleString()}{suffix}
                </h3>
                <p className="text-sm font-medium" style={{ color: color }}>
                  {label}
                </p>
                <p className="text-xs text-gray-500">
                  {description}
                </p>
              </>
            )}
          </div>

          {/* Barra de progreso para algunos casos */}
          {!loading && estadisticas.total_registros > 0 && ['activos', 'pendientes', 'inactivos', 'cancelados'].includes(key) && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Porcentaje</span>
                <span>{Math.round((value / estadisticas.total_registros) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    width: `${Math.min((value / estadisticas.total_registros) * 100, 100)}%`
                  }}
                  aria-label={`${Math.round((value / estadisticas.total_registros) * 100)}% del total`}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EstadisticasCards;