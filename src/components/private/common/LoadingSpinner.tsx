/**
 * Componente LoadingSpinner reutilizable
 * Implementa principios SOLID y DRY
 */

import React from 'react';

/**
 * Props para el componente LoadingSpinner
 */
interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'small' | 'medium' | 'large';
  /** Mensaje a mostrar debajo del spinner */
  message?: string;
  /** Color del spinner */
  color?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente para mostrar indicadores de carga de forma consistente
 * 
 * @param props - Propiedades del componente
 * @returns JSX.Element del spinner de carga
 * 
 * @example
 * ```tsx
 * <LoadingSpinner 
 *   size="medium"
 *   message="Cargando datos..." 
 *   color="#4d4725"
 * />
 * ```
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  message,
  color = '#4d4725',
  className = ''
}) => {
  // Clases de tamaño
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  // Clases para el contenedor del mensaje
  const messageClasses = {
    small: 'text-xs mt-1',
    medium: 'text-sm mt-2',
    large: 'text-base mt-3'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Spinner */}
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-transparent`}
        style={{
          borderTopColor: color,
          borderRightColor: color,
        }}
        role="status"
        aria-label={message || "Cargando"}
      />
      
      {/* Mensaje opcional */}
      {message && (
        <p 
          className={`${messageClasses[size]} font-medium`}
          style={{ color }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
export { LoadingSpinner };