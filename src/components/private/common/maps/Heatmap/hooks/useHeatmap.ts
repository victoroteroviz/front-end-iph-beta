/**
 * Hook personalizado para manejar lógica de Mapa de Calor
 *
 * @module useHeatmap
 * @description Gestiona la obtención de coordenadas clustered según zoom y bounds
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCoordenadasMapaCalor } from '../services/get-coordenadas-mapa-calor.service';
import { logInfo, logError } from '../../../../../../helper/log/logger.helper';
import { showError } from '../../../../../../helper/notification/notification.helper';
import type { I_CoordenadaCluster, I_GetCoordenadasQuery } from '../../../../../../interfaces/mapa-calor';
import type { Map as LeafletMap } from 'leaflet';
import { useGeolocation } from './useGeolocation';
import { getSimpleAddress } from '../services/reverse-geocoding.service';

interface HeatmapStats {
  totalIPH: number;
  highActivity: number; // count > 50
  mediumActivity: number; // count 30-50
  lowActivity: number; // count < 30
}

interface UseHeatmapReturn {
  coordenadas: I_CoordenadaCluster[];
  loading: boolean;
  silentLoading: boolean; // Nueva propiedad para carga silenciosa
  error: string | null;
  stats: HeatmapStats;
  fetchCoordenadas: (query: I_GetCoordenadasQuery, silent?: boolean) => Promise<void>;
  handleMapMove: (map: LeafletMap) => void;
  userLocation: { lat: number; lng: number } | null;
  geolocationLoading: boolean;
  centerAddress: string | null;
  centerAddressLoading: boolean;
}

const MODULE_NAME = 'useHeatmap';

/**
 * Hook para manejar mapa de calor con clustering dinámico
 */
export const useHeatmap = (): UseHeatmapReturn => {
  const [coordenadas, setCoordenadas] = useState<I_CoordenadaCluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Solo para carga inicial
  const [silentLoading, setSilentLoading] = useState<boolean>(false); // Para actualizaciones
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<HeatmapStats>({
    totalIPH: 0,
    highActivity: 0,
    mediumActivity: 0,
    lowActivity: 0
  });
  const [centerAddress, setCenterAddress] = useState<string | null>(null);
  const [centerAddressLoading, setCenterAddressLoading] = useState<boolean>(false);

  // Hook de geolocalización
  const { coordinates: geoCoords, loading: geoLoading } = useGeolocation();

  // Ref para evitar múltiples llamadas simultáneas
  const fetchingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calcula estadísticas de actividad basadas en coordenadas
   */
  const calculateStats = useCallback((data: I_CoordenadaCluster[]): HeatmapStats => {
    const total = data.reduce((sum, point) => sum + point.count, 0);
    const high = data.filter(point => point.count > 50).length;
    const medium = data.filter(point => point.count >= 30 && point.count <= 50).length;
    const low = data.filter(point => point.count < 30).length;

    return {
      totalIPH: total,
      highActivity: high,
      mediumActivity: medium,
      lowActivity: low
    };
  }, []);

  /**
   * Obtiene coordenadas del servicio
   */
  const fetchCoordenadas = useCallback(async (query: I_GetCoordenadasQuery, silent: boolean = false) => {
    // Evitar llamadas múltiples simultáneas
    if (fetchingRef.current) {
      logInfo(MODULE_NAME, 'Fetch en progreso, ignorando nueva solicitud');
      return;
    }

    try {
      fetchingRef.current = true;

      // Usar loading normal solo para carga inicial, silent para actualizaciones
      if (silent) {
        setSilentLoading(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      logInfo(MODULE_NAME, 'Obteniendo coordenadas', {
        zoom: query.zoom,
        hasBounds: !!(query.north && query.south)
      });

      const data = await getCoordenadasMapaCalor(query);

      setCoordenadas(data);
      setStats(calculateStats(data));

      logInfo(MODULE_NAME, 'Coordenadas cargadas exitosamente', {
        total: data.length
      });

    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage = error?.message || 'Error al cargar coordenadas del mapa';
      logError(MODULE_NAME, error, 'Error en fetchCoordenadas');
      setError(errorMessage);
      showError(errorMessage);
      setCoordenadas([]);
      setStats({
        totalIPH: 0,
        highActivity: 0,
        mediumActivity: 0,
        lowActivity: 0
      });
    } finally {
      if (silent) {
        setSilentLoading(false);
      } else {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [calculateStats]);

  /**
   * Obtiene la dirección del centro del mapa
   */
  const fetchCenterAddress = useCallback(async (lat: number, lng: number) => {
    try {
      setCenterAddressLoading(true);
      const address = await getSimpleAddress(lat, lng);
      setCenterAddress(address);

      logInfo(MODULE_NAME, 'Dirección del centro obtenida', { lat, lng, address });
    } catch (error) {
      logError(MODULE_NAME, error as Error, 'Error obteniendo dirección del centro');
      setCenterAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setCenterAddressLoading(false);
    }
  }, []);

  /**
   * Maneja eventos de movimiento del mapa (zoom/pan) con debounce
   * Debounce de 300ms para evitar llamadas excesivas al mover el mapa
   */
  const handleMapMove = useCallback((map: LeafletMap) => {
    // Limpiar timer anterior si existe
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Crear nuevo timer con debounce de 300ms
    debounceTimerRef.current = setTimeout(() => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      const center = map.getCenter();

      const query: I_GetCoordenadasQuery = {
        zoom,
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      logInfo(MODULE_NAME, 'Ejecutando fetchCoordenadas después de debounce', {
        zoom,
        center: { lat: center.lat, lng: center.lng }
      });

      // Obtener coordenadas y dirección del centro en paralelo
      // Usar carga silenciosa para no mostrar overlay
      fetchCoordenadas(query, true);
      fetchCenterAddress(center.lat, center.lng);
    }, 300);
  }, [fetchCoordenadas, fetchCenterAddress]);

  /**
   * Carga inicial con geolocalización del usuario
   * Si no se puede obtener ubicación, usa CDMX por defecto
   */
  useEffect(() => {
    // Esperar a que termine la geolocalización
    if (geoLoading || initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;

    const userLat = geoCoords?.latitude ?? 19.4326; // Default: CDMX
    const userLng = geoCoords?.longitude ?? -99.1332; // Default: CDMX

    // Calcular bounds aproximados alrededor de la ubicación del usuario
    // ~0.2 grados ≈ 22km de radio
    const latOffset = 0.2;
    const lngOffset = 0.2;

    const initialQuery: I_GetCoordenadasQuery = {
      zoom: 11,
      north: userLat + latOffset,
      south: userLat - latOffset,
      east: userLng + lngOffset,
      west: userLng - lngOffset
    };

    logInfo(MODULE_NAME, 'Carga inicial del mapa', {
      userLocation: geoCoords ? 'Obtenida' : 'Por defecto (CDMX)',
      center: { lat: userLat, lng: userLng }
    });

    // Obtener coordenadas y dirección del centro en paralelo
    // Carga inicial con overlay visible
    fetchCoordenadas(initialQuery, false);
    fetchCenterAddress(userLat, userLng);

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLoading, geoCoords, fetchCenterAddress]); // Solo depender de geoLoading, geoCoords y fetchCenterAddress

  return {
    coordenadas,
    loading,
    silentLoading,
    error,
    stats,
    fetchCoordenadas,
    handleMapMove,
    userLocation: geoCoords ? { lat: geoCoords.latitude, lng: geoCoords.longitude } : null,
    geolocationLoading: geoLoading,
    centerAddress,
    centerAddressLoading
  };
};
