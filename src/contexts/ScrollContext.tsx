/**
 * Contexto para manejar scroll del container principal
 * Soluciona el problema de scroll reset en re-renders
 */

import React, { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';

interface ScrollContextType {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  preserveScrollPosition: () => void;
  restoreScrollPosition: () => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

interface ScrollProviderProps {
  children: ReactNode;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  const preserveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current && scrollPositionRef.current > 0) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  const contextValue: ScrollContextType = {
    scrollContainerRef,
    preserveScrollPosition,
    restoreScrollPosition
  };

  return (
    <ScrollContext.Provider value={contextValue}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};