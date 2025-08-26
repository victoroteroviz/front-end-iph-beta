/**
 * Hook personalizado para InformeEjecutivo
 * Maneja toda la lógica de negocio separada de la presentación
 * Solo lectura con funcionalidad de exportación PDF
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Servicios
import { informeEjecutivoService, generatePDFFileName, downloadBlob } from '../../../../../services/informe-ejecutivo/informe-ejecutivo.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// Interfaces
import type { 
  IInformeEjecutivoState,
  IUseInformeEjecutivoReturn,
  IInformeEjecutivo,
  IAnexoFoto,
  InformeEjecutivoError
} from '../../../../../interfaces/components/informe-ejecutivo.interface';

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialState: IInformeEjecutivoState = {
  informe: null,
  isLoading: false,
  isExportingPDF: false,
  error: null,
  exportError: null,
  mapLoaded: false,
  galleryModalOpen: false,
  selectedImage: null,
  selectedImageIndex: -1
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
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userRoles = userData?.roles || [];
    
    // Verificar que el usuario tenga roles válidos para ver informes ejecutivos
    const hasValidRole = userRoles.some((role: any) => 
      ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(role.nombre)
    );

    if (!hasValidRole) {
      showWarning('No tienes permisos para ver informes ejecutivos', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    logInfo('InformeEjecutivo', 'Access granted to user', {
      userId: userData?.id,
      roles: userRoles.map((r: any) => r.nombre),
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
      informe: null 
    }));

    try {
      logInfo('InformeEjecutivo', 'Loading informe ejecutivo', { id });

      const informeData = await informeEjecutivoService.getInformeById(id);
      
      setState(prev => ({
        ...prev,
        informe: informeData,
        isLoading: false
      }));

      logInfo('InformeEjecutivo', 'Informe ejecutivo loaded successfully', {
        id: informeData.id,
        referencia: informeData.n_referencia,
        hasLocation: !!(informeData.latitud && informeData.longitud),
        anexosCount: informeData.ruta_fotos_lugar?.length || 0
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar el informe ejecutivo';
      
      logError('InformeEjecutivo', 'Error loading informe ejecutivo', { 
        id, 
        error: errorMessage 
      });

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

      showError(userFriendlyError, 'Error de Carga');
    }
  }, []);

  // =====================================================
  // FUNCIONES DE EXPORTACIÓN PDF
  // =====================================================

  const exportToPDF = useCallback(async () => {
    if (!state.informe) {
      showWarning('No hay informe para exportar', 'Exportación no disponible');
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isExportingPDF: true, 
      exportError: null 
    }));

    try {
      logInfo('InformeEjecutivo', 'Starting PDF export', {
        informeId: state.informe.id,
        referencia: state.informe.n_referencia
      });

      const pdfBlob = await informeEjecutivoService.exportInformeToPDF(state.informe.id);
      const fileName = generatePDFFileName(state.informe);
      
      downloadBlob(pdfBlob, fileName);
      
      setState(prev => ({ ...prev, isExportingPDF: false }));
      
      showSuccess(
        `Informe "${state.informe.n_referencia}" exportado exitosamente`, 
        'PDF Generado'
      );

      logAuth('pdf_export', true, {
        informeId: state.informe.id,
        referencia: state.informe.n_referencia,
        fileName
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al exportar PDF';
      
      logError('InformeEjecutivo', 'Error exporting PDF', {
        informeId: state.informe?.id,
        error: errorMessage
      });

      setState(prev => ({
        ...prev,
        isExportingPDF: false,
        exportError: errorMessage
      }));

      showError('No se pudo generar el PDF. Intenta nuevamente.', 'Error de Exportación');
    }
  }, [state.informe]);

  const canExportPDF = useCallback((): boolean => {
    return !!(state.informe && !state.isExportingPDF && !state.isLoading);
  }, [state.informe, state.isExportingPDF, state.isLoading]);

  // =====================================================
  // FUNCIONES DE GALERÍA DE IMÁGENES
  // =====================================================

  const openImageModal = useCallback((anexo: IAnexoFoto, index: number) => {
    setState(prev => ({
      ...prev,
      galleryModalOpen: true,
      selectedImage: anexo,
      selectedImageIndex: index
    }));

    logInfo('InformeEjecutivo', 'Image modal opened', {
      anexoId: anexo.id,
      index
    });
  }, []);

  const closeImageModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      galleryModalOpen: false,
      selectedImage: null,
      selectedImageIndex: -1
    }));

    logInfo('InformeEjecutivo', 'Image modal closed');
  }, []);

  const navigateToImage = useCallback((direction: 'prev' | 'next') => {
    if (!state.informe?.ruta_fotos_lugar || state.selectedImageIndex === -1) return;

    const anexos = state.informe.ruta_fotos_lugar;
    let newIndex: number;

    if (direction === 'prev') {
      newIndex = state.selectedImageIndex > 0 ? state.selectedImageIndex - 1 : anexos.length - 1;
    } else {
      newIndex = state.selectedImageIndex < anexos.length - 1 ? state.selectedImageIndex + 1 : 0;
    }

    setState(prev => ({
      ...prev,
      selectedImage: anexos[newIndex],
      selectedImageIndex: newIndex
    }));

    logInfo('InformeEjecutivo', 'Image navigation', {
      direction,
      newIndex,
      anexoId: anexos[newIndex].id
    });
  }, [state.informe?.ruta_fotos_lugar, state.selectedImageIndex]);

  // =====================================================
  // FUNCIONES DE MAPA
  // =====================================================

  const onMapLoad = useCallback(() => {
    setState(prev => ({ ...prev, mapLoaded: true }));
    logInfo('InformeEjecutivo', 'Map loaded successfully');
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
  // VALORES COMPUTADOS
  // =====================================================

  const hasValidLocation = useMemo(() => {
    return !!(
      state.informe?.latitud && 
      state.informe?.longitud &&
      !isNaN(state.informe.latitud) && 
      !isNaN(state.informe.longitud)
    );
  }, [state.informe?.latitud, state.informe?.longitud]);

  const hasAnexos = useMemo(() => {
    return !!(state.informe?.ruta_fotos_lugar && state.informe.ruta_fotos_lugar.length > 0);
  }, [state.informe?.ruta_fotos_lugar]);

  const isAnyLoading = useMemo(() => {
    return state.isLoading || state.isExportingPDF;
  }, [state.isLoading, state.isExportingPDF]);

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    state,
    loadInforme,
    exportToPDF,
    openImageModal,
    closeImageModal,
    navigateToImage,
    onMapLoad,
    refreshInforme,
    canExportPDF,
    hasValidLocation,
    hasAnexos,
    isAnyLoading
  };
};

export default useInformeEjecutivo;