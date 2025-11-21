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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Título y descripción */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-xl shadow-lg shadow-[#4d4725]/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
          <svg
            className="h-7 w-7 text-white"
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
        <div>
          <h1 className="text-3xl font-bold text-[#4d4725] font-poppins tracking-tight">
            Generación de Reportes PDF
          </h1>
          <p className="text-gray-600 font-poppins mt-1">
            Genera y descarga reportes en formato PDF con estadísticas detalladas del sistema
          </p>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-[#c2b186]/20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#948b54]/10 rounded-md">
              <svg className="h-4 w-4 text-[#4d4725]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-[#4d4725] font-poppins leading-none">
                {enabledCount}
              </div>
              <div className="text-xs text-gray-600 font-poppins">
                Disponibles
              </div>
            </div>
          </div>
          <div className="w-px h-8 bg-[#c2b186]/30" />
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#948b54]/10 rounded-md">
              <svg className="h-4 w-4 text-[#4d4725]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold text-[#4d4725] font-poppins leading-none">
                {totalCount}
              </div>
              <div className="text-xs text-gray-600 font-poppins">
                Total
              </div>
            </div>
          </div>
          {totalCount > enabledCount && (
            <>
              <div className="w-px h-8 bg-[#c2b186]/30" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-md">
                  <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600 font-poppins leading-none">
                    {totalCount - enabledCount}
                  </div>
                  <div className="text-xs text-gray-600 font-poppins">
                    Próximamente
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// Display name para debugging
ReportesHeader.displayName = 'ReportesHeader';

export default ReportesHeader;
