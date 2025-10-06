/**
 * @fileoverview Hook para debounce de valores
 * @version 1.0.0
 * @description Hook personalizado para retrasar la actualización de valores
 */

import { useState, useEffect } from 'react';

/**
 * Hook que retorna un valor debounced
 * @param value - Valor a aplicar debounce
 * @param delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns Valor debounced
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Esta función solo se ejecutará 500ms después de que el usuario deje de escribir
 *   searchAPI(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear un timeout que actualice el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia antes de que se cumpla el delay
    // Esto previene actualizaciones innecesarias si el usuario sigue escribiendo
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook alternativo que también retorna si está en proceso de debouncing
 * @param value - Valor a aplicar debounce
 * @param delay - Tiempo de espera en milisegundos
 * @returns Tupla con [valor debounced, está pendiente]
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const [debouncedSearch, isPending] = useDebouncedValue(searchTerm, 500);
 * 
 * return (
 *   <div>
 *     <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
 *     {isPending && <Spinner />}
 *   </div>
 * );
 * ```
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300
): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsPending(true);
    
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, isPending];
}
