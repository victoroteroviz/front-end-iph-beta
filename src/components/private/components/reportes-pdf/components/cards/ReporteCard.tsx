/**
 * Componente de tarjeta individual de reporte PDF
 *
 * @component
 * @pattern Atomic Design - Molécula
 * @version 1.0.0
 *
 * @description
 * Tarjeta interactiva que representa un reporte PDF disponible.
 * Maneja estados: normal, hover, disabled, loading (generando).
 *
 * @accessibility
 * - ARIA labels descriptivos
 * - Navegación por teclado (Tab, Enter, Space)
 * - Roles semánticos
 * - Focus visible
 *
 * @performance
 * - Memoizado con React.memo
 * - Callbacks optimizados
 * - Animaciones GPU-accelerated
 *
 * @author Senior Full-Stack Developer
 */

import React, { useCallback, type KeyboardEvent } from 'react';
import type { IReporteCard } from '../../../../../../interfaces/IReporte';

/**
 * Props del componente ReporteCard
 */
interface ReporteCardProps {
  /** Configuración del reporte */
  reporte: IReporteCard;

  /** Handler cuando se hace click en la tarjeta */
  onClick: (reporte: IReporteCard) => void;

  /** Indica si la tarjeta está deshabilitada */
  disabled?: boolean;

  /** Indica si el reporte se está generando */
  generando?: boolean;
}

/**
 * ReporteCard Component
 *
 * @param {ReporteCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Tarjeta renderizada
 *
 * @example
 * ```tsx
 * <ReporteCard
 *   reporte={reporteConfig}
 *   onClick={handleClick}
 *   disabled={false}
 *   generando={false}
 * />
 * ```
 */
const ReporteCard: React.FC<ReporteCardProps> = React.memo(({
  reporte,
  onClick,
  disabled = false,
  generando = false
}) => {
  /**
   * Handler del click en la tarjeta
   * Memoizado para evitar re-creación en cada render
   */
  const handleClick = useCallback(() => {
    if (!disabled && !generando && reporte.habilitado) {
      onClick(reporte);
    }
  }, [disabled, generando, reporte, onClick]);

  /**
   * Handler para navegación por teclado
   * Permite activar la tarjeta con Enter o Space
   */
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !generando && reporte.habilitado) {
      e.preventDefault();
      onClick(reporte);
    }
  }, [disabled, generando, reporte, onClick]);

  // Determinar clases CSS según el estado
  const isClickable = reporte.habilitado && !disabled && !generando;
  const isDisabledOrGenerating = disabled || generando || !reporte.habilitado;

  return (
    <div
      className={`
        reporte-card group relative bg-white rounded-xl shadow-md border-2 border-transparent
        transition-all duration-300
        ${isClickable ? 'hover:shadow-xl hover:border-[#c2b186] hover:-translate-y-1 cursor-pointer' : ''}
        ${isDisabledOrGenerating ? 'opacity-60 cursor-not-allowed' : ''}
        ${generando ? 'animate-pulse' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isClickable ? 0 : -1}
      aria-label={`Generar reporte: ${reporte.titulo}`}
      aria-disabled={isDisabledOrGenerating}
      data-reporte-id={reporte.id}
    >
      {/* Indicador de generando */}
      {generando && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 border-3 border-[#c2b186] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Badge "Próximamente" para reportes deshabilitados */}
      {!reporte.habilitado && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full shadow-sm">
            Próximamente
          </span>
        </div>
      )}

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Icono */}
        <div
          className="reporte-card-icon inline-flex p-4 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: reporte.color || '#c2b186' }}
        >
          <div className="w-8 h-8 text-white">
            {reporte.icono}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-[#4d4725] mb-2 leading-tight">
          {reporte.titulo}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-[#6b6b47] leading-relaxed mb-4">
          {reporte.descripcion}
        </p>

        {/* Footer con badge de tipo */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {reporte.tipo && (
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {reporte.tipo.replace('-', ' ')}
            </span>
          )}

          {/* Indicador de filtros requeridos */}
          {reporte.requiereFiltros && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filtros</span>
            </div>
          )}
        </div>

        {/* Mensaje de estado generando */}
        {generando && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[#948b54]">
              <div className="w-2 h-2 bg-[#948b54] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Generando reporte...</span>
            </div>
          </div>
        )}
      </div>

      {/* Decoración hover */}
      {isClickable && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#948b54] to-[#c2b186] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"></div>
      )}
    </div>
  );
});

// Display name para debugging
ReporteCard.displayName = 'ReporteCard';

export default ReporteCard;
