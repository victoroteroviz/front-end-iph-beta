/**
 * Hook personalizado para obtener geolocalización del dispositivo
 *
 * @module useGeolocation
 * @description Obtiene la ubicación actual del usuario usando la API de Geolocation
 */

import { useState, useEffect } from 'react';
import { logInfo, logError } from '@/helper/log/logger.helper';

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

const MODULE_NAME = 'useGeolocation';

// Coordenadas por defecto (CDMX) si no se puede obtener ubicación
const DEFAULT_COORDINATES = {
  latitude: 19.4326,
  longitude: -99.1332
};

/**
 * Hook para obtener la ubicación del dispositivo
 *
 * @returns {GeolocationState} Estado de la geolocalización
 *
 * @example
 * ```typescript
 * const { coordinates, loading, error, permissionDenied } = useGeolocation();
 *
 * if (loading) return <div>Obteniendo ubicación...</div>;
 * if (error) return <div>Error: {error}</div>;
 * if (coordinates) {
 *   console.log(`Lat: ${coordinates.latitude}, Lng: ${coordinates.longitude}`);
 * }
 * ```
 */
export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    permissionDenied: false
  });

  useEffect(() => {
    // Verificar si la API de Geolocation está disponible
    if (!navigator.geolocation) {
      logError(MODULE_NAME, new Error('Geolocation not supported'), 'API no disponible en este navegador');
      setState({
        coordinates: DEFAULT_COORDINATES,
        loading: false,
        error: 'Geolocalización no soportada por el navegador',
        permissionDenied: false
      });
      return;
    }

    logInfo(MODULE_NAME, 'Solicitando ubicación del dispositivo');

    // Obtener ubicación actual
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        logInfo(MODULE_NAME, 'Ubicación obtenida exitosamente', {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: position.coords.accuracy
        });

        setState({
          coordinates: coords,
          loading: false,
          error: null,
          permissionDenied: false
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
            logInfo(MODULE_NAME, 'Usuario denegó permiso de ubicación');
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

        // Usar coordenadas por defecto en caso de error
        setState({
          coordinates: DEFAULT_COORDINATES,
          loading: false,
          error: errorMessage,
          permissionDenied
        });
      },
      // Options
      {
        enableHighAccuracy: false, // false para mayor velocidad
        timeout: 5000, // 5 segundos máximo
        maximumAge: 300000 // Cache de 5 minutos
      }
    );
  }, []);

  return state;
};
