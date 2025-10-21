/**
 * HTTP Helper Avanzado para manejo de peticiones HTTP
 * Siguiendo principios SOLID, KISS y DRY
 *
 * @version 2.1.0
 * @refactored 2025-01-21
 *
 * Mejoras implementadas:
 * - Sistema de interceptores para request/response
 * - Caché configurable con TTL para GET requests
 * - ErrorHandler class para manejo centralizado de errores
 * - Retry con jitter para mejor distribución
 * - Sistema de métricas HTTP por endpoint
 * - Sistema de observers para testing/monitoring
 * - Logging profesional integrado con logger.helper.ts
 * - Type safety mejorado
 */

import {
  logDebug,
  logInfo,
  logWarning,
  logError,
  logCritical,
  logHttp
} from '../log/logger.helper';

/**
 * Tipos de métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Tipos de contenido soportados
 */
export type ContentType =
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded'
  | 'text/plain';

/**
 * Interface para la configuración de una petición HTTP
 */
export interface HttpRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  contentType?: ContentType;
  includeAuth?: boolean;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * Interface para la respuesta HTTP procesada
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  url: string;
  duration: number;
  fromCache?: boolean;
}

/**
 * Interface para errores HTTP personalizados
 */
export interface HttpError extends Error {
  type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'CLIENT' | 'SERVER' | 'PARSE' | 'UNKNOWN';
  status?: number;
  statusText?: string;
  url: string;
  duration: number;
  originalError?: unknown;
  response?: Response;
  details?: unknown;
}

/**
 * Interface para interceptores de request
 */
export interface RequestInterceptor {
  onRequest?: (config: HttpRequestConfig, url: string) => HttpRequestConfig | Promise<HttpRequestConfig>;
  onRequestError?: (error: Error) => void | Promise<void>;
}

/**
 * Interface para interceptores de response
 */
export interface ResponseInterceptor {
  onResponse?: <T>(response: HttpResponse<T>) => HttpResponse<T> | Promise<HttpResponse<T>>;
  onResponseError?: (error: HttpError) => void | Promise<void>;
}

/**
 * Interface para la configuración global del HTTP helper
 */
export interface HttpHelperConfig {
  baseURL?: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  retryJitter: boolean;
  defaultHeaders: Record<string, string>;
  authTokenGetter?: () => string | null;
  authHeaderName: string;
  authHeaderPrefix: string;
  enableCache: boolean;
  defaultCacheTTL: number;
  enableMetrics: boolean;
}

/**
 * Interface para métricas HTTP
 */
export interface HttpMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDuration: number;
  averageDuration: number;
  requestsByMethod: Record<HttpMethod, number>;
  requestsByStatus: Record<number, number>;
  retryCount: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Interface para observers HTTP
 */
export interface HttpObserver {
  onRequest?: (url: string, config: HttpRequestConfig) => void;
  onResponse?: <T>(response: HttpResponse<T>) => void;
  onError?: (error: HttpError) => void;
}

/**
 * Interface para entrada de caché
 */
interface CacheEntry<T = unknown> {
  data: HttpResponse<T>;
  timestamp: number;
  ttl: number;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: HttpHelperConfig = {
  timeout: 30000, // 30 segundos
  retries: 3,
  retryDelay: 1000, // 1 segundo
  retryJitter: true,
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  authHeaderName: 'Authorization',
  authHeaderPrefix: 'Bearer',
  authTokenGetter: () => {
    try {
      return sessionStorage.getItem('token');
    } catch {
      return null;
    }
  },
  enableCache: false,
  defaultCacheTTL: 60000, // 1 minuto
  enableMetrics: true
};

/**
 * Clase para manejo centralizado de errores HTTP
 */
class HttpErrorHandler {
  /**
   * Sanitiza URL removiendo query params sensibles
   */
  private static sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['token', 'key', 'apikey', 'password', 'secret', 'auth'];

      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '***');
        }
      });

      return urlObj.toString();
    } catch {
      // Si no es una URL válida, retornar como está
      return url;
    }
  }

  /**
   * Crea un error HTTP estructurado
   */
  public static createError(
    type: HttpError['type'],
    message: string,
    url: string,
    duration: number = 0,
    response?: Response,
    originalError?: unknown,
    details?: unknown
  ): HttpError {
    const error = new Error(message) as HttpError;
    error.type = type;
    error.url = url;
    error.duration = duration;
    error.status = response?.status;
    error.statusText = response?.statusText;
    error.response = response;
    error.originalError = originalError;
    error.details = details;

    // Logging según el tipo de error
    const sanitizedUrl = this.sanitizeUrl(url);
    const errorData = {
      type,
      url: sanitizedUrl,
      status: response?.status,
      duration
    };

    switch (type) {
      case 'NETWORK':
        logCritical('HttpHelper', `Network error: ${message}`, errorData);
        break;
      case 'TIMEOUT':
        logCritical('HttpHelper', `Request timeout: ${message}`, errorData);
        break;
      case 'PARSE':
        logCritical('HttpHelper', `Response parsing error: ${message}`, errorData);
        break;
      case 'AUTH':
        logError('HttpHelper', errorData, `Authentication error: ${message}`);
        break;
      case 'CLIENT':
        logError('HttpHelper', errorData, `Client error: ${message}`);
        break;
      case 'SERVER':
        logError('HttpHelper', errorData, `Server error: ${message}`);
        break;
      default:
        logError('HttpHelper', errorData, `Unknown error: ${message}`);
    }

    return error;
  }

  /**
   * Determina el tipo de error basado en el status code
   */
  public static getErrorType(status: number): HttpError['type'] {
    if (status === 401 || status === 403) return 'AUTH';
    if (status >= 400 && status < 500) return 'CLIENT';
    if (status >= 500) return 'SERVER';
    return 'UNKNOWN';
  }

  /**
   * Extrae detalles del error desde el response body
   */
  public static async extractErrorDetails(response: Response): Promise<unknown> {
    try {
      const contentType = response.headers.get('content-type') || '';

      logDebug('HttpErrorHandler', 'Extracting error details from response', {
        status: response.status,
        contentType
      });

      if (contentType.includes('application/json')) {
        const details = await response.clone().json();
        // NO loggear el body completo por seguridad, solo metadata
        logDebug('HttpErrorHandler', 'Error details extracted (JSON)', {
          hasDetails: !!details,
          detailsType: typeof details
        });
        return details;
      } else {
        const text = await response.clone().text();
        logDebug('HttpErrorHandler', 'Error details extracted (text)', {
          textLength: text.length
        });
        return text;
      }
    } catch (error) {
      logWarning('HttpErrorHandler', 'Failed to extract error details', {
        error: String(error)
      });
      return null;
    }
  }
}

/**
 * Sistema de caché para peticiones HTTP
 */
class HttpCache {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Genera una key única para la caché
   */
  private generateKey(url: string, config: HttpRequestConfig): string {
    const params = JSON.stringify({
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });
    return btoa(params);
  }

  /**
   * Obtiene una entrada de la caché si es válida
   */
  public get<T>(url: string, config: HttpRequestConfig): HttpResponse<T> | null {
    const key = this.generateKey(url, config);
    const entry = this.cache.get(key);

    if (!entry) {
      logDebug('HttpCache', 'Cache miss', {
        url,
        method: config.method || 'GET'
      });
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      logDebug('HttpCache', 'Cache entry expired', {
        url,
        age: now - entry.timestamp,
        ttl: entry.ttl
      });
      return null;
    }

    logDebug('HttpCache', 'Cache hit', {
      url,
      age: now - entry.timestamp,
      ttl: entry.ttl
    });

    return { ...entry.data, fromCache: true } as HttpResponse<T>;
  }

