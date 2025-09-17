/**
 * Componente DatosGenerales
 * Muestra los datos básicos del IPH extraídos de I_IphData
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { Calendar, FileText, Image, Tag, CheckCircle, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { I_IphData } from '../../../../../interfaces/iph/iph.interface';

// Componente de mapa
import MapSection from './MapSection';

// Configuración de la API
import { API_BASE_URL } from '../../../../../config/env.config';

// =====================================================
// INTERFACES
// =====================================================

interface DatosGeneralesProps {
  iph: I_IphData | I_IphData[] | null;
  className?: string;
}

// Interface para el modal de imágenes
interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// =====================================================
// COMPONENTE DE MODAL DE IMÁGENES
// =====================================================

const ImageModal: React.FC<ImageModalProps> = ({ 
  isOpen, 
  images, 
  currentIndex, 
  onClose, 
  onNavigate 
}) => {
  if (!isOpen) return null;

  // Manejar teclas del teclado solo cuando el modal está abierto
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft') {
        onNavigate('prev');
      }
      if (e.key === 'ArrowRight') {
        onNavigate('next');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, onClose, onNavigate]);

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      data-modal-type="image-modal"
    >
      {/* CSS para forzar cursor pointer */}
      <style>{`
        .modal-pointer-force {
          cursor: pointer !important;
        }
        .modal-pointer-force:hover {
          cursor: pointer !important;
        }
        .modal-not-allowed {
          cursor: not-allowed !important;
        }
      `}</style>
      
      {/* Overlay */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-7xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header mejorado */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#c2b186] to-[#a89770] text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Image className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Evidencia Fotográfica
              </h3>
              <p className="text-sm text-white/90">
                Imagen {currentIndex + 1} de {images.length}
              </p>
            </div>
          </div>
          
          <div
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 group modal-pointer-force"
            title="Cerrar (Esc)"
            role="button"
            tabIndex={0}
          >
            <X className="h-6 w-6" />
          </div>
        </div>

        {/* Contenedor de imagen */}
        <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: 'calc(95vh - 180px)' }}>
          <img
            src={images[currentIndex]}
            alt={`Evidencia fotográfica ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(95vh - 200px)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8f9fa"/><rect x="50" y="50" width="500" height="300" fill="none" stroke="%23dee2e6" stroke-width="3" stroke-dasharray="10,5"/><circle cx="300" cy="150" r="40" fill="%23adb5bd"/><path d="M200 250 L250 200 L300 250 L350 200 L400 250 Z" fill="%23adb5bd"/><text x="300" y="320" font-family="Arial" font-size="18" fill="%23666" text-anchor="middle">Error al cargar la imagen</text><text x="300" y="345" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle">La imagen no está disponible o no se pudo cargar</text></svg>`;
            }}
          />

          {/* Navegación mejorada */}
          {images.length > 1 && (
            <>
              <div
                onClick={() => currentIndex > 0 && onNavigate('prev')}
                className={`absolute left-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full shadow-lg transition-all duration-200 ${
                  currentIndex === 0 
                    ? 'bg-gray-300 text-gray-500 modal-not-allowed' 
                    : 'bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white hover:scale-110 hover:shadow-xl modal-pointer-force'
                }`}
                title="Imagen anterior (←)"
                role="button"
                tabIndex={0}
              >
                <ChevronLeft className="h-8 w-8" />
              </div>
              
              <div
                onClick={() => currentIndex < images.length - 1 && onNavigate('next')}
                className={`absolute right-6 top-1/2 transform -translate-y-1/2 p-4 rounded-full shadow-lg transition-all duration-200 ${
                  currentIndex === images.length - 1 
                    ? 'bg-gray-300 text-gray-500 modal-not-allowed' 
                    : 'bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white hover:scale-110 hover:shadow-xl modal-pointer-force'
                }`}
                title="Imagen siguiente (→)"
                role="button"
                tabIndex={0}
              >
                <ChevronRight className="h-8 w-8" />
              </div>
            </>
          )}
          
          {/* Indicadores de posición */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                {images.map((_, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (index < currentIndex) {
                        for (let i = 0; i < currentIndex - index; i++) {
                          onNavigate('prev');
                        }
                      } else if (index > currentIndex) {
                        for (let i = 0; i < index - currentIndex; i++) {
                          onNavigate('next');
                        }
                      }
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-200 modal-pointer-force ${
                      index === currentIndex 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    role="button"
                    tabIndex={0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer mejorado */}
        <div className="px-6 py-4 bg-[#fdf7f1] border-t border-[#c2b186]/20">
          <div className="flex items-center justify-center gap-6 text-sm text-[#4d4725]">
            <div className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span>Navegar con flechas del teclado</span>
            </div>
            <div className="h-4 w-px bg-[#c2b186]/30"></div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
              <span>Cerrar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const DatosGenerales: React.FC<DatosGeneralesProps> = ({
  iph,
  className = ''
}) => {
  // Estados para el modal de imágenes
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Efecto para comunicar el estado del modal hijo al modal padre
  React.useEffect(() => {
    // Agregar/remover atributo en el body para indicar que hay un modal hijo abierto
    if (isImageModalOpen) {
      document.body.setAttribute('data-child-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-child-modal-open');
    }
    
    // Cleanup al desmontar el componente
    return () => {
      document.body.removeAttribute('data-child-modal-open');
    };
  }, [isImageModalOpen]);
  
  // Verificar si los datos están disponibles
  if (!iph || Array.isArray(iph)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Datos Generales IPH
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos del informe</p>
          </div>
        </div>
      </div>
    );
  }

  const iphData = iph as I_IphData;
  
  // Función helper para construir URLs de imágenes
  const buildImageUrl = (imagePath: string): string => {
    // Si no hay ruta de imagen, retornar vacío
    if (!imagePath) return '';

    // En desarrollo, API_BASE_URL puede estar vacío (usa proxy de Vite)
    if (!API_BASE_URL || API_BASE_URL.trim() === '') {
      // En desarrollo: usar rutas relativas que serán manejadas por el proxy de Vite
      return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    }

    // En producción: usar URL completa del servidor
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    } else {
      return `${API_BASE_URL}/${imagePath}`;
    }
  };

  // Construir URLs de imágenes con manejo robusto para desarrollo/producción
  const imageUrls = iphData.fotos && iphData.fotos.length > 0
    ? iphData.fotos.map((fotoPath, index) => {
        const finalUrl = buildImageUrl(fotoPath);

        // Debug logging
        console.log(`🖼️ Imagen ${index + 1}:`, {
          rutaOriginal: fotoPath,
          apiBaseUrl: API_BASE_URL || '(vacío - modo desarrollo)',
          urlFinal: finalUrl,
          modoDesarrollo: !API_BASE_URL || API_BASE_URL.trim() === ''
        });

        return finalUrl;
      })
    : [];
    
  // Debug general
  console.log('📊 DatosGenerales - Información de imágenes:', {
    cantidadFotos: iphData.fotos?.length || 0,
    fotosArray: iphData.fotos,
    urlsGeneradas: imageUrls,
    apiBaseUrl: API_BASE_URL
  });
    
  // Handlers para el modal de imágenes
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };
  
  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
  };
  
  const handleImageNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else if (direction === 'next' && currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Datos Generales IPH
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Grid principal de datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
          
          {/* Columna 1: Identificación */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Referencia</p>
                <p className="font-semibold">{iphData.nReferencia || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Folio Sistema</p>
                <p className="font-semibold">{iphData.nFolioSist || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Columna 2: Estado y Tipo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Estatus</p>
                <p className="font-semibold">{iphData.estatus || 'No disponible'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Tipo IPH</p>
                <p className="font-semibold">
                  {iphData.tipoIph?.nombre || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fecha de creación</p>
                <p className="font-semibold">
                  {iphData.fechaCreacion 
                    ? new Date(iphData.fechaCreacion).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Columna 3: Archivos y Recursos */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Archivos</p>
                <p className="font-semibold">
                  {iphData.archivos?.length || 0} archivo(s)
                </p>
                {iphData.archivos && iphData.archivos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Documentos adjuntos disponibles
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Fotos</p>
                <p className="font-semibold">
                  {iphData.fotos?.length || 0} foto{(iphData.fotos?.length || 0) !== 1 ? 's' : ''}
                </p>
                {iphData.fotos && iphData.fotos.length > 0 && (
                  <button
                    onClick={() => handleImageClick(0)}
                    className="text-xs text-[#c2b186] hover:text-[#a89770] mt-1 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                  >
                    <Eye className="h-3 w-3" />
                    Ver galería completa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional si está disponible */}
        {(iphData.hechos || iphData.observaciones) && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              
              {/* Hechos */}
              {iphData.hechos && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4d4725] mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resumen de Hechos
                  </h4>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {iphData.hechos.length > 200 
                        ? `${iphData.hechos.substring(0, 200)}...` 
                        : iphData.hechos
                      }
                    </p>
                    {iphData.hechos.length > 200 && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Vista resumida - Ver sección completa en "Narrativa de hechos"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {iphData.observaciones && (
                <div>
                  <h4 className="text-sm font-semibold text-[#4d4725] mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observaciones
                  </h4>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {iphData.observaciones.length > 200 
                        ? `${iphData.observaciones.substring(0, 200)}...` 
                        : iphData.observaciones
                      }
                    </p>
                    {iphData.observaciones.length > 200 && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Vista resumida - Ver sección completa en "Observaciones"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mapa de ubicación si está disponible */}
        {iphData.coordenadas && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-[#4d4725] mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Ubicación del Incidente
            </h4>
            
            {/* Componente de mapa */}
            {iphData.coordenadas?.latitud && iphData.coordenadas?.longitud && (
              <MapSection
                coordenadas={{
                  latitud: iphData.coordenadas.latitud,
                  longitud: iphData.coordenadas.longitud
                }}
                referencia={iphData.nReferencia}
                height="350px"
                className="mb-4"
                markerType="exclamation"
              />
            )}
            
            {/* Información de coordenadas como fallback/complemento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded border">
              <div>
                <p className="font-medium">Coordenadas del sistema:</p>
                <p className="font-mono">
                  Lat: {iphData.coordenadas.latitud}, Lng: {iphData.coordenadas.longitud}
                </p>
              </div>
              <div>
                <p className="font-medium">Precisión del mapa:</p>
                <p>Zoom dinámico (usar +/- para ajustar vista)</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Nueva sección de Galería de Imágenes después del mapa */}
        {imageUrls.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-[#4d4725] mb-6 flex items-center gap-3">
              <div className="p-2 bg-[#c2b186] rounded-lg">
                <Image className="h-5 w-5 text-white" />
              </div>
              Galería de Evidencia Fotográfica
              <span className="text-sm font-normal text-gray-600 ml-2">({imageUrls.length} imagen{imageUrls.length !== 1 ? 'es' : ''})</span>
            </h3>
            
            {/* Grid de miniaturas simplificado para debugging */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imageUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#c2b186] hover:shadow-xl transition-all duration-300"
                  onClick={() => handleImageClick(index)}
                  style={{ minHeight: '200px' }} // Altura mínima fija
                >
                  {/* Container de imagen con dimensiones fijas */}
                  <div className="relative w-full h-48 bg-gray-50">
                    <img
                      src={imageUrl}
                      alt={`Evidencia fotográfica ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onLoad={(e) => {
                        console.log(`✅ Imagen ${index + 1} cargada correctamente:`, imageUrl);
                        (e.target as HTMLElement).style.backgroundColor = 'transparent';
                      }}
                      onError={(e) => {
                        console.error(`❌ Error al cargar imagen ${index + 1}:`, imageUrl);
                        const target = e.target as HTMLImageElement;
                        target.style.backgroundColor = '#f87171'; // Fondo rojo para errores
                        target.alt = `Error: ${imageUrl}`;
                      }}
                      style={{ backgroundColor: '#94a3b8' }} // Fondo gris mientras carga
                    />
                    
                    {/* Overlay simple */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                        <Eye className="h-5 w-5 text-[#4d4725]" />
                      </div>
                    </div>
                    
                    {/* Número de imagen */}
                    <div className="absolute top-2 left-2 bg-[#c2b186] text-white text-sm font-semibold px-2 py-1 rounded-full">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Footer de la tarjeta */}
                  <div className="p-3 bg-white border-t">
                    <p className="text-xs font-medium text-[#4d4725] text-center">
                      Evidencia {index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Información de ayuda mejorada */}
            <div className="mt-6 p-4 bg-[#fdf7f1] border border-[#c2b186]/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-[#4d4725]">
                <Eye className="h-4 w-4 text-[#c2b186]" />
                <span>Haz clic en cualquier imagen para verla en tamaño completo con navegación</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de imágenes */}
      <ImageModal
        isOpen={isImageModalOpen}
        images={imageUrls}
        currentIndex={currentImageIndex}
        onClose={handleImageModalClose}
        onNavigate={handleImageNavigate}
      />
    </div>
  );
};

export default DatosGenerales;