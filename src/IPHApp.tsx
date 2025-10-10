import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

// Componentes críticos - Carga inmediata (necesarios para renderizado inicial)
import Login from './components/public/auth/Login'
import Dashboard from './components/private/layout/Dashboard'

// Sistema de notificaciones - Carga inmediata (global)
import { NotificationContainer } from './components/shared/notifications'

// Loading fallbacks
import { RouteLoadingFallback } from './components/shared/loading'

// Componentes lazy - Code splitting automático por ruta
const Inicio = lazy(() => import('./components/private/components/home/Inicio'))
const Estadisticas = lazy(() => import('./components/private/components/statistics/Estadisticas'))
const HistorialIPH = lazy(() => import('./components/private/components/historial-iph/HistorialIPH'))
const IphOficial = lazy(() => import('./components/private/components/iph-oficial/IphOficial'))
const InformePolicial = lazy(() => import('./components/private/components/informe-policial/InformePolicial'))
const PerfilUsuario = lazy(() => import('./components/private/components/perfil-usuario/PerfilUsuario'))
const Usuarios = lazy(() => import('./components/private/components/usuarios/Usuarios'))
const InformeEjecutivo = lazy(() => import('./components/private/components/informe-ejecutivo/InformeEjecutivo'))
const Ajustes = lazy(() => import('./components/private/components/ajustes/Ajustes'))
const AdministracionCatalogos = lazy(() => import('./components/private/components/ajustes/catalogos/AdministracionCatalogos'))
const GestionGrupos = lazy(() => import('./components/private/components/gestion-grupos/GestionGrupos'))

function IPHApp() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Rutas sin layout (como Login) */}
          <Route path="/" element={<Login />} />

          {/* Rutas con layout Dashboard - Componentes lazy con Suspense */}
          <Route path="/" element={<Dashboard />}>
            <Route
              path="inicio"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Inicio />
                </Suspense>
              }
            />
            <Route
              path="estadisticasusuario"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Estadisticas />
                </Suspense>
              }
            />
            <Route
              path="historialiph"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <HistorialIPH />
                </Suspense>
              }
            />
            <Route
              path="informepolicial"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <InformePolicial />
                </Suspense>
              }
            />
            <Route
              path="iphoficial/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <IphOficial />
                </Suspense>
              }
            />
            <Route
              path="informeejecutivo/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <InformeEjecutivo />
                </Suspense>
              }
            />
            <Route
              path="ajustes"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Ajustes />
                </Suspense>
              }
            />
            <Route
              path="ajustes/catalogos"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AdministracionCatalogos />
                </Suspense>
              }
            />
            <Route
              path="gestion-grupos"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GestionGrupos />
                </Suspense>
              }
            />

            {/* Rutas de gestión de usuarios */}
            <Route
              path="usuarios"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Usuarios />
                </Suspense>
              }
            />
            <Route
              path="usuarios/nuevo"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PerfilUsuario />
                </Suspense>
              }
            />
            <Route
              path="usuarios/editar/:id"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PerfilUsuario />
                </Suspense>
              }
            />
            <Route
              path="perfil"
              element={
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PerfilUsuario />
                </Suspense>
              }
            />
          </Route>
        </Routes>

        {/* Sistema de notificaciones global */}
        <NotificationContainer position="top-right" />
      </div>
    </Router>
  )
}

export default IPHApp
