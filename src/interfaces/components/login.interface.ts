/**
 * Interfaces para el componente Login
 * 
 * Define todos los tipos necesarios para:
 * - Datos del formulario
 * - Estados del componente
 * - Manejo de errores
 * - Validaciones con Zod
 */

// Datos del formulario de login
export interface LoginFormData {
  email: string;
  password: string;
  agreeTerms: boolean;
}

// Estados del componente Login
export interface LoginState {
  formData: LoginFormData;
  isLoading: boolean;
  isRedirecting: boolean;
  error: string | null;
  fieldErrors: FieldValidationErrors;
  csrfToken?: string;
}

// Errores específicos por campo
export interface FieldValidationErrors {
  email?: string;
  password?: string;
  agreeTerms?: string;
}

// Tipos de error específicos del Login
export type LoginErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'EMAIL_VALIDATION_ERROR'
  | 'PASSWORD_VALIDATION_ERROR'
  | 'TERMS_NOT_ACCEPTED'
  | 'ACCOUNT_LOCKED'
  | 'RATE_LIMITED'
  | 'CSRF_ERROR'
  | 'UNKNOWN_ERROR';

// Configuración del componente Login
export interface LoginComponentConfig {
  enableSecurityFeatures: boolean;
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

// Props del componente Login (si se necesitan en el futuro)
export interface LoginProps {
  onLoginSuccess?: (userData: any) => void;
  onLoginError?: (error: LoginErrorType, message: string) => void;
  redirectPath?: string;
  config?: Partial<LoginComponentConfig>;
}

// Resultado de validación del formulario
export interface FormValidationResult {
  isValid: boolean;
  errors: FieldValidationErrors;
  globalError?: LoginErrorType;
}

// Hook de lógica del Login - retorno
export interface LoginLogicHook {
  state: LoginState;
  isShaking: boolean;
  updateFormData: (updates: Partial<LoginFormData>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  checkAuthentication: () => void;
}

// Constantes para el tema visual
export interface LoginThemeColors {
  primary: string;
  background: string;
  border: string;
  textSecondary: string;
  buttonPrimary: string;
  buttonHover: string;
}

// Constantes de tiempo para animaciones
export interface LoginTiming {
  shakeAnimation: number;
  redirectDelay: number;
}