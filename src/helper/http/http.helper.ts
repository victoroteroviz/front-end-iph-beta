/**
 * HTTP Helper Avanzado para manejo de peticiones HTTP
 * Siguiendo principios SOLID, KISS y DRY
 *
 * @version 2.3.0
 * @refactored 2025-01-31
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
 * - 🆕 Circuit Breaker pattern (P0 Security - Enterprise Grade)
 *   • Prevención de cascading failures
 *   • Estados: CLOSED → OPEN → HALF_OPEN
 *   • Configuración por endpoint
 *   • Métricas y observabilidad completa
 * - 🆕 Rate Limiting con Token Bucket (P0 Security - Enterprise Grade)
 *   • Prevención de API abuse y DoS auto-infligido
 *   • Límites globales + por endpoint
 *   • Token Bucket algorithm con burst support
 *   • Métricas en tiempo real (tokens, rejectionRate)
 *   • API completa para gestión y observabilidad
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
 * Interface para la configuración del Circuit Breaker
 */
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  openDuration: number;
  halfOpenMaxRequests: number;
  volumeThreshold: number;
}

/**
 * Estados del Circuit Breaker
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Interface para métricas del Circuit Breaker
 */
export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  stateChangedAt: number;
  nextAttemptAt?: number;
}

/**
 * Interface para la configuración del Rate Limiter
 */
export interface RateLimiterConfig {
  enabled: boolean;
  globalLimit: number;
  globalWindow: number;
  perEndpointLimit: number;
  perEndpointWindow: number;
  burstSize?: number;
}

/**
 * Interface para métricas del Rate Limiter
 */
export interface RateLimiterMetrics {
  tokens: number;
  capacity: number;
  requestsInWindow: number;
  lastRefillTime: number;
  totalRequests: number;
  totalRejected: number;
  rejectionRate: number;
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
  circuitBreaker: CircuitBreakerConfig;
  rateLimiter: RateLimiterConfig;
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
  enableMetrics: true,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 0.5, // 50% de fallos
    successThreshold: 2, // 2 éxitos consecutivos para cerrar
    openDuration: 30000, // 30 segundos en OPEN
    halfOpenMaxRequests: 3, // 3 requests de prueba en HALF_OPEN
    volumeThreshold: 3 // Mínimo 3 requests para evaluar
  },
  rateLimiter: {
    enabled: true,
    globalLimit: 100, // 100 requests
    globalWindow: 60000, // por minuto (60s)
    perEndpointLimit: 30, // 30 requests
    perEndpointWindow: 60000, // por minuto (60s)
    burstSize: 10 // Permite bursts de 10 requests
  }
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
 * Circuit Breaker para prevenir cascading failures
 *
 * Estados:
 * - CLOSED: Funcionamiento normal
 * - OPEN: Servicio detectado como caído, rechaza requests inmediatamente
 * - HALF_OPEN: Probando si el servicio se recuperó
 *
 * @version 1.0.0
 * @enterprise-grade
 */
class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private totalRequests = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private stateChangedAt = Date.now();
  private nextAttemptAt?: number;
  private halfOpenRequests = 0;

  constructor(private config: CircuitBreakerConfig, private endpoint: string) {
    logDebug('CircuitBreaker', `Circuit breaker initialized for ${endpoint}`, {
      failureThreshold: config.failureThreshold,
      openDuration: config.openDuration,
      volumeThreshold: config.volumeThreshold
    });
  }

  /**
   * Verifica si el request puede proceder
   * @throws HttpError si el circuito está abierto
   */
  public canProceed(): void {
    if (!this.config.enabled) {
      return;
    }

    const now = Date.now();

    switch (this.state) {
      case 'CLOSED':
        // Funcionamiento normal
        return;

      case 'OPEN':
        // Verificar si es momento de intentar recovery
        if (this.nextAttemptAt && now >= this.nextAttemptAt) {
          this.transitionToHalfOpen();
          return;
        }

        // Rechazar request
        const waitTime = this.nextAttemptAt ? Math.ceil((this.nextAttemptAt - now) / 1000) : 0;

        logWarning('CircuitBreaker', `Circuit breaker is OPEN for ${this.endpoint}`, {
          state: this.state,
          waitTime,
          failures: this.failures,
          totalRequests: this.totalRequests
        });

        throw HttpErrorHandler.createError(
          'NETWORK',
          `Circuit breaker is OPEN. Service unavailable. Try again in ${waitTime} seconds.`,
          this.endpoint,
          0,
          undefined,
          undefined,
          {
            circuitBreakerState: 'OPEN',
            waitTime,
            nextAttemptAt: this.nextAttemptAt
          }
        );

      case 'HALF_OPEN':
        // Limitar requests durante prueba
        if (this.halfOpenRequests >= this.config.halfOpenMaxRequests) {
          logDebug('CircuitBreaker', `Half-open limit reached for ${this.endpoint}`, {
            halfOpenRequests: this.halfOpenRequests,
            maxAllowed: this.config.halfOpenMaxRequests
          });

          throw HttpErrorHandler.createError(
            'NETWORK',
            'Circuit breaker is testing recovery. Too many concurrent requests.',
            this.endpoint,
            0,
            undefined,
            undefined,
            { circuitBreakerState: 'HALF_OPEN' }
          );
        }

        this.halfOpenRequests++;
        return;
    }
  }

  /**
   * Registra un éxito
   */
  public recordSuccess(): void {
    if (!this.config.enabled) {
      return;
    }

    this.totalRequests++;
    this.successes++;
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.halfOpenRequests--;

      // Verificar si alcanzamos el threshold de éxitos
      if (this.successes >= this.config.successThreshold) {
        this.transitionToClosed();
      }

      logDebug('CircuitBreaker', `Success in HALF_OPEN state for ${this.endpoint}`, {
        successes: this.successes,
        threshold: this.config.successThreshold
      });
    }
  }

  /**
   * Registra un fallo
   */
  public recordFailure(): void {
    if (!this.config.enabled) {
      return;
    }

    this.totalRequests++;
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.halfOpenRequests--;
      // Un solo fallo en HALF_OPEN → volver a OPEN
      this.transitionToOpen();
      return;
    }

    if (this.state === 'CLOSED') {
      // Verificar si debemos abrir el circuito
      if (this.totalRequests >= this.config.volumeThreshold) {
        const failureRate = this.failures / this.totalRequests;

        if (failureRate >= this.config.failureThreshold) {
          this.transitionToOpen();
        }
      }
    }
  }

  /**
   * Transición a CLOSED (funcionamiento normal)
   */
  private transitionToClosed(): void {
    logInfo('CircuitBreaker', `🟢 Circuit breaker CLOSED for ${this.endpoint}`, {
      previousState: this.state,
      successes: this.successes,
      failures: this.failures,
      totalRequests: this.totalRequests
    });

    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.totalRequests = 0;
    this.halfOpenRequests = 0;
    this.nextAttemptAt = undefined;
    this.stateChangedAt = Date.now();
  }

  /**
   * Transición a OPEN (circuito abierto)
   */
  private transitionToOpen(): void {
    const now = Date.now();
    this.nextAttemptAt = now + this.config.openDuration;

    logCritical('CircuitBreaker', `🔴 Circuit breaker OPEN for ${this.endpoint}`, {
      previousState: this.state,
      failures: this.failures,
      totalRequests: this.totalRequests,
      failureRate: ((this.failures / this.totalRequests) * 100).toFixed(2) + '%',
      openDuration: this.config.openDuration,
      nextAttemptAt: new Date(this.nextAttemptAt).toISOString()
    });

    this.state = 'OPEN';
    this.stateChangedAt = now;
    this.halfOpenRequests = 0;
  }

  /**
   * Transición a HALF_OPEN (probando recovery)
   */
  private transitionToHalfOpen(): void {
    logWarning('CircuitBreaker', `🟡 Circuit breaker HALF_OPEN for ${this.endpoint}`, {
      previousState: this.state,
      testRequests: this.config.halfOpenMaxRequests
    });

    this.state = 'HALF_OPEN';
    this.successes = 0;
    this.failures = 0;
    this.totalRequests = 0;
    this.halfOpenRequests = 0;
    this.stateChangedAt = Date.now();
  }

  /**
   * Obtiene métricas actuales
   */
  public getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      nextAttemptAt: this.nextAttemptAt
    };
  }

  public getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Resetea el circuit breaker
   */
  public reset(): void {
    logInfo('CircuitBreaker', `Circuit breaker reset for ${this.endpoint}`, {
      previousState: this.state
    });

    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.totalRequests = 0;
    this.halfOpenRequests = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.nextAttemptAt = undefined;
    this.stateChangedAt = Date.now();
  }
}

