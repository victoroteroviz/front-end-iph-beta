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

// =====================================================
// CONFIGURACIÓN DE COLORES PARA CARDS
// =====================================================

/**
 * Determina los colores de una card IPH basado en el tipo
 * Incluye manejo para casos undefined/null/vacío
 */
const getCardColors = (tipoNombre?: string) => {
  // Caso corrupto: tipo undefined, null o vacío
  if (!tipoNombre || tipoNombre.trim() === '') {
    return {
      borderColor: '#000000',     // Negro completo para IPH corrupto
      shadowColor: '0, 0, 0'      // RGB para usar en box-shadow
    };
  }
  
  // Justicia Cívica
  if (tipoNombre.includes('Justicia Cívica')) {
    return {
      borderColor: '#FDD835',     // Amarillo dorado
      shadowColor: '253, 216, 53' // RGB equivalente para sombra
    };
  } 
  
  // Hechos Probablemente Delictivos
  if (tipoNombre.includes('Hechos Probablemente Delictivos')) {
    return {
      borderColor: '#FF6F00',     // Naranja
      shadowColor: '255, 111, 0'  // RGB equivalente para sombra
    };
  }
  
  // Fallback para otros tipos
  return {
    borderColor: '#c2b186',       // Color original del proyecto
    shadowColor: '194, 177, 134'  // RGB equivalente
  };
};

const IPHCard: React.FC<IIPHCardProps> = ({
  registro,
  onClick,
  loading = false,
  className = ''
}) => {

  const getIcon = (iconType: IPHIconType) => {
    const iconProps = { size: 32, className: "text-[#b8ab84]" };
    
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
      <div className={`bg-white rounded-lg shadow-md p-4 relative animate-pulse border border-gray-100 ${className}`}>
        {/* Header con indicador */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="w-4 h-4 rounded-full bg-gray-200" />
        </div>
        
        {/* Contenido */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>

        {/* Footer con badge e ícono */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-4 relative cursor-pointer
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
      {/* Header con referencia e indicador */}
      <div className="flex justify-between items-start mb-3">
        <h2 className="font-bold text-lg text-[#4d4725] font-poppins truncate flex-1 mr-2">
          {registro.n_referencia}
        </h2>
        
        {/* Indicador de estado simplificado */}
        <div 
          className={`
            w-4 h-4 rounded-full flex-shrink-0
            ${isActive ? 'bg-green-500' : 'bg-red-500'}
          `}
          title={statusDescription}
          aria-label={statusDescription}
        />
      </div>

      {/* Contenido principal */}
      <div className="space-y-2 mb-3">
        {/* Tipo */}
        <p className="text-sm font-poppins text-gray-600 truncate">
          <span className="font-medium">Tipo:</span> {registro.tipo?.nombre || 'No especificado'}
        </p>
        
        {/* Folio */}
        <p className="text-sm font-poppins text-gray-600 truncate">
          <span className="font-medium">Folio:</span> {registro.n_folio_sist}
        </p>

        {/* Información adicional */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {registro.fecha_creacion && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatCreationDate(registro.fecha_creacion)}</span>
            </div>
          )}
          
          {registro.usuario_id && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">ID: {registro.usuario_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer con badge e ícono */}
      <div className="flex justify-between items-center">
        {/* Badge de estatus */}
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
          <span className="truncate max-w-20">{registro.estatus?.nombre || 'Sin estado'}</span>
        </span>

        {/* Icono */}
        <div className="flex-shrink-0 ml-2">
          {getIcon(iconType)}
        </div>
      </div>

      {/* Efecto hover overlay */}
      <div className="absolute inset-0 bg-[#b8ab84] opacity-0 hover:opacity-5 transition-opacity duration-200 rounded-lg pointer-events-none" />
    </div>
  );
};

export default IPHCard;