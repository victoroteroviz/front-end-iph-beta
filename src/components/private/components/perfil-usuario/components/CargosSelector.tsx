/**
 * Componente CargosSelector
 * Lista con input de búsqueda para seleccionar cargos
 * Muestra 3 valores iniciales y permite búsqueda
 * Estilos copiados exactamente de GradosSelector para consistencia visual
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, User, Check } from 'lucide-react';
interface ICargo {
  id: number;
  nombre: string;
}

interface CargosSelectorProps {
  cargos: ICargo[];
  selectedCargoId?: string;
  onSelect: (cargoId: string, cargoNombre: string) => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  required?: boolean;
}

const CargosSelector: React.FC<CargosSelectorProps> = ({
  cargos,
  selectedCargoId,
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

  // Filtrar cargos basado en búsqueda
  const filteredCargos = useMemo(() => {
    if (!searchTerm.trim()) {
      return cargos.slice(0, displayCount);
    }
    return cargos.filter(cargo =>
      cargo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cargos, searchTerm, displayCount]);

  // Obtener el cargo seleccionado
  const selectedCargo = useMemo(() => {
    return cargos.find(cargo => cargo.id.toString() === selectedCargoId);
  }, [cargos, selectedCargoId]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cargos-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (cargo: ICargo) => {
    onSelect(cargo.id.toString(), cargo.nombre);
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

  const showMoreCargos = () => {
    setDisplayCount(prev => Math.min(prev + 5, cargos.length));
  };

  return (
    <div className={`cargos-selector relative ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Cargo {required && <span className="text-red-500">*</span>}
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
            <User className="h-4 w-4 text-gray-400" />
            <span className={`${selectedCargo ? 'text-gray-900' : 'text-gray-500'}`}>
              {loading
                ? 'Cargando...'
                : selectedCargo
                  ? selectedCargo.nombre
                  : 'Selecciona un cargo'
              }
            </span>
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
                placeholder="Buscar cargos... (ej: Comandante, Oficial, etc.)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#948b54] focus:border-[#948b54] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de cargos */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCargos.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                {searchTerm ? 'No se encontraron cargos' : 'No hay cargos disponibles'}
              </div>
            ) : (
              <>
                {filteredCargos.map((cargo) => (
                  <div
                    key={cargo.id}
                    className={`
                      flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150
                      hover:bg-[#f8f0e7]
                      ${selectedCargoId === cargo.id.toString() ? 'bg-[#fdf7f1] text-[#4d4725]' : 'text-gray-900'}
                    `}
                    onClick={() => handleSelect(cargo)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{cargo.nombre}</span>
                    </div>
                    {selectedCargoId === cargo.id.toString() && (
                      <Check className="h-4 w-4 text-[#4d4725]" />
                    )}
                  </div>
                ))}

                {/* Botón "Ver más" si hay más cargos y no hay búsqueda */}
                {!searchTerm && displayCount < cargos.length && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showMoreCargos();
                      }}
                      className="w-full px-3 py-2 text-sm text-[#4d4725] hover:bg-[#f8f0e7] transition-colors duration-150"
                    >
                      Ver más cargos ({cargos.length - displayCount} restantes)
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
      {!error && selectedCargo && (
        <p className="mt-1 text-xs text-gray-500">
          ID: {selectedCargo.id} • Seleccionado: {selectedCargo.nombre}
        </p>
      )}
    </div>
  );
};

export default CargosSelector;