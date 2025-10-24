/**
 * IPHApp - Aplicación Principal
 *
 * Componente raíz de la aplicación IPH con sistema de routing refactorizado
 *
 * Características v2.0:
 * - ✅ Configuración centralizada de rutas (app-routes.config.ts)
 * - ✅ Protección explícita con PrivateRoute
 * - ✅ Validación de JWT y roles por ruta
 * - ✅ Lazy loading automático
 * - ✅ Página 404 implementada
 * - ✅ Single Source of Truth
 * - ✅ Reducción de código (159 → 95 líneas)
 *
 * @author Sistema IPH
 * @version 2.0.0
 */

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
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

// Loading fallbacks
import { RouteLoadingFallback } from './components/shared/components/loading';

// Componente de protección de rutas
import { PrivateRoute } from './components/shared/guards';

/**
 * Componente principal de la aplicación
 */
function IPHApp() {
  // Obtener todas las rutas desde configuración centralizada
  const routes = getAllRoutes();

  return (
    <Router>
      <div className="app-container">
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

        {/* Sistema de notificaciones global */}
        <NotificationContainer position="top-right" />
      </div>
    </Router>
  );
}

export default IPHApp;
