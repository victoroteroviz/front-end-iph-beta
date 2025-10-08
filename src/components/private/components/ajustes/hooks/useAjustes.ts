/**
 * @fileoverview Hook personalizado para gestión de ajustes del sistema
 * @version 1.0.0
 * @description Hook que maneja la lógica de negocio del componente Ajustes
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  IAjustesResponse,
  IAjusteSeccion,
  ICatalogo,
  IAjustesEstadisticas
} from '../../../../../interfaces/ajustes';
import {
  getAjustesConfiguration,
  getCatalogosDisponibles,
  verificarPermisoSeccion
} from '../../../../../services/ajustes/ajustes.service';
import { canAccessAdmin, canAccessSuperAdmin } from '../../../../../config/permissions.config';
import { showSuccess, showError, showInfo } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';

/**
 * @interface UseAjustesState
 * @description Estado del hook useAjustes
 */
interface UseAjustesState {
  // Datos principales
  configuracion: IAjustesResponse | null;
  secciones: IAjusteSeccion[];
  estadisticas: IAjustesEstadisticas | null;
  catalogos: ICatalogo[];

  // Estados de carga
  loading: boolean;
  loadingCatalogos: boolean;
  loadingSeccion: string | null;

  // Estados de error
  error: string | null;
  errorCatalogos: string | null;

  // Estado de búsqueda
  filtroSeccion: string;
  seccionesFiltradas: IAjusteSeccion[];
}

/**
 * @interface UseAjustesActions
 * @description Acciones disponibles en el hook useAjustes
 */
interface UseAjustesActions {
  // Carga de datos
  cargarConfiguracion: () => Promise<void>;
  cargarCatalogos: () => Promise<void>;
  recargarDatos: () => Promise<void>;

  // Navegación
  navegarASeccion: (seccionId: string) => Promise<void>;
  navegarACatalogos: () => void;

  // Filtros y búsqueda
  filtrarSecciones: (filtro: string) => void;
  limpiarFiltros: () => void;

  // Verificaciones
  verificarAccesoSeccion: (seccionId: string) => Promise<boolean>;
  tienePermisoAdmin: boolean;
  tienePermisoSuperAdmin: boolean;
}

/**
 * @interface UseAjustesReturn
 * @description Tipo de retorno del hook useAjustes
 */
interface UseAjustesReturn extends UseAjustesState, UseAjustesActions {}

/**
 * @function useAjustes
 * @description Hook personalizado para gestión de ajustes del sistema
 * @returns {UseAjustesReturn} Estado y acciones del componente de ajustes
 *
 * @example
 * ```typescript
 * const {
 *   secciones,
 *   loading,
 *   navegarASeccion,
 *   cargarConfiguracion
 * } = useAjustes();
 *
 * // Cargar configuración al montar
 * useEffect(() => {
 *   cargarConfiguracion();
 * }, []);
 * ```
 */
export const useAjustes = (): UseAjustesReturn => {
  const navigate = useNavigate();

  // Estados principales
  const [state, setState] = useState<UseAjustesState>({
    configuracion: null,
    secciones: [],
    estadisticas: null,
    catalogos: [],
    loading: false,
    loadingCatalogos: false,
    loadingSeccion: null,
    error: null,
    errorCatalogos: null,
    filtroSeccion: '',
    seccionesFiltradas: []
  });

  // Obtener roles del usuario desde sessionStorage
  const userRoles = useMemo(() => {
    try {
      const rolesData = sessionStorage.getItem('roles');
      return rolesData ? JSON.parse(rolesData) : [];
    } catch (error) {
      logError('useAjustes', error, 'Error al obtener roles de usuario');
      return [];
    }
  }, []);

  // Verificar permisos del usuario
  const tienePermisoAdmin = useMemo(() => {
    return canAccessAdmin(userRoles);
  }, [userRoles]);

  const tienePermisoSuperAdmin = useMemo(() => {
    return canAccessSuperAdmin(userRoles);
  }, [userRoles]);

  /**
   * @function cargarConfiguracion
   * @description Carga la configuración completa de ajustes
   */
  const cargarConfiguracion = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      logInfo('useAjustes', 'Iniciando carga de configuración de ajustes');

      const config = await getAjustesConfiguration(userRoles);

      setState(prev => ({
        ...prev,
        configuracion: config,
        secciones: config.secciones,
        estadisticas: config.estadisticas,
        seccionesFiltradas: config.secciones,
        loading: false
      }));

      logInfo('useAjustes', 'Configuración cargada exitosamente', {
        totalSecciones: config.secciones.length
      });

    } catch (error) {
      const errorMsg = 'Error al cargar la configuración de ajustes';
      logError('useAjustes', error, errorMsg);

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg
      }));

      showError(errorMsg);
    }
  }, [userRoles]);

  /**
   * @function cargarCatalogos
   * @description Carga los catálogos disponibles para administración
   */
  const cargarCatalogos = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loadingCatalogos: true, errorCatalogos: null }));

      logInfo('useAjustes', 'Iniciando carga de catálogos');

      const catalogos = await getCatalogosDisponibles(userRoles);

      setState(prev => ({
        ...prev,
        catalogos,
        loadingCatalogos: false
      }));

      logInfo('useAjustes', 'Catálogos cargados exitosamente', {
        totalCatalogos: catalogos.length
      });

    } catch (error) {
      const errorMsg = 'Error al cargar los catálogos';
      logError('useAjustes', error, errorMsg);

      setState(prev => ({
        ...prev,
        loadingCatalogos: false,
        errorCatalogos: errorMsg
      }));

      showError(errorMsg);
    }
  }, [userRoles]);

  /**
   * @function recargarDatos
   * @description Recarga todos los datos del componente
   */
  const recargarDatos = useCallback(async (): Promise<void> => {
    await Promise.all([
      cargarConfiguracion(),
      cargarCatalogos()
    ]);
    showInfo('Datos actualizados correctamente');
  }, [cargarConfiguracion, cargarCatalogos]);

  /**
   * @function navegarASeccion
   * @description Navega a una sección específica de ajustes
   * @param {string} seccionId - ID de la sección
   */
  const navegarASeccion = useCallback(async (seccionId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loadingSeccion: seccionId }));

      // Verificar permisos antes de navegar
      const tieneAcceso = await verificarPermisoSeccion(seccionId, userRoles);

      if (!tieneAcceso) {
        showError('No tienes permisos para acceder a esta sección');
        return;
      }

      // Buscar la sección para obtener su ruta
      const seccion = state.secciones.find(s => s.id === seccionId);

      if (seccion?.ruta) {
        logInfo('useAjustes', 'Navegando a sección', { seccionId, ruta: seccion.ruta });
        navigate(seccion.ruta);
        showSuccess(`Accediendo a ${seccion.nombre}`);
      } else {
        showInfo('Esta sección estará disponible próximamente');
      }

    } catch (error) {
      logError('useAjustes', error, 'Error al navegar a sección');
      showError('Error al acceder a la sección');
    } finally {
      setState(prev => ({ ...prev, loadingSeccion: null }));
    }
  }, [userRoles, state.secciones, navigate]);

  /**
   * @function navegarACatalogos
   * @description Navega a la administración de catálogos
   */
  const navegarACatalogos = useCallback((): void => {
    if (!tienePermisoAdmin) {
      showError('No tienes permisos para administrar catálogos');
      return;
    }

    logInfo('useAjustes', 'Navegando a administración de catálogos');
    navigate('/ajustes/catalogos');
  }, [tienePermisoAdmin, navigate]);

  /**
   * @function filtrarSecciones
   * @description Filtra las secciones según el término de búsqueda
   * @param {string} filtro - Término de búsqueda
   */
  const filtrarSecciones = useCallback((filtro: string): void => {
    setState(prev => {
      const filtroLower = filtro.toLowerCase();
      const seccionesFiltradas = prev.secciones.filter(seccion =>
        seccion.nombre.toLowerCase().includes(filtroLower) ||
        seccion.descripcion.toLowerCase().includes(filtroLower)
      );

      return {
        ...prev,
        filtroSeccion: filtro,
        seccionesFiltradas
      };
    });
  }, []);

  /**
   * @function limpiarFiltros
   * @description Limpia todos los filtros aplicados
   */
  const limpiarFiltros = useCallback((): void => {
    setState(prev => ({
      ...prev,
      filtroSeccion: '',
      seccionesFiltradas: prev.secciones
    }));
  }, []);

  /**
   * @function verificarAccesoSeccion
   * @description Verifica si el usuario puede acceder a una sección
   * @param {string} seccionId - ID de la sección
   */
  const verificarAccesoSeccion = useCallback(async (seccionId: string): Promise<boolean> => {
    try {
      return await verificarPermisoSeccion(seccionId, userRoles);
    } catch (error) {
      logError('useAjustes', error, 'Error al verificar acceso a sección');
      return false;
    }
  }, [userRoles]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  return {
    // Estado
    ...state,

    // Acciones
    cargarConfiguracion,
    cargarCatalogos,
    recargarDatos,
    navegarASeccion,
    navegarACatalogos,
    filtrarSecciones,
    limpiarFiltros,
    verificarAccesoSeccion,

    // Permisos
    tienePermisoAdmin,
    tienePermisoSuperAdmin
  };
};