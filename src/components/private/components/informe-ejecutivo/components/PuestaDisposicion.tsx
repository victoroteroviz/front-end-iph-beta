/**
 * Componente PuestaDisposicion
 * Muestra la información del personal oficial que participó en la puesta a disposición
 * Incluye lista de oficiales, estadísticas y resumen organizacional
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React from 'react';
import { 
  Shield, 
  User, 
  Hash, 
  Users,
  Building2,
  Award,
  AlertCircle,
  Info
} from 'lucide-react';
import type { IPuestaDisposicion, IDisposicionOficial } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface PuestaDisposicionProps {
  puestaDisposicion: IPuestaDisposicion | IPuestaDisposicion[] | null;
  className?: string;
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Extrae todos los oficiales de las disposiciones
 */
const extraerOficiales = (puestaDisposicion: IPuestaDisposicion | IPuestaDisposicion[]): IDisposicionOficial[] => {
  const disposiciones = Array.isArray(puestaDisposicion) ? puestaDisposicion : [puestaDisposicion];
  const todosLosOficiales: IDisposicionOficial[] = [];
  
  disposiciones.forEach(disp => {
    if (disp.disposicionesOficiales) {
      if (Array.isArray(disp.disposicionesOficiales)) {
        todosLosOficiales.push(...disp.disposicionesOficiales);
      } else {
        todosLosOficiales.push(disp.disposicionesOficiales);
      }
    }
  });
  
  return todosLosOficiales;
};

/**
 * Calcula estadísticas de los oficiales
 */
const calcularEstadisticas = (oficiales: IDisposicionOficial[]) => {
  const adscripciones = new Set(oficiales.map(o => o.adscripcion).filter(Boolean));
  const rangos = new Set(oficiales.map(o => o.cargoGrado).filter(Boolean));
  
  return {
    totalOficiales: oficiales.length,
    adscripcionesDiferentes: adscripciones.size,
    rangosDiferentes: rangos.size,
    adscripciones: Array.from(adscripciones),
    rangos: Array.from(rangos)
  };
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const PuestaDisposicion: React.FC<PuestaDisposicionProps> = ({
  puestaDisposicion,
  className = ''
}) => {
  
  // Verificar si los datos están disponibles
  if (!puestaDisposicion || (Array.isArray(puestaDisposicion) && puestaDisposicion.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Puesta a Disposición
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos de puesta a disposición</p>
          </div>
        </div>
      </div>
    );
  }

  // Extraer oficiales y calcular estadísticas
  const oficiales = extraerOficiales(puestaDisposicion);
  const estadisticas = calcularEstadisticas(oficiales);

  // Si no hay oficiales, mostrar mensaje
  if (oficiales.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Puesta a Disposición
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron oficiales en los datos de puesta a disposición</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Puesta a Disposición
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Header con estadísticas */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Personal Oficial Participante
            <span className="text-sm font-normal text-gray-600">
              ({estadisticas.totalOficiales} oficial{estadisticas.totalOficiales !== 1 ? 'es' : ''})
            </span>
          </h3>
          
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-[#c2b186]" />
              </div>
              <p className="text-2xl font-bold text-[#4d4725]">
                {estadisticas.totalOficiales}
              </p>
              <p className="text-sm text-gray-600">
                Oficial{estadisticas.totalOficiales !== 1 ? 'es' : ''} Participantes
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20 text-center">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 text-[#c2b186]" />
              </div>
              <p className="text-2xl font-bold text-[#4d4725]">
                {estadisticas.adscripcionesDiferentes}
              </p>
              <p className="text-sm text-gray-600">
                Adscripciones Diferentes
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-[#c2b186]" />
              </div>
              <p className="text-2xl font-bold text-[#4d4725]">
                {estadisticas.rangosDiferentes}
              </p>
              <p className="text-sm text-gray-600">
                Rangos Diferentes
              </p>
            </div>
          </div>
        </div>

        {/* Lista de oficiales */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-[#4d4725] mb-4 flex items-center gap-2">
            <User className="h-4 w-4" />
            Lista Detallada de Oficiales
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oficiales.map((oficial, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-lg border border-[#c2b186]/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#c2b186] rounded-full flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-[#4d4725] text-sm mb-2 truncate">
                      {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                        .filter(Boolean)
                        .join(' ') || `Oficial ${index + 1}`
                      }
                    </h5>
                    
                    <div className="space-y-2">
                      {oficial.cargoGrado && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-[#c2b186] flex-shrink-0" />
                          <span className="text-xs text-gray-600 min-w-0">Cargo/Grado:</span>
                          <span className="px-2 py-1 bg-[#c2b186] text-white rounded-full text-xs font-medium truncate">
                            {oficial.cargoGrado}
                          </span>
                        </div>
                      )}
                      
                      {oficial.adscripcion && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-[#c2b186] flex-shrink-0" />
                          <span className="text-xs text-gray-600 min-w-0">Adscripción:</span>
                          <span className="text-xs text-gray-700 font-medium truncate">
                            {oficial.adscripcion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen organizacional */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-[#4d4725] mb-4 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Resumen Organizacional
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Adscripciones */}
            {estadisticas.adscripciones.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                <h5 className="font-medium text-[#4d4725] mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#c2b186]" />
                  Adscripciones Representadas
                </h5>
                <div className="space-y-2">
                  {estadisticas.adscripciones.map((adscripcion, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{adscripcion}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {oficiales.filter(o => o.adscripcion === adscripcion).length} oficial{oficiales.filter(o => o.adscripcion === adscripcion).length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rangos */}
            {estadisticas.rangos.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                <h5 className="font-medium text-[#4d4725] mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#c2b186]" />
                  Rangos Participantes
                </h5>
                <div className="space-y-2">
                  {estadisticas.rangos.map((rango, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{rango}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {oficiales.filter(o => o.cargoGrado === rango).length} oficial{oficiales.filter(o => o.cargoGrado === rango).length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Información de Puesta a Disposición
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • Esta sección registra el personal oficial que participó en el proceso de puesta a disposición.
                </p>
                <p>
                  • Se documentan un total de {estadisticas.totalOficiales} oficial{estadisticas.totalOficiales !== 1 ? 'es' : ''} de {estadisticas.adscripcionesDiferentes} dependencia{estadisticas.adscripcionesDiferentes !== 1 ? 's' : ''} diferentes.
                </p>
                <p>
                  • La participación incluye {estadisticas.rangosDiferentes} rango{estadisticas.rangosDiferentes !== 1 ? 's' : ''} jerárquico{estadisticas.rangosDiferentes !== 1 ? 's' : ''} distintos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuestaDisposicion;