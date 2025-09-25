/**
 * Componente DetalleIPH
 * Vista dummy para mostrar el detalle completo de un registro IPH
 * 
 * @note Este es un componente dummy para futura implementación
 * Muestra información detallada del registro seleccionado
 */

import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle,
  CheckCircle,
  Edit3,
  Save,
  Camera,
  Paperclip,
  MessageSquare,
  Shield,
  Eye,
  Download
} from 'lucide-react';

// Interfaces
import type { DetalleIPHProps } from '../../../../../interfaces/components/historialIph.interface';

// Configuración de estatus
import { estatusConfig } from '../../../../../mock/historial-iph';

// Helpers
import { logInfo } from '../../../../../helper/log/logger.helper';

/**
 * Componente de detalle de IPH (dummy)
 * 
 * @param props - Props del componente
 * @returns JSX.Element del detalle completo
 */
const DetalleIPH: React.FC<DetalleIPHProps> = ({
  registro,
  onClose,
  onEditarEstatus,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedObservaciones, setEditedObservaciones] = useState(registro.observaciones || '');
  const [selectedTab, setSelectedTab] = useState<'general' | 'evidencias' | 'seguimiento' | 'documentos'>('general');

  /**
   * Maneja el guardado de cambios
   */
  const handleSaveChanges = () => {
    logInfo('DetalleIPH', 'Guardando cambios en observaciones', { registroId: registro.id });
    // TODO: Implementar guardado real cuando esté el API
    setIsEditing(false);
    // Aquí se llamaría a un servicio para actualizar las observaciones
  };

  /**
   * Maneja el cambio de estatus
   */
  const handleEstatusChange = (nuevoEstatus: typeof registro.estatus) => {
    if (onEditarEstatus && nuevoEstatus !== registro.estatus) {
      logInfo('DetalleIPH', 'Cambiando estatus desde detalle', { 
        registroId: registro.id, 
        nuevoEstatus 
      });
      onEditarEstatus(nuevoEstatus);
    }
  };

  /**
   * Formatea fecha y hora
   */
  const formatDateTime = (fecha: string, hora: string) => {
    try {
      const date = new Date(fecha);
      const formattedDate = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const [hours, minutes] = hora.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      const formattedTime = time.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return { formattedDate, formattedTime };
    } catch {
      return { formattedDate: fecha, formattedTime: hora };
    }
  };

  const { formattedDate, formattedTime } = formatDateTime(registro.fechaCreacion.toISOString().split('T')[0], registro.fechaCreacion.toTimeString().split(' ')[0]);
  const estatusInfo = estatusConfig[registro.estatus as keyof typeof estatusConfig] || estatusConfig['N/D'];

  /**
   * Datos dummy para la vista detallada
   */
  const dummyData = {
    ubicacionCompleta: {
      direccion: registro.ubicacion
        ? `Lat: ${registro.ubicacion.latitud}, Lng: ${registro.ubicacion.longitud}`
        : 'Sin ubicación especificada',
      colonia: 'Col. Centro',
      municipio: 'Ciudad de México',
      cp: '06000',
      referencias: 'Frente al Oxxo, edificio de color azul'
    },
    involucrados: [
      {
        id: 1,
        tipo: 'Víctima',
        nombre: 'Ana María González López',
        edad: 28,
        telefono: '55-1234-5678',
        domicilio: 'Calle Reforma #123'
      },
      {
        id: 2,
        tipo: 'Testigo',
        nombre: 'Carlos Rodríguez Méndez',
        edad: 35,
        telefono: '55-8765-4321',
        domicilio: 'Av. Insurgentes #456'
      }
    ],
    evidencias: [
      {
        id: 1,
        tipo: 'Fotografía',
        descripcion: 'Foto del lugar de los hechos',
        archivo: 'evidencia_001.jpg',
        fechaCaptura: '2024-01-15 08:35:00'
      },
      {
        id: 2,
        tipo: 'Video',
        descripcion: 'Video de cámara de seguridad',
        archivo: 'video_001.mp4',
        fechaCaptura: '2024-01-15 08:30:00'
      },
      {
        id: 3,
        tipo: 'Documento',
        descripcion: 'Declaración de testigo',
        archivo: 'declaracion_001.pdf',
        fechaCaptura: '2024-01-15 10:00:00'
      }
    ],
    seguimiento: [
      {
        id: 1,
        fecha: '2024-01-15 08:30:00',
        accion: 'Registro inicial del caso',
        usuario: registro.usuario,
        descripcion: 'Se registra el caso con evidencia inicial'
      },
      {
        id: 2,
        fecha: '2024-01-15 10:00:00',
        accion: 'Toma de declaración',
        usuario: registro.usuario,
        descripcion: 'Se toma declaración de testigo principal'
      },
      {
        id: 3,
        fecha: '2024-01-16 14:30:00',
        accion: 'Revisión de evidencias',
        usuario: 'Supervisor García',
        descripcion: 'Revisión y validación de evidencias recopiladas'
      }
    ]
  };

  /**
   * Configuración de tabs
   */
  const tabs = [
    { id: 'general', label: 'Información General', icon: FileText },
    { id: 'evidencias', label: 'Evidencias', icon: Camera },
    { id: 'seguimiento', label: 'Seguimiento', icon: MessageSquare },
    { id: 'documentos', label: 'Documentos', icon: Paperclip }
  ] as const;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#f8f0e7]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield size={24} className="text-[#4d4725]" />
              <h2 className="text-xl font-bold text-[#4d4725]">
                Detalle IPH - {registro.numeroReferencia}
              </h2>
            </div>
            
            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: estatusInfo.bgColor,
                color: estatusInfo.color
              }}
            >
              {estatusInfo.label}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditarEstatus && (
              <select
                value={registro.estatus}
                onChange={(e) => handleEstatusChange(e.target.value as typeof registro.estatus)}
                className="
                  px-3 py-1.5 border border-gray-300 rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725]
                  cursor-pointer
                "
              >
                {Object.entries(estatusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            )}
            
            <button
              onClick={onClose}
              className="
                p-2 text-gray-400 hover:text-gray-600
                hover:bg-gray-100 rounded-full
                transition-colors duration-200
              "
              aria-label="Cerrar detalle"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${selectedTab === id
                    ? 'border-[#4d4725] text-[#4d4725]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedTab === 'general' && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={20} className="text-[#4d4725]" />
                    Información del Caso
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Fecha:</span>
                      <span className="font-medium">{formattedDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Hora:</span>
                      <span className="font-medium">{formattedTime}</span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-600">Ubicación:</span>
                        <div className="font-medium">{dummyData.ubicacionCompleta.direccion}</div>
                        <div className="text-sm text-gray-500">
                          {dummyData.ubicacionCompleta.colonia}, {dummyData.ubicacionCompleta.municipio}
                        </div>
                        <div className="text-sm text-gray-500">C.P. {dummyData.ubicacionCompleta.cp}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Referencias: {dummyData.ubicacionCompleta.referencias}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Tipo de delito:</span>
                      <span className="font-medium">{registro.tipoDelito}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Usuario responsable:</span>
                      <span className="font-medium">{registro.usuario}</span>
                    </div>
                  </div>
                </div>

                {/* Involucrados */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User size={20} className="text-[#4d4725]" />
                    Personas Involucradas
                  </h3>
                  
                  <div className="space-y-3">
                    {dummyData.involucrados.map((persona) => (
                      <div key={persona.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${persona.tipo === 'Víctima' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                            }
                          `}>
                            {persona.tipo}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{persona.nombre}</div>
                          <div className="text-sm text-gray-600">Edad: {persona.edad} años</div>
                          <div className="text-sm text-gray-600">Tel: {persona.telefono}</div>
                          <div className="text-sm text-gray-600">Domicilio: {persona.domicilio}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare size={20} className="text-[#4d4725]" />
                    Observaciones
                  </h3>
                  
                  <button
                    onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                    className="
                      flex items-center gap-2 px-3 py-1.5 text-sm
                      bg-[#4d4725] text-white rounded-md
                      hover:bg-[#3a3519] transition-colors
                    "
                  >
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                    {isEditing ? 'Guardar' : 'Editar'}
                  </button>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={editedObservaciones}
                    onChange={(e) => setEditedObservaciones(e.target.value)}
                    className="
                      w-full h-24 p-3 border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-[#4d4725]
                    "
                    placeholder="Agregar observaciones..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {registro.observaciones || 'Sin observaciones registradas'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'evidencias' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera size={20} className="text-[#4d4725]" />
                Evidencias del Caso (Dummy)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dummyData.evidencias.map((evidencia) => (
                  <div key={evidencia.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{evidencia.tipo}</span>
                      <div className="flex items-center gap-2">
                        <button className="text-[#4d4725] hover:text-[#3a3519]">
                          <Eye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">{evidencia.descripcion}</div>
                      <div className="text-xs text-gray-500">Archivo: {evidencia.archivo}</div>
                      <div className="text-xs text-gray-500">Capturado: {evidencia.fechaCaptura}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <Camera size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Vista dummy - Las evidencias se implementarán con el API real</p>
              </div>
            </div>
          )}

          {selectedTab === 'seguimiento' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare size={20} className="text-[#4d4725]" />
                Historial de Seguimiento (Dummy)
              </h3>
              
              <div className="space-y-4">
                {dummyData.seguimiento.map((evento, index) => (
                  <div key={evento.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#4d4725] rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                      {index < dummyData.seguimiento.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{evento.accion}</h4>
                          <span className="text-xs text-gray-500">{evento.fecha}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{evento.descripcion}</p>
                        <div className="flex items-center gap-2">
                          <User size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">{evento.usuario}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'documentos' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Paperclip size={20} className="text-[#4d4725]" />
                Documentos Adjuntos (Dummy)
              </h3>
              
              <div className="text-center py-16 text-gray-500">
                <Paperclip size={64} className="mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">Documentos por implementar</h4>
                <p className="text-sm">
                  Esta sección mostrará documentos oficiales, reportes y archivos adjuntos
                  cuando se implemente la integración con el API real.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <strong>Nota:</strong> Esta es una vista dummy para desarrollo. 
              Los datos reales se cargarán cuando esté disponible la integración con el API.
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="
                  px-4 py-2 border border-gray-300 rounded-md
                  text-gray-700 bg-white hover:bg-gray-50
                  transition-colors
                "
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleIPH;