/**
 * Sección InformacionGeneral
 * Muestra información general del IPH oficial
 */

import React from 'react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { InformacionGeneralProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de información general
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const InformacionGeneral: React.FC<InformacionGeneralProps> = ({
  data,
  loading = false,
  className = ''
}) => {
  return (
    <InfoSection 
      title="INFORMACIÓN GENERAL" 
      isLoading={loading}
      className={className}
    >
      <InfoRow label="No. Referencia:" value={data.n_referencia} />
      <InfoRow label="No. Folio:" value={data.n_folio_sist} />
      <InfoRow 
        label="Estatus:" 
        value={data.estatus?.nombre || 'N/A'} 
      />
      <InfoRow label="Observaciones:" value={data.observaciones || 'N/A'} />
      
      {/* Información adicional del estatus */}
      {data.estatus && (
        <InfoRow 
          label="Última actualización:" 
          value={data.estatus.fecha_actualizacion} 
          type="date" 
        />
      )}
    </InfoSection>
  );
};

export default InformacionGeneral;