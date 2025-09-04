//+ Helpers
import { HttpHelper } from "../../helper/http/http.helper";

//+ ENVIROMENT
import { API_BASE_URL } from "../../config/env.config";
import { API_BASE_ROUTES } from "../../config/routes.config";
//+Interfaces
import type { getIph } from "../../interfaces/request/iph/request-iph.service";
import type { IPaginatedIPH, ResponseIphData } from "../../interfaces/iph/iph.interface";

const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json",
  },
});
const urlFather: string = `${API_BASE_URL}/${API_BASE_ROUTES.IPH}`;

export const getAllIph = async (params: getIph ={
  page: 1,
  orderBy: "estatus",
  order: "ASC",
  search: "",
  searchBy: "n_referencia"
}): Promise<IPaginatedIPH> => {
  const url: string = `${urlFather}/paginated?page=${params.page}&orderBy=${params.orderBy}&order=${params.order}&search=${encodeURIComponent(params.search)}&searchBy=${params.searchBy}`;

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

    return iphFound;
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

export const getIphByUser = async(userId: number, params: getIph): Promise<IPaginatedIPH>=>{
  const url: string = `${urlFather}/getIphsByUser/${userId}?page=${params.page}&orderBy=${params.orderBy}&order=${params.order}&search=${encodeURIComponent(params.search)}&searchBy=${params.searchBy}`;
  try {
    const response = await http.get<IPaginatedIPH>(url);
    const iphFound: IPaginatedIPH = response.data;
    return iphFound;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
