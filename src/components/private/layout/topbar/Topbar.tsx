/**
 * Componente Topbar refactorizado
 * Maneja la barra superior con búsqueda y dropdown de usuario
 */

import React from 'react';
import { useLocation } from 'react-router-dom';

// Componentes
import SearchBar from './SearchBar';
import UserDropdown from './UserDropdown';

// Hooks
import useUserSession from '../hooks/useUserSession';

// Interfaces
import type { TopbarProps } from '../../../../interfaces/components/dashboard.interface';

/**
 * Componente principal del Topbar
 * 
 * @param props - Props del topbar
 * @returns JSX.Element del topbar completo
 */
const Topbar: React.FC<Partial<TopbarProps>> = ({ 
  userRole: propUserRole,
  onLogout: propOnLogout,
  showSearch: propShowSearch,
  className = ''
}) => {
  const location = useLocation();
  const { 
    userRole: sessionUserRole, 
    userData,
    logout: sessionLogout 
  } = useUserSession();

  // Usar props o datos de sesión
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

  // Determinar si mostrar búsqueda basado en la ruta actual
  const esPaginaUsuarios = location.pathname === "/usuarios";
  const esPaginaPerfilUsuarios = location.pathname.startsWith("/perfilusuario");
  const shouldShowSearch = propShowSearch !== undefined 
    ? propShowSearch 
    : !(esPaginaUsuarios || esPaginaPerfilUsuarios);

  // Si no hay datos de usuario, no renderizar
  if (!userData || !userRole) {
    return (
      <div className={`flex justify-end items-center mb-6 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      {/* Lado izquierdo - Búsqueda */}
      <div className="relative w-full max-w-md">
        {shouldShowSearch && (
          <SearchBar 
            placeholder="Buscar IPH"
            onSearch={(query) => {
              // TODO: Implementar lógica de búsqueda cuando esté el componente
              console.log('Searching for:', query);
            }}
          />
        )}
      </div>

      {/* Lado derecho - Usuario */}
      <div className="flex items-center gap-4">
        <UserDropdown 
          userData={userData}
          onLogout={onLogout}
          onProfileClick={() => {
            // TODO: Implementar navegación a perfil
            console.log('Navigate to profile');
          }}
        />
      </div>
    </div>
  );
};

export default Topbar;