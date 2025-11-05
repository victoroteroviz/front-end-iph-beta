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
  ICreateUser,
  ICreatedUser,
  IUpdateUser,
  UserRole,
  IGetUserById,
  Grado,
  Cargo,
  Municipio,
  Adscripcion,
  Sexo,
  UserRoleGet
} from './crud/crud-user.interface';

export type {
  IPaginatedUsers,
  IPaginatedUsersResponse
} from './crud/get-paginated.users.interface';

export type {
  IBuscarUsuarioNombreParams,
  IUsuarioBusqueda,
  IBuscarUsuarioNombreResponse
} from './crud/buscar-usuario-nombre.interface';

// Enums
export { UserSearchParams } from './crud/user-search-params.enum';
