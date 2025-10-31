/**
 * Componente principal de Panel de Estadísticas
 * Muestra grid de tarjetas con diferentes tipos de estadísticas disponibles
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useStatisticsModal - Hook personalizado para lógica del modal
 * @version 3.0.0 - Validación centralizada con role.helper
 *
 * @changes v3.0.0
 * - ✅ Validación de roles centralizada (de 15 líneas a 3)
 * - ✅ Usa canAccessSuperior() del helper con cache + Zod
 * - ✅ Eliminada lógica manual duplicada
 * - ✅ Defense in depth: PrivateRoute + validación interna
 *
 * @security
 * - Primera línea: PrivateRoute valida en guard de ruta
 * - Segunda línea: Validación defensiva interna con helper
 * - Validación Zod automática + cache 5s
 *
 * @roles
 * - SuperAdmin: Acceso completo + exportación
 * - Administrador: Acceso completo + exportación
 * - Superior: Acceso completo (sin exportación)
 * - Elemento: SIN ACCESO
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
import { getUserRoles } from '../../../../helper/role/role.helper';
import { canAccessSuperior } from '../../../../config/permissions.config';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/Estadisticas.css';

const Estadisticas: React.FC = () => {
  // =====================================================
  // #region 🔐 VALIDACIÓN DE ACCESO v3.0 - Centralizado
  // =====================================================
  /**
   * Validación defensiva usando helper centralizado
   *
   * @description
   * - Primera línea: PrivateRoute (guard de ruta en app-routes.config.tsx)
   * - Segunda línea: Validación defensiva interna (defense in depth)
   *
   * @refactored v3.0.0
   * - Reducido de 15 líneas a 3 (-80%)
   * - Usa canAccessSuperior() con jerarquía automática
   * - Validación Zod + cache 5s incluidos
   * - Elimina duplicación con PrivateRoute
   *
   * @security Validación doble (ID + nombre) automática desde helper
   */
  const hasAccess = useMemo(() => canAccessSuperior(getUserRoles()), []);
  // #endregion

  // ✅ TODOS los hooks ANTES del return condicional (Rules of Hooks)
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

  // =====================================================
  // #region 🚫 VALIDACIÓN DEFENSIVA - Return Early Pattern
  // =====================================================
  /**
   * Si no tiene acceso, mostrar pantalla de acceso denegado
   *
   * @pattern Return Early - Manejo de error antes de lógica principal
   */
  if (!hasAccess) {
    return (
      <AccessDenied
        title="Acceso Restringido"
        message="Esta sección está disponible solo para Administradores, SuperAdmins y Superiores."
        iconType="shield"
      />
    );
  }
  // #endregion

  // =====================================================
  // #region 🎨 RENDERIZADO PRINCIPAL
  // =====================================================
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
  // #endregion
};

export default Estadisticas;
