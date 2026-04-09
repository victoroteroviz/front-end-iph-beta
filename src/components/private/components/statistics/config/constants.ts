/**
 * Constantes y utilidades para la configuración de estadísticas
 */

/**
 * Paleta de colores estandarizada para las tarjetas de estadísticas
 * Usar estos colores asegura consistencia visual en toda la aplicación
 */
export const STATISTICS_COLORS = {
  // Colores IPH principales
  IPH_PRIMARY: 'var(--color-iph-primary)',
  IPH_SECONDARY: 'var(--color-iph-secondary)',
  IPH_DARK: 'var(--color-iph-tertiary)',
  IPH_LIGHT: 'var(--color-iph-background)',

  // Colores de estado
  SUCCESS: 'var(--color-chart-emerald)',      // Verde - Para datos positivos
  WARNING: 'var(--color-state-warning)',      // Ámbar - Para alertas
  DANGER: 'var(--color-state-danger-strong)', // Rojo - Para datos críticos
  INFO: 'var(--color-state-info-cyan)',       // Cyan - Para información

  // Colores adicionales
  INDIGO: 'var(--color-chart-indigo)',
  VIOLET: 'var(--color-chart-violet)',
  PURPLE: 'var(--color-chart-purple)',
  PINK: 'var(--color-chart-pink)',
  ORANGE: 'var(--color-chart-orange)',
  EMERALD: 'var(--color-chart-emerald)',
  TEAL: 'var(--color-chart-teal)',
  BLUE: 'var(--color-chart-blue)',
  SKY: 'var(--color-chart-sky)'
} as const;

/**
 * Colores para gráficas de Justicia Cívica
 */
export const JC_COLORS = {
  diaria: 'var(--color-iph-primary)',
  mensual: 'var(--color-iph-secondary)',
  anual: 'var(--color-iph-tertiary)'
} as const;

/**
 * Colores para gráficas de Probable Delictivo
 */
export const PD_COLORS = {
  diaria: 'var(--color-pd-diaria)',
  mensual: 'var(--color-pd-mensual)',
  anual: 'var(--color-pd-anual)'
} as const;

/**
 * Categorías de estadísticas para agrupar tarjetas relacionadas
 */
export const STATISTICS_CATEGORIES = {
  FINANCIAL: 'financiero',
  OPERATIONAL: 'operacional',
  USERS: 'usuarios',
  INVENTORY: 'inventario',
  MARKETING: 'marketing',
  SECURITY: 'seguridad',
  PERFORMANCE: 'rendimiento',
  REPORTS: 'reportes'
} as const;

/**
 * Estados disponibles para las tarjetas de estadísticas
 */
export const CARD_STATUS = {
  ENABLED: true,
  DISABLED: false
} as const;

/**
 * Rutas base para las diferentes secciones de estadísticas
 */
export const STATISTICS_ROUTES = {
  BASE: '/estadisticasusuario',
  USUARIOS_IPH: '/estadisticasusuario/usuarios-iph',
  JUSTICIA_CIVICA: '/estadisticasusuario/justicia-civica',
  PROBABLE_DELICTIVO: '/estadisticasusuario/probable-delictivo',
  // Legacy routes (deprecadas)
  VENTAS: '/estadisticas/ventas',
  USUARIOS: '/estadisticas/usuarios',
  INVENTARIO: '/estadisticas/inventario',
  FINANCIERO: '/estadisticas/financiero',
  RENDIMIENTO: '/estadisticas/rendimiento',
  MARKETING: '/estadisticas/marketing'
} as const;

/**
 * Configuración de animaciones para las tarjetas
 */
export const ANIMATION_CONFIG = {
  DURATION: 200, // Milisegundos
  EASING: 'ease-in-out',
  HOVER_SCALE: 1.02,
  HOVER_TRANSLATE_Y: -2
} as const;

/**
 * Tamaños de iconos para diferentes contextos
 */
export const ICON_SIZES = {
  SMALL: 24,
  MEDIUM: 28,
  LARGE: 32,
  XLARGE: 40
} as const;

/**
 * Breakpoints para diseño responsive
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
} as const;

/**
 * Helper: Obtener ruta completa para una estadística
 */
export const getStatisticRoute = (id: string): string => {
  return `${STATISTICS_ROUTES.BASE}/${id}`;
};

/**
 * Helper: Validar si un color es hexadecimal válido
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Helper: Obtener color por categoría
 */
export const getColorByCategory = (category: string): string => {
  const categoryColors: Record<string, string> = {
    [STATISTICS_CATEGORIES.FINANCIAL]: STATISTICS_COLORS.VIOLET,
    [STATISTICS_CATEGORIES.OPERATIONAL]: STATISTICS_COLORS.IPH_PRIMARY,
    [STATISTICS_CATEGORIES.USERS]: STATISTICS_COLORS.EMERALD,
    [STATISTICS_CATEGORIES.INVENTORY]: STATISTICS_COLORS.ORANGE,
    [STATISTICS_CATEGORIES.MARKETING]: STATISTICS_COLORS.PINK,
    [STATISTICS_CATEGORIES.SECURITY]: STATISTICS_COLORS.DANGER,
    [STATISTICS_CATEGORIES.PERFORMANCE]: STATISTICS_COLORS.INFO,
    [STATISTICS_CATEGORIES.REPORTS]: STATISTICS_COLORS.INDIGO
  };

  return categoryColors[category] || STATISTICS_COLORS.IPH_PRIMARY;
};

/**
 * Helper: Formatear título para ID
 * Ejemplo: "Estadísticas de Ventas" -> "estadisticas-de-ventas"
 */
export const titleToId = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^\w-]/g, ''); // Remover caracteres especiales
};

/**
 * Helper: Generar ruta desde título
 */
export const generateRouteFromTitle = (title: string): string => {
  return getStatisticRoute(titleToId(title));
};
