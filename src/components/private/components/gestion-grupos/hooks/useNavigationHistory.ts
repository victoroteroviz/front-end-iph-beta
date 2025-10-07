/**
 * @fileoverview Hook para manejo de navegación e historial del navegador
 * @version 1.0.0
 * @description Hook personalizado para navegación con flecha anterior del navegador y scroll
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Tipos para el manejo de navegación
 */
interface NavigationState {
  view: 'lista' | 'formulario' | 'usuarios';
  grupoId?: string | null;
  formData?: any;
}

interface UseNavigationHistoryOptions {
  onNavigateBack?: () => void;
  enableBrowserNavigation?: boolean;
  scrollToTopOnNavigation?: boolean;
}

interface UseNavigationHistoryReturn {
  pushNavigation: (state: NavigationState, title?: string) => void;
  goBack: () => void;
  scrollToTop: (smooth?: boolean) => void;
  canGoBack: boolean;
}

/**
 * Hook para manejo de navegación e historial
 */
export const useNavigationHistory = (
  options: UseNavigationHistoryOptions = {}
): UseNavigationHistoryReturn => {
  const {
    onNavigateBack,
    enableBrowserNavigation = true,
    scrollToTopOnNavigation = true
  } = options;

  const initialLoad = useRef(true);
  const navigationStack = useRef<NavigationState[]>([]);

  /**
   * Función para scroll al inicio del componente
   */
  const scrollToTop = useCallback((smooth: boolean = true) => {
    if (scrollToTopOnNavigation) {
      // Buscar el contenedor principal del componente (donde están los breadcrumbs)
      const mainContainer = document.querySelector('[data-component="gestion-grupos"]');

      if (mainContainer) {
        mainContainer.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'start'
        });
      } else {
        // Fallback: scroll al inicio de la página
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  }, [scrollToTopOnNavigation]);

  /**
   * Agregar estado al historial de navegación
   */
  const pushNavigation = useCallback((state: NavigationState, title?: string) => {
    if (enableBrowserNavigation) {
      // Agregar al stack interno
      navigationStack.current.push(state);

      // Crear un estado único para el historial del navegador
      const historyState = {
        ...state,
        timestamp: Date.now(),
        component: 'gestion-grupos'
      };

      // Usar pushState para agregar al historial del navegador
      window.history.pushState(
        historyState,
        title || `Gestión de Grupos - ${state.view}`,
        window.location.pathname + window.location.search
      );

      // Scroll al inicio después de la navegación
      if (scrollToTopOnNavigation) {
        setTimeout(() => scrollToTop(), 100);
      }
    }
  }, [enableBrowserNavigation, scrollToTop, scrollToTopOnNavigation]);

  /**
   * Navegar hacia atrás
   */
  const goBack = useCallback(() => {
    if (enableBrowserNavigation && navigationStack.current.length > 1) {
      // Remover el estado actual del stack
      navigationStack.current.pop();

      // Usar el historial del navegador
      window.history.back();
    } else if (onNavigateBack) {
      // Fallback: usar callback personalizado
      onNavigateBack();
    }
  }, [enableBrowserNavigation, onNavigateBack]);

  /**
   * Manejar el evento popstate (flecha anterior del navegador)
   */
  const handlePopState = useCallback((event: PopStateEvent) => {
    if (event.state?.component === 'gestion-grupos') {
      const navigationState = event.state as NavigationState & {
        timestamp: number;
        component: string;
      };

      // Remover del stack hasta llegar al estado correcto
      const currentStack = navigationStack.current;
      const targetIndex = currentStack.findIndex(state =>
        state.view === navigationState.view &&
        state.grupoId === navigationState.grupoId
      );

      if (targetIndex >= 0) {
        navigationStack.current = currentStack.slice(0, targetIndex + 1);
      }

      // Ejecutar callback de navegación personalizado
      if (onNavigateBack) {
        onNavigateBack();
      }

      // Scroll al inicio
      setTimeout(() => scrollToTop(), 100);
    }
  }, [onNavigateBack, scrollToTop]);

  /**
   * Configurar listeners del navegador
   */
  useEffect(() => {
    if (enableBrowserNavigation) {
      // Solo agregar el listener después del montaje inicial
      if (initialLoad.current) {
        initialLoad.current = false;

        // Establecer el estado inicial
        const initialState: NavigationState = { view: 'lista' };
        navigationStack.current = [initialState];

        // Reemplazar el estado actual sin agregar una nueva entrada
        window.history.replaceState(
          { ...initialState, timestamp: Date.now(), component: 'gestion-grupos' },
          'Gestión de Grupos',
          window.location.pathname + window.location.search
        );
      }

      // Agregar listener para el evento popstate
      window.addEventListener('popstate', handlePopState);

      // Cleanup
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [enableBrowserNavigation, handlePopState]);

  return {
    pushNavigation,
    goBack,
    scrollToTop,
    canGoBack: navigationStack.current.length > 1
  };
};