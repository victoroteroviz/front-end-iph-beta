/**
 * Componente Dashboard refactorizado
 * Layout principal de la aplicación con sidebar y topbar
 * 
 * Características:
 * - Componentes atómicos separados
 * - Sistema de roles integrado con ALLOWED_ROLES
 * - TypeScript completo
 * - Hooks personalizados para lógica
 * - sessionStorage en lugar de localStorage
 * - Logging completo de eventos
 * - Accesibilidad mejorada
 */

import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

// Componentes atómicos
import Sidebar from './sidebar/Sidebar';
// import Topbar from './topbar/Topbar'; // Desactivado temporalmente
import { Breadcrumbs, useBreadcrumbs } from '../../shared/components/breadcrumbs';

// Hooks
import useUserSession from './hooks/useUserSession';
import useSidebar from './hooks/useSidebar';


// Helpers
import { logInfo } from '../../../helper/log/logger.helper';

// Interfaces
import type { DashboardProps } from '../../../interfaces/components/dashboard.interface';

/**
 * Componente interno que usa el scroll context
 */
const DashboardContent: React.FC<DashboardProps> = ({
  children,
  className = ''
}) => {
  const location = useLocation();
  const {
    userRole,
    userData,
    isAuthenticated,
    isLoading,
    logout
  } = useUserSession();

  // Hook para manejo del sidebar responsive
  const sidebar = useSidebar();

  // Hook para breadcrumbs
  const { breadcrumbs } = useBreadcrumbs();

  // Estado para el colapso del sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  
  // Log cuando se monta el dashboard
  React.useEffect(() => {
    if (isAuthenticated && userRole && userData) {
      logInfo('Dashboard', 'Dashboard mounted successfully', {
        userId: userData.id,
        userRole,
        timestamp: new Date().toISOString()
      });
    }
  }, [isAuthenticated, userRole, userData]);

  // Estados de carga
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#f8f0e7] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d4725] mx-auto mb-4"></div>
          <p className="text-[#4d4725] font-poppins">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ MEJORADO: Redirigir explícitamente si no está autenticado
  if (!isAuthenticated || !userRole || !userData) {
    return <Navigate to="/" replace />;
  }

  return (
    <div 
      className={`flex h-screen bg-[#f8f0e7] font-poppins overflow-hidden ${className}`}
      role="main"
      aria-label="Dashboard principal"
    >
      {/* Sidebar Responsive */}
      <Sidebar
        userRole={userRole}
        onLogout={logout}
        className={sidebar.isMobile ? '' : 'flex-shrink-0'}
        isOpen={sidebar.isOpen}
        onToggle={sidebar.toggle}
        isMobile={sidebar.isMobile}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header con botón hamburger */}
        <div className="flex-shrink-0">
          {/* Botón hamburger para móvil */}
          {sidebar.isMobile && (
            <div className="px-4 pt-4 pb-2 bg-[#948b54]">
              <button
                onClick={sidebar.toggle}
                className="
                  flex items-center justify-center w-10 h-10
                  bg-[#4d4725] text-white rounded-lg
                  hover:bg-[#3a3519] transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
                "
                aria-label="Abrir menú de navegación"
                aria-expanded={sidebar.isOpen}
              >
                <Menu size={20} />
              </button>
            </div>
          )}

          {/* Topbar desactivado temporalmente */}
          {/* <Topbar userRole={userRole} onLogout={logout} /> */}
        </div>

      

        {/* Content Area con scroll */}
        <div
          className="flex-1 overflow-y-auto"
        >
          {/* Renderizar children o Outlet */}
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

/**
 * Componente principal del Dashboard con ScrollProvider
 */
const Dashboard: React.FC<DashboardProps> = (props) => {
  return (
      <DashboardContent {...props} />
  );
};

export default Dashboard;