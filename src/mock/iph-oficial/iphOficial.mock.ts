/**
 * Mock data para IPH Oficial
 * Datos ficticios basados en la interfaz real I_IPHById del servidor
 */

import type { 
  IphOficialData,
  ConocimientoHecho,
  LugarIntervencion,
  NarrativaHechos,
  DetencionPertenencias,
  InspeccionVehiculo,
  ArmasObjetos,
  UsoFuerza,
  EntregaRecepcion,
  Continuacion,
  FotoLugar,
  DisposicionOficial,
  Entrevista
} from '../../interfaces/components/iphOficial.interface';

import type {
  Estatus,
  Tipo,
  PrimerRespondiente
} from '../../interfaces/iph/iph.interface';

/**
 * Mock data para estatus
 */
export const estatusMock: Estatus = {
  id: 1,
  nombre: "Activo",
  fecha_creacion: "2024-01-15T08:30:00Z",
  fecha_actualizacion: "2024-01-15T08:30:00Z",
  is_active: true
};

/**
 * Mock data para tipo de IPH
 */
export const tipoMock: Tipo = {
  id: 1,
  nombre: "IPH para Hechos Probablemente Delictivos con detenido",
  descripcion: "Informe para hechos delictivos que involucran detención de personas",
  fecha_creacion: "2024-01-15T08:30:00Z",
  is_active: true
};

/**
 * Mock data para primer respondiente
 */
export const primerRespondienteMock: PrimerRespondiente = {
  id: 1,
  unidad_arrivo: "S19",
  n_elementos: 2,
  fecha_creacion: "2024-01-15T08:30:00Z",
  fecha_actualizacion: "2024-01-15T08:30:00Z"
};

/**
 * Mock data para conocimiento de hechos
 */
export const conocimientoHechoMock: ConocimientoHecho = {
  tipo: "Denuncia",
  numero: "27 82 94",
  documento: "Denuncia ciudadana",
  fecha_conocimiento: "2025-05-06T22:47:00Z",
  fecha_arribo: "2025-05-06T23:47:00Z",
  descripcion: "Conocimiento por denuncia ciudadana vía telefónica"
};

/**
 * Mock data para lugar de intervención
 */
export const lugarIntervencionMock: LugarIntervencion = {
  calle: "Luciérnaga",
  numero_exterior: "156",
  numero_interior: "556",
  codigo_postal: "37750",
  colonia: "San Antonio",
  referencias: "A un lado de la plaza, al costado de los tacos de don esteban",
  municipio: "San Miguel de Allende",
  estado: "Guanajuato",
  coordenadas: "Lat: 20.913237209466967, Long: -100.74995748193386",
  inspeccion: true,
  objetos_encontrados: true,
  lugar_preservado: true,
  lugar_priorizado: true,
  riesgo_natural: false,
  riesgo_social: true,
  especificacion_riesgo: "Amontonadero de gente"
};

/**
 * Mock data para narrativa de hechos
 */
export const narrativaHechosMock: NarrativaHechos = {
  descripcion: "Se encontró en el cel rocolorado un cuerpo parcialmente fallecido por el accionamiento de disparos de una calibre 22 pistola hkp7 alrededor de las 17 horas rumbo a San Nicolás del Bravo",
  fecha_elaboracion: "2025-05-06T23:47:00Z",
  elaborado_por: "Adrian Lino Marmolejo"
};

/**
 * Mock data para detención y pertenencias
 */
export const detencionPertenenciasMock: DetencionPertenencias[] = [
  {
    id: 1,
    descripcion: "Teléfono celular marca Samsung",
    cantidad: 1,
    estado: "Bueno",
    observaciones: "Desbloqueado, con evidencia digital relevante"
  },
  {
    id: 2,
    descripcion: "Billetera de cuero con documentos",
    cantidad: 1,
    estado: "Regular",
    observaciones: "Contiene INE y tarjetas de crédito"
  }
];

/**
 * Mock data para inspección de vehículo
 */
export const inspeccionVehiculoMock: InspeccionVehiculo[] = [
  {
    id: 1,
    tipo_vehiculo: "Automóvil",
    marca: "Nissan",
    modelo: "Sentra",
    color: "Blanco",
    placas: "ABC-123-D",
    serie: "3N1AB7AP5FY123456",
    motor: "SR20DE",
    observaciones: "Vehículo en buen estado, sin daños aparentes"
  }
];

/**
 * Mock data para armas y objetos
 */
export const armasObjetosMock: ArmasObjetos[] = [
  {
    id: 1,
    tipo: "Arma de fuego",
    descripcion: "Pistola semiautomática",
    cantidad: 1,
    marca: "Heckler & Koch",
    calibre: ".22 LR",
    serie: "HKP7123456",
    estado: "Funcional"
  },
  {
    id: 2,
    tipo: "Munición",
    descripcion: "Cartuchos calibre .22",
    cantidad: 15,
    marca: "Federal",
    calibre: ".22 LR",
    serie: "N/A",
    estado: "Nuevo"
  }
];

/**
 * Mock data para uso de fuerza
 */
export const usoFuerzaMock: UsoFuerza = {
  se_uso_fuerza: false,
  tipo_fuerza: "N/A",
  justificacion: "No fue necesario el uso de la fuerza",
  lesiones: false,
  descripcion_lesiones: "N/A"
};

/**
 * Mock data para entrega recepción
 */
export const entregaRecepcionMock: EntregaRecepcion = {
  fecha: "2025-05-07T08:00:00Z",
  autoridad_receptora: "Ministerio Público",
  nombre_receptor: "Lic. María González López",
  cargo_receptor: "Agente del Ministerio Público",
  observaciones: "Entrega completa de evidencias y documentación"
};

