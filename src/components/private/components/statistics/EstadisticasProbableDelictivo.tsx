/**
 * Componente principal de Estadísticas de Probable Delictivo
 * Muestra estadísticas diarias, mensuales y anuales de IPH
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useEstadisticasProbableDelictivo - Hook personalizado con lógica de negocio
 * @uses EstadisticaJCCard - Componente atómico de card (reutilizado)
 * @uses FiltroFechaJC - Componente atómico de filtros (reutilizado)
 */

import React, { useEffect, useState, useRef } from 'react';
import { useEstadisticasProbableDelictivo } from './hooks/useEstadisticasProbableDelictivo';
import GraficaBarrasJC from './components/GraficaBarrasJC';
import GraficaPromedioJC from './components/GraficaPromedioJC';
import './EstadisticasJC.css';

interface EstadisticasProbableDelictivoProps {
  /** Filtros externos (cuando se renderizan fuera del componente) */
  externalFilters?: {
    anio: number;
    mes: number;
    dia: number;
  };
}

/**
 * Componente de Estadísticas de Probable Delictivo
 */
export const EstadisticasProbableDelictivo: React.FC<EstadisticasProbableDelictivoProps> = ({ externalFilters }) => {
  // Log solo en la primera carga, no en cada render
  useEffect(() => {
    console.log('📊 EstadisticasProbableDelictivo montado', { externalFilters });
  }, [externalFilters]);

  // Hook personalizado con toda la lógica de negocio
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerTodasLasEstadisticas,
    actualizarFecha
  } = useEstadisticasProbableDelictivo();

  // Sincronizar con filtros externos si existen
  useEffect(() => {
    if (externalFilters) {
      console.log('🔄 [EstadisticasProbableDelictivo] Sincronizando con filtros externos:', externalFilters);
      actualizarFecha(externalFilters.anio, externalFilters.mes, externalFilters.dia);
    }
  }, [externalFilters, actualizarFecha]);

  // Estado para controlar si hay errores críticos
  const [hayErrorCritico, setHayErrorCritico] = useState(false);

  // Ref para el contenedor de filtros (sticky)
  const filtrosRef = useRef<HTMLDivElement>(null);

  // Detectar errores críticos
  useEffect(() => {
    const tieneErrores = error.diaria || error.mensual || error.anual;
    setHayErrorCritico(!!tieneErrores);
  }, [error]);

  // Sistema de scroll sticky con compensación dinámica de altura
  // Solo se activa si NO hay filtros externos
  useEffect(() => {
    if (externalFilters) {
      console.log('⏭️ [EstadisticasProbableDelictivo] Scroll sticky deshabilitado (filtros externos)');
      return;
    }

    console.log('🎬 [EstadisticasProbableDelictivo] Inicializando scroll sticky');

    const filtrosElement = filtrosRef.current;
    if (!filtrosElement) return;

    const scrollContainer = filtrosElement.closest('.statistics-modal-body') as HTMLElement | null;
    if (!scrollContainer) return;

    // Estado del scroll
    let isCompact = false;
    let lastScrollTop = 0;
    let isTransitioning = false;
    const COMPACT_THRESHOLD = 80;  // Aumentado para dar más margen
    const EXPAND_THRESHOLD = 20;   // Reducido para expandir antes
    const TRANSITION_COOLDOWN = 300; // Más tiempo para transiciones

    console.log('✅ Sticky configurado: COMPACT=80px, EXPAND=20px');

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);

      // Prevenir cambios durante transiciones activas
      if (isTransitioning) {
        return;
      }

      // 🔥 PREVENIR LOOPS: Detectar saltos causados por cambios de altura del sticky
      // Aumentado a 60px para ser más conservador
      if (scrollDiff > 60) {
        console.log(`⚠️ Salto grande detectado (${scrollDiff.toFixed(0)}px) - ignorando`);
        lastScrollTop = scrollTop;
        return;
      }

      // Ignorar cambios mínimos
      if (scrollDiff < 1) {
        return;
      }

      // Compactar al bajar (solo si estamos scrolleando hacia abajo)
      const scrollingDown = scrollTop > lastScrollTop;
      if (scrollTop >= COMPACT_THRESHOLD && !isCompact && scrollingDown) {
        console.log(`🔽 Compactando en ${scrollTop.toFixed(0)}px`);

        isTransitioning = true;
        isCompact = true;

        // Guardar scroll actual ANTES del cambio
        const scrollBefore = scrollContainer.scrollTop;

        filtrosElement.classList.add('is-compact');

        // Restaurar posición exacta DESPUÉS del cambio para evitar saltos
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollBefore;
          lastScrollTop = scrollBefore;
        });

        setTimeout(() => {
          isTransitioning = false;
        }, TRANSITION_COOLDOWN);
      }
      // Expandir al subir (solo si estamos scrolleando hacia arriba)
      else {
        const scrollingUp = scrollTop < lastScrollTop;
        if (scrollTop < EXPAND_THRESHOLD && isCompact && scrollingUp) {
          console.log(`🔼 Expandiendo en ${scrollTop.toFixed(0)}px`);

          isTransitioning = true;
          isCompact = false;

          filtrosElement.classList.remove('is-compact');

          // Restaurar posición a 0 cuando expandimos cerca del top
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = 0;
            lastScrollTop = 0;
          });

          setTimeout(() => {
            isTransitioning = false;
          }, TRANSITION_COOLDOWN);
        }
      }

      lastScrollTop = scrollTop;
    };

    console.log('🎧 [EstadisticasProbableDelictivo] Agregando event listener de scroll');

    // Agregar listener con passive para mejor performance
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    console.log('✅ [EstadisticasProbableDelictivo] Sistema de scroll inicializado correctamente');

    // Cleanup
    return () => {
      console.log('🧹 [EstadisticasProbableDelictivo] Limpiando sistema de scroll');
      scrollContainer.removeEventListener('scroll', handleScroll);
      filtrosElement.classList.remove('is-compact');
      console.log('✅ [EstadisticasProbableDelictivo] Sistema de scroll limpiado');
    };
  }, []); // Solo ejecutar una vez al montar

  /**
   * Manejar cambio de fecha en los filtros
   */
  const handleFechaChange = async (anio: number, mes: number, dia: number) => {
    console.log('📅 [EstadisticasProbableDelictivo] Cambio de fecha solicitado:', { anio, mes, dia });
    actualizarFecha(anio, mes, dia);
  };

  /**
   * Refrescar todas las estadísticas
   */
  const handleRefresh = async () => {
    console.log('🔄 [EstadisticasProbableDelictivo] Refrescando estadísticas...');
    await obtenerTodasLasEstadisticas();
    console.log('✅ [EstadisticasProbableDelictivo] Estadísticas refrescadas');
  };

  return (
    <div className="estadisticas-jc-container">
      {/* Header */}
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

      {/* Filtros de Fecha - Solo mostrar si NO hay filtros externos */}
      {!externalFilters && (
        <div className="estadisticas-jc-filtros" ref={filtrosRef}>
          {/* Nota: Este filtro se mantiene para compatibilidad, pero será removido gradualmente */}
          <div className="filtro-fecha-placeholder">
            <p>Filtros internos deshabilitados - Use EstadisticasFilters en el modal</p>
          </div>
        </div>
      )}

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
                  color="#8b5a3c"
                  height={250}
                />
              </div>
            )}

            {estadisticas.mensual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="mensual"
                  datos={estadisticas.mensual}
                  color="#d4a574"
                  height={250}
                />
              </div>
            )}

            {estadisticas.anual && (
              <div className="grafica-card">
                <GraficaBarrasJC
                  tipo="anual"
                  datos={estadisticas.anual}
                  color="#c2926a"
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

export default EstadisticasProbableDelictivo;
