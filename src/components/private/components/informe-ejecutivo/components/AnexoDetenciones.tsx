/**
 * Componente AnexoDetenciones (Anexo A. Detenciones)
 * Muestra la información detallada de las detenciones del IPH
 * Incluye datos del detenido, ubicación, pertenencias y disposiciones
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  Phone,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

// Componente de icono personalizado para testigo
const TestigoIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    aria-hidden="true" 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M16 10c0-.55228-.4477-1-1-1h-3v2h3c.5523 0 1-.4477 1-1Z"/>
    <path d="M13 15v-2h2c1.6569 0 3-1.3431 3-3 0-1.65685-1.3431-3-3-3h-2.256c.1658-.46917.256-.97405.256-1.5 0-.51464-.0864-1.0091-.2454-1.46967C12.8331 4.01052 12.9153 4 13 4h7c.5523 0 1 .44772 1 1v9c0 .5523-.4477 1-1 1h-2.5l1.9231 4.6154c.2124.5098-.0287 1.0953-.5385 1.3077-.5098.2124-1.0953-.0287-1.3077-.5385L15.75 16l-1.827 4.3846c-.1825.438-.6403.6776-1.0889.6018.1075-.3089.1659-.6408.1659-.9864v-2.6002L14 15h-1ZM6 5.5C6 4.11929 7.11929 3 8.5 3S11 4.11929 11 5.5 9.88071 8 8.5 8 6 6.88071 6 5.5Z"/>
    <path d="M15 11h-4v9c0 .5523-.4477 1-1 1-.55228 0-1-.4477-1-1v-4H8v4c0 .5523-.44772 1-1 1s-1-.4477-1-1v-6.6973l-1.16797 1.752c-.30635.4595-.92722.5837-1.38675.2773-.45952-.3063-.5837-.9272-.27735-1.3867l2.99228-4.48843c.09402-.14507.2246-.26423.37869-.34445.11427-.05949.24148-.09755.3763-.10887.03364-.00289.06747-.00408.10134-.00355H15c.5523 0 1 .44772 1 1 0 .5523-.4477 1-1 1Z"/>
  </svg>
);
import type { IDetencion, IPuestaDisposicion, IDisposicionOficial } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES
// =====================================================

interface AnexoDetencionesProps {
  detencion: IDetencion | IDetencion[] | null;
  puestaDisposicion?: IPuestaDisposicion | IPuestaDisposicion[] | null;
  className?: string;
}

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
  } catch {
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
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Calcula la edad basada en fecha de nacimiento
 */
const calcularEdad = (fechaNacimiento: string | Date | undefined): number | null => {
  if (!fechaNacimiento) return null;
  
  try {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  } catch {
    return null;
  }
};

/**
 * Helper para normalizar valores booleanos de diferentes formatos
 */
const normalizarBooleano = (valor: any): boolean => {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const valorLower = valor.toLowerCase();
    return valorLower === 'sí' || valorLower === 'si' || valorLower === 'true' || valorLower === '1';
  }
  return Boolean(valor);
};

/**
 * Componente para mostrar un campo booleano con íconos
 */
