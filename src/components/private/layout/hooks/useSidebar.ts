/**
 * Hook personalizado para manejar el estado del sidebar responsive
 * Controla la apertura/cierre y detecta el tamaño de pantalla
 */

import { useState, useEffect, useCallback } from 'react';

interface UseSidebarReturn {
  isOpen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  windowWidth: number;
}

const useSidebar = (): UseSidebarReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Breakpoints
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  // Detectar cambios en el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar automáticamente en desktop/tablet
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Funciones de control
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    isMobile,
    isTablet,
    isDesktop,
    toggle,
    open,
    close,
    windowWidth
  };
};

export default useSidebar;