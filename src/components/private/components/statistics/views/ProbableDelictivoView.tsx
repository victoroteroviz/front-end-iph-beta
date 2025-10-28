/**
 * Vista de Estadísticas de Probable Hecho Delictivo
 * Wrapper con breadcrumbs para navegación jerárquica
 *
 * @pattern Page View Wrapper
 * @version 1.0.0
 */

import React from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '../../../../shared/components/breadcrumbs';
import EstadisticasProbableDelictivo from '../EstadisticasProbableDelictivo';

/**
 * Vista completa de estadísticas de Probable Delictivo con breadcrumbs
 * Renderiza el componente hijo sin filtros externos (vista completa)
 */
const ProbableDelictivoView: React.FC = () => {
  // Breadcrumbs de navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'IPH de Probable Hecho Delictivo', isActive: true }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="probable-delictivo-view">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Componente de estadísticas PD sin filtros externos */}
        <EstadisticasProbableDelictivo />
      </div>
    </div>
  );
};

export default ProbableDelictivoView;
