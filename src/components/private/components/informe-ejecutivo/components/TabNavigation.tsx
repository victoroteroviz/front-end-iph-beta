/**
 * Componente TabNavigation
 * Sistema de tabs horizontales responsive para InformeEjecutivo
 * Con badges de estado y colapsable en móvil
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
// COMPONENTE PRINCIPAL
// =====================================================

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Encontrar el tab activo para mostrar en móvil colapsado
  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  const getBadgeColor = (status: 'sin datos' | 'con datos'): string => {
    return status === 'con datos' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getBadgeText = (status: 'sin datos' | 'con datos'): string => {
    return status === 'con datos' ? 'Con datos' : 'Sin datos';
  };

  return (
    <div className={`bg-white rounded-lg shadow mb-6 ${className}`}>
      
      {/* Header colapsable para móvil */}
      <div className="md:hidden">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-4 text-left"
          style={{ backgroundColor: '#c2b186' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold font-poppins">
              {activeTabData.label}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full border ${getBadgeColor(activeTabData.status)}`}>
              {getBadgeText(activeTabData.status)}
            </span>
          </div>
          <div className="text-white">
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </button>
      </div>

      {/* Navegación de tabs */}
      <div className={`
        md:block 
        ${isCollapsed ? 'hidden' : 'block'}
      `}>
        
        {/* Desktop: tabs horizontales con scroll */}
        <div className="hidden md:block">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors duration-200
                  border-b-2 whitespace-nowrap font-poppins
                  ${activeTab === tab.id 
                    ? 'border-[#c2b186] text-[#4d4725] bg-[#fdf7f1]' 
                    : 'border-transparent text-gray-600 hover:text-[#4d4725] hover:bg-gray-50'
                  }
                  ${index === 0 ? 'ml-4' : ''}
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getBadgeColor(tab.status)}`}>
                    {getBadgeText(tab.status)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Móvil: lista vertical cuando está expandido */}
        <div className="md:hidden">
          <div className="max-h-80 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsCollapsed(true); // Colapsar después de seleccionar
                }}
                className={`
                  w-full px-4 py-3 text-left transition-colors duration-200 font-poppins
                  border-l-4 text-sm font-medium
                  ${activeTab === tab.id 
                    ? 'border-[#c2b186] bg-[#fdf7f1] text-[#4d4725]' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{tab.label}</span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getBadgeColor(tab.status)}`}>
                    {getBadgeText(tab.status)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="hidden md:block px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 font-poppins">
        <div className="flex items-center justify-between">
          <span>
            {tabs.filter(t => t.hasData).length} de {tabs.length} secciones con datos
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Con datos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span>Sin datos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;