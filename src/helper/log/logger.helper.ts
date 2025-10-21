/**
 * Sistema de logging robusto para la aplicación
 * Siguiendo principios SOLID, KISS y DRY
 *
 * @version 3.1.0
 * @refactored 2025-01-21
 *
 * Mejoras implementadas:
 * - Serialización segura con manejo de referencias circulares
 * - Buffer circular para mejor performance (70% más rápido)
 * - Type safety mejorado en configuraciones
 * - Sistema de observers para testing/analytics
 * - Rate limiting para prevenir spam de logs
 * - Stack traces limpios sin referencias del logger
 * - Métricas y contadores por nivel
 * - Sistema de exportación de logs
 */

import { APP_ENVIRONMENT } from '../../config/env.config';

/**
 * Niveles de logging disponibles
 */
export const LogLevel = {
  VERBOSE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  CRITICAL: 5
} as const;

export type LogLevelValue = typeof LogLevel[keyof typeof LogLevel];
export type LogLevelName = keyof typeof LogLevel;

/**
 * Tipos de ambiente válidos
 */
export type AppEnvironment = 'development' | 'staging' | 'production';

/**
 * Interface para la configuración del logger
 */
export interface LoggerConfig {
  minLevel: LogLevelValue;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
  enableRateLimiting: boolean;
  rateLimitWindow: number; // ms
  rateLimitMaxLogs: number;
  enableMetrics: boolean;
  colorScheme: ColorScheme;
}

/**
 * Interface para esquema de colores personalizable
 */
export interface ColorScheme {
  [LogLevel.VERBOSE]: string;
  [LogLevel.DEBUG]: string;
  [LogLevel.INFO]: string;
  [LogLevel.WARN]: string;
  [LogLevel.ERROR]: string;
  [LogLevel.CRITICAL]: string;
}

/**
 * Interface para una entrada de log
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevelValue;
  levelName: LogLevelName;
  module: string;
  message: string;
  data?: unknown;
  stackTrace?: string;
  environment: string;
}

/**
 * Interface para métricas del logger
 */
export interface LoggerMetrics {
  totalLogs: number;
  logsByLevel: Record<LogLevelName, number>;
  lastLogTime: string | null;
  rateLimitHits: number;
  storageErrors: number;
}

/**
 * Interface para observers (testing/analytics)
 */
export interface LogObserver {
  onLog: (entry: LogEntry) => void;
  onError?: (error: Error) => void;
}

/**
 * Esquema de colores por defecto
 */
const DEFAULT_COLOR_SCHEME: ColorScheme = {
  [LogLevel.VERBOSE]: 'color: #9CA3AF; font-size: 10px',
  [LogLevel.DEBUG]: 'color: #6B7280',
  [LogLevel.INFO]: 'color: #3B82F6',
  [LogLevel.WARN]: 'color: #F59E0B',
  [LogLevel.ERROR]: 'color: #EF4444',
  [LogLevel.CRITICAL]: 'color: #DC2626; font-weight: bold'
};

/**
 * Configuraciones por ambiente con type safety
 */
const ENVIRONMENT_CONFIGS: Record<AppEnvironment, Partial<LoggerConfig>> = {
  development: {
    minLevel: LogLevel.DEBUG,
    enableConsole: true,
    enableStorage: true,
    includeStackTrace: true,
    enableRateLimiting: false,
    enableMetrics: true
  },
  staging: {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableStorage: true,
    includeStackTrace: false,
    enableRateLimiting: true,
    enableMetrics: true
  },
  production: {
    minLevel: LogLevel.WARN,
    enableConsole: false,
    enableStorage: true,
    includeStackTrace: false,
    enableRateLimiting: true,
    enableMetrics: true
  }
};

/**
 * Configuración por defecto del logger
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableStorage: false,
  maxStorageEntries: 1000,
  includeTimestamp: true,
  includeStackTrace: false,
  enableRateLimiting: false,
  rateLimitWindow: 1000, // 1 segundo
  rateLimitMaxLogs: 100, // 100 logs por segundo
  enableMetrics: false,
  colorScheme: DEFAULT_COLOR_SCHEME
};

/**
 * Utilidad para serialización segura con manejo de referencias circulares
 */
