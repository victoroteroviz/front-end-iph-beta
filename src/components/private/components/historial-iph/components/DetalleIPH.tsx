/**
 * Componente DetalleIPH
 * Vista para mostrar el detalle completo de un registro IPH
 * Integrado con el servicio getBasicDataByIphId para datos reales
 *
 * @note Integrado con servicio real de datos básicos de IPH
 * Muestra información detallada del registro seleccionado
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Camera,
  MessageSquare,
  Shield,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn
} from 'lucide-react';

// Interfaces
import type { DetalleIPHProps } from '../../../../../interfaces/components/historialIph.interface';

// Configuración de estatus
import { estatusConfig } from '../../../../../mock/historial-iph';

// Hooks
import { useDetalleIPH } from '../hooks/useDetalleIPH';

// Helpers
import { logInfo, logDebug, logError } from '../../../../../helper/log/logger.helper';

// Config
import { API_BASE_URL } from '../../../../../config/env.config';

/**
 * Componente de detalle de IPH integrado con servicio real
 *
 * @param props - Props del componente
 * @returns JSX.Element del detalle completo
 */
const DetalleIPH: React.FC<DetalleIPHProps> = ({
  registro,
  onClose,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'general' | 'evidencias' | 'seguimiento'>('general');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Hook para cargar datos básicos del IPH
  const {
    datosBasicos,
    loading: loadingDatosBasicos,
    error: errorDatosBasicos
  } = useDetalleIPH({
    iphId: registro.id,
    autoLoad: true
  });

  // Log cuando se carga el componente
  useEffect(() => {
    logInfo('DetalleIPH', 'Componente montado', { registroId: registro.id });
    return () => {
      logInfo('DetalleIPH', 'Componente desmontado', { registroId: registro.id });
    };
  }, [registro.id]);

  /**
   * Construye la URL completa de una evidencia
   * Maneja tanto URLs completas como rutas relativas
   */
  const buildEvidenciaUrl = useCallback((url: string): string => {
    if (!url) return '';

    // Si ya es una URL completa (http:// o https://), retornarla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si empieza con /, agregar solo la base URL
    if (url.startsWith('/')) {
      return `${API_BASE_URL}${url}`;
    }

    // Si no empieza con /, agregar base URL con /
    return `${API_BASE_URL}/${url}`;
  }, []);

  /**
   * Abre el modal de imagen
   */
  const handleImageClick = useCallback((url: string, index: number) => {
    const fullUrl = buildEvidenciaUrl(url);
    setSelectedImage(fullUrl);
    setSelectedImageIndex(index);
    logDebug('DetalleIPH', 'Abriendo modal de imagen', { url: fullUrl, index });
  }, [buildEvidenciaUrl]);

  /**
   * Cierra el modal de imagen
   */
  const handleCloseImageModal = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    logDebug('DetalleIPH', 'Cerrando modal de imagen');
  }, []);

  /**
   * Navega a la imagen anterior
   */
  const handlePreviousImage = useCallback((evidencias: string[]) => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      const fullUrl = buildEvidenciaUrl(evidencias[newIndex]);
      setSelectedImageIndex(newIndex);
      setSelectedImage(fullUrl);
    }
  }, [selectedImageIndex, buildEvidenciaUrl]);

  /**
   * Navega a la siguiente imagen
   */
  const handleNextImage = useCallback((evidencias: string[]) => {
    if (selectedImageIndex < evidencias.length - 1) {
      const newIndex = selectedImageIndex + 1;
      const fullUrl = buildEvidenciaUrl(evidencias[newIndex]);
      setSelectedImageIndex(newIndex);
      setSelectedImage(fullUrl);
    }
  }, [selectedImageIndex, buildEvidenciaUrl]);

  /**
   * Maneja el evento de la tecla Escape para cerrar el modal de imagen
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        handleCloseImageModal();
      }
    };

    // Agregar listener solo si hay imagen seleccionada
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, handleCloseImageModal]);

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

  // Usar datos básicos del servicio si están disponibles, fallback a registro
  const datosActuales = datosBasicos || {
    numero: registro.numeroReferencia,
    tipoIph: registro.tipoDelito,
    delito: registro.tipoDelito,
    estatus: registro.estatus,
    fechaCreacion: registro.fechaCreacion,
    ubicacion: registro.ubicacion ? {
      calle: `Lat: ${registro.ubicacion.latitud}, Lng: ${registro.ubicacion.longitud}`,
      colonia: '',
      estado: '',
      municipio: '',
      ciudad: ''
    } : undefined,
    observaciones: registro.observaciones || '',
    primerRespondiente: {
      nombre: registro.usuario.split(' ')[0] || '',
      apellidoPaterno: registro.usuario.split(' ')[1] || '',
      apellidoMaterno: registro.usuario.split(' ')[2] || ''
    },
    evidencias: [],
    tipoDelito: registro.tipoDelito
  };

  const { formattedDate, formattedTime } = formatDateTime(registro.fechaCreacion.toISOString().split('T')[0], registro.fechaCreacion.toTimeString().split(' ')[0]);
  const estatusInfo = estatusConfig[datosActuales.estatus as keyof typeof estatusConfig] || estatusConfig['N/D'];

  /**
   * Datos para la vista detallada (mezcla de reales y dummy)
   */
  const dummyData = useMemo(() => ({
    ubicacionCompleta: {
      direccion: datosActuales.ubicacion?.calle || 'Sin ubicación especificada',
      colonia: datosActuales.ubicacion?.colonia || 'Col. Centro',
      municipio: datosActuales.ubicacion?.municipio || 'Ciudad de México',
      ciudad: datosActuales.ubicacion?.ciudad || '',
      estado: datosActuales.ubicacion?.estado || '',
      cp: '06000',
      referencias: 'Información detallada disponible próximamente'
    },
    involucrados: [
      {
        id: 1,
        tipo: 'Primer Respondiente',
        nombre: datosActuales.primerRespondiente
          ? `${datosActuales.primerRespondiente.nombre} ${datosActuales.primerRespondiente.apellidoPaterno} ${datosActuales.primerRespondiente.apellidoMaterno}`.trim()
          : registro.usuario,
        edad: 0,
        telefono: 'No disponible',
        domicilio: 'No disponible'
      }
    ],
    // Las evidencias ahora solo manejan URLs de imágenes
    evidenciasUrls: datosActuales.evidencias || [],
    seguimiento: [
      {
        id: 1,
        fecha: new Date(datosActuales.fechaCreacion).toLocaleString(),
        accion: 'Registro inicial del caso',
        usuario: datosActuales.primerRespondiente
          ? `${datosActuales.primerRespondiente.nombre} ${datosActuales.primerRespondiente.apellidoPaterno}`.trim()
          : registro.usuario,
        descripcion: `Se registra el IPH tipo ${datosActuales.tipoIph} con estatus ${datosActuales.estatus}`
      },
      {
        id: 2,
        fecha: new Date(datosActuales.fechaCreacion).toLocaleString(),
        accion: 'Datos básicos registrados',
        usuario: 'Sistema',
        descripcion: `Número de referencia: ${datosActuales.numero || registro.numeroReferencia}`
      }
    ]
  }), [datosActuales, registro.usuario, registro.numeroReferencia]);

  /**
   * Configuración de tabs - Condicional según evidencias disponibles
   */
  const tabs = useMemo(() => {
    const baseTabs: Array<{ id: 'general' | 'evidencias' | 'seguimiento'; label: string; icon: typeof FileText }> = [
      { id: 'general' as const, label: 'Información General', icon: FileText }
    ];

    // Solo mostrar pestaña de evidencias si hay evidencias
    if (dummyData.evidenciasUrls && dummyData.evidenciasUrls.length > 0) {
      baseTabs.push({
        id: 'evidencias' as const,
        label: `Evidencias (${dummyData.evidenciasUrls.length})`,
        icon: Camera
      });
    }

    // Pestaña de seguimiento siempre visible
    baseTabs.push({
      id: 'seguimiento' as const,
      label: 'Seguimiento',
      icon: MessageSquare
    });

    return baseTabs;
  }, [dummyData.evidenciasUrls]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#f8f0e7]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield size={24} className="text-[#4d4725]" />
              <h2 className="text-xl font-bold text-[#4d4725]">
                Detalle IPH - {datosActuales.numero || registro.numeroReferencia}
              </h2>
            </div>

            {/* Indicador de carga */}
            {loadingDatosBasicos && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 size={16} className="animate-spin" />
                <span>Cargando datos...</span>
              </div>
            )}

            {/* Indicador de error */}
            {errorDatosBasicos && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle size={16} />
                <span>Error al cargar datos completos</span>
              </div>
            )}
            
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
            <button
              onClick={onClose}
              className="
                p-2 text-gray-400 hover:text-gray-600
                hover:bg-gray-100 rounded-full
                transition-colors duration-200 cursor-pointer
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
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
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
                      <span className="font-medium">{datosActuales.tipoDelito || datosActuales.delito}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Tipo de IPH:</span>
                      <span className="font-medium">{datosActuales.tipoIph}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Primer Respondiente:</span>
                      <span className="font-medium">
                        {datosActuales.primerRespondiente
                          ? `${datosActuales.primerRespondiente.nombre} ${datosActuales.primerRespondiente.apellidoPaterno} ${datosActuales.primerRespondiente.apellidoMaterno}`.trim()
                          : registro.usuario}
                      </span>
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
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#4d4725]" />
                  Observaciones
                </h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {datosActuales.observaciones || 'Sin observaciones registradas'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'evidencias' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera size={20} className="text-[#4d4725]" />
                Evidencias Fotográficas
              </h3>

              {dummyData.evidenciasUrls.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {dummyData.evidenciasUrls.map((url, index) => {
                    const fullUrl = buildEvidenciaUrl(url);
                    logDebug('DetalleIPH', 'Renderizando miniatura', { index, url: fullUrl });

                    return (
                      <div
                        key={index}
                        className="group"
                        onClick={() => handleImageClick(url, index)}
                        style={{
                          position: 'relative',
                          width: '100%',
                          paddingBottom: '100%',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb',
                          backgroundColor: '#f3f4f6',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <img
                          src={fullUrl}
                          alt={`Evidencia ${index + 1}`}
                          className="group-hover:scale-110 transition-transform duration-300"
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onLoad={() => {
                            logDebug('DetalleIPH', '✅ Imagen cargada y renderizada', {
                              index,
                              url: fullUrl,
                              timestamp: new Date().toISOString()
                            });
                          }}
                          onError={() => {
                            logError('DetalleIPH', 'Imagen no disponible', `Error al cargar imagen ${index + 1}: ${fullUrl}`);
                          }}
                        />

                        {/* Overlay con efecto hover */}
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none'
                          }}
                        >
                          <div
                            className="group-hover:scale-110 transition-transform duration-300"
                            style={{
                              backgroundColor: 'white',
                              borderRadius: '50%',
                              padding: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                            }}
                          >
                            <ZoomIn
                              size={32}
                              className="text-[#4d4725]"
                              strokeWidth={2.5}
                            />
                          </div>
                        </div>

                        {/* Número de evidencia */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: '#4d4725',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          zIndex: 10
                        }}>
                          {index + 1}
                        </div>

                        {/* Sombra adicional en hover */}
                        <div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            position: 'absolute',
                            inset: '-4px',
                            borderRadius: '12px',
                            boxShadow: '0 12px 32px rgba(77, 71, 37, 0.4)',
                            pointerEvents: 'none',
                            zIndex: -1
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Camera size={64} className="mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No hay evidencias disponibles</h4>
                  <p className="text-sm">
                    No se encontraron evidencias fotográficas para este IPH.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'seguimiento' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#4d4725]" />
                  Historial de Seguimiento
                </h3>
                <span className="
                  px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium
                  rounded-full border border-yellow-300
                ">
                  Próximamente
                </span>
              </div>
              
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
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {datosBasicos ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>
                    <strong>Datos básicos cargados desde el servidor.</strong> Algunos datos detallados aún son de demostración.
                  </span>
                </div>
              ) : loadingDatosBasicos ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Cargando datos del servidor...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span>
                    <strong>Mostrando datos locales.</strong> {errorDatosBasicos ? `Error: ${errorDatosBasicos}` : 'Datos del servidor no disponibles.'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="
                  px-4 py-2 border border-gray-300 rounded-md
                  text-gray-700 bg-white hover:bg-gray-50
                  transition-colors cursor-pointer
                "
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de visualización de imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            {/* Botón cerrar */}
            <button
              onClick={handleCloseImageModal}
              className="
                absolute top-4 right-4 p-3 bg-white hover:bg-gray-100
                rounded-full text-gray-900 transition-all z-10
                shadow-lg hover:shadow-xl cursor-pointer
              "
              aria-label="Cerrar imagen"
            >
              <X size={24} />
            </button>

            {/* Contador de imágenes */}
            <div className="
              absolute top-4 left-4 px-4 py-2 bg-white
              rounded-full text-gray-900 text-sm font-semibold z-10
              shadow-lg
            ">
              {selectedImageIndex + 1} / {dummyData.evidenciasUrls.length}
            </div>

            {/* Botón anterior */}
            {selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage(dummyData.evidenciasUrls);
                }}
                className="
                  absolute left-4 p-4 bg-white hover:bg-gray-100
                  rounded-full text-gray-900 transition-all
                  shadow-lg hover:shadow-xl cursor-pointer
                "
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            {/* Imagen */}
            <div className="flex items-center justify-center max-w-full max-h-full">
              <img
                src={selectedImage}
                alt={`Evidencia ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-gray-800"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  logError('DetalleIPH', 'Error en modal de imagen', `No se pudo cargar: ${selectedImage}`);
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23374151" width="600" height="600"/%3E%3Cg%3E%3Ccircle cx="300" cy="280" r="60" fill="%239ca3af" opacity="0.5"/%3E%3Crect x="270" y="250" width="60" height="60" fill="%239ca3af" opacity="0.5" rx="8"/%3E%3C/g%3E%3Ctext fill="%23e5e7eb" x="50%25" y="65%25" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="system-ui"%3EImagen no disponible%3C/text%3E%3Ctext fill="%239ca3af" x="50%25" y="72%25" dominant-baseline="middle" text-anchor="middle" font-size="14" font-family="system-ui"%3EVerifique la URL de la evidencia%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Botón siguiente */}
            {selectedImageIndex < dummyData.evidenciasUrls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage(dummyData.evidenciasUrls);
                }}
                className="
                  absolute right-4 p-4 bg-white hover:bg-gray-100
                  rounded-full text-gray-900 transition-all
                  shadow-lg hover:shadow-xl cursor-pointer
                "
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleIPH;