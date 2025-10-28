/**
 * Componente InformePolicial
 * Lista de informes policiales con filtros, paginación y auto-refresh
 * Migrado completamente a TypeScript con arquitectura moderna
 * Auto-refresh cada 5 minutos con control manual
 * 
 * @security Control de acceso por roles
 * - Solo SuperAdmin, Administrador y Superior tienen acceso
 * - Validación con Role Helper v2.1.0 (Zod + Cache)
 * - Elemento no tiene acceso a este módulo
 */

import React, { useEffect, useMemo } from 'react';
import { AlertCircle, RefreshCw, FileText, Users, Filter, Shield } from 'lucide-react';

// Hook personalizado
import useInformePolicial from './hooks/useIphActivo';

// Componentes atómicos
import IPHFilters from './components/IPHFilters';
import IPHTipoFilter from './components/IPHTipoFilter';
import IPHCardsGrid from './components/IPHCardsGrid';
import AutoRefreshIndicator from './components/AutoRefreshIndicator';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';

// Componentes compartidos
import Pagination from '../../../shared/components/pagination';

// Helpers
import { logInfo, logWarning } from '../../../../helper/log/logger.helper';
import { 
  getUserRoles, 
  validateCurrentUserRoles,
  hasAnyRole 
} from '../../../../helper/role/role.helper';

// Interfaces
import type { IInformePolicialProps } from '../../../../interfaces/components/informe-policial.interface';
import { INFORME_POLICIAL_CONFIG } from '../../../../interfaces/components/informe-policial.interface';

const InformePolicial: React.FC<IInformePolicialProps> = ({
  className = '',
  autoRefreshInterval = INFORME_POLICIAL_CONFIG.AUTO_REFRESH_INTERVAL,
  showAutoRefreshIndicator = true
}) => {
  // ==================== VALIDACIÓN DE ROLES (Debe ejecutarse primero) ====================
  
  /**
   * Valida permisos de acceso al componente
   * Solo SuperAdmin, Administrador y Superior tienen acceso
   * 
   * @security Usa Role Helper v2.1.0 con:
   * - Validación Zod automática
   * - Cache de 5 segundos
   * - Auto-sanitización de datos corruptos
   */
  const roleValidation = useMemo(() => {
    // Obtener roles del usuario (usa cache automáticamente)
    const userRoles = getUserRoles();
    
    // Validar estructura de roles
    const validation = validateCurrentUserRoles();
    
    if (!validation.isValid) {
      logWarning('InformePolicial', 'Acceso denegado - Roles inválidos');
      return {
        hasAccess: false,
        reason: 'invalid_roles',
        message: 'No se pudieron validar tus credenciales. Por favor, cierra sesión e inicia sesión nuevamente.'
      };
    }
    
    // Verificar si tiene alguno de los roles permitidos
    const allowedRoles = ['SuperAdmin', 'Administrador', 'Superior'];
    const hasPermission = hasAnyRole(allowedRoles, userRoles);
    
    if (!hasPermission) {
      logWarning('InformePolicial', 'Acceso denegado - Sin permisos suficientes');
      return {
        hasAccess: false,
        reason: 'insufficient_permissions',
        message: 'No tienes permisos para acceder al módulo de Informe Policial. Este módulo requiere permisos de Supervisor o superiores.'
      };
    }
    
    // Acceso concedido
    logInfo('InformePolicial', 'Acceso concedido al módulo de Informe Policial', {
      matchedRole: validation.matchedRole,
      rolesCount: userRoles.length
    });
    
    return {
      hasAccess: true,
      reason: 'authorized',
      message: 'Acceso autorizado',
      userRole: validation.matchedRole
    };
  }, []); // Solo se ejecuta una vez (cache se mantiene por 5s en el helper)

  // ==================== HOOKS (Se ejecutan DESPUÉS de validación) ====================
  
  /**
   * Hook principal con parámetro 'enabled' basado en permisos
   * Si no tiene acceso, el hook NO ejecutará API calls
   */
  const {
    state,
    updateFilters,
    handleSearch,
    handleClearFilters,
    handlePageChange,
    handleCardClick,
    handleManualRefresh,
    toggleAutoRefresh,
    timeUntilNextRefresh,
    isAnyLoading,
    visibleRecords
  } = useInformePolicial(autoRefreshInterval, roleValidation.hasAccess);

  // Log cuando el componente se monta
  useEffect(() => {
    if (roleValidation.hasAccess) {
      logInfo('InformePolicial', 'Component mounted', {
        autoRefreshInterval: autoRefreshInterval / 1000 / 60, // en minutos
        showAutoRefreshIndicator,
        userCanViewAll: state.userCanViewAll,
        userRole: roleValidation.userRole
      });
    }
  }, [autoRefreshInterval, showAutoRefreshIndicator, state.userCanViewAll, roleValidation]);

  // ==================== COMPONENTE DE ACCESO DENEGADO ====================
  
  /**
   * Muestra mensaje de error cuando no tiene permisos
   */
  if (!roleValidation.hasAccess) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="informe-policial">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-white via-red-50/30 to-white rounded-2xl border border-red-200 p-8 text-center shadow-lg overflow-hidden relative">
            {/* Patrón decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100/30 rounded-full blur-3xl -z-10" />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-red-600 mb-4 font-poppins tracking-tight">
                Acceso Denegado
              </h2>

              <p className="text-gray-700 mb-6 font-poppins text-lg max-w-md mx-auto">
                {roleValidation.message}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 shadow-sm">
                <p className="text-sm text-red-800 font-poppins">
                  <strong className="font-bold">Permisos requeridos:</strong> SuperAdmin, Administrador o Superior
                </p>
                {roleValidation.reason === 'invalid_roles' && (
                  <p className="text-sm text-red-700 font-poppins mt-2">
                    Tus credenciales no pudieron ser validadas. Esto puede deberse a datos corruptos en la sesión.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="
                    px-6 py-3 bg-gray-600 text-white rounded-lg
                    hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200 shadow-md hover:shadow-lg
                    font-semibold font-poppins cursor-pointer
                  "
                >
                  Volver Atrás
                </button>

                <button
                  onClick={() => {
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="
                    px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg
                    hover:from-red-700 hover:to-red-800 hover:scale-[1.02] active:scale-[0.98]
                    transition-all duration-200 shadow-md hover:shadow-lg
                    font-semibold font-poppins cursor-pointer
                  "
                >
                  Cerrar Sesión
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-6 font-poppins">
                Si crees que esto es un error, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDERIZADO DEL COMPONENTE ====================

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Listado de Referencias', isActive: true }
  ];

  // ✅ OPTIMIZACIÓN UX: Pantalla de carga completa eliminada
  // El componente padre ya maneja el loading inicial
  // El grid muestra skeleton cards durante la carga (mejor UX)

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="informe-policial">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal - MEJORADO VISUALMENTE */}
        <div className="relative bg-gradient-to-br from-white via-[#fdf7f1] to-white rounded-2xl border border-[#c2b186]/30 p-6 mb-6 shadow-lg shadow-[#4d4725]/5 overflow-hidden">
          {/* Patrón de fondo decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#948b54]/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c2b186]/5 rounded-full blur-3xl -z-10" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-xl shadow-lg shadow-[#4d4725]/20 transition-transform duration-300 hover:scale-105 hover:rotate-3">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#4d4725] font-poppins tracking-tight">
                    Listado de Referencias
                  </h1>
                  <p className="text-gray-600 font-poppins mt-1">
                    {state.userCanViewAll
                      ? 'Vista global de todos los informes policiales por semana'
                      : 'Vista de mis informes policiales hechos por semana'
                    }
                  </p>
                  <p className="text-sm text-gray-500 font-poppins mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#4d4725]/10 text-[#4d4725] font-medium">
                      IPH's de la semana
                    </span>
                    {(() => {
                      const now = new Date();
                      const currentDay = now.getDay();
                      const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
                      const monday = new Date(now);
                      monday.setDate(now.getDate() + daysToMonday);
                      const sunday = new Date(monday);
                      sunday.setDate(monday.getDate() + 6);
                      const formatDate = (date: Date) => {
                        return date.toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                      };
                      return `${formatDate(monday)} al ${formatDate(sunday)}`;
                    })()}
                  </p>
                </div>
              </div>

              {/* Estadísticas rápidas mejoradas */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-[#c2b186]/20 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#948b54]/10 rounded-md">
                      <FileText className="h-4 w-4 text-[#4d4725]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#4d4725] font-poppins leading-none">
                        {state.pagination.totalItems}
                      </div>
                      <div className="text-xs text-gray-600 font-poppins">
                        Informes
                      </div>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-[#c2b186]/30" />
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#948b54]/10 rounded-md">
                      <Users className="h-4 w-4 text-[#4d4725]" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[#4d4725] font-poppins leading-none">
                        {state.filters.page}
                      </div>
                      <div className="text-xs text-gray-600 font-poppins">
                        de {state.pagination.totalPages}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de auto-refresh - MEJORADO */}
        {showAutoRefreshIndicator && (
          <div className="bg-white rounded-xl border border-[#c2b186]/30 p-5 mb-6 shadow-md">
            <AutoRefreshIndicator
              isActive={state.autoRefreshEnabled}
              nextRefreshIn={timeUntilNextRefresh}
              onToggle={toggleAutoRefresh}
            />
          </div>
        )}

        {/* Filtros y Búsqueda - MEJORADOS */}
        <div className="bg-white rounded-xl border border-[#c2b186]/30 mb-6 shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#fdf7f1] to-white border-b border-[#c2b186]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-lg shadow-sm">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
                  Filtros de Búsqueda
                </h2>
                <p className="text-sm text-gray-600 font-poppins">
                  Refina tu búsqueda de informes
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <IPHFilters
                filters={state.filters}
                loading={isAnyLoading}
                onFiltersChange={updateFilters}
                onSearch={handleSearch}
                onClear={handleClearFilters}
                onRefresh={handleManualRefresh}
              />

              {/* Filtro por tipo de IPH */}
              <IPHTipoFilter
                tipos={state.tiposIPH}
                selectedTipoId={state.filters.tipoId || ''}
                loading={state.tiposLoading}
                onTipoChange={(tipoId) => updateFilters({ tipoId })}
              />
            </div>
          </div>
        </div>

        {/* Lista de Informes - MEJORADA */}
        <div className="bg-white rounded-xl border border-[#c2b186]/30 mb-6 shadow-md overflow-hidden">
          <div className="p-6">
            {/* Indicador de actualización */}
            {state.isRefreshing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800 font-poppins">
                      Actualizando datos...
                    </h3>
                    <p className="text-sm text-blue-700 font-poppins">
                      Obteniendo la información más reciente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error general */}
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 font-poppins">
                      Error al cargar informes
                    </h3>
                    <p className="text-sm text-red-700 font-poppins mb-3">
                      {state.error}
                    </p>
                    <button
                      onClick={handleManualRefresh}
                      className="
                        flex items-center gap-2 px-3 py-2 text-sm font-medium
                        text-red-700 bg-red-100 border border-red-300 rounded-lg
                        hover:bg-red-200 transition-colors duration-150 font-poppins
                      "
                    >
                      <RefreshCw className="h-4 w-4" />
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid de tarjetas */}
            <IPHCardsGrid
              registros={visibleRecords}
              loading={state.isLoading}
              onCardClick={handleCardClick}
            />
          </div>
        </div>

        

        {/* Paginación - Componente genérico compartido */}
        <Pagination
          currentPage={state.filters.page}
          totalPages={state.pagination.totalPages}
          totalItems={state.pagination.totalItems}
          onPageChange={handlePageChange}
          loading={isAnyLoading}
        />

        {/* Estadísticas - MEJORADAS */}
        {/* <div className="bg-white rounded-xl border border-[#c2b186]/30 mb-6 shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-[#fdf7f1] to-white border-b border-[#c2b186]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#948b54] to-[#4d4725] rounded-lg shadow-sm">
                <SquareChartGantt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
                  Datos de Registro
                </h2>
                <p className="text-sm text-gray-600 font-poppins">
                  Estadísticas generales del sistema
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <EstadisticasCards />
          </div>
        </div> */}

        {/* Información de la sesión - MEJORADA */}
        <div className="bg-gradient-to-r from-white to-[#fdf7f1] rounded-xl border border-[#c2b186]/30 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm font-poppins">
              {state.lastUpdated && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-[#c2b186]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-gray-700">
                    Última actualización: <span className="font-semibold text-[#4d4725]">{state.lastUpdated.toLocaleTimeString('es-MX')}</span>
                  </span>
                  {state.isFromCache && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-300">
                      📦 Cache
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-[#c2b186]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span className="text-gray-700">
                  Modo: <span className="font-semibold text-[#4d4725]">{state.userCanViewAll ? 'Vista global' : 'Vista personal'}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg border border-[#c2b186]/20">
              <div
                className={`w-2 h-2 rounded-full ${
                  state.autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span className="text-sm font-poppins text-gray-700">
                Auto-refresh <span className="font-semibold text-[#4d4725]">{state.autoRefreshEnabled ? 'activo' : 'pausado'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformePolicial;