/**
 * Interfaces para los datos básicos de IPH
 * Basado en BasicDataDto del backend
 */

/**
 * Interface para la ubicación del IPH
 */
export interface I_UbicacionDto {
  calle?: string;
  colonia?: string;
  estado?: string;
  municipio?: string;
  ciudad?: string;
}

/**
 * Interface para información del usuario/primer respondiente
 */
export interface I_UsuarioDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

/**
 * Interface principal para los datos básicos de IPH
 * Representa la información esencial de un IPH finalizado
 */
export interface I_BasicDataDto {
  /** ID único del IPH */
  id: string;

  /** Tipo de IPH (ej: "Incidente", "Accidente") */
  tipoIph: string;

  /** Delito asociado al IPH */
  delito: string;

  /** Nombre del detenido (opcional) */
  detenido?: string;

  /** Hora de la detención (opcional) */
  horaDetencion?: string;

  /** Hora de puesta a disposición (opcional) */
  horaPuestaDisposicion?: Date;

  /** Número de RND (opcional) */
  numRND?: string;

  /** Número de referencia del IPH */
  numero: string;

  /** Ubicación del IPH */
  ubicacion?: I_UbicacionDto;

  /** Fecha de creación del IPH */
  fechaCreacion: Date | string;

  /** Tipo de delito */
  tipoDelito: string;

  /** Primer respondiente que atendió el IPH */
  primerRespondiente?: I_UsuarioDto;

  /** Estatus actual del IPH */
  estatus: string;

  /** URLs de las evidencias/fotos */
  evidencias: string[];

  /** Observaciones adicionales (máx 500 caracteres) */
  observaciones: string;
}

