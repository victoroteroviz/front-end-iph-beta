/**
 * Componente AnexoInventario (Anexo D. Inventario de armas y objetos)
 * Muestra la información detallada del inventario de armas y objetos encontrados
 * Incluye información del inventario, detalles del objeto/arma, persona asegurada y personal participante
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  Package, 
  Search,
  Zap,
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
  Shield,
  Target,
  Slash
} from 'lucide-react';
import type { I_ArmaObjeto, IDisposicionOficial, ITestigo } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoInventarioProps {
  armaObjeto: I_ArmaObjeto | I_ArmaObjeto[] | null;
  className?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_DESCRIPCION = 150;

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
          {contenido.length}/{limite} caracteres
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
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AnexoInventario: React.FC<AnexoInventarioProps> = ({
  armaObjeto,
  className = ''
}) => {
  // Estado para manejar múltiples objetos/armas
  const [objetoActivo, setObjetoActivo] = useState(0);
  
  // Verificar si los datos están disponibles
  if (!armaObjeto || (Array.isArray(armaObjeto) && armaObjeto.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Anexo D. Inventario de armas y objetos
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registraron armas u objetos en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Convertir a array si es objeto único
  const objetos = Array.isArray(armaObjeto) ? armaObjeto : [armaObjeto];
  const objeto = objetos[objetoActivo];

  // Procesar disposiciones como array
  const disposiciones = objeto.disposiciones ? 
    (Array.isArray(objeto.disposiciones) ? objeto.disposiciones : [objeto.disposiciones]) : [];

  // Procesar testigos
  const testigos = objeto.testigos || [];

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Anexo D. Inventario de armas y objetos
        {objetos.length > 1 && (
          <span className="ml-2 text-xs opacity-90">
            ({objetoActivo + 1} de {objetos.length})
          </span>
        )}
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Navegación entre objetos si hay múltiples */}
        {objetos.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#c2b186]/20">
            <button
              onClick={() => setObjetoActivo(Math.max(0, objetoActivo - 1))}
              disabled={objetoActivo === 0}
              className={`p-2 rounded-lg transition-colors ${
                objetoActivo === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-[#4d4725]">
                Objeto {objetoActivo + 1} de {objetos.length}
              </p>
              <p className="text-xs text-gray-600">
                {objeto.tipoInventario || 'Sin tipo'} - {objeto.objetoEncontrado || 'Sin especificar'}
              </p>
            </div>
            
            <button
              onClick={() => setObjetoActivo(Math.min(objetos.length - 1, objetoActivo + 1))}
              disabled={objetoActivo === objetos.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                objetoActivo === objetos.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sección 1: Información del Inventario */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            Información del Inventario
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Información básica del inventario */}
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo de inventario</p>
                <p className="font-semibold">{objeto.tipoInventario || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Aportación inspección</p>
                <p className="font-semibold">{objeto.aportacionInspeccion || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Objeto encontrado</p>
                <p className="font-semibold">{objeto.objetoEncontrado || 'No especificado'}</p>
              </div>
            </div>

            {/* Tipo de objeto e inspección */}
            {objeto.tipoObjetoEncontrado ? (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de objeto encontrado</p>
                  <p className="font-semibold">{objeto.tipoObjetoEncontrado}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Tipo de objeto encontrado" />
            )}

            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo de inspección</p>
                <p className="font-semibold">{objeto.tipoInspeccion || 'No especificado'}</p>
              </div>
            </div>

            {/* Lugar de encuentro y destino */}
            {objeto.lugarEncuentro ? (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Lugar de encuentro</p>
                  <p className="font-semibold">{objeto.lugarEncuentro}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Lugar de encuentro" />
            )}

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Destino</p>
                <p className="font-semibold">{objeto.destinoArmOb || 'No especificado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 2: Detalles del Objeto/Arma */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            Detalles del Objeto/Arma
          </h3>
          
          {/* Descripción del objeto */}
          {objeto.descripcionArmObj && (
            <div className="mb-6">
              <TextoExpandible
                titulo="Descripción del Objeto/Arma"
                contenido={objeto.descripcionArmObj}
                limite={LIMITE_CARACTERES_DESCRIPCION}
                icono={FileText}
              />
            </div>
          )}

          {/* Información específica del arma */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objeto.tipoArma ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Zap className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de arma</p>
                  <p className="font-semibold text-[#4d4725]">{objeto.tipoArma}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Tipo de arma" />
            )}

            {objeto.calibreArma ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Target className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Calibre</p>
                  <p className="font-semibold text-[#4d4725]">{objeto.calibreArma}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Calibre" />
            )}

            {objeto.colorArma ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Color del arma</p>
                  <p className="font-semibold text-[#4d4725]">{objeto.colorArma}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Color del arma" />
            )}

            {objeto.matriculaArma ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Matrícula</p>
                  <p className="font-semibold text-[#4d4725] font-mono">{objeto.matriculaArma}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Matrícula" />
            )}

            {objeto.numeroSerieArma ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
                <Hash className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Número de serie</p>
                  <p className="font-semibold text-[#4d4725] font-mono">{objeto.numeroSerieArma}</p>
                </div>
              </div>
            ) : (
              <CampoTachado label="Número de serie" />
            )}
          </div>
        </div>

        {/* Sección 3: Persona Asegurada */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Persona Asegurada
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de la persona asegurada */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3">Datos Personales</h4>
              {(objeto.nombreAsegurado || objeto.primerApellidoAsegurado || objeto.segundoApellidoAsegurado) ? (
                <p className="text-sm font-medium text-[#4d4725]">
                  {[objeto.nombreAsegurado, objeto.primerApellidoAsegurado, objeto.segundoApellidoAsegurado]
                    .filter(Boolean).join(' ') || 'No disponible'
                  }
                </p>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Slash className="h-4 w-4" />
                  <p className="text-sm">No se registró persona asegurada</p>
                </div>
              )}
            </div>

            {/* Estado de primer respondiente */}
            <CampoBooleano 
              label="Primer Respondiente" 
              valor={objeto.primerRespondiente}
            />
          </div>
        </div>

        {/* Sección 4: Personal Participante */}
        {disposiciones.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200">
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

        {/* Sección 5: Testigos */}
        {testigos.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
              Testigos
              <span className="text-sm font-normal text-gray-600">
                ({testigos.length} testigo{testigos.length !== 1 ? 's' : ''})
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testigos.map((testigo, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 rounded-lg border border-[#c2b186]/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500 rounded-full">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm">
                        {[testigo.nombre, testigo.primerApellido, testigo.segundoApellido]
                          .filter(Boolean)
                          .join(' ') || `Testigo ${index + 1}`
                        }
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">
                Información del Inventario
              </p>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  • Este anexo documenta el inventario de armas y objetos encontrados.
                </p>
                <p>
                  • Se registran detalles técnicos, personal involucrado y testigos.
                </p>
                <p>
                  • Información recopilada según protocolos de cadena de custodia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnexoInventario;