
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";
import type { IGrados, IGradosAllData } from "../../interfaces/catalogs/grados.interface";

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

export const getGrados = async (): Promise<IGrados[]> => {
  try {
    const response = await http.get<IGrados[]>('/api/grados-web');
    const grados: IGrados[] = response.data;
    return grados;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getGradoById = async (id: string): Promise<IGrados | null> => {
  try {
    const response = await http.get<IGradosAllData>(`/api/grados-web/${id}`);
    const grado:  IGradosAllData= response.data;
    return grado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const createGrado = async (nombre: string): Promise<IGradosAllData> => {
  try {
    const response = await http.post<IGrados>('/api/grados-web', {nombre});
    const gradoCreado : IGradosAllData = response.data as IGradosAllData;
    return gradoCreado;

  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateGrado = async (id: string, nombre: string): Promise<IGradosAllData> => {
  try {
    const response = await http.patch<IGradosAllData>(`/api/grados-web/${id}`, {nombre});
    const gradoActualizado: IGradosAllData = response.data as IGradosAllData;
    return gradoActualizado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}
