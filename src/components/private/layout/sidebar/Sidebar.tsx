/**
 * Componente Sidebar refactorizado
 * Implementa principios SOLID, KISS y DRY
 * Sistema escalable de permisos y navegación
 */

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Estilos optimizados para animaciones
import './sidebar-animations.css';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

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
 * Componente individual para cada item del sidebar - Simplificado para mejor performance
 */
const SidebarItem: React.FC<SidebarItemProps> = React.memo(({
  config,
  currentPath,
  onNavigate,
  isCollapsed = false
}) => {
  const isActive = currentPath === config.to;

  const handleClick = useCallback(() => {
    if (onNavigate) {
      onNavigate(config.to);
    }
  }, [config.to, onNavigate]);

  return (
    <Link
      to={config.to || '#'}
      onClick={handleClick}
      className={`
        flex items-center gap-3 px-2 py-3 rounded transition-all duration-150
        ${isActive
          ? 'bg-[#7a7246] text-white shadow-sm'
          : 'hover:bg-[#7a7246] hover:text-white cursor-pointer'
        }
        ${config.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isCollapsed ? 'justify-center' : ''}
        min-h-[44px]
      `}
      aria-label={`Navegar a ${config.label}`}
      title={isCollapsed ? config.label : undefined}
    >
      <span className="flex-shrink-0">
        {config.icon}
      </span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">
          {config.label}
        </span>
      )}
    </Link>
  );
});

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
  // isMobile prop removido - se detecta automáticamente
  onCollapseChange
}) => {
  const location = useLocation();
  const { 
    userRole: sessionUserRole, 
    logout: sessionLogout, 
    isAuthenticated,
    isLoading 
  } = useUserSession();

  // Estado para detectar si estamos en móvil con optimización de rendimiento
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState<boolean>(false);

  // Cálculo directo de breakpoints - más simple
  const isActuallyMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Estado inicial del collapse - solo una vez al montar
  useEffect(() => {
    const initialWidth = window.innerWidth;
    if (initialWidth >= 768 && initialWidth < 1024) { // Es tablet
      setIsManuallyCollapsed(true);
    }
  }, []); // Solo al montar el componente

  // Detectar cambios en el tamaño de la ventana - simplificado
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      if (Math.abs(newWidth - windowWidth) > 50) { // Umbral más alto para evitar renders excesivos
        setWindowWidth(newWidth);
      }
    };

    // Throttle simple con timeout
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [windowWidth]);

  // Usar props o datos de sesión
  const currentPath = propCurrentPath || location.pathname;
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

  // Cálculo simplificado del estado del sidebar
  const shouldUseOverlay = isActuallyMobile;
  const shouldCollapse = shouldUseOverlay ? false : (isTablet || isManuallyCollapsed);
  const sidebarWidth = shouldUseOverlay ? '256px' : shouldCollapse ? '64px' : '240px';

  /**
   * Obtiene los items filtrados según permisos del usuario - Memoizado para performance
   */
  const filteredItems = useMemo(() => {
    if (!userRole) return [];
    return getFilteredSidebarItems(userRole);
  }, [userRole]);

  /**
   * Maneja la navegación - Optimizado para performance
   */
  const handleNavigation = useCallback((path: string): void => {
    // Log async para no bloquear la navegación
    requestAnimationFrame(() => {
      logInfo('Sidebar', 'User navigated to new route', {
        fromPath: location.pathname,
        toPath: path,
        userRole: userRole || 'unknown',
        isMobile: shouldUseOverlay
      });
    });

    // Cerrar sidebar en móvil después de la navegación
    if (shouldUseOverlay && onToggle) {
      onToggle();
    }
  }, [location.pathname, userRole, shouldUseOverlay, onToggle]);

  /**
   * Maneja el logout - Optimizado para performance
   */
  const handleLogout = useCallback((): void => {
    // Log async para no bloquear el logout
    requestAnimationFrame(() => {
      logInfo('Sidebar', 'User initiated logout from sidebar', {
        currentPath: location.pathname,
        userRole: userRole || 'unknown'
      });
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

  /**
   * Maneja el toggle del colapso manual del sidebar - Simplificado y funcional
   */
  const handleToggleCollapse = useCallback((): void => {
    console.log('🔄 BOTÓN CLICKEADO - Iniciando toggle'); // Debug muy visible
    setIsManuallyCollapsed(prev => {
      const newState = !prev;
      console.log('🔄 ESTADO CAMBIADO:', { era: prev, ahora: newState });
      return newState;
    });
  }, []); // Sin dependencias problemáticas

  // Log cuando se filtra el sidebar según permisos - Solo una vez
  React.useEffect(() => {
    if (userRole && !isLoading) {
      const items = getFilteredSidebarItems(userRole);
      if (items.length > 0) {
        // Log async para no bloquear el render
        requestAnimationFrame(() => {
          logInfo('Sidebar', 'Sidebar items filtered by user permissions', {
            userRole,
            totalItems: SIDEBAR_CONFIG.items?.length || 0,
            visibleItems: items.length,
            visibleItemIds: items.map(item => item.id)
          });
        });
      }
    }
  }, [userRole, isLoading]); // Dependencias optimizadas



  // Notificar cambios de colapso al Dashboard
  useEffect(() => {
    if (onCollapseChange && !shouldUseOverlay) {
      onCollapseChange(shouldCollapse);
    }
  }, [shouldCollapse, shouldUseOverlay, onCollapseChange]);

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
            ? `fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out
               ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'transition-all duration-200 ease-out'
          }
          bg-[#948b54] text-white flex flex-col justify-between
          font-poppins shadow-lg overflow-hidden
          ${className}
        `}
        style={{
          width: shouldUseOverlay ? '256px' : sidebarWidth
        }}
        data-collapsed={shouldCollapse && !shouldUseOverlay}
        role="navigation"
        aria-label="Navegación principal"
      >
      {/* Header del sidebar */}
      <div>
        {/* Logo/Brand con botones de control */}
        <div className="border-b border-white/20 relative">
          {/* Contenedor del logo con padding ajustado para el botón */}
          <div className={`transition-all duration-200 ${
            shouldCollapse && !shouldUseOverlay
              ? 'p-2 pr-10'
              : 'p-4 pr-12'
          } flex items-center justify-center`}>
            {SIDEBAR_CONFIG.logo || SIDEBAR_CONFIG.isotipo ? (
              <img
                src={shouldCollapse && !shouldUseOverlay
                  ? SIDEBAR_CONFIG.isotipo || SIDEBAR_CONFIG.logo
                  : SIDEBAR_CONFIG.logo
                }
                alt="IPH Logo"
                className={`transition-all duration-200 ${
                  shouldCollapse && !shouldUseOverlay
                    ? 'h-6 w-6 object-contain'
                    : shouldUseOverlay
                      ? 'h-10 w-full object-contain'
                      : 'h-12 w-full object-contain'
                }`}
              />
            ) : (
              <h1 className={`text-white font-bold leading-tight transition-opacity duration-200 will-change-transform ${
                shouldCollapse && !shouldUseOverlay ? 'lg:opacity-100 opacity-0 text-xs text-center' : 'text-lg'
              }`}>
                {shouldCollapse && !shouldUseOverlay ? 'IPH' : SIDEBAR_CONFIG.title}
              </h1>
            )}
          </div>

          {/* Botones de control posicionados fuera del contenedor del logo */}
          {/* Botón de cierre en móvil */}
          {shouldUseOverlay && (
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              aria-label="Cerrar menú"
            >
              <X size={16} className="text-white drop-shadow-sm" />
            </button>
          )}

          {/* Botón de colapso en desktop/tablet */}
          {!shouldUseOverlay && (
            <button
              onClick={handleToggleCollapse}
              className={`absolute p-1.5 rounded-lg transition-all duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer ${
                shouldCollapse && !shouldUseOverlay
                  ? 'right-1 top-1 bg-white/20 hover:bg-white/30 shadow-lg backdrop-blur-sm'
                  : 'right-2 top-2 bg-white/10 hover:bg-white/20'
              }`}
              aria-label={shouldCollapse ? "Expandir sidebar" : "Colapsar sidebar"}
              title={shouldCollapse ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {shouldCollapse ? (
                <ChevronRight size={16} className="text-white drop-shadow-sm" />
              ) : (
                <ChevronLeft size={16} className="text-white drop-shadow-sm" />
              )}
            </button>
          )}
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
            <div className={`px-2 py-4 text-sm text-white/70 text-center transition-opacity duration-200 ${
              shouldCollapse && !shouldUseOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100'
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
          <span className={`text-sm font-medium transition-opacity duration-200 ${
            shouldCollapse && !shouldUseOverlay ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            Desconectar
          </span>
        </button>
      </div>
    </aside>
  </>
  );
};

export default Sidebar;
export { Sidebar, SidebarItem };