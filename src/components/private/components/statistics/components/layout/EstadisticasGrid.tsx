/**
 * Componente EstadisticasGrid
 * Grid responsivo que contiene las tarjetas de estadísticas
 *
 * @pattern Atomic Component
 * @version 1.0.0
 * @category Layout Components
 */

import React, { memo } from 'react';
import type { IStatisticCard } from '../../../../../../interfaces/IStatistic';
import StatCard from '../cards/StatCard';

type EstadisticasGridProps = {
  /** Array de estadísticas a mostrar */
  statistics: IStatisticCard[];
  /** Callback ejecutado al hacer click en una tarjeta */
  onCardClick: (stat: IStatisticCard) => void;
};

/**
 * Grid de tarjetas de estadísticas con diseño responsivo
 * @performance Memoizado - solo re-renderiza si cambia el array de statistics o el handler
 */
const EstadisticasGrid: React.FC<EstadisticasGridProps> = memo(({
  statistics,
  onCardClick
}) => {
  return (
    <div className="estadisticas-content">
      <div className="estadisticas-grid">
        {statistics.map((stat) => (
          <StatCard
            key={stat.id}
            stat={stat}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
});

EstadisticasGrid.displayName = 'EstadisticasGrid';

export default EstadisticasGrid;
