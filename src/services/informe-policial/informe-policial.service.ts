/**
 * Servicio InformePolicial
 * Integración con servicios existentes getAllIph y getIphByUser
 * Maneja control de acceso por roles (global vs personal)
 */

import type { 
  IInformePolicialFilters,
  IInformePolicialService,
  IRegistroIPH
} from '../../interfaces/components/informe-policial.interface';

// Servicios existentes
import { getAllIph, getIphByUser } from '../iph/get-iph.service';

// Helpers
import { logInfo, logError } from '../../helper/log/logger.helper';

// =====================================================
// TRANSFORMADORES DE DATOS
// =====================================================

/**
 * Transforma respuesta del servidor a formato del componente
 * @param serverData - Datos del servidor (IPaginatedIPH)
 * @returns Datos transformados para el componente
 */
const transformServerResponseToComponent = (serverData: any): {
  data: IRegistroIPH[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
} => {
  logInfo('InformePolicialService', 'Transforming server response', {
    hasData: !!serverData,
    dataLength: serverData?.data?.length || 0,
    totalPages: serverData?.totalPages || 1
  });

  // Si es array directo (fallback)
  if (Array.isArray(serverData)) {
    return {
      data: serverData.map(transformSingleRecord),
      totalPages: 1,
      totalItems: serverData.length,
      currentPage: 1
    };
  }

  // Si es objeto paginado
  return {
    data: Array.isArray(serverData.data) 
      ? serverData.data.map(transformSingleRecord)
      : [],
    totalPages: serverData.totalPages || 1,
    totalItems: serverData.totalItems || serverData.total || serverData.data?.length || 0,
    currentPage: serverData.currentPage || 1
  };
};

/**
 * Transforma un registro individual del servidor al formato del componente
 * @param record - Registro del servidor
 * @returns Registro transformado
 */
const transformSingleRecord = (record: any): IRegistroIPH => {
  return {
    id: record.id || '',
    n_referencia: record.n_referencia || '',
    n_folio_sist: record.n_folio_sist || '',
    tipo: record.tipo ? {
      id: record.tipo.id || '',
      nombre: record.tipo.nombre || '',
      codigo: record.tipo.codigo,
      descripcion: record.tipo.descripcion
    } : undefined,
    estatus: record.estatus ? {
      id: record.estatus.id || '',
      nombre: record.estatus.nombre || '',
      is_active: record.estatus.is_active,
      color: record.estatus.color,
      codigo: record.estatus.codigo
    } : undefined,
    fecha_creacion: record.fecha_creacion,
    fecha_modificacion: record.fecha_modificacion,
    usuario_id: record.usuario_id,
    hechos: record.hechos,
    observaciones: record.observaciones,
    latitud: record.latitud ? parseFloat(record.latitud) : undefined,
    longitud: record.longitud ? parseFloat(record.longitud) : undefined
  };
};

/**
 * Transforma filtros del componente a parámetros del servicio
 * @param filters - Filtros del componente
 * @returns Parámetros para el servicio
 */
const transformFiltersToServiceParams = (filters: IInformePolicialFilters): any => {
  return {
    page: filters.page,
    orderBy: filters.orderBy,
    order: filters.order,
    search: filters.search,
    searchBy: filters.searchBy,
    tipoId: filters.tipoId || undefined // Solo enviar si tiene valor
  };
};

// =====================================================
// FUNCIONES DE ACCESO
// =====================================================

/**
 * Determina si un usuario puede ver todos los IPH o solo los suyos
 * @param userRoles - Roles del usuario
 * @returns true si puede ver todos, false si solo los suyos
 */
const canUserViewAll = (userRoles: any[]): boolean => {
  const restrictedRoles = ['Elemento'];
  const userRoleNames = userRoles.map((role: any) => role.nombre);
  
  // Si tiene algún rol que NO sea solo 'Elemento', puede ver todos
  return !userRoleNames.every(roleName => restrictedRoles.includes(roleName));
};

/**
 * Obtiene el ID del usuario actual
 * @returns ID del usuario o null
 */
const getCurrentUserId = (): string | null => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    return userData?.id?.toString() || null;
  } catch {
    return null;
  }
};

/**
 * Obtiene los roles del usuario actual
 * @returns Array de roles o array vacío
 */
const getCurrentUserRoles = (): any[] => {
  try {
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    return userRoles || [];
  } catch {
    return [];
  }
};

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

/**
 * Obtiene lista de IPH según los permisos del usuario
 * @param params - Filtros y parámetros de búsqueda
 * @param forceUserId - ID de usuario específico (opcional)
 * @returns Lista paginada de IPH
 */
