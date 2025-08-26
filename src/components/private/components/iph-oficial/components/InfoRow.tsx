/**
 * Componente InfoRow
 * Fila de información reutilizable para el IPH oficial
 */

import React from 'react';
import { Check, X, MapPin, Calendar } from 'lucide-react';

// Interfaces
import type { InfoRowProps } from '../../../../../interfaces/components/iphOficial.interface';

/**
 * Componente de fila de información
 * 
 * @param props - Props del componente
 * @returns JSX.Element de la fila
 */
const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  className = '',
  type = 'text'
}) => {
  /**
   * Formatea el valor según el tipo
   */
  const formatValue = (val: string | number | boolean | null | undefined) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-gray-400 italic">No disponible</span>;
    }

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            {val ? (
              <>
                <Check size={16} className="text-green-600" />
                <span className="text-green-700">Sí</span>
              </>
            ) : (
              <>
                <X size={16} className="text-red-600" />
                <span className="text-red-700">No</span>
              </>
            )}
          </div>
        );

      case 'date':
        try {
          const date = new Date(val as string);
          if (isNaN(date.getTime())) {
            return val;
          }
          return (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span>{date.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          );
        } catch {
          return val;
        }

      case 'coordinates':
        return (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            <span className="font-mono text-xs">{val}</span>
            <button
              onClick={() => {
                // TODO: Abrir en Google Maps
                const coords = String(val).match(/Lat:\s*([-\d.]+),\s*Long:\s*([-\d.]+)/);
                if (coords) {
                  const [, lat, lng] = coords;
                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                }
              }}
              className="
                text-xs text-blue-600 hover:text-blue-800 
                underline transition-colors
              "
              title="Abrir en Google Maps"
            >
              Ver en mapa
            </button>
          </div>
        );

      default:
        // Detectar si es una URL de imagen
        if (typeof val === 'string' && val.includes('/') && (val.includes('.jpg') || val.includes('.png') || val.includes('.jpeg'))) {
          return (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 cursor-pointer hover:text-blue-800" 
                    title="Click para ver imagen">
                📷 {val.split('/').pop()}
              </span>
              <button
                onClick={() => {
                  // TODO: Implementar modal de imagen
                  alert('Funcionalidad de vista previa pendiente de implementar');
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Ver
              </button>
            </div>
          );
        }
        
        return <span className="break-words">{String(val)}</span>;
    }
  };

  return (
    <div className={`grid grid-cols-3 gap-2 py-1 ${className}`}>
      <span className="font-bold col-span-1 text-gray-800">
        {label}
      </span>
      <div className="col-span-2 text-gray-900">
        {formatValue(value)}
      </div>
    </div>
  );
};

export default InfoRow;