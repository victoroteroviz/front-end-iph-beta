/**
 * Interfaz para las tarjetas de reportes PDF
 *
 * @interface IReporteCard
 * @description Define la estructura de datos para cada tarjeta de reporte PDF
 *
 * @since 1.0.0
 * @author Senior Full-Stack Developer
 */
export interface IReporteCard {
  /** Identificador único del reporte */
  id: string;

  /** Título del reporte */
  titulo: string;

  /** Descripción detallada del reporte */
  descripcion: string;

  /** Icono del reporte (SVG React Node) */
  icono: React.ReactNode;

  /** Indica si el reporte está habilitado para generar */
  habilitado: boolean;

  /** Color del tema de la tarjeta (opcional) */
  color?: string;

  /** Endpoint del backend para generar el PDF */
  endpoint: string;

  /** Tipo de reporte (para clasificación) */
  tipo?: 'justicia-civica' | 'probable-delictivo' | 'general' | 'usuarios' | 'personalizado' | 'Owner';

  /** Indica si requiere filtros de fecha */
  requiereFiltros?: boolean;

  /** Parámetros adicionales para el reporte (opcional) */
  parametros?: Record<string, any>;
}

/**
 * Interfaz para la respuesta del servicio de generación de PDF
 *
 * @interface IReportePdfResponse
 */
export interface IReportePdfResponse {
  /** Indica si la generación fue exitosa */
  success: boolean;

  /** Mensaje de respuesta */
  message?: string;

  /** Blob del PDF generado */
  blob?: Blob;

  /** Nombre sugerido para el archivo */
  filename?: string;

  /** URL temporal del PDF (si aplica) */
  url?: string;
}

/**
 * Interfaz para los filtros de reportes
 *
 * @interface IReporteFiltros
 */
export interface IReporteFiltros {
  /** Fecha de inicio del periodo */
  fechaInicio?: Date | string;

  /** Fecha de fin del periodo */
  fechaFin?: Date | string;

  /** Tipo de periodo (día, semana, mes, año) */
  periodo?: 'dia' | 'semana' | 'mes' | 'anio' | 'personalizado';

  /** ID de usuario (para reportes por usuario) */
  usuarioId?: string;

  /** Tipo de IPH */
  tipoIph?: 'justicia-civica' | 'probable-delictivo' | 'todos';

  /** Parámetros adicionales */
  [key: string]: any;
}

/**
 * Estado del proceso de generación de PDF
 *
 * @interface IReporteEstado
 */
export interface IReporteEstado {
  /** Indica si está generando el PDF */
  generando: boolean;

  /** Porcentaje de progreso (0-100) */
  progreso?: number;

  /** Mensaje de estado */
  mensaje?: string;

  /** Error si ocurrió alguno */
  error?: string | null;

  /** ID del reporte siendo generado */
  reporteId?: string | null;
}
