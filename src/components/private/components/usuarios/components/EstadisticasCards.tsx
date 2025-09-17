/**
 * Componente atómico EstadisticasCards
 * Tarjetas de estadísticas de rendimiento de usuarios
 */

import React from 'react';
import { TrendingUp, Award, AlertTriangle, Users, Loader2, UserIcon } from 'lucide-react';
import type { IEstadisticasCardsProps } from '../../../../../interfaces/components/usuarios.interface';

const EstadisticasCards: React.FC<IEstadisticasCardsProps> = ({
  estadisticas,
  loading,
  className = ''
}) => {
  // Configuración de iconos por tipo de estadística
  const getCardConfig = (tipo: 'masIph' | 'mejorTiempo' | 'peorRendimiento') => {
    const configs = {
      masIph: {
        icon: TrendingUp,
        title: 'Más IPH del Mes',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-800'
      },
      mejorTiempo: {
        icon: Award,
        title: 'Mejor Efectividad',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200', 
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-800'
      },
      peorRendimiento: {
        icon: AlertTriangle,
        title: 'Necesita Seguimiento',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-800'
      }
    };
    return configs[tipo];
  };

  // Estado de carga
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado sin datos
  if (!estadisticas) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-8 text-center ${className}`}>
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
          Estadísticas no disponibles
        </h3>
        <p className="text-gray-600 font-poppins">
          No se pudieron cargar las estadísticas de rendimiento.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      
      {/* Tarjeta Más IPH */}
      <EstadisticaCard 
        config={getCardConfig('masIph')}
        data={estadisticas.masIph}
      />

      {/* Tarjeta Mejor Tiempo */}
      <EstadisticaCard 
        config={getCardConfig('mejorTiempo')}
        data={estadisticas.mejorTiempo}
      />

      {/* Tarjeta Peor Rendimiento */}
      <EstadisticaCard 
        config={getCardConfig('peorRendimiento')}
        data={estadisticas.peorRendimiento}
      />
    </div>
  );
};

// Componente individual de tarjeta de estadística
interface EstadisticaCardProps {
  config: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  };
  data: {
    id: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    color: 'green' | 'red' | 'blue' | 'yellow';
  };
}

const EstadisticaCard: React.FC<EstadisticaCardProps> = ({ config, data }) => {
  const Icon = config.icon;

  return (
    <div 
      className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-lg p-6 relative transition-all duration-200
        hover:shadow-md hover:scale-105 cursor-default
      `}
    >
      {/* Indicador de color en la esquina */}
      <div 
        className={`
          absolute top-3 right-3 w-3 h-3 rounded-full
          ${data.color === 'green' ? 'bg-green-500' : 
            data.color === 'red' ? 'bg-red-500' :
            data.color === 'blue' ? 'bg-blue-500' : 'bg-yellow-500'}
        `}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-semibold ${config.titleColor} font-poppins`}>
          {config.title}
        </h3>
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>

      {/* Contenido */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {data.imagen ? (
            <img
              src={data.imagen}
              alt={data.nombre}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                // Ocultar imagen y mostrar ícono de fallback
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center ${data.imagen ? 'hidden' : ''}`}>
            <UserIcon className="w-6 h-6 text-gray-500" />
          </div>
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate font-poppins">
            {data.nombre}
          </p>
          <p className="text-xs text-gray-600 mt-1 font-poppins">
            {data.descripcion}
          </p>
        </div>
      </div>

      {/* Badge de rendimiento */}
      <div className="mt-4 flex justify-end">
        <span 
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${data.color === 'green' 
              ? 'bg-green-100 text-green-800' 
              : data.color === 'red' 
                ? 'bg-red-100 text-red-800'
                : data.color === 'blue'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
            }
          `}
        >
          {data.color === 'green' && '🏆'}
          {data.color === 'red' && '⚠️'}
          {data.color === 'blue' && '📊'}
          {data.color === 'yellow' && '⭐'}
          <span className="ml-1">
            {data.color === 'green' ? 'Destacado' :
             data.color === 'red' ? 'Atención' :
             data.color === 'blue' ? 'Promedio' : 'Regular'}
          </span>
        </span>
      </div>
    </div>
  );
};

export default EstadisticasCards;