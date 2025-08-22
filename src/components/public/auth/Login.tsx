/**
 * Componente Login - Refactorizado con TypeScript y medidas de seguridad
 * 
 * CARACTERÍSTICAS:
 * - Interfaz visual mejorada con animaciones
 * - Validación robusta con Zod
 * - Medidas de seguridad (rate limiting, CSRF, sanitización)
 * - Sistema de notificaciones integrado
 * - Navegación simplificada (todos los roles → /inicio)
 * - Logging completo de eventos
 * - Manejo de errores robusto
 * 
 * @author Equipo IPH
 * @version 2.0.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Assets
import iphLogin from '../../../assets/iph/iphLogin.png';

// Servicios
import { login, isLoggedIn } from '../../../services/user/login.service';

// Helpers
import { isUserAuthenticated } from '../../../helper/navigation/navigation.helper';
import { showSuccess, showError, showWarning } from '../../../helper/notification/notification.helper';
import { 
  sanitizeInput, 
  recordFailedAttempt, 
  isAccountLocked,
  getLockoutTimeRemaining,
  clearFailedAttempts,
  generateCSRFToken,
  validateCSRFToken 
} from '../../../helper/security/security.helper';
import { logInfo, logAuth } from '../../../helper/log/logger.helper';

// Interfaces
import type { 
  LoginFormData, 
  LoginState, 
  LoginErrorType,
  FieldValidationErrors,
  FormValidationResult,
  LoginThemeColors,
  LoginTiming
} from '../../../interfaces/components/login.interface';

// =====================================================
// CONSTANTES Y CONFIGURACIÓN
// =====================================================

/**
 * Colores del tema - mantiene consistencia visual
 */
const THEME_COLORS: LoginThemeColors = {
  primary: '#4d4725',
  background: '#f8f0e7',
  border: '#cec7b2',
  textSecondary: '#76715e',
  buttonPrimary: '#948b54',
  buttonHover: '#5e5531'
};

/**
 * Tiempos para animaciones y efectos
 */
const TIMING: LoginTiming = {
  shakeAnimation: 500,
  redirectDelay: 1000
};

/**
 * Esquema de validación Zod - Robusto pero no extremo
 */
const loginValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email({ message: 'Formato de correo electrónico inválido' })
    .max(254, 'Correo electrónico muy largo'),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'La contraseña debe contener al menos un carácter especial'),
  
  agreeTerms: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar los Términos y Condiciones')
});

/**
 * Mensajes de error por tipo
 */
const ERROR_MESSAGES: Record<LoginErrorType, string> = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos. Verifica tus datos.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
  EMAIL_VALIDATION_ERROR: 'El correo electrónico no es válido.',
  PASSWORD_VALIDATION_ERROR: 'La contraseña no cumple los requisitos.',
  TERMS_NOT_ACCEPTED: 'Debes aceptar los Términos y Condiciones.',
  ACCOUNT_LOCKED: 'Cuenta bloqueada temporalmente por intentos fallidos.',
  RATE_LIMITED: 'Demasiados intentos. Espera antes de volver a intentar.',
  CSRF_ERROR: 'Error de seguridad. Recarga la página.',
  UNKNOWN_ERROR: 'Error inesperado. Intenta más tarde.'
};

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

/**
 * Spinner de carga reutilizable
 */
const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white border-t-transparent`} />
  );
};

// =====================================================
// FUNCIONES HELPER
// =====================================================

/**
 * Genera clases CSS para inputs con estado de error
 */
const getInputClasses = (hasError: boolean): string => {
  const baseClasses = 'w-full px-4 py-2 rounded border bg-white focus:outline-none focus:ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  return `${baseClasses} ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`;
};

/**
 * Genera clases CSS para checkbox con estado de error
 */
const getCheckboxClasses = (hasError: boolean): string => {
  const baseClasses = 'mt-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  return `${baseClasses} ${hasError ? 'ring-2 ring-red-500 ring-offset-1' : ''}`;
};

// =====================================================
// HOOK PRINCIPAL DE LÓGICA
// =====================================================

/**
 * Hook personalizado para manejar toda la lógica del login
 */
const useLoginLogic = () => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<LoginState>({
    formData: {
      email: '',
      password: '',
      agreeTerms: false
    },
    isLoading: false,
    isRedirecting: false,
    error: null,
    fieldErrors: {},
    csrfToken: generateCSRFToken()
  });

  const [isShaking, setIsShaking] = useState(false);

  /**
   * Actualiza datos del formulario y limpia errores
   */
  const updateFormData = useCallback((updates: Partial<LoginFormData>) => {
    setState(prev => {
      const newFieldErrors = { ...prev.fieldErrors };
      
      // Limpiar errores de los campos actualizados
      Object.keys(updates).forEach(key => {
        if (key in newFieldErrors) {
          delete newFieldErrors[key as keyof FieldValidationErrors];
        }
      });

      // Sanitizar inputs
      const sanitizedUpdates = { ...updates };
      if (updates.email) {
        sanitizedUpdates.email = sanitizeInput(updates.email);
      }

      return {
        ...prev,
        formData: { ...prev.formData, ...sanitizedUpdates },
        fieldErrors: newFieldErrors,
        error: null
      };
    });

    if (isShaking) {
      setIsShaking(false);
    }
  }, [isShaking]);

  /**
   * Valida el formulario con Zod
   */
  const validateForm = useCallback((): FormValidationResult => {
    const result = loginValidationSchema.safeParse(state.formData);
    
    if (result.success) {
      return { isValid: true, errors: {} };
    }

    const fieldErrors: FieldValidationErrors = {};
    let globalError: LoginErrorType | undefined;

    result.error.issues.forEach(issue => {
      const field = issue.path[0] as keyof LoginFormData;
      
      if (field === 'email') {
        fieldErrors.email = issue.message;
        if (!globalError) globalError = 'EMAIL_VALIDATION_ERROR';
      } else if (field === 'password') {
        fieldErrors.password = issue.message;
        if (!globalError) globalError = 'PASSWORD_VALIDATION_ERROR';
      } else if (field === 'agreeTerms') {
        fieldErrors.agreeTerms = issue.message;
        if (!globalError) globalError = 'TERMS_NOT_ACCEPTED';
      }
    });

    return { isValid: false, errors: fieldErrors, globalError };
  }, [state.formData]);

  /**
   * Activa animación shake para el checkbox
   */
  const triggerShakeAnimation = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), TIMING.shakeAnimation);
  }, []);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailForTracking = state.formData.email || 'unknown';

    // Verificar si está bloqueada la cuenta
    if (isAccountLocked(emailForTracking)) {
      const remainingTime = getLockoutTimeRemaining(emailForTracking);
      showError(`Cuenta bloqueada. Espera ${remainingTime} minutos.`, 'Acceso Restringido');
      return;
    }

    // Validar CSRF token
    if (state.csrfToken && !validateCSRFToken(state.csrfToken)) {
      showError(ERROR_MESSAGES.CSRF_ERROR, 'Error de Seguridad');
      // Regenerar token
      setState(prev => ({ ...prev, csrfToken: generateCSRFToken() }));
      return;
    }

    // Validar formulario
    const validation = validateForm();
    
    if (!validation.isValid) {
      setState(prev => ({ 
        ...prev, 
        fieldErrors: validation.errors 
      }));

      if (validation.errors.agreeTerms) {
        triggerShakeAnimation();
      }

      if (validation.globalError) {
        showError(ERROR_MESSAGES[validation.globalError], 'Error de Validación');
      }
      
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      fieldErrors: {} 
    }));

    try {
      logAuth('login_attempt', true, { email: emailForTracking });

      // Realizar login con servicio existente
      await login({
        correo: state.formData.email,
        password: state.formData.password
      });

      // Login exitoso
      logInfo('LoginComponent', 'Login exitoso');
      
      // Limpiar intentos fallidos
      clearFailedAttempts(emailForTracking);
      
      showSuccess('¡Bienvenido! Sesión iniciada correctamente.');

      // Navegación simplificada - todos van a inicio
      setState(prev => ({ ...prev, isRedirecting: true }));
      
      setTimeout(() => {
        navigate('/inicio');
      }, TIMING.redirectDelay);

    } catch (error) {
      const errorMessage = (error as Error).message;
      
      // Registrar intento fallido
      recordFailedAttempt(emailForTracking);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        fieldErrors: {
          email: 'Credenciales incorrectas',
          password: 'Credenciales incorrectas'
        }
      }));

      showError(errorMessage || ERROR_MESSAGES.INVALID_CREDENTIALS, 'Error de Autenticación');
      
      logAuth('login_failed', false, { 
        email: emailForTracking,
        error: errorMessage
      });
    }
  }, [state.formData, state.csrfToken, navigate, validateForm, triggerShakeAnimation]);

  /**
   * Verifica autenticación al cargar
   */
  const checkAuthentication = useCallback(() => {
    if (isLoggedIn() && isUserAuthenticated()) {
      logInfo('LoginComponent', 'Usuario ya autenticado, redirigiendo');
      showWarning('Ya tienes una sesión activa. Redirigiendo...');
      navigate('/inicio');
    }
  }, [navigate]);

  return {
    state,
    isShaking,
    updateFormData,
    handleSubmit,
    checkAuthentication
  };
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

/**
 * Componente principal de Login
 */
const Login: React.FC = () => {
  const { state, isShaking, updateFormData, handleSubmit, checkAuthentication } = useLoginLogic();

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const { formData, isLoading, isRedirecting, fieldErrors } = state;

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 font-poppins"
      style={{ backgroundColor: THEME_COLORS.background }}
    >
      <div 
        className="max-w-md w-full p-8 rounded shadow-md text-center"
        style={{ backgroundColor: THEME_COLORS.background }}
      >
        
        {/* Logo */}
        <div className="mb-6">
          <img 
            src={iphLogin} 
            alt="Logo IPH" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-4" 
          />
        </div>

        <hr 
          className="border-t border-2 mb-6 mx-auto"
          style={{ borderColor: THEME_COLORS.border }}
        />

        {/* Título */}
        <h1 
          className="text-3xl font-bold mb-2"
          style={{ color: THEME_COLORS.primary }}
        >
          IPH
        </h1>
        <p 
          className="mb-6"
          style={{ color: THEME_COLORS.primary }}
        >
          {isRedirecting ? 'Redirigiendo...' : 'Introduce tus datos para continuar'}
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
          
          {/* Campo Email */}
          <div>
            <label 
              className="block mb-1 text-sm font-bold"
              style={{ color: THEME_COLORS.textSecondary }}
            >
              Introduce tu correo electrónico
            </label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="correo@ejemplo.com" 
              className={getInputClasses(!!fieldErrors.email)}
              style={{
                ...(!fieldErrors.email && {
                  '--tw-ring-color': THEME_COLORS.primary
                } as React.CSSProperties)
              }}
              disabled={isLoading || isRedirecting}
              autoComplete="email"
              autoCapitalize="none"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label 
              className="block mb-1 text-sm font-bold"
              style={{ color: THEME_COLORS.textSecondary }}
            >
              Introduce tu contraseña
            </label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => updateFormData({ password: e.target.value })}
              className={getInputClasses(!!fieldErrors.password)}
              style={{
                ...(!fieldErrors.password && {
                  '--tw-ring-color': THEME_COLORS.primary
                } as React.CSSProperties)
              }}
              disabled={isLoading || isRedirecting}
              autoComplete="current-password"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Términos y Condiciones */}
          <div className={`flex items-start gap-2 text-sm transition-transform duration-200 ${
            isShaking ? 'animate-pulse' : ''
          }`}>
            <input 
              type="checkbox" 
              checked={formData.agreeTerms} 
              onChange={(e) => updateFormData({ agreeTerms: e.target.checked })}
              className={getCheckboxClasses(!!fieldErrors.agreeTerms)}
              style={{
                accentColor: THEME_COLORS.primary
              }}
              disabled={isLoading || isRedirecting}
            />
            <div>
              <label 
                className="font-bold transition-colors duration-200 cursor-pointer"
                style={{ 
                  color: fieldErrors.agreeTerms ? '#dc2626' : THEME_COLORS.primary
                }}
              >
                Estoy de acuerdo con los Términos y Condiciones y la Política de Privacidad
              </label>
              {fieldErrors.agreeTerms && (
                <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.agreeTerms}</p>
              )}
            </div>
          </div>

          {/* Botón Submit */}
          <button 
            type="submit" 
            className="w-full py-2 mt-4 text-white font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: THEME_COLORS.buttonPrimary
            }}
            onMouseEnter={(e) => {
              if (!isLoading && !isRedirecting) {
                e.currentTarget.style.backgroundColor = THEME_COLORS.buttonHover;
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && !isRedirecting) {
                e.currentTarget.style.backgroundColor = THEME_COLORS.buttonPrimary;
              }
            }}
            disabled={isLoading || isRedirecting}
          >
            {(isLoading || isRedirecting) && <LoadingSpinner size="small" />}
            {isRedirecting 
              ? 'Redirigiendo...' 
              : isLoading 
                ? 'Iniciando sesión...' 
                : 'Iniciar Sesión'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;