/**
 * Componente principal de Estadísticas de Justicia Cívica
 * Muestra estadísticas diarias, mensuales y anuales de IPH
 *
 * @pattern Atomic Design + Custom Hook
 * @uses useEstadisticasJC - Hook personalizado con lógica de negocio
 * @version 3.0.0 - Normalizado con patrón de ProbableDelictivo (Tailwind CSS)
 */

import React, { useEffect, useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import { useEstadisticasJC } from './hooks/useEstadisticasJC';
import FiltroFechaJC from './components/filters/FiltroFechaJC';
import GraficaBarrasJC from './components/charts/GraficaBarrasJC';
import GraficaPromedioJC from './components/charts/GraficaPromedioJC';
import EstadisticasJCHeader from './sections/EstadisticasJCHeader';
import AccessDenied from '../../../shared/components/access-denied';
import { getUserRoles, isElemento, validateExternalRoles } from '../../../../helper/role/role.helper';
import { JC_COLORS } from './config/colorsConfig';
import { logDebug } from '../../../../helper/log/logger.helper';
import './styles/EstadisticasJC.css';

export interface EstadisticasJCProps {
  /** Filtros externos (cuando se renderizan fuera del componente) */
  externalFilters?: {
    anio: number;
    mes: number;
    dia: number;
  };
}

/**
 * Componente de Estadísticas de Justicia Cívica
 */
export const EstadisticasJC: React.FC<EstadisticasJCProps> = ({ externalFilters }) => {
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
  // Hook personalizado con toda la lógica de negocio
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerTodasLasEstadisticas,
    actualizarFecha
  } = useEstadisticasJC();

  // Estado para controlar si hay errores críticos
  const [hayErrorCritico, setHayErrorCritico] = useState(false);

  // Log solo en mount
  useEffect(() => {
    if (hasAccess) {
      logDebug('EstadisticasJC', 'Component mounted with access');
    }
  }, [hasAccess]);

  // Sincronizar con filtros externos si existen
  useEffect(() => {
    if (externalFilters && hasAccess) {
      logDebug('EstadisticasJC', 'Syncing with external filters', externalFilters);
      actualizarFecha(externalFilters.anio, externalFilters.mes, externalFilters.dia);
    }
  }, [externalFilters, actualizarFecha, hasAccess]);

  // Detectar errores críticos
  useEffect(() => {
    const tieneErrores = error.diaria || error.mensual || error.anual;
    setHayErrorCritico(!!tieneErrores);
  }, [error]);

  /**
   * Manejar cambio de fecha en los filtros
   */
  const handleFechaChange = async (anio: number, mes: number, dia: number) => {
    logDebug('EstadisticasJC', 'Date change requested', { anio, mes, dia });
    actualizarFecha(anio, mes, dia);
  };

  /**
   * Refrescar todas las estadísticas
   */
  const handleRefresh = async () => {
    logDebug('EstadisticasJC', 'Refreshing statistics');
    await obtenerTodasLasEstadisticas();
  };

  const isLoading = loading.diaria || loading.mensual || loading.anual;

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
    <div className="estadisticas-jc-container">
      {/* Header */}
      {!externalFilters && (
        <EstadisticasJCHeader
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      )}

      {/* Mensaje de error crítico */}
      {hayErrorCritico && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div>
            <p className="text-sm font-medium text-red-800 font-poppins">
              Error al cargar estadísticas
            </p>
            <p className="text-xs text-red-700 font-poppins">
              {error.diaria || error.mensual || error.anual}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="
              ml-auto px-3 py-1.5 text-xs font-medium
              text-white bg-red-600 rounded-lg
              hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 font-poppins
            "
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Filtros de Fecha - Solo mostrar si NO hay filtros externos */}
      {!externalFilters && (
        <div className="estadisticas-jc-filtros-section">
          <FiltroFechaJC
            anioInicial={fechaSeleccionada.anio}
            mesInicial={fechaSeleccionada.mes}
            diaInicial={fechaSeleccionada.dia}
            onFechaChange={handleFechaChange}
            loading={isLoading}
          />
        </div>
      )}

      {/* Gráficas de Barras */}
      {(estadisticas.diaria || estadisticas.mensual || estadisticas.anual) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#4d4725] font-poppins mb-6">📊 Visualización de Datos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {estadisticas.diaria && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <GraficaBarrasJC
                  tipo="diaria"
                  datos={estadisticas.diaria}
                  color={JC_COLORS.diaria}
                  height={250}
                />
              </div>
            )}

            {estadisticas.mensual && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <GraficaBarrasJC
                  tipo="mensual"
                  datos={estadisticas.mensual}
                  color={JC_COLORS.mensual}
                  height={250}
                />
              </div>
            )}

            {estadisticas.anual && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <GraficaBarrasJC
                  tipo="anual"
                  datos={estadisticas.anual}
                  color={JC_COLORS.anual}
                  height={250}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráfica de Promedio Diario Mensual */}
      {estadisticas.mensual && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#4d4725] font-poppins mb-6">📈 Promedio Diario del Mes</h2>
          <GraficaPromedioJC
            datosMensuales={estadisticas.mensual}
            anio={fechaSeleccionada.anio}
            mes={fechaSeleccionada.mes}
            height={350}
          />
        </div>
      )}

      {/* Resumen General */}
      {estadisticas.diaria && estadisticas.mensual && estadisticas.anual && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#4d4725] font-poppins mb-6">📋 Resumen Comparativo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600 font-poppins block mb-2">Total Diario</span>
              <span className="text-2xl font-bold text-[#4d4725] font-poppins">
                {(estadisticas.diaria.data.totalConDetenido +
                  estadisticas.diaria.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600 font-poppins block mb-2">Total Mensual</span>
              <span className="text-2xl font-bold text-[#4d4725] font-poppins">
                {(estadisticas.mensual.data.totalConDetenido +
                  estadisticas.mensual.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600 font-poppins block mb-2">Total Anual</span>
              <span className="text-2xl font-bold text-[#4d4725] font-poppins">
                {(estadisticas.anual.data.totalConDetenido +
                  estadisticas.anual.data.totalSinDetenido).toLocaleString()}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-600 font-poppins block mb-2">Promedio Diario (Año)</span>
              <span className="text-2xl font-bold text-[#4d4725] font-poppins">
                {Math.round(
                  (estadisticas.anual.data.totalConDetenido +
                    estadisticas.anual.data.totalSinDetenido) / 365
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer con información */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-600 font-poppins mb-1">
          ℹ️ Las estadísticas se actualizan automáticamente al cambiar la fecha seleccionada
        </p>
        <p className="text-xs text-gray-500 font-poppins font-semibold">
          Última actualización: {new Date().toLocaleString('es-MX')}
        </p>
      </div>
    </div>
  );
};

export default EstadisticasJC;
