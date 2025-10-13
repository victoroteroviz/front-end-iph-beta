import React, { useState, useCallback } from 'react';
import { BarChart3 } from 'lucide-react';
import type { IStatisticCard } from '../../../../interfaces/IStatistic';
import { statisticsCardsConfig } from './config';
import StatisticsModal from './components/StatisticsModal';
import { Breadcrumbs, type BreadcrumbItem } from '../../layout/breadcrumbs';
import './Estadisticas.css';

const Estadisticas: React.FC = () => {
  // Configuración de las tarjetas de estadísticas (importada desde config)
  const [statistics] = useState<IStatisticCard[]>(statisticsCardsConfig);
  const [selectedStat, setSelectedStat] = useState<IStatisticCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Panel de Estadísticas', isActive: true }
  ];

  /**
   * Manejar clic en tarjeta de estadística
   */
  const handleCardClick = useCallback((stat: IStatisticCard) => {
    if (stat.habilitado) {
      setSelectedStat(stat);
      setIsModalOpen(true);
      console.log(`Abriendo modal de: ${stat.titulo}`);
    } else {
      console.log(`La estadística "${stat.titulo}" está deshabilitada`);
    }
  }, []);

  /**
   * Cerrar modal de estadística
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Pequeño delay antes de limpiar la estadística seleccionada para que la animación se vea bien
    setTimeout(() => {
      setSelectedStat(null);
    }, 300);
  }, []);

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