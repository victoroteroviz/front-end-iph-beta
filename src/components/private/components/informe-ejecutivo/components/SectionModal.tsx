/**
 * Componente SectionModal
 * Modal centrado para mostrar el contenido de las secciones del informe
 * Con navegación interna, overlay difuminado y controles de navegación
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  MapPin,
  Users,
  Shield,
  Car,
  Package,
  MessageCircle,
  ArrowRightLeft,
  FolderOpen
} from 'lucide-react';
import type { TabWithStatus } from '../utils/tabsConfig';
import type { I_IphData } from '../../../../../interfaces/iph/iph.interface';

// Componentes de contenido
import DatosGenerales from './DatosGenerales';
import PrimerRespondiente from './PrimerRespondiente';
import LugarIntervencion from './LugarIntervencion';
import ConocimientoHecho from './ConocimientoHecho';
import NarrativaHechos from './NarrativaHechos';
import AnexoDetenciones from './AnexoDetenciones';
import PuestaDisposicion from './PuestaDisposicion';
import AnexoUsoFuerza from './AnexoUsoFuerza';
import AnexoInspeccionVehiculo from './AnexoInspeccionVehiculo';
import AnexoInventario from './AnexoInventario';
import AnexoEntrevistas from './AnexoEntrevistas';
import AnexoEntregaRecepcion from './AnexoEntregaRecepcion';
import AnexoArchivos from './AnexoArchivos';
import DummySection from './DummySection';

// =====================================================
// INTERFACES
// =====================================================

interface SectionModalProps {
  isOpen: boolean;
  tabs: TabWithStatus[];
  activeTab: string;
  iph: I_IphData | I_IphData[] | null;
  onClose: () => void;
  onTabChange: (tabId: string) => void;
  getActiveTabData: () => any;
  className?: string;
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

const getIconForTab = (tabId: string) => {
  const iconMap: { [key: string]: React.ElementType } = {
    'datos-generales': FileText,
    'primer-respondiente': Users,
    'lugar-intervencion': MapPin,
    'conocimiento-hecho': Shield,
    'conocimiento-hechos': Shield,
    'conocimiento-probable-infraccion': Shield,
    'narrativa-hechos': FileText,
    'puesta-disposicion': Users,
    'puesta-disposicion-primer-respondiente': Users,
    'anexo-a-detenciones': Users,
    'anexo-a-detenciones-civica': Users,
    'anexo-b-uso-fuerza': Shield,
    'anexo-c-inspeccion': Package,
    'anexo-c-inspeccion-vehiculo': Car,
    'anexo-d-inventario': Package,
    'anexo-e-entrevistas': MessageCircle,
    'anexo-f-entrega-recepcion': ArrowRightLeft,
    'anexo-b-descripcion-vehiculo': Car,
    'anexo-archivos': FolderOpen
  };
  
  return iconMap[tabId] || FileText;
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  tabs,
  activeTab,
  iph,
  onClose,
  onTabChange,
  getActiveTabData,
  className = ''
}) => {
  // Ref para el contenedor de scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Encontrar el índice del tab activo
  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
  const currentTab = tabs[currentIndex];
  const IconComponent = getIconForTab(activeTab);

  // Funciones de navegación
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1].id);
    }
  }, [currentIndex, tabs, onTabChange]);

  const goToNext = useCallback(() => {
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1].id);
    }
  }, [currentIndex, tabs, onTabChange]);

  // Resetear scroll al inicio cuando cambie la sección o se abra el modal
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      // Resetear scroll inmediatamente
      scrollContainerRef.current.scrollTop = 0;
      
      // También resetear scroll suave por si acaso
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'auto' // Inmediato, sin animación
      });
    }
  }, [activeTab, isOpen]); // Se ejecuta cuando cambia activeTab o isOpen

  // Manejar teclas del teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // No manejar eventos si hay un modal hijo abierto
      if (document.body.hasAttribute('data-child-modal-open')) {
        return;
      }
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentTab) return null;

  return (
    <>
      {/* Overlay con efecto de desenfoque gaussiano */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md backdrop-saturate-150 z-40 transition-all duration-300"
        onClick={onClose}
        style={{ backdropFilter: 'blur(8px) saturate(150%)' }}
      />

      {/* Modal */}
      <div className={`
        fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4
        ${className}
      `}>
        <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out scale-100 flex flex-col">
          
          {/* Header del Modal */}
          <div className="flex-shrink-0 bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              
              {/* Información de la sección */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#c2b186] text-white">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
                    {currentTab.label}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">
                      Sección {currentIndex + 1} de {tabs.length}
                    </span>
                    <span className={`
                      px-2 py-1 text-xs rounded-full border font-medium
                      ${currentTab.hasData 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                      }
                    `}>
                      {currentTab.hasData ? 'Con datos' : 'Sin datos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles */}
              <div className="flex items-center gap-3">
                
                {/* Navegación */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className={`
                      p-3 rounded-xl transition-all duration-200 font-semibold shadow-md border-2
                      ${currentIndex === 0 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100 border-gray-200' 
                        : 'text-[#4d4725] bg-white border-[#c2b186] hover:bg-[#c2b186] hover:text-white hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                      }
                    `}
                    title="Sección anterior (←)"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={goToNext}
                    disabled={currentIndex === tabs.length - 1}
                    className={`
                      p-3 rounded-xl transition-all duration-200 font-semibold shadow-md border-2
                      ${currentIndex === tabs.length - 1 
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100 border-gray-200' 
                        : 'text-[#4d4725] bg-white border-[#c2b186] hover:bg-[#c2b186] hover:text-white hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                      }
                    `}
                    title="Sección siguiente (→)"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={onClose}
                  className="
                    p-3 rounded-xl transition-all duration-200 font-semibold shadow-md border-2
                    text-red-700 bg-red-50 border-red-300 
                    hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg hover:scale-105 
                    active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    cursor-pointer
                  "
                  title="Cerrar modal (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                <span>Progreso de navegación</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-[#c2b186] h-1 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / tabs.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contenido del Modal */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 p-6 overflow-y-auto"
          >
            <div className="transition-all duration-300 h-full">
              {activeTab === 'datos-generales' ? (
                <DatosGenerales iph={iph} className="mb-0" />
              ) : activeTab === 'primer-respondiente' ? (
                <PrimerRespondiente 
                  primerRespondiente={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'lugar-intervencion' ? (
                <LugarIntervencion 
                  lugarIntervencion={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : (activeTab === 'conocimiento-hecho' || activeTab === 'conocimiento-hechos' || activeTab === 'conocimiento-probable-infraccion') ? (
                <ConocimientoHecho 
                  conocimientoHecho={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'narrativa-hechos' ? (
                <NarrativaHechos 
                  narrativaHecho={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-a-detenciones' || activeTab === 'anexo-a-detenciones-civica' ? (
                <AnexoDetenciones
                  detencion={getActiveTabData()}
                  puestaDisposicion={undefined}
                  className="mb-0"
                />
              ) : activeTab === 'puesta-disposicion' ? (
                <PuestaDisposicion 
                  puestaDisposicion={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'puesta-disposicion-primer-respondiente' ? (
                <PrimerRespondiente 
                  primerRespondiente={getActiveTabData()} 
                  title="Puesta a disposición / Primer Respondiente"
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-b-descripcion-vehiculo' ? (
                <AnexoInspeccionVehiculo 
                  inspeccionVehiculo={getActiveTabData()} 
                  title="Anexo B. Descripción de vehículo"
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-b-uso-fuerza' ? (
                <AnexoUsoFuerza 
                  usoFuerza={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : (activeTab === 'anexo-c-inspeccion' || activeTab === 'anexo-c-inspeccion-vehiculo') ? (
                <AnexoInspeccionVehiculo 
                  inspeccionVehiculo={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-d-inventario' ? (
                <AnexoInventario 
                  armaObjeto={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-e-entrevistas' ? (
                <AnexoEntrevistas 
                  entrevista={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-f-entrega-recepcion' ? (
                <AnexoEntregaRecepcion 
                  entregaRecepcion={getActiveTabData()} 
                  className="mb-0" 
                />
              ) : activeTab === 'anexo-archivos' ? (
                <AnexoArchivos 
                  archivos={Array.isArray(iph) ? iph[0]?.archivos : iph?.archivos} 
                  className="mb-0" 
                />
              ) : (
                <DummySection
                  sectionName={currentTab.label}
                  data={getActiveTabData()}
                  className="mb-0"
                />
              )}
            </div>
          </div>

          {/* Footer del Modal */}
          <div className="flex-shrink-0 bg-gray-50 rounded-b-2xl px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-center">
              {/* Info de navegación centrada */}
              <div className="text-xs text-gray-500 font-poppins text-center">
                <p>Usa las flechas ← → para navegar entre secciones</p>
                <p>Presiona Esc para cerrar el modal</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default SectionModal;