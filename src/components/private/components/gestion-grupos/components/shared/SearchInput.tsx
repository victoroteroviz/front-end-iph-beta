/**
 * @fileoverview Componente de búsqueda reutilizable
 * @version 1.0.0
 * @description Input de búsqueda con debounce y estilos consistentes
 */

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounce?: boolean;
  isSearching?: boolean;
  onClear?: () => void;
}

/**
 * Componente de input de búsqueda reutilizable
 * Incluye icono de búsqueda y botón para limpiar
 */
export const SearchInput: React.FC<SearchInputProps> = React.memo(({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
  isSearching = false,
  onClear,
}) => {
  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Limpiar búsqueda"
        >
          <X size={20} />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
