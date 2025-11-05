/**
 * Barrel export para el módulo de Reportes PDF
 */
export { default } from './ReportesPdf';
export { default as ReportesPdf } from './ReportesPdf';

// Exports de configuración
export * from './config';

// Exports de hooks
export { default as useReportesPdf } from './hooks/useReportesPdf';

// Exports de servicios
export * from './services/reportes-pdf.service';
