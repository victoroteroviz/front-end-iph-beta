/**
 * Hook optimizado para manejar toggles rápidos sin lentitud acumulativa
 * Utiliza técnicas avanzadas de React 18 para suavizar las actualizaciones
 */

import { useCallback, useState, useDeferredValue } from 'react';

interface UseOptimizedToggleOptions {
  initialValue?: boolean;
  onToggle?: (newValue: boolean) => void;
}

interface UseOptimizedToggleReturn {
  value: boolean;
  deferredValue: boolean;
  toggle: () => void;
  setValue: (value: boolean) => void;
}

export const useOptimizedToggle = ({ 
  initialValue = false 
}: UseOptimizedToggleOptions = {}): UseOptimizedToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue);
  const deferredValue = useDeferredValue(value);
  
  // Toggle simplificado sin memory leaks
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []); // Sin dependencias problemáticas

  const setValueOptimized = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []); // Sin dependencias problemáticas

  return {
    value,
    deferredValue,
    toggle,
    setValue: setValueOptimized
  };
};

export default useOptimizedToggle;