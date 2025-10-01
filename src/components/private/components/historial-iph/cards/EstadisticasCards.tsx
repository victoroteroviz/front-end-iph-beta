/**
 * Componente EstadisticasCards SUPER OPTIMIZADO
 * Tarjetas de estadísticas dinámicas para el historial de IPH
 */

import React, { useMemo, useCallback } from 'react';
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
 * Interface para la configuración de las tarjetas de estadísticas
 */
interface CardConfig {
  key: string;
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
  suffix?: string;
  isBaseCard: boolean;
}

// Helpers optimizados fuera del componente para mejor performance

/**
 * Cache para iconos de estatus
 */
const iconCache = new Map<string, React.ComponentType<any>>();

/**
 * Mapeo de iconos por tipo de estatus (dinámico) - OPTIMIZADO
 */
const getIconForEstatus = (estatus: string): React.ComponentType<any> => {
  // Verificar cache primero
  if (iconCache.has(estatus)) {
    return iconCache.get(estatus)!;
  }

  const estatusLower = estatus.toLowerCase();
  let icon: React.ComponentType<any>;

  if (estatusLower.includes('activo') || estatusLower.includes('active')) icon = CheckCircle;
  else if (estatusLower.includes('pendiente') || estatusLower.includes('pending')) icon = Clock;
  else if (estatusLower.includes('inactivo') || estatusLower.includes('inactive')) icon = XCircle;
  else if (estatusLower.includes('cancelado') || estatusLower.includes('cancelled')) icon = Ban;
  else if (estatusLower.includes('proceso') || estatusLower.includes('process')) icon = Activity;
  else if (estatusLower.includes('alerta') || estatusLower.includes('alert')) icon = AlertTriangle;
  else if (estatusLower.includes('seguro') || estatusLower.includes('secure')) icon = Shield;
  else if (estatusLower.includes('usuario') || estatusLower.includes('user')) icon = Users;
  else icon = FileText; // Icono por defecto

  // Guardar en cache
  iconCache.set(estatus, icon);
  return icon;
};

/**
 * Cache para colores de estatus
 */
const colorCache = new Map<string, {color: string, bgColor: string}>();

/**
 * Paleta de colores pre-definida y optimizada
 */
const COLOR_PALETTE = [
  { color: '#4f46e5', bgColor: '#e0e7ff' }, // indigo
  { color: '#7c3aed', bgColor: '#ede9fe' }, // violet
  { color: '#059669', bgColor: '#d1fae5' }, // emerald
  { color: '#dc2626', bgColor: '#fee2e2' }, // red
  { color: '#ea580c', bgColor: '#fed7aa' }, // orange
  { color: '#0891b2', bgColor: '#cffafe' }, // cyan
  { color: '#be185d', bgColor: '#fce7f3' }, // pink
] as const;

/**
 * Mapeo de colores por tipo de estatus (dinámico) - OPTIMIZADO
 */
const getColorsForEstatus = (estatus: string, index: number): {color: string, bgColor: string} => {
  // Verificar cache primero
  const cacheKey = `${estatus}_${index}`;
  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }

  const estatusLower = estatus.toLowerCase();
  let colors: {color: string, bgColor: string};

  // Colores específicos por palabras clave
  if (estatusLower.includes('activo') || estatusLower.includes('active')) {
    colors = { color: '#059669', bgColor: '#d1fae5' }; // green
  } else if (estatusLower.includes('pendiente') || estatusLower.includes('pending')) {
    colors = { color: '#f59e0b', bgColor: '#fef3c7' }; // amber
  } else if (estatusLower.includes('inactivo') || estatusLower.includes('inactive')) {
    colors = { color: '#dc2626', bgColor: '#fee2e2' }; // red
  } else if (estatusLower.includes('cancelado') || estatusLower.includes('cancelled')) {
    colors = { color: '#7c2d12', bgColor: '#fecaca' }; // red-800
  } else {
    // Usar paleta rotativa para estatus desconocidos
    colors = COLOR_PALETTE[index % COLOR_PALETTE.length];
  }

  // Guardar en cache
  colorCache.set(cacheKey, colors);
  return colors;
};

