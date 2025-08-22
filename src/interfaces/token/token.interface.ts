export interface Token {
  data: Data
  iat: number
  exp: number
  iss: string
}

export interface Data {
  id: string
  photo: string
  primer_apellido: string
  segundo_apellido: string
  nombre: string
  user_roles: UserRole[]
}

export interface UserRole {
  id: string
  privilegio: Privilegio
  fecha_registro: string
}

export interface Privilegio {
  id: number
  nombre: string
}
