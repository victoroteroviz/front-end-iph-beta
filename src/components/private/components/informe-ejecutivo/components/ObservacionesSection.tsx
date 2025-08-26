/**
 * Componente ObservacionesSection
 * Sección para mostrar observaciones del informe
 */

import React from 'react';
import { MessageSquare } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IObservacionesSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const ObservacionesSection: React.FC<IObservacionesSectionProps> = ({
  observaciones,
  loading = false,
  className = ''
}) => {
  return (
    <SectionWrapper
      title="Observaciones"
      loading={loading}
      className={className}
    >
      {observaciones ? (
        <div className="text-[#4d4725] font-poppins">
          <p className="text-justify leading-relaxed whitespace-pre-wrap">
            {observaciones}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <MessageSquare className="h-8 w-8 mr-3" />
          <span className="font-poppins">Sin observaciones registradas</span>
        </div>
      )}
    </SectionWrapper>
  );
};

export default ObservacionesSection;