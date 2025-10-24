/**
 * LoadingFallback Component v2.0
 *
 * Componente de carga mejorado para usar con React Suspense
 * Proporciona feedback visual claro mientras se cargan componentes lazy
 *
 * Mejoras v2.0:
 * - ✅ Mayor visibilidad con overlay más oscuro
 * - ✅ Animaciones suaves de entrada/salida
 * - ✅ Skeleton loader opcional
 * - ✅ Z-index más alto para asegurar visibilidad
 * - ✅ Mejor contraste y accesibilidad
 *
 * @author Sistema IPH
 * @version 2.0.0
 */

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingFallbackProps {
  /** Mensaje personalizado de carga */
  message?: string;
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar en pantalla completa */
  fullScreen?: boolean;
  /** Delay antes de mostrar (para evitar flash en cargas rápidas) */
  delay?: number;
  /** Mostrar skeleton en lugar de spinner */
  skeleton?: boolean;
}

/**
 * Componente de carga optimizado para Suspense
 */
export const LoadingFallback = ({
  message = 'Cargando...',
  size = 'md',
  fullScreen = false,
  delay = 100,
  skeleton = false
}: LoadingFallbackProps) => {
  const [show, setShow] = useState(delay === 0);

  // Delay antes de mostrar (evita flash en cargas rápidas)
  useEffect(() => {
    if (delay === 0) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56
  };

  if (skeleton) {
    return (
      <div className="w-full h-full min-h-[400px] p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      </div>
    );
  }

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-[#f8f0e7]/95 backdrop-blur-md z-[9998] animate-fadeIn'
    : 'flex items-center justify-center p-8 min-h-[400px] w-full animate-fadeIn';

  return (
    <div className={containerClass} role="status" aria-live="polite" aria-label={message}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner con anillo exterior para mayor visibilidad */}
        <div className="relative">
          {/* Anillo exterior estático */}
          <div
            className="absolute inset-0 rounded-full border-4 border-[#4d4725]/20"
            style={{
              width: sizeMap[size] + 16,
              height: sizeMap[size] + 16,
              top: -8,
              left: -8
            }}
          />

          {/* Spinner animado */}
          <Loader2
            className="animate-spin text-[#4d4725]"
            size={sizeMap[size]}
            strokeWidth={3}
          />
        </div>

        {/* Mensaje de carga */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#4d4725] font-semibold text-base">
            {message}
          </p>

          {/* Puntos animados */}
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Fallback para rutas principales
 * Muestra overlay completo con mensaje claro
 */
export const RouteLoadingFallback = () => (
  <LoadingFallback
    message="Cargando módulo"
    size="lg"
    fullScreen
    delay={0}
  />
);

/**
 * Fallback para componentes secundarios
 * Muestra spinner inline sin overlay
 */
export const ComponentLoadingFallback = () => (
  <LoadingFallback
    message="Cargando componente"
    size="md"
    fullScreen={false}
    delay={100}
  />
);

/**
 * Fallback con skeleton loader
 * Para listas y tablas
 */
export const SkeletonLoadingFallback = () => (
  <LoadingFallback
    message=""
    size="md"
    fullScreen={false}
    skeleton
    delay={0}
  />
);

export default LoadingFallback;
