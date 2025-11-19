/**
 * @fileoverview Clase para métricas y estadísticas de Cache Helper
 * @version 1.0.0
 * @since 2025-01-31
 *
 * Esta clase encapsula TODA la lógica de métricas del sistema de cache
 * siguiendo el principio de Single Responsibility (SOLID).
 *
 * BENEFICIOS:
 * - ✅ Encapsulación: Toda la lógica de métricas en un solo lugar
 * - ✅ Testability: Fácil de testear estadísticas aisladamente
 * - ✅ Extensibilidad: Fácil agregar nuevas métricas
 * - ✅ Claridad: API auto-explicativa
 *
 * @author Sistema IPH
 */

/**
 * Estadísticas completas de cache
 */
export interface CacheMetricsSnapshot {
  // Métricas generales
  /** Total de hits (L1 + L2) */
  hits: number;
  /** Total de misses */
  misses: number;
  /** Total de accesos (hits + misses) */
  totalAccesses: number;
  /** Hit rate general (%) */
  hitRate: number;

  // Métricas de L1 (memoria)
  /** Hits desde L1 cache */
  l1Hits: number;
  /** Hit rate de L1 sobre total de hits (%) */
  l1HitRate: number;

  // Métricas de L2 (storage)
  /** Hits desde L2 cache */
  l2Hits: number;
  /** Hit rate de L2 sobre total de hits (%) */
  l2HitRate: number;

  // Métricas de tiempo
  /** Timestamp de última limpieza */
  lastCleanup: number;
  /** Timestamp de inicio de métricas */
  startedAt: number;
  /** Tiempo transcurrido desde inicio (ms) */
  uptime: number;

  // Métricas derivadas (calculadas)
  /** Promedio de hits por segundo */
  hitsPerSecond: number;
  /** Promedio de misses por segundo */
  missesPerSecond: number;
}

/**
 * Clase para gestión de métricas de cache
 *
 * PRINCIPIOS APLICADOS:
 * - Single Responsibility: Solo gestiona métricas
 * - Encapsulation: Estado privado, API pública clara
 * - Immutability: Métodos no modifican estado externo
 *
 * THREAD-SAFETY:
 * - No usa recursos compartidos externos
 * - Seguro para uso concurrente (aunque JS es single-threaded)
 *
 * @example
 * ```typescript
 * const metrics = new CacheMetrics();
 *
 * // Registrar eventos
 * metrics.recordL1Hit();
 * metrics.recordL2Hit();
 * metrics.recordMiss();
 *
 * // Obtener estadísticas
 * const stats = metrics.getSnapshot();
 * console.log(`Hit rate: ${stats.hitRate}%`);
 * console.log(`L1 hit rate: ${stats.l1HitRate}%`);
 *
 * // Resetear
 * metrics.reset();
 * ```
 */
export class CacheMetrics {
  // =====================================================
  // ESTADO PRIVADO
  // =====================================================

  /** Total de hits (aciertos de cache) */
  private hits = 0;

  /** Total de misses (fallos de cache) */
  private misses = 0;

  /** Hits desde L1 cache (memoria) */
  private l1Hits = 0;

  /** Hits desde L2 cache (storage) */
  private l2Hits = 0;

  /** Timestamp de última limpieza de cache */
  private lastCleanup = Date.now();

  /** Timestamp de inicio de tracking de métricas */
  private readonly startedAt = Date.now();

  // =====================================================
  // REGISTRO DE EVENTOS
  // =====================================================

  /**
   * Registra un hit de L1 cache (memoria)
   *
   * EFECTO:
   * - Incrementa hits totales
   * - Incrementa hits de L1
   *
   * @example
   * ```typescript
   * metrics.recordL1Hit(); // Usuario obtuvo dato desde memoria
   * ```
   */
  recordL1Hit(): void {
    this.hits++;
    this.l1Hits++;
  }

  /**
   * Registra un hit de L2 cache (storage)
   *
   * EFECTO:
   * - Incrementa hits totales
   * - Incrementa hits de L2
   *
   * @example
   * ```typescript
   * metrics.recordL2Hit(); // Usuario obtuvo dato desde storage
   * ```
   */
  recordL2Hit(): void {
    this.hits++;
    this.l2Hits++;
  }

