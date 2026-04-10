/**
 * Componente EstadisticasHeader
 * Header principal del panel de estadísticas con título y métricas rápidas
 *
 * @pattern Atomic Component
 * @version 1.0.0
 * @category Layout Components
 */

import React, { memo } from 'react';
import { BarChart3 } from 'lucide-react';

type EstadisticasHeaderProps = {
  /** Número de estadísticas habilitadas */
  enabledCount: number;
  /** Número total de estadísticas */
  totalCount: number;
};

/**
 * Header del panel de estadísticas con diseño decorativo
 * @performance Memoizado - solo re-renderiza si cambian los contadores
 */
const EstadisticasHeader: React.FC<EstadisticasHeaderProps> = memo(({
  enabledCount,
  totalCount
}) => {
  const disabledCount = totalCount - enabledCount;

  return (
    <div className="relative bg-gradient-to-br from-white via-[var(--color-iph-surface)] to-white rounded-2xl border border-[var(--color-iph-primary-alpha-12)] p-6 mb-6 shadow-[0_10px_30px_var(--color-iph-primary-alpha-08)] overflow-hidden">
      {/* Patrón de fondo decorativo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-iph-secondary)]/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-iph-tertiary)]/5 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-[var(--color-iph-secondary)] to-[var(--color-iph-primary)] rounded-xl shadow-[0_10px_24px_var(--color-iph-primary-alpha-12)] transition-transform duration-300 hover:scale-110 hover:rotate-3">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-iph-primary)] font-poppins tracking-tight">
                Panel de Estadísticas
              </h1>
              <p className="text-gray-600 font-poppins mt-1">
                Explora y analiza diferentes métricas del sistema IPH
              </p>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[var(--color-iph-primary-alpha-12)]">
              <div className="text-2xl font-bold text-[var(--color-iph-primary)] font-poppins">
                {enabledCount}
              </div>
              <div className="text-xs text-gray-600 font-poppins">Disponibles</div>
            </div>
            <div className="text-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[var(--color-iph-primary-alpha-12)]">
              <div className="text-2xl font-bold text-[var(--color-iph-secondary)] font-poppins">
                {disabledCount}
              </div>
              <div className="text-xs text-gray-600 font-poppins">Próximamente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

EstadisticasHeader.displayName = 'EstadisticasHeader';

export default EstadisticasHeader;
