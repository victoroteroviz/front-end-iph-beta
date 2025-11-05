/**
 * Componente Grid para las tarjetas de reportes
 *
 * @component
 * @pattern Atomic Design - Organismo
 * @version 1.0.0
 *
 * @description
 * Grid responsivo que renderiza las tarjetas de reportes PDF.
 * Maneja el layout y la distribución de las tarjetas en diferentes tamaños de pantalla.
 *
 * @performance
 * - Memoizado con React.memo para evitar re-renders innecesarios
 * - Solo re-renderiza si cambia el array de reportes o el handler
 *
 * @responsive
 * - Mobile (<640px): 1 columna
 * - Tablet (640-1024px): 2 columnas
 * - Desktop (>1024px): 3-4 columnas
 *
 * @author Senior Full-Stack Developer
 */

import React from 'react';
import type { IReporteCard } from '../../../../../../interfaces/IReporte';
import ReporteCard from '../cards/ReporteCard';

/**
 * Props del componente ReportesGrid
 */
interface ReportesGridProps {
  /** Array de reportes a renderizar */
  reportes: IReporteCard[];

  /** Handler cuando se hace click en una tarjeta */
  onCardClick: (reporte: IReporteCard) => void;

  /** Indica si hay un reporte generándose (opcional) */
  generando?: boolean;

  /** ID del reporte que se está generando (opcional) */
  reporteGenerando?: string | null;
}

/**
 * ReportesGrid Component
 *
 * @param {ReportesGridProps} props - Propiedades del componente
 * @returns {JSX.Element} Grid renderizado
 *
 * @example
 * ```tsx
 * <ReportesGrid
 *   reportes={reportesCardsConfig}
 *   onCardClick={handleGenerarReporte}
 *   generando={estado.generando}
 *   reporteGenerando={estado.reporteId}
 * />
 * ```
 */
const ReportesGrid: React.FC<ReportesGridProps> = React.memo(({
  reportes,
  onCardClick,
  generando = false,
  reporteGenerando = null
}) => {
  return (
    <div className="reportes-content">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reportes.map((reporte) => (
          <ReporteCard
            key={reporte.id}
            reporte={reporte}
            onClick={onCardClick}
            disabled={generando && reporteGenerando !== reporte.id}
            generando={generando && reporteGenerando === reporte.id}
          />
        ))}
      </div>

      {/* Mensaje si no hay reportes */}
      {reportes.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay reportes disponibles
          </h3>
          <p className="text-gray-500">
            Los reportes estarán disponibles próximamente
          </p>
        </div>
      )}
    </div>
  );
});

// Display name para debugging
ReportesGrid.displayName = 'ReportesGrid';

export default ReportesGrid;
