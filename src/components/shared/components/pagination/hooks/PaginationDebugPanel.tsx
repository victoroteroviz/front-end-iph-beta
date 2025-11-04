/**
 * Panel de Debugging para usePaginationPersistence
 *
 * Componente temporal para visualizar el estado de la persistencia de paginación.
 * Útil para diagnosticar problemas de restauración entre navegaciones.
 *
 * @usage
 * ```tsx
 * import { PaginationDebugPanel } from '@/components/shared/components/pagination/hooks/PaginationDebugPanel';
 *
 * const MyComponent = () => {
 *   const pagination = usePaginationPersistence({
 *     key: 'my-pagination',
 *     itemsPerPage: 10,
 *     logging: true
 *   });
 *
 *   return (
 *     <>
 *       <PaginationDebugPanel storageKey="my-pagination" currentPage={pagination.currentPage} />
 *       {/* Resto del componente *}
 *     </>
 *   );
 * };
 * ```
 *
 * @version 1.0.0
 * @author Claude Code
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PaginationDebugPanelProps {
  /** Clave de paginación (sin prefijo 'pagination:') */
  storageKey: string;
  /** Página actual del hook */
  currentPage: number;
  /** Mostrar panel (default: true en desarrollo) */
  show?: boolean;
}

/**
 * Panel de debugging visual para persistencia de paginación
 */
export const PaginationDebugPanel: React.FC<PaginationDebugPanelProps> = ({
  storageKey,
  currentPage,
  show = process.env.NODE_ENV === 'development'
}) => {
  const [storageData, setStorageData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fullKey = `pagination:${storageKey}`;

  // Leer datos de sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(fullKey);
      if (stored) {
        setStorageData(JSON.parse(stored));
      } else {
        setStorageData(null);
      }
    } catch (error) {
      console.error('Error leyendo sessionStorage:', error);
      setStorageData({ error: String(error) });
    }
  }, [fullKey, refreshKey, currentPage]);

  if (!show) return null;

  const hasData = storageData && !storageData.error;
  const isConsistent = hasData && storageData.page === currentPage;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-2xl p-4 max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-blue-600" />
          <h3 className="font-bold text-sm text-gray-900">Pagination Debug</h3>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Refrescar datos"
        >
          <RefreshCw size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Status */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Storage Status:</span>
          <div className="flex items-center gap-1">
            {hasData ? (
              <>
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-green-700 font-medium">Guardado</span>
              </>
            ) : (
              <>
                <XCircle size={14} className="text-red-600" />
                <span className="text-red-700 font-medium">Sin datos</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Consistencia:</span>
          <div className="flex items-center gap-1">
            {isConsistent ? (
              <>
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-green-700 font-medium">OK</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} className="text-yellow-600" />
                <span className="text-yellow-700 font-medium">Inconsistente</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-gray-50 rounded p-3 space-y-2 text-xs font-mono">
        <div className="flex justify-between">
          <span className="text-gray-600">Hook Page:</span>
          <span className="font-bold text-blue-600">{currentPage}</span>
        </div>

        {hasData && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage Page:</span>
              <span className={`font-bold ${isConsistent ? 'text-green-600' : 'text-red-600'}`}>
                {storageData.page}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Limit:</span>
              <span className="text-gray-900">{storageData.limit}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Edad:</span>
              <span className="text-gray-900">
                {Math.floor((Date.now() - storageData.timestamp) / 1000)}s
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="text-gray-900">v{storageData.version}</span>
            </div>
          </>
        )}

        {storageData?.error && (
          <div className="text-red-600 text-xs">
            Error: {storageData.error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-2 border-t border-gray-200 space-y-2">
        <button
          onClick={() => {
            console.log('📊 Storage Data:', sessionStorage.getItem(fullKey));
            console.log('📊 Parsed:', storageData);
          }}
          className="w-full px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-medium"
        >
          Log to Console
        </button>

        <button
          onClick={() => {
            if (confirm('¿Limpiar datos de paginación guardados?')) {
              sessionStorage.removeItem(fullKey);
              setRefreshKey(k => k + 1);
              console.log('🗑️ Paginación limpiada para:', fullKey);
            }
          }}
          className="w-full px-3 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors font-medium"
        >
          Clear Storage
        </button>
      </div>

      {/* Key Info */}
      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <div className="truncate" title={fullKey}>
          Key: {fullKey}
        </div>
      </div>
    </div>
  );
};

export default PaginationDebugPanel;