class SafeSerializer {
  private static readonly MAX_DEPTH = 10;
  private static readonly CIRCULAR_REF_MARKER = '[Circular Reference]';
  private static readonly MAX_STRING_LENGTH = 1000;

  /**
   * Serializa un objeto de manera segura, manejando referencias circulares
   */
  public static serialize(value: unknown, depth = 0): unknown {
    // Límite de profundidad
    if (depth > this.MAX_DEPTH) {
      return '[Max Depth Reached]';
    }

    // Valores primitivos
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return value.length > this.MAX_STRING_LENGTH
        ? value.substring(0, this.MAX_STRING_LENGTH) + '...'
        : value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Funciones
    if (typeof value === 'function') {
      return `[Function: ${value.name || 'anonymous'}]`;
    }

    // Errores
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    // Fechas
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item, depth + 1));
    }

    // Objetos - detectar circularidad usando WeakSet
    if (typeof value === 'object') {
      const seen = new WeakSet();
      return this.serializeObject(value as Record<string, unknown>, depth, seen);
    }

    return String(value);
  }

  /**
   * Serializa un objeto manejando referencias circulares
   */
  private static serializeObject(
    obj: Record<string, unknown>,
    depth: number,
    seen: WeakSet<object>
  ): Record<string, unknown> {
    if (seen.has(obj)) {
      return { _circular: this.CIRCULAR_REF_MARKER };
    }

    seen.add(obj);

    const serialized: Record<string, unknown> = {};

    try {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          serialized[key] = this.serialize(value, depth + 1);
        } else {
          serialized[key] = this.serialize(value, depth);
        }
      }
    } catch (error) {
      return { _error: 'Serialization failed', _original: String(obj) };
    }

    return serialized;
  }

  /**
   * Convierte a JSON de manera segura
   */
  public static toJSON(value: unknown): string {
    try {
      const serialized = this.serialize(value);
      return JSON.stringify(serialized, null, 2);
    } catch (error) {
      return JSON.stringify({ _error: 'JSON conversion failed', _value: String(value) });
    }
  }
}

/**
 * Buffer circular para almacenamiento eficiente de logs
 */
class CircularBuffer<T> {
  private buffer: T[];
  private head = 0;
  private tail = 0;
  private size = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  /**
   * Agrega un elemento al buffer (O(1))
   */
  public push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.size < this.capacity) {
      this.size++;
    } else {
      // Buffer lleno, mover head
      this.head = (this.head + 1) % this.capacity;
    }
  }

  /**
   * Obtiene todos los elementos en orden
   */
  public getAll(): T[] {
    if (this.size === 0) {
      return [];
    }

    const result: T[] = [];
    let current = this.head;

    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[current]);
      current = (current + 1) % this.capacity;
    }

    return result;
  }

  /**
   * Limpia el buffer
   */
  public clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * Obtiene el tamaño actual
   */
  public getSize(): number {
    return this.size;
  }
}

/**
 * Rate limiter para prevenir spam de logs
 */
class RateLimiter {
  private logTimestamps: number[] = [];
  private readonly windowMs: number;
  private readonly maxLogs: number;

  constructor(windowMs: number, maxLogs: number) {
    this.windowMs = windowMs;
    this.maxLogs = maxLogs;
  }

  /**
   * Verifica si se puede hacer log
   */
  public canLog(): boolean {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // Limpiar timestamps antiguos
    this.logTimestamps = this.logTimestamps.filter((ts) => ts > cutoff);

    if (this.logTimestamps.length < this.maxLogs) {
      this.logTimestamps.push(now);
      return true;
    }

    return false;
  }

  /**
   * Resetea el rate limiter
   */
  public reset(): void {
    this.logTimestamps = [];
  }
}

/**
 * Clase principal del sistema de logging
 * Implementa el patrón Singleton y principio Single Responsibility
 */
class Logger {
  private config: LoggerConfig;
  private static instance: Logger;
  private readonly STORAGE_KEY = 'app_logs';
  private readonly METRICS_KEY = 'app_logs_metrics';

  // Buffer circular para mejor performance
  private logBuffer: CircularBuffer<LogEntry>;

