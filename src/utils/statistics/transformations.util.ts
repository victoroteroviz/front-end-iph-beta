/**
 * @file transformations.util.ts
 * @description Utilidades de transformación de datos para el módulo de estadísticas
 * @author Claude Code
 * @version 1.0.0
 * @created 2025-01-30
 *
 * Funciones extraídas del mock para ser reutilizables en producción:
 * - Ordenamiento de datos por IPH count
 * - Transformaciones de datos de estadísticas
 * - Mapeo de estructuras de datos
 */

import type { IUsuarioIphCount } from '../../interfaces/statistics/statistics.interface';

// ============================================================================
// FUNCIONES DE ORDENAMIENTO
// ============================================================================

/**
 * @description Ordena un array de usuarios por total de IPHs de forma descendente (mayor a menor)
 * @param data - Array de usuarios con conteo de IPHs
 * @returns Array ordenado (modifica el array original)
 * @example
 * ```typescript
 * const usuarios = [{ nombre: 'Juan', total_iphs: 10 }, { nombre: 'Ana', total_iphs: 20 }];
 * sortByIphCountDesc(usuarios);
 * // → [{ nombre: 'Ana', total_iphs: 20 }, { nombre: 'Juan', total_iphs: 10 }]
 * ```
 */
export const sortByIphCountDesc = (data: IUsuarioIphCount[]): IUsuarioIphCount[] => {
  return data.sort((a, b) => b.total_iphs - a.total_iphs);
};

/**
 * @description Ordena un array de usuarios por total de IPHs de forma ascendente (menor a mayor)
 * @param data - Array de usuarios con conteo de IPHs
 * @returns Array ordenado (modifica el array original)
 * @example
 * ```typescript
 * const usuarios = [{ nombre: 'Juan', total_iphs: 20 }, { nombre: 'Ana', total_iphs: 10 }];
 * sortByIphCountAsc(usuarios);
 * // → [{ nombre: 'Ana', total_iphs: 10 }, { nombre: 'Juan', total_iphs: 20 }]
 * ```
 */
export const sortByIphCountAsc = (data: IUsuarioIphCount[]): IUsuarioIphCount[] => {
  return data.sort((a, b) => a.total_iphs - b.total_iphs);
};

/**
 * @description Ordena un array de usuarios por nombre alfabéticamente
 * @param data - Array de usuarios con conteo de IPHs
 * @returns Array ordenado (modifica el array original)
 * @example
 * ```typescript
 * const usuarios = [{ nombre: 'Zoe', total_iphs: 10 }, { nombre: 'Ana', total_iphs: 20 }];
 * sortByNameAlpha(usuarios);
 * // → [{ nombre: 'Ana', total_iphs: 20 }, { nombre: 'Zoe', total_iphs: 10 }]
 * ```
 */
export const sortByNameAlpha = (data: IUsuarioIphCount[]): IUsuarioIphCount[] => {
  return data.sort((a, b) =>
    a.nombre_completo.localeCompare(b.nombre_completo, 'es-MX')
  );
};

// ============================================================================
// FUNCIONES DE CÁLCULO DE ESTADÍSTICAS
// ============================================================================

/**
 * @interface IStatisticsSummary
 * @description Resumen de estadísticas calculadas a partir de datos de usuarios
 */
export interface IStatisticsSummary {
  /** Total acumulado de IPHs de todos los usuarios */
  totalIphs: number;
  /** Promedio de IPHs por usuario (redondeado a 2 decimales) */
  promedioIphs: number;
  /** Máximo número de IPHs de un solo usuario */
  maxIphs: number;
  /** Mínimo número de IPHs de un solo usuario */
  minIphs: number;
  /** Total de usuarios en el dataset */
  totalUsuarios: number;
}

/**
 * @description Calcula estadísticas generales a partir de un array de usuarios con IPH count
 * @param data - Array de usuarios con conteo de IPHs
 * @returns Objeto con estadísticas calculadas
 * @example
 * ```typescript
 * const usuarios = [
 *   { nombre: 'Juan', total_iphs: 45 },
 *   { nombre: 'Ana', total_iphs: 30 }
 * ];
 * const stats = calculateStatisticsSummary(usuarios);
 * // → { totalIphs: 75, promedioIphs: 37.5, maxIphs: 45, minIphs: 30, totalUsuarios: 2 }
 * ```
 */
export const calculateStatisticsSummary = (data: IUsuarioIphCount[]): IStatisticsSummary => {
  if (!data || data.length === 0) {
    return {
      totalIphs: 0,
      promedioIphs: 0,
      maxIphs: 0,
      minIphs: 0,
      totalUsuarios: 0
    };
  }

  const totalIphs = data.reduce((sum, user) => sum + user.total_iphs, 0);
  const promedioIphs = totalIphs / data.length;
  const maxIphs = Math.max(...data.map(u => u.total_iphs));
  const minIphs = Math.min(...data.map(u => u.total_iphs));

  return {
    totalIphs,
    promedioIphs: Math.round(promedioIphs * 100) / 100, // Redondear a 2 decimales
    maxIphs,
    minIphs,
    totalUsuarios: data.length
  };
};

/**
 * @description Calcula el percentil de un usuario en base a su total de IPHs
 * @param usuario - Usuario a evaluar
 * @param todosLosUsuarios - Array completo de usuarios para comparación
 * @returns Percentil del usuario (0-100)
 * @example
 * ```typescript
 * const juan = { nombre: 'Juan', total_iphs: 40 };
 * const usuarios = [
 *   { nombre: 'Ana', total_iphs: 20 },
 *   juan,
 *   { nombre: 'Pedro', total_iphs: 50 }
 * ];
 * const percentil = calculateUserPercentile(juan, usuarios);
 * // → 66.67 (Juan está por encima del 66.67% de usuarios)
 * ```
 */