  /**
   * Registra un miss (dato no en cache)
   *
   * EFECTO:
   * - Incrementa misses totales
   *
   * @example
   * ```typescript
   * metrics.recordMiss(); // Dato no estaba en cache, fetch necesario
   * ```
   */
  recordMiss(): void {
    this.misses++;
  }

  /**
   * Actualiza timestamp de última limpieza
   *
   * CUÁNDO LLAMAR:
   * - Después de ejecutar cleanup de items expirados
   * - Después de eviction manual
   *
   * @example
   * ```typescript
   * cleanupExpiredItems();
   * metrics.updateLastCleanup();
   * ```
   */
  updateLastCleanup(): void {
    this.lastCleanup = Date.now();
  }

  // =====================================================
  // CONSULTA DE MÉTRICAS
  // =====================================================

  /**
   * Obtiene snapshot completo de métricas
   *
   * PERFORMANCE:
   * - O(1) - Solo cálculos aritméticos simples
   * - ~5-10 operaciones matemáticas
   * - Llamar libremente sin preocupación de performance
   *
   * @returns Snapshot inmutable de todas las métricas
   *
   * @example
   * ```typescript
   * const snapshot = metrics.getSnapshot();
   *
   * console.log(`Hit rate: ${snapshot.hitRate.toFixed(2)}%`);
   * console.log(`L1 effectiveness: ${snapshot.l1HitRate.toFixed(2)}%`);
   * console.log(`Uptime: ${snapshot.uptime}ms`);
   * ```
   */
  getSnapshot(): CacheMetricsSnapshot {
    const now = Date.now();
    const uptime = now - this.startedAt;
    const totalAccesses = this.hits + this.misses;

    // Calcular rates (con protección contra división por cero)
    const hitRate = totalAccesses > 0 ? (this.hits / totalAccesses) * 100 : 0;
    const l1HitRate = this.hits > 0 ? (this.l1Hits / this.hits) * 100 : 0;
    const l2HitRate = this.hits > 0 ? (this.l2Hits / this.hits) * 100 : 0;

    // Calcular rates por segundo (con protección contra división por cero)
    const uptimeSeconds = uptime / 1000;
    const hitsPerSecond = uptimeSeconds > 0 ? this.hits / uptimeSeconds : 0;
    const missesPerSecond = uptimeSeconds > 0 ? this.misses / uptimeSeconds : 0;

    return {
      // Contadores básicos
      hits: this.hits,
      misses: this.misses,
      totalAccesses,

      // Hit rates
      hitRate,
      l1Hits: this.l1Hits,
      l1HitRate,
      l2Hits: this.l2Hits,
      l2HitRate,

      // Timestamps
      lastCleanup: this.lastCleanup,
      startedAt: this.startedAt,
      uptime,

      // Rates derivados
      hitsPerSecond,
      missesPerSecond
    };
  }

  /**
   * Obtiene solo el hit rate general
   *
   * OPTIMIZACIÓN:
   * - Más rápido que getSnapshot() si solo necesitas hit rate
   * - Útil para logging frecuente
   *
   * @returns Hit rate como porcentaje (0-100)
   *
   * @example
   * ```typescript
   * const rate = metrics.getHitRate();
   * if (rate < 50) {
   *   console.warn('Cache hit rate bajo, considerar ajustar TTL');
   * }
   * ```
   */
  getHitRate(): number {
    const totalAccesses = this.hits + this.misses;
    return totalAccesses > 0 ? (this.hits / totalAccesses) * 100 : 0;
  }

  /**
   * Obtiene solo el L1 hit rate
   *
   * UTILIDAD:
   * - Mide efectividad de cache en memoria
   * - Ideal: >90% (mayoría de accesos desde L1)
   *
   * @returns L1 hit rate como porcentaje (0-100)
   *
   * @example
   * ```typescript
   * const l1Rate = metrics.getL1HitRate();
   * console.log(`${l1Rate.toFixed(1)}% de hits desde memoria`);
   * ```
   */
  getL1HitRate(): number {
    return this.hits > 0 ? (this.l1Hits / this.hits) * 100 : 0;
  }

