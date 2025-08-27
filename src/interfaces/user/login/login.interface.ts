export interface LoginRequest {
  correo_electronico: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}