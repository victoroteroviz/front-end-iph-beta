/**
 * @fileoverview Hook personalizado para gestión de usuarios en grupos
 * @version 1.0.0
 * @description Lógica de negocio para gestión de usuarios y grupos
 */

import { useState, useCallback, useMemo } from 'react';

//+ Interfaces
import type {
  IGrupoUsuario,
  IObtenerUsuariosPorGrupo,
  IUsuarioGrupo,
  IAsignarUsuarioGrupoRequest,
  IEstadisticasUsuarioGrupo,
  IUsuarioGrupoFilters
} from '../../../../../interfaces/usuario-grupo';

//+ Servicios
import {
  obtenerUsuariosPorGrupo,
  obtenerUsuariosGruposPorId,
  asignarUsuarioAGrupo,
  obtenerEstadisticasUsuarioGrupo,
  filtrarGruposUsuarios
} from '../../../../../services/usuario-grupo';

//+ Helpers
import { logInfo, logError } from '../../../../../helper/log/logger.helper';
import { showSuccess, showError } from '../../../../../helper/notification/notification.helper';

//+ Control de roles
import { canAccessAdmin, canAccessSuperior } from '../../../../../config/permissions.config';

/**
 * Tipos para vistas de usuario-grupo
 */
export type VistaUsuarioGrupo = 'grupos-estadisticas' | 'usuarios-grupo' | 'asignar-usuario';

/**
 * Interface para el formulario de asignación
 */
interface IAsignacionFormState {
  usuarioId: string;
  grupoId: string;
  errors: {
    usuarioId?: string;
    grupoId?: string;
  };
}

/**
 * Interface para el valor de retorno del hook
 */
interface UseUsuarioGrupoReturn {
  // Estados principales
  gruposConUsuarios: IGrupoUsuario[];
  gruposFiltrados: IGrupoUsuario[];
  usuariosDelGrupo: IUsuarioGrupo[];
  estadisticasCompletas: IEstadisticasUsuarioGrupo | null;

  // Vista actual
  vistaUsuarioGrupo: VistaUsuarioGrupo;
  grupoSeleccionadoId: string | null;

  // Formularios
  formularioAsignacion: IAsignacionFormState;
  filtros: IUsuarioGrupoFilters;

  // Estados de carga
  isLoadingGrupos: boolean;
  isLoadingUsuarios: boolean;
  isLoadingEstadisticas: boolean;
  isAsignando: boolean;

  // Permisos
  permisos: {
    canViewGroups: boolean;
    canAssignUsers: boolean;
    canManageGroups: boolean;
  };

  // Acciones
  loadGruposConUsuarios: () => Promise<void>;
  loadUsuariosDelGrupo: (grupoId: string) => Promise<void>;
  loadEstadisticasCompletas: () => Promise<void>;
  handleAsignarUsuario: () => Promise<void>;
  setVistaUsuarioGrupo: (vista: VistaUsuarioGrupo) => void;
  setGrupoSeleccionadoId: (id: string | null) => void;
  updateFormularioAsignacion: (field: keyof IAsignacionFormState, value: string) => void;
  updateFiltros: (newFiltros: Partial<IUsuarioGrupoFilters>) => void;
  resetFormularioAsignacion: () => void;
  validateAsignacionForm: () => boolean;
}

/**
 * Hook personalizado para gestión de usuarios en grupos
 */
export const useUsuarioGrupo = (): UseUsuarioGrupoReturn => {
  // Estados principales
  const [gruposConUsuarios, setGruposConUsuarios] = useState<IGrupoUsuario[]>([]);
  const [usuariosDelGrupo, setUsuariosDelGrupo] = useState<IUsuarioGrupo[]>([]);
  const [estadisticasCompletas, setEstadisticasCompletas] = useState<IEstadisticasUsuarioGrupo | null>(null);

  // Control de vistas
  const [vistaUsuarioGrupo, setVistaUsuarioGrupo] = useState<VistaUsuarioGrupo>('grupos-estadisticas');
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<string | null>(null);

  // Estados de formularios
  const [formularioAsignacion, setFormularioAsignacion] = useState<IAsignacionFormState>({
    usuarioId: '',
    grupoId: '',
    errors: {}
  });

  const [filtros, setFiltros] = useState<IUsuarioGrupoFilters>({
    search: '',
    activos: true
  });

  // Estados de carga
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(false);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false);
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = useState(false);
  const [isAsignando, setIsAsignando] = useState(false);

  // Control de permisos
  const permisos = useMemo(() => {
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');

    return {
      canViewGroups: canAccessSuperior(userRoles),
      canAssignUsers: canAccessAdmin(userRoles),
      canManageGroups: canAccessAdmin(userRoles)
    };
  }, []);

  // Grupos filtrados
  const gruposFiltrados = useMemo(() => {
    return filtrarGruposUsuarios(gruposConUsuarios, filtros);
  }, [gruposConUsuarios, filtros]);

  // Cargar grupos con estadísticas de usuarios
  const loadGruposConUsuarios = useCallback(async () => {
    if (!permisos.canViewGroups) {
      showError('No tienes permisos para ver los grupos');
      return;
    }

    setIsLoadingGrupos(true);
    logInfo('useUsuarioGrupo', 'Cargando grupos con usuarios');

    try {
      const gruposData = await obtenerUsuariosPorGrupo();
      setGruposConUsuarios(gruposData);
      logInfo('useUsuarioGrupo', 'Grupos con usuarios cargados exitosamente', {
        total: gruposData.length,
        totalUsuarios: gruposData.reduce((sum, grupo) => sum + grupo.cantidadUsuarios, 0)
      });
    } catch (error) {
      logError('useUsuarioGrupo', 'Error al cargar grupos con usuarios', error);
      showError(error instanceof Error ? error.message : 'Error al cargar los grupos');
    } finally {
      setIsLoadingGrupos(false);
    }
  }, [permisos.canViewGroups]);

  // Cargar usuarios de un grupo específico
  const loadUsuariosDelGrupo = useCallback(async (grupoId: string) => {
    if (!grupoId) return;

    setIsLoadingUsuarios(true);
    logInfo('useUsuarioGrupo', 'Cargando usuarios del grupo', { grupoId });

    try {
      const resultado = await obtenerUsuariosGruposPorId(grupoId);
      setUsuariosDelGrupo(resultado.data || []);
      logInfo('useUsuarioGrupo', 'Usuarios del grupo cargados exitosamente', {
        grupoId,
        grupoNombre: resultado.nombre,
        totalUsuarios: resultado.data?.length || 0
      });
    } catch (error) {
      logError('useUsuarioGrupo', 'Error al cargar usuarios del grupo', error);
      showError(error instanceof Error ? error.message : 'Error al cargar los usuarios del grupo');
      setUsuariosDelGrupo([]);
    } finally {
      setIsLoadingUsuarios(false);
    }
  }, []);

  // Cargar estadísticas completas
  const loadEstadisticasCompletas = useCallback(async () => {
    setIsLoadingEstadisticas(true);
    logInfo('useUsuarioGrupo', 'Cargando estadísticas completas');

    try {
      const estadisticas = await obtenerEstadisticasUsuarioGrupo();
      setEstadisticasCompletas(estadisticas);
      logInfo('useUsuarioGrupo', 'Estadísticas completas cargadas exitosamente', estadisticas);
    } catch (error) {
      logError('useUsuarioGrupo', 'Error al cargar estadísticas', error);
      showError(error instanceof Error ? error.message : 'Error al cargar las estadísticas');
    } finally {
      setIsLoadingEstadisticas(false);
    }
  }, []);

  // Asignar usuario a grupo
  const handleAsignarUsuario = useCallback(async () => {
    if (!permisos.canAssignUsers) {
      showError('No tienes permisos para asignar usuarios a grupos');
      return;
    }

    if (!validateAsignacionForm()) {
      return;
    }

    setIsAsignando(true);
    logInfo('useUsuarioGrupo', 'Asignando usuario a grupo', {
      usuarioId: formularioAsignacion.usuarioId,
      grupoId: formularioAsignacion.grupoId
    });

    try {
      const request: IAsignarUsuarioGrupoRequest = {
        usuarioId: formularioAsignacion.usuarioId.trim(),
        grupoId: formularioAsignacion.grupoId.trim()
      };

      const response = await asignarUsuarioAGrupo(request);

      if (response.status) {
        showSuccess(response.message);
        resetFormularioAsignacion();

        // Recargar datos
        await loadGruposConUsuarios();
        if (grupoSeleccionadoId) {
          await loadUsuariosDelGrupo(grupoSeleccionadoId);
        }

        logInfo('useUsuarioGrupo', 'Usuario asignado exitosamente');
      } else {
        showError('Error al asignar el usuario al grupo');
      }
    } catch (error) {
      logError('useUsuarioGrupo', 'Error al asignar usuario', error);
      showError(error instanceof Error ? error.message : 'Error al asignar el usuario al grupo');
    } finally {
      setIsAsignando(false);
    }
  }, [formularioAsignacion, permisos.canAssignUsers, loadGruposConUsuarios, loadUsuariosDelGrupo, grupoSeleccionadoId]);

  // Actualizar campo del formulario de asignación
  const updateFormularioAsignacion = useCallback((field: keyof IAsignacionFormState, value: string) => {
    setFormularioAsignacion(prev => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined // Limpiar error al escribir
      }
    }));
  }, []);

  // Actualizar filtros
  const updateFiltros = useCallback((newFiltros: Partial<IUsuarioGrupoFilters>) => {
    setFiltros(prev => ({
      ...prev,
      ...newFiltros
    }));
  }, []);

  // Resetear formulario de asignación
  const resetFormularioAsignacion = useCallback(() => {
    setFormularioAsignacion({
      usuarioId: '',
      grupoId: '',
      errors: {}
    });
  }, []);

  // Validar formulario de asignación
  const validateAsignacionForm = useCallback((): boolean => {
    const errors: IAsignacionFormState['errors'] = {};

    if (!formularioAsignacion.usuarioId.trim()) {
      errors.usuarioId = 'El ID del usuario es requerido';
    }

    if (!formularioAsignacion.grupoId.trim()) {
      errors.grupoId = 'Selecciona un grupo';
    }

    setFormularioAsignacion(prev => ({
      ...prev,
      errors
    }));

    return Object.keys(errors).length === 0;
  }, [formularioAsignacion]);

  return {
    // Estados principales
    gruposConUsuarios,
    gruposFiltrados,
    usuariosDelGrupo,
    estadisticasCompletas,

    // Vista actual
    vistaUsuarioGrupo,
    grupoSeleccionadoId,

    // Formularios
    formularioAsignacion,
    filtros,

    // Estados de carga
    isLoadingGrupos,
    isLoadingUsuarios,
    isLoadingEstadisticas,
    isAsignando,

    // Permisos
    permisos,

    // Acciones
    loadGruposConUsuarios,
    loadUsuariosDelGrupo,
    loadEstadisticasCompletas,
    handleAsignarUsuario,
    setVistaUsuarioGrupo,
    setGrupoSeleccionadoId,
    updateFormularioAsignacion,
    updateFiltros,
    resetFormularioAsignacion,
    validateAsignacionForm
  };
};