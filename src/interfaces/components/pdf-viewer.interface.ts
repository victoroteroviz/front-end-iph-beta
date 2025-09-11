/**
 * Interfaces para el componente PDFViewer reutilizable
 * Permite visualizar e imprimir documentos PDF
 */

export interface PDFViewerProps {
  /** URL o ruta del archivo PDF (puede ser URL externa, blob, data URI, o ruta local) */
  url: string;
  /** Nombre del archivo para mostrar en la UI */
  fileName?: string;
  /** Tipo de URL del PDF para optimizar la carga */
  urlType?: 'external' | 'blob' | 'data' | 'local';
  /** Headers personalizados para requests HTTP (solo para URLs externas) */
  httpHeaders?: Record<string, string>;
  /** Configuración de CORS para URLs externas */
  withCredentials?: boolean;
  /** Mostrar botón de impresión */
  showPrintButton?: boolean;
  /** Mostrar botón de descarga */
  showDownloadButton?: boolean;
  /** Mostrar controles de navegación */
  showNavigation?: boolean;
  /** Mostrar controles de zoom */
  showZoomControls?: boolean;
  /** Mostrar barra de herramientas completa */
  showToolbar?: boolean;
  /** Altura del visor PDF */
  height?: string | number;
  /** Ancho del visor PDF */
  width?: string | number;
  /** Clases CSS personalizadas */
  className?: string;
  /** Página inicial a mostrar */
  initialPage?: number;
  /** Zoom inicial */
  initialZoom?: number;
  /** Callback cuando se presiona imprimir */
  onPrint?: (fileName?: string) => void;
  /** Callback cuando se presiona descargar */
  onDownload?: (fileName?: string) => void;
  /** Callback cuando ocurre un error */
  onError?: (error: Error) => void;
  /** Callback cuando el PDF se carga exitosamente */
  onLoadSuccess?: (numPages: number) => void;
  /** Callback cuando cambia la página */
  onPageChange?: (page: number) => void;
  /** Callback cuando cambia el zoom */
  onZoomChange?: (zoom: number) => void;
  /** Modo debug para mostrar text layer visualmente */
  debugMode?: boolean;
  /** Habilitar/deshabilitar text layer (default: true) */
  enableTextLayer?: boolean;
}

export interface PDFViewerState {
  /** Número total de páginas */
  numPages: number | null;
  /** Página actual */
  currentPage: number;
  /** Nivel de zoom actual */
  zoom: number;
  /** Estado de carga */
  isLoading: boolean;
  /** Error si existe */
  error: Error | null;
  /** PDF cargado exitosamente */
  isLoaded: boolean;
}

export interface PDFToolbarProps {
  /** Número total de páginas */
  numPages: number;
  /** Página actual */
  currentPage: number;
  /** Zoom actual */
  zoom: number;
  /** Nombre del archivo */
  fileName?: string;
  /** Mostrar botón de impresión */
  showPrintButton?: boolean;
  /** Mostrar botón de descarga */
  showDownloadButton?: boolean;
  /** Mostrar controles de navegación */
  showNavigation?: boolean;
  /** Mostrar controles de zoom */
  showZoomControls?: boolean;
  /** URL del archivo para descarga */
  fileUrl?: string;
  /** Callback para ir a página anterior */
  onPreviousPage: () => void;
  /** Callback para ir a página siguiente */
  onNextPage: () => void;
  /** Callback para ir a página específica */
  onGoToPage: (page: number) => void;
  /** Callback para hacer zoom in */
  onZoomIn: () => void;
  /** Callback para hacer zoom out */
  onZoomOut: () => void;
  /** Callback para resetear zoom */
  onZoomReset: () => void;
  /** Callback para imprimir */
  onPrint: () => void;
  /** Callback para descargar */
  onDownload: () => void;
}

export interface PDFPageInputProps {
  /** Página actual */
  currentPage: number;
  /** Número total de páginas */
  numPages: number;
  /** Callback cuando cambia la página */
  onPageChange: (page: number) => void;
}

export interface PDFZoomControlsProps {
  /** Zoom actual (en porcentaje) */
  zoom: number;
  /** Zoom mínimo permitido */
  minZoom?: number;
  /** Zoom máximo permitido */
  maxZoom?: number;
  /** Incremento de zoom */
  zoomStep?: number;
  /** Callback para hacer zoom in */
  onZoomIn: () => void;
  /** Callback para hacer zoom out */
  onZoomOut: () => void;
  /** Callback para resetear zoom */
  onZoomReset: () => void;
  /** Callback cuando cambia el zoom */
  onZoomChange?: (zoom: number) => void;
}

export interface PDFPrintOptions {
  /** Título del documento para impresión */
  title?: string;
  /** Orientación de la página */
  orientation?: 'portrait' | 'landscape';
  /** Tamaño de papel */
  paperSize?: 'A4' | 'Letter' | 'Legal';
  /** Incluir encabezados/pies de página del navegador */
  includeHeaders?: boolean;
  /** Rango de páginas a imprimir */
  pageRange?: {
    from: number;
    to: number;
  };
}

export interface PDFDownloadOptions {
  /** Nombre del archivo de descarga */
  fileName?: string;
  /** Tipo de descarga */
  downloadType?: 'pdf' | 'blob';
  /** Callback de progreso de descarga */
  onProgress?: (progress: number) => void;
  /** Forzar descarga incluso si es URL externa */
  forceDownload?: boolean;
}

// Tipos de URL soportados
export type PDFUrlType = 'external' | 'blob' | 'data' | 'local';

// Helper para detectar el tipo de URL
export interface PDFUrlInfo {
  type: PDFUrlType;
  isValid: boolean;
  canDownload: boolean;
  requiresCors: boolean;
}

export interface PDFErrorState {
  /** Código de error */
  code?: string;
  /** Mensaje de error */
  message: string;
  /** Error original */
  originalError?: Error;
  /** Tipo de error */
  type: 'load' | 'render' | 'network' | 'permission' | 'unknown';
}

// Enums para configuraciones
export enum PDFZoomMode {
  FIT_WIDTH = 'fit-width',
  FIT_HEIGHT = 'fit-height',
  FIT_PAGE = 'fit-page',
  ACTUAL_SIZE = 'actual-size',
  CUSTOM = 'custom'
}

export enum PDFViewMode {
  SINGLE_PAGE = 'single',
  CONTINUOUS = 'continuous',
  FACING = 'facing'
}

// Re-exportar interfaces de react-pdf si las necesitamos
export type { PDFDocumentProxy, PDFPageProxy } from 'react-pdf';