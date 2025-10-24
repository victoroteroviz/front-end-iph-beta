/**
 * Componente principal de Panel de Estadísticas
 * Muestra grid de tarjetas con diferentes tipos de estadísticas disponibles
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useStatisticsModal - Hook personalizado para lógica del modal
 * @uses useEstadisticasPermissions - Hook personalizado para control de acceso
 * @version 2.1.0 - Agregado control de acceso por roles
 *
 * Roles permitidos:
 * - SuperAdmin: Acceso completo + exportación
 * - Administrador: Acceso completo + exportación
 * - Superior: Acceso completo (sin exportación)
 * - Elemento: SIN ACCESO (redirige a /inicio)
 */

import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { IStatisticCard } from '../../../../interfaces/IStatistic';
import { statisticsCardsConfig } from './config';
import StatisticsModal from './components/modals/StatisticsModal';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';
import { useStatisticsModal } from './hooks/useStatisticsModal';
import { useEstadisticasPermissions } from './hooks/useEstadisticasPermissions';
import { logDebug, logWarning } from '../../../../helper/log/logger.helper';
import './Estadisticas.css';

const Estadisticas: React.FC = () => {
  // Control de acceso por roles
  const { hasAccess, canView, canExport, isLoading } = useEstadisticasPermissions();

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

  // Calcular métricas rápidas
  const enabledCount = statistics.filter(s => s.habilitado).length;
  const totalCount = statistics.length;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="estadisticas">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal mejorado */}
        <div className="relative bg-gradient-to-br from-white via-[#fdf7f1] to-white rounded-2xl border border-[#c2b186]/30 p-6 mb-6 shadow-lg shadow-[#4d4725]/5 overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#948b54]/5 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c2b186]/5 rounded-full blur-3xl -z-0" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-xl shadow-lg shadow-[#4d4725]/20 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#4d4725] font-poppins tracking-tight">
                    Panel de Estadísticas
                  </h1>
                  <p className="text-gray-600 font-poppins mt-1">
                    Explora y analiza diferentes métricas del sistema IPH
                  </p>
                </div>
              </div>

              {/* Stats rápidas */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#c2b186]/20">
                  <div className="text-2xl font-bold text-[#4d4725] font-poppins">{enabledCount}</div>
                  <div className="text-xs text-gray-600 font-poppins">Disponibles</div>
                </div>
                <div className="text-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-[#c2b186]/20">
                  <div className="text-2xl font-bold text-gray-500 font-poppins">{totalCount - enabledCount}</div>
                  <div className="text-xs text-gray-600 font-poppins">Próximamente</div>
                </div>
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
