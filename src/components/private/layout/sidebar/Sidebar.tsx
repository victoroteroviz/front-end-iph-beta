/**
 * Componente Sidebar SUPER OPTIMIZADO v2.0
 * - Optimizado para prevenir re-renders innecesarios
 * - Precarga inteligente de rutas on hover
 * - Integración con RoutePreloader
 */

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Estilos
import './sidebar-animations.css';

// Helpers y configuración
import { logInfo } from '../../../../helper/log/logger.helper';
import { SIDEBAR_CONFIG, getFilteredSidebarItems } from './config/sidebarConfig';
import { RoutePreloader } from '../../../../helper/route-preloader';
import { getAllRoutes } from '../../../../config/app-routes.config';

// Hooks
import useUserSession from '../hooks/useUserSession';
import { useRouteTransitionContext } from '../../../../IPHApp';

// Interfaces
import type {
  SidebarProps,
  SidebarItemConfig
} from '../../../../interfaces/components/dashboard.interface';

// Constantes memoizadas
const MOBILE_BREAKPOINT = 768;
const SIDEBAR_WIDTHS = {
  mobile: '256px',
  collapsed: '64px',
  expanded: '240px'
} as const;

/**
 * Item individual del sidebar - SUPER OPTIMIZADO v2.0
 * - Con precarga inteligente on hover
 */
interface SidebarItemProps {
  item: SidebarItemConfig;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

const SidebarItem = React.memo<SidebarItemProps>(({ item, isActive, isCollapsed, onNavigate }) => {
  const cancelPreloadRef = useRef<(() => void) | null>(null);
  const allRoutes = useMemo(() => getAllRoutes(), []);
  const { startTransition } = useRouteTransitionContext();

  // Memoizar handler para evitar re-creaciones
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (item.isDisabled) {
      e.preventDefault();
      return;
    }

    // Si ya estamos en esta ruta, no activar transición ni navegar
    if (isActive) {
      e.preventDefault();
      return;
    }

    // Activar overlay de transición inmediatamente
    startTransition();

    // Ejecutar navegación
    onNavigate?.();
  }, [item.isDisabled, isActive, onNavigate, startTransition]);

  // Handler para precarga on hover
  const handleMouseEnter = useCallback(() => {
    if (item.isDisabled || isActive) return;

    // Buscar ruta correspondiente
    const route = allRoutes.find(r => r.id === item.id);
    if (!route) return;

    // Iniciar precarga con delay de 500ms
    cancelPreloadRef.current = RoutePreloader.preloadOnHover(
      route.id,
      route.component,
      500 // Delay de 500ms antes de precargar
    );
  }, [item.id, item.isDisabled, isActive, allRoutes]);

  // Handler para cancelar precarga si sale antes del delay
  const handleMouseLeave = useCallback(() => {
    if (cancelPreloadRef.current) {
      cancelPreloadRef.current();
      cancelPreloadRef.current = null;
    }
  }, []);

  // Pre-calcular clases con estado collapsed optimizado - Transición más suave
  const baseClasses = 'flex items-center rounded min-h-[44px]';
  const transitionClasses = 'transition-all duration-400 ease-in-out';
  const activeClasses = 'bg-[#7a7246] text-white shadow-sm';
  const inactiveClasses = 'hover:bg-[#7a7246] hover:text-white cursor-pointer';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  // Clases dinámicas para collapsed/expanded - Padding mínimo para background
  const spacingClasses = isCollapsed
    ? 'px-2 py-3 justify-center gap-0'  // Collapsed: centrado, sin gap, px mínimo
    : 'px-2 py-3 gap-3';                // Expanded: gap normal, px mínimo

  // Optimizar className con concatenación directa
  const className = `${baseClasses} ${transitionClasses} ${spacingClasses} ${
    isActive ? activeClasses : inactiveClasses
  }${item.isDisabled ? ` ${disabledClasses}` : ''}`;

  // Memoizar título para collapsed
  const title = isCollapsed ? item.label : undefined;

