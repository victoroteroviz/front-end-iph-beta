/**
 * Interfaces para el servicio de estatus IPH
 */

/**
 * Interface para un estatus individual por IPH
 */
export interface EstatusPorIph {
  estatus: string;
  cantidad: number;
}

/**
 * Tipo para un estatus general
 */
export type Estatus = string;

/**
 * Interface para los datos de respuesta del servicio estatus IPH
 */
export interface EstatusIphData {
  total: number;
  promedioPorDia: number;
  registroPorMes: number;
  estatusPorIph: EstatusPorIph[];
}

/**
 * Interface para la respuesta completa del API de estatus IPH
 */
export interface ResEstatusIph {
  status: boolean;
  message: string;
  data: EstatusIphData;
}

// ==========================================
// INTERFACES PARA IPH HISTORY ENDPOINT
// ==========================================

/**
 * Interface para las coordenadas de ubicación
 */
export interface Coordenadas {
  longitud: string;
  latitud: string;
}

/**
 * Interface para un registro individual del historial IPH
 */
export interface ResHistory {
  id: string;
  nReferencia: string;
  fechaCreacion: string;
  ubicacion: Coordenadas | undefined;
  tipoDelito: string | undefined;
  estatus: string;
  usuario: string;
}

/**
 * Interface para los parámetros de consulta del endpoint iph-history
 */
export interface QueryHistorialDto {
  pagina: number;
  ordernaPor?: 'fecha_creacion' | 'estatus' | 'tipoDelito' | 'usuario';
  orden?: 'ASC' | 'DESC';
  busqueda?: string;
  busquedaPor?: string;
  estatus?: string;
  tipoDelito?: string;
  usuario?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Interface para la respuesta completa del endpoint iph-history con metadatos de paginación
 */
export interface ResHistorialIphResponse {
  status: boolean;
  message: string;
  data: ResHistory[];
  meta: {
    total: number;
    pagina: number;
    itemsPorPagina: number;
    totalPaginas: number;
  };
}

/**
 * Interface para la respuesta del endpoint de opciones de estatus
 */
export interface ResEstatusOptions {
  status: boolean;
  message?: string;
  data: string[];
}