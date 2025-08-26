/**
 * Servicio para el manejo de IPH Oficial
 * 
 * @fileoverview Este servicio maneja la obtención y visualización de IPH oficial
 * por ID específico, integrando con el servicio existente getIphById y proporcionando
 * datos mock para desarrollo.
 * 
 * @version 1.0.0
 * @since 2024-01-29
 * 
 * @author Sistema IPH Frontend
 */

import { logInfo, logError, logWarning } from '../../helper/log/logger.helper';

// Servicio existente del sistema
import { getIphById } from '../iph/get-iph.service';

// Interfaces
import type {
  IphOficialData,
  IphOficialResponse,
  GetIphOficialParams
} from '../../interfaces/components/iphOficial.interface';

import type { I_IPHById } from '../../interfaces/iph/iph.interface';

// Mock data imports
import {
  iphOficialMockData,
  getIphOficialMockById,
  mockDelay
} from '../../mock/iph-oficial';

// ==================== CONFIGURACIÓN ====================

/**
 * Configuración del servicio
 * @constant {boolean} USE_MOCK_DATA - Flag para usar datos mock en lugar del API real
 */
const USE_MOCK_DATA = true; // TODO: Cambiar a false cuando el API esté estable

/**
 * Configuración de timeouts y reintentos
 */
const SERVICE_CONFIG = {
  timeout: 10000,
  maxRetries: 3,
  retryDelay: 1000
} as const;

// ==================== TRANSFORMACIÓN DE DATOS ====================

/**
 * Transforma datos del servidor (I_IPHById) al formato del componente (IphOficialData)
 * 
 * @param serverData - Datos del servidor en formato I_IPHById
 * @returns Datos transformados en formato IphOficialData
 */
const transformServerDataToComponent = (serverData: I_IPHById): IphOficialData => {
  logInfo('IphOficial Service', 'Transformando datos del servidor', { 
    id: serverData.id,
    referencia: serverData.n_referencia 
  });

  // Transformar los campos any a tipos específicos
  const transformedData: IphOficialData = {
    // Campos base
    id: serverData.id,
    n_referencia: serverData.n_referencia,
    n_folio_sist: serverData.n_folio_sist,
    observaciones: serverData.observaciones || 'Sin observaciones',
    latitud: serverData.latitud,
    longitud: serverData.longitud,
    hechos: serverData.hechos,
    fecha_creacion: serverData.fecha_creacion,
    fecha_subida: serverData.fecha_subida,
    
    // Relaciones
    primer_respondiente: serverData.primer_respondiente,
    estatus: serverData.estatus,
    tipo: serverData.tipo,
    
    // Campos extendidos - transformar de any a tipos específicos
    conocimiento_hecho: serverData.conocimiento_hecho || undefined,
    lugar_intervencion: serverData.lugar_intervencion || undefined,
    narrativaHechos: serverData.narrativaHechos || undefined,
    detencion_pertenencias: Array.isArray(serverData.detencion_pertenencias) 
      ? serverData.detencion_pertenencias 
      : [],
    cInspeccionVehiculo: Array.isArray(serverData.cInspeccionVehiculo) 
      ? serverData.cInspeccionVehiculo 
      : [],
    armas_objetos: Array.isArray(serverData.armas_objetos) 
      ? serverData.armas_objetos 
      : [],
    uso_fuerza: serverData.uso_fuerza || undefined,
    entrega_recepcion: serverData.entrega_recepcion || undefined,
    continuacion: Array.isArray(serverData.continuacion) 
      ? serverData.continuacion 
      : [],
    ruta_fotos_lugar: Array.isArray(serverData.ruta_fotos_lugar) 
      ? serverData.ruta_fotos_lugar 
      : [],
    disposicion_ofc: Array.isArray(serverData.disposicion_ofc) 
      ? serverData.disposicion_ofc 
      : [],
    entrevistas: Array.isArray(serverData.entrevistas) 
      ? serverData.entrevistas 
      : []
  };

  logInfo('IphOficial Service', 'Transformación de datos completada', {
    id: transformedData.id,
    secciones: {
      conocimiento: !!transformedData.conocimiento_hecho,
      lugar: !!transformedData.lugar_intervencion,
      narrativa: !!transformedData.narrativaHechos,
      detencion: transformedData.detencion_pertenencias?.length || 0,
      vehiculos: transformedData.cInspeccionVehiculo?.length || 0,
      armas: transformedData.armas_objetos?.length || 0,
      fotos: transformedData.ruta_fotos_lugar?.length || 0
    }
  });

  return transformedData;
};

