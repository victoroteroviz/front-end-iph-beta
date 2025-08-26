/**
 * Componente LugarIntervencionSection
 * Sección para mostrar detalles del lugar de intervención
 */

import React from 'react';
import { MapPin, Home, Building } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { ILugarIntervencionSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const LugarIntervencionSection: React.FC<ILugarIntervencionSectionProps> = ({
  lugar,
  loading = false,
  className = ''
}) => {
  if (!lugar) {
    return (
      <SectionWrapper
        title="Lugar de Intervención"
        loading={loading}
        className={className}
      >
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Building className="h-8 w-8 mr-3" />
          <span className="font-poppins">No hay información del lugar de intervención disponible</span>
        </div>
      </SectionWrapper>
    );
  }

  const formatAddress = (): string => {
    const parts = [lugar.calle_tramo];
    if (lugar.n_exterior) parts.push(`#${lugar.n_exterior}`);
    if (lugar.n_interior) parts.push(`Int. ${lugar.n_interior}`);
    return parts.join(' ');
  };

  const formatReferences = (): string => {
    const refs = [lugar.referencia1, lugar.referencia2].filter(Boolean);
    return refs.length > 0 ? refs.join(', ') : 'No especificadas';
  };

  return (
    <SectionWrapper
      title="Lugar de Intervención"
      loading={loading}
      className={className}
    >
      <div className="space-y-4 text-[#4d4725] font-poppins">
        
        {/* Dirección principal */}
        <div className="flex items-start gap-3">
          <Home className="h-5 w-5 text-[#4d4725] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Dirección</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-semibold">Calle:</span> {formatAddress()}</p>
              <p><span className="font-semibold">Colonia:</span> {lugar.col_localidad}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><span className="font-semibold">Municipio:</span> {lugar.municipio}</p>
                <p><span className="font-semibold">Estado:</span> {lugar.entidad_federativa}</p>
              </div>
              {lugar.codigo_postal && (
                <p><span className="font-semibold">Código Postal:</span> {lugar.codigo_postal}</p>
              )}
            </div>
          </div>
        </div>

        {/* Referencias */}
        <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
          <MapPin className="h-5 w-5 text-[#4d4725] mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Referencias</h3>
            <p className="text-sm">{formatReferences()}</p>
            {lugar.entre_calles && (
              <p className="text-sm mt-1">
                <span className="font-semibold">Entre calles:</span> {lugar.entre_calles}
              </p>
            )}
          </div>
        </div>

        {/* Información completa en formato de lista */}
        <div className="bg-gray-50 rounded-lg p-3 mt-4">
          <h4 className="font-semibold text-xs uppercase text-gray-600 mb-2">
            Dirección Completa
          </h4>
          <p className="text-sm italic">
            {formatAddress()}, {lugar.col_localidad}, {lugar.municipio}, {lugar.entidad_federativa}
            {lugar.codigo_postal && ` CP ${lugar.codigo_postal}`}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default LugarIntervencionSection;