const getIPHList = async (
  params: IInformePolicialFilters, 
  forceUserId?: string
): Promise<{
  data: IRegistroIPH[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}> => {
  try {
    const userRoles = getCurrentUserRoles();
    const currentUserId = getCurrentUserId();
    const serviceParams = transformFiltersToServiceParams(params);

    // Determinar si debe usar vista global o personal
    const shouldUseGlobalView = canUserViewAll(userRoles);
    const targetUserId = forceUserId || currentUserId;

    logInfo('InformePolicialService', 'Getting IPH list', {
      shouldUseGlobalView,
      targetUserId,
      userRoles: userRoles.map((r: any) => r.nombre),
      params: serviceParams
    });

    let serverResponse;

    if (shouldUseGlobalView && !forceUserId) {
      // Vista global para SuperAdmin, Administrador, Superior
      logInfo('InformePolicialService', 'Using global view (getAllIph)');
      serverResponse = await getAllIph(serviceParams);
    } else {
      // Vista personal para Elemento o cuando se especifica un usuario
      if (!targetUserId) {
        throw new Error('ID de usuario requerido para vista personal');
      }
      
      logInfo('InformePolicialService', 'Using personal view (getIphByUser)', { 
        userId: targetUserId 
      });
      
      serverResponse = await getIphByUser(parseInt(targetUserId), serviceParams);
    }

    const transformedData = transformServerResponseToComponent(serverResponse);
    
    logInfo('InformePolicialService', 'IPH list obtained successfully', {
      recordsCount: transformedData.data.length,
      totalPages: transformedData.totalPages,
      totalItems: transformedData.totalItems,
      currentPage: transformedData.currentPage
    });

    return transformedData;

  } catch (error) {
    logError('InformePolicialService', 'Error getting IPH list', {
      error: (error as Error).message,
      params
    });
    throw error;
  }
};

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Verifica si los filtros han cambiado significativamente
 * @param oldFilters - Filtros anteriores
 * @param newFilters - Filtros nuevos
 * @returns true si hay cambios significativos
 */
const haveFiltersChanged = (
  oldFilters: IInformePolicialFilters, 
  newFilters: IInformePolicialFilters
): boolean => {
  return (
    oldFilters.page !== newFilters.page ||
    oldFilters.orderBy !== newFilters.orderBy ||
    oldFilters.order !== newFilters.order ||
    oldFilters.search !== newFilters.search ||
    oldFilters.searchBy !== newFilters.searchBy
  );
};

/**
 * Calcula el delay para retry con backoff exponencial
 * @param attempt - Número del intento (empezando en 0)
 * @param baseDelay - Delay base en ms
 * @returns Delay calculado en ms
 */
const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 segundos
};

/**
 * Ejecuta una función con reintentos automáticos
 * @param fn - Función a ejecutar
 * @param maxAttempts - Número máximo de intentos
 * @param baseDelay - Delay base entre intentos
 * @returns Resultado de la función
 */
const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts - 1) {
        // Último intento fallido
        break;
      }
      
      const delay = calculateRetryDelay(attempt, baseDelay);
      logInfo('InformePolicialService', `Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`, {
        error: lastError.message
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// =====================================================
// IMPLEMENTACIÓN DEL SERVICIO
// =====================================================

export const informePolicialService: IInformePolicialService = {
  /**
   * Obtiene lista de IPH con manejo de roles y reintentos automáticos
   */
  getIPHList: async (params: IInformePolicialFilters, userId?: string) => {
    return await executeWithRetry(
      () => getIPHList(params, userId),
      3, // 3 intentos
      1000 // 1 segundo de delay base
    );
  }
};

// =====================================================
// FUNCIONES AUXILIARES EXPORTADAS
// =====================================================

/**
 * Verifica si el usuario actual puede ver todos los IPH
 * @returns true si puede ver todos
 */
export const currentUserCanViewAll = (): boolean => {
  const userRoles = getCurrentUserRoles();
  return canUserViewAll(userRoles);
};

/**
 * Obtiene información del usuario actual para logging
 * @returns Información del usuario
 */
export const getCurrentUserInfo = (): {
  userId: string | null;
  roles: string[];
  canViewAll: boolean;
} => {
  const userId = getCurrentUserId();
  const roles = getCurrentUserRoles();
  const canViewAll = canUserViewAll(roles);
  
  return {
    userId,
    roles: roles.map((r: any) => r.nombre),
    canViewAll
  };
};

// =====================================================
// EXPORTS
// =====================================================

export default informePolicialService;
export {
  getIPHList,
  transformServerResponseToComponent,
  transformSingleRecord,
  canUserViewAll,
  getCurrentUserId,
  getCurrentUserRoles,
  haveFiltersChanged,
  executeWithRetry
};