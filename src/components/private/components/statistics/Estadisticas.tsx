import React, { useState } from 'react';
import type { IStatisticCard } from '../../../../interfaces/IStatistic';
import { statisticsCardsConfig } from './config';
import StatisticsModal from './components/StatisticsModal';
import './Estadisticas.css';

const Estadisticas: React.FC = () => {
  // Configuración de las tarjetas de estadísticas (importada desde config)
  const [statistics] = useState<IStatisticCard[]>(statisticsCardsConfig);
  const [selectedStat, setSelectedStat] = useState<IStatisticCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (stat: IStatisticCard) => {
    if (stat.habilitado) {
      setSelectedStat(stat);
      setIsModalOpen(true);
      console.log(`Abriendo modal de: ${stat.titulo}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Pequeño delay antes de limpiar la estadística seleccionada para que la animación se vea bien
    setTimeout(() => {
      setSelectedStat(null);
    }, 300);
  };

  return (
    <div className="estadisticas-container">
      <div className="estadisticas-header">
        <h1>Panel de Estadísticas</h1>
        <p>Explora y analiza diferentes métricas de tu negocio</p>
      </div>

      <div className="estadisticas-content">
        <div className="estadisticas-grid">
          {statistics.map((stat) => (
            <div
              key={stat.id}
              className={`stat-card ${!stat.habilitado ? 'disabled' : ''}`}
              onClick={() => handleCardClick(stat)}
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
  );
};

export default Estadisticas;