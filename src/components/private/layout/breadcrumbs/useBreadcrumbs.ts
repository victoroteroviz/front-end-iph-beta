/**
 * @fileoverview Hook personalizado para generar breadcrumbs automáticamente
 * @version 1.0.0
 * @description Hook que genera breadcrumbs basado en la ruta actual y configuración
 */

import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { BreadcrumbItem } from './Breadcrumbs';

/**
 * @interface RouteConfig
 * @description Configuración de una ruta para breadcrumbs
 */
interface RouteConfig {
  /** Etiqueta a mostrar */
  label: string;
  /** Nombre del icono de Lucide React */
  iconName?: string;
  /** Función para generar label dinámico */
  dynamicLabel?: (params: Record<string, string>) => string;
  /** Indica si esta ruta debe ser excluida de breadcrumbs */
  excludeFromBreadcrumbs?: boolean;
}

/**
 * @constant ROUTE_CONFIG
 * @description Mapeo de rutas a configuración de breadcrumbs
 */
const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Rutas principales
  '/inicio': {
    label: 'Inicio',
    iconName: 'Home'
  },
  '/estadisticasusuario': {
    label: 'Estadísticas',
    iconName: 'BarChart'
  },
  '/informepolicial': {
    label: 'IPH\'s Semana',
    iconName: 'FileText'
  },
  '/historialiph': {
    label: 'Histórico IPH',
    iconName: 'Clock'
  },
  '/usuarios': {
    label: 'Usuarios',
    iconName: 'Users'
  },
  '/ajustes': {
    label: 'Ajustes',
    iconName: 'Settings'
  },

  // Rutas de usuarios
  '/usuarios/nuevo': {
    label: 'Nuevo Usuario',
    iconName: 'User'
  },
  '/usuarios/editar': {
    label: 'Editar Usuario',
    iconName: 'User'
  },
  '/perfil': {
    label: 'Mi Perfil',
    iconName: 'User'
  },

  // Rutas de ajustes
  '/ajustes/catalogos': {
    label: 'Administración de Catálogos',
    iconName: 'Database'
  },
  '/ajustes/usuarios': {
    label: 'Gestión de Usuarios',
    iconName: 'Users'
  },
  '/ajustes/seguridad': {
    label: 'Configuración de Seguridad',
    iconName: 'Settings'
  },

  // Rutas dinámicas con parámetros
  '/iphoficial': {
    label: 'IPH Oficial',
    iconName: 'FileCheck',
    dynamicLabel: (params) => `IPH #${params.id || 'N/A'}`
  },
  '/informeejecutivo': {
    label: 'Informe Ejecutivo',
    iconName: 'FileText',
    dynamicLabel: (params) => `Informe Ejecutivo #${params.id || 'N/A'}`
  }
};

/**
 * @interface UseBreadcrumbsReturn
 * @description Tipo de retorno del hook useBreadcrumbs
 */
interface UseBreadcrumbsReturn {
  /** Lista de elementos del breadcrumb */
  breadcrumbs: BreadcrumbItem[];
  /** Indica si se están cargando los breadcrumbs */
  isLoading: boolean;
  /** Ruta actual */
  currentPath: string;
}

/**
 * @function useBreadcrumbs
 * @description Hook que genera breadcrumbs automáticamente basado en la ruta actual
 * @returns {UseBreadcrumbsReturn} Breadcrumbs generados y estado
 *
 * @example
 * ```tsx
 * const { breadcrumbs, isLoading } = useBreadcrumbs();
 *
 * if (isLoading) return <BreadcrumbSkeleton />;
 * return <Breadcrumbs items={breadcrumbs} />;
 * ```
 */
export const useBreadcrumbs = (): UseBreadcrumbsReturn => {
  const location = useLocation();
  const params = useParams();

  /**
   * @function generateBreadcrumbs
   * @description Genera los breadcrumbs basado en la ruta actual
   */
  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const pathname = location.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);

    // Si estamos en la raíz o solo en una ruta base, no mostrar breadcrumbs
    if (pathSegments.length === 0 || pathname === '/') {
      return [];
    }

    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    // Procesar cada segmento de la ruta
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Buscar configuración para la ruta actual
      let routeConfig = ROUTE_CONFIG[currentPath];

      // Si no encontramos configuración exacta, buscar por patrón base
      if (!routeConfig) {
        // Para rutas con parámetros, usar la configuración base
        const baseRoute = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const basePath = baseRoute.replace(/\/[^/]*$/, '');

        // Casos especiales para rutas con parámetros
        if (segment.match(/^\d+$/) && index > 0) {
          // Es un ID numérico, usar configuración del path anterior
          const parentPath = `/${pathSegments.slice(0, index).join('/')}`;
          routeConfig = ROUTE_CONFIG[parentPath];
        }
      }

      // Si encontramos configuración
      if (routeConfig) {
        // Verificar si debe ser excluida
        if (routeConfig.excludeFromBreadcrumbs) {
          return;
        }

        let label = routeConfig.label;

        // Aplicar label dinámico si existe
        if (routeConfig.dynamicLabel && params) {
          label = routeConfig.dynamicLabel(params);
        }

        items.push({
          label,
          path: isLast ? undefined : currentPath,
          iconName: routeConfig.iconName,
          isActive: isLast
        });
      } else {
        // Si no hay configuración, usar el segmento capitalizado
        const fallbackLabel = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        items.push({
          label: fallbackLabel,
          path: isLast ? undefined : currentPath,
          isActive: isLast
        });
      }
    });

    return items;
  }, [location.pathname, params]);

  /**
   * @function shouldShowBreadcrumbs
   * @description Determina si se deben mostrar breadcrumbs para la ruta actual
   */
  const shouldShow = useMemo((): boolean => {
    const pathname = location.pathname;

    // No mostrar en rutas raíz o de autenticación
    if (pathname === '/' || pathname === '/login') {
      return false;
    }

    // No mostrar si solo hay un nivel de profundidad y es una ruta principal
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && ROUTE_CONFIG[pathname]) {
      return false;
    }

    return breadcrumbs.length > 0;
  }, [location.pathname, breadcrumbs]);

  return {
    breadcrumbs: shouldShow ? breadcrumbs : [],
    isLoading: false,
    currentPath: location.pathname
  };
};

/**
 * @function useBreadcrumbsTitle
 * @description Hook para obtener solo el título de la página actual
 * @returns {string} Título de la página actual
 */
export const useBreadcrumbsTitle = (): string => {
  const { breadcrumbs } = useBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return '';
  }

  // Retornar el label del último breadcrumb (página actual)
  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  return lastBreadcrumb?.label || '';
};

export default useBreadcrumbs;