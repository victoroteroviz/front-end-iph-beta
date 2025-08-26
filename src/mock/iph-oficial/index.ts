/**
 * Barrel export para mocks de IPH Oficial
 * Facilita la importación de datos mock
 */

// Mock data principal
export {
  iphOficialMockData,
  getIphOficialMockById,
  mockDelay
} from './iphOficial.mock';

// Mock data por secciones
export {
  estatusMock,
  tipoMock,
  primerRespondienteMock,
  conocimientoHechoMock,
  lugarIntervencionMock,
  narrativaHechosMock,
  detencionPertenenciasMock,
  inspeccionVehiculoMock,
  armasObjetosMock,
  usoFuerzaMock,
  entregaRecepcionMock,
  continuacionMock,
  fotosLugarMock,
  disposicionOficialMock,
  entrevistasMock
} from './iphOficial.mock';

// Re-export de interfaces para conveniencia
export type {
  IphOficialData,
  ConocimientoHecho,
  LugarIntervencion,
  NarrativaHechos,
  DetencionPertenencias,
  InspeccionVehiculo,
  ArmasObjetos,
  UsoFuerza,
  EntregaRecepcion,
  Continuacion,
  FotoLugar,
  DisposicionOficial,
  Entrevista,
  IphOficialResponse
} from '../../interfaces/components/iphOficial.interface';