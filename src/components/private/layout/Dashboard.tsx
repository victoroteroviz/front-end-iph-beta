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
import { Outlet } from 'react-router-dom';

// Componentes atómicos
import Sidebar from './sidebar/Sidebar';
import Topbar from './topbar/Topbar';

// Hooks
import useUserSession from './hooks/useUserSession';

// Context
import { ScrollProvider, useScrollContext } from '../../../contexts/ScrollContext';

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
  const { scrollContainerRef } = useScrollContext();
  const { 
    userRole, 
    userData, 
    isAuthenticated, 
    isLoading, 
    logout 
  } = useUserSession();

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

  // Si no está autenticado, no renderizar (el useUserSession ya redirige)
  if (!isAuthenticated || !userRole || !userData) {
    return (
      <div className={`min-h-screen bg-[#f8f0e7] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-[#4d4725] font-poppins">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex h-screen bg-[#f8f0e7] font-poppins overflow-hidden ${className}`}
      role="main"
      aria-label="Dashboard principal"
    >
      {/* Sidebar */}
      <Sidebar 
        userRole={userRole}
        onLogout={logout}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex-shrink-0 p-6 pb-0">
          <Topbar 
            userRole={userRole}
            onLogout={logout}
          />
        </div>

        {/* Content Area con scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 px-6 pb-6 overflow-y-auto"
        >
          <div className="h-full">
            {/* Renderizar children o Outlet */}
            {children || <Outlet />}
          </div>
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
    <ScrollProvider>
      <DashboardContent {...props} />
    </ScrollProvider>
  );
};

export default Dashboard;