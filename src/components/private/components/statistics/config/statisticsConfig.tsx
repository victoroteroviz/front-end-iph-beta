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
    ruta: STATISTICS_ROUTES.USUARIOS_IPH
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
    ruta: STATISTICS_ROUTES.JUSTICIA_CIVICA
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
    ruta: STATISTICS_ROUTES.PROBABLE_DELICTIVO
  },
  {
    id: 'iph-rango',
    titulo: 'Iph\'s por fechas',
    descripcion: 'El siguiente gráfico muestra la cantidad de Iph\'s creados en un rango de fechas específico. Se puede seleccionar a un usuario y mostrar sus estadísticas individuales.',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25H8.25a2.25 2.25 0 00-2.25 2.25v15A2.25 2.25 0 008.25 21h7.5a2.25 2.25 0 002.25-2.25V9.75L12 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25v5.25c0 .621.504 1.125 1.125 1.125H18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 20.25a4.5 4.5 0 019 0" />
      </svg>
    ),
    habilitado: false
  },
  {
    id: 'Mapas de calor',
    titulo: 'Mapas de Calor',
    descripcion: 'Visualización de datos geoespaciales mediante mapas de calor para identificar zonas de alta incidencia delictiva',
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.008v.008H9V12zm0-3h.008v.008H9V9zm6 3h.008v.008H15V12z" />
      </svg>
    ),
    habilitado: false,
    color: STATISTICS_COLORS.IPH_SECONDARY,
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
    habilitado: false,
    color: STATISTICS_COLORS.WARNING,
    ruta: STATISTICS_ROUTES.INVENTARIO
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
    habilitado: false,
    color: STATISTICS_COLORS.DANGER,
    ruta: STATISTICS_ROUTES.USUARIOS
  },

  
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
