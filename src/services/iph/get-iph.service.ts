//+ Helpers
import { HttpHelper } from "../../helper/http/http.helper";

//+ ENVIROMENT
import { API_BASE_URL } from "../../config/env.config";
import { API_BASE_ROUTES } from "../../config/routes.config";
//+Interfaces
import type { getIph } from "../../interfaces/request/iph/request-iph.service";
import type { IPaginatedIPH, I_IPHById } from "../../interfaces/iph/iph.interface";

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

export const getIphById = async (id: string): Promise<I_IPHById> => {
  const url: string = `${urlFather}/${id}`;
  try {
    const response = await http.get<I_IPHById>(url);
    const iphFound: I_IPHById = response.data;
    return iphFound;
  } catch (error) {
    throw new Error((error as Error).message || 'Error desconocido, habla con soporte');
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
