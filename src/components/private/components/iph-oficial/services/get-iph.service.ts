//+ Helpers
import { HttpHelper } from "../../../../../helper/http/http.helper";
import { logDebug } from "../../../../../helper/log/logger.helper";

//+ ENVIROMENT
import { API_BASE_URL } from "../../../../../config/env.config";
import { API_BASE_ROUTES } from "../../../../../config/routes.config";
//+Interfaces
import type { getIph } from "../../../../../interfaces/request/iph/request-iph.service";
import type { IPaginatedIPH, ResponseIphData, I_IphData, IDetencion, IUsoFuerza, IPrimerRespondiente, ILugarIntervencion } from "../../../../../interfaces/iph/iph.interface";

const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});
const urlFather: string = `/${API_BASE_ROUTES.IPH}`;

// =====================================================
// HELPERS PARA LIMPIEZA DE DATOS
// =====================================================

/**
 * Helper para campos numéricos que vienen como string
 * Valida que sea un número pero mantiene el tipo string
 * Convierte null a string vacío
 */
const parseNumericString = (value: string | undefined | null, fieldName: string): string | undefined => {
  // Convertir null a string vacío para la UI
  if (value === null) {
    logDebug('get-iph.service', `Campo numérico null convertido a string vacío`, {
      field: fieldName,
      originalValue: null,
      newValue: ''
    });
    return '';
  }
  
  if (!value || value === undefined) return undefined;
  
  const trimmedValue = value.trim();
  if (!/^\d+$/.test(trimmedValue)) {
    logDebug('get-iph.service', `Campo numérico inválido encontrado`, {
      field: fieldName,
      value: value,
      expected: 'Solo números',
      action: 'Devolviendo valor original'
    });
    return value; // Devolver valor original como solicitaste
  }
  
  return trimmedValue;
};

/**
 * Helper para booleanos que pueden ser undefined o null
 * Los convierte a false por defecto
 */
const normalizeBooleanField = (value: boolean | undefined | null): boolean => {
  return value ?? false;
};

/**
 * Helper para arrays que pueden venir en diferentes formatos
 * Maneja null convirtiéndolo a array vacío
 */
const normalizeArrayField = <T>(value: T[] | T | [] | undefined | null): T[] => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
};

/**
 * Helper para campos de texto que pueden ser null
 * Convierte null a string vacío para mejor UX
 */
const normalizeStringField = (value: string | undefined | null): string | undefined => {
  if (value === null) return '';
  return value;
};

/**
 * Función principal para limpiar todos los datos de respuesta
 */
const cleanResponseData = (data: ResponseIphData): ResponseIphData => {
  logDebug('get-iph.service', 'Iniciando limpieza de datos IPH', { hasIphData: !!data.iph });
  
  // Limpiar datos principales del IPH
  if (!Array.isArray(data.iph) && data.iph) {
    data.iph = cleanIphData(data.iph);
  }
  
  // Limpiar primer respondiente
  if (!Array.isArray(data.primerRespondiente) && data.primerRespondiente) {
    data.primerRespondiente = cleanPrimerRespondiente(data.primerRespondiente);
  }
  
  // Limpiar lugar intervención
  if (Array.isArray(data.lugarIntervencion)) {
    data.lugarIntervencion = data.lugarIntervencion.map(lugar => cleanLugarIntervencion(lugar));
  } else if (data.lugarIntervencion && !Array.isArray(data.lugarIntervencion)) {
    data.lugarIntervencion = cleanLugarIntervencion(data.lugarIntervencion);
  }
  
  // Limpiar detencion
  if (Array.isArray(data.detencion)) {
    data.detencion = data.detencion.map(detencion => cleanDetencion(detencion));
  } else if (data.detencion && !Array.isArray(data.detencion)) {
    data.detencion = cleanDetencion(data.detencion);
  }
  
  // Limpiar uso fuerza
  if (Array.isArray(data.usoFuerza)) {
    data.usoFuerza = data.usoFuerza.map(uso => cleanUsoFuerza(uso));
  } else if (data.usoFuerza && !Array.isArray(data.usoFuerza)) {
    data.usoFuerza = cleanUsoFuerza(data.usoFuerza);
  }
  
  // Limpiar inspección de vehículo
  if (Array.isArray(data.inspeccionVehiculo)) {
    data.inspeccionVehiculo = data.inspeccionVehiculo.map(inspeccion => cleanInspeccionVehiculo(inspeccion));
  } else if (data.inspeccionVehiculo && !Array.isArray(data.inspeccionVehiculo)) {
    data.inspeccionVehiculo = cleanInspeccionVehiculo(data.inspeccionVehiculo);
  }
  
  // Limpiar arma/objeto
  if (Array.isArray(data.armaObjeto)) {
    data.armaObjeto = data.armaObjeto.map(arma => cleanArmaObjeto(arma));
  } else if (data.armaObjeto && !Array.isArray(data.armaObjeto)) {
    data.armaObjeto = cleanArmaObjeto(data.armaObjeto);
  }
  
  // Limpiar entrevista
  if (Array.isArray(data.entrevista)) {
    data.entrevista = data.entrevista.map(entrevista => cleanEntrevista(entrevista));
  } else if (data.entrevista && !Array.isArray(data.entrevista)) {
    data.entrevista = cleanEntrevista(data.entrevista);
  }
  
  logDebug('get-iph.service', 'Limpieza de datos completada');
  return data;
};

/**
 * Limpiar datos principales del IPH
 */
const cleanIphData = (iph: I_IphData): I_IphData => {
  return {
    ...iph,
    // No limpiar id, nReferencia, nFolioSist porque pueden ser undefined legítimamente
  };
};

/**
 * Limpiar datos del primer respondiente
 */
const cleanPrimerRespondiente = (primer: IPrimerRespondiente): IPrimerRespondiente => {
  return {
    ...primer,
    nElementos: primer.nElementos // Mantener como number, no necesita limpieza
  };
};

/**
 * Limpiar datos del lugar de intervención
 */
const cleanLugarIntervencion = (lugar: ILugarIntervencion): ILugarIntervencion => {
  return {
    ...lugar,
    zoomNivel: lugar.zoomNivel, // Mantener como number
    // Limpiar campos booleanos
    rInspeccion: normalizeBooleanField(lugar.rInspeccion),
    eObjeto: normalizeBooleanField(lugar.eObjeto),
    preservo: normalizeBooleanField(lugar.preservo),
    priorizo: normalizeBooleanField(lugar.priorizo),
    riesgoNatural: normalizeBooleanField(lugar.riesgoNatural),
    riesgoSocial: normalizeBooleanField(lugar.riesgoSocial)
  };
};

/**
 * Limpiar datos de detencion
 */
const cleanDetencion = (detencion: IDetencion): IDetencion => {
  return {
    ...detencion,
    // Limpiar campo numérico que viene como string
    edad: parseNumericString(detencion.edad, 'detencion.edad'),
    // Limpiar campos de texto que pueden ser null
    telefonoConocido: normalizeStringField(detencion.telefonoConocido),
    calleDetencion: normalizeStringField(detencion.calleDetencion),
    numeroExteriorDetencion: normalizeStringField(detencion.numeroExteriorDetencion),
    numeroInteriorDetencion: normalizeStringField(detencion.numeroInteriorDetencion),
    referenciaDetencion: normalizeStringField(detencion.referenciaDetencion),
    tipoLugarTraslado: normalizeStringField(detencion.tipoLugarTraslado),
    // Limpiar pertenencias si existen
    pertenencias: detencion.pertenencias ? detencion.pertenencias.map(cleanDetencionPertenencia) : undefined,
    // Limpiar campos booleanos
    lecturaDerecho: normalizeBooleanField(detencion.lecturaDerecho),
    objetoEncontrado: normalizeBooleanField(detencion.objetoEncontrado),
    recolectoObjeto: normalizeBooleanField(detencion.recolectoObjeto),
    lugarDetencion: normalizeBooleanField(detencion.lugarDetencion)
  };
};

/**
 * Limpiar datos de uso de fuerza
 */
const cleanUsoFuerza = (uso: IUsoFuerza): IUsoFuerza => {
  return {
    ...uso,
    // Limpiar campos numéricos que vienen como string
    lesionadosAutoridad: parseNumericString(uso.lesionadosAutoridad, 'usoFuerza.lesionadosAutoridad'),
    lesionadosPersonas: parseNumericString(uso.lesionadosPersonas, 'usoFuerza.lesionadosPersonas'),
    fallecidosAutoridad: parseNumericString(uso.fallecidosAutoridad, 'usoFuerza.fallecidosAutoridad'),
    fallecidosPersonas: parseNumericString(uso.fallecidosPersonas, 'usoFuerza.fallecidosPersonas'),
    // Limpiar campos de texto que pueden ser null
    tipoGrupoDelictivo: normalizeStringField(uso.tipoGrupoDelictivo),
    tipoPadecimiento: normalizeStringField(uso.tipoPadecimiento),
    // Limpiar campos booleanos
    reduccionMovimiento: normalizeBooleanField(uso.reduccionMovimiento),
    usoArmaNoLetal: normalizeBooleanField(uso.usoArmaNoLetal),
    usoArmaLetal: normalizeBooleanField(uso.usoArmaLetal),
    asistenciaMedica: normalizeBooleanField(uso.asistenciaMedica)
  };
};

/**
 * Limpiar datos de inspección de vehículo
 */
const cleanInspeccionVehiculo = (inspeccion: any): any => {
  return {
    ...inspeccion,
    // Limpiar campos booleanos
    objetoEncontrado: normalizeBooleanField(inspeccion.objetoEncontrado)
  };
};

/**
 * Limpiar datos de arma/objeto
 */
const cleanArmaObjeto = (arma: any): any => {
  return {
    ...arma,
    // Limpiar campos de texto que pueden ser null
    lugarEncuentro: normalizeStringField(arma.lugarEncuentro),
    tipoArma: normalizeStringField(arma.tipoArma),
    calibreArma: normalizeStringField(arma.calibreArma),
    colorArma: normalizeStringField(arma.colorArma),
    matriculaArma: normalizeStringField(arma.matriculaArma),
    numeroSerieArma: normalizeStringField(arma.numeroSerieArma),
    primerApellidoAsegurado: normalizeStringField(arma.primerApellidoAsegurado),
    segundoApellidoAsegurado: normalizeStringField(arma.segundoApellidoAsegurado),
    nombreAsegurado: normalizeStringField(arma.nombreAsegurado),
    // Limpiar campos booleanos
    primerRespondiente: normalizeBooleanField(arma.primerRespondiente)
  };
};

/**
 * Limpiar datos de entrevista  
 */
const cleanEntrevista = (entrevista: any): any => {
  return {
    ...entrevista,
    // Limpiar campos de texto que pueden ser null
    tipoNacionalidad: normalizeStringField(entrevista.tipoNacionalidad),
    otroLugarCanalizacion: normalizeStringField(entrevista.otroLugarCanalizacion),
    motivoCanalizacion: normalizeStringField(entrevista.motivoCanalizacion),
    // Limpiar campos booleanos
    datosReservados: normalizeBooleanField(entrevista.datosReservados),
    traductor: normalizeBooleanField(entrevista.traductor)
  };
};

/**
 * Limpiar datos de detención pertenencia
 */
const cleanDetencionPertenencia = (pertenencia: any): any => {
  return {
    ...pertenencia,
    // Limpiar campos que pueden ser null
    estado: normalizeStringField(pertenencia.estado)
  };
};

export const getAllIph = async (params: getIph ={
  page: 1,
  orderBy: "estatus",
  order: "ASC",
  search: "",
  searchBy: "n_referencia"
}): Promise<IPaginatedIPH> => {
  // Construir URL base
  let url: string = `${urlFather}/paginated?page=${params.page}&orderBy=${params.orderBy}&order=${params.order}&search=${encodeURIComponent(params.search)}&searchBy=${params.searchBy}`;

  // Agregar parámetro type si está presente
  if (params.type && params.type.trim() !== '') {
    url += `&type=${encodeURIComponent(params.type)}`;
  }

  try {
    const response = await http.get<IPaginatedIPH>(url);
    const iphsFound: IPaginatedIPH = response.data;
    return iphsFound;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getIphById = async (id: string): Promise<ResponseIphData> => {
  // Validación del parámetro de entrada
  if (!id || id.trim() === '') {
    throw new Error('El ID del IPH es requerido');
  }

  const url: string = `${urlFather}/${encodeURIComponent(id)}`;
  
  try {
    const response = await http.get<ResponseIphData>(url);
    
    // Validación de la respuesta
    if (!response.data) {
      throw new Error('No se encontraron datos para el IPH solicitado');
    }

    const iphFound: ResponseIphData = response.data;
    
    // Validaciones opcionales de estructura crítica para la nueva estructura
    if (!iphFound.iph || (Array.isArray(iphFound.iph) && iphFound.iph.length === 0)) {
      console.warn('Datos principales del IPH no encontrados:', { iphData: iphFound.iph });
    }

    // Validar estructura básica si iph no es array vacío
    if (!Array.isArray(iphFound.iph) && iphFound.iph) {
      if (!iphFound.iph.id || !iphFound.iph.nReferencia) {
        console.warn('Campos críticos del IPH faltantes:', { 
          id: iphFound.iph.id, 
          referencia: iphFound.iph.nReferencia 
        });
      }
    }

    // Aplicar limpieza de datos con helpers
    const cleanedData = cleanResponseData(iphFound);

    return cleanedData;
  } catch (error) {
    // Manejo mejorado de errores
    if (error instanceof Error) {
      // Si es un error HTTP específico
      if (error.message.includes('404')) {
        throw new Error(`IPH con ID ${id} no encontrado`);
      }
      if (error.message.includes('403')) {
        throw new Error('No tienes permisos para acceder a este IPH');
      }
      if (error.message.includes('401')) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente');
      }
      if (error.message.includes('500')) {
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet');
      }
      
      throw new Error(error.message || 'Error al obtener el IPH');
    }
    
    throw new Error('Error desconocido al obtener el IPH. Contacta con soporte');
  }
}

export const getIphByUser = async(userId: string, params: getIph): Promise<IPaginatedIPH>=>{
  const url: string = `${urlFather}/getIphsByUser/${userId}?page=${params.page}&orderBy=${params.orderBy}&order=${params.order}&search=${encodeURIComponent(params.search)}&searchBy=${params.searchBy}`;
  try {
    const response = await http.get<IPaginatedIPH>(url);
    const iphFound: IPaginatedIPH = response.data;
    return iphFound;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
