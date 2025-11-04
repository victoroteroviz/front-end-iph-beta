/**
 * @fileoverview Barrel export para interfaces de usuario
 * @description Centraliza las exportaciones de todas las interfaces relacionadas con usuario
 */

// Interfaces de autenticación
export type { LoginRequest, LoginResponse } from './login/login.interface';

// Interfaces de datos de usuario
export type {
  UserData,
  UserContext,
  FormatNameOptions
} from './user-data.interface';

// Interfaces de CRUD de usuarios
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse
} from './crud/crud-user.interface';

export type {
  GetPaginatedUsersRequest,
  GetPaginatedUsersResponse,
  PaginatedUsersMetadata
} from './crud/get-paginated.users.interface';

export type {
  BuscarUsuarioPorNombreRequest,
  BuscarUsuarioPorNombreResponse
} from './crud/buscar-usuario-nombre.interface';

// Enums
export { UserSearchParams } from './crud/user-search-params.enum';
