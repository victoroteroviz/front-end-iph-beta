export interface ICreateUser {
  primer_apellido: string
  segundo_apellido: string
  nombre: string
  correo_electronico: string
  telefono: string
  is_verific: boolean
  cuip: string
  cup: string
  gradoId: number
  cargoId: number
  municipioId: number
  adscripcionId: number
  sexoId: number
  password_hash: string
  roles: number[]
}


export interface ICreatedUser{
    id: string
  primer_apellido: string
  segundo_apellido: string
  nombre: string
  correo_electronico: string
  telefono: string
  is_active: boolean
  is_verific: boolean
  ultima_conexion: string
  password_hash: string
  cuip: string
  cup: string
  fecha_registro: string
  fecha_modificacion: string
  gradoId: number
  cargoId: number
  municipioId: number
  adscripcionId: number
  sexoId: number
}

export interface IUpdateUser {
  primer_apellido: string
  segundo_apellido: string
  nombre: string
  correo_electronico: string
  telefono: string
  is_verific: boolean
  cuip: string
  cup: string
  gradoId: number
  cargoId: number
  municipioId: number
  adscripcionId: number
  sexoId: number
  user_roles: UserRole[]
}

export interface UserRole {
  id?: string;  // Para roles existentes (UPDATE)
  id_privilegio?: number;  // Para roles nuevos (INSERT)
  is_active: boolean;
}

export interface IGetUserById {
  id: string
  photo: string
  primer_apellido: string
  segundo_apellido: string
  nombre: string
  correo_electronico: string
  telefono: string
  is_active: boolean
  is_verific: boolean
  ultima_conexion: string
  cuip: string
  cup: string
  fecha_registro: string
  grado: Grado
  cargo: Cargo
  municipio: Municipio
  adscripcion: Adscripcion
  sexo: Sexo
  user_roles: UserRoleGet[]
}

export interface Grado {
  id: number
  nombre: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface Cargo {
  id: number
  nombre: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface Municipio {
  id: number
  nombre: string
  codigo: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
  estadoId: number
}

export interface Adscripcion {
  id: number
  nombre: string
  institucionId: number
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface Sexo {
  id: number
  nombre: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface UserRoleGet {
  id: number;
  privilegioId: number;
  is_active: boolean;
}

