/**
 * CacheDebugPanel - Panel de Debug para Cache Helper
 *
 * Componente opcional para visualizar métricas del cache en tiempo real
 *
 * IMPORTANTE: Solo usar en desarrollo, NO incluir en producción
 *
 * @example
 * ```typescript
 * // En tu componente de debug o desarrollo
 * import { CacheDebugPanel } from '@/components/shared/components/debug';
 *
 * function DevToolsPanel() {
 *   return (
 *     <div>
 *       {import.meta.env.DEV && <CacheDebugPanel />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import React from 'react';
import { useCacheMonitorAdvanced } from '../../hooks';
import { showWarning } from '../../../../helper/notification/notification.helper';
import './CacheDebugPanel.css';

/**
 * Props del componente
 */
export type CacheDebugPanelProps = {
  /** Posición del panel (default: 'bottom-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Si el panel es colapsable (default: true) */
  collapsible?: boolean;
  /** Si el panel está colapsado por defecto (default: true) */
  defaultCollapsed?: boolean;
  /** Intervalo de actualización en ms (default: 3000) */
  updateInterval?: number;
  /** Habilitar alertas visuales (default: true) */
  enableAlerts?: boolean;
};

/**
 * Panel de debug para métricas del cache
 */
export const CacheDebugPanel: React.FC<CacheDebugPanelProps> = ({
  position = 'bottom-right',
  collapsible = true,
  defaultCollapsed = true,
  updateInterval = 3000,
  enableAlerts = true
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const { stats, reset, clearL1, clearAll } = useCacheMonitorAdvanced({
    interval: updateInterval,
    enableAlerts,
    alertThreshold: 60,
    onLowHitRate: (rate) => {
      showWarning(`⚠️ Cache hit rate bajo: ${rate}%`);
    },
    onHighL1Usage: (usage) => {
      showWarning(`⚠️ L1 cache casi lleno: ${usage}%`);
    }
  });

  // No renderizar en producción
  if (!import.meta.env.DEV) {
    return null;
  }

  const positionClass = `cache-debug-panel--${position}`;

  return (
    <div className={`cache-debug-panel ${positionClass}`}>
      {/* Header */}
      <div
        className="cache-debug-panel__header"
        onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <h3 className="cache-debug-panel__title">
          📊 Cache Stats
          {collapsible && (
            <span className="cache-debug-panel__toggle">
              {isCollapsed ? '▼' : '▲'}
            </span>
          )}
        </h3>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="cache-debug-panel__content">
          {/* General Stats */}
          <div className="cache-debug-panel__section">
            <h4 className="cache-debug-panel__section-title">General</h4>
            <div className="cache-debug-panel__stats">
              <StatItem
                label="Total Hits"
                value={stats.hits}
                icon="✅"
              />
              <StatItem
                label="Total Misses"
                value={stats.misses}
                icon="❌"
              />
              <StatItem
                label="Hit Rate"
                value={`${stats.hitRate}%`}
                icon="📈"
                highlight={stats.hitRate < 60 ? 'warning' : stats.hitRate > 80 ? 'success' : undefined}
              />
              <StatItem
                label="Total Items (L2)"
                value={stats.totalItems}
                icon="💾"
              />
            </div>
          </div>

          {/* L1 Cache Stats */}
          {stats.l1Cache && (
            <div className="cache-debug-panel__section">
              <h4 className="cache-debug-panel__section-title">
                📦 L1 Cache (Memoria)
              </h4>
              <div className="cache-debug-panel__stats">
                <StatItem
                  label="Items en L1"
                  value={`${stats.l1Cache.items}/${stats.l1Cache.maxItems}`}
                  icon="📦"
                />
                <StatItem
                  label="L1 Hits"
                  value={stats.l1Cache.hits}
                  icon="⚡"
                />
                <StatItem
                  label="L1 Hit Rate"
                  value={`${stats.l1Cache.hitRate}%`}
                  icon="🎯"
                  highlight={stats.l1Cache.hitRate > 80 ? 'success' : undefined}
                />
                <StatItem
                  label="L1 Usage"
                  value={`${stats.l1Cache.usage}%`}
                  icon="📊"
                  highlight={stats.l1Cache.usage > 90 ? 'warning' : undefined}
                />
              </div>

              {/* Progress bar de L1 usage */}
              <div className="cache-debug-panel__progress">
                <div className="cache-debug-panel__progress-label">
                  L1 Memory Usage
                </div>
                <div className="cache-debug-panel__progress-bar">
                  <div
                    className="cache-debug-panel__progress-fill"
                    style={{
                      width: `${stats.l1Cache.usage}%`,
                      backgroundColor: stats.l1Cache.usage > 90 ? '#ff6b6b' : '#4CAF50'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* L2 Cache Stats */}
          <div className="cache-debug-panel__section">
            <h4 className="cache-debug-panel__section-title">
              💾 L2 Cache (Storage)
            </h4>
            <div className="cache-debug-panel__stats">
              <StatItem
                label="L2 Hits"
                value={stats.hits - (stats.l1Cache?.hits || 0)}
                icon="💾"
              />
              <StatItem
                label="Valid Items"
                value={stats.validItems}
                icon="✅"
              />
              <StatItem
                label="Expired Items"
                value={stats.expiredItems}
                icon="⏰"
                highlight={stats.expiredItems > 10 ? 'warning' : undefined}
              />
              <StatItem
                label="Total Size"
                value={formatBytes(stats.totalSize)}
                icon="📏"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="cache-debug-panel__actions">
            <button
              className="cache-debug-panel__button cache-debug-panel__button--primary"
              onClick={reset}
              title="Resetear métricas (no borra datos)"
            >
              🔄 Reset Metrics
            </button>
            <button
              className="cache-debug-panel__button cache-debug-panel__button--secondary"
              onClick={clearL1}
              title="Limpiar solo L1 cache (memoria)"
            >
              🧹 Clear L1
            </button>
            <button
              className="cache-debug-panel__button cache-debug-panel__button--danger"
              onClick={clearAll}
              title="Limpiar todo el cache (L1 + L2)"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente interno para mostrar un stat individual
 */
const StatItem: React.FC<{
  label: string;
  value: string | number;
  icon: string;
  highlight?: 'success' | 'warning' | 'error';
}> = ({ label, value, icon, highlight }) => {
  const highlightClass = highlight ? `cache-debug-panel__stat--${highlight}` : '';

  return (
    <div className={`cache-debug-panel__stat ${highlightClass}`}>
      <span className="cache-debug-panel__stat-icon">{icon}</span>
      <div className="cache-debug-panel__stat-content">
        <div className="cache-debug-panel__stat-label">{label}</div>
        <div className="cache-debug-panel__stat-value">{value}</div>
      </div>
    </div>
  );
};

/**
 * Formatea bytes a formato legible
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export default CacheDebugPanel;
