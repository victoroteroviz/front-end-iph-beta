/**
 * @file estadisticas-jc.interface.ts
 * @description Interfaces para el servicio de estadísticas de Justicia Cívica
 * @module interfaces/estadisticas-jc
 */

/**
 * @interface RespuestaJC
 * @description Respuesta del backend para estadísticas de Justicia Cívica
 * Esta estructura es compartida por los tres endpoints:
 * - getJusticiaCivicaDiaria
 * - getJusticiaCivicaMensual
 * - getJusticiaCivicaAnual
 */
export interface RespuestaJC {
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
     * Total de casos con detenido
     */
    totalConDetenido: number;

    /**
     * Total de casos sin detenido
     */
    totalSinDetenido: number;
  };
}

/**
 * @interface ParamsJCDiaria
 * @description Parámetros para consulta diaria
 */
export interface ParamsJCDiaria {
  anio: number;
  mes: number;
  dia: number;
}

/**
 * @interface ParamsJCMensual
 * @description Parámetros para consulta mensual
 */
export interface ParamsJCMensual {
  anio: number;
  mes: number;
}

/**
 * @interface ParamsJCAnual
 * @description Parámetros para consulta anual
 */
export interface ParamsJCAnual {
  anio: number;
}
