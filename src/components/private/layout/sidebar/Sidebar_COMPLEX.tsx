/**
 * Componente Sidebar SIMPLIFICADO
 * Sin over-engineering - solo lo esencial
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

/**
 * Item individual del sidebar - SIMPLE
 */
const SidebarItem: React.FC<{
  item: SidebarItemConfig;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}> = React.memo(({ item, isActive, isCollapsed, onNavigate }) => {
  const handleClick = useCallback(() => {
    if (item.isDisabled) return;
    onNavigate?.();
  }, [item.isDisabled, onNavigate]);

  const className = `
    flex items-center gap-3 px-2 py-3 rounded transition-all duration-150 min-h-[44px]
    ${isActive 
      ? 'bg-[#7a7246] text-white shadow-sm' 
      : 'hover:bg-[#7a7246] hover:text-white cursor-pointer'
    }
    ${item.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isCollapsed ? 'justify-center' : ''}
  `;

  return (
    <Link
      to={item.to || '#'}
      onClick={handleClick}
      className={className}
      aria-label={`Navegar a ${item.label}`}
      title={isCollapsed ? item.label : undefined}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!isCollapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
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

  // Estado optimizado con valores iniciales más inteligentes y throttle
  const [windowWidth, setWindowWidth] = useState<number>(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  
  // Usar un flag para evitar setState durante unmount
  const [isMounted, setIsMounted] = useState(true);
  
  // Refs para manejo de timeouts y throttling
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toggleClickTimeRef = useRef<number>(0);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hook optimizado para el toggle que maneja múltiples clics rápidos
  const { 
    value: isManuallyCollapsed, 
    deferredValue: deferredCollapsedState, 
    toggle: toggleCollapse,
    setValue: setIsManuallyCollapsed 
  } = useOptimizedToggle({ initialValue: false });

  // Cálculo memoizado de breakpoints con mayor precisión
  const { isTablet, shouldUseOverlay, shouldCollapse } = useMemo(() => {
    const mobile = windowWidth < 768;
    const tablet = windowWidth >= 768 && windowWidth < 1024;
    
    return {
      isTablet: tablet,
      shouldUseOverlay: mobile,
      shouldCollapse: mobile ? false : (tablet || deferredCollapsedState)
    };
  }, [windowWidth, deferredCollapsedState]);

  // Estado inicial del collapse - una sola vez
  useEffect(() => {
    const initialWidth = window.innerWidth;
    if (initialWidth >= 768 && initialWidth < 1024) { // Es tablet
      setIsManuallyCollapsed(true);
    }
  }, [setIsManuallyCollapsed]); // Dependencia necesaria

  // Resize handler ultra-optimizado con cleanup mejorado y anti-spam
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastWidth = window.innerWidth;
    let isProcessing = false; // Flag para evitar procesamiento concurrente

    const handleResize = () => {
      if (isProcessing) return; // Evitar resize concurrente
      
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!isMounted) return; // Check temprano
        
        isProcessing = true;
        const newWidth = window.innerWidth;
        
        // Solo actualizar si realmente cambió y el componente está montado
        if (newWidth !== lastWidth && isMounted) {
          lastWidth = newWidth;
          setWindowWidth(newWidth);
        }
        
        isProcessing = false;
      }, 120); // Reducido a 120ms para mejor balance UX/performance
    };

    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      setIsMounted(false);
      isProcessing = false;
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMounted]); // Dependencia del flag de mounted

  // Usar props o datos de sesión
  const currentPath = propCurrentPath || location.pathname;
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

  // Calcular solo el ancho del sidebar basado en los estados memoizados
  const sidebarWidth = useMemo(() => 
    shouldUseOverlay ? '256px' : shouldCollapse ? '64px' : '240px',
    [shouldUseOverlay, shouldCollapse]
  );

  /**
   * Obtiene los items filtrados según permisos del usuario - Memoizado para performance
   */
  const filteredItems = useMemo(() => {
    if (!userRole) return [];
    return getFilteredSidebarItems(userRole);
  }, [userRole]);

  /**
   * Handler de navegación - con cancelación de timeouts previos
   */
  const handleNavigation = useCallback((path: string): void => {
    // Log de navegación en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigating to:', path);
    }
    
    // Solo cerrar sidebar en móvil - React Router maneja la navegación
    if (onToggle) {
      // Verificar si es móvil dentro del callback para evitar dependencias
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Cancelar timeout previo si existe
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        
        // Crear nuevo timeout
        navigationTimeoutRef.current = setTimeout(() => {
          if (isMounted) { // Verificar que sigue montado
            onToggle();
          }
          navigationTimeoutRef.current = null;
        }, 60); // Reducido a 60ms y más responsivo
      }
    }
  }, [onToggle, isMounted]); // Agregar isMounted como dependencia

  const handleLogout = useCallback((): void => {
    onLogout();
  }, [onLogout]);

  const handleClose = useCallback((): void => {
    if (onToggle) {
      onToggle();
    }
  }, [onToggle]);

  // Handler del toggle con protección contra clicks múltiples
  const handleToggleCollapse = useCallback((): void => {
    // Throttling a nivel de handler para doble protección
    const now = Date.now();
    
    if (now - toggleClickTimeRef.current < 120) {
      return; // Ignorar click si es muy rápido (120ms mínimo)
    }
    
    toggleClickTimeRef.current = now;
    toggleCollapse();
  }, [toggleCollapse]);

  // Log optimizado - solo cuando cambia el userRole
  useEffect(() => {
    if (userRole) {
      logInfo('Sidebar', 'User role set for sidebar', { userRole });
    }
  }, [userRole]); // Solo dependencia del userRole

  // Cleanup effect para limpiar todos los timeouts al desmontar
  useEffect(() => {
    return () => {
      // Limpiar todos los timeouts pendientes
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []); // Solo al montar/desmontar



  // Notificar cambios de colapso - con debounce y anti-spam mejorado
  useEffect(() => {
    if (onCollapseChange && !shouldUseOverlay && isMounted) {
      // Cancelar notificación previa si existe
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
      
      collapseTimeoutRef.current = setTimeout(() => {
        if (isMounted) { // Verificar nuevamente antes de ejecutar
          onCollapseChange(shouldCollapse);
        }
        collapseTimeoutRef.current = null;
      }, 100); // Ajustado a 100ms para balance
      
      return () => {
        if (collapseTimeoutRef.current) {
          clearTimeout(collapseTimeoutRef.current);
          collapseTimeoutRef.current = null;
        }
      };
    }
  }, [shouldCollapse, shouldUseOverlay, onCollapseChange, isMounted]);

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
              {(isTablet || isManuallyCollapsed) ? (
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