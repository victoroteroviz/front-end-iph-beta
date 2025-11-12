/**
 * Route Preloader Helper v1.0.0
 *
 * Helper para precarga inteligente de rutas lazy-loaded
 *
 * Características:
 * - ✅ Precarga componentes lazy antes de navegar
 * - ✅ Usa requestIdleCallback para no bloquear UI
 * - ✅ Cachea componentes ya precargados
 * - ✅ Soporte para preload on hover (sidebar)
 * - ✅ Precarga de rutas vecinas cuando idle
 * - ✅ Priorización inteligente de rutas
 * - ✅ Integración con CacheHelper
 * - ✅ Métricas de precarga
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import type { LazyExoticComponent, ComponentType } from 'react';
import { logInfo, logWarning, logError } from '../log/logger.helper';
import { CacheHelper } from '../cache/cache.helper';

// =====================================================
// TYPES
// =====================================================

/**
 * Prioridad de precarga
 */
export type PreloadPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Opciones de precarga
 */
export type PreloadOptions = {
  /** Prioridad de precarga */
  priority?: PreloadPriority;
  /** Delay antes de precargar (ms) */
  delay?: number;
  /** Usar requestIdleCallback si está disponible */
  useIdleCallback?: boolean;
  /** Timeout para requestIdleCallback (ms) */
  idleTimeout?: number;
  /** Cachear resultado */
  cache?: boolean;
};

/**
 * Metadata de ruta precargada
 */
type PreloadedRoute = {
  /** ID de la ruta */
  routeId: string;
  /** Path de la ruta */
  path: string;
  /** Timestamp de precarga */
  timestamp: number;
  /** Prioridad usada */
  priority: PreloadPriority;
  /** Tiempo de precarga en ms */
  loadTime: number;
  /** Si la precarga fue exitosa */
  success: boolean;
};

/**
 * Estadísticas de precarga
 */
export type PreloadStats = {
  /** Total de rutas precargadas */
  totalPreloaded: number;
  /** Precargas exitosas */
  successful: number;
  /** Precargas fallidas */
  failed: number;
  /** Tiempo promedio de precarga (ms) */
  avgLoadTime: number;
  /** Rutas más precargadas */
  mostPreloaded: Array<{ routeId: string; count: number }>;
  /** Caché hit rate */
  cacheHitRate: number;
};

// =====================================================
// ROUTE PRELOADER CLASS
// =====================================================

/**
 * Helper para precarga inteligente de rutas
 *
 * @example
 * ```typescript
 * // Precargar ruta con prioridad alta
 * RoutePreloader.preload('inicio', LazyInicio, {
 *   priority: 'high',
 *   delay: 0
 * });
 *
 * // Precargar al hacer hover (con delay)
 * RoutePreloader.preloadOnHover('usuarios', LazyUsuarios);
 *
 * // Precargar rutas vecinas cuando idle
 * RoutePreloader.preloadNeighbors(['inicio', 'estadisticas']);
 *
 * // Ver estadísticas
 * const stats = RoutePreloader.getStats();
 * console.log(`Precargadas: ${stats.totalPreloaded}`);
 * ```
 */
export class RoutePreloader {
  // Set de rutas ya precargadas (para evitar duplicados)
  private static preloadedRoutes = new Set<string>();

  // Mapa de timers de precarga (para cancelar si es necesario)
  private static preloadTimers = new Map<string, NodeJS.Timeout>();

  // Historial de precargas (para métricas)
  private static preloadHistory: PreloadedRoute[] = [];

  // Métricas de cache
  private static cacheMetrics = {
    hits: 0,
    misses: 0
  };

  // Configuración
  private static config = {
    enableLogging: true,
    enableCaching: true,
    maxHistorySize: 100,
    defaultDelay: 500, // ms
    defaultIdleTimeout: 2000 // ms
  };

  /**
   * Configura el RoutePreloader
   *
   * @param config - Configuración parcial
   */
  static configure(config: Partial<typeof RoutePreloader.config>): void {
    this.config = { ...this.config, ...config };
    this.log('info', 'RoutePreloader configurado', this.config);
  }

  /**
   * Precarga una ruta lazy-loaded
   *
   * @param routeId - ID único de la ruta
   * @param component - Componente lazy a precargar
   * @param options - Opciones de precarga
   * @returns Promise que se resuelve cuando termina
   *
   * @example
   * ```typescript
   * // Precarga inmediata con prioridad alta
   * await RoutePreloader.preload('inicio', LazyInicio, {
   *   priority: 'high',
   *   delay: 0
   * });
   *
   * // Precarga con delay (para hover)
   * RoutePreloader.preload('usuarios', LazyUsuarios, {
   *   delay: 500,
   *   priority: 'medium'
   * });
   * ```
   */
  static async preload<T extends ComponentType<any>>(
    routeId: string,
    component: LazyExoticComponent<T>,
    options: PreloadOptions = {}
  ): Promise<void> {
    // Opciones por defecto
    const opts: Required<PreloadOptions> = {
      priority: 'medium',
      delay: this.config.defaultDelay,
      useIdleCallback: true,
      idleTimeout: this.config.defaultIdleTimeout,
      cache: this.config.enableCaching,
      ...options
    };

    // Si ya está precargada, skip
    if (this.preloadedRoutes.has(routeId)) {
      this.log('info', `Ruta ya precargada: ${routeId}`);
      return;
    }

    // Cancelar timer previo si existe
    this.cancelPreload(routeId);

    // Si hay delay, usar timer
    if (opts.delay > 0) {
      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          await this.executePreload(routeId, component, opts);
          resolve();
        }, opts.delay);

