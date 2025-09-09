/**
 * Componente AnexoUsoFuerza (Anexo B. Uso de la Fuerza)
 * Muestra la información detallada del uso de fuerza durante la intervención
 * Incluye estadísticas de víctimas, tipo de fuerza, contexto y personal participante
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle,
  Skull,
  User,
  Users,
  Target,
  Zap,
  Heart,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Slash
} from 'lucide-react';
import type { IUsoFuerza } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoUsoFuerzaProps {
  usoFuerza: IUsoFuerza | IUsoFuerza[] | null;
  className?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_CONDUCTA = 1400;
const LIMITE_CARACTERES_EXPLICACION = 900;
const LIMITE_CARACTERES_PREVIEW = 300;

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Componente para mostrar un campo con valor null/undefined como tachado
 */
const CampoTachado: React.FC<{ label: string; className?: string }> = ({ 
  label, 
  className = '' 
}) => (
  <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
    <div className="relative">
      <Slash className="h-5 w-5 text-gray-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">No especificado</p>
    </div>
  </div>
);

/**
 * Componente para mostrar un campo booleano con íconos
 */
const CampoBooleano: React.FC<{ 
  label: string; 
  valor: boolean | undefined; 
  className?: string;
  tipoIcono?: 'normal' | 'warning' | 'danger';
}> = ({ 
  label, 
  valor, 
  className = '',
  tipoIcono = 'normal'
}) => {
  const getIconColor = () => {
    if (!valor) return 'text-gray-500';
    switch (tipoIcono) {
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-green-600';
    }
  };

  const getBgColor = () => {
    if (!valor) return 'bg-gray-100';
    switch (tipoIcono) {
      case 'warning': return 'bg-yellow-50 border-yellow-300';
      case 'danger': return 'bg-red-50 border-red-300';
      default: return 'bg-green-50 border-green-300';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${getBgColor()} ${className}`}>
      {valor ? (
        <CheckCircle className={`h-5 w-5 ${getIconColor()}`} />
      ) : (
        <XCircle className="h-5 w-5 text-gray-500" />
      )}
      <div>
        <p className="text-sm font-medium text-[#4d4725]">{label}</p>
        <p className={`text-xs ${valor ? getIconColor().replace('text-', 'text-') : 'text-gray-500'}`}>
          {valor ? 'Sí aplicado' : 'No aplicado'}
        </p>
      </div>
    </div>
  );
};

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
          {contenido.length}/{limite === LIMITE_CARACTERES_CONDUCTA ? '1,400' : '900'} caracteres
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

const AnexoUsoFuerza: React.FC<AnexoUsoFuerzaProps> = ({
  usoFuerza,
  className = ''
}) => {
  
  // Verificar si los datos están disponibles
  if (!usoFuerza || (Array.isArray(usoFuerza) && usoFuerza.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Anexo B. Uso de la Fuerza
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registró uso de fuerza en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Siempre tomar el primer elemento (backend lo manda como array pero siempre será uno)
  const incidente = Array.isArray(usoFuerza) ? usoFuerza[0] : usoFuerza;

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Anexo B. Uso de la Fuerza
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Sección 1: Estadísticas de Víctimas */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            Estadísticas de Víctimas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lesionados */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Personas Lesionadas
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-yellow-700" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-800">
                    {incidente.lesionadosPersonas || '0'}
                  </p>
                  <p className="text-sm text-yellow-700">Civiles</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-yellow-700" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-800">
                    {incidente.lesionadosAutoridad || '0'}
                  </p>
                  <p className="text-sm text-yellow-700">Autoridad</p>
                </div>
              </div>
            </div>

            {/* Fallecidos */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-300">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <Skull className="h-4 w-4" />
                Personas Fallecidas
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-red-700" />
                  </div>
                  <p className="text-2xl font-bold text-red-800">
                    {incidente.fallecidosPersonas || '0'}
                  </p>
                  <p className="text-sm text-red-700">Civiles</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-red-700" />
                  </div>
                  <p className="text-2xl font-bold text-red-800">
                    {incidente.fallecidosAutoridad || '0'}
                  </p>
                  <p className="text-sm text-red-700">Autoridad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-[#c2b186]/20 text-center">
              <p className="text-lg font-bold text-yellow-700">
                {(parseInt(incidente.lesionadosPersonas || '0') + parseInt(incidente.lesionadosAutoridad || '0'))}
              </p>
              <p className="text-sm text-gray-600">Total de Lesionados</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#c2b186]/20 text-center">
              <p className="text-lg font-bold text-red-700">
                {(parseInt(incidente.fallecidosPersonas || '0') + parseInt(incidente.fallecidosAutoridad || '0'))}
              </p>
              <p className="text-sm text-gray-600">Total de Fallecidos</p>
            </div>
          </div>
        </div>

        {/* Sección 2: Tipo de Fuerza Aplicada */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            Tipo de Fuerza Aplicada
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CampoBooleano 
              label="Reducción de Movimiento" 
              valor={incidente.reduccionMovimiento}
              tipoIcono="warning"
            />
            <CampoBooleano 
              label="Uso de Arma No Letal" 
              valor={incidente.usoArmaNoLetal}
              tipoIcono="warning"
            />
            <CampoBooleano 
              label="Uso de Arma Letal" 
              valor={incidente.usoArmaLetal}
              tipoIcono="danger"
            />
            <CampoBooleano 
              label="Asistencia Médica Brindada" 
              valor={incidente.asistenciaMedica}
              tipoIcono="normal"
            />
          </div>
        </div>

        {/* Sección 3: Contexto del Incidente */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Contexto del Incidente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {incidente.tipoGrupoDelictivo ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Users className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Grupo Delictivo</p>
                  <p className="font-semibold text-[#4d4725]">{incidente.tipoGrupoDelictivo}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Tipo de Grupo Delictivo" />
            )}

            {incidente.tipoPadecimiento ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Heart className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Padecimiento</p>
                  <p className="font-semibold text-[#4d4725]">{incidente.tipoPadecimiento}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Tipo de Padecimiento" />
            )}
          </div>

          {/* Textos expandibles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {incidente.conducta && (
              <TextoExpandible
                titulo="Conducta Observada"
                contenido={incidente.conducta}
                limite={LIMITE_CARACTERES_PREVIEW}
                icono={User}
              />
            )}

            {incidente.explicacion && (
              <TextoExpandible
                titulo="Explicación del Uso de Fuerza"
                contenido={incidente.explicacion}
                limite={LIMITE_CARACTERES_PREVIEW}
                icono={FileText}
              />
            )}
          </div>
        </div>

        {/* Sección 4: Personal Participante */}
        {incidente.disposiciones && incidente.disposiciones.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Personal Participante
              <span className="text-sm font-normal text-gray-600">
                ({incidente.disposiciones.length} oficial{incidente.disposiciones.length !== 1 ? 'es' : ''})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidente.disposiciones.map((oficial, index) => (
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
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 mb-1">
                Información Importante
              </p>
              <div className="text-sm text-orange-700 space-y-1">
                <p>
                  • Este anexo documenta el uso de fuerza durante la intervención policial.
                </p>
                <p>
                  • Los datos incluyen víctimas, tipo de fuerza aplicada y personal involucrado.
                </p>
                <p>
                  • Información registrada según protocolos oficiales de uso de fuerza.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnexoUsoFuerza;