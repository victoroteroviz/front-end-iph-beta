/**
 * Componente InformeEjecutivo
 * Vista de solo lectura para mostrar datos completos de IPH
 * Consume getIphById con ResponseIphData
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React from 'react';
import { RefreshCw, FileX } from 'lucide-react';

// Hook personalizado
import useInformeEjecutivo from './hooks/useInformeEjecutivo';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { IInformeEjecutivoProps } from '../../../../interfaces/components/informe-ejecutivo.interface';

const InformeEjecutivo: React.FC<IInformeEjecutivoProps> = ({
  informeId,
  className = '',
  readonly = true,
  showPDFButton = false
}) => {
  const {
    state,
    refreshInforme
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
  if (state.isLoading && !state.responseData) {
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
  if (!state.responseData || !state.responseData.iph || (Array.isArray(state.responseData.iph) && state.responseData.iph.length === 0)) {
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

  const { iph } = state.responseData;

  return (
    <div className={`bg-[#f8f0e7] min-h-screen p-6 text-[#4d4725] font-poppins ${className}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header del Informe - Datos básicos de I_IphData */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
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
            {Array.isArray(iph) ? (
              <div className="text-center text-[#4d4725] py-4">
                <p>No se encontraron datos del informe</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#4d4725]">
                
                {/* Columna izquierda */}
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">ID:</span> {iph.id || 'No disponible'}
                  </p>
                  <p>
                    <span className="font-semibold">Referencia:</span> {iph.nReferencia || 'No disponible'}
                  </p>
                  <p>
                    <span className="font-semibold">Folio Sistema:</span> {iph.nFolioSist || 'No disponible'}
                  </p>
                  <p>
                    <span className="font-semibold">Estatus:</span> {iph.estatus || 'No disponible'}
                  </p>
                </div>

                {/* Columna derecha */}
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Tipo IPH:</span> {iph.tipoIph?.nombre || 'No especificado'}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha de creación:</span>{' '}
                    {iph.fechaCreacion ? new Date(iph.fechaCreacion).toLocaleString('es-MX') : 'No disponible'}
                  </p>
                  <p>
                    <span className="font-semibold">Archivos:</span> {iph.archivos?.length || 0} archivo(s)
                  </p>
                  <p>
                    <span className="font-semibold">Fotos:</span> {iph.fotos?.length || 0} foto(s)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Hechos */}
        {!Array.isArray(iph) && iph.hechos && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 
              className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
              style={{ backgroundColor: '#c2b186' }}
            >
              Hechos
            </h2>
            
            <div 
              className="border border-gray-300 rounded-md shadow-sm p-4"
              style={{ backgroundColor: '#fdf7f1' }}
            >
              <p className="text-[#4d4725] whitespace-pre-wrap">
                {iph.hechos}
              </p>
            </div>
          </div>
        )}

        {/* Sección de Observaciones */}
        {!Array.isArray(iph) && iph.observaciones && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 
              className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
              style={{ backgroundColor: '#c2b186' }}
            >
              Observaciones
            </h2>
            
            <div 
              className="border border-gray-300 rounded-md shadow-sm p-4"
              style={{ backgroundColor: '#fdf7f1' }}
            >
              <p className="text-[#4d4725] whitespace-pre-wrap">
                {iph.observaciones}
              </p>
            </div>
          </div>
        )}

        {/* TODO: Componente hijo para Mapa (próximo paso) */}
        {!Array.isArray(iph) && iph.coordenadas && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 
              className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
              style={{ backgroundColor: '#c2b186' }}
            >
              Ubicación
            </h2>
            
            <div 
              className="border border-gray-300 rounded-md shadow-sm p-4"
              style={{ backgroundColor: '#fdf7f1' }}
            >
              <div className="text-[#4d4725]">
                <p><span className="font-semibold">Latitud:</span> {iph.coordenadas.latitud}</p>
                <p><span className="font-semibold">Longitud:</span> {iph.coordenadas.longitud}</p>
                <p className="text-sm text-gray-600 mt-2">
                  * Mapa interactivo se implementará en el siguiente paso
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del sistema */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Informe Ejecutivo IPH • Solo Lectura 
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