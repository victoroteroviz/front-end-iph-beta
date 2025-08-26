/**
 * Componente InformeHeader
 * Header del informe ejecutivo con información básica
 * Mantiene diseño original
 */

import React from 'react';
import SectionWrapper from './SectionWrapper';
import type { IInformeHeaderProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

const InformeHeader: React.FC<IInformeHeaderProps> = ({
  informe,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <SectionWrapper
        title="Informe Ejecutivo"
        loading={true}
        className={className}
      />
    );
  }

  if (!informe) {
    return (
      <SectionWrapper
        title="Informe Ejecutivo"
        className={className}
      >
        <div className="text-center text-[#4d4725] py-4 font-poppins">
          No se encontraron datos del informe
        </div>
      </SectionWrapper>
    );
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <SectionWrapper
      title="Informe Ejecutivo"
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#4d4725] font-poppins">
        
        {/* Columna izquierda */}
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Referencia:</span> {informe.n_referencia}
          </p>
          <p>
            <span className="font-semibold">Folio:</span> {informe.n_folio_sist}
          </p>
          <p>
            <span className="font-semibold">Tipo:</span> {informe.tipo?.nombre || 'No especificado'}
          </p>
        </div>

        {/* Columna derecha */}
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Estatus:</span>{' '}
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: informe.estatus?.color || '#e5e7eb',
                color: '#374151'
              }}
            >
              {informe.estatus?.nombre || 'No especificado'}
            </span>
          </p>
          <p>
            <span className="font-semibold">Fecha de creación:</span>{' '}
            {formatDate(informe.fecha_creacion)}
          </p>
          <p>
            <span className="font-semibold">Fecha de subida:</span>{' '}
            {formatDate(informe.fecha_subida)}
          </p>
        </div>
      </div>

      {/* Información adicional si está disponible */}
      {(informe.fecha_modificacion || informe.version) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-poppins">
            {informe.fecha_modificacion && (
              <p>
                <span className="font-medium">Última modificación:</span>{' '}
                {formatDate(informe.fecha_modificacion)}
              </p>
            )}
            {informe.version && (
              <p>
                <span className="font-medium">Versión:</span> {informe.version}
              </p>
            )}
            {informe.es_borrador && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                Borrador
              </span>
            )}
          </div>
        </div>
      )}
    </SectionWrapper>
  );
};

export default InformeHeader;