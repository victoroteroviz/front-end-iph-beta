/**
 * Helper de Notificaciones - Principios SOLID, KISS, DRY
 * 
 * Sistema de notificaciones reutilizable para:
 * - Mensajes de éxito, error, información y advertencia
 * - Configuración de duración y posición
 * - Logging automático de notificaciones
 * - API simple para uso en componentes
 */

import { logInfo, logError } from '../log/logger.helper';

// Tipos para el sistema de notificaciones
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationConfig {
  defaultDuration: number;
  enableAutoClose: boolean;
  enableLogging: boolean;
  maxNotifications: number;
}

export interface NotificationOptions {
  duration?: number;
  autoClose?: boolean;
  title?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration: number;
  timestamp: number;
  autoClose: boolean;
}

// Configuración por defecto
const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  defaultDuration: 5000, // 5 segundos
  enableAutoClose: true,
  enableLogging: true,
  maxNotifications: 5
};

/**
 * Clase principal para manejo de notificaciones
 * Implementa patrón Singleton y Observer pattern básico
 */
class NotificationHelper {
  private static instance: NotificationHelper;
  private config: NotificationConfig;
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor(config?: Partial<NotificationConfig>) {
    this.config = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<NotificationConfig>): NotificationHelper {
    if (!NotificationHelper.instance) {
      NotificationHelper.instance = new NotificationHelper(config);
    }
    return NotificationHelper.instance;
  }

  /**
   * Actualiza la configuración del helper
   */
  public updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Genera ID único para notificación
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notifica a los listeners sobre cambios
   * Incluye manejo de errores para prevenir que un listener defectuoso rompa otros
   */
  private notifyListeners(): void {
    const notificationsList = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    this.listeners.forEach(listener => {
      try {
        listener(notificationsList);
      } catch (error) {
        logError(
          'NotificationHelper',
          'Error en listener de notificación',
          error instanceof Error ? error.message : String(error)
        );
      }
    });
  }

  /**
   * Agrega una nueva notificación
   */
  private addNotification(
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ): string {
    const id = this.generateId();
    const duration = options.duration ?? this.config.defaultDuration;
    const autoClose = options.autoClose ?? this.config.enableAutoClose;

    const notification: Notification = {
      id,
      type,
      message,
      title: options.title,
      duration,
      timestamp: Date.now(),
      autoClose
    };

    // Limitar número máximo de notificaciones
    if (this.notifications.size >= this.config.maxNotifications) {
      const oldestId = Array.from(this.notifications.keys())[0];
      this.notifications.delete(oldestId);
    }

    this.notifications.set(id, notification);

    // Log de notificación si está habilitado
    if (this.config.enableLogging) {
      logInfo('NotificationHelper', `${type.toUpperCase()}: ${message}`, {
        notificationId: id,
        title: options.title
      });
    }

    // Auto-remover si está configurado
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        this.removeNotification(id);
      }, duration);
      this.timers.set(id, timer);
    }

    this.notifyListeners();
    return id;
  }

  /**
   * Remueve una notificación por ID
   * Limpia el timer asociado si existe para prevenir memory leaks
   */
  public removeNotification(id: string): boolean {
    // Limpiar timer si existe
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    const removed = this.notifications.delete(id);
    if (removed) {
      this.notifyListeners();
    }
    return removed;
  }

  /**
   * Limpia todas las notificaciones
   * Limpia todos los timers para prevenir memory leaks
   */
  public clearAllNotifications(): void {
    // Limpiar todos los timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    this.notifications.clear();
    this.notifyListeners();

    if (this.config.enableLogging) {
      logInfo('NotificationHelper', 'Todas las notificaciones han sido limpiadas');
    }
  }

  /**
   * Obtiene todas las notificaciones activas
   */
  public getNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Obtiene una notificación específica
   */
  public getNotification(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Suscribe a cambios en las notificaciones
   * Usa Set para mejor performance y cleanup automático
   */
  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);

    // Retorna función para desuscribirse
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Destruye la instancia y limpia todos los recursos
   * Útil para testing o cleanup completo
   */
  public destroy(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.notifications.clear();
    this.listeners.clear();

    if (this.config.enableLogging) {
      logInfo('NotificationHelper', 'Helper destruido y recursos liberados');
    }
  }

  // Métodos específicos por tipo de notificación

  /**
   * Muestra notificación de éxito
   */
  public success(message: string, title?: string, options: Omit<NotificationOptions, 'title'> = {}): string {
    return this.addNotification('success', message, { ...options, title });
  }

  /**
   * Muestra notificación de error
   */
  public error(message: string, title?: string, options: Omit<NotificationOptions, 'title'> = {}): string {
    // Errores se auto-cierran después de la duración configurada
    const errorOptions = { autoClose: true, ...options, title };
    const id = this.addNotification('error', message, errorOptions);
    
    // Log adicional para errores
    if (this.config.enableLogging) {
      logError('NotificationHelper', message, title || 'Error notification');
    }
    
    return id;
  }

  /**
   * Muestra notificación informativa
   */
  public info(message: string, title?: string, options: Omit<NotificationOptions, 'title'> = {}): string {
    return this.addNotification('info', message, { ...options, title });
  }

  /**
   * Muestra notificación de advertencia
   */
  public warning(message: string, title?: string, options: Omit<NotificationOptions, 'title'> = {}): string {
    return this.addNotification('warning', message, { ...options, title });
  }

  /**
   * Obtiene la configuración actual
   */
  public getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

// Instancia por defecto
const notificationHelper = NotificationHelper.getInstance();

// Funciones helper para uso directo - API simplificada
export const showSuccess = (message: string, title?: string, options?: Omit<NotificationOptions, 'title'>): string => 
  notificationHelper.success(message, title, options);

export const showError = (message: string, title?: string, options?: Omit<NotificationOptions, 'title'>): string => 
  notificationHelper.error(message, title, options);

export const showInfo = (message: string, title?: string, options?: Omit<NotificationOptions, 'title'>): string => 
  notificationHelper.info(message, title, options);

export const showWarning = (message: string, title?: string, options?: Omit<NotificationOptions, 'title'>): string => 
  notificationHelper.warning(message, title, options);

export const removeNotification = (id: string): boolean => 
  notificationHelper.removeNotification(id);

export const clearAllNotifications = (): void => 
  notificationHelper.clearAllNotifications();

export const getNotifications = (): Notification[] => 
  notificationHelper.getNotifications();

export const subscribeToNotifications = (listener: (notifications: Notification[]) => void): (() => void) => 
  notificationHelper.subscribe(listener);

// Funciones de compatibilidad con alert() para migración fácil
export const alert = (message: string): void => {
  showInfo(message, 'Información');
};

export const alertSuccess = (message: string): void => {
  showSuccess(message, 'Éxito');
};

export const alertError = (message: string): void => {
  showError(message, 'Error');
};

export const alertWarning = (message: string): void => {
  showWarning(message, 'Advertencia');
};

/**
 * Muestra un diálogo de confirmación
 * Implementación simple usando confirm() nativo del navegador
 * TODO: Implementar modal personalizado más adelante
 */
export const showConfirmation = async (title: string, message: string): Promise<boolean> => {
  const confirmMessage = `${title}\n\n${message}`;
  const result = window.confirm(confirmMessage);
  
  if (notificationHelper.getConfig().enableLogging) {
    logInfo('NotificationHelper', `Confirmation dialog: ${result ? 'confirmed' : 'cancelled'}`, {
      title,
      message
    });
  }
  
  return result;
};

// Exportaciones
export { NotificationHelper, notificationHelper };
export default notificationHelper;