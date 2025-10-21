/**
 * Hook personalizado para manejar lógica del modal de estadísticas
 * Centraliza el manejo de estado y eventos del modal
 *
 * @module useStatisticsModal
 * @version 1.0.0
 * @pattern Custom Hook - Separación de lógica de UI
 */

import { useState, useCallback } from 'react';
import type { IStatisticCard } from '../../../../../interfaces/IStatistic';
import { logDebug, logWarning } from '../../../../../helper/log/logger.helper';

/**
 * Valor de retorno del hook
 */
export interface UseStatisticsModalReturn {
  /** Estadística actualmente seleccionada */
  selectedStat: IStatisticCard | null;
  /** Estado de apertura del modal */
  isModalOpen: boolean;
  /** Handler para click en tarjeta de estadística */
  handleCardClick: (stat: IStatisticCard) => void;
  /** Handler para cerrar modal */
  handleCloseModal: () => void;
}

/**
 * Configuración opcional del hook
 */
export interface UseStatisticsModalConfig {
  /** Delay antes de limpiar estadística seleccionada al cerrar (ms) */
  closeDelay?: number;
  /** Callback cuando se abre el modal */
  onOpen?: (stat: IStatisticCard) => void;
  /** Callback cuando se cierra el modal */
  onClose?: () => void;
  /** Habilitar logging de debug */
  enableDebugLogs?: boolean;
}

/**
 * Hook para manejar el modal de estadísticas
 *
 * @param config - Configuración opcional
 * @returns Objeto con estado y handlers del modal
 *
 * @example
 * ```typescript
 * const { selectedStat, isModalOpen, handleCardClick, handleCloseModal } = useStatisticsModal({
 *   closeDelay: 300,
 *   onOpen: (stat) => console.log('Modal abierto:', stat.titulo)
 * });
 *
 * // En el JSX
 * <StatCard onClick={() => handleCardClick(stat)} />
 * <Modal isOpen={isModalOpen} onClose={handleCloseModal} data={selectedStat} />
 * ```
 */
export const useStatisticsModal = (
  config: UseStatisticsModalConfig = {}
): UseStatisticsModalReturn => {
  const {
    closeDelay = 300,
    onOpen,
    onClose,
    enableDebugLogs = false
  } = config;

  // Estado de la estadística seleccionada
  const [selectedStat, setSelectedStat] = useState<IStatisticCard | null>(null);

  // Estado de apertura del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Manejar clic en tarjeta de estadística
   * Solo abre el modal si la estadística está habilitada
   */
  const handleCardClick = useCallback((stat: IStatisticCard) => {
    if (stat.habilitado) {
      setSelectedStat(stat);
      setIsModalOpen(true);

      if (enableDebugLogs) {
        logDebug('useStatisticsModal', 'Modal abierto', {
          statId: stat.id,
          statTitle: stat.titulo
        });
      }

      // Callback personalizado al abrir
      if (onOpen) {
        onOpen(stat);
      }
    } else {
      if (enableDebugLogs) {
        logWarning('useStatisticsModal', 'Estadística deshabilitada', {
          statId: stat.id,
          statTitle: stat.titulo
        });
      }
    }
  }, [onOpen, enableDebugLogs]);

  /**
   * Cerrar modal con delay para animación suave
   * Espera a que termine la animación antes de limpiar el estado
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);

    if (enableDebugLogs) {
      logDebug('useStatisticsModal', 'Modal cerrado', {
        closeDelay: `${closeDelay}ms`
      });
    }

    // Pequeño delay antes de limpiar la estadística seleccionada
    // para que la animación de cierre se vea bien
    setTimeout(() => {
      setSelectedStat(null);

      if (enableDebugLogs) {
        logDebug('useStatisticsModal', 'Estadística seleccionada limpiada');
      }
    }, closeDelay);

    // Callback personalizado al cerrar
    if (onClose) {
      onClose();
    }
  }, [closeDelay, onClose, enableDebugLogs]);

  return {
    selectedStat,
    isModalOpen,
    handleCardClick,
    handleCloseModal
  };
};

/**
 * Configuraciones predefinidas para casos de uso comunes
 */
export const STATISTICS_MODAL_PRESETS = {
  /** Configuración por defecto */
  default: {
    closeDelay: 300
  },
  /** Configuración rápida (transiciones más rápidas) */
  fast: {
    closeDelay: 150
  },
  /** Configuración lenta (transiciones más suaves) */
  slow: {
    closeDelay: 500
  },
  /** Configuración con debug habilitado */
  debug: {
    closeDelay: 300,
    enableDebugLogs: true
  }
} as const;
