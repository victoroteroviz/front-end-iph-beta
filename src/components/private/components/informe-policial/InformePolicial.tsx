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
import { AlertCircle, RefreshCw, FileText, Users, Loader2, SquareChartGantt, Filter, Shield } from 'lucide-react';

// Hook personalizado
import useInformePolicial from './hooks/useInformePolicial';

// Componentes atómicos
import IPHFilters from './components/IPHFilters';
import IPHTipoFilter from './components/IPHTipoFilter';
import IPHCardsGrid from './components/IPHCardsGrid';
import IPHPagination from './components/IPHPagination';
import AutoRefreshIndicator from './components/AutoRefreshIndicator';
import EstadisticasCards from './components/EstadisticasCards';
import { Breadcrumbs, type BreadcrumbItem } from '../../../shared/components/breadcrumbs';

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
    hasData,
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
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <Shield className="h-16 w-16 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-4 font-poppins">
              Acceso Denegado
            </h2>
            
            <p className="text-gray-700 mb-6 font-poppins text-lg">
              {roleValidation.message}
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-poppins">
                <strong>Permisos requeridos:</strong> SuperAdmin, Administrador o Superior
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
                  hover:bg-gray-700 transition-colors duration-200
                  font-medium font-poppins
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
                  px-6 py-3 bg-red-600 text-white rounded-lg
                  hover:bg-red-700 transition-colors duration-200
                  font-medium font-poppins
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
    );
  }

  // ==================== RENDERIZADO DEL COMPONENTE ====================

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Listado de Referencias', isActive: true }
  ];

  // Estado de carga inicial
  if (state.isLoading && !hasData) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="informe-policial">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#4d4725] mb-4" />
            <h2 className="text-xl font-semibold text-[#4d4725] mb-2 font-poppins">
              Cargando informes policiales...
            </h2>
            <p className="text-gray-600 font-poppins">
              Obteniendo la lista actualizada de informes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="informe-policial">
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
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                  Listado de Referencias
                </h1>
                <p className="text-gray-600 font-poppins">
                  {state.userCanViewAll
                    ? 'Vista global de todos los informes policiales por semana'
                    : 'Vista de mis informes policiales hechos por semana'
                  }
                </p>
                <p className="text-sm text-gray-500 font-poppins mt-1">
                  IPH's de la semana: {(() => {
                    // Obtener la fecha actual
                    const now = new Date();

                    // Calcular el lunes de la semana actual
                    const currentDay = now.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
                    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Si es domingo, retroceder 6 días
                    const monday = new Date(now);
                    monday.setDate(now.getDate() + daysToMonday);

                    // Calcular el domingo de la semana actual (6 días después del lunes)
                    const sunday = new Date(monday);
                    sunday.setDate(monday.getDate() + 6);

                    // Formatear las fechas
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
            <div className="flex items-center space-x-3">
              {/* Estadísticas rápidas */}
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#4d4725]" />
                  <span className="text-sm font-medium text-gray-700 font-poppins">
                    {state.pagination.totalItems} informes
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#4d4725]" />
                  <span className="text-sm font-medium text-gray-700 font-poppins">
                    Página {state.filters.page} de {state.pagination.totalPages}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de auto-refresh */}
        {showAutoRefreshIndicator && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <AutoRefreshIndicator
              isActive={state.autoRefreshEnabled}
              nextRefreshIn={timeUntilNextRefresh}
              onToggle={toggleAutoRefresh}
            />
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#4d4725]" />
                <h2 className="text-xl font-semibold text-[#4d4725] font-poppins">
                  Filtros de Búsqueda
                </h2>
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

        {/* Lista de Informes */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
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

        

        {/* Paginación */}
        {state.pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
            <IPHPagination
              pagination={{
                ...state.pagination,
                currentPage: state.filters.page // Usar la página de los filtros, no del servidor
              }}
              loading={isAnyLoading}
              onPageChange={handlePageChange}
            />
          </div>
        )}

{/* Estadísticas */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <SquareChartGantt className="h-5 w-5 text-[#4d4725]" />
              <h2 className="text-xl font-semibold text-[#4d4725] font-poppins">
                Datos de Registro
              </h2>
            </div>
            <p className="text-sm text-gray-600 font-poppins mt-1">
              Estadísticas generales del sistema
            </p>
          </div>
          <div className="p-6">
            <EstadisticasCards />
          </div>
        </div>

        {/* Información de la sesión */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600 font-poppins">
            <div className="flex items-center gap-4">
              {state.lastUpdated && (
                <span>
                  Última actualización: {state.lastUpdated.toLocaleTimeString('es-MX')}
                </span>
              )}
              <span className="hidden sm:inline">•</span>
              <span>
                Modo: {state.userCanViewAll ? 'Vista global' : 'Vista personal'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  state.autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span>
                Auto-refresh {state.autoRefreshEnabled ? 'activo' : 'pausado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformePolicial;