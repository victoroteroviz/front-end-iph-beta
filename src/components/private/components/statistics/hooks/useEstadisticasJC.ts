/**
 * Hook personalizado para estadísticas de Justicia Cívica
 * Maneja la lógica de negocio para consultas diarias, mensuales y anuales
 *
 * @pattern Custom Hook - Separación de lógica y presentación
 * @uses getJusticiaCivicaDiaria, getJusticiaCivicaMensual, getJusticiaCivicaAnual
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getJusticiaCivicaDiaria,
  getJusticiaCivicaMensual,
  getJusticiaCivicaAnual
} from '../services/get-jc.service';
import type {
  RespuestaJC,
  ParamsJCDiaria,
  ParamsJCMensual,
  ParamsJCAnual
} from '../../../../../interfaces/estadisticas-jc';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';

/**
 * Tipo de período para las estadísticas
 */
export type TipoPeriodo = 'diaria' | 'mensual' | 'anual';

/**
 * Estado de las estadísticas JC
 */
interface EstadisticasJCState {
  diaria: RespuestaJC | null;
  mensual: RespuestaJC | null;
  anual: RespuestaJC | null;
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
 * Hook para manejar estadísticas de Justicia Cívica
 */
export const useEstadisticasJC = () => {
  // Estados de datos
  const [estadisticas, setEstadisticas] = useState<EstadisticasJCState>({
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
  const obtenerEstadisticasDiarias = useCallback(async (params: ParamsJCDiaria) => {
    logInfo('useEstadisticasJC', 'Obteniendo estadísticas diarias', params);

    setLoading(prev => ({ ...prev, diaria: true }));
    setError(prev => ({ ...prev, diaria: null }));

    try {
      const resultado = await getJusticiaCivicaDiaria(params);
      setEstadisticas(prev => ({ ...prev, diaria: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas diarias';
      setError(prev => ({ ...prev, diaria: mensaje }));
      logError('useEstadisticasJC', err, 'Error en estadísticas diarias');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, diaria: false }));
    }
  }, []);

  /**
   * Obtener estadísticas mensuales
   */
  const obtenerEstadisticasMensuales = useCallback(async (params: ParamsJCMensual) => {
    logInfo('useEstadisticasJC', 'Obteniendo estadísticas mensuales', params);

    setLoading(prev => ({ ...prev, mensual: true }));
    setError(prev => ({ ...prev, mensual: null }));

    try {
      const resultado = await getJusticiaCivicaMensual(params);
      setEstadisticas(prev => ({ ...prev, mensual: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas mensuales';
      setError(prev => ({ ...prev, mensual: mensaje }));
      logError('useEstadisticasJC', err, 'Error en estadísticas mensuales');
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, mensual: false }));
    }
  }, []);

  /**
   * Obtener estadísticas anuales
   */
  const obtenerEstadisticasAnuales = useCallback(async (params: ParamsJCAnual) => {
    logInfo('useEstadisticasJC', 'Obteniendo estadísticas anuales', params);

    setLoading(prev => ({ ...prev, anual: true }));
    setError(prev => ({ ...prev, anual: null }));

    try {
      const resultado = await getJusticiaCivicaAnual(params);
      setEstadisticas(prev => ({ ...prev, anual: resultado }));
      return resultado;
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al obtener estadísticas anuales';
      setError(prev => ({ ...prev, anual: mensaje }));
      logError('useEstadisticasJC', err, 'Error en estadísticas anuales');
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
    logInfo('useEstadisticasJC', 'Obteniendo todas las estadísticas', fechaSeleccionada);

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
      logError('useEstadisticasJC', err, 'Error al obtener todas las estadísticas');
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
  const calcularTotalGeneral = useCallback((datos: RespuestaJC | null): number => {
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
