import type { IReporteCard } from '../../../../../interfaces/IReporte';
import { REPORTES_COLORS, REPORTES_ENDPOINTS } from './constants';

/**
 * Configuración de las tarjetas de reportes PDF
 *
 * @description
 * Define todas las tarjetas de reportes disponibles en el sistema.
 * Cada tarjeta representa un tipo de reporte PDF que se puede generar.
 *
 * @usage
 * Para agregar un nuevo reporte:
 * 1. Agregar el endpoint en REPORTES_ENDPOINTS (constants.ts)
 * 2. Agregar la configuración de la tarjeta aquí
 * 3. El sistema lo mostrará automáticamente en la UI
 *
 * Para deshabilitar un reporte:
 * - Cambiar `habilitado: false`
 *
 * @since 1.0.0
 */
export const reportesCardsConfig: IReporteCard[] = [
  {
    id: 'reporte-general',
    titulo: 'Reporte General de IPH',
    descripcion: 'Reporte completo con todas las estadísticas de IPH: Justicia Cívica y Probable Hecho Delictivo',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.IPH_PRIMARY,
    endpoint: REPORTES_ENDPOINTS.GENERAL,
    tipo: 'general',
    requiereFiltros: true,
  },
  {
    id: 'reporte-justicia-civica',
    titulo: 'Reporte de Justicia Cívica',
    descripcion: 'Reporte detallado de IPH de Justicia Cívica con estadísticas anuales, mensuales y semanales',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.IPH_SECONDARY,
    endpoint: REPORTES_ENDPOINTS.JUSTICIA_CIVICA,
    tipo: 'justicia-civica',
    requiereFiltros: true,
  },
  {
    id: 'reporte-probable-delictivo',
    titulo: 'Reporte de Probable Hecho Delictivo',
    descripcion: 'Reporte detallado de IPH de Probable Hecho Delictivo con análisis estadístico completo',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.IPH_DARK,
    endpoint: REPORTES_ENDPOINTS.PROBABLE_DELICTIVO,
    tipo: 'probable-delictivo',
    requiereFiltros: true,
  },
  {
    id: 'reporte-usuarios-iph',
    titulo: 'Reporte de Usuarios y Creación de IPH',
    descripcion: 'Análisis de productividad: usuarios que más IPH han creado y los que menos han elaborado',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.INFO,
    endpoint: REPORTES_ENDPOINTS.USUARIOS_IPH,
    tipo: 'usuarios',
    requiereFiltros: true,
  },
  {
    id: 'reporte-mensual',
    titulo: 'Reporte Mensual Consolidado',
    descripcion: 'Reporte ejecutivo mensual con todas las métricas y estadísticas consolidadas del mes',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.SUCCESS,
    endpoint: REPORTES_ENDPOINTS.MENSUAL,
    tipo: 'general',
    requiereFiltros: true,
  },
  {
    id: 'reporte-anual',
    titulo: 'Reporte Anual Consolidado',
    descripcion: 'Reporte ejecutivo anual con análisis completo de tendencias y métricas del año',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.WARNING,
    endpoint: REPORTES_ENDPOINTS.ANUAL,
    tipo: 'general',
    requiereFiltros: true,
  },
  {
    id: 'reporte-estadisticas-periodo',
    titulo: 'Reporte de Estadísticas por Periodo',
    descripcion: 'Reporte personalizado con estadísticas filtradas por periodo específico de tiempo',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.INFO,
    endpoint: REPORTES_ENDPOINTS.ESTADISTICAS_PERIODO,
    tipo: 'personalizado',
    requiereFiltros: true,
  },
  {
    id: 'reporte-mapas-calor',
    titulo: 'Reporte de Mapas de Calor',
    descripcion: 'Análisis geoespacial con mapas de calor para identificar zonas de alta incidencia',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    habilitado: false,
    color: REPORTES_COLORS.DANGER,
    endpoint: REPORTES_ENDPOINTS.MAPAS_CALOR,
    tipo: 'general',
    requiereFiltros: true,
  },
];

/**
 * Función helper para obtener una tarjeta de reporte por ID
 *
 * @param id - ID del reporte
 * @returns Tarjeta de reporte o undefined si no existe
 */
export const getReporteCardById = (id: string): IReporteCard | undefined => {
  return reportesCardsConfig.find(card => card.id === id);
};

/**
 * Función helper para obtener todas las tarjetas habilitadas
 *
 * @returns Array de tarjetas habilitadas
 */
export const getEnabledReporteCards = (): IReporteCard[] => {
  return reportesCardsConfig.filter(card => card.habilitado);
};

/**
 * Función helper para obtener todas las tarjetas deshabilitadas
 *
 * @returns Array de tarjetas deshabilitadas
 */
export const getDisabledReporteCards = (): IReporteCard[] => {
  return reportesCardsConfig.filter(card => !card.habilitado);
};

/**
 * Función helper para obtener tarjetas por tipo
 *
 * @param tipo - Tipo de reporte
 * @returns Array de tarjetas del tipo especificado
 */
export const getReporteCardsByTipo = (
  tipo: 'justicia-civica' | 'probable-delictivo' | 'general' | 'usuarios' | 'personalizado'
): IReporteCard[] => {
  return reportesCardsConfig.filter(card => card.tipo === tipo && card.habilitado);
};
