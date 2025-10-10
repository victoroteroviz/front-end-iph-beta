/**
 * Componente principal de Estadísticas de Justicia Cívica
 * Muestra estadísticas diarias, mensuales y anuales de IPH
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useEstadisticasJC - Hook personalizado con lógica de negocio
 * @uses EstadisticaJCCard - Componente atómico de card
 * @uses FiltroFechaJC - Componente atómico de filtros
 */

import React, { useEffect, useState } from 'react';
import { useEstadisticasJC } from './hooks/useEstadisticasJC';
import FiltroFechaJC from './components/FiltroFechaJC';
import GraficaBarrasJC from './components/GraficaBarrasJC';
import GraficaPromedioJC from './components/GraficaPromedioJC';
import './EstadisticasJC.css';

/**
 * Componente de Estadísticas de Justicia Cívica
 */
export const EstadisticasJC: React.FC = () => {
  // Hook personalizado con toda la lógica de negocio
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerTodasLasEstadisticas,
    actualizarFecha
  } = useEstadisticasJC();

  // Estado para controlar si hay errores críticos
  const [hayErrorCritico, setHayErrorCritico] = useState(false);

  // Detectar errores críticos
  useEffect(() => {
    const tieneErrores = error.diaria || error.mensual || error.anual;
    setHayErrorCritico(!!tieneErrores);
  }, [error]);

  // NOTA: El modo compacto ahora se maneja 100% con CSS
  // No hay lógica de JavaScript para evitar bucles de scroll

  /**
   * Manejar cambio de fecha en los filtros
   */
  const handleFechaChange = async (anio: number, mes: number, dia: number) => {
    actualizarFecha(anio, mes, dia);
  };

  /**
   * Refrescar todas las estadísticas
   */
  const handleRefresh = async () => {
    await obtenerTodasLasEstadisticas();
  };

  return (
    <div className="estadisticas-jc-container">
      {/* Header */}
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

        <button
          className="btn-refresh"
          onClick={handleRefresh}
          disabled={loading.diaria || loading.mensual || loading.anual}
          title="Actualizar estadísticas"
          aria-label="Actualizar estadísticas"
        >
          <span className="refresh-icon">🔄</span>
          Actualizar
        </button>
      </div>

      {/* Mensaje de error crítico */}
      {hayErrorCritico && (
        <div className="estadisticas-jc-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>Error al cargar estadísticas</strong>
              <p>
                {error.diaria || error.mensual || error.anual}
              </p>
            </div>
          </div>
          <button
            className="error-retry-btn"
            onClick={handleRefresh}
            disabled={loading.diaria || loading.mensual || loading.anual}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros de Fecha */}
      <div className="estadisticas-jc-filtros">
        <FiltroFechaJC
          anioInicial={fechaSeleccionada.anio}
          mesInicial={fechaSeleccionada.mes}
          diaInicial={fechaSeleccionada.dia}
          onFechaChange={handleFechaChange}
          loading={loading.diaria || loading.mensual || loading.anual}
        />
      </div>

      {/* Gráficas de Barras */}
      {(estadisticas.diaria || estadisticas.mensual || estadisticas.anual) && (
        <div className="estadisticas-jc-graficas">
          <h2 className="graficas-title">📊 Visualización de Datos</h2>

          <div className="graficas-grid">
            {estadisticas.diaria && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="diaria"
                  datos={estadisticas.diaria}
                  color="#4d4725"
                  height={250}
                />
              </div>
            )}

            {estadisticas.mensual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="mensual"
                  datos={estadisticas.mensual}
                  color="#b8ab84"
                  height={250}
                />
              </div>
            )}

            {estadisticas.anual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="anual"
                  datos={estadisticas.anual}
                  color="#c2b186"
                  height={250}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráfica de Promedio Diario Mensual */}
      {estadisticas.mensual && (
        <div className="estadisticas-jc-graficas">
          <h2 className="graficas-title">📈 Promedio Diario del Mes</h2>
          <GraficaPromedioJC
            datosMensuales={estadisticas.mensual}
            anio={fechaSeleccionada.anio}
            mes={fechaSeleccionada.mes}
            height={350}
          />
        </div>
      )}

      {/* Resumen General */}
      {estadisticas.diaria && estadisticas.mensual && estadisticas.anual && (
        <div className="estadisticas-jc-resumen">
          <h2 className="resumen-title">📋 Resumen Comparativo</h2>

          <div className="resumen-grid">
            <div className="resumen-item">
              <span className="resumen-label">Total Diario</span>
              <span className="resumen-valor">
                {(estadisticas.diaria.data.totalConDetenido +
                  estadisticas.diaria.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="resumen-item">
              <span className="resumen-label">Total Mensual</span>
              <span className="resumen-valor">
                {(estadisticas.mensual.data.totalConDetenido +
                  estadisticas.mensual.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="resumen-item">
              <span className="resumen-label">Total Anual</span>
              <span className="resumen-valor">
                {(estadisticas.anual.data.totalConDetenido +
                  estadisticas.anual.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="resumen-item">
              <span className="resumen-label">Promedio Diario (Año)</span>
              <span className="resumen-valor">
                {Math.round(
                  (estadisticas.anual.data.totalConDetenido +
                    estadisticas.anual.data.totalSinDetenido) / 365
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer con información */}
      <div className="estadisticas-jc-footer">
        <p className="footer-info">
          ℹ️ Las estadísticas se actualizan automáticamente al cambiar la fecha seleccionada
        </p>
        <p className="footer-timestamp">
          Última actualización: {new Date().toLocaleString('es-MX')}
        </p>
      </div>
    </div>
  );
};

export default EstadisticasJC;
