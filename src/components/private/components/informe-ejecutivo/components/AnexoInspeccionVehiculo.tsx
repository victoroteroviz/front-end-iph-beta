/**
 * Componente AnexoInspeccionVehiculo (Anexo C. Inspección de vehículo)
 * Muestra la información detallada de la inspección vehicular realizada
 * Incluye datos del vehículo, objetos encontrados y personal participante
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  Car, 
  Settings,
  Package,
  User,
  Users,
  CheckCircle,
  XCircle,
  FileText,
  Hash,
  MapPin,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Info,
  Palette,
  Calendar,
  Shield
} from 'lucide-react';
import type { I_InspeccionVehiculo, IDisposicionOficial } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoInspeccionVehiculoProps {
  inspeccionVehiculo: I_InspeccionVehiculo | I_InspeccionVehiculo[] | null;
  className?: string;
  title?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_OBSERVACIONES = 500;

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Componente para mostrar un campo booleano con íconos
 */
const CampoBooleano: React.FC<{ 
  label: string; 
  valor: boolean | undefined; 
  className?: string;
}> = ({ 
  label, 
  valor, 
  className = ''
}) => (
  <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20 ${className}`}>
    {valor ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-gray-500" />
    )}
    <div>
      <p className="text-sm font-medium text-[#4d4725]">{label}</p>
      <p className={`text-xs ${valor ? 'text-green-600' : 'text-gray-500'}`}>
        {valor ? 'Sí encontrado' : 'No encontrado'}
      </p>
    </div>
  </div>
);

/**
 * Componente para texto expandible
 */
const TextoExpandible: React.FC<{ 
  titulo: string; 
  contenido: string; 
  limite: number;
  icono: React.ElementType;
}> = ({ 
  titulo, 
  contenido, 
  limite,
  icono: IconComponent
}) => {
  const [expandido, setExpandido] = useState(false);
  const necesitaExpandir = contenido.length > limite;
  const contenidoAMostrar = expandido ? contenido : contenido.substring(0, limite);

  return (
    <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
      <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        {titulo}
        <span className="text-xs text-gray-500 ml-auto">
          {contenido.length} caracteres
        </span>
      </h4>
      
      <div className="prose prose-sm max-w-none">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {contenidoAMostrar}
          {necesitaExpandir && !expandido && (
            <span className="text-gray-400 italic">...</span>
          )}
        </p>
      </div>
      
      {necesitaExpandir && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <button
            onClick={() => setExpandido(!expandido)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c2b186] text-white rounded-lg hover:bg-[#a89770] transition-colors duration-200 font-medium text-sm"
          >
            {expandido ? (
              <>
                <EyeOff className="h-4 w-4" />
                Ver menos
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Ver completo
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
          
          <div className="mt-2 text-xs text-gray-500">
            {expandido ? (
              `Mostrando texto completo (${contenido.length} caracteres)`
            ) : (
              `Mostrando vista previa (${Math.min(limite, contenido.length)} de ${contenido.length} caracteres)`
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AnexoInspeccionVehiculo: React.FC<AnexoInspeccionVehiculoProps> = ({
  inspeccionVehiculo,
  className = '',
  title = 'Anexo C. Inspección de vehículo'
}) => {
  // Estado para manejar múltiples vehículos
  const [vehiculoActivo, setVehiculoActivo] = useState(0);
  
  // Verificar si los datos están disponibles
  if (!inspeccionVehiculo || (Array.isArray(inspeccionVehiculo) && inspeccionVehiculo.length === 0)) {
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
            <Car className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registró inspección de vehículo en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Convertir a array si es objeto único
  const vehiculos = Array.isArray(inspeccionVehiculo) ? inspeccionVehiculo : [inspeccionVehiculo];
  const vehiculo = vehiculos[vehiculoActivo];

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        {title}
        {vehiculos.length > 1 && (
          <span className="ml-2 text-xs opacity-90">
            ({vehiculoActivo + 1} de {vehiculos.length})
          </span>
        )}
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Navegación entre vehículos si hay múltiples */}
        {vehiculos.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#c2b186]/20">
            <button
              onClick={() => setVehiculoActivo(Math.max(0, vehiculoActivo - 1))}
              disabled={vehiculoActivo === 0}
              className={`p-2 rounded-lg transition-colors ${
                vehiculoActivo === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-[#4d4725]">
                Vehículo {vehiculoActivo + 1} de {vehiculos.length}
              </p>
              <p className="text-xs text-gray-600">
                {vehiculo.placa ? `Placa: ${vehiculo.placa}` : 'Sin placa registrada'} | {vehiculo.marca || 'Marca no especificada'}
              </p>
            </div>
            
            <button
              onClick={() => setVehiculoActivo(Math.min(vehiculos.length - 1, vehiculoActivo + 1))}
              disabled={vehiculoActivo === vehiculos.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                vehiculoActivo === vehiculos.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sección 1: Información del Vehículo */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            Información del Vehículo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Tipo y procedencia */}
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo de vehículo</p>
                <p className="font-semibold">{vehiculo.tipoVehiculo || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Procedencia</p>
                <p className="font-semibold">{vehiculo.procedencia || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo de uso</p>
                <p className="font-semibold">{vehiculo.tipoUso || 'No especificado'}</p>
              </div>
            </div>

            {/* Marca y modelo */}
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Marca</p>
                <p className="font-semibold">{vehiculo.marca || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Submarca</p>
                <p className="font-semibold">{vehiculo.submarca || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Modelo</p>
                <p className="font-semibold">{vehiculo.modelo || 'No especificado'}</p>
              </div>
            </div>

            {/* Color y placas */}
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Color</p>
                <p className="font-semibold">{vehiculo.color || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Placa</p>
                <p className="font-semibold font-mono">{vehiculo.placa || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número de serie</p>
                <p className="font-semibold font-mono">{vehiculo.numeroSerie || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Resumen del vehículo si hay datos principales */}
          {(vehiculo.marca || vehiculo.modelo || vehiculo.color) && (
            <div className="mt-6 bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-2 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Resumen del Vehículo
              </h4>
              <p className="text-sm text-gray-700">
                {[vehiculo.marca, vehiculo.submarca, vehiculo.modelo, vehiculo.color]
                  .filter(Boolean)
                  .join(' ')} 
                {vehiculo.placa && ` - Placa: ${vehiculo.placa}`}
                {vehiculo.tipoVehiculo && ` (${vehiculo.tipoVehiculo})`}
              </p>
            </div>
          )}
        </div>

        {/* Sección 2: Resultados de la Inspección */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            Resultados de la Inspección
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Estado de objetos encontrados */}
            <CampoBooleano 
              label="Objetos Encontrados" 
              valor={vehiculo.objetoEncontrado}
            />

            {/* Destino si hay */}
            {vehiculo.destino && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Destino</p>
                  <p className="font-semibold text-[#4d4725]">{vehiculo.destino}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección 3: Observaciones */}
        {vehiculo.observaciones && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Observaciones de la Inspección
            </h3>
            
            <TextoExpandible
              titulo="Observaciones Detalladas"
              contenido={vehiculo.observaciones}
              limite={LIMITE_CARACTERES_OBSERVACIONES}
              icono={FileText}
            />
          </div>
        )}

        {/* Sección 4: Personal Participante */}
        {vehiculo.disposiciones && vehiculo.disposiciones.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Personal Participante
              <span className="text-sm font-normal text-gray-600">
                ({vehiculo.disposiciones.length} oficial{vehiculo.disposiciones.length !== 1 ? 'es' : ''})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehiculo.disposiciones.map((oficial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg border border-[#c2b186]/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#c2b186] rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm mb-1">
                        {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                          .filter(Boolean)
                          .join(' ') || `Oficial ${index + 1}`
                        }
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-700">
                        {oficial.cargoGrado && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-[#c2b186]" />
                            <span className="font-medium">Cargo/Grado:</span>
                            <span className="px-2 py-0.5 bg-[#c2b186] text-white rounded-full text-xs">
                              {oficial.cargoGrado}
                            </span>
                          </div>
                        )}
                        
                        {oficial.adscripcion && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-[#c2b186]" />
                            <span className="font-medium">Adscripción:</span>
                            <span>{oficial.adscripcion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Información de la Inspección
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • Este anexo documenta la inspección vehicular realizada durante la intervención.
                </p>
                <p>
                  • Se registran las características del vehículo y objetos encontrados.
                </p>
                <p>
                  • Información recopilada según protocolos de inspección vehicular.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnexoInspeccionVehiculo;