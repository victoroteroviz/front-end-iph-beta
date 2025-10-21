/**
 * Configuración centralizada de colores para gráficas de estadísticas
 * Define paletas de colores para diferentes tipos de estadísticas
 *
 * @module colorsConfig
 * @version 1.0.0
 */

/**
 * Colores para gráficas de Justicia Cívica
 * Paleta de tonos tierra y dorados
 */
export const JC_COLORS = {
  /** Color para estadísticas diarias */
  diaria: '#4d4725',
  /** Color para estadísticas mensuales */
  mensual: '#b8ab84',
  /** Color para estadísticas anuales */
  anual: '#c2b186'
} as const;

/**
 * Colores para gráficas de Probable Delictivo
 * Paleta de tonos café y terracota
 */
export const PD_COLORS = {
  /** Color para estadísticas diarias */
  diaria: '#8b5a3c',
  /** Color para estadísticas mensuales */
  mensual: '#d4a574',
  /** Color para estadísticas anuales */
  anual: '#c2926a'
} as const;

/**
 * Colores del tema general de la aplicación
 * Basado en la paleta IPH establecida
 */
export const THEME_COLORS = {
  /** Color primario del tema */
  primary: '#4d4725',
  /** Color secundario del tema */
  secondary: '#948b54',
  /** Color de acento */
  accent: '#b8ab84',
  /** Color de fondo principal */
  background: '#f8f0e7',
  /** Color para errores */
  error: '#dc3545',
  /** Color para éxito */
  success: '#28a745',
  /** Color para advertencias */
  warning: '#ffc107',
  /** Color para información */
  info: '#17a2b8',
  /** Color de texto principal */
  textPrimary: '#4d4725',
  /** Color de texto secundario */
  textSecondary: '#6c757d',
  /** Color de bordes */
  border: '#dee2e6',
  /** Color de fondo secundario */
  backgroundSecondary: '#ffffff'
} as const;

/**
 * Colores para gráficas de barras
 * Incluye variaciones para diferentes estados
 */
export const CHART_COLORS = {
  /** Color para barras con detenido */
  conDetenido: '#4d4725',
  /** Color para barras sin detenido */
  sinDetenido: '#b8ab84',
  /** Color para hover */
  hover: '#948b54',
  /** Color para selección */
  selected: '#c2b186',
  /** Color para grid */
  grid: '#e0e0e0',
  /** Color para ejes */
  axis: '#6c757d',
  /** Color para labels */
  label: '#4d4725'
} as const;

/**
 * Gradientes para fondos de cards
 */
export const GRADIENT_COLORS = {
  /** Gradiente dorado (Justicia Cívica) */
  golden: {
    start: '#f8f0e7',
    end: '#c2b186'
  },
  /** Gradiente café (Probable Delictivo) */
  brown: {
    start: '#f5e6d3',
    end: '#d4a574'
  },
  /** Gradiente primario */
  primary: {
    start: '#4d4725',
    end: '#948b54'
  }
} as const;

/**
 * Opacidades estándar para uso en la aplicación
 */
export const OPACITIES = {
  /** Opacidad muy baja (hover sutil) */
  veryLow: 0.1,
  /** Opacidad baja (overlays sutiles) */
  low: 0.2,
  /** Opacidad media (backgrounds) */
  medium: 0.5,
  /** Opacidad alta (elementos semi-visibles) */
  high: 0.7,
  /** Opacidad muy alta (casi opaco) */
  veryHigh: 0.9,
  /** Completamente opaco */
  full: 1.0
} as const;

/**
 * Utilidad para obtener color con opacidad
 *
 * @param hexColor - Color en formato hexadecimal (#RRGGBB)
 * @param opacity - Opacidad (0-1)
 * @returns Color en formato rgba
 *
 * @example
 * ```typescript
 * const colorTransparente = getColorWithOpacity('#4d4725', 0.5);
 * // Returns: "rgba(77, 71, 37, 0.5)"
 * ```
 */
export const getColorWithOpacity = (hexColor: string, opacity: number): string => {
  // Remover el # si existe
  const hex = hexColor.replace('#', '');

  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Utilidad para obtener colores por tipo de estadística
 *
 * @param tipo - Tipo de estadística ('jc' o 'pd')
 * @returns Objeto con colores del tipo
 *
 * @example
 * ```typescript
 * const colors = getColorsByType('jc');
 * // Returns: { diaria: '#4d4725', mensual: '#b8ab84', anual: '#c2b186' }
 * ```
 */
export const getColorsByType = (tipo: 'jc' | 'pd') => {
  return tipo === 'jc' ? JC_COLORS : PD_COLORS;
};

/**
 * Exportar todos los colores como un solo objeto
 * Para uso conveniente cuando se necesitan múltiples paletas
 */
export const ALL_COLORS = {
  jc: JC_COLORS,
  pd: PD_COLORS,
  theme: THEME_COLORS,
  chart: CHART_COLORS,
  gradient: GRADIENT_COLORS,
  opacity: OPACITIES
} as const;

/**
 * Tipo para colores de estadísticas (union type)
 */
export type StatisticsColorType = 'diaria' | 'mensual' | 'anual';

/**
 * Tipo para tipos de estadísticas
 */
export type StatisticsType = 'jc' | 'pd';
