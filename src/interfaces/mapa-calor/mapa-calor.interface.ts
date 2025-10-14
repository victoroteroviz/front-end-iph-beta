/**
 * Interfaces para el módulo de Mapa de Calor
 * Basado en los DTOs de NestJS del backend
 */

/**
 * Coordenada con clustering para mapa de calor
 * Representa un punto o cluster de puntos en el mapa
 */
export interface I_CoordenadaCluster {
  /** Latitud del punto o centro del cluster */
  latitud: number;
  /** Longitud del punto o centro del cluster */
  longitud: number;
  /** Cantidad de puntos agrupados en este cluster */
  count: number;
}

/**
 * Límites geográficos para filtrar coordenadas
 * Define un rectángulo en el mapa
 */
export interface I_Bounds {
  /** Límite norte (latitud máxima) */
  north: number;
  /** Límite sur (latitud mínima) */
  south: number;
  /** Límite este (longitud máxima) */
  east: number;
  /** Límite oeste (longitud mínima) */
  west: number;
}

/**
 * Parámetros de consulta para obtener coordenadas
 * Incluye nivel de zoom y bounds opcionales
 */
export interface I_GetCoordenadasQuery {
  /** Nivel de zoom del mapa (1-20) */
  zoom: number;
  /** Límite norte (opcional) */
  north?: number;
  /** Límite sur (opcional) */
  south?: number;
  /** Límite este (opcional) */
  east?: number;
  /** Límite oeste (opcional) */
  west?: number;
}

/**
 * Parámetros completos con bounds estructurados
 * Útil para validación y tipado estricto
 */
export interface I_GetCoordenadasParams {
  /** Nivel de zoom del mapa (1-20) */
  zoom: number;
  /** Límites geográficos (opcional) */
  bounds?: I_Bounds;
}

/**
 * Respuesta del servicio de coordenadas
 * Array de clusters con metadata
 */
export interface I_MapaCalorResponse {
  /** Array de coordenadas clustered */
  coordenadas: I_CoordenadaCluster[];
  /** Nivel de zoom usado */
  zoom: number;
  /** Cantidad total de clusters devueltos */
  total: number;
  /** Bounds aplicados (si existen) */
  bounds?: I_Bounds;
}
