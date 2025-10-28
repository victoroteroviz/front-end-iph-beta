/**
 * Componente principal de Panel de Estadísticas
 * Muestra grid de tarjetas con diferentes tipos de estadísticas disponibles
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useStatisticsModal - Hook personalizado para lógica del modal
 * @uses useEstadisticasPermissions - Hook personalizado para control de acceso
 * @version 2.2.0 - Reorganización en componentes atómicos
 *
 * Roles permitidos:
 * - SuperAdmin: Acceso completo + exportación
 * - Administrador: Acceso completo + exportación
 * - Superior: Acceso completo (sin exportación)
 * - Elemento: SIN ACCESO (redirige a /inicio)
 *
 * @structure
 * - EstadisticasHeader: Header con título y métricas
 * - EstadisticasGrid: Grid de tarjetas
 * - StatCard: Tarjeta individual (atómico)
 * - StatisticsModal: Modal de contenido
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IStatisticCard } from '../../../../interfaces/IStatistic';
import { statisticsCardsConfig } from './config';
import EstadisticasHeader from './components/layout/EstadisticasHeader';
import EstadisticasGrid from './components/layout/EstadisticasGrid';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';
import { useEstadisticasPermissions } from './hooks/useEstadisticasPermissions';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/Estadisticas.css';

const Estadisticas: React.FC = () => {
  // Control de acceso por roles
  const { hasAccess, canView, canExport, isLoading } = useEstadisticasPermissions();

  // Hook de navegación
  const navigate = useNavigate();

  // Configuración de las tarjetas de estadísticas (importada desde config)
  const [statistics] = useState<IStatisticCard[]>(statisticsCardsConfig);

  /**
   * Maneja el click en una tarjeta de estadística
   * Navega a la vista correspondiente si está habilitada
   */
  const handleCardClick = useCallback((stat: IStatisticCard) => {
    if (!stat.habilitado) {
      logDebug('Estadisticas', 'Tarjeta deshabilitada', { statId: stat.id });
      return;
    }

    logDebug('Estadisticas', 'Navegando a estadística', {
      statId: stat.id,
      statTitle: stat.titulo,
      ruta: stat.ruta
    });

    // Navegar a la ruta de la estadística
    if (stat.ruta) {
      navigate(stat.ruta);
    }
  }, [navigate]);

  // Early return si no tiene acceso o está cargando permisos
  if (isLoading || !hasAccess || !canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#948b54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', isActive: true }
  ];

  // Calcular métricas rápidas (memoizado para evitar recálculo innecesario)
  const { enabledCount, totalCount } = useMemo(() => ({
    enabledCount: statistics.filter(s => s.habilitado).length,
    totalCount: statistics.length
  }), [statistics]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="estadisticas">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header con métricas */}
        <EstadisticasHeader
          enabledCount={enabledCount}
          totalCount={totalCount}
        />

        {/* Grid de tarjetas de estadísticas */}
        <EstadisticasGrid
          statistics={statistics}
          onCardClick={handleCardClick}
        />
      </div>
    </div>
  );
};

export default Estadisticas;
