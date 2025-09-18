/**
 * Servicio InformeEjecutivo
 * Patrón mock/real para reportes ejecutivos con integración getIphById existente
 */

import type { 
  IInformeEjecutivo,
  IInformeEjecutivoService 
} from '../../interfaces/components/informe-ejecutivo.interface';

// Servicio existente
import { getIphById } from '../iph/get-iph.service';

// Helpers
import { logInfo, logError } from '../../helper/log/logger.helper';

// =====================================================
// CONFIGURACIÓN
// =====================================================

const USE_MOCK_PDF_EXPORT = true; // TODO: Cambiar a false cuando esté la API real

// =====================================================
// TRANSFORMADORES DE DATOS
// =====================================================

/**
 * Transforma respuesta del servidor (getIphById) a formato del componente
 * @param serverData - Datos del servidor (I_IPHById)
 * @returns Datos transformados para el componente
 */
const transformServerDataToInformeEjecutivo = (serverData: any): IInformeEjecutivo => {
  logInfo('InformeEjecutivoService', 'Transforming server data to component format', {
    hasData: !!serverData,
    id: serverData?.id,
    hasKnowledge: !!serverData?.conocimiento_hecho,
    hasDetentions: Array.isArray(serverData?.detencion_pertenencias) ? serverData.detencion_pertenencias.length : 0,
    hasVehicles: Array.isArray(serverData?.cInspeccionVehiculo) ? serverData.cInspeccionVehiculo.length : 0,
    hasWeapons: Array.isArray(serverData?.armas_objetos) ? serverData.armas_objetos.length : 0,
    hasContinuations: Array.isArray(serverData?.continuacion) ? serverData.continuacion.length : 0,
    hasOfficers: Array.isArray(serverData?.disposicion_ofc) ? serverData.disposicion_ofc.length : 0,
    hasFiles: Array.isArray(serverData?.archivos) ? serverData.archivos.length : 0,
    hasInterviews: Array.isArray(serverData?.entrevistas) ? serverData.entrevistas.length : 0
  });

  return {
    // Datos básicos
    id: serverData.id || '',
    n_referencia: serverData.n_referencia || '',
    n_folio_sist: serverData.n_folio_sist || '',
    tipo: serverData.tipo ? {
      id: serverData.tipo.id || '',
      nombre: serverData.tipo.nombre || '',
      codigo: serverData.tipo.codigo,
      descripcion: serverData.tipo.descripcion
    } : undefined,
    estatus: serverData.estatus ? {
      id: serverData.estatus.id || '',
      nombre: serverData.estatus.nombre || '',
      codigo: serverData.estatus.codigo,
      color: serverData.estatus.color,
      descripcion: serverData.estatus.descripcion
    } : undefined,
    
    // Fechas
    fecha_creacion: serverData.fecha_creacion || new Date().toISOString(),
    fecha_subida: serverData.fecha_subida || new Date().toISOString(),
    fecha_modificacion: serverData.fecha_modificacion,
    
    // Contenido principal
    hechos: serverData.hechos,
    observaciones: serverData.observaciones,
    
    // Ubicación
    latitud: serverData.latitud ? parseFloat(serverData.latitud) : undefined,
    longitud: serverData.longitud ? parseFloat(serverData.longitud) : undefined,
    
    // Primer respondiente
    primer_respondiente: serverData.primer_respondiente ? {
      id: serverData.primer_respondiente.id,
      unidad_arrivo: serverData.primer_respondiente.unidad_arrivo,
      n_elementos: serverData.primer_respondiente.n_elementos,
      tiempo_llegada: serverData.primer_respondiente.tiempo_llegada,
      observaciones: serverData.primer_respondiente.observaciones
    } : undefined,
    
    // Lugar de intervención
    lugar_intervencion: serverData.lugar_intervencion ? {
      id: serverData.lugar_intervencion.id,
      calle_tramo: serverData.lugar_intervencion.calle_tramo || '',
      n_exterior: serverData.lugar_intervencion.n_exterior,
      n_interior: serverData.lugar_intervencion.n_interior,
      col_localidad: serverData.lugar_intervencion.col_localidad || '',
      municipio: serverData.lugar_intervencion.municipio || '',
      entidad_federativa: serverData.lugar_intervencion.entidad_federativa || '',
      codigo_postal: serverData.lugar_intervencion.codigo_postal,
      referencia1: serverData.lugar_intervencion.referencia1,
      referencia2: serverData.lugar_intervencion.referencia2,
      entre_calles: serverData.lugar_intervencion.entre_calles
    } : undefined,
    
    // Uso de fuerza
    uso_fuerza: serverData.uso_fuerza ? {
      id: serverData.uso_fuerza.id,
      lesionados_personas: serverData.uso_fuerza.lesionados_personas,
      lesionados_autoridad: serverData.uso_fuerza.lesionados_autoridad,
      fallecidos_personas: serverData.uso_fuerza.fallecidos_personas,
      fallecidos_autoridad: serverData.uso_fuerza.fallecidos_autoridad,
      uso_arma_letal: serverData.uso_fuerza.uso_arma_letal,
      uso_arma_no_letal: serverData.uso_fuerza.uso_arma_no_letal,
      asistencia_medica: serverData.uso_fuerza.asistencia_medica,
      tipo_fuerza_aplicada: serverData.uso_fuerza.tipo_fuerza_aplicada,
      justificacion: serverData.uso_fuerza.justificacion,
      testigos: serverData.uso_fuerza.testigos
    } : undefined,
    
    // Entrega recepción
    entrega_recepcion: serverData.entrega_recepcion ? {
      id: serverData.entrega_recepcion.id,
      explicacion: serverData.entrega_recepcion.explicacion,
      tipo_apoyo_solicitado: serverData.entrega_recepcion.tipo_apoyo_solicitado,
      motivo_ingreso: serverData.entrega_recepcion.motivo_ingreso,
      nombre_recepcion: serverData.entrega_recepcion.nombre_recepcion,
      primer_apellido_recepcion: serverData.entrega_recepcion.primer_apellido_recepcion,
      segundo_apellido_recepcion: serverData.entrega_recepcion.segundo_apellido_recepcion,
      cargo_recepcion: serverData.entrega_recepcion.cargo_recepcion,
      institucion_recepcion: serverData.entrega_recepcion.institucion_recepcion,
      fecha_entrega_recepcion: serverData.entrega_recepcion.fecha_entrega_recepcion,
      hora_entrega: serverData.entrega_recepcion.hora_entrega,
      observaciones: serverData.entrega_recepcion.observaciones
    } : undefined,
    
    // Narrativa
    narrativaHechos: serverData.narrativaHechos ? {
      id: serverData.narrativaHechos.id,
      contenido: serverData.narrativaHechos.contenido || '',
      fecha_creacion: serverData.narrativaHechos.fecha_creacion,
      fecha_modificacion: serverData.narrativaHechos.fecha_modificacion,
      autor: serverData.narrativaHechos.autor
    } : undefined,
    
    // Anexos/Fotos
    ruta_fotos_lugar: Array.isArray(serverData.ruta_fotos_lugar) 
      ? serverData.ruta_fotos_lugar.map((foto: any, index: number) => ({
          id: foto.id || `foto_${index}`,
          ruta_foto: foto.ruta_foto || '',
          descripcion: foto.descripcion,
          fecha_subida: foto.fecha_subida,
          tipo_archivo: foto.tipo_archivo,
          tamaño_archivo: foto.tamaño_archivo,
          orden: foto.orden || index
        }))
      : [],

    // NUEVAS SECCIONES AGREGADAS (compatible con IInformeEjecutivo interface)
    
    // Metadatos
    usuario_creador: serverData.usuario_creador,
    usuario_modificador: serverData.usuario_modificador,
    version: serverData.version || 1,
    es_borrador: serverData.es_borrador || false
  };
};

