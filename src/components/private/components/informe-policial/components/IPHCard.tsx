/**
 * Componente IPHCard
 * Tarjeta individual para mostrar información de IPH
 * Diseño modernizado manteniendo colores originales
 */

import React from 'react';
import { ShieldCheck, Scale, Clock, User } from 'lucide-react';
import type { 
  IIPHCardProps,
  IPHIconType
} from '../../../../../interfaces/components/informe-policial.interface';
import { 
  getIPHIconType, 
  isStatusActive, 
  getStatusDescription,
  formatCreationDate
} from '../../../../../interfaces/components/informe-policial.interface';

const IPHCard: React.FC<IIPHCardProps> = ({
  registro,
  onClick,
  loading = false,
  className = ''
}) => {

  const getIcon = (iconType: IPHIconType) => {
    const iconProps = { size: 40, className: "text-[#b8ab84]" };
    
    switch (iconType) {
      case 'delictivo':
        return <ShieldCheck {...iconProps} />;
      case 'administrativo':
        return <Scale {...iconProps} />;
      default:
        return <Scale {...iconProps} />;
    }
  };

  const handleClick = () => {
    if (loading) return;
    onClick(registro);
  };

  const iconType = getIPHIconType(registro.tipo?.nombre);
  const isActive = isStatusActive(registro.estatus);
  const statusDescription = getStatusDescription(registro);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 relative animate-pulse ${className}`}>
        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-200" />
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mb-1 w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-4 relative 
        flex justify-between items-center cursor-pointer
        transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        border border-gray-100 hover:border-[#b8ab84]
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver informe ${registro.n_referencia}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Indicador de estado */}
      <div 
        className={`
          absolute top-3 right-3 w-4 h-4 rounded-full border-2 
          ${isActive ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'}
        `}
        title={statusDescription}
      >
        {/* Dot interior para mejor visibilidad */}
        <div 
          className={`
            w-2 h-2 rounded-full absolute top-0.5 left-0.5
            ${isActive ? 'bg-green-500' : 'bg-red-500'}
          `} 
        />
      </div>

      {/* Contenido principal */}
      <div className="text-[#4d4725] flex-1 mr-4">
        {/* Referencia principal */}
        <h2 className="font-bold text-lg mb-1 font-poppins truncate">
          {registro.n_referencia}
        </h2>
        
        {/* Tipo */}
        <p className="text-sm mb-1 font-poppins text-gray-600">
          <span className="font-medium">Tipo:</span> {registro.tipo?.nombre || 'No especificado'}
        </p>
        
        {/* Folio */}
        <p className="text-sm font-poppins text-gray-600">
          <span className="font-medium">Folio:</span> {registro.n_folio_sist}
        </p>

        {/* Información adicional */}
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          {registro.fecha_creacion && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatCreationDate(registro.fecha_creacion)}</span>
            </div>
          )}
          
          {registro.usuario_id && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>ID: {registro.usuario_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Icono */}
      <div className="flex-shrink-0">
        {getIcon(iconType)}
      </div>

      {/* Badge de estatus */}
      <div className="absolute bottom-2 left-4">
        <span 
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${isActive 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
            }
          `}
        >
          <div 
            className={`w-1.5 h-1.5 rounded-full mr-1 ${isActive ? 'bg-green-500' : 'bg-red-500'}`} 
          />
          {registro.estatus?.nombre || 'Sin estado'}
        </span>
      </div>

      {/* Efecto hover overlay */}
      <div className="absolute inset-0 bg-[#b8ab84] opacity-0 hover:opacity-5 transition-opacity duration-200 rounded-lg pointer-events-none" />
    </div>
  );
};

export default IPHCard;