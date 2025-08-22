//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";
//+ Interfaces
import type { ISexosAllData } from "../../interfaces/catalogs/sexos.interface";

const url : string = '/api/sexo-web';

const http: HttpHelper = HttpHelper.getInstance(
  {
    baseURL: API_BASE_URL,
    timeout: 10000,
    retries: 3,
    defaultHeaders: {
      "Content-Type": "application/json"
    }
  }
);

export const getSexos = async (): Promise<ISexosAllData[]> => {
  try {
    const response = await http.get<ISexosAllData[]>(`${url}`);
    const sexos: ISexosAllData[] = response.data;
    return sexos;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getSexoById = async (id: string): Promise<ISexosAllData | null> => {
  try {
    const response = await http.get<ISexosAllData>(`${url}/${id}`);
    const sexo: ISexosAllData = response.data as ISexosAllData;
    return sexo;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
