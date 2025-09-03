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

export interface I_IPHById {
  id: string;
  n_referencia: string;
  n_folio_sist: string;
  observaciones: string;
  latitud: string;
  longitud: string;
  hechos: string;
  fecha_creacion: string;
  fecha_subida: string;
  fecha_actualizacion: string;
  primer_respondiente: PrimerRespondiente;
  estatusId: number | null;
  estatus: Estatus | null;
  tipoId: number | null;
  tipo: Tipo | null;
  conocimiento_hecho: ConocimientoHecho;
  lugar_intervencion: LugarIntervencion;
  narrativaHechos: NarrativaHechos;
  detencion_pertenencias: DetencionPertenencias[];
  cInspeccionVehiculo: InspeccionVehiculo[];
  armas_objetos: ArmasObjetos[];
  uso_fuerza: UsoFuerza;
  entrega_recepcion: EntregaRecepcion;
  continuacion: Continuacion[];
  ruta_fotos_lugar: RutaFotosLugar[];
  disposicion_ofc: DisposicionOfc[];
  archivos: Archivos[];
  entrevistas: Entrevistas[];
}

export interface ConocimientoHecho {
  id: number;
  n_conocimiento: string;
  doc_conocimiento: string;
  f_conocimiento: string;
  f_arribo: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface LugarIntervencion {
  id: number;
  calle_tramo: string;
  n_exterior: string;
  n_interior: string;
  referencia: string;
  latitud: string;
  longitud: string;
  zoom_nivel: number;
  croquis: string;
  ruta_mapa: string;
  r_inspeccion: boolean;
  e_objeto: boolean;
  preservo: boolean;
  priorizo: boolean;
  riesgo_natural: boolean;
  riesgo_social: boolean;
  especificacion_riesgo: string;
  referencia1: string;
  referencia2: string;
  fecha_creacion: string;
}

export interface NarrativaHechos {
  id: number;
  contenido: string;
  fecha_creacion: string;
}

export interface DetencionPertenencias {
  id: number;
  rnd: string;
  fecha_hora: string;
  primer_apellido_detenido: string;
  segundo_apellido_detenido: string;
  nombres_detenido: string;
  alias_detenido: string;
  nacionalidad: string;
  tipo_nacionalidad: string | null;
  sexo: string;
  fecha_nacimiento: string;
  edad: string;
  identificacion: string;
  tipo_identificacion: string | null;
  numero_identificacion: string;
  domicilio_detenido: string;
  numero_exterior_detenido: string;
  numero_interior_detenido: string;
  referencias_detenido: string | null;
  descripcion_detenido: string;
  lesiones_visibles: string;
  padecimiento: string;
  grupo_vulnerable: string;
  tipo_grupo_vulnerable: string | null;
  grupo_delictivo: string;
  primer_apellido_conocido: string;
  segundo_apellido_conocido: string;
  nombres_conocido: string;
  telefono_conocido: string | null;
  lectura_derechos: boolean;
  firma_derechos: string | null;
  objeto_encontrado: boolean;
  recolecto_objeto: boolean;
  lugar_detencion: boolean;
  calle_detencion: string | null;
  numero_exterior_detencion: string | null;
  numero_interior_detencion: string | null;
  referencias_detencion: string | null;
  lugar_traslado: string;
  tipo_lugar_traslado: string | null;
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface InspeccionVehiculo {
  id: number;
  fecha_hora_inspeccion: string;
  tipo_vehiculo: string;
  procedencia: string;
  marca: string;
  submarca: string;
  modelo: string;
  color: string;
  tipo_uso: string;
  placa: string;
  numero_serie: string;
  situacion: string;
  observaciones: string;
  destino: string;
  objetos_encontrados: boolean;
  fecha_creacion: string;
}

export interface ArmasObjetos {
  id: number;
  tipo_inventario: string;
  aportacion_o_inspeccion: string;
  objeto_encontrado: string;
  tipo_de_objeto_encontrado: string | null;
  tipo_inspeccion: string;
  lugar_de_encuentro: string | null;
  descripcion_de_ao: string;
  firma: string;
  destino_de_ao: string;
  tipo_arma: string | null;
  calibre_arma: string | null;
  color_arma: string | null;
  matricula_arma: string | null;
  numero_serie_arma: string | null;
  primer_apellido_asegurado: string | null;
  segundo_apellido_asegurado: string | null;
  nombre_asegurado: string | null;
  firma_asegurado: string;
  primer_respondiente: boolean;
  fecha_creacion: string;
}

export interface UsoFuerza {
  id: number;
  lesionados_autoridad: string;
  lesionados_personas: string;
  fallecidos_autoridad: string;
  fallecidos_personas: string;
  tipo_grupo_delictivo: string | null;
  tipo_padecimiento: string | null;
  reduccion_movimiento: boolean;
  uso_arma_no_letal: boolean;
  uso_arma_letal: boolean;
  conducta: string;
  asistencia_medica: boolean;
  explicacion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EntregaRecepcion {
  id: number;
  explicacion: string;
  apoyo_solicitado: string;
  tipo_apoyo_solicitado: string;
  ingreso_al_lugar: string;
  motivo_ingreso: string;
  primer_apellido_recepcion: string;
  segundo_apellido_recepcion: string;
  nombre_recepcion: string;
  adscripcion_recepcion: string;
  cargo_recepcion: string;
  firma_recepcion: string;
  observaciones: string;
  fecha_entrega_recepcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Continuacion {
  id: number;
  tipo: boolean;
  contenido: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  firma_continuacion: string;
}

export interface RutaFotosLugar {
  id: number;
  ruta_foto: string;
  fecha_creacion: string;
}

export interface DisposicionOfc {
  id: number;
  primer_apellido: string;
  segundo_apellido: string;
  nombre: string;
  adscripcion: string;
  cargo_grado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Archivos {
  id: number;
  titulo: string;
  descripcion: string;
  archivo: string;
  tipo: string;
  estatus_enlinea: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Entrevistas {
  id: number;
  datos_reservados: boolean;
  fecha_hora: string;
  numero_interior: string;
  apellido_paterno_entrevistado: string;
  apellido_materno_entrevistado: string;
  nombre_entrevistado: string;
  calidad: string;
  nacionalidad: string;
  tipo_nacionalidad: string | null;
  traductor: boolean;
  sexo: string;
  fecha_nacimiento: string;
  edad: string;
  identificacion: string;
  tipo_identificacion: string;
  numero_identificacion: string;
  telefono: string;
  correo: string;
  calle: string;
  numero_exterior: string;
  referencias: string;
  entrevista: string;
  firma_entrevista: string;
  canalizacion: string;
  otro_lugar_canalizacion: string | null;
  motivo_canalizacion: string | null;
  lugar_canalizacion: string;
  firma_lectura_derecho: string;
  primer_apellido_responsable: string;
  segundo_apellido_responsable: string;
  nombre_responsable: string;
  adscripcion_responsable: string;
  cargo_responsable: string;
  firma_responsable: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
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