/**
 * Componente compartido para botón de actualizar/refresh
 * Usado en headers de componentes de estadísticas
 *
 * @module RefreshButton
 * @version 1.0.0
 */

import React from 'react';

export interface RefreshButtonProps {
  /** Handler al hacer click en actualizar */
  onClick: () => void;
  /** Estado deshabilitado del botón */
  disabled?: boolean;
  /** Texto del botón (default: "Actualizar") */
  label?: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Botón de actualizar/refresh con ícono
 *
 * @example
 * ```tsx
 * <RefreshButton
 *   onClick={handleRefresh}
 *   disabled={isLoading}
 *   label="Actualizar"
 * />
 * ```
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  disabled = false,
  label = 'Actualizar',
  className = ''
}) => {
  return (
    <button
      className={`btn-refresh ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <span className="refresh-icon">🔄</span>
      {label}
    </button>
  );
};

export default RefreshButton;
