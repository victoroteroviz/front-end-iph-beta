/**
 * Componente atómico FormSection
 * Sección de formulario con título e icono
 */

import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon: Icon,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div 
        className={`
          flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg
          ${collapsible ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}
        `}
        onClick={handleToggle}
      >
        <Icon className="w-5 h-5 text-[#948b54] mr-3" />
        <h3 className="text-lg font-semibold text-[#4d4725] font-poppins flex-1">
          {title}
        </h3>
        {collapsible && (
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={isCollapsed ? 'Expandir sección' : 'Contraer sección'}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;