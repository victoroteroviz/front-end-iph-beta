/**
 * Sección de resumen para componente EstadisticasProbableDelictivo
 * Muestra resumen comparativo de totales
 * Reutiliza la misma lógica que JC
 *
 * @module ProbableDelictivoResumen
 * @version 1.0.0
 */

import React from 'react';
import type { RespuestaJC } from '../../../../../interfaces/estadisticas-jc';
import { calcularTotalCombinado, calcularPromedioDiarioAnual } from '../utils';
import { formatearNumero } from '../utils';

export interface ProbableDelictivoResumenProps {
  /** Estadísticas diarias */
  diaria: RespuestaJC | null;
  /** Estadísticas mensuales */
  mensual: RespuestaJC | null;
  /** Estadísticas anuales */
  anual: RespuestaJC | null;
}

/**
 * Sección de resumen comparativo del componente de Estadísticas de Probable Delictivo
 *
 * @example
 * ```tsx
 * <ProbableDelictivoResumen
 *   diaria={estadisticas.diaria}
 *   mensual={estadisticas.mensual}
 *   anual={estadisticas.anual}
 * />
 * ```
 */
export const ProbableDelictivoResumen: React.FC<ProbableDelictivoResumenProps> = ({
  diaria,
  mensual,
  anual
}) => {
  // Solo renderizar si hay los 3 tipos de datos
  if (!diaria || !mensual || !anual) {
    return null;
  }

  // Calcular totales usando utilidades
  const totalDiario = calcularTotalCombinado(diaria.data);
  const totalMensual = calcularTotalCombinado(mensual.data);
  const totalAnual = calcularTotalCombinado(anual.data);
  const promedioDiarioAnual = calcularPromedioDiarioAnual(totalAnual);

  return (
    <div className="estadisticas-jc-resumen">
      <h2 className="resumen-title">📋 Resumen Comparativo</h2>

      <div className="resumen-grid">
        <div className="resumen-item">
          <span className="resumen-label">Total Diario</span>
          <span className="resumen-valor">
            {formatearNumero(totalDiario)}
          </span>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">Total Mensual</span>
          <span className="resumen-valor">
            {formatearNumero(totalMensual)}
          </span>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">Total Anual</span>
          <span className="resumen-valor">
            {formatearNumero(totalAnual)}
          </span>
        </div>

        <div className="resumen-item">
          <span className="resumen-label">Promedio Diario (Año)</span>
          <span className="resumen-valor">
            {formatearNumero(promedioDiarioAnual)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProbableDelictivoResumen;
