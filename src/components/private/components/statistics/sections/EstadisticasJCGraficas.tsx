/**
 * Sección de gráficas para componente EstadisticasJC
 * Muestra gráficas de barras y promedio diario
 *
 * @module EstadisticasJCGraficas
 * @version 1.0.0
 */

import React from 'react';
import type { RespuestaJC } from '../../../../../interfaces/estadisticas-jc';
import GraficaBarrasJC from '../components/charts/GraficaBarrasJC';
import GraficaPromedioJC from '../components/charts/GraficaPromedioJC';
import { JC_COLORS } from '../config/constants';

export interface EstadisticasJCGraficasProps {
  /** Estadísticas diarias */
  diaria: RespuestaJC | null;
  /** Estadísticas mensuales */
  mensual: RespuestaJC | null;
  /** Estadísticas anuales */
  anual: RespuestaJC | null;
  /** Fecha seleccionada */
  fechaSeleccionada: {
    anio: number;
    mes: number;
    dia: number;
  };
}

/**
 * Sección de gráficas del componente de Estadísticas de Justicia Cívica
 *
 * @example
 * ```tsx
 * <EstadisticasJCGraficas
 *   diaria={estadisticas.diaria}
 *   mensual={estadisticas.mensual}
 *   anual={estadisticas.anual}
 *   fechaSeleccionada={fechaSeleccionada}
 * />
 * ```
 */
export const EstadisticasJCGraficas: React.FC<EstadisticasJCGraficasProps> = ({
  diaria,
  mensual,
  anual,
  fechaSeleccionada
}) => {
  // Si no hay datos, no renderizar nada
  if (!diaria && !mensual && !anual) {
    return null;
  }

  return (
    <>
      {/* Gráficas de Barras */}
      {(diaria || mensual || anual) && (
        <div className="estadisticas-jc-graficas">
          <h2 className="graficas-title">📊 Visualización de Datos</h2>

          <div className="graficas-grid">
            {diaria && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="diaria"
                  datos={diaria}
                  color={JC_COLORS.diaria}
                  height={250}
                />
              </div>
            )}

            {mensual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="mensual"
                  datos={mensual}
                  color={JC_COLORS.mensual}
                  height={250}
                />
              </div>
            )}

            {anual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="anual"
                  datos={anual}
                  color={JC_COLORS.anual}
                  height={250}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráfica de Promedio Diario Mensual */}
      {mensual && (
        <div className="estadisticas-jc-graficas">
          <h2 className="graficas-title">📈 Promedio Diario del Mes</h2>
          <GraficaPromedioJC
            datosMensuales={mensual}
            anio={fechaSeleccionada.anio}
            mes={fechaSeleccionada.mes}
            height={350}
          />
        </div>
      )}
    </>
  );
};

export default EstadisticasJCGraficas;
