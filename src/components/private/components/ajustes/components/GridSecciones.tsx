/**
 * @fileoverview Componente atómico GridSecciones
 * @version 1.0.0
 * @description Grid responsivo para mostrar secciones de ajustes
 */

import React from 'react';
import { SeccionCard } from './SeccionCard';
import type { IAjusteSeccion } from '../../../../../interfaces/ajustes';

/**
 * @interface GridSeccionesProps
 * @description Props del componente GridSecciones
 */
interface GridSeccionesProps {
  /** Lista de secciones a mostrar */
  secciones: IAjusteSeccion[];
  /** Función para manejar clic en sección */
  onSeccionClick: (seccionId: string) => void;
  /** ID de la sección que está cargando */
  loadingSeccionId?: string | null;
  /** Función para verificar acceso a sección */
  verificarAcceso?: (seccionId: string) => boolean;
  /** Estado de carga general */
  loading?: boolean;
  /** Número de elementos skeleton a mostrar */
  skeletonCount?: number;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * @component GridSecciones
 * @description Componente que muestra un grid responsivo de secciones de ajustes
 *
 * @param {GridSeccionesProps} props - Props del componente
 * @returns {JSX.Element} Componente GridSecciones
 *
 * @example
 * ```tsx
 * <GridSecciones
 *   secciones={seccionesFiltradas}
 *   onSeccionClick={handleSeccionClick}
 *   loadingSeccionId={loadingSeccion}
 *   verificarAcceso={verificarAccesoSeccion}
 * />
 * ```
 */
export const GridSecciones: React.FC<GridSeccionesProps> = ({
  secciones,
  onSeccionClick,
  loadingSeccionId = null,
  verificarAcceso,
  loading = false,
  skeletonCount = 6,
  className = ''
}) => {
  /**
   * @function renderSkeletonCards
   * @description Renderiza cards skeleton durante la carga
   */
  const renderSkeletonCards = (): React.ReactElement[] => {
    return Array.from({ length: skeletonCount }, (_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
      >
        {/* Indicador de color superior */}
        <div className="h-1 w-full bg-gray-300 rounded mb-6" />

        {/* Header con icono y título */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-lg" />
            <div>
              <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-20" />
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-300 rounded" />
        </div>

        {/* Descripción */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-300 rounded w-full" />
          <div className="h-3 bg-gray-300 rounded w-3/4" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-2 bg-gray-300 rounded w-24" />
          <div className="h-2 bg-gray-300 rounded w-16" />
        </div>
      </div>
    ));
  };

  /**
   * @function renderSecciones
   * @description Renderiza las secciones reales
   */
  const renderSecciones = (): React.ReactElement[] => {
    return secciones.map((seccion) => {
      const tieneAcceso = verificarAcceso ? verificarAcceso(seccion.id) : true;
      const estaCargnado = loadingSeccionId === seccion.id;

      return (
        <SeccionCard
          key={seccion.id}
          seccion={seccion}
          onClick={onSeccionClick}
          loading={estaCargnado}
          tieneAcceso={tieneAcceso}
          className="transition-all duration-300 hover:shadow-lg"
        />
      );
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Grid responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? renderSkeletonCards() : renderSecciones()}
      </div>

      {/* Mensaje cuando no hay secciones */}
      {!loading && secciones.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay secciones disponibles
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            No se encontraron secciones de ajustes disponibles para tu rol actual.
            Contacta con un administrador si necesitas acceso adicional.
          </p>
        </div>
      )}

      {/* Información de resultados */}
      {!loading && secciones.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Mostrando {secciones.length} sección{secciones.length !== 1 ? 'es' : ''} disponible{secciones.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};