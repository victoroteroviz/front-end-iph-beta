/**
 * =� Servicio de Estad�sticas - Rango de IPH por Usuario y Fecha
 *
 * Servicio frontend para consultar el endpoint de backend que obtiene
 * el listado paginado de IPH filtrado por rango de fechas y usuario.
 *
 * @module EstadisticasRangoService
 * @version 1.0.0
 * @author Sistema IPH
 *
 * @description
 * Este servicio se comunica con el endpoint NestJS:
 * GET /estadisticas/getRangoIphPorFechaUsuario
 *
 * Caracter�sticas:
 * -  Validaci�n Zod de response para type safety en runtime
 * -  Cache agresivo (30s) solo para queries sin b�squeda
 * -  Construcci�n manual de query params complejos
 * -  Logging estructurado (HTTP + Info + Error)
 * -  Manejo de errores robusto (throw silencioso)
 * -  Conversi�n autom�tica de fechas a ISO string
 * -  TypeScript strict mode
 * -  JSDoc completo en todas las funciones
 *
 * @example
 * ```typescript
 * import { getRangoIphPorUsuario } from './estadisticas-rango.service';
 *
 * // Uso b�sico
 * const response = await getRangoIphPorUsuario({
 *   limite: 10,
 *   pagina: 1,
 *   ordenarPor: 'ASC'
 * });
 *
 * console.log(`Total: ${response.meta.total} IPH encontrados`);
 * console.log(`Datos:`, response.data);
 *
 * // Con filtros avanzados
 * const filtered = await getRangoIphPorUsuario({
 *   limite: 20,
 *   pagina: 1,
 *   ordenarPor: 'DESC',
 *   buscarPor: 'nombre',
 *   terminoBusqueda: 'Juan',
 *   fechaInicio: new Date('2025-01-01'),
 *   fechaFin: new Date('2025-01-31')
 * });
 * ```
 */

import { z } from 'zod';
import httpHelper from '@/helper/http/http.helper';
import { logHttp, logInfo, logError } from '@/helper/log/logger.helper';
import CacheHelper from '@/helper/cache/cache.helper';
import { API_BASE_URL } from '@/config/env.config';

// =====================================================
// TYPES Y ENUMS
// =====================================================

/**
 * Constante para orden de resultados (ASC/DESC)
 * Debe coincidir con el enum del backend
 */
export const OrdenarEnum = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;

/**
 * Tipo para los valores de ordenamiento
 */
export type OrdenarType = typeof OrdenarEnum[keyof typeof OrdenarEnum];

// =====================================================
// INTERFACES TYPESCRIPT (Aligned con backend)
// =====================================================

/**
 * Interface para los detalles del usuario en la respuesta
 *
 * Representa la informaci�n b�sica del usuario asociado al IPH
 */
export interface RangoUsuarioDetalle {
  /** ID �nico del usuario */
  id: string;
  /** Nombre del usuario (puede ser null) */
  nombre: string | null;
  /** Primer apellido del usuario (puede ser null) */
  primerApellido: string | null;
  /** Segundo apellido del usuario (puede ser null) */
  segundoApellido: string | null;
}

/**
 * Interface para un item individual de IPH en el listado
 *
 * Representa un registro de IPH con su informaci�n b�sica
 */
export interface RangoIphItem {
  /** ID �nico del IPH */
  id: string;
  /** Fecha de creaci�n en formato ISO string (puede ser null) */
  fechaCreacion: string | null;
  /** Informaci�n del usuario asociado (puede ser null) */
  usuario: RangoUsuarioDetalle | null;
}

/**
 * Interface para los metadatos de paginaci�n
 *
 * Contiene informaci�n sobre el estado actual de la paginaci�n
 */
export interface RangoIphMeta {
  /** Total de registros encontrados */
  total: number;
  /** P�gina actual */
  pagina: number;
  /** L�mite de registros por p�gina */
  limite: number;
  /** Total de p�ginas disponibles */
  totalPaginas: number;
  /** Orden aplicado a los resultados */
  ordenarPor: OrdenarType;
}

/**
 * Interface para la respuesta completa del endpoint
 *
 * Estructura est�ndar de respuesta paginada
 */
export interface RangoIphPorUsuarioResponse {
  /** Array de items de IPH */
  data: RangoIphItem[];
  /** Metadatos de paginaci�n */
  meta: RangoIphMeta;
}

/**
 * Interface para los par�metros de query del endpoint
 *
 * Todos los par�metros son opcionales excepto limite, pagina y ordenarPor
 * que tienen valores por defecto
 */
export interface QueryRangoPorUsuarioParams {
  /** L�mite de registros por p�gina (1-100, default: 10) */
  limite?: number;
  /** N�mero de p�gina actual (min: 1, default: 1) */
  pagina?: number;
  /** Orden de los resultados (default: ASC) */
  ordenarPor?: OrdenarType;
  /** Campo por el cual buscar (opcional) */
  buscarPor?: string;
  /** T�rmino de b�squeda (opcional) */
  terminoBusqueda?: string;
  /** Fecha de inicio del rango (opcional) */
  fechaInicio?: Date;
  /** Fecha de fin del rango (opcional) */
  fechaFin?: Date;
}

// =====================================================
// VALIDACI�N ZOD (Runtime Type Safety)
// =====================================================

/**
 * Schema Zod para validar los detalles del usuario
 *
 * Asegura que los datos del usuario cumplan con la estructura esperada
 */
const RangoUsuarioDetalleSchema = z.object({
  id: z.string().uuid('ID de usuario debe ser UUID v�lido'),
  nombre: z.string().nullable(),
  primerApellido: z.string().nullable(),
  segundoApellido: z.string().nullable()
});

/**
 * Schema Zod para validar un item de IPH
 *
 * Valida la estructura de cada registro de IPH en la respuesta
 */
const RangoIphItemSchema = z.object({
  id: z.string().uuid('ID de IPH debe ser UUID v�lido'),
  fechaCreacion: z.string().nullable(),
  usuario: RangoUsuarioDetalleSchema.nullable()
});

/**
 * Schema Zod para validar los metadatos de paginaci�n
 *
 * Asegura que los metadatos sean consistentes y v�lidos
 */
const RangoIphMetaSchema = z.object({
  total: z.number().int().min(0, 'Total debe ser positivo o cero'),
  pagina: z.number().int().min(1, 'P�gina debe ser al menos 1'),
  limite: z.number().int().min(1).max(100, 'L�mite debe estar entre 1 y 100'),
  totalPaginas: z.number().int().min(0, 'Total de p�ginas debe ser positivo o cero'),
  ordenarPor: z.nativeEnum(OrdenarEnum)
});

/**
 * Schema Zod principal para validar la respuesta completa
 *
 * Valida toda la estructura de respuesta del backend
 */
const RangoIphPorUsuarioResponseSchema = z.object({
  data: z.array(RangoIphItemSchema),
  meta: RangoIphMetaSchema
});

// =====================================================
// CONSTANTES DE CONFIGURACI�N
// =====================================================

/**
 * Configuraci�n del servicio
 */
const SERVICE_CONFIG = {
  /** Nombre del m�dulo para logging */
  MODULE_NAME: 'EstadisticasRangoService',

  /** Endpoint del backend (relativo a API_BASE_URL) */
  ENDPOINT: '/estadisticas/getRangoIphPorFechaUsuario',

  /** Timeout para la petici�n (15 segundos) */
  TIMEOUT: 15000,

  /** N�mero de reintentos en caso de fallo */
  RETRIES: 3,

  /** Cache TTL (30 segundos) - Solo para queries sin b�squeda */
  CACHE_TTL: 30 * 1000,

  /** Namespace de cache */
  CACHE_NAMESPACE: 'data' as const,

  /** Prioridad de cache */
  CACHE_PRIORITY: 'normal' as const,

  /** Valores por defecto para query params */
  DEFAULTS: {
    limite: 10,
    pagina: 1,
    ordenarPor: OrdenarEnum.ASC
  }
} as const;

// =====================================================
// HELPERS INTERNOS
// =====================================================

/**
 * Construye manualmente la query string desde un objeto de par�metros
 *
 * Esta funci�n es necesaria porque el httpHelper no tiene soporte nativo
 * para query params complejos. Construye la URL completa incluyendo
 * el query string.
 *
 * @param baseUrl - URL base del endpoint
 * @param params - Objeto con los par�metros de query
 * @returns URL completa con query string
 *
 * @example
 * ```typescript
 * const url = buildQueryString(
 *   'https://api.example.com/endpoint',
 *   { limite: 10, pagina: 1, nombre: 'Juan P�rez' }
 * );
 * // � 'https://api.example.com/endpoint?limite=10&pagina=1&nombre=Juan+P%C3%A9rez'
 * ```
 *
 * @internal
 */
function buildQueryString(
  baseUrl: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  // Filtrar par�metros undefined
  const validParams = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== null
  );

  // Si no hay par�metros v�lidos, retornar URL base
  if (validParams.length === 0) {
    return baseUrl;
  }

  // Construir query string usando URLSearchParams para encoding correcto
  const searchParams = new URLSearchParams();

  validParams.forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Convierte los par�metros del frontend al formato esperado por el backend
 *
 * Transformaciones aplicadas:
 * - Convierte Date a ISO string para fechaInicio y fechaFin
 * - Aplica valores por defecto para limite, pagina y ordenarPor
 * - Valida rangos de valores (limite: 1-100, pagina: >= 1)
 *
 * @param params - Par�metros del frontend
 * @returns Objeto con par�metros transformados listos para query string
 *
 * @throws {Error} Si los par�metros no cumplen las validaciones
 *
 * @example
 * ```typescript
 * const transformed = transformParams({
 *   limite: 20,
 *   fechaInicio: new Date('2025-01-01')
 * });
 * // � { limite: 20, pagina: 1, ordenarPor: 'ASC', fechaInicio: '2025-01-01T00:00:00.000Z' }
 * ```
 *
 * @internal
 */
function transformParams(
  params: QueryRangoPorUsuarioParams
): Record<string, string | number | undefined> {
  const {
    limite = SERVICE_CONFIG.DEFAULTS.limite,
    pagina = SERVICE_CONFIG.DEFAULTS.pagina,
    ordenarPor = SERVICE_CONFIG.DEFAULTS.ordenarPor,
    buscarPor,
    terminoBusqueda,
    fechaInicio,
    fechaFin
  } = params;

  // Validaciones en frontend (previene requests inv�lidos)
  if (limite < 1 || limite > 100) {
    throw new Error('El l�mite debe estar entre 1 y 100');
  }

  if (pagina < 1) {
    throw new Error('La p�gina debe ser al menos 1');
  }

  // Construir objeto de par�metros
  const queryParams: Record<string, string | number | undefined> = {
    limite,
    pagina,
    ordenarPor
  };

  // Agregar par�metros opcionales solo si est�n presentes
  if (buscarPor) {
    queryParams.buscarPor = buscarPor;
  }

  if (terminoBusqueda) {
    queryParams.terminoBusqueda = terminoBusqueda;
  }

  // Convertir fechas a ISO string (requerimiento del backend)
  if (fechaInicio) {
    queryParams.fechaInicio = fechaInicio.toISOString();
  }

  if (fechaFin) {
    queryParams.fechaFin = fechaFin.toISOString();
  }

  return queryParams;
}

/**
 * Genera una key �nica para el cache basada en los par�metros de query
 *
 * La key incluye todos los par�metros relevantes para identificar
 * de manera �nica una consulta espec�fica.
 *
 * @param params - Par�metros de query transformados
 * @returns String �nico para usar como cache key
 *
 * @example
 * ```typescript
 * const key = generateCacheKey({ limite: 10, pagina: 1, ordenarPor: 'ASC' });
 * // � 'rango-iph:limite=10:pagina=1:ordenarPor=ASC'
 * ```
 *
 * @internal
 */
function generateCacheKey(params: Record<string, string | number | undefined>): string {
  // Ordenar keys para consistencia
  const sortedKeys = Object.keys(params).sort();

  // Construir key con formato: rango-iph:key1=value1:key2=value2
  const keyParts = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join(':');

  return `rango-iph:${keyParts}`;
}

/**
 * Determina si una query debe ser cacheada o no
 *
 * Estrategia de cache:
 * -  Cachear: Queries sin filtros de b�squeda (listado general paginado)
 * - L NO cachear: Queries con b�squeda activa (terminoBusqueda presente)
 *
 * Raz�n: Los listados generales cambian menos frecuentemente,
 * mientras que las b�squedas suelen ser exploratorias y el usuario
 * espera datos actualizados.
 *
 * @param params - Par�metros de query originales
 * @returns true si debe cachearse, false en caso contrario
 *
 * @example
 * ```typescript
 * shouldCache({ limite: 10, pagina: 1 }); // � true (listado general)
 * shouldCache({ limite: 10, terminoBusqueda: 'Juan' }); // � false (b�squeda activa)
 * ```
 *
 * @internal
 */
function shouldCache(params: QueryRangoPorUsuarioParams): boolean {
  // NO cachear si hay b�squeda activa
  if (params.terminoBusqueda && params.terminoBusqueda.trim() !== '') {
    return false;
  }

  // Cachear listados generales (sin b�squeda)
  return true;
}

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

