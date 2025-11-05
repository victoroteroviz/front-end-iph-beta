/**
 * Constantes para el módulo de Reportes PDF
 *
 * @description
 * Centraliza todos los valores constantes utilizados en el sistema de reportes PDF
 *
 * @since 1.0.0
 * @author Senior Full-Stack Developer
 */

/**
 * Colores temáticos para las tarjetas de reportes
 */
export const REPORTES_COLORS = {
  /** Color primario del tema IPH */
  IPH_PRIMARY: '#c2b186',

  /** Color secundario del tema IPH */
  IPH_SECONDARY: '#948b54',

  /** Color oscuro del tema IPH */
  IPH_DARK: '#4d4725',

  /** Color de éxito */
  SUCCESS: '#10b981',

  /** Color de advertencia */
  WARNING: '#f59e0b',

  /** Color de peligro */
  DANGER: '#ef4444',

  /** Color de información */
  INFO: '#3b82f6',

  /** Color para reportes generales */
  GENERAL: '#6b7280',
} as const;

/**
 * Endpoints del backend para generación de PDFs
 *
 * @description
 * Rutas de la API que generan los diferentes tipos de reportes en PDF
 */
export const REPORTES_ENDPOINTS = {
  /** Reporte general de IPH */
  GENERAL: '/api/reportes/general',

  /** Reporte de Justicia Cívica */
  JUSTICIA_CIVICA: '/api/reportes/justicia-civica',

  /** Reporte de Probable Hecho Delictivo */
  PROBABLE_DELICTIVO: '/api/reportes/probable-delictivo',

  /** Reporte de usuarios y creación de IPH */
  USUARIOS_IPH: '/api/reportes/usuarios-iph',

  /** Reporte mensual consolidado */
  MENSUAL: '/api/reportes/mensual',

  /** Reporte anual consolidado */
  ANUAL: '/api/reportes/anual',

  /** Reporte personalizado con filtros */
  PERSONALIZADO: '/api/reportes/personalizado',

  /** Reporte de estadísticas por periodo */
  ESTADISTICAS_PERIODO: '/api/reportes/estadisticas-periodo',

  /** Reporte de mapas de calor */
  MAPAS_CALOR: '/api/reportes/mapas-calor',
} as const;

/**
 * Mensajes del sistema de reportes
 */
export const REPORTES_MENSAJES = {
  /** Generando PDF */
  GENERANDO: 'Generando reporte PDF...',

  /** PDF generado con éxito */
  EXITO: 'Reporte PDF generado exitosamente',

  /** Error al generar PDF */
  ERROR: 'Error al generar el reporte PDF',

  /** Reporte no disponible */
  NO_DISPONIBLE: 'Este reporte no está disponible actualmente',

  /** Descargando PDF */
  DESCARGANDO: 'Descargando reporte...',

  /** Validando filtros */
  VALIDANDO: 'Validando parámetros del reporte...',
} as const;

/**
 * Configuración de tiempos (en milisegundos)
 */
export const REPORTES_TIEMPOS = {
  /** Timeout para generación de PDF (2 minutos) */
  TIMEOUT_GENERACION: 120000,

  /** Delay para mostrar mensaje de loading (500ms) */
  DELAY_LOADING: 500,

  /** Tiempo de duración de notificaciones de éxito (3 segundos) */
  DURACION_NOTIFICACION_EXITO: 3000,

  /** Tiempo de duración de notificaciones de error (5 segundos) */
  DURACION_NOTIFICACION_ERROR: 5000,
} as const;

/**
 * Nombres de archivo por defecto para los PDFs
 */
export const REPORTES_NOMBRES_ARCHIVO = {
  GENERAL: 'reporte-iph-general',
  JUSTICIA_CIVICA: 'reporte-justicia-civica',
  PROBABLE_DELICTIVO: 'reporte-probable-delictivo',
  USUARIOS_IPH: 'reporte-usuarios-iph',
  MENSUAL: 'reporte-mensual',
  ANUAL: 'reporte-anual',
  PERSONALIZADO: 'reporte-personalizado',
  ESTADISTICAS_PERIODO: 'reporte-estadisticas',
  MAPAS_CALOR: 'reporte-mapas-calor',
} as const;

/**
 * Configuración de roles que pueden acceder a reportes
 */
export const REPORTES_ROLES_PERMITIDOS = {
  /** Roles que pueden generar reportes generales */
  GENERALES: ['SuperAdmin', 'Administrador', 'Superior'],

  /** Roles que pueden generar reportes sensibles */
  SENSIBLES: ['SuperAdmin', 'Administrador'],

  /** Roles que pueden generar reportes personalizados */
  PERSONALIZADOS: ['SuperAdmin', 'Administrador'],

  /** Roles que pueden ver todos los reportes */
  TODOS: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
} as const;
