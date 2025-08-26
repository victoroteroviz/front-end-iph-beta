/**
 * Sección LugarIntervencionSection
 * Muestra información del lugar de intervención
 */

import React from 'react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { LugarIntervencionProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de lugar de intervención
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const LugarIntervencionSection: React.FC<LugarIntervencionProps> = ({
  data,
  latitud,
  longitud,
  loading = false,
  className = ''
}) => {
  // Construir coordenadas desde los campos individuales si no están en data
  const coordenadas = data?.coordenadas || 
    (latitud && longitud ? `Lat: ${latitud}, Long: ${longitud}` : null);

  if (!data && !coordenadas && !loading) {
    return (
      <InfoSection 
        title="LUGAR DE INTERVENCIÓN" 
        className={className}
      >
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">
            No hay información disponible sobre el lugar de intervención.
          </p>
        </div>
      </InfoSection>
    );
  }

  return (
    <InfoSection 
      title="LUGAR DE INTERVENCIÓN" 
      isLoading={loading}
      className={className}
    >
      {/* Información de ubicación */}
      <InfoRow 
        label="Calle/Tramo:" 
        value={data?.calle || 'N/A'} 
      />
      <InfoRow 
        label="Número Exterior:" 
        value={data?.numero_exterior || 'N/A'} 
      />
      <InfoRow 
        label="Número Interior:" 
        value={data?.numero_interior || 'Sin número interior'} 
      />
      <InfoRow 
        label="Código Postal:" 
        value={data?.codigo_postal || 'N/A'} 
      />
      <InfoRow 
        label="Colonia/Localidad:" 
        value={data?.colonia || 'N/A'} 
      />
      <InfoRow 
        label="Municipio:" 
        value={data?.municipio || 'N/A'} 
      />
      <InfoRow 
        label="Estado:" 
        value={data?.estado || 'N/A'} 
      />
      
      {/* Coordenadas con funcionalidad de mapa */}
      {coordenadas && (
        <InfoRow 
          label="Coordenadas:" 
          value={coordenadas} 
          type="coordinates"
        />
      )}

      {/* Referencias */}
      {data?.referencias && (
        <div className="mt-4">
          <div className="font-bold text-gray-800 mb-2">
            Referencias:
          </div>
          <div className="bg-gray-50 p-3 rounded border text-gray-900">
            {data.referencias}
          </div>
        </div>
      )}

      {/* Información de inspección */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3">Inspección del Lugar:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <InfoRow 
            label="Se realizó inspección:" 
            value={data?.inspeccion} 
            type="boolean"
          />
          <InfoRow 
            label="Se encontraron objetos:" 
            value={data?.objetos_encontrados} 
            type="boolean"
          />
          <InfoRow 
            label="Se preservó el lugar:" 
            value={data?.lugar_preservado} 
            type="boolean"
          />
          <InfoRow 
            label="Se priorizó el lugar:" 
            value={data?.lugar_priorizado} 
            type="boolean"
          />
        </div>
      </div>

      {/* Información de riesgos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3">Evaluación de Riesgos:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <InfoRow 
            label="Riesgo natural:" 
            value={data?.riesgo_natural} 
            type="boolean"
          />
          <InfoRow 
            label="Riesgo social:" 
            value={data?.riesgo_social} 
            type="boolean"
          />
        </div>

        {/* Especificación de riesgo */}
        {data?.especificacion_riesgo && (
          <div className="mt-3">
            <div className="font-bold text-gray-800 mb-2">
              Especificación de riesgo:
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <p className="text-yellow-800">{data.especificacion_riesgo}</p>
            </div>
          </div>
        )}
      </div>
    </InfoSection>
  );
};

export default LugarIntervencionSection;