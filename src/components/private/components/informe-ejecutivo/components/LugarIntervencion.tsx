/**
 * Componente LugarIntervencion
 * Muestra la información del lugar de intervención del IPH
 * Incluye dirección, ubicación, mapa, croquis y información adicional
 * Mantiene diseño original con colores #c2b186, #fdf7f1
 */

import React, { useState } from 'react';
import { 
  MapPin, 
  Home, 
  Navigation, 
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { ILugarIntervencion } from '../../../../../interfaces/iph/iph.interface';

// Componente de mapa
import MapSection from './MapSection';

// Configuración de la API
import { API_BASE_URL } from '../../../../../config/env.config';

// =====================================================
// INTERFACES
// =====================================================

interface LugarIntervencionProps {
  lugarIntervencion: ILugarIntervencion | ILugarIntervencion[] | null;
  className?: string;
}

// Interface para el modal de imagen del croquis
interface CroquisModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

// =====================================================
// COMPONENTE DE MODAL PARA CROQUIS
// =====================================================

const CroquisModal: React.FC<CroquisModalProps> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null;

  // Manejar teclas del teclado
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#c2b186] to-[#a89770] text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Croquis del Lugar</h3>
              <p className="text-sm text-white/90">Imagen del croquis de intervención</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/20 rounded-xl transition-colors duration-200"
            title="Cerrar (Esc)"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenedor de imagen */}
        <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: 'calc(95vh - 180px)' }}>
          <img
            src={imageUrl}
            alt="Croquis del lugar de intervención"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: 'calc(95vh - 200px)' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8f9fa"/><rect x="50" y="50" width="500" height="300" fill="none" stroke="%23dee2e6" stroke-width="3" stroke-dasharray="10,5"/><circle cx="300" cy="150" r="40" fill="%23adb5bd"/><path d="M200 250 L250 200 L300 250 L350 200 L400 250 Z" fill="%23adb5bd"/><text x="300" y="320" font-family="Arial" font-size="18" fill="%23666" text-anchor="middle">Error al cargar el croquis</text><text x="300" y="345" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle">La imagen no está disponible o no se pudo cargar</text></svg>`;
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#fdf7f1] border-t border-[#c2b186]/20">
          <div className="flex items-center justify-center gap-6 text-sm text-[#4d4725]">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">Esc</kbd>
              <span>Cerrar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const LugarIntervencion: React.FC<LugarIntervencionProps> = ({
  lugarIntervencion,
  className = ''
}) => {
  // Estado para el modal del croquis
  const [isCroquisModalOpen, setIsCroquisModalOpen] = useState(false);

  // Verificar si los datos están disponibles y obtener el primer elemento si es array
  if (!lugarIntervencion || (Array.isArray(lugarIntervencion) && lugarIntervencion.length === 0)) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
        <h2 
          className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
          style={{ backgroundColor: '#c2b186' }}
        >
          Lugar de la Intervención
        </h2>
        
        <div 
          className="border border-gray-300 rounded-md shadow-sm p-4"
          style={{ backgroundColor: '#fdf7f1' }}
        >
          <div className="text-center text-[#4d4725] py-4">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="font-poppins">No se encontraron datos del lugar de intervención</p>
          </div>
        </div>
      </div>
    );
  }

  // Si es array, tomar el primer elemento; si no, usar el objeto directamente
  const lugar = Array.isArray(lugarIntervencion) ? lugarIntervencion[0] : lugarIntervencion;

  // Construir URL del croquis si existe
  const croquisUrl = lugar.croquis 
    ? lugar.croquis.startsWith('/') 
      ? `${API_BASE_URL}${lugar.croquis}`
      : `${API_BASE_URL}/${lugar.croquis}`
    : null;

  // Handler para abrir modal del croquis
  const handleCroquisClick = () => {
    if (croquisUrl) {
      setIsCroquisModalOpen(true);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-6 ${className}`}>
      <h2 
        className="text-white text-sm font-semibold px-4 py-2 rounded-t-md"
        style={{ backgroundColor: '#c2b186' }}
      >
        Lugar de la Intervención
      </h2>
      
      <div 
        className="border border-gray-300 rounded-md shadow-sm p-6"
        style={{ backgroundColor: '#fdf7f1' }}
      >
        
        {/* Sección 1: Dirección */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            Dirección
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[#4d4725] font-poppins">
            
            {/* Calle/Tramo */}
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Calle/Tramo</p>
                <p className="font-semibold">{lugar.calleTramo || 'No disponible'}</p>
              </div>
            </div>

            {/* Número exterior */}
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número exterior</p>
                <p className="font-semibold">{lugar.nExterior || 'No disponible'}</p>
              </div>
            </div>

            {/* Número interior */}
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Número interior</p>
                <p className="font-semibold">{lugar.nInterior || 'No disponible'}</p>
              </div>
            </div>

            {/* Referencia principal */}
            <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
              <Navigation className="h-5 w-5 text-[#c2b186]" />
              <div>
                <p className="text-sm text-gray-600">Referencia</p>
                <p className="font-semibold">{lugar.referencia || 'No disponible'}</p>
              </div>
            </div>

            {/* Referencias adicionales */}
            {(lugar.referencia1 || lugar.referencia2) && (
              <>
                {lugar.referencia1 && (
                  <div className="flex items-center gap-3">
                    <Navigation className="h-5 w-5 text-[#c2b186]" />
                    <div>
                      <p className="text-sm text-gray-600">Referencia 1</p>
                      <p className="font-semibold">{lugar.referencia1}</p>
                    </div>
                  </div>
                )}
                {lugar.referencia2 && (
                  <div className="flex items-center gap-3">
                    <Navigation className="h-5 w-5 text-[#c2b186]" />
                    <div>
                      <p className="text-sm text-gray-600">Referencia 2</p>
                      <p className="font-semibold">{lugar.referencia2}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sección 2: Ubicación */}
        <div className="mb-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Ubicación
          </h3>
          
          {lugar.localizacion && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[#4d4725] font-poppins mb-6">
              
              {/* Colonia */}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Colonia</p>
                  <p className="font-semibold">{lugar.localizacion.colonia || 'No disponible'}</p>
                </div>
              </div>

              {/* Código postal */}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Código postal</p>
                  <p className="font-semibold">{lugar.localizacion.codigoPostal || 'No disponible'}</p>
                </div>
              </div>

              {/* Municipio */}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Municipio</p>
                  <p className="font-semibold">{lugar.localizacion.municipio || 'No disponible'}</p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#c2b186]" />
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="font-semibold">{lugar.localizacion.estado || 'No disponible'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mapa si hay coordenadas */}
          {lugar.coordenadas?.latitud && lugar.coordenadas?.longitud && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación en el Mapa
              </h4>
              <MapSection
                coordenadas={{
                  latitud: lugar.coordenadas.latitud,
                  longitud: lugar.coordenadas.longitud
                }}
                referencia={lugar.referencia}
                height="400px"
                className="mb-4"
                zoomLevel={18}
                markerType="warning"
              />
            </div>
          )}

          {/* Croquis debajo del mapa */}
          {croquisUrl && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Croquis del Lugar
              </h4>
              <div 
                className="relative bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#c2b186] transition-colors cursor-pointer overflow-hidden"
                onClick={handleCroquisClick}
              >
                <img
                  src={croquisUrl}
                  alt="Croquis del lugar de intervención"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="%23f3f4f6"/><rect x="20" y="20" width="360" height="160" fill="none" stroke="%23dee2e6" stroke-width="2" stroke-dasharray="8,4"/><circle cx="200" cy="80" r="20" fill="%23adb5bd"/><path d="M150 120 L175 100 L200 120 L225 100 L250 120 Z" fill="%23adb5bd"/><text x="200" y="150" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle">Error al cargar croquis</text></svg>`;
                  }}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-3">
                    <Eye className="h-6 w-6 text-[#4d4725]" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                Haz clic para ver el croquis en tamaño completo
              </p>
            </div>
          )}
        </div>

        {/* Sección 3: Información adicional */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#4d4725] mb-4 flex items-center gap-3">
            <div className="p-2 bg-[#c2b186] rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Información Adicional
          </h3>
          
          {/* Checkboxes informativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            
            {/* Realizó inspección */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.rInspeccion ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Realizó inspección</p>
                <p className="text-xs text-gray-600">{lugar.rInspeccion ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Encontró objeto */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.eObjeto ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Encontró objeto</p>
                <p className="text-xs text-gray-600">{lugar.eObjeto ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Preservó */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.preservo ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Preservó</p>
                <p className="text-xs text-gray-600">{lugar.preservo ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Priorizó */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.priorizo ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Priorizó</p>
                <p className="text-xs text-gray-600">{lugar.priorizo ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Riesgo natural */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.riesgoNatural ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Riesgo natural</p>
                <p className="text-xs text-gray-600">{lugar.riesgoNatural ? 'Presente' : 'No presente'}</p>
              </div>
            </div>

            {/* Riesgo social */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {lugar.riesgoSocial ? (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="text-sm font-medium text-[#4d4725]">Riesgo social</p>
                <p className="text-xs text-gray-600">{lugar.riesgoSocial ? 'Presente' : 'No presente'}</p>
              </div>
            </div>
          </div>

          {/* Especificación de riesgo si existe */}
          {lugar.especificacionRiesgo && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-[#4d4725] mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Especificación de Riesgo
              </h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {lugar.especificacionRiesgo}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal del croquis */}
      {croquisUrl && (
        <CroquisModal
          isOpen={isCroquisModalOpen}
          imageUrl={croquisUrl}
          onClose={() => setIsCroquisModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LugarIntervencion;