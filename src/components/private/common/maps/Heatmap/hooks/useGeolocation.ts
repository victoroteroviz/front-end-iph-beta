/**
 * Hook personalizado para obtener geolocalización del dispositivo
 *
 * @module useGeolocation
 * @description Obtiene la ubicación actual del usuario usando la API de Geolocation
 * @version 2.0.0
 *
 * @security
 * - Consentimiento explícito requerido antes de solicitar ubicación
 * - Cumplimiento GDPR/LFPDP
 * - Consentimiento persiste 30 días (CacheHelper v2.4.0 con TTL automático)
 * - Logs sanitizados sin coordenadas exactas
 *
 * @performance
 * - Caché de ubicación (5 minutos)
 * - Precisión media (enableHighAccuracy: false)
 * - Timeout de 5 segundos
 *
 * @changelog
 * v2.0.0 (2025-01-31) 🔄 MIGRACIÓN A CACHEHELPER
 * - ✅ REFACTOR: Migrado de localStorage directo a CacheHelper v2.4.0
 * - ✅ TTL automático (elimina validación manual de expiración)
 * - ✅ Cleanup automático de datos expirados
 * - ✅ Métricas centralizadas de cache
 * - ✅ Logging unificado con CacheHelper
 * - ✅ Metadata GDPR-compliant en cache
 * - ✅ Código reducido (~30 líneas menos)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';
import CacheHelper from '../../../../../../helper/cache/cache.helper';

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

// =====================================================
// CONFIGURACIÓN DE CACHE (Migrado a CacheHelper v2.4.0)
// =====================================================

/**
 * Configuración centralizada para cache de geolocalización
 *
 * MIGRADO v2.0.0: Ahora usa CacheHelper en lugar de localStorage directo
 *
 * BENEFICIOS:
 * - TTL automático (no requiere validación manual)
 * - Cleanup automático de expirados
 * - Métricas centralizadas
 * - Logging unificado
 */
const GEOLOCATION_CACHE_CONFIG = {
  keys: {
    CONSENT: 'geolocation_consent'
  },
  ttl: {
    CONSENT: 30 * 24 * 60 * 60 * 1000 // 30 días en ms
  }
} as const;

// DEPRECATED: Constantes antiguas mantenidas para referencia
// const CONSENT_STORAGE_KEY = 'geolocation_consent';
// const CONSENT_EXPIRY_DAYS = 30;

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
   * Guarda preferencia con CacheHelper (TTL automático de 30 días)
   *
   * MIGRADO v2.0.0: Usa CacheHelper en lugar de localStorage directo
   */
  const handleConsent = useCallback(async (granted: boolean) => {
    setConsentGiven(granted);

    // Guardar preferencia con CacheHelper (válido 30 días automáticamente)
    try {
      const consentData: ConsentData = {
        granted,
        timestamp: Date.now(),
        expiresIn: GEOLOCATION_CACHE_CONFIG.ttl.CONSENT
      };

      const stored = await CacheHelper.set(
        GEOLOCATION_CACHE_CONFIG.keys.CONSENT,
        consentData,
        {
          expiresIn: GEOLOCATION_CACHE_CONFIG.ttl.CONSENT,
          priority: 'normal',
          namespace: 'user',
          useSessionStorage: false, // localStorage para persistir entre sesiones
          metadata: {
            type: 'geolocation_consent',
            version: 'v2.0.0',
            gdprCompliant: true
          }
        }
      );

      if (!stored) {
        logError(MODULE_NAME, new Error('No se pudo guardar consentimiento'), 'CacheHelper write failed');
      } else {
        logInfo(MODULE_NAME, `Consentimiento de geolocalización ${granted ? 'aceptado' : 'rechazado'}`, {
          granted,
          expiresIn: '30 días',
          storage: 'CacheHelper v2.4.0'
        });
      }
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
   * Carga consentimiento desde CacheHelper (TTL automático)
   *
   * MIGRADO v2.0.0: Usa CacheHelper en lugar de localStorage directo
   * - Ya NO requiere validación manual de expiración (TTL automático)
   * - Ya NO requiere removeItem manual (cleanup automático)
   */
  useEffect(() => {
    // Flag para evitar ejecución múltiple
    let hasRequested = false;

    const loadConsent = async () => {
      try {
        const savedConsent = await CacheHelper.get<ConsentData>(
          GEOLOCATION_CACHE_CONFIG.keys.CONSENT,
          false // useSessionStorage: false para localStorage persistente
        );

        if (savedConsent) {
          // CacheHelper ya validó el TTL automáticamente
          // Si retorna datos, significa que no han expirado
          setConsentGiven(savedConsent.granted);

          const now = Date.now();
          const ageInDays = Math.floor((now - savedConsent.timestamp) / (24 * 60 * 60 * 1000));

          logInfo(MODULE_NAME, 'Consentimiento previo cargado', {
            granted: savedConsent.granted,
            age: `${ageInDays} días`,
            storage: 'CacheHelper v2.4.0'
          });

          // Si hay consentimiento previo, solicitar ubicación UNA SOLA VEZ
          if (savedConsent.granted && !hasRequested) {
            hasRequested = true;
            requestLocation();
          }
        } else {
          // No hay consentimiento guardado o ya expiró (TTL automático)
          logInfo(MODULE_NAME, 'No hay consentimiento previo o expiró (TTL automático)');
        }
      } catch (error) {
        logError(MODULE_NAME, error as Error, 'Error leyendo consentimiento');
      }
    };

    void loadConsent();
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
