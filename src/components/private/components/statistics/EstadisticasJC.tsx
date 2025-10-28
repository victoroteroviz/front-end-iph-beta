/**
 * Componente principal de Estadísticas de Justicia Cívica
 * Muestra estadísticas diarias, mensuales y anuales de IPH
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useEstadisticasJC - Hook personalizado con lógica de negocio
 * @uses useScrollSticky - Hook para scroll sticky
 * @uses Secciones modulares para reducir complejidad
 * @version 2.0.0 - Refactorizado con secciones y hooks
 */

import React, { useEffect } from 'react';
import { useEstadisticasJC } from './hooks/useEstadisticasJC';
import { useScrollSticky } from './hooks/useScrollSticky';
import FiltroFechaJC from './components/filters/FiltroFechaJC';
import { ErrorMessage } from './components/shared/ErrorMessage';
import {
  EstadisticasJCHeader,
  EstadisticasJCGraficas,
  EstadisticasJCResumen,
  EstadisticasJCFooter
} from './sections';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/EstadisticasJC.css';

export interface EstadisticasJCProps {
  /** Filtros externos (cuando se renderizan fuera del componente) */
  externalFilters?: {
    anio: number;
    mes: number;
    dia: number;
  };
}

/**
 * Componente de Estadísticas de Justicia Cívica
 */
export const EstadisticasJC: React.FC<EstadisticasJCProps> = ({ externalFilters }) => {
  // Hook personalizado con toda la lógica de negocio
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerTodasLasEstadisticas,
    actualizarFecha
  } = useEstadisticasJC();

  // Hook para scroll sticky (solo si no hay filtros externos)
  const { filtrosRef } = useScrollSticky({
    compactThreshold: 100,
    expandThreshold: 20,
    enabled: !externalFilters
  });

  // Log solo en mount
  useEffect(() => {
    logDebug('EstadisticasJC', 'Component mounted');
  }, []);

  // Sincronizar con filtros externos si existen
  useEffect(() => {
    if (externalFilters) {
      logDebug('EstadisticasJC', 'Syncing with external filters', externalFilters);
      actualizarFecha(externalFilters.anio, externalFilters.mes, externalFilters.dia);
    }
  }, [externalFilters, actualizarFecha]);

  /**
   * Manejar cambio de fecha en los filtros
   */
  const handleFechaChange = async (anio: number, mes: number, dia: number) => {
    logDebug('EstadisticasJC', 'Date change requested', { anio, mes, dia });
    actualizarFecha(anio, mes, dia);
  };

  /**
   * Refrescar todas las estadísticas
   */
  const handleRefresh = async () => {
    logDebug('EstadisticasJC', 'Refreshing statistics');
    await obtenerTodasLasEstadisticas();
  };

  // Determinar si hay algún error crítico
  const hayErrorCritico = error.diaria || error.mensual || error.anual;
  const isLoading = loading.diaria || loading.mensual || loading.anual;

  return (
    <div className="estadisticas-jc-container">
      {/* Header */}
      <EstadisticasJCHeader
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Mensaje de error crítico */}
      {hayErrorCritico && (
        <ErrorMessage
          error={error.diaria || error.mensual || error.anual}
          onRetry={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {/* Filtros de Fecha - Solo si NO son externos */}
      {!externalFilters && (
        <div className="estadisticas-jc-filtros" ref={filtrosRef}>
          <FiltroFechaJC
            anioInicial={fechaSeleccionada.anio}
            mesInicial={fechaSeleccionada.mes}
            diaInicial={fechaSeleccionada.dia}
            onFechaChange={handleFechaChange}
            loading={isLoading}
          />
        </div>
      )}

      {/* Gráficas */}
      <EstadisticasJCGraficas
        diaria={estadisticas.diaria}
        mensual={estadisticas.mensual}
        anual={estadisticas.anual}
        fechaSeleccionada={fechaSeleccionada}
      />

      {/* Resumen General */}
      <EstadisticasJCResumen
        diaria={estadisticas.diaria}
        mensual={estadisticas.mensual}
        anual={estadisticas.anual}
      />

      {/* Footer */}
      <EstadisticasJCFooter />
    </div>
  );
};

export default EstadisticasJC;