  /**
   * Almacena una respuesta en la caché
   */
  public set<T>(url: string, config: HttpRequestConfig, response: HttpResponse<T>, ttl: number): void {
    // Solo cachear GET requests exitosos
    if (config.method !== 'GET' && config.method !== undefined) {
      logDebug('HttpCache', 'Skipping cache for non-GET request', {
        method: config.method,
        url
      });
      return;
    }

    if (!response.ok) {
      logDebug('HttpCache', 'Skipping cache for failed request', {
        status: response.status,
        url
      });
      return;
    }

    const key = this.generateKey(url, config);

    // Limitar tamaño de caché (LRU simple)
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        logWarning('HttpCache', 'Cache full, evicting oldest entry', {
          cacheSize: this.MAX_CACHE_SIZE
        });
      }
    }

    this.cache.set(key, {
      data: response,
      timestamp: Date.now(),
      ttl
    });

    logDebug('HttpCache', 'Response cached', {
      url,
      ttl,
      cacheSize: this.cache.size
    });
  }

  /**
   * Limpia la caché completa
   */
  public clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    logInfo('HttpCache', 'Cache cleared', {
      entriesRemoved: previousSize
    });
  }

  /**
   * Limpia entradas expiradas
   */
  public clearExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      logDebug('HttpCache', 'Expired entries cleared', {
        expiredCount,
        remainingEntries: this.cache.size
      });
    }
  }

  /**
   * Obtiene el tamaño actual de la caché
   */
  public size(): number {
    return this.cache.size;
  }
}

/**
 * Sistema de métricas HTTP
 */
class HttpMetricsTracker {
  private metrics: HttpMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDuration: 0,
    averageDuration: 0,
    requestsByMethod: {
      GET: 0,
      POST: 0,
      PUT: 0,
      PATCH: 0,
      DELETE: 0
    },
    requestsByStatus: {},
    retryCount: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  /**
   * Registra una petición
   */
  public trackRequest(method: HttpMethod): void {
    this.metrics.totalRequests++;
    this.metrics.requestsByMethod[method]++;
  }

  /**
   * Registra una respuesta exitosa
   */
  public trackSuccess(status: number, duration: number): void {
    this.metrics.successfulRequests++;
    this.trackDuration(duration);
    this.trackStatus(status);
  }

  /**
   * Registra una respuesta fallida
   */
  public trackFailure(status: number | undefined, duration: number): void {
    this.metrics.failedRequests++;
    this.trackDuration(duration);
    if (status) {
      this.trackStatus(status);
    }
  }

  /**
   * Registra duración de petición
   */
  private trackDuration(duration: number): void {
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalRequests;
  }

  /**
   * Registra status code
   */
  private trackStatus(status: number): void {
    this.metrics.requestsByStatus[status] = (this.metrics.requestsByStatus[status] || 0) + 1;
  }

  /**
   * Registra un retry
   */
  public trackRetry(): void {
    this.metrics.retryCount++;
  }

  /**
   * Registra un cache hit
   */
  public trackCacheHit(): void {
    this.metrics.cacheHits++;
  }

  /**
   * Registra un cache miss
   */
  public trackCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  /**
   * Obtiene las métricas actuales
   */
  public getMetrics(): HttpMetrics {
    return { ...this.metrics };
  }

  /**
   * Resetea las métricas
   */
  public reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalDuration: 0,
      averageDuration: 0,
      requestsByMethod: {
        GET: 0,
        POST: 0,
        PUT: 0,
        PATCH: 0,
        DELETE: 0
      },
      requestsByStatus: {},
      retryCount: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

/**
 * Clase principal del HTTP Helper
 * Implementa patrones Singleton, Builder y Observer
 */
class HttpHelper {
  private config: HttpHelperConfig;
  private static instance: HttpHelper;
  private cache: HttpCache;
  private metricsTracker: HttpMetricsTracker;
  private requestInterceptors: Set<RequestInterceptor> = new Set();
  private responseInterceptors: Set<ResponseInterceptor> = new Set();
  private observers: Set<HttpObserver> = new Set();

  private constructor(config?: Partial<HttpHelperConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new HttpCache();
    this.metricsTracker = new HttpMetricsTracker();

    logDebug('HttpHelper', 'HttpHelper initialized', {
      timeout: this.config.timeout,
      retries: this.config.retries,
      enableCache: this.config.enableCache,
      enableMetrics: this.config.enableMetrics,
      baseURL: this.config.baseURL || 'not configured'
    });

    // Limpiar caché expirada periódicamente
    if (this.config.enableCache) {
      setInterval(() => this.cache.clearExpired(), 60000); // Cada minuto
      logDebug('HttpCache', 'Auto-cleanup enabled', {
        interval: 60000
      });
    }
  }

  /**
   * Obtiene la instancia única del HTTP helper (Singleton)
   */
  public static getInstance(config?: Partial<HttpHelperConfig>): HttpHelper {
    if (!HttpHelper.instance) {
      logDebug('HttpHelper', 'Creating new HttpHelper instance');
      HttpHelper.instance = new HttpHelper(config);
    } else if (config) {
      logDebug('HttpHelper', 'Updating existing HttpHelper configuration');
      HttpHelper.instance.updateConfig(config);
    }
    return HttpHelper.instance;
  }

  /**
   * Actualiza la configuración global
   */
  public updateConfig(newConfig: Partial<HttpHelperConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    logInfo('HttpHelper', 'Configuration updated', {
      changes: Object.keys(newConfig),
      timeout: this.config.timeout !== oldConfig.timeout ? this.config.timeout : undefined,
      retries: this.config.retries !== oldConfig.retries ? this.config.retries : undefined,
      enableCache: this.config.enableCache !== oldConfig.enableCache ? this.config.enableCache : undefined
    });
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): HttpHelperConfig {
    return { ...this.config };
  }

  /**
   * Registra un interceptor de request
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.add(interceptor);
  }

  /**
   * Elimina un interceptor de request
   */
  public removeRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.delete(interceptor);
  }