export const calculateUserPercentile = (
  usuario: IUsuarioIphCount,
  todosLosUsuarios: IUsuarioIphCount[]
): number => {
  if (!todosLosUsuarios || todosLosUsuarios.length === 0) return 0;

  const usuariosMenores = todosLosUsuarios.filter(
    u => u.total_iphs < usuario.total_iphs
  ).length;

  const percentil = (usuariosMenores / todosLosUsuarios.length) * 100;
  return Math.round(percentil * 100) / 100; // Redondear a 2 decimales
};

// ============================================================================
// FUNCIONES DE AGRUPACIÓN Y FILTRADO
// ============================================================================

/**
 * @description Agrupa usuarios por rangos de IPHs
 * @param data - Array de usuarios con conteo de IPHs
 * @param rangeSize - Tamaño de cada rango (por defecto: 10)
 * @returns Objeto con rangos como claves y arrays de usuarios como valores
 * @example
 * ```typescript
 * const usuarios = [
 *   { nombre: 'Juan', total_iphs: 5 },
 *   { nombre: 'Ana', total_iphs: 15 },
 *   { nombre: 'Pedro', total_iphs: 25 }
 * ];
 * const grouped = groupByIphRange(usuarios, 10);
 * // → {
 * //   '0-9': [{ nombre: 'Juan', total_iphs: 5 }],
 * //   '10-19': [{ nombre: 'Ana', total_iphs: 15 }],
 * //   '20-29': [{ nombre: 'Pedro', total_iphs: 25 }]
 * // }
 * ```
 */
export const groupByIphRange = (
  data: IUsuarioIphCount[],
  rangeSize: number = 10
): Record<string, IUsuarioIphCount[]> => {
  const grouped: Record<string, IUsuarioIphCount[]> = {};

  data.forEach(usuario => {
    const rangeStart = Math.floor(usuario.total_iphs / rangeSize) * rangeSize;
    const rangeEnd = rangeStart + rangeSize - 1;
    const rangeKey = `${rangeStart}-${rangeEnd}`;

    if (!grouped[rangeKey]) {
      grouped[rangeKey] = [];
    }
    grouped[rangeKey].push(usuario);
  });

  return grouped;
};

/**
 * @description Filtra usuarios que cumplan con un mínimo de IPHs
 * @param data - Array de usuarios con conteo de IPHs
 * @param minIphs - Mínimo de IPHs requerido
 * @returns Array filtrado de usuarios
 * @example
 * ```typescript
 * const usuarios = [
 *   { nombre: 'Juan', total_iphs: 5 },
 *   { nombre: 'Ana', total_iphs: 15 }
 * ];
 * const filtrados = filterByMinIphs(usuarios, 10);
 * // → [{ nombre: 'Ana', total_iphs: 15 }]
 * ```
 */
export const filterByMinIphs = (
  data: IUsuarioIphCount[],
  minIphs: number
): IUsuarioIphCount[] => {
  return data.filter(usuario => usuario.total_iphs >= minIphs);
};

/**
 * @description Obtiene el top N usuarios con más IPHs
 * @param data - Array de usuarios con conteo de IPHs
 * @param topN - Cantidad de usuarios a obtener (por defecto: 10)
 * @returns Array con los top N usuarios ordenados descendentemente
 * @example
 * ```typescript
 * const usuarios = [
 *   { nombre: 'Juan', total_iphs: 45 },
 *   { nombre: 'Ana', total_iphs: 30 },
 *   { nombre: 'Pedro', total_iphs: 50 }
 * ];
 * const top2 = getTopPerformers(usuarios, 2);
 * // → [{ nombre: 'Pedro', total_iphs: 50 }, { nombre: 'Juan', total_iphs: 45 }]
 * ```
 */
export const getTopPerformers = (
  data: IUsuarioIphCount[],
  topN: number = 10
): IUsuarioIphCount[] => {
  const sorted = [...data].sort((a, b) => b.total_iphs - a.total_iphs);
  return sorted.slice(0, topN);
};

// ============================================================================
// FUNCIONES DE MAPEO Y TRANSFORMACIÓN DE DATOS
// ============================================================================

/**
 * @description Calcula el porcentaje de contribución de cada usuario al total de IPHs
 * @param data - Array de usuarios con conteo de IPHs
 * @returns Array con usuarios extendidos con campo de porcentaje
 * @example
 * ```typescript
 * const usuarios = [
 *   { nombre: 'Juan', total_iphs: 40 },
 *   { nombre: 'Ana', total_iphs: 60 }
 * ];
 * const conPorcentaje = addPercentageContribution(usuarios);
 * // → [
 * //   { nombre: 'Juan', total_iphs: 40, percentage: 40 },
 * //   { nombre: 'Ana', total_iphs: 60, percentage: 60 }
 * // ]
 * ```
 */
export const addPercentageContribution = (
  data: IUsuarioIphCount[]
): Array<IUsuarioIphCount & { percentage: number }> => {
  const total = data.reduce((sum, user) => sum + user.total_iphs, 0);

  if (total === 0) {
    return data.map(user => ({ ...user, percentage: 0 }));
  }

  return data.map(user => ({
    ...user,
    percentage: Math.round((user.total_iphs / total) * 100 * 100) / 100 // 2 decimales
  }));
};
