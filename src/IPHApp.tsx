import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './components/public/auth/Login'

function IPHApp() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<div>Página de Inicio - En desarrollo</div>} />
      </Routes>
    </Router>
  )
}

export default IPHApp
