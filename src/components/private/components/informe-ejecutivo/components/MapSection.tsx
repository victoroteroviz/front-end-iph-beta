/**
 * Componente MapSection
 * Mapa interactivo con ubicación del incidente y datos del primer respondiente
 * Usa react-leaflet manteniendo configuración original
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Users, Clock } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import type { IMapSectionProps } from '../../../../../interfaces/components/informe-ejecutivo.interface';

// Importar estilos de leaflet
import 'leaflet/dist/leaflet.css';

// Configuración de iconos de leaflet (del código original)
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

const MapSection: React.FC<IMapSectionProps> = ({
  latitud,
  longitud,
  referencia,
  primerRespondiente,
  loading = false,
  className = ''
}) => {
  
  // Configurar iconos de leaflet (del código original)
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetina,
      iconUrl: icon,
      shadowUrl: shadow,
    });
  }, []);

  // Validar coordenadas
  const hasValidCoordinates = !!(
    latitud && 
    longitud && 
    !isNaN(latitud) && 
    !isNaN(longitud) &&
    latitud >= -90 && 
    latitud <= 90 && 
    longitud >= -180 && 
    longitud <= 180
  );

  if (!hasValidCoordinates) {
    return (
      <SectionWrapper
        title="Ubicación"
        className={className}
      >
        <div className="flex items-center justify-center py-12 text-gray-500">
          <MapPin className="h-12 w-12 mr-3" />
          <div className="text-center">
            <p className="font-semibold font-poppins">Ubicación no disponible</p>
            <p className="text-sm font-poppins mt-1">
              No se registraron coordenadas válidas para este informe
            </p>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      title="Ubicación"
      loading={loading}
      className={className}
    >
      <div className="space-y-4">
        
        {/* Mapa */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={[latitud, longitud]}
            zoom={16}
            style={{ height: '300px', width: '100%' }}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[latitud, longitud]}>
              <Popup>
                <div className="font-poppins">
                  <p className="font-semibold">{referencia || 'Ubicación del informe'}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Lat: {latitud.toFixed(6)}, Lng: {longitud.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Información adicional debajo del mapa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Coordenadas */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-3">
              <MapPin className="h-5 w-5 text-[#4d4725] mr-2" />
              <h3 className="font-semibold text-[#4d4725] font-poppins">Coordenadas</h3>
            </div>
            <div className="space-y-1 text-sm font-poppins">
              <p><span className="font-medium">Latitud:</span> {latitud.toFixed(6)}</p>
              <p><span className="font-medium">Longitud:</span> {longitud.toFixed(6)}</p>
              <p className="text-xs text-gray-500 mt-2">
                Sistema de coordenadas: WGS84
              </p>
            </div>
          </div>

          {/* Primer Respondiente */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 text-[#4d4725] mr-2" />
              <h3 className="font-semibold text-[#4d4725] font-poppins">Primer Respondiente</h3>
            </div>
            {primerRespondiente ? (
              <div className="space-y-1 text-sm font-poppins">
                <p>
                  <span className="font-medium">Unidad:</span>{' '}
                  {primerRespondiente.unidad_arrivo || 'No especificado'}
                </p>
                <p>
                  <span className="font-medium">Elementos:</span>{' '}
                  {primerRespondiente.n_elementos || 'No disponible'}
                </p>
                {primerRespondiente.tiempo_llegada && (
                  <p className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="font-medium">Tiempo de llegada:</span>{' '}
                    {primerRespondiente.tiempo_llegada}
                  </p>
                )}
                {primerRespondiente.observaciones && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    {primerRespondiente.observaciones}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 font-poppins">
                No hay información del primer respondiente disponible
              </p>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default MapSection;