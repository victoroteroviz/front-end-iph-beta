/**
 * Sección PuestaDisposicionSection
 * Muestra información de puesta a disposición y autoridades
 */

import React from 'react';
import { Scale, Users, FileSignature } from 'lucide-react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { PuestaDisposicionProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de puesta a disposición
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const PuestaDisposicionSection: React.FC<PuestaDisposicionProps> = ({
  data,
  entregaRecepcion,
  loading = false,
  className = ''
}) => {
  const hasDisposicionData = data && data.length > 0;
  const hasEntregaData = entregaRecepcion;

  if (!hasDisposicionData && !hasEntregaData && !loading) {
    return (
      <InfoSection 
        title="PUESTA A DISPOSICIÓN" 
        className={className}
      >
        <div className="text-center py-8 text-gray-500">
          <Scale size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm">
            No hay información de puesta a disposición disponible.
          </p>
        </div>
      </InfoSection>
    );
  }

  return (
    <InfoSection 
      title="PUESTA A DISPOSICIÓN" 
      isLoading={loading}
      className={className}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
          <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* Información de entrega-recepción */}
          {hasEntregaData && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <FileSignature size={16} className="text-[#4d4725]" />
                <h4 className="font-bold text-gray-800">
                  Entrega-Recepción:
                </h4>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <InfoRow 
                  label="Fecha:" 
                  value={entregaRecepcion?.fecha} 
                  type="date"
                />
                <InfoRow 
                  label="Autoridad Receptora:" 
                  value={entregaRecepcion?.autoridad_receptora || 'N/A'} 
                />
                <InfoRow 
                  label="Nombre del Receptor:" 
                  value={entregaRecepcion?.nombre_receptor || 'N/A'} 
                />
                <InfoRow 
                  label="Cargo del Receptor:" 
                  value={entregaRecepcion?.cargo_receptor || 'N/A'} 
                />
                
                {entregaRecepcion?.observaciones && (
                  <div className="mt-3">
                    <div className="font-bold text-gray-800 mb-2">
                      Observaciones de Entrega:
                    </div>
                    <div className="bg-white p-3 rounded border text-gray-900">
                      {entregaRecepcion.observaciones}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Disposiciones oficiales */}
          {hasDisposicionData && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-[#4d4725]" />
                <h4 className="font-bold text-gray-800">
                  Disposiciones Oficiales:
                </h4>
              </div>

              <div className="space-y-6">
                {data?.map((disposicion, index) => (
                  <div key={disposicion.id || index} className="bg-gray-50 p-4 rounded border">
                    {/* Información de la disposición */}
                    <div className="mb-4">
                      <InfoRow 
                        label="Fecha:" 
                        value={disposicion.fecha} 
                        type="date"
                      />
                      <InfoRow 
                        label="No. Expediente:" 
                        value={disposicion.expediente || 'N/A'} 
                      />
                      <InfoRow 
                        label="Anexos:" 
                        value={disposicion.anexos || 'N/A'} 
                      />
                      <InfoRow 
                        label="Documentación:" 
                        value={disposicion.documentacion || 'N/A'} 
                      />
                    </div>

                    {/* Autoridad responsable */}
                    {disposicion.autoridad && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="font-bold text-center text-gray-800 mb-3">
                          AUTORIDADES QUE PARTICIPARON
                        </h5>
                        
                        <div className="bg-white p-3 rounded border">
                          <InfoRow 
                            label="Nombre:" 
                            value={disposicion.autoridad.nombre || 'N/A'} 
                          />
                          <InfoRow 
                            label="Cargo/Grado:" 
                            value={disposicion.autoridad.cargo_grado || 'N/A'} 
                          />
                          <InfoRow 
                            label="Adscripción:" 
                            value={disposicion.autoridad.adscripcion || 'N/A'} 
                          />
                          
                          {/* Información de firma */}
                          <InfoRow 
                            label="Firma:" 
                            value={disposicion.autoridad.firma || 'Sin firma digital'} 
                          />
                          
                          {disposicion.autoridad.fecha_firma && (
                            <InfoRow 
                              label="Fecha de Firma:" 
                              value={disposicion.autoridad.fecha_firma} 
                              type="date"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Separador entre disposiciones */}
                    {index < (data?.length || 0) - 1 && (
                      <div className="mt-6 border-b border-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Nota informativa */}
          <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> La información de puesta a disposición es proporcionada 
              por las autoridades competentes. Las firmas digitales están sujetas a validación.
            </p>
          </div>
        </>
      )}
    </InfoSection>
  );
};

export default PuestaDisposicionSection;