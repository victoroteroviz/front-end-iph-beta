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
    id: 'reporte-diario',
    titulo: 'Reporte Diario Operativo',
    descripcion: 'Genera el informe diario con métricas de uso y actividades, incluye carga opcional de evidencias fotográficas.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6.75C3 5.784 3.784 5 4.75 5h14.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0119.25 19H4.75A1.75 1.75 0 013 17.25V6.75zm3.5 0V4.75A1.75 1.75 0 018.25 3h7.5A1.75 1.75 0 0117.5 4.75V6.75M8 12h8m-8 4h5" />
      </svg>
    ),
    habilitado: true,
    color: REPORTES_COLORS.IPH_PRIMARY,
    endpoint: REPORTES_ENDPOINTS.DIARIO,
    tipo: 'Owner',
    requiereFiltros: false,
    parametros: {
      requiereFormulario: true
    }
  },
  {
    id: 'reporte-general',
    titulo: 'Reporte General de IPH',
    descripcion: 'Reporte completo con todas las estadísticas de IPH: Justicia Cívica y Probable Hecho Delictivo',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="reporte-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    habilitado: false,
    color: REPORTES_COLORS.IPH_PRIMARY,
    endpoint: '',
    tipo: undefined,
    requiereFiltros: false,
    parametros:{
      requiereFormulario: false
    }
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
