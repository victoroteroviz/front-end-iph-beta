/**
 * Vista de Estadísticas de Usuarios y Creación de IPH
 * Wrapper con breadcrumbs para navegación jerárquica
 *
 * @pattern Page View Wrapper
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '../../../../shared/components/breadcrumbs';
import UsuariosIphStats from '../components/tables/UsuariosIphStats';
import { ErrorMessage } from '../components/shared/ErrorMessage';

/**
 * Vista completa de estadísticas de usuarios con breadcrumbs
 */
const UsuariosIphView: React.FC = () => {
  const [error, setError] = useState<string>('');

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
  };

  /**
   * Limpia el error actual
   */
  const handleClearError = () => {
    setError('');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="usuarios-iph-view">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
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
        <UsuariosIphStats onError={handleError} />
      </div>
    </div>
  );
};

export default UsuariosIphView;
