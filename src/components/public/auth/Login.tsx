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
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Servicios
import { login, isLoggedIn } from './services/login.service';

// Helpers
import { isUserAuthenticated } from '../../../helper/navigation/navigation.helper';
import { showSuccess, showError, showWarning } from '../../../helper/notification/notification.helper';
import { sanitizeInput, recordFailedAttempt, clearFailedAttempts, generateCSRFToken, validateCSRFToken } from '../../../helper/security/security.helper';
import { logInfo, logAuth } from '../../../helper/log/logger.helper';

// Interfaces
import type {
  LoginFormData,
  LoginState,
  LoginErrorType,
  FieldValidationErrors,
  FormValidationResult,
  LoginTiming
} from '../../../interfaces/components/login.interface';

// =====================================================
// CONSTANTES Y CONFIGURACIÓN
// =====================================================


/**
 * Tiempos para animaciones y efectos
 */
const TIMING: LoginTiming = {
  shakeAnimation: 500,
  redirectDelay: 1000
};

/**
 * Esquema de validación Zod
 */
const loginValidationSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .max(254, 'Correo electrónico muy largo'),

  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/, 'La contraseña debe contener al menos un carácter especial')
});

/**
 * Mensajes de error por tipo
 */
const ERROR_MESSAGES: Record<LoginErrorType, string> = {
  INVALID_CREDENTIALS: 'Correo electrónico o contraseña incorrectos. Verifica tus datos.',
  NETWORK_ERROR: 'Error de conexión a internet. Verifica tu conectividad.',
  SERVER_ERROR: 'Error del servidor. Por favor, intenta más tarde.',
  EMAIL_VALIDATION_ERROR: 'El formato del correo electrónico no es válido.',
  PASSWORD_VALIDATION_ERROR: 'La contraseña no cumple con los requisitos de seguridad.',
  ACCOUNT_LOCKED: 'Cuenta bloqueada temporalmente por múltiples intentos fallidos.',
  RATE_LIMITED: 'Demasiados intentos de inicio de sesión. Espera unos minutos.',
  CSRF_ERROR: 'Error de seguridad detectado. Por favor, recarga la página.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado. Intenta nuevamente más tarde.'
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
  return `${baseClasses} ${hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-[var(--color-iph-primary)]'}`;
};

// =====================================================
// HOOK PRINCIPAL DE LÓGICA
// =====================================================

/**
 * Hook personalizado para manejar toda la lógica del login
 */
const useLoginLogic = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState<LoginState>({
    formData: {
      email: '',
      password: ''
    },
    isLoading: false,
    isRedirecting: false,
    error: null,
    fieldErrors: {},
    csrfToken: generateCSRFToken()
  });

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
  }, []);

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
      }
    });

    return { isValid: false, errors: fieldErrors, globalError };
  }, [state.formData]);

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const emailForTracking = state.formData.email || 'unknown';

    // Verificar si está bloqueada la cuenta (función async desde SecurityHelper v2)
    // if (await isAccountLocked(emailForTracking)) {
    //   const remainingTime = getLockoutTimeRemaining(emailForTracking);
    //   showError(`Cuenta bloqueada temporalmente. Espera ${remainingTime} minutos antes de intentar nuevamente.`, 'Acceso Restringido');
    //   return;
    // }

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
        correo_electronico: state.formData.email,
        password: state.formData.password
      });

      // Login exitoso
      logInfo('LoginComponent', 'Login exitoso');

      // Limpiar intentos fallidos
      clearFailedAttempts(emailForTracking);

      showSuccess('¡Bienvenido! Has iniciado sesión correctamente.');

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
          email: 'Correo electrónico o contraseña incorrectos',
          password: 'Correo electrónico o contraseña incorrectos'
        }
      }));

      showError(errorMessage || ERROR_MESSAGES.INVALID_CREDENTIALS, 'Error de Autenticación');

      logAuth('login_failed', false, {
        email: emailForTracking,
        error: errorMessage
      });
    }
  }, [state.formData, state.csrfToken, navigate, validateForm]);

  /**
   * Verifica autenticación al cargar
   */
  const checkAuthentication = useCallback(async () => {
    const hasCacheSession = await isLoggedIn();

    if (hasCacheSession && isUserAuthenticated()) {
      logInfo('LoginComponent', 'Usuario ya autenticado, redirigiendo');
      showWarning('Ya tienes una sesión activa. Te estamos redirigiendo...');
      navigate('/inicio');
    }
  }, [navigate]);

  return {
    state,
    showPassword,
    setShowPassword,
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
  const { state, showPassword, setShowPassword, updateFormData, handleSubmit, checkAuthentication } = useLoginLogic();

  // Verificar autenticación al montar
  useEffect(() => {
    void checkAuthentication();
  }, [checkAuthentication]);

  const { formData, isLoading, isRedirecting, fieldErrors } = state;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-poppins bg-[var(--color-iph-background)]">
      <div className="max-w-md w-full p-8 rounded shadow-md text-center bg-[var(--color-iph-background)]">

        {/* Logo */}
        <div className="mb-7">
          <img
            src='src/assets/images/fides.png'
            alt="Logo IPH"
            className="mx-auto mb-4"
          />
        </div>

        <hr className="border-t border-2 mb-6 mx-auto border-[var(--color-iph-primary)]" />

        {/* Título */}
        <h1 className="text-3xl font-bold mb-2 text-[var(--color-iph-primary)]">
          Inicio de sesión
        </h1>
        <p className="mb-6 text-[var(--color-iph-primary)]">
          {isRedirecting ? 'Redirigiendo...' : 'Introduce tus datos para continuar'}
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>

          {/* Campo Email */}
          <div>
            <label className="block mb-1 text-sm font-bold text-[var(--color-iph-secondary)]">
              Introduce tu correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="correo@ejemplo.com"
              className={getInputClasses(!!fieldErrors.email)}
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
            <label className="block mb-1 text-sm font-bold text-[var(--color-iph-secondary)]">
              Introduce tu contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData({ password: e.target.value })}
                className={getInputClasses(!!fieldErrors.password)}
                disabled={isLoading || isRedirecting}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-[var(--color-iph-primary)] transition-colors duration-200 disabled:opacity-50 hover:cursor-pointer"
                disabled={isLoading || isRedirecting}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            className="w-full py-2 mt-4 text-white font-bold rounded transition bg-[var(--color-iph-primary)] hover:bg-[var(--color-iph-secondary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-iph-primary)] flex items-center justify-center gap-2 cursor-pointer"
            disabled={isLoading || isRedirecting}
          >
            {(isLoading || isRedirecting) && <LoadingSpinner size="small" />}
            {isRedirecting
              ? 'Redirigiendo...'
              : isLoading
                ? 'Iniciando sesión...'
                : 'Ingresar'
            }
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;