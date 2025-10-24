/**
 * Rate Limiter para requests a APIs externas
 * 
 * @module RateLimiter
 * @description Implementa rate limiting con cola para cumplir políticas de uso de APIs
 * 
 * @performance
 * - Respeta límite de 1 request/segundo de Nominatim
 * - Cola automática de requests pendientes
 * - Previene bans por abuso de API
 * 
 * @security
 * - Protección contra rate limiting abusivo
 * - Logging de métricas de cola
 * - Manejo robusto de errores
 */

import { logInfo, logDebug, logWarning } from '../log/logger.helper';

const MODULE_NAME = 'RateLimiter';

/**
 * Item en la cola de rate limiting
 */
interface QueueItem<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  fn: () => Promise<T>;
  timestamp: number;
}

/**
 * Métricas del rate limiter
 */
export interface RateLimiterMetrics {
  queueSize: number;
  totalProcessed: number;
  totalErrors: number;
  averageWaitTime: number;
  longestWaitTime: number;
}

/**
 * Clase para gestionar rate limiting de requests
 */
class RateLimiter {
  private lastRequestTime = 0;
  private readonly minInterval: number; // Intervalo mínimo en ms
  private requestQueue: Array<QueueItem<any>> = [];
  private processing = false;
  
  // Métricas
  private totalProcessed = 0;
  private totalErrors = 0;
  private waitTimes: number[] = [];

  /**
   * Constructor
   * @param minInterval - Intervalo mínimo entre requests en ms (default: 1000ms = 1 req/segundo)
   */
  constructor(minInterval: number = 1000) {
    this.minInterval = minInterval;
    logInfo(MODULE_NAME, 'Rate limiter inicializado', { 
      minInterval: `${minInterval}ms`,
      requestsPerSecond: (1000 / minInterval).toFixed(2)
    });
  }

  /**
   * Ejecuta función respetando rate limit
   * 
   * @param fn - Función asíncrona a ejecutar
   * @returns Promesa con el resultado de la función
   * 
   * @example
   * ```typescript
   * const limiter = new RateLimiter(1000); // 1 req/segundo
   * 
   * const result = await limiter.execute(async () => {
   *   return await fetch('https://api.example.com/data');
   * });
   * ```
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        resolve,
        reject,
        fn,
        timestamp: Date.now()
      };

      this.requestQueue.push(queueItem as QueueItem<any>);

      logDebug(MODULE_NAME, 'Request agregado a cola', {
        queueSize: this.requestQueue.length,
        position: this.requestQueue.length
      });

      // Advertir si la cola crece demasiado
      if (this.requestQueue.length > 10) {
        logWarning(MODULE_NAME, 'Cola de rate limiter grande', {
          queueSize: this.requestQueue.length,
          warning: 'Considere reducir la frecuencia de requests'
        });
      }

      this.processQueue();
    });
  }

  /**
   * Procesa la cola de requests respetando el rate limit
   */
  private async processQueue(): Promise<void> {
    // Si ya está procesando o no hay items, retornar
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Esperar si es necesario para respetar el intervalo mínimo
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        
        logDebug(MODULE_NAME, 'Esperando para respetar rate limit', {
          waitTime: `${waitTime}ms`,
          queueSize: this.requestQueue.length
        });

        await this.sleep(waitTime);
      }

      const request = this.requestQueue.shift();
      if (!request) continue;

      // Calcular tiempo de espera
      const waitTime = Date.now() - request.timestamp;
      this.waitTimes.push(waitTime);
      
      // Mantener solo últimos 100 tiempos de espera
      if (this.waitTimes.length > 100) {
        this.waitTimes.shift();
      }

      try {
        this.lastRequestTime = Date.now();
        
        logDebug(MODULE_NAME, 'Ejecutando request', {
          queueSize: this.requestQueue.length,
          waitTime: `${waitTime}ms`
        });

        const result = await request.fn();
        request.resolve(result);
        this.totalProcessed++;

        logDebug(MODULE_NAME, 'Request completado exitosamente', {
          totalProcessed: this.totalProcessed,
          remainingQueue: this.requestQueue.length
        });

      } catch (error) {
        this.totalErrors++;
        logWarning(MODULE_NAME, 'Error ejecutando request', {
          error: error instanceof Error ? error.message : 'Unknown error',
          totalErrors: this.totalErrors
        });
        request.reject(error);
      }
    }

    this.processing = false;

    logDebug(MODULE_NAME, 'Cola procesada completamente', {
      totalProcessed: this.totalProcessed,
      totalErrors: this.totalErrors
    });
  }

  /**
   * Helper para sleep asíncrono
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene el tamaño actual de la cola
   */
  public getQueueSize(): number {
    return this.requestQueue.length;
  }

  /**
   * Verifica si el limiter está procesando
   */
  public isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Obtiene métricas del rate limiter
   */
  public getMetrics(): RateLimiterMetrics {
    const avgWaitTime = this.waitTimes.length > 0
      ? this.waitTimes.reduce((sum, time) => sum + time, 0) / this.waitTimes.length
      : 0;

    const longestWaitTime = this.waitTimes.length > 0
      ? Math.max(...this.waitTimes)
      : 0;

    return {
      queueSize: this.requestQueue.length,
      totalProcessed: this.totalProcessed,
      totalErrors: this.totalErrors,
      averageWaitTime: avgWaitTime,
      longestWaitTime: longestWaitTime
    };
  }

  /**
   * Limpia la cola y resetea métricas
   */
  public clear(): void {
    // Rechazar todos los requests pendientes
    this.requestQueue.forEach(item => {
      item.reject(new Error('Rate limiter cleared'));
    });

    this.requestQueue = [];
    this.totalProcessed = 0;
    this.totalErrors = 0;
    this.waitTimes = [];
    
    logInfo(MODULE_NAME, 'Rate limiter limpiado');
  }
}

/**
 * Instancia de rate limiter para geocoding (Nominatim: 1 req/segundo)
 * 
 * @example
 * ```typescript
 * import { geocodingRateLimiter } from '@/helper/geocoding/rate-limiter.helper';
 * 
 * // Ejecutar request con rate limiting
 * const result = await geocodingRateLimiter.execute(async () => {
 *   return await fetch('https://nominatim.openstreetmap.org/reverse?...');
 * });
 * 
 * // Ver estado de la cola
 * console.log('Queue size:', geocodingRateLimiter.getQueueSize());
 * 
 * // Ver métricas
 * const metrics = geocodingRateLimiter.getMetrics();
 * console.log('Average wait time:', metrics.averageWaitTime, 'ms');
 * ```
 */
export const geocodingRateLimiter = new RateLimiter(1000); // 1 request por segundo

/**
 * Instancia de rate limiter genérico (configurable)
 * Útil para otras APIs con diferentes límites
 * 
 * @example
 * ```typescript
 * import { RateLimiter } from '@/helper/geocoding/rate-limiter.helper';
 * 
 * // Crear limiter personalizado: 5 requests por segundo
 * const myLimiter = new RateLimiter(200);
 * 
 * const result = await myLimiter.execute(async () => {
 *   return await fetch('https://api.example.com/data');
 * });
 * ```
 */
export { RateLimiter };
