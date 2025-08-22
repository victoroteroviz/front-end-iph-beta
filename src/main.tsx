import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IPHApp from './IPHApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IPHApp />
  </StrictMode>,
)
