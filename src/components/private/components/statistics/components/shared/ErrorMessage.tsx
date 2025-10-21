/**
 * Componente compartido para mostrar mensajes de error
 * Incluye botón de reintento
 *
 * @module ErrorMessage
 * @version 1.0.0
 */

import React from 'react';

export interface ErrorMessageProps {
  /** Mensaje de error a mostrar */
  error: string | null;
  /** Handler para reintentar la operación */
  onRetry: () => void;
  /** Estado de carga durante reintento */
  isLoading?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente de mensaje de error con botón de reintento
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   error="Error al cargar datos"
 *   onRetry={handleRetry}
 *   isLoading={loading}
 * />
 * ```
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  isLoading = false,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`estadisticas-jc-error ${className}`}>
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <div className="error-text">
          <strong>Error al cargar estadísticas</strong>
          <p>{error}</p>
        </div>
      </div>
      <button
        className="error-retry-btn"
        onClick={onRetry}
        disabled={isLoading}
        aria-label="Reintentar carga de datos"
      >
        {isLoading ? 'Reintentando...' : 'Reintentar'}
      </button>
    </div>
  );
};

export default ErrorMessage;