/**
 * Obtiene el listado paginado de IPH filtrado por rango de fechas y usuario
 *
 * Este servicio consume el endpoint GET /estadisticas/getRangoIphPorFechaUsuario
 * del backend NestJS. Implementa cache agresivo para mejorar performance en
 * consultas repetidas sin b�squeda activa.
 *
 * @param params - Par�metros de query para filtrar y paginar
 * @returns Promise con la respuesta validada del backend
 *
 * @throws {Error} Si los par�metros son inv�lidos (validaci�n frontend)
 * @throws {HttpError} Si el backend retorna error (status >= 400)
 * @throws {z.ZodError} Si la respuesta del backend no cumple el schema esperado
 *
 * @example
 * ```typescript
 * // Ejemplo 1: Listado b�sico (primera p�gina)
 * try {
 *   const response = await getRangoIphPorUsuario({
 *     limite: 10,
 *     pagina: 1
 *   });
 *
 *   console.log(`Total de IPH: ${response.meta.total}`);
 *   response.data.forEach(iph => {
 *     console.log(`IPH ${iph.id} - Usuario: ${iph.usuario?.nombre}`);
 *   });
 * } catch (error) {
 *   // Manejo de errores en el componente
 *   showError('Error al cargar datos');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Ejemplo 2: B�squeda por usuario con rango de fechas
 * const response = await getRangoIphPorUsuario({
 *   limite: 20,
 *   pagina: 1,
 *   ordenarPor: OrdenarEnum.DESC,
 *   buscarPor: 'nombre',
 *   terminoBusqueda: 'Juan',
 *   fechaInicio: new Date('2025-01-01'),
 *   fechaFin: new Date('2025-01-31')
 * });
 *
 * console.log(`Encontrados ${response.meta.total} IPH de usuarios llamados Juan`);
 * ```
 *
 * @example
 * ```typescript
 * // Ejemplo 3: Paginaci�n avanzada
 * const getAllPages = async () => {
 *   const firstPage = await getRangoIphPorUsuario({
 *     limite: 50,
 *     pagina: 1
 *   });
 *
 *   const totalPages = firstPage.meta.totalPaginas;
 *   const allData = [...firstPage.data];
 *
 *   // Obtener p�ginas restantes
 *   for (let page = 2; page <= totalPages; page++) {
 *     const pageData = await getRangoIphPorUsuario({
 *       limite: 50,
 *       pagina: page
 *     });
 *     allData.push(...pageData.data);
 *   }
 *
 *   return allData;
 * };
 * ```
 *
 * @performance
 * - Cache hit: ~0.5-1ms (desde L1 memory cache)
 * - Cache miss + backend: ~100-300ms (depende de DB)
 * - Sin cache: Siempre requiere llamada al backend
 *
 * @see {@link QueryRangoPorUsuarioParams} para detalles de par�metros
 * @see {@link RangoIphPorUsuarioResponse} para estructura de respuesta
 */
