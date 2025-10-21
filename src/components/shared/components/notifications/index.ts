/**
 * Barrel export para el sistema de notificaciones
 * Exporta todos los componentes y hooks relacionados
 */

export { default as NotificationContainer } from './NotificationContainer';
export { default as NotificationItem } from './components/NotificationItem';
export { default as useNotifications } from './hooks/useNotifications';

// Re-exportar funciones del helper para facilitar uso
export {
  showSuccess,
  showError,
  showInfo,
  showWarning,
  removeNotification,
  clearAllNotifications,
  getNotifications,
  subscribeToNotifications,
  alert,
  alertSuccess,
  alertError,
  alertWarning,
  type Notification,
  type NotificationType,
  type NotificationOptions
} from '../../../../helper/notification/notification.helper';