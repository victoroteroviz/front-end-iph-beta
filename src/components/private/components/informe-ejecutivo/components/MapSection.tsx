/**
 * Componente MapSection
 * Muestra un mapa interactivo con las coordenadas del IPH usando react-leaflet
 * Con marcador personalizado de exclamación roja y zoom fijo nivel 18
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMapEvents } from 'react-leaflet';
import { AlertCircle, MapPin, Navigation, Plus, Minus } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// =====================================================
// INTERFACES
// =====================================================

interface Coordinates {
  latitud: string; // Principalmente strings desde el endpoint
  longitud: string;
}

interface MapSectionProps {
  coordenadas?: Coordinates;
  referencia?: string;
  className?: string;
  height?: string;
  zoomLevel?: number;
  markerType?: 'alert' | 'exclamation' | 'warning';
}

// =====================================================
// CONFIGURACIÓN DEL ICONO PERSONALIZADO
// =====================================================

// Crear un icono personalizado usando AlertCircle
const createCustomIcon = (type: 'alert' | 'exclamation' | 'warning' = 'alert') => {
  const iconSize = 32;
  
  // SVG de signo de exclamación rojo
  const exclamationSvg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      <line x1="12" y1="7" x2="12" y2="13" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <circle cx="12" cy="17" r="1.5" fill="white"/>
    </svg>
  `;

  // SVG del AlertCircle original (para compatibilidad)
  const alertCircleSvg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2" fill="#fef2f2"/>
      <line x1="12" y1="8" x2="12" y2="12" stroke="#dc2626" stroke-width="2"/>
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="#dc2626" stroke-width="2"/>
    </svg>
  `;

  // SVG de círculo amarillo con signo de advertencia
  const warningSvg = `
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
      <line x1="12" y1="7" x2="12" y2="13" stroke="white" stroke-width="3" stroke-linecap="round"/>
      <circle cx="12" cy="17" r="1.5" fill="white"/>
    </svg>
  `;

  const selectedSvg = type === 'exclamation' ? exclamationSvg : type === 'warning' ? warningSvg : alertCircleSvg;

  return L.divIcon({
    html: selectedSvg,
    className: 'custom-marker-icon',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize],
    popupAnchor: [0, -iconSize]
  });
};

// =====================================================
// FUNCIÓN HELPER PARA DESCRIBIR EL TIPO DE VISTA
// =====================================================

const getZoomDescription = (zoom: number): string => {
  if (zoom <= 8) return 'Vista continental';
  if (zoom <= 10) return 'Vista de país/región';
  if (zoom <= 12) return 'Vista de estado/provincia';
  if (zoom <= 14) return 'Vista de ciudad';
  if (zoom <= 16) return 'Vista de barrio';
  if (zoom <= 18) return 'Vista de calle';
  return 'Vista de edificio';
};

// =====================================================
// COMPONENTE PARA DETECTAR CAMBIOS DE ZOOM
// =====================================================

interface ZoomDetectorProps {
  onZoomChange: (zoom: number) => void;
}

const ZoomDetector: React.FC<ZoomDetectorProps> = ({ onZoomChange }) => {
  useMapEvents({
    zoomend: (e) => {
      const zoom = e.target.getZoom();
      onZoomChange(zoom);
    }
  });
  return null;
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const MapSection: React.FC<MapSectionProps> = ({
  coordenadas,
  referencia,
  className = '',
  height = '300px',
  zoomLevel = 15,
  markerType = 'alert'
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoomLevel);

  // Convertir y validar coordenadas (principalmente strings)
  const parseCoordinate = (coord: string): number => {
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? NaN : parsed;
  };

  const lat = coordenadas ? parseCoordinate(coordenadas.latitud) : NaN;
  const lng = coordenadas ? parseCoordinate(coordenadas.longitud) : NaN;

  const isValidCoordinates = coordenadas && 
    !isNaN(lat) && 
    !isNaN(lng) &&
    lat >= -90 && 
    lat <= 90 &&
    lng >= -180 && 
    lng <= 180;

  // Configuración del mapa
  const defaultCenter: [number, number] = [19.4326, -99.1332]; // CDMX como fallback
  const mapCenter: [number, number] = isValidCoordinates 
    ? [lat, lng]
    : defaultCenter;
  
  // Usar el zoomLevel de props (por defecto 15 para compatibilidad)

  // Configurar CSS personalizado para el marcador y controles de zoom
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker-icon {
        background: transparent !important;
        border: none !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        border-radius: 50%;
      }
      .custom-marker-icon:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease-in-out;
      }
      
      /* Personalizar controles de zoom - Solo estilos, sin contenido extra */
      .leaflet-control-zoom {
        border: none !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        border-radius: 8px !important;
        overflow: hidden;
      }
      
      .leaflet-control-zoom a {
        background-color: #c2b186 !important;
        border: none !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 18px !important;
        width: 34px !important;
        height: 34px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease-in-out !important;
        text-decoration: none !important;
      }
      
      .leaflet-control-zoom a:hover {
        background-color: #a89770 !important;
        transform: scale(1.05) !important;
      }
      
      .leaflet-control-zoom a:first-child {
        border-top-left-radius: 8px !important;
        border-top-right-radius: 8px !important;
      }
      
      .leaflet-control-zoom a:last-child {
        border-bottom-left-radius: 8px !important;
        border-bottom-right-radius: 8px !important;
      }
      
      /* Asegurar que el span interno no duplique contenido */
      .leaflet-control-zoom a span {
        font-size: 18px !important;
        color: white !important;
        font-weight: bold !important;
      }
      
      /* Quitar cualquier pseudo-elemento que pueda duplicar */
      .leaflet-control-zoom a:before,
      .leaflet-control-zoom a:after {
        content: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Formatear coordenadas para mostrar
  const formatCoordinate = (coord: number, type: 'lat' | 'lng'): string => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}°${direction}`;
  };

  // Si no hay coordenadas válidas
  if (!isValidCoordinates) {
    return (
      <div className={`bg-white rounded-lg border border-gray-300 shadow-sm ${className}`}>
        <div 
          className="flex flex-col items-center justify-center text-[#4d4725] font-poppins p-6"
          style={{ height }}
        >
          <MapPin className="h-12 w-12 text-gray-400 mb-3" />
          <h4 className="text-sm font-semibold mb-2">Ubicación no disponible</h4>
          <p className="text-xs text-gray-500 text-center">
            No se encontraron coordenadas válidas para mostrar el mapa
          </p>
          {coordenadas && (
            <p className="text-xs text-red-500 mt-2">
              Coordenadas inválidas: {JSON.stringify(coordenadas)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-300 shadow-sm ${className}`}>
      
      {/* Header del mapa */}
      <div className="px-4 py-3 border-b border-gray-200 bg-[#fdf7f1]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-[#c2b186]" />
            <h4 className="text-sm font-semibold text-[#4d4725] font-poppins">
              Ubicación del Incidente
            </h4>
          </div>
          <div className="text-xs text-gray-600 font-poppins flex items-center gap-2">
            <span>Zoom: {currentZoom}x</span>
            <span className="text-[#c2b186]">•</span>
            <span>{getZoomDescription(currentZoom)}</span>
          </div>
        </div>
        
        {/* Información de coordenadas */}
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-700 font-poppins">
          <div>
            <span className="text-gray-500">Latitud:</span>{' '}
            <span className="font-mono font-medium">
              {formatCoordinate(lat, 'lat')}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Longitud:</span>{' '}
            <span className="font-mono font-medium">
              {formatCoordinate(lng, 'lng')}
            </span>
          </div>
        </div>

        {referencia && (
          <div className="mt-2 text-xs text-gray-600 font-poppins">
            <span className="text-gray-500">Referencia:</span> {referencia}
          </div>
        )}
      </div>

      {/* Contenedor del mapa */}
      <div className="relative" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          className="rounded-b-lg"
          ref={mapRef}
        >
          {/* Detector de cambios de zoom */}
          <ZoomDetector onZoomChange={setCurrentZoom} />
          
          {/* Capa de tiles de OpenStreetMap */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          
          {/* Marcador personalizado */}
          <Marker 
            position={mapCenter} 
            icon={createCustomIcon(markerType)}
          >
            <Popup className="custom-popup">
              <div className="text-sm font-poppins">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <strong className="text-[#4d4725]">Ubicación del Incidente</strong>
                </div>
                
                <div className="text-xs text-gray-600 space-y-1">
                  <p>
                    <strong>Latitud:</strong> {formatCoordinate(lat, 'lat')}
                  </p>
                  <p>
                    <strong>Longitud:</strong> {formatCoordinate(lng, 'lng')}
                  </p>
                  {referencia && (
                    <p className="mt-2 pt-2 border-t border-gray-200">
                      <strong>Referencia:</strong> {referencia}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

      </div>
    </div>
  );
};

export default MapSection;