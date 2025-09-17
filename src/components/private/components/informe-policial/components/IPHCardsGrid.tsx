/**
 * Componente IPHCardsGrid
 * Grid responsivo de tarjetas IPH con estados de carga y vacío
 */

import React from 'react';
import { FileX, AlertCircle } from 'lucide-react';
import IPHCard from './IPHCard';
import IPHSkeletonCard from './IPHSkeletonCard';
import type { IIPHCardsGridProps } from '../../../../../interfaces/components/informe-policial.interface';
import { INFORME_POLICIAL_CONFIG } from '../../../../../interfaces/components/informe-policial.interface';

const IPHCardsGrid: React.FC<IIPHCardsGridProps> = ({
  registros,
  loading,
  onCardClick,
  className = ''
}) => {

  // Estado de carga
  if (loading) {
    return (
      <div 
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
        aria-label="Cargando informes policiales"
        role="status"
      >
        {Array.from({ length: INFORME_POLICIAL_CONFIG.SKELETON_CARDS_COUNT }).map((_, index) => (
          <IPHSkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Estado vacío
  if (!registros || registros.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm">
          <FileX className="h-16 w-16 text-gray-400 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
            No se encontraron informes
          </h3>
          <p className="text-gray-600 text-center font-poppins max-w-md mb-4">
            No hay informes policiales que coincidan con los criterios de búsqueda actuales.
            <span className="hidden sm:inline"> Intenta ajustar los filtros o realiza una nueva búsqueda.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-center sm:text-left">
                <span className="sm:hidden">Verifica los filtros aplicados</span>
                <span className="hidden sm:inline">Verifica los filtros aplicados o contacta al administrador si el problema persiste</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid de tarjetas
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
      role="grid"
      aria-label={`Lista de ${registros.length} informes policiales`}
    >
      {registros.map((registro) => (
        <IPHCard
          key={registro.id}
          registro={registro}
          onClick={onCardClick}
          loading={false}
        />
      ))}
    </div>
  );
};

export default IPHCardsGrid;