  /**
   * Verifica si las métricas indican cache saludable
   *
   * CRITERIOS:
   * - Hit rate general > 70%
   * - L1 hit rate > 80% (de los hits)
   *
   * @returns true si el cache está performando bien
   *
   * @example
   * ```typescript
   * if (!metrics.isHealthy()) {
   *   console.warn('Cache performance subóptimo');
   *   // Considerar ajustar:
   *   // - TTLs más largos
   *   // - MAX_MEMORY_CACHE_ITEMS más alto
   *   // - Preloading de datos hot
   * }
   * ```
   */
  isHealthy(): boolean {
    const snapshot = this.getSnapshot();

    // Necesitamos suficientes datos para evaluar
    if (snapshot.totalAccesses < 10) {
      return true; // Muy pocas muestras, asumir saludable
    }

    const HEALTHY_HIT_RATE = 70; // 70% mínimo
    const HEALTHY_L1_RATE = 80;  // 80% mínimo de hits desde L1

    return snapshot.hitRate >= HEALTHY_HIT_RATE &&
           snapshot.l1HitRate >= HEALTHY_L1_RATE;
  }

  // =====================================================
  // GESTIÓN DE ESTADO
  // =====================================================

  /**
   * Resetea todas las métricas a cero
   *
   * CUÁNDO USAR:
   * - Al iniciar nuevas pruebas de performance
   * - Después de cambios significativos en configuración
   * - Para empezar tracking limpio
   *
   * NOTA: No resetea startedAt (para mantener uptime total)
   *
   * @example
   * ```typescript
   * // Después de configurar cache
   * cache.initialize({ maxItems: 200 });
   * metrics.reset(); // Empezar tracking desde cero
   * ```
   */
  reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.l1Hits = 0;
    this.l2Hits = 0;
    this.lastCleanup = Date.now();
    // NO resetear startedAt - queremos uptime total
  }

  /**
   * Exporta métricas en formato JSON
   *
   * UTILIDAD:
   * - Enviar a analytics/monitoring
   * - Guardar para análisis histórico
   * - Debugging
   *
   * @returns Objeto JSON serializable
   *
   * @example
   * ```typescript
   * const data = metrics.toJSON();
   * analytics.track('cache_metrics', data);
   * ```
   */
  toJSON(): CacheMetricsSnapshot {
    return this.getSnapshot();
  }

  /**
   * Genera reporte de métricas en formato legible
   *
   * UTILIDAD:
   * - Debugging en consola
   * - Logs de desarrollo
   * - Reportes de performance
   *
   * @returns String formateado con métricas
   *
   * @example
   * ```typescript
   * console.log(metrics.toString());
   * // Output:
   * // Cache Metrics:
   * //   Hit Rate: 92.5% (185/200 accesses)
   * //   L1 Hit Rate: 94.1% (174/185 hits)
   * //   ...
   * ```
   */
  toString(): string {
    const snapshot = this.getSnapshot();
    const uptimeMinutes = (snapshot.uptime / 60000).toFixed(1);

    return [
      'Cache Metrics:',
      `  Hit Rate: ${snapshot.hitRate.toFixed(1)}% (${snapshot.hits}/${snapshot.totalAccesses} accesses)`,
      `  L1 Hit Rate: ${snapshot.l1HitRate.toFixed(1)}% (${snapshot.l1Hits}/${snapshot.hits} hits)`,
      `  L2 Hit Rate: ${snapshot.l2HitRate.toFixed(1)}% (${snapshot.l2Hits}/${snapshot.hits} hits)`,
      `  Misses: ${snapshot.misses}`,
      `  Uptime: ${uptimeMinutes} minutes`,
      `  Performance: ${snapshot.hitsPerSecond.toFixed(2)} hits/sec, ${snapshot.missesPerSecond.toFixed(2)} misses/sec`,
      `  Health: ${this.isHealthy() ? '✅ HEALTHY' : '⚠️  SUBOPTIMAL'}`
    ].join('\n');
  }
}

export default CacheMetrics;