/**
 * Rate Limiter con Token Bucket Algorithm para prevenir API abuse
 *
 * Token Bucket:
 * - Bucket tiene capacidad máxima (limit)
 * - Tokens se recargan a tasa constante (refill rate)
 * - Request consume 1 token
 * - Si no hay tokens → rechazar request
 *
 * @version 1.0.0
 * @enterprise-grade
 */
class RateLimiter {
  private tokens: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens por ms
  private lastRefillTime: number;
  private totalRequests = 0;
  private totalRejected = 0;
  private readonly burstSize: number;

  constructor(
    private config: { limit: number; window: number; burstSize?: number },
    private identifier: string
  ) {
    this.capacity = config.limit;
    this.tokens = config.limit; // Bucket empieza lleno
    this.refillRate = config.limit / config.window; // tokens por ms
    this.lastRefillTime = Date.now();
    this.burstSize = config.burstSize || Math.ceil(config.limit * 0.1); // 10% default

    logDebug('RateLimiter', `Rate limiter initialized for ${identifier}`, {
      limit: config.limit,
      window: config.window,
      refillRate: (this.refillRate * 1000).toFixed(2) + ' tokens/s',
      burstSize: this.burstSize
    });
  }

  /**
   * Recarga tokens basado en tiempo transcurrido
   */
  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefillTime;

