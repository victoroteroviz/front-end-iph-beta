/**
 * Componente UsuarioCard
 * Tarjeta individual para mostrar estadísticas de un usuario
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';

// Interfaces
import type { UsuarioCardProps } from '../../../../../../interfaces/components/estadisticasUsuario.interface';

/**
 * Componente de tarjeta de usuario
 * 
 * @param props - Props de la tarjeta de usuario
 * @returns JSX.Element de la tarjeta
 */
const UsuarioCard: React.FC<UsuarioCardProps> = ({ 
  usuario,
  className = '',
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);

  /**
   * Maneja errores de carga de imagen
   */
  const handleImageError = () => {
    setImageError(true);
  };

  /**
   * Maneja el click en la tarjeta
   */
  const handleClick = () => {
    if (onClick) {
      onClick(usuario);
    }
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-4 
        flex items-center gap-4
        transition-all duration-200
        hover:shadow-lg hover:scale-[1.02]
        border border-gray-100
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={handleClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      aria-label={onClick ? `Ver detalles de ${usuario.nombre_completo}` : undefined}
    >
      {/* Avatar del usuario */}
      <div className="flex-shrink-0 relative">
        {!imageError && usuario.photo ? (
          <img
            src={usuario.photo}
            alt={`Foto de ${usuario.nombre_completo}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="
            w-16 h-16 rounded-full 
            bg-[#948b54] text-white
            flex items-center justify-center
            border-2 border-gray-200
          ">
            <User size={24} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Información del usuario */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#4d4725] text-lg truncate mb-1">
          {usuario.nombre_completo}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Total IPHs:</span>
          <span className="font-semibold text-[#948b54] text-lg">
            {usuario.total_iphs}
          </span>
        </div>

        {/* Indicador visual basado en cantidad */}
        <div className="mt-2">
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-[#948b54] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((usuario.total_iphs / 20) * 100, 100)}%`
                }}
                aria-label={`Progreso: ${usuario.total_iphs} IPHs`}
              />
            </div>
            <span className="text-xs text-gray-500 ml-1">
              {usuario.total_iphs > 20 ? '20+' : usuario.total_iphs}
            </span>
          </div>
        </div>
      </div>

      {/* Badge de cantidad (opcional para valores altos) */}
      {usuario.total_iphs > 50 && (
        <div className="
          flex-shrink-0 
          bg-[#4d4725] text-white text-xs font-bold
          px-2 py-1 rounded-full
        ">
          Top
        </div>
      )}
    </div>
  );
};

export default UsuarioCard;