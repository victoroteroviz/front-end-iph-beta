/**
 * RouteTransitionOverlay Component v1.0.0
 *
 * Overlay que se muestra durante la transición entre rutas
 * Proporciona feedback visual inmediato al usuario
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import { Loader2 } from 'lucide-react';
import { memo } from 'react';

type RouteTransitionOverlayProps = {
  /** Si el overlay está visible */
  isVisible: boolean;
  /** Mensaje de carga */
  message?: string;
};

/**
 * Overlay de transición entre rutas
 * Se muestra inmediatamente al hacer clic en el sidebar
 */
export const RouteTransitionOverlay = memo(({
  isVisible,
  message = 'Cargando'
}: RouteTransitionOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-[#f8f0e7]/80 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fadeIn"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-4 bg-white/90 px-8 py-6 rounded-lg shadow-xl">
        {/* Spinner con anillo exterior */}
        <div className="relative">
          {/* Anillo exterior */}
          <div className="absolute inset-0 rounded-full border-4 border-[#4d4725]/20 w-[72px] h-[72px] -top-2 -left-2" />

          {/* Spinner animado */}
          <Loader2
            className="animate-spin text-[#4d4725]"
            size={56}
            strokeWidth={3}
          />
        </div>

        {/* Mensaje */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#4d4725] font-semibold text-lg">
            {message}
          </p>

          {/* Puntos animados */}
          <div className="flex gap-1">
            <span
              className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-2 h-2 bg-[#4d4725] rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

RouteTransitionOverlay.displayName = 'RouteTransitionOverlay';

export default RouteTransitionOverlay;
