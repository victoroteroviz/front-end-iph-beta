/**
 * Interfaces para el componente InformeEjecutivo
 * Sistema completo de tipos para reportes ejecutivos de IPH
 */

// =====================================================
// INTERFACES DE DATOS BASE
// =====================================================

export interface IPrimerRespondiente {
  id?: string;
  unidad_arrivo?: string;
  n_elementos?: number;
  tiempo_llegada?: string;
  observaciones?: string;
}

export interface ILugarIntervencion {
  id?: string;
  calle_tramo: string;
  n_exterior?: string;
  n_interior?: string;
  col_localidad: string;
  municipio: string;
  entidad_federativa: string;
  codigo_postal?: string;
  referencia1?: string;
  referencia2?: string;
  entre_calles?: string;
}

export interface IUsoFuerza {
  id?: string;
  lesionados_personas?: number;
  lesionados_autoridad?: number;
  fallecidos_personas?: number;
  fallecidos_autoridad?: number;
  uso_arma_letal?: boolean;
  uso_arma_no_letal?: boolean;
  asistencia_medica?: boolean;
  tipo_fuerza_aplicada?: string;
  justificacion?: string;
  testigos?: string;
}

export interface IEntregaRecepcion {
  id?: string;
  explicacion?: string;
  tipo_apoyo_solicitado?: string;
  motivo_ingreso?: string;
  nombre_recepcion?: string;
  primer_apellido_recepcion?: string;
  segundo_apellido_recepcion?: string;
  cargo_recepcion?: string;
  institucion_recepcion?: string;
  fecha_entrega_recepcion?: string;
  hora_entrega?: string;
  observaciones?: string;
}

export interface INarrativaHechos {
  id?: string;
  contenido: string;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  autor?: string;
}

export interface IAnexoFoto {
  id: string;
  ruta_foto: string;
  descripcion?: string;
  fecha_subida?: string;
  tipo_archivo?: string;
  tamaño_archivo?: number;
  orden?: number;
}

export interface ITipoInforme {
  id: string;
  nombre: string;
  codigo?: string;
  descripcion?: string;
}

export interface IEstatusInforme {
  id: string;
  nombre: string;
  codigo?: string;
  color?: string;
  descripcion?: string;
}

// =====================================================
// INTERFACE PRINCIPAL DEL INFORME
// =====================================================

export interface IInformeEjecutivo {
  id: string;
  n_referencia: string;
  n_folio_sist: string;
  tipo?: ITipoInforme;
  estatus?: IEstatusInforme;
  fecha_creacion: string;
  fecha_subida: string;
  fecha_modificacion?: string;
  
  // Contenido principal
  hechos?: string;
  observaciones?: string;
  
  // Ubicación
  latitud?: number;
  longitud?: number;
  
  // Relaciones
  primer_respondiente?: IPrimerRespondiente;
  lugar_intervencion?: ILugarIntervencion;
  uso_fuerza?: IUsoFuerza;
  entrega_recepcion?: IEntregaRecepcion;
  narrativaHechos?: INarrativaHechos;
  
  // Anexos
  ruta_fotos_lugar?: IAnexoFoto[];
  
  // Metadatos
  usuario_creador?: string;
  usuario_modificador?: string;
  version?: number;
  es_borrador?: boolean;
}

// =====================================================
// INTERFACES DE COMPONENTES
// =====================================================

export interface IInformeEjecutivoProps {
  informeId?: string;
  className?: string;
  readonly?: boolean;
  showPDFButton?: boolean;
}

export interface IInformeHeaderProps {
  informe: IInformeEjecutivo;
  loading?: boolean;
  className?: string;
}

export interface IHechosSectionProps {
  hechos?: string;
  loading?: boolean;
  className?: string;
}

export interface IMapSectionProps {
  latitud?: number;
  longitud?: number;
  referencia?: string;
  primerRespondiente?: IPrimerRespondiente;
  loading?: boolean;
  className?: string;
}

export interface IObservacionesSectionProps {
  observaciones?: string;
  loading?: boolean;
  className?: string;
}

export interface IAnexosGalleryProps {
  anexos?: IAnexoFoto[];
  loading?: boolean;
  className?: string;
  onImageClick?: (anexo: IAnexoFoto, index: number) => void;
}

export interface ILugarIntervencionSectionProps {
  lugar?: ILugarIntervencion;
  loading?: boolean;
  className?: string;
}

export interface INarrativaSectionProps {
  narrativa?: INarrativaHechos;
  loading?: boolean;
  className?: string;
}

export interface IUsoFuerzaSectionProps {
  usoFuerza?: IUsoFuerza;
  loading?: boolean;
  className?: string;
}

export interface IEntregaRecepcionSectionProps {
  entregaRecepcion?: IEntregaRecepcion;
  loading?: boolean;
  className?: string;
}

export interface IPDFExportButtonProps {
  informeId: string;
  referencia?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onExport?: (informeId: string) => Promise<void>;
}

export interface ISectionWrapperProps {
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  headerColor?: string;
  contentColor?: string;
}

// =====================================================
// INTERFACES DE HOOKS Y ESTADO
// =====================================================

export interface IInformeEjecutivoState {
  informe: IInformeEjecutivo | null;
  isLoading: boolean;
  isExportingPDF: boolean;
  error: string | null;
  exportError: string | null;
  mapLoaded: boolean;
  galleryModalOpen: boolean;
  selectedImage: IAnexoFoto | null;
  selectedImageIndex: number;
}

export interface IUseInformeEjecutivoReturn {
  state: IInformeEjecutivoState;
  loadInforme: (id: string) => Promise<void>;
  exportToPDF: () => Promise<void>;
  openImageModal: (anexo: IAnexoFoto, index: number) => void;
  closeImageModal: () => void;
  navigateToImage: (direction: 'prev' | 'next') => void;
  onMapLoad: () => void;
  refreshInforme: () => Promise<void>;
  canExportPDF: () => boolean;
  hasValidLocation: boolean;
  hasAnexos: boolean;
  isAnyLoading: boolean;
}

// =====================================================
// INTERFACES DE SERVICIOS
// =====================================================

export interface IInformeEjecutivoService {
  getInformeById: (id: string) => Promise<IInformeEjecutivo>;
  exportInformeToPDF: (id: string) => Promise<Blob>;
}

export interface IInformeEjecutivoFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  type?: string;
  search?: string;
}

// =====================================================
// TIPOS AUXILIARES
// =====================================================

export type InformeEjecutivoError = 
  | 'INFORME_NOT_FOUND'
  | 'INVALID_ID'
  | 'NETWORK_ERROR'
  | 'PDF_GENERATION_ERROR'
  | 'UNAUTHORIZED_ACCESS'
  | 'UNKNOWN_ERROR';

export type MapLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export type ImageLoadingState = 'loading' | 'loaded' | 'error';

// =====================================================
// CONFIGURACIONES Y CONSTANTES
// =====================================================

export const INFORME_EJECUTIVO_CONFIG = {
  MAP_DEFAULT_ZOOM: 16,
  MAP_MIN_ZOOM: 10,
  MAP_MAX_ZOOM: 18,
  GALLERY_ITEMS_PER_ROW: {
    mobile: 2,
    tablet: 3,
    desktop: 4
  },
  PDF_TIMEOUT: 30000, // 30 segundos
  IMAGE_LAZY_LOADING_THRESHOLD: 100,
  SECTION_COLORS: {
    header: '#c2b186',
    background: '#fdf7f1',
    border: '#e5e7eb'
  }
} as const;

export const SECTION_TITLES = {
  HEADER: 'Informe Ejecutivo',
  HECHOS: 'Hechos',
  UBICACION: 'Ubicación',
  OBSERVACIONES: 'Observaciones',
  ANEXOS: 'Anexos',
  LUGAR_INTERVENCION: 'Lugar de Intervención',
  NARRATIVA: 'Narrativa',
  USO_FUERZA: 'Uso de la Fuerza',
  ENTREGA_RECEPCION: 'Entrega y Recepción'
} as const;

// =====================================================
// VALIDADORES DE DATOS
// =====================================================

export const isValidLatLng = (lat?: number, lng?: number): boolean => {
  return (
    lat !== undefined && 
    lng !== undefined &&
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180 &&
    !isNaN(lat) && 
    !isNaN(lng)
  );
};

export const hasValidLocation = (informe: IInformeEjecutivo): boolean => {
  return isValidLatLng(informe.latitud, informe.longitud);
};

export const hasAnexos = (informe: IInformeEjecutivo): boolean => {
  return Array.isArray(informe.ruta_fotos_lugar) && informe.ruta_fotos_lugar.length > 0;
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  INFORME_EJECUTIVO_CONFIG,
  SECTION_TITLES,
  isValidLatLng,
  hasValidLocation,
  hasAnexos
};