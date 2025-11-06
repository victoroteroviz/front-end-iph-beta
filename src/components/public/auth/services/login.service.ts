//+ Dependencias de npm
import { jwtDecode } from "jwt-decode";
import { z } from 'zod';

//+ Interfaces
import type { Token, UserRole } from "../../../../interfaces/token/token.interface";
import type { LoginRequest, LoginResponse } from "../../../../interfaces/user/login/login.interface";
//+ Enviroment
import { ALLOWED_ROLES, API_BASE_URL } from "../../../../config/env.config";
//+ Helpers
import {HttpHelper} from "../../../../helper/http/http.helper";
import CacheHelper from "../../../../helper/cache/cache.helper";
import {logger} from '../../../../helper/log/logger.helper';
import type { IRole } from "../../../../interfaces/role/role.interface";
import { clearAllPaginationPersistence } from '../../../shared/components/pagination';

/**
 * Handler para decodificar JWT con manejo seguro de excepciones y validaciones
 * @param tokenString - Token JWT a decodificar
 * @returns Token decodificado y validado
 * @throws Error con mensaje específico si el token es inválido o expirado
 */
const decodeAndValidateToken = (tokenString: string): Token => {
  try {
    const token: Token = jwtDecode(tokenString) as Token;
    
    // Validar estructura básica del token
    if (!token.data) {
      throw new Error('Token no contiene datos de usuario válidos');
    }
    
    if (!token.data.user_roles || !Array.isArray(token.data.user_roles)) {
      throw new Error('Token no contiene roles de usuario válidos');
    }
    
    // Validar expiración
    if (token.exp && token.exp < Date.now() / 1000) {
      throw new Error('Token expirado, inicie sesión nuevamente');
    }
    
    return token;
  } catch (decodeError) {
    if (decodeError instanceof Error) {
      throw decodeError;
    }
    throw new Error('Token con formato inválido recibido del servidor');
  }
};

// =====================================================
// SCHEMAS DE VALIDACIÓN PARA CACHE
// =====================================================

/**
 * Schema para validar datos de usuario en cache
 *
 * IMPORTANTE: id es string (UUID del backend), no number
 */
const UserDataSchema = z.object({
  id: z.string(), // UUID desde el backend
  nombre: z.string(),
  primer_apellido: z.string(),
  segundo_apellido: z.string().optional(),
  foto: z.string().optional()
});

/**
 * Schema para validar roles en cache
 */
const RolesSchema = z.array(z.object({
  id: z.number(),
  nombre: z.string()
}));

// =====================================================
// CONSTANTES DE CONFIGURACIÓN DE CACHE
// =====================================================

/**
 * Configuración centralizada para cache de autenticación
 *
 * IMPORTANTE: Todas las keys y TTLs de auth centralizados aquí
 */
const AUTH_CACHE_CONFIG = {
  keys: {
    USER_DATA: 'auth_user_data',
    ROLES: 'auth_roles',
    TOKEN: 'auth_token'
  },
  ttl: {
    // Sesión expira en 8 horas (28800000 ms)
    SESSION: 8 * 60 * 60 * 1000
  }
} as const;

/**
 * Clave legacy utilizada por módulos que aún acceden directamente a sessionStorage
 * Mantener sincronizada mientras se realiza la migración completa hacia CacheHelper.
 */
const LEGACY_AUTH_TOKEN_KEYS = ['token', 'auth_token'] as const;

// =====================================================
// FUNCIONES AUXILIARES DE CACHE (DRY)
// =====================================================

/**
 * Guarda los datos de usuario en cache
 *
 * @param userData - Datos del usuario a guardar
 */
const saveUserData = async (userData: z.infer<typeof UserDataSchema>): Promise<void> => {
  // Validar datos antes de guardar
  const validated = UserDataSchema.parse(userData);

  const stored = await CacheHelper.setEncrypted(AUTH_CACHE_CONFIG.keys.USER_DATA, validated, {
    expiresIn: AUTH_CACHE_CONFIG.ttl.SESSION,
    priority: 'critical', // No eliminar en LRU
    namespace: 'user',
    useSessionStorage: true,
    metadata: {
      schema: 'UserDataSchema'
    }
  });

  if (!stored) {
    logger.warn('saveUserData', 'No se pudo guardar datos de usuario en cache encriptado', {
      userId: validated.id
    });
    return;
  }

  logger.debug('saveUserData', 'Datos de usuario guardados en cache encriptado', {
    userId: validated.id
  });
};

