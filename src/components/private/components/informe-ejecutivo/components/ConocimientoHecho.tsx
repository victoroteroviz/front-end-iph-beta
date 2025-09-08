/**
 * Componente ConocimientoHecho
 * Muestra la información del conocimiento del hecho del IPH
 * Incluye número de conocimiento, documentación, fechas y tipo
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React from 'react';
import { 
  FileText, 
  Hash, 
  Calendar, 
  Clock, 
  Tag,
  AlertCircle,
  Info
} from 'lucide-react';
import type { IConocimientoHecho } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface ConocimientoHechoProps {
  conocimientoHecho: IConocimientoHecho | IConocimientoHecho[] | null;
  className?: string;
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Formatea una fecha ISO string a formato legible en español
 */
const formatearFecha = (fechaISO: string | undefined): string => {
  if (!fechaISO) return 'No disponible';
  
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Calcula la diferencia de tiempo entre dos fechas
 */
const calcularDiferenciaFechas = (fechaConocimiento: string | undefined, fechaArribo: string | undefined): string => {
  if (!fechaConocimiento || !fechaArribo) return 'No calculable';
  
  try {
    const conocimiento = new Date(fechaConocimiento);
    const arribo = new Date(fechaArribo);
    const diferencia = Math.abs(arribo.getTime() - conocimiento.getTime());
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    } else {
      return `${minutos} minutos`;
    }
  } catch (error) {
    return 'No calculable';
  }
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const ConocimientoHecho: React.FC<ConocimientoHechoProps> = ({
  conocimientoHecho,
  className = ''
}) => {
  
  // Verificar si los datos están disponibles y obtener el primer elemento si es array
  if (!conocimientoHecho || (Array.isArray(conocimientoHecho) && conocimientoHecho.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Conocimiento del Hecho
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos del conocimiento del hecho</p>
          </div>
        </div>
      </div>
    );
  }

  // Si es array, tomar el primer elemento; si no, usar el objeto directamente
  const conocimiento = Array.isArray(conocimientoHecho) ? conocimientoHecho[0] : conocimientoHecho;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Conocimiento del Hecho
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Sección 1: Información de identificación */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Información de Identificación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#4d4725] font-poppins">
            
            {/* Número de conocimiento */}
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número de conocimiento</p>
                <p className="font-semibold font-mono text-lg">
                  {conocimiento.nConocimiento || 'No disponible'}
                </p>
              </div>
            </div>

            {/* Documento de conocimiento */}
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Documento de conocimiento</p>
                <p className="font-semibold">
                  {conocimiento.docConocimiento || 'No disponible'}
                </p>
              </div>
            </div>

            {/* Tipo de conocimiento */}
            <div className="flex items-center gap-3 md:col-span-2">
              <Tag className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo de conocimiento</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-3 py-1 bg-[#c2b186] text-white text-sm font-medium rounded-full">
                    {conocimiento.tipoConocimiento || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Información temporal */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            Información Temporal
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[#4d4725] font-poppins">
            
            {/* Fecha de conocimiento */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-[#c2b186]" />
                <p className="text-sm font-medium text-gray-600">Fecha de conocimiento</p>
              </div>
              <p className="font-semibold text-[#4d4725]">
                {formatearFecha(conocimiento.fConocimiento)}
              </p>
            </div>

            {/* Fecha de arribo */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-[#c2b186]" />
                <p className="text-sm font-medium text-gray-600">Fecha de arribo</p>
              </div>
              <p className="font-semibold text-[#4d4725]">
                {formatearFecha(conocimiento.fArribo)}
              </p>
            </div>
          </div>

          {/* Cálculo de tiempo de respuesta si ambas fechas están disponibles */}
          {conocimiento.fConocimiento && conocimiento.fArribo && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Tiempo de respuesta</p>
                  <p className="text-sm text-blue-700">
                    Diferencia entre conocimiento y arribo: {' '}
                    <span className="font-semibold">
                      {calcularDiferenciaFechas(conocimiento.fConocimiento, conocimiento.fArribo)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de la información si todos los datos están presentes */}
        {(conocimiento.nConocimiento && conocimiento.docConocimiento && conocimiento.tipoConocimiento) && (
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumen del Conocimiento del Hecho
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">Expediente:</span> {conocimiento.nConocimiento}
                </p>
                <p>
                  <span className="font-medium">Documento base:</span> {conocimiento.docConocimiento}
                </p>
                <p>
                  <span className="font-medium">Tipo:</span> {conocimiento.tipoConocimiento}
                </p>
                {conocimiento.fConocimiento && (
                  <p>
                    <span className="font-medium">Registrado el:</span> {' '}
                    {formatearFecha(conocimiento.fConocimiento)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConocimientoHecho;