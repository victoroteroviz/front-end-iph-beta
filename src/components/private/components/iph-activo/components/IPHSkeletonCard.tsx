/**
 * Componente IPHSkeletonCard
 * Skeleton loading con EXACTAMENTE la misma estructura que IPHCard
 * ✅ OPTIMIZACIÓN: Evita layout shift (rebote) durante la carga
 * Las dimensiones y estructura son idénticas a la card real
 */

import React from 'react';
import type { IIPHSkeletonCardProps } from '../../../../../interfaces/components/informe-policial.interface';

const IPHSkeletonCard: React.FC<IIPHSkeletonCardProps> = ({
  className = ''
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-4 relative
        border-l-4 border-r border-t border-b border-gray-200
        ${className}
      `}
      style={{
        borderLeftColor: '#c2b186' // Color neutro para skeleton
      }}
    >
      {/* Header con referencia e indicador - ESTRUCTURA IDÉNTICA */}
      <div className="flex justify-between items-start mb-3">
        {/* Referencia skeleton - h-6 para text-lg */}
        <div className="h-6 bg-gray-200 rounded w-3/4 flex-1 mr-2 animate-pulse" />

        {/* Indicador de estado skeleton - w-4 h-4 EXACTO */}
        <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0 animate-pulse" />
      </div>

      {/* Contenido principal - ESTRUCTURA IDÉNTICA */}
      <div className="space-y-2 mb-3">
        {/* Tipo con icono skeleton */}
        <div className="flex items-center gap-2">
          {/* Icono skeleton - h-4 w-4 EXACTO */}
          <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0 animate-pulse" />
          {/* Texto skeleton - h-4 para text-sm */}
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        </div>

        {/* Folio con icono skeleton */}
        <div className="flex items-center gap-2">
          {/* Icono skeleton - h-4 w-4 EXACTO */}
          <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0 animate-pulse" />
          {/* Texto skeleton - h-4 para text-sm */}
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
        </div>

        {/* Información adicional skeleton */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fecha skeleton - h-3 para text-xs */}
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded flex-shrink-0 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          {/* Usuario skeleton - h-3 para text-xs */}
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded flex-shrink-0 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Footer con badge e ícono - ESTRUCTURA IDÉNTICA */}
      <div className="flex justify-between items-center">
        {/* Badge de estatus skeleton - dimensiones EXACTAS */}
        <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-200 animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1" />
          <div className="h-3 w-16 bg-gray-300 rounded" />
        </div>

        {/* Icono dinámico skeleton - p-2 + tamaño interno EXACTO */}
        <div className="flex-shrink-0 ml-2 p-2 rounded-lg bg-gray-200 animate-pulse">
          <div className="w-6 h-6" /> {/* size=24 equivale a w-6 h-6 */}
        </div>
      </div>

      {/* Efecto overlay (sin hover en skeleton) */}
      <div className="absolute inset-0 bg-transparent rounded-lg pointer-events-none" />
    </div>
  );
};

export default IPHSkeletonCard;