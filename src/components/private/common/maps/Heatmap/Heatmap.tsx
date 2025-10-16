/**
 * Componente de Mapa de Calor con datos reales del backend
 *
 * @module Heatmap
 * @description Muestra la distribución geográfica de IPH usando clustering dinámico
 * - Integra con servicio real getCoordenadasMapaCalor
 * - Clustering automático por nivel de zoom
 * - Actualización dinámica al mover/zoom del mapa
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, Marker } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useHeatmap } from './hooks/useHeatmap';
import type { I_CoordenadaCluster } from '../../../../../interfaces/mapa-calor';


interface HeatmapProps {
  className?: string;
}

/**
 * Componente interno para manejar eventos del mapa y centrar en ubicación del usuario
 */
const MapEventHandler: React.FC<{
  onMapMove: (map: LeafletMap) => void;
  userLocation: { lat: number; lng: number } | null;
  onZoomChange: (zoom: number) => void;
}> = ({ onMapMove, userLocation, onZoomChange }) => {
  const hasSetViewRef = useRef(false);
  const [ctrlPressed, setCtrlPressed] = useState(false);

  const map = useMapEvents({
    moveend: () => {
      onMapMove(map);
      onZoomChange(map.getZoom());
    },
    zoomend: () => {
      onMapMove(map);
      onZoomChange(map.getZoom());
    }
  });

  // Centrar mapa en ubicación del usuario una sola vez
  useEffect(() => {
    if (userLocation && map && !hasSetViewRef.current) {
      hasSetViewRef.current = true;
      map.setView([userLocation.lat, userLocation.lng], 11, {
        animate: true,
        duration: 1
      });
    }
  }, [userLocation, map]);

  // Controlar zoom con scroll solo cuando se presiona tecla Z
  useEffect(() => {
    if (!map) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detecta 'z' o 'Z' (mayúscula o minúscula)
      if ((e.key === 'z' || e.key === 'Z') && !ctrlPressed) {
        setCtrlPressed(true);
        map.scrollWheelZoom.enable();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Detecta 'z' o 'Z' (mayúscula o minúscula)
      if (e.key === 'z' || e.key === 'Z') {
        setCtrlPressed(false);
        map.scrollWheelZoom.disable();
      }
    };

    // Agregar event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [map, ctrlPressed]);

  return null;
};

/**
 * Componente principal de Mapa de Calor
 */
const Heatmap: React.FC<HeatmapProps> = ({ className = '' }) => {
  const {
    coordenadas,
    loading,
    silentLoading,
    error,
    stats,
    handleMapMove,
    userLocation,
    geolocationLoading,
    centerAddress,
    centerAddressLoading
  } = useHeatmap();

  const mapRef = useRef<LeafletMap | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(11);

  // Icono personalizado para marcador de usuario
  const userIcon = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.2"/>
        <circle cx="12" cy="12" r="3" fill="#3b82f6"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  /**
   * Determina el color y tamaño del círculo basado en la cantidad de IPH
   * y el nivel de zoom (para diferenciar clusters de puntos individuales)
   */
  const getCircleProps = (count: number, currentZoom: number) => {
    // Calcular radio base según el zoom y el count
    let baseRadius;
    let isCluster = false;

    // Determinar si es un cluster basado en el zoom
    if (currentZoom < 12) {
      // Zoom alejado - Clusters agresivos (1 decimal)
      isCluster = true;
      baseRadius = Math.min(Math.sqrt(count) * 4, 35); // Radio dinámico según count, máx 35px
    } else if (currentZoom < 15) {
      // Zoom medio - Semi-clusters (2 decimales)
      isCluster = count > 10; // Si hay más de 10, probablemente es cluster
      baseRadius = Math.min(Math.sqrt(count) * 3, 25); // Radio dinámico, máx 25px
    } else {
      // Zoom cercano - Puntos individuales
      isCluster = count > 5; // Solo clusters muy pequeños
      baseRadius = Math.min(Math.sqrt(count) * 2, 15); // Radio dinámico, máx 15px
    }

    // Asegurar un radio mínimo
    const radius = Math.max(baseRadius, isCluster ? 8 : 5);

    // Determinar colores según intensidad
    if (count > 60) return {
      color: '#b91c1c',
      fillColor: '#ef4444',
      radius,
      opacity: isCluster ? 0.9 : 0.85,
      fillOpacity: isCluster ? 0.7 : 0.6,
      weight: isCluster ? 4 : 3,
      isCluster
    }; // Muy alta - Rojo intenso

    if (count > 45) return {
      color: '#c2410c',
      fillColor: '#f97316',
      radius,
      opacity: isCluster ? 0.85 : 0.8,
      fillOpacity: isCluster ? 0.65 : 0.55,
      weight: isCluster ? 3.5 : 2.5,
      isCluster
    }; // Alta - Naranja

    if (count > 30) return {
      color: '#ca8a04',
      fillColor: '#fbbf24',
      radius,
      opacity: isCluster ? 0.8 : 0.75,
      fillOpacity: isCluster ? 0.6 : 0.5,
      weight: isCluster ? 3 : 2,
      isCluster
    }; // Media-Alta - Amarillo

    if (count > 20) return {
      color: '#16a34a',
      fillColor: '#4ade80',
      radius,
      opacity: isCluster ? 0.75 : 0.7,
      fillOpacity: isCluster ? 0.55 : 0.45,
      weight: isCluster ? 2.5 : 2,
      isCluster
    }; // Media - Verde

    return {
      color: '#0284c7',
      fillColor: '#38bdf8',
      radius,
      opacity: isCluster ? 0.7 : 0.65,
      fillOpacity: isCluster ? 0.5 : 0.4,
      weight: isCluster ? 2 : 1.5,
      isCluster
    }; // Baja - Azul
  };

  /**
   * Determina la clasificación de actividad
   */
  const getActivityLevel = (count: number): string => {
    if (count > 60) return 'Muy Alta';
    if (count > 45) return 'Alta';
    if (count > 30) return 'Media-Alta';
    if (count > 20) return 'Media';
    return 'Baja';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#4d4725]">
          Mapa de Calor - Lugares con Mayores intervenciones de IPH
        </h3>
        <div className="flex items-center gap-2">
          {geolocationLoading && (
            <div className="px-3 py-1 bg-[#dbeafe] text-[#1e40af] text-xs font-medium rounded-full flex items-center gap-2">
              <svg className="animate-pulse h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Obteniendo ubicación...
            </div>
          )}
          {silentLoading && (
            <div className="px-3 py-1 bg-[#f0f9ff] border border-[#0284c7] text-[#0284c7] text-xs font-medium rounded-full flex items-center gap-2">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            </div>
          )}
        </div>
      </div>

      {/* Dirección del centro del mapa */}
      {!geolocationLoading && (centerAddress || centerAddressLoading) && (
        <div className="mb-4 bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] border border-[#cbd5e1] rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-[#4d4725]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#4d4725] mb-1">Centro del mapa:</p>
              {centerAddressLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-[#6b7280]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-[#6b7280]">Obteniendo dirección...</span>
                </div>
              ) : (
                <p className="text-sm text-[#6b7280] truncate">{centerAddress}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 bg-[#fee2e2] border border-[#ef4444] text-[#991b1b] px-4 py-3 rounded-lg flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-semibold text-sm">Error al cargar el mapa</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Mapa principal */}
      <div className="mb-6">
        <div className="relative">
          <div className="h-96 lg:h-[500px] rounded-lg overflow-hidden border border-[#e5e7eb] relative">
            <MapContainer
              center={[19.4326, -99.1332]} // Centro de Ciudad de México
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={false}
              doubleClickZoom={true}
              touchZoom={true}
              dragging={true}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {/* Manejador de eventos del mapa */}
              <MapEventHandler
                onMapMove={handleMapMove}
                userLocation={userLocation}
                onZoomChange={setCurrentZoom}
              />

              {/* Marcador de ubicación del usuario */}
              {userLocation && !geolocationLoading && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <h4 className="font-semibold text-[#1e40af] mb-1">
                        📍 Tu Ubicación
                      </h4>
                      <p className="text-xs text-[#6b7280]">
                        Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Marcadores de calor */}
              {coordenadas.map((point: I_CoordenadaCluster, index: number) => {
                // Validar y normalizar datos del backend
                const lat = typeof point.latitud === 'number' ? point.latitud : parseFloat(String(point.latitud || 0));
                const lng = typeof point.longitud === 'number' ? point.longitud : parseFloat(String(point.longitud || 0));
                const count = typeof point.count === 'number' ? point.count : parseInt(String(point.count || 0), 10);

                // Validación adicional - Saltar coordenadas inválidas
                if (isNaN(lat) || isNaN(lng) || isNaN(count) || lat === 0 || lng === 0) {
                  return null;
                }

                const circleProps = getCircleProps(count, currentZoom);
                return (
                  <CircleMarker
                    key={`${lat}-${lng}-${index}`}
                    center={[lat, lng]}
                    radius={circleProps.radius}
                    pathOptions={{
                      color: circleProps.color,
                      fillColor: circleProps.fillColor,
                      fillOpacity: circleProps.fillOpacity,
                      weight: circleProps.weight,
                      opacity: circleProps.opacity
                    }}
                    eventHandlers={{
                      mouseover: (e) => {
                        e.target.setStyle({
                          weight: circleProps.weight + 2,
                          fillOpacity: 0.85,
                          opacity: 1
                        });
                      },
                      mouseout: (e) => {
                        e.target.setStyle({
                          weight: circleProps.weight,
                          fillOpacity: circleProps.fillOpacity,
                          opacity: circleProps.opacity
                        });
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <h4 className="font-semibold text-[#4d4725] mb-1">
                          {circleProps.isCluster ? '🗺️ Cluster de IPH' : '📍 Lugar de IPH'}
                        </h4>
                        <p className="text-sm text-[#6b7280] mb-1">
                          <strong>{count}</strong> {circleProps.isCluster ? 'IPH agrupados' : 'IPH registrados'}
                        </p>
                        {circleProps.isCluster && (
                          <p className="text-xs text-[#f59e0b] mb-1">
                            ⚡ Zoom para ver detalles individuales
                          </p>
                        )}
                        <p className="text-xs text-[#6b7280]">
                          Actividad: <span className="font-medium">{getActivityLevel(count)}</span>
                        </p>
                        <p className="text-xs text-[#9ca3af] mt-1">
                          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                        </p>
                        {circleProps.isCluster && (
                          <p className="text-xs text-[#9ca3af] mt-1">
                            Zoom: {currentZoom} (Cluster nivel {currentZoom < 12 ? 'Estado' : currentZoom < 15 ? 'Ciudad' : 'Calle'})
                          </p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Loading overlay - Solo para carga inicial */}
            {loading && coordenadas.length === 0 && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[999]">
                <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-[#4d4725]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[#4d4725] font-medium">Cargando coordenadas...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel de información de clustering
      <div className="mb-4 bg-gradient-to-r from-[#f0f9ff] to-[#e0f2fe] border border-[#0284c7] rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-5 h-5 text-[#0284c7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <h4 className="text-sm font-semibold text-[#0284c7]">
            Clustering Dinámico (Zoom: {currentZoom})
          </h4>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#0284c7]">
            {currentZoom < 12 && (
              <span>🏛️ <strong>Nivel Estado:</strong> Clusters agresivos (~10km precisión)</span>
            )}
            {currentZoom >= 12 && currentZoom < 15 && (
              <span>🏙️ <strong>Nivel Ciudad:</strong> Semi-agrupación (~1km precisión)</span>
            )}
            {currentZoom >= 15 && (
              <span>🛣️ <strong>Nivel Calle:</strong> Ubicaciones exactas (alta precisión)</span>
            )}
          </p>
          <span className="text-xs text-[#64748b]">{coordenadas.length} puntos</span>
        </div>
      </div> */}

      {/* Panel de estadísticas y controles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Estadísticas principales */}
        <div className="bg-[#f8f9fa] rounded-lg p-4">
          <h4 className="text-lg font-semibold text-[#4d4725] mb-4">Estadísticas</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-[#4d4725]">{stats.totalIPH}</div>
              <div className="text-xs text-[#6b7280]">Total IPH</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#dc2626]">{stats.highActivity}</div>
              <div className="text-xs text-[#6b7280]">Zonas Alta</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#f59e0b]">{stats.mediumActivity}</div>
              <div className="text-xs text-[#6b7280]">Zonas Media</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#84cc16]">{stats.lowActivity}</div>
              <div className="text-xs text-[#6b7280]">Zonas Baja</div>
            </div>
          </div>
        </div>

        {/* Leyenda con gradiente de calor */}
        <div className="bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] p-4 rounded-lg border border-[#e5e7eb]">
          <h5 className="font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Intensidad de Actividad
          </h5>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#ef4444] shadow-sm"></div>
              <span className="text-xs font-medium text-[#374151]">Muy Alta (&gt;60 IPH)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#c2410c] to-[#f97316] shadow-sm"></div>
              <span className="text-xs font-medium text-[#374151]">Alta (45-60 IPH)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#ca8a04] to-[#fbbf24] shadow-sm"></div>
              <span className="text-xs font-medium text-[#374151]">Media-Alta (30-45 IPH)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#16a34a] to-[#4ade80] shadow-sm"></div>
              <span className="text-xs font-medium text-[#374151]">Media (20-30 IPH)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#0284c7] to-[#38bdf8] shadow-sm"></div>
              <span className="text-xs font-medium text-[#374151]">Baja (&lt;20 IPH)</span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe] rounded-lg p-4">
          <h5 className="text-sm font-semibold text-[#1e40af] mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cómo usar el mapa
          </h5>
          <ul className="text-sm text-[#1e40af] space-y-1.5">
            <li className="flex items-start gap-2">
              <span>El mapa se centra en tu ubicación automáticamente</span>
            </li>
            <li className="flex items-start gap-2">
              <span>Haz clic en los círculos para ver detalles del cluster</span>
            </li>
            <li className="flex items-start gap-2">
              <span>Usa los botones + / -</span>
            </li>

            <li className="flex items-start gap-2">
              <span>Usa la tecla <strong>Z</strong> + rueda del ratón para hacer zoom</span>
            </li>

            <li className="flex items-start gap-2">
              <span>Arrastra el mapa para explorar diferentes áreas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
