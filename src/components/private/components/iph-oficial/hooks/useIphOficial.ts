/**
 * Hook personalizado para el manejo del IphOficial
 *
 * @fileoverview Hook que encapsula toda la lógica de negocio para el componente
 * IphOficial, incluyendo obtención de datos por ID, gestión de estados y navegación.
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-30
 *
 * @changes v2.0.0
 * - ✅ Validación de roles centralizada (de 31 líneas a 3 - reducción 90%)
 * - ✅ Usa canAccessSuperior() del helper con cache + Zod
 * - ✅ Eliminada lógica manual de parsing de sessionStorage
 * - ✅ Usa getUserRoles() centralizado del role.helper
 * - ✅ Logging movido a useEffect separado para mejor performance
 *
 * @author Sistema IPH Frontend
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Helpers
import { logInfo, logError, logWarning } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { getUserRoles } from '../../../../../helper/role/role.helper';
import { canAccessSuperior } from '../../../../../config/permissions.config';

// Services
import {
  getIphOficial,
  iphOficialExists,
  getIphOficialBasicInfo
} from '../services/iph-oficial.service';

// Interfaces
import type {
  UseIphOficialReturn,
  IphOficialData
} from '../../../../../interfaces/components/iphOficial.interface';

// Role system
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// ==================== CONFIGURACIÓN ====================

/**
 * Configuración por defecto del hook
 */
const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  autoRefreshInterval: 0 // 0 = deshabilitado
} as const;

// ==================== HOOK PRINCIPAL ====================

/**
 * Hook personalizado para manejo del IphOficial
 * 
 * @returns {UseIphOficialReturn} Estado y acciones del hook
 * 
 * @example
 * ```typescript
 * const {
 *   data,
 *   loading,
 *   error,
 *   id,
 *   refetchData,
 *   clearError,
 *   goBack
 * } = useIphOficial();
 * ```
 */
