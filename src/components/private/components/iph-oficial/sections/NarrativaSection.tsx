/**
 * Sección NarrativaSection
 * Muestra la narrativa de los hechos
 */

import React from 'react';
import { FileText, User, Clock } from 'lucide-react';

// Componentes
import InfoSection from '../components/InfoSection';
import InfoRow from '../components/InfoRow';

// Interfaces
import type { NarrativaSectionProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de narrativa de hechos
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la sección
 */
const NarrativaSection: React.FC<NarrativaSectionProps> = ({
  data,
  hechos,
  loading = false,
  className = ''
}) => {
  // Usar la narrativa estructurada o el campo hechos del servidor principal
  const narrativaTexto = data?.descripcion || hechos;
  
  if (!narrativaTexto && !loading) {
    return (
      <InfoSection 
        title="NARRATIVA DE LOS HECHOS" 
        className={className}
      >
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm">
            No hay narrativa de los hechos disponible.
          </p>
        </div>
      </InfoSection>
    );
  }

  return (
    <InfoSection 
      title="NARRATIVA DE LOS HECHOS" 
      isLoading={loading}
      className={className}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* Información de la narrativa estructurada */}
          {data && (
            <div className="mb-4 space-y-2">
              {data.fecha_elaboracion && (
                <InfoRow 
                  label="Fecha de elaboración:" 
                  value={data.fecha_elaboracion} 
                  type="date" 
                />
              )}
              {data.elaborado_por && (
                <InfoRow 
                  label="Elaborado por:" 
                  value={data.elaborado_por} 
                />
              )}
            </div>
          )}

          {/* Narrativa principal */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#4d4725]" />
              <h4 className="font-bold text-gray-800">
                Descripción de los Hechos:
              </h4>
            </div>
            
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <p className="text-gray-900 text-justify leading-relaxed whitespace-pre-wrap">
                {narrativaTexto}
              </p>
            </div>
          </div>

          {/* Información adicional si viene de datos estructurados */}
          {data && (data.fecha_elaboracion || data.elaborado_por) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {data.elaborado_por && (
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>Elaborado por: {data.elaborado_por}</span>
                  </div>
                )}
                {data.fecha_elaboracion && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {new Date(data.fecha_elaboracion).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nota sobre fuente de datos */}
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-xs text-blue-700">
              <strong>Fuente:</strong> {data ? 'Narrativa estructurada' : 'Campo hechos del servidor principal'}
            </p>
          </div>
        </>
      )}
    </InfoSection>
  );
};

export default NarrativaSection;