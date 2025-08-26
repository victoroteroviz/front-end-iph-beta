/**
 * Hook personalizado para manejo del componente PerfilUsuario
 * Maneja toda la lógica de negocio separada de la presentación
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Servicios
import { 
  getUsuarioById, 
  createUsuario, 
  updateUsuario,
  getCatalogos,
  getRolesDisponibles,
  buildUserPayload
} from '../../../../../services/perfil-usuario/perfil-usuario.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { sanitizeInput } from '../../../../../helper/security/security.helper';
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// Interfaces
import type { 
  IPerfilUsuarioState,
  IPerfilUsuarioFormData,
  IPerfilUsuarioFormErrors,
  IUsePerfilUsuarioReturn,
  IFormValidationResult,
  IRolOption,
  PerfilUsuarioMode
} from '../../../../../interfaces/components/perfilUsuario.interface';

// =====================================================
// ESQUEMAS DE VALIDACIÓN
// =====================================================

const perfilUsuarioSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  primerApellido: z.string()
    .min(2, 'El primer apellido debe tener al menos 2 caracteres')
    .max(50, 'El primer apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios'),
  
  segundoApellido: z.string()
    .max(50, 'El segundo apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, 'Solo se permiten letras y espacios')
    .optional(),
  
  correo: z.string()
    .email('Formato de correo inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  
  telefono: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .regex(/^[0-9+\-\s\(\)]+$/, 'Formato de teléfono inválido'),
  
  cuip: z.string()
    .min(8, 'El CUIP debe tener al menos 8 caracteres')
    .max(20, 'El CUIP no puede exceder 20 caracteres'),
  
  cup: z.string()
    .min(8, 'El CUP debe tener al menos 8 caracteres')
    .max(20, 'El CUP no puede exceder 20 caracteres'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional(),
  
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

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================

  const checkPermissions = useCallback(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    const userRoles = userData?.roles || [];
    
    // Determinar permisos basado en roles
    const isSuperAdmin = userRoles.some((role: any) => role.nombre === 'SuperAdmin');
    const isAdmin = userRoles.some((role: any) => role.nombre === 'Administrador');
    const isCurrentUser = userData?.id?.toString() === id;

    setState(prev => ({
      ...prev,
      canCreate: isSuperAdmin || isAdmin,
      canEdit: isSuperAdmin || isAdmin || isCurrentUser,
      canViewSensitiveData: isSuperAdmin || isAdmin
    }));

    logInfo('PerfilUsuarioHook', 'Permisos calculados', {
      isSuperAdmin,
      isAdmin,
      isCurrentUser,
      canEdit: isSuperAdmin || isAdmin || isCurrentUser
    });
  }, [id]);

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

      setState(prev => ({
        ...prev,
        grados: catalogsData.grados,
        cargos: catalogsData.cargos,
        municipios: catalogsData.municipios,
        adscripciones: catalogsData.adscripciones,
        sexos: catalogsData.sexos,
        rolesDisponibles: rolesData.roles,
        isCatalogsLoading: false
      }));

      logInfo('PerfilUsuarioHook', 'Catálogos cargados exitosamente');
    } catch (error) {
      logError('PerfilUsuarioHook', 'Error al cargar catálogos', { error });
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
        ?.filter(r => r.is_active !== false)
        ?.map(r => ({
          value: r.privilegioId,
          label: state.rolesDisponibles.find(rol => rol.id === r.privilegioId)?.nombre || ''
        }))
        ?.filter(rol => rol.label !== '') || [];

      setState(prev => ({
        ...prev,
        formData: {
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
        },
        rolesUsuarios: userData.user_roles || [],
        isLoading: false,
        isEditing: true
      }));

      logInfo('PerfilUsuarioHook', 'Datos de usuario cargados', { userId });
    } catch (error) {
      logError('PerfilUsuarioHook', 'Error al cargar usuario', { userId, error });
      showError('Error al cargar los datos del usuario', 'Error de Carga');
      setState(prev => ({ ...prev, isLoading: false }));
      navigate('/usuarios');
    }
  }, [navigate, state.rolesDisponibles]);

  // =====================================================
  // FUNCIONES DE FORMULARIO
  // =====================================================

  const updateFormData = useCallback((data: Partial<IPerfilUsuarioFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      formErrors: { ...prev.formErrors, ...Object.keys(data).reduce((acc, key) => ({ ...acc, [key]: undefined }), {}) }
    }));
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

      // Validar con esquema - para creación, password es requerido
      const schema = !state.isEditing 
        ? perfilUsuarioSchema
        : perfilUsuarioSchema.extend({ password: z.string().optional() });
        
      schema.parse(sanitizedData);
      
      return { isValid: true, errors: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: IPerfilUsuarioFormErrors = {};
        let firstErrorField: string | undefined;

        error.errors.forEach(err => {
          const field = err.path[0] as string;
          if (!firstErrorField) firstErrorField = field;
          errors[field as keyof IPerfilUsuarioFormErrors] = err.message;
        });

        return { isValid: false, errors, firstErrorField };
      }
      return { isValid: false, errors: { general: 'Error de validación desconocido' } };
    }
  }, [state.formData, state.isEditing]);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialFormData,
      formErrors: {},
      isEditing: false,
      rolesUsuarios: []
    }));
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

    // Validar formulario
    const validation = validateForm();
    if (!validation.isValid) {
      updateFormErrors(validation.errors);
      showError('Por favor, corrige los errores en el formulario', 'Datos Inválidos');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const payload = buildUserPayload(
        state.formData,
        state.rolesUsuarios,
        state.isEditing
      );

      if (state.isEditing && id) {
        await updateUsuario(id, payload);
        showSuccess('Usuario actualizado correctamente', 'Actualización Exitosa');
        logInfo('PerfilUsuarioHook', 'Usuario actualizado', { id });
      } else {
        await createUsuario(payload);
        showSuccess('Usuario creado correctamente', 'Creación Exitosa');
        logInfo('PerfilUsuarioHook', 'Usuario creado');
      }

      navigate('/usuarios');
    } catch (error) {
      const errorMessage = (error as Error).message;
      logError('PerfilUsuarioHook', 'Error al guardar usuario', { error, isEditing: state.isEditing });
      
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
  // VALORES COMPUTADOS
  // =====================================================

  const isFormValid = useMemo(() => {
    const validation = validateForm();
    return validation.isValid;
  }, [validateForm]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(state.formData) !== JSON.stringify(initialFormData);
  }, [state.formData]);

  const canSubmit = useMemo(() => {
    return isFormValid && 
           !state.isSubmitting && 
           !state.isLoading && 
           (state.canEdit || state.canCreate) &&
           !state.isCatalogsLoading;
  }, [isFormValid, state.isSubmitting, state.isLoading, state.canEdit, state.canCreate, state.isCatalogsLoading]);

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
    getRolesDisponibles,
    handleSubmit,
    handleCancel,
    handleRoleChange,
    isFormValid,
    hasUnsavedChanges,
    canSubmit
  };
};

export default usePerfilUsuario;