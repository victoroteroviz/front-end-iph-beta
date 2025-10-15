/**
 * Hook personalizado para manejar la carga de datos básicos de IPH en el modal de detalle
 *
 * @fileoverview Hook que encapsula la lógica de carga de datos básicos de IPH
 * cuando se hace clic en el icono del ojo en la tabla de historial.
 *
 * @version 1.0.0
 * @since 2024-01-29
 *
 * @author Sistema IPH Frontend
 */

import { useState, useEffect, useCallback } from 'react';

// Helpers
import { logInfo, logError, logDebug } from '../../../../../helper/log/logger.helper';
import { showError } from '../../../../../helper/notification/notification.helper';

// Services
import { getBasicDataByIphId } from '../../../../../services/iph-basic-data/get-basic-iph-data.service';

// Interfaces
import type { I_BasicDataDto } from '../../../../../interfaces/iph-basic-data';

/**
 * Parámetros del hook useDetalleIPH
 */
export interface UseDetalleIPHParams {
  /** ID del IPH a cargar */
  iphId: string | null;

  /** Flag para controlar si se debe cargar automáticamente */
  autoLoad?: boolean;
}

/**
 * Valor de retorno del hook useDetalleIPH
 */
export interface UseDetalleIPHReturn {
  /** Datos básicos del IPH cargados */
  datosBasicos: I_BasicDataDto | null;

  /** Indica si está cargando */
  loading: boolean;

  /** Mensaje de error si lo hay */
  error: string | null;

  /** Función para recargar los datos */
  refetch: () => Promise<void>;

  /** Función para limpiar los datos */
  clear: () => void;
}

/**
 * Hook personalizado para manejar la carga de datos básicos de IPH
 *
 * @param params - Parámetros del hook
 * @returns Estado y acciones del hook
 *
 * @example
 * ```typescript
 * const {
 *   datosBasicos,
 *   loading,
 *   error,
 *   refetch,
 *   clear
 * } = useDetalleIPH({
 *   iphId: '123e4567-e89b-12d3-a456-426614174000',
 *   autoLoad: true
 * });
 * ```
 */
export const useDetalleIPH = (params: UseDetalleIPHParams): UseDetalleIPHReturn => {
  const { iphId, autoLoad = true } = params;

  // ==================== ESTADO ====================

  const [datosBasicos, setDatosBasicos] = useState<I_BasicDataDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== FUNCIONES ====================

  /**
   * Carga los datos básicos del IPH desde el servicio
   */
  const loadDatosBasicos = useCallback(async () => {
    if (!iphId) {
      logDebug('useDetalleIPH', 'No hay ID de IPH para cargar');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logInfo('useDetalleIPH', 'Cargando datos básicos del IPH', { iphId });

      const datos = await getBasicDataByIphId(iphId);

      setDatosBasicos(datos);

      logInfo('useDetalleIPH', 'Datos básicos cargados exitosamente', {
        iphId,
        numero: datos.numero,
        tipoIph: datos.tipoIph,
        estatus: datos.estatus
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar datos básicos del IPH';

      logError('useDetalleIPH', errorMessage, {
        iphId,
        error,
        stack: error instanceof Error ? error.stack : undefined
      });

      setError(errorMessage);
      showError(`No se pudieron cargar los datos del IPH: ${errorMessage}`);

    } finally {
      setLoading(false);
    }
  }, [iphId]);

  /**
   * Limpia los datos cargados
   */
  const clear = useCallback(() => {
    logDebug('useDetalleIPH', 'Limpiando datos básicos');
    setDatosBasicos(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * Recarga los datos manualmente
   */
  const refetch = useCallback(async () => {
    logInfo('useDetalleIPH', 'Recarga manual solicitada');
    await loadDatosBasicos();
  }, [loadDatosBasicos]);

  // ==================== EFECTOS ====================

  /**
   * Efecto para cargar datos cuando cambia el iphId
   */
  useEffect(() => {
    if (autoLoad && iphId) {
      loadDatosBasicos();
    }

    // Limpiar al desmontar o cuando cambie el ID
    return () => {
      if (!iphId) {
        clear();
      }
    };
  }, [iphId, autoLoad, loadDatosBasicos, clear]);

  // ==================== RETURN ====================

  return {
    datosBasicos,
    loading,
    error,
    refetch,
    clear
  };
};

export default useDetalleIPH;
