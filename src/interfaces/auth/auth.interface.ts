/**
 * Interfaces para autenticación y gestión de usuarios
 * Define la estructura de datos para login, JWT y almacenamiento
 */

/**
 * Credenciales de acceso del usuario
 */
export interface LoginCredentials {
  /** Correo electrónico del usuario */
  correo: string;
  /** Contraseña del usuario */
  password: string;
}

/**
 * Respuesta del servidor al hacer login
 */
export interface LoginApiResponse {
  /** Mensaje de respuesta del servidor */
  message: string;
  /** Token JWT con datos del usuario */
  token: string;
}

/**
 * Información de privilegio/rol desde el backend
 */
export interface Privilegio {
  /** ID del privilegio en el sistema */
  id: number;
  /** Nombre descriptivo del privilegio */
  nombre: string;
}

/**
 * Rol de usuario con información del backend
 */
export interface UserRole {
  /** ID único del rol asignado */
  id: string;
  /** Información del privilegio asociado */
  privilegio: Privilegio;
  /** Fecha de asignación del rol */
  fecha_registro: string;
}

/**
 * Datos del usuario contenidos en el JWT
 */
export interface JwtUserData {
  /** ID único del usuario (UUID) */
  id: string;
  /** URL de la foto de perfil */
  photo: string;
  /** Primer apellido del usuario */
  primer_apellido: string;
  /** Segundo apellido del usuario */
  segundo_apellido: string;
  /** Nombre del usuario */
  nombre: string;
  /** Array de roles asignados al usuario */
  user_roles: UserRole[];
}

/**
 * Estructura completa del token JWT decodificado
 */
export interface DecodedJWT {
  /** Datos del usuario */
  data: JwtUserData;
  /** Timestamp de emisión del token */
  iat: number;
  /** Timestamp de expiración del token */
  exp: number;
  /** Emisor del token */
  iss: string;
}

/**
 * Perfil de usuario procesado para la aplicación
 */
export interface UserProfile {
  /** ID único del usuario */
  id: string;
  /** Nombre completo del usuario */
  nombre: string;
  /** Primer apellido */
  primer_apellido: string;
  /** Segundo apellido */
  segundo_apellido: string;
  /** URL de la foto de perfil */
  photo: string;
  /** Nombre completo formateado */
  nombre_completo: string;
}

/**
 * Información de rol procesada para el sistema
 */
export interface ProcessedUserRole {
  /** ID del rol asignado */
  id: string;
  /** ID del privilegio */
  privilegio_id: number;
  /** Nombre del privilegio */
  privilegio_nombre: string;
  /** Fecha de asignación */
  fecha_registro: string;
  /** Indica si es el rol principal del usuario */
  es_principal?: boolean;
}

/**
 * Datos de roles del usuario
 */
export interface UserRolesData {
  /** Rol principal del usuario (mayor jerarquía) */
  rol_principal: ProcessedUserRole;
  /** Array completo de roles del usuario */
  roles: ProcessedUserRole[];
  /** Nombres de roles para validaciones rápidas */
  nombres_roles: string[];
  /** IDs de privilegios para validaciones */
  privilegio_ids: number[];
}

/**
 * Resultado del proceso de login
 */
export interface LoginResult {
  /** Indica si el login fue exitoso */
  success: boolean;
  /** Mensaje descriptivo del resultado */
  message: string;
  /** Datos del usuario (solo si success = true) */
  user?: {
    profile: UserProfile;
    roles: UserRolesData;
  };
  /** Información del error (solo si success = false) */
  error?: {
    type: 'NETWORK' | 'AUTH' | 'VALIDATION' | 'TOKEN' | 'UNKNOWN';
    details?: string;
  };
}

/**
 * Opciones de configuración para el servicio de login
 */
export interface LoginServiceConfig {
  /** Usar encriptación para datos en storage */
  useEncryption: boolean;
  /** Validar expiración automática del token */
  validateTokenExpiration: boolean;
  /** Tiempo en ms para considerar el token próximo a expirar */
  tokenExpirationWarning: number;
  /** Limpiar storage automáticamente al cerrar sesión */
  autoCleanStorage: boolean;
}

/**
 * Información de sesión almacenada
 */
export interface StorageSession {
  /** Timestamp de creación de la sesión */
  created_at: number;
  /** Timestamp de última actividad */
  last_activity: number;
  /** Timestamp de expiración del token */
  expires_at: number;
  /** Indica si la sesión está activa */
  is_active: boolean;
}

/**
 * Claves para el sessionStorage
 */
export const STORAGE_KEYS = {
  /** Clave para almacenar el token JWT */
  AUTH_TOKEN: 'auth_token',
  /** Clave para almacenar el perfil de usuario */
  USER_PROFILE: 'user_profile',
  /** Clave para almacenar los roles del usuario */
  USER_ROLES: 'user_roles',
  /** Clave para almacenar información de la sesión */
  SESSION_INFO: 'session_info'
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
