/**
 * Configuración Centralizada de Rutas
 *
 * Single Source of Truth para todas las rutas de la aplicación
 *
 * Beneficios:
 * - ✅ Una sola fuente de verdad para rutas
 * - ✅ Sincronización automática entre Router y Sidebar
 * - ✅ Fácil mantenimiento (agregar ruta en 1 lugar)
 * - ✅ TypeScript type-safe
 * - ✅ Lazy loading automático
 * - ✅ Control de acceso por roles
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { lazy, type ComponentType, type LazyExoticComponent, type ReactElement } from 'react';
import { Home, BarChart, FileText, Clock, Users, Settings, UserPen, UserCog, ChartNoAxesCombined } from 'lucide-react';

// =====================================================
// INTERFACES
// =====================================================

/**
 * Configuración de una ruta de la aplicación
 */
export interface AppRoute {
  /** ID único de la ruta */
  id: string;
  /** Path de la ruta (sin slash inicial) */
  path: string;
  /** Componente lazy-loaded */
  component: LazyExoticComponent<ComponentType<any>>;
  /** Roles requeridos para acceder (vacío = todos los autenticados) */
  requiredRoles?: string[];
  /** Título de la página (para SEO y navegación) */
  title: string;
  /** Descripción de la ruta (para SEO) */
  description?: string;
  /** Mostrar en el sidebar */
  showInSidebar?: boolean;
  /** Icono del sidebar */
  icon?: ReactElement;
  /** Orden en el sidebar */
  order?: number;
  /** Ruta deshabilitada (muestra en sidebar pero no se puede acceder) */
  isDisabled?: boolean;
  /** Rutas hijas (para rutas anidadas) */
  children?: AppRoute[];
  /** ID del item del sidebar que debe estar activo cuando se navega a esta ruta */
  parentSidebarId?: string;
}

// =====================================================
// LAZY COMPONENTS
// =====================================================

// Componentes principales
const Inicio = lazy(() => import('../components/private/components/home/Inicio'));
const Estadisticas = lazy(() => import('../components/private/components/statistics/Estadisticas'));
const HistorialIPH = lazy(() => import('../components/private/components/historial-iph/HistorialIPH'));
const IphOficial = lazy(() => import('../components/private/components/iph-oficial/IphOficial'));
const InformePolicial = lazy(() => import('../components/private/components/iph-activo/iph-activo'));
const PerfilUsuario = lazy(() => import('../components/private/components/perfil-usuario/PerfilUsuario'));
const Usuarios = lazy(() => import('../components/private/components/usuarios/Usuarios'));
const InformeEjecutivo = lazy(() => import('../components/private/components/informe-ejecutivo/InformeEjecutivo'));
const Ajustes = lazy(() => import('../components/private/components/ajustes/Ajustes'));
const AdministracionCatalogos = lazy(() => import('../components/private/components/ajustes/catalogos/AdministracionCatalogos'));
const GestionGrupos = lazy(() => import('../components/private/components/gestion-grupos/GestionGrupos'));

// Componentes de estadísticas (vistas hijas)
const UsuariosIphView = lazy(() => import('../components/private/components/statistics/views/UsuariosIphView'));
const JusticiaCivicaView = lazy(() => import('../components/private/components/statistics/views/JusticiaCivicaView'));
const ProbableDelictivoView = lazy(() => import('../components/private/components/statistics/views/ProbableDelictivoView'));

// =====================================================
// CONFIGURACIÓN DE RUTAS
// =====================================================

/**
 * Configuración completa de rutas de la aplicación
 *
 * IMPORTANTE: Esta es la ÚNICA fuente de verdad para rutas
 * - Agregar una nueva ruta aquí automáticamente la agrega al Router y Sidebar
 * - Modificar roles aquí actualiza el control de acceso en toda la app
 */
