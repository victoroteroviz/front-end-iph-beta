/**
 * @fileoverview Componente de breadcrumb para perfil de usuario
 * @version 1.0.0
 * @description Componente independiente que muestra el perfil del usuario en breadcrumbs
 * No depende de props externas, obtiene datos directamente del helper
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';

/**
 * Props del componente UserProfileBreadcrumb
 *
 * @interface UserProfileBreadcrumbProps
 */
export interface UserProfileBreadcrumbProps {
  /** Ruta a la que navegar al hacer click (default: '/perfil') */
  profilePath?: string;
  /** Si debe mostrar el avatar (default: true) */
  showAvatar?: boolean;
  /** Si debe mostrar el nombre (default: true) */
  showName?: boolean;
  /** Tamaño del avatar en píxeles (default: 24) */
  avatarSize?: number;
  /** Clase CSS adicional */
  className?: string;
  /** Callback al hacer click (opcional, sobrescribe navegación por defecto) */
  onClick?: () => void;
  /** Si debe incluir segundo apellido en el nombre (default: false) */
  includeSecondLastName?: boolean;
}

/**
 * Componente de breadcrumb para mostrar perfil de usuario
 *
 * Este componente es **completamente independiente** y no requiere props.
 * Obtiene los datos del usuario directamente desde `user.helper.ts` a través
 * del custom hook `useUserData`.
 *
 * @component
 * @param {UserProfileBreadcrumbProps} props - Props del componente
 * @returns {JSX.Element | null} Breadcrumb de perfil o null si no hay datos
 *
 * @example
 * ```tsx
 * // Uso básico (sin props)
 * <Breadcrumbs>
 *   <UserProfileBreadcrumb />
 * </Breadcrumbs>
 * ```
 *
 * @example
 * ```tsx
 * // Con configuración personalizada
 * <UserProfileBreadcrumb
 *   profilePath="/mi-cuenta"
 *   avatarSize={32}
 *   showAvatar={true}
 *   showName={true}
 *   includeSecondLastName={false}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Con onClick personalizado
 * <UserProfileBreadcrumb
 *   onClick={() => {
 *     console.log('Click en perfil');
 *     navigate('/perfil');
 *   }}
 * />
 * ```
 */
export const UserProfileBreadcrumb: React.FC<UserProfileBreadcrumbProps> = ({
  profilePath = '/perfil',
  showAvatar = true,
  showName = true,
  avatarSize = 24,
  className = '',
  onClick,
  includeSecondLastName = false
}) => {
  const navigate = useNavigate();

  // Obtener datos del usuario (independiente, sin props)
  const { fullName, avatar, hasProfilePhoto, initials, hasData } = useUserData({
    immediate: true,
    nameFormat: { includeSecondLastName },
    useDefaultAvatar: true
  });

  // Si no hay datos de usuario, no renderizar nada
  if (!hasData) {
    return null;
  }

  /**
   * Handler de click
   */
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(profilePath);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2
        text-sm text-gray-600 hover:text-gray-800
        transition-colors duration-200
        bg-transparent border-none cursor-pointer p-0
        ${className}
      `}
      title="Ir a mi perfil"
      aria-label="Ir a mi perfil"
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className="flex-shrink-0 rounded-full overflow-hidden"
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`
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
              className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold"
              style={{ fontSize: `${avatarSize * 0.4}px` }}
            >
              {initials || <User size={avatarSize * 0.6} />}
            </div>
          )}
        </div>
      )}

      {/* Nombre */}
      {showName && (
        <span className="truncate font-medium">
          {fullName || 'Usuario'}
        </span>
      )}
    </button>
  );
};

/**
 * Variante compacta del breadcrumb (solo avatar)
 *
 * @component
 * @param {Omit<UserProfileBreadcrumbProps, 'showName'>} props - Props sin showName
 * @returns {JSX.Element | null} Breadcrumb compacto
 *
 * @example
 * ```tsx
 * <UserProfileBreadcrumbCompact avatarSize={28} />
 * ```
 */
export const UserProfileBreadcrumbCompact: React.FC<
  Omit<UserProfileBreadcrumbProps, 'showName'>
> = (props) => {
  return <UserProfileBreadcrumb {...props} showName={false} />;
};

/**
 * Variante extendida del breadcrumb (con segundo apellido)
 *
 * @component
 * @param {Omit<UserProfileBreadcrumbProps, 'includeSecondLastName'>} props - Props
 * @returns {JSX.Element | null} Breadcrumb extendido
 *
 * @example
 * ```tsx
 * <UserProfileBreadcrumbExtended />
 * ```
 */
export const UserProfileBreadcrumbExtended: React.FC<
  Omit<UserProfileBreadcrumbProps, 'includeSecondLastName'>
> = (props) => {
  return <UserProfileBreadcrumb {...props} includeSecondLastName={true} />;
};

export default UserProfileBreadcrumb;
