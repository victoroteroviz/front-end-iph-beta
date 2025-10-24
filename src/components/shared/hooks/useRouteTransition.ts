/**
 * useRouteTransition Hook v1.0.0
 *
 * Hook para manejar transiciones de ruta con feedback visual inmediato
 *
 * Características:
 * - ✅ Estado de loading inmediato al cambiar de ruta
 * - ✅ Integración con TopLoadingBar
 * - ✅ Previene congelamiento de UI
 * - ✅ Transiciones suaves con startTransition
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { TopLoadingBarRef } from '../components/loading';

/**
 * Hook para manejar transiciones de ruta con loading visual
 *
 * @param loadingBarRef - Referencia al TopLoadingBar
 * @returns Estado y funciones de transición
 *
 * @example
 * ```typescript
 * const loadingBarRef = useRef<TopLoadingBarRef>(null);
 * const { isTransitioning, startTransition } = useRouteTransition(loadingBarRef);
 *
 * // En el sidebar al hacer clic
 * const handleNavigate = () => {
 *   startTransition();
 *   navigate('/ruta');
 * };
 * ```
 */
export const useRouteTransition = (loadingBarRef?: React.RefObject<TopLoadingBarRef>) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPath = useRef(location.pathname);
  const transitionTimer = useRef<NodeJS.Timeout>();

  /**
   * Inicia la transición de ruta
   */
  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    loadingBarRef?.current?.start();

    // Timeout de seguridad (si la ruta no cambia en 5s, desactivar loading)
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }

    transitionTimer.current = setTimeout(() => {
      setIsTransitioning(false);
      loadingBarRef?.current?.complete();
    }, 5000);
  }, [loadingBarRef]);

  /**
   * Completa la transición de ruta
   */
  const completeTransition = useCallback(() => {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }

    // Delay mínimo para que el usuario vea el feedback
    setTimeout(() => {
      setIsTransitioning(false);
      loadingBarRef?.current?.complete();
    }, 300);
  }, [loadingBarRef]);

  // Detectar cambios de ruta
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      // Ruta cambió - completar transición
      completeTransition();
      previousPath.current = location.pathname;
    }
  }, [location.pathname, completeTransition]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  return {
    isTransitioning,
    startTransition,
    completeTransition
  };
};

export default useRouteTransition;
