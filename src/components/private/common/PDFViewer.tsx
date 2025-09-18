
/**
 * Componente PDFViewer reutilizable
 * Permite visualizar, navegar e imprimir documentos PDF
 * Utiliza react-pdf para el renderizado
 * Compatible con text layer y annotation layer
 */

import React, { useState, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Importar estilos CSS de react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Printer, 
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

// Interfaces
import type { 
  PDFViewerProps, 
  PDFViewerState,
  PDFUrlInfo
} from '../../../interfaces/components/pdf-viewer.interface';

// Helpers
import { logInfo, logError } from '../../../helper/log/logger.helper';
import { showError, showSuccess } from '../../../helper/notification/notification.helper';
import { 
  PDFUrlManager, 
  getPdfUrlInfo, 
  validatePdfUrl,
  preparePdfUrl,
  downloadPdfByType
} from '../../../helper/pdf/pdf-url.helper';

// Configurar worker de PDF.js con configuración robusta
console.log('🔧 PDFViewer configurando worker');
console.log('📋 PDF.js Version:', pdfjs.version);

// Configuración mejorada del worker con múltiples fallbacks
const configureWorker = () => {
  try {
    // Primera opción: Worker local desde public
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('✅ Worker configurado localmente:', pdfjs.GlobalWorkerOptions.workerSrc);
    return true;
  } catch {
    try {
      // Segundo fallback: CDN
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      console.log('✅ Worker configurado desde CDN:', pdfjs.GlobalWorkerOptions.workerSrc);
      return true;
    } catch {
      try {
        // Tercer fallback: import.meta.url
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
        console.log('✅ Worker configurado con import.meta.url:', pdfjs.GlobalWorkerOptions.workerSrc);
        return true;
      } catch (finalError) {
        console.error('❌ Error configurando worker PDF.js:', finalError);
        return false;
      }
    }
  }
};

const workerConfigured = configureWorker();
if (!workerConfigured) {
  console.warn('⚠️ Worker de PDF.js no configurado correctamente, algunos PDFs podrían no cargar');
}

// Inyectar estilos CSS mínimos para text layer
const injectPDFStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('pdf-viewer-styles')) {
    const style = document.createElement('style');
    style.id = 'pdf-viewer-styles';
    style.textContent = `
      /* Permitir selección de texto */
      .react-pdf__Page {
        position: relative !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }
      
      /* Estilos para canvas */
      .react-pdf__Page__canvas {
        display: block !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      
      /* Asegurar que text layer esté visible */
      .react-pdf__Page__textContent {
        opacity: 0.2 !important;
        transition: opacity 0.3s ease !important;
      }
      
      .react-pdf__Page:hover .react-pdf__Page__textContent {
        opacity: 0.3 !important;
      }
      
      /* Debug: hacer texto temporalmente visible para verificar que funciona */
      .react-pdf__Page--debug .react-pdf__Page__textContent span {
        color: rgba(255, 0, 0, 0.3) !important;
        background: rgba(255, 255, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
    console.log('✅ PDF.js enhanced styles injected');
  }
};

// Inyectar estilos al cargar
injectPDFStyles();

// =====================================================
// ERROR BOUNDARY PARA PDF
// =====================================================

interface PDFErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  PDFErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PDFErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('🔴 PDF Error Boundary caught error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children; // Continuar renderizando, solo log del error
    }
    return this.props.children;
  }
}

// =====================================================
// COMPONENTE DE TOOLBAR
// =====================================================

interface PDFToolbarProps {
  numPages: number;
  currentPage: number;
  zoom: number;
  fileName?: string;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  showNavigation?: boolean;
  showZoomControls?: boolean;
  fileUrl?: string;
  isPrinting?: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onPrint: () => void;
  onDownload: () => void;
}

const PDFToolbar: React.FC<PDFToolbarProps> = ({
  numPages,
  currentPage,
  zoom,
  fileName,
  showPrintButton = true,
  showDownloadButton = true,
  showNavigation = true,
  showZoomControls = true,
  isPrinting = false,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPrint,
  onDownload
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= numPages) {
      onGoToPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  return (
    <div className="flex items-center justify-between p-3 bg-[#fdf7f1] border-b border-[#c2b186]/20">
      {/* Información del archivo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#4d4725]" />
          <span className="text-sm font-medium text-[#4d4725] font-poppins">
            {fileName || 'Documento PDF'}
          </span>
        </div>
      </div>

      {/* Controles centrales */}
      <div className="flex items-center gap-2">
        {/* Navegación */}
        {showNavigation && (
          <>
            <button
              onClick={onPreviousPage}
              disabled={currentPage <= 1}
              className={`p-2 rounded-lg transition-colors ${
                currentPage <= 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-3">
              <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max={numPages}
                  value={pageInput}
                  onChange={handlePageInputChange}
                  className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-1"
                />
                <span className="text-sm text-gray-600 font-poppins">
                  de {numPages}
                </span>
              </form>
            </div>

            <button
              onClick={onNextPage}
              disabled={currentPage >= numPages}
              className={`p-2 rounded-lg transition-colors ${
                currentPage >= numPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white'
              }`}
              title="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Separador */}
        {showNavigation && showZoomControls && (
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
        )}

        {/* Controles de zoom */}
        {showZoomControls && (
          <>
            <button
              onClick={onZoomOut}
              className="p-2 rounded-lg bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white transition-colors"
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              onClick={onZoomReset}
              className="px-3 py-2 rounded-lg bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white transition-colors text-xs font-medium"
              title="Zoom normal"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white transition-colors"
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        {showDownloadButton && (
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-[#4d4725] hover:bg-[#c2b186] hover:text-white transition-colors text-sm font-medium"
            title="Descargar PDF"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
        )}

        {showPrintButton && (
          <button
            onClick={onPrint}
            disabled={isPrinting}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPrinting 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-[#c2b186] text-white hover:bg-[#a89770]'
            }`}
            title={isPrinting ? "Imprimiendo..." : "Imprimir PDF"}
          >
            {isPrinting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isPrinting ? "Imprimiendo..." : "Imprimir"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const PDFViewer: React.FC<PDFViewerProps> = ({
  url,
  fileName,
  httpHeaders,
  withCredentials = false,
  showPrintButton = true,
  showDownloadButton = true,
  showNavigation = true,
  showZoomControls = true,
  showToolbar = true,
  height = '600px',
  width = '100%',
  className = '',
  initialPage = 1,
  initialZoom = 1.2,
  debugMode = false,
  enableTextLayer = true,
  onPrint,
  onDownload,
  onError,
  onLoadSuccess,
  onPageChange,
  onZoomChange
}) => {
  // Estados
  const [state, setState] = useState<PDFViewerState>({
    numPages: null,
    currentPage: initialPage,
    zoom: initialZoom,
    isLoading: true, // Correcto: true al inicializar
    error: null,
    isLoaded: false
  });

  // Info de la URL
  const [urlInfo, setUrlInfo] = React.useState<PDFUrlInfo | null>(null);
  const [processedUrl, setProcessedUrl] = React.useState<string | null>(null);
  
  // Control de text layer
  const [textLayerEnabled, setTextLayerEnabled] = React.useState(enableTextLayer);
  
  // Control de impresión para evitar múltiples instancias
  const [isPrinting, setIsPrinting] = React.useState(false);

  const documentRef = useRef<HTMLDivElement>(null);
  const textLayerErrorCount = useRef(0);

  // Limpieza de recursos al desmontar el componente
  React.useEffect(() => {
    return () => {
      // Limpiar cualquier iframe de impresión residual
      const existingIframe = document.getElementById('pdf-print-iframe');
      if (existingIframe && document.body.contains(existingIframe)) {
        // Limpiar timeouts asociados
        const cleanupTimeoutId = existingIframe.dataset.cleanupTimeout;
        if (cleanupTimeoutId) {
          clearTimeout(parseInt(cleanupTimeoutId));
        }
        
        document.body.removeChild(existingIframe);
        console.log('📄 Iframe de impresión limpiado al desmontar componente');
      }
      
      // Resetear contador de errores de text layer
      textLayerErrorCount.current = 0;
    };
  }, []);

  // Función para actualizar estado - DEBE estar antes de useEffect
  const updateState = useCallback((updates: Partial<PDFViewerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoizar opciones estáticas para evitar re-renders infinitos
  const documentOptions = React.useMemo(() => ({
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/standard_fonts/',
    verbosity: 1,
    // Configuración adicional para text rendering
    useSystemFonts: false,
    disableFontFace: false,
    fontExtraProperties: true,
    // Configuraciones específicas para el worker
    isEvalSupported: false,
    enableXfa: true,
    // Configuración de timeout para evitar worker termination
    maxImageSize: 16777216,
    disableAutoFetch: false,
    disableStream: false,
    // Worker configuration
    workerPort: null,
    workerSrc: undefined // Usar el worker configurado globalmente
  }), []); // Empty dependency array - opciones completamente estáticas

  // Memoizar componentes de loading y error para evitar re-renders
  const loadingComponent = React.useMemo(() => (
    <div className="flex items-center justify-center w-full h-96 bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="h-6 w-6 animate-spin text-[#c2b186]" />
        <span className="text-xs text-gray-500">Renderizando página...</span>
      </div>
    </div>
  ), []);

  const errorComponent = React.useMemo(() => (
    <div className="flex items-center justify-center w-full h-96 bg-red-50">
      <AlertCircle className="h-6 w-6 text-red-500" />
    </div>
  ), []);

  // Procesar URL al inicializar o cambiar
  React.useEffect(() => {
    let isActive = true; // Flag para cancelar operaciones si el componente se desmonta
    
    const processUrl = async () => {
      try {
        // Validar URL
        if (!validatePdfUrl(url)) {
          throw new Error(`URL inválida: ${url}`);
        }

        // Verificar si el efecto sigue activo
        if (!isActive) return;

        // Obtener información de la URL
        const info = getPdfUrlInfo(url);
        if (!isActive) return;
        
        setUrlInfo(info);

        // Preparar URL para react-pdf
        const prepared = preparePdfUrl(url, httpHeaders, withCredentials);
        if (!isActive) return;
        
        setProcessedUrl(prepared);

        // Reset estados solo si seguimos activos
        if (isActive) {
          updateState({ 
            error: null, 
            isLoading: true,
            isLoaded: false 
          });

          console.log('🟢 PDFViewer URL processed:', {
            url: url.substring(0, 50) + (url.length > 50 ? '...' : ''),
            fileName,
            type: info.type,
            isValid: info.isValid,
            canDownload: info.canDownload,
            requiresCors: info.requiresCors
          });
        }

      } catch (error) {
        if (isActive) {
          console.error('❌ PDFViewer URL processing failed:', error);
          updateState({ 
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false 
          });
        }
      }
    };

    if (url) {
      processUrl();
    } else if (isActive) {
      updateState({ 
        error: new Error('URL requerida'),
        isLoading: false 
      });
    }
    
    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [url, fileName, httpHeaders, withCredentials, updateState]);

  // Handlers para carga exitosa
  const handleLoadSuccess = useCallback((pdf: { numPages: number }) => {
    const numPages = pdf.numPages;
    updateState({
      numPages,
      error: null,
      isLoaded: true,
      isLoading: false
    });

    logInfo('PDFViewer', 'PDF loaded successfully', {
      fileName,
      numPages,
      url
    });

    console.log('✅ PDF Document loaded:', { numPages, fileName });
    onLoadSuccess?.(numPages);
  }, [fileName, url, onLoadSuccess, updateState]);

  // Handlers para errores
  const handleLoadError = useCallback((error: Error) => {
    updateState({
      error: error,
      isLoaded: false,
      isLoading: false
    });

    logError('PDFViewer', `Error loading PDF - ${error.message}`, undefined);

    // Debug logging para desarrollo
    console.error('🔴 PDFViewer Error:', {
      fileName,
      url,
      error: error.message,
      fullError: error
    });

    showError(`Error al cargar el PDF: ${error.message}`);
    onError?.(error);
  }, [fileName, url, onError, updateState]);

  // Navegación de páginas
  const goToPreviousPage = useCallback(() => {
    if (state.currentPage > 1) {
      const newPage = state.currentPage - 1;
      updateState({ currentPage: newPage });
      onPageChange?.(newPage);
    }
  }, [state.currentPage, onPageChange, updateState]);

  const goToNextPage = useCallback(() => {
    if (state.numPages && state.currentPage < state.numPages) {
      const newPage = state.currentPage + 1;
      updateState({ currentPage: newPage });
      onPageChange?.(newPage);
    }
  }, [state.currentPage, state.numPages, onPageChange, updateState]);

  const goToPage = useCallback((pageNumber: number) => {
    if (state.numPages && pageNumber >= 1 && pageNumber <= state.numPages) {
      updateState({ currentPage: pageNumber });
      onPageChange?.(pageNumber);
    }
  }, [state.numPages, onPageChange, updateState]);

  // Controles de zoom
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(state.zoom * 1.2, 3.0);
    updateState({ zoom: newZoom });
    onZoomChange?.(newZoom);
  }, [state.zoom, onZoomChange, updateState]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(state.zoom / 1.2, 0.5);
    updateState({ zoom: newZoom });
    onZoomChange?.(newZoom);
  }, [state.zoom, onZoomChange, updateState]);

  const resetZoom = useCallback(() => {
    const newZoom = 1.2;
    updateState({ zoom: newZoom });
    onZoomChange?.(newZoom);
  }, [onZoomChange, updateState]);

  // Función mejorada para imprimir PDF con ventana nueva
  const printPDFWithWindow = useCallback(async (pdfUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Abriendo PDF en nueva ventana para impresión...');
        
        // Abrir nueva ventana con configuración optimizada
        const printWindow = window.open(
          pdfUrl,
          '_blank',
          'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
        );

        if (!printWindow) {
          throw new Error('El navegador bloqueó la ventana emergente. Permita ventanas emergentes para imprimir.');
        }

        // Configurar eventos de la nueva ventana
        let isHandled = false;
        
        const handleWindowLoad = () => {
          if (isHandled) return;
          
          try {
            console.log('📄 PDF cargado en nueva ventana, esperando renderizado...');
            
            // Esperar más tiempo para asegurar renderizado completo
            setTimeout(() => {
              if (isHandled || printWindow.closed) return;
              
              try {
                // Enfocar la ventana antes de imprimir
                printWindow.focus();
                
                // Ejecutar impresión
                printWindow.print();
                console.log('📄 ✅ Comando de impresión ejecutado en nueva ventana');
                
                isHandled = true;
                resolve();
                
                // La ventana se cierra automáticamente cuando el usuario termina con el diálogo
                
              } catch (printError) {
                console.warn('📄 Error ejecutando print() en nueva ventana:', printError);
                if (!printWindow.closed) {
                  printWindow.close();
                }
                isHandled = true;
                reject(printError);
              }
            }, 2000); // Tiempo aumentado para renderizado completo
            
          } catch (error) {
            if (!printWindow.closed) {
              printWindow.close();
            }
            isHandled = true;
            reject(error);
          }
        };

        const handleWindowError = () => {
          if (!isHandled) {
            if (!printWindow.closed) {
              printWindow.close();
            }
            isHandled = true;
            reject(new Error('Error cargando PDF en nueva ventana'));
          }
        };

        // Timeout de seguridad más largo
        const timeout = setTimeout(() => {
          if (!isHandled) {
            console.warn('📄 Timeout: PDF no cargó en tiempo esperado');
            if (!printWindow.closed) {
              printWindow.close();
            }
            isHandled = true;
            reject(new Error('Timeout: PDF no cargó en tiempo esperado (15 segundos)'));
          }
        }, 15000); // Timeout aumentado a 15 segundos

        // Configurar eventos
        printWindow.addEventListener('load', () => {
          clearTimeout(timeout);
          handleWindowLoad();
        });

        printWindow.addEventListener('error', () => {
          clearTimeout(timeout);
          handleWindowError();
        });

        // Manejar si la ventana se cierra antes de tiempo
        const checkClosed = setInterval(() => {
          if (printWindow.closed && !isHandled) {
            clearInterval(checkClosed);
            clearTimeout(timeout);
            isHandled = true;
            resolve(); // Resolver como exitoso si el usuario cerró la ventana
          }
        }, 1000);

        // Cleanup del interval después del timeout
        setTimeout(() => {
          clearInterval(checkClosed);
        }, 16000);

      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // Función de utilidad para limpiar iframes de impresión residuales
  const cleanupPrintResources = useCallback(() => {
    const existingIframe = document.getElementById('pdf-print-iframe');
    if (existingIframe && document.body.contains(existingIframe)) {
      // Limpiar timeouts asociados antes de remover
      const cleanupTimeoutId = existingIframe.dataset.cleanupTimeout;
      if (cleanupTimeoutId) {
        clearTimeout(parseInt(cleanupTimeoutId));
      }
      
      document.body.removeChild(existingIframe);
      console.log('📄 Recursos de impresión limpiados manualmente');
    }
  }, []);

  // Función mejorada para imprimir PDF con nueva ventana
  const printPDFDirect = useCallback(async (pdfUrl: string): Promise<boolean> => {
    try {
      console.log('📄 Iniciando impresión del PDF...');
      
      // Usar el nuevo método de ventana emergente
      await printPDFWithWindow(pdfUrl);
      console.log('📄 ✅ Impresión completada');
      return true;
      
    } catch (error) {
      console.warn('📄 Error en impresión:', error);
      return false;
    }
  }, [printPDFWithWindow]);

  // Función para obtener PDF como blob para impresión optimizada
  const fetchPDFAsBlob = useCallback(async (pdfUrl: string): Promise<Blob | null> => {
    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf,*/*',
          ...(httpHeaders || {})
        },
        credentials: withCredentials ? 'include' : 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && !contentType.includes('pdf')) {
        console.warn('📄 Respuesta no es PDF:', contentType);
        return null;
      }

      return await response.blob();
    } catch (error) {
      console.warn('📄 Error obteniendo PDF como blob:', error);
      return null;
    }
  }, [httpHeaders, withCredentials]);

  // Función de impresión directa del PDF - simplificada y optimizada
  const handlePrint = useCallback(async () => {
    if (!processedUrl || !urlInfo) {
      showError('PDF no disponible para impresión');
      return;
    }

    // Prevenir múltiples impresiones simultáneas
    if (isPrinting) {
      console.log('📄 Impresión ya en progreso, ignorando nueva solicitud');
      showError('Impresión en progreso, espere por favor...');
      return;
    }

    setIsPrinting(true);

    try {
      logInfo('PDFViewer', 'Print initiated', {
        fileName,
        currentPage: state.currentPage,
        totalPages: state.numPages,
        urlType: urlInfo.type
      });

      console.log('📄 Iniciando impresión para tipo:', urlInfo.type);

      // Estrategia simplificada: intentar impresión directa primero
      const printSuccess = await printPDFDirect(processedUrl);
      
      if (printSuccess) {
        showSuccess('Diálogo de impresión abierto');
        onPrint?.(fileName);
        return;
      }

      // Si falla la impresión directa, intentar con blob para URLs externas
      if (urlInfo.type === 'external') {
        console.log('📄 Impresión directa falló, intentando método blob...');
        
        try {
          const pdfBlob = await fetchPDFAsBlob(processedUrl);
          if (pdfBlob) {
            const blobUrl = URL.createObjectURL(pdfBlob);
            try {
              const blobPrintSuccess = await printPDFDirect(blobUrl);
              if (blobPrintSuccess) {
                showSuccess('PDF descargado e impreso');
                onPrint?.(fileName);
                return;
              }
            } finally {
              URL.revokeObjectURL(blobUrl);
            }
          }
        } catch (blobError) {
          console.warn('📄 No se pudo descargar PDF para impresión:', blobError);
        }
      }

      // Fallback final: usar window.print() de la página actual
      console.warn('📄 ⚠️ FALLBACK - usando window.print()');
      window.print();
      showSuccess('Vista de página enviada a impresión');
      onPrint?.(fileName);

    } catch (error) {
      console.error('📄 Error general en handlePrint:', error);
      logError('PDFViewer', 'Print error', String(error));
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('bloqueó la ventana emergente')) {
        showError('Permita ventanas emergentes en su navegador para imprimir PDFs');
      } else if (errorMessage.includes('Timeout')) {
        showError('El PDF tardó mucho en cargar. Intente con un documento más pequeño.');
      } else {
        showError(`Error al imprimir: ${errorMessage}`);
      }
    } finally {
      // Siempre limpiar la bandera de impresión
      setIsPrinting(false);
    }
  }, [processedUrl, urlInfo, fileName, state.currentPage, state.numPages, onPrint, printPDFDirect, fetchPDFAsBlob, isPrinting]);

  // Función de descarga mejorada
  const handleDownload = useCallback(async () => {
    if (!urlInfo) {
      showError('Información de URL no disponible');
      return;
    }

    if (!urlInfo.canDownload) {
      showError('Esta URL no permite descarga directa');
      return;
    }

    try {
      const finalFileName = fileName || PDFUrlManager.getInstance().processUrl(url).suggestedFileName;
      
      await downloadPdfByType(url, finalFileName);
      
      showSuccess('Descarga iniciada');
      onDownload?.(finalFileName);
      
      logInfo('PDFViewer', 'Download completed', {
        fileName: finalFileName,
        urlType: urlInfo.type,
        url: url.substring(0, 50) + '...'
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logError('PDFViewer', 'Download error', errorMsg);
      showError(`Error al descargar: ${errorMsg}`);
    }
  }, [url, fileName, urlInfo, onDownload]);

  // Memoizar callbacks para Page component - DEBE estar al nivel superior
  const handlePageLoadSuccess = useCallback((page: { originalWidth?: number; originalHeight?: number }) => {
    console.log('✅ Page rendered successfully:', {
      pageNumber: state.currentPage,
      scale: state.zoom,
      width: page?.originalWidth,
      height: page?.originalHeight
    });
  }, [state.currentPage, state.zoom]);

  const handlePageLoadError = useCallback((error: Error) => {
    console.error('🔴 Page render error:', error);
  }, []);

  const handleTextLayerSuccess = useCallback(() => {
    console.log('✅ Text layer rendered successfully for page:', state.currentPage);
  }, [state.currentPage]);

  const handleTextLayerError = useCallback((error: Error) => {
    console.warn('⚠️ Text layer render error (continuando sin text layer):', error);
    
    // Incrementar contador usando ref para evitar re-renders
    textLayerErrorCount.current += 1;
    
    // Si hay muchos errores, desactivar text layer
    if (textLayerErrorCount.current >= 2) {
      console.log('🔄 Desactivando text layer debido a errores repetidos');
      setTextLayerEnabled(false);
    }
  }, []); // Sin dependencias para evitar ciclo infinito

  const handleAnnotationLayerSuccess = useCallback(() => {
    console.log('✅ Annotation layer rendered successfully for page:', state.currentPage);
  }, [state.currentPage]);

  const handleAnnotationLayerError = useCallback((error: unknown) => {
    console.error('🔴 Annotation layer render error:', error);
  }, []);

  // Callbacks para Document component
  const handleLoadProgress = useCallback((progress: { loaded: number; total: number }) => {
    console.log('📊 PDF Load Progress:', {
      loaded: progress.loaded,
      total: progress.total,
      percentage: progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0,
      fileName
    });
  }, [fileName]);

  const handleSourceError = useCallback((error: Error) => {
    console.error('🔴 PDF Source Error:', error);
    handleLoadError(new Error(`Source error: ${error.message || error}`));
  }, [handleLoadError]);

  const handleSourceSuccess = useCallback(() => {
    console.log('✅ PDF Source loaded successfully for:', fileName);
  }, [fileName]);

  const handleLoadStart = useCallback(() => {
    console.log('🔄 PDF Load started for:', fileName);
    updateState({ isLoading: true });
  }, [fileName, updateState]);

  // Memoizar callback del error boundary para evitar re-renders
  const handleErrorBoundaryError = useCallback((error: Error) => {
    console.warn('🔴 PDF rendering error caught by boundary:', error);
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      {showToolbar && state.numPages && (
        <PDFToolbar
          numPages={state.numPages}
          currentPage={state.currentPage}
          zoom={state.zoom}
          fileName={fileName}
          showPrintButton={showPrintButton}
          showDownloadButton={showDownloadButton}
          showNavigation={showNavigation}
          showZoomControls={showZoomControls}
          fileUrl={url}
          isPrinting={isPrinting}
          onPreviousPage={goToPreviousPage}
          onNextPage={goToNextPage}
          onGoToPage={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={resetZoom}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      )}

      {/* Contenedor del PDF */}
      <div 
        className="relative bg-gray-100 overflow-hidden flex-1"
        style={{ height: typeof height === 'number' ? `${height}px` : height, width }}
        ref={documentRef}
      >
        {/* Error */}
        {state.error && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error al cargar PDF
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {state.error.message}
              </p>
              <button
                onClick={() => {
                  updateState({ error: null });
                  // Forzar recarga
                  window.location.reload();
                }}
                className="px-4 py-2 bg-[#c2b186] text-white rounded-lg hover:bg-[#a89770] transition-colors text-sm font-medium"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        )}

        {/* Document */}
        {!state.error && processedUrl && (
          <div className="flex justify-center p-4 overflow-auto h-full">
            <Document
              file={processedUrl}
              onLoadSuccess={handleLoadSuccess}
              onLoadError={handleLoadError}
              onLoadProgress={handleLoadProgress}
              onSourceError={handleSourceError}
              onSourceSuccess={handleSourceSuccess}
              onLoadStart={handleLoadStart}
              loading={
                <div className="flex items-center justify-center p-12">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#c2b186]" />
                    <p className="text-sm text-gray-600 font-poppins">Cargando PDF...</p>
                    <p className="text-xs text-gray-500 font-poppins">{fileName}</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">Error al cargar el PDF</p>
                    <p className="text-xs text-gray-500 mt-1">{fileName}</p>
                  </div>
                </div>
              }
              className="flex justify-center"
              options={documentOptions}
            >
              <PDFErrorBoundary
                onError={handleErrorBoundaryError}
              >
                <Page
                  pageNumber={state.currentPage}
                  scale={state.zoom}
                  className={`shadow-lg ${debugMode ? 'react-pdf__Page--debug' : ''}`}
                  renderTextLayer={textLayerEnabled}
                  renderAnnotationLayer={true}
                  onLoadSuccess={handlePageLoadSuccess}
                  onLoadError={handlePageLoadError}
                  onRenderTextLayerSuccess={handleTextLayerSuccess}
                  onRenderTextLayerError={handleTextLayerError}
                  onRenderAnnotationLayerSuccess={handleAnnotationLayerSuccess}
                  onRenderAnnotationLayerError={handleAnnotationLayerError}
                  loading={loadingComponent}
                  error={errorComponent}
                />
              </PDFErrorBoundary>
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;