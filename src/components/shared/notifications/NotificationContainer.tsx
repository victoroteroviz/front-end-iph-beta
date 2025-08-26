/**
 * Contenedor principal de notificaciones
 * Renderiza todas las notificaciones activas en una posición fija
 */

import React from 'react';
import { createPortal } from 'react-dom';
import NotificationItem from './components/NotificationItem';
import useNotifications from './hooks/useNotifications';

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxWidth?: string;
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
  maxWidth = '400px'
}) => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) {
    return null;
  }

  const positionClasses = POSITION_STYLES[position];

  const containerContent = (
    <div 
      className={`
        fixed ${positionClasses}
        z-50 pointer-events-none
        flex flex-col
        ${position.includes('bottom') ? 'flex-col-reverse' : ''}
      `}
      style={{ maxWidth }}
    >
      {/* Contenedor de notificaciones */}
      <div className="pointer-events-auto space-y-0">
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
  return createPortal(containerContent, document.body);
};

export default NotificationContainer;