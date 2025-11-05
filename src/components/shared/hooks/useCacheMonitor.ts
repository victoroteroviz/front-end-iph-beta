/**
 * useCacheMonitor Hook
 *
 * Hook personalizado para monitorear métricas del CacheHelper en tiempo real
 *
 * Características:
 * - ✅ Actualización automática de estadísticas
 * - ✅ Intervalo configurable
 * - ✅ Métricas detalladas L1 + L2
 * - ✅ Cleanup automático
 * - ✅ TypeScript strict
 *
 * @example
 * ```typescript
 * // Monitoreo básico
 * const stats = useCacheMonitor();
 *
 * // Con intervalo personalizado
 * const stats = useCacheMonitor(5000); // Actualiza cada 5s
 *
 * // Usar en componente
 * function CacheDebugPanel() {
 *   const stats = useCacheMonitor(2000);
 *
 *   return (
 *     <div>
 *       <h3>Cache Stats</h3>
 *       <p>Hit Rate: {stats.hitRate}%</p>
 *       <p>L1 Items: {stats.l1Cache?.items || 0}</p>
 *       <p>L1 Hit Rate: {stats.l1Cache?.hitRate || 0}%</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import CacheHelper, { type CacheStats } from '@/helper/cache/cache.helper';

/**
 * Hook para monitorear estadísticas del cache en tiempo real
 *
 * @param interval - Intervalo de actualización en milisegundos (default: 3000ms)
 * @returns Estadísticas actualizadas del cache
 */
export const useCacheMonitor = (interval: number = 3000): CacheStats => {
  const [stats, setStats] = useState<CacheStats>(() => CacheHelper.getStats());

  useEffect(() => {
    // Actualizar stats inmediatamente
    setStats(CacheHelper.getStats());

    // Configurar intervalo de actualización
    const timer = setInterval(() => {
      setStats(CacheHelper.getStats());
    }, interval);

    // Cleanup: Limpiar timer al desmontar
    return () => {
      clearInterval(timer);
    };
  }, [interval]);

  return stats;
};

/**
 * Configuración extendida para monitoreo avanzado
 */
export type CacheMonitorConfig = {
  /** Intervalo de actualización en ms (default: 3000) */
  interval?: number;
  /** Habilitar alertas cuando hit rate < threshold (default: false) */
  enableAlerts?: boolean;
  /** Threshold de hit rate para alertas (default: 50) */
  alertThreshold?: number;
  /** Callback cuando hit rate < threshold */
  onLowHitRate?: (hitRate: number) => void;
  /** Callback cuando L1 usage > threshold */
  onHighL1Usage?: (usage: number) => void;
};

/**
 * Hook avanzado para monitoreo con alertas y callbacks
 *
 * @param config - Configuración de monitoreo
 * @returns Estadísticas y métodos de control
 *
 * @example
 * ```typescript
 * const { stats, reset } = useCacheMonitorAdvanced({
 *   interval: 5000,
 *   enableAlerts: true,
 *   alertThreshold: 60,
 *   onLowHitRate: (rate) => {
 *     console.warn(`⚠️ Hit rate bajo: ${rate}%`);
 *     showNotification(`Cache hit rate: ${rate}%`, 'warning');
 *   },
 *   onHighL1Usage: (usage) => {
 *     console.warn(`⚠️ L1 cache casi lleno: ${usage}%`);
 *   }
 * });
 * ```
 */
export const useCacheMonitorAdvanced = (config: CacheMonitorConfig = {}) => {
  const {
    interval = 3000,
    enableAlerts = false,
    alertThreshold = 50,
    onLowHitRate,
    onHighL1Usage
  } = config;

  const [stats, setStats] = useState<CacheStats>(() => CacheHelper.getStats());
  const [alertsFired, setAlertsFired] = useState({
    lowHitRate: false,
    highL1Usage: false
  });

  useEffect(() => {
    const updateStats = () => {
      const newStats = CacheHelper.getStats();
      setStats(newStats);

      // Verificar alertas si están habilitadas
      if (enableAlerts) {
        // Alerta de hit rate bajo
        if (newStats.hitRate < alertThreshold && !alertsFired.lowHitRate && onLowHitRate) {
          onLowHitRate(newStats.hitRate);
          setAlertsFired(prev => ({ ...prev, lowHitRate: true }));
        }

        // Alerta de L1 usage alto (>90%)
        if (newStats.l1Cache && newStats.l1Cache.usage > 90 && !alertsFired.highL1Usage && onHighL1Usage) {
          onHighL1Usage(newStats.l1Cache.usage);
          setAlertsFired(prev => ({ ...prev, highL1Usage: true }));
        }

        // Reset alertas si vuelven a valores normales
        if (newStats.hitRate >= alertThreshold && alertsFired.lowHitRate) {
          setAlertsFired(prev => ({ ...prev, lowHitRate: false }));
        }

        if (newStats.l1Cache && newStats.l1Cache.usage <= 80 && alertsFired.highL1Usage) {
          setAlertsFired(prev => ({ ...prev, highL1Usage: false }));
        }
      }
    };

    // Primera actualización
    updateStats();

    // Intervalo
    const timer = setInterval(updateStats, interval);

    return () => clearInterval(timer);
  }, [interval, enableAlerts, alertThreshold, alertsFired, onLowHitRate, onHighL1Usage]);

  /**
   * Resetea las métricas del cache
   */
  const reset = () => {
    CacheHelper.resetMetrics();
    setStats(CacheHelper.getStats());
    setAlertsFired({ lowHitRate: false, highL1Usage: false });
  };

  /**
   * Limpia el L1 cache manualmente
   */
  const clearL1 = () => {
    CacheHelper.clearMemoryCache();
    setStats(CacheHelper.getStats());
  };

  /**
   * Limpia todo el cache (L1 + L2)
   */
  const clearAll = () => {
    CacheHelper.clear(false); // localStorage
    CacheHelper.clear(true);  // sessionStorage
    setStats(CacheHelper.getStats());
  };

  return {
    stats,
    reset,
    clearL1,
    clearAll
  };
};

/**
 * Hook simple para obtener solo L1 cache stats
 *
 * @param interval - Intervalo de actualización en ms
 * @returns Estadísticas de L1 cache o undefined si no está habilitado
 *
 * @example
 * ```typescript
 * const l1Stats = useL1CacheMonitor();
 *
 * if (l1Stats) {
 *   console.log(`L1: ${l1Stats.items} items, ${l1Stats.usage}% usage`);
 * }
 * ```
 */
export const useL1CacheMonitor = (interval: number = 3000) => {
  const stats = useCacheMonitor(interval);
  return stats.l1Cache;
};

export default useCacheMonitor;
