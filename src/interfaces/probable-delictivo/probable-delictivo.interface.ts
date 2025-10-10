/**
 * @file probable-delictivo.interface.ts
 * @description Interfaces para el servicio de estadísticas de Probable Delictivo
 * @module interfaces/probable-delictivo
 */

/**
 * @interface RespuestaProbableDelictivo
 * @description Respuesta del backend para estadísticas de Probable Delictivo
 * Esta estructura es compartida por los tres endpoints:
 * - getProbableDelictivoDiario
 * - getProbableDelictivoMensual
 * - getProbableDelictivoAnual
 *
 * @note Esta interfaz utiliza la misma estructura que RespuestaJC
 */
export interface RespuestaProbableDelictivo {
  /**
   * Indica si la petición fue exitosa
   */
  status: boolean;

  /**
   * Mensaje descriptivo de la respuesta
   */
  message: string;

  /**
   * Datos de las estadísticas
   */
  data: {
    /**
     * Total de casos probablemente delictivos con detenido
     */
    totalConDetenido: number;

    /**
     * Total de casos probablemente delictivos sin detenido
     */
    totalSinDetenido: number;
  };
}

/**
 * @interface ParamsProbableDelictivoDiario
 * @description Parámetros para consulta diaria de probable delictivo
 */
export interface ParamsProbableDelictivoDiario {
  anio: number;
  mes: number;
  dia: number;
}

/**
 * @interface ParamsProbableDelictivoMensual
 * @description Parámetros para consulta mensual de probable delictivo
 */
export interface ParamsProbableDelictivoMensual {
  anio: number;
  mes: number;
}

/**
 * @interface ParamsProbableDelictivoAnual
 * @description Parámetros para consulta anual de probable delictivo
 */
export interface ParamsProbableDelictivoAnual {
  anio: number;
}
