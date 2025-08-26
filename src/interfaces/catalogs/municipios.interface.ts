export interface IMunicipioWithEstado{
  id: string;
  nombre: string;
  codigo: string;
  estado: Estado;
}

export interface Estado {
  id: number
  nombre: string
  codigo: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface IMunicipio {
  id: number
  nombre: string
  codigo: string
  is_active: boolean
  fecha_creacion: string
  fecha_actualizacion: string
  estadoId: number
}

export interface IMunicipioRequest {
  nombre: string
  codigo: string
  estadoId: number
}