const CampoBooleano: React.FC<{ 
  label: string; 
  valor: any; 
  className?: string;
  destacar?: boolean;
}> = ({ 
  label, 
  valor, 
  className = '',
  destacar = false
}) => {
  const esVerdadero = normalizarBooleano(valor);
  const claseDestacado = destacar && esVerdadero ? 'border-yellow-300 bg-yellow-50' : '';
  
  return (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${claseDestacado} ${className}`}>
      {esVerdadero ? (
        <CheckCircle className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <div>
        <p className="text-sm font-medium text-[#4d4725]">{label}</p>
        <p className="text-xs text-gray-600">{esVerdadero ? 'Sí' : 'No'}</p>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AnexoDetenciones: React.FC<AnexoDetencionesProps> = ({
  detencion,
  puestaDisposicion: _puestaDisposicion,
  className = ''
}) => {
  // Estado para manejar múltiples detenciones
  const [detencionActiva, setDetencionActiva] = useState(0);
  
  // Refs para manejo de scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPositionsRef = useRef<{ [key: number]: number }>({});

  // Función para preservar la posición de scroll antes de cambiar de detención
  const preserveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      scrollPositionsRef.current[detencionActiva] = containerRef.current.scrollTop;
    }
  }, [detencionActiva]);

  // Función para restaurar la posición de scroll después de cambiar de detención
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

  // Función mejorada para cambiar de detención con preservación de scroll
  const cambiarDetencion = useCallback((nuevoIndice: number) => {
    if (nuevoIndice >= 0 && nuevoIndice < (Array.isArray(detencion) ? detencion : [detencion]).length) {
      preserveScrollPosition();
      setDetencionActiva(nuevoIndice);
      // Restaurar scroll después de un pequeño delay para permitir el re-render
      setTimeout(() => restoreScrollPosition(nuevoIndice), 100);
    }
  }, [detencion, preserveScrollPosition, restoreScrollPosition]);

  // Scroll al inicio cuando se monta el componente
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Limpiar posiciones guardadas cuando cambie la prop detencion
  useEffect(() => {
    scrollPositionsRef.current = {};
    setDetencionActiva(0);
    // Scroll al inicio cuando cambien los datos
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [detencion]);

  // Función para scroll a una sección específica del contenido
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = containerRef.current.scrollTop + (elementRect.top - containerRect.top) - 20; // 20px de padding
      
      containerRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, []);
  
  // Verificar si los datos están disponibles
  if (!detencion || (Array.isArray(detencion) && detencion.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Anexo A. Detenciones
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se registraron detenciones en este caso</p>
          </div>
        </div>
      </div>
    );
  }

  // Convertir a array si es objeto único
  const detenciones = Array.isArray(detencion) ? detencion : [detencion];
  const detencionMostrada = detenciones[detencionActiva];
  
  // Verificar si el lugar de detención es igual al lugar de intervención
  const esLugarIntervencionMismo = React.useMemo(() => {
    // Esta lógica se puede expandir para comparar coordenadas o direcciones específicas
    // Por ahora asumimos que si lugarDetencion es true, es el mismo lugar
    return detencionMostrada.lugarDetencion === true;
  }, [detencionMostrada.lugarDetencion]);

  // Calcular edad del detenido
  const edadCalculada = calcularEdad(detencionMostrada.fechaNacimiento);


  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Anexo A. Detenciones
        {detenciones.length > 1 && (
          <span className="ml-2 text-xs opacity-90">
            ({detencionActiva + 1} de {detenciones.length})
          </span>
        )}
      </h2>
      
      <div 
        ref={containerRef}
        className="border border-gray-300 rounded-md shadow-sm p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Navegación entre detenciones si hay múltiples */}
        {detenciones.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#c2b186]/20">
            <button
              onClick={() => cambiarDetencion(detencionActiva - 1)}
              disabled={detencionActiva === 0}
              className={`p-2 rounded-lg transition-colors ${
                detencionActiva === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
              title="Detención anterior"
              aria-label="Ir a detención anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-[#4d4725]">
                Detención {detencionActiva + 1} de {detenciones.length}
              </p>
              <p className="text-xs text-gray-600">
                RND: {detencionMostrada.rnd || 'No disponible'}
              </p>
            </div>
            
            <button
              onClick={() => cambiarDetencion(detencionActiva + 1)}
              disabled={detencionActiva === detenciones.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                detencionActiva === detenciones.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
              title="Detención siguiente"
              aria-label="Ir a detención siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sección 1: Información del detenido */}
        <div className="mb-6" id={`detenido-info-${detencionActiva}`}>
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Información del Detenido
            {detenciones.length > 1 && (
              <button
                onClick={() => scrollToSection(`detenido-info-${detencionActiva}`)}
                className="ml-auto text-xs text-[#c2b186] hover:text-[#4d4725] transition-colors"
                title="Ir al inicio de esta sección"
              >
                ↑ Inicio
              </button>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Información básica */}
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20 mb-4">
                <h4 className="text-sm font-semibold text-[#4d4725] mb-3">Identificación Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#4d4725]">
                      {[detencionMostrada.nombreDetenido, detencionMostrada.primerApellidoDetenido, detencionMostrada.segundoApellidoDetenido]
                        .filter(Boolean).join(' ') || 'No disponible'
                      }
                    </p>
                    {detencionMostrada.aliasDetenido && (
                      <p className="text-sm text-gray-600 italic">
                        Alias: "{detencionMostrada.aliasDetenido}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">RND: {detencionMostrada.rnd || 'No disponible'}</p>
                    <p className="text-sm text-gray-600">
                      Identificación: {detencionMostrada.identificacion === 'No' ? 'No' : detencionMostrada.identificacion || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos demográficos */}
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Sexo</p>
                <p className="font-semibold">{detencionMostrada.sexo || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fecha de nacimiento</p>
                <p className="font-semibold">{formatearSoloFecha(detencionMostrada.fechaNacimiento)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Edad</p>
                <p className="font-semibold">
                  {detencionMostrada.edad || edadCalculada 
                    ? `${detencionMostrada.edad || edadCalculada} años` 
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <MapPin className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Nacionalidad</p>
                <p className="font-semibold">
                  {detencionMostrada.nacionalidad || 'No disponible'}
                  {detencionMostrada.tipoNacionalidad && (
                    <span className="text-sm text-gray-600 ml-1">
                      ({detencionMostrada.tipoNacionalidad})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Descripción física si existe */}
            {detencionMostrada.descripcionDetenido && (
              <div className="md:col-span-2 lg:col-span-3">
                <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                  <h4 className="text-sm font-semibold text-[#4d4725] mb-2">Descripción Física</h4>
                  <p className="text-sm text-gray-700">{detencionMostrada.descripcionDetenido}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección 2: Datos de la detención */}
        <div className="mb-6 pt-6 border-t border-gray-200" id={`detencion-datos-${detencionActiva}`}>
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            Datos de la Detención
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fecha y hora */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-[#c2b186]" />
                <p className="text-sm font-medium text-gray-600">Fecha y hora de detención</p>
              </div>
              <p className="font-semibold text-[#4d4725]">
                {formatearFecha(detencionMostrada.fechaHora)}
              </p>
            </div>

            {/* Lugar de traslado */}
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <p className="text-sm font-medium text-gray-600">Lugar de traslado</p>
              </div>
              <p className="font-semibold text-[#4d4725]">
                {detencionMostrada.lugarTraslado || 'No especificado'}
              </p>
            </div>
          </div>

          {/* Estados booleanos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <CampoBooleano label="Lectura de derechos" valor={detencionMostrada.lecturaDerecho} />
            <CampoBooleano label="Objeto encontrado" valor={detencionMostrada.objetoEncontrado} />
            <CampoBooleano label="Objeto recolectado" valor={detencionMostrada.recolectoObjeto} />
            <CampoBooleano label="Lugar de detención" valor={detencionMostrada.lugarDetencion} />
          </div>

          {/* Estados de condición */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <CampoBooleano 
              label="Lesión visible" 
              valor={detencionMostrada.lesionVisible}
              destacar={true}
            />
            <CampoBooleano 
              label="Padecimiento" 
              valor={detencionMostrada.padecimiento}
              destacar={true}
            />
            <CampoBooleano 
              label="Grupo vulnerable" 
              valor={detencionMostrada.grupoVulnerable}
              className={normalizarBooleano(detencionMostrada.grupoVulnerable) ? 'border-blue-300 bg-blue-50' : ''}
            />
            <CampoBooleano 
              label="Grupo delictivo" 
              valor={detencionMostrada.grupoDelictivo}
              className={normalizarBooleano(detencionMostrada.grupoDelictivo) ? 'border-red-300 bg-red-50' : ''}
            />
          </div>
        </div>

        {/* Sección 3: Ubicación y direcciones */}
        <div className="mb-6 pt-6 border-t border-gray-200" id={`ubicacion-${detencionActiva}`}>
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            Ubicación y Direcciones
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Domicilio del detenido */}
            {(detencionMostrada.domicilioDetenido || detencionMostrada.localizacionDetenido) && (
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Domicilio del Detenido
                </h4>
                <div className="space-y-2 text-sm">
                  {detencionMostrada.domicilioDetenido && (
                    <p><span className="font-medium">Calle:</span> {detencionMostrada.domicilioDetenido}</p>
                  )}
                  {detencionMostrada.numeroExteriorDetenido && (
                    <p><span className="font-medium">No. Ext:</span> {detencionMostrada.numeroExteriorDetenido}</p>
                  )}
                  {detencionMostrada.numeroInteriorDetenido && (
                    <p><span className="font-medium">No. Int:</span> {detencionMostrada.numeroInteriorDetenido}</p>
                  )}
                  {detencionMostrada.referenciaDetenido && (
                    <p><span className="font-medium">Referencia:</span> {detencionMostrada.referenciaDetenido}</p>
                  )}
                  {detencionMostrada.localizacionDetenido && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-medium">Ubicación:</p>
                      <p className="text-xs text-gray-600">
                        {[
                          detencionMostrada.localizacionDetenido.colonia,
                          detencionMostrada.localizacionDetenido.municipio,
                          detencionMostrada.localizacionDetenido.estado
                        ].filter(Boolean).join(', ') || 'No disponible'}
                        {detencionMostrada.localizacionDetenido.codigoPostal && 
                          ` CP: ${detencionMostrada.localizacionDetenido.codigoPostal}`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lugar de detención */}
            {normalizarBooleano(detencionMostrada.lugarDetencion) && (
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20 relative">
                <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Lugar de Detención
                </h4>
                
                {/* Notificación de lugar igual al de intervención */}
                {esLugarIntervencionMismo && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-xs text-blue-700 font-medium">
                        El lugar de detención es el mismo que el lugar de intervención
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  {detencionMostrada.calleDetencion && (
                    <p><span className="font-medium">Calle:</span> {detencionMostrada.calleDetencion}</p>
                  )}
                  {detencionMostrada.numeroExteriorDetencion && (
                    <p><span className="font-medium">No. Ext:</span> {detencionMostrada.numeroExteriorDetencion}</p>
                  )}
                  {detencionMostrada.numeroInteriorDetencion && (
                    <p><span className="font-medium">No. Int:</span> {detencionMostrada.numeroInteriorDetencion}</p>
                  )}
                  {detencionMostrada.referenciaDetencion && (
                    <p><span className="font-medium">Referencia:</span> {detencionMostrada.referenciaDetencion}</p>
                  )}
                  {detencionMostrada.localizacionDetencion && Object.keys(detencionMostrada.localizacionDetencion).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        {[
                          detencionMostrada.localizacionDetencion.colonia,
                          detencionMostrada.localizacionDetencion.municipio,
                          detencionMostrada.localizacionDetencion.estado
                        ].filter(Boolean).join(', ')}
                        {detencionMostrada.localizacionDetencion.codigoPostal && 
                          ` CP: ${detencionMostrada.localizacionDetencion.codigoPostal}`
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Persona conocida */}
          {(detencionMostrada.nombreConocido || detencionMostrada.telefonoConocido) && (
            <div className="mt-6 bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Persona de Contacto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Nombre:</span> {' '}
                    {[detencionMostrada.nombreConocido, detencionMostrada.primerApellidoConocido, detencionMostrada.segundoApellidoConocido]
                      .filter(Boolean).join(' ') || 'No disponible'
                    }
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">Teléfono:</span> {detencionMostrada.telefonoConocido || 'No disponible'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección 4: Disposiciones/Oficiales que pusieron a disposición */}
        {detencionMostrada.disposiciones && detencionMostrada.disposiciones.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200" id={`disposiciones-${detencionActiva}`}>
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Oficiales que Pusieron a Disposición ({detencionMostrada.disposiciones.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detencionMostrada.disposiciones.map((oficial, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-[#c2b186] mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm mb-1">
                        {[oficial.nombre, oficial.primerApellido, oficial.segundoApellido]
                          .filter(Boolean).join(' ') || `Oficial ${index + 1}`
                        }
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        {oficial.cargoGrado && (
                          <p><span className="font-medium">Cargo/Grado:</span> {oficial.cargoGrado}</p>
                        )}
                        {oficial.adscripcion && (
                          <p><span className="font-medium">Adscripción:</span> {oficial.adscripcion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sección 5: Pertenencias */}
        {detencionMostrada.pertenencias && detencionMostrada.pertenencias.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200" id={`pertenencias-${detencionActiva}`}>
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              Pertenencias ({detencionMostrada.pertenencias.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detencionMostrada.pertenencias.map((pertenencia, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-[#c2b186] mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#4d4725] text-sm mb-1">
                        {pertenencia.tipo || `Objeto ${index + 1}`}
                      </h4>
                      {pertenencia.descripcion && (
                        <p className="text-sm text-gray-700 mb-2">{pertenencia.descripcion}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs">
                        {pertenencia.estado && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {pertenencia.estado}
                          </span>
                        )}
                        {pertenencia.destino && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                            Destino: {pertenencia.destino}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {detencionMostrada.observaciones && (
          <div className="pt-6 border-t border-gray-200" id={`observaciones-${detencionActiva}`}>
            <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              Observaciones
            </h3>
            
            <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
              <p className="text-sm text-gray-700 leading-relaxed">
                {detencionMostrada.observaciones}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnexoDetenciones;