/**
 * Contenedor principal de notificaciones
 * Renderiza todas las notificaciones activas en una posición fija
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import NotificationItem from './components/NotificationItem';
import useNotifications from './hooks/useNotifications';

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxWidth?: string;
  portalTarget?: HTMLElement;
  enableKeyboardShortcuts?: boolean;
}

const POSITION_STYLES = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4', 
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
};

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  maxWidth = '400px',
  portalTarget = document.body,
  enableKeyboardShortcuts = true
}) => {
  const { notifications, removeNotification, clearAllNotifications } = useNotifications();

  // Soporte para atajos de teclado
  useEffect(() => {
    if (!enableKeyboardShortcuts || notifications.length === 0) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: Cerrar la notificación más reciente
      if (e.key === 'Escape' && notifications.length > 0) {
        removeNotification(notifications[0].id);
      }

      // Ctrl+Shift+X: Limpiar todas las notificaciones
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        clearAllNotifications();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notifications, removeNotification, clearAllNotifications, enableKeyboardShortcuts]);

  if (notifications.length === 0) {
    return null;
  }

  const positionClasses = POSITION_STYLES[position];

  const containerContent = (
    <div
      role="region"
      aria-label="Notificaciones del sistema"
      aria-live="polite"
      aria-atomic="false"
      className={`
        fixed ${positionClasses}
        z-50 pointer-events-none
        flex flex-col
        ${position.includes('bottom') ? 'flex-col-reverse' : ''}
      `}
      style={{ maxWidth: maxWidth === '400px' ? 'min(400px, calc(100vw - 2rem))' : maxWidth }}
    >
      {/* Contenedor de notificaciones */}
      <div className="pointer-events-auto space-y-3">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );

  // Renderizar en portal para que aparezca sobre todo el contenido
  return createPortal(containerContent, portalTarget);
};

export default NotificationContainer;