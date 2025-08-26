/**
 * Componente IPHSkeletonCard
 * Skeleton loading para las tarjetas de IPH
 */

import React from 'react';
import type { IIPHSkeletonCardProps } from '../../../../../interfaces/components/informe-policial.interface';

const IPHSkeletonCard: React.FC<IIPHSkeletonCardProps> = ({
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 relative border border-gray-100 ${className}`}>
      {/* Indicador de estado skeleton */}
      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gray-200 animate-pulse" />

      {/* Contenido principal skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex-1 mr-4">
          {/* Referencia skeleton */}
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
          
          {/* Tipo skeleton */}
          <div className="h-4 bg-gray-200 rounded mb-1 w-1/2 animate-pulse" />
          
          {/* Folio skeleton */}
          <div className="h-4 bg-gray-200 rounded mb-2 w-2/3 animate-pulse" />

          {/* Información adicional skeleton */}
          <div className="flex items-center gap-3 mt-2">
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        </div>

        {/* Icono skeleton */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
      </div>

      {/* Badge de estatus skeleton */}
      <div className="absolute bottom-2 left-4">
        <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" />
      </div>
    </div>
  );
};

export default IPHSkeletonCard;