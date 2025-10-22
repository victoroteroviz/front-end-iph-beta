/**
 * Componente individual de notificación
 * Muestra una notificación específica con su tipo, mensaje y controles
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { Notification } from '../../../../../helper/notification/notification.helper';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

// Constantes de animación
const ANIMATION_TIMINGS = {
  ENTER_DELAY: 50,
  EXIT_DURATION: 300, // Debe coincidir con duration-300 en CSS
} as const;

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

const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onRemove
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const styles = NOTIFICATION_STYLES[notification.type];
  const Icon = styles.icon;

  // Detectar preferencia de usuario para animaciones reducidas
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Calcular timestamp formateado solo una vez
  const formattedTime = useMemo(
    () => new Date(notification.timestamp).toLocaleTimeString(),
    [notification.timestamp]
  );

  useEffect(() => {
    // Animación de entrada (skip si prefers-reduced-motion)
    const delay = prefersReducedMotion ? 0 : ANIMATION_TIMINGS.ENTER_DELAY;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Focus management para accesibilidad
  useEffect(() => {
    if (isVisible && itemRef.current && notification.type === 'error') {
      // Errores críticos reciben foco automáticamente
      itemRef.current.focus();
    }
  }, [isVisible, notification.type]);

  const handleRemove = () => {
    if (prefersReducedMotion) {
      // Sin animación de salida si prefers-reduced-motion
      onRemove(notification.id);
    } else {
      setIsRemoving(true);
      setTimeout(() => {
        onRemove(notification.id);
      }, ANIMATION_TIMINGS.EXIT_DURATION);
    }
  };

  return (
    <div
      ref={itemRef}
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={-1}
      className={`
        notification-item
        ${styles.bg} ${styles.text}
        border rounded-lg shadow-lg p-4 mb-3 mx-4
        transform transition-all ease-in-out
        ${prefersReducedMotion ? 'duration-0' : 'duration-300'}
        ${isVisible && !isRemoving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
        }
        max-w-sm w-full
        relative
        font-poppins
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          notification.type === 'error' ? 'focus:ring-red-500' :
          notification.type === 'warning' ? 'focus:ring-yellow-500' :
          notification.type === 'success' ? 'focus:ring-green-500' :
          'focus:ring-blue-500'
        }
      `}
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
            {formattedTime}
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

// Memoizar componente para prevenir re-renders innecesarios
const NotificationItem = React.memo<NotificationItemProps>(
  NotificationItemComponent,
  (prevProps, nextProps) => {
    // Solo re-renderizar si la notificación cambió
    return (
      prevProps.notification.id === nextProps.notification.id &&
      prevProps.notification.timestamp === nextProps.notification.timestamp &&
      prevProps.notification.message === nextProps.notification.message
    );
  }
);

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;