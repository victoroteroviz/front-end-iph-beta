/**
 * Componente Topbar refactorizado
 * Barra superior simplificada con solo el dropdown de usuario
 */

import React from 'react';

// Componentes
import UserDropdown from './UserDropdown';

// Hooks
import useUserSession from '../hooks/useUserSession';

// Interfaces
import type { TopbarProps } from '../../../../interfaces/components/dashboard.interface';

/**
 * Componente principal del Topbar
 *
 * @param props - Props del topbar
 * @returns JSX.Element del topbar simplificado
 */
const Topbar: React.FC<Partial<TopbarProps>> = ({
  userRole: propUserRole,
  onLogout: propOnLogout,
  className = ''
}) => {
  const {
    userRole: sessionUserRole,
    userData,
    logout: sessionLogout
  } = useUserSession();

  // Usar props o datos de sesión
  const userRole = propUserRole || sessionUserRole;
  const onLogout = propOnLogout || sessionLogout;

  // Si no hay datos de usuario, mostrar skeleton
  if (!userData || !userRole) {
    return (
      <div
        className={`flex justify-end items-center px-6 py-4 ${className}`}
        style={{ backgroundColor: 'rgb(148, 139, 84)' }}
      >
        <div className="animate-pulse bg-white/20 h-10 w-40 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div
      className={`flex justify-end items-center px-6 py-4 ${className}`}
      style={{ backgroundColor: 'rgb(148, 139, 84)' }}
    >
      {/* Solo UserDropdown alineado a la derecha */}
      <UserDropdown
        userData={userData}
        onLogout={onLogout}
        onProfileClick={() => {
          // TODO: Implementar navegación a perfil
          console.log('Navigate to profile');
        }}
      />
    </div>
  );
};

export default Topbar;