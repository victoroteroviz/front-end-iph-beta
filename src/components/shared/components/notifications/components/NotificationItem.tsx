/**
 * Componente individual de notificación
 * Muestra una notificación específica con su tipo, mensaje y controles
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { Notification } from '../../../../../helper/notification/notification.helper';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NOTIFICATION_STYLES = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-500'
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertCircle,
    iconColor: 'text-yellow-500'
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500'
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onRemove 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const styles = NOTIFICATION_STYLES[notification.type];
  const Icon = styles.icon;

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Tiempo para animación de salida
  };

  return (
    <div 
      className={`
        notification-item
        ${styles.bg} ${styles.text}
        border rounded-lg shadow-lg p-4 mb-3 mx-4
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        max-w-sm w-full
        relative
        font-poppins
      `}
      style={{
        transitionDelay: isVisible ? '0ms' : '0ms'
      }}
    >
      {/* Contenido principal */}
      <div className="flex items-start space-x-3">
        {/* Icono */}
        <Icon className={`${styles.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />
        
        {/* Contenido del mensaje */}
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="font-semibold text-sm mb-1 truncate">
              {notification.title}
            </h4>
          )}
          <p className="text-sm leading-relaxed break-words">
            {notification.message}
          </p>
          
          {/* Timestamp */}
          <p className="text-xs opacity-75 mt-2">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleRemove}
          className={`
            ${styles.iconColor} opacity-60 hover:opacity-100
            transition-opacity duration-200
            p-1 rounded-full hover:bg-black hover:bg-opacity-5
            flex-shrink-0
          `}
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de progreso para auto-close */}
      {notification.autoClose && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationItem;