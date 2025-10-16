/**
 * Componente Sidebar OPTIMIZADO
 * Optimizado para prevenir re-renders innecesarios
 */

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Estilos
import './sidebar-animations.css';

// Helpers y configuración
import { logInfo } from '../../../../helper/log/logger.helper';
import { SIDEBAR_CONFIG, getFilteredSidebarItems } from './config/sidebarConfig';

// Hooks
import useUserSession from '../hooks/useUserSession';

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
 * Item individual del sidebar - SUPER OPTIMIZADO
 */
interface SidebarItemProps {
  item: SidebarItemConfig;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}

{
  console.log('This is a dummy change to force git to recognize the file as changed.');
}

const SidebarItem = React.memo<SidebarItemProps>(({ item, isActive, isCollapsed, onNavigate }) => {
  // Memoizar handler para evitar re-creaciones
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (item.isDisabled) {
      e.preventDefault();
      return;
    }
    onNavigate?.();
  }, [item.isDisabled, onNavigate]);

  // Pre-calcular clases estáticas
  const baseClasses = 'flex items-center gap-3 px-2 py-3 rounded transition-all duration-300 ease-in-out min-h-[44px]';
  const activeClasses = 'bg-[#7a7246] text-white shadow-sm';
  const inactiveClasses = 'hover:bg-[#7a7246] hover:text-white cursor-pointer';
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const collapsedClasses = 'justify-center';

  // Optimizar className con concatenación directa
  const className = `${baseClasses} ${
    isActive ? activeClasses : inactiveClasses
  }${item.isDisabled ? ` ${disabledClasses}` : ''}${
    isCollapsed ? ` ${collapsedClasses}` : ''
  }`;

  // Memoizar título para collapsed
  const title = isCollapsed ? item.label : undefined;

  return (
    <Link
      to={item.to || '#'}
      onClick={handleClick}
      className={className}
      aria-label={`Navegar a ${item.label}`}
      title={title}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span className={`text-sm font-medium truncate transition-all duration-300 ease-in-out ${
        isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
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
            <div className={`transition-all duration-300 ease-in-out ${
              shouldCollapse ? 'p-2 pr-10' : 'p-4 pr-12'
            } flex items-center justify-center`}>
              {SIDEBAR_CONFIG.logo ? (
                <img
                  key={shouldCollapse ? 'isotipo' : 'logo'} // Force re-render para smooth transition
                  src={shouldCollapse
                    ? SIDEBAR_CONFIG.isotipo || SIDEBAR_CONFIG.logo
                    : SIDEBAR_CONFIG.logo
                  }
                  alt="IPH Logo"
                  className={`transition-all duration-300 ease-in-out ${
                    shouldCollapse
                      ? 'h-8 w-8 object-contain'
                      : 'h-12 w-auto max-w-full object-contain'
                  }`}
                />
              ) : (
                <h1 className={`text-white font-bold transition-all duration-300 ${
                  shouldCollapse ? 'text-xs' : 'text-lg'
                }`}>
                  {shouldCollapse ? 'IPH' : SIDEBAR_CONFIG.title}
                </h1>
              )}
            </div>

            {/* Botones de control */}
            {isMobile ? (
              <button
                onClick={handleClose}
                className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200"
                aria-label="Cerrar menú"
              >
                <X size={16} className="text-white" />
              </button>
            ) : (
              <button
                onClick={handleToggleCollapse}
                className="absolute right-2 top-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 ease-in-out"
                aria-label={shouldCollapse ? "Expandir sidebar" : "Colapsar sidebar"}
              >
                <div className="transition-transform duration-300 ease-in-out">
                  {shouldCollapse ? (
                    <ChevronRight size={16} className="text-white" />
                  ) : (
                    <ChevronLeft size={16} className="text-white" />
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Navegación - OPTIMIZADA */}
          <nav className={`mt-4 space-y-2 transition-all duration-300 ease-in-out ${shouldCollapse ? 'px-2' : 'px-4'}`}>
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
    </>
  );
};

// Nombre para debugging
Sidebar.displayName = 'Sidebar';

export default Sidebar;
export { Sidebar, SidebarItem };