/**
 * Hook personalizado para manejar la sesión de usuario en el Dashboard
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-31
 *
 * @changes v2.0.0
 * - ✅ Eliminada función getPrimaryRole() duplicada (12 líneas)
 * - ✅ Integrado getUserRoles() del helper centralizado (cache 60s + Zod)
 * - ✅ Simplificado obtención de rol principal (usa ordenamiento del helper)
 * - ✅ Reducción total: ~15 líneas eliminadas
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

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Helpers
import { isUserAuthenticated, getUserFromStorage, clearNavigationData } from '../../../../helper/navigation/navigation.helper';
import { getUserRoles } from '../../../../helper/role/role.helper';
import { logInfo, logError, logWarning } from '../../../../helper/log/logger.helper';
import { showSuccess, showWarning } from '../../../../helper/notification/notification.helper';
import { isTokenExpired, getStoredToken } from '../../../../helper/security/jwt.helper';

// Interfaces
import type { UserSessionState, UserData } from '../../../../interfaces/components/dashboard.interface';
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
      // ✅ NUEVA: Verificar expiración de JWT PRIMERO
      const token = getStoredToken();
      if (isTokenExpired(token)) {
        logWarning('useUserSession', 'Token JWT expirado detectado');
        showWarning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
        clearNavigationData();
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        navigate('/');
        return;
      }

      // Verificar autenticación básica
      if (!isUserAuthenticated()) {
        logInfo('useUserSession', 'Usuario no autenticado detectado');
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        navigate('/');
        return;
      }

      // ✅ Obtener roles del helper centralizado (cache 60s + Zod + ordenamiento por jerarquía)
      const userRoles = getUserRoles();

      if (userRoles.length === 0) {
        logError('useUserSession', new Error('Sin roles'), 'Usuario sin roles en el sistema');
        clearNavigationData();
        setState({
          userRole: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      // ✅ El rol principal es el primero del array (ya ordenado por jerarquía en el helper)
      const primaryRole = userRoles[0].nombre;

      // Obtener datos adicionales del usuario (nombre, apellidos, foto)
      const userData = getUserFromStorage();
      if (!userData) {
        logError('useUserSession', new Error('Datos de usuario no encontrados'), 'Limpiando sesión');
        clearNavigationData();
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
        totalRoles: userRoles.length
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
  }, [navigate]);

  /**
   * Maneja el logout del usuario - simplificado
   */
  const logout = useCallback(() => {
    try {
      clearNavigationData();
      setState({
        userRole: null,
        userData: null,
        isAuthenticated: false,
        isLoading: false
      });
      showSuccess('Sesión cerrada correctamente');
      navigate('/');
    } catch (error) {
      logError('useUserSession', error, 'Error durante el logout');
      navigate('/');
    }
  }, [navigate]);

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

export default useUserSession;