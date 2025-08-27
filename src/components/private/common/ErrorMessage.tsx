/**
 * Componente ErrorMessage reutilizable
 * Implementa principios SOLID y DRY
 */

import React from 'react';

/**
 * Props para el componente ErrorMessage
 */
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'default' | 'card' | 'inline';
  showIcon?: boolean;
  className?: string;
}

/**
 * Componente para mostrar mensajes de error de forma consistente
 * 
 * @param props - Propiedades del componente
 * @returns JSX.Element del mensaje de error
 * 
 * @example
 * ```tsx
 * <ErrorMessage 
 *   message="Error cargando datos" 
 *   onRetry={handleRetry}
 *   variant="card"
 *   showIcon 
 * />
 * ```
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry,
  variant = 'default',
  showIcon = true,
  className = ''
}) => {
  // Clases base según la variante
  const variantClasses = {
    default: 'flex flex-col items-center justify-center p-4 text-center',
    card: 'flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-lg border border-red-200',
    inline: 'flex items-center gap-2 p-2 text-sm'
  };

  // Clases para el texto del mensaje
  const messageClasses = {
    default: 'text-red-600 mb-2',
    card: 'text-red-700 mb-3 font-medium',
    inline: 'text-red-600'
  };

  // Clases para el botón de retry
  const buttonClasses = {
    default: 'px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors',
    card: 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium',
    inline: 'px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
  };

  return (
    <div 
      className={`${variantClasses[variant]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icono de error */}
      {showIcon && variant !== 'inline' && (
        <div className="mb-2">
          {variant === 'card' ? (
            <svg 
              className="w-12 h-12 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          ) : (
            <svg 
              className="w-8 h-8 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          )}
        </div>
      )}

      {/* Icono inline */}
      {showIcon && variant === 'inline' && (
        <svg 
          className="w-4 h-4 text-red-500 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      )}

      {/* Contenedor del mensaje y botón para inline */}
      <div className={variant === 'inline' ? 'flex items-center gap-2 flex-1' : ''}>
        {/* Mensaje de error */}
        <p className={messageClasses[variant]}>
          {message}
        </p>

        {/* Botón de reintentar */}
        {onRetry && (
          <button 
            onClick={onRetry}
            className={buttonClasses[variant]}
            type="button"
            aria-label="Reintentar operación"
          >
            {variant === 'inline' ? 'Reintentar' : 'Reintentar'}
          </button>
        )}
      </div>

      {/* Información adicional para variante card */}
      {variant === 'card' && (
        <p className="text-sm text-red-600 mt-1 opacity-75">
          Si el problema persiste, contacta al administrador del sistema
        </p>
      )}
    </div>
  );
};

export default ErrorMessage;
export { ErrorMessage };