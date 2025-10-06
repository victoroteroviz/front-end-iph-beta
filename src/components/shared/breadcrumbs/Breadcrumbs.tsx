import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Interface para definir un elemento de breadcrumb
 */
export interface IBreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/**
 * Props del componente Breadcrumbs
 */
interface BreadcrumbsProps {
  items: IBreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

/**
 * Componente Breadcrumbs reutilizable
 *
 * @param items - Array de elementos del breadcrumb
 * @param showHome - Si mostrar el icono de inicio al principio
 * @param className - Clases CSS adicionales
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className = ''
}) => {
  if (!items || items.length === 0) return null;

  return (
    <nav
      className={`flex items-center space-x-2 text-sm mb-6 ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <Link
            to="/inicio"
            className="flex items-center text-[#4d4725] hover:text-[#b8ab84] transition-colors duration-200"
            aria-label="Ir al inicio"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={14} className="text-[#b8ab84]" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isActive = item.isActive || isLast;

        return (
          <React.Fragment key={index}>
            {item.path && !isActive ? (
              <Link
                to={item.path}
                className="text-[#4d4725] hover:text-[#b8ab84] transition-colors duration-200 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`${
                  isActive
                    ? 'text-[#4d4725] font-medium'
                    : 'text-[#b8ab84]'
                }`}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight size={14} className="text-[#b8ab84]" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;