/**
 * Guarda los roles del usuario en cache
 *
 * @param roles - Roles del usuario
 */
const saveUserRoles = async (roles: IRole[]): Promise<void> => {
  // Validar roles antes de guardar
  const validated = RolesSchema.parse(roles);

  const stored = await CacheHelper.setEncrypted(AUTH_CACHE_CONFIG.keys.ROLES, validated, {
    expiresIn: AUTH_CACHE_CONFIG.ttl.SESSION,
    priority: 'critical',
    namespace: 'user',
    useSessionStorage: true,
    metadata: {
      schema: 'RolesSchema'
    }
  });

  if (!stored) {
    logger.warn('saveUserRoles', 'No se pudieron guardar roles en cache encriptado', {
      rolesCount: validated.length
    });
    return;
  }

  logger.debug('saveUserRoles', 'Roles guardados en cache encriptado', {
    rolesCount: validated.length
  });
};

/**
 * Guarda el token JWT en cache
 *
 * @param token - Token JWT
 */
const saveAuthToken = async (token: string): Promise<void> => {
  const stored = await CacheHelper.setEncrypted(AUTH_CACHE_CONFIG.keys.TOKEN, token, {
    expiresIn: AUTH_CACHE_CONFIG.ttl.SESSION,
    priority: 'critical',
    namespace: 'user',
    useSessionStorage: true,
    metadata: {
      type: 'auth_token'
    }
  });

  if (!stored) {
    logger.warn('saveAuthToken', 'No se pudo guardar token en cache encriptado');
  } else {
    logger.debug('saveAuthToken', 'Token guardado en cache encriptado');
  }

  // Compatibilidad con módulos legacy que leen directamente desde sessionStorage
  for (const legacyKey of LEGACY_AUTH_TOKEN_KEYS) {
    try {
      sessionStorage.setItem(legacyKey, token);
    } catch (error) {
      logger.warn('saveAuthToken', `No se pudo sincronizar token legacy en sessionStorage (${legacyKey})`, {
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }
};

/**
 * Obtiene el token JWT desde cache
 *
 * IMPORTANTE: Esta función es exportada para que otros módulos
 * puedan obtener el token de autenticación (http.helper, etc.)
 *
 * @returns Token JWT o null si no existe o expiró
 */
export const getAuthToken = async (): Promise<string | null> => {
  const cachedToken = await CacheHelper.getEncrypted<string>(
    AUTH_CACHE_CONFIG.keys.TOKEN,
    {
      useSessionStorage: true
    }
  );

  if (cachedToken) {
    return cachedToken;
  }

  try {
    for (const legacyKey of LEGACY_AUTH_TOKEN_KEYS) {
      const legacyToken = sessionStorage.getItem(legacyKey);
      if (legacyToken) {
        return legacyToken;
      }
    }
  } catch (error) {
    logger.warn('getAuthToken', 'No se pudo obtener token legacy desde sessionStorage', {
      error: error instanceof Error ? error.message : 'unknown'
    });
  }

  return null;
};

/**
 * Limpia todos los datos de autenticación del cache
 */
const clearAuthCache = (): void => {
  CacheHelper.remove(AUTH_CACHE_CONFIG.keys.USER_DATA, true);
  CacheHelper.remove(AUTH_CACHE_CONFIG.keys.ROLES, true);
  CacheHelper.remove(AUTH_CACHE_CONFIG.keys.TOKEN, true);

  for (const legacyKey of LEGACY_AUTH_TOKEN_KEYS) {
    try {
      sessionStorage.removeItem(legacyKey);
    } catch (error) {
      logger.warn('clearAuthCache', `No se pudo eliminar token legacy (${legacyKey}) de sessionStorage`, {
        error: error instanceof Error ? error.message : 'unknown'
      });
    }
  }

  logger.debug('clearAuthCache', 'Cache de autenticación limpiado');
};

// =====================================================
// CONFIGURACIÓN HTTP HELPER
// =====================================================

//* Con esto configuramos el helper para las peticiones.
const http : HttpHelper = HttpHelper.getInstance(
  {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retries: 3,
    defaultHeaders:{
      "Content-Type": "application/json"
    }
  }
);

// Log de configuración para debug
logger.debug('login.service', 'Configuración HTTP Helper', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development'
});

/**
 * 
 * @param loginRequest 
 * @returns 
 * @throws Error(response.message||'message')
 */
export const login = async (loginRequest : LoginRequest)
: Promise<Token |false| []> => 
{
  logger.debug(login.name,'Inicio del proceso de login');
  try {
    // Log de la petición que se va a realizar
    const endpoint = `/api/auth-web/login`;
    logger.debug(login.name, 'Realizando petición de login', {
      endpoint,
      baseURL: API_BASE_URL,
      fullUrl: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint,
      method: 'POST',
      hasCredentials: !!loginRequest.correo_electronico
    });

    // Endpoint con /api para que coincida con la ruta del backend
    const response= await http.post<LoginResponse>(endpoint, loginRequest);

    const loginResponse: LoginResponse = response.data;

    // Log de debug para analizar la respuesta del servidor
    logger.debug(login.name, 'Respuesta del servidor recibida', {
      status: response.status,
      ok: response.ok,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      tokenPresent: !!loginResponse.token,
      tokenType: typeof loginResponse.token,
      // Debug adicional para ver qué está devolviendo el servidor
      responseType: typeof response.data,
      isArray: Array.isArray(response.data),
      firstKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data).slice(0, 10) : [],
      responsePreview: typeof response.data === 'string' ? (response.data as string).substring(0, 200) : 'No es string'
    });

    // Validación defensiva del token antes de decodificar
    if (!loginResponse.token || typeof loginResponse.token !== 'string') {
      logger.debug(login.name, 'Token inválido recibido del servidor', {
        tokenType: typeof loginResponse.token,
        tokenValue: loginResponse.token,
        tokenLength: loginResponse.token ? String(loginResponse.token).length : 0,
        isNull: loginResponse.token === null,
        isUndefined: loginResponse.token === undefined,
        isEmptyString: loginResponse.token === '',
        fullResponse: loginResponse,
        responseKeys: Object.keys(loginResponse),
        hasMessage: !!loginResponse.message
      });
      throw new Error(`Token inválido recibido del servidor - Tipo: ${typeof loginResponse.token}, Valor: ${JSON.stringify(loginResponse.token)}`);
    }

    const token: Token = decodeAndValidateToken(loginResponse.token);

    if(token.data.user_roles.length <= 0)
      throw new Error('El usuario no tiene roles asignados, hable con soporte');
    if(!response.ok) throw new Error(response.statusText  || 'Error desconocido habla con soporte');


    const rolesUsuario: IRole[] = token.data.user_roles.map((role: UserRole) => {
      return role.privilegio;
    });


    const allowedRoles: IRole[] = ALLOWED_ROLES.map((role: IRole) => {
      const rol: IRole = {
 
        id: role.id,
        nombre: role.nombre
      };
      return rol;
    });

    const rolesFiltrados: IRole[] = rolesUsuario.filter((userRole: IRole) =>
      allowedRoles.some((allowedRole: IRole) =>
        allowedRole.id === userRole.id && allowedRole.nombre === userRole.nombre
      )
    );

    if(rolesFiltrados.length <= 0) throw new Error('Roles no validos');

    // ========================================
    // ✅ GUARDAR EN CACHE CON CACHEHELPER (DRY)
    // ========================================

    await Promise.all([
      saveUserData({
        id: token.data.id,
        nombre: token.data.nombre,
        primer_apellido: token.data.primer_apellido,
        segundo_apellido: token.data.segundo_apellido,
        foto: token.data.photo
      }),
      saveUserRoles(rolesFiltrados),
      saveAuthToken(loginResponse.token)
    ]);

    logger.debug(login.name,'Login exitoso, datos guardados en cache con CacheHelper', {
      userId: token.data.id,
      rolesCount: rolesFiltrados.length
    });

    return token;

  } catch (error) {
    
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const logout = async () : Promise<void> => {
  logger.debug(logout.name,'Inicio del proceso de logout');
  try {
    // ========================================
    // ✅ LIMPIAR CACHE CON CACHEHELPER (DRY)
    // ========================================

    // Limpiar datos de autenticación (user_data, roles, token)
    clearAuthCache();

    // ✅ SECURITY FIX: Limpiar todas las paginaciones persistidas
    // Previene que el siguiente usuario vea la página del usuario anterior
    clearAllPaginationPersistence();

    logger.debug(logout.name,'Logout exitoso, cache de autenticación y paginaciones limpiados');
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

/**
 * Verifica si el usuario está autenticado
 *
 * @returns true si existe un token válido en cache
 */
export const isLoggedIn = async (): Promise<boolean> => {
  // ========================================
  // ✅ OBTENER TOKEN DESDE CACHEHELPER (DRY)
  // ========================================
  const token = await getAuthToken();
  return !!token;
};