export const APP_ROUTES: AppRoute[] = [
  {
    id: 'inicio',
    path: 'inicio',
    component: Inicio,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    title: 'Inicio',
    description: 'Dashboard principal con estadísticas generales',
    showInSidebar: true,
    icon: <Home size={20} />,
    order: 1
  },
  {
    id: 'estadisticas',
    path: 'estadisticasusuario',
    component: Estadisticas,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
    title: 'Estadísticas',
    description: 'Estadísticas por usuario y rendimiento',
    showInSidebar: true,
    icon: <ChartNoAxesCombined size={20} />,
    order: 2
  },
  {
    id: 'iphActivo',
    path: 'informepolicial',
    component: InformePolicial,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    title: "IPH's Activos",
    description: 'Lista de informes policiales homologados activos',
    showInSidebar: true,
    icon: <FileText size={20} />,
    order: 3
  },
  {
    id: 'historial',
    path: 'historialiph',
    component: HistorialIPH,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Histórico IPH',
    description: 'Historial completo de informes policiales',
    showInSidebar: true,
    icon: <Clock size={20} />,
    order: 4
  },
  {
    id: 'usuarios',
    path: 'usuarios',
    component: Usuarios,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Usuarios',
    description: 'Gestión de usuarios del sistema',
    showInSidebar: true,
    icon: <UserPen size={20} />,
    order: 5
  },
  {
    id: 'grupos',
    path: 'gestion-grupos',
    component: GestionGrupos,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
    title: 'Gestión Grupos',
    description: 'Gestión de grupos y equipos',
    showInSidebar: true,
    icon: <UserCog size={20} />,
    order: 6,
    isDisabled: false
  },
  {
    id: 'ajustes',
    path: 'ajustes',
    component: Ajustes,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Ajustes',
    description: 'Configuración del sistema',
    showInSidebar: true,
    icon: <Settings size={20} />,
    order: 7,
    isDisabled: true
  },

  // =====================================================
  // RUTAS SIN SIDEBAR (No aparecen en navegación)
  // =====================================================

  // Rutas hijas de Estadísticas
  {
    id: 'estadisticasUsuariosIph',
    path: 'estadisticasusuario/usuarios-iph',
    component: UsuariosIphView,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
    title: 'Usuarios y Creación de IPH',
    description: 'Estadísticas de usuarios que más y menos IPH han creado',
    showInSidebar: false,
    parentSidebarId: 'estadisticas' // Pertenece a Estadísticas
  },
  {
    id: 'estadisticasJusticiaCivica',
    path: 'estadisticasusuario/justicia-civica',
    component: JusticiaCivicaView,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
    title: 'IPH de Justicia Cívica',
    description: 'Estadísticas de informes de justicia cívica',
    showInSidebar: false,
    parentSidebarId: 'estadisticas' // Pertenece a Estadísticas
  },
  {
    id: 'estadisticasProbableDelictivo',
    path: 'estadisticasusuario/probable-delictivo',
    component: ProbableDelictivoView,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
    title: 'IPH de Probable Hecho Delictivo',
    description: 'Estadísticas de informes de probable hecho delictivo',
    showInSidebar: false,
    parentSidebarId: 'estadisticas' // Pertenece a Estadísticas
  },

  {
    id: 'iphOficial',
    path: 'iphoficial/:id',
    component: IphOficial,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    title: 'IPH Oficial',
    description: 'Vista detallada del informe policial',
    showInSidebar: false,
    parentSidebarId: 'iphActivo' // Pertenece a IPH's Activos
  },
  {
    id: 'informeEjecutivo',
    path: 'informeejecutivo/:id',
    component: InformeEjecutivo,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    title: 'Informe Ejecutivo',
    description: 'Informe ejecutivo detallado',
    showInSidebar: false,
    parentSidebarId: 'iphActivo' // Pertenece a IPH's Activos
  },
  {
    id: 'usuariosNuevo',
    path: 'usuarios/nuevo',
    component: PerfilUsuario,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Nuevo Usuario',
    description: 'Crear nuevo usuario del sistema',
    showInSidebar: false,
    parentSidebarId: 'usuarios' // Pertenece a Usuarios
  },
  {
    id: 'usuariosEditar',
    path: 'usuarios/editar/:id',
    component: PerfilUsuario,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Editar Usuario',
    description: 'Editar información de usuario',
    showInSidebar: false,
    parentSidebarId: 'usuarios' // Pertenece a Usuarios
  },
  {
    id: 'perfil',
    path: 'perfil',
    component: PerfilUsuario,
    requiredRoles: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    title: 'Mi Perfil',
    description: 'Información personal del usuario',
    showInSidebar: false
  },
  {
    id: 'catalogos',
    path: 'ajustes/catalogos',
    component: AdministracionCatalogos,
    requiredRoles: ['SuperAdmin', 'Administrador'],
    title: 'Administración de Catálogos',
    description: 'Gestión de catálogos del sistema',
    showInSidebar: false,
    parentSidebarId: 'ajustes' // Pertenece a Ajustes
  }
];

