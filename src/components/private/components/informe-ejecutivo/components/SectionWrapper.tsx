/**
 * Componente SectionWrapper
 * Wrapper reutilizable para secciones del InformeEjecutivo
 * Mantiene el diseño original con colores específicos
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ISectionWrapperProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const SectionWrapper: React.FC<ISectionWrapperProps> = ({
  title,
  children,
  loading = false,
  className = '',
  headerColor = '#c2b186',
  contentColor = '#fdf7f1'
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      {/* Header con estilo original */}
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: headerColor }}
      >
        {title}
      </h2>
      
      {/* Contenido con estilo original */}
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-4"
        style={{ backgroundColor: contentColor }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#4d4725] mr-2" />
            <span className="text-[#4d4725] font-poppins">Cargando...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default SectionWrapper;