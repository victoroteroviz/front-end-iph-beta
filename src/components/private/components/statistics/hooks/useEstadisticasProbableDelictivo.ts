/**
 * Hook personalizado para estadísticas de Probable Delictivo
 * Maneja la lógica de negocio para consultas diarias, mensuales y anuales
 *
 * @pattern Custom Hook - Separación de lógica y presentación
 * @uses getProbableDelictivoDiario, getProbableDelictivoMensual, getProbableDelictivoAnual
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getProbableDelictivoDiario,
  getProbableDelictivoMensual,
  getProbableDelictivoAnual
} from '../services/probable-delictivo.service';
import type {
  RespuestaProbableDelictivo,
  ParamsProbableDelictivoDiario,
  ParamsProbableDelictivoMensual,
  ParamsProbableDelictivoAnual
} from '../../../../../interfaces/probable-delictivo';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';

/**
 * Tipo de período para las estadísticas
 */
export type TipoPeriodo = 'diaria' | 'mensual' | 'anual';

/**
 * Estado de las estadísticas Probable Delictivo
 */
interface EstadisticasProbableDelictivoState {
  diaria: RespuestaProbableDelictivo | null;
  mensual: RespuestaProbableDelictivo | null;
  anual: RespuestaProbableDelictivo | null;
}

/**
 * Estado de carga por tipo
 */
interface LoadingState {
  diaria: boolean;
  mensual: boolean;
  anual: boolean;
}

/**
 * Estado de errores por tipo
 */
interface ErrorState {
  diaria: string | null;
  mensual: string | null;
  anual: string | null;
}

/**
 * Hook para manejar estadísticas de Probable Delictivo
 */
export const useEstadisticasProbableDelictivo = () => {
  // Estados de datos
  const [estadisticas, setEstadisticas] = useState<EstadisticasProbableDelictivoState>({
    diaria: null,
    mensual: null,
    anual: null
  });

  // Estados de carga
  const [loading, setLoading] = useState<LoadingState>({
    diaria: false,
    mensual: false,
    anual: false
  });

  // Estados de error
  const [error, setError] = useState<ErrorState>({
    diaria: null,
    mensual: null,
    anual: null
  });

  // Fecha actual para inicialización
  const fechaActual = new Date();
  const [fechaSeleccionada, setFechaSeleccionada] = useState({
    anio: fechaActual.getFullYear(),
    mes: fechaActual.getMonth() + 1, // getMonth() retorna 0-11
    dia: fechaActual.getDate()
  });

  /**
   * Obtener estadísticas diarias
   */
  const obtenerEstadisticasDiarias = useCallback(async (params: ParamsProbableDelictivoDiario) => {
    logInfo('useEstadisticasProbableDelictivo', 'Obteniendo estadísticas diarias', params);

    setLoading(prev => ({ ...prev, diaria: true }));
    setError(prev => ({ ...prev, diaria: null }));

    try {
      const resultado = await getProbableDelictivoDiario(params);
      setEstadisticas(prev => ({ ...prev, diaria: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas diarias';
      setError(prev => ({ ...prev, diaria: mensaje }));
      logError('useEstadisticasProbableDelictivo', err, 'Error en estadísticas diarias');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, diaria: false }));
    }
  }, []);

  /**
   * Obtener estadísticas mensuales
   */
  const obtenerEstadisticasMensuales = useCallback(async (params: ParamsProbableDelictivoMensual) => {
    logInfo('useEstadisticasProbableDelictivo', 'Obteniendo estadísticas mensuales', params);

    setLoading(prev => ({ ...prev, mensual: true }));
    setError(prev => ({ ...prev, mensual: null }));

    try {
      const resultado = await getProbableDelictivoMensual(params);
      setEstadisticas(prev => ({ ...prev, mensual: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas mensuales';
      setError(prev => ({ ...prev, mensual: mensaje }));
      logError('useEstadisticasProbableDelictivo', err, 'Error en estadísticas mensuales');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, mensual: false }));
    }
  }, []);

  /**
   * Obtener estadísticas anuales
   */
  const obtenerEstadisticasAnuales = useCallback(async (params: ParamsProbableDelictivoAnual) => {
    logInfo('useEstadisticasProbableDelictivo', 'Obteniendo estadísticas anuales', params);

    setLoading(prev => ({ ...prev, anual: true }));
    setError(prev => ({ ...prev, anual: null }));

    try {
      const resultado = await getProbableDelictivoAnual(params);
      setEstadisticas(prev => ({ ...prev, anual: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas anuales';
      setError(prev => ({ ...prev, anual: mensaje }));
      logError('useEstadisticasProbableDelictivo', err, 'Error en estadísticas anuales');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, anual: false }));
    }
  }, []);

  /**
   * Actualizar fecha seleccionada
   */
  const actualizarFecha = useCallback((anio?: number, mes?: number, dia?: number) => {
    setFechaSeleccionada(prev => ({
      anio: anio ?? prev.anio,
      mes: mes ?? prev.mes,
      dia: dia ?? prev.dia
    }));
  }, []);

  /**
   * Obtener todas las estadísticas (diaria, mensual, anual) en paralelo
   */
  const obtenerTodasLasEstadisticas = useCallback(async () => {
    logInfo('useEstadisticasProbableDelictivo', 'Obteniendo todas las estadísticas', fechaSeleccionada);

    try {
      await Promise.all([
        obtenerEstadisticasDiarias(fechaSeleccionada),
        obtenerEstadisticasMensuales({
          anio: fechaSeleccionada.anio,
          mes: fechaSeleccionada.mes
        }),
        obtenerEstadisticasAnuales({ anio: fechaSeleccionada.anio })
      ]);
    } catch (err) {
      logError('useEstadisticasProbableDelictivo', err, 'Error al obtener todas las estadísticas');
    }
  }, [fechaSeleccionada, obtenerEstadisticasDiarias, obtenerEstadisticasMensuales, obtenerEstadisticasAnuales]);

  /**
   * Limpiar estadísticas de un tipo específico
   */
  const limpiarEstadisticas = useCallback((tipo: TipoPeriodo) => {
    setEstadisticas(prev => ({ ...prev, [tipo]: null }));
    setError(prev => ({ ...prev, [tipo]: null }));
  }, []);

  /**
   * Limpiar todas las estadísticas
   */
  const limpiarTodasLasEstadisticas = useCallback(() => {
    setEstadisticas({
      diaria: null,
      mensual: null,
      anual: null
    });
    setError({
      diaria: null,
      mensual: null,
      anual: null
    });
  }, []);

  /**
   * Calcular total general (con + sin detenido)
   */
  const calcularTotalGeneral = useCallback((datos: RespuestaProbableDelictivo | null): number => {
    if (!datos) return 0;
    return datos.data.totalConDetenido + datos.data.totalSinDetenido;
  }, []);

  /**
   * Verificar si hay datos cargados
   */
  const hayDatosCargados = useCallback((tipo: TipoPeriodo): boolean => {
    return estadisticas[tipo] !== null;
  }, [estadisticas]);

  /**
   * Verificar si está cargando alguna estadística
   */
  const estaCargandoAlguna = useCallback((): boolean => {
    return loading.diaria || loading.mensual || loading.anual;
  }, [loading]);

  /**
   * Obtener mensaje de error combinado
   */
  const obtenerMensajeError = useCallback((): string | null => {
    const errores = [error.diaria, error.mensual, error.anual].filter(Boolean);
    return errores.length > 0 ? errores[0] : null;
  }, [error]);

  // Cargar estadísticas iniciales al montar el componente
  useEffect(() => {
    obtenerTodasLasEstadisticas();
  }, [obtenerTodasLasEstadisticas]);

  return {
    // Estados
    estadisticas,
    loading,
    error,
    fechaSeleccionada,

    // Funciones de consulta
    obtenerEstadisticasDiarias,
    obtenerEstadisticasMensuales,
    obtenerEstadisticasAnuales,
    obtenerTodasLasEstadisticas,

    // Funciones de manipulación
    actualizarFecha,
    limpiarEstadisticas,
    limpiarTodasLasEstadisticas,

    // Utilidades
    calcularTotalGeneral,
    hayDatosCargados,
    estaCargandoAlguna,
    obtenerMensajeError
  };
};
