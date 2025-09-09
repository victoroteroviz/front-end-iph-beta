/**
 * Componente AnexoEntregaRecepcion (Anexo F. Entrega - recepción del lugar de la intervención)
 * Muestra la información detallada del proceso de entrega-recepción del lugar de intervención
 * Incluye información de entrega, apoyo solicitado, ingreso al lugar y personal involucrado
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  FileText,
  User,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Shield,
  HandHeart,
  DoorOpen,
  Info,
  Clock
} from 'lucide-react';
import type { IEntregaRecepcion, IDisposicionOficial } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoEntregaRecepcionProps {
  entregaRecepcion: IEntregaRecepcion | IEntregaRecepcion[] | null;
  className?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_TEXTO = 500;

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Formatea una fecha ISO string a formato legible en español
 * Preparado para recibir tanto fecha sola como fecha con hora
 */
const formatearFecha = (fechaISO: string | Date | undefined): string => {
  if (!fechaISO) return 'No disponible';
  
  try {
    const fecha = new Date(fechaISO);
    
    // Si la fecha incluye hora (no es medianoche)
    const tieneHora = fecha.getHours() !== 0 || fecha.getMinutes() !== 0 || fecha.getSeconds() !== 0;
    
    if (tieneHora) {
      return fecha.toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Convierte string "Sí"/"No" a boolean
 */
const stringABoolean = (valor: string | undefined): boolean => {
  return valor === 'Sí' || valor === 'SI' || valor === 'si' || valor === 'sí';
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
 * Componente para texto expandible preservando saltos de línea
 */
const TextoExpandible: React.FC<{ 
  titulo: string; 
  contenido: string; 
  limite: number;
  icono: React.ElementType;
  className?: string;
}> = ({ 
  titulo, 
  contenido, 
  limite,
  icono: IconComponent,
  className = ''
}) => {
  const [expandido, setExpandido] = useState(false);
  const necesitaExpandir = contenido.length > limite;
  const contenidoAMostrar = expandido ? contenido : contenido.substring(0, limite);

  return (
    <div className={`bg-white p-4 rounded-lg border border-[#c2b186]/20 ${className}`}>
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

const AnexoEntregaRecepcion: React.FC<AnexoEntregaRecepcionProps> = ({
  entregaRecepcion,
  className = ''
}) => {
  
  // Verificar si los datos están disponibles
  if (!entregaRecepcion || (Array.isArray(entregaRecepcion) && entregaRecepcion.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Anexo F. Entrega - recepción del lugar de la intervención
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <ArrowRightLeft className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registró proceso de entrega-recepción en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Siempre tomar el primer elemento (viene como array pero es objeto único)
  const entrega = Array.isArray(entregaRecepcion) ? entregaRecepcion[0] : entregaRecepcion;

  // Procesar respondiente como array para consistencia
  const respondiente = entrega.respondienteRecepcion ? [entrega.respondienteRecepcion] : [];

  // Procesar disposiciones como array
  const disposiciones = entrega.disposiciones || [];

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Anexo F. Entrega - recepción del lugar de la intervención
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >

        {/* Sección 1: Información de la Entrega */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            Información de la Entrega
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Fecha de entrega-recepción */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
              <Clock className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fecha de entrega-recepción</p>
                <p className="font-semibold text-[#4d4725]">{formatearFecha(entrega.fechaEntregaRecepcion)}</p>
              </div>
            </div>
          </div>

          {/* Explicación de la entrega */}
          {entrega.explicacion && (
            <TextoExpandible
              titulo="Explicación de la Entrega"
              contenido={entrega.explicacion}
              limite={LIMITE_CARACTERES_TEXTO}
              icono={FileText}
            />
          )}
        </div>

        {/* Sección 2: Apoyo Solicitado */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <HandHeart className="h-5 w-5 text-white" />
            </div>
            Apoyo Solicitado
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CampoBooleano 
              label="Se solicitó apoyo" 
              valor={stringABoolean(entrega.apoyoSolicitado)}
              className={stringABoolean(entrega.apoyoSolicitado) ? 'border-blue-300 bg-blue-50' : ''}
            />
          </div>

          {/* Tipo de apoyo solicitado */}
          {entrega.tipoApoyoSolicitado && (
            <TextoExpandible
              titulo="Tipo de Apoyo Solicitado"
              contenido={entrega.tipoApoyoSolicitado}
              limite={LIMITE_CARACTERES_TEXTO}
              icono={HandHeart}
              className="mb-4"
            />
          )}
        </div>

        {/* Sección 3: Ingreso al Lugar */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <DoorOpen className="h-5 w-5 text-white" />
            </div>
            Ingreso al Lugar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CampoBooleano 
              label="Hubo ingreso al lugar" 
              valor={stringABoolean(entrega.ingresoAlLugar)}
              className={stringABoolean(entrega.ingresoAlLugar) ? 'border-green-300 bg-green-50' : ''}
            />
          </div>

          {/* Motivo de ingreso */}
          {entrega.motivoIngreso && (
            <TextoExpandible
              titulo="Motivo de Ingreso"
              contenido={entrega.motivoIngreso}
              limite={LIMITE_CARACTERES_TEXTO}
              icono={DoorOpen}
              className="mb-4"
            />
          )}
        </div>

        {/* Observaciones adicionales */}
        {entrega.observaciones && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Observaciones Adicionales
            </h3>
            
            <TextoExpandible
              titulo="Observaciones del Proceso"
              contenido={entrega.observaciones}
              limite={LIMITE_CARACTERES_TEXTO}
              icono={FileText}
            />
          </div>
        )}

        {/* Sección 4: Personal Responsable de Recepción */}
        {respondiente.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              Personal Responsable de Recepción
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {respondiente.map((oficial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg border border-orange-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-600 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm mb-1">
                        {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                          .filter(Boolean)
                          .join(' ') || 'Responsable de Recepción'
                        }
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-700">
                        {oficial.cargoGrado && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-orange-600" />
                            <span className="font-medium">Cargo/Grado:</span>
                            <span className="px-2 py-0.5 bg-orange-600 text-white rounded-full text-xs">
                              {oficial.cargoGrado}
                            </span>
                          </div>
                        )}
                        
                        {oficial.adscripcion && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-orange-600" />
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

        {/* Sección 5: Personal Participante */}
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
        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-800 mb-1">
                Información del Proceso
              </p>
              <div className="text-sm text-teal-700 space-y-1">
                <p>
                  • Este anexo documenta el proceso de entrega-recepción del lugar de intervención.
                </p>
                <p>
                  • Se registra información sobre apoyo solicitado, ingreso al lugar y personal involucrado.
                </p>
                <p>
                  • Información recopilada según protocolos de entrega-recepción institucional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnexoEntregaRecepcion;