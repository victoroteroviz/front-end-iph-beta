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

// Nueva interfaz principal que devuelve el backend
export interface ResponseIphData  {
  iph: I_IphData | [];
  primerRespondiente: IPrimerRespondiente | [];
  lugarIntervencion: ILugarIntervencion[] | ILugarIntervencion | [];
  conocimientoHecho: IConocimientoHecho | [];
  narrativaHecho: INarrativa | [];
  puestaDisposicion: IPuestaDisposicion | IPuestaDisposicion[] | [];
  detencion: IDetencion[] | IDetencion | [] | undefined;
  usoFuerza: IUsoFuerza | IUsoFuerza[] | [] | undefined;
  inspeccionVehiculo: I_InspeccionVehiculo | I_InspeccionVehiculo[] | [] | undefined;
  armaObjeto: I_ArmaObjeto | I_ArmaObjeto[] | [] | undefined;
  entrevista: IEntrevista | IEntrevista[] | [] | undefined;
  entregaRecepcion: IEntregaRecepcion | undefined | IEntregaRecepcion[] | [];
  continuacion: IContinuacion | [] | IContinuacion[] | undefined;
}

export interface I_IphData {
  id: string | undefined;
  nReferencia: string | undefined;
  nFolioSist: string | undefined;
  observaciones: string | undefined;
  coordenadas: ICoordenadas | undefined;
  hechos: string | undefined;

  estatus: string | undefined;
  tipoIph: ITipoIph | undefined;

  archivos: IArchivo[] | undefined;

  fotos: string[] | undefined;
  fechaCreacion: string | undefined;
  // fechaSubida: string | undefined;
  // fechaActualizacion: string | undefined;
}

export interface IArchivo {
  titulo: string | undefined;
  descripcion: string | undefined;
  archivo: string | undefined;
  tipo: string | undefined;
  
}

export interface IPrimerRespondiente {
  foto: string | undefined;
  nombre: string | undefined;
  primerApellido: string | undefined;
  segundoApellido: string | undefined;
  institucion: string | undefined;
  gradoCargo: string | undefined;
  unidadArribo: string | undefined;
  nElementos: number | undefined;
}

export interface ILugarIntervencion {
  calleTramo: string | undefined;
  nExterior: string | undefined;
  nInterior: string | undefined;
  referencia: string | undefined;
  coordenadas: ICoordenadas | undefined;
  zoomNivel: number | undefined;
  croquis: string | undefined;
  rutaMapa: string | undefined;
  rInspeccion: boolean | undefined;
  eObjeto: boolean | undefined;
  preservo: boolean | undefined;
  priorizo: boolean | undefined;
  riesgoNatural: boolean| undefined;
  riesgoSocial: boolean|undefined;
  especificacionRiesgo: string | undefined;
  referencia1: string | undefined;
  referencia2: string | undefined;
  localizacion: ILocalizacion | undefined;
}

export interface IConocimientoHecho {
  nConocimiento: string | undefined;
  docConocimiento: string | undefined;
  fConocimiento: string | undefined;
  fArribo: string | undefined;
  tipoConocimiento: string | undefined; //Recordar que esto es una relacion
}

export interface INarrativa {
  contenido: string | undefined;
}

export interface IPuestaDisposicion {
  disposicionesOficiales: IDisposicionOficial[] | undefined | IDisposicionOficial;
}

export interface IDetencion {
  rnd: string | undefined;
  fechaHora: string | undefined;
  primerApellidoDetenido: string |undefined;
  segundoApellidoDetenido: string | undefined;
  nombreDetenido: string | undefined;
  aliasDetenido: string | undefined;
  nacionalidad: string | undefined;
  tipoNacionalidad: string | undefined;
  sexo: string | undefined;
  fechaNacimiento: string | Date | undefined;
  edad: string | undefined;
  identificacion: string | undefined;
  domicilioDetenido: string | undefined;
  numeroExteriorDetenido: string | undefined;
  numeroInteriorDetenido: string | undefined;
  referenciaDetenido: string | undefined;
  descripcionDetenido: string | undefined;
  lesionVisible: string | undefined;
  padecimiento: string | undefined;
  grupoVulnerable: string | undefined;
  grupoDelictivo: string | undefined;
  primerApellidoConocido: string | undefined;
  segundoApellidoConocido: string | undefined;
  nombreConocido: string | undefined;
  telefonoConocido: string | undefined;
  lecturaDerecho: boolean | undefined;
  objetoEncontrado: boolean | undefined;
  recolectoObjeto: boolean | undefined;
  lugarDetencion: boolean | undefined;
  calleDetencion: string | undefined;
  numeroExteriorDetencion: string | undefined;
  numeroInteriorDetencion: string | undefined;
  referenciaDetencion: string | undefined;
  lugarTraslado: string | undefined;
  tipoLugarTraslado: string | undefined;
  observaciones: string | undefined;
  localizacionDetenido: ILocalizacion | undefined;
  localizacionDetencion: ILocalizacion | undefined;
  firmaDerecho: string | undefined; //Path de la firma
  pertenencias: IDetencionPertenencia[] | undefined;
  disposiciones: IDisposicionOficial[] | undefined;
}

export interface IDetencionPertenencia {
  tipo: string | undefined; //Relacion
  descripcion: string | undefined;
  estado: string | undefined;
  destino: string | undefined;
}

export interface IUsoFuerza {
  lesionadosAutoridad: string | undefined;
  lesionadosPersonas: string | undefined;
  fallecidosAutoridad: string | undefined;
  fallecidosPersonas: string | undefined;
  tipoGrupoDelictivo: string | undefined;
  reduccionMovimiento: boolean | undefined;
  usoArmaNoLetal: boolean | undefined;
  usoArmaLetal: boolean | undefined;
  asistenciaMedica: boolean | undefined;
  tipoPadecimiento: string | undefined;
  conducta: string | undefined;
  explicacion: string | undefined;
  disposiciones: IDisposicionOficial[] | undefined;
}

export interface I_InspeccionVehiculo{
  tipoVehiculo: string | undefined;
  procedencia: string | undefined;
  marca: string | undefined;
  submarca: string | undefined;
  modelo: string | undefined;
  color: string | undefined;
  tipoUso: string | undefined;
  placa: string | undefined;
  numeroSerie: string | undefined;
  observaciones: string | undefined;
  objetoEncontrado: boolean | undefined;
  destino: string | undefined;
  disposiciones: IDisposicionOficial[] | undefined;
}

export interface I_ArmaObjeto{
  tipoInventario: string | undefined;
  aportacionInspeccion: string | undefined;
  objetoEncontrado: string | undefined;
  tipoObjetoEncontrado: string | undefined;
  tipoInspeccion: string | undefined;
  lugarEncuentro: string | undefined;
  descripcionArmObj: string | undefined;
  firma: string | undefined;
  destinoArmOb: string | undefined;
  tipoArma: string | undefined;
  calibreArma: string | undefined;
  colorArma: string | undefined;
  matriculaArma: string | undefined;
  numeroSerieArma: string | undefined;
  primerApellidoAsegurado: string | undefined;
  segundoApellidoAsegurado: string | undefined;
  nombreAsegurado: string | undefined;
  firmaAsegurado: boolean | undefined;
  primerRespondiente: boolean | undefined;
  disposiciones: IDisposicionOficial[] | IDisposicionOficial| undefined;
  testigos: ITestigo[] | undefined;
}


export interface ITestigo{
  nombre: string | undefined;
  primerApellido: string | undefined;
  segundoApellido: string | undefined;
  firma: string | undefined;
}

export interface IEntrevista{
  datosReservados: boolean | undefined;
  fechaHora: Date| undefined;
  numeroInterior: string | undefined;
  apellidoPaternoEntrevistado: string | undefined;
  apellidoMaternoEntrevistado: string | undefined;
  nombreEntrevistado: string | undefined;
  calidad: string | undefined;
  nacionalidad: string | undefined;
  tipoNacionalidad: string | undefined;
  traductor: boolean | undefined;
  sexo: string | undefined;
  fechaNacimiento:Date | undefined;
  edad: string | undefined;
  identificacion: string | undefined;
  tipoIdentificacion: string | undefined;
  numeroIdentificacion: string | undefined;
  telefonoEntrevistado: string | undefined;
  correo: string | undefined;
  calle: string | undefined;
  numeroExterior: string | undefined;
  referencia: string | undefined;
  entrevista: string | undefined; //Es el texto de la entrevista
  firmaEntrevista: string | undefined; //Path de la firma
  canalizacion: string | undefined;
  otroLugarCanalizacion: string | undefined;
  motivoCanalizacion: string | undefined;
  lugarCanalizacion: string | undefined;
  firmaLecturaDerecho: string | undefined; // Path de la firma
  responsable : IDisposicionOficial | undefined; //Este responsable se encuentra dentro de la misma tabla de la entrevista
  localizacionEntrevistado: ILocalizacion | undefined;
  disposiciones: IDisposicionOficial[] | IDisposicionOficial| undefined;
}


export interface IEntregaRecepcion{
  explicacion: string | undefined;
  apoyoSolicitado: string | undefined;
  tipoApoyoSolicitado: string | undefined;
  ingresoAlLugar: string | undefined;
  motivoIngreso: string | undefined;
  observaciones: string | undefined;
  fechaEntregaRecepcion: Date | undefined;
  respondienteRecepcion: IDisposicionOficial | undefined;
  disposiciones: IDisposicionOficial[]   | undefined;
}

export interface IContinuacion{
  tipo: boolean | undefined;
  contenido: string | undefined;
  firmaContinuacion: string | undefined;
  entrevista: boolean | undefined; // Este campo es para saber si es continuacion de entrevista
  narrativa: boolean | undefined; // Este campo es para saber si es continuacion de narrativa
  disposiciones: IDisposicionOficial[] | IDisposicionOficial| undefined;
}

// Interfaces comunes para los demas datos
export interface ICoordenadas {
  latitud: string | undefined;
  longitud: string | undefined;
}

export interface IDisposicionOficial {
  nombre: string | undefined;
  primerApellido: string | undefined;
  segundoApellido: string | undefined;
  adscripcion: string | undefined;
  cargoGrado: string | undefined;
  firmas?: string[] | string | [] | undefined;
}

export interface ILocalizacion {
  colonia: string| undefined;
  codigoPostal: string | undefined;
  municipio: string | undefined;
  estado: string | undefined;
}

export interface ITipoIph {
  nombre: string | undefined;
  descripcion: string | undefined;
}

// Interfaces legacy para mantener compatibilidad con IPaginatedIPH
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

// Alias para compatibilidad con el servicio getIphById
export type I_IPHById = ResponseIphData;