        this.preloadTimers.set(routeId, timer);
      });
    }

    // Sin delay, ejecutar inmediatamente
    return this.executePreload(routeId, component, opts);
  }

  /**
   * Precarga una ruta cuando el usuario hace hover
   * Útil para sidebar items
   *
   * @param routeId - ID de la ruta
   * @param component - Componente lazy
   * @param delay - Delay antes de precargar (default: 500ms)
   * @returns Función cleanup para cancelar
   *
   * @example
   * ```typescript
   * // En el sidebar item:
   * const handleMouseEnter = () => {
   *   const cleanup = RoutePreloader.preloadOnHover('usuarios', LazyUsuarios);
   *   // Guardar cleanup para onMouseLeave
   * };
   *
   * const handleMouseLeave = () => {
   *   cleanup(); // Cancelar si sale antes del delay
   * };
   * ```
   */
  static preloadOnHover<T extends ComponentType<any>>(
    routeId: string,
    component: LazyExoticComponent<T>,
    delay: number = 500
  ): () => void {
    // Iniciar precarga con delay
    this.preload(routeId, component, {
      priority: 'medium',
      delay,
      useIdleCallback: true
    });

    // Retornar función para cancelar
    return () => this.cancelPreload(routeId);
  }

  /**
   * Precarga rutas vecinas cuando el navegador está idle
   * Útil para precargar rutas relacionadas
   *
   * @param routes - Array de rutas a precargar
   *
   * @example
   * ```typescript
   * // Precargar rutas relacionadas cuando el usuario está en Inicio
   * RoutePreloader.preloadNeighbors([
   *   { id: 'estadisticas', component: LazyEstadisticas },
   *   { id: 'usuarios', component: LazyUsuarios }
   * ]);
   * ```
   */
  static preloadNeighbors<T extends ComponentType<any>>(
    routes: Array<{
      id: string;
      component: LazyExoticComponent<T>;
      priority?: PreloadPriority;
    }>
  ): void {
    routes.forEach(({ id, component, priority = 'low' }) => {
      this.preload(id, component, {
        priority,
        delay: 0,
        useIdleCallback: true,
        idleTimeout: 3000 // Mayor timeout para neighbors
      });
    });
  }

  /**
   * Cancela una precarga pendiente
   *
   * @param routeId - ID de la ruta
   */
  static cancelPreload(routeId: string): void {
    const timer = this.preloadTimers.get(routeId);
    if (timer) {
      clearTimeout(timer);
      this.preloadTimers.delete(routeId);
      this.log('info', `Precarga cancelada: ${routeId}`);
    }
  }

  /**
   * Cancela todas las precargas pendientes
   */
  static cancelAll(): void {
    this.preloadTimers.forEach((timer) => clearTimeout(timer));
    this.preloadTimers.clear();
    this.log('info', 'Todas las precargas canceladas');
  }

  /**
   * Verifica si una ruta ya está precargada
   *
   * @param routeId - ID de la ruta
   * @returns true si está precargada
   */
  static isPreloaded(routeId: string): boolean {
    return this.preloadedRoutes.has(routeId);
  }

  /**
   * Resetea todas las rutas precargadas
   * Útil para testing o cuando cambia la configuración
   */
  static reset(): void {
    this.cancelAll();
    this.preloadedRoutes.clear();
    this.preloadHistory = [];
    this.cacheMetrics = { hits: 0, misses: 0 };
    this.log('info', 'RoutePreloader reseteado');
  }

  /**
   * Obtiene estadísticas de precarga
   *
   * @returns Estadísticas completas
   */
  static getStats(): PreloadStats {
    const successful = this.preloadHistory.filter(r => r.success).length;
    const failed = this.preloadHistory.filter(r => !r.success).length;

    // Calcular tiempo promedio de precarga
    const successfulPreloads = this.preloadHistory.filter(r => r.success);
    const avgLoadTime = successfulPreloads.length > 0
      ? successfulPreloads.reduce((acc, r) => acc + r.loadTime, 0) / successfulPreloads.length
      : 0;

    // Contar rutas más precargadas
    const routeCount = new Map<string, number>();
    this.preloadHistory.forEach(r => {
      routeCount.set(r.routeId, (routeCount.get(r.routeId) || 0) + 1);
    });

    const mostPreloaded = Array.from(routeCount.entries())
      .map(([routeId, count]) => ({ routeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Cache hit rate
    const totalCacheAccess = this.cacheMetrics.hits + this.cacheMetrics.misses;
    const cacheHitRate = totalCacheAccess > 0
      ? Math.round((this.cacheMetrics.hits / totalCacheAccess) * 100 * 100) / 100
      : 0;

    return {
      totalPreloaded: this.preloadHistory.length,
      successful,
      failed,
      avgLoadTime: Math.round(avgLoadTime * 100) / 100,
      mostPreloaded,
      cacheHitRate
    };
  }

  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================

  /**
   * Ejecuta la precarga del componente
   */
  private static async executePreload<T extends ComponentType<any>>(
    routeId: string,
    component: LazyExoticComponent<T>,
    options: Required<PreloadOptions>
  ): Promise<void> {
    const startTime = performance.now();

    try {
      // Verificar si está en cache primero
      if (options.cache) {
        const cached = await CacheHelper.get<boolean>(`route_${routeId}`, true);
        if (cached) {
          this.cacheMetrics.hits++;
          this.log('info', `Ruta cargada desde cache: ${routeId}`);
          this.preloadedRoutes.add(routeId);
          return;
        }
        this.cacheMetrics.misses++;
      }

      // Función para ejecutar la precarga
      const doPreload = async () => {
        this.log('info', `Precargando ruta: ${routeId}`, { priority: options.priority });

        // Precargar el componente lazy
        // @ts-ignore - _result es usado para forzar la carga
        const _result = await (component as any).preload?.() || await component._payload?._result || component;

        const loadTime = performance.now() - startTime;

        // Marcar como precargada
        this.preloadedRoutes.add(routeId);

        // Guardar en cache si está habilitado
        if (options.cache) {
          CacheHelper.set(`route_${routeId}`, true, {
            expiresIn: 30 * 60 * 1000, // 30 minutos
            priority: options.priority === 'critical' ? 'critical' : 'high',
            namespace: 'routes',
            useSessionStorage: true
          });
        }

        // Agregar al historial
        this.addToHistory({
          routeId,
          path: routeId,
          timestamp: Date.now(),
          priority: options.priority,
          loadTime,
          success: true
        });

        this.log('info', `Ruta precargada exitosamente: ${routeId}`, {
          loadTime: `${loadTime.toFixed(2)}ms`
        });
      };

      // Usar requestIdleCallback si está disponible y habilitado
      if (options.useIdleCallback && 'requestIdleCallback' in window) {
        await new Promise<void>((resolve, reject) => {
          requestIdleCallback(
            async () => {
              try {
                await doPreload();
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            { timeout: options.idleTimeout }
          );
        });
      } else {
        // Ejecutar directamente si no hay requestIdleCallback
        await doPreload();
      }

    } catch (error) {
      const loadTime = performance.now() - startTime;

      this.log('error', `Error precargando ruta: ${routeId}`, error);

      // Agregar al historial como fallida
      this.addToHistory({
        routeId,
        path: routeId,
        timestamp: Date.now(),
        priority: options.priority,
        loadTime,
        success: false
      });
    }
  }

  /**
   * Agrega una entrada al historial de precargas
   */
  private static addToHistory(entry: PreloadedRoute): void {
    this.preloadHistory.push(entry);

    // Limitar tamaño del historial
    if (this.preloadHistory.length > this.config.maxHistorySize) {
      this.preloadHistory.shift();
    }
  }

  /**
   * Helper para logging
   */
  private static log(
    level: 'info' | 'warn' | 'error',
    message: string,
    data?: unknown
  ): void {
    if (!this.config.enableLogging) return;

    if (level === 'error') {
      logError('RoutePreloader', data || new Error(message), message);
    } else if (level === 'warn') {
      logWarning('RoutePreloader', message, data);
    } else {
      logInfo('RoutePreloader', message, data);
    }
  }
}

// =====================================================
// EXPORT
// =====================================================

export default RoutePreloader;
