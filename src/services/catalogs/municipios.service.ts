
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";

//+ Interfaces
import type { IMunicipioRequest, IMunicipios, IMunicipiosAllData } from "../../interfaces/catalogs/municipios.interface";

const url : string = '/api/municipios-web';

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

export const getMunicipios = async (): Promise<IMunicipiosAllData>=>{
  try {
    const response = await http.get<IMunicipiosAllData>(`${url}`);
    const municipios: IMunicipiosAllData = response.data;
    return municipios;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const getMunicipioById = async (id: string): Promise<IMunicipios | null> => {
  try {
    const response = await http.get<IMunicipios>(`${url}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const createMunicipio = async (municipio: IMunicipioRequest): Promise<IMunicipios> => {
  try {
    const response = await http.post<IMunicipios>(`${url}`, { ...municipio });
    const municipioCreado: IMunicipios = response.data as IMunicipios;
    return municipioCreado;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const updateMunicipio = async (id: string, municipio: IMunicipioRequest): Promise<IMunicipios | null> => {
  try {
    const response = await http.put<IMunicipios>(`${url}/${id}`, { ...municipio });
    return response.data;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const deleteMunicipio = async (id: string): Promise<boolean> => {
  try {
    await http.delete(`${url}/${id}`);
    return true;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};