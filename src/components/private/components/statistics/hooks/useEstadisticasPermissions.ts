/**
 * Hook personalizado para manejo de permisos en Estadísticas
 * Controla el acceso basado en roles del usuario
 *
 * Roles permitidos:
 * - SuperAdmin: Acceso completo
 * - Administrador: Acceso completo
 * - Superior: Acceso completo
 * - Elemento: SIN ACCESO (redirige a /inicio)
 *
 * @version 1.0.0
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Helpers
import {
  getUserRoles,
  validateExternalRoles,
  canExternalRoleAccess,
  hasExternalRole
} from '../../../../../helper/role/role.helper';
import { showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';

/**
 * Interface para el retorno del hook
 */
export interface IEstadisticasPermissions {
  hasAccess: boolean;
  canView: boolean;
  canExport: boolean;
  isLoading: boolean;
}

/**
 * Hook para verificar y manejar permisos de acceso a Estadísticas
 *
 * @returns Objeto con permisos del usuario
 *
 * @example
 * const { hasAccess, canView, canExport } = useEstadisticasPermissions();
 *
 * if (!hasAccess) {
 *   return <div>Cargando...</div>; // Ya redirigirá automáticamente
 * }
 */
export const useEstadisticasPermissions = (): IEstadisticasPermissions => {
  const navigate = useNavigate();

  /**
   * Verifica y establece permisos del usuario actual
   * Usa el sistema centralizado de validación de roles (role.helper v2.1.0)
   *
   * @returns Objeto con permisos calculados
   */
  const checkPermissions = useCallback((): IEstadisticasPermissions => {
    // Obtener roles desde sessionStorage usando el helper
    const userRoles = getUserRoles();

    logInfo('EstadisticasPermissions', 'Validando permisos de usuario', {
      rolesCount: userRoles.length
    });

    // Validar que los roles sean válidos según la configuración del sistema
    const validRoles = validateExternalRoles(userRoles);

    if (validRoles.length === 0) {
      logError(
        'EstadisticasPermissions',
        new Error('Roles inválidos'),
        'Usuario sin roles válidos en el sistema'
      );
      showWarning('No tienes roles válidos para acceder a esta sección', 'Acceso Restringido');
      navigate('/inicio');
      return {
        hasAccess: false,
        canView: false,
        canExport: false,
        isLoading: false
      };
    }

    // Verificar roles específicos
    const isSuperAdmin = hasExternalRole(validRoles, 'SuperAdmin');
    const isAdmin = hasExternalRole(validRoles, 'Administrador');
    const isSuperior = hasExternalRole(validRoles, 'Superior');

    // Verificar acceso jerárquico (Superior y superiores)
    const canAccessStatistics = canExternalRoleAccess(validRoles, 'Superior');

    logInfo('EstadisticasPermissions', 'Permisos calculados correctamente', {
      validRolesCount: validRoles.length,
      roles: validRoles.map(r => r.nombre),
      isSuperAdmin,
      isAdmin,
      isSuperior,
      canAccessStatistics
    });

    // Verificar acceso básico a la sección de estadísticas
    // Solo Superior, Admin y SuperAdmin pueden acceder
    if (!canAccessStatistics) {
      logAuth('access_denied', false, {
        section: 'estadisticas',
        reason: 'Requiere permisos de Superior o superiores',
        userRoles: validRoles.map(r => r.nombre)
      });
      showWarning(
        'Solo Superiores, Administradores y SuperAdmins pueden acceder a estadísticas',
        'Acceso Restringido'
      );
      navigate('/inicio');
      return {
        hasAccess: false,
        canView: false,
        canExport: false,
        isLoading: false
      };
    }

    logAuth('access_granted', true, {
      section: 'estadisticas',
      userRoles: validRoles.map(r => r.nombre)
    });

    // Permisos específicos
    const permissions: IEstadisticasPermissions = {
      hasAccess: true,
      canView: canAccessStatistics,                    // Superior+
      canExport: isAdmin || isSuperAdmin,               // Admin+ (solo Admin y SuperAdmin pueden exportar)
      isLoading: false
    };

    return permissions;
  }, [navigate]);

  /**
   * Efecto de inicialización
   * Se ejecuta UNA SOLA VEZ al montar el componente
   */
  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío = solo se ejecuta al montar

  // Retornar permisos calculados
  return checkPermissions();
};
