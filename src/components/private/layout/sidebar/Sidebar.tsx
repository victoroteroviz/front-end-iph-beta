/**
 * Componente Sidebar refactorizado
 * Implementa principios SOLID, KISS y DRY
 * Sistema escalable de permisos y navegación
 */

import React, { useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

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
  onNavigate 
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
        flex items-center gap-3 px-2 py-2 rounded transition-colors duration-200
        ${isActive 
          ? 'bg-[#7a7246] text-white shadow-sm' 
          : 'hover:bg-[#7a7246] cursor-pointer'
        }
        ${config.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      aria-label={`Navegar a ${config.label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="flex-shrink-0" aria-hidden="true">
        {config.icon}
      </span>
      <span className="text-sm font-medium truncate">
        {config.label}
      </span>
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
  className = '' 
}) => {
  const location = useLocation();
  const { 
    userRole: sessionUserRole, 
    logout: sessionLogout, 
    isAuthenticated,
    isLoading 
  } = useUserSession();

  // Usar props o datos de sesión
  const currentPath = propCurrentPath || location.pathname;
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

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
      userRole: userRole || 'unknown'
    });
  }, [location.pathname, userRole]);

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
    <aside 
      className={`
        w-60 bg-[#948b54] text-white flex flex-col justify-between
        font-poppins shadow-lg
        ${className}
      `}
      role="navigation"
      aria-label="Navegación principal"
    >
      {/* Header del sidebar */}
      <div>
        {/* Título/Brand */}
        <div className="p-4 font-bold text-lg border-b border-white/20">
          <h1 className="text-white leading-tight">
            {SIDEBAR_CONFIG.title}
          </h1>
        </div>

        {/* Navegación principal */}
        <nav 
          className="mt-4 space-y-2 px-4"
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
                />
              </div>
            ))
          ) : (
            <div className="px-2 py-4 text-sm text-white/70 text-center">
              No tienes acceso a ninguna sección
            </div>
          )}
        </nav>
      </div>

      {/* Footer con logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-3 px-2 py-2 rounded 
            hover:bg-[#7a7246] cursor-pointer transition-colors duration-200
            text-left text-white
          "
          aria-label="Cerrar sesión"
          type="button"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="text-sm font-medium">Desconectar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
export { Sidebar, SidebarItem };