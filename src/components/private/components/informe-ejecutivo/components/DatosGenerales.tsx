/**
 * Componente DatosGenerales
 * Muestra los datos básicos del IPH extraídos de I_IphData
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React from 'react';
import { Calendar, FileText, Image, Tag, Hash, CheckCircle } from 'lucide-react';
import type { I_IphData } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface DatosGeneralesProps {
  iph: I_IphData | I_IphData[] | null;
  className?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const DatosGenerales: React.FC<DatosGeneralesProps> = ({
  iph,
  className = ''
}) => {
  
  // Verificar si los datos están disponibles
  if (!iph || Array.isArray(iph)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Datos Generales IPH
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos del informe</p>
          </div>
        </div>
      </div>
    );
  }

  const iphData = iph as I_IphData;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Datos Generales IPH
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Grid principal de datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
          
          {/* Columna 1: Identificación */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">ID</p>
                <p className="font-semibold">{iphData.id || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Referencia</p>
                <p className="font-semibold">{iphData.nReferencia || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Folio Sistema</p>
                <p className="font-semibold">{iphData.nFolioSist || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Columna 2: Estado y Tipo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Estatus</p>
                <p className="font-semibold">{iphData.estatus || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo IPH</p>
                <p className="font-semibold">
                  {iphData.tipoIph?.nombre || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fecha de creación</p>
                <p className="font-semibold">
                  {iphData.fechaCreacion 
                    ? new Date(iphData.fechaCreacion).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Columna 3: Archivos y Recursos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Archivos</p>
                <p className="font-semibold">
                  {iphData.archivos?.length || 0} archivo(s)
                </p>
                {iphData.archivos && iphData.archivos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Documentos adjuntos disponibles
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fotos</p>
                <p className="font-semibold">
                  {iphData.fotos?.length || 0} foto(s)
                </p>
                {iphData.fotos && iphData.fotos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Evidencia fotográfica disponible
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional si está disponible */}
        {(iphData.hechos || iphData.observaciones) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              
              {/* Hechos */}
              {iphData.hechos && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4d4725] mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resumen de Hechos
                  </h4>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {iphData.hechos.length > 200 
                        ? `${iphData.hechos.substring(0, 200)}...` 
                        : iphData.hechos
                      }
                    </p>
                    {iphData.hechos.length > 200 && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Vista resumida - Ver sección completa en "Narrativa de hechos"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {iphData.observaciones && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4d4725] mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observaciones
                  </h4>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {iphData.observaciones.length > 200 
                        ? `${iphData.observaciones.substring(0, 200)}...` 
                        : iphData.observaciones
                      }
                    </p>
                    {iphData.observaciones.length > 200 && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Vista resumida - Ver sección completa en "Observaciones"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de ubicación si está disponible */}
        {iphData.coordenadas && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Información de Ubicación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Latitud</p>
                <p className="font-mono text-[#4d4725]">{iphData.coordenadas.latitud}</p>
              </div>
              <div>
                <p className="text-gray-600">Longitud</p>
                <p className="font-mono text-[#4d4725]">{iphData.coordenadas.longitud}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatosGenerales;