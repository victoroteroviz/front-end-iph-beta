/**
 * Utilidades de transformación para IPH Oficial
 * Siguiendo principios SOLID - Single Responsibility
 *
 * @module IphOficialTransformation
 * @version 1.0.0
 */

import { logInfo, logDebug } from '../../helper/log/logger.helper';
import type { IphOficialData } from '../../interfaces/components/iphOficial.interface';
import type { ResponseIphData } from '../../interfaces/iph/iph.interface';

/**
 * Verifica si un valor del servidor es un array (dato inválido/no presente)
 * El backend retorna arrays vacíos cuando no hay datos en relaciones
 *
 * @param value - Valor a verificar
 * @returns true si es array, false si es objeto válido
 *
 * @example
 * ```typescript
 * isEmptyServerArray([]); // true
 * isEmptyServerArray(null); // false
 * isEmptyServerArray({ id: 1 }); // false
 * ```
 */
const isEmptyServerArray = (value: any): boolean => {
  return Array.isArray(value);
};

/**
 * Transforma un valor del servidor a tipo específico o undefined si es array vacío
 *
 * @param value - Valor del servidor
 * @returns El valor transformado o undefined
 *
 * @example
 * ```typescript
 * transformServerValue([]); // undefined
 * transformServerValue({ id: 1, name: 'Test' }); // { id: 1, name: 'Test' }
 * transformServerValue(null); // undefined
 * ```
 */
const transformServerValue = <T>(value: any): T | undefined => {
  if (isEmptyServerArray(value)) {
    return undefined;
  }
  return value as T;
};

/**
 * Transforma un array del servidor, retornando array vacío si es inválido
 *
 * @param value - Valor del servidor que debería ser un array
 * @returns Array transformado o vacío
 *
 * @example
 * ```typescript
 * transformServerArray([]); // []
 * transformServerArray([{ id: 1 }]); // [{ id: 1 }]
 * transformServerArray(null); // []
 * transformServerArray({ id: 1 }); // []
 * ```
 */
const transformServerArray = <T>(value: any): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value as T[];
};

/**
 * Normaliza el campo de observaciones
 * Proporciona valor por defecto si no existe
 *
 * @param observaciones - Observaciones del servidor
 * @returns Observaciones normalizadas
 *
 * @example
 * ```typescript
 * normalizeObservaciones('Observación importante'); // 'Observación importante'
 * normalizeObservaciones(''); // 'Sin observaciones'
 * normalizeObservaciones(null); // 'Sin observaciones'
 * normalizeObservaciones(undefined); // 'Sin observaciones'
 * ```
 */
export const normalizeObservaciones = (observaciones: string | undefined | null): string => {
  if (!observaciones || observaciones.trim() === '') {
    return 'Sin observaciones';
  }
  return observaciones.trim();
};

/**
 * Transforma datos del servidor (ResponseIphData) al formato del componente (IphOficialData)
 *
 * @param serverData - Datos del servidor en formato ResponseIphData
 * @returns Datos transformados en formato IphOficialData
 *
 * @throws Error si serverData no contiene datos válidos de IPH
 *
 * @example
 * ```typescript
 * const serverData = {
 *   iph: {
 *     id: 'GUGN01123060520252247',
 *     nReferencia: 'REF-2024-001',
 *     // ... otros campos
 *   },
 *   primerRespondiente: { nombre: 'Juan', apellidoPaterno: 'Pérez' },
 *   // ... otras relaciones
 * };
 *
 * const transformed = transformServerDataToComponent(serverData);
 * // transformed.id === 'GUGN01123060520252247'
 * // transformed.primerRespondiente === { nombre: 'Juan', apellidoPaterno: 'Pérez' }
 * ```
 */
