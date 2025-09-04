/**
 * Componente DummySection
 * Componente temporal para mostrar secciones mientras se implementan
 * Mantiene el diseño original con datos de ejemplo
 */

import React from 'react';
import { Info, Database } from 'lucide-react';

// =====================================================
// INTERFACES
// =====================================================

interface DummySectionProps {
  sectionName: string;
  data?: any;
  className?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const DummySection: React.FC<DummySectionProps> = ({
  sectionName,
  data,
  className = ''
}) => {
  
  const hasData = data && (
    (Array.isArray(data) && data.length > 0) ||
    (typeof data === 'object' && Object.keys(data).length > 0) ||
    (typeof data === 'string' && data.trim().length > 0)
  );

  const getDataPreview = () => {
    if (!hasData) return null;
    
    try {
      if (typeof data === 'string') {
        return data.length > 200 ? `${data.substring(0, 200)}...` : data;
      }
      
      if (Array.isArray(data)) {
        return `Array con ${data.length} elemento(s)`;
      }
      
      if (typeof data === 'object') {
        const keys = Object.keys(data);
        return `Objeto con ${keys.length} campo(s): ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
      }
      
      return String(data);
    } catch (error) {
      return 'Error al mostrar datos';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      
      {/* Header */}
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md mb-4"
        style={{ backgroundColor: '#c2b186' }}
      >
        {sectionName}
      </h2>
      
      {/* Contenido */}
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Mensaje principal */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <Info className="h-16 w-16 mx-auto text-[#c2b186]" />
          </div>
          <h3 className="text-xl font-bold text-[#4d4725] font-poppins mb-2">
            Hola, soy el componente {sectionName}
          </h3>
          <p className="text-gray-600 font-poppins">
            Este es un componente temporal que será reemplazado por la implementación real
          </p>
        </div>

        {/* Estado de datos */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-5 w-5 text-[#4d4725]" />
            <h4 className="font-semibold text-[#4d4725] font-poppins">Estado de los datos:</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 font-poppins">
                <span className="font-medium">Estado:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs ${
                  hasData 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {hasData ? 'Con datos' : 'Sin datos'}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 font-poppins">
                <span className="font-medium">Tipo:</span> {typeof data}
              </p>
            </div>
          </div>

          {/* Preview de datos */}
          {hasData && (
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-500 font-poppins mb-2">Preview de datos:</p>
              <p className="text-sm text-gray-700 font-mono break-words">
                {getDataPreview()}
              </p>
            </div>
          )}
        </div>

        {/* Información técnica */}
        <div className="text-xs text-gray-500 font-poppins border-t pt-4">
          <p>🔧 <strong>Para desarrolladores:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Implementar diseño específico para {sectionName}</li>
            <li>Procesar datos de tipo: {typeof data}</li>
            <li>Mantener estilos: #c2b186 (header) y #fdf7f1 (fondo)</li>
            <li>Responsive design mobile-first</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DummySection;