// ==================== FUNCIONES MOCK ====================

/**
 * Obtiene IPH oficial usando datos mock
 * @param params - Parámetros de consulta
 * @returns Promise con el IPH oficial mock
 */
const getIphOficialMock = async (params: GetIphOficialParams): Promise<IphOficialResponse> => {
  logInfo('IphOficial Service', 'Obteniendo IPH oficial con datos mock', { params });
  
  await mockDelay(600);
  
  const { id } = params;
  
  const data = getIphOficialMockById(id);
  
  if (!data) {
    const error = `IPH con ID ${id} no encontrado en datos mock`;
    logError('IphOficial Service', error);
    throw new Error(error);
  }
  
  const response: IphOficialResponse = {
    success: true,
    data,
    message: 'IPH oficial obtenido exitosamente (mock)'
  };
  
  logInfo('IphOficial Service', 'IPH oficial obtenido exitosamente (mock)', {
    id: data.id,
    referencia: data.n_referencia,
    tipo: data.tipo.nombre
  });
  
  return response;
};

// ==================== FUNCIONES API ====================

/**
 * Obtiene IPH oficial desde el API real usando el servicio existente
 * 
 * @param params - Parámetros de consulta
 * @returns Promise con el IPH oficial del servidor
 * 
 * @description Utiliza el servicio existente getIphById y transforma los datos
 * al formato requerido por el componente
 */
const getIphOficialFromAPI = async (params: GetIphOficialParams): Promise<IphOficialResponse> => {
  logInfo('IphOficial Service', 'Obteniendo IPH oficial desde API', { params });
  
  try {
    const { id } = params;
    
    // Usar el servicio existente
    const serverData = await getIphById(id);
    
    // Transformar datos del servidor al formato del componente
    const transformedData = transformServerDataToComponent(serverData);
    
    const response: IphOficialResponse = {
      success: true,
      data: transformedData,
      message: 'IPH oficial obtenido exitosamente desde API'
    };
    
    logInfo('IphOficial Service', 'IPH oficial obtenido exitosamente desde API', {
      id: transformedData.id,
      referencia: transformedData.n_referencia,
      estatus: transformedData.estatus.nombre
    });
    
    return response;
    
  } catch (error) {
    logError('IphOficial Service', 'Error obteniendo IPH oficial desde API', { error, params });
    throw error;
  }
};

// ==================== FUNCIONES PÚBLICAS ====================

/**
 * Obtiene un IPH oficial por ID
 * Utiliza mock o API según la configuración
 * 
 * @param params - Parámetros de consulta que incluyen el ID
 * @returns Promise con el IPH oficial
 * 
 * @throws {Error} Si hay error en la consulta o el ID no se encuentra
 * 
 * @example
 * ```typescript
 * const iphData = await getIphOficial({ 
 *   id: 'GUGN01123060520252247',
 *   includeDetails: true 
 * });
 * ```
 */
export const getIphOficial = async (params: GetIphOficialParams): Promise<IphOficialResponse> => {
  try {
    // Validar parámetros
    if (!params.id || params.id.trim() === '') {
      const error = 'ID de IPH es requerido';
      logError('IphOficial Service', error, { params });
      throw new Error(error);
    }

    if (USE_MOCK_DATA) {
      logWarning('IphOficial Service', 'Usando datos mock - cambiar USE_MOCK_DATA a false para API real');
      return await getIphOficialMock(params);
    } else {
      return await getIphOficialFromAPI(params);
    }
  } catch (error) {
    logError('IphOficial Service', 'Error en getIphOficial', { error, params });
    throw error;
  }
};

/**
 * Verifica si un IPH existe por ID
 * 
 * @param id - ID del IPH a verificar
 * @returns Promise<boolean> - true si existe, false en caso contrario
 */
export const iphOficialExists = async (id: string): Promise<boolean> => {
  try {
    logInfo('IphOficial Service', 'Verificando existencia de IPH', { id });
    
    if (USE_MOCK_DATA) {
      const exists = getIphOficialMockById(id) !== null;
      logInfo('IphOficial Service', 'Verificación completada (mock)', { id, exists });
      return exists;
    } else {
      // Usar el servicio real para verificar existencia
      try {
        await getIphById(id);
        logInfo('IphOficial Service', 'IPH existe en API', { id });
        return true;
      } catch {
        logInfo('IphOficial Service', 'IPH no existe en API', { id });
        return false;
      }
    }
  } catch (error) {
    logError('IphOficial Service', 'Error verificando existencia de IPH', { error, id });
    return false;
  }
};

/**
 * Obtiene información básica de un IPH (solo campos principales)
 * Útil para previsualizaciones o listados
 * 
 * @param id - ID del IPH
 * @returns Promise con información básica
 */
export const getIphOficialBasicInfo = async (id: string): Promise<Pick<IphOficialData, 'id' | 'n_referencia' | 'n_folio_sist' | 'estatus' | 'tipo' | 'fecha_creacion'> | null> => {
  try {
    logInfo('IphOficial Service', 'Obteniendo información básica de IPH', { id });
    
    const response = await getIphOficial({ id });
    
    const basicInfo = {
      id: response.data.id,
      n_referencia: response.data.n_referencia,
      n_folio_sist: response.data.n_folio_sist,
      estatus: response.data.estatus,
      tipo: response.data.tipo,
      fecha_creacion: response.data.fecha_creacion
    };
    
    logInfo('IphOficial Service', 'Información básica obtenida', { basicInfo });
    return basicInfo;
    
  } catch (error) {
    logError('IphOficial Service', 'Error obteniendo información básica', { error, id });
    return null;
  }
};

// ==================== UTILIDADES EXPORT ====================

/**
 * Exporta las configuraciones y utilidades del servicio
 */
export const IphOficialServiceConfig = {
  USE_MOCK_DATA,
  SERVICE_CONFIG,
  transformServerDataToComponent,
  mockDelay
} as const;

/**
 * TODO LIST PARA IMPLEMENTACIÓN COMPLETA:
 * 
 * 1. ✅ Integrar con servicio existente getIphById
 * 2. ⏳ Optimizar transformación de datos any a tipos específicos
 * 3. ⏳ Implementar cache para IPHs consultados frecuentemente
 * 4. ⏳ Agregar validación de permisos por tipo de IPH
 * 5. ⏳ Implementar funcionalidad de impresión/exportación
 * 6. ⏳ Agregar soporte para diferentes formatos de coordenadas
 * 7. ⏳ Implementar preview de imágenes y documentos adjuntos
 * 8. ⏳ Agregar funcionalidad de comentarios/anotaciones
 * 9. ⏳ Implementar auditoria de consultas
 * 10. ⏳ Agregar soporte para versiones/historial del documento
 * 11. ⏳ Implementar validación de firma digital
 * 12. ⏳ Agregar exportación a diferentes formatos (PDF, Word, etc.)
 * 
 * SERVICIOS ADICIONALES A CONSIDERAR:
 * - Servicio de impresión optimizada
 * - Servicio de validación de firmas
 * - Servicio de gestión de anexos
 * - Servicio de auditoria de consultas
 * - Servicio de notificaciones por cambios de estatus
 */