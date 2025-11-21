/**
 * @fileoverview Componente Breadcrumbs para navegación del layout
 * @version 1.0.0
 * @description Sistema de migajas de pan para mejorar la navegación y orientación del usuario
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, icons } from 'lucide-react';

/**
 * @interface BreadcrumbItem
 * @description Estructura de un elemento de breadcrumb
 */
export interface BreadcrumbItem {
  /** Etiqueta visible del breadcrumb */
  label: string;
  /** Ruta de navegación (opcional para el último elemento) */
  path?: string;
  /** Indica si es el elemento activo/actual */
  isActive?: boolean;
  /** Icono opcional para el breadcrumb */
  icon?: React.ReactNode;
  /** Nombre del icono de Lucide React */
  iconName?: string;
  /** Función onClick personalizada para navegación interna */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * @interface BreadcrumbsProps
 * @description Props del componente Breadcrumbs
 */
interface BreadcrumbsProps {
  /** Lista de elementos del breadcrumb */
  items: BreadcrumbItem[];
  /** Mostrar el icono de inicio */
  showHomeIcon?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Separador personalizado */
  separator?: React.ReactNode;
}

/**
 * @component Breadcrumbs
 * @description Componente que muestra la ruta de navegación actual
 *
 * @param {BreadcrumbsProps} props - Props del componente
 * @returns {JSX.Element} Componente Breadcrumbs
 *
 * @example
 * ```tsx
 * const items = [
 *   { label: 'Inicio', path: '/inicio' },
 *   { label: 'Ajustes', path: '/ajustes' },
 *   { label: 'Catálogos', isActive: true }
 * ];
 *
 * <Breadcrumbs items={items} showHomeIcon />
 * ```
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHomeIcon = true,
  className = '',
  separator
}) => {
  // Si no hay items, no mostrar breadcrumbs
  if (!items || items.length === 0) {
    return null;
  }

  /**
   * @function renderSeparator
   * @description Renderiza el separador entre breadcrumbs
   */
  const renderSeparator = (): React.ReactNode => {
    if (separator) {
      return separator;
    }
    return (
      <ChevronRight
        size={14}
        className="text-gray-400 mx-2 flex-shrink-0"
        aria-hidden="true"
      />
    );
  };

  /**
   * @function getIconComponent
   * @description Obtiene el componente de icono basado en el nombre
   * @param {string} iconName - Nombre del icono
   */
  const getIconComponent = (iconName: string): React.ReactNode => {
    try {
      const IconComponent = (icons as Record<string, React.ComponentType<{ size?: number }>>)[iconName];
      if (IconComponent) {
        return React.createElement(IconComponent, { size: 14 });
      }
    } catch {
      // Si hay error, no mostrar icono
    }
    return null;
  };

  /**
   * @function renderBreadcrumbItem
   * @description Renderiza un elemento individual del breadcrumb
   * @param {BreadcrumbItem} item - Item del breadcrumb
   * @param {number} index - Índice del item
   */
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number): React.ReactNode => {
    const isLast = index === items.length - 1;
    const isActive = item.isActive || isLast;

    // Determinar qué icono mostrar
    let iconToShow = null;
    if (item.icon) {
      iconToShow = item.icon;
    } else if (item.iconName) {
      iconToShow = getIconComponent(item.iconName);
    }

    // Elemento base del breadcrumb
    const breadcrumbContent = (
      <span className="flex items-center space-x-1">
        {iconToShow && (
          <span className="flex-shrink-0">
            {iconToShow}
          </span>
        )}
        <span className="truncate">
          {item.label}
        </span>
      </span>
    );

    // Si es el último elemento o está marcado como activo, no es clickeable
    if (isActive || (!item.path && !item.onClick)) {
      return (
        <span
          key={index}
          className="text-sm font-medium truncate"
          style={{ color: '#4d4725' }}
          aria-current={isActive ? 'page' : undefined}
        >
          {breadcrumbContent}
        </span>
      );
    }

    // Si tiene onClick personalizado, usar un botón
    if (item.onClick) {
      return (
        <button
          key={index}
          onClick={(e) => {
            e.preventDefault();
            item.onClick!(e);
          }}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 truncate bg-transparent border-none cursor-pointer p-0"
          title={item.label}
        >
          {breadcrumbContent}
        </button>
      );
    }

    // Si tiene path y no es el último, es un link
    if (item.path) {
      return (
        <Link
          key={index}
          to={item.path}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 truncate"
          title={item.label}
        >
          {breadcrumbContent}
        </Link>
      );
    }

    // Fallback: mostrar como texto si no tiene path ni onClick
    return (
      <span
        key={index}
        className="text-sm text-gray-600 truncate"
      >
        {breadcrumbContent}
      </span>
    );
  };

  return (
    <nav
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
      role="navigation"
    >
      {/* Icono de inicio opcional */}
      {showHomeIcon && (
        <>
          <Link
            to="/inicio"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            title="Ir al inicio"
            aria-label="Ir al inicio"
          >
            <Home size={16} />
          </Link>
          {items.length > 0 && items[0].label.trim() !== '' && renderSeparator()}
        </>
      )}

      {/* Lista de breadcrumbs */}
      <ol className="flex items-center space-x-1 min-w-0 flex-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center min-w-0">
            {index > 0 && renderSeparator()}
            {renderBreadcrumbItem(item, index)}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/**
 * @component BreadcrumbSkeleton
 * @description Componente skeleton para cuando se están cargando los breadcrumbs
 */
export const BreadcrumbSkeleton: React.FC<{ className?: string }> = ({
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 animate-pulse ${className}`}>
      <div className="w-4 h-4 bg-gray-300 rounded" />
      <div className="w-2 h-2 bg-gray-300 rounded" />
      <div className="w-16 h-4 bg-gray-300 rounded" />
      <div className="w-2 h-2 bg-gray-300 rounded" />
      <div className="w-20 h-4 bg-gray-300 rounded" />
    </div>
  );
};

export default Breadcrumbs;