/**
 * Barrel export para componentes de estadísticas
 * Facilita importaciones limpias
 */

// Componente de Estadísticas de Usuarios (existente)
export { default as Estadisticas } from './Estadisticas';

// Componente de Estadísticas de Justicia Cívica (nuevo)
export { default as EstadisticasJC } from './EstadisticasJC';
export { default as EstadisticaJCCard } from './components/EstadisticaJCCard';
export { default as FiltroFechaJC } from './components/FiltroFechaJC';
export { default as GraficaBarrasJC } from './components/GraficaBarrasJC';
export { default as GraficaPromedioJC } from './components/GraficaPromedioJC';

// Hook de Estadísticas JC
export { useEstadisticasJC } from './hooks/useEstadisticasJC';
export type { TipoPeriodo } from './hooks/useEstadisticasJC';
