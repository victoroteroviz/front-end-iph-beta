/**
 * Hook personalizado para obtener geolocalización del dispositivo
 *
 * @module useGeolocation
 * @description Obtiene la ubicación actual del usuario usando la API de Geolocation
 * 
 * @security
 * - Consentimiento explícito requerido antes de solicitar ubicación
 * - Cumplimiento GDPR/LFPDP
 * - Consentimiento persiste 30 días en localStorage
 * - Logs sanitizados sin coordenadas exactas
 * 
 * @performance
 * - Caché de ubicación (5 minutos)
 * - Precisión media (enableHighAccuracy: false)
 * - Timeout de 5 segundos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';

const MODULE_NAME = 'useGeolocation';

/**
 * Datos de consentimiento almacenados
 */
interface ConsentData {
  granted: boolean;
  timestamp: number;
  expiresIn: number;
}

interface GeolocationState {
  /** Coordenadas actuales del usuario */
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  /** Estado de carga */
  loading: boolean;
  /** Error si ocurre */
  error: string | null;
  /** Si el usuario negó el permiso */
  permissionDenied: boolean;
}

/**
 * Configuración del hook de geolocalización
 */
export interface UseGeolocationConfig {
  /** Si debe solicitar ubicación automáticamente tras consentimiento (default: false) */
  autoRequest?: boolean;
  /** Callback cuando se obtiene ubicación exitosamente */
  onSuccess?: (coords: { latitude: number; longitude: number }) => void;
  /** Callback cuando hay error */
  onError?: (error: string) => void;
}

/**
 * Valor de retorno extendido del hook
 */
export interface UseGeolocationReturn extends GeolocationState {
  /** Función para solicitar ubicación manualmente */
  requestLocation: () => void;
  /** Estado del consentimiento (true=aceptado, false=rechazado, null=pendiente) */
  consentGiven: boolean | null;
  /** Función para manejar consentimiento */
  handleConsent: (granted: boolean) => void;
  /** Si necesita mostrar modal de consentimiento */
  needsConsent: boolean;
}

// Coordenadas por defecto (CDMX) si no se puede obtener ubicación
const DEFAULT_COORDINATES = {
  latitude: 19.4326,
  longitude: -99.1332
};

const CONSENT_STORAGE_KEY = 'geolocation_consent';
const CONSENT_EXPIRY_DAYS = 30;

/**
 * Hook para obtener la ubicación del dispositivo CON consentimiento explícito
 *
 * @param config - Configuración opcional del hook
 * @returns Estado de geolocalización y funciones de control
 *
 * @example
 * ```typescript
 * const { 
 *   coordinates, 
 *   loading, 
 *   needsConsent, 
 *   handleConsent 
 * } = useGeolocation({ autoRequest: true });
 *
 * if (needsConsent) {
 *   return <GeolocationConsent onAccept={() => handleConsent(true)} onReject={() => handleConsent(false)} />;
 * }
 *
 * if (loading) return <div>Obteniendo ubicación...</div>;
 * if (coordinates) {
 *   console.log(`Lat: ${coordinates.latitude}, Lng: ${coordinates.longitude}`);
 * }
 * ```
 */
export const useGeolocation = (config?: UseGeolocationConfig): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false, // NO loading automático - espera consentimiento
    error: null,
    permissionDenied: false
  });

  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  // Usar ref para estabilizar config y evitar recreación de callbacks
  const configRef = useRef(config);
  
  // Actualizar ref cuando config cambie (sin causar re-render)
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  /**
   * Solicita ubicación del usuario (solo se llama tras consentimiento)
   */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      logError(MODULE_NAME, new Error('Geolocation not supported'), 'API no disponible en este navegador');
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocalización no soportada por el navegador',
        permissionDenied: false
      });
      configRef.current?.onError?.('Geolocalización no soportada');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    logInfo(MODULE_NAME, 'Usuario autorizó geolocalización, solicitando ubicación');

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setState({
          coordinates: coords,
          loading: false,
          error: null,
          permissionDenied: false
        });

        configRef.current?.onSuccess?.(coords);

        // Sanitizar coordenadas antes de loggear (privacidad)
        const sanitizedLocation = sanitizeCoordinatesForLog(coords.latitude, coords.longitude);
        logInfo(MODULE_NAME, 'Ubicación obtenida con consentimiento', {
          ...sanitizedLocation,
          accuracy: position.coords.accuracy
          // NO loggear coordenadas exactas
        });
      },
      // Error callback
      (error) => {
        let errorMessage = 'Error desconocido al obtener ubicación';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado por el usuario';
            permissionDenied = true;
            logInfo(MODULE_NAME, 'Usuario denegó permiso de ubicación en navegador');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible';
            logError(MODULE_NAME, error, 'Ubicación no disponible');
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener ubicación';
            logError(MODULE_NAME, error, 'Timeout en geolocalización');
            break;
          default:
            logError(MODULE_NAME, error, 'Error en geolocalización');
        }

        setState({
          coordinates: DEFAULT_COORDINATES,
          loading: false,
          error: errorMessage,
          permissionDenied
        });

        configRef.current?.onError?.(errorMessage);
      },
      // Options
      {
        enableHighAccuracy: false, // false para mayor velocidad
        timeout: 5000, // 5 segundos máximo
        maximumAge: 300000 // Cache de 5 minutos
      }
    );
  }, []); // Sin dependencias - usa configRef en lugar de config

  /**
   * Maneja consentimiento del usuario
   * Guarda preferencia en localStorage con expiración de 30 días
   */
  const handleConsent = useCallback((granted: boolean) => {
    setConsentGiven(granted);

    // Guardar preferencia en localStorage (válido 30 días)
    try {
      const consentData: ConsentData = {
        granted,
        timestamp: Date.now(),
        expiresIn: CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 30 días en ms
      };

      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData));
      
      logInfo(MODULE_NAME, `Consentimiento de geolocalización ${granted ? 'aceptado' : 'rechazado'}`, {
        granted,
        expiresIn: `${CONSENT_EXPIRY_DAYS} días`
      });
    } catch (error) {
      logError(MODULE_NAME, error as Error, 'Error guardando consentimiento');
    }

    if (granted) {
      requestLocation();
    } else {
      // Usuario rechazó, usar coordenadas por defecto
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: null,
        permissionDenied: true
      });
    }
  }, [requestLocation]);

  /**
   * Verifica consentimiento previo al montar
   * Carga consentimiento desde localStorage si existe y es válido
   */
  useEffect(() => {
    // Flag para evitar ejecución múltiple
    let hasRequested = false;

    try {
      const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (savedConsent) {
        const data: ConsentData = JSON.parse(savedConsent);

        // Verificar si el consentimiento sigue válido
        const now = Date.now();
        if (now - data.timestamp < data.expiresIn) {
          setConsentGiven(data.granted);

          logInfo(MODULE_NAME, 'Consentimiento previo cargado', {
            granted: data.granted,
            age: Math.floor((now - data.timestamp) / (24 * 60 * 60 * 1000)) + ' días'
          });

          // Si hay consentimiento previo, solicitar ubicación UNA SOLA VEZ
          if (data.granted && !hasRequested) {
            hasRequested = true;
            requestLocation();
          }
          return;
        } else {
          // Expiró, eliminar
          localStorage.removeItem(CONSENT_STORAGE_KEY);
          logInfo(MODULE_NAME, 'Consentimiento expirado, solicitando nuevo');
        }
      }
    } catch (error) {
      logError(MODULE_NAME, error as Error, 'Error leyendo consentimiento');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar, NO depender de requestLocation

  return {
    ...state,
    requestLocation,
    consentGiven,
    handleConsent,
    needsConsent: consentGiven === null
  };
};
