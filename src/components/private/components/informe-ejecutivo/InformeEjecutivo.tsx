/**
 * Componente InformeEjecutivo
 * Vista de solo lectura para informes ejecutivos con exportación PDF
 * Migrado completamente a TypeScript con arquitectura moderna
 * Mantiene diseño original con mejoras en UX
 */

import React from 'react';
import { AlertCircle, RefreshCw, FileX } from 'lucide-react';

// Hook personalizado
import useInformeEjecutivo from './hooks/useInformeEjecutivo';

// Componentes atómicos
import InformeHeader from './components/InformeHeader';
import HechosSection from './components/HechosSection';
import MapSection from './components/MapSection';
import ObservacionesSection from './components/ObservacionesSection';
import AnexosGallery from './components/AnexosGallery';
import LugarIntervencionSection from './components/LugarIntervencionSection';
import NarrativaSection from './components/NarrativaSection';
import UsoFuerzaSection from './components/UsoFuerzaSection';
import EntregaRecepcionSection from './components/EntregaRecepcionSection';
import PDFExportButton from './components/PDFExportButton';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { IInformeEjecutivoProps } from '../../../../interfaces/components/informe-ejecutivo.interface';

const InformeEjecutivo: React.FC<IInformeEjecutivoProps> = ({
  informeId,
  className = '',
  readonly = true,
  showPDFButton = true
}) => {
  const {
    state,
    exportToPDF,
    openImageModal,
    closeImageModal,
    navigateToImage,
    refreshInforme,
    canExportPDF,
    hasValidLocation,
    hasAnexos
  } = useInformeEjecutivo(informeId);

  // Log cuando el componente se monta
  React.useEffect(() => {
    logInfo('InformeEjecutivo', 'Component mounted', {
      informeId: informeId,
      readonly,
      showPDFButton
    });
  }, [informeId, readonly, showPDFButton]);

  // Estado de carga inicial
  if (state.isLoading && !state.informe) {
    return (
      <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-[#4d4725] mb-4" />
            <p className="text-lg font-medium">Cargando informe ejecutivo...</p>
            <p className="text-sm text-gray-600 mt-2">
              Obteniendo datos del servidor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (state.error) {
    return (
      <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileX className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-red-600">
              Error al cargar el informe
            </h2>
            <p className="text-gray-600 mb-6">{state.error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={refreshInforme}
                className="flex items-center gap-2 px-4 py-2 bg-[#c2b186] text-white rounded-lg hover:bg-[#a89770] transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar nuevamente
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Informe no encontrado
  if (!state.informe) {
    return (
      <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Informe no encontrado</h2>
            <p className="text-gray-600 mb-6">
              El informe ejecutivo solicitado no existe o no está disponible.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header del Informe */}
        <InformeHeader 
          informe={state.informe} 
          loading={state.isLoading}
        />

        {/* Error de exportación PDF */}
        {state.exportError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Error en la exportación</h3>
                <p className="text-sm text-red-700">{state.exportError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hechos */}
        <HechosSection 
          hechos={state.informe.hechos}
          loading={state.isLoading}
        />

        {/* Mapa y Ubicación */}
        {hasValidLocation && (
          <MapSection
            latitud={state.informe.latitud}
            longitud={state.informe.longitud}
            referencia={state.informe.n_referencia}
            primerRespondiente={state.informe.primer_respondiente}
            loading={state.isLoading}
          />
        )}

        {/* Observaciones */}
        <ObservacionesSection
          observaciones={state.informe.observaciones}
          loading={state.isLoading}
        />

        {/* Anexos/Galería */}
        {hasAnexos && (
          <AnexosGallery
            anexos={state.informe.ruta_fotos_lugar}
            loading={state.isLoading}
            onImageClick={openImageModal}
          />
        )}

        {/* Lugar de Intervención */}
        {state.informe.lugar_intervencion && (
          <LugarIntervencionSection
            lugar={state.informe.lugar_intervencion}
            loading={state.isLoading}
          />
        )}

        {/* Narrativa */}
        {state.informe.narrativaHechos?.contenido && (
          <NarrativaSection
            narrativa={state.informe.narrativaHechos}
            loading={state.isLoading}
          />
        )}

        {/* Uso de la Fuerza */}
        <UsoFuerzaSection
          usoFuerza={state.informe.uso_fuerza}
          loading={state.isLoading}
        />

        {/* Entrega y Recepción */}
        <EntregaRecepcionSection
          entregaRecepcion={state.informe.entrega_recepcion}
          loading={state.isLoading}
        />

        {/* Botón de Exportación PDF */}
        {showPDFButton && (
          <PDFExportButton
            informeId={state.informe.id}
            referencia={state.informe.n_referencia}
            loading={state.isExportingPDF}
            disabled={!canExportPDF()}
            onExport={exportToPDF}
          />
        )}

        {/* Modal de Galería de Imágenes */}
        {state.galleryModalOpen && state.selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              
              {/* Header del modal */}
              <div className="flex items-center justify-between p-4 bg-[#c2b186] text-white">
                <h3 className="font-semibold">
                  Anexo {state.selectedImageIndex + 1} de {state.informe.ruta_fotos_lugar?.length}
                </h3>
                <button
                  onClick={closeImageModal}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <AlertCircle className="h-5 w-5 rotate-45" />
                </button>
              </div>

              {/* Imagen */}
              <div className="relative">
                <img
                  src={`https://iph-api.okip.com.mx${state.selectedImage.ruta_foto}`}
                  alt={state.selectedImage.descripcion || `Anexo ${state.selectedImageIndex + 1}`}
                  className="max-w-full max-h-96 object-contain mx-auto block"
                />
                
                {/* Navegación */}
                {(state.informe.ruta_fotos_lugar?.length || 0) > 1 && (
                  <>
                    <button
                      onClick={() => navigateToImage('prev')}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      ← Anterior
                    </button>
                    <button
                      onClick={() => navigateToImage('next')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      Siguiente →
                    </button>
                  </>
                )}
              </div>

              {/* Footer con información */}
              {state.selectedImage.descripcion && (
                <div className="p-4 bg-gray-50 text-sm">
                  <p>{state.selectedImage.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del sistema */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Informe Ejecutivo • Solo Lectura • {showPDFButton ? 'Exportación disponible' : 'Vista previa'}
          </p>
          {readonly && (
            <p className="mt-1">
              Este informe es de solo lectura y no puede ser modificado
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InformeEjecutivo;