// =====================================================
// SERVICIOS REALES
// =====================================================

/**
 * Obtiene un informe ejecutivo usando el servicio existente getIphById
 * @param id - ID del informe
 * @returns Informe ejecutivo transformado
 */
const getInformeEjecutivoReal = async (id: string): Promise<IInformeEjecutivo> => {
  try {
    logInfo('InformeEjecutivoService', 'Fetching real informe ejecutivo', { id });

    if (!id || id.trim() === '') {
      throw new Error('ID del informe es requerido');
    }

    // Usar servicio existente
    const serverData = await getIphById(id);
    
    if (!serverData) {
      throw new Error('Informe no encontrado');
    }

    const transformedData = transformServerDataToInformeEjecutivo(serverData);
    
    logInfo('InformeEjecutivoService', 'Informe ejecutivo real obtenido exitosamente', {
      id: transformedData.id,
      referencia: transformedData.n_referencia,
      hasLocation: !!(transformedData.latitud && transformedData.longitud),
      anexosCount: transformedData.ruta_fotos_lugar?.length || 0
    });
    
    return transformedData;

  } catch (error) {
    logError('InformeEjecutivoService', error, `Error al obtener informe ejecutivo real - id: ${id}`);
    throw error;
  }
};

/**
 * Exporta un informe a PDF (implementación real futura)
 * @param id - ID del informe
 * @returns Blob del PDF
 */
