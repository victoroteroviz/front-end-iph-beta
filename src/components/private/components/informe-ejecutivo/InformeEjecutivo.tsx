/**
 * Componente InformeEjecutivo
 * Vista de solo lectura para mostrar datos completos de IPH
 * Consume getIphById con ResponseIphData
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState, useMemo } from 'react';
import { RefreshCw, FileX } from 'lucide-react';

// Hook personalizado
import useInformeEjecutivo from './hooks/useInformeEjecutivo';

// Componentes
import TabNavigation from './components/TabNavigation';
import PDFExportButton from './components/PDFExportButton';
import SectionModal from './components/SectionModal';

// Utils
import { getTabsForIphType, getTabsWithStatus } from './utils/tabsConfig';

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

  // Estado para el tab activo y modal
  const [activeTab, setActiveTab] = useState('datos-generales');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Configuración de tabs basada en el tipo de IPH
  const tabsWithStatus = useMemo(() => {
    if (!state.responseData || !state.responseData.iph || Array.isArray(state.responseData.iph)) {
      return [];
    }

    const tipoIphNombre = state.responseData.iph.tipoIph?.nombre || '';
    const tabsConfig = getTabsForIphType(tipoIphNombre);
    
    logInfo('InformeEjecutivo', 'Tabs configuration loaded', {
      tipoIph: tipoIphNombre,
      tabsCount: tabsConfig.length
    });

    return getTabsWithStatus(tabsConfig, state.responseData);
  }, [state.responseData]);

  // Handler para cambio de tab y apertura de modal
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsModalOpen(true);
    logInfo('InformeEjecutivo', 'Tab changed and modal opened', { tabId });
  };

  // Handler para cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    logInfo('InformeEjecutivo', 'Modal closed', { activeTab });
  };

  // Handler para exportación PDF
  const handlePDFExport = async (id: string) => {
    logInfo('InformeEjecutivo', 'PDF export requested', { id });
    // TODO: Implementar exportación real cuando se active el flag
    alert('Funcionalidad de exportación PDF en desarrollo');
  };

  // Obtener datos de la sección activa
  const getActiveTabData = () => {
    if (!state.responseData || tabsWithStatus.length === 0) return null;
    
    const activeTabConfig = tabsWithStatus.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    return state.responseData[activeTabConfig.dataKey];
  };

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
        
        {/* Header con información básica y botón PDF */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#4d4725]">
              Informe Ejecutivo IPH
            </h1>
            {!Array.isArray(iph) && iph?.nReferencia && (
              <p className="text-gray-600 mt-1">
                Referencia: {iph.nReferencia}
              </p>
            )}
          </div>
          
          {showPDFButton && informeId && (
            <PDFExportButton
              informeId={informeId}
              referencia={!Array.isArray(iph) ? iph?.nReferencia : undefined}
              onExport={handlePDFExport}
            />
          )}
        </div>

        {/* Sistema de navegación por lista */}
        {tabsWithStatus.length > 0 && (
          <TabNavigation
            tabs={tabsWithStatus}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Información de ayuda */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#4d4725] font-poppins mb-3">
              Selecciona una sección para ver su contenido
            </h3>
            <p className="text-gray-600 font-poppins mb-4">
              Haz clic en cualquier elemento de la lista superior para abrir su contenido en una ventana modal.
              Puedes navegar entre secciones usando los controles del modal.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Secciones con datos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Secciones sin datos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p>
              Informe Ejecutivo IPH • Solo Lectura 
              {readonly && " • No editable"}
            </p>
            
            {tabsWithStatus.length > 0 && (
              <p className="text-xs">
                {tabsWithStatus.filter(t => t.hasData).length} de {tabsWithStatus.length} secciones con datos
              </p>
            )}
          </div>
          
          {!Array.isArray(iph) && iph?.tipoIph?.nombre && (
            <p className="text-xs text-gray-500 mt-2">
              Tipo: {iph.tipoIph.nombre}
            </p>
          )}
        </div>
      </div>

      {/* Modal de secciones */}
      <SectionModal
        isOpen={isModalOpen}
        tabs={tabsWithStatus}
        activeTab={activeTab}
        iph={iph}
        onClose={handleCloseModal}
        onTabChange={setActiveTab}
        getActiveTabData={getActiveTabData}
      />
    </div>
  );
};

export default InformeEjecutivo;