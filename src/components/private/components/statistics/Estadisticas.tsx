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
import AccessDenied from '../../../shared/components/access-denied';
import { getUserRoles, isElemento, validateExternalRoles } from '../../../../helper/role/role.helper';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/Estadisticas.css';

const Estadisticas: React.FC = () => {
  // #region validacion rol
  // ✅ PASO 1: Validar roles ANTES de ejecutar cualquier lógica
  const userRoles = getUserRoles();

  // ✅ Memoizar validRoles para evitar re-renders innecesarios
  const validRoles = useMemo(
    () => validateExternalRoles(userRoles),
    [userRoles]
  );

  // ✅ Verificar que NO sea Elemento (todos excepto Elemento pueden acceder)
  const hasAccess = useMemo(
    () => !isElemento(validRoles) && validRoles.length > 0,
    [validRoles]
  );
  // #endregion validacion rol

  // ✅ PASO 2: TODOS los hooks ANTES del return condicional (Rules of Hooks)
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

  // ✅ Memoizar breadcrumbItems
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [{ label: 'Panel de Estadísticas', isActive: true }],
    []
  );

  // Calcular métricas rápidas (memoizado para evitar recálculo innecesario)
  const { enabledCount, totalCount } = useMemo(() => ({
    enabledCount: statistics.filter(s => s.habilitado).length,
    totalCount: statistics.length
  }), [statistics]);

  // ✅ PASO 3: Validación DESPUÉS de todos los hooks
  if (!hasAccess) {
    return (
      <AccessDenied
        title="Acceso Restringido"
        message="Esta sección está disponible solo para Administradores, SuperAdmins y Superiores."
        iconType="shield"
      />
    );
  }

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
