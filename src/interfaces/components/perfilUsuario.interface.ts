/**
 * Interfaces para el componente PerfilUsuario
 * Define todos los tipos necesarios para la gestión de perfiles de usuario
 */

import type { 
  IGetUserById, 
  ICreateUser, 
  IUpdateUser 
} from '../user/crud/crud-user.interface';

// =====================================================
// INTERFACES DE CATÁLOGOS
// =====================================================

export interface ICatalogItem {
  id: number;
  nombre: string;
  descripcion?: string;
}

export type IGrado = ICatalogItem;
export type ICargo = ICatalogItem;
export interface IMunicipio extends ICatalogItem {
  estado: {
    id: number;
    nombre: string;
    codigo: string;
  };
}
export interface IAdscripcion extends ICatalogItem {
  institucion: {
    id: number;
    nombre_corto: string;
    nombre_largo: string;
    codigo: string;
  };
}
export type ISexo = ICatalogItem;

// =====================================================
// INTERFACES DE ROLES
// =====================================================

export interface IRol {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface IUserRole {
  id?: number;
  privilegioId: number;
  is_active: boolean;
}

export interface IRolOption {
  value: number;
  label: string;
}

// =====================================================
// INTERFACES DEL FORMULARIO
// =====================================================

export interface IPerfilUsuarioFormData {
  // Datos personales
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  correo: string;
  telefono: string;
  cuip: string;
  cup: string;
  password: string;

  // IDs de catálogos
  gradoId: string;
  cargoId: string;
  municipioId: string;
  adscripcionId: string;
  sexoId: string;

  // Roles
  rolesSeleccionados: IRolOption[];
}

export interface IPerfilUsuarioFormErrors {
  nombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  correo?: string;
  telefono?: string;
  cuip?: string;
  cup?: string;
  password?: string;
  gradoId?: string;
  cargoId?: string;
  municipioId?: string;
  adscripcionId?: string;
  sexoId?: string;
  rolesSeleccionados?: string;
  general?: string;
}

// =====================================================
// INTERFACES DE ESTADO
// =====================================================

export interface IPerfilUsuarioState {
  // Estado del formulario
  formData: IPerfilUsuarioFormData;
  formErrors: IPerfilUsuarioFormErrors;
  touchedFields: Partial<Record<keyof IPerfilUsuarioFormData, boolean>>;

  // Estados de carga
  isLoading: boolean;
  isSubmitting: boolean;
  isCatalogsLoading: boolean;
  
  // Datos de catálogos
  grados: IGrado[];
  cargos: ICargo[];
  municipios: IMunicipio[];
  adscripciones: IAdscripcion[];
  sexos: ISexo[];
  rolesDisponibles: IRol[];
  rolesUsuarios: IUserRole[];
  
  // Estado de la UI
  isEditing: boolean;
  userId?: string;
  permissionsResolved: boolean;
  
  // Control de acceso
  canEdit: boolean;
  canCreate: boolean;
  canViewSensitiveData: boolean;
  isSuperAdmin?: boolean; // Indica si el usuario actual es SuperAdmin
  isEditingSuperAdmin?: boolean; // Indica si el usuario que se está editando es SuperAdmin
  canEditSuperAdmin?: boolean; // Indica si puede editar usuarios SuperAdmin (solo SuperAdmin puede)
}

// =====================================================
// INTERFACES DE PROPS
// =====================================================

export interface IPerfilUsuarioProps {
  userId?: string;
  mode?: 'create' | 'edit' | 'view';
  onSave?: (userData: ICreateUser | IUpdateUser) => void;
  onCancel?: () => void;
  className?: string;
}

export interface IPerfilFormProps {
  formData: IPerfilUsuarioFormData;
  formErrors: IPerfilUsuarioFormErrors;
  catalogData: {
    grados: IGrado[];
    cargos: ICargo[];
    municipios: IMunicipio[];
    adscripciones: IAdscripcion[];
    sexos: ISexo[];
  };
  rolesData: {
    disponibles: IRol[];
    seleccionados: IRolOption[];
  };
  isEditing: boolean;
  isLoading: boolean;
  canEdit: boolean;
  onFormDataChange: (data: Partial<IPerfilUsuarioFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// =====================================================
// INTERFACES DE UTILIDADES
// =====================================================

export interface IUserRoleOperation {
  id?: number;
  id_privilegio?: number;
  privilegioId?: number;
  is_active: boolean;
}

export interface IPerfilUsuarioPayload {
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo_electronico: string;
  telefono: string;
  cuip: string;
  cup: string;
  password_hash?: string;
  gradoId: number;
  cargoId: number;
  municipioId: number;
  adscripcionId: number;
  sexoId: number;
  is_verific: boolean;
  user_roles: IUserRoleOperation[];
}

// =====================================================
// INTERFACES DE VALIDACIÓN
// =====================================================

export interface IValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface IValidationRules {
  [key: string]: IValidationRule;
}

export interface IFormValidationResult {
  isValid: boolean;
  errors: IPerfilUsuarioFormErrors;
  firstErrorField?: string;
}

// =====================================================
// ENUMS Y CONSTANTES
// =====================================================

export const PerfilUsuarioMode = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view'
} as const;

export type PerfilUsuarioMode = typeof PerfilUsuarioMode[keyof typeof PerfilUsuarioMode];

export const PerfilUsuarioPermission = {
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  VIEW_USER: 'view_user',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_SENSITIVE_DATA: 'view_sensitive_data'
} as const;

export type PerfilUsuarioPermission = typeof PerfilUsuarioPermission[keyof typeof PerfilUsuarioPermission];

// =====================================================
// INTERFACES DE RESPUESTA API
// =====================================================

export interface IPerfilUsuarioResponse {
  success: boolean;
  data?: IGetUserById;
  message?: string;
  errors?: string[];
}

export interface ICatalogsResponse {
  grados: IGrado[];
  cargos: ICargo[];
  municipios: IMunicipio[];
  adscripciones: IAdscripcion[];
  sexos: ISexo[];
}

export interface IRolesResponse {
  roles: IRol[];
}

// =====================================================
// INTERFACES DEL HOOK
// =====================================================

export interface IUsePerfilUsuarioReturn {
  // Estado
  state: IPerfilUsuarioState;

  // Funciones de formulario
  updateFormData: (data: Partial<IPerfilUsuarioFormData>) => void;
  updateFormErrors: (errors: Partial<IPerfilUsuarioFormErrors>) => void;
  resetForm: () => void;
  validateForm: () => IFormValidationResult;

  // Funciones de datos
  loadUserData: (userId: string) => Promise<void>;
  loadCatalogs: () => Promise<void>;
  loadRoles: () => Promise<void>;

  // Funciones de acciones
  handleSubmit: () => Promise<void>;
  handleCancel: () => void;
  handleRoleChange: (selectedRoles: IRolOption[]) => void;

  // Utilidades
  isFormValid: boolean;
  hasUnsavedChanges: boolean;
  canSubmit: boolean;

  // Modal de confirmación
  showConfirmationModal: boolean;
  handleConfirmUpdate: () => Promise<void>;
  handleCancelUpdate: () => void;
}