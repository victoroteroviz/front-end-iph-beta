/**
 * Componente principal de Estadísticas de Justicia Cívica
 * Muestra estadísticas diarias, mensuales y anuales de IPH
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useEstadisticasJC - Hook personalizado con lógica de negocio
 * @uses EstadisticaJCCard - Componente atómico de card
 * @uses FiltroFechaJC - Componente atómico de filtros
 */

import React, { useEffect, useState, useRef } from 'react';
import { useEstadisticasJC } from './hooks/useEstadisticasJC';
import FiltroFechaJC from './components/FiltroFechaJC';
import GraficaBarrasJC from './components/GraficaBarrasJC';
import GraficaPromedioJC from './components/GraficaPromedioJC';
import './EstadisticasJC.css';

interface EstadisticasJCProps {
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
  // Log solo en la primera carga, no en cada render
  useEffect(() => {
    console.log('📊 EstadisticasJC montado');
  }, []);

  // Hook personalizado con toda la lógica de negocio
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerTodasLasEstadisticas,
    actualizarFecha
  } = useEstadisticasJC();

  // Sincronizar con filtros externos si existen
  useEffect(() => {
    if (externalFilters) {
      console.log('🔄 [EstadisticasJC] Sincronizando con filtros externos:', externalFilters);
      actualizarFecha(externalFilters.anio, externalFilters.mes, externalFilters.dia);
    }
  }, [externalFilters, actualizarFecha]);

  // Estado para controlar si hay errores críticos
  const [hayErrorCritico, setHayErrorCritico] = useState(false);

  // Ref para el contenedor de filtros (solo si son internos)
  const filtrosRef = useRef<HTMLDivElement>(null);

  // Determinar si los filtros están externos (renderizados fuera del componente)
  const hasExternalFilters = !!externalFilters;

  // Detectar errores críticos
  useEffect(() => {
    const tieneErrores = error.diaria || error.mensual || error.anual;
    setHayErrorCritico(!!tieneErrores);
  }, [error]);

  // Sistema de scroll sticky - SOLO si los filtros son INTERNOS
  useEffect(() => {
    // Si los filtros son externos, no necesitamos sticky
    if (hasExternalFilters) {
      console.log('⏩ [SCROLL] Filtros externos detectados, sistema sticky deshabilitado');
      return;
    }

    const filtrosElement = filtrosRef.current;
    if (!filtrosElement) {
      console.warn('🔴 [SCROLL] filtrosRef.current es null');
      return;
    }

    const scrollContainer = filtrosElement.closest('.statistics-modal-body') as HTMLElement | null;
    if (!scrollContainer) {
      console.warn('🔴 [SCROLL] No se encontró .statistics-modal-body');
      return;
    }

    console.log('✅ [SCROLL] Sistema inicializado', {
      filtrosElement,
      scrollContainer,
      filtrosHeight: filtrosElement.offsetHeight,
      containerScrollHeight: scrollContainer.scrollHeight,
      containerClientHeight: scrollContainer.clientHeight
    });

    let lastScrollTop = 0;
    let lastState = '';
    let scrollCallCount = 0;
    let lastLogTime = Date.now();

    const handleScroll = () => {
      scrollCallCount++;
      const scrollTop = scrollContainer.scrollTop;
      const currentTime = Date.now();
      const timeSinceLastLog = currentTime - lastLogTime;
      
      // Medir dimensiones ANTES del cambio
      const heightBefore = filtrosElement.offsetHeight;
      const wasCompact = filtrosElement.classList.contains('is-compact');
      
      // Determinar nuevo estado
      const shouldBeCompact = scrollTop > 100;
      const newState = shouldBeCompact ? 'compact' : 'normal';
      
      // Solo hacer cambios si el estado cambió
      if (wasCompact !== shouldBeCompact) {
        if (shouldBeCompact) {
          filtrosElement.classList.add('is-compact');
        } else {
          filtrosElement.classList.remove('is-compact');
        }

        // Medir dimensiones DESPUÉS del cambio
        const heightAfter = filtrosElement.offsetHeight;
        const heightDiff = heightAfter - heightBefore;

        // LOG DETALLADO del cambio de estado
        console.log(`🔄 [SCROLL CAMBIO] ${wasCompact ? 'compact→normal' : 'normal→compact'}`, {
          scrollCallCount,
          timeSinceLastLog: `${timeSinceLastLog}ms`,
          scrollTop: scrollTop.toFixed(2),
          scrollDelta: (scrollTop - lastScrollTop).toFixed(2),
          heightBefore: `${heightBefore}px`,
          heightAfter: `${heightAfter}px`,
          heightDiff: `${heightDiff}px`,
          wasCompact,
          nowCompact: filtrosElement.classList.contains('is-compact'),
          containerScrollTop: scrollContainer.scrollTop.toFixed(2)
        });

        // ALERTA si hay cambio de altura (causa del loop)
        if (Math.abs(heightDiff) > 1) {
          console.warn('⚠️ [SCROLL LOOP WARNING] Cambio de altura detectado!', {
            heightDiff: `${heightDiff}px`,
            mensaje: 'Esto puede causar loop infinito si cambia scrollTop',
            scrollTopAntes: scrollTop.toFixed(2),
            scrollTopDespues: scrollContainer.scrollTop.toFixed(2)
          });
        }

        lastLogTime = currentTime;
      }
      
      // Detectar loops rápidos (múltiples llamadas en poco tiempo)
      if (timeSinceLastLog < 100 && lastState !== newState && lastState !== '') {
        console.error('🔴 [SCROLL LOOP] Posible loop infinito detectado!', {
          timeSinceLastLog: `${timeSinceLastLog}ms`,
          scrollCallCount,
          lastState,
          newState,
          scrollTop: scrollTop.toFixed(2),
          height: filtrosElement.offsetHeight
        });
      }

      lastScrollTop = scrollTop;
      lastState = newState;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    // Log periódico del estado
    const statusInterval = setInterval(() => {
      console.log('📊 [SCROLL STATUS]', {
        scrollCallCount,
        currentScrollTop: scrollContainer.scrollTop.toFixed(2),
        isCompact: filtrosElement.classList.contains('is-compact'),
        filtrosHeight: filtrosElement.offsetHeight,
        containerScrollHeight: scrollContainer.scrollHeight
      });
    }, 5000);

    return () => {
      console.log('🔚 [SCROLL] Limpiando listeners', { scrollCallCount });
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearInterval(statusInterval);
      filtrosElement.classList.remove('is-compact');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Manejar cambio de fecha en los filtros
   */
  const handleFechaChange = async (anio: number, mes: number, dia: number) => {
    console.log('📅 [EstadisticasJC] Cambio de fecha solicitado:', { anio, mes, dia });
    actualizarFecha(anio, mes, dia);
  };

  /**
   * Refrescar todas las estadísticas
   */
  const handleRefresh = async () => {
    console.log('🔄 [EstadisticasJC] Refrescando estadísticas...');
    await obtenerTodasLasEstadisticas();
    console.log('✅ [EstadisticasJC] Estadísticas refrescadas');
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

      {/* Filtros de Fecha - SOLO si NO son externos */}
      {!hasExternalFilters && (
        <div className="estadisticas-jc-filtros" ref={filtrosRef}>
          <FiltroFechaJC
            anioInicial={fechaSeleccionada.anio}
            mesInicial={fechaSeleccionada.mes}
            diaInicial={fechaSeleccionada.dia}
            onFechaChange={handleFechaChange}
            loading={loading.diaria || loading.mensual || loading.anual}
          />
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
