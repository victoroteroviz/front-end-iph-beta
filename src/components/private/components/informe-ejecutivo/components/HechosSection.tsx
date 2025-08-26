/**
 * Componente HechosSection
 * Sección para mostrar la descripción de hechos del informe
 */

import React from 'react';
import { FileText } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IHechosSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const HechosSection: React.FC<IHechosSectionProps> = ({
  hechos,
  loading = false,
  className = ''
}) => {
  return (
    <SectionWrapper
      title="Hechos"
      loading={loading}
      className={className}
    >
      {hechos ? (
        <div className="text-[#4d4725] font-poppins">
          <p className="text-justify leading-relaxed whitespace-pre-wrap">
            {hechos}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <FileText className="h-8 w-8 mr-3" />
          <span className="font-poppins">Sin descripción de hechos registrada</span>
        </div>
      )}
    </SectionWrapper>
  );
};

export default HechosSection;