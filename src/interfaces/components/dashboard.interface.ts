import type { ReactNode } from 'react';

/**
 * Interfaces para el sistema de Dashboard refactorizado
 * Basado en principios SOLID y arquitectura escalable
 */

/**
 * Configuración de un item del sidebar
 */
export interface SidebarItemConfig {
  id: string;
  label: string;
  to: string;
  icon: ReactNode;
  requiredRoles?: string[];
  isDisabled?: boolean;
  order?: number;
}

/**
 * Configuración completa del sidebar
 */
export interface SidebarConfig {
  title: string;
  logo?: string;
  isotipo?: string;
  items: SidebarItemConfig[];
}

/**
 * Props para el componente SidebarItem
 */
export interface SidebarItemProps {
  config: SidebarItemConfig;
  currentPath: string;
  onNavigate?: (path: string) => void;
  isCollapsed?: boolean;
}

/**
 * Props para el componente Sidebar principal
 */
export interface SidebarProps {
  currentPath: string;
  userRole: string;
  onLogout: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

/**
 * Props para el componente Dashboard principal
 */
export interface DashboardProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Props para el componente Topbar
 */
export interface TopbarProps {
  userRole: string;
  onLogout: () => void;
  showSearch?: boolean;
  className?: string;
}

/**
 * Props para SearchBar
 */
export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * Props para UserDropdown
 */
export interface UserDropdownProps {
  userData: UserData;
  onLogout: () => void;
  onProfileClick: () => void;
  className?: string;
}

/**
 * Datos del usuario para el dropdown
 */
export interface UserData {
  id: string;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  foto?: string;
  rol?: string;
}

/**
 * Estado del hook useUserSession
 */
export interface UserSessionState {
  userRole: string | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

/**
 * Estado del hook useClickOutside
 */
export interface UseClickOutsideProps {
  onClickOutside: () => void;
}

/**
 * Estado del hook useRolePermissions
 */
export interface RolePermissions {
  canViewDashboard: boolean;
  canViewStatistics: boolean;
  canViewUsers: boolean;
  canViewIPH: boolean;
  canViewHistory: boolean;
  canViewSettings: boolean;
}

export interface UseRolePermissionsReturn {
  permissions: RolePermissions;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  getRoleLevel: () => number;
}