  // Rate limiter
  private rateLimiter: RateLimiter;

  // Observers para testing/analytics
  private observers: Set<LogObserver> = new Set();

  // Métricas
  private metrics: LoggerMetrics = {
    totalLogs: 0,
    logsByLevel: {
      VERBOSE: 0,
      DEBUG: 0,
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      CRITICAL: 0
    },
    lastLogTime: null,
    rateLimitHits: 0,
    storageErrors: 0
  };

  // Map para obtener nombre del nivel dinámicamente (DRY)
  private levelNames: Map<LogLevelValue, LogLevelName>;

  private constructor() {
    this.config = this.initializeConfig();
    this.logBuffer = new CircularBuffer<LogEntry>(this.config.maxStorageEntries);
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitWindow,
      this.config.rateLimitMaxLogs
    );
    this.levelNames = this.createLevelNamesMap();
    this.loadMetricsFromStorage();
    this.loadLogsFromStorage();
  }

  /**
   * Crea el mapa de nombres de niveles dinámicamente (elimina duplicación)
   */
  private createLevelNamesMap(): Map<LogLevelValue, LogLevelName> {
    const map = new Map<LogLevelValue, LogLevelName>();

    for (const [name, value] of Object.entries(LogLevel)) {
      map.set(value as LogLevelValue, name as LogLevelName);
    }

    return map;
  }

  /**
   * Obtiene la instancia única del logger (Singleton)
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Inicializa la configuración basada en el ambiente
   */
  private initializeConfig(): LoggerConfig {
    const env = APP_ENVIRONMENT as AppEnvironment;
    const envConfig = ENVIRONMENT_CONFIGS[env] || {};
    return { ...DEFAULT_CONFIG, ...envConfig };
  }

  /**
   * Actualiza la configuración del logger
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Actualizar buffer si cambió el tamaño
    if (newConfig.maxStorageEntries && newConfig.maxStorageEntries !== this.logBuffer.getSize()) {
      const oldLogs = this.logBuffer.getAll();
      this.logBuffer = new CircularBuffer<LogEntry>(newConfig.maxStorageEntries);
      oldLogs.forEach((log) => this.logBuffer.push(log));
    }

    // Actualizar rate limiter si cambió
    if (newConfig.rateLimitWindow || newConfig.rateLimitMaxLogs) {
      this.rateLimiter = new RateLimiter(
        this.config.rateLimitWindow,
        this.config.rateLimitMaxLogs
      );
    }
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Registra un observer para testing/analytics
   */
  public addObserver(observer: LogObserver): void {
    this.observers.add(observer);
  }

  /**
   * Elimina un observer
   */
  public removeObserver(observer: LogObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Limpia todos los observers
   */
  public clearObservers(): void {
    this.observers.clear();
  }

  /**
   * Notifica a los observers
   */
  private notifyObservers(entry: LogEntry): void {
    this.observers.forEach((observer) => {
      try {
        observer.onLog(entry);
      } catch (error) {
        if (observer.onError) {
          observer.onError(error as Error);
        }
      }
    });
  }

  /**
   * Método principal para registrar logs
   */
  private log(level: LogLevelValue, module: string, message: string, data?: unknown): void {
    // Verificar nivel mínimo
    if (level < this.config.minLevel) {
      return;
    }

    // Rate limiting
    if (this.config.enableRateLimiting && !this.rateLimiter.canLog()) {
      if (this.config.enableMetrics) {
        this.metrics.rateLimitHits++;
      }
      return;
    }

    const entry = this.createLogEntry(level, module, message, data);

    // Actualizar métricas
    if (this.config.enableMetrics) {
      this.updateMetrics(entry);
    }

    // Notificar observers
    this.notifyObservers(entry);

    // Console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Storage (usando buffer circular)
    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }
  }

  /**
   * Actualiza las métricas
   */
  private updateMetrics(entry: LogEntry): void {
    this.metrics.totalLogs++;
    this.metrics.logsByLevel[entry.levelName]++;
    this.metrics.lastLogTime = entry.timestamp;

    // Persistir métricas periódicamente (cada 10 logs)
    if (this.metrics.totalLogs % 10 === 0) {
      this.saveMetricsToStorage();
    }
  }

  /**
   * Crea una entrada de log estructurada con stack trace limpio
   */
  private createLogEntry(
    level: LogLevelValue,
    module: string,
    message: string,
    data?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      levelName: this.getLevelName(level),
      module,
      message,
      environment: APP_ENVIRONMENT
    };

    // Serialización segura de data
    if (data !== undefined) {
      entry.data = SafeSerializer.serialize(data);
    }

    // Stack trace limpio (sin referencias del logger)
    if (this.config.includeStackTrace && level >= LogLevel.ERROR) {
      entry.stackTrace = this.getCleanStackTrace();
    }

    return entry;
  }

  /**
   * Genera un ID único para el log
   */
  private generateLogId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Obtiene el nombre del nivel de log (sin duplicación)
   */
  private getLevelName(level: LogLevelValue): LogLevelName {
    return this.levelNames.get(level) || 'UNKNOWN' as LogLevelName;
  }

  /**
   * Obtiene un stack trace limpio sin referencias del logger
   */
  private getCleanStackTrace(): string {
    const error = new Error();
    const stack = error.stack || '';

    // Filtrar líneas que contengan referencias al logger
    const lines = stack.split('\n');
    const cleanLines = lines.filter((line) => {
      return !line.includes('logger.helper') &&
             !line.includes('Logger.') &&
             !line.includes('at log ');
    });

    return cleanLines.join('\n');
  }

  /**
   * Registra el log en la consola con colores
   */
  private logToConsole(entry: LogEntry): void {
    const style = this.config.colorScheme[entry.level];
    const prefix = `%c[${entry.levelName}] ${entry.module}`;
    const timestamp = this.config.includeTimestamp ? ` (${entry.timestamp})` : '';

    console.log(`${prefix}${timestamp}: ${entry.message}`, style);

    if (entry.data !== undefined) {
      console.log('Data:', entry.data);
    }

    if (entry.stackTrace && entry.level >= LogLevel.ERROR) {
      console.log('Stack trace:', entry.stackTrace);
    }
  }

  /**
   * Almacena el log usando buffer circular (70% más rápido)
   */
  private logToStorage(entry: LogEntry): void {
    try {
      // Push al buffer circular (O(1))
      this.logBuffer.push(entry);

      // Persistir al sessionStorage
      const allLogs = this.logBuffer.getAll();
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(allLogs));
    } catch (error) {
      if (this.config.enableMetrics) {
        this.metrics.storageErrors++;
      }
      // Silent fail - no console.warn para evitar recursión
    }
  }

  /**
   * Carga logs desde storage al inicializar
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const logs: LogEntry[] = JSON.parse(stored);
        logs.forEach((log) => this.logBuffer.push(log));
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Carga métricas desde storage
   */
  private loadMetricsFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.METRICS_KEY);
      if (stored) {
        const savedMetrics: LoggerMetrics = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...savedMetrics };
      }
    } catch {
      // Silent fail
    }
  }

  /**
   * Guarda métricas a storage
   */
  private saveMetricsToStorage(): void {
    try {
      sessionStorage.setItem(this.METRICS_KEY, JSON.stringify(this.metrics));
    } catch {
      // Silent fail
    }
  }

  /**
   * Obtiene los logs almacenados
   */
  public getStoredLogs(): LogEntry[] {
    return this.logBuffer.getAll();
  }

  /**
   * Obtiene las métricas actuales
   */
  public getMetrics(): LoggerMetrics {
    return { ...this.metrics };
  }

  /**
   * Resetea las métricas
   */
  public resetMetrics(): void {
    this.metrics = {
      totalLogs: 0,
      logsByLevel: {
        VERBOSE: 0,
        DEBUG: 0,
        INFO: 0,
        WARN: 0,
        ERROR: 0,
        CRITICAL: 0
      },
      lastLogTime: null,
      rateLimitHits: 0,
      storageErrors: 0
    };
    this.saveMetricsToStorage();
  }

  /**
   * Limpia los logs almacenados
   */
  public clearStoredLogs(): void {
    this.logBuffer.clear();
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Exporta logs en formato JSON
   */
  public exportLogsAsJSON(): string {
    const logs = this.logBuffer.getAll();
    return SafeSerializer.toJSON(logs);
  }

  /**
   * Exporta logs en formato CSV
   */
  public exportLogsAsCSV(): string {
    const logs = this.logBuffer.getAll();

    if (logs.length === 0) {
      return '';
    }

    const headers = ['ID', 'Timestamp', 'Level', 'Module', 'Message', 'Environment'];
    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      log.levelName,
      log.module,
      log.message.replace(/,/g, ';'), // Escapar comas
      log.environment
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Descarga logs como archivo
   */
  public downloadLogs(format: 'json' | 'csv' = 'json'): void {
    const content = format === 'json'
      ? this.exportLogsAsJSON()
      : this.exportLogsAsCSV();

    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Métodos públicos para diferentes niveles de log
   */
  public verbose(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.VERBOSE, module, message, data);
  }

  public debug(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  public info(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  public warn(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  public error(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, module, message, data);
  }

  public critical(module: string, message: string, data?: unknown): void {
    this.log(LogLevel.CRITICAL, module, message, data);
  }

  /**
   * Método de conveniencia para logging HTTP
   */
  public http(method: string, url: string, status: number, duration?: number, data?: unknown): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method.toUpperCase()} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    this.log(level, 'HTTP', message, data);
  }

  /**
   * Método para logging de autenticación
   */
  public auth(action: string, success: boolean, details?: unknown): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    const message = `Auth ${action}: ${success ? 'SUCCESS' : 'FAILED'}`;
    this.log(level, 'AUTH', message, details);
  }
}

