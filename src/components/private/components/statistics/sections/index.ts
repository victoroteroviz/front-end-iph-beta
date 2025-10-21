/**
 * Barrel export para secciones de componentes de estadísticas
 */

// Secciones de Justicia Cívica
export { EstadisticasJCHeader, type EstadisticasJCHeaderProps } from './EstadisticasJCHeader';
export { EstadisticasJCGraficas, type EstadisticasJCGraficasProps } from './EstadisticasJCGraficas';
export { EstadisticasJCResumen, type EstadisticasJCResumenProps } from './EstadisticasJCResumen';
export { EstadisticasJCFooter, type EstadisticasJCFooterProps } from './EstadisticasJCFooter';

// Secciones de Probable Delictivo
export { ProbableDelictivoHeader, type ProbableDelictivoHeaderProps } from './ProbableDelictivoHeader';
export { ProbableDelictivoGraficas, type ProbableDelictivoGraficasProps } from './ProbableDelictivoGraficas';
export { ProbableDelictivoResumen, type ProbableDelictivoResumenProps } from './ProbableDelictivoResumen';

// Footer es compartido con JC
export { EstadisticasJCFooter as ProbableDelictivoFooter } from './EstadisticasJCFooter';
