/**
 * Componente AdscripcionesSelector
 * Lista con input de búsqueda para seleccionar adscripciones
 * Muestra 3 valores iniciales y permite búsqueda
 * Estilos copiados exactamente de GradosSelector para consistencia visual
 * Característica especial: Muestra la institución arriba del nombre de la adscripción
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Building, Check } from 'lucide-react';

interface IAdscripcion {
  id: number;
  nombre: string;
  institucion: {
    id: number;
    nombre_corto: string;
    nombre_largo: string;
    codigo: string;
  };
}

interface AdscripcionesSelectorProps {
  adscripciones: IAdscripcion[];
  selectedAdscripcionId?: string;
  onSelect: (adscripcionId: string, adscripcionNombre: string) => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  required?: boolean;
}

const AdscripcionesSelector: React.FC<AdscripcionesSelectorProps> = ({
  adscripciones,
  selectedAdscripcionId,
  onSelect,
  error,
  disabled = false,
  loading = false,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(3);

  // Filtrar adscripciones basado en búsqueda (por adscripción e institución)
  const filteredAdscripciones = useMemo(() => {
    if (!searchTerm.trim()) {
      return adscripciones.slice(0, displayCount);
    }
    return adscripciones.filter(adscripcion =>
      adscripcion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adscripcion.institucion.nombre_corto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adscripcion.institucion.nombre_largo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [adscripciones, searchTerm, displayCount]);

  // Obtener la adscripción seleccionada
  const selectedAdscripcion = useMemo(() => {
    return adscripciones.find(adscripcion => adscripcion.id.toString() === selectedAdscripcionId);
  }, [adscripciones, selectedAdscripcionId]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.adscripciones-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (adscripcion: IAdscripcion) => {
    onSelect(adscripcion.id.toString(), adscripcion.nombre);
    setIsOpen(false);
    setSearchTerm('');
    setDisplayCount(3); // Resetear a 3 valores iniciales
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
        setDisplayCount(3);
      }
    }
  };

  const showMoreAdscripciones = () => {
    setDisplayCount(prev => Math.min(prev + 5, adscripciones.length));
  };

  return (
    <div className={`adscripciones-selector relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Adscripción {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selector Principal */}
      <div
        className={`
          relative w-full p-3 border rounded-lg transition-all duration-200
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-[#948b54]'}
          ${isOpen ? 'ring-2 ring-[#948b54] border-[#948b54]' : ''}
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col">
              {selectedAdscripcion ? (
                <>
                  <span className="text-xs text-gray-500">{selectedAdscripcion.institucion.nombre_corto}</span>
                  <span className="text-gray-900 font-medium">{selectedAdscripcion.nombre}</span>
                </>
              ) : (
                <span className="text-gray-500">
                  {loading ? 'Cargando...' : 'Selecciona una adscripción'}
                </span>
              )}
            </div>
          </div>
          {!loading && (
            isOpen
              ? <ChevronUp className="h-4 w-4 text-gray-400" />
              : <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {/* Input de búsqueda */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar adscripciones... (ej: Comisaría, SSP, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de adscripciones */}
          <div className="max-h-48 overflow-y-auto">
            {filteredAdscripciones.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchTerm ? 'No se encontraron adscripciones' : 'No hay adscripciones disponibles'}
              </div>
            ) : (
              <>
                {filteredAdscripciones.map((adscripcion) => (
                  <div
                    key={adscripcion.id}
                    className={`
                      flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150
                      hover:bg-[#f8f0e7]
                      ${selectedAdscripcionId === adscripcion.id.toString() ? 'bg-[#fdf7f1] text-[#4d4725]' : 'text-gray-900'}
                    `}
                    onClick={() => handleSelect(adscripcion)}
                  >
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex flex-col">
                        {/* Institución en pequeño arriba */}
                        <span className="text-xs text-gray-500 leading-tight">
                          {adscripcion.institucion.nombre_corto}
                        </span>
                        {/* Nombre de la adscripción */}
                        <span className="font-medium leading-tight">
                          {adscripcion.nombre}
                        </span>
                      </div>
                    </div>
                    {selectedAdscripcionId === adscripcion.id.toString() && (
                      <Check className="h-4 w-4 text-[#4d4725]" />
                    )}
                  </div>
                ))}

                {/* Botón "Ver más" si hay más adscripciones y no hay búsqueda */}
                {!searchTerm && displayCount < adscripciones.length && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showMoreAdscripciones();
                      }}
                      className="w-full px-3 py-2 text-sm text-[#4d4725] hover:bg-[#f8f0e7] transition-colors duration-150 cursor-pointer"
                    >
                      Ver más adscripciones ({adscripciones.length - displayCount} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span className="h-4 w-4 text-red-500">⚠</span>
          {error}
        </p>
      )}

      {/* Info adicional */}
      {!error && selectedAdscripcion && (
        <p className="mt-1 text-xs text-gray-500">
          ID: {selectedAdscripcion.id} • {selectedAdscripcion.institucion.nombre_corto}, {selectedAdscripcion.nombre}
        </p>
      )}
    </div>
  );
};

export default AdscripcionesSelector;