    if (timePassed > 0) {
      const tokensToAdd = timePassed * this.refillRate;
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillTime = now;

      if (tokensToAdd > 0) {
        logDebug('RateLimiter', `Tokens refilled for ${this.identifier}`, {
          tokensAdded: tokensToAdd.toFixed(2),
          currentTokens: this.tokens.toFixed(2),
          capacity: this.capacity
        });
      }
    }
  }

  /**
   * Intenta consumir un token
   * @returns true si el request puede proceder, false si está rate limited
   */
  public tryConsume(): boolean {
    this.refillTokens();
    this.totalRequests++;

    if (this.tokens >= 1) {
      this.tokens -= 1;

      logDebug('RateLimiter', `Token consumed for ${this.identifier}`, {
        remainingTokens: this.tokens.toFixed(2),
        capacity: this.capacity,
        totalRequests: this.totalRequests,
        rejectionRate: this.getRejectionRate().toFixed(2) + '%'
      });

      return true;
    }

    // Rate limited
    this.totalRejected++;

    const waitTime = Math.ceil((1 - this.tokens) / this.refillRate);

    logWarning('RateLimiter', `🚫 Rate limit exceeded for ${this.identifier}`, {
      tokens: this.tokens.toFixed(2),
      capacity: this.capacity,
      totalRejected: this.totalRejected,
      rejectionRate: this.getRejectionRate().toFixed(2) + '%',
      waitTime: waitTime + 'ms'
    });

    return false;
  }

  /**
   * Verifica si hay tokens disponibles sin consumir
   */
  public hasTokens(): boolean {
    this.refillTokens();
    return this.tokens >= 1;
  }

  /**
   * Obtiene tiempo de espera hasta próximo token
   */
  public getWaitTime(): number {
    this.refillTokens();
    if (this.tokens >= 1) {
      return 0;
    }
    return Math.ceil((1 - this.tokens) / this.refillRate);
  }

  /**
   * Obtiene métricas actuales
   */
  public getMetrics(): RateLimiterMetrics {
    this.refillTokens();

    return {
      tokens: parseFloat(this.tokens.toFixed(2)),
      capacity: this.capacity,
      requestsInWindow: this.totalRequests,
      lastRefillTime: this.lastRefillTime,
      totalRequests: this.totalRequests,
      totalRejected: this.totalRejected,
      rejectionRate: parseFloat(this.getRejectionRate().toFixed(2))
    };
  }

  /**
   * Calcula tasa de rechazo
   */
  private getRejectionRate(): number {
    if (this.totalRequests === 0) return 0;
    return (this.totalRejected / this.totalRequests) * 100;
  }

  /**
   * Resetea el rate limiter
   */
  public reset(): void {
    const previousTokens = this.tokens;
    const previousRejected = this.totalRejected;

    this.tokens = this.capacity;
    this.lastRefillTime = Date.now();
    this.totalRequests = 0;
    this.totalRejected = 0;

    logInfo('RateLimiter', `Rate limiter reset for ${this.identifier}`, {
      previousTokens: previousTokens.toFixed(2),
      previousRejected,
      newTokens: this.tokens
    });
  }

  /**
   * Permite burst (consume múltiples tokens)
   */
  public tryConsumeBurst(count: number): boolean {
    if (count > this.burstSize) {
      logWarning('RateLimiter', `Burst size exceeded for ${this.identifier}`, {
        requested: count,
        maxBurst: this.burstSize
      });
      return false;
    }

    this.refillTokens();

    if (this.tokens >= count) {
      this.tokens -= count;
      this.totalRequests += count;

      logDebug('RateLimiter', `Burst consumed for ${this.identifier}`, {
        tokensConsumed: count,
        remainingTokens: this.tokens.toFixed(2)
      });

      return true;
    }

    this.totalRejected += count;
    return false;
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
  private circuitBreakers: Map<string, CircuitBreaker>;
  private globalRateLimiter: RateLimiter | null;
  private endpointRateLimiters: Map<string, RateLimiter>;

  private constructor(config?: Partial<HttpHelperConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cache = new HttpCache();
    this.metricsTracker = new HttpMetricsTracker();
    this.circuitBreakers = new Map();
    this.endpointRateLimiters = new Map();

    // Inicializar rate limiter global
    this.globalRateLimiter = this.config.rateLimiter.enabled
      ? new RateLimiter(
          {
            limit: this.config.rateLimiter.globalLimit,
            window: this.config.rateLimiter.globalWindow,
            burstSize: this.config.rateLimiter.burstSize
          },
          'GLOBAL'
        )
      : null;

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
    const circuitBreakerUpdated = newConfig.circuitBreaker !== undefined;
    const rateLimiterUpdated = newConfig.rateLimiter !== undefined;

    this.config = {
      ...oldConfig,
      ...newConfig,
      circuitBreaker: circuitBreakerUpdated
        ? { ...oldConfig.circuitBreaker, ...newConfig.circuitBreaker! }
        : oldConfig.circuitBreaker,
      rateLimiter: rateLimiterUpdated
        ? { ...oldConfig.rateLimiter, ...newConfig.rateLimiter! }
        : oldConfig.rateLimiter
    };

    if (circuitBreakerUpdated) {
      const clearedInstances = this.circuitBreakers.size;
      this.circuitBreakers.clear();

      logInfo('HttpHelper', 'Circuit breaker configuration updated', {
        clearedInstances,
        enabled: this.config.circuitBreaker.enabled,
        failureThreshold: this.config.circuitBreaker.failureThreshold,
        openDuration: this.config.circuitBreaker.openDuration
      });
    }

    if (rateLimiterUpdated) {
      const clearedEndpoints = this.endpointRateLimiters.size;
      this.endpointRateLimiters.clear();

      // Recrear rate limiter global
      this.globalRateLimiter = this.config.rateLimiter.enabled
        ? new RateLimiter(
            {
              limit: this.config.rateLimiter.globalLimit,
              window: this.config.rateLimiter.globalWindow,
              burstSize: this.config.rateLimiter.burstSize
            },
            'GLOBAL'
          )
        : null;

      logInfo('HttpHelper', 'Rate limiter configuration updated', {
        clearedEndpoints,
        enabled: this.config.rateLimiter.enabled,
        globalLimit: this.config.rateLimiter.globalLimit,
        globalWindow: this.config.rateLimiter.globalWindow,
        perEndpointLimit: this.config.rateLimiter.perEndpointLimit
      });
    }

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
    const taggedError = error as HttpError & { __notified?: boolean };

    if (taggedError.__notified) {
      return;
    }

    taggedError.__notified = true;

    this.observers.forEach(observer => {
      if (observer.onError) {
        try {
          observer.onError(taggedError);
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
   * Obtiene métricas de circuit breaker(s)
   * @param endpoint - URL del endpoint (opcional, si no se provee retorna todos)
   * @param method - Método HTTP (opcional, requerido si se provee endpoint)
   * @returns Métricas de un endpoint o Map de todos los endpoints
   */
  public getCircuitBreakerMetrics(
    endpoint?: string,
    method?: HttpMethod
  ): CircuitBreakerMetrics | Map<string, CircuitBreakerMetrics> | null {
    // Obtener métricas de un endpoint específico
    if (endpoint && method) {
      const fullUrl = this.buildUrl(endpoint);
      const key = this.getCircuitBreakerKey(fullUrl, method);
      const circuitBreaker = this.circuitBreakers.get(key);

      if (!circuitBreaker) {
        logWarning('HttpHelper', 'Circuit breaker not found for endpoint', {
          endpoint,
          method
        });
        return null;
      }

      const metrics = circuitBreaker.getMetrics();
      logDebug('HttpHelper', 'Circuit breaker metrics retrieved', {
        endpoint,
        method,
        state: metrics.state,
        failures: metrics.failures,
        successes: metrics.successes
      });

      return metrics;
    }

    // Obtener todas las métricas
    const allMetrics = new Map<string, CircuitBreakerMetrics>();
    for (const [key, circuitBreaker] of this.circuitBreakers.entries()) {
      allMetrics.set(key, circuitBreaker.getMetrics());
    }

    logInfo('HttpHelper', 'All circuit breaker metrics retrieved', {
      totalCircuitBreakers: allMetrics.size
    });

    return allMetrics;
  }

  /**
   * Resetea un circuit breaker específico
   * @param endpoint - URL del endpoint
   * @param method - Método HTTP
   */
  public resetCircuitBreaker(endpoint: string, method: HttpMethod): boolean {
    const fullUrl = this.buildUrl(endpoint);
    const key = this.getCircuitBreakerKey(fullUrl, method);
    const circuitBreaker = this.circuitBreakers.get(key);

    if (!circuitBreaker) {
      logWarning('HttpHelper', 'Circuit breaker not found for reset', {
        endpoint,
        method
      });
      return false;
    }

    const previousState = circuitBreaker.getState();
    circuitBreaker.reset();

    logInfo('HttpHelper', 'Circuit breaker manually reset', {
      endpoint,
      method,
      previousState
    });

    return true;
  }

  /**
   * Resetea todos los circuit breakers
   * @returns Número de circuit breakers reseteados
   */
  public resetAllCircuitBreakers(): number {
    const count = this.circuitBreakers.size;

    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }

    logInfo('HttpHelper', 'All circuit breakers reset', {
      count
    });

    return count;
  }

  /**
   * Obtiene estado de todos los circuit breakers agrupados por estado
   * @returns Object con arrays de endpoints agrupados por estado
   */
  public getCircuitBreakerStatus(): {
    closed: string[];
    open: string[];
    halfOpen: string[];
    total: number;
  } {
    const status = {
      closed: [] as string[],
      open: [] as string[],
      halfOpen: [] as string[],
      total: this.circuitBreakers.size
    };

    for (const [key, circuitBreaker] of this.circuitBreakers.entries()) {
      const state = circuitBreaker.getState();
      switch (state) {
        case 'CLOSED':
          status.closed.push(key);
          break;
        case 'OPEN':
          status.open.push(key);
          break;
        case 'HALF_OPEN':
          status.halfOpen.push(key);
          break;
      }
    }

    logDebug('HttpHelper', 'Circuit breaker status retrieved', {
      total: status.total,
      closed: status.closed.length,
      open: status.open.length,
      halfOpen: status.halfOpen.length
    });

    return status;
  }

  /**
   * Obtiene métricas de rate limiter(s)
   * @param endpoint - URL del endpoint (opcional)
   * @param method - Método HTTP (opcional, requerido si se provee endpoint)
   * @returns Métricas de un endpoint o Map de todos los endpoints, o métricas globales
   */
  public getRateLimiterMetrics(
    endpoint?: string,
    method?: HttpMethod
  ): RateLimiterMetrics | Map<string, RateLimiterMetrics> | { global: RateLimiterMetrics; endpoints: Map<string, RateLimiterMetrics> } | null {
    // Métricas de un endpoint específico
    if (endpoint && method) {
      const fullUrl = this.buildUrl(endpoint);
      const key = this.getCircuitBreakerKey(fullUrl, method);
      const rateLimiter = this.endpointRateLimiters.get(key);

      if (!rateLimiter) {
        logWarning('HttpHelper', 'Rate limiter not found for endpoint', {
          endpoint,
          method
        });
        return null;
      }

      return rateLimiter.getMetrics();
    }

    // Todas las métricas (global + endpoints)
    const endpointMetrics = new Map<string, RateLimiterMetrics>();
    for (const [key, rateLimiter] of this.endpointRateLimiters.entries()) {
      endpointMetrics.set(key, rateLimiter.getMetrics());
    }

    const result = {
      global: this.globalRateLimiter?.getMetrics() || {
        tokens: 0,
        capacity: 0,
        requestsInWindow: 0,
        lastRefillTime: 0,
        totalRequests: 0,
        totalRejected: 0,
        rejectionRate: 0
      },
      endpoints: endpointMetrics
    };

    logInfo('HttpHelper', 'All rate limiter metrics retrieved', {
      hasGlobal: !!this.globalRateLimiter,
      totalEndpoints: endpointMetrics.size
    });

    return result;
  }

  /**
   * Resetea rate limiter(s)
   * @param scope - 'global' | 'endpoint' | 'all'
   * @param endpoint - URL del endpoint (requerido si scope es 'endpoint')
   * @param method - Método HTTP (requerido si scope es 'endpoint')
   */
  public resetRateLimiter(
    scope: 'global' | 'endpoint' | 'all',
    endpoint?: string,
    method?: HttpMethod
  ): boolean {
    switch (scope) {
      case 'global':
        if (this.globalRateLimiter) {
          this.globalRateLimiter.reset();
          logInfo('HttpHelper', 'Global rate limiter reset');
          return true;
        }
        return false;

      case 'endpoint':
        if (!endpoint || !method) {
          logWarning('HttpHelper', 'Endpoint and method required for endpoint reset');
          return false;
        }

        const fullUrl = this.buildUrl(endpoint);
        const key = this.getCircuitBreakerKey(fullUrl, method);
        const rateLimiter = this.endpointRateLimiters.get(key);

        if (rateLimiter) {
          rateLimiter.reset();
          logInfo('HttpHelper', 'Endpoint rate limiter reset', {
            endpoint,
            method
          });
          return true;
        }
        return false;

      case 'all':
        let count = 0;
        if (this.globalRateLimiter) {
          this.globalRateLimiter.reset();
          count++;
        }
        for (const rateLimiter of this.endpointRateLimiters.values()) {
          rateLimiter.reset();
          count++;
        }
        logInfo('HttpHelper', 'All rate limiters reset', { count });
        return count > 0;
    }
  }

  /**
   * Obtiene estado de rate limiters
   */
  public getRateLimiterStatus(): {
    global: {
      enabled: boolean;
      tokens: number;
      capacity: number;
      rejectionRate: number;
    };
    endpoints: {
      healthy: string[]; // >80% tokens
      warning: string[];  // 20-80% tokens
      limited: string[];  // <20% tokens
      total: number;
    };
  } {
    const endpointStatus = {
      healthy: [] as string[],
      warning: [] as string[],
      limited: [] as string[],
      total: this.endpointRateLimiters.size
    };

    for (const [key, rateLimiter] of this.endpointRateLimiters.entries()) {
      const metrics = rateLimiter.getMetrics();
      const percentAvailable = (metrics.tokens / metrics.capacity) * 100;

      if (percentAvailable > 80) {
        endpointStatus.healthy.push(key);
      } else if (percentAvailable > 20) {
        endpointStatus.warning.push(key);
      } else {
        endpointStatus.limited.push(key);
      }
    }

    const globalMetrics = this.globalRateLimiter?.getMetrics();

    return {
      global: {
        enabled: !!this.globalRateLimiter,
        tokens: globalMetrics?.tokens || 0,
        capacity: globalMetrics?.capacity || 0,
        rejectionRate: globalMetrics?.rejectionRate || 0
      },
      endpoints: endpointStatus
    };
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

  private getCircuitBreakerKey(url: string, method: HttpMethod): string {
    try {
      const base = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost';
      const parsed = new URL(url, base);
      return `${method}:${parsed.origin}${parsed.pathname}`;
    } catch {
      return `${method}:${url}`;
    }
  }

  private resolveCircuitBreaker(url: string, method: HttpMethod): CircuitBreaker | null {
    if (!this.config.circuitBreaker.enabled) {
      return null;
    }

    const key = this.getCircuitBreakerKey(url, method);
    let circuitBreaker = this.circuitBreakers.get(key);

    if (!circuitBreaker) {
      const identifier = `${method} ${HttpErrorHandler['sanitizeUrl'](url)}`;
      circuitBreaker = new CircuitBreaker(this.config.circuitBreaker, identifier);
      this.circuitBreakers.set(key, circuitBreaker);
    }

    return circuitBreaker;
  }

  /**
   * Obtiene o crea rate limiter para endpoint
   */
  private resolveEndpointRateLimiter(url: string, method: HttpMethod): RateLimiter | null {
    if (!this.config.rateLimiter.enabled) {
      return null;
    }

    const key = this.getCircuitBreakerKey(url, method); // Usa el mismo key format
    let rateLimiter = this.endpointRateLimiters.get(key);

    if (!rateLimiter) {
      const identifier = `${method} ${HttpErrorHandler['sanitizeUrl'](url)}`;
      rateLimiter = new RateLimiter(
        {
          limit: this.config.rateLimiter.perEndpointLimit,
          window: this.config.rateLimiter.perEndpointWindow,
          burstSize: this.config.rateLimiter.burstSize
        },
        identifier
      );
      this.endpointRateLimiters.set(key, rateLimiter);
    }

    return rateLimiter;
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
    attempt: number = 1,
    circuitBreaker?: CircuitBreaker,
    globalRateLimiter?: RateLimiter | null,
    endpointRateLimiter?: RateLimiter | null
  ): Promise<HttpResponse<T>> {
    const method = requestConfig.method || 'GET';
    const startTime = Date.now();
    const timeout = requestConfig.timeout || this.config.timeout;
    const { controller, timeoutId } = this.createTimeoutController(timeout);

    // Log inicio de request
    logDebug('HttpHelper', `Starting HTTP request (attempt ${attempt})`, {
      method,
      url: HttpErrorHandler['sanitizeUrl'](url),
      timeout,
      hasBody: !!requestConfig.body
    });

    try {
      // Verificar rate limiting global
      if (globalRateLimiter && !globalRateLimiter.tryConsume()) {
        const waitTime = globalRateLimiter.getWaitTime();
        throw HttpErrorHandler.createError(
          'CLIENT',
          `Global rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s before retry.`,
          url,
          0,
          undefined,
          undefined,
          {
            rateLimitType: 'global',
            waitTime,
            retryAfter: Date.now() + waitTime
          }
        );
      }

      // Verificar rate limiting por endpoint
      if (endpointRateLimiter && !endpointRateLimiter.tryConsume()) {
        const waitTime = endpointRateLimiter.getWaitTime();
        throw HttpErrorHandler.createError(
          'CLIENT',
          `Endpoint rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s before retry.`,
          url,
          0,
          undefined,
          undefined,
          {
            rateLimitType: 'endpoint',
            waitTime,
            retryAfter: Date.now() + waitTime
          }
        );
      }

      circuitBreaker?.canProceed();

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
        if (errorType === 'SERVER') {
          circuitBreaker?.recordFailure();
        }
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

      circuitBreaker?.recordSuccess();

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
        circuitBreaker?.recordFailure();
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
        const httpError = error as HttpError;

        if (httpError.type === 'PARSE') {
          circuitBreaker?.recordFailure();
          if (this.config.enableMetrics) {
            this.metricsTracker.trackFailure(httpError.status, duration);
          }
        }

        this.notifyErrorObservers(httpError);
        throw httpError;
      }

      // Error de red
      circuitBreaker?.recordFailure();
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

        // Evitar reintentos cuando el circuito se abrió durante este fallo
        if (circuitBreaker && circuitBreaker.getState() === 'OPEN') {
          this.notifyErrorObservers(networkError);
          throw networkError;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.executeWithRetries<T>(url, requestConfig, attempt + 1, circuitBreaker, globalRateLimiter, endpointRateLimiter);
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

    const circuitBreaker = this.resolveCircuitBreaker(fullUrl, method);
    const endpointRateLimiter = this.resolveEndpointRateLimiter(fullUrl, method);

    try {
      return await this.executeWithRetries<T>(
        fullUrl,
        config,
        1,
        circuitBreaker ?? undefined,
        this.globalRateLimiter,
        endpointRateLimiter
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        const httpError = error as HttpError;

        if (this.config.enableMetrics) {
          const details = httpError.details as { circuitBreakerState?: string; rateLimitType?: string } | undefined;
          if (details?.circuitBreakerState === 'OPEN' || details?.circuitBreakerState === 'HALF_OPEN' || details?.rateLimitType) {
            this.metricsTracker.trackRequest(method);
            this.metricsTracker.trackFailure(undefined, 0);
          }
        }

        this.notifyErrorObservers(httpError);
      }
      throw error;
    }
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
