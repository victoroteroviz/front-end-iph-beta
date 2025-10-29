/**
 * Sección de header para componente EstadisticasJC
 * Incluye título, subtítulo y botón de refresh
 *
 * @module EstadisticasJCHeader
 * @version 3.0.0 - Actualizado con patrón limpio de Usuarios.tsx
 */

import React from 'react';
import { Scale, RefreshCw } from 'lucide-react';

export interface EstadisticasJCHeaderProps {
  /** Handler para refrescar estadísticas */
  onRefresh: () => void;
  /** Estado de carga */
  isLoading: boolean;
}

/**
 * Header del componente de Estadísticas de Justicia Cívica
 * Usa el mismo patrón visual que Usuarios.tsx para consistencia
 *
 * @example
 * ```tsx
 * <EstadisticasJCHeader
 *   onRefresh={handleRefresh}
 *   isLoading={loading.diaria || loading.mensual || loading.anual}
 * />
 * ```
 */
export const EstadisticasJCHeader: React.FC<EstadisticasJCHeaderProps> = ({
  onRefresh,
  isLoading
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#948b54] rounded-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
              Estadísticas de Justicia Cívica
            </h1>
            <p className="text-gray-600 font-poppins">
              Análisis de IPH por período: diario, mensual y anual
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="
              flex items-center gap-2 px-4 py-2 text-sm font-medium
              text-white bg-[#4d4725] rounded-lg
              hover:bg-[#3a3519] disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 font-poppins
            "
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasJCHeader;
