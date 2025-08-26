/**
 * Componente InfoSection
 * Sección reutilizable para mostrar información del IPH
 */

import React from 'react';

// Interfaces
import type { InfoSectionProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de sección de información
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  children,
  className = '',
  isLoading = false
}) => {
  return (
    <section className={`mb-6 ${className}`}>
      {/* Header de la sección */}
      <div className="bg-[#b8ab84] text-black font-bold px-4 py-2 rounded-t-md">
        <h2 className="text-sm uppercase tracking-wide">
          {title}
        </h2>
      </div>
      
      {/* Contenido de la sección */}
      <div className="bg-white shadow p-4 rounded-b-md">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 py-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse col-span-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm">
            {children}
          </div>
        )}
      </div>
    </section>
  );
};

export default InfoSection;