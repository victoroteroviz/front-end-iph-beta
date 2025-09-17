import { API_BASE_ROUTES } from "../../config/routes.config";

import { API_BASE_URL } from "../../config/env.config";

import { HttpHelper } from "../../helper/http/http.helper";
import type { IPaginatedUsers } from "../../interfaces/user/crud/get-paginated.users.interface";
import type {
  ICreatedUser,
  ICreateUser,
  IGetUserById,
  IUpdateUser,
} from "../../interfaces/user/crud/crud-user.interface";
import { UserSearchParams, UserOrderByParams, SortOrder } from "../../interfaces/user/crud/user-search-params.enum";

const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});

const URL_API = `/api/users-web/`;

/**
 * Interfaz para los parámetros de la función getUsuarios
 */
export interface GetUsuariosParams {
  page?: number;
  orderBy?: UserOrderByParams;
  order?: SortOrder;
  search?: string;
  searchBy?: UserSearchParams;
}

/**
 * Obtiene usuarios paginados con parámetros de búsqueda y ordenamiento
 * @param params - Parámetros de paginación, ordenamiento y búsqueda
 * @returns Promise<IPaginatedUsers>
 */
export const getUsuarios = async ({
  page = 1,
  orderBy = UserOrderByParams.NOMBRE,
  order = SortOrder.ASC,
  search = "",
  searchBy = UserSearchParams.NOMBRE,
}: GetUsuariosParams): Promise<IPaginatedUsers> => {
  const url: string = `${URL_API}paginated?page=${page}&orderBy=${orderBy}&order=${order}&search=${encodeURIComponent(
    search
  )}&searchBy=${searchBy}`;
  try {
    const response = await http.get<IPaginatedUsers>(url);
    const usuarios: IPaginatedUsers = response.data;
    if (!usuarios) throw new Error("No se encontraron usuarios");
    return usuarios;
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};

export const getUserById = async (id: string): Promise<IGetUserById> => {
  const url: string = `${URL_API}${id}`;
  try {
    const response = await http.get<IGetUserById>(url);
    const usuario: IGetUserById = response.data;
    if (!usuario) throw new Error("No se encontró el usuario");
    return usuario;
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};

export const createUsuario = async (
  user: ICreateUser
): Promise<ICreatedUser> => {
  const url: string = `${URL_API}`;
  try {
    const response = await http.post<ICreatedUser>(url, user);
    const nuevoUsuario: ICreatedUser = response.data;
    if (!nuevoUsuario) throw new Error("No se pudo crear el usuario");
    return nuevoUsuario;
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};
export const updateUsuario = async (
  id: string,
  user: IUpdateUser
): Promise<ICreatedUser> => {
  const url: string = `${URL_API}${id}`;
  try {
    const response = await http.patch<ICreatedUser>(url, user);
    const usuarioActualizado: ICreatedUser = response.data;
    if (!usuarioActualizado)
      throw new Error("No se pudo actualizar el usuario");
    return usuarioActualizado;
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};

export const deleteUsuario = async (id: string): Promise<void> => {
  const url: string = `${URL_API}${id}`;
  try {
    await http.delete<void>(url);
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};