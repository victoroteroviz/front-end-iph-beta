/**
 * Servicio para el manejo de IPH Oficial
 *
 * @fileoverview Este servicio maneja la obtención y visualización de IPH oficial
 * por ID específico, integrando con el servicio existente getIphById.
 *
 * @version 2.0.0
 * @since 2024-01-30
 *
 * @author Sistema IPH Frontend
 */

import { logInfo, logError, logDebug } from '../../../../../helper/log/logger.helper';

// Servicio existente del sistema
import { getIphById } from './get-iph.service';

// Interfaces
import type {
  IphOficialData,
  IphOficialResponse,
  GetIphOficialParams
} from '../../../../../interfaces/components/iphOficial.interface';

// Utils
import {
  validateIphOficialParams,
  validateServerResponse,
  transformServerDataToComponent,
  extractBasicInfo
} from '../../../../../utils/iph-oficial';

// ==================== CONFIGURACIÓN ====================

/**
 * Nombre del servicio para logging
 */
const SERVICE_NAME = 'IphOficialService';

/**
 * Configuración de timeouts y reintentos
 */
const SERVICE_CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000
} as const;

// ==================== FUNCIONES API ====================

/**
 * Obtiene IPH oficial desde el API real usando el servicio existente
 *
 * @param params - Parámetros de consulta
 * @returns Promise con el IPH oficial del servidor
 *
 * @throws Error si hay problemas con la petición o validación
 *
 * @description Utiliza el servicio existente getIphById y transforma los datos
 * al formato requerido por el componente
 *
 * @example
 * ```typescript
 * const response = await getIphOficialFromAPI({ id: 'GUGN01123060520252247' });
 * console.log(response.data.nReferencia);
 * ```
 */
const getIphOficialFromAPI = async (params: GetIphOficialParams): Promise<IphOficialResponse> => {
  logDebug(SERVICE_NAME, 'Obteniendo IPH oficial desde API', { params });

  try {
    const { id } = params;

    // Validar parámetros con utils
    validateIphOficialParams(params);

    // Usar el servicio existente
    const serverData = await getIphById(id);

    // Validar respuesta del servidor
    validateServerResponse(serverData);

    // Transformar datos del servidor al formato del componente
    const transformedData = transformServerDataToComponent(serverData);

    const response: IphOficialResponse = {
      success: true,
      data: transformedData,
      message: 'IPH oficial obtenido exitosamente'
    };

    logInfo(SERVICE_NAME, 'IPH oficial obtenido exitosamente', {
      id: transformedData.id,
      referencia: transformedData.nReferencia,
      estatus: transformedData.estatus
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logError(SERVICE_NAME, error, `Error obteniendo IPH oficial - params: ${JSON.stringify(params)}`);
    throw new Error(`Error al obtener IPH oficial: ${errorMessage}`);
  }
};

// ==================== FUNCIONES PÚBLICAS ====================

/**
 * Obtiene un IPH oficial por ID
 *
 * @param params - Parámetros de consulta que incluyen el ID
 * @returns Promise con el IPH oficial
 *
 * @throws {Error} Si hay error en la consulta, validación o el ID no se encuentra
 *
 * @example
 * ```typescript
 * const iphData = await getIphOficial({
 *   id: 'GUGN01123060520252247',
 *   includeDetails: true
 * });
 * console.log(iphData.data.nReferencia);
 * ```
 */
export const getIphOficial = async (params: GetIphOficialParams): Promise<IphOficialResponse> => {
  logDebug(SERVICE_NAME, 'getIphOficial llamado', { params });

  try {
    // Validar parámetros primero
    validateIphOficialParams(params);

    // Obtener desde API
    return await getIphOficialFromAPI(params);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    logError(SERVICE_NAME, error, `Error en getIphOficial - params: ${JSON.stringify(params)}`);
    throw new Error(errorMessage);
  }
};

/**
 * Verifica si un IPH existe por ID
 *
 * @param id - ID del IPH a verificar
 * @returns Promise<boolean> - true si existe, false en caso contrario
 *
 * @example
 * ```typescript
 * const exists = await iphOficialExists('GUGN01123060520252247');
 * if (exists) {
 *   console.log('El IPH existe');
 * }
 * ```
 */
export const iphOficialExists = async (id: string): Promise<boolean> => {
  try {
    logDebug(SERVICE_NAME, 'Verificando existencia de IPH', { id });

    // Validar formato del ID
    validateIphOficialParams({ id });

    // Intentar obtener el IPH
    await getIphById(id);

    logInfo(SERVICE_NAME, 'IPH existe', { id });
    return true;

  } catch (error) {
    // Si falla, el IPH no existe o hay un error
    logDebug(SERVICE_NAME, 'IPH no existe o error al verificar', { id, error });
    return false;
  }
};

/**
 * Obtiene información básica de un IPH (solo campos principales)
 * Útil para previsualizaciones o listados
 *
 * @param id - ID del IPH
 * @returns Promise con información básica o null si hay error
 *
 * @example
 * ```typescript
 * const basicInfo = await getIphOficialBasicInfo('GUGN01123060520252247');
 * if (basicInfo) {
 *   console.log(basicInfo.nReferencia, basicInfo.estatus);
 * }
 * ```
 */
export const getIphOficialBasicInfo = async (
  id: string
): Promise<Pick<IphOficialData, 'id' | 'nReferencia' | 'nFolioSist' | 'estatus' | 'tipoIph' | 'fechaCreacion'> | null> => {
  try {
    logDebug(SERVICE_NAME, 'Obteniendo información básica de IPH', { id });

    // Obtener IPH completo
    const response = await getIphOficial({ id });

    // Extraer información básica usando utils
    const basicInfo = extractBasicInfo(response.data);

    logInfo(SERVICE_NAME, 'Información básica obtenida', { basicInfo });
    return basicInfo;

  } catch (error) {
    logError(SERVICE_NAME, error, `Error obteniendo información básica - id: ${id}`);
    return null;
  }
};

// ==================== CONFIGURACIÓN EXPORT ====================

/**
 * Exporta las configuraciones del servicio
 * Útil para testing y debugging
 */
export const IphOficialServiceConfig = {
  SERVICE_NAME,
  SERVICE_CONFIG
} as const;
