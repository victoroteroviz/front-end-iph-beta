/**
 * HTTP Helper robusto para manejo de peticiones HTTP
 * Siguiendo principios SOLID, KISS y DRY
 */

import { logHttp, logError } from '../log/logger.helper';

/**
 * Tipos de métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Tipos de contenido soportados
 */
export type ContentType = 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'text/plain';

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
}

/**
 * Interface para errores HTTP personalizados
 */
export interface HttpError {
  type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'CLIENT' | 'SERVER' | 'PARSE' | 'UNKNOWN';
  message: string;
  status?: number;
  statusText?: string;
  url: string;
  duration: number;
  originalError?: unknown;
  response?: Response;
}

/**
 * Interface para la configuración global del HTTP helper
 */
export interface HttpHelperConfig {
  baseURL?: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
  authTokenGetter?: () => string | null;
  authHeaderName: string;
  authHeaderPrefix: string;
}

/**
 * Configuración por defecto
 */
const DEFAULT_CONFIG: HttpHelperConfig = {
  timeout: 30000, // 30 segundos
  retries: 3,
  retryDelay: 1000, // 1 segundo
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  authHeaderName: 'Authorization',
  authHeaderPrefix: 'Bearer',
  authTokenGetter: () => {
    try {
      // Usar 'token' que es la key donde login.service.ts guarda el token
      return sessionStorage.getItem('token');
    } catch {
      return null;
    }
  }
};

/**
 * Clase principal del HTTP Helper
 * Implementa el patrón Builder y principio Single Responsibility
 */
class HttpHelper {
  private config: HttpHelperConfig;
  private static instance: HttpHelper;

  private constructor(config?: Partial<HttpHelperConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Obtiene la instancia única del HTTP helper (Singleton)
   * Si ya existe una instancia y se proporciona nueva configuración, se actualiza
   */
  public static getInstance(config?: Partial<HttpHelperConfig>): HttpHelper {
    if (!HttpHelper.instance) {
      HttpHelper.instance = new HttpHelper(config);
      console.log('🆕 HTTP Helper instance created with config:', HttpHelper.instance.config);
    } else if (config) {
      // Actualizar configuración si se proporciona nueva
      HttpHelper.instance.updateConfig(config);
      console.log('🔄 HTTP Helper config updated:', HttpHelper.instance.config);
    }
    return HttpHelper.instance;
  }

  /**
   * Actualiza la configuración global
   */
  public updateConfig(newConfig: Partial<HttpHelperConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): HttpHelperConfig {
    return { ...this.config };
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    // Debug logging para análisis
    console.log('🔧 DEBUG buildUrl:', {
      endpoint,
      hasBaseURL: !!this.config.baseURL,
      baseURL: this.config.baseURL,
      isAbsolute: endpoint.startsWith('http://') || endpoint.startsWith('https://')
    });

    // Si es una URL absoluta, retornarla tal cual
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      console.log('✅ Using absolute URL:', endpoint);
      return endpoint;
    }

    // Si hay baseURL configurada, combinarla con el endpoint
    if (this.config.baseURL) {
      const base = this.config.baseURL.endsWith('/') ? this.config.baseURL.slice(0, -1) : this.config.baseURL;
      const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const fullUrl = `${base}${path}`;
      console.log('🌐 Built URL with baseURL:', { base, path, fullUrl });
      return fullUrl;
    }

    // Si no hay baseURL, usar el endpoint como relativo (proxy de Vite lo manejará)
    // Asegurar que comience con /
    const relativeUrl = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    console.log('📍 Using relative URL:', relativeUrl);
    return relativeUrl;
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

    // Configurar Content-Type si se especifica
    if (config.contentType) {
      headers['Content-Type'] = config.contentType;
    }

    // Agregar token de autenticación si es necesario
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
        // Para FormData, no establecer Content-Type (el navegador lo hace automáticamente)
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
  private createTimeoutController(timeout: number): { controller: AbortController; timeoutId: number } {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, timeout);

    return { controller, timeoutId };
  }