// Componente individual de tarjeta memoizado
const StatCard = React.memo<{
  cardConfig: CardConfig;
  loading: boolean;
  estadisticasTotal: number;
}>(({ cardConfig, loading, estadisticasTotal }) => {
  const { key, label, value, icon: Icon, color, bgColor, description, suffix = '', isBaseCard } = cardConfig;

  // Calcular porcentaje solo para tarjetas de estatus
  const porcentaje = useMemo(() => {
    if (isBaseCard || estadisticasTotal === 0) return 0;
    return Math.round((value / estadisticasTotal) * 100);
  }, [value, estadisticasTotal, isBaseCard]);

  return (
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
      {!loading && !isBaseCard && estadisticasTotal > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Porcentaje</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: color,
                width: `${Math.min(porcentaje, 100)}%`
              }}
              aria-label={`${porcentaje}% del total`}
            />
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para la tarjeta individual
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.estadisticasTotal === nextProps.estadisticasTotal &&
    prevProps.cardConfig.key === nextProps.cardConfig.key &&
    prevProps.cardConfig.value === nextProps.cardConfig.value &&
    prevProps.cardConfig.label === nextProps.cardConfig.label
  );
});

StatCard.displayName = 'StatCard';

/**
 * Componente de tarjetas de estadísticas dinámicas - SUPER OPTIMIZADO
 *
 * @param props - Props del componente
 * @returns JSX.Element de las tarjetas de estadísticas
 */
const EstadisticasCards: React.FC<EstadisticasCardsProps> = React.memo(({
  estadisticas,
  loading = false,
  className = ''
}) => {
  // Configuración base de tarjetas memoizada
  const baseCardsConfig = useMemo((): CardConfig[] => [
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
  ], [estadisticas.total, estadisticas.registroPorMes, estadisticas.promedioPorDia]);

  // Tarjetas de estatus memoizadas
  const statusCardsConfig = useMemo((): CardConfig[] => {
    if (!estadisticas.estatusPorIph || estadisticas.estatusPorIph.length === 0) {
      return [];
    }

    return estadisticas.estatusPorIph.map((item, index) => {
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
        suffix: '',
        isBaseCard: false
      };
    });
  }, [estadisticas.estatusPorIph]);

  // Configuración final de tarjetas optimizada
  const cardsConfig = useMemo((): CardConfig[] => [
    ...baseCardsConfig,
    ...statusCardsConfig
  ], [baseCardsConfig, statusCardsConfig]);

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 ${className}`}>
      {cardsConfig.map((cardConfig) => (
        <StatCard
          key={cardConfig.key}
          cardConfig={cardConfig}
          loading={loading}
          estadisticasTotal={estadisticas.total}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para React.memo
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.className === nextProps.className &&
    prevProps.estadisticas.total === nextProps.estadisticas.total &&
    prevProps.estadisticas.registroPorMes === nextProps.estadisticas.registroPorMes &&
    prevProps.estadisticas.promedioPorDia === nextProps.estadisticas.promedioPorDia &&
    // Comparación shallow de estatusPorIph
    prevProps.estadisticas.estatusPorIph?.length === nextProps.estadisticas.estatusPorIph?.length &&
    prevProps.estadisticas.estatusPorIph?.every((prevItem, index) => {
      const nextItem = nextProps.estadisticas.estatusPorIph?.[index];
      return prevItem && nextItem &&
        prevItem.estatus === nextItem.estatus &&
        prevItem.cantidad === nextItem.cantidad;
    })
  );
});

// Nombre para debugging
EstadisticasCards.displayName = 'EstadisticasCards';

export default EstadisticasCards;