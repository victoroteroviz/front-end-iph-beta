import { API_BASE_URL } from "../../../../config/env.config";
import {HttpHelper} from "../../../../helper/http/http.helper";
import type { IRole } from "../../../../interfaces/role/role.interface";

const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    "Content-Type": "application/json"
  }
});

const url :string= "/api/roles";
export const getRoles = async (): Promise<IRole[]> => {
  const response = await http.get<IRole[]>(url);
  return response.data;
};