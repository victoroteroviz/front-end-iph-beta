/**
 * Componente principal de Panel de Estadísticas
 * Muestra grid de tarjetas con diferentes tipos de estadísticas disponibles
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useStatisticsModal - Hook personalizado para lógica del modal
 * @version 2.0.0 - Refactorizado para usar hooks personalizados
 */

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { IStatisticCard } from '../../../../interfaces/IStatistic';
import { statisticsCardsConfig } from './config';
import StatisticsModal from './components/modals/StatisticsModal';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';
import { useStatisticsModal } from './hooks/useStatisticsModal';
import { logDebug, logWarning } from '../../../../helper/log/logger.helper';
import './Estadisticas.css';

const Estadisticas: React.FC = () => {
  // Configuración de las tarjetas de estadísticas (importada desde config)
  const [statistics] = useState<IStatisticCard[]>(statisticsCardsConfig);

  // Hook personalizado para manejar lógica del modal
  const { selectedStat, isModalOpen, handleCardClick, handleCloseModal } = useStatisticsModal({
    closeDelay: 300,
    onOpen: (stat) => {
      logDebug('Estadisticas', 'Modal abierto', {
        statId: stat.id,
        statTitle: stat.titulo
      });
    },
    onClose: () => {
      logDebug('Estadisticas', 'Modal cerrado');
    }
  });

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', isActive: true }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="estadisticas">
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
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                  Panel de Estadísticas
                </h1>
                <p className="text-gray-600 font-poppins">
                  Explora y analiza diferentes métricas del sistema IPH
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de estadísticas con estilos originales */}
        <div className="estadisticas-content">
          <div className="estadisticas-grid">
            {statistics.map((stat) => (
              <div
                key={stat.id}
                className={`stat-card ${!stat.habilitado ? 'disabled' : ''}`}
                onClick={() => handleCardClick(stat)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(stat);
                  }
                }}
                role="button"
                tabIndex={stat.habilitado ? 0 : -1}
                aria-label={`${stat.titulo}: ${stat.descripcion}`}
                aria-disabled={!stat.habilitado}
                style={{ borderColor: stat.habilitado ? stat.color : undefined }}
              >
                <div className="stat-card-icon" style={{ backgroundColor: stat.habilitado ? stat.color : undefined }}>
                  {stat.icono}
                </div>
                <div className="stat-card-content">
                  <h3>{stat.titulo}</h3>
                  <p>{stat.descripcion}</p>
                </div>
                {!stat.habilitado && (
                  <div className="stat-card-badge">
                    Próximamente
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal de estadísticas */}
        {selectedStat && (
          <StatisticsModal
            statistic={selectedStat}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
