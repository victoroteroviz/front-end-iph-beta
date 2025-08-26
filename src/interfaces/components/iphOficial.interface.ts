/**
 * Interfaces para el componente IphOficial
 * Manejo de visualización de IPH oficial por ID
 */

// Importar interfaces base del sistema
import type { 
  I_IPHById, 
  Estatus, 
  Tipo, 
  PrimerRespondiente 
} from '../iph/iph.interface';

// Re-exportar para uso en componentes
export type { Estatus, Tipo } from '../iph/iph.interface';

// ==================== INTERFACES EXTENDIDAS PARA CAMPOS ANY ====================

/**
 * Interface para conocimiento de hechos
 * Extiende el campo any del servidor
 */
export interface ConocimientoHecho {
  tipo?: string;
  numero?: string;
  documento?: string;
  fecha_conocimiento?: string;
  fecha_arribo?: string;
  descripcion?: string;
}

/**
 * Interface para lugar de intervención
 * Extiende el campo any del servidor
 */
export interface LugarIntervencion {
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  codigo_postal?: string;
  colonia?: string;
  referencias?: string;
  municipio?: string;
  estado?: string;
  coordenadas?: string;
  inspeccion?: boolean;
  objetos_encontrados?: boolean;
  lugar_preservado?: boolean;
  lugar_priorizado?: boolean;
  riesgo_natural?: boolean;
  riesgo_social?: boolean;
  especificacion_riesgo?: string;
}

/**
 * Interface para narrativa de hechos
 * Extiende el campo any del servidor
 */
export interface NarrativaHechos {
  descripcion?: string;
  fecha_elaboracion?: string;
  elaborado_por?: string;
}

/**
 * Interface para detención y pertenencias
 */
export interface DetencionPertenencias {
  id?: number;
  descripcion?: string;
  cantidad?: number;
  estado?: string;
  observaciones?: string;
}

/**
 * Interface para inspección de vehículo
 */
export interface InspeccionVehiculo {
  id?: number;
  tipo_vehiculo?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  placas?: string;
  serie?: string;
  motor?: string;
  observaciones?: string;
}

/**
 * Interface para armas y objetos
 */
export interface ArmasObjetos {
  id?: number;
  tipo?: string;
  descripcion?: string;
  cantidad?: number;
  marca?: string;
  calibre?: string;
  serie?: string;
  estado?: string;
}

/**
 * Interface para uso de fuerza
 */
export interface UsoFuerza {
  se_uso_fuerza?: boolean;
  tipo_fuerza?: string;
  justificacion?: string;
  lesiones?: boolean;
  descripcion_lesiones?: string;
}

/**
 * Interface para entrega recepción
 */
export interface EntregaRecepcion {
  fecha?: string;
  autoridad_receptora?: string;
  nombre_receptor?: string;
  cargo_receptor?: string;
  observaciones?: string;
}

/**
 * Interface para continuación
 */
export interface Continuacion {
  id?: number;
  descripcion?: string;
  fecha?: string;
  responsable?: string;
}

/**
 * Interface para fotos del lugar
 */
export interface FotoLugar {
  id?: number;
  url?: string;
  descripcion?: string;
  fecha_captura?: string;
  ubicacion?: string;
}

/**
 * Interface para disposición oficial
 */
export interface DisposicionOficial {
  id?: number;
  fecha?: string;
  expediente?: string;
  anexos?: string;
  documentacion?: string;
  autoridad?: AutoridadDisposicion;
}

/**
 * Interface para autoridad en disposición
 */
export interface AutoridadDisposicion {
  nombre?: string;
  cargo_grado?: string;
  adscripcion?: string;
  firma?: string;
  fecha_firma?: string;
}

/**
 * Interface para entrevistas
 */
export interface Entrevista {
  id?: number;
  tipo_persona?: string; // 'testigo', 'victima', 'sospechoso'
  nombre?: string;
  edad?: number;
  telefono?: string;
  domicilio?: string;
  relacion_hechos?: string;
  declaracion?: string;
}

// ==================== INTERFACE PRINCIPAL EXTENDIDA ====================

/**
 * Interface principal para IPH oficial con campos tipados
 * Extiende I_IPHById con tipos específicos en lugar de any
 */
export interface IphOficialData extends Omit<I_IPHById, 
  'conocimiento_hecho' | 
  'lugar_intervencion' | 
  'narrativaHechos' | 
  'detencion_pertenencias' |
  'cInspeccionVehiculo' |
  'armas_objetos' |
  'uso_fuerza' |
  'entrega_recepcion' |
  'continuacion' |
  'ruta_fotos_lugar' |
  'disposicion_ofc' |
  'entrevistas'
> {
  conocimiento_hecho?: ConocimientoHecho;
  lugar_intervencion?: LugarIntervencion;
  narrativaHechos?: NarrativaHechos;
  detencion_pertenencias?: DetencionPertenencias[];
  cInspeccionVehiculo?: InspeccionVehiculo[];
  armas_objetos?: ArmasObjetos[];
  uso_fuerza?: UsoFuerza;
  entrega_recepcion?: EntregaRecepcion;
  continuacion?: Continuacion[];
  ruta_fotos_lugar?: FotoLugar[];
  disposicion_ofc?: DisposicionOficial[];
  entrevistas?: Entrevista[];
}

// ==================== INTERFACES DE COMPONENTES ====================

/**
 * Props del componente principal IphOficial
 */
export interface IphOficialProps {
  className?: string;
}

/**
 * Props para secciones de información
 */
export interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

/**
 * Props para filas de información
 */
export interface InfoRowProps {
  label: string;
  value: string | number | boolean | null | undefined;
  className?: string;
  type?: 'text' | 'boolean' | 'date' | 'coordinates';
}

/**
 * Props para sección de información general
 */
export interface InformacionGeneralProps {
  data: Pick<IphOficialData, 'n_referencia' | 'n_folio_sist' | 'observaciones' | 'estatus'>;
  loading?: boolean;
  className?: string;
}

/**
 * Props para sección de primer respondiente
 */
export interface PrimerRespondienteProps {
  data: PrimerRespondiente;
  loading?: boolean;
  className?: string;
}

/**
 * Props para sección de conocimiento de hechos
 */
export interface ConocimientoHechosProps {
  data?: ConocimientoHecho;
  loading?: boolean;
  className?: string;
}

/**
 * Props para sección de lugar de intervención
 */
export interface LugarIntervencionProps {
  data?: LugarIntervencion;
  latitud?: string;
  longitud?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Props para sección de narrativa
 */
export interface NarrativaSectionProps {
  data?: NarrativaHechos;
  hechos?: string; // Campo del servidor principal
  loading?: boolean;
  className?: string;
}

/**
 * Props para sección de puesta a disposición
 */
export interface PuestaDisposicionProps {
  data?: DisposicionOficial[];
  entregaRecepcion?: EntregaRecepcion;
  loading?: boolean;
  className?: string;
}

// ==================== INTERFACES DE HOOKS ====================

/**
 * State del hook useIphOficial
 */
export interface UseIphOficialState {
  data: IphOficialData | null;
  loading: boolean;
  error: string | null;
  id: string | null;
}

/**
 * Actions del hook useIphOficial
 */
export interface UseIphOficialActions {
  refetchData: () => Promise<void>;
  clearError: () => void;
  goBack: () => void;
  getBasicInfo: () => Promise<BasicIphInfo | null>;
}

/**
 * Computed values del hook useIphOficial
 */
export interface UseIphOficialComputed {
  hasData: boolean;
  documentInfo: DocumentInfo | null;
  sectionsWithContent: string[];
}

/**
 * Información básica de un IPH
 */
export interface BasicIphInfo {
  id: string;
  n_referencia: string;
  n_folio_sist: string;
  estatus: Estatus;
  tipo: Tipo;
  fecha_creacion: string;
}

/**
 * Información del documento para el header
 */
export interface DocumentInfo {
  referencia: string;
  folio: string;
  tipo: string;
  estatus: string;
  fechaCreacion: string;
}

/**
 * Return type completo del hook useIphOficial
 */
export type UseIphOficialReturn = UseIphOficialState & UseIphOficialActions & UseIphOficialComputed;

// ==================== INTERFACES DE SERVICIOS ====================

/**
 * Response transformado para el componente
 */
export interface IphOficialResponse {
  success: boolean;
  data: IphOficialData;
  message?: string;
}

/**
 * Parámetros para obtener IPH por ID
 */
export interface GetIphOficialParams {
  id: string;
  includeDetails?: boolean;
}

// ==================== TIPOS Y ENUMS ====================

/**
 * Tipos de sección disponibles
 */
export type SeccionType = 
  | 'informacion_general'
  | 'primer_respondiente' 
  | 'conocimiento_hechos'
  | 'lugar_intervencion'
  | 'narrativa_hechos'
  | 'detencion_pertenencias'
  | 'inspeccion_vehiculo'
  | 'armas_objetos'
  | 'uso_fuerza'
  | 'entrega_recepcion'
  | 'continuacion'
  | 'fotos_lugar'
  | 'disposicion_oficial'
  | 'entrevistas';

/**
 * Estados posibles del documento
 */
export type EstadoDocumento = 
  | 'borrador'
  | 'revision'
  | 'aprobado'
  | 'archivado';

/**
 * Tipos de persona para entrevistas
 */
export type TipoPersona = 
  | 'testigo'
  | 'victima' 
  | 'sospechoso'
  | 'denunciante';

/**
 * Configuración de secciones visibles
 */
export interface SeccionConfig {
  id: SeccionType;
  titulo: string;
  visible: boolean;
  obligatoria: boolean;
  orden: number;
  icono?: string;
}