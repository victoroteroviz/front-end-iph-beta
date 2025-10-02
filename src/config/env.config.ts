export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Configuración de roles del sistema
export const SUPERADMIN_ROLE = import.meta.env.VITE_SUPERADMIN_ROLE ? JSON.parse(import.meta.env.VITE_SUPERADMIN_ROLE) : [];

export const ADMIN_ROLE = import.meta.env.VITE_ADMIN_ROLE ? JSON.parse(import.meta.env.VITE_ADMIN_ROLE) : [];

export const SUPERIOR_ROLE = import.meta.env.VITE_SUPERIOR_ROLE ? JSON.parse(import.meta.env.VITE_SUPERIOR_ROLE) : [];

export const ELEMENTO_ROLE = import.meta.env.VITE_ELEMENTO_ROLE ? JSON.parse(import.meta.env.VITE_ELEMENTO_ROLE) : [];

// Array con todos los roles permitidos del sistema
export const ALLOWED_ROLES = [
  ...SUPERADMIN_ROLE,
  ...ADMIN_ROLE,
  ...SUPERIOR_ROLE,
  ...ELEMENTO_ROLE
];

function getAppEnvironment(): 'development' | 'staging' | 'production' {
  return import.meta.env.VITE_APP_ENVIRONMENT as 'development' | 'staging' | 'production' || 'development';
}

export const APP_ENVIRONMENT = getAppEnvironment();