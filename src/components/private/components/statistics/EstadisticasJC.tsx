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

/**
 * Componente de Estadísticas de Justicia Cívica
 */
export const EstadisticasJC: React.FC = () => {
  console.log('🎬 [EstadisticasJC] Componente renderizando');

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

  // Ref para el contenedor de filtros (sticky)
  const filtrosRef = useRef<HTMLDivElement>(null);

  // Log del estado inicial
  console.log('📊 [EstadisticasJC] Estado actual:', {
    hayEstadisticas: {
      diaria: !!estadisticas.diaria,
      mensual: !!estadisticas.mensual,
      anual: !!estadisticas.anual
    },
    loading,
    hayErrorCritico,
    fechaSeleccionada
  });

  // Detectar errores críticos
  useEffect(() => {
    const tieneErrores = error.diaria || error.mensual || error.anual;
    setHayErrorCritico(!!tieneErrores);
    
    if (tieneErrores) {
      console.error('❌ [EstadisticasJC] Errores detectados:', {
        diaria: error.diaria,
        mensual: error.mensual,
        anual: error.anual
      });
    }
  }, [error]);

  // Monitorear estilos computados del filtro para debug
  useEffect(() => {
    const filtrosElement = filtrosRef.current;
    if (!filtrosElement) {
      console.warn('⚠️ [EstadisticasJC] filtrosRef.current es null en el useEffect de estilos');
      return;
    }

    console.log('✅ [EstadisticasJC] filtrosRef asignado correctamente:', filtrosElement);

    // Esperar un poco para que el DOM se renderice completamente
    const timeoutId = setTimeout(() => {
      const computedStyle = window.getComputedStyle(filtrosElement);
      
      console.log('🎨 [EstadisticasJC] Estilos computados del filtro:');
      console.log(`   - position: ${computedStyle.position}`);
      console.log(`   - top: ${computedStyle.top}`);
      console.log(`   - z-index: ${computedStyle.zIndex}`);
      console.log(`   - padding: ${computedStyle.padding}`);
      console.log(`   - display: ${computedStyle.display}`);
      console.log(`   - transition: ${computedStyle.transition}`);
      console.log(`   - contain: ${computedStyle.contain}`);
      
      // Verificar elementos hijos visibles
      const header = filtrosElement.querySelector('.filtro-header');
      const controls = filtrosElement.querySelector('.filtro-controls');
      const fechaSeleccionada = filtrosElement.querySelector('.filtro-fecha-seleccionada');
      
      console.log('🔍 [EstadisticasJC] Elementos hijos del filtro:');
      console.log(`   - .filtro-header: ${header ? 'Encontrado' : 'No encontrado'}`);
      console.log(`   - .filtro-controls: ${controls ? 'Encontrado' : 'No encontrado'}`);
      console.log(`   - .filtro-fecha-seleccionada: ${fechaSeleccionada ? 'Encontrado' : 'No encontrado'}`);
      
      if (header) {
        const headerStyle = window.getComputedStyle(header);
        console.log(`     → .filtro-header display: ${headerStyle.display}, visibility: ${headerStyle.visibility}, height: ${headerStyle.height}`);
      }

      if (controls) {
        const controlsStyle = window.getComputedStyle(controls);
        console.log(`     → .filtro-controls display: ${controlsStyle.display}, gap: ${controlsStyle.gap}`);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Sistema de scroll optimizado para filtros sticky
  useEffect(() => {
    console.log('🔧 [EstadisticasJC] Inicializando sistema de scroll sticky');
    
    const filtrosElement = filtrosRef.current;
    if (!filtrosElement) {
      console.warn('⚠️ [EstadisticasJC] No se encontró filtrosElement (ref)');
      return;
    }

    console.log('✅ [EstadisticasJC] filtrosElement encontrado:', filtrosElement);

    // Buscar el contenedor con scroll (modal o ventana)
    const scrollContainer = filtrosElement.closest('.statistics-modal-body') as HTMLElement | null;
    if (!scrollContainer) {
      console.warn('⚠️ [EstadisticasJC] No se encontró scrollContainer (.statistics-modal-body)');
      console.log('📍 [EstadisticasJC] Contexto: El componente no está dentro de un modal');
      return; // Solo funciona dentro del modal
    }

    console.log('✅ [EstadisticasJC] scrollContainer encontrado:', scrollContainer);

    // Estado del scroll
    let isCompact = false;
    let lastScrollTop = 0;
    let isTransitioning = false; // Flag para prevenir cambios durante transiciones
    const COMPACT_THRESHOLD = 50;  // Compactar después de 50px
    const EXPAND_THRESHOLD = 30;   // Expandir antes de 30px
    const TRANSITION_COOLDOWN = 250; // Esperar 250ms entre cambios de estado

    console.log('📊 [EstadisticasJC] Configuración de thresholds:');
    console.log(`   - COMPACT_THRESHOLD: ${COMPACT_THRESHOLD}px`);
    console.log(`   - EXPAND_THRESHOLD: ${EXPAND_THRESHOLD}px`);
    console.log(`   - TRANSITION_COOLDOWN: ${TRANSITION_COOLDOWN}ms`);

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);
      
      // Log detallado cada 10 scrolls para no saturar la consola
      if (Math.floor(scrollTop / 10) !== Math.floor(lastScrollTop / 10)) {
        console.log(`📜 [Scroll] scrollTop: ${scrollTop.toFixed(1)}px | diff: ${scrollDiff.toFixed(1)}px | isCompact: ${isCompact} | transitioning: ${isTransitioning}`);
      }
      
      // Prevenir cambios durante transiciones activas
      if (isTransitioning) {
        console.log(`⏸️ [Scroll] Transición en progreso, ignorando evento de scroll`);
        return;
      }
      
      // 🔥 PREVENIR LOOPS: Detectar saltos extremos (> 100px) que indican cambio de altura
      if (scrollDiff > 100) {
        console.warn(`⚠️ [Scroll] Salto extremo detectado (${scrollDiff.toFixed(1)}px) - Probablemente causado por cambio de altura del sticky. IGNORANDO.`);
        lastScrollTop = scrollTop; // Actualizar para próxima comparación
        return;
      }
      
      // Ignorar cambios mínimos (< 1px) para evitar loops
      if (scrollDiff < 1) {
        console.log(`⏭️ [Scroll] Cambio ignorado (< 1px): ${scrollDiff.toFixed(2)}px`);
        return;
      }

      // Compactar al bajar (solo si estamos scrolleando hacia abajo)
      const scrollingDown = scrollTop > lastScrollTop;
      if (scrollTop >= COMPACT_THRESHOLD && !isCompact && scrollingDown) {
        console.log(`🔽 [Scroll] COMPACTANDO filtros (scrollTop: ${scrollTop.toFixed(1)}px >= ${COMPACT_THRESHOLD}px, scrollingDown: ${scrollingDown})`);
        
        // Activar flag de transición
        isTransitioning = true;
        isCompact = true;
        filtrosElement.classList.add('is-compact');
        
        // Verificar que la clase se aplicó correctamente
        const hasClass = filtrosElement.classList.contains('is-compact');
        console.log(`   ✓ Clase 'is-compact' aplicada: ${hasClass}`);
        console.log(`   ✓ Classes actuales:`, Array.from(filtrosElement.classList));
        
        // Desactivar flag después del cooldown
        setTimeout(() => {
          isTransitioning = false;
          console.log(`   ✓ Transición completada, eventos de scroll permitidos nuevamente`);
        }, TRANSITION_COOLDOWN);
      }
      // Expandir al subir (solo si estamos scrolleando hacia arriba)
      else {
        const scrollingUp = scrollTop < lastScrollTop;
        if (scrollTop < EXPAND_THRESHOLD && isCompact && scrollingUp) {
          console.log(`🔼 [Scroll] EXPANDIENDO filtros (scrollTop: ${scrollTop.toFixed(1)}px < ${EXPAND_THRESHOLD}px, scrollingUp: ${scrollingUp})`);
          
          // Activar flag de transición
          isTransitioning = true;
          isCompact = false;
          filtrosElement.classList.remove('is-compact');
          
          // Verificar que la clase se removió correctamente
          const hasClass = filtrosElement.classList.contains('is-compact');
          console.log(`   ✓ Clase 'is-compact' removida: ${!hasClass}`);
          console.log(`   ✓ Classes actuales:`, Array.from(filtrosElement.classList));
          
          // Desactivar flag después del cooldown
          setTimeout(() => {
            isTransitioning = false;
            console.log(`   ✓ Transición completada, eventos de scroll permitidos nuevamente`);
          }, TRANSITION_COOLDOWN);
        }
      }

      lastScrollTop = scrollTop;
    };

    console.log('🎧 [EstadisticasJC] Agregando event listener de scroll');
    
    // Agregar listener con passive para mejor performance
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    console.log('✅ [EstadisticasJC] Sistema de scroll inicializado correctamente');

    // Cleanup
    return () => {
      console.log('🧹 [EstadisticasJC] Limpiando sistema de scroll');
      scrollContainer.removeEventListener('scroll', handleScroll);
      filtrosElement.classList.remove('is-compact');
      console.log('✅ [EstadisticasJC] Sistema de scroll limpiado');
    };
  }, []); // Solo ejecutar una vez al montar

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

      {/* Filtros de Fecha */}
      <div className="estadisticas-jc-filtros" ref={filtrosRef}>
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