// =====================================================
// FUNCIONES HELPER
// =====================================================

/**
 * Obtiene rutas filtradas para mostrar en el sidebar
 *
 * @param userRole - Rol del usuario actual
 * @returns Array de rutas visibles en sidebar
 */
export const getSidebarRoutes = (userRole: string): AppRoute[] => {
  if (!userRole) return [];

  return APP_ROUTES
    .filter(route => route.showInSidebar)
    .filter(route => {
      if (!route.requiredRoles || route.requiredRoles.length === 0) {
        return true;
      }
      return route.requiredRoles.some(
        role => role.toLowerCase() === userRole.toLowerCase()
      );
    })
    .sort((a, b) => (a.order || 999) - (b.order || 999));
};

/**
 * Obtiene todas las rutas (incluidas las que no aparecen en sidebar)
 *
 * @returns Array de todas las rutas
 */
export const getAllRoutes = (): AppRoute[] => {
  return APP_ROUTES;
};

/**
 * Busca una ruta por ID
 *
 * @param routeId - ID de la ruta
 * @returns Ruta encontrada o undefined
 */
export const getRouteById = (routeId: string): AppRoute | undefined => {
  return APP_ROUTES.find(route => route.id === routeId);
};

/**
 * Busca una ruta por path
 *
 * @param path - Path de la ruta
 * @returns Ruta encontrada o undefined
 */
export const getRouteByPath = (path: string): AppRoute | undefined => {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return APP_ROUTES.find(route => route.path === cleanPath);
};

/**
 * Verifica si un usuario tiene acceso a una ruta
 *
 * @param routeId - ID de la ruta
 * @param userRole - Rol del usuario
 * @returns true si tiene acceso
 */
export const userHasAccessToRoute = (routeId: string, userRole: string): boolean => {
  const route = getRouteById(routeId);
  if (!route || route.isDisabled) return false;

  if (!route.requiredRoles || route.requiredRoles.length === 0) {
    return true;
  }

  return route.requiredRoles.some(
    role => role.toLowerCase() === userRole.toLowerCase()
  );
};

/**
 * Obtiene el título de una ruta por path
 *
 * @param path - Path de la ruta
 * @returns Título de la ruta o string vacío
 */
export const getRouteTitle = (path: string): string => {
  const route = getRouteByPath(path);
  return route?.title || '';
};

/**
 * Obtiene el ID del item del sidebar padre para una ruta dada
 *
 * @description Busca en todas las rutas si alguna coincide con el pathname dado
 * y retorna su parentSidebarId. Soporta rutas con parámetros dinámicos.
 *
 * @param pathname - Path completo de la URL (ej: /informeejecutivo/387d1b0e-...)
 * @returns ID del sidebar padre o undefined si no tiene
 *
 * @example
 * getParentSidebarId('/informeejecutivo/387d1b0e-...') // → 'iphActivo'
 * getParentSidebarId('/usuarios/nuevo') // → 'usuarios'
 * getParentSidebarId('/inicio') // → undefined
 */
export const getParentSidebarId = (pathname: string): string | undefined => {
  // Limpiar pathname - remover slash inicial si existe
  const cleanPath = pathname.startsWith('/') ? pathname.substring(1) : pathname;

  // Buscar ruta que coincida
  for (const route of APP_ROUTES) {
    // Si tiene parentSidebarId, verificar si el path coincide
    if (route.parentSidebarId) {
      // Convertir pattern de ruta a regex (reemplazar :param por regex)
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);

      if (regex.test(cleanPath)) {
        return route.parentSidebarId;
      }
    }
  }

  return undefined;
};

/**
 * Convierte configuración de rutas para usar con Sidebar legacy
 * (mantiene compatibilidad con sidebarConfig.ts existente)
 *
 * @deprecated Usar getSidebarRoutes directamente
 */
export const convertToLegacySidebarFormat = (userRole: string) => {
  return getSidebarRoutes(userRole).map(route => ({
    id: route.id,
    label: route.title,
    to: `/${route.path}`,
    icon: route.icon,
    requiredRoles: route.requiredRoles,
    order: route.order,
    isDisabled: route.isDisabled
  }));
};

// Exportar todo
export default {
  APP_ROUTES,
  getSidebarRoutes,
  getAllRoutes,
  getRouteById,
  getRouteByPath,
  userHasAccessToRoute,
  getRouteTitle,
  getParentSidebarId
};
