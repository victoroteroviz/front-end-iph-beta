export interface IAdscripcionWithInstitucion{
  id: number;
  nombre: string;
  institucion: Institucion;
}

export interface IAdscripcion{
  id: number;
  nombre: string;
  institucionId: number;
  is_active: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}


export interface Institucion{
  id: number;
  nombre_corto: string;
  nombre_largo: string;
  codigo: string; 
  is_active: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  gobiernoId: number;
}