export interface IPaginatedUsers {
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
  user_roles: UserRole[]
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

export interface UserRole {
  id: string
}