/**
 * Mock data para continuación
 */
export const continuacionMock: Continuacion[] = [
  {
    id: 1,
    descripcion: "Se realizó inspección preliminar del lugar",
    fecha: "2025-05-06T23:50:00Z",
    responsable: "Adrian Lino Marmolejo"
  },
  {
    id: 2,
    descripcion: "Se tomaron fotografías del lugar y evidencias",
    fecha: "2025-05-07T00:15:00Z",
    responsable: "Adrian Lino Marmolejo"
  },
  {
    id: 3,
    descripcion: "Se realizaron entrevistas a testigos",
    fecha: "2025-05-07T01:00:00Z",
    responsable: "Adrian Lino Marmolejo"
  }
];

/**
 * Mock data para fotos del lugar
 */
export const fotosLugarMock: FotoLugar[] = [
  {
    id: 1,
    url: "/data/user/0/com.example.okip_iph/app_flutter/GUGN01123060520252247/foto_lugar_001.jpg",
    descripcion: "Vista general del lugar de los hechos",
    fecha_captura: "2025-05-06T23:50:00Z",
    ubicacion: "Entrada principal"
  },
  {
    id: 2,
    url: "/data/user/0/com.example.okip_iph/app_flutter/GUGN01123060520252247/foto_lugar_002.jpg",
    descripcion: "Evidencia encontrada en el lugar",
    fecha_captura: "2025-05-06T23:55:00Z",
    ubicacion: "Interior del inmueble"
  },
  {
    id: 3,
    url: "/data/user/0/com.example.okip_iph/app_flutter/GUGN01123060520252247/foto_lugar_003.jpg",
    descripcion: "Arma asegurada",
    fecha_captura: "2025-05-07T00:10:00Z",
    ubicacion: "Sala principal"
  }
];

/**
 * Mock data para disposición oficial
 */
export const disposicionOficialMock: DisposicionOficial[] = [
  {
    id: 1,
    fecha: "2025-05-07T08:00:00Z",
    expediente: "FED/GTO/SMA/123/2025",
    anexos: "3 fotografías, 1 arma, 15 cartuchos, 2 objetos personales",
    documentacion: "IPH, acta de entrevistas, cadena de custodia",
    autoridad: {
      nombre: "Tomás Álvarez López",
      cargo_grado: "Jefe de Área / Subteniente",
      adscripcion: "Inteligencia",
      firma: "/data/user/0/com.example.okip_iph/app_flutter/GUGN01123060520252247/firma_1746593507392.png",
      fecha_firma: "2025-05-07T08:30:00Z"
    }
  }
];

/**
 * Mock data para entrevistas
 */
export const entrevistasMock: Entrevista[] = [
  {
    id: 1,
    tipo_persona: "testigo",
    nombre: "Carlos Rodríguez Méndez",
    edad: 35,
    telefono: "473-123-4567",
    domicilio: "Calle Insurgentes #456, Col. Centro",
    relacion_hechos: "Vecino que escuchó los disparos",
    declaracion: "Aproximadamente a las 17:00 horas escuché varios disparos provenientes de la casa de al lado. Al asomarme vi a una persona corriendo hacia la calle principal."
  },
  {
    id: 2,
    tipo_persona: "testigo",
    nombre: "Ana María Sánchez",
    edad: 42,
    telefono: "473-987-6543",
    domicilio: "Calle Luciérnaga #150, Col. San Antonio",
    relacion_hechos: "Transeúnte que presenció los hechos",
    declaracion: "Vi cuando una persona salió corriendo de la casa número 156. Parecía estar muy alterada y traía algo en las manos."
  }
];

/**
 * Mock data principal para IPH Oficial
 */
export const iphOficialMockData: IphOficialData = {
  // Campos base de I_IPHById
  id: "GUGN01123060520252247",
  n_referencia: "GUGN01123060520252247",
  n_folio_sist: "2582393922",
  observaciones: "Caso prioritario por uso de arma de fuego",
  latitud: "20.913237209466967",
  longitud: "-100.74995748193386",
  hechos: "Se encontró en el cel rocolorado un cuerpo parcialmente fallecido por el accionamiento de disparos de una calibre 22 pistola hkp7 alrededor de las 17 horas rumbo a San Nicolás del Bravo",
  fecha_creacion: "2025-05-06T22:47:00Z",
  fecha_subida: "2025-05-07T08:30:00Z",
  
  // Relaciones tipadas
  primer_respondiente: primerRespondienteMock,
  estatus: estatusMock,
  tipo: tipoMock,
  
  // Campos extendidos con tipos específicos
  conocimiento_hecho: conocimientoHechoMock,
  lugar_intervencion: lugarIntervencionMock,
  narrativaHechos: narrativaHechosMock,
  detencion_pertenencias: detencionPertenenciasMock,
  cInspeccionVehiculo: inspeccionVehiculoMock,
  armas_objetos: armasObjetosMock,
  uso_fuerza: usoFuerzaMock,
  entrega_recepcion: entregaRecepcionMock,
  continuacion: continuacionMock,
  ruta_fotos_lugar: fotosLugarMock,
  disposicion_ofc: disposicionOficialMock,
  entrevistas: entrevistasMock
};

/**
 * Función helper para obtener IPH mock por ID
 */
export const getIphOficialMockById = (id: string): IphOficialData | null => {
  // En un escenario real, buscaría en un array de IPHs
  // Por ahora retorna el mock si el ID coincide
  if (id === iphOficialMockData.id) {
    return iphOficialMockData;
  }
  return null;
};

/**
 * Función helper para simular delay de red
 */
export const mockDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};