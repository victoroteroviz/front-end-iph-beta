/**
 * @fileoverview Interfaces para el componente de Ajustes del sistema IPH
 * @version 1.0.0
 * @description Define las interfaces para la gestión de ajustes y configuraciones del sistema
 */

import { ReactNode } from 'react';

/**
 * @interface IAjusteSeccion
 * @description Define una sección de ajustes dentro del sistema
 */
export interface IAjusteSeccion {
  /** Identificador único de la sección */
  id: string;
  /** Nombre de la sección */
  nombre: string;
  /** Descripción de la sección */
  descripcion: string;
  /** Icono de la sección (componente React) */
  icono: ReactNode;
  /** Color del tema de la sección */
  color: string;
  /** Indica si la sección está habilitada */
  habilitado: boolean;
  /** Nivel de acceso requerido para la sección */
  nivelAcceso: string[];
  /** Ruta de navegación de la sección */
  ruta?: string;
  /** Número de opciones dentro de la sección */
  cantidadOpciones?: number;
  /** Fecha de última actualización */
  ultimaActualizacion?: string;
}

/**
 * @interface IAjusteOpcion
 * @description Define una opción específica dentro de una sección de ajustes
 */
export interface IAjusteOpcion {
  /** Identificador único de la opción */
  id: string;
  /** ID de la sección padre */
  seccionId: string;
  /** Nombre de la opción */
  nombre: string;
  /** Descripción de la opción */
  descripcion: string;
  /** Icono de la opción */
  icono: ReactNode;
  /** Indica si la opción está habilitada */
  habilitado: boolean;
  /** Acción a ejecutar al seleccionar la opción */
  accion: () => void;
  /** Nivel de acceso requerido */
  nivelAcceso: string[];
  /** Indica si es una acción peligrosa */
  esPeligrosa?: boolean;
}

/**
 * @interface IAjustesConfig
 * @description Configuración general del componente de ajustes
 */
export interface IAjustesConfig {
  /** Título principal de la página de ajustes */
  titulo: string;
  /** Subtítulo descriptivo */
  subtitulo: string;
  /** Indica si se muestran las estadísticas de uso */
  mostrarEstadisticas: boolean;
  /** Configuración de temas */
  temas: {
    primario: string;
    secundario: string;
    fondo: string;
  };
}

/**
 * @interface IAjustesEstadisticas
 * @description Estadísticas de uso del sistema de ajustes
 */
export interface IAjustesEstadisticas {
  /** Total de secciones disponibles */
  totalSecciones: number;
  /** Total de opciones configurables */
  totalOpciones: number;
  /** Secciones más utilizadas */
  seccionesMasUsadas: {
    nombre: string;
    usos: number;
  }[];
  /** Última actividad del usuario */
  ultimaActividad: string;
}

/**
 * @interface IAjustesResponse
 * @description Respuesta del servicio de ajustes
 */
export interface IAjustesResponse {
  /** Configuración general */
  configuracion: IAjustesConfig;
  /** Lista de secciones disponibles */
  secciones: IAjusteSeccion[];
  /** Estadísticas de uso */
  estadisticas: IAjustesEstadisticas;
  /** Estado de la respuesta */
  success: boolean;
  /** Mensaje de la respuesta */
  message: string;
}

/**
 * @interface ICatalogoItem
 * @description Estructura de un item de catálogo para administración
 */
export interface ICatalogoItem {
  /** ID único del item */
  id: number;
  /** Nombre del item */
  nombre: string;
  /** Descripción del item */
  descripcion?: string;
  /** Estado activo/inactivo */
  activo: boolean;
  /** Fecha de creación */
  fechaCreacion: string;
  /** Fecha de última actualización */
  fechaActualizacion?: string;
  /** Usuario que creó el item */
  creadoPor: string;
}

/**
 * @interface ICatalogo
 * @description Estructura de un catálogo completo
 */
export interface ICatalogo {
  /** ID único del catálogo */
  id: string;
  /** Nombre del catálogo */
  nombre: string;
  /** Descripción del catálogo */
  descripcion: string;
  /** Items del catálogo */
  items: ICatalogoItem[];
  /** Total de items */
  totalItems: number;
  /** Permisos para el catálogo */
  permisos: {
    leer: boolean;
    crear: boolean;
    actualizar: boolean;
    eliminar: boolean;
  };
}