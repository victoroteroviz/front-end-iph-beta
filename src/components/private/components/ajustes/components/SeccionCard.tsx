/**
 * @fileoverview Componente atómico SeccionCard para mostrar secciones de ajustes
 * @version 1.0.0
 * @description Card individual que representa una sección de ajustes del sistema
 */

import React from 'react';
import { Clock, ChevronRight, Lock } from 'lucide-react';
import type { IAjusteSeccion } from '../../../../../interfaces/ajustes';

/**
 * @interface SeccionCardProps
 * @description Props del componente SeccionCard
 */
interface SeccionCardProps {
  /** Datos de la sección */
  seccion: IAjusteSeccion;
  /** Función para manejar clic en la sección */
  onClick: (seccionId: string) => void;
  /** Indica si la sección está cargando */
  loading?: boolean;
  /** Indica si el usuario tiene acceso a la sección */
  tieneAcceso?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * @component SeccionCard
 * @description Componente que muestra una tarjeta de sección de ajustes
 *
 * @param {SeccionCardProps} props - Props del componente
 * @returns {JSX.Element} Componente SeccionCard
 *
 * @example
 * ```tsx
 * <SeccionCard
 *   seccion={seccionData}
 *   onClick={handleSeccionClick}
 *   tieneAcceso={true}
 *   loading={false}
 * />
 * ```
 */
export const SeccionCard: React.FC<SeccionCardProps> = ({
  seccion,
  onClick,
  loading = false,
  tieneAcceso = true,
  className = ''
}) => {
  /**
   * @function handleClick
   * @description Maneja el clic en la tarjeta
   */
  const handleClick = (): void => {
    if (!loading && tieneAcceso && seccion.habilitado) {
      onClick(seccion.id);
    }
  };

  /**
   * @function formatearFecha
   * @description Formatea la fecha de última actualización
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatearFecha = (fecha: string): string => {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Determinar si la tarjeta está deshabilitada
  const estaDeshabilitada = !seccion.habilitado || !tieneAcceso || loading;

  // Estilos dinámicos según el estado
  const cardClasses = `
    relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
    ${estaDeshabilitada
      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-1'
    }
    ${loading ? 'animate-pulse' : ''}
    ${className}
  `.trim();

  // Obtener el componente de icono
  const IconoSeccion = seccion.icono as React.ComponentType<any>;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Indicador de color superior */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: seccion.color }}
      />

      {/* Contenido principal */}
      <div className="p-6">
        {/* Header con icono y título */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{
                backgroundColor: `${seccion.color}15`,
                color: seccion.color
              }}
            >
              {loading ? (
                <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
              ) : (
                <IconoSeccion size={24} />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {loading ? (
                  <div className="h-4 bg-gray-300 rounded w-32 animate-pulse" />
                ) : (
                  seccion.nombre
                )}
              </h3>

              {/* Indicadores de estado */}
              <div className="flex items-center space-x-2">
                {!tieneAcceso && (
                  <div className="flex items-center text-red-500 text-xs">
                    <Lock size={12} className="mr-1" />
                    Sin acceso
                  </div>
                )}

                {seccion.cantidadOpciones && (
                  <span className="text-xs text-gray-500">
                    {seccion.cantidadOpciones} opciones
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Indicador de carga o flecha */}
          <div className="flex items-center">
            {loading ? (
              <div className="w-5 h-5 bg-gray-300 rounded animate-pulse" />
            ) : (
              <ChevronRight
                size={20}
                className={`transition-transform duration-200 ${
                  estaDeshabilitada ? 'text-gray-400' : 'text-gray-600 group-hover:translate-x-1'
                }`}
              />
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {loading ? (
            <>
              <div className="h-3 bg-gray-300 rounded w-full mb-2 animate-pulse" />
              <div className="h-3 bg-gray-300 rounded w-3/4 animate-pulse" />
            </>
          ) : (
            seccion.descripcion
          )}
        </p>

        {/* Footer con información adicional */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>
              {loading ? (
                <div className="h-2 bg-gray-300 rounded w-16 animate-pulse" />
              ) : seccion.ultimaActualizacion ? (
                `Actualizado ${formatearFecha(seccion.ultimaActualizacion)}`
              ) : (
                'Sin actualizaciones'
              )}
            </span>
          </div>

          {/* Estado habilitado/deshabilitado */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                seccion.habilitado ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span>
              {seccion.habilitado ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Overlay para estados especiales */}
      {(!tieneAcceso || !seccion.habilitado) && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center">
          {!tieneAcceso && (
            <div className="text-center text-gray-600">
              <Lock size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">Acceso restringido</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};