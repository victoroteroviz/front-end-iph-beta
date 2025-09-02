/**
 * Componente AnexosGallery
 * Galería de fotos/anexos del informe con modal de visualización
 */

import React, { useState } from 'react';
import { Image, Eye } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IAnexosGalleryProps, IAnexoFoto } from '../../../../../interfaces/components/informe-ejecutivo.interface';
import { buildImageUrl } from '../../../../../helper/image/image-url.helper';
import { logError, logInfo } from '../../../../../helper/log/logger.helper';

const AnexosGallery: React.FC<IAnexosGalleryProps> = ({
  anexos,
  loading = false,
  className = '',
  onImageClick
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  const handleImageError = (anexoId: string) => {
    setImageErrors(prev => new Set([...prev, anexoId]));
    setImageLoading(prev => {
      const newSet = new Set([...prev]);
      newSet.delete(anexoId);
      return newSet;
    });
    logError('AnexosGallery', `Error al cargar imagen con ID: ${anexoId}`, 'handleImageError');
  };

  const handleImageLoad = (anexoId: string) => {
    setImageLoading(prev => {
      const newSet = new Set([...prev]);
      newSet.delete(anexoId);
      return newSet;
    });
    logInfo('AnexosGallery', `Imagen cargada exitosamente: ${anexoId}`, { anexoId });
  };

  const handleImageLoadStart = (anexoId: string) => {
    setImageLoading(prev => new Set([...prev, anexoId]));
  };

  const getImageUrl = (anexo: IAnexoFoto): string => {
    return buildImageUrl(anexo.ruta_foto, `anexo_${anexo.id}`);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (!anexos || anexos.length === 0) {
    return (
      <SectionWrapper
        title="Anexos"
        loading={loading}
        className={className}
      >
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Image className="h-12 w-12 mr-3" />
          <div className="text-center">
            <p className="font-semibold font-poppins">No hay anexos disponibles</p>
            <p className="text-sm font-poppins mt-1">
              No se registraron fotos o documentos para este informe
            </p>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      title="Anexos"
      loading={loading}
      className={className}
    >
      <div className="space-y-4">
        
        {/* Información de la galería */}
        <div className="flex items-center justify-between text-sm text-gray-600 font-poppins">
          <p>
            {anexos.length} anexo{anexos.length !== 1 ? 's' : ''} disponible{anexos.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs">
            Haz clic en una imagen para ampliar
          </p>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {anexos.map((anexo, index) => (
            <div 
              key={anexo.id}
              className="relative group cursor-pointer bg-white rounded-lg overflow-hidden aspect-square border shadow-sm"
              onClick={() => onImageClick?.(anexo, index)}
            >
              
              {/* Estado de carga */}
              {imageLoading.has(anexo.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#4d4725] border-t-transparent"></div>
                </div>
              )}

              {/* Placeholder de fondo */}
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>

              {/* Imagen o placeholder de error */}
              {!imageErrors.has(anexo.id) ? (
                <div className="w-full h-full relative z-20">
                  <img
                    src={getImageUrl(anexo)}
                    alt={anexo.descripcion || `Anexo ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={() => handleImageError(anexo.id)}
                    onLoad={() => handleImageLoad(anexo.id)}
                    onLoadStart={() => handleImageLoadStart(anexo.id)}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <div className="text-center">
                    <Image className="h-8 w-8 mx-auto mb-1" />
                    <p className="text-xs">Error al cargar</p>
                  </div>
                </div>
              )}

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                  <Eye className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs">Ver imagen</p>
                </div>
              </div>

              {/* Número de imagen */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>

              {/* Información del archivo */}
              {(anexo.tipo_archivo || anexo.tamaño_archivo) && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {anexo.tipo_archivo && (
                    <span className="uppercase">{anexo.tipo_archivo}</span>
                  )}
                  {anexo.tamaño_archivo && (
                    <span className="ml-1">({formatFileSize(anexo.tamaño_archivo)})</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 font-poppins space-y-1 pt-2 border-t">
          <p>• Las imágenes se cargan de forma diferida para mejorar el rendimiento</p>
          <p>• Usa el modal para ver las imágenes en tamaño completo</p>
          {anexos.some(a => a.fecha_subida) && (
            <p>• Algunas imágenes incluyen información de fecha de carga</p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default AnexosGallery;