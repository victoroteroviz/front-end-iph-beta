/**
 * Hook personalizado para InformeEjecutivo
 * Consume getIphById con ResponseIphData
 * Maneja toda la lógica de negocio separada de la presentación
import { getUserData } from '../../../../../helper/user/user.helper';
 * Solo lectura - sin funcionalidad de edición
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-30
 *
 * @changes v2.0.0
 * - ✅ Validación de roles refactorizada usando helpers centralizados
 * - ✅ Usa canAccessElemento() del helper con cache + Zod
 * - ✅ Eliminada lógica manual de parsing de sessionStorage
 * - ✅ Usa getUserRoles() centralizado del role.helper
 * - ✅ Reducción de código en función checkAccess()
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Servicios
import { getIphById } from '../../iph-oficial/services/get-iph.service';

// Helpers
import { showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { getUserRoles } from '../../../../../helper/role/role.helper';
import { getUserData } from '../../../../../helper/user/user.helper';
import { canAccessElemento } from '../../../../../config/permissions.config';

// Interfaces
import type { ResponseIphData } from '../../../../../interfaces/iph/iph.interface';

// =====================================================
// INTERFACES DEL HOOK
// =====================================================

interface IInformeEjecutivoState {
  responseData: ResponseIphData | null;
  isLoading: boolean;
  error: string | null;
}

interface IUseInformeEjecutivoReturn {
  state: IInformeEjecutivoState;
  refreshInforme: () => Promise<void>;
}

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialState: IInformeEjecutivoState = {
  responseData: null,
  isLoading: false,
  error: null
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================

const useInformeEjecutivo = (informeIdProp?: string): IUseInformeEjecutivoReturn => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<IInformeEjecutivoState>(initialState);

  // ID del informe (prop o parámetro de URL)
  const informeId = informeIdProp || paramId;

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================
  // #region 🔐 VALIDACIÓN DE ACCESO v2.0 - Centralizado

  /**
   * Verifica si el usuario tiene permisos para ver informes ejecutivos
   * TODOS los roles tienen acceso (SuperAdmin, Admin, Superior, Elemento)
   *
   * @refactored v2.0.0 - Validación centralizada con helper
   * @security Validación Zod + cache 5s + jerarquía automática
   */
  const hasAccess = useMemo(() => canAccessElemento(getUserRoles()), []);

  // #endregion

  const checkAccess = useCallback(() => {
    if (!hasAccess) {
      showWarning('No tienes permisos para ver informes ejecutivos', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    const userData = getUserData();
    logInfo('InformeEjecutivo', 'Access granted to user', {
      userId: userData?.id,
      informeId
    });

    return true;
  }, [hasAccess, navigate, informeId]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInforme = useCallback(async (id: string) => {
    if (!id || id.trim() === '') {
      setState(prev => ({
        ...prev,
        error: 'ID de informe no válido',
        isLoading: false
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      responseData: null 
    }));

    try {
      logInfo('InformeEjecutivo', 'Loading informe ejecutivo with getIphById', { id });

      const responseData = await getIphById(id);
      
      setState(prev => ({
        ...prev,
        responseData: responseData,
        isLoading: false
      }));

      logInfo('InformeEjecutivo', 'Informe ejecutivo loaded successfully', {
        id: responseData.iph && !Array.isArray(responseData.iph) ? responseData.iph.id : 'unknown',
        hasIphData: !!responseData.iph,
        isArray: Array.isArray(responseData.iph)
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar el informe ejecutivo';
      
      logError('InformeEjecutivo', 'Error loading informe ejecutivo', `ID: ${id}, Error: ${errorMessage}`);

      let userFriendlyError: string;
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        userFriendlyError = 'Informe ejecutivo no encontrado';
      } else if (errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
        userFriendlyError = 'No tienes permisos para ver este informe';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userFriendlyError = 'Error de conexión. Verifica tu conexión a internet';
      } else {
        userFriendlyError = 'Error al cargar el informe ejecutivo';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: userFriendlyError
      }));
    }
  }, []);

  // =====================================================
  // FUNCIÓN DE REFRESH
  // =====================================================

  const refreshInforme = useCallback(async () => {
    if (informeId) {
      logInfo('InformeEjecutivo', 'Refreshing informe data', { informeId });
      await loadInforme(informeId);
    }
  }, [informeId, loadInforme]);

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    const hasAccess = checkAccess();
    if (!hasAccess) return;

    if (informeId) {
      loadInforme(informeId);
    } else {
      setState(prev => ({
        ...prev,
        error: 'ID de informe no proporcionado',
        isLoading: false
      }));
    }
  }, [informeId, checkAccess, loadInforme]);

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    state,
    refreshInforme
  };
};

export default useInformeEjecutivo;