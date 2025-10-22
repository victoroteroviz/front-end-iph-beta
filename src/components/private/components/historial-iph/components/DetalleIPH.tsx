/**
 * Componente DetalleIPH
 * Vista para mostrar el detalle completo de un registro IPH
 *
 * @description
 * Componente modal que muestra información detallada de un IPH específico.
 * Integrado con el servicio `getBasicDataByIphId` para obtener datos reales del servidor.
 *
 * **Características:**
 * - Carga dinámica de datos básicos desde el backend
 * - Visualización de evidencias fotográficas con galería modal
 * - Sistema de tabs para organizar información
 * - Construcción automática de URLs de evidencias
 * - Estados de carga y manejo de errores
 *
 * @version 2.1.0 - Optimización de logging
 * @since 2024-01-30
 */

import React, { useState, useEffect, useCallback } from 'react';
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

// Config
import { getStatusConfig } from '../../../../../config/status.config';
import { API_BASE_URL } from '../../../../../config/env.config';

// Hooks
import { useDetalleIPH } from '../hooks/useDetalleIPH';

// Helpers
import { logInfo, logDebug, logError } from '../../../../../helper/log/logger.helper';
import { logWarning } from '../../../../../helper/log/logger.helper';

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
  const [selectedTab, setSelectedTab] = useState<'general' | 'evidencias'>('general');
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
    logInfo('DetalleIPH', 'Componente montado', {
      registroId: registro.id,
      numeroReferencia: registro.numeroReferencia,
      usuario: registro.usuario
    });

    return () => {
      logInfo('DetalleIPH', 'Componente desmontado', { registroId: registro.id });
    };
  }, [registro.id, registro.numeroReferencia, registro.usuario]);

  /**
   * Construye la URL completa de una evidencia
   * Maneja tanto URLs completas como rutas relativas
   */
  const buildEvidenciaUrl = useCallback((url: string): string => {
    if (!url) {
      logWarning('DetalleIPH', 'URL de evidencia vacía recibida', { iphId: registro.id });
      return '';
    }

    let fullUrl: string;

    // Si ya es una URL completa (http:// o https://), retornarla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url;
    }
    // Si empieza con /, agregar solo la base URL
    else if (url.startsWith('/')) {
      fullUrl = `${API_BASE_URL}${url}`;
    }
    // Si no empieza con /, agregar base URL con /
    else {
      fullUrl = `${API_BASE_URL}/${url}`;
    }

    logDebug('DetalleIPH', 'URL de evidencia construida', {
      iphId: registro.id,
      urlOriginal: url,
      urlFinal: fullUrl,
      esUrlCompleta: url.startsWith('http')
    });

    return fullUrl;
  }, [registro.id]);

  /**
   * Abre el modal de imagen
   */
  const handleImageClick = useCallback((url: string, index: number) => {
    const fullUrl = buildEvidenciaUrl(url);
    setSelectedImage(fullUrl);
    setSelectedImageIndex(index);

    logInfo('DetalleIPH', 'Evidencia seleccionada para visualización', {
      iphId: registro.id,
      imagenIndex: index + 1,
      totalImagenes: datosBasicos?.evidencias?.length || 0,
      url: fullUrl
    });
  }, [buildEvidenciaUrl, registro.id, datosBasicos?.evidencias?.length]);

  /**
   * Cierra el modal de imagen
   */
  const handleCloseImageModal = useCallback(() => {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    // Operación UI trivial - no requiere logging
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

      logDebug('DetalleIPH', 'Navegación a evidencia anterior', {
        iphId: registro.id,
        imagenAnterior: selectedImageIndex + 1,
        imagenNueva: newIndex + 1,
        totalImagenes: evidencias.length
      });
    }
  }, [selectedImageIndex, buildEvidenciaUrl, registro.id]);

  /**
   * Navega a la siguiente imagen
   */
  const handleNextImage = useCallback((evidencias: string[]) => {
    if (selectedImageIndex < evidencias.length - 1) {
      const newIndex = selectedImageIndex + 1;
      const fullUrl = buildEvidenciaUrl(evidencias[newIndex]);
      setSelectedImageIndex(newIndex);
      setSelectedImage(fullUrl);

      logDebug('DetalleIPH', 'Navegación a evidencia siguiente', {
        iphId: registro.id,
        imagenAnterior: selectedImageIndex + 1,
        imagenNueva: newIndex + 1,
        totalImagenes: evidencias.length
      });
    }
  }, [selectedImageIndex, buildEvidenciaUrl, registro.id]);

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
   * Formatea fecha y hora desde Date
   */
  const formatDateTime = useCallback((fecha: Date | string) => {
    try {
      const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

      const formattedDate = date.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const formattedTime = date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return { formattedDate, formattedTime };
    } catch (error) {
      logError('DetalleIPH', error, `Error al formatear fecha - iphId: ${registro.id}, fechaRecibida: ${fecha}, tipoFecha: ${typeof fecha}`);
      return {
        formattedDate: 'Fecha no disponible',
        formattedTime: 'Hora no disponible'
      };
    }
  }, [registro.id]);

  // Determinar si hay datos cargados del servicio
  const hasServiceData = datosBasicos !== null;

  // Datos a mostrar: priorizar datos del servicio, fallback a datos del registro local
  const displayData = hasServiceData ? datosBasicos : {
    id: registro.id,
    numero: registro.numeroReferencia,
    tipoIph: registro.tipoDelito,
    delito: registro.tipoDelito,
    tipoDelito: registro.tipoDelito,
    estatus: registro.estatus,
    fechaCreacion: registro.fechaCreacion,
    ubicacion: registro.ubicacion ? {
      calle: `Lat: ${registro.ubicacion.latitud}, Lng: ${registro.ubicacion.longitud}`,
      colonia: '',
      estado: '',
      municipio: '',
      ciudad: ''
    } : undefined,
    observaciones: registro.observaciones || 'Sin observaciones',
    primerRespondiente: {
      nombre: registro.usuario.split(' ')[0] || '',
      apellidoPaterno: registro.usuario.split(' ')[1] || '',
      apellidoMaterno: registro.usuario.split(' ')[2] || ''
    },
    evidencias: []
  };

  /**
   * Efecto para detectar uso de datos locales (fallback crítico)
   */
  useEffect(() => {
    // Solo loguear si NO hay datos del servicio, NO está cargando, y NO hay error
    // (significa que el hook decidió no cargar o el servicio no respondió)
    if (!hasServiceData && !loadingDatosBasicos && errorDatosBasicos) {
      logWarning('DetalleIPH', 'Usando datos locales por fallo del servicio', {
        iphId: registro.id,
        numeroReferencia: registro.numeroReferencia,
        errorServicio: errorDatosBasicos,
        datosLocalesDisponibles: {
          tipoDelito: registro.tipoDelito,
          usuario: registro.usuario,
          estatus: registro.estatus
        }
      });
    } else if (!hasServiceData && !loadingDatosBasicos && !errorDatosBasicos) {
      logWarning('DetalleIPH', 'Usando datos locales - servicio no disponible', {
        iphId: registro.id,
        numeroReferencia: registro.numeroReferencia,
        razon: 'Servicio no respondió o datos no cargados'
      });
    }
  }, [hasServiceData, loadingDatosBasicos, errorDatosBasicos, registro]);

  /**
   * Log cuando se cargan exitosamente los datos del servicio
   */
  useEffect(() => {
    if (hasServiceData && datosBasicos) {
      logInfo('DetalleIPH', 'Datos del servicio cargados y mostrados', {
        iphId: datosBasicos.id,
        numero: datosBasicos.numero,
        tipoIph: datosBasicos.tipoIph,
        estatus: datosBasicos.estatus,
        evidencias: datosBasicos.evidencias?.length || 0,
        primerRespondiente: datosBasicos.primerRespondiente
          ? `${datosBasicos.primerRespondiente.nombre} ${datosBasicos.primerRespondiente.apellidoPaterno}`
          : 'N/A'
      });
    }
  }, [hasServiceData, datosBasicos]);

  // Formatear fecha y hora
  const { formattedDate, formattedTime } = formatDateTime(displayData.fechaCreacion);

  // Obtener configuración de estatus
  const estatusInfo = getStatusConfig(displayData.estatus);

  // Obtener nombre completo del primer respondiente
  const nombrePrimerRespondiente = displayData.primerRespondiente
    ? `${displayData.primerRespondiente.nombre} ${displayData.primerRespondiente.apellidoPaterno} ${displayData.primerRespondiente.apellidoMaterno}`.trim()
    : registro.usuario;

  // Obtener ubicación formateada
  const ubicacionTexto = displayData.ubicacion?.calle || 'Sin ubicación especificada';
  const ubicacionSecundaria = displayData.ubicacion?.colonia && displayData.ubicacion?.municipio
    ? `${displayData.ubicacion.colonia}, ${displayData.ubicacion.municipio}`
    : null;

  /**
   * Configuración de tabs
   */
  const tabs = [
    { id: 'general' as const, label: 'Información General', icon: FileText },
    ...(displayData.evidencias.length > 0 ? [{
      id: 'evidencias' as const,
      label: `Evidencias (${displayData.evidencias.length})`,
      icon: Camera
    }] : [])
  ];

  /**
   * Handler para cambio de tab con logging
   */
  const handleTabChange = useCallback((tabId: 'general' | 'evidencias') => {
    const tabAnterior = selectedTab;
    setSelectedTab(tabId);

    logDebug('DetalleIPH', 'Cambio de tab', {
      iphId: registro.id,
      tabAnterior,
      tabNuevo: tabId,
      evidenciasDisponibles: displayData.evidencias.length
    });
  }, [selectedTab, registro.id, displayData.evidencias.length]);

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
                Detalle IPH - {displayData.numero}
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
                onClick={() => handleTabChange(id)}
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
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">Ubicación:</span>
                      <div className="font-medium">{ubicacionTexto}</div>
                      {ubicacionSecundaria && (
                        <div className="text-sm text-gray-500">{ubicacionSecundaria}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Tipo de delito:</span>
                    <span className="font-medium">{displayData.tipoDelito || displayData.delito}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Tipo de IPH:</span>
                    <span className="font-medium">{displayData.tipoIph}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Primer Respondiente:</span>
                    <span className="font-medium">{nombrePrimerRespondiente}</span>
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
                    {displayData.observaciones}
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

              {displayData.evidencias.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {displayData.evidencias.map((url, index) => {
                    const fullUrl = buildEvidenciaUrl(url);

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
                          onError={() => {
                            logError(
                              'DetalleIPH', 
                              new Error('Error al cargar evidencia'), 
                              `iphId: ${registro.id}, numeroIph: ${registro.numeroReferencia}, imagenIndex: ${index + 1}/${displayData.evidencias.length}, url: ${fullUrl}, esUrlCompleta: ${url.startsWith('http')}`
                            );
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
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasServiceData ? (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Datos cargados desde el servidor</span>
                </div>
              ) : loadingDatosBasicos ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Cargando datos del servidor...</span>
                </div>
              ) : errorDatosBasicos ? (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span>Error: {errorDatosBasicos}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span>Mostrando datos locales</span>
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
              {selectedImageIndex + 1} / {displayData.evidencias.length}
            </div>

            {/* Botón anterior */}
            {selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviousImage(displayData.evidencias);
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
                  logError('DetalleIPH', new Error('Error al cargar imagen en modal'), `iphId: ${registro.id}, numeroIph: ${registro.numeroReferencia}, imagenIndex: ${selectedImageIndex + 1}/${displayData.evidencias.length}, url: ${selectedImage}`);
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23374151" width="600" height="600"/%3E%3Cg%3E%3Ccircle cx="300" cy="280" r="60" fill="%239ca3af" opacity="0.5"/%3E%3Crect x="270" y="250" width="60" height="60" fill="%239ca3af" opacity="0.5" rx="8"/%3E%3C/g%3E%3Ctext fill="%23e5e7eb" x="50%25" y="65%25" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="system-ui"%3EImagen no disponible%3C/text%3E%3Ctext fill="%239ca3af" x="50%25" y="72%25" dominant-baseline="middle" text-anchor="middle" font-size="14" font-family="system-ui"%3EVerifique la URL de la evidencia%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Botón siguiente */}
            {selectedImageIndex < displayData.evidencias.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage(displayData.evidencias);
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
