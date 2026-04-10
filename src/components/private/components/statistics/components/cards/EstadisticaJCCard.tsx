/**
 * Componente Card para mostrar estadísticas de Justicia Cívica
 * Diseño atómico reutilizable
 */

import React from 'react';
import type { RespuestaJC } from '../../../../../../interfaces/estadisticas-jc';
import type { TipoPeriodo } from '../../hooks/useEstadisticasJC';

interface EstadisticaJCCardProps {
  /** Tipo de período (diaria, mensual, anual) */
  tipo: TipoPeriodo;
  /** Datos de la estadística */
  datos: RespuestaJC | null;
  /** Indica si está cargando */
  loading: boolean;
  /** Mensaje de error */
  error: string | null;
  /** Callback al hacer click en el card */
  onClick?: () => void;
  /** Color primario del card */
  color?: string;
  /** Ícono del card */
  icon?: React.ReactNode;
}

/**
 * Card individual de estadística
 */
export const EstadisticaJCCard: React.FC<EstadisticaJCCardProps> = ({
  tipo,
  datos,
  loading,
  error,
  onClick,
  color = '#1a2744',
  icon
}) => {
  // Calcular total general
  const totalGeneral = datos
    ? datos.data.totalConDetenido + datos.data.totalSinDetenido
    : 0;

  // Calcular porcentajes
  const porcentajeConDetenido = totalGeneral > 0
    ? Math.round((datos!.data.totalConDetenido / totalGeneral) * 100)
    : 0;

  const porcentajeSinDetenido = totalGeneral > 0
    ? Math.round((datos!.data.totalSinDetenido / totalGeneral) * 100)
    : 0;

  // Títulos según tipo
  const titulos: Record<TipoPeriodo, string> = {
    diaria: 'Estadísticas Diarias',
    mensual: 'Estadísticas Mensuales',
    anual: 'Estadísticas Anuales'
  };

  return (
    <div
      className="estadistica-jc-card"
      onClick={onClick}
      style={{
        borderColor: color,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Header del card */}
      <div className="card-header" style={{ backgroundColor: `${color}15` }}>
        {icon && <div className="card-icon" style={{ color }}>{icon}</div>}
        <h3 className="card-title">{titulos[tipo]}</h3>
      </div>

      {/* Contenido del card */}
      <div className="card-content">
        {loading && (
          <div className="card-loading">
            <div className="spinner" style={{ borderTopColor: color }}></div>
            <p>Cargando estadísticas...</p>
          </div>
        )}

        {error && !loading && (
          <div className="card-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {datos && !loading && !error && (
          <>
            {/* Total general */}
            <div className="card-total" style={{ borderLeftColor: color }}>
              <span className="total-label">Total General</span>
              <span className="total-value" style={{ color }}>
                {totalGeneral.toLocaleString()}
              </span>
            </div>

            {/* Desglose */}
            <div className="card-breakdown">
              {/* Con detenido */}
              <div className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">Con Detenido</span>
                  <span className="breakdown-percentage" style={{ color }}>
                    {porcentajeConDetenido}%
                  </span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${porcentajeConDetenido}%`,
                      backgroundColor: color
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">
                  {datos.data.totalConDetenido.toLocaleString()} casos
                </span>
              </div>

              {/* Sin detenido */}
              <div className="breakdown-item">
                <div className="breakdown-header">
                  <span className="breakdown-label">Sin Detenido</span>
                  <span className="breakdown-percentage" style={{ color: '#888' }}>
                    {porcentajeSinDetenido}%
                  </span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{
                      width: `${porcentajeSinDetenido}%`,
                      backgroundColor: '#ccc'
                    }}
                  ></div>
                </div>
                <span className="breakdown-value">
                  {datos.data.totalSinDetenido.toLocaleString()} casos
                </span>
              </div>
            </div>
          </>
        )}

        {!datos && !loading && !error && (
          <div className="card-empty">
            <span className="empty-icon">📊</span>
            <p>No hay datos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticaJCCard;
