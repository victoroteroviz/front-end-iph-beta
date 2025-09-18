/**
 * PDF URL Helper
 * Utilitario para manejar diferentes tipos de URLs de PDF
 * Soporta URLs externas, blob URLs, data URIs y rutas locales
 * Compatible con react-pdf v10.1.0 y pdfjs-dist v5.3.93
 */

import type { PDFUrlType, PDFUrlInfo } from '../../interfaces/components/pdf-viewer.interface';
import { logInfo, logError } from '../log/logger.helper';

/**
 * Detecta el tipo de URL de PDF
 */
export const detectPdfUrlType = (url: string): PDFUrlType => {
  if (!url) return 'local';
  
  // Data URI (data:application/pdf;base64,...)
  if (url.startsWith('data:')) {
    return 'data';
  }
  
  // Blob URL (blob:...)
  if (url.startsWith('blob:')) {
    return 'blob';
  }
  
  // URL externa (http:// o https://)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'external';
  }
  
  // Ruta local (relativa o absoluta)
  return 'local';
};

/**
 * Valida si una URL de PDF es válida
 */
export const validatePdfUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  const type = detectPdfUrlType(url);
  
  switch (type) {
    case 'data':
      return url.includes('application/pdf') || url.includes('data:application/pdf');
    
    case 'blob':
      return url.startsWith('blob:');
    
    case 'external':
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    
    case 'local':
      return url.length > 0;
    
    default:
      return false;
  }
};

/**
 * Obtiene información completa sobre una URL de PDF
 */
export const getPdfUrlInfo = (url: string): PDFUrlInfo => {
  const type = detectPdfUrlType(url);
  const isValid = validatePdfUrl(url);
  
  let canDownload = false;
  let requiresCors = false;
  
  switch (type) {
    case 'data':
    case 'blob':
      canDownload = true;
      requiresCors = false;
      break;
    
    case 'external':
      canDownload = true; // Intentar, puede fallar por CORS
      requiresCors = true;
      break;
    
    case 'local':
      canDownload = true;
      requiresCors = false;
      break;
  }
  
  return {
    type,
    isValid,
    canDownload,
    requiresCors
  };
};

/**
 * Prepara la URL para react-pdf según su tipo
 */
export const preparePdfUrl = (
  url: string,
  _httpHeaders?: Record<string, string>,
  _withCredentials?: boolean
): string => {
  const urlInfo = getPdfUrlInfo(url);
  
  logInfo('PDFUrlHelper', 'Preparing PDF URL', {
    url: url.substring(0, 50) + (url.length > 50 ? '...' : ''),
    type: urlInfo.type,
    isValid: urlInfo.isValid,
    requiresCors: urlInfo.requiresCors
  });
  
  if (!urlInfo.isValid) {
    throw new Error(`URL de PDF inválida: ${url}`);
  }
  
  // Por ahora, react-pdf no soporta completamente headers customizados
  // En el futuro, esto podría expandirse para manejar configuraciones avanzadas
  return url;
};

/**
 * Descarga un PDF según su tipo de URL
 */
export const downloadPdfByType = async (
  url: string, 
  fileName: string = 'documento.pdf',
  forceDownload: boolean = false
): Promise<void> => {
  const urlInfo = getPdfUrlInfo(url);
  
  logInfo('PDFUrlHelper', 'Starting PDF download', {
    fileName,
    urlType: urlInfo.type,
    forceDownload
  });
  
  if (!urlInfo.canDownload && !forceDownload) {
    throw new Error('Esta URL no permite descarga directa');
  }
  
  try {
    switch (urlInfo.type) {
      case 'blob':
      case 'data':
        // Descarga directa para blob y data URLs
        downloadDirectly(url, fileName);
        break;
      
      case 'external':
        // Para URLs externas, intentar fetch primero
        await downloadExternalPdf(url, fileName);
        break;
      
      case 'local':
        // Para URLs locales, descarga directa
        downloadDirectly(url, fileName);
        break;
      
      default:
        throw new Error(`Tipo de URL no soportado: ${urlInfo.type}`);
    }
    
    logInfo('PDFUrlHelper', 'PDF download completed', { fileName });
  } catch (error) {
    logError('PDFUrlHelper', 'PDF download failed', String(error));
    throw error;
  }
};

/**
 * Descarga directa mediante elemento <a>
 */
const downloadDirectly = (url: string, fileName: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Descarga PDF externo via fetch
 */
const downloadExternalPdf = async (url: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    downloadDirectly(blobUrl, fileName);
    
    // Cleanup blob URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);
    
  } catch (error) {
    // Fallback: intentar descarga directa
    logError('PDFUrlHelper', 'Fetch failed, trying direct download', String(error));
    downloadDirectly(url, fileName);
  }
};

/**
 * Extrae el nombre de archivo de una URL
 */
export const extractFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop();
    
    if (fileName && fileName.includes('.pdf')) {
      return fileName;
    }
    
    // Si no hay extensión, agregar .pdf
    return fileName ? `${fileName}.pdf` : 'documento.pdf';
  } catch {
    return 'documento.pdf';
  }
};

/**
 * Singleton para manejo de PDF URLs
 */
export class PDFUrlManager {
  private static instance: PDFUrlManager;
  
  static getInstance(): PDFUrlManager {
    if (!PDFUrlManager.instance) {
      PDFUrlManager.instance = new PDFUrlManager();
    }
    return PDFUrlManager.instance;
  }
  
  /**
   * Procesa y valida una URL de PDF
   */
  processUrl(url: string): {
    processedUrl: any;
    urlInfo: PDFUrlInfo;
    suggestedFileName: string;
  } {
    const urlInfo = getPdfUrlInfo(url);
    const processedUrl = preparePdfUrl(url);
    const suggestedFileName = extractFileNameFromUrl(url);
    
    return {
      processedUrl,
      urlInfo,
      suggestedFileName
    };
  }
  
  /**
   * Descarga un PDF de forma inteligente
   */
  async downloadPdf(
    url: string, 
    fileName?: string,
    options?: { forceDownload?: boolean }
  ): Promise<void> {
    const finalFileName = fileName || extractFileNameFromUrl(url);
    await downloadPdfByType(url, finalFileName, options?.forceDownload);
  }
}