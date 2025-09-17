/**
 * Componente PrimerRespondiente
 * Muestra la información del primer respondiente del IPH
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React from 'react';
import { 
  User, 
  Shield, 
  Building, 
  GraduationCap, 
  Car, 
  Users,
  FileText 
} from 'lucide-react';
import type { IPrimerRespondiente } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface PrimerRespondienteProps {
  primerRespondiente: IPrimerRespondiente | IPrimerRespondiente[] | null;
  className?: string;
  title?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const PrimerRespondiente: React.FC<PrimerRespondienteProps> = ({
  primerRespondiente,
  className = '',
  title = 'Primer Respondiente'
}) => {
  
  // Verificar si los datos están disponibles
  if (!primerRespondiente || Array.isArray(primerRespondiente)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          {title}
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos del primer respondiente</p>
          </div>
        </div>
      </div>
    );
  }

  const respondiente = primerRespondiente as IPrimerRespondiente;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        {title}
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Información personal */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Información Personal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Nombre completo */}
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Nombre completo</p>
                <p className="font-semibold">
                  {[respondiente.nombre, respondiente.primerApellido, respondiente.segundoApellido]
                    .filter(Boolean)
                    .join(' ') || 'No disponible'
                  }
                </p>
              </div>
            </div>

            {/* Nombre */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">{respondiente.nombre || 'No disponible'}</p>
              </div>
            </div>

            {/* Primer apellido */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Primer apellido</p>
                <p className="font-semibold">{respondiente.primerApellido || 'No disponible'}</p>
              </div>
            </div>

            {/* Segundo apellido */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Segundo apellido</p>
                <p className="font-semibold">{respondiente.segundoApellido || 'No disponible'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información institucional */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Información Institucional
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#4d4725] font-poppins">
            
            {/* Institución */}
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Institución</p>
                <p className="font-semibold">{respondiente.institucion || 'No disponible'}</p>
              </div>
            </div>

            {/* Grado/Cargo */}
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Grado/Cargo</p>
                <p className="font-semibold">{respondiente.gradoCargo || 'No disponible'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información operativa */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            Información Operativa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#4d4725] font-poppins">
            
            {/* Unidad de arribo */}
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Unidad de arribo</p>
                <p className="font-semibold">{respondiente.unidadArribo || 'No disponible'}</p>
              </div>
            </div>

            {/* Número de elementos */}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número de elementos</p>
                <p className="font-semibold">
                  {respondiente.nElementos !== undefined && respondiente.nElementos !== null 
                    ? `${respondiente.nElementos} elemento${respondiente.nElementos !== 1 ? 's' : ''}`
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional si todos los datos están presentes */}
        {(respondiente.nombre && respondiente.institucion && respondiente.unidadArribo) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Resumen del Primer Respondiente
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <span className="font-medium">Responsable:</span>{' '}
                  {[respondiente.nombre, respondiente.primerApellido, respondiente.segundoApellido]
                    .filter(Boolean)
                    .join(' ')
                  }
                </p>
                {respondiente.gradoCargo && (
                  <p>
                    <span className="font-medium">Cargo:</span> {respondiente.gradoCargo}
                  </p>
                )}
                <p>
                  <span className="font-medium">Institución:</span> {respondiente.institucion}
                </p>
                {respondiente.unidadArribo && (
                  <p>
                    <span className="font-medium">Unidad:</span> {respondiente.unidadArribo}
                    {respondiente.nElementos && ` con ${respondiente.nElementos} elementos`}
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

export default PrimerRespondiente;