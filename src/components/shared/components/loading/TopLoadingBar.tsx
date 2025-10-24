/**
 * TopLoadingBar Component v1.0.0
 *
 * Barra de progreso superior estilo YouTube/GitHub
 * para feedback visual durante navegación y carga de datos
 *
 * Características:
 * - ✅ No bloquea la UI
 * - ✅ Animaciones suaves
 * - ✅ API imperativa (ref) y state-based
 * - ✅ Colores configurables
 * - ✅ Auto-incremento inteligente
 * - ✅ Compatible con React Router
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
  useRef,
  type ReactNode
} from 'react';

// =====================================================
// TYPES
// =====================================================

/**
 * Props del componente
 */
export type TopLoadingBarProps = {
  /** Color de la barra (default: #4d4725) */
  color?: string;
  /** Altura de la barra en px (default: 3) */
  height?: number;
  /** Velocidad de incremento automático en ms (default: 200) */
  speed?: number;
  /** Mostrar sombra (default: true) */
  showShadow?: boolean;
  /** Z-index (default: 9999) */
  zIndex?: number;
  /** Clase CSS adicional */
  className?: string;
};

/**
 * Ref API para control imperativo
 */
export type TopLoadingBarRef = {
  /** Inicia el progreso */
  start: () => void;
  /** Completa el progreso */
  complete: () => void;
  /** Establece progreso manualmente (0-100) */
  setProgress: (progress: number) => void;
  /** Resetea la barra */
  reset: () => void;
  /** Obtiene el progreso actual */
  getProgress: () => number;
};

// =====================================================
// COMPONENT
// =====================================================

/**
 * Barra de progreso superior para feedback de carga
 *
 * @example
 * ```typescript
 * // Uso con ref (imperativo)
 * const loadingBarRef = useRef<TopLoadingBarRef>(null);
 *
 * const handleNavigate = () => {
 *   loadingBarRef.current?.start();
 *   // ... navegación
 *   loadingBarRef.current?.complete();
 * };
 *
 * <TopLoadingBar ref={loadingBarRef} />
 *
 * // Uso con hooks
 * const { startLoading, completeLoading } = useTopLoadingBar();
 *
 * startLoading();
 * // ... operación
 * completeLoading();
 * ```
 */
export const TopLoadingBar = forwardRef<TopLoadingBarRef, TopLoadingBarProps>(
  (
    {
      color = '#4d4725',
      height = 3,
      speed = 200,
      showShadow = true,
      zIndex = 9999,
      className = ''
    },
    ref
  ) => {
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    /**
     * Inicia la animación de progreso
     */
    const start = useCallback(() => {
      setIsVisible(true);
      setIsAnimating(true);
      setProgress(0);
    }, []);

    /**
     * Completa el progreso y oculta la barra
     */
    const complete = useCallback(() => {
      setProgress(100);
      setIsAnimating(false);

      // Ocultar después de la animación
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 400);
    }, []);

    /**
     * Establece progreso manualmente
     */
    const setProgressManual = useCallback((value: number) => {
      setProgress(Math.min(100, Math.max(0, value)));
    }, []);

    /**
     * Resetea la barra
     */
    const reset = useCallback(() => {
      setProgress(0);
      setIsAnimating(false);
      setIsVisible(false);
    }, []);

    /**
     * Obtiene progreso actual
     */
    const getProgress = useCallback(() => progress, [progress]);

    // Exponer API a través del ref
    useImperativeHandle(ref, () => ({
      start,
      complete,
      setProgress: setProgressManual,
      reset,
      getProgress
    }), [start, complete, setProgressManual, reset, getProgress]);

    // Auto-incremento inteligente cuando está animando
    useEffect(() => {
      if (!isAnimating) return;

      const increment = () => {
        setProgress(prev => {
          if (prev >= 95) return prev; // No pasar de 95% automáticamente

          // Incremento logarítmico (más lento cerca del 100%)
          const remaining = 95 - prev;
          const step = remaining * 0.1; // 10% del restante

          return Math.min(95, prev + Math.max(1, step));
        });
      };

      const timer = setInterval(increment, speed);

      return () => clearInterval(timer);
    }, [isAnimating, speed]);

    // Estilos memoizados
    const containerStyle = useMemo(() => ({
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      height: `${height}px`,
      zIndex,
      pointerEvents: 'none' as const,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 200ms ease-in-out'
    }), [height, zIndex, isVisible]);

    const barStyle = useMemo(() => ({
      height: '100%',
      backgroundColor: color,
      width: `${progress}%`,
      transition: isAnimating
        ? `width ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`
        : 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: showShadow
        ? `0 0 10px ${color}, 0 0 5px ${color}`
        : undefined,
      transformOrigin: 'left',
      willChange: 'width'
    }), [color, progress, isAnimating, speed, showShadow]);

    // No renderizar si no es visible
    if (!isVisible) return null;

    return (
      <div style={containerStyle} className={className} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div style={barStyle} />
      </div>
    );
  }
);

TopLoadingBar.displayName = 'TopLoadingBar';

// =====================================================
// HOOK
// =====================================================

/**
 * Hook para control de TopLoadingBar
 *
 * @param barRef - Ref al TopLoadingBar
 * @returns Funciones de control
 *
 * @example
 * ```typescript
 * const loadingBarRef = useRef<TopLoadingBarRef>(null);
 * const { startLoading, completeLoading } = useTopLoadingBar(loadingBarRef);
 *
 * const fetchData = async () => {
 *   startLoading();
 *   try {
 *     const data = await api.getData();
 *     completeLoading();
 *   } catch (error) {
 *     completeLoading(); // También completar en error
 *   }
 * };
 * ```
 */
export const useTopLoadingBar = (barRef: React.RefObject<TopLoadingBarRef | null>) => {
  const startLoading = useCallback(() => {
    barRef.current?.start();
  }, [barRef]);

  const completeLoading = useCallback(() => {
    barRef.current?.complete();
  }, [barRef]);

  const setProgress = useCallback((progress: number) => {
    barRef.current?.setProgress(progress);
  }, [barRef]);

  const resetLoading = useCallback(() => {
    barRef.current?.reset();
  }, [barRef]);

  return {
    startLoading,
    completeLoading,
    setProgress,
    resetLoading
  };
};

// =====================================================
// CONTEXT PROVIDER
// =====================================================

/**
 * Contexto para TopLoadingBar global
 */
type TopLoadingBarContextType = {
  startLoading: () => void;
  completeLoading: () => void;
  setProgress: (progress: number) => void;
  resetLoading: () => void;
};

const TopLoadingBarContext = createContext<TopLoadingBarContextType | null>(null);

/**
 * Provider para TopLoadingBar global
 *
 * @example
 * ```typescript
 * // En App.tsx
 * <TopLoadingBarProvider>
 *   <YourApp />
 * </TopLoadingBarProvider>
 *
 * // En cualquier componente
 * const { startLoading, completeLoading } = useTopLoadingBarContext();
 *
 * const handleClick = async () => {
 *   startLoading();
 *   await fetchData();
 *   completeLoading();
 * };
 * ```
 */
export const TopLoadingBarProvider = ({
  children,
  color,
  height,
  speed
}: {
  children: ReactNode;
  color?: string;
  height?: number;
  speed?: number;
}) => {
  const loadingBarRef = useRef<TopLoadingBarRef>(null);
  const { startLoading, completeLoading, setProgress, resetLoading } = useTopLoadingBar(loadingBarRef);

  const contextValue = useMemo(() => ({
    startLoading,
    completeLoading,
    setProgress,
    resetLoading
  }), [startLoading, completeLoading, setProgress, resetLoading]);

  return (
    <TopLoadingBarContext.Provider value={contextValue}>
      <TopLoadingBar ref={loadingBarRef} color={color} height={height} speed={speed} />
      {children}
    </TopLoadingBarContext.Provider>
  );
};

/**
 * Hook para usar TopLoadingBar global desde cualquier componente
 *
 * @throws Error si se usa fuera del Provider
 */
export const useTopLoadingBarContext = (): TopLoadingBarContextType => {
  const context = useContext(TopLoadingBarContext);
  if (!context) {
    throw new Error('useTopLoadingBarContext debe usarse dentro de TopLoadingBarProvider');
  }
  return context;
};

// =====================================================
// EXPORT
// =====================================================

export default TopLoadingBar;
