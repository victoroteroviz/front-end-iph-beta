/**
 * Componente AnexoEntrevistas (Anexo E. Entrevistas)
 * Muestra la información detallada de las entrevistas realizadas durante la intervención
 * Incluye datos del entrevistado, contenido de la entrevista, canalización y personal responsable
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  MessageCircle, 
  User,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Shield,
  Hash,
  Globe,
  Languages,
  Heart,
  Info,
  Clock,
  Home
} from 'lucide-react';
import type { IEntrevista, IDisposicionOficial } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoEntrevistasProps {
  entrevista: IEntrevista | IEntrevista[] | null;
  className?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_ENTREVISTA = 500;

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Formatea una fecha ISO string a formato legible en español
 */
const formatearFecha = (fechaISO: string | Date | undefined): string => {
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
 * Formatea solo la fecha sin hora
 */
const formatearSoloFecha = (fechaISO: string | Date | undefined): string => {
  if (!fechaISO) return 'No disponible';
  
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Componente para mostrar un campo booleano con íconos (casillas marcadas)
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
        {valor ? 'Sí' : 'No'}
      </p>
    </div>
  </div>
);

/**
 * Convierte string "SI"/"NO" a boolean para canalización
 */
const stringABoolean = (valor: string | undefined): boolean => {
  return valor === 'SI' || valor === 'Sí' || valor === 'si' || valor === 'sí';
};

/**
 * Componente para texto expandible preservando saltos de línea
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

const AnexoEntrevistas: React.FC<AnexoEntrevistasProps> = ({
  entrevista,
  className = ''
}) => {
  // Estado para manejar múltiples entrevistas
  const [entrevistaActiva, setEntrevistaActiva] = useState(0);
  
  // Verificar si los datos están disponibles
  if (!entrevista || (Array.isArray(entrevista) && entrevista.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Anexo E. Entrevistas
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registraron entrevistas en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Convertir a array si es objeto único
  const entrevistas = Array.isArray(entrevista) ? entrevista : [entrevista];
  const entrevistaMostrada = entrevistas[entrevistaActiva];

  // Procesar responsable como array para consistencia
  const responsable = entrevistaMostrada.responsable ? [entrevistaMostrada.responsable] : [];

  // Procesar disposiciones como array
  const disposiciones = entrevistaMostrada.disposiciones ? 
    (Array.isArray(entrevistaMostrada.disposiciones) ? entrevistaMostrada.disposiciones : [entrevistaMostrada.disposiciones]) : [];

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Anexo E. Entrevistas
        {entrevistas.length > 1 && (
          <span className="ml-2 text-xs opacity-90">
            ({entrevistaActiva + 1} de {entrevistas.length})
          </span>
        )}
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Navegación entre entrevistas si hay múltiples */}
        {entrevistas.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#c2b186]/20">
            <button
              onClick={() => setEntrevistaActiva(Math.max(0, entrevistaActiva - 1))}
              disabled={entrevistaActiva === 0}
              className={`p-2 rounded-lg transition-colors ${
                entrevistaActiva === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-[#4d4725]">
                Entrevista {entrevistaActiva + 1} de {entrevistas.length}
              </p>
              <p className="text-xs text-gray-600">
                {[entrevistaMostrada.nombreEntrevistado, entrevistaMostrada.apellidoPaternoEntrevistado]
                  .filter(Boolean).join(' ') || 'Sin nombre'} - {entrevistaMostrada.calidad || 'Sin calidad'}
              </p>
            </div>
            
            <button
              onClick={() => setEntrevistaActiva(Math.min(entrevistas.length - 1, entrevistaActiva + 1))}
              disabled={entrevistaActiva === entrevistas.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                entrevistaActiva === entrevistas.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sección 1: Información de la Entrevista */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            Información de la Entrevista
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Fecha y hora de la entrevista */}
            <div className="md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Clock className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Fecha y hora</p>
                  <p className="font-semibold text-[#4d4725]">{formatearFecha(entrevistaMostrada.fechaHora)}</p>
                </div>
              </div>
            </div>

            {/* Número interior */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número interior</p>
                <p className="font-semibold text-[#4d4725] font-mono">{entrevistaMostrada.numeroInterior || 'No disponible'}</p>
              </div>
            </div>

            {/* Estado especiales */}
            <CampoBooleano 
              label="Datos reservados" 
              valor={entrevistaMostrada.datosReservados}
              className="border-yellow-300 bg-yellow-50"
            />

            <CampoBooleano 
              label="Requirió traductor" 
              valor={entrevistaMostrada.traductor}
            />
          </div>
        </div>

        {/* Sección 2: Datos del Entrevistado */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Datos del Entrevistado
          </h3>
          
          {/* Información personal */}
          <div className="mb-4 bg-white p-4 rounded-lg border border-[#c2b186]/20">
            <h4 className="text-sm font-semibold text-[#4d4725] mb-3">Información Personal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-bold text-[#4d4725]">
                  {[entrevistaMostrada.nombreEntrevistado, entrevistaMostrada.apellidoPaternoEntrevistado, entrevistaMostrada.apellidoMaternoEntrevistado]
                    .filter(Boolean).join(' ') || 'No disponible'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Calidad: {entrevistaMostrada.calidad || 'No especificada'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Sexo: {entrevistaMostrada.sexo || 'No especificado'}</p>
                <p className="text-sm text-gray-600">
                  Nacionalidad: {entrevistaMostrada.nacionalidad || 'No especificada'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Datos demográficos */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                <p className="font-semibold">{formatearSoloFecha(entrevistaMostrada.fechaNacimiento)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Edad</p>
                <p className="font-semibold">{entrevistaMostrada.edad || 'No disponible'} años</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Identificación</p>
                <p className="font-semibold">{entrevistaMostrada.identificacion || 'No disponible'}</p>
              </div>
            </div>

            {/* Tipo y número de identificación */}
            {entrevistaMostrada.tipoIdentificacion && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo identificación</p>
                  <p className="font-semibold">{entrevistaMostrada.tipoIdentificacion}</p>
                </div>
              </div>
            )}

            {entrevistaMostrada.numeroIdentificacion && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Número identificación</p>
                  <p className="font-semibold font-mono">{entrevistaMostrada.numeroIdentificacion}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección 3: Contacto y Ubicación */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Contacto y Ubicación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Información de contacto */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3">Información de Contacto</h4>
              <div className="space-y-2">
                {entrevistaMostrada.telefonoEntrevistado && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#c2b186]" />
                    <p className="text-sm font-mono">{entrevistaMostrada.telefonoEntrevistado}</p>
                  </div>
                )}
                {entrevistaMostrada.correo && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#c2b186]" />
                    <p className="text-sm font-mono">{entrevistaMostrada.correo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3">Dirección</h4>
              <div className="space-y-2 text-sm">
                {entrevistaMostrada.calle && (
                  <p><span className="font-medium">Calle:</span> {entrevistaMostrada.calle}</p>
                )}
                {entrevistaMostrada.numeroExterior && (
                  <p><span className="font-medium">No. Ext:</span> {entrevistaMostrada.numeroExterior}</p>
                )}
                {entrevistaMostrada.referencia && (
                  <p><span className="font-medium">Referencia:</span> {entrevistaMostrada.referencia}</p>
                )}
                {entrevistaMostrada.localizacionEntrevistado && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {[
                        entrevistaMostrada.localizacionEntrevistado.colonia,
                        entrevistaMostrada.localizacionEntrevistado.municipio,
                        entrevistaMostrada.localizacionEntrevistado.estado
                      ].filter(Boolean).join(', ')}
                      {entrevistaMostrada.localizacionEntrevistado.codigoPostal && 
                        ` CP: ${entrevistaMostrada.localizacionEntrevistado.codigoPostal}`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Contenido de la Entrevista */}
        {entrevistaMostrada.entrevista && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Contenido de la Entrevista
            </h3>
            
            <TextoExpandible
              titulo="Transcripción de la Entrevista"
              contenido={entrevistaMostrada.entrevista}
              limite={LIMITE_CARACTERES_ENTREVISTA}
              icono={MessageCircle}
            />
          </div>
        )}

        {/* Sección 5: Canalización */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            Canalización
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CampoBooleano 
              label="Se realizó canalización" 
              valor={stringABoolean(entrevistaMostrada.canalizacion)}
              className={stringABoolean(entrevistaMostrada.canalizacion) ? 'border-blue-300 bg-blue-50' : ''}
            />

            {entrevistaMostrada.lugarCanalizacion && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Heart className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Lugar de canalización</p>
                  <p className="font-semibold text-[#4d4725]">{entrevistaMostrada.lugarCanalizacion}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección 6: Personal Responsable */}
        {responsable.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Personal Responsable
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {responsable.map((oficial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg border border-green-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-600 rounded-full">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm mb-1">
                        {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                          .filter(Boolean)
                          .join(' ') || 'Responsable'
                        }
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-700">
                        {oficial.cargoGrado && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-green-600" />
                            <span className="font-medium">Cargo/Grado:</span>
                            <span className="px-2 py-0.5 bg-green-600 text-white rounded-full text-xs">
                              {oficial.cargoGrado}
                            </span>
                          </div>
                        )}
                        
                        {oficial.adscripcion && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-green-600" />
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

        {/* Sección 7: Personal Participante */}
        {disposiciones.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Personal Participante
              <span className="text-sm font-normal text-gray-600">
                ({disposiciones.length} oficial{disposiciones.length !== 1 ? 'es' : ''})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {disposiciones.map((oficial, index) => (
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
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-800 mb-1">
                Información de la Entrevista
              </p>
              <div className="text-sm text-purple-700 space-y-1">
                <p>
                  • Este anexo documenta las entrevistas realizadas durante la intervención.
                </p>
                <p>
                  • Se registran datos personales, contenido de la entrevista y canalización.
                </p>
                <p>
                  • Información recopilada según protocolos de entrevistas policiales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnexoEntrevistas;