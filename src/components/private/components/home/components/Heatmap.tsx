/**
 * Componente de Mapa de Calor con datos reales del backend
 *
 * @module Heatmap
 * @description Muestra la distribución geográfica de IPH usando clustering dinámico
 * - Integrado con servicio real getCoordenadasMapaCalor
 * - Clustering automático por nivel de zoom
 * - Actualización dinámica al mover/zoom del mapa
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, Marker } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useHeatmap } from '../hooks/useHeatmap';
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
}> = ({ onMapMove, userLocation }) => {
  const hasSetViewRef = useRef(false);

  const map = useMapEvents({
    moveend: () => onMapMove(map),
    zoomend: () => onMapMove(map)
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

  return null;
};

/**
 * Componente principal de Mapa de Calor
 */
const Heatmap: React.FC<HeatmapProps> = ({ className = '' }) => {
  const {
    coordenadas,
    loading,
    error,
    stats,
    selectedZone,
    setSelectedZone,
    handleMapMove,
    userLocation,
    geolocationLoading
  } = useHeatmap();

  const mapRef = useRef<LeafletMap | null>(null);

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
   */
  const getCircleProps = (count: number) => {
    if (count > 60) return { color: '#dc2626', radius: 20, opacity: 0.8 }; // Muy alta
    if (count > 45) return { color: '#ea580c', radius: 16, opacity: 0.7 }; // Alta
    if (count > 30) return { color: '#f59e0b', radius: 12, opacity: 0.6 }; // Media-Alta
    if (count > 20) return { color: '#84cc16', radius: 8, opacity: 0.5 }; // Media
    return { color: '#c2b186', radius: 6, opacity: 0.4 }; // Baja
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
          Mapa de Calor - Distribución de IPH
        </h3>
        <div className="flex items-center gap-2">
          {geolocationLoading && (
            <div className="px-3 py-1 bg-[#dbeafe] text-[#1e40af] text-xs font-medium rounded-full flex items-center gap-2">
              <svg className="animate-pulse h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Ubicando...
            </div>
          )}
          {userLocation && !geolocationLoading && (
            <div className="px-3 py-1 bg-[#dbeafe] text-[#1e40af] text-xs font-medium rounded-full flex items-center gap-2">
              <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Tu ubicación
            </div>
          )}
          {loading && (
            <div className="px-3 py-1 bg-[#fef9c3] text-[#854d0e] text-xs font-medium rounded-full flex items-center gap-2">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </div>
          )}
          <div className="px-3 py-1 bg-[#dcfce7] text-[#15803d] text-xs font-medium rounded-full">
            API Real
          </div>
        </div>
      </div>

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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Manejador de eventos del mapa */}
              <MapEventHandler onMapMove={handleMapMove} userLocation={userLocation} />

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
              {!loading && coordenadas.map((point: any, index: number) => {
                // Validar y normalizar datos del backend
                const lat = typeof point.latitud === 'number' ? point.latitud : parseFloat(String(point.latitud || 0));
                const lng = typeof point.longitud === 'number' ? point.longitud : parseFloat(String(point.longitud || 0));
                const count = typeof point.count === 'number' ? point.count : parseInt(String(point.count || 0), 10);

                // Validación adicional - Saltar coordenadas inválidas
                if (isNaN(lat) || isNaN(lng) || isNaN(count) || lat === 0 || lng === 0) {
                  console.warn('Coordenada inválida ignorada:', point);
                  return null;
                }

                const circleProps = getCircleProps(count);
                return (
                  <CircleMarker
                    key={`${lat}-${lng}-${index}`}
                    center={[lat, lng]}
                    radius={circleProps.radius}
                    pathOptions={{
                      color: circleProps.color,
                      fillColor: circleProps.color,
                      fillOpacity: circleProps.opacity,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedZone({
                        lat,
                        lng,
                        count
                      }),
                      mouseover: (e) => {
                        e.target.setStyle({ weight: 4, fillOpacity: 0.9 });
                      },
                      mouseout: (e) => {
                        e.target.setStyle({ weight: 2, fillOpacity: circleProps.opacity });
                      }
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <h4 className="font-semibold text-[#4d4725] mb-1">
                          📍 Cluster de IPH
                        </h4>
                        <p className="text-sm text-[#6b7280] mb-1">
                          <strong>{count}</strong> IPH registrados
                        </p>
                        <p className="text-xs text-[#6b7280]">
                          Actividad: <span className="font-medium">{getActivityLevel(count)}</span>
                        </p>
                        <p className="text-xs text-[#9ca3af] mt-1">
                          Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Zona seleccionada */}
            {selectedZone && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-[#e5e7eb] z-[1000]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-[#4d4725] text-sm">Cluster Seleccionado:</h5>
                    <p className="text-sm text-[#6b7280]">
                      {selectedZone.count} IPH registrados
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      {selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="text-[#6b7280] hover:text-[#4d4725] cursor-pointer"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {loading && (
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

        {/* Leyenda */}
        <div className="bg-[#f9fafb] p-4 rounded-lg">
          <h5 className="font-medium text-[#4d4725] mb-3">Leyenda</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
              <span className="text-xs">Muy Alta (&gt;60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ea580c]"></div>
              <span className="text-xs">Alta (45-60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span className="text-xs">Media-Alta (30-45)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#84cc16]"></div>
              <span className="text-xs">Media (20-30)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c2b186]"></div>
              <span className="text-xs">Baja (&lt;20)</span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
          <h5 className="text-sm font-semibold text-[#1e40af] mb-2">Instrucciones</h5>
          <ul className="text-sm text-[#1e40af] space-y-1">
            <li>• El mapa se centra en tu ubicación automáticamente</li>
            <li>• Haz clic en los círculos para ver detalles</li>
            <li>• Usa los botones + / - para hacer zoom</li>
            <li>• Arrastra para mover el mapa</li>
            <li>• El tamaño indica cantidad de IPH</li>
          </ul>
        </div>
      </div>

      {/* Nota de funcionalidad */}
      <div className="bg-[#dcfce7] border border-[#86efac] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-[#15803d] rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#15803d] mb-1">
              Datos Reales del Sistema
            </h4>
            <p className="text-sm text-[#15803d]">
              Este mapa utiliza <strong>geolocalización automática</strong> para centrarse en tu ubicación
              y <strong>clustering dinámico</strong> basado en el nivel de zoom.
              Los datos se actualizan automáticamente al mover o hacer zoom en el mapa.
              El scroll está deshabilitado para no interferir con la navegación de la página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
