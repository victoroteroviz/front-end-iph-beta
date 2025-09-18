/**
 * Componente Sidebar refactorizado
 * Implementa principios SOLID, KISS y DRY
 * Sistema escalable de permisos y navegación
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';

// Helpers
import { logInfo, logError } from '../../../../helper/log/logger.helper';

// Configuración
import { SIDEBAR_CONFIG, getFilteredSidebarItems } from './config/sidebarConfig';

// Hooks
import useUserSession from '../hooks/useUserSession';

// Interfaces
import type { 
  SidebarProps, 
  SidebarItemProps, 
  SidebarItemConfig
} from '../../../../interfaces/components/dashboard.interface';

/**
 * Componente individual para cada item del sidebar
 * Implementa Single Responsibility - solo maneja un item
 * 
 * @param props - Configuración y estado del item
 * @returns JSX.Element del item del sidebar
 */
const SidebarItem: React.FC<SidebarItemProps> = ({ 
  config, 
  currentPath, 
  onNavigate,
  isCollapsed = false
}) => {
  const isActive = currentPath === config.to;
  
  /**
   * Maneja el click en el item del sidebar
   */
  const handleClick = useCallback((): void => {
    logInfo('Sidebar', 'Navigation item clicked', {
      itemId: config.id,
      label: config.label,
      path: config.to,
      wasActive: isActive
    });

    if (onNavigate) {
      onNavigate(config.to);
    }
  }, [config, isActive, onNavigate]);

  return (
    <Link 
      to={config.to || '#'} 
      onClick={handleClick}
      className={`
        flex items-center gap-3 px-2 py-3 rounded transition-all duration-200
        ${isActive 
          ? 'bg-[#7a7246] text-white shadow-sm' 
          : 'hover:bg-[#7a7246] hover:text-white cursor-pointer'
        }
        ${config.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isCollapsed ? 'justify-center' : ''}
        min-h-[44px] touch-manipulation
      `}
      aria-label={`Navegar a ${config.label}`}
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed ? config.label : undefined}
    >
      <span className="flex-shrink-0" aria-hidden="true">
        {config.icon}
      </span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">
          {config.label}
        </span>
      )}
    </Link>
  );
};

/**
 * Componente principal del Sidebar
 * 
 * Características:
 * - Sistema de permisos escalable basado en roles
 * - Navegación con estado activo
 * - Logging de acciones específicas
 * - Accesibilidad mejorada
 * - Logout integrado
 * - Integración con sessionStorage y env.config.ts
 * 
 * @param props - Props del sidebar (opcional para retrocompatibilidad)
 * @returns JSX.Element del sidebar completo
 */
