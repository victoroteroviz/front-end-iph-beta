/**
 * Sección ConocimientoHechosSection
 * Muestra información sobre el conocimiento de los hechos
 */

import React from 'react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { ConocimientoHechosProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de conocimiento de hechos
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const ConocimientoHechosSection: React.FC<ConocimientoHechosProps> = ({
  data,
  loading = false,
  className = ''
}) => {
  if (!data && !loading) {
    return (
      <InfoSection 
        title="CONOCIMIENTO DE LOS HECHOS" 
        className={className}
      >
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">
            No hay información disponible sobre el conocimiento de los hechos.
          </p>
        </div>
      </InfoSection>
    );
  }

  return (
    <InfoSection 
      title="CONOCIMIENTO DE LOS HECHOS" 
      isLoading={loading}
      className={className}
    >
      <InfoRow 
        label="Tipo de Conocimiento:" 
        value={data?.tipo || 'N/A'} 
      />
      <InfoRow 
        label="Número de Conocimiento:" 
        value={data?.numero || 'N/A'} 
      />
      <InfoRow 
        label="Documento de Conocimiento:" 
        value={data?.documento || 'N/A'} 
      />
      <InfoRow 
        label="Fecha de Conocimiento:" 
        value={data?.fecha_conocimiento} 
        type="date" 
      />
      <InfoRow 
        label="Fecha de Arribo:" 
        value={data?.fecha_arribo} 
        type="date" 
      />
      
      {/* Descripción adicional si existe */}
      {data?.descripcion && (
        <div className="mt-4">
          <div className="font-bold text-gray-800 mb-2">
            Descripción:
          </div>
          <div className="bg-gray-50 p-3 rounded border text-gray-900">
            {data.descripcion}
          </div>
        </div>
      )}
    </InfoSection>
  );
};

export default ConocimientoHechosSection;