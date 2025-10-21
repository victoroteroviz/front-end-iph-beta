/**
 * Hook personalizado para manejar scroll sticky con transiciones compactas
 * Centraliza la lógica compleja de scroll que estaba duplicada en componentes
 *
 * @module useScrollSticky
 * @version 1.0.0
 * @pattern Custom Hook - Separación de lógica UI compleja
 */

import { useEffect, useRef, useState } from 'react';
import { logDebug, logWarning } from '../../../../../helper/log/logger.helper';

/**
 * Configuración del hook useScrollSticky
 */
export interface UseScrollStickyConfig {
  /** Umbral de scroll en px para compactar (default: 100) */
  compactThreshold?: number;
  /** Umbral de scroll en px para expandir (default: 20) */
  expandThreshold?: number;
  /** Tiempo de cooldown entre transiciones en ms (default: 300) */
  transitionCooldown?: number;
  /** Habilitar/deshabilitar el sistema sticky (default: true) */
  enabled?: boolean;
  /** Selector del contenedor de scroll (default: '.statistics-modal-body') */
  scrollContainerSelector?: string;
  /** Habilitar logging de debug (default: false) */
  enableDebugLogs?: boolean;
}

/**
 * Valor de retorno del hook
 */
export interface UseScrollStickyReturn {
  /** Ref para el elemento que será sticky */
  filtrosRef: React.RefObject<HTMLDivElement | null>;
  /** Estado actual del modo compacto */
  isCompact: boolean;
}

/**
 * Hook para manejar scroll sticky con transiciones
 *
 * @param config - Configuración del hook
 * @returns Ref y estado del componente sticky
 *
 * @example
 * ```typescript
 * const { filtrosRef, isCompact } = useScrollSticky({
 *   compactThreshold: 100,
 *   expandThreshold: 20,
 *   enabled: !hasExternalFilters
 * });
 *
 * // En el JSX
 * // <div ref={filtrosRef} className="filtros">
 * //   Contenido
 * // </div>
 * ```
 */
export const useScrollSticky = (config: UseScrollStickyConfig = {}): UseScrollStickyReturn => {
  // Configuración con valores por defecto
  const {
    compactThreshold = 100,
    expandThreshold = 20,
    transitionCooldown = 300,
    enabled = true,
    scrollContainerSelector = '.statistics-modal-body',
    enableDebugLogs = false
  } = config;

  // Ref para el elemento sticky
  const filtrosRef = useRef<HTMLDivElement>(null);

  // Estado público del modo compacto
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    // Si está deshabilitado, no hacer nada
    if (!enabled) {
      if (enableDebugLogs) {
        logDebug('useScrollSticky', 'Sistema deshabilitado (enabled=false)');
      }
      return;
    }

    const filtrosElement = filtrosRef.current;
    if (!filtrosElement) {
      logWarning('useScrollSticky', 'filtrosRef.current es null', { enabled });
      return;
    }

    const scrollContainer = filtrosElement.closest(scrollContainerSelector) as HTMLElement | null;
    if (!scrollContainer) {
      logWarning('useScrollSticky', `No se encontro contenedor: ${scrollContainerSelector}`);
      return;
    }

    if (enableDebugLogs) {
      logDebug('useScrollSticky', 'Sistema inicializado', {
        compactThreshold,
        expandThreshold,
        transitionCooldown,
        scrollContainerSelector,
        filtrosHeight: filtrosElement.offsetHeight,
        containerScrollHeight: scrollContainer.scrollHeight
      });
    }

    // Estado interno del scroll
    let isCurrentlyCompact = false;
    let lastScrollTop = 0;
    let isTransitioning = false;

    /**
     * Handler de scroll con lógica optimizada
     */
    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);

      // Prevenir cambios durante transiciones activas
      if (isTransitioning) {
        return;
      }

      // PREVENIR LOOPS: Detectar saltos causados por cambios de altura
      if (scrollDiff > 60) {
        if (enableDebugLogs) {
          logDebug('useScrollSticky', `Salto grande detectado (${scrollDiff.toFixed(0)}px) - ignorando`);
        }
        lastScrollTop = scrollTop;
        return;
      }

      // Ignorar cambios mínimos
      if (scrollDiff < 1) {
        return;
      }

      // Determinar dirección del scroll
      const scrollingDown = scrollTop > lastScrollTop;
      const scrollingUp = scrollTop < lastScrollTop;

      // Compactar al bajar (solo si estamos scrolleando hacia abajo)
      if (scrollTop >= compactThreshold && !isCurrentlyCompact && scrollingDown) {
        if (enableDebugLogs) {
          logDebug('useScrollSticky', `Compactando en ${scrollTop.toFixed(0)}px`, {
            threshold: compactThreshold
          });
        }

        isTransitioning = true;
        isCurrentlyCompact = true;

        // Guardar scroll actual ANTES del cambio
        const scrollBefore = scrollContainer.scrollTop;

        filtrosElement.classList.add('is-compact');
        setIsCompact(true);

        // Restaurar posición exacta DESPUÉS del cambio para evitar saltos
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollBefore;
          lastScrollTop = scrollBefore;
        });

        setTimeout(() => {
          isTransitioning = false;
        }, transitionCooldown);
      }
      // Expandir al subir (solo si estamos scrolleando hacia arriba)
      else if (scrollTop < expandThreshold && isCurrentlyCompact && scrollingUp) {
        if (enableDebugLogs) {
          logDebug('useScrollSticky', `Expandiendo en ${scrollTop.toFixed(0)}px`, {
            threshold: expandThreshold
          });
        }

        isTransitioning = true;
        isCurrentlyCompact = false;

        filtrosElement.classList.remove('is-compact');
        setIsCompact(false);

        // Restaurar posición a 0 cuando expandimos cerca del top
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = 0;
          lastScrollTop = 0;
        });

        setTimeout(() => {
          isTransitioning = false;
        }, transitionCooldown);
      }

      lastScrollTop = scrollTop;
    };

    // Agregar listener con passive para mejor performance
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    if (enableDebugLogs) {
      logDebug('useScrollSticky', 'Event listener agregado correctamente');
    }

    // Cleanup
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      filtrosElement.classList.remove('is-compact');
      setIsCompact(false);

      if (enableDebugLogs) {
        logDebug('useScrollSticky', 'Sistema de scroll limpiado');
      }
    };
  }, [
    compactThreshold,
    expandThreshold,
    transitionCooldown,
    enabled,
    scrollContainerSelector,
    enableDebugLogs
  ]);

  return {
    filtrosRef,
    isCompact
  };
};

/**
 * Configuraciones predefinidas para casos de uso comunes
 */
export const SCROLL_STICKY_PRESETS = {
  /** Configuración por defecto (balanceada) */
  default: {
    compactThreshold: 100,
    expandThreshold: 20,
    transitionCooldown: 300
  },
  /** Configuración agresiva (compacta/expande rápidamente) */
  aggressive: {
    compactThreshold: 50,
    expandThreshold: 10,
    transitionCooldown: 200
  },
  /** Configuración conservadora (menos cambios de estado) */
  conservative: {
    compactThreshold: 150,
    expandThreshold: 30,
    transitionCooldown: 400
  },
  /** Configuración con debug habilitado */
  debug: {
    compactThreshold: 100,
    expandThreshold: 20,
    transitionCooldown: 300,
    enableDebugLogs: true
  }
} as const;
