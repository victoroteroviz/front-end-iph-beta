/**
 * @fileoverview Componente de tarjeta de estadísticas reutilizable
 * @version 1.0.0
 * @description Tarjeta para mostrar métricas y estadísticas
 */

import React from 'react';
import { COLORS } from '../../constants/theme.constants';

interface StatsCardProps {
  label: string;
  value: number | string;
  valueColor?: 'primary' | 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

const COLOR_CLASSES = {
  primary: 'text-[#4d4725]',
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-orange-600',
  info: 'text-blue-600',
} as const;

/**
 * Componente de tarjeta de estadísticas reutilizable
 */
export const StatsCard: React.FC<StatsCardProps> = React.memo(({
  label,
  value,
  valueColor = 'primary',
  icon,
  isLoading = false,
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-lg border ${className}`}
      style={{ 
        backgroundColor: COLORS.background, 
        borderColor: COLORS.primaryBorder 
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium" style={{ color: COLORS.primary }}>
          {label}
        </p>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${COLOR_CLASSES[valueColor]}`}>
          {value}
        </p>
      )}
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
