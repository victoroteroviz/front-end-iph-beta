/**
 * Componente SearchBar
 * Barra de búsqueda reutilizable para IPH
 */

import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';

// Interfaces
import type { SearchBarProps } from '../../../../interfaces/components/dashboard.interface';

/**
 * Componente de búsqueda
 * 
 * @param props - Props de la barra de búsqueda
 * @returns JSX.Element de la barra de búsqueda
 */
const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Buscar...",
  onSearch,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Maneja el cambio en el input de búsqueda
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Búsqueda en tiempo real (opcional)
    if (onSearch) {
      onSearch(value);
    }
  }, [onSearch]);

  /**
   * Maneja el envío del formulario de búsqueda
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery, onSearch]);

  /**
   * Limpia el campo de búsqueda
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input 
        type="text" 
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2 rounded 
          bg-white text-black 
          border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:border-transparent
          transition-all duration-200
        " 
        aria-label={placeholder}
      />
      
      {/* Icono de búsqueda */}
      <Search 
        className="absolute left-3 top-2.5 text-[#4d4725] pointer-events-none" 
        size={20} 
        aria-hidden="true"
      />
      
      {/* Botón para limpiar (mostrar solo si hay texto) */}
      {searchQuery && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            absolute right-3 top-2.5 text-gray-400 
            hover:text-gray-600 transition-colors
          "
          aria-label="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </form>
  );
};

export default SearchBar;