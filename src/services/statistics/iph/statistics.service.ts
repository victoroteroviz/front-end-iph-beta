import { API_BASE_URL } from "../../../config/env.config";
import {HttpHelper} from "../../../helper/http/http.helper";
import { API_BASE_ROUTES } from "../../../config/routes.config";
//+interfaces 
import type {
   IVariacionResumen,
   IResumenPorTipo,
   IResumenPorSemana,
   IResumenPorMes
 } from "../../../interfaces/statistics/statistics.interface";
const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json"
  }
});

export const getResumenEstadisticas = async (year: number = new Date().getFullYear()): Promise<IResumenPorTipo> => {
  const url: string = `${API_BASE_URL}/${API_BASE_ROUTES.ESTADISTICAS}/getSummaryByType/${year}`;
  try {
    const response = await http.get<IResumenPorTipo>(url);
    const resumenEstadisticas: IResumenPorTipo = response.data;
    if (!resumenEstadisticas) throw new Error('No se encontró el resumen de estadísticas');
    return resumenEstadisticas;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

/**
 * 
 * 
 * @description Obtiene el resumen de variación para un año específico
 * @param year 
 * @param compareTo 
 * @returns 
 */
export const getVariacionResumen = async (year: number = new Date().getFullYear(), compareTo : number = year - 1): Promise<IVariacionResumen> =>
{
  const url : string = `${API_BASE_URL}/${API_BASE_ROUTES.ESTADISTICAS}/getTypeVariationSummary?year=${year}&compareTo=${compareTo}`;
  
  try {
   const response = await http.get<IVariacionResumen>(url);
   const variacionResumen : IVariacionResumen = response.data;
   if(!variacionResumen) throw new Error('No se encontró el resumen de variación');
   return variacionResumen;
} catch (error) {
   throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
 }
}


/**
 * @description Obtiene el resumen por semana a partir de un offset
 * @param offset 
 * @returns 
 */
export const getResumenPorSemana = async (offset: number = -1)=>{
  const url : string = `${API_BASE_URL}/${API_BASE_ROUTES.ESTADISTICAS}/getIphsGroupedByWeek/${offset}`;
  try {
   const response = await http.get<IResumenPorSemana>(url);
   const resumenPorSemana : IResumenPorSemana = response.data;
   if(!resumenPorSemana) throw new Error('No se encontró el resumen por semana');
   return resumenPorSemana;
} catch (error) {
   throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
 }
}

/**
 * @description Obtiene los resumenes por mes a partir de un año de entrada
 * @param year 
 * @returns 
 */
export const getResumenPorMes = async(year: number = new Date().getFullYear())=>{
  const url : string = `${API_BASE_URL}/${API_BASE_ROUTES.ESTADISTICAS}/getIphsGroupedByMonth/${year}`;
  try {
   const response = await http.get<IResumenPorMes>(url);
   const resumenPorMes : IResumenPorMes = response.data;
   if(!resumenPorMes) throw new Error('No se encontró el resumen por mes');
   return resumenPorMes;
} catch (error) {
   throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
 }
}