  /**
   * Procesa la respuesta y la convierte a JSON automáticamente
   */
  private async processResponse<T>(response: Response, startTime: number): Promise<HttpResponse<T>> {
    const duration = Date.now() - startTime;

    let data: T;
    const contentType = response.headers.get('content-type') || '';

    // Debug logging para analizar el problema
    console.log('🔍 DEBUG processResponse:', {
      url: response.url,
      status: response.status,
      contentType,
      headers: Object.fromEntries(response.headers.entries())
    });

    try {
      if (contentType.includes('application/json')) {
        data = await response.json();
        console.log('✅ Parsed as JSON:', typeof data, Object.keys(data || {}));
      } else if (contentType.includes('text/')) {
        data = await response.text() as T;
        console.log('📝 Parsed as TEXT:', typeof data, (data as string).substring(0, 100));
      } else {
        data = await response.blob() as T;
        console.log('📄 Parsed as BLOB:', typeof data);
      }
    } catch (error) {
      throw this.createHttpError('PARSE', 'Error parsing response', response, duration, error);
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
   * Crea un error HTTP estructurado
   */
  private createHttpError(
    type: HttpError['type'],
    message: string,
    response?: Response,
    duration: number = 0,
    originalError?: unknown
  ): HttpError {
    return {
      type,
      message,
      status: response?.status,
      statusText: response?.statusText,
      url: response?.url || 'unknown',
      duration,
      originalError,
      response
    };
  }

  /**
   * Determina el tipo de error basado en el status code
   */
  private getErrorType(status: number): HttpError['type'] {
    if (status === 401 || status === 403) return 'AUTH';
    if (status >= 400 && status < 500) return 'CLIENT';
    if (status >= 500) return 'SERVER';
    return 'UNKNOWN';
  }

  /**
   * Implementa reintentos con backoff exponencial
   */
  private async executeWithRetries<T>(
    url: string,
    requestConfig: HttpRequestConfig,
    attempt: number = 1
  ): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    const timeout = requestConfig.timeout || this.config.timeout;
    const { controller, timeoutId } = this.createTimeoutController(timeout);

    try {
      const headers = this.buildHeaders(requestConfig);
      const body = this.processBody(requestConfig.body, requestConfig.contentType);

      // Remover Content-Type para FormData
      if (requestConfig.contentType === 'multipart/form-data') {
        delete headers['Content-Type'];
      }

      const fetchOptions: RequestInit = {
        method: requestConfig.method || 'GET',
        headers,
        body,
        signal: controller.signal
      };

      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      // Log de la petición
      logHttp(fetchOptions.method || 'GET', url, response.status, duration);

      if (!response.ok) {
        // Intentar extraer el body del error para obtener detalles del backend
        let errorBody: unknown = null;
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            errorBody = await response.clone().json();
          } else {
            errorBody = await response.clone().text();
          }
        } catch (parseError) {
          console.warn('⚠️ No se pudo parsear el body del error:', parseError);
        }

        const errorType = this.getErrorType(response.status);
        const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        const httpError = this.createHttpError(errorType, errorMessage, response, duration);

        // Agregar el body del error al objeto de error
        // Esto permite que parseBackendError acceda a details.message
        if (errorBody && typeof errorBody === 'object' && !Array.isArray(errorBody)) {
          throw { ...httpError, ...errorBody };
        } else {
          throw httpError;
        }
      }

      return await this.processResponse<T>(response, startTime);

    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      // Si es un error de abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = this.createHttpError('TIMEOUT', `Request timeout after ${timeout}ms`, undefined, duration, error);
        logError('HTTP', timeoutError, `Timeout in ${url}`);
        throw timeoutError;
      }

      // Si es un HttpError ya procesado, re-lanzarlo
      if (error && typeof error === 'object' && 'type' in error) {
        logError('HTTP', error, `HTTP Error in ${url}`);
        throw error;
      }

      // Error de red u otro
      const networkError = this.createHttpError('NETWORK', `Network error: ${String(error)}`, undefined, duration, error);
      
      // Intentar reintento si no hemos alcanzado el límite
      const maxRetries = requestConfig.retries ?? this.config.retries;
      if (attempt < maxRetries) {
        const retryDelay = (requestConfig.retryDelay ?? this.config.retryDelay) * Math.pow(2, attempt - 1);
        logError('HTTP', `Attempt ${attempt} failed, retrying in ${retryDelay}ms`, url);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.executeWithRetries<T>(url, requestConfig, attempt + 1);
      }

      logError('HTTP', networkError, `Network error in ${url} after ${attempt} attempts`);
      throw networkError;
    }
  }

  /**
   * Método genérico para realizar peticiones HTTP
   */
  public async request<T = unknown>(url: string, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url);
    return this.executeWithRetries<T>(fullUrl, config);
  }

  /**
   * Métodos de conveniencia para diferentes tipos de peticiones
   */
  public async get<T = unknown>(url: string, config: Omit<HttpRequestConfig, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  public async post<T = unknown>(url: string, body?: unknown, config: Omit<HttpRequestConfig, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'POST', body });
  }

  public async put<T = unknown>(url: string, body?: unknown, config: Omit<HttpRequestConfig, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PUT', body });
  }

  public async patch<T = unknown>(url: string, body?: unknown, config: Omit<HttpRequestConfig, 'method'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'PATCH', body });
  }

  public async delete<T = unknown>(url: string, config: Omit<HttpRequestConfig, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * Método para upload de archivos
   */
  public async uploadFile<T = unknown>(url: string, file: File, additionalData?: Record<string, string>, config: Omit<HttpRequestConfig, 'method' | 'body' | 'contentType'> = {}): Promise<HttpResponse<T>> {
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
export { httpHelper, HttpHelper };
export default httpHelper;
