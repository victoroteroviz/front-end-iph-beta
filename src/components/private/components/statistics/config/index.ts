/**
 * Exportaciones centralizadas de la configuración de estadísticas
 */

// Configuración de tarjetas
export {
  statisticsCardsConfig,
  getStatisticCardById,
  getEnabledStatisticCards,
  getDisabledStatisticCards
} from './statisticsConfig';

// Constantes y utilidades
export {
  STATISTICS_COLORS,
  STATISTICS_CATEGORIES,
  CARD_STATUS,
  STATISTICS_ROUTES,
  ANIMATION_CONFIG,
  ICON_SIZES,
  BREAKPOINTS,
  getStatisticRoute,
  isValidHexColor,
  getColorByCategory,
  titleToId,
  generateRouteFromTitle
} from './constants';

// Configuración de colores para gráficas
export {
  JC_COLORS,
  PD_COLORS,
  THEME_COLORS,
  CHART_COLORS,
  GRADIENT_COLORS,
  OPACITIES,
  ALL_COLORS,
  getColorWithOpacity,
  getColorsByType,
  type StatisticsColorType,
  type StatisticsType
} from './colorsConfig';
