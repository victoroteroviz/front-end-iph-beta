/**
 * Componente AnexoArchivos
 * Muestra archivos del IPH con preview y modal de visualización
 * Soporte para vista lista/grid, filtros y preview por tipo
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import {
  FileText, Info, File, FileImage, FileVideo, FileAudio,
  Grid3X3, List, Filter, X, ZoomIn, Play, Volume2,
  Eye, Maximize2
} from 'lucide-react';

// Interfaces
import type { IArchivo } from '../../../../../interfaces/iph/iph.interface';

// Componente reutilizable
import { PDFViewer } from '../../../common';

// Configuración
import { API_BASE_URL } from '../../../../../config/env.config';

// =====================================================
// INTERFACES Y TIPOS
// =====================================================

interface AnexoArchivosProps {
  archivos?: IArchivo[] | IArchivo;
  className?: string;
}

type ViewMode = 'list' | 'grid';
type FileType = 'all' | 'video' | 'image' | 'audio' | 'document';

interface FileModalProps {
  archivo: IArchivo;
  isOpen: boolean;
  onClose: () => void;
}

interface FilePreviewProps {
  archivo: IArchivo;
  className?: string;
}


// =====================================================
// HELPERS
// =====================================================

/**
 * Obtiene el ícono apropiado según el tipo de archivo
 */
const getFileIcon = (tipo: string | undefined) => {
  if (!tipo) return <File className="h-5 w-5" />;
  
  const tipoLower = tipo.toLowerCase();
  
  if (tipoLower.includes('imagen') || tipoLower.includes('image') || tipoLower.includes('img')) {
    return <FileImage className="h-5 w-5" />;
  }
  
  if (tipoLower.includes('video') || tipoLower.includes('mp4') || tipoLower.includes('mov')) {
    return <FileVideo className="h-5 w-5" />;
  }
  
  if (tipoLower.includes('audio') || tipoLower.includes('mp3') || tipoLower.includes('wav')) {
    return <FileAudio className="h-5 w-5" />;
  }
  
  return <FileText className="h-5 w-5" />;
};

/**
 * Obtiene el color del badge según el tipo de archivo
 */
const getTypeBadgeColor = (tipo: string | undefined) => {
  if (!tipo) return 'bg-gray-100 text-gray-600';
  
  const tipoLower = tipo.toLowerCase();
  
  if (tipoLower.includes('imagen') || tipoLower.includes('image') || tipoLower.includes('img')) {
    return 'bg-blue-100 text-blue-700';
  }
  
  if (tipoLower.includes('video') || tipoLower.includes('mp4') || tipoLower.includes('mov')) {
    return 'bg-purple-100 text-purple-700';
  }
  
  if (tipoLower.includes('audio') || tipoLower.includes('mp3') || tipoLower.includes('wav')) {
    return 'bg-green-100 text-green-700';
  }
  
  if (tipoLower.includes('documento') || tipoLower.includes('pdf') || tipoLower.includes('certificado')) {
    return 'bg-red-100 text-red-700';
  }
  
  return 'bg-yellow-100 text-yellow-700';
};

/**
 * Obtiene el tipo normalizado de archivo para filtros
 */
const getFileType = (tipo: string | undefined, archivo?: string): FileType => {
  if (!tipo) return 'document';
  
  const tipoLower = tipo.toLowerCase();
  const archivoLower = archivo?.toLowerCase() || '';
  
  if (tipoLower.includes('imagen') || tipoLower.includes('image') || tipoLower.includes('img') ||
      archivoLower.includes('.jpg') || archivoLower.includes('.jpeg') || 
      archivoLower.includes('.png') || archivoLower.includes('.gif') || archivoLower.includes('.webp')) {
    return 'image';
  }
  
  if (tipoLower.includes('video') || tipoLower.includes('mp4') || tipoLower.includes('mov') ||
      archivoLower.includes('.mp4') || archivoLower.includes('.mov') || 
      archivoLower.includes('.avi') || archivoLower.includes('.webm')) {
    return 'video';
  }
  
  if (tipoLower.includes('audio') || tipoLower.includes('mp3') || tipoLower.includes('wav') ||
      archivoLower.includes('.mp3') || archivoLower.includes('.wav') || 
      archivoLower.includes('.ogg') || archivoLower.includes('.m4a')) {
    return 'audio';
  }
  
  // Detectar PDFs específicamente
  if (tipoLower.includes('pdf') || archivoLower.includes('.pdf')) {
    return 'document';
  }
  
  return 'document';
};