  /**
   * Registra un interceptor de response
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.add(interceptor);
  }

  /**
   * Elimina un interceptor de response
   */
  public removeResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.delete(interceptor);
  }

  /**
   * Registra un observer
   */
  public addObserver(observer: HttpObserver): void {
    this.observers.add(observer);
    logDebug('HttpHelper', 'Observer registered', {
      totalObservers: this.observers.size
    });
  }

  /**
   * Elimina un observer
   */
  public removeObserver(observer: HttpObserver): void {
    const wasPresent = this.observers.has(observer);
    this.observers.delete(observer);

    if (wasPresent) {
      logDebug('HttpHelper', 'Observer removed', {
        totalObservers: this.observers.size
      });
    }
  }

  /**
   * Limpia todos los observers
   */
  public clearObservers(): void {
    const count = this.observers.size;
    this.observers.clear();

    if (count > 0) {
      logDebug('HttpHelper', 'All observers cleared', {
        observersRemoved: count
      });
    }
  }

  /**
   * Notifica a observers sobre request
   */
  private notifyRequestObservers(url: string, config: HttpRequestConfig): void {
    this.observers.forEach(observer => {
      if (observer.onRequest) {
        try {
          observer.onRequest(url, config);
        } catch (error) {
          logWarning('HttpObserver', 'Observer onRequest failed', {
            error: String(error)
          });
        }
      }
    });
  }

  /**
   * Notifica a observers sobre response
   */
  private notifyResponseObservers<T>(response: HttpResponse<T>): void {
    this.observers.forEach(observer => {
      if (observer.onResponse) {
        try {
          observer.onResponse(response);
        } catch (error) {
          logWarning('HttpObserver', 'Observer onResponse failed', {
            error: String(error)
          });
        }
      }
    });
  }

  /**
   * Notifica a observers sobre error
   */
  private notifyErrorObservers(error: HttpError): void {
    this.observers.forEach(observer => {
      if (observer.onError) {
        try {
          observer.onError(error);
        } catch (observerError) {
          logWarning('HttpObserver', 'Observer onError failed', {
            error: String(observerError)
          });
        }
      }
    });
  }

  /**
   * Obtiene las métricas HTTP
   */
  public getMetrics(): HttpMetrics {
    const metrics = this.metricsTracker.getMetrics();

    logInfo('HttpHelper', 'Metrics requested', {
      totalRequests: metrics.totalRequests,
      successRate: metrics.totalRequests > 0
        ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2) + '%'
        : 'N/A',
      avgDuration: Math.round(metrics.averageDuration) + 'ms'
    });

    return metrics;
  }

  /**
   * Resetea las métricas
   */
  public resetMetrics(): void {
    const oldMetrics = this.metricsTracker.getMetrics();
    this.metricsTracker.reset();

    logInfo('HttpHelper', 'Metrics reset', {
      previousTotalRequests: oldMetrics.totalRequests,
      previousSuccessRate: oldMetrics.totalRequests > 0
        ? ((oldMetrics.successfulRequests / oldMetrics.totalRequests) * 100).toFixed(2) + '%'
        : 'N/A'
    });
  }

  /**
   * Limpia la caché
   */
  public clearCache(): void {
    const cacheSize = this.cache.size();
    this.cache.clear();
    logInfo('HttpHelper', 'Cache manually cleared', {
      entriesCleared: cacheSize
    });
  }

  /**
   * Obtiene el tamaño de la caché
   */
  public getCacheSize(): number {
    return this.cache.size();
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    // URL absoluta
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Con baseURL configurada
    if (this.config.baseURL) {
      const base = this.config.baseURL.endsWith('/')
        ? this.config.baseURL.slice(0, -1)
        : this.config.baseURL;
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      return `${base}${path}`;
    }

    // URL relativa (proxy de Vite)
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  /**
   * Construye las headers de la petición
   */
  private buildHeaders(config: HttpRequestConfig): Record<string, string> {
    const headers: Record<string, string> = { ...this.config.defaultHeaders };

    // Agregar headers personalizadas
    if (config.headers) {
      Object.assign(headers, config.headers);
    }

    // Configurar Content-Type
    if (config.contentType) {
      headers['Content-Type'] = config.contentType;
    }

    // Agregar token de autenticación
    if (config.includeAuth !== false && this.config.authTokenGetter) {
      const token = this.config.authTokenGetter();
      if (token) {
        headers[this.config.authHeaderName] = `${this.config.authHeaderPrefix} ${token}`;
      }
    }

    return headers;
  }

  /**
   * Procesa el body de la petición según el Content-Type
   */
  private processBody(body: unknown, contentType?: ContentType): BodyInit | null {
    if (body === null || body === undefined) {
      return null;
    }

    switch (contentType) {
      case 'application/json':
        return JSON.stringify(body);

      case 'multipart/form-data':
        return body as FormData;

      case 'application/x-www-form-urlencoded':
        if (typeof body === 'object' && body !== null) {
          return new URLSearchParams(body as Record<string, string>).toString();
        }
        return String(body);

      case 'text/plain':
        return String(body);

      default:
        return JSON.stringify(body);
    }
  }

  /**
   * Crea un controlador de timeout
   */
  private createTimeoutController(timeout: number): {
    controller: AbortController;
    timeoutId: number
  } {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, timeout);

    return { controller, timeoutId };
  }

  /**
   * Procesa la respuesta y la convierte según el Content-Type
   */
  private async processResponse<T>(
    response: Response,
    startTime: number
  ): Promise<HttpResponse<T>> {
    const duration = Date.now() - startTime;
    const contentType = response.headers.get('content-type') || '';

    let data: T;

    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text() as T;
      } else {
        data = await response.blob() as T;
      }
    } catch (error) {
      throw HttpErrorHandler.createError(
        'PARSE',
        'Error parsing response',
        response.url,
        duration,
        response,
        error
      );
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
      url: response.url,
      duration
    };
  }

  /**
   * Calcula delay con jitter para reintentos
   */
  private calculateRetryDelay(
    baseDelay: number,
    attempt: number,
    useJitter: boolean
  ): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);

    if (!useJitter) {
      return exponentialDelay;
    }

    // Jitter: +/- 30% del delay calculado
    const jitter = exponentialDelay * 0.3;
    const randomJitter = (Math.random() * 2 - 1) * jitter;

    return Math.max(0, exponentialDelay + randomJitter);
  }

  /**
   * Ejecuta interceptores de request
   */
  private async executeRequestInterceptors(
    config: HttpRequestConfig,
    url: string
  ): Promise<HttpRequestConfig> {
    let processedConfig = config;

    if (this.requestInterceptors.size > 0) {
      logDebug('HttpHelper', 'Executing request interceptors', {
        interceptorCount: this.requestInterceptors.size,
        url
      });
    }

    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          processedConfig = await interceptor.onRequest(processedConfig, url);
        } catch (error) {
          logWarning('HttpHelper', 'Request interceptor failed', {
            error: String(error),
            url
          });

          if (interceptor.onRequestError) {
            await interceptor.onRequestError(error as Error);
          }
        }
      }
    }

    return processedConfig;
  }

  /**
   * Ejecuta interceptores de response
   */
  private async executeResponseInterceptors<T>(
    response: HttpResponse<T>
  ): Promise<HttpResponse<T>> {
    let processedResponse = response;

    if (this.responseInterceptors.size > 0) {
      logDebug('HttpHelper', 'Executing response interceptors', {
        interceptorCount: this.responseInterceptors.size,
        status: response.status
      });
    }

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponse) {
        try {
          processedResponse = await interceptor.onResponse(processedResponse);
        } catch (error) {
          logWarning('HttpHelper', 'Response interceptor failed', {
            error: String(error),
            status: response.status
          });

          if (interceptor.onResponseError) {
            await interceptor.onResponseError(error as HttpError);
          }
        }
      }
    }

    return processedResponse;
  }

  /**
   * Implementa reintentos con backoff exponencial y jitter
   */
  private async executeWithRetries<T>(
    url: string,
    requestConfig: HttpRequestConfig,
    attempt: number = 1
  ): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    const timeout = requestConfig.timeout || this.config.timeout;
    const { controller, timeoutId } = this.createTimeoutController(timeout);
    const method = requestConfig.method || 'GET';

    // Log inicio de request
    logDebug('HttpHelper', `Starting HTTP request (attempt ${attempt})`, {
      method,
      url: HttpErrorHandler['sanitizeUrl'](url),
      timeout,
      hasBody: !!requestConfig.body
    });

    try {
      // Ejecutar interceptores de request
      const processedConfig = await this.executeRequestInterceptors(requestConfig, url);

      const headers = this.buildHeaders(processedConfig);
      const body = this.processBody(processedConfig.body, processedConfig.contentType);

      // Remover Content-Type para FormData
      if (processedConfig.contentType === 'multipart/form-data') {
        delete headers['Content-Type'];
      }

      const fetchOptions: RequestInit = {
        method: processedConfig.method || 'GET',
        headers,
        body,
        signal: controller.signal
      };

      // Track request
      if (this.config.enableMetrics) {
        this.metricsTracker.trackRequest(fetchOptions.method as HttpMethod);
      }

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorDetails = await HttpErrorHandler.extractErrorDetails(response);
        const errorType = HttpErrorHandler.getErrorType(response.status);
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        const httpError = HttpErrorHandler.createError(
          errorType,
          errorMessage,
          url,
          duration,
          response,
          undefined,
          errorDetails
        );

        // Track failure
        if (this.config.enableMetrics) {
          this.metricsTracker.trackFailure(response.status, duration);
        }

        // Notify observers
        this.notifyErrorObservers(httpError);

        throw httpError;
      }

      // Procesar respuesta
      const httpResponse = await this.processResponse<T>(response, startTime);

      // Ejecutar interceptores de response
      const processedResponse = await this.executeResponseInterceptors(httpResponse);

      // Track success
      if (this.config.enableMetrics) {
        this.metricsTracker.trackSuccess(response.status, duration);
      }

      // Log success usando logHttp del logger
      logHttp(method, HttpErrorHandler['sanitizeUrl'](url), response.status, duration);

      logInfo('HttpHelper', 'HTTP request completed successfully', {
        method,
        url: HttpErrorHandler['sanitizeUrl'](url),
        status: response.status,
        duration,
        fromCache: false,
        attempt
      });

      // Notify observers
      this.notifyResponseObservers(processedResponse);

      // Cachear si está habilitado
      if (this.config.enableCache && requestConfig.cache !== false) {
        const ttl = requestConfig.cacheTTL || this.config.defaultCacheTTL;
        this.cache.set(url, requestConfig, processedResponse, ttl);
      }

      return processedResponse;

    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Error de timeout
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = HttpErrorHandler.createError(
          'TIMEOUT',
          `Request timeout after ${timeout}ms`,
          url,
          duration,
          undefined,
          error
        );

        if (this.config.enableMetrics) {
          this.metricsTracker.trackFailure(undefined, duration);
        }

        this.notifyErrorObservers(timeoutError);
        throw timeoutError;
      }

      // HttpError ya procesado
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }

      // Error de red
      const networkError = HttpErrorHandler.createError(
        'NETWORK',
        `Network error: ${String(error)}`,
        url,
        duration,
        undefined,
        error
      );

      // Intentar reintento
      const maxRetries = requestConfig.retries ?? this.config.retries;
      if (attempt < maxRetries) {
        const retryDelay = this.calculateRetryDelay(
          requestConfig.retryDelay ?? this.config.retryDelay,
          attempt,
          this.config.retryJitter
        );

        if (this.config.enableMetrics) {
          this.metricsTracker.trackRetry();
        }

        logWarning('HttpHelper', 'Retrying HTTP request', {
          method,
          url: HttpErrorHandler['sanitizeUrl'](url),
          attempt,
          maxRetries,
          retryDelay: Math.round(retryDelay),
          errorType: networkError.type,
          duration
        });

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.executeWithRetries<T>(url, requestConfig, attempt + 1);
      }

      if (this.config.enableMetrics) {
        this.metricsTracker.trackFailure(undefined, duration);
      }

      this.notifyErrorObservers(networkError);
      throw networkError;
    }
  }

  /**
   * Método genérico para realizar peticiones HTTP
   */
  public async request<T = unknown>(
    url: string,
    config: HttpRequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url);
    const method = config.method || 'GET';

    // Notificar observers
    this.notifyRequestObservers(fullUrl, config);

    // Verificar caché
    if (this.config.enableCache && config.cache !== false && method === 'GET') {
      const cached = this.cache.get<T>(fullUrl, config);
      if (cached) {
        if (this.config.enableMetrics) {
          this.metricsTracker.trackCacheHit();
        }

        // Log cache hit usando logHttp
        logHttp(method, HttpErrorHandler['sanitizeUrl'](fullUrl), cached.status, cached.duration);

        logInfo('HttpHelper', 'HTTP request served from cache', {
          method,
          url: HttpErrorHandler['sanitizeUrl'](fullUrl),
          status: cached.status,
          duration: cached.duration,
          fromCache: true
        });

        return cached;
      }
      if (this.config.enableMetrics) {
        this.metricsTracker.trackCacheMiss();
      }
    }

    return this.executeWithRetries<T>(fullUrl, config);
  }

  /**
   * Métodos de conveniencia para diferentes tipos de peticiones
   */
  public async get<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  public async post<T = unknown>(
    url: string,
    body?: unknown,
    config: Omit<HttpRequestConfig, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  public async put<T = unknown>(
    url: string,
    body?: unknown,
    config: Omit<HttpRequestConfig, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  public async patch<T = unknown>(
    url: string,
    body?: unknown,
    config: Omit<HttpRequestConfig, 'method'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }

  public async delete<T = unknown>(
    url: string,
    config: Omit<HttpRequestConfig, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * Método para upload de archivos
   */
  public async uploadFile<T = unknown>(
    url: string,
    file: File,
    additionalData?: Record<string, string>,
    config: Omit<HttpRequestConfig, 'method' | 'body' | 'contentType'> = {}
  ): Promise<HttpResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: formData,
      contentType: 'multipart/form-data'
    });
  }
}

// Instancia única del HTTP helper
const httpHelper = HttpHelper.getInstance();

// Exportaciones
export { httpHelper, HttpHelper, HttpErrorHandler };
export default httpHelper;