export async function getRangoIphPorUsuario(
  params: QueryRangoPorUsuarioParams = {}
): Promise<RangoIphPorUsuarioResponse> {
  // ==========================================
  // PASO 1: Transformar y validar par�metros
  // ==========================================

  let transformedParams: Record<string, string | number | undefined>;

  try {
    transformedParams = transformParams(params);

    logInfo(SERVICE_CONFIG.MODULE_NAME, 'Iniciando consulta de rango IPH', {
      parametros: params,
      transformados: transformedParams
    });
  } catch (error) {
    // Error en validaci�n de par�metros (frontend)
    logError(
      SERVICE_CONFIG.MODULE_NAME,
      error,
      'Error validando par�metros de entrada'
    );
    throw error;
  }

  // ==========================================
  // PASO 2: Verificar cache (si aplica)
  // ==========================================

  const usarCache = shouldCache(params);
  const cacheKey = generateCacheKey(transformedParams);

  if (usarCache) {
    try {
      const cachedData = await CacheHelper.get<RangoIphPorUsuarioResponse>(
        cacheKey,
        false // usar localStorage
      );

      if (cachedData) {
        logInfo(SERVICE_CONFIG.MODULE_NAME, 'Datos obtenidos desde cache', {
          cacheKey,
          total: cachedData.meta.total,
          pagina: cachedData.meta.pagina
        });

        return cachedData;
      }
    } catch (error) {
      // Si falla el cache, continuar con request al backend
      // (no es un error cr�tico)
      logError(
        SERVICE_CONFIG.MODULE_NAME,
        error,
        'Error al leer cache, continuando con request'
      );
    }
  } else {
    logInfo(SERVICE_CONFIG.MODULE_NAME, 'Cache omitido (b�squeda activa)', {
      terminoBusqueda: params.terminoBusqueda
    });
  }

  // ==========================================
  // PASO 3: Construir URL con query params
  // ==========================================

  const baseUrl = `${API_BASE_URL}${SERVICE_CONFIG.ENDPOINT}`;
  const fullUrl = buildQueryString(baseUrl, transformedParams);

  logInfo(SERVICE_CONFIG.MODULE_NAME, 'URL construida', {
    baseUrl,
    queryParams: transformedParams,
    fullUrl: fullUrl.replace(/token=[^&]*/g, 'token=***') // Sanitizar tokens en logs
  });

  // ==========================================
  // PASO 4: Realizar petici�n HTTP
  // ==========================================

  const startTime = Date.now();

  try {
    const response = await httpHelper.get<RangoIphPorUsuarioResponse>(fullUrl, {
      timeout: SERVICE_CONFIG.TIMEOUT,
      retries: SERVICE_CONFIG.RETRIES,
      includeAuth: true // Incluir token de autenticaci�n
    });

    const duration = Date.now() - startTime;

    // Log HTTP (autom�tico desde httpHelper, pero lo reforzamos aqu�)
    logHttp('GET', SERVICE_CONFIG.ENDPOINT, response.status, duration, {
      total: response.data.meta?.total,
      items: response.data.data?.length
    });

    // ==========================================
    // PASO 5: Validar respuesta con Zod
    // ==========================================

    let validatedData: RangoIphPorUsuarioResponse;

    try {
      validatedData = RangoIphPorUsuarioResponseSchema.parse(response.data);

      logInfo(SERVICE_CONFIG.MODULE_NAME, 'Respuesta validada exitosamente', {
        total: validatedData.meta.total,
        items: validatedData.data.length,
        pagina: validatedData.meta.pagina,
        totalPaginas: validatedData.meta.totalPaginas,
        duration
      });
    } catch (zodError) {
      // Error de validaci�n Zod (estructura de respuesta inv�lida)
      logError(
        SERVICE_CONFIG.MODULE_NAME,
        zodError,
        'Error validando estructura de respuesta del backend'
      );

      // Re-throw para que el componente maneje el error
      throw new Error(
        'La respuesta del servidor no cumple con el formato esperado. ' +
        'Por favor contacta al administrador del sistema.'
      );
    }

    // ==========================================
    // PASO 6: Guardar en cache (si aplica)
    // ==========================================

    if (usarCache) {
      try {
        await CacheHelper.set(cacheKey, validatedData, {
          expiresIn: SERVICE_CONFIG.CACHE_TTL,
          priority: SERVICE_CONFIG.CACHE_PRIORITY,
          namespace: SERVICE_CONFIG.CACHE_NAMESPACE,
          useSessionStorage: false,
          metadata: {
            endpoint: SERVICE_CONFIG.ENDPOINT,
            timestamp: new Date().toISOString(),
            params: transformedParams
          }
        });

        logInfo(SERVICE_CONFIG.MODULE_NAME, 'Datos guardados en cache', {
          cacheKey,
          ttl: SERVICE_CONFIG.CACHE_TTL,
          total: validatedData.meta.total
        });
      } catch (error) {
        // Si falla el guardado en cache, no es cr�tico
        // Solo loggeamos el error y continuamos
        logError(
          SERVICE_CONFIG.MODULE_NAME,
          error,
          'Error al guardar en cache (no cr�tico)'
        );
      }
    }

    // ==========================================
    // PASO 7: Retornar datos validados
    // ==========================================

    return validatedData;

  } catch (error) {
    // ==========================================
    // MANEJO DE ERRORES HTTP
    // ==========================================

    const duration = Date.now() - startTime;

    // Si es un HttpError del helper, tiene informaci�n estructurada
    if (error && typeof error === 'object' && 'type' in error) {
      const httpError = error as any;

      logError(SERVICE_CONFIG.MODULE_NAME, httpError, 'Error HTTP en petici�n');

      // Log HTTP para errores tambi�n
      if (httpError.status) {
        logHttp('GET', SERVICE_CONFIG.ENDPOINT, httpError.status, duration);
      }
    } else {
      // Error gen�rico (no HTTP)
      logError(SERVICE_CONFIG.MODULE_NAME, error, 'Error no HTTP en petici�n');
    }

    // Re-throw para que el componente maneje el error
    // (servicio silencioso - no muestra notificaciones)
    throw error;
  }
}

// =====================================================
// EXPORTS
// =====================================================

/**
 * Export por defecto del servicio principal
 */
export default getRangoIphPorUsuario;

/**
 * Re-exportar tipos y enums para facilitar imports
 *
 * @example
 * ```typescript
 * import {
 *   getRangoIphPorUsuario,
 *   OrdenarEnum,
 *   type QueryRangoPorUsuarioParams,
 *   type RangoIphPorUsuarioResponse
 * } from './estadisticas-rango.service';
 * ```
 */