export const transformServerDataToComponent = (serverData: ResponseIphData): IphOficialData => {
  const iphData = Array.isArray(serverData.iph) ? null : serverData.iph;

  if (!iphData) {
    throw new Error('Datos de IPH inválidos o vacíos en la respuesta del servidor');
  }

  logDebug('IphOficial Transformation', 'Iniciando transformación de datos del servidor', {
    id: iphData.id,
    referencia: iphData.nReferencia
  });

  // Transformar los campos any a tipos específicos
  const transformedData: IphOficialData = {
    // ==================== CAMPOS BASE ====================
    id: iphData.id,
    nReferencia: iphData.nReferencia,
    nFolioSist: iphData.nFolioSist,
    observaciones: normalizeObservaciones(iphData.observaciones),
    coordenadas: iphData.coordenadas,
    hechos: iphData.hechos,
    fechaCreacion: iphData.fechaCreacion,

    // ==================== RELACIONES SIMPLES ====================
    primerRespondiente: transformServerValue(serverData.primerRespondiente),
    estatus: iphData.estatus,

    // ==================== CAMPOS EXTENDIDOS (OBJETOS) ====================
    conocimiento_hecho: transformServerValue<any>(serverData.conocimientoHecho),
    lugar_intervencion: transformServerValue<any>(serverData.lugarIntervencion),
    narrativaHechos: transformServerValue<any>(serverData.narrativaHecho),
    uso_fuerza: transformServerValue<any>(serverData.usoFuerza),
    entrega_recepcion: transformServerValue<any>(serverData.entregaRecepcion),

    // ==================== CAMPOS EXTENDIDOS (ARRAYS) ====================
    detencion_pertenencias: transformServerArray<any>(serverData.detencion),
    cInspeccionVehiculo: transformServerArray<any>(serverData.inspeccionVehiculo),
    armas_objetos: transformServerArray<any>(serverData.armaObjeto),
    continuacion: transformServerArray<any>(serverData.continuacion),
    entrevistas: transformServerArray<any>(serverData.entrevista)
  };

  // Log de resultado de transformación con métricas
  const secciones = {
    conocimiento: !!transformedData.conocimiento_hecho,
    lugar: !!transformedData.lugar_intervencion,
    narrativa: !!transformedData.narrativaHechos,
    detencion: transformedData.detencion_pertenencias?.length || 0,
    vehiculos: transformedData.cInspeccionVehiculo?.length || 0,
    armas: transformedData.armas_objetos?.length || 0,
    fotos: transformedData.ruta_fotos_lugar?.length || 0,
    usoFuerza: !!transformedData.uso_fuerza,
    entregaRecepcion: !!transformedData.entrega_recepcion,
    continuacion: transformedData.continuacion?.length || 0,
    entrevistas: transformedData.entrevistas?.length || 0
  };

  logInfo('IphOficial Transformation', 'Transformación de datos completada exitosamente', {
    id: transformedData.id,
    referencia: transformedData.nReferencia,
    secciones
  });

  return transformedData;
};

/**
 * Extrae información básica de un IPH transformado
 * Útil para previsualizaciones o listados
 *
 * @param data - Datos completos del IPH
 * @returns Objeto con campos básicos
 *
 * @example
 * ```typescript
 * const fullData: IphOficialData = { ... };
 * const basicInfo = extractBasicInfo(fullData);
 * // basicInfo = { id, nReferencia, nFolioSist, estatus, tipoIph, fechaCreacion }
 * ```
 */
export const extractBasicInfo = (data: IphOficialData): Pick<IphOficialData, 'id' | 'nReferencia' | 'nFolioSist' | 'estatus' | 'tipoIph' | 'fechaCreacion'> => {
  return {
    id: data.id || '',
    nReferencia: data.nReferencia || '',
    nFolioSist: data.nFolioSist || '',
    estatus: data.estatus || 'No especificado',
    tipoIph: data.tipoIph,
    fechaCreacion: data.fechaCreacion || ''
  };
};

/**
 * Cuenta el número de secciones completas en un IPH
 * Útil para indicadores de progreso o completitud
 *
 * @param data - Datos del IPH
 * @returns Objeto con contadores de secciones
 *
 * @example
 * ```typescript
 * const data: IphOficialData = { ... };
 * const stats = getSectionStats(data);
 * // stats = { totalSections: 11, completedSections: 8, completionPercentage: 72.73 }
 * ```
 */
export const getSectionStats = (data: IphOficialData): {
  totalSections: number;
  completedSections: number;
  completionPercentage: number;
} => {
  const sections = [
    !!data.conocimiento_hecho,
    !!data.lugar_intervencion,
    !!data.narrativaHechos,
    (data.detencion_pertenencias?.length || 0) > 0,
    (data.cInspeccionVehiculo?.length || 0) > 0,
    (data.armas_objetos?.length || 0) > 0,
    !!data.uso_fuerza,
    !!data.entrega_recepcion,
    (data.continuacion?.length || 0) > 0,
    (data.entrevistas?.length || 0) > 0,
    (data.ruta_fotos_lugar?.length || 0) > 0
  ];

  const totalSections = sections.length;
  const completedSections = sections.filter(Boolean).length;
  const completionPercentage = (completedSections / totalSections) * 100;

  return {
    totalSections,
    completedSections,
    completionPercentage: Math.round(completionPercentage * 100) / 100
  };
};
