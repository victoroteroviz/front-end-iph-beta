import React from 'react';
import { Home, BarChart, FileText, Clock, Users, Settings, FileCheck } from 'lucide-react';
import { ALLOWED_ROLES } from '../../../../../config/env.config';
import type { SidebarConfig, SidebarItemConfig } from '../../../../../interfaces/components/dashboard.interface';

/**
 * Configuración del Sidebar - Sistema escalable basado en roles
 * Implementa principios DRY y single source of truth
 */

/**
 * Configuración principal del sidebar
 */
// Import del logo y isotipo
import logoBlanco from '../../../../../assets/iph/siriph_completo_blanco.png';
import isotipoBlanco from '../../../../../assets/iph/IPH_Isotipo_Blanco.png';

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
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
      order: 1
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      to: '/estadisticasusuario',
      icon: React.createElement(BarChart, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
      order: 2
    },
    {
      id: 'iph',
      label: 'IPH',
      to: '/informepolicial',
      icon: React.createElement(FileText, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
      order: 3
    },
    {
      id: 'historial',
      label: 'IPH Historial',
      to: '/historialiph',
      icon: React.createElement(Clock, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador'],
      order: 4
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      to: '/usuarios',
      icon: React.createElement(Users, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador'],
      order: 5
    },
    {
      id: 'informe-ejecutivo',
      label: 'Informe Ejecutivo',
      to: '/informeejecutivo',
      icon: React.createElement(FileCheck, { size: 20 }),
      requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
      order: 6,
      isDisabled: true // Temporarily disabled - accessed via direct links only
    },
    {
      id: 'ajustes',
      label: 'Ajuste',
      to: '/ajustes',
      icon: React.createElement(Settings, { size: 20 }),
      requiredRoles: ['SuperAdmin'],
      order: 7,
      isDisabled: true // Temporalmente deshabilitado
    }
  ]
};

/**
 * Obtiene los items del sidebar filtrados por el rol del usuario
 * 
 * @param userRole - Rol del usuario actual
 * @returns Array de items filtrados y ordenados
 */
export const getFilteredSidebarItems = (userRole: string): SidebarItemConfig[] => {
  if (!userRole) return [];

  // Verificar que el rol esté en ALLOWED_ROLES
  const isValidRole = ALLOWED_ROLES.some(allowedRole => 
    allowedRole.nombre.toLowerCase() === userRole.toLowerCase()
  );

  if (!isValidRole) return [];

  // Filtrar items basado en los roles requeridos
  const filteredItems = SIDEBAR_CONFIG.items.filter(item => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return true; // Sin restricciones de rol
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    return item.requiredRoles.some(requiredRole => 
      requiredRole.toLowerCase() === userRole.toLowerCase()
    );
  });

  // Ordenar por orden especificado
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
 * @param itemId - ID del item a verificar
 * @param userRole - Rol del usuario
 * @returns true si tiene acceso, false en caso contrario
 */
export const userHasAccessToItem = (itemId: string, userRole: string): boolean => {
  const item = getSidebarItemById(itemId);
  if (!item || item.isDisabled) return false;

  if (!item.requiredRoles || item.requiredRoles.length === 0) {
    return true;
  }

  return item.requiredRoles.some(requiredRole => 
    requiredRole.toLowerCase() === userRole.toLowerCase()
  );
};

/**
 * Obtiene el nivel jerárquico de un rol
 * Útil para comparaciones de permisos
 * 
 * @param userRole - Rol del usuario
 * @returns Nivel jerárquico (menor número = mayor privilegio)
 */
export const getRoleLevel = (userRole: string): number => {
  const roleLevels: Record<string, number> = {
    'superadmin': 1,
    'administrador': 2,
    'superior': 3,
    'elemento': 4
  };

  return roleLevels[userRole.toLowerCase()] || 999;
};

/**
 * Exportaciones por defecto
 */
export default {
  SIDEBAR_CONFIG,
  getFilteredSidebarItems,
  getSidebarItemById,
  userHasAccessToItem,
  getRoleLevel
};