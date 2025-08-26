/**
 * Sistema de logging robusto para la aplicación
 * Siguiendo principios SOLID, KISS y DRY
 */

import { APP_ENVIRONMENT } from '../../config/env.config';

/**
 * Niveles de logging disponibles
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

/**
 * Interface para la configuración del logger
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

/**
 * Interface para una entrada de log
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  module: string;
  message: string;
  data?: unknown;
  stackTrace?: string;
  environment: string;
}

/**
 * Configuraciones por ambiente
 */
const ENVIRONMENT_CONFIGS: Record<string, Partial<LoggerConfig>> = {
  development: {
    minLevel: LogLevel.DEBUG,
    enableConsole: true,
    enableStorage: true,
    includeStackTrace: true
  },
  staging: {
    minLevel: LogLevel.INFO,
    enableConsole: true,
    enableStorage: true,
    includeStackTrace: false
  },
  production: {
    minLevel: LogLevel.WARN,
    enableConsole: false,
    enableStorage: true,
    includeStackTrace: false
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
  includeStackTrace: false
};

/**
 * Clase principal del sistema de logging
 * Implementa el patrón Singleton y principio Single Responsibility
 */
class Logger {
  private config: LoggerConfig;
  private static instance: Logger;
  private readonly STORAGE_KEY = 'app_logs';

  private constructor() {
    this.config = this.initializeConfig();
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
    const envConfig = ENVIRONMENT_CONFIGS[APP_ENVIRONMENT] || {};
    return { ...DEFAULT_CONFIG, ...envConfig };
  }

  /**
   * Actualiza la configuración del logger
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Método principal para registrar logs
   */
  private log(level: LogLevel, module: string, message: string, data?: unknown): void {
    if (level < this.config.minLevel) {
      return;
    }

    const entry = this.createLogEntry(level, module, message, data);

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }
  }

  /**
   * Crea una entrada de log estructurada
   */
  private createLogEntry(level: LogLevel, module: string, message: string, data?: unknown): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: this.getLevelName(level),
      module,
      message,
      environment: APP_ENVIRONMENT
    };

    if (data !== undefined) {
      entry.data = data;
    }

    if (this.config.includeStackTrace && level >= LogLevel.ERROR) {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  /**
   * Obtiene el nombre del nivel de log
   */
  private getLevelName(level: LogLevel): string {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    return levels[level] || 'UNKNOWN';
  }

  /**
   * Registra el log en la consola con colores
   */
  private logToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: 'color: #6B7280',
      [LogLevel.INFO]: 'color: #3B82F6',
      [LogLevel.WARN]: 'color: #F59E0B',
      [LogLevel.ERROR]: 'color: #EF4444',
      [LogLevel.CRITICAL]: 'color: #DC2626; font-weight: bold'
    };

    const style = colors[entry.level];
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
   * Almacena el log en sessionStorage
   */
  private logToStorage(entry: LogEntry): void {
    try {
      const existingLogs = this.getStoredLogs();
      existingLogs.push(entry);

      // Mantener solo las últimas N entradas
      if (existingLogs.length > this.config.maxStorageEntries) {
        existingLogs.splice(0, existingLogs.length - this.config.maxStorageEntries);
      }

      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingLogs));
    } catch (error) {
      console.warn('No se pudo almacenar el log:', error);
    }
  }

  /**
   * Obtiene los logs almacenados
   */
  public getStoredLogs(): LogEntry[] {
    try {
      const logs = sessionStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  /**
   * Limpia los logs almacenados
   */
  public clearStoredLogs(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Métodos públicos para diferentes niveles de log
   */
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
 * Helper functions para logging específico
 */
export const logHttp = (method: string, url: string, status: number, duration?: number, data?: unknown) => {
  logger.http(method, url, status, duration, data);
};

export const logAuth = (action: string, success: boolean, details?: unknown) => {
  logger.auth(action, success, details);
};

export const logError = (module: string, error: unknown, context?: string) => {
  const message = context ? `${context}: ${String(error)}` : String(error);
  logger.error(module, message, error);
};

export const logInfo = (module: string, message: string, data?: unknown) => {
  logger.info(module, message, data);
};

export const logDebug = (module: string, message: string, data?: unknown) => {
  logger.debug(module, message, data);
};

export const logWarning = (module: string, message: string, data?: unknown) => {
  logger.warn(module, message, data);
};
