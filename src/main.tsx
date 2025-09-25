import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IPHApp from './IPHApp.tsx'

// Configuración centralizada de Chart.js (debe importarse antes que los componentes que usan Chart.js)
import './config/chart.config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IPHApp />
  </StrictMode>,
)