  return (
    <Link
      to={item.to || '#'}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      aria-label={`Navegar a ${item.label}`}
      title={title}
    >
      <span className="flex-shrink-0 transition-transform duration-400 ease-in-out">
        {item.icon}
      </span>
      <span className={`text-sm font-medium truncate transition-all duration-400 ease-in-out ${
        isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100 w-auto ml-0'
      }`}>
        {item.label}
      </span>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Optimizar comparación - verificar primitivos primero
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isCollapsed === nextProps.isCollapsed &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.isDisabled === nextProps.item.isDisabled &&
    prevProps.item.to === nextProps.item.to &&
    prevProps.onNavigate === nextProps.onNavigate
  );
});

// Nombre para debugging
SidebarItem.displayName = 'SidebarItem';

/**
 * Sidebar principal - SUPER OPTIMIZADO
 */
const Sidebar: React.FC<Partial<SidebarProps>> = ({
  className = '',
  isOpen = false,
  onToggle,
  onCollapseChange
}) => {
  const location = useLocation();
  const { userRole, logout, isAuthenticated, isLoading } = useUserSession();

  // Estados optimizados
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  // Items filtrados con memoización profunda
  const filteredItems = useMemo(() => {
    if (!userRole) return [];
    return getFilteredSidebarItems(userRole);
  }, [userRole]);

  // Pre-calcular valores boolean para optimizar renders
  const showOverlay = useMemo(() => isMobile && isOpen, [isMobile, isOpen]);
  const shouldCollapse = useMemo(() => isCollapsed && !isMobile, [isCollapsed, isMobile]);

  // Optimizar ancho del sidebar
  const sidebarWidth = useMemo(() => {
    if (isMobile) return SIDEBAR_WIDTHS.mobile;
    return isCollapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded;
  }, [isMobile, isCollapsed]);

  // Optimizar className del aside
  const asideClassName = useMemo(() => {
    const baseClasses = 'bg-[#948b54] text-white flex flex-col justify-between shadow-lg';
    const mobileClasses = isMobile
      ? `fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`
      : 'transition-all duration-300 ease-in-out';

    return `${mobileClasses} ${baseClasses}${className ? ` ${className}` : ''}`;
  }, [isMobile, isOpen, className]);

  // Handlers optimizados con throttling implícito
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(prevMobile => {
      if (prevMobile === mobile) return prevMobile; // Evitar updates innecesarios
      if (mobile) {
        setIsCollapsed(false); // En móvil nunca colapsado
      }
      return mobile;
    });
  }, []);

  const handleToggleCollapse = useCallback(() => {
    if (!isMobile) {
      setIsCollapsed(prev => !prev);
    }
  }, [isMobile]);

  const handleClose = useCallback(() => {
    onToggle?.();
  }, [onToggle]);

  // Memoizar handler de navegación - CLAVE para evitar re-renders
  const handleNavigation = useCallback(() => {
    if (isMobile) {
      onToggle?.();
    }
  }, [isMobile, onToggle]);

  // Effects optimizados
  useEffect(() => {
    // Throttle resize events para mejor rendimiento
    let timeoutId: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    return () => {
      window.removeEventListener('resize', throttledResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  // Effect optimizado para collapse change
  useEffect(() => {
    if (onCollapseChange && !isMobile) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, isMobile, onCollapseChange]);

  // Effect optimizado para logging - solo cuando cambia userRole
  useEffect(() => {
    if (userRole) {
      logInfo('Sidebar', 'User role updated', { userRole });
    }
  }, [userRole]);

  // Early returns
  if (!isAuthenticated && !userRole) return null;
  if (isLoading) {
    return (
      <aside className={`w-60 bg-[#948b54] text-white flex items-center justify-center ${className}`}>
        <div className="text-white/70">Cargando...</div>
      </aside>
    );
  }

  // Calculos ya hechos arriba

  return (
    <>
      {/* Overlay móvil con desenfoque gaussiano */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-all duration-200"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={asideClassName}
        style={{ width: sidebarWidth }}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Header */}
        <div>
          {/* Logo con controles - OPTIMIZADO */}
          <div className="relative">
            <div className={`transition-all duration-300 ease-in-out flex items-center ${
              shouldCollapse
                ? 'py-4 px-2 justify-center'
                : 'py-5 px-4 justify-start'
            }${isMobile ? ' pr-12' : ''}`}>
              {SIDEBAR_CONFIG.logo ? (
                <div className={`relative w-full flex items-center justify-center transition-all duration-400 ease-in-out ${
                  shouldCollapse ? 'h-10' : 'h-14'
                }`}>
                  {/* Logo completo - fade out cuando se colapsa */}
                  <img
                    src={SIDEBAR_CONFIG.logo}
                    alt="IPH Logo Completo"
                    className={`
                      absolute inset-0 m-auto
                      h-14 w-auto max-w-full object-contain
                      transition-all duration-400 ease-in-out
                      ${shouldCollapse
                        ? 'opacity-0 scale-75 pointer-events-none'
                        : 'opacity-100 scale-100'
                      }
                    `}
                    style={{
                      transformOrigin: 'center center',
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Isotipo - fade in cuando se colapsa */}
                  {SIDEBAR_CONFIG.isotipo && (
                    <img
                      src={SIDEBAR_CONFIG.isotipo}
                      alt="IPH Isotipo"
                      className={`
                        h-10 w-10 object-contain mx-auto
                        transition-all duration-400 ease-in-out
                        ${shouldCollapse
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-75 pointer-events-none'
                        }
                      `}
                      style={{
                        transformOrigin: 'center center',
                      }}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              ) : (
                <h1 className={`text-white font-bold transition-all duration-300 ${
                  shouldCollapse ? 'text-sm' : 'text-xl'
                }`}>
                  {shouldCollapse ? 'IPH' : SIDEBAR_CONFIG.title}
                </h1>
              )}
            </div>

            {/* Botón cerrar solo en móvil */}
            {isMobile && (
              <button
                onClick={handleClose}
                className="absolute right-2 top-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                aria-label="Cerrar menú"
              >
                <X size={18} className="text-white" />
              </button>
            )}
          </div>

          {/* Navegación - OPTIMIZADA */}
          <nav className={`mt-4 space-y-2 transition-all duration-400 ease-in-out ${shouldCollapse ? 'px-2' : 'px-4'}`}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={location.pathname === item.to}
                  isCollapsed={shouldCollapse}
                  onNavigate={isMobile ? handleNavigation : undefined}
                />
              ))
            ) : (
              <div className={`px-2 py-4 text-sm text-white/70 text-center ${
                shouldCollapse ? 'hidden' : ''
              }`}>
                No tienes acceso a ninguna sección
              </div>
            )}
          </nav>
        </div>

        {/* Footer con logout - OPTIMIZADO */}
        <div className={`pb-6 transition-all duration-300 ease-in-out ${shouldCollapse ? 'px-2' : 'px-4'}`}>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-2 py-3 rounded hover:bg-[#7a7246] transition-all duration-300 ease-in-out min-h-[44px]${
              shouldCollapse ? ' justify-center' : ''
            }`}
            title={shouldCollapse ? 'Desconectar' : undefined}
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`text-sm font-medium transition-all duration-300 ease-in-out ${
              shouldCollapse ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
            }`}>
              Desconectar
            </span>
          </button>
        </div>
      </aside>

      {/* Botón pestaña flotante collapse/expand - MEJORADO UX */}
      {!isMobile && (
        <button
          onClick={handleToggleCollapse}
          className="
            fixed top-1/2 -translate-y-1/2 z-50
            w-8 h-16
            bg-white/90 backdrop-blur-md
            hover:bg-white/95 hover:shadow-xl
            shadow-lg
            border-2 border-[rgb(121,85,72)] border-l-0
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            hover:w-9
            focus:outline-none focus:ring-2 focus:ring-[rgb(121,85,72)] focus:ring-offset-2 focus:ring-offset-white
            cursor-pointer
          "
          style={{
            left: sidebarWidth,
            borderTopRightRadius: '0.5rem',
            borderBottomRightRadius: '0.5rem',
            borderLeft: 'none',
            transition: 'left 400ms cubic-bezier(0.4, 0.0, 0.2, 1), width 400ms ease-in-out, background-color 400ms ease-in-out, box-shadow 400ms ease-in-out'
          }}
          aria-label={shouldCollapse ? "Expandir sidebar" : "Colapsar sidebar"}
          title={shouldCollapse ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {shouldCollapse ? (
            <ChevronRight size={20} className="text-[rgb(121,85,72)] transition-colors duration-300" />
          ) : (
            <ChevronLeft size={20} className="text-[rgb(121,85,72)] transition-colors duration-300" />
          )}
        </button>
      )}
    </>
  );
};

// Nombre para debugging
Sidebar.displayName = 'Sidebar';

export default Sidebar;
export { Sidebar, SidebarItem };