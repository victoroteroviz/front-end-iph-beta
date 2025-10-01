import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'

// Componentes refactorizados
import Login from './components/public/auth/Login'
import Dashboard from './components/private/layout/Dashboard'
import Inicio from './components/private/components/home/Inicio'
import Estadisticas from './components/private/components/statistics/Estadisticas'
import HistorialIPH from './components/private/components/historial-iph/HistorialIPH'
import IphOficial from './components/private/components/iph-oficial/IphOficial'
import InformePolicial from './components/private/components/informe-policial/InformePolicial'
import PerfilUsuario from './components/private/components/perfil-usuario/PerfilUsuario'
import Usuarios from './components/private/components/usuarios/Usuarios'
import InformeEjecutivo from './components/private/components/informe-ejecutivo/InformeEjecutivo'

// Sistema de notificaciones
import { NotificationContainer } from './components/shared/notifications'

// TODO: Componentes pendientes de refactorización
// import PrivateRoute from "./routes/PrivateRoute"

function IPHApp() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Rutas sin layout (como Login) */}
          <Route path="/" element={<Login />} />

          {/* Rutas con layout Dashboard - Componentes refactorizados */}
          <Route path="/" element={<Dashboard />}>
            <Route path="inicio" element={<Inicio />} />
            <Route path="estadisticasusuario" element={<Estadisticas />} />
            <Route path="historialiph" element={<HistorialIPH />} />
            <Route path="informepolicial" element={<InformePolicial />} />
            <Route path="iphoficial/:id" element={<IphOficial />} />
            <Route path="informeejecutivo/:id" element={<InformeEjecutivo />} />
            
            {/* Rutas de gestión de usuarios refactorizadas */}
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="usuarios/nuevo" element={<PerfilUsuario />} />
            <Route path="usuarios/editar/:id" element={<PerfilUsuario />} />
            <Route path="perfil" element={<PerfilUsuario />} />
          </Route>
        </Routes>

        {/* Sistema de notificaciones global */}
        <NotificationContainer position="top-right" />
      </div>
    </Router>
  )
}

export default IPHApp
