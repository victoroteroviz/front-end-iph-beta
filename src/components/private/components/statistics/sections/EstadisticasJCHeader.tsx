/**
 * Sección de header para componente EstadisticasJC
 * Incluye título, subtítulo y botón de refresh
 *
 * @module EstadisticasJCHeader
 * @version 2.0.0 - Actualizado con estilos consistentes del patrón HistorialIPH
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
 * Usa el mismo patrón visual que HistorialIPH para consistencia
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
    <div className="relative bg-gradient-to-br from-white via-[#fdf7f1] to-white rounded-2xl border border-[#c2b186]/30 p-6 mb-6 shadow-lg shadow-[#4d4725]/5 overflow-hidden">
      {/* Patrón de fondo decorativo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#948b54]/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c2b186]/5 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-xl shadow-lg shadow-[#4d4725]/20 transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#4d4725] font-poppins tracking-tight">
                Estadísticas de Justicia Cívica
              </h1>
              <p className="text-gray-600 font-poppins mt-1">
                Análisis de IPH por período: diario, mensual y anual
              </p>
            </div>
          </div>

          {/* Botón de actualización mejorado */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="
              flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
              text-white bg-gradient-to-r from-[#4d4725] to-[#3a3519] rounded-lg
              hover:from-[#3a3519] hover:to-[#2d2812] hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-200 font-poppins shadow-md hover:shadow-lg
              cursor-pointer
            "
            aria-label="Actualizar estadísticas"
          >
            <RefreshCw
              size={18}
              className={isLoading ? 'animate-spin' : ''}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasJCHeader;
