/**
 * Componente EstadisticasCards
 * Tarjetas de estadísticas dinámicas para el historial de IPH
 */

import React, { useMemo } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Shield,
  Users,
  Activity
} from 'lucide-react';

// Interfaces
import type { EstadisticasCardsProps } from '../../../../../interfaces/components/historialIph.interface';

/**
 * Mapeo de iconos por tipo de estatus (dinámico)
 */
const getIconForEstatus = (estatus: string) => {
  const estatusLower = estatus.toLowerCase();

  if (estatusLower.includes('activo') || estatusLower.includes('active')) return CheckCircle;
  if (estatusLower.includes('pendiente') || estatusLower.includes('pending')) return Clock;
  if (estatusLower.includes('inactivo') || estatusLower.includes('inactive')) return XCircle;
  if (estatusLower.includes('cancelado') || estatusLower.includes('cancelled')) return Ban;
  if (estatusLower.includes('proceso') || estatusLower.includes('process')) return Activity;
  if (estatusLower.includes('alerta') || estatusLower.includes('alert')) return AlertTriangle;
  if (estatusLower.includes('seguro') || estatusLower.includes('secure')) return Shield;
  if (estatusLower.includes('usuario') || estatusLower.includes('user')) return Users;

  // Icono por defecto
  return FileText;
};

/**
 * Mapeo de colores por tipo de estatus (dinámico)
 */
const getColorsForEstatus = (estatus: string, index: number) => {
  const estatusLower = estatus.toLowerCase();

  // Colores específicos por palabras clave
  if (estatusLower.includes('activo') || estatusLower.includes('active')) {
    return { color: '#059669', bgColor: '#d1fae5' }; // green
  }
  if (estatusLower.includes('pendiente') || estatusLower.includes('pending')) {
    return { color: '#f59e0b', bgColor: '#fef3c7' }; // amber
  }
  if (estatusLower.includes('inactivo') || estatusLower.includes('inactive')) {
    return { color: '#dc2626', bgColor: '#fee2e2' }; // red
  }
  if (estatusLower.includes('cancelado') || estatusLower.includes('cancelled')) {
    return { color: '#7c2d12', bgColor: '#fecaca' }; // red-800
  }

  // Paleta de colores rotativos para estatus desconocidos
  const colorPalette = [
    { color: '#4f46e5', bgColor: '#e0e7ff' }, // indigo
    { color: '#7c3aed', bgColor: '#ede9fe' }, // violet
    { color: '#059669', bgColor: '#d1fae5' }, // emerald
    { color: '#dc2626', bgColor: '#fee2e2' }, // red
    { color: '#ea580c', bgColor: '#fed7aa' }, // orange
    { color: '#0891b2', bgColor: '#cffafe' }, // cyan
    { color: '#be185d', bgColor: '#fce7f3' }, // pink
  ];

  return colorPalette[index % colorPalette.length];
};

/**
 * Componente de tarjetas de estadísticas dinámicas
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
   * Configuración dinámica de las tarjetas de estadísticas
   */
  const cardsConfig = useMemo(() => {
    const baseCards = [
      {
        key: 'total',
        label: 'Total Registros',
        value: estadisticas.total || 0,
        icon: FileText,
        color: '#4f46e5', // indigo-600
        bgColor: '#e0e7ff', // indigo-100
        description: 'Registros totales',
        isBaseCard: true
      },
      {
        key: 'registroPorMes',
        label: 'Este Mes',
        value: estadisticas.registroPorMes || 0,
        icon: Calendar,
        color: '#059669', // emerald-600
        bgColor: '#d1fae5', // emerald-100
        description: 'Registros del mes',
        isBaseCard: true
      },
      {
        key: 'promedioPorDia',
        label: 'Promedio Diario',
        value: Number((estadisticas.promedioPorDia || 0).toFixed(1)),
        icon: TrendingUp,
        color: '#7c3aed', // violet-600
        bgColor: '#ede9fe', // violet-100
        description: 'Promedio por día',
        suffix: ' reg/día',
        isBaseCard: true
      }
    ];

    // Generar tarjetas dinámicamente para cada estatus
    const statusCards = (estadisticas.estatusPorIph || []).map((item, index) => {
      const colors = getColorsForEstatus(item.estatus, index);
      const Icon = getIconForEstatus(item.estatus);

      return {
        key: `estatus_${item.estatus.replace(/\s+/g, '_').toLowerCase()}`,
        label: item.estatus,
        value: item.cantidad,
        icon: Icon,
        color: colors.color,
        bgColor: colors.bgColor,
        description: `Casos ${item.estatus.toLowerCase()}`,
        isBaseCard: false
      };
    });

    return [...baseCards, ...statusCards];
  }, [estadisticas]);

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

          {/* Barra de progreso para tarjetas de estatus (dinámicas) */}
          {!loading && estadisticas.total > 0 && !cardsConfig.find(card => card.key === key)?.isBaseCard && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Porcentaje</span>
                <span>{Math.round((value / estadisticas.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    width: `${Math.min((value / estadisticas.total) * 100, 100)}%`
                  }}
                  aria-label={`${Math.round((value / estadisticas.total) * 100)}% del total`}
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