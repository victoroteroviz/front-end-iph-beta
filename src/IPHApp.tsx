/**
 * IPHApp - Aplicación Principal OPTIMIZADA
 *
 * Componente raíz de la aplicación IPH con sistema de routing optimizado
 *
 * Características v3.0:
 * - ✅ Configuración centralizada de rutas (app-routes.config.ts)
 * - ✅ Protección explícita con PrivateRoute
 * - ✅ Validación de JWT y roles por ruta
 * - ✅ Lazy loading automático con precarga inteligente
 * - ✅ TopLoadingBar para feedback visual (no bloqueante)
 * - ✅ React 19 startTransition para navegación suave
 * - ✅ RoutePreloader para precarga de componentes
 * - ✅ Cache Helper integrado
 * - ✅ Página 404 implementada
 * - ✅ Single Source of Truth
 *
 * @author Sistema IPH
 * @version 3.0.0
 */

import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef, startTransition } from 'react';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Configuración centralizada de rutas
import { getAllRoutes } from './config/app-routes.config';

// Componentes críticos - Carga inmediata (necesarios para renderizado inicial)
import Login from './components/public/auth/Login';
import Dashboard from './components/private/layout/Dashboard';
import { NotFound } from './components/public/errors';

// Sistema de notificaciones - Carga inmediata (global)
import { NotificationContainer } from './components/shared/components/notifications';

// Loading components optimizados
import { RouteLoadingFallback, TopLoadingBar, RouteTransitionOverlay, type TopLoadingBarRef } from './components/shared/components/loading';

// Componente de protección de rutas
import { PrivateRoute } from './components/shared/guards';

// Helpers optimizados
import { RoutePreloader } from './helper/route-preloader';
import { CacheHelper } from './helper/cache/cache.helper';
import { logInfo } from './helper/log/logger.helper';

// Hooks compartidos
import { useRouteTransition } from './components/shared/hooks';

// Crear contexto para compartir estado de transición
import { createContext, useContext } from 'react';

type RouteTransitionContextType = {
  startTransition: () => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextType | null>(null);

export const useRouteTransitionContext = () => {
  const context = useContext(RouteTransitionContext);
  if (!context) {
    throw new Error('useRouteTransitionContext debe usarse dentro de RouteTransitionProvider');
  }
  return context;
};

/**
 * Componente interno que maneja la navegación y precarga
 */
function AppRoutes({ loadingBarRef }: { loadingBarRef: React.RefObject<TopLoadingBarRef | null> }) {
  const location = useLocation();
  const routes = getAllRoutes();
  const { isTransitioning, startTransition: startRouteTransition } = useRouteTransition(loadingBarRef);

  // Inicializar helpers al montar
  useEffect(() => {
    // Configurar CacheHelper
    CacheHelper.initialize({
      enableAutoCleanup: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      maxSize: 5 * 1024 * 1024, // 5MB
      enableLogging: true
    });

    // Configurar RoutePreloader
    RoutePreloader.configure({
      enableLogging: true,
      enableCaching: true
    });

    logInfo('IPHApp', 'Aplicación inicializada con optimizaciones v3.0');

    // Precargar rutas de alta prioridad al inicio (rutas comunes)
    const highPriorityRoutes = routes.filter(r =>
      ['inicio', 'informepolicial'].includes(r.id)
    );

    startTransition(() => {
      highPriorityRoutes.forEach(route => {
        RoutePreloader.preload(route.id, route.component, {
          priority: 'high',
          delay: 1000 // Precargar después de 1s
        });
      });
    });

  }, [routes]);

  return (
    <RouteTransitionContext.Provider value={{ startTransition: startRouteTransition }}>
      {/* Overlay de transición visible */}
      <RouteTransitionOverlay isVisible={isTransitioning} message="Cargando módulo" />

      <Routes>
      {/* ========================================
          RUTAS PÚBLICAS (Sin protección)
      ======================================== */}
      <Route path="/" element={<Login />} />

      {/* ========================================
          RUTAS PRIVADAS (Con protección)
      ======================================== */}
      <Route path="/" element={<Dashboard />}>
        {routes.map((route) => {
          const RouteComponent = route.component;

          return (
            <Route
              key={route.id}
              path={route.path}
              element={
                <PrivateRoute requiredRoles={route.requiredRoles}>
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <RouteComponent />
                  </Suspense>
                </PrivateRoute>
              }
            />
          );
        })}
      </Route>

      {/* ========================================
          RUTA 404 - Página no encontrada
      ======================================== */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </RouteTransitionContext.Provider>
  );
}

/**
 * Componente principal de la aplicación
 */
function IPHApp() {
  const loadingBarRef = useRef<TopLoadingBarRef>(null);

  return (
    <Router>
      <div className="app-container">
        {/* TopLoadingBar global - no bloqueante */}
        <TopLoadingBar
          ref={loadingBarRef}
          color="#4d4725"
          height={3}
          showShadow={true}
        />

        {/* Rutas con precarga y optimizaciones */}
        <AppRoutes loadingBarRef={loadingBarRef} />

        {/* Sistema de notificaciones global */}
        <NotificationContainer position="top-right" />
      </div>
    </Router>
  );
}

export default IPHApp;
