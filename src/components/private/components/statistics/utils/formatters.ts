/**
 * Utilidades para formateo de datos
 * Centraliza funciones de formateo para consistencia en el UI
 *
 * @module formatters
 * @version 1.0.0
 */

/**
 * Formatear número con separadores de miles
 *
 * @param num - Número a formatear
 * @param locale - Locale para formateo (default: 'es-MX')
 * @returns Número formateado con separadores
 *
 * @example
 * ```typescript
 * const formatted = formatearNumero(1234567);
 * // Returns: "1,234,567"
 * ```
 */
export const formatearNumero = (num: number, locale: string = 'es-MX'): string => {
  return num.toLocaleString(locale);
};

/**
 * Formatear fecha completa en español
 *
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada en formato largo con hora
 *
 * @example
 * ```typescript
 * const formatted = formatearFecha(new Date('2024-01-21T14:30:00'));
 * // Returns: "21 de enero de 2024, 14:30"
 * ```
 */
export const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short'
  });
};

/**
 * Formatear fecha solo con día, mes y año
 *
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada sin hora
 *
 * @example
 * ```typescript
 * const formatted = formatearFechaCorta(new Date('2024-01-21'));
 * // Returns: "21/01/2024"
 * ```
 */
export const formatearFechaCorta = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-MX');
};

/**
 * Formatear porcentaje con símbolo %
 *
 * @param valor - Valor del porcentaje (0-100)
 * @param decimales - Número de decimales (default: 1)
 * @returns Porcentaje formateado con símbolo
 *
 * @example
 * ```typescript
 * const formatted = formatearPorcentaje(75.5);
 * // Returns: "75.5%"
 * ```
 */
export const formatearPorcentaje = (valor: number, decimales: number = 1): string => {
  return `${valor.toFixed(decimales)}%`;
};

/**
 * Formatear porcentaje calculado automáticamente
 *
 * @param valor - Valor parcial
 * @param total - Valor total
 * @param decimales - Número de decimales (default: 1)
 * @returns Porcentaje formateado
 *
 * @example
 * ```typescript
 * const formatted = formatearPorcentajeCalculado(75, 100);
 * // Returns: "75.0%"
 * ```
 */
export const formatearPorcentajeCalculado = (
  valor: number,
  total: number,
  decimales: number = 1
): string => {
  if (total === 0) return '0.0%';
  const porcentaje = (valor / total) * 100;
  return `${porcentaje.toFixed(decimales)}%`;
};

/**
 * Formatear moneda en pesos mexicanos
 *
 * @param cantidad - Cantidad a formatear
 * @returns Cantidad formateada como moneda
 *
 * @example
 * ```typescript
 * const formatted = formatearMoneda(1234.56);
 * // Returns: "$1,234.56"
 * ```
 */
export const formatearMoneda = (cantidad: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(cantidad);
};

/**
 * Formatear número con decimales fijos
 *
 * @param num - Número a formatear
 * @param decimales - Número de decimales (default: 2)
 * @returns Número formateado con decimales
 *
 * @example
 * ```typescript
 * const formatted = formatearConDecimales(3.14159, 2);
 * // Returns: "3.14"
 * ```
 */
export const formatearConDecimales = (num: number, decimales: number = 2): string => {
  return num.toFixed(decimales);
};

/**
 * Formatear diferencia con signo + o -
 *
 * @param diferencia - Valor de diferencia
 * @returns Diferencia formateada con signo
 *
 * @example
 * ```typescript
 * const formatted = formatearDiferencia(25);
 * // Returns: "+25"
 *
 * const formatted2 = formatearDiferencia(-15);
 * // Returns: "-15"
 * ```
 */
export const formatearDiferencia = (diferencia: number): string => {
  if (diferencia > 0) {
    return `+${diferencia}`;
  }
  return `${diferencia}`;
};

/**
 * Formatear duración en formato legible
 *
 * @param milisegundos - Duración en milisegundos
 * @returns Duración formateada
 *
 * @example
 * ```typescript
 * const formatted = formatearDuracion(125000);
 * // Returns: "2m 5s"
 * ```
 */
export const formatearDuracion = (milisegundos: number): string => {
  const segundos = Math.floor(milisegundos / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);

  if (horas > 0) {
    const min = minutos % 60;
    return `${horas}h ${min}m`;
  }

  if (minutos > 0) {
    const seg = segundos % 60;
    return `${minutos}m ${seg}s`;
  }

  return `${segundos}s`;
};

/**
 * Formatear tamaño de archivo en formato legible
 *
 * @param bytes - Tamaño en bytes
 * @param decimales - Número de decimales (default: 2)
 * @returns Tamaño formateado (B, KB, MB, GB)
 *
 * @example
 * ```typescript
 * const formatted = formatearTamanoArchivo(1536000);
 * // Returns: "1.46 MB"
 * ```
 */
export const formatearTamanoArchivo = (bytes: number, decimales: number = 2): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimales))} ${sizes[i]}`;
};

/**
 * Formatear nombre de mes desde número
 *
 * @param mes - Número del mes (1-12)
 * @param formato - 'largo' o 'corto' (default: 'largo')
 * @returns Nombre del mes
 *
 * @example
 * ```typescript
 * const formatted = formatearNombreMes(1);
 * // Returns: "Enero"
 *
 * const formatted2 = formatearNombreMes(1, 'corto');
 * // Returns: "Ene"
 * ```
 */
export const formatearNombreMes = (
  mes: number,
  formato: 'largo' | 'corto' = 'largo'
): string => {
  const mesesLargos = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const mesesCortos = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const index = mes - 1;

  if (index < 0 || index > 11) {
    return 'Mes inválido';
  }

  return formato === 'largo' ? mesesLargos[index] : mesesCortos[index];
};

/**
 * Truncar texto con elipsis
 *
 * @param texto - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado
 *
 * @example
 * ```typescript
 * const truncated = truncarTexto("Este es un texto muy largo", 10);
 * // Returns: "Este es un..."
 * ```
 */
export const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) return texto;
  return `${texto.substring(0, maxLength)}...`;
};
