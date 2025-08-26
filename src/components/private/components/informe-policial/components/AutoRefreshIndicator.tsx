/**
 * Componente AutoRefreshIndicator
 * Indicador de auto-refresh con countdown y control de toggle
 */

import React, { useState, useEffect } from 'react';
import { RotateCcw, Pause, Play, Clock } from 'lucide-react';
import type { IAutoRefreshIndicatorProps } from '../../../../../interfaces/components/informe-policial.interface';

const AutoRefreshIndicator: React.FC<IAutoRefreshIndicatorProps> = ({
  isActive,
  nextRefreshIn,
  onToggle,
  className = ''
}) => {
  const [displayTime, setDisplayTime] = useState(nextRefreshIn);

  // Actualizar el tiempo cada segundo
  useEffect(() => {
    setDisplayTime(nextRefreshIn);
  }, [nextRefreshIn]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getProgressPercentage = (): number => {
    const maxTime = 5 * 60; // 5 minutos en segundos
    return Math.max(0, Math.min(100, ((maxTime - displayTime) / maxTime) * 100));
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      
      {/* Indicador principal */}
      <div className="flex items-center gap-2">
        
        {/* Botón toggle */}
        <button
          onClick={onToggle}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
            transition-colors duration-200 font-poppins border
            ${isActive
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }
          `}
          title={isActive ? 'Pausar auto-actualización' : 'Reanudar auto-actualización'}
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4" />
              <span className="hidden sm:inline">Pausar</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Reanudar</span>
            </>
          )}
        </button>

        {/* Información de tiempo */}
        {isActive && (
          <div className="flex items-center gap-2">
            
            {/* Icono y tiempo */}
            <div className="flex items-center gap-1 text-sm text-gray-600 font-poppins">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Próxima actualización en</span>
              <span className="sm:hidden">En</span>
              <span className="font-medium">{formatTime(displayTime)}</span>
            </div>

            {/* Barra de progreso */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Estado inactivo */}
        {!isActive && (
          <div className="flex items-center gap-1 text-sm text-gray-500 font-poppins">
            <Clock className="h-4 w-4" />
            <span>Auto-actualización pausada</span>
          </div>
        )}
      </div>

      {/* Badge de estado */}
      <div className="flex items-center">
        <span 
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${isActive 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-800 border border-gray-200'
            }
          `}
        >
          <div 
            className={`w-1.5 h-1.5 rounded-full mr-1 ${
              isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} 
          />
          {isActive ? 'Activo' : 'Pausado'}
        </span>
      </div>
    </div>
  );
};

export default AutoRefreshIndicator;