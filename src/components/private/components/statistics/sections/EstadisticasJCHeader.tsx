/**
 * Sección de header para componente EstadisticasJC
 * Incluye título, subtítulo y botón de refresh
 *
 * @module EstadisticasJCHeader
 * @version 1.0.0
 */

import React from 'react';
import { RefreshButton } from '../components/shared/RefreshButton';

export interface EstadisticasJCHeaderProps {
  /** Handler para refrescar estadísticas */
  onRefresh: () => void;
  /** Estado de carga */
  isLoading: boolean;
}

/**
 * Header del componente de Estadísticas de Justicia Cívica
 *
 * @example
 * ```tsx
 * <EstadisticasJCHeader
 *   onRefresh={handleRefresh}
 *   isLoading={loading.diaria || loading.mensual || loading.anual}
 * />
 * ```
 */
export const EstadisticasJCHeader: React.FC<EstadisticasJCHeaderProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div className="estadisticas-jc-header">
      <div className="header-content">
        <h1 className="header-title">
          <span className="header-icon">⚖️</span>
          Estadísticas de Justicia Cívica
        </h1>
        <p className="header-subtitle">
          Análisis de IPH por período: diario, mensual y anual
        </p>
      </div>

      <RefreshButton
        onClick={onRefresh}
        disabled={isLoading}
      />
    </div>
  );
};

export default EstadisticasJCHeader;
