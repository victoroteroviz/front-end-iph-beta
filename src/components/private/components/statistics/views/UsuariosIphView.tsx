/**
 * Vista de Estadísticas de Usuarios y Creación de IPH
 * Wrapper con breadcrumbs para navegación jerárquica
 *
 * @pattern Page View Wrapper
 * @version 2.0.0 - Normalizado con patrón Usuarios.tsx
 */

import React, { useState } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Breadcrumbs, type BreadcrumbItem } from '../../../../shared/components/breadcrumbs';
import UsuariosIphStats from '../components/tables/UsuariosIphStats';
import { ErrorMessage } from '../components/shared/ErrorMessage';

/**
 * Vista completa de estadísticas de usuarios con breadcrumbs
 */
const UsuariosIphView: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Breadcrumbs de navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'Usuarios y Creación de IPH', isActive: true }
  ];

  /**
   * Maneja errores del componente hijo
   */
  const handleError = (message: string) => {
    setError(message);
    setIsRefreshing(false);
  };

  /**
   * Limpia el error actual
   */
  const handleClearError = () => {
    setError('');
  };

  /**
   * Refresca los datos del componente
   */
  const handleRefresh = () => {
    setIsRefreshing(true);
    setError('');
    setRefreshTrigger(prev => prev + 1);
    // El estado isRefreshing se resetea en el componente hijo
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="usuarios-iph-view">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#948b54] rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                  Estadísticas de Usuarios IPH
                </h1>
                <p className="text-gray-600 font-poppins">
                  Análisis de productividad y creación de informes
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón de refrescar */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="
                  flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-white bg-[#4d4725] rounded-lg
                  hover:bg-[#3a3519] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200 font-poppins
                "
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error global si existe */}
        {error && (
          <div className="mb-6">
            <ErrorMessage
              error={error}
              onRetry={handleClearError}
              isLoading={false}
            />
          </div>
        )}

        {/* Componente de estadísticas */}
        <UsuariosIphStats onError={handleError} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default UsuariosIphView;
