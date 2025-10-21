/**
 * @fileoverview Componente de búsqueda de usuarios con integración API
 * @version 2.0.0
 * @description Input de búsqueda con dropdown de resultados, debounce y manejo mejorado de errores
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, User, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Servicios
import { buscarUsuariosPorNombre, formatearNombreCompleto } from '../services/buscar-usuario-nombre.service';

//+ Interfaces
import type { IUsuarioBusqueda } from '../../../../../../../interfaces/user/crud';

//+ Helpers
import { logInfo, logError } from '../../../../../../../helper/log/logger.helper';

// =====================================================
// UTILIDADES INTERNAS
// =====================================================

/**
 * Interfaz para errores del backend
 */
interface BackendError {
  response?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
  details?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
  status?: number;
  message?: string;
  timestamp?: string;
}

/**
 * Parsea errores del backend y extrae mensaje amigable
 * Prioriza mensajes en el siguiente orden:
 * 1. details.message (estructura más reciente del backend)
 * 2. response.message (estructura anterior del backend)
 * 3. message directo
 * 4. Mapeo por código de estado HTTP
 * 5. Mensaje por defecto
 *
 * @param error - Error capturado del backend
 * @param defaultMessage - Mensaje por defecto si no se puede parsear
 * @returns Mensaje de error amigable para el usuario
 */
const parseBackendError = (error: unknown, defaultMessage: string): string => {
  // Si es un error tipado del backend
  if (error && typeof error === 'object') {
    const backendError = error as BackendError;

    // Prioridad 1: message dentro de details (nueva estructura)
    if (backendError.details?.message) {
      return backendError.details.message;
    }

    // Prioridad 2: message dentro de response (estructura anterior)
    if (backendError.response?.message) {
      return backendError.response.message;
    }

    // Prioridad 3: message directo
    if (backendError.message) {
      return backendError.message;
    }

    // Prioridad 4: error genérico basado en statusCode
    const statusCode = backendError.details?.statusCode ??
                      backendError.response?.statusCode ??
                      backendError.status;

    if (statusCode) {
      return getErrorMessageByStatus(statusCode, defaultMessage);
    }
  }

  // Si es un Error estándar de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Obtiene mensaje de error amigable basado en código HTTP
 * @param statusCode - Código de estado HTTP
 * @param defaultMessage - Mensaje por defecto
 * @returns Mensaje de error descriptivo
 */
const getErrorMessageByStatus = (statusCode: number, defaultMessage: string): string => {
  const errorMessages: Record<number, string> = {
    400: 'Los datos de búsqueda no son válidos',
    401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    403: 'No tienes permisos para buscar usuarios',
    404: 'No se encontraron usuarios',
    422: 'El término de búsqueda no puede ser procesado',
    500: 'Error interno del servidor. Intenta nuevamente más tarde',
    502: 'El servidor no está disponible temporalmente',
    503: 'Servicio de búsqueda no disponible. Intenta más tarde'
  };

  return errorMessages[statusCode] || defaultMessage;
};

// =====================================================
// INTERFACES
// =====================================================

interface SearchUsuarioInputProps {
  /** Placeholder del input */
  placeholder?: string;
  /** Callback cuando se selecciona un usuario */
  onUsuarioSelect: (usuario: IUsuarioBusqueda) => void;
  /** Delay para debounce en ms (default: 500) */
  debounceDelay?: number;
  /** Usuario actualmente seleccionado (opcional) */
  selectedUsuarioId?: string;
}

/**
 * Componente de búsqueda de usuarios con dropdown de resultados
 */
export const SearchUsuarioInput: React.FC<SearchUsuarioInputProps> = ({
  placeholder = 'Buscar usuario por nombre...',
  onUsuarioSelect,
  debounceDelay = 500,
  selectedUsuarioId
}) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState<IUsuarioBusqueda[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Click fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Realizar búsqueda con debounce
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si el término está vacío, limpiar resultados
    if (!searchTerm.trim()) {
      setResultados([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    // Validar longitud mínima
    if (searchTerm.trim().length < 2) {
      setError('Ingrese al menos 2 caracteres');
      setResultados([]);
      setShowDropdown(false);
      return;
    }

    // Configurar nuevo timer
    debounceTimerRef.current = setTimeout(async () => {
      await realizarBusqueda(searchTerm);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, debounceDelay]);

  /**
   * Ejecuta la búsqueda en el backend
   */
  const realizarBusqueda = async (termino: string) => {
    setIsSearching(true);
    setError(null);

    logInfo('SearchUsuarioInput', 'Realizando búsqueda', { termino });

    try {
      const usuarios = await buscarUsuariosPorNombre({ termino: termino.trim() });
      setResultados(usuarios);
      setShowDropdown(true);
      setSelectedIndex(-1);

      logInfo('SearchUsuarioInput', 'Búsqueda exitosa', {
        termino,
        resultados: usuarios.length
      });
    } catch (err) {
      const errorMsg = parseBackendError(err, 'Error al buscar usuarios');
      setError(errorMsg);
      setResultados([]);
      setShowDropdown(false);

      logError('SearchUsuarioInput', err, `Error en búsqueda: ${termino}`);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Maneja la selección de un usuario del dropdown
   */
  const handleSelectUsuario = (usuario: IUsuarioBusqueda) => {
    onUsuarioSelect(usuario);
    setSearchTerm('');
    setResultados([]);
    setShowDropdown(false);
    setSelectedIndex(-1);

    logInfo('SearchUsuarioInput', 'Usuario seleccionado', {
      usuarioId: usuario.id,
      nombre: formatearNombreCompleto(usuario)
    });
  };

  /**
   * Limpia la búsqueda
   */
  const handleClearSearch = () => {
    setSearchTerm('');
    setResultados([]);
    setShowDropdown(false);
    setError(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  /**
   * Maneja la navegación con teclado
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || resultados.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < resultados.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && resultados[selectedIndex]) {
          handleSelectUsuario(resultados[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 py-2 w-full md:w-80 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
          style={{
            '--tw-ring-color': COLORS.primary
          } as React.CSSProperties}
        />

        {/* Indicador de carga o botón limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="animate-spin text-gray-400" size={18} />
          ) : searchTerm ? (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute mt-1 w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Dropdown de resultados */}
      {showDropdown && resultados.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Header del dropdown */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{resultados.length}</span> resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Lista de resultados */}
          <div className="py-1">
            {resultados.map((usuario, index) => {
              const isSelected = selectedIndex === index;
              const isAlreadySelected = selectedUsuarioId === usuario.id;

              return (
                <button
                  key={usuario.id}
                  onClick={() => handleSelectUsuario(usuario)}
                  disabled={isAlreadySelected}
                  className={`
                    w-full px-4 py-3 flex items-center space-x-3 transition-colors text-left
                    ${isAlreadySelected
                      ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50 cursor-pointer'
                    }
                  `}
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: isAlreadySelected ? '#e5e7eb' : COLORS.primaryLight,
                      color: isAlreadySelected ? '#9ca3af' : COLORS.primary
                    }}
                  >
                    <User size={20} />
                  </div>

                  {/* Información del usuario */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${isAlreadySelected ? 'text-gray-500' : 'text-gray-900'}`}>
                      {formatearNombreCompleto(usuario)}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>CUIP: {usuario.cuip}</span>
                      <span>•</span>
                      <span>CUP: {usuario.cup}</span>
                    </div>
                  </div>

                  {/* Badge si ya está seleccionado */}
                  {isAlreadySelected && (
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full">
                      Ya agregado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mensaje de sin resultados */}
      {showDropdown && !isSearching && resultados.length === 0 && searchTerm.length >= 2 && !error && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-6"
        >
          <div className="text-center">
            <User className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-gray-600">No se encontraron usuarios</p>
            <p className="text-sm text-gray-500 mt-1">Intenta con otro término de búsqueda</p>
          </div>
        </div>
      )}
    </div>
  );
};
