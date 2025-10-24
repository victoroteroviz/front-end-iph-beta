/**
 * Componente de Modal de Consentimiento de Geolocalización
 * 
 * @module GeolocationConsent
 * @description Modal GDPR/LFPDP compliant para solicitar consentimiento de geolocalización
 * 
 * @security
 * - Consentimiento explícito requerido antes de acceder a ubicación
 * - Cumplimiento GDPR (Europa) y LFPDP (México)
 * - Transparencia sobre uso de datos
 * - Opción clara de rechazar
 * 
 * @legal
 * - Multas GDPR evitadas: hasta €20M o 4% facturación anual
 * - Cumplimiento Ley Federal de Protección de Datos (México)
 * - Consentimiento persiste 30 días
 */

import React from 'react';

/**
 * Props del componente GeolocationConsent
 */
export interface GeolocationConsentProps {
  /** Callback cuando el usuario acepta */
  onAccept: () => void;
  /** Callback cuando el usuario rechaza */
  onReject: () => void;
  /** Si el modal es visible */
  isVisible: boolean;
}

/**
 * Modal de consentimiento de geolocalización
 * 
 * @param props - Props del componente
 * @returns Modal de consentimiento o null si no es visible
 * 
 * @example
 * ```tsx
 * <GeolocationConsent
 *   isVisible={needsConsent}
 *   onAccept={() => handleConsent(true)}
 *   onReject={() => handleConsent(false)}
 * />
 * ```
 */
export const GeolocationConsent: React.FC<GeolocationConsentProps> = ({
  onAccept,
  onReject,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <svg 
            className="w-8 h-8 text-[#4d4725]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
          <h3 className="text-xl font-bold text-[#4d4725]">
            Permiso de Ubicación
          </h3>
        </div>

        {/* Body */}
        <div className="mb-6 space-y-3">
          <p className="text-sm text-[#6b7280]">
            Esta aplicación solicita acceso a tu ubicación para:
          </p>

          <ul className="text-sm text-[#6b7280] space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-[#4d4725] font-bold" aria-hidden="true">•</span>
              <span>Centrar el mapa en tu área actual</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4d4725] font-bold" aria-hidden="true">•</span>
              <span>Mostrarte IPH cercanos a tu ubicación</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#4d4725] font-bold" aria-hidden="true">•</span>
              <span>Mejorar tu experiencia de navegación</span>
            </li>
          </ul>

          {/* Privacy Notice */}
          <div 
            className="bg-[#fef3c7] border border-[#f59e0b] rounded-lg p-3 mt-4"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <svg 
                className="w-5 h-5 text-[#f59e0b] flex-shrink-0 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div>
                <p className="text-xs text-[#92400e] font-semibold mb-1">
                  Garantía de Privacidad
                </p>
                <ul className="text-xs text-[#92400e] space-y-1">
                  <li>✓ Tu ubicación NO se almacena en el servidor</li>
                  <li>✓ NO se comparte con terceros</li>
                  <li>✓ Solo se usa temporalmente para el mapa</li>
                  <li>✓ Puedes revocar el permiso en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Legal */}
          <p className="text-xs text-[#9ca3af] mt-3">
            Al aceptar, autorizas el uso de tu ubicación de acuerdo con nuestra{' '}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4d4725] underline hover:text-[#5e5531]"
            >
              Política de Privacidad
            </a>{' '}
            y{' '}
            <a
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4d4725] underline hover:text-[#5e5531]"
            >
              Términos de Uso
            </a>
            . Este consentimiento expira en 30 días.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-2 bg-[#e5e7eb] text-[#4b5563] rounded-lg font-medium hover:bg-[#d1d5db] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2"
            aria-label="No permitir acceso a ubicación"
          >
            No Permitir
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-[#4d4725] text-white rounded-lg font-medium hover:bg-[#5e5531] transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2"
            aria-label="Permitir acceso a ubicación"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Permitir Ubicación
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeolocationConsent;
