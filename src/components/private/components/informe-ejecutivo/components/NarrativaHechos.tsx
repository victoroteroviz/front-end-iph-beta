/**
 * Componente NarrativaHechos
 * Muestra la narrativa detallada de los hechos del IPH
 * Incluye funcionalidad de expandir/colapsar para textos largos
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  Hash
} from 'lucide-react';
import type { INarrativa } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface NarrativaHechosProps {
  narrativaHecho: INarrativa | INarrativa[] | null;
  className?: string;
}

// =====================================================
// CONSTANTES
// =====================================================

const LIMITE_CARACTERES_PREVIEW = 500; // Caracteres a mostrar antes del "Ver más"
const LIMITE_PARRAFOS_PREVIEW = 2; // Párrafos a mostrar antes del "Ver más"

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Procesa el texto para convertir saltos de línea en párrafos
 */
const procesarParrafos = (contenido: string): string[] => {
  if (!contenido) return [];
  
  return contenido
    .split('\n\n') // Dividir por dobles saltos de línea
    .map(parrafo => parrafo.trim()) // Limpiar espacios
    .filter(parrafo => parrafo.length > 0); // Filtrar párrafos vacíos
};

/**
 * Calcula estadísticas del texto
 */
const calcularEstadisticas = (contenido: string) => {
  const parrafos = procesarParrafos(contenido);
  const caracteres = contenido.length;
  const palabras = contenido.split(/\s+/).filter(palabra => palabra.length > 0).length;
  
  return {
    parrafos: parrafos.length,
    caracteres,
    palabras
  };
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const NarrativaHechos: React.FC<NarrativaHechosProps> = ({
  narrativaHecho,
  className = ''
}) => {
  // Estado para expandir/colapsar
  const [expandido, setExpandido] = useState(false);
  
  // Verificar si los datos están disponibles y obtener el primer elemento si es array
  if (!narrativaHecho || (Array.isArray(narrativaHecho) && narrativaHecho.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Narrativa de los Hechos
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontró narrativa de los hechos</p>
          </div>
        </div>
      </div>
    );
  }

  // Si es array, tomar el primer elemento; si no, usar el objeto directamente
  const narrativa = Array.isArray(narrativaHecho) ? narrativaHecho[0] : narrativaHecho;

  // Verificar si hay contenido
  if (!narrativa?.contenido) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Narrativa de los Hechos
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">El contenido de la narrativa no está disponible</p>
          </div>
        </div>
      </div>
    );
  }

  // Procesar el contenido
  const parrafos = procesarParrafos(narrativa.contenido);
  const estadisticas = calcularEstadisticas(narrativa.contenido);
  
  // Determinar si necesita botón de expandir
  const necesitaExpandir = narrativa.contenido.length > LIMITE_CARACTERES_PREVIEW || parrafos.length > LIMITE_PARRAFOS_PREVIEW;
  
  // Obtener contenido a mostrar
  const parrafosAMostrar = expandido ? parrafos : parrafos.slice(0, LIMITE_PARRAFOS_PREVIEW);
  const contenidoAMostrar = expandido ? narrativa.contenido : narrativa.contenido.substring(0, LIMITE_CARACTERES_PREVIEW);

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Narrativa de los Hechos
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Header con estadísticas */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <AlignLeft className="h-5 w-5 text-white" />
            </div>
            Narrativa Detallada
          </h3>
          
          {/* Estadísticas del texto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
              <Hash className="h-4 w-4 text-[#c2b186]" />
              <div>
                <p className="text-xs text-gray-600">Párrafos</p>
                <p className="font-semibold text-[#4d4725]">{estadisticas.parrafos}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
              <FileText className="h-4 w-4 text-[#c2b186]" />
              <div>
                <p className="text-xs text-gray-600">Palabras</p>
                <p className="font-semibold text-[#4d4725]">{estadisticas.palabras.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c2b186]/20">
              <AlignLeft className="h-4 w-4 text-[#c2b186]" />
              <div>
                <p className="text-xs text-gray-600">Caracteres</p>
                <p className="font-semibold text-[#4d4725]">{estadisticas.caracteres.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la narrativa */}
        <div className="bg-white p-6 rounded-lg border border-[#c2b186]/20">
          <div className="prose prose-sm max-w-none">
            {expandido ? (
              // Mostrar todos los párrafos
              <div className="space-y-4">
                {parrafos.map((parrafo, index) => (
                  <p 
                    key={index}
                    className="text-gray-700 leading-relaxed text-justify font-poppins"
                  >
                    {parrafo}
                  </p>
                ))}
              </div>
            ) : (
              // Mostrar vista previa
              <div className="space-y-4">
                {parrafosAMostrar.map((parrafo, index) => (
                  <p 
                    key={index}
                    className="text-gray-700 leading-relaxed text-justify font-poppins"
                  >
                    {parrafo}
                  </p>
                ))}
                
                {/* Texto cortado si es necesario */}
                {necesitaExpandir && !expandido && contenidoAMostrar.length < narrativa.contenido.length && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent h-8"></div>
                    <p className="text-gray-400 italic text-sm">
                      ... texto continúa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Botón para expandir/colapsar */}
          {necesitaExpandir && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <button
                onClick={() => setExpandido(!expandido)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#c2b186] text-white rounded-lg hover:bg-[#a89770] transition-colors duration-200 font-medium"
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
                    Ver narrativa completa
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
              
              {/* Indicador de progreso */}
              <div className="mt-2 text-xs text-gray-500">
                {expandido ? (
                  `Mostrando texto completo (${estadisticas.caracteres} caracteres)`
                ) : (
                  `Mostrando vista previa (${Math.min(LIMITE_CARACTERES_PREVIEW, estadisticas.caracteres)} de ${estadisticas.caracteres} caracteres)`
                )}
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 mb-1">
                Sobre esta narrativa
              </p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  • Esta narrativa contiene el relato detallado de los hechos ocurridos durante la intervención.
                </p>
                <p>
                  • La información se presenta tal como fue documentada por el personal responsable.
                </p>
                {estadisticas.caracteres > 2000 && (
                  <p>
                    • Debido a la extensión del contenido, se muestra inicialmente una vista resumida.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativaHechos;