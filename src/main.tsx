import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import IPHApp from './IPHApp.tsx';

// Configuración centralizada de Chart.js (debe importarse antes que los componentes que usan Chart.js)
import './config/chart.config';
import { preloadUserDataFromCache } from './helper/user/user.helper';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const bootstrap = async (): Promise<void> => {
  try {
    await preloadUserDataFromCache();
  } catch (error) {
    console.warn('[bootstrap] No se pudo precargar user_data encriptado', error);
  }

  createRoot(rootElement).render(
    <StrictMode>
      <IPHApp />
    </StrictMode>
  );
};

void bootstrap();
