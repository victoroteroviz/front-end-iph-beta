/**
 * Componente StatCard
 * Tarjeta individual de estadística con interactividad y estados
 *
 * @pattern Atomic Component
 * @version 1.0.0
 * @category Card Components
 */

import React, { memo, useCallback } from 'react';
import type { IStatisticCard } from '../../../../../../interfaces/IStatistic';

type StatCardProps = {
  /** Datos de la tarjeta de estadística */
  stat: IStatisticCard;
  /** Callback ejecutado al hacer click en la tarjeta */
  onClick: (stat: IStatisticCard) => void;
};

/**
 * Tarjeta de estadística con diseño interactivo
 * @performance Memoizado - solo re-renderiza si cambia la stat o el handler
 */
const StatCard: React.FC<StatCardProps> = memo(({ stat, onClick }) => {
  /**
   * Maneja el click en la tarjeta
   * Solo permite click si la tarjeta está habilitada
   */
  const handleClick = useCallback(() => {
    if (stat.habilitado) {
      onClick(stat);
    }
  }, [stat, onClick]);

  /**
   * Maneja eventos de teclado para accesibilidad
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && stat.habilitado) {
      e.preventDefault();
      onClick(stat);
    }
  }, [stat, onClick]);

  return (
    <div
      className={`stat-card ${!stat.habilitado ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={stat.habilitado ? 0 : -1}
      aria-label={`${stat.titulo}: ${stat.descripcion}`}
      aria-disabled={!stat.habilitado}
      style={{ borderColor: stat.habilitado ? stat.color : undefined }}
    >
      {/* Icono de la tarjeta */}
      <div
        className="stat-card-icon"
        style={{ backgroundColor: stat.habilitado ? stat.color : undefined }}
      >
        {stat.icono}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="stat-card-content">
        <h3>{stat.titulo}</h3>
        <p>{stat.descripcion}</p>
      </div>

      {/* Badge "Próximamente" para tarjetas deshabilitadas */}
      {!stat.habilitado && (
        <div className="stat-card-badge">
          Próximamente
        </div>
      )}
    </div>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
