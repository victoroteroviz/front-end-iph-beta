/**
 * Componente EntregaRecepcionSection
 * Sección para mostrar información de entrega y recepción
 */

import React from 'react';
import { Users, Calendar, Building, FileText } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IEntregaRecepcionSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const EntregaRecepcionSection: React.FC<IEntregaRecepcionSectionProps> = ({
  entregaRecepcion,
  loading = false,
  className = ''
}) => {
  if (!entregaRecepcion) {
    return (
      <SectionWrapper
        title="Entrega y Recepción"
        loading={loading}
        className={className}
      >
        <div className="flex items-center justify-center py-8 text-gray-500">
          <Users className="h-8 w-8 mr-3" />
          <span className="font-poppins">No hay información de entrega y recepción disponible</span>
        </div>
      </SectionWrapper>
    );
  }

  const formatPersonName = (): string => {
    const parts = [
      entregaRecepcion.nombre_recepcion,
      entregaRecepcion.primer_apellido_recepcion,
      entregaRecepcion.segundo_apellido_recepcion
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'No especificado';
  };

  const formatDateTime = (): string => {
    if (!entregaRecepcion.fecha_entrega_recepcion) return 'No especificada';
    
    try {
      const date = new Date(entregaRecepcion.fecha_entrega_recepcion);
      const dateStr = date.toLocaleDateString('es-MX');
      const timeStr = entregaRecepcion.hora_entrega || date.toLocaleTimeString('es-MX');
      return `${dateStr} ${timeStr}`;
    } catch {
      return entregaRecepcion.fecha_entrega_recepcion;
    }
  };

  return (
    <SectionWrapper
      title="Entrega y Recepción"
      loading={loading}
      className={className}
    >
      <div className="space-y-4 text-[#4d4725] font-poppins">
        
        {/* Información principal usando el formato original */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Explicación:</span>{' '}
            {entregaRecepcion.explicacion || 'No especificada'}
          </p>
          <p>
            <span className="font-semibold">Tipo de Apoyo:</span>{' '}
            {entregaRecepcion.tipo_apoyo_solicitado || 'No especificado'}
          </p>
          <p>
            <span className="font-semibold">Motivo Ingreso:</span>{' '}
            {entregaRecepcion.motivo_ingreso || 'No especificado'}
          </p>
          <p>
            <span className="font-semibold">Recibido por:</span>{' '}
            {formatPersonName()}
          </p>
          <p>
            <span className="font-semibold">Fecha de entrega:</span>{' '}
            {formatDateTime()}
          </p>
        </div>

        {/* Información adicional organizada */}
        {(entregaRecepcion.cargo_recepcion || entregaRecepcion.institucion_recepcion || entregaRecepcion.observaciones) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detalles Adicionales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del receptor */}
              {(entregaRecepcion.cargo_recepcion || entregaRecepcion.institucion_recepcion) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-xs uppercase text-gray-600 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Receptor
                  </h4>
                  {entregaRecepcion.cargo_recepcion && (
                    <p className="text-sm">
                      <span className="font-medium">Cargo:</span> {entregaRecepcion.cargo_recepcion}
                    </p>
                  )}
                  {entregaRecepcion.institucion_recepcion && (
                    <p className="text-sm flex items-start gap-1">
                      <Building className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">Institución:</span> {entregaRecepcion.institucion_recepcion}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Fecha detallada */}
              <div className="space-y-2">
                <h4 className="font-medium text-xs uppercase text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha y Hora
                </h4>
                <p className="text-sm">{formatDateTime()}</p>
              </div>
            </div>

            {/* Observaciones */}
            {entregaRecepcion.observaciones && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Observaciones:</h4>
                <p className="text-sm italic">{entregaRecepcion.observaciones}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default EntregaRecepcionSection;