//+ Dependencias de npm
import { jwtDecode } from "jwt-decode";

//+ Interfaces
import type { Token, UserRole } from "../../../../interfaces/token/token.interface";
import type { LoginRequest, LoginResponse } from "../../../../interfaces/user/login/login.interface";
//+ Enviroment
import { ALLOWED_ROLES, API_BASE_URL } from "../../../../config/env.config";
//+ Helpers
import {HttpHelper} from "../../../../helper/http/http.helper";

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
    sessionStorage.setItem('user_data', JSON.stringify(
      {
        id: token.data.id,
        nombre: token.data.nombre,
        primer_apellido: token.data.primer_apellido,
        segundo_apellido: token.data.segundo_apellido,
        foto: token.data.photo,
      }
    ));

    //TODO AGREGAR METODO DE ENCRIPTACION DE DATOS CON BCRYPT
    
    sessionStorage.setItem('roles', JSON.stringify(rolesFiltrados));
    sessionStorage.setItem('token', loginResponse.token);

    logger.debug(login.name,'Login exitoso, se guardaron los datos del usuario y roles en sessionStorage');

    return token;

  } catch (error) {
    
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const logout = async () : Promise<void> => {
  logger.debug(logout.name,'Inicio del proceso de logout');
  try {
    // Limpiar datos de usuario y autenticación
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('token');

    // ✅ SECURITY FIX: Limpiar todas las paginaciones persistidas
    // Previene que el siguiente usuario vea la página del usuario anterior
    clearAllPaginationPersistence();

    logger.debug(logout.name,'Logout exitoso, se eliminaron los datos del usuario, roles y paginaciones de sessionStorage');
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem('token');
};