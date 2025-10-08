// Barrel export para interfaces de CRUD de usuarios
// Explicit exports to avoid conflicts between duplicate interfaces

// From crud-user.interface.ts
export type {
  ICreateUser,
  ICreatedUser,
  IUpdateUser,
  IGetUserById,
  UserRoleGet
} from './crud-user.interface';

// From get-paginated.users.interface.ts
export type { IPaginatedUsers } from './get-paginated.users.interface';

// Shared interfaces (exported from get-paginated to avoid duplication)
export type {
  Grado,
  Cargo,
  Municipio,
  Adscripcion,
  Sexo,
  UserRole
} from './get-paginated.users.interface';

// From user-search-params.enum.ts
export * from './user-search-params.enum';

// From buscar-usuario-nombre.interface.ts
export type {
  IBuscarUsuarioNombreParams,
  IBuscarUsuarioNombreResponse,
  IUsuarioBusqueda
} from './buscar-usuario-nombre.interface';