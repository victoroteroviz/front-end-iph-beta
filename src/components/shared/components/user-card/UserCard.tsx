/**
 * @fileoverview Componente UserCard para mostrar información del usuario
 * @version 1.0.0
 * @description Card independiente que muestra datos completos del usuario desde sessionStorage
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { getUserRoles } from '@/helper/role/role.helper';

/**
 * Props del componente UserCard
 */
export interface UserCardProps {
  /** Si debe mostrar el menú desplegable (default: false) */
  showDropdown?: boolean;
  /** Ruta del perfil (default: '/perfil') */
  profilePath?: string;
  /** Callback de logout */
  onLogout?: () => void;
  /** Clase CSS adicional */
  className?: string;
  /** Variante de tamaño: 'compact' | 'normal' | 'large' */
  variant?: 'compact' | 'normal' | 'large';
}

/**
 * Componente UserCard - Tarjeta de usuario con información completa
 *
 * Muestra:
 * - Avatar (foto o iniciales)
 * - Nombre completo
 * - Rol principal
 * - Badge de estado
 * - Menú desplegable opcional
 *
 * @component
 * @example
 * ```tsx
 * // Uso básico
 * <UserCard />
 *
 * // Con dropdown y logout
 * <UserCard
 *   showDropdown={true}
 *   onLogout={handleLogout}
 * />
 *
 * // Variante compacta
 * <UserCard variant="compact" />
 * ```
 */
export const UserCard: React.FC<UserCardProps> = ({
  showDropdown = false,
  profilePath = '/perfil',
  onLogout,
  className = '',
  variant = 'normal'
}) => {
  // ✅ TODOS LOS HOOKS DEBEN IR AL INICIO (Rules of Hooks)
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Obtener datos del usuario
  const { fullName, avatar, hasProfilePhoto, initials, hasData, userData } = useUserData({
    immediate: true,
    nameFormat: { includeSecondLastName: false },
    useDefaultAvatar: true
  });

  /**
   * Cerrar dropdown al hacer click fuera
   */
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // ✅ EARLY RETURN DESPUÉS DE TODOS LOS HOOKS
  // Si no hay datos, no renderizar
  if (!hasData) {
    return null;
  }

  // Obtener rol principal
  const userRoles = getUserRoles();
  const primaryRole = userRoles?.[0]?.nombre || 'Usuario';

  // Tamaños según variante
  const sizes = {
    compact: {
      avatar: 32,
      fontSize: 'text-sm',
      padding: 'p-2',
      gap: 'gap-2'
    },
    normal: {
      avatar: 40,
      fontSize: 'text-base',
      padding: 'p-3',
      gap: 'gap-3'
    },
    large: {
      avatar: 48,
      fontSize: 'text-lg',
      padding: 'p-4',
      gap: 'gap-4'
    }
  };

  const size = sizes[variant];

  /**
   * Handler de navegación al perfil
   */
  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(profilePath);
  };

  /**
   * Handler de logout
   */
  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  /**
   * Toggle del dropdown
   */
  const toggleDropdown = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Card Principal */}
      <div
        onClick={showDropdown ? toggleDropdown : undefined}
        className={`
          flex items-center ${size.gap} ${size.padding}
          bg-white rounded-lg shadow-sm border border-gray-200
          ${showDropdown ? 'cursor-pointer hover:shadow-md' : ''}
          transition-all duration-200
        `}
        role={showDropdown ? 'button' : 'article'}
        aria-label="Información del usuario"
        aria-expanded={showDropdown ? isDropdownOpen : undefined}
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 rounded-full overflow-hidden ring-2 ring-[#948b54]"
          style={{
            width: `${size.avatar}px`,
            height: `${size.avatar}px`
          }}
        >
          {hasProfilePhoto && avatar ? (
            <img
              src={avatar}
              alt="Avatar del usuario"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-gradient-to-br from-[#948b54] to-[#4d4725] text-white flex items-center justify-center font-semibold"
              style={{ fontSize: `${size.avatar * 0.4}px` }}
            >
              {initials || <User size={size.avatar * 0.6} />}
            </div>
          )}
        </div>

        {/* Info del usuario */}
        <div className="flex-1 min-w-0">
          {/* Nombre */}
          <p className={`${size.fontSize} font-semibold text-[#4d4725] truncate`}>
            {fullName || 'Usuario'}
          </p>

          {/* Rol */}
          <p className="text-xs text-gray-500 truncate">
            {primaryRole}
          </p>
        </div>

        {/* Badge de estado */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>

          {/* Icono de dropdown */}
          {showDropdown && (
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {showDropdown && isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Info expandida */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-[#4d4725] truncate">
              {fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              ID: {userData?.id}
            </p>
          </div>

          {/* Opciones */}
          <div className="py-1">
            {/* Ver Perfil */}
            <button
              onClick={handleProfileClick}
              className="
                w-full flex items-center gap-3 px-4 py-2
                text-sm text-gray-700 hover:bg-gray-100
                transition-colors duration-150
              "
            >
              <User size={16} />
              Ver Perfil
            </button>

            {/* Configuración */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                navigate('/configuracion');
              }}
              className="
                w-full flex items-center gap-3 px-4 py-2
                text-sm text-gray-700 hover:bg-gray-100
                transition-colors duration-150
              "
            >
              <Settings size={16} />
              Configuración
            </button>
          </div>

          {/* Logout */}
          {onLogout && (
            <div className="border-t border-gray-200 py-1">
              <button
                onClick={handleLogout}
                className="
                  w-full flex items-center gap-3 px-4 py-2
                  text-sm text-red-600 hover:bg-red-50
                  transition-colors duration-150
                "
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Variante compacta del UserCard
 */
export const UserCardCompact: React.FC<Omit<UserCardProps, 'variant'>> = (props) => {
  return <UserCard {...props} variant="compact" />;
};

/**
 * Variante grande del UserCard
 */
export const UserCardLarge: React.FC<Omit<UserCardProps, 'variant'>> = (props) => {
  return <UserCard {...props} variant="large" />;
};

export default UserCard;