const exportInformeToPDFReal = async (id: string): Promise<Blob> => {
  try {
    logInfo('InformeEjecutivoService', 'Exporting real PDF', { id });
    
    // TODO: Implementar con API real
    const response = await fetch(`/api/informes-ejecutivos/${id}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const pdfBlob = await response.blob();
    
    logInfo('InformeEjecutivoService', 'PDF exportado exitosamente', {
      id,
      size: pdfBlob.size
    });
    
    return pdfBlob;

  } catch (error) {
    logError('InformeEjecutivoService', error, `Error al exportar PDF real - id: ${id}`);
    throw error;
  }
};

// =====================================================
// SERVICIOS MOCK
// =====================================================

/**
 * Simula la exportación de PDF
 * @param id - ID del informe
 * @returns Mock blob
 */
const exportInformeToPDFMock = async (id: string): Promise<Blob> => {
  try {
    logInfo('InformeEjecutivoService', 'Exporting mock PDF', { id });
    
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Crear un blob mock con contenido PDF simulado
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
72 720 Td
(Informe Ejecutivo Mock - ID: ${id}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000317 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
410
%%EOF`;
    
    const mockBlob = new Blob([pdfContent], { type: 'application/pdf' });
    
    logInfo('InformeEjecutivoService', 'Mock PDF exportado exitosamente', {
      id,
      size: mockBlob.size
    });
    
    return mockBlob;

  } catch (error) {
    logError('InformeEjecutivoService', error, `Error al exportar PDF mock - id: ${id}`);
    throw error;
  }
};

// =====================================================
// SERVICIO PRINCIPAL
// =====================================================

/**
 * Servicio principal de InformeEjecutivo
 * Implementa el patrón establecido de mock/real con integración del servicio existente
 */
export const informeEjecutivoService: IInformeEjecutivoService = {
  /**
   * Obtiene un informe ejecutivo por ID
   * Utiliza el servicio getIphById existente y transforma los datos
   */
  getInformeById: async (id: string): Promise<IInformeEjecutivo> => {
    // Siempre usar servicio real ya que getIphById ya existe
    return await getInformeEjecutivoReal(id);
  },

  /**
   * Exporta un informe a PDF
   * Por ahora usa mock, cambiar flag para implementación real
   */
  exportInformeToPDF: async (id: string): Promise<Blob> => {
    if (USE_MOCK_PDF_EXPORT) {
      return await exportInformeToPDFMock(id);
    } else {
      return await exportInformeToPDFReal(id);
    }
  }
};

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

/**
 * Valida si un ID de informe es válido
 * @param id - ID a validar
 * @returns true si es válido
 */
export const isValidInformeId = (id?: string): boolean => {
  return !!(id && id.trim() && id.trim().length > 0);
};

/**
 * Genera nombre de archivo para descarga de PDF
 * @param informe - Datos del informe
 * @returns Nombre del archivo
 */
export const generatePDFFileName = (informe: IInformeEjecutivo): string => {
  const referencia = informe.n_referencia?.replace(/[^a-zA-Z0-9]/g, '_') || 'informe';
  const fecha = new Date().toISOString().split('T')[0];
  return `InformeEjecutivo_${referencia}_${fecha}.pdf`;
};

/**
 * Descargar blob como archivo
 * @param blob - Blob a descargar
 * @param fileName - Nombre del archivo
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// =====================================================
// EXPORTS
// =====================================================

export default informeEjecutivoService;
export {
  getInformeEjecutivoReal,
  exportInformeToPDFReal,
  exportInformeToPDFMock,
  transformServerDataToInformeEjecutivo
};