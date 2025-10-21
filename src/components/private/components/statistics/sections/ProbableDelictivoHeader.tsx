/**
 * Sección de header para componente EstadisticasProbableDelictivo
 * Incluye título, subtítulo y botón de refresh
 *
 * @module ProbableDelictivoHeader
 * @version 1.0.0
 */

import React from 'react';
import { RefreshButton } from '../components/shared/RefreshButton';

export interface ProbableDelictivoHeaderProps {
  /** Handler para refrescar estadísticas */
  onRefresh: () => void;
  /** Estado de carga */
  isLoading: boolean;
}

/**
 * Header del componente de Estadísticas de Probable Delictivo
 *
 * @example
 * ```tsx
 * <ProbableDelictivoHeader
 *   onRefresh={handleRefresh}
 *   isLoading={loading.diaria || loading.mensual || loading.anual}
 * />
 * ```
 */
export const ProbableDelictivoHeader: React.FC<ProbableDelictivoHeaderProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div className="estadisticas-jc-header">
      <div className="header-content">
        <h1 className="header-title">
          <span className="header-icon">🔍</span>
          Estadísticas de Probable Delictivo
        </h1>
        <p className="header-subtitle">
          Análisis de IPH probablemente delictivos por período: diario, mensual y anual
        </p>
      </div>

      <RefreshButton
        onClick={onRefresh}
        disabled={isLoading}
      />
    </div>
  );
};

export default ProbableDelictivoHeader;