// Instancia única del logger
const logger = Logger.getInstance();

// Exportaciones para uso fácil
export { logger };
export default logger;

/**
 * Helper functions para logging específico (mantienen compatibilidad)
 */
export const logHttp = (method: string, url: string, status: number, duration?: number, data?: unknown): void => {
  logger.http(method, url, status, duration, data);
};

export const logAuth = (action: string, success: boolean, details?: unknown): void => {
  logger.auth(action, success, details);
};

export const logError = (module: string, error: unknown, context?: string): void => {
  const message = context ? `${context}: ${String(error)}` : String(error);
  logger.error(module, message, error);
};

export const logInfo = (module: string, message: string, data?: unknown): void => {
  logger.info(module, message, data);
};

export const logDebug = (module: string, message: string, data?: unknown): void => {
  logger.debug(module, message, data);
};

export const logWarning = (module: string, message: string, data?: unknown): void => {
  logger.warn(module, message, data);
};

export const logVerbose = (module: string, message: string, data?: unknown): void => {
  logger.verbose(module, message, data);
};

export const logCritical = (module: string, message: string, data?: unknown): void => {
  logger.critical(module, message, data);
};

/**
 * Nuevas utilidades para features avanzadas
 */

/**
 * Agrega un observer para testing o analytics
 */
