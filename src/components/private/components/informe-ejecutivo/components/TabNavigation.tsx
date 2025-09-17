/**
 * Componente TabNavigation
 * Sistema de lista de elementos para navegación en InformeEjecutivo
 * Con badges de estado, iconos y diseño tipo lista vertical
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  MapPin, 
  Users, 
  Shield, 
  Car,
  Package,
  MessageCircle,
  ArrowRightLeft,
  CheckCircle2,
  Circle
} from 'lucide-react';
import type { TabWithStatus } from '../utils/tabsConfig';

// =====================================================
// INTERFACES
// =====================================================

interface TabNavigationProps {
  tabs: TabWithStatus[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

// Mapeo de iconos por tipo de sección
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
    'anexo-b-uso-fuerza': Shield,
    'anexo-c-inspeccion': Package,
    'anexo-c-inspeccion-vehiculo': Car,
    'anexo-d-inventario': Package,
    'anexo-e-entrevistas': MessageCircle,
    'anexo-f-entrega-recepcion': ArrowRightLeft,
    'anexo-b-descripcion-vehiculo': Car
  };
  
  return iconMap[tabId] || FileText;
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getBadgeColor = (status: 'sin datos' | 'con datos'): string => {
    return status === 'con datos' 
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-gray-50 text-gray-500 border-gray-200';
  };

  const getBadgeText = (status: 'sin datos' | 'con datos'): string => {
    return status === 'con datos' ? 'Con datos' : 'Sin datos';
  };

  const getStatusIcon = (hasData: boolean) => {
    return hasData 
      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
      : <Circle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className={`bg-white rounded-lg shadow mb-6 ${className}`}>
      
      {/* Header para móvil */}
      <div className="md:hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 text-left rounded-t-lg cursor-pointer"
          style={{ backgroundColor: '#c2b186' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold font-poppins">
              Secciones del Informe
            </span>
            <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {tabs.filter(t => t.hasData).length}/{tabs.length}
            </span>
          </div>
          <div className="text-white">
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </button>
      </div>

      {/* Lista de elementos de navegación */}
      <div className={`
        md:block 
        ${isCollapsed ? 'hidden' : 'block'}
      `}>
        
        {/* Desktop: Lista vertical completa */}
        <div className="hidden md:block">
          <div className="p-3">
            {/* Header desktop */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">
                Secciones del Informe
              </h3>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>
                  {tabs.filter(t => t.hasData).length} de {tabs.length} con datos
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span>Con datos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Circle className="h-3 w-3 text-gray-400" />
                    <span>Sin datos</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lista de elementos */}
            <div className="space-y-1">
              {tabs.map((tab, index) => {
                const IconComponent = getIconForTab(tab.id);
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className="
                      w-full flex items-center gap-3 p-3 rounded-lg text-left
                      transition-all duration-300 ease-in-out font-poppins group
                      transform hover:scale-[1.02] active:scale-[0.98]
                      bg-white border border-transparent hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm
                      cursor-pointer
                    "
                  >
                    {/* Número de orden */}
                    <div className="
                      flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold
                      transition-all duration-300 ease-in-out
                      bg-gray-100 text-gray-600 group-hover:bg-[#c2b186] group-hover:text-white group-hover:scale-105
                    ">
                      {index + 1}
                    </div>
                    
                    {/* Icono */}
                    <div className="
                      transition-all duration-300 ease-in-out
                      text-gray-500 group-hover:text-[#c2b186] group-hover:scale-105
                    ">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="
                          text-sm font-medium truncate transition-colors duration-300 ease-in-out
                          text-gray-700 group-hover:text-[#4d4725]
                        ">
                          {tab.label}
                        </h4>
                        
                        {/* Estado e indicador */}
                        <div className="flex items-center gap-2 ml-2">
                          <div className="transition-transform duration-300 ease-in-out group-hover:scale-110">
                            {getStatusIcon(tab.hasData)}
                          </div>
                          <span className={`
                            px-2 py-1 text-xs rounded-full border font-medium
                            transition-all duration-300 ease-in-out
                            ${getBadgeColor(tab.status)}
                            group-hover:border-[#c2b186] group-hover:bg-[#fdf7f1]
                          `}>
                            {getBadgeText(tab.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Móvil: Lista compacta cuando está expandido */}
        <div className="md:hidden">
          <div className="max-h-80 overflow-y-auto">
            {tabs.map((tab, index) => {
              const IconComponent = getIconForTab(tab.id);
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setIsCollapsed(true);
                  }}
                  className="
                    w-full flex items-center gap-3 p-3 text-left
                    transition-all duration-300 ease-in-out font-poppins
                    border-l-4 transform active:scale-[0.98]
                    border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm
                    cursor-pointer
                  "
                >
                  {/* Número */}
                  <div className="
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold
                    transition-all duration-300 ease-in-out
                    bg-gray-200 text-gray-600 hover:bg-[#c2b186] hover:text-white hover:scale-105
                  ">
                    {index + 1}
                  </div>
                  
                  {/* Icono */}
                  <IconComponent className="
                    h-4 w-4 transition-all duration-300 ease-in-out
                    text-gray-500 hover:text-[#c2b186] hover:scale-105
                  " />
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="
                        text-sm font-medium truncate transition-colors duration-300 ease-in-out
                        text-gray-700 hover:text-[#4d4725]
                      ">
                        {tab.label}
                      </span>
                      <div className="flex items-center gap-1 ml-2">
                        <div className="transition-transform duration-300 ease-in-out hover:scale-110">
                          {getStatusIcon(tab.hasData)}
                        </div>
                        <span className={`
                          px-1.5 py-0.5 text-xs rounded-full transition-all duration-300 ease-in-out
                          ${tab.hasData 
                            ? 'text-green-600 hover:text-green-700 hover:scale-110' 
                            : 'text-gray-400 hover:text-gray-500 hover:scale-110'
                          }
                        `}>
                          {tab.hasData ? '●' : '○'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;