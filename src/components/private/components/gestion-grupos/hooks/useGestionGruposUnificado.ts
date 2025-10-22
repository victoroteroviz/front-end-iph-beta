/**
 * @fileoverview Hook unificado para gestión de grupos con datos de usuario-grupo API
 * @version 2.0.0
 * @description Hook que usa la API de usuario-grupo para obtener grupos con información de usuarios
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

//+ Custom Hooks
import { useDebounce } from './useDebounce';
import { useNavigationHistory } from './useNavigationHistory';

//+ Interfaces
import type {
  IGrupo,
  IGrupoFormData,
  IUpdateGrupoRequest,
  IGrupoFilters
} from '../../../../../interfaces/grupos';

import type {
  IGrupoUsuario
} from '../../../../../interfaces/usuario-grupo';

//+ Servicios
import {
  createGrupo,
  updateGrupo,
  deleteGrupo
} from '../services/grupos.service';

import {
  obtenerUsuariosPorGrupo
} from '../services/usuario-grupo.service';

//+ Helpers
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError } from '../../../../../helper/notification/notification.helper';

//+ Control de roles
import { canAccessAdmin, canAccessSuperior } from '../../../../../config/permissions.config';

/**
 * Tipos para el estado del hook
 */
export type VistaGrupo = 'lista' | 'formulario';

interface IGrupoFormState {
  nombre: string;
  descripcion: string;
  errors: {
    nombre?: string;
    descripcion?: string;
  };
}

interface IEstadisticasGrupos {
  totalGrupos: number;
  gruposActivos: number;
  gruposInactivos: number;
}

/**
 * Interface para el valor de retorno del hook
 */
interface UseGestionGruposUnificadoReturn {
  // Estados
  grupos: IGrupoUsuario[];
  gruposFiltrados: IGrupoUsuario[];
  vistaActual: VistaGrupo;
  grupoSeleccionado: IGrupo | null;
  formulario: IGrupoFormState;
  filtros: IGrupoFilters;
  estadisticas: IEstadisticasGrupos;

  // Estados de carga
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Permisos
  permisos: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
  };

  // Acciones
  loadGrupos: () => Promise<void>;
  handleCreateGrupo: () => Promise<void>;
  handleUpdateGrupo: (id: string) => Promise<void>;
  handleDeleteGrupo: (id: string) => Promise<void>;
  setVistaActual: (vista: VistaGrupo) => void;
  selectGrupo: (grupo: IGrupo) => void;
  updateFormulario: (field: keyof IGrupoFormState, value: string) => void;
  updateFiltros: (newFiltros: Partial<IGrupoFilters>) => void;
  resetFormulario: () => void;
  validateForm: () => boolean;

  // Navegación
  navigateToFormulario: (grupo?: IGrupo) => void;
  navigateToLista: () => void;
  goBack: () => void;
  scrollToTop: (smooth?: boolean) => void;
}

/**
 * Hook unificado para gestión de grupos
 */
