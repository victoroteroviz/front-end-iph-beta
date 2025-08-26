/**
 * Barrel export para mocks de historial IPH
 * Facilita la importación de datos mock
 */

// Registros mock
export {
  registrosMockData,
  getRegistrosPaginated,
  filterRegistros,
  getRegistroById
} from './registros.mock';

// Estadísticas mock
export {
  estadisticasMockData,
  getEstadisticasWithFilters,
  estatusConfig,
  tiposDelitoOptions
} from './estadisticas.mock';

// Re-export de interfaces para conveniencia
export type {
  RegistroHistorialIPH,
  EstadisticasHistorial,
  FiltrosHistorial,
  PaginacionHistorial,
  HistorialIPHResponse
} from '../../interfaces/components/historialIph.interface';