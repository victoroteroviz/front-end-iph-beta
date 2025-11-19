/**
 * Configuración del Sidebar - Sistema escalable basado en roles
 * Implementa principios DRY y single source of truth
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-31
 *
 * @changes v2.0.0
 * - ✅ Refactorizado getFilteredSidebarItems() para usar getUserRoles() centralizado
 * - ✅ Refactorizado userHasAccessToItem() para usar hasAnyRole() del role.helper
 * - ✅ Eliminada función getRoleLevel() duplicada (existe en sistema centralizado)
 * - ✅ Eliminada validación manual de roles (usa Zod automático del helper)
 * - ✅ Eliminado parámetro userRole de getFilteredSidebarItems (obtiene roles internamente)
 * - ✅ Reducción total: ~35 líneas eliminadas
 */

import React from 'react';
import { Home, BarChart, FileText, Clock, Users, Settings, FileCheck, UserCog, UserPen, ChartNoAxesColumn, ChartNoAxesCombined, FileBarChart } from 'lucide-react';
import type { SidebarConfig, SidebarItemConfig } from '../../../../../interfaces/components/dashboard.interface';

// Helpers centralizados
import { getUserRoles, hasAnyRole } from '../../../../../helper/role/role.helper';

/**
 * Configuración principal del sidebar
 */
// Import del logo y isotipo
import logoBlanco from '../../../../../assets/iph/siriph_completo_blanco.webp';
import isotipoBlanco from '../../../../../assets/iph/IPH_Isotipo_Blanco.webp';

export const SIDEBAR_CONFIG: SidebarConfig = {
  title: 'IPH',
  logo: logoBlanco,
  isotipo: isotipoBlanco,
  items: [
    {
      id: 'inicio',
      label: 'Inicio',
      to: '/inicio',
      icon: React.createElement(Home, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
      order: 1
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      to: '/estadisticasusuario',
      icon: React.createElement(ChartNoAxesCombined, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
      order: 2
    },
    {
      id: 'reportes-pdf',
      label: 'Reportes PDF',
      to: '/reportes-pdf',
      icon: React.createElement(FileBarChart, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
      order: 3
    },
    {
      id: 'iphActivo',
      label: 'IPH\'s Activos',
      to: '/informepolicial',
      icon: React.createElement(FileText, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
      order: 4
    },
    {
      id: 'historial',
      label: 'Historico IPH',
      to: '/historialiph',
      icon: React.createElement(Clock, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
      order: 5
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      to: '/usuarios',
      icon: React.createElement(UserPen, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador'],
      order: 6
    },
    {
      id: 'reportes',
      label: 'Reportes',
      to: '/reportes',
      icon: React.createElement(FileCheck, { size: 20 }),
      requiredRoles: ['SuperAdmin'],
      order: 7,
      isDisabled: true
    },
    {
      id: 'grupos',
      label: 'Gestión Grupos',
      to: '/gestion-grupos',
      requiredRoles: ['SuperAdmin'],
      order: 8,
      isDisabled: true,
      icon: React.createElement(UserCog, { size: 20 })
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      to: '/ajustes',
      icon: React.createElement(Settings, { size: 20 }),
      requiredRoles: ['SuperAdmin',],
      order: 9,
      isDisabled: true
    }
  ]
};

/**
 * Obtiene los items del sidebar filtrados por los roles del usuario
 *
 * @refactored v2.0.0 - Usa getUserRoles() centralizado con cache + Zod
 * @returns Array de items filtrados y ordenados
 *
 * @description
 * - Obtiene roles del usuario desde helper centralizado (cache 60s + Zod)
 * - Filtra items usando hasAnyRole() del permissions.config
 * - Retorna items ordenados por propiedad order
 *
 * @example
 * ```typescript
 * const items = getFilteredSidebarItems();
 * // Retorna items accesibles para el usuario actual
 * ```
 */
export const getFilteredSidebarItems = (): SidebarItemConfig[] => {
  // ✅ Obtener roles del usuario (con cache + validación Zod automática)
  const userRoles = getUserRoles();

  // Si no hay roles, retornar array vacío
  if (userRoles.length === 0) return [];

  // ✅ Filtrar items usando helper centralizado
  const filteredItems = SIDEBAR_CONFIG.items.filter(item => {
    // Items sin roles requeridos son accesibles para todos
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true;
    }

    // ✅ Usar hasAnyRole del helper centralizado
    return hasAnyRole(item.requiredRoles, userRoles);
  });

  // Ordenar por propiedad order
  return filteredItems.sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Obtiene un item específico del sidebar por ID
 * 
 * @param itemId - ID del item a buscar
 * @returns Item del sidebar o undefined si no existe
 */
export const getSidebarItemById = (itemId: string): SidebarItemConfig | undefined => {
  return SIDEBAR_CONFIG.items.find(item => item.id === itemId);
};

/**
 * Verifica si un usuario tiene acceso a un item específico
 *
 * @refactored v2.0.0 - Usa getUserRoles() y hasAnyRole() centralizados
 * @param itemId - ID del item a verificar
 * @returns true si tiene acceso, false en caso contrario
 *
 * @example
 * ```typescript
 * const canAccess = userHasAccessToItem('usuarios');
 * // Retorna true si el usuario tiene permisos para ver usuarios
 * ```
 */
export const userHasAccessToItem = (itemId: string): boolean => {
  const item = getSidebarItemById(itemId);
  if (!item || item.isDisabled) return false;

  // Items sin roles requeridos son accesibles para todos
  if (!item.requiredRoles || item.requiredRoles.length === 0) {
    return true;
  }

  // ✅ Usar helper centralizado
  const userRoles = getUserRoles();
  return hasAnyRole(item.requiredRoles, userRoles);
};

/**
 * Exportaciones por defecto
 */
export default {
  SIDEBAR_CONFIG,
  getFilteredSidebarItems,
  getSidebarItemById,
  userHasAccessToItem
};