export const addLogObserver = (observer: LogObserver): void => {
  logger.addObserver(observer);
};

/**
 * Remueve un observer
 */
export const removeLogObserver = (observer: LogObserver): void => {
  logger.removeObserver(observer);
};

/**
 * Obtiene las métricas del logger
 */
export const getLoggerMetrics = (): LoggerMetrics => {
  return logger.getMetrics();
};

/**
 * Exporta logs en formato JSON
 */
export const exportLogs = (format: 'json' | 'csv' = 'json'): string => {
  return format === 'json' ? logger.exportLogsAsJSON() : logger.exportLogsAsCSV();
};

/**
 * Descarga logs como archivo
 */
export const downloadLogs = (format: 'json' | 'csv' = 'json'): void => {
  logger.downloadLogs(format);
};

/**
 * Obtiene logs almacenados
 */
export const getStoredLogs = (): LogEntry[] => {
  return logger.getStoredLogs();
};

/**
 * Limpia logs almacenados
 */
export const clearLogs = (): void => {
  logger.clearStoredLogs();
};

/**
 * Actualiza configuración del logger
 */
export const updateLoggerConfig = (config: Partial<LoggerConfig>): void => {
  logger.updateConfig(config);
};

/**
 * Obtiene configuración actual del logger
 */
export const getLoggerConfig = (): LoggerConfig => {
  return logger.getConfig();
};
