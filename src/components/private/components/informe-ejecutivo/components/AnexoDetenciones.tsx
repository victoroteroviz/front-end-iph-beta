/**
 * Componente AnexoDetenciones (Anexo A. Detenciones)
 * Muestra la información detallada de las detenciones del IPH
 * Incluye datos del detenido, ubicación, pertenencias y disposiciones
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Package, 
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  Phone,
  Hash,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  FileText
} from 'lucide-react';
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
  } catch (error) {
    return null;
  }
};

/**
 * Componente para mostrar un campo booleano con íconos
 */
const CampoBooleano: React.FC<{ label: string; valor: boolean | undefined; className?: string }> = ({ 
  label, 
  valor, 
  className = '' 
}) => (
  <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${className}`}>
    {valor ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )}
    <div>
      <p className="text-sm font-medium text-[#4d4725]">{label}</p>
      <p className="text-xs text-gray-600">{valor ? 'Sí' : 'No'}</p>
    </div>
  </div>
);

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AnexoDetenciones: React.FC<AnexoDetencionesProps> = ({
  detencion,
  className = ''
}) => {
  // Estado para manejar múltiples detenciones
  const [detencionActiva, setDetencionActiva] = useState(0);
  
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
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Navegación entre detenciones si hay múltiples */}
        {detenciones.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-[#c2b186]/20">
            <button
              onClick={() => setDetencionActiva(Math.max(0, detencionActiva - 1))}
              disabled={detencionActiva === 0}
              className={`p-2 rounded-lg transition-colors ${
                detencionActiva === 0
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
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
              onClick={() => setDetencionActiva(Math.min(detenciones.length - 1, detencionActiva + 1))}
              disabled={detencionActiva === detenciones.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                detencionActiva === detenciones.length - 1
                  ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                  : 'text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Sección 1: Información del detenido */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <User className="h-5 w-5 text-white" />
            </div>
            Información del Detenido
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
                      Identificación: {detencionMostrada.identificacion || 'No disponible'}
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
                  {detencionMostrada.edad || edadCalculada || 'No disponible'} años
                  {edadCalculada && detencionMostrada.edad && edadCalculada.toString() !== detencionMostrada.edad && (
                    <span className="text-xs text-gray-500 ml-1">
                      (calculada: {edadCalculada})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
        <div className="mb-6 pt-6 border-t border-gray-200">
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
              valor={detencionMostrada.lesionVisible === 'Sí'} 
              className={detencionMostrada.lesionVisible === 'Sí' ? 'border-yellow-300 bg-yellow-50' : ''}
            />
            <CampoBooleano 
              label="Padecimiento" 
              valor={detencionMostrada.padecimiento === 'Sí'} 
              className={detencionMostrada.padecimiento === 'Sí' ? 'border-yellow-300 bg-yellow-50' : ''}
            />
            <CampoBooleano 
              label="Grupo vulnerable" 
              valor={detencionMostrada.grupoVulnerable === 'Sí'} 
              className={detencionMostrada.grupoVulnerable === 'Sí' ? 'border-blue-300 bg-blue-50' : ''}
            />
            <CampoBooleano 
              label="Grupo delictivo" 
              valor={detencionMostrada.grupoDelictivo === 'Sí'} 
              className={detencionMostrada.grupoDelictivo === 'Sí' ? 'border-red-300 bg-red-50' : ''}
            />
          </div>
        </div>

        {/* Sección 3: Ubicación y direcciones */}
        <div className="mb-6 pt-6 border-t border-gray-200">
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
                      <p className="text-xs text-gray-600">
                        {[
                          detencionMostrada.localizacionDetenido.colonia,
                          detencionMostrada.localizacionDetenido.municipio,
                          detencionMostrada.localizacionDetenido.estado
                        ].filter(Boolean).join(', ')}
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
            {detencionMostrada.lugarDetencion && (
              <div className="bg-white p-4 rounded-lg border border-[#c2b186]/20">
                <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Lugar de Detención
                </h4>
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

        {/* Sección 4: Pertenencias */}
        {detencionMostrada.pertenencias && detencionMostrada.pertenencias.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-200">
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
          <div className="pt-6 border-t border-gray-200">
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