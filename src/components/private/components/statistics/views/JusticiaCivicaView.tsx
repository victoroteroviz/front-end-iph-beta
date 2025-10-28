/**
 * Vista de Estadísticas de Justicia Cívica
 * Wrapper con breadcrumbs para navegación jerárquica
 *
 * @pattern Page View Wrapper
 * @version 1.0.0
 */

import React from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '../../../../shared/components/breadcrumbs';
import EstadisticasJC from '../EstadisticasJC';

/**
 * Vista completa de estadísticas de Justicia Cívica con breadcrumbs
 * Renderiza el componente hijo sin filtros externos (vista completa)
 */
const JusticiaCivicaView: React.FC = () => {
  // Breadcrumbs de navegación
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'IPH de Justicia Cívica', isActive: true }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="justicia-civica-view">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Componente de estadísticas JC sin filtros externos */}
        <EstadisticasJC />
      </div>
    </div>
  );
};

export default JusticiaCivicaView;
