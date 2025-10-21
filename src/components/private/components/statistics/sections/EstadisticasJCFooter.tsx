/**
 * Sección de footer para componente EstadisticasJC
 * Muestra información de ayuda y última actualización
 *
 * @module EstadisticasJCFooter
 * @version 1.0.0
 */

import React from 'react';
import { formatearFecha } from '../utils';

export interface EstadisticasJCFooterProps {
  /** Fecha de última actualización (opcional, default: ahora) */
  lastUpdate?: Date;
}

/**
 * Footer del componente de Estadísticas de Justicia Cívica
 *
 * @example
 * ```tsx
 * <EstadisticasJCFooter lastUpdate={new Date()} />
 * ```
 */
export const EstadisticasJCFooter: React.FC<EstadisticasJCFooterProps> = ({
  lastUpdate
}) => {
  const updateTime = lastUpdate || new Date();

  return (
    <div className="estadisticas-jc-footer">
      <p className="footer-info">
        ℹ️ Las estadísticas se actualizan automáticamente al cambiar la fecha seleccionada
      </p>
      <p className="footer-timestamp">
        Última actualización: {formatearFecha(updateTime)}
      </p>
    </div>
  );
};

export default EstadisticasJCFooter;
