/**
 * Componente UserDropdown
 * Dropdown con información del usuario y opciones
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ChevronDown, User, LogOut } from 'lucide-react';

// Hooks
import useClickOutside from '../hooks/useClickOutside';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { UserDropdownProps } from '../../../../interfaces/components/dashboard.interface';

/**
 * Componente dropdown del usuario
 * 
 * @param props - Props del dropdown de usuario
 * @returns JSX.Element del dropdown
 */
const UserDropdown: React.FC<UserDropdownProps> = ({ 
  userData,
  onLogout,
  onProfileClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Hook para cerrar el dropdown al hacer click fuera
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  });

  /**
   * Toggle del dropdown
   */
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    
    logInfo('UserDropdown', 'Dropdown toggled', {
      isOpen: !isOpen,
      userId: userData.id
    });
  }, [isOpen, userData.id]);

  /**
   * Maneja el click en ver perfil
   */
  const handleProfileClick = useCallback(() => {
    logInfo('UserDropdown', 'User clicked on profile', {
      userId: userData.id
    });
    
    setIsOpen(false);
    
    if (onProfileClick) {
      onProfileClick();
    } else {
      // Navegación por defecto
      navigate('/perfilusuario');
    }
  }, [userData.id, onProfileClick, navigate]);

  /**
   * Maneja el logout
   */
  const handleLogout = useCallback(() => {
    logInfo('UserDropdown', 'User initiated logout from dropdown', {
      userId: userData.id
    });
    
    setIsOpen(false);
    onLogout();
  }, [userData.id, onLogout]);

  // Formatear nombre completo
  const nombreCompleto = `${userData.nombre} ${userData.primer_apellido} ${userData.segundo_apellido}`.trim();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger del dropdown */}
      <button
        onClick={toggleDropdown}
        className="
          flex items-center gap-2 cursor-pointer 
          hover:text-[#948b54] transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-[#4d4725] rounded
          p-1
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Menú de usuario"
      >
        <UserCircle size={24} />
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="
            absolute right-0 mt-2 w-72 
            bg-white rounded-xl shadow-lg z-50 
            overflow-hidden border border-gray-200
            animate-in slide-in-from-top-2 duration-200
          "
          role="menu"
          aria-label="Menú de opciones de usuario"
        >
          {/* Header con información del usuario */}
          <div className="flex items-center gap-4 px-4 py-3 bg-[#f8f0e7]">
            <img
              src={userData.foto || '/default-avatar.png'}
              alt={`Foto de ${nombreCompleto}`}
              className="w-12 h-12 rounded-full object-cover border border-gray-300"
              onError={(e) => {
                // Fallback si la imagen no carga
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            {/* Fallback avatar */}
            <div className="w-12 h-12 rounded-full bg-[#948b54] flex items-center justify-center hidden">
              <User size={24} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#4d4725] leading-tight truncate">
                {nombreCompleto || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 break-all">
                ID: {userData.id}
              </p>
              {userData.rol && (
                <p className="text-xs text-[#948b54] font-medium">
                  {userData.rol}
                </p>
              )}
            </div>
          </div>

          {/* Opciones del menú */}
          <div className="divide-y text-sm">
            <button
              onClick={handleProfileClick}
              className="
                w-full text-left px-4 py-3 
                hover:bg-gray-100 transition-colors duration-200
                flex items-center gap-2 text-[#4d4725]
                focus:outline-none focus:bg-gray-100
              "
              role="menuitem"
            >
              <User size={16} aria-hidden="true" />
              Ver perfil
            </button>
            
            <button
              onClick={handleLogout}
              className="
                w-full text-left px-4 py-3 
                hover:bg-gray-100 transition-colors duration-200
                flex items-center gap-2 text-[#4d4725]
                focus:outline-none focus:bg-gray-100
              "
              role="menuitem"
            >
              <LogOut size={16} aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;