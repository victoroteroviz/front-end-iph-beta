/**
 * Hook personalizado para InformeEjecutivo
 * Consume getIphById con ResponseIphData
 * Maneja toda la lógica de negocio separada de la presentación
 * Solo lectura - sin funcionalidad de edición
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Servicios
import { getIphById } from '../../../../../services/iph/get-iph.service';

// Helpers
import { showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';

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

  const checkAccess = useCallback(() => {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    
    // Verificar que el usuario tenga roles válidos para ver informes ejecutivos
    const hasValidRole = userRoles.some((role: { nombre: string }) => 
      ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(role.nombre)
    );

    if (!hasValidRole) {
      showWarning('No tienes permisos para ver informes ejecutivos', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    logInfo('InformeEjecutivo', 'Access granted to user', {
      userId: userData?.id,
      roles: userRoles.map((r: { nombre: string }) => r.nombre),
      informeId
    });

    return true;
  }, [navigate, informeId]);

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