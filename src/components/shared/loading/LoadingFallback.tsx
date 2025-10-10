/**
 * LoadingFallback Component
 *
 * Componente de carga para usar con React Suspense
 * Proporciona feedback visual mientras se cargan componentes lazy
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  /** Mensaje personalizado de carga */
  message?: string;
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar en pantalla completa */
  fullScreen?: boolean;
}

/**
 * Componente de carga optimizado para Suspense
 */
export const LoadingFallback = ({
  message = 'Cargando...',
  size = 'md',
  fullScreen = false
}: LoadingFallbackProps) => {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 56
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <Loader2
          className="animate-spin text-[#4d4725]"
          size={sizeMap[size]}
        />
        <p className="text-[#4d4725] font-medium text-sm">{message}</p>
      </div>
    </div>
  );
};

/**
 * Fallback para rutas principales
 */
export const RouteLoadingFallback = () => (
  <LoadingFallback
    message="Cargando módulo..."
    size="lg"
    fullScreen
  />
);

/**
 * Fallback para componentes secundarios
 */
export const ComponentLoadingFallback = () => (
  <LoadingFallback
    message="Cargando componente..."
    size="md"
  />
);

export default LoadingFallback;
