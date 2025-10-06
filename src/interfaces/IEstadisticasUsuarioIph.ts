export interface EstadisticasUsuarioIphAnual {
  nombre: string;
  apellido: string;
  cantidad_iph: number;
  anio: number;
}

export interface EstadisticasUsuarioIphMensual {
  nombre: string;
  apellido: string;
  cantidad_iph: number;
  anio: number;
  mes: number;
}

export interface EstadisticasUsuarioIphSemanal {
  nombre: string;
  apellido: string;
  cantidad_iph: number;
  anio: number;
  semana: number;
}

export interface EstadisticasUsuarioIphDiario {
  nombre: string;
  apellido: string;
  cantidad_iph: number;
  anio: number;
  mes: number;
  dia: number;
}

// Nueva interfaz unificada para las respuestas
export interface UsuarioEstadistica {
  usuario_id: string;
  nombre_completo: string;
  cantidad_iph: number;
  periodo?: {
    anio?: number;
    mes?: number;
    semana?: number;
    dia?: number;
  };
}

export interface RankingResponse {
  data: UsuarioEstadistica[];
  metadata: {
    total_usuarios: number;
    pagina_actual: number;
    total_paginas: number;
    limite: number;
    periodo: string;
    filtros_aplicados: {
      anio?: number;
      mes?: number;
      semana?: number;
      dia?: number;
      estatusId?: number;
      tipoId?: number;
    };
  };
}

export interface TotalesResponse {
  total_iphs: number;
  total_usuarios_creadores: number;
  promedio_iphs_por_usuario: number;
  periodo?: {
    anio?: number;
    mes?: number;
    semana?: number;
    dia?: number;
  };
  filtros_aplicados: {
    estatusId?: number;
    tipoId?: number;
  };
}

// Const assertions para tipos
export const PeriodoEnum = {
  ANUAL: 'anual',
  MENSUAL: 'mensual',
  SEMANAL: 'semanal',
  DIARIO: 'diario'
} as const;

export type PeriodoEnum = typeof PeriodoEnum[keyof typeof PeriodoEnum];

export const OrdenamientoEnum = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;

export type OrdenamientoEnum = typeof OrdenamientoEnum[keyof typeof OrdenamientoEnum];

// DTOs para las queries
export interface EstadisticasQueryDto {
  limite?: number;
  pagina?: number;
  periodo?: PeriodoEnum;
  anio?: number;
  mes?: number;
  semana?: number;
  dia?: number;
  estatusId?: number;
  tipoId?: number;
  ordenamiento?: OrdenamientoEnum;
}