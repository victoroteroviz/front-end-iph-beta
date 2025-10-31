/**
 * Hook personalizado para manejo del componente PerfilUsuario
 * Maneja toda la lógica de negocio separada de la presentación
 *
 * @version 2.0.0
 * @since 2024-01-29
 * @updated 2025-01-30
 *
 * @changes v2.0.0
 * - ✅ Validación de roles refactorizada usando helpers centralizados
 * - ✅ Usa isSuperAdmin() e isAdmin() del helper con cache + Zod
 * - ✅ Eliminada lógica manual de parsing de sessionStorage
 * - ✅ Usa getUserRoles() centralizado del role.helper
 * - ✅ Reducción de código en función checkPermissions()
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Servicios
import {
  getUsuarioById,
  createUsuario,
  updateUsuario,
  getCatalogos,
  getRolesDisponibles,
  buildUpdateUserPayload,
  validateCatalogCompleteness
} from '../../usuarios/services/perfil-usuario.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { sanitizeInput } from '../../../../../helper/security/security.helper';
import { getUserRoles } from '../../../../../helper/role/role.helper';
import { isSuperAdmin, isAdmin } from '../../../../../config/permissions.config';
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// Interfaces
import type {
  IPerfilUsuarioState,
  IPerfilUsuarioFormData,
  IPerfilUsuarioFormErrors,
  IUsePerfilUsuarioReturn,
  IFormValidationResult,
  IRolOption,
  IUserRole
} from '../../../../../interfaces/components/perfilUsuario.interface';
import type { 
  ICreateUser, 
  IUpdateUser 
} from '../../../../../interfaces/user/crud/crud-user.interface';

// =====================================================
// ESQUEMAS DE VALIDACIÓN
// =====================================================

// Schema base sin refinements (para poder usar .extend())
const perfilUsuarioBaseSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  primerApellido: z.string()
    .min(2, 'El primer apellido debe tener al menos 2 caracteres')
    .max(50, 'El primer apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  segundoApellido: z.string()
    .min(2, 'El segundo apellido debe tener al menos 2 caracteres')
    .max(50, 'El segundo apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  correo: z.string()
    .email('Formato de correo inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  
  telefono: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .regex(/^[0-9+\-\s\(\)]+$/, 'Formato de teléfono inválido'),
  
  cuip: z.string()
    .max(20, 'El CUIP no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),

  cup: z.string()
    .max(20, 'El CUP no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(12, 'La contraseña debe tener máximo 12 caracteres')
    .refine(
      (password) => !password || (password.match(/[A-Z]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 letras mayúsculas'
    )
    .refine(
      (password) => !password || (password.match(/[0-9]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 números'
    )
    .refine(
      (password) => !password || (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 caracteres especiales'
    )
    .optional()
    .or(z.literal('')),
  
  gradoId: z.string().min(1, 'Debe seleccionar un grado'),
  cargoId: z.string().min(1, 'Debe seleccionar un cargo'),
  municipioId: z.string().min(1, 'Debe seleccionar un municipio'),
  adscripcionId: z.string().min(1, 'Debe seleccionar una adscripción'),
  sexoId: z.string().min(1, 'Debe seleccionar un sexo'),
  
  rolesSeleccionados: z.array(z.object({
    value: z.number(),
    label: z.string()
  })).min(1, 'Debe seleccionar al menos un rol')
});

// Schema para edición (con refinements)
const perfilUsuarioSchema = perfilUsuarioBaseSchema.refine(
  (data) => {
    // Al menos uno de CUIP o CUP debe estar presente y con longitud mínima
    const cuipValid = data.cuip && data.cuip.trim().length >= 8;
    const cupValid = data.cup && data.cup.trim().length >= 8;
    return cuipValid || cupValid;
  },
  {
    message: 'Debe proporcionar al menos un CUIP (mín. 8 chars) o CUP (mín. 8 chars)',
    path: ['cuip'] // El error se mostrará en el campo CUIP
  }
).refine(
  (data) => {
    // Validar formato de CUIP si está presente
    if (data.cuip && data.cuip.trim().length > 0) {
      return data.cuip.trim().length >= 8 && data.cuip.trim().length <= 20;
    }
    return true;
  },
  {
    message: 'El CUIP debe tener entre 8 y 20 caracteres',
    path: ['cuip']
  }
).refine(
  (data) => {
    // Validar formato de CUP si está presente
    if (data.cup && data.cup.trim().length > 0) {
      return data.cup.trim().length >= 8 && data.cup.trim().length <= 20;
    }
    return true;
  },
  {
    message: 'El CUP debe tener entre 8 y 20 caracteres',
    path: ['cup']
  }
);

// Schema para creación (con password requerido y refinements)
const perfilUsuarioCreateSchema = perfilUsuarioBaseSchema.extend({
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(12, 'La contraseña debe tener máximo 12 caracteres')
    .refine(
      (password) => (password.match(/[A-Z]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 letras mayúsculas'
    )
    .refine(
      (password) => (password.match(/[0-9]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 números'
    )
    .refine(
      (password) => (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2,
      'La contraseña debe contener al menos 2 caracteres especiales'
    )
}).refine(
  (data) => {
    // Al menos uno de CUIP o CUP debe estar presente y con longitud mínima
    const cuipValid = data.cuip && data.cuip.trim().length >= 8;
    const cupValid = data.cup && data.cup.trim().length >= 8;
    return cuipValid || cupValid;
  },
  {
    message: 'Debe proporcionar al menos un CUIP (mín. 8 chars) o CUP (mín. 8 chars)',
    path: ['cuip']
  }
).refine(
  (data) => {
    // Validar formato de CUIP si está presente
    if (data.cuip && data.cuip.trim().length > 0) {
      return data.cuip.trim().length >= 8 && data.cuip.trim().length <= 20;
    }
    return true;
  },
  {
    message: 'El CUIP debe tener entre 8 y 20 caracteres',
    path: ['cuip']
  }
).refine(
  (data) => {
    // Validar formato de CUP si está presente
    if (data.cup && data.cup.trim().length > 0) {
      return data.cup.trim().length >= 8 && data.cup.trim().length <= 20;
    }
    return true;
  },
  {
    message: 'El CUP debe tener entre 8 y 20 caracteres',
    path: ['cup']
  }
);

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialFormData: IPerfilUsuarioFormData = {
  nombre: '',
  primerApellido: '',
  segundoApellido: '',
  correo: '',
  telefono: '',
  cuip: '',
  cup: '',
  password: '',
  gradoId: '',
  cargoId: '',
  municipioId: '',
  adscripcionId: '',
  sexoId: '',
  rolesSeleccionados: []
};

const initialState: IPerfilUsuarioState = {
  formData: initialFormData,
  formErrors: {},
  touchedFields: {},
  isLoading: false,
  isSubmitting: false,
  isCatalogsLoading: false,
  grados: [],
  cargos: [],
  municipios: [],
  adscripciones: [],
  sexos: [],
  rolesDisponibles: [],
  rolesUsuarios: [],
  isEditing: false,
  canEdit: false,
  canCreate: false,
  canViewSensitiveData: false
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================

const usePerfilUsuario = (): IUsePerfilUsuarioReturn => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<IPerfilUsuarioState>(initialState);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [originalData, setOriginalData] = useState<IPerfilUsuarioFormData | null>(null);

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================
  // #region 🔐 VALIDACIÓN DE ACCESO v2.0 - Centralizado

  /**
   * Verifica los permisos del usuario para operaciones en perfiles
   * - SuperAdmin y Admin: Pueden crear, editar y ver datos sensibles
   * - Usuario actual: Puede editar su propio perfil
   *
   * @refactored v2.0.0 - Usa helpers centralizados
   * @security Validación Zod + cache 5s + jerarquía automática
   */
  const checkPermissions = useCallback(() => {
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const userRoles = getUserRoles();

    // Determinar permisos basado en roles usando helpers centralizados
    const hasAdminRole = isSuperAdmin(userRoles) || isAdmin(userRoles);
    const isCurrentUser = userData?.id?.toString() === id;

    setState(prev => ({
      ...prev,
      canCreate: hasAdminRole,
      canEdit: hasAdminRole || isCurrentUser,
      canViewSensitiveData: hasAdminRole
    }));

    logInfo('PerfilUsuarioHook', 'Permisos calculados', {
      hasAdminRole,
      isCurrentUser,
      canEdit: hasAdminRole || isCurrentUser
    });
  }, [id]);

  // #endregion

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadCatalogs = useCallback(async () => {
    setState(prev => ({ ...prev, isCatalogsLoading: true }));
    
    try {
      const [catalogsData, rolesData] = await Promise.all([
        getCatalogos(),
        getRolesDisponibles()
      ]);

      // Debug: Log de datos recibidos
      logInfo('PerfilUsuarioHook', 'Datos de catálogos recibidos', {
        grados: catalogsData.grados,
        gradosIsArray: Array.isArray(catalogsData.grados),
        gradosLength: Array.isArray(catalogsData.grados) ? catalogsData.grados.length : 'N/A'
      });

      setState(prev => ({
        ...prev,
        grados: Array.isArray(catalogsData.grados) ? catalogsData.grados : [],
        cargos: Array.isArray(catalogsData.cargos) ? catalogsData.cargos : [],
        municipios: Array.isArray(catalogsData.municipios) ? catalogsData.municipios : [],
        adscripciones: Array.isArray(catalogsData.adscripciones) ? catalogsData.adscripciones : [],
        sexos: Array.isArray(catalogsData.sexos) ? catalogsData.sexos : [],
        rolesDisponibles: Array.isArray(rolesData.roles) ? rolesData.roles : [],
        isCatalogsLoading: false
      }));

      logInfo('PerfilUsuarioHook', 'Catálogos cargados exitosamente');
    } catch (error) {
      logError('PerfilUsuarioHook', error, 'Error al cargar catálogos');
      showError('Error al cargar los datos del formulario', 'Error de Carga');
      setState(prev => ({ ...prev, isCatalogsLoading: false }));
    }
  }, []);

  const loadUserData = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const userData = await getUsuarioById(userId);
      
      // Mapear roles del usuario a formato de react-select
      const rolesSeleccionados: IRolOption[] = userData.user_roles
        ?.filter(r => r.privilegio?.is_active !== false)
        ?.map(r => ({
          value: r.privilegioId || 0,
          label: state.rolesDisponibles.find(rol => rol.id === r.privilegioId)?.nombre || ''
        }))
        ?.filter(rol => rol.label !== '') || [];

      const formDataFromDB = {
        nombre: userData.nombre || '',
        primerApellido: userData.primer_apellido || '',
        segundoApellido: userData.segundo_apellido || '',
        correo: userData.correo_electronico || '',
        telefono: userData.telefono || '',
        cuip: userData.cuip || '',
        cup: userData.cup || '',
        password: '',
        gradoId: userData.grado?.id?.toString() || '',
        cargoId: userData.cargo?.id?.toString() || '',
        municipioId: userData.municipio?.id?.toString() || '',
        adscripcionId: userData.adscripcion?.id?.toString() || '',
        sexoId: userData.sexo?.id?.toString() || '',
        rolesSeleccionados
      };

      // Guardar datos originales para comparación
      setOriginalData(formDataFromDB);

      // Transformar UserRoleGet[] a IUserRole[]
      const rolesTransformados: IUserRole[] = userData.user_roles?.map(role => ({
        id: parseInt(role.id || '0'),
        privilegioId: role.privilegioId || 0,
        is_active: role.privilegio?.is_active || true
      })) || [];

      setState(prev => ({
        ...prev,
        formData: formDataFromDB,
        rolesUsuarios: rolesTransformados,
        isLoading: false,
        isEditing: true
      }));

      logInfo('PerfilUsuarioHook', 'Datos de usuario cargados', { userId });
    } catch (error) {
      logError('PerfilUsuarioHook', error, `Error al cargar usuario ID: ${userId}`);
      showError('Error al cargar los datos del usuario', 'Error de Carga');
      setState(prev => ({ ...prev, isLoading: false }));
      navigate('/usuarios');
    }
  }, [navigate, state.rolesDisponibles]);

  const loadRoles = useCallback(async () => {
    try {
      const rolesData = await getRolesDisponibles();
      setState(prev => ({
        ...prev,
        rolesDisponibles: Array.isArray(rolesData.roles) ? rolesData.roles : []
      }));
      logInfo('PerfilUsuarioService', 'Obteniendo roles disponibles');
    } catch (error) {
      logError('PerfilUsuarioHook', `Error al cargar roles: ${(error as Error).message}`);
    }
  }, []);

  // =====================================================
  // FUNCIONES DE FORMULARIO
  // =====================================================

  const updateFormData = useCallback((data: Partial<IPerfilUsuarioFormData>) => {
    setState(prev => {
      // Marcar campos como tocados
      const newTouchedFields = { ...prev.touchedFields };
      Object.keys(data).forEach(key => {
        newTouchedFields[key as keyof IPerfilUsuarioFormData] = true;
      });

      return {
        ...prev,
        formData: { ...prev.formData, ...data },
        touchedFields: newTouchedFields,
        // Solo limpiar errores de los campos que se están actualizando
        formErrors: {
          ...prev.formErrors,
          ...Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: undefined }), {})
        }
      };
    });
  }, []);

  const updateFormErrors = useCallback((errors: Partial<IPerfilUsuarioFormErrors>) => {
    setState(prev => ({
      ...prev,
      formErrors: { ...prev.formErrors, ...errors }
    }));
  }, []);

  const validateForm = useCallback((): IFormValidationResult => {
    try {
      // Sanitizar datos antes de validar
      const sanitizedData = {
        ...state.formData,
        nombre: sanitizeInput(state.formData.nombre),
        primerApellido: sanitizeInput(state.formData.primerApellido),
        segundoApellido: sanitizeInput(state.formData.segundoApellido),
        correo: sanitizeInput(state.formData.correo),
        telefono: sanitizeInput(state.formData.telefono),
        cuip: sanitizeInput(state.formData.cuip),
        cup: sanitizeInput(state.formData.cup)
      };

      // Seleccionar el schema correcto según el modo
      const schema = state.isEditing ? perfilUsuarioSchema : perfilUsuarioCreateSchema;

      schema.parse(sanitizedData);
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: IPerfilUsuarioFormErrors = {};
        let firstErrorField: string | undefined;

        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (!firstErrorField) firstErrorField = field;
          errors[field as keyof IPerfilUsuarioFormErrors] = err.message;
        });

        return { isValid: false, errors, firstErrorField };
      }

      logError('ValidateForm', 'Error de validación desconocido', String(error));
      return { isValid: false, errors: { general: 'Error de validación desconocido' } };
    }
  }, [state.formData, state.isEditing]);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialFormData,
      formErrors: {},
      touchedFields: {},
      isEditing: false,
      rolesUsuarios: []
    }));
    setOriginalData(null); // Limpiar datos originales
  }, []);

  // =====================================================
  // FUNCIONES DE ACCIONES
  // =====================================================

  const handleSubmit = useCallback(async () => {
    // Verificar permisos
    if (!state.canEdit && !state.canCreate) {
      showWarning('No tienes permisos para realizar esta acción', 'Acceso Denegado');
      return;
    }

    // Validar formulario completo al intentar enviar
    const validation = validateForm();
    if (!validation.isValid) {
      // Al intentar enviar, marcar TODOS los campos como tocados y mostrar TODOS los errores
      const allFieldsTouched: Partial<Record<keyof IPerfilUsuarioFormData, boolean>> = {};
      Object.keys(initialFormData).forEach(key => {
        allFieldsTouched[key as keyof IPerfilUsuarioFormData] = true;
      });

      setState(prev => ({
        ...prev,
        touchedFields: allFieldsTouched,
        formErrors: validation.errors
      }));

      showError('Por favor, corrige los errores en el formulario', 'Datos Inválidos');
      return;
    }

    // Confirmación para actualizaciones
    if (state.isEditing && id) {
      setShowConfirmationModal(true);
      return; // Detener ejecución aquí, continuar en handleConfirmUpdate
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const rolesSeleccionados = state.formData.rolesSeleccionados.map((r) => r.value);

      if (state.isEditing && id) {
        // Validar completitud de catálogos antes del envío
        const catalogValidation = validateCatalogCompleteness(
          state.rolesDisponibles,
          state.rolesUsuarios,
          rolesSeleccionados
        );

        if (!catalogValidation.isComplete) {
          logInfo('PerfilUsuarioHook', 'Advertencias en completitud de catálogos', catalogValidation.warnings);
          // Mostrar advertencias pero continuar (no es bloqueante)
          catalogValidation.warnings.forEach(warning => {
            logInfo('PerfilUsuarioHook', `ADVERTENCIA: ${warning}`);
          });
        }

        // Para actualización - usar la nueva función que maneja roles correctamente
        // MODIFICACIÓN: Ahora pasamos TODOS los roles disponibles para sincronización completa
        const updatePayload = buildUpdateUserPayload(
          state.formData,
          state.rolesUsuarios,
          state.rolesDisponibles
        );

        logInfo('PerfilUsuarioHook', 'Enviando actualización con datos completos', {
          payloadUserRoles: updatePayload.user_roles.length,
          catalogValidation: catalogValidation.info
        });

        await updateUsuario(id, updatePayload);
        showSuccess('Usuario actualizado correctamente', 'Actualización Exitosa');
        logInfo('PerfilUsuarioHook', 'Usuario actualizado con catálogos completos', { id, totalRoles: state.rolesDisponibles.length });
      } else {
        // Para creación
        const createPayload: ICreateUser = {
          nombre: state.formData.nombre,
          primer_apellido: state.formData.primerApellido,
          segundo_apellido: state.formData.segundoApellido,
          correo_electronico: state.formData.correo,
          telefono: state.formData.telefono,
          cuip: state.formData.cuip,
          cup: state.formData.cup,
          password_hash: state.formData.password,
          gradoId: parseInt(state.formData.gradoId),
          cargoId: parseInt(state.formData.cargoId),
          municipioId: parseInt(state.formData.municipioId),
          adscripcionId: parseInt(state.formData.adscripcionId),
          sexoId: parseInt(state.formData.sexoId),
          is_verific: true,
          roles: rolesSeleccionados
        };
        await createUsuario(createPayload);
        showSuccess('Usuario creado correctamente', 'Creación Exitosa');
        logInfo('PerfilUsuarioHook', 'Usuario creado');
      }

      navigate('/usuarios');
    } catch (error) {
      const errorMessage = (error as Error).message;
      logError('PerfilUsuarioHook', `Error al guardar usuario: ${(error as Error).message}`);
      
      // Intentar parsear mensaje de error del backend
      try {
        const parsed = JSON.parse(errorMessage);
        const mensaje = Array.isArray(parsed.message) 
          ? parsed.message.join('\n') 
          : parsed.message;
        showError(mensaje, 'Error al Guardar');
      } catch {
        showError(errorMessage || 'Error desconocido al guardar', 'Error al Guardar');
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state, id, validateForm, updateFormErrors, navigate]);

  // Funciones específicas para el modal de confirmación
  const handleConfirmUpdate = useCallback(async () => {
    setShowConfirmationModal(false);
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (state.isEditing && id) {
        const rolesSeleccionados = state.formData.rolesSeleccionados.map((r) => r.value);

        // Validar completitud de catálogos antes del envío
        const catalogValidation = validateCatalogCompleteness(
          state.rolesDisponibles,
          state.rolesUsuarios,
          rolesSeleccionados
        );

        if (!catalogValidation.isComplete) {
          logInfo('PerfilUsuarioHook', 'Advertencias en completitud de catálogos (modal)', catalogValidation.warnings);
          catalogValidation.warnings.forEach(warning => {
            logInfo('PerfilUsuarioHook', `ADVERTENCIA MODAL: ${warning}`);
          });
        }

        // Para actualización - usar la nueva función que maneja roles correctamente
        // MODIFICACIÓN: Ahora pasamos TODOS los roles disponibles para sincronización completa
        const updatePayload = buildUpdateUserPayload(
          state.formData,
          state.rolesUsuarios,
          state.rolesDisponibles
        );

        logInfo('PerfilUsuarioHook', 'Enviando actualización con datos completos desde modal', {
          payloadUserRoles: updatePayload.user_roles.length,
          catalogValidation: catalogValidation.info
        });

        await updateUsuario(id, updatePayload);
        showSuccess('Usuario actualizado correctamente', 'Actualización Exitosa');
        logInfo('PerfilUsuarioHook', 'Usuario actualizado con catálogos completos desde modal', { id, totalRoles: state.rolesDisponibles.length });
        navigate('/usuarios');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      logError('PerfilUsuarioHook', `Error al actualizar usuario: ${(error as Error).message}`);

      // Intentar parsear mensaje de error del backend
      try {
        const parsed = JSON.parse(errorMessage);
        const mensaje = Array.isArray(parsed.message)
          ? parsed.message.join('\n')
          : parsed.message;
        showError(mensaje, 'Error al Actualizar');
      } catch {
        showError(errorMessage || 'Error desconocido al actualizar', 'Error al Actualizar');
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state, id, navigate]);

  const handleCancelUpdate = useCallback(() => {
    setShowConfirmationModal(false);
    logInfo('PerfilUsuarioHook', 'Actualización cancelada por el usuario', { id });
  }, [id]);

  const handleCancel = useCallback(() => {
    navigate('/usuarios');
  }, [navigate]);

  const handleRoleChange = useCallback((selectedRoles: IRolOption[]) => {
    updateFormData({ rolesSeleccionados: selectedRoles });
  }, [updateFormData]);

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (id && state.rolesDisponibles.length > 0) {
      loadUserData(id);
    }
  }, [id, loadUserData, state.rolesDisponibles.length]);

  // =====================================================
  // VALIDACIÓN DEBOUNCED
  // =====================================================

  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Solo validar si hay campos tocados
    const hasTouchedFields = Object.keys(state.touchedFields).length > 0;
    if (!hasTouchedFields) return;

    // Limpiar timeout anterior
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Programar nueva validación después de 500ms de inactividad
    validationTimeoutRef.current = setTimeout(() => {
      const validation = validateForm();

      // Solo mostrar errores para campos que han sido tocados
      const filteredErrors: IPerfilUsuarioFormErrors = {};
      Object.entries(validation.errors).forEach(([field, error]) => {
        if (state.touchedFields[field as keyof IPerfilUsuarioFormData]) {
          filteredErrors[field as keyof IPerfilUsuarioFormErrors] = error;
        }
      });

      if (JSON.stringify(filteredErrors) !== JSON.stringify(state.formErrors)) {
        updateFormErrors(filteredErrors);
      }
    }, 500);

    // Cleanup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [state.formData, state.touchedFields, validateForm, state.formErrors, updateFormErrors]);

  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  const isFormValid = useMemo(() => {
    // Para canSubmit, necesitamos validar TODO el formulario, no solo campos tocados
    const validation = validateForm();
    const hasErrors = !validation.isValid;

    // Solo loggear cuando hay cambios significativos
    if (hasErrors !== !hasErrors) {
      logInfo('FormValidation', 'Estado de validación para submit cambió', JSON.stringify({
        hasErrors,
        errorsCount: Object.keys(validation.errors).length
      }));
    }

    return !hasErrors;
  }, [validateForm]);

  // Función para comparar roles (arrays de objetos)
  const compareRoles = (current: IRolOption[], original: IRolOption[]) => {
    if (current.length !== original.length) return false;

    const currentSorted = [...current].sort((a, b) => a.value - b.value);
    const originalSorted = [...original].sort((a, b) => a.value - b.value);

    return currentSorted.every((role, index) =>
      role.value === originalSorted[index]?.value
    );
  };

  const hasUnsavedChanges = useMemo(() => {
    // Para modo creación, comparar con datos iniciales vacíos
    if (!state.isEditing || !originalData) {
      return JSON.stringify(state.formData) !== JSON.stringify(initialFormData);
    }

    // Para modo edición, comparar con datos originales de la DB
    const current = state.formData;
    const original = originalData;

    // Comparar campos básicos (excluyendo password y roles)
    const basicFieldsChanged =
      current.nombre !== original.nombre ||
      current.primerApellido !== original.primerApellido ||
      current.segundoApellido !== original.segundoApellido ||
      current.correo !== original.correo ||
      current.telefono !== original.telefono ||
      current.cuip !== original.cuip ||
      current.cup !== original.cup ||
      current.gradoId !== original.gradoId ||
      current.cargoId !== original.cargoId ||
      current.municipioId !== original.municipioId ||
      current.adscripcionId !== original.adscripcionId ||
      current.sexoId !== original.sexoId;

    // Comparar roles
    const rolesChanged = !compareRoles(current.rolesSeleccionados, original.rolesSeleccionados);

    const hasChanges = basicFieldsChanged || rolesChanged;

    // Debug temporal para verificar comparación
    console.log('🔄 Comparación de cambios:', {
      basicFieldsChanged,
      rolesChanged,
      hasChanges,
      currentRolesCount: current.rolesSeleccionados.length,
      originalRolesCount: original.rolesSeleccionados.length
    });

    return hasChanges;
  }, [state.formData, state.isEditing, originalData]);

  const canSubmit = useMemo(() => {
    const conditions = {
      isFormValid,
      notSubmitting: !state.isSubmitting,
      notLoading: !state.isLoading,
      hasPermissions: state.canEdit || state.canCreate,
      catalogsLoaded: !state.isCatalogsLoading,
      hasChanges: hasUnsavedChanges // Nueva condición: debe haber cambios reales
    };

    const result = conditions.isFormValid &&
                   conditions.notSubmitting &&
                   conditions.notLoading &&
                   conditions.hasPermissions &&
                   conditions.catalogsLoaded &&
                   conditions.hasChanges; // Agregar condición de cambios

    // Solo loggear cambios significativos en canSubmit
    if (result !== (state as any)._lastCanSubmit) {
      logInfo('CanSubmit', 'Estado del botón cambió', JSON.stringify({
        canSubmit: result,
        ...conditions
      }));
    }

    return result;
  }, [isFormValid, state.isSubmitting, state.isLoading, state.canEdit, state.canCreate, state.isCatalogsLoading, hasUnsavedChanges]);

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    state,
    updateFormData,
    updateFormErrors,
    resetForm,
    validateForm,
    loadUserData,
    loadCatalogs,
    loadRoles,
    handleSubmit,
    handleCancel,
    handleRoleChange,
    isFormValid,
    hasUnsavedChanges,
    canSubmit,
    // Modal de confirmación
    showConfirmationModal,
    handleConfirmUpdate,
    handleCancelUpdate
  };
};

export default usePerfilUsuario;