/**
 * Utilidades para cálculos estadísticos
 * Centraliza lógica de cálculos reutilizables
 *
 * @module calculosEstadisticos
 * @version 1.0.0
 */

/**
 * Calcular total combinado (con detenido + sin detenido)
 *
 * @param data - Datos con totales de detenidos y sin detenidos
 * @returns Total combinado
 *
 * @example
 * ```typescript
 * const total = calcularTotalCombinado({ totalConDetenido: 150, totalSinDetenido: 50 });
 * // Returns: 200
 * ```
 */
export const calcularTotalCombinado = (data: {
  totalConDetenido: number;
  totalSinDetenido: number;
}): number => {
  return data.totalConDetenido + data.totalSinDetenido;
};

/**
 * Calcular promedio diario anual
 *
 * @param totalAnual - Total anual de registros
 * @param dias - Número de días en el año (default: 365)
 * @returns Promedio diario redondeado
 *
 * @example
 * ```typescript
 * const promedio = calcularPromedioDiarioAnual(3650);
 * // Returns: 10
 * ```
 */
export const calcularPromedioDiarioAnual = (
  totalAnual: number,
  dias: number = 365
): number => {
  return Math.round(totalAnual / dias);
};

/**
 * Calcular promedio diario mensual
 *
 * @param totalMensual - Total mensual de registros
 * @param mes - Mes (1-12)
 * @param anio - Año
 * @returns Promedio diario del mes redondeado
 *
 * @example
 * ```typescript
 * const promedio = calcularPromedioDiarioMensual(310, 1, 2024);
 * // Returns: 10 (31 días en enero)
 * ```
 */
export const calcularPromedioDiarioMensual = (
  totalMensual: number,
  mes: number,
  anio: number
): number => {
  // Obtener número de días en el mes específico
  const diasEnMes = new Date(anio, mes, 0).getDate();
  return Math.round(totalMensual / diasEnMes);
};

/**
 * Calcular porcentaje de un valor respecto al total
 *
 * @param valor - Valor parcial
 * @param total - Valor total
 * @param decimales - Número de decimales (default: 1)
 * @returns Porcentaje calculado
 *
 * @example
 * ```typescript
 * const porcentaje = calcularPorcentaje(75, 100);
 * // Returns: 75.0
 * ```
 */
export const calcularPorcentaje = (
  valor: number,
  total: number,
  decimales: number = 1
): number => {
  if (total === 0) return 0;
  const porcentaje = (valor / total) * 100;
  return Number(porcentaje.toFixed(decimales));
};

/**
 * Calcular diferencia porcentual entre dos valores
 *
 * @param valorActual - Valor actual
 * @param valorAnterior - Valor anterior
 * @returns Diferencia porcentual (positivo = incremento, negativo = decremento)
 *
 * @example
 * ```typescript
 * const diferencia = calcularDiferenciaPorcentual(120, 100);
 * // Returns: 20 (incremento del 20%)
 * ```
 */
export const calcularDiferenciaPorcentual = (
  valorActual: number,
  valorAnterior: number
): number => {
  if (valorAnterior === 0) return 0;
  const diferencia = ((valorActual - valorAnterior) / valorAnterior) * 100;
  return Number(diferencia.toFixed(1));
};

/**
 * Calcular promedio de un array de números
 *
 * @param valores - Array de valores numéricos
 * @returns Promedio redondeado
 *
 * @example
 * ```typescript
 * const promedio = calcularPromedio([10, 20, 30, 40, 50]);
 * // Returns: 30
 * ```
 */
export const calcularPromedio = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  const suma = valores.reduce((acc, val) => acc + val, 0);
  return Math.round(suma / valores.length);
};

/**
 * Calcular mediana de un array de números
 *
 * @param valores - Array de valores numéricos
 * @returns Mediana
 *
 * @example
 * ```typescript
 * const mediana = calcularMediana([1, 3, 5, 7, 9]);
 * // Returns: 5
 * ```
 */
export const calcularMediana = (valores: number[]): number => {
  if (valores.length === 0) return 0;

  const sorted = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
};

/**
 * Calcular suma total de un array de números
 *
 * @param valores - Array de valores numéricos
 * @returns Suma total
 *
 * @example
 * ```typescript
 * const suma = calcularSuma([10, 20, 30]);
 * // Returns: 60
 * ```
 */
export const calcularSuma = (valores: number[]): number => {
  return valores.reduce((acc, val) => acc + val, 0);
};
