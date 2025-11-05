/**
 * Componente de Header para la sección de Reportes PDF
 *
 * @component
 * @pattern Atomic Design - Molécula
 * @version 1.0.0
 *
 * @description
 * Header decorativo con título y métricas rápidas sobre los reportes disponibles
 *
 * @performance
 * - Memoizado con React.memo para evitar re-renders innecesarios
 * - Solo se re-renderiza si cambian enabledCount o totalCount
 *
 * @author Senior Full-Stack Developer
 */

import React from 'react';

/**
 * Props del componente ReportesHeader
 */
interface ReportesHeaderProps {
  /** Número de reportes habilitados */
  enabledCount: number;

  /** Número total de reportes */
  totalCount: number;
}

/**
 * ReportesHeader Component
 *
 * @param {ReportesHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} Header renderizado
 *
 * @example
 * ```tsx
 * <ReportesHeader
 *   enabledCount={6}
 *   totalCount={8}
 * />
 * ```
 */
const ReportesHeader: React.FC<ReportesHeaderProps> = React.memo(({
  enabledCount,
  totalCount
}) => {
  return (
    <div className="bg-gradient-to-r from-[#948b54] to-[#c2b186] rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Título y descripción */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">
              Generación de Reportes PDF
            </h1>
          </div>
          <p className="text-[#ede8d4] text-sm md:text-base ml-12 md:ml-14">
            Genera y descarga reportes en formato PDF con estadísticas detalladas del sistema
          </p>
        </div>

        {/* Métricas rápidas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
          {/* Reportes disponibles */}
          <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-lg border border-white/30 shadow-inner min-w-[160px]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-green-500/40 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#ede8d4] font-medium">Disponibles</p>
                <p className="text-2xl font-bold">{enabledCount}</p>
              </div>
            </div>
          </div>

          {/* Total de reportes */}
          <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-lg border border-white/30 shadow-inner min-w-[160px]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-500/40 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#ede8d4] font-medium">Total</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </div>

          {/* Próximamente (si hay reportes deshabilitados) */}
          {totalCount > enabledCount && (
            <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-lg border border-white/30 shadow-inner min-w-[160px]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/40 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#ede8d4] font-medium">Próximamente</p>
                  <p className="text-2xl font-bold">{totalCount - enabledCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Display name para debugging
ReportesHeader.displayName = 'ReportesHeader';

export default ReportesHeader;
