/**
 * NotFound Component (404)
 *
 * Página de error 404 - Página no encontrada
 *
 * Características:
 * - Diseño consistente con el sistema IPH
 * - Redirección inteligente basada en autenticación
 * - Mensajes claros para el usuario
 * - Accesibilidad completa
 *
 * @author Sistema IPH
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

// Helpers
import { isUserAuthenticated } from '../../../helper/navigation/navigation.helper';
import { logInfo } from '../../../helper/log/logger.helper';

/**
 * Componente de página no encontrada
 *
 * @example
 * // En IPHApp.tsx
 * <Route path="*" element={<NotFound />} />
 */
export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = isUserAuthenticated();

  useEffect(() => {
    // Log del acceso a 404
    logInfo('NotFound', 'Usuario accedió a página no encontrada', {
      path: window.location.pathname,
      isAuthenticated
    });
  }, [isAuthenticated]);

  /**
   * Redirige al inicio apropiado según autenticación
   */
  const handleGoHome = () => {
    const homePath = isAuthenticated ? '/inicio' : '/';
    navigate(homePath);
  };

  /**
   * Regresa a la página anterior
   */
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f8f0e7] flex items-center justify-center px-4 font-poppins">
      <div className="max-w-2xl w-full text-center">
        {/* Icono de alerta */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <AlertCircle
              size={120}
              className="text-[#4d4725] opacity-20"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-bold text-[#4d4725]">404</span>
            </div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#4d4725] mb-4">
          Página no encontrada
        </h1>

        {/* Descripción */}
        <p className="text-lg md:text-xl text-[#6b6234] mb-8 max-w-lg mx-auto">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        {/* Información adicional */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-md mx-auto border border-[#b8ab84]/30">
          <p className="text-sm text-[#6b6234]">
            <strong>Ruta solicitada:</strong>
          </p>
          <p className="text-sm text-[#4d4725] font-mono bg-[#f8f0e7] px-3 py-2 rounded mt-2 break-all">
            {window.location.pathname}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Botón Volver */}
          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-6 py-3 rounded-lg
              bg-white text-[#4d4725] border-2 border-[#4d4725]
              hover:bg-[#4d4725] hover:text-white
              transition-all duration-300
              font-medium text-sm
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
              min-w-[160px] justify-center
            "
            aria-label="Volver a la página anterior"
          >
            <ArrowLeft size={18} />
            <span>Volver atrás</span>
          </button>

          {/* Botón Ir al Inicio */}
          <button
            onClick={handleGoHome}
            className="
              flex items-center gap-2 px-6 py-3 rounded-lg
              bg-[#4d4725] text-white
              hover:bg-[#3a3519]
              transition-all duration-300
              font-medium text-sm
              focus:outline-none focus:ring-2 focus:ring-[#4d4725] focus:ring-offset-2
              min-w-[160px] justify-center
            "
            aria-label="Ir a la página de inicio"
          >
            <Home size={18} />
            <span>Ir al inicio</span>
          </button>
        </div>

        {/* Enlaces adicionales (si está autenticado) */}
        {isAuthenticated && (
          <div className="mt-12 pt-8 border-t border-[#b8ab84]/30">
            <p className="text-sm text-[#6b6234] mb-4">
              O navega a una de estas secciones:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/inicio"
                className="text-sm text-[#4d4725] hover:underline focus:outline-none focus:underline"
              >
                Inicio
              </Link>
              <span className="text-[#b8ab84]">•</span>
              <Link
                to="/informepolicial"
                className="text-sm text-[#4d4725] hover:underline focus:outline-none focus:underline"
              >
                IPH's Activos
              </Link>
              <span className="text-[#b8ab84]">•</span>
              <Link
                to="/perfil"
                className="text-sm text-[#4d4725] hover:underline focus:outline-none focus:underline"
              >
                Mi Perfil
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-xs text-[#6b6234]/70">
          <p>Sistema IPH - Informe Policial Homologado</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