export const useGestionGruposUnificado = (): UseGestionGruposUnificadoReturn => {
  // Estados principales
  const [grupos, setGrupos] = useState<IGrupoUsuario[]>([]);
  const [vistaActual, setVistaActual] = useState<VistaGrupo>('lista');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<IGrupo | null>(null);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado del formulario
  const [formulario, setFormulario] = useState<IGrupoFormState>({
    nombre: '',
    descripcion: '',
    errors: {}
  });

  // Estado de filtros
  const [filtros, setFiltros] = useState<IGrupoFilters>({
    search: '',
    isActive: true
  });

  // Debounce para la búsqueda
  const debouncedSearch = useDebounce(filtros.search, 300);

  // Hook de navegación
  const { pushNavigation, goBack, scrollToTop } = useNavigationHistory({
    onNavigateBack: () => {
      // Callback personalizado cuando se usa la flecha anterior del navegador
      setVistaActual('lista');
      resetFormulario();
      scrollToTop();
    },
    enableBrowserNavigation: true,
    scrollToTopOnNavigation: true
  });

  // Control de permisos
  const permisos = useMemo(() => {
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');

    return {
      canCreate: canAccessAdmin(userRoles),
      canEdit: canAccessAdmin(userRoles),
      canDelete: canAccessAdmin(userRoles),
      canView: canAccessSuperior(userRoles)
    };
  }, []);

  // Funciones básicas (declaradas antes de las funciones de navegación)
  // Seleccionar grupo para vista/edición
  const selectGrupo = useCallback((grupo: IGrupo) => {
    setGrupoSeleccionado(grupo);
    setFormulario({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      errors: {}
    });
  }, []);

  // Resetear formulario
  const resetFormulario = useCallback(() => {
    setFormulario({
      nombre: '',
      descripcion: '',
      errors: {}
    });
    setGrupoSeleccionado(null);
  }, []);

  // Funciones de navegación mejoradas (declaradas después de las funciones básicas)
  const navigateToFormulario = useCallback((grupo?: IGrupo) => {
    if (grupo) {
      selectGrupo(grupo);
    } else {
      resetFormulario();
    }

    setVistaActual('formulario');

    // Agregar al historial de navegación
    pushNavigation({
      view: 'formulario',
      grupoId: grupo?.id || null,
      formData: grupo ? { nombre: grupo.nombre, descripcion: grupo.descripcion } : null
    }, grupo ? `Editar Grupo: ${grupo.nombre}` : 'Nuevo Grupo');
  }, [selectGrupo, resetFormulario, pushNavigation]);

  const navigateToLista = useCallback(() => {
    setVistaActual('lista');
    resetFormulario();

    // Agregar al historial de navegación
    pushNavigation({
      view: 'lista'
    }, 'Lista de Grupos');
  }, [resetFormulario, pushNavigation]);

  // Grupos filtrados con debounce
  const gruposFiltrados = useMemo(() => {
    let filtered = grupos;

    // Filtrar por búsqueda
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((grupo) =>
        grupo.nombreGrupo.toLowerCase().includes(searchLower) ||
        (grupo.descripcionGrupo && grupo.descripcionGrupo.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado activo
    if (filtros.isActive) {
      filtered = filtered.filter((grupo) => grupo.estatus);
    }

    return filtered;
  }, [grupos, filtros.isActive, debouncedSearch]);

  // Estadísticas calculadas
  const estadisticas = useMemo((): IEstadisticasGrupos => {
    return {
      totalGrupos: grupos.length,
      gruposActivos: grupos.filter((g) => g.estatus).length,
      gruposInactivos: grupos.filter((g) => !g.estatus).length
    };
  }, [grupos]);

  // Cargar grupos desde el servicio de usuario-grupo
  const loadGrupos = useCallback(async () => {
    if (!permisos.canView) {
      showError('No tienes permisos para ver los grupos');
      return;
    }

    setIsLoading(true);
    logInfo('useGestionGruposUnificado', 'Cargando grupos con información de usuarios');

    try {
      const gruposData = await obtenerUsuariosPorGrupo();
      setGrupos(gruposData);
      logInfo('useGestionGruposUnificado', 'Grupos cargados exitosamente', {
        total: gruposData.length,
        totalUsuarios: gruposData.reduce((sum, g) => sum + g.cantidadUsuarios, 0)
      });
    } catch (error) {
      logError('useGestionGruposUnificado', 'Error al cargar grupos', String(error));
      showError(error instanceof Error ? error.message : 'Error al cargar los grupos');
    } finally {
      setIsLoading(false);
    }
  }, [permisos.canView]);

  // Crear nuevo grupo
  const handleCreateGrupo = useCallback(async () => {
    if (!permisos.canCreate) {
      showError('No tienes permisos para crear grupos');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    logInfo('useGestionGruposUnificado', 'Creando nuevo grupo', { nombre: formulario.nombre });

    try {
      const grupoData: IGrupoFormData = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || undefined
      };

      const response = await createGrupo(grupoData);

      if (response.status) {
        showSuccess(response.message);
        resetFormulario();
        navigateToLista();
        await loadGrupos();
        logInfo('useGestionGruposUnificado', 'Grupo creado exitosamente');
      } else {
        showError('Error al crear el grupo');
      }
    } catch (error) {
      logError('useGestionGruposUnificado', 'Error al crear grupo', String(error));
      showError(error instanceof Error ? error.message : 'Error al crear el grupo');
    } finally {
      setIsCreating(false);
    }
  }, [formulario, permisos.canCreate, loadGrupos, navigateToLista]);

  // Actualizar grupo existente
  const handleUpdateGrupo = useCallback(async (id: string) => {
    if (!permisos.canEdit) {
      showError('No tienes permisos para editar grupos');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    logInfo('useGestionGruposUnificado', 'Actualizando grupo', { id, nombre: formulario.nombre });

    try {
      const updateData: IUpdateGrupoRequest = {
        id,
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || undefined
      };

      const response = await updateGrupo(updateData);

      if (response.status) {
        showSuccess(response.message);
        resetFormulario();
        navigateToLista();
        await loadGrupos();
        logInfo('useGestionGruposUnificado', 'Grupo actualizado exitosamente');
      } else {
        showError('Error al actualizar el grupo');
      }
    } catch (error) {
      logError('useGestionGruposUnificado', 'Error al actualizar grupo', String(error));
      showError(error instanceof Error ? error.message : 'Error al actualizar el grupo');
    } finally {
      setIsUpdating(false);
    }
  }, [formulario, permisos.canEdit, loadGrupos, navigateToLista]);

  // Eliminar grupo
  const handleDeleteGrupo = useCallback(async (id: string) => {
    if (!permisos.canDelete) {
      showError('No tienes permisos para eliminar grupos');
      return;
    }

    setIsDeleting(true);
    logInfo('useGestionGruposUnificado', 'Eliminando grupo', { id });

    try {
      const response = await deleteGrupo(id);

      if (response.status) {
        showSuccess(response.message);
        await loadGrupos();
        logInfo('useGestionGruposUnificado', 'Grupo eliminado exitosamente');
      } else {
        showError('Error al eliminar el grupo');
      }
    } catch (error) {
      logError('useGestionGruposUnificado', 'Error al eliminar grupo', String(error));
      showError(error instanceof Error ? error.message : 'Error al eliminar el grupo');
    } finally {
      setIsDeleting(false);
    }
  }, [permisos.canDelete, loadGrupos]);

  // Actualizar campo del formulario
  const updateFormulario = useCallback((field: keyof IGrupoFormState, value: string) => {
    setFormulario((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined
      }
    }));
  }, []);

  // Actualizar filtros
  const updateFiltros = useCallback((newFiltros: Partial<IGrupoFilters>) => {
    setFiltros((prev) => ({
      ...prev,
      ...newFiltros
    }));
  }, []);

  // Validar formulario
  const validateForm = useCallback((): boolean => {
    const errors: IGrupoFormState['errors'] = {};

    if (!formulario.nombre.trim()) {
      errors.nombre = 'El nombre del grupo es requerido';
    } else if (formulario.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formulario.nombre.trim().length > 50) {
      errors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (formulario.descripcion.trim().length > 200) {
      errors.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    setFormulario((prev) => ({
      ...prev,
      errors
    }));

    return Object.keys(errors).length === 0;
  }, [formulario]);


  // Cargar grupos al montar el componente
  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  return {
    // Estados
    grupos,
    gruposFiltrados,
    vistaActual,
    grupoSeleccionado,
    formulario,
    filtros,
    estadisticas,

    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Permisos
    permisos,

    // Acciones
    loadGrupos,
    handleCreateGrupo,
    handleUpdateGrupo,
    handleDeleteGrupo,
    setVistaActual,
    selectGrupo,
    updateFormulario,
    updateFiltros,
    resetFormulario,
    validateForm,

    // Navegación
    navigateToFormulario,
    navigateToLista,
    goBack,
    scrollToTop
  };
};
