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
      <InfoRow label="No. Referencia:" value={data.nReferencia} />
      <InfoRow label="No. Folio:" value={data.nFolioSist} />
      <InfoRow
        label="Estatus:"
        value={data.estatus || 'N/A'}
      />
      <InfoRow label="Observaciones:" value={data.observaciones || 'N/A'} />
      
      {/* Nota: estatus es ahora un string simple, sin propiedades adicionales */}
    </InfoSection>
  );
};

export default InformacionGeneral;