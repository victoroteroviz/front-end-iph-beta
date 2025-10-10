/**
 * Componente Accordion
 * Componente reutilizable para secciones colapsables
 */

import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header del acordeón */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full px-6 py-4 flex items-center justify-between
          hover:bg-gray-50 transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-opacity-50
          cursor-pointer
        "
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-[#4d4725] rounded-lg">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-[#4d4725] font-poppins">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 font-poppins">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Icono de expansión/colapso con rotación */}
        <div className="flex-shrink-0 ml-4">
          <ChevronUp
            className={`h-5 w-5 text-[#4d4725] transition-transform duration-300 ${
              isOpen ? '' : 'rotate-180'
            }`}
          />
        </div>
      </button>

      {/* Contenido del acordeón con animación */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
