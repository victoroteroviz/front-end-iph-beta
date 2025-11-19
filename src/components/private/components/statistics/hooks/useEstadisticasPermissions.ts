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
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-31
 *
 * @changes v2.0.0
 * - ✅ Eliminadas funciones "External" redundantes (validateExternalRoles, canExternalRoleAccess, hasExternalRole)
 * - ✅ Reemplazadas por funciones directas del helper (isSuperAdmin, isAdmin, isSuperior)
 * - ✅ Eliminada validación redundante con validateExternalRoles() - getUserRoles() ya valida con Zod
 * - ✅ Usa canAccessSuperior() del permissions.config para jerarquía automática
 * - ✅ Reducción de 15 líneas (18% menos código)
 * - ✅ Consistencia con patrón establecido en otros componentes refactorizados
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Helpers
import {
  getUserRoles,
  isSuperAdmin,
  isAdmin,
  isSuperior
} from '../../../../../helper/role/role.helper';
import { canAccessSuperior } from '../../../../../config/permissions.config';
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
   * Usa el sistema centralizado de validación de roles (role.helper v3.0.0)
   *
   * @refactored v2.0.0 - Eliminadas funciones External, usa funciones directas
   * @security getUserRoles() ya valida con Zod + cache 60s automático
   *
   * @returns Objeto con permisos calculados
   */
  const checkPermissions = useCallback((): IEstadisticasPermissions => {
    // Obtener roles desde sessionStorage usando el helper (ya validados con Zod)
    const userRoles = getUserRoles();

    logInfo('EstadisticasPermissions', 'Validando permisos de usuario', {
      rolesCount: userRoles.length
    });

    // ✅ getUserRoles() ya retorna roles validados con Zod - no necesita validateExternalRoles()
    if (userRoles.length === 0) {
      logError(
        'EstadisticasPermissions',
        new Error('Sin roles'),
        'Usuario sin roles en el sistema'
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

    // ✅ Usar funciones directas del helper (para sessionStorage)
    const userIsSuperAdmin = isSuperAdmin();
    const userIsAdmin = isAdmin();
    const userIsSuperior = isSuperior();

    // ✅ Usar función jerárquica centralizada del permissions.config
    const canAccessStatistics = canAccessSuperior(userRoles);

    logInfo('EstadisticasPermissions', 'Permisos calculados correctamente', {
      rolesCount: userRoles.length,
      roles: userRoles.map(r => r.nombre),
      isSuperAdmin: userIsSuperAdmin,
      isAdmin: userIsAdmin,
      isSuperior: userIsSuperior,
      canAccessStatistics
    });

    // Verificar acceso básico a la sección de estadísticas
    // Solo Superior, Admin y SuperAdmin pueden acceder
    if (!canAccessStatistics) {
      logAuth('access_denied', false, {
        section: 'estadisticas',
        reason: 'Requiere permisos de Superior o superiores',
        userRoles: userRoles.map(r => r.nombre)
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
      userRoles: userRoles.map(r => r.nombre)
    });

    // Permisos específicos
    const permissions: IEstadisticasPermissions = {
      hasAccess: true,
      canView: canAccessStatistics,                          // Superior+
      canExport: userIsAdmin || userIsSuperAdmin,            // Admin+ (solo Admin y SuperAdmin pueden exportar)
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
