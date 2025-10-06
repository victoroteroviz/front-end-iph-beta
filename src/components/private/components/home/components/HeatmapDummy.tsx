import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Componente de mapa de calor funcional con datos mock
 * Muestra la distribución geográfica de IPH usando Leaflet
 */
interface HeatmapDummyProps {
  className?: string;
}

// Datos mock de actividad IPH en diferentes zonas de una ciudad (ej: Ciudad de México)
const MOCK_IPH_DATA = [
  // Zona Centro Histórico
  { lat: 19.4326, lng: -99.1332, count: 45, area: 'Centro Histórico' },
  { lat: 19.4350, lng: -99.1310, count: 38, area: 'Zócalo' },
  { lat: 19.4300, lng: -99.1350, count: 52, area: 'Alameda Central' },

  // Zona Norte
  { lat: 19.4800, lng: -99.1200, count: 23, area: 'Indios Verdes' },
  { lat: 19.4900, lng: -99.1100, count: 31, area: 'La Villa' },
  { lat: 19.5100, lng: -99.1300, count: 18, area: 'Lindavista' },

  // Zona Sur
  { lat: 19.3500, lng: -99.1800, count: 67, area: 'Coyoacán' },
  { lat: 19.3200, lng: -99.1500, count: 41, area: 'Xochimilco' },
  { lat: 19.3600, lng: -99.1600, count: 29, area: 'Del Valle' },

  // Zona Oeste
  { lat: 19.4200, lng: -99.2000, count: 34, area: 'Santa Fe' },
  { lat: 19.4400, lng: -99.2100, count: 28, area: 'Las Lomas' },
  { lat: 19.4000, lng: -99.2200, count: 15, area: 'Cuajimalpa' },

  // Zona Este
  { lat: 19.4500, lng: -99.0800, count: 71, area: 'Iztapalapa' },
  { lat: 19.4300, lng: -99.0600, count: 58, area: 'Neza' },
  { lat: 19.4100, lng: -99.0900, count: 44, area: 'Iztacalco' },

  // Zona Centro Norte
  { lat: 19.4600, lng: -99.1400, count: 36, area: 'Roma Norte' },
  { lat: 19.4700, lng: -99.1500, count: 49, area: 'Condesa' },
  { lat: 19.4550, lng: -99.1450, count: 42, area: 'Juárez' },

  // Puntos adicionales para mayor densidad
  { lat: 19.4200, lng: -99.1700, count: 26, area: 'Doctores' },
  { lat: 19.4450, lng: -99.1200, count: 33, area: 'Roma Sur' },
  { lat: 19.4320, lng: -99.1180, count: 55, area: 'Obrera' },
  { lat: 19.4180, lng: -99.1520, count: 39, area: 'Narvarte' },
  { lat: 19.4520, lng: -99.1680, count: 47, area: 'Escandón' },
  { lat: 19.4380, lng: -99.1820, count: 22, area: 'San Miguel Chapultepec' },
];

const HeatmapDummy: React.FC<HeatmapDummyProps> = ({ className = '' }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [totalIPH, setTotalIPH] = useState(0);
  const [highActivity, setHighActivity] = useState(0);
  const [mediumActivity, setMediumActivity] = useState(0);
  const [lowActivity, setLowActivity] = useState(0);

  // Calcular estadísticas
  useEffect(() => {
    const total = MOCK_IPH_DATA.reduce((sum, point) => sum + point.count, 0);
    const high = MOCK_IPH_DATA.filter(point => point.count > 50).length;
    const medium = MOCK_IPH_DATA.filter(point => point.count >= 30 && point.count <= 50).length;
    const low = MOCK_IPH_DATA.filter(point => point.count < 30).length;

    setTotalIPH(total);
    setHighActivity(high);
    setMediumActivity(medium);
    setLowActivity(low);
  }, []);

  // Función para determinar el color y tamaño del círculo basado en la cantidad de IPH
  const getCircleProps = (count: number) => {
    if (count > 60) return { color: '#dc2626', radius: 20, opacity: 0.8 }; // Muy alta
    if (count > 45) return { color: '#ea580c', radius: 16, opacity: 0.7 }; // Alta
    if (count > 30) return { color: '#f59e0b', radius: 12, opacity: 0.6 }; // Media-Alta
    if (count > 20) return { color: '#84cc16', radius: 8, opacity: 0.5 }; // Media
    return { color: '#c2b186', radius: 6, opacity: 0.4 }; // Baja
  };

  // Función para determinar la clasificación de actividad
  const getActivityLevel = (count: number) => {
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
        <div className="px-3 py-1 bg-[#dcfce7] text-[#15803d] text-xs font-medium rounded-full">
          Demo Funcional
        </div>
      </div>

      {/* Mapa principal más grande */}
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
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Marcadores de calor */}
            {MOCK_IPH_DATA.map((point, index) => {
              const circleProps = getCircleProps(point.count);
              return (
                <CircleMarker
                  key={index}
                  center={[point.lat, point.lng]}
                  radius={circleProps.radius}
                  pathOptions={{
                    color: circleProps.color,
                    fillColor: circleProps.color,
                    fillOpacity: circleProps.opacity,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setSelectedZone(point.area),
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
                        📍 {point.area}
                      </h4>
                      <p className="text-sm text-[#6b7280] mb-1">
                        <strong>{point.count}</strong> IPH registrados
                      </p>
                      <p className="text-xs text-[#6b7280]">
                        Actividad: <span className="font-medium">{getActivityLevel(point.count)}</span>
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
                  <h5 className="font-semibold text-[#4d4725] text-sm">Zona Seleccionada:</h5>
                  <p className="text-sm text-[#6b7280]">{selectedZone}</p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-[#6b7280] hover:text-[#4d4725] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Panel de estadísticas y controles debajo del mapa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Estadísticas principales */}
        <div className="bg-[#f8f9fa] rounded-lg p-4">
          <h4 className="text-lg font-semibold text-[#4d4725] mb-4">Estadísticas</h4>          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-[#4d4725]">{totalIPH}</div>
              <div className="text-xs text-[#6b7280]">Total IPH</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#dc2626]">{highActivity}</div>
              <div className="text-xs text-[#6b7280]">Zonas Alta</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#f59e0b]">{mediumActivity}</div>
              <div className="text-xs text-[#6b7280]">Zonas Media</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#84cc16]">{lowActivity}</div>
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
            <li>• Haz clic en los círculos para ver detalles</li>
            <li>• Usa los botones + / - para hacer zoom</li>
            <li>• Arrastra para mover el mapa</li>
            <li>• El tamaño indica cantidad de IPH</li>
          </ul>
        </div>
      </div>

      {/* Nota de funcionalidad */}
      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-[#3b82f6] rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#1e40af] mb-1">
              Demo Funcional con Datos Mock
            </h4>
            <p className="text-sm text-[#1e40af]">
              Este mapa utiliza datos simulados para demostrar la funcionalidad.
              <strong> La implementación final se conectará con datos reales del sistema.</strong>
              El zoom con scroll está deshabilitado para no interferir con la navegación de la página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapDummy;