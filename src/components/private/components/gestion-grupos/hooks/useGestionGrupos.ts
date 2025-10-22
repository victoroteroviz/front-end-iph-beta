/**
 * @fileoverview Hook personalizado para gestión de grupos
 * @version 1.0.0
 * @description Lógica de negocio separada del componente de gestión de grupos
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

//+ Custom Hooks
import { useDebounce } from './useDebounce';

//+ Interfaces
import type {
  IGrupo,
  IResponseGrupo,
  IGrupoFormData,
  IUpdateGrupoRequest,
  IGrupoFilters
} from '../../../../../interfaces/grupos';

import type {
  IGrupoUsuario,
  IObtenerUsuariosPorGrupo,
  IUsuarioGrupo,
  IAsignarUsuarioGrupoRequest,
  IEstadisticasUsuarioGrupo
} from '../../../../../interfaces/usuario-grupo';

//+ Servicios
import {
  getGrupos,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  filterGrupos
} from '../services/grupos.service';

import {
  obtenerUsuariosPorGrupo,
  obtenerUsuariosGruposPorId,
  asignarUsuarioAGrupo,
  obtenerEstadisticasUsuarioGrupo
} from '../services/usuario-grupo.service';

//+ Helpers
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError, showInfo } from '../../../../../helper/notification/notification.helper';

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
interface UseGestionGruposReturn {
  // Estados
  grupos: IGrupo[];
  gruposFiltrados: IGrupo[];
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
}

/**
 * Hook personalizado para gestión de grupos
 */
export const useGestionGrupos = (): UseGestionGruposReturn => {
  // Estados principales
  const [grupos, setGrupos] = useState<IGrupo[]>([]);
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

  // Debounce para la búsqueda (optimización: evita filtrar en cada tecla)
  const debouncedSearch = useDebounce(filtros.search, 300);

  // Control de permisos (memoizado para evitar recálculos)
  const permisos = useMemo(() => {
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');

    return {
      canCreate: canAccessAdmin(userRoles),
      canEdit: canAccessAdmin(userRoles),
      canDelete: canAccessAdmin(userRoles),
      canView: canAccessSuperior(userRoles)
    };
  }, []);

  // Grupos filtrados con debounce optimizado
  const gruposFiltrados = useMemo(() => {
    return filterGrupos(grupos, { ...filtros, search: debouncedSearch });
  }, [grupos, filtros.isActive, debouncedSearch]);

  // Estadísticas calculadas
  const estadisticas = useMemo((): IEstadisticasGrupos => {
    return {
      totalGrupos: grupos.length,
      gruposActivos: grupos.length, // Todos los grupos del API están activos
      gruposInactivos: 0 // Los inactivos no se retornan del API
    };
  }, [grupos]);

  // Cargar grupos desde el servicio
  const loadGrupos = useCallback(async () => {
    if (!permisos.canView) {
      showError('No tienes permisos para ver los grupos');
      return;
    }

    setIsLoading(true);
    logInfo('useGestionGrupos', 'Cargando grupos');

    try {
      const gruposData = await getGrupos();
      setGrupos(gruposData);
      logInfo('useGestionGrupos', 'Grupos cargados exitosamente', {
        total: gruposData.length
      });
    } catch (error) {
      logError('useGestionGrupos', error, 'Error al cargar grupos');
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
    logInfo('useGestionGrupos', 'Creando nuevo grupo', { nombre: formulario.nombre });

    try {
      const grupoData: IGrupoFormData = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim() || undefined
      };

      const response = await createGrupo(grupoData);

      if (response.status) {
        showSuccess(response.message);
        resetFormulario();
        setVistaActual('lista');
        await loadGrupos(); // Recargar la lista
        logInfo('useGestionGrupos', 'Grupo creado exitosamente');
      } else {
        showError('Error al crear el grupo');
      }
    } catch (error) {
      logError('useGestionGrupos', error, 'Error al crear grupo');
      showError(error instanceof Error ? error.message : 'Error al crear el grupo');
    } finally {
      setIsCreating(false);
    }
  }, [formulario.nombre, permisos.canCreate, loadGrupos]);

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
    logInfo('useGestionGrupos', 'Actualizando grupo', { id, nombre: formulario.nombre });

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
        setVistaActual('lista');
        await loadGrupos(); // Recargar la lista
        logInfo('useGestionGrupos', 'Grupo actualizado exitosamente');
      } else {
        showError('Error al actualizar el grupo');
      }
    } catch (error) {
      logError('useGestionGrupos', error, 'Error al actualizar grupo');
      showError(error instanceof Error ? error.message : 'Error al actualizar el grupo');
    } finally {
      setIsUpdating(false);
    }
  }, [formulario.nombre, permisos.canEdit, loadGrupos]);

  // Eliminar grupo
  // Nota: La confirmación ahora debe manejarse desde el componente usando ConfirmDialog
  const handleDeleteGrupo = useCallback(async (id: string) => {
    if (!permisos.canDelete) {
      showError('No tienes permisos para eliminar grupos');
      return;
    }

    setIsDeleting(true);
    logInfo('useGestionGrupos', 'Eliminando grupo', { id });

    try {
      const response = await deleteGrupo(id);

      if (response.status) {
        showSuccess(response.message);
        await loadGrupos(); // Recargar la lista
        logInfo('useGestionGrupos', 'Grupo eliminado exitosamente');
      } else {
        showError('Error al eliminar el grupo');
      }
    } catch (error) {
      logError('useGestionGrupos', error, 'Error al eliminar grupo');
      showError(error instanceof Error ? error.message : 'Error al eliminar el grupo');
    } finally {
      setIsDeleting(false);
    }
  }, [permisos.canDelete, loadGrupos]);

  // Seleccionar grupo para vista detalle
  const selectGrupo = useCallback((grupo: IGrupo) => {
    setGrupoSeleccionado(grupo);
    // Prellenar formulario si es para edición
    setFormulario({
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      errors: {}
    });
  }, []);

  // Actualizar campo del formulario
  const updateFormulario = useCallback((field: keyof IGrupoFormState, value: string) => {
    setFormulario(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined // Limpiar error al escribir
      }
    }));
  }, []);

  // Actualizar filtros
  const updateFiltros = useCallback((newFiltros: Partial<IGrupoFilters>) => {
    setFiltros(prev => ({
      ...prev,
      ...newFiltros
    }));
  }, []);

  // Resetear formulario
  const resetFormulario = useCallback(() => {
    setFormulario({
      nombre: '',
      descripcion: '',
      errors: {}
    });
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

    // Validación opcional para descripción
    if (formulario.descripcion.trim().length > 200) {
      errors.descripcion = 'La descripción no puede exceder 200 caracteres';
    }

    setFormulario(prev => ({
      ...prev,
      errors
    }));

    return Object.keys(errors).length === 0;
  }, [formulario.nombre, formulario.descripcion]);

  // Cargar grupos al montar el componente
  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  // Limpiar formulario al cambiar de vista
  useEffect(() => {
    if (vistaActual === 'formulario') {
      resetFormulario();
    }
  }, [vistaActual, resetFormulario]);

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
    validateForm
  };
};