const Sidebar: React.FC<Partial<SidebarProps>> = ({
  currentPath: propCurrentPath,
  userRole: propUserRole,
  onLogout: propOnLogout,
  className = '',
  isOpen = false,
  onToggle,
  isMobile: _isMobile = false
}) => {
  const location = useLocation();
  const { 
    userRole: sessionUserRole, 
    logout: sessionLogout, 
    isAuthenticated,
    isLoading 
  } = useUserSession();

  // Estado para detectar si estamos en móvil
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const isActuallyMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Usar props o datos de sesión
  const currentPath = propCurrentPath || location.pathname;
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

  // Determinar si debe estar colapsado
  const shouldCollapse = isTablet;
  const shouldUseOverlay = isActuallyMobile;

  /**
   * Obtiene los items filtrados según permisos del usuario
   */
  const filteredItems = useMemo(() => {
    return userRole ? getFilteredSidebarItems(userRole) : [];
  }, [userRole]);

  /**
   * Maneja la navegación con logging
   */
  const handleNavigation = useCallback((path: string): void => {
    logInfo('Sidebar', 'User navigated to new route', {
      fromPath: location.pathname,
      toPath: path,
      userRole: userRole || 'unknown',
      isMobile: shouldUseOverlay
    });

    // Cerrar sidebar en móvil después de la navegación
    if (shouldUseOverlay && onToggle) {
      onToggle();
    }
  }, [location.pathname, userRole, shouldUseOverlay, onToggle]);

  /**
   * Maneja el logout con logging
   */
  const handleLogout = useCallback((): void => {
    logInfo('Sidebar', 'User initiated logout from sidebar', {
      currentPath: location.pathname,
      userRole: userRole || 'unknown'
    });
    
    onLogout();
  }, [location.pathname, userRole, onLogout]);

  /**
   * Maneja el cierre del sidebar en móvil
   */
  const handleClose = useCallback((): void => {
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  // Log cuando se filtra el sidebar según permisos
  React.useEffect(() => {
    if (userRole && !isLoading) {
      logInfo('Sidebar', 'Sidebar items filtered by user permissions', {
        userRole,
        totalItems: SIDEBAR_CONFIG.items?.length || 0,
        visibleItems: filteredItems.length,
        visibleItemIds: filteredItems.map(item => item.id)
      });
    }
  }, [userRole, filteredItems, isLoading]);

  // Si no está autenticado y no hay props, no renderizar
  if (!userRole && !isAuthenticated && !propUserRole) {
    return null;
  }

  // Loading state
  if (isLoading && !propUserRole) {
    return (
      <aside 
        className={`
          w-60 bg-[#948b54] text-white flex flex-col justify-center items-center
          font-poppins shadow-lg
          ${className}
        `}
        role="navigation"
        aria-label="Cargando navegación"
      >
        <div className="animate-pulse text-white/70">
          Cargando...
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay para móvil */}
      {shouldUseOverlay && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`
          ${shouldUseOverlay 
            ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out
               ${isOpen ? 'translate-x-0' : '-translate-x-full'}
               w-64`
            : shouldCollapse 
              ? 'w-16 lg:w-60'
              : 'w-60'
          }
          bg-[#948b54] text-white flex flex-col justify-between
          font-poppins shadow-lg
          ${className}
        `}
        role="navigation"
        aria-label="Navegación principal"
      >
      {/* Header del sidebar */}
      <div>
        {/* Título/Brand con botón de cierre en móvil */}
        <div className="p-4 font-bold text-lg border-b border-white/20 relative">
          {shouldUseOverlay && (
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          )}
          <h1 className={`text-white leading-tight transition-opacity duration-200 ${
            shouldCollapse && !shouldUseOverlay ? 'lg:opacity-100 opacity-0 text-xs text-center' : ''
          }`}>
            {shouldCollapse && !shouldUseOverlay ? 'IPH' : SIDEBAR_CONFIG.title}
          </h1>
        </div>

        {/* Navegación principal */}
        <nav 
          className={`mt-4 space-y-2 transition-all duration-200 ${
            shouldCollapse && !shouldUseOverlay ? 'px-2' : 'px-4'
          }`}
          role="menu"
          aria-label="Menú de navegación"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item: SidebarItemConfig) => (
              <div key={item.id} role="menuitem">
                <SidebarItem 
                  config={item}
                  currentPath={currentPath}
                  onNavigate={handleNavigation}
                  isCollapsed={shouldCollapse && !shouldUseOverlay}
                />
              </div>
            ))
          ) : (
            <div className={`px-2 py-4 text-sm text-white/70 text-center ${
              shouldCollapse && !shouldUseOverlay ? 'hidden' : ''
            }`}>
              No tienes acceso a ninguna sección
            </div>
          )}
        </nav>
      </div>

      {/* Footer con logout */}
      <div className={`pb-6 transition-all duration-200 ${
        shouldCollapse && !shouldUseOverlay ? 'px-2' : 'px-4'
      }`}>
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-2 py-3 rounded 
            hover:bg-[#7a7246] hover:text-white cursor-pointer transition-all duration-200
            text-left text-white min-h-[44px] touch-manipulation
            ${shouldCollapse && !shouldUseOverlay ? 'justify-center' : ''}
          `}
          aria-label="Cerrar sesión"
          type="button"
          title={shouldCollapse && !shouldUseOverlay ? 'Desconectar' : undefined}
        >
          <LogOut size={20} aria-hidden="true" />
          {!(shouldCollapse && !shouldUseOverlay) && (
            <span className="text-sm font-medium">Desconectar</span>
          )}
        </button>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
export { Sidebar, SidebarItem };