/**
 * Componente AccessDenied
 * Pantalla reutilizable para mostrar mensajes de acceso denegado
 *
 * @version 1.0.0
 */

import React from 'react';
import { AlertCircle, Lock, ShieldX } from 'lucide-react';

type AccessDeniedProps = {
  /**
   * Título del mensaje
   * @default "Acceso Denegado"
   */
  title?: string;

  /**
   * Mensaje descriptivo
   * @default "No tienes permisos para acceder a este módulo."
   */
  message?: string;

  /**
   * Tipo de icono a mostrar
   * @default "alert"
   */
  iconType?: 'alert' | 'lock' | 'shield';

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * Si true, muestra el componente en pantalla completa (min-h-screen)
   * @default true
   */
  fullScreen?: boolean;
};

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Acceso Denegado',
  message = 'No tienes permisos para acceder a este módulo.',
  iconType = 'alert',
  className = '',
  fullScreen = true
}) => {
  // Seleccionar icono según tipo
  const IconComponent = iconType === 'lock'
    ? Lock
    : iconType === 'shield'
      ? ShieldX
      : AlertCircle;

  return (
    <div
      className={`
        ${fullScreen ? 'min-h-screen' : ''}
        flex items-center justify-center p-4
        ${className}
      `}
      data-component="access-denied"
    >
      <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full shadow-lg">
        {/* Icono */}
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <IconComponent className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2 font-poppins">
          {title}
        </h2>

        {/* Mensaje */}
        <p className="text-center text-gray-600 font-poppins">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
