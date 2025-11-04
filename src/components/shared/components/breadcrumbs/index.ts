/**
 * @fileoverview Barrel export para componentes de Breadcrumbs
 * @version 1.1.0
 * @updated 2025-01-31 - Agregado UserProfileBreadcrumb
 */

// Componente principal de Breadcrumbs
export { Breadcrumbs, BreadcrumbSkeleton } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';

// Hooks
export { useBreadcrumbs, useBreadcrumbsTitle } from './useBreadcrumbs';

// Componente de perfil de usuario
export {
  UserProfileBreadcrumb,
  UserProfileBreadcrumbCompact,
  UserProfileBreadcrumbExtended
} from './UserProfileBreadcrumb';
export type { UserProfileBreadcrumbProps } from './UserProfileBreadcrumb';

// Default export
export { default } from './Breadcrumbs';