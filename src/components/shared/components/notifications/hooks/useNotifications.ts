/**
 * Hook personalizado para manejo de notificaciones
 * Conecta con el NotificationHelper y maneja el estado de React
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToNotifications, 
  removeNotification as removeNotificationHelper,
  clearAllNotifications as clearAllNotificationsHelper,
  getNotifications as getNotificationsHelper,
  type Notification
} from '../../../../../helper/notification/notification.helper';

interface UseNotificationsReturn {
  notifications: Notification[];
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => void;
}

const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>(() => 
    getNotificationsHelper()
  );

  useEffect(() => {
    // Suscribirse a cambios en las notificaciones
    const unsubscribe = subscribeToNotifications((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // Cleanup al desmontar
    return unsubscribe;
  }, []);

  const removeNotification = useCallback((id: string) => {
    removeNotificationHelper(id);
  }, []);

  const clearAllNotifications = useCallback(() => {
    clearAllNotificationsHelper();
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(getNotificationsHelper());
  }, []);

  return {
    notifications,
    removeNotification,
    clearAllNotifications,
    refreshNotifications
  };
};

export default useNotifications;