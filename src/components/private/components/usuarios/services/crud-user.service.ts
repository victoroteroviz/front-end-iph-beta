
import { API_BASE_URL } from "../../../../../config/env.config";

import { HttpHelper } from "../../../../../helper/http/http.helper";
import CacheHelper from "../../../../../helper/cache/cache.helper";
import type { IPaginatedUsersResponse } from "../../../../../interfaces/user/crud/get-paginated.users.interface";
import type {
  ICreatedUser,
  ICreateUser,
  IGetUserById,
  IUpdateUser,
} from "../../../../../interfaces/user/crud/crud-user.interface";
import { UserSearchParams, UserOrderByParams, SortOrder } from "../../../../../interfaces/user/crud/user-search-params.enum";

const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});

const URL_API = `/api/users-web/`;

const CACHE_CONFIG = {
  useSessionStorage: true,
  namespace: "data" as const,
  ttl: {
    list: 60 * 1000, // 1 minuto
    detail: 5 * 60 * 1000, // 5 minutos
    index: 10 * 60 * 1000,
  },
  keys: {
    listIndex: "usuarios:list:index",
  },
  prefix: {
    list: "usuarios:list",
    detail: "usuarios:detail",
  },
} as const;

type NormalizedUsuariosParams = Required<GetUsuariosParams>;

const normalizeListParams = (params: GetUsuariosParams): NormalizedUsuariosParams => ({
  page: params.page ?? 1,
  orderBy: params.orderBy ?? UserOrderByParams.NOMBRE,
  order: params.order ?? SortOrder.ASC,
  search: params.search ?? "",
  searchBy: params.searchBy ?? UserSearchParams.NOMBRE,
});

const buildListQueryString = (params: NormalizedUsuariosParams): string => {
  const query = new URLSearchParams({
    page: String(params.page),
    orderBy: params.orderBy,
    order: params.order,
    search: params.search,
    searchBy: params.searchBy,
  });

  return query.toString();
};

const buildListCacheKey = (params: NormalizedUsuariosParams): string =>
  `${CACHE_CONFIG.prefix.list}:${buildListQueryString(params)}`;

const buildDetailCacheKey = (id: string): string =>
  `${CACHE_CONFIG.prefix.detail}:${id}`;

const registerListCacheKey = (cacheKey: string): void => {
  const indexKey = CACHE_CONFIG.keys.listIndex;
  const cachedKeys = CacheHelper.get<string[]>(indexKey, CACHE_CONFIG.useSessionStorage) ?? [];

  if (cachedKeys.includes(cacheKey)) {
    return;
  }

  const updatedKeys = [...cachedKeys, cacheKey];

  CacheHelper.set(indexKey, updatedKeys, {
    expiresIn: CACHE_CONFIG.ttl.index,
    namespace: CACHE_CONFIG.namespace,
    useSessionStorage: CACHE_CONFIG.useSessionStorage,
    metadata: {
      type: "usuarios:list:index",
      count: updatedKeys.length,
    },
  });
};

const cacheListResponse = (
  cacheKey: string,
  data: IPaginatedUsersResponse
): void => {
  const stored = CacheHelper.set(cacheKey, data, {
    expiresIn: CACHE_CONFIG.ttl.list,
    namespace: CACHE_CONFIG.namespace,
    useSessionStorage: CACHE_CONFIG.useSessionStorage,
    metadata: {
      type: "usuarios:list",
    },
  });

  if (stored) {
    registerListCacheKey(cacheKey);
  }
};

const cacheDetailResponse = (id: string, data: IGetUserById): void => {
  CacheHelper.set(buildDetailCacheKey(id), data, {
    expiresIn: CACHE_CONFIG.ttl.detail,
    namespace: CACHE_CONFIG.namespace,
    useSessionStorage: CACHE_CONFIG.useSessionStorage,
    metadata: {
      type: "usuarios:detail",
      id,
    },
  });
};

const invalidateUsuariosListCache = (): void => {
  const indexKey = CACHE_CONFIG.keys.listIndex;
  const cachedKeys = CacheHelper.get<string[]>(indexKey, CACHE_CONFIG.useSessionStorage);

  if (cachedKeys && cachedKeys.length > 0) {
    cachedKeys.forEach((key) => CacheHelper.remove(key, CACHE_CONFIG.useSessionStorage));
  }

  CacheHelper.remove(indexKey, CACHE_CONFIG.useSessionStorage);
};

const invalidateUserDetailCache = (id: string): void => {
  CacheHelper.remove(buildDetailCacheKey(id), CACHE_CONFIG.useSessionStorage);
};

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
 * @returns Promise<IPaginatedUsersResponse>
 */
export const getUsuarios = async (params: GetUsuariosParams): Promise<IPaginatedUsersResponse> => {
  const normalizedParams = normalizeListParams(params);
  const cacheKey = buildListCacheKey(normalizedParams);

  const cachedResponse = CacheHelper.get<IPaginatedUsersResponse>(
    cacheKey,
    CACHE_CONFIG.useSessionStorage
  );

  if (cachedResponse) {
    return cachedResponse;
  }

  const queryString = buildListQueryString(normalizedParams);
  const url: string = `${URL_API}paginated?${queryString}`;
  try {
    const response = await http.get<IPaginatedUsersResponse>(url);
    const usuariosResponse: IPaginatedUsersResponse = response.data;
    if (!usuariosResponse) throw new Error("No se encontraron usuarios");
    cacheListResponse(cacheKey, usuariosResponse);
    return usuariosResponse;
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};

export const getUserById = async (id: string): Promise<IGetUserById> => {
  const cacheKey = buildDetailCacheKey(id);
  const cached = CacheHelper.get<IGetUserById>(cacheKey, CACHE_CONFIG.useSessionStorage);

  if (cached) {
    return cached;
  }

  const url: string = `${URL_API}${id}`;
  try {
    const response = await http.get<IGetUserById>(url);
    const usuario: IGetUserById = response.data;
    if (!usuario) throw new Error("No se encontró el usuario");
    cacheDetailResponse(id, usuario);
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
    invalidateUsuariosListCache();
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
    invalidateUserDetailCache(id);
    invalidateUsuariosListCache();
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
    invalidateUserDetailCache(id);
    invalidateUsuariosListCache();
  } catch (error) {
    throw new Error(
      (error as Error).message || "Error desconocido, habla con soporte"
    );
  }
};