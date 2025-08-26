/**
 * Sección PrimerRespondienteSection
 * Muestra información del primer respondiente
 */

import React from 'react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { PrimerRespondienteProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de primer respondiente
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const PrimerRespondienteSection: React.FC<PrimerRespondienteProps> = ({
  data,
  loading = false,
  className = ''
}) => {
  // TODO: Obtener información adicional del respondiente desde catálogos
  // Por ahora mostramos los campos básicos disponibles
  
  return (
    <InfoSection 
      title="PRIMER RESPONDIENTE" 
      isLoading={loading}
      className={className}
    >
      <InfoRow 
        label="Unidad de Arribo:" 
        value={data.unidad_arrivo || 'N/A'} 
      />
      <InfoRow 
        label="Número de Elementos:" 
        value={data.n_elementos || 0} 
      />
      <InfoRow 
        label="Fecha de Registro:" 
        value={data.fecha_creacion} 
        type="date" 
      />
      
      {/* Información adicional si está disponible */}
      {data.fecha_actualizacion && (
        <InfoRow 
          label="Última Actualización:" 
          value={data.fecha_actualizacion} 
          type="date" 
        />
      )}

      {/* Placeholder para información adicional del respondiente */}
      <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-yellow-400">
        <p className="text-xs text-gray-600">
          <strong>Nota:</strong> La información detallada del respondiente (nombre, grado, cargo, etc.) 
          se obtendrá de los catálogos cuando esté disponible la integración completa.
        </p>
      </div>
    </InfoSection>
  );
};

export default PrimerRespondienteSection;