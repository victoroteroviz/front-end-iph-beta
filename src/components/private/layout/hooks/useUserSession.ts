import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Helpers
import { isUserAuthenticated, getUserFromStorage, clearNavigationData } from '../../../../helper/navigation/navigation.helper';
import { logInfo, logError } from '../../../../helper/log/logger.helper';
import { showSuccess } from '../../../../helper/notification/notification.helper';

// Interfaces
import type { UserSessionState, UserData } from '../../../../interfaces/components/dashboard.interface';

/**
 * Hook personalizado para manejar la sesión de usuario en el Dashboard
 * 
 * Características:
 * - Integración con sistema de roles refactorizado
 * - Uso de sessionStorage en lugar de localStorage  
 * - Logging de eventos de sesión
 * - Estados de carga optimizados
 * - Logout seguro con limpieza completa
 * 
 * @returns Estado y funciones de la sesión de usuario
 */
const useUserSession = (): UserSessionState => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<{
    userRole: string | null;
    userData: UserData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({
    userRole: null,
    userData: null,
    isAuthenticated: false,
    isLoading: true
  });

  /**
   * Verifica y carga los datos de sesión del usuario
   */
  const loadUserSession = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Verificar autenticación básica
      if (!isUserAuthenticated()) {
        logInfo('useUserSession', 'Usuario no autenticado detectado');
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      // Obtener datos del usuario
      const userData = getUserFromStorage();
      if (!userData || !userData.roles || userData.roles.length === 0) {
        logError('useUserSession', 'Datos de usuario inválidos o sin roles', 'Limpiando sesión');
        clearNavigationData();
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      // Determinar el rol principal (el de mayor jerarquía)
      const roleNames = userData.roles.map(role => role.nombre || '').filter(Boolean);
      const primaryRole = getPrimaryRole(roleNames);

      if (!primaryRole) {
        logError('useUserSession', 'No se pudo determinar rol principal del usuario', 'Roles disponibles: ' + roleNames.join(', '));
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      // Formatear datos de usuario
      const formattedUserData: UserData = {
        id: userData.id,
        nombre: userData.nombre || '',
        primer_apellido: (userData as any).primer_apellido || '',
        segundo_apellido: (userData as any).segundo_apellido || '',
        foto: (userData as any).foto || undefined,
        rol: primaryRole
      };

      // Actualizar estado
      setState({
        userRole: primaryRole,
        userData: formattedUserData,
        isAuthenticated: true,
        isLoading: false
      });

      logInfo('useUserSession', 'Sesión de usuario cargada exitosamente', {
        userId: userData.id,
        userRole: primaryRole,
        totalRoles: userData.roles.length
      });

    } catch (error) {
      logError('useUserSession', error, 'Error cargando sesión de usuario');
      setState({
        userRole: null,
        userData: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }, []);

  /**
   * Maneja el logout del usuario
   */
  const logout = useCallback(() => {
    logInfo('useUserSession', 'Iniciando proceso de logout', {
      userId: state.userData?.id,
      userRole: state.userRole
    });

    try {
      // Limpiar datos de navegación
      clearNavigationData();
      
      // Actualizar estado local
      setState({
        userRole: null,
        userData: null,
        isAuthenticated: false,
        isLoading: false
      });

      // Notificar al usuario
      showSuccess('Sesión cerrada correctamente');

      // Redirigir al login
      navigate('/');

      logInfo('useUserSession', 'Logout completado exitosamente');

    } catch (error) {
      logError('useUserSession', error, 'Error durante el logout');
      
      // Forzar redirección incluso si hay error
      navigate('/');
    }
  }, [navigate, state.userData?.id, state.userRole]);

  /**
   * Efecto para cargar sesión al montar el componente
   */
  useEffect(() => {
    loadUserSession();
  }, [loadUserSession]);

  return {
    userRole: state.userRole,
    userData: state.userData,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    logout
  };
};

/**
 * Determina el rol principal basado en jerarquía
 * 
 * @param roles - Array de nombres de roles
 * @returns Nombre del rol principal o null
 */
const getPrimaryRole = (roles: string[]): string | null => {
  const roleHierarchy = ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'];
  
  for (const hierarchyRole of roleHierarchy) {
    const foundRole = roles.find(role => 
      role.toLowerCase() === hierarchyRole.toLowerCase()
    );
    if (foundRole) return foundRole;
  }
  
  return roles[0] || null;
};

export default useUserSession;