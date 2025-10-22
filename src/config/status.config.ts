/**
 * Configuración de estatus de IPH
 * Define colores y etiquetas para los diferentes estados de un IPH
 *
 * @fileoverview Centraliza la configuración visual de los estatus del sistema IPH
 * @version 1.0.0
 * @since 2024-01-30
 */

/**
 * Interface para la configuración de un estatus
 */
export interface StatusConfig {
  /** Color del texto */
  color: string;

  /** Color de fondo */
  bgColor: string;

  /** Etiqueta a mostrar */
  label: string;
}

/**
 * Tipo para los estatus válidos del sistema
 */
export type StatusType = 'Activo' | 'Inactivo' | 'Pendiente' | 'Cancelado' | 'N/D';

/**
 * Configuración de colores y etiquetas para cada estatus
 *
 * @description
 * - **Activo**: IPH en proceso activo de investigación
 * - **Inactivo**: IPH archivado o sin actividad
 * - **Pendiente**: IPH esperando información o acción
 * - **Cancelado**: IPH cancelado por resolución o acuerdo
 * - **N/D**: Estatus no disponible o desconocido
 */
export const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  Activo: {
    color: '#10b981', // green-500
    bgColor: '#dcfce7', // green-100
    label: 'Activo'
  },
  Inactivo: {
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    label: 'Inactivo'
  },
  Pendiente: {
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    label: 'Pendiente'
  },
  Cancelado: {
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    label: 'Cancelado'
  },
  'N/D': {
    color: '#6b7280', // gray-500
    bgColor: '#e5e7eb', // gray-200
    label: 'No Disponible'
  }
} as const;

/**
 * Obtiene la configuración de un estatus de forma segura
 *
 * @param status - Estatus a consultar
 * @returns Configuración del estatus o configuración por defecto (N/D)
 *
 * @example
 * ```typescript
 * const config = getStatusConfig('Activo');
 * console.log(config.color); // '#10b981'
 * console.log(config.label); // 'Activo'
 * ```
 */
export const getStatusConfig = (status: string): StatusConfig => {
  return STATUS_CONFIG[status as StatusType] || STATUS_CONFIG['N/D'];
};

/**
 * Verifica si un estatus es válido
 *
 * @param status - Estatus a verificar
 * @returns true si el estatus existe en la configuración
 *
 * @example
 * ```typescript
 * isValidStatus('Activo'); // true
 * isValidStatus('Invalido'); // false
 * ```
 */
export const isValidStatus = (status: string): status is StatusType => {
  return status in STATUS_CONFIG && status !== 'N/D';
};

/**
 * Obtiene la lista de estatus válidos
 *
 * @returns Array con los estatus válidos (excluyendo N/D)
 */
export const getValidStatuses = (): StatusType[] => {
  return Object.keys(STATUS_CONFIG).filter(key => key !== 'N/D') as StatusType[];
};
