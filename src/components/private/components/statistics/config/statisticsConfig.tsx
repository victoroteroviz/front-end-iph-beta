import type { IStatisticCard } from '../../../../../interfaces/IStatistic';
import { STATISTICS_COLORS, STATISTICS_ROUTES } from './constants';

/**
 * Configuración de las tarjetas de estadísticas
 * Aquí puedes agregar, modificar o deshabilitar tarjetas de estadísticas
 */
export const statisticsCardsConfig: IStatisticCard[] = [
  {
    id: 'usuarios-iph',
    titulo: 'Usuarios y Creación de IPH',
    descripcion: 'Analiza los 10 usuarios que más IPH han creado y los 10 que menos han elaborado',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.765z" />
      </svg>
    ),
    habilitado: true,
    color: STATISTICS_COLORS.IPH_PRIMARY,
    ruta: STATISTICS_ROUTES.VENTAS
  },
  {
    id: 'uso-fuerza',
    titulo: 'Reportes de Uso de la Fuerza',
    descripcion: 'Estadísticas sobre uso de la fuerza, personas heridas y fallecidos en operativos',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    habilitado: true,
    color: STATISTICS_COLORS.DANGER,
    ruta: STATISTICS_ROUTES.USUARIOS
  },
  {
    id: 'objetos-armas',
    titulo: 'Objetos y Armas Confiscadas',
    descripcion: 'Registro y estadísticas de objetos, armas y evidencias confiscadas en operativos',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    habilitado: true,
    color: STATISTICS_COLORS.WARNING,
    ruta: STATISTICS_ROUTES.INVENTARIO
  },
  {
    id: 'justicia-civica',
    titulo: 'IPH de Justicia Cívica',
    descripcion: 'Informes de justicia cívica elaborados con análisis anual, mensual y semanal',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    habilitado: true,
    color: STATISTICS_COLORS.IPH_SECONDARY,
    ruta: STATISTICS_ROUTES.FINANCIERO
  },
  {
    id: 'hecho-delictivo',
    titulo: 'IPH de Probable Hecho Delictivo',
    descripcion: 'Informes de probable hecho delictivo con análisis anual, mensual y semanal',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
    habilitado: true,
    color: STATISTICS_COLORS.IPH_DARK,
    ruta: STATISTICS_ROUTES.RENDIMIENTO
  },
  {
    id: 'marketing',
    titulo: 'Estadísticas de Marketing',
    descripcion: 'Analiza campañas, conversiones y ROI de estrategias de marketing',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
    habilitado: false, // Próximamente
    color: STATISTICS_COLORS.ORANGE,
    ruta: STATISTICS_ROUTES.MARKETING
  }
];

/**
 * Función helper para obtener una tarjeta por ID
 */
export const getStatisticCardById = (id: string): IStatisticCard | undefined => {
  return statisticsCardsConfig.find(card => card.id === id);
};

/**
 * Función helper para obtener todas las tarjetas habilitadas
 */
export const getEnabledStatisticCards = (): IStatisticCard[] => {
  return statisticsCardsConfig.filter(card => card.habilitado);
};

/**
 * Función helper para obtener todas las tarjetas deshabilitadas
 */
export const getDisabledStatisticCards = (): IStatisticCard[] => {
  return statisticsCardsConfig.filter(card => !card.habilitado);
};
