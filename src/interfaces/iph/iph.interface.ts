export interface IAllIph {
  id: string;
  n_referencia: string;
  n_folio_sist: string;
  observaciones: string;
  latitud: string;
  longitud: string;
  hechos: string;
  fecha_creacion: string;
  fecha_subida: string;
  estatus: Estatus;
  tipo: Tipo;
}

export interface IPaginatedIPH{
  total: number
  page: number
  limit: number
  totalPages: number
  orderBy: string
  order: string
  data: IAllIph[]
}

export interface I_IPHById{
  id: string
  n_referencia: string
  n_folio_sist: string
  observaciones: string
  latitud: string
  longitud: string
  hechos: string
  fecha_creacion: string
  fecha_subida: string
  primer_respondiente: PrimerRespondiente
  estatus: Estatus
  tipo: Tipo
  conocimiento_hecho: any
  lugar_intervencion: any
  narrativaHechos: any
  detencion_pertenencias: any[]
  cInspeccionVehiculo: any[]
  armas_objetos: any[]
  uso_fuerza: any
  entrega_recepcion: any
  continuacion: any[]
  ruta_fotos_lugar: any[]
  disposicion_ofc: any[]
  entrevistas: any[]
}

export interface Estatus {
  id: number
  nombre: string
  fecha_creacion: string
  fecha_actualizacion: string
  is_active: boolean
}

export interface Tipo {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  is_active: boolean;
}

export interface PrimerRespondiente {
  id: number
  unidad_arrivo: string
  n_elementos: number
  fecha_creacion: string
  fecha_actualizacion: string
}