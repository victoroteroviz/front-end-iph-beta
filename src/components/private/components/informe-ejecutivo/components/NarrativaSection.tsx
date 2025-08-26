/**
 * Componente NarrativaSection
 * Sección para mostrar la narrativa de hechos del informe
 */

import React from 'react';
import { BookOpen, User, Calendar } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { INarrativaSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const NarrativaSection: React.FC<INarrativaSectionProps> = ({
  narrativa,
  loading = false,
  className = ''
}) => {
  if (!narrativa?.contenido) {
    return (
      <SectionWrapper
        title="Narrativa"
        loading={loading}
        className={className}
      >
        <div className="flex items-center justify-center py-8 text-gray-500">
          <BookOpen className="h-8 w-8 mr-3" />
          <span className="font-poppins">No hay narrativa de hechos disponible</span>
        </div>
      </SectionWrapper>
    );
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No disponible';
    
    try {
      return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <SectionWrapper
      title="Narrativa"
      loading={loading}
      className={className}
    >
      <div className="space-y-4 text-[#4d4725] font-poppins">
        
        {/* Contenido principal */}
        <div className="prose prose-sm max-w-none">
          <p className="text-justify leading-relaxed whitespace-pre-wrap">
            {narrativa.contenido}
          </p>
        </div>

        {/* Metadatos de la narrativa */}
        {(narrativa.autor || narrativa.fecha_creacion || narrativa.fecha_modificacion) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-sm mb-3 text-gray-600">
              Información de la Narrativa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Autor */}
              {narrativa.autor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    <span className="font-medium">Autor:</span> {narrativa.autor}
                  </span>
                </div>
              )}

              {/* Fechas */}
              <div className="space-y-1">
                {narrativa.fecha_creacion && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      <span className="font-medium">Creada:</span> {formatDate(narrativa.fecha_creacion)}
                    </span>
                  </div>
                )}
                {narrativa.fecha_modificacion && (
                  <div className="flex items-center gap-2 ml-6">
                    <span>
                      <span className="font-medium">Modificada:</span> {formatDate(narrativa.fecha_modificacion)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Indicador de longitud del contenido */}
        <div className="mt-4 text-xs text-gray-500 text-right">
          {narrativa.contenido.length} caracteres | {narrativa.contenido.split(/\s+/).length} palabras
        </div>
      </div>
    </SectionWrapper>
  );
};

export default NarrativaSection;