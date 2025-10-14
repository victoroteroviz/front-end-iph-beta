/**
 * Hook personalizado para manejar lógica de Mapa de Calor
 *
 * @module useHeatmap
 * @description Gestiona la obtención de coordenadas clustered según zoom y bounds
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCoordenadasMapaCalor } from '../../../../../services/mapa-calor/get-coordenadas-mapa-calor.service';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { showError } from '../../../../../helper/notification/notification.helper';
import type { I_CoordenadaCluster, I_GetCoordenadasQuery } from '../../../../../interfaces/mapa-calor';
import type { Map as LeafletMap } from 'leaflet';
import { useGeolocation } from './useGeolocation';

interface HeatmapStats {
  totalIPH: number;
  highActivity: number; // count > 50
  mediumActivity: number; // count 30-50
  lowActivity: number; // count < 30
}

interface UseHeatmapReturn {
  coordenadas: I_CoordenadaCluster[];
  loading: boolean;
  error: string | null;
  stats: HeatmapStats;
  selectedZone: { lat: number; lng: number; count: number } | null;
  setSelectedZone: (zone: { lat: number; lng: number; count: number } | null) => void;
  fetchCoordenadas: (query: I_GetCoordenadasQuery) => Promise<void>;
  handleMapMove: (map: LeafletMap) => void;
  userLocation: { lat: number; lng: number } | null;
  geolocationLoading: boolean;
}

const MODULE_NAME = 'useHeatmap';

/**
 * Hook para manejar mapa de calor con clustering dinámico
 */
export const useHeatmap = (): UseHeatmapReturn => {
  const [coordenadas, setCoordenadas] = useState<I_CoordenadaCluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<{ lat: number; lng: number; count: number } | null>(null);
  const [stats, setStats] = useState<HeatmapStats>({
    totalIPH: 0,
    highActivity: 0,
    mediumActivity: 0,
    lowActivity: 0
  });

  // Hook de geolocalización
  const { coordinates: geoCoords, loading: geoLoading } = useGeolocation();

  // Ref para evitar múltiples llamadas simultáneas
  const fetchingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef<boolean>(false);

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
  const fetchCoordenadas = useCallback(async (query: I_GetCoordenadasQuery) => {
    // Evitar llamadas múltiples simultáneas
    if (fetchingRef.current) {
      logInfo(MODULE_NAME, 'Fetch en progreso, ignorando nueva solicitud');
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
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

      // Debug: Log para ver estructura de datos del backend
      if (data && data.length > 0) {
        console.log('🗺️ DEBUG Mapa de Calor - Datos recibidos:', {
          total: data.length,
          primerElemento: data[0],
          keysDelPrimerElemento: Object.keys(data[0]),
          tiposDePropiedades: {
            latitud: typeof data[0]?.latitud,
            longitud: typeof data[0]?.longitud,
            count: typeof data[0]?.count
          }
        });
      }

      setCoordenadas(data);
      setStats(calculateStats(data));

      logInfo(MODULE_NAME, 'Coordenadas cargadas exitosamente', {
        total: data.length
      });

    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar coordenadas del mapa';
      logError(MODULE_NAME, err, 'Error en fetchCoordenadas');
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
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [calculateStats]);

  /**
   * Maneja eventos de movimiento del mapa (zoom/pan)
   * Debounced automáticamente por Leaflet's moveend event
   */
  const handleMapMove = useCallback((map: LeafletMap) => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();

    const query: I_GetCoordenadasQuery = {
      zoom,
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    fetchCoordenadas(query);
  }, [fetchCoordenadas]);

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

    fetchCoordenadas(initialQuery);

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLoading, geoCoords]); // Solo depender de geoLoading y geoCoords

  return {
    coordenadas,
    loading,
    error,
    stats,
    selectedZone,
    setSelectedZone,
    fetchCoordenadas,
    handleMapMove,
    userLocation: geoCoords ? { lat: geoCoords.latitude, lng: geoCoords.longitude } : null,
    geolocationLoading: geoLoading
  };
};
