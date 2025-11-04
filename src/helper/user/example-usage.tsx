/**
 * @fileoverview Ejemplos de uso del User Helper
 * @description Este archivo contiene ejemplos prácticos de cómo usar el user.helper
 *
 * ⚠️ NOTA: Este archivo es solo de referencia/documentación.
 * NO importar en código de producción.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserData,
  getUserFullName,
  getUserAvatar,
  hasAvatar,
  getUserInitials,
  getUserContext,
  hasUserData,
  invalidateUserCache
} from './user.helper';

// ==================== EJEMPLO 1: Navbar con Nombre de Usuario ====================

/**
 * Navbar simple que muestra el nombre del usuario
 */
export const NavbarExample: React.FC = () => {
  const userName = getUserFullName({ includeSecondLastName: false });

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <h1>IPH System</h1>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Bienvenido, <strong>{userName}</strong>
        </span>
      </div>
    </nav>
  );
};

// ==================== EJEMPLO 2: Avatar con Fallback a Iniciales ====================

/**
 * Componente de avatar que muestra foto o iniciales
 */
export const UserAvatarExample: React.FC<{
  size?: 'sm' | 'md' | 'lg';
}> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0`}>
      {hasAvatar() ? (
        <img
          src={getUserAvatar()!}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center font-semibold">
          {getUserInitials()}
        </div>
      )}
    </div>
  );
};

// ==================== EJEMPLO 3: Dropdown de Perfil Completo ====================

/**
 * Dropdown de perfil con avatar, nombre y opciones
 */
export const ProfileDropdownExample: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const context = getUserContext();

  if (!context) return null;

  const { fullName, avatarUrl, hasAvatar: hasCustomAvatar } = context;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {hasCustomAvatar ? (
            <img src={avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
              {getUserInitials()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium">{fullName}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={() => {
              navigate('/perfil');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Ver Perfil
          </button>
          <button
            onClick={() => {
              navigate('/configuracion');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Configuración
          </button>
          <hr className="my-1" />
          <button
            onClick={() => {
              // Lógica de logout
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== EJEMPLO 4: Perfil de Usuario Completo ====================

/**
 * Página de perfil del usuario con toda la información
 */
export const UserProfilePageExample: React.FC = () => {
  const userData = getUserData();

  if (!userData) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">No hay datos de usuario disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header con Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden">
          {hasAvatar() ? (
            <img
              src={getUserAvatar()!}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold">
              {getUserInitials()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getUserFullName()}
          </h1>
          <p className="text-sm text-gray-600">ID: {userData.id}</p>
        </div>
      </div>

      {/* Información Detallada */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600">Primer Nombre</label>
          <p className="text-base font-medium">{userData.nombre}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600">Primer Apellido</label>
          <p className="text-base font-medium">{userData.primer_apellido}</p>
        </div>

        {userData.segundo_apellido && (
          <div>
            <label className="text-sm text-gray-600">Segundo Apellido</label>
            <p className="text-base font-medium">{userData.segundo_apellido}</p>
          </div>
        )}

        <div>
          <label className="text-sm text-gray-600">Foto de Perfil</label>
          <p className="text-base font-medium">
            {hasAvatar() ? '✓ Configurada' : '✗ No configurada'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== EJEMPLO 5: Breadcrumb con Perfil ====================

/**
 * Breadcrumb item para perfil de usuario
 */
export const ProfileBreadcrumbExample: React.FC = () => {
  const navigate = useNavigate();
  const fullName = getUserFullName({ includeSecondLastName: false });
  const avatar = getUserAvatar();

  return (
    <button
      onClick={() => navigate('/perfil')}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      title="Ir a mi perfil"
    >
      <img
        src={avatar!}
        alt="Avatar"
        className="w-6 h-6 rounded-full object-cover"
      />
      <span>{fullName}</span>
    </button>
  );
};

// ==================== EJEMPLO 6: Guard de Ruta ====================

/**
 * Guard que verifica si hay datos de usuario válidos
 */
export const UserDataGuardExample: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!hasUserData()) {
      console.warn('No hay datos de usuario, redirigiendo a login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!hasUserData()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Verificando sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
};

// ==================== EJEMPLO 7: Hook Personalizado ====================

/**
 * Custom hook que combina user data con estado reactivo
 */
export const useUserProfile = () => {
  const [userData, setUserData] = React.useState(getUserData());
  const [isLoading, setIsLoading] = React.useState(false);

  // Función para refrescar datos
  const refreshUserData = React.useCallback(() => {
    invalidateUserCache();
    const newData = getUserData();
    setUserData(newData);
  }, []);

  // Función para actualizar perfil
  const updateProfile = React.useCallback(async (newData: any) => {
    setIsLoading(true);
    try {
      // Simular actualización en servidor
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar sessionStorage
      sessionStorage.setItem('user_data', JSON.stringify(newData));

      // Invalidar cache y refrescar
      refreshUserData();

      return { success: true };
    } catch (error) {
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserData]);

  return {
    userData,
    isLoading,
    refreshUserData,
    updateProfile,
    // Helpers directos
    fullName: getUserFullName(),
    avatar: getUserAvatar(),
    initials: getUserInitials(),
    hasAvatar: hasAvatar()
  };
};

/**
 * Uso del custom hook
 */
export const ProfileWithHookExample: React.FC = () => {
  const {
    userData,
    isLoading,
    fullName,
    avatar,
    updateProfile
  } = useUserProfile();

  if (!userData) {
    return <div>No hay datos de usuario</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <img src={avatar!} alt="Avatar" className="w-16 h-16 rounded-full" />
        <div>
          <h2 className="text-xl font-bold">{fullName}</h2>
          <p className="text-sm text-gray-600">ID: {userData.id}</p>
        </div>
      </div>

      <button
        onClick={() => updateProfile({ ...userData, nombre: 'Nuevo Nombre' })}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Actualizando...' : 'Actualizar Perfil'}
      </button>
    </div>
  );
};

// ==================== EJEMPLO 8: Combinación con Role Helper ====================

/**
 * Ejemplo que combina user helper con role helper
 */
export const AdminHeaderExample: React.FC = () => {
  const fullName = getUserFullName();
  const avatar = getUserAvatar();

  // Nota: Este ejemplo asume que role.helper está disponible
  // import { getUserRoles, isSuperAdmin } from '@/helper/role/role.helper';
  // const roles = getUserRoles();
  // const isAdmin = isSuperAdmin(roles);

  return (
    <header className="bg-white shadow p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Panel de Administración</h1>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{fullName}</p>
            <p className="text-xs text-gray-600">Administrador</p>
          </div>
          <img
            src={avatar!}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </header>
  );
};

// ==================== EJEMPLO 9: Tarjeta de Usuario en Lista ====================

/**
 * Componente de tarjeta para lista de usuarios (similar a search results)
 */
export const UserCardExample: React.FC = () => {
  const context = getUserContext();

  if (!context) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        {context.hasAvatar ? (
          <img
            src={context.avatarUrl!}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold">
            {getUserInitials()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 truncate">
          {context.fullName}
        </h3>
        <p className="text-sm text-gray-600">ID: {context.userData.id}</p>
      </div>

      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
        Ver Perfil
      </button>
    </div>
  );
};

// ==================== NOTAS FINALES ====================

/**
 * NOTAS DE USO:
 *
 * 1. PERFORMANCE:
 *    - Todos los helpers usan cache interno (5s TTL)
 *    - Llamadas repetidas en <5s son instantáneas
 *
 * 2. SEGURIDAD:
 *    - Todos los datos son validados con Zod automáticamente
 *    - sessionStorage corrupto se sanitiza automáticamente
 *
 * 3. BEST PRACTICES:
 *    - Siempre verificar con hasUserData() antes de mostrar UI
 *    - Invalidar cache después de actualizar perfil
 *    - Usar getUserContext() cuando necesites múltiples campos
 *
 * 4. TESTING:
 *    - Mock sessionStorage en tests
 *    - Usar invalidateUserCache() en beforeEach
 *
 * 5. INTEGRACIÓN:
 *    - Se integra perfectamente con role.helper
 *    - Compatible con logger.helper para tracking
 */

export default {
  NavbarExample,
  UserAvatarExample,
  ProfileDropdownExample,
  UserProfilePageExample,
  ProfileBreadcrumbExample,
  UserDataGuardExample,
  ProfileWithHookExample,
  AdminHeaderExample,
  UserCardExample,
  useUserProfile
};
