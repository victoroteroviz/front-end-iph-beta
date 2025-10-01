//+ Dependencias de npm
import { jwtDecode } from "jwt-decode";

//+ Interfaces
import type { Token, UserRole } from "../../interfaces/token/token.interface";
import type { LoginRequest, LoginResponse } from "../../interfaces/user/login/login.interface";
//+ Enviroment
import { ALLOWED_ROLES, API_BASE_URL } from "../../config/env.config";
//+ Helpers
import {HttpHelper} from "../../helper/http/http.helper";

import {logger} from '../../helper/log/logger.helper';
import type { IRole } from "../../interfaces/role/role.interface";

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
    // Endpoint con /api para que coincida con la ruta del backend
    const response= await http.post<LoginResponse>(`/api/auth-web/login`, loginRequest);

    const loginResponse: LoginResponse = response.data;
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
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('token');

    logger.debug(logout.name,'Logout exitoso, se eliminaron los datos del usuario y roles de sessionStorage');
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const isLoggedIn = (): boolean => {
  return !!sessionStorage.getItem('token');
};