export const useIphOficial = (): UseIphOficialReturn => {
  // ==================== HOOKS DE ROUTING ====================
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ==================== ESTADO ====================

  const [data, setData] = useState<IphOficialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // ==================== VALIDACIONES DE ROLES ====================
  // #region 🔐 VALIDACIÓN DE ACCESO v2.0 - Centralizado

  /**
   * Verifica si el usuario tiene permisos para ver IPH oficial
   * Todos excepto Elemento pueden acceder (SuperAdmin, Administrador, Superior)
   *
   * @refactored v2.0.0 - Reducido de 31 líneas a 3 (-90%)
   * @security Validación Zod + cache 5s + jerarquía automática
   */
  const hasAccess = useMemo(() => canAccessSuperior(getUserRoles()), []);

  // #endregion

  /**
   * Logging de acceso - separado del useMemo para mejor performance
   */
  useEffect(() => {
    if (hasAccess) {
      logInfo('useIphOficial', 'Hook inicializado con acceso autorizado');
    } else {
      logWarning('useIphOficial', 'Hook inicializado sin acceso - usuario sin roles válidos');
    }
  }, [hasAccess]);

  // ==================== FUNCIONES INTERNAS ====================

  /**
   * Obtiene los datos del IPH oficial por ID
   */
  const fetchData = useCallback(async (showLoadingState = true) => {
    if (!id) {
      const error = 'ID de IPH no proporcionado';
      setError(error);
      setLoading(false);
      return;
    }

    if (!hasAccess) {
      setError('No tienes permisos para ver este IPH oficial');
      setLoading(false);
      return;
    }

    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

      logInfo('useIphOficial', 'Obteniendo datos del IPH oficial', { id });

      const response = await getIphOficial({ id });
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error obteniendo datos del IPH');
      }

      setData(response.data);
      setRetryCount(0); // Reset retry count on success

      logInfo('useIphOficial', 'Datos del IPH oficial obtenidos exitosamente', {
        id: response.data.id,
        referencia: response.data.nReferencia,
        tipo: response.data.tipoIph?.nombre || 'No especificado',
        estatus: response.data.estatus || 'No especificado'
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logError('useIphOficial', error, `Error obteniendo datos del IPH oficial ID: ${id}`);
      
      // Implementar retry logic para errores de red
      if (retryCount < DEFAULT_CONFIG.maxRetries && errorMessage.includes('Error desconocido')) {
        logInfo('useIphOficial', `Reintentando obtener datos (intento ${retryCount + 1}/${DEFAULT_CONFIG.maxRetries})`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(false), DEFAULT_CONFIG.retryDelay * (retryCount + 1)); // Backoff exponencial
        return;
      }

      setError(`Error cargando el IPH: ${errorMessage}`);
      
      // Mostrar notificación solo en ciertos casos
      if (errorMessage.includes('no encontrado')) {
        showError('IPH no encontrado');
      } else if (retryCount >= DEFAULT_CONFIG.maxRetries) {
        showError('No se pudo cargar el IPH después de varios intentos');
      }
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [id, hasAccess, retryCount]);

  /**
   * Valida que el ID proporcionado existe antes de intentar cargarlo
   */
  const validateIphId = useCallback(async () => {
    if (!id) return false;

    try {
      logInfo('useIphOficial', 'Validando existencia del IPH', { id });
      
      const exists = await iphOficialExists(id);
      
      if (!exists) {
        setError(`IPH con ID "${id}" no encontrado`);
        setLoading(false);
        showWarning(`IPH "${id}" no existe`);
        return false;
      }

      return true;
    } catch (error) {
      logError('useIphOficial', error, `Error validando IPH ID: ${id}`);
      // Si hay error en la validación, intentar cargar de todas formas
      return true;
    }
  }, [id]);

  // ==================== EFECTOS ====================

  /**
   * Efecto para cargar datos cuando cambia el ID
   */
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('ID de IPH es requerido');
        setLoading(false);
        return;
      }

      // Validar ID antes de cargar
      const isValid = await validateIphId();
      if (isValid) {
        await fetchData();
      }
    };

    loadData();
  }, [id, fetchData, validateIphId]);

  /**
   * Efecto para limpiar datos al desmontar
   */
  useEffect(() => {
    return () => {
      logInfo('useIphOficial', 'Hook desmontándose, limpiando datos');
      setData(null);
      setError(null);
    };
  }, []);

  // ==================== ACCIONES PÚBLICAS ====================

  /**
   * Recarga los datos manualmente
   */
  const refetchData = useCallback(async () => {
    logInfo('useIphOficial', 'Recarga manual solicitada', { id });
    setRetryCount(0); // Reset retry count for manual refresh
    await fetchData();
    if (!error) {
      showSuccess('Datos actualizados correctamente');
    }
  }, [fetchData, error, id]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    logInfo('useIphOficial', 'Limpiando error', { previousError: error });
    setError(null);
  }, [error]);

  /**
   * Navega de regreso al historial o página anterior
   */
  const goBack = useCallback(() => {
    logInfo('useIphOficial', 'Navegando de regreso desde IPH oficial', { currentId: id });
    
    // Intentar ir al historial si existe
    const hasHistoryState = window.history.state && window.history.state.from;
    
    if (hasHistoryState) {
      navigate(-1); // Ir a la página anterior
    } else {
      // Fallback al historial de IPH
      navigate('/historialiph');
    }
  }, [navigate, id]);

  /**
   * Obtiene información básica del IPH actual
   */
  const getBasicInfo = useCallback(async () => {
    if (!id) return null;

    try {
      const serviceResult = await getIphOficialBasicInfo(id);
      if (!serviceResult) return null;

      // Transformar al formato BasicIphInfo
      return {
        id: serviceResult.id || '',
        nReferencia: serviceResult.nReferencia || '',
        nFolioSist: serviceResult.nFolioSist || '',
        estatus: serviceResult.estatus || 'No especificado',
        tipo: serviceResult.tipoIph?.nombre || 'No especificado',
        fechaCreacion: serviceResult.fechaCreacion || ''
      };
    } catch (error) {
      logError('useIphOficial', error, `Error obteniendo información básica ID: ${id}`);
      return null;
    }
  }, [id]);

  // ==================== COMPUTED VALUES ====================

  /**
   * Indica si el IPH está cargado y tiene datos
   */
  const hasData = useMemo(() => data !== null, [data]);

  /**
   * Información del documento para el header
   */
  const documentInfo = useMemo(() => {
    if (!data) return null;

    return {
      referencia: data.nReferencia || '',
      folio: data.nFolioSist || '',
      tipo: data.tipoIph?.nombre || 'No especificado',
      estatus: data.estatus || 'No especificado',
      fechaCreacion: data.fechaCreacion || ''
    };
  }, [data]);

  /**
   * Indica si hay secciones con contenido
   */
  const sectionsWithContent = useMemo(() => {
    if (!data) return [];

    const sections = [];
    
    if (data.conocimiento_hecho) sections.push('conocimiento');
    if (data.lugar_intervencion) sections.push('lugar');
    if (data.narrativaHechos || data.hechos) sections.push('narrativa');
    if (data.detencion_pertenencias?.length) sections.push('detencion');
    if (data.cInspeccionVehiculo?.length) sections.push('vehiculos');
    if (data.armas_objetos?.length) sections.push('armas');
    if (data.uso_fuerza) sections.push('fuerza');
    if (data.entrega_recepcion) sections.push('entrega');
    if (data.continuacion?.length) sections.push('continuacion');
    if (data.ruta_fotos_lugar?.length) sections.push('fotos');
    if (data.disposicion_ofc?.length) sections.push('disposicion');
    if (data.entrevistas?.length) sections.push('entrevistas');

    return sections;
  }, [data]);

  // ==================== RETURN ====================

  return {
    // Estado
    data,
    loading,
    error,
    id: id || null,
    
    // Acciones
    refetchData,
    clearError,
    goBack,
    
    // Utilidades adicionales
    hasData,
    documentInfo,
    sectionsWithContent,
    getBasicInfo
  };
};

export default useIphOficial;