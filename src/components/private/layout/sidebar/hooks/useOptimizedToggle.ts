/**
 * Hook super optimizado para toggle
 * Evita re-renders innecesarios y memoiza correctamente
 */

import { useCallback, useState, useMemo } from 'react';

interface UseOptimizedToggleOptions {
  initialValue?: boolean;
}

interface UseOptimizedToggleReturn {
  value: boolean;
  toggle: () => void;
  setValue: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
}

export const useOptimizedToggle = ({
  initialValue = false
}: UseOptimizedToggleOptions = {}): UseOptimizedToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue);

  // Optimizar toggle con prevención de actualizaciones innecesarias
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  // Optimizar setValue con comparación previa
  const setValueOptimized = useCallback((newValue: boolean) => {
    setValue(current => current === newValue ? current : newValue);
  }, []);

  // Handlers específicos para casos comunes - más eficientes
  const setTrue = useCallback(() => {
    setValue(current => current ? current : true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(current => current ? false : current);
  }, []);

  // Memoizar el objeto de retorno para evitar re-renders
  return useMemo(() => ({
    value,
    toggle,
    setValue: setValueOptimized,
    setTrue,
    setFalse
  }), [value, toggle, setValueOptimized, setTrue, setFalse]);
};

export default useOptimizedToggle;