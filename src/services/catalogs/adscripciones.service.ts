
//+Helpers
import {HttpHelper} from "../../helper/http/http.helper";
//+Variables de entorno
import { API_BASE_URL } from "../../config/env.config";
//+ Interfaces para los servicios
import type { IAdscripcionWithInstitucion, IAdscripcion } from "../../interfaces/catalogs/adscripcion.interface";


const url: string =    `/api/adscripcion-web`;

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

export const getAdscripciones = async (): Promise<IAdscripcionWithInstitucion[]> => {
  const url: string = `${API_BASE_URL}/api/adscripcion-web`;
  try {
    const response = await http.get<IAdscripcionWithInstitucion[]>(url);
    const adscripciones: IAdscripcionWithInstitucion[] = response.data as IAdscripcionWithInstitucion[];
    return adscripciones;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const getAdscripcionById = async (id: string): Promise<IAdscripcion | null> => {
  const url: string = `${API_BASE_URL}/api/adscripcion-web/${id}`;
  try {
    const response = await http.get<IAdscripcion>(url);
    const adscripcion: IAdscripcion = response.data as IAdscripcion;
    return adscripcion;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const createAdscripcion = async (nombre: string, institucionId: number): Promise<IAdscripcion> => {
  const url: string = `${API_BASE_URL}/api/adscripcion-web`;
  try {
    const response = await http.post<IAdscripcion>(url, { nombre, institucionId });
    const adscripcionCreada: IAdscripcion = response.data as IAdscripcion;
    return adscripcionCreada;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
}

export const updateAdscripcion = async (id: string, nombre: string, institucionId: number): Promise<IAdscripcion> => {
  const url: string = `${API_BASE_URL}/api/adscripcion-web/${id}`;
  try {
    const response = await http.patch<IAdscripcion>(url, { nombre, institucionId });
    const adscripcionActualizada: IAdscripcion = response.data as IAdscripcion;
    return adscripcionActualizada;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};

export const deleteAdscripcion = async (id: string): Promise<void> => {
  const url: string = `${API_BASE_URL}/api/adscripcion-web/${id}`;
  try {
    await http.delete(url);
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
  }
};
