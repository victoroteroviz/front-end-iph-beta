import { useEffect, useRef } from 'react';
import type { UseClickOutsideProps } from '../../../../interfaces/components/dashboard.interface';

/**
 * Hook reutilizable para detectar clicks fuera de un elemento
 * 
 * Características:
 * - Reutilizable en cualquier componente
 * - Cleanup automático de event listeners
 * - TypeScript tipado
 * - Performance optimizado
 * 
 * @param onClickOutside - Función a ejecutar cuando se hace click fuera
 * @returns Ref para asignar al elemento
 */
const useClickOutside = <T extends HTMLElement = HTMLElement>(
  onClickOutside: () => void
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    /**
     * Maneja el evento de click fuera del elemento
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    // Agregar event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return ref;
};

export default useClickOutside;