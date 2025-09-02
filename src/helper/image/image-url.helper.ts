/**
 * Helper para el manejo de URLs de imágenes
 * Centraliza la lógica de construcción de URLs para diferentes tipos de rutas
 */

import { API_BASE_URL } from '../../config/env.config';
import { logInfo, logError } from '../log/logger.helper';

/**
 * Tipos de rutas de imagen soportadas
 */
export type ImagePathType = 'absolute-url' | 'uploads' | 'server-absolute' | 'mobile' | 'relative';

/**
 * Interface para el resultado del análisis de ruta
 */
export interface ImagePathAnalysis {
  type: ImagePathType;
  originalPath: string;
  cleanPath: string;
  finalUrl: string;
  isValid: boolean;
}

/**
 * Detecta el tipo de ruta de imagen
 */
export const detectImagePathType = (path: string): ImagePathType => {
  const cleanPath = path.trim();

  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return 'absolute-url';
  }

  if (cleanPath.startsWith('/data/user') || cleanPath.startsWith('/storage')) {
    return 'mobile';
  }

  if (cleanPath.startsWith('uploads/')) {
    return 'uploads';
  }

  if (cleanPath.startsWith('/')) {
    return 'server-absolute';
  }

  return 'relative';
};

/**
 * Construye la URL final para una imagen basada en su ruta
 * @param imagePath - Ruta de la imagen
 * @param context - Contexto para logging (opcional)
 * @returns URL final construida
 */
export const buildImageUrl = (imagePath: string, context?: string): string => {
  // Validar entrada
  if (!imagePath || !imagePath.trim()) {
    logError('ImageUrlHelper', `Ruta de imagen vacía o inválida`, context || 'buildImageUrl');
    return '';
  }

  const cleanPath = imagePath.trim();
  const pathType = detectImagePathType(cleanPath);
  let finalUrl: string;

  switch (pathType) {
    case 'absolute-url':
      finalUrl = cleanPath;
      break;

    case 'mobile':
      finalUrl = `${API_BASE_URL}/files/mobile${cleanPath}`;
      break;

    case 'uploads':
      finalUrl = `${API_BASE_URL}/${cleanPath}`;
      break;

    case 'server-absolute':
      finalUrl = `${API_BASE_URL}${cleanPath}`;
      break;

    case 'relative':
      finalUrl = `${API_BASE_URL}/${cleanPath}`;
      break;

    default:
      logError('ImageUrlHelper', `Tipo de ruta no reconocido: ${pathType}`, context || 'buildImageUrl');
      finalUrl = `${API_BASE_URL}/${cleanPath}`;
  }

  // Log para debugging en desarrollo
  if (context) {
    logInfo('ImageUrlHelper', 'URL de imagen construida', {
      context,
      pathType,
      originalPath: imagePath,
      cleanPath,
      finalUrl,
      apiBaseUrl: API_BASE_URL
    });
  }

  return finalUrl;
};

/**
 * Analiza una ruta de imagen y retorna información detallada
 * @param imagePath - Ruta de la imagen
 * @returns Análisis completo de la ruta
 */
export const analyzeImagePath = (imagePath: string): ImagePathAnalysis => {
  const isValid = !!(imagePath && imagePath.trim());
  const cleanPath = isValid ? imagePath.trim() : '';
  const type = isValid ? detectImagePathType(cleanPath) : 'relative';
  const finalUrl = isValid ? buildImageUrl(imagePath) : '';

  return {
    type,
    originalPath: imagePath,
    cleanPath,
    finalUrl,
    isValid
  };
};

/**
 * Valida si una URL de imagen es accesible
 * @param imageUrl - URL de la imagen
 * @returns Promise que resuelve si la imagen es accesible
 */
export const validateImageUrl = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    logError('ImageUrlHelper', `Error al validar URL de imagen: ${imageUrl}`, 'validateImageUrl');
    return false;
  }
};

/**
 * Construye múltiples URLs de imagen de forma eficiente
 * @param imagePaths - Array de rutas de imagen
 * @param context - Contexto para logging
 * @returns Array de URLs construidas
 */
export const buildMultipleImageUrls = (imagePaths: string[], context?: string): string[] => {
  return imagePaths.map((path, index) => 
    buildImageUrl(path, context ? `${context}_${index}` : undefined)
  );
};

// Exportar como default para facilitar imports
export default {
  buildImageUrl,
  detectImagePathType,
  analyzeImagePath,
  validateImageUrl,
  buildMultipleImageUrls
};
