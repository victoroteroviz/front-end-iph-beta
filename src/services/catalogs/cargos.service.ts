
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";
import type { ICargos, ICargosAllData } from "../../interfaces/catalogs/cargos.interface";

const url : string = '/api/cargos-web';

const http : HttpHelper = HttpHelper.getInstance(
  {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retries: 3,
    defaultHeaders:{
      "Content-Type": "application/json"
    }
  }
);

export const getCargos = async (): Promise<ICargos[]> => {
  try {
    const response = await http.get<ICargos[]>(`${url}`);
    const cargos: ICargos[] = response.data;
    return cargos;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
export const getCargoById = async (id: string): Promise<ICargosAllData | null> => {
  try {
    const response = await http.get<ICargosAllData>(`${url}/${id}`);
    const cargo: ICargosAllData = response.data as ICargosAllData;
    return cargo;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const createCargo = async (nombre: string): Promise<ICargosAllData> => {
  try {
    const response = await http.post<ICargosAllData>(`${url}`, { nombre });
    const cargoCreado: ICargosAllData = response.data as ICargosAllData;
    return cargoCreado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateCargo = async (id: string, nombre: string): Promise<ICargosAllData> => {
  try {
    const response = await http.patch<ICargosAllData>(`${url}/${id}`, { nombre });
    const cargoActualizado: ICargosAllData = response.data as ICargosAllData;
    return cargoActualizado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}