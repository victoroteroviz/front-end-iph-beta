/**
 * Componente AnexoUsoFuerza (Anexo B. Uso de la Fuerza)
 * Muestra la información detallada del uso de fuerza durante la intervención
 * Incluye estadísticas de víctimas, tipo de fuerza, contexto y personal participante
 * Mantiene diseño original con colores #787dff, #eef1ff
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Slash,
  ChevronLeft,
  ChevronRight,
  Hash
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
        <p className="text-sm font-medium text-[#1a2744]">{label}</p>
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
    <div className="bg-white p-4 rounded-lg border border-[#787dff]/20">
      <h4 className="text-sm font-semibold text-[#1a2744] mb-3 flex items-center gap-2">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#787dff] text-white rounded-lg hover:bg-[#6167d9] transition-colors duration-200 font-medium text-sm"
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
  
  // Estado para manejar múltiples incidentes de uso de fuerza
  const [incidenteActivo, setIncidenteActivo] = useState(0);
  
  // Refs para manejo de scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionsRef = useRef<{ [key: number]: number }>({});

  // Función para preservar la posición de scroll antes de cambiar de incidente
  const preserveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      scrollPositionsRef.current[incidenteActivo] = containerRef.current.scrollTop;
    }
  }, [incidenteActivo]);

  // Función para restaurar la posición de scroll después de cambiar de incidente
  const restoreScrollPosition = useCallback((index: number) => {
    if (containerRef.current) {
      const savedPosition = scrollPositionsRef.current[index] || 0;
      // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: savedPosition,
            behavior: 'smooth'
          });
        }
      });
    }
  }, []);

  // Función mejorada para cambiar de incidente con preservación de scroll
  const cambiarIncidente = useCallback((nuevoIndice: number) => {
    if (nuevoIndice >= 0 && nuevoIndice < (Array.isArray(usoFuerza) ? usoFuerza : [usoFuerza]).length) {
      preserveScrollPosition();
      setIncidenteActivo(nuevoIndice);
      // Restaurar scroll después de un pequeño delay para permitir el re-render
      setTimeout(() => restoreScrollPosition(nuevoIndice), 100);
    }
  }, [usoFuerza, preserveScrollPosition, restoreScrollPosition]);

  // Scroll al inicio cuando se monta el componente
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Limpiar posiciones guardadas cuando cambie la prop usoFuerza
  useEffect(() => {
    scrollPositionsRef.current = {};
    setIncidenteActivo(0);
    // Scroll al inicio cuando cambien los datos
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [usoFuerza]);
  
  // Verificar si los datos están disponibles
  if (!usoFuerza || (Array.isArray(usoFuerza) && usoFuerza.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#787dff' }}
        >
          Anexo B. Uso de la Fuerza
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#eef1ff' }}
        >
          <div className="text-center text-[#1a2744] py-4">
            <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registró uso de fuerza en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Convertir a array si es objeto único
  const incidentes = Array.isArray(usoFuerza) ? usoFuerza : [usoFuerza];
  const incidente = incidentes[incidenteActivo];

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#787dff' }}
      >
        Anexo B. Uso de la Fuerza
        {incidentes.length > 1 && (
          <span className="ml-2 text-xs opacity-90">
            ({incidenteActivo + 1} de {incidentes.length})
          </span>
        )}
      </h2>
      
      <div 
        ref={containerRef}
        className="border border-gray-300 rounded-md shadow-sm p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#eef1ff' }}
      >
        
        {/* Navegación entre incidentes si hay múltiples */}
        {incidentes.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#787dff]/20">
            <button
              onClick={() => cambiarIncidente(incidenteActivo - 1)}
              disabled={incidenteActivo === 0}
              className={`p-2 rounded-lg transition-colors ${
                incidenteActivo === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#1a2744] hover:bg-[#787dff] hover:text-white'
              }`}
              title="Incidente anterior"
              aria-label="Ir a incidente anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="flex items-center gap-2 text-[#1a2744] font-poppins">
                <Hash className="h-4 w-4" />
                <span className="text-lg font-bold">
                  Incidente {incidenteActivo + 1}
                </span>
                <span className="text-sm text-gray-500">
                  de {incidentes.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usa las flechas para navegar entre incidentes
              </p>
            </div>
            
            <button
              onClick={() => cambiarIncidente(incidenteActivo + 1)}
              disabled={incidenteActivo === incidentes.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                incidenteActivo === incidentes.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#1a2744] hover:bg-[#787dff] hover:text-white'
              }`}
              title="Incidente siguiente"
              aria-label="Ir a incidente siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Sección 1: Estadísticas de Víctimas */}
        <div className="mb-6" id={`victimas-${incidenteActivo}`}>
          <h3 className="text-lg font-bold text-[#1a2744] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#787dff] rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            Estadísticas de Víctimas
            {incidentes.length > 1 && (
              <span className="ml-auto text-sm font-normal text-gray-600 bg-white px-3 py-1 rounded-full border border-[#787dff]/30">
                Incidente {incidenteActivo + 1}/{incidentes.length}
              </span>
            )}
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
            <div className="bg-white p-3 rounded-lg border border-[#787dff]/20 text-center">
              <p className="text-lg font-bold text-yellow-700">
                {(parseInt(incidente.lesionadosPersonas || '0') + parseInt(incidente.lesionadosAutoridad || '0'))}
              </p>
              <p className="text-sm text-gray-600">Total de Lesionados</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#787dff]/20 text-center">
              <p className="text-lg font-bold text-red-700">
                {(parseInt(incidente.fallecidosPersonas || '0') + parseInt(incidente.fallecidosAutoridad || '0'))}
              </p>
              <p className="text-sm text-gray-600">Total de Fallecidos</p>
            </div>
          </div>
        </div>

        {/* Sección 2: Tipo de Fuerza Aplicada */}
        <div className="mb-6 pt-6 border-t border-gray-200" id={`tipo-fuerza-${incidenteActivo}`}>
          <h3 className="text-lg font-bold text-[#1a2744] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#787dff] rounded-lg">
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
        <div className="mb-6 pt-6 border-t border-gray-200" id={`contexto-${incidenteActivo}`}>
          <h3 className="text-lg font-bold text-[#1a2744] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#787dff] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Contexto del Incidente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {incidente.tipoGrupoDelictivo ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#787dff]/20">
                <Users className="h-5 w-5 text-[#787dff]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Grupo Delictivo</p>
                  <p className="font-semibold text-[#1a2744]">{incidente.tipoGrupoDelictivo}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Tipo de Grupo Delictivo" />
            )}

            {incidente.tipoPadecimiento ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#787dff]/20">
                <Heart className="h-5 w-5 text-[#787dff]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Padecimiento</p>
                  <p className="font-semibold text-[#1a2744]">{incidente.tipoPadecimiento}</p>
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
          <div className="pt-6 border-t border-gray-200" id={`personal-${incidenteActivo}`}>
            <h3 className="text-lg font-bold text-[#1a2744] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#787dff] rounded-lg">
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
                  className="bg-white p-4 rounded-lg border border-[#787dff]/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#787dff] rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1a2744] text-sm mb-1">
                        {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                          .filter(Boolean)
                          .join(' ') || `Oficial ${index + 1}`
                        }
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-700">
                        {oficial.cargoGrado && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-3 w-3 text-[#787dff]" />
                            <span className="font-medium">Cargo/Grado:</span>
                            <span className="px-2 py-0.5 bg-[#787dff] text-white rounded-full text-xs">
                              {oficial.cargoGrado}
                            </span>
                          </div>
                        )}
                        
                        {oficial.adscripcion && (
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-[#787dff]" />
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