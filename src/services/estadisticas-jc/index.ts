/**
 * @file index.ts
 * @description Barrel export para servicios de estadísticas de Justicia Cívica
 * @module services/estadisticas-jc
 */

export {
  getJusticiaCivicaDiaria,
  getJusticiaCivicaMensual,
  getJusticiaCivicaAnual
} from './get-jc.service';