/**
 * Determina si el archivo es un PDF
 */
const isPDFFile = (tipo: string | undefined, archivo?: string): boolean => {
  const tipoLower = tipo?.toLowerCase() || '';
  const archivoLower = archivo?.toLowerCase() || '';
  return tipoLower.includes('pdf') || archivoLower.includes('.pdf');
};


/**
 * Componente para mostrar preview de archivo
 * Optimizado con memo para evitar re-renders innecesarios
 */
const FilePreview: React.FC<FilePreviewProps> = memo(({ archivo, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer para lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observerRef.current.observe(container);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isVisible]);
  
  // Cleanup para videos
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, []);
  
  const fileType = getFileType(archivo.tipo, archivo.archivo);
  
  // Función para construir la URL completa usando configuración centralizada
  const getFullPath = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Limpiar la ruta para evitar dobles barras
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };
  
  const fullPath = getFullPath(archivo.archivo);

  switch (fileType) {
    case 'image':
      return (
        <div className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
          {!imageError && fullPath ? (
            <img 
              src={fullPath} 
              alt={archivo.titulo || 'Imagen'}
              className="w-full h-full object-cover"
              onError={() => {
                console.warn('Error cargando imagen:', fullPath);
                setImageError(true);
              }}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
              <FileImage className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500 font-medium">Imagen</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <ZoomIn className="h-4 w-4 text-white" />
          </div>
          <div className="absolute bottom-1 left-1 bg-blue-600 text-white rounded px-2 py-0.5">
            <span className="text-xs font-bold">IMG</span>
          </div>
        </div>
      );
    
    case 'video':
      return (
        <div 
          ref={containerRef}
          className={`relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden ${className}`}
        >
          {!videoError && fullPath && isVisible ? (
            <>
              {/* Video simplificado sin manipulación de tiempo */}
              <video 
                ref={videoRef}
                src={fullPath}
                className="w-full h-full object-cover opacity-70"
                preload="none"
                muted
                playsInline
                onError={() => {
                  console.warn('Error cargando video preview:', fullPath);
                  setVideoError(true);
                }}
                style={{ 
                  filter: 'brightness(0.8) contrast(1.1)',
                  pointerEvents: 'none'
                }}
              />
              
              {/* Overlay con gradiente y botón play centrado */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
                  <Play className="h-4 w-4 text-white drop-shadow-lg fill-white/80" />
                </div>
              </div>
              
              {/* Badge con estilo mejorado */}
              <div className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-sm text-white rounded px-2 py-0.5">
                <span className="text-xs font-bold">VIDEO</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <FileVideo className="h-6 w-6 text-gray-300 mb-1" />
              <span className="text-xs text-gray-300 font-medium">{!isVisible ? 'Cargando...' : 'No disponible'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4 text-white drop-shadow-lg" />
          </div>
        </div>
      );
    
    case 'audio':
      return (
        <div className={`relative w-full h-full bg-green-100 rounded-lg flex flex-col items-center justify-center ${className}`}>
          <Volume2 className="h-6 w-6 text-green-600 mb-1" />
          <span className="text-xs text-green-700 font-medium">Audio</span>
          <div className="absolute bottom-1 left-1 bg-green-600 text-white rounded px-2 py-0.5">
            <span className="text-xs font-bold">AUDIO</span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4 text-green-800" />
          </div>
        </div>
      );
    
    default: {
      // Para PDFs y otros documentos
      const isPDF = isPDFFile(archivo.tipo, archivo.archivo);
      
      if (isPDF) {
        return (
          <div className={`relative w-full h-full bg-gradient-to-br from-red-50 to-red-100 rounded-lg overflow-hidden ${className}`}>
            <div className="w-full h-full flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 text-red-600 mb-1" />
              <span className="text-xs text-red-700 font-medium text-center">PDF</span>
            </div>
            
            <div className="absolute bottom-1 left-1 bg-red-600 text-white rounded px-2 py-0.5">
              <span className="text-xs font-bold">PDF</span>
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Eye className="h-4 w-4 text-red-800" />
            </div>
          </div>
        );
      }
      
      return (
        <div className={`relative w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center ${className}`}>
          <FileText className="h-6 w-6 text-gray-600 mb-1" />
          <span className="text-xs text-gray-600 font-medium">Documento</span>
          <div className="absolute bottom-1 left-1 bg-gray-600 text-white rounded px-2 py-0.5">
            <span className="text-xs font-bold">DOC</span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Eye className="h-4 w-4 text-gray-800" />
          </div>
        </div>
      );
    }
  }
});

/**
 * Componente Modal para visualizar archivo
 */
const FileModal: React.FC<FileModalProps> = ({ archivo, isOpen, onClose }) => {
  // Handler para tecla ESC - solo para este modal específico
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation(); // Evitar que el evento se propague al modal padre
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true); // Usar capture para interceptar antes
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileType = getFileType(archivo.tipo, archivo.archivo);
  
  // Usar la misma función para construir URLs con configuración centralizada
  const getFullPath = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_BASE_URL}/${cleanPath}`;
  };
  
  const fullPath = getFullPath(archivo.archivo);

  const renderPreview = () => {
    switch (fileType) {
      case 'image':
        return (
          <img 
            src={fullPath} 
            alt={archivo.titulo || 'Imagen'}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              console.warn('Error cargando imagen en modal:', fullPath);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            crossOrigin="anonymous"
          />
        );
      
      case 'video':
        return (
          <div className="flex flex-col items-center space-y-4 w-full">
            <video 
              controls 
              className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
              preload="metadata"
              poster="" // Evitar poster por defecto
              controlsList="nodownload"
              onError={() => {
                console.warn('Error cargando video en modal:', fullPath);
              }}
            >
              <source src={fullPath} type="video/mp4" />
              <source src={fullPath} type="video/webm" />
              <source src={fullPath} type="video/ogg" />
              Tu navegador no soporta la reproducción de video.
            </video>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {archivo.titulo || 'Video'} • Controles disponibles
              </p>
            </div>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex flex-col items-center space-y-6 p-6">
            <div className="bg-green-100 rounded-full p-8">
              <Volume2 className="h-20 w-20 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800 mb-4">
                {archivo.titulo || 'Audio'}
              </p>
              <audio 
                controls 
                className="w-full max-w-md rounded-lg"
                preload="metadata"
                onError={() => {
                  console.warn('Error cargando audio en modal:', fullPath);
                }}
                crossOrigin="anonymous"
              >
                <source src={fullPath} type="audio/mpeg" />
                <source src={fullPath} type="audio/wav" />
                <source src={fullPath} type="audio/ogg" />
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
          </div>
        );
      
      default: {
        const isPDF = isPDFFile(archivo.tipo, archivo.archivo);
        
        if (isPDF) {
          // Debug logging para PDF
          console.log('🔵 AnexoArchivos PDF Data:', {
            originalPath: archivo.archivo,
            fullPath,
            apiBaseUrl: API_BASE_URL,
            fileName: archivo.titulo
          });
          
          return (
            <div className="w-full h-full">
              <PDFViewer
                url={fullPath}
                fileName={archivo.titulo || 'Documento PDF'}
                showPrintButton={true}
                showDownloadButton={true}
                showNavigation={true}
                showZoomControls={true}
                showToolbar={true}
                height="100%"
                width="100%"
                className="border-0 h-full"
                debugMode={false}
                enableTextLayer={false}
                onError={(error) => {
                  console.error('🔴 Error cargando PDF en AnexoArchivos:', error);
                }}
                onLoadSuccess={(numPages) => {
                  console.log('✅ PDF cargado exitosamente en AnexoArchivos con', numPages, 'páginas');
                }}
                onPrint={(fileName) => {
                  console.log('🖨️ Imprimiendo desde AnexoArchivos:', fileName);
                }}
                onDownload={(fileName) => {
                  console.log('📥 Descargando desde AnexoArchivos:', fileName);
                }}
                onPageChange={(page) => {
                  console.log('📄 Página cambiada en AnexoArchivos:', page);
                }}
                onZoomChange={(zoom) => {
                  console.log('🔍 Zoom cambiado en AnexoArchivos:', zoom);
                }}
              />
            </div>
          );
        }
        
        return (
          <div className="flex flex-col items-center space-y-4">
            <FileText className="h-24 w-24 text-gray-400" />
            <div className="text-center">
              <p className="text-lg font-medium">{archivo.titulo || 'Documento'}</p>
              <p className="text-sm text-gray-500 mt-2">Tipo: {archivo.tipo}</p>
              {archivo.descripcion && (
                <p className="text-sm text-gray-600 mt-2">{archivo.descripcion}</p>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-transparent"
      onClick={(e) => {
        e.stopPropagation(); // Evitar propagación al modal padre
        if (e.target === e.currentTarget) {
          onClose(); // Solo cerrar si se hace click en el fondo
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Evitar que clicks dentro del modal lo cierren
      >
        
        {/* Header fijo con título y descripción */}
        <div className="flex-shrink-0 p-6 border-b bg-white rounded-t-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Título */}
              <h3 className="text-xl font-bold text-[#4d4725] mb-2 truncate">
                {archivo.titulo || 'Archivo'}
              </h3>
              
              {/* Descripción con scroll si es necesaria */}
              {archivo.descripcion && (
                <div className="max-h-20 overflow-y-auto">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {archivo.descripcion.length > 200 
                      ? archivo.descripcion 
                      : archivo.descripcion
                    }
                  </p>
                </div>
              )}
              
              {/* Badge del tipo de archivo */}
              <div className="mt-3">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getTypeBadgeColor(archivo.tipo)}`}>
                  {archivo.tipo || 'Archivo'}
                </span>
              </div>
            </div>
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Contenido del archivo - usar flex-1 sin altura fija */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const AnexoArchivos: React.FC<AnexoArchivosProps> = memo(({
  archivos,
  className = ''
}) => {
  
  // Estados
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [selectedFile, setSelectedFile] = useState<IArchivo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalizar archivos a array con throttling
  const archivosArray = useMemo(() => {
    if (!archivos) return [];
    return Array.isArray(archivos) ? archivos : [archivos];
  }, [archivos]);

  // Filtrar archivos según el tipo seleccionado
  const filteredArchivos = useMemo(() => {
    if (filterType === 'all') return archivosArray;
    return archivosArray.filter(archivo => getFileType(archivo.tipo, archivo.archivo) === filterType);
  }, [archivosArray, filterType]);

  // Contadores por tipo
  const typeCounts = useMemo(() => {
    const counts = {
      all: archivosArray.length,
      video: 0,
      image: 0,
      audio: 0,
      document: 0
    };
    
    archivosArray.forEach(archivo => {
      const type = getFileType(archivo.tipo, archivo.archivo);
      counts[type]++;
    });
    
    return counts;
  }, [archivosArray]);

  const hasArchivos = archivosArray.length > 0;

  // Handlers optimizados
  const handleOpenFile = useCallback((archivo: IArchivo) => {
    setSelectedFile(archivo);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFile(null);
  }, []);


  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      
      {/* Header con controles */}
      <div className="flex items-center justify-between mb-4">
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Archivos del IPH ({filteredArchivos.length})
        </h2>
        
        {hasArchivos && (
          <div className="flex items-center gap-2">
            {/* Filtros */}
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FileType)}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#c2b186]"
              >
                <option value="all">Todos ({typeCounts.all})</option>
                {typeCounts.video > 0 && <option value="video">Videos ({typeCounts.video})</option>}
                {typeCounts.image > 0 && <option value="image">Imágenes ({typeCounts.image})</option>}
                {typeCounts.audio > 0 && <option value="audio">Audios ({typeCounts.audio})</option>}
                {typeCounts.document > 0 && <option value="document">Documentos ({typeCounts.document})</option>}
              </select>
            </div>
            
            {/* Toggle Vista */}
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#c2b186] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista lista"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#c2b186] text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title="Vista cuadrícula"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Sin archivos */}
        {!hasArchivos && (
          <div className="text-center py-12">
            <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 font-poppins mb-2">
              No hay archivos disponibles
            </h3>
            <p className="text-gray-500 font-poppins">
              Este IPH no contiene archivos adjuntos
            </p>
          </div>
        )}

        {/* Con archivos */}
        {hasArchivos && (
          <>
            {/* Información general */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Info className="h-5 w-5 text-[#4d4725]" />
                <span className="font-semibold text-[#4d4725] font-poppins">
                  {filteredArchivos.length} de {archivosArray.length} archivos mostrados
                </span>
              </div>
              <p className="text-sm text-gray-600 font-poppins">
                Haz clic en cualquier archivo para ver su preview en pantalla completa.
              </p>
            </div>

            {/* Vista Lista */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredArchivos.map((archivo, index) => (
                  <div
                    key={`archivo-${index}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenFile(archivo)}
                  >
                    <div className="flex items-center">
                      {/* Preview horizontal con tamaño fijo */}
                      <div className="flex-shrink-0 w-32 h-20 flex items-center justify-center bg-gray-50">
                        <div className="w-28 h-16">
                          <FilePreview archivo={archivo} className="rounded-md" />
                        </div>
                      </div>
                      
                      {/* Información del archivo */}
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-[#4d4725]">
                              {getFileIcon(archivo.tipo)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-[#4d4725] font-poppins truncate text-base">
                                {archivo.titulo || `Archivo ${index + 1}`}
                              </h4>
                              
                              {archivo.tipo && (
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getTypeBadgeColor(archivo.tipo)}`}>
                                  {archivo.tipo}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="h-4 w-4" />
                            <Maximize2 className="h-4 w-4" />
                          </div>
                        </div>
                        
                        {/* Descripción */}
                        {archivo.descripcion && (
                          <p className="text-sm text-gray-600 font-poppins line-clamp-2 mt-2">
                            {archivo.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vista Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArchivos.map((archivo, index) => (
                  <div
                    key={`archivo-grid-${index}`}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenFile(archivo)}
                  >
                    {/* Preview con tamaño fijo */}
                    <div className="relative w-full h-40 bg-gray-50 flex items-center justify-center">
                      <div className="w-full h-full">
                        <FilePreview archivo={archivo} />
                      </div>
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded p-1">
                        <Maximize2 className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    
                    {/* Información */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-[#4d4725]">
                          {getFileIcon(archivo.tipo)}
                        </div>
                        <h4 className="font-medium text-[#4d4725] font-poppins text-sm truncate flex-1">
                          {archivo.titulo || `Archivo ${index + 1}`}
                        </h4>
                      </div>
                      
                      {archivo.tipo && (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getTypeBadgeColor(archivo.tipo)}`}>
                          {archivo.tipo}
                        </span>
                      )}
                      
                      {archivo.descripcion && (
                        <p className="text-xs text-gray-600 font-poppins line-clamp-2">
                          {archivo.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sin resultados tras filtrar */}
            {filteredArchivos.length === 0 && (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 font-poppins">
                  No hay archivos del tipo seleccionado
                </p>
              </div>
            )}
          </>
        )}

      </div>
      
      {/* Modal de visualización */}
      {selectedFile && (
        <FileModal 
          archivo={selectedFile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
});

export default AnexoArchivos;

// Configurar displayName para debugging
AnexoArchivos.displayName = 'AnexoArchivos';
FilePreview.displayName = 'FilePreview';