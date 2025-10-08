/**
 * @fileoverview Hook personalizado para manejo de usuarios del grupo
 * @version 3.0.0
 * @description Lógica separada para gestión de usuarios y búsqueda con manejo mejorado de errores
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

//+ Interfaces
import type { IUsuarioGrupo, IObtenerUsuariosPorGrupo } from '../../../../../../../interfaces/usuario-grupo';
import type { IUsuarioBusqueda } from '../../../../../../../interfaces/user/crud';

//+ Servicios
import {
  obtenerUsuariosGruposPorId,
  asignarUsuarioAGrupo,
  eliminarUsuarioDeGrupo
} from '../../../../../../../services/usuario-grupo';

//+ Helpers
import { logInfo, logError } from '../../../../../../../helper/log/logger.helper';
import { showError, showSuccess } from '../../../../../../../helper/notification/notification.helper';

// =====================================================
// UTILIDADES INTERNAS
// =====================================================

/**
 * Interfaz para errores del backend
 */
interface BackendError {
  response?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
  status?: number;
  message?: string;
}

/**
 * Parsea errores del backend y extrae mensaje amigable
 * @param error - Error capturado del backend
 * @param defaultMessage - Mensaje por defecto si no se puede parsear
 * @returns Mensaje de error amigable para el usuario
 */
const parseBackendError = (error: unknown, defaultMessage: string): string => {
  // Si es un error tipado del backend
  if (error && typeof error === 'object') {
    const backendError = error as BackendError;

    // Prioridad 1: message dentro de response
    if (backendError.response?.message) {
      return backendError.response.message;
    }

    // Prioridad 2: message directo
    if (backendError.message) {
      return backendError.message;
    }

    // Prioridad 3: error genérico basado en statusCode
    if (backendError.response?.statusCode || backendError.status) {
      const statusCode = backendError.response?.statusCode || backendError.status;
      return getErrorMessageByStatus(statusCode, defaultMessage);
    }
  }

  // Si es un Error estándar de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Obtiene mensaje de error amigable basado en código HTTP
 * @param statusCode - Código de estado HTTP
 * @param defaultMessage - Mensaje por defecto
 * @returns Mensaje de error descriptivo
 */
const getErrorMessageByStatus = (statusCode: number, defaultMessage: string): string => {
  const errorMessages: Record<number, string> = {
    400: 'Los datos proporcionados no son válidos',
    401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente',
    403: 'No tienes permisos para realizar esta acción',
    404: 'El recurso solicitado no existe',
    409: 'El usuario ya está asignado a otro grupo',
    422: 'Los datos enviados no pueden ser procesados',
    500: 'Error interno del servidor. Intenta nuevamente más tarde',
    502: 'El servidor no está disponible temporalmente',
    503: 'Servicio no disponible. Intenta más tarde'
  };

  return errorMessages[statusCode] || defaultMessage;
};

// =====================================================
// INTERFACES
// =====================================================

interface UseUsuariosGrupoParams {
  grupoUuid: string; // UUID del grupo padre
  grupoNombre?: string;
}

interface UseUsuariosGrupoReturn {
  // Estado
  usuarios: IUsuarioGrupo[];
  grupoInfo: IObtenerUsuariosPorGrupo | null;
  usuariosFiltrados: IUsuarioGrupo[];
  selectedUserId: string | null;

  // Estados UI
  isLoading: boolean;
  isAddingUser: boolean;
  isDeletingUser: string | null; // UUID del usuario que se está eliminando
  error: string | null;
  searchTerm: string;

  // Acciones
  loadUsuarios: () => Promise<void>;
  addUsuarioToGrupo: (usuario: IUsuarioBusqueda) => Promise<void>;
  removeUsuarioFromGrupo: (usuarioId: string) => Promise<void>;
  setSearchTerm: (term: string) => void;
  selectUser: (userId: string | null) => void;
  handleUserClick: (usuario: IUsuarioGrupo) => void;

  // Estadísticas
  stats: {
    total: number;
    filtered: number;
    withPhone: number;
    withCUIP: number;
    withCUP: number;
    complete: number;
  };
}

/**
 * Hook personalizado para gestión de usuarios del grupo
 */
export const useUsuariosGrupo = ({
  grupoUuid,
  grupoNombre
}: UseUsuariosGrupoParams): UseUsuariosGrupoReturn => {
  // Estados principales
  const [usuarios, setUsuarios] = useState<IUsuarioGrupo[]>([]);
  const [grupoInfo, setGrupoInfo] = useState<IObtenerUsuariosPorGrupo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Cargar usuarios del grupo
  const loadUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    logInfo('useUsuariosGrupo', 'Cargando usuarios del grupo', {
      grupoUuid,
      grupoNombre
    });

    try {
      const resultado = await obtenerUsuariosGruposPorId(grupoUuid);
      setGrupoInfo(resultado);
      setUsuarios(resultado.data || []);

      logInfo('useUsuariosGrupo', 'Usuarios cargados exitosamente', {
        grupoUuid,
        grupoNombre: resultado.nombre,
        totalUsuarios: resultado.data?.length || 0
      });
    } catch (err) {
      const errorMessage = parseBackendError(err, 'Error al cargar usuarios del grupo');
      logError('useUsuariosGrupo', err, 'Error al cargar usuarios');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [grupoUuid, grupoNombre]);

  // Agregar usuario al grupo
  const addUsuarioToGrupo = useCallback(async (usuario: IUsuarioBusqueda) => {
    setIsAddingUser(true);

    logInfo('useUsuariosGrupo', 'Agregando usuario al grupo', {
      usuarioId: usuario.id,
      grupoUuid,
      nombreUsuario: `${usuario.nombre} ${usuario.primer_apellido}`
    });

    try {
      await asignarUsuarioAGrupo({
        usuarioId: usuario.id,
        grupoId: grupoUuid
      });

      showSuccess(`Usuario ${usuario.nombre} ${usuario.primer_apellido} agregado exitosamente`);

      // Recargar la lista de usuarios
      await loadUsuarios();

      logInfo('useUsuariosGrupo', 'Usuario agregado exitosamente', {
        usuarioId: usuario.id,
        grupoUuid
      });
    } catch (err) {
      const errorMessage = parseBackendError(err, 'Error al agregar usuario al grupo');

      logError('useUsuariosGrupo', err, `Error al agregar usuario ${usuario.id} al grupo ${grupoUuid}`);

      showError(errorMessage);
    } finally {
      setIsAddingUser(false);
    }
  }, [grupoUuid, loadUsuarios]);

  // Eliminar usuario del grupo
  const removeUsuarioFromGrupo = useCallback(async (usuarioId: string) => {
    setIsDeletingUser(usuarioId);

    const usuario = usuarios.find(u => u.id === usuarioId);

    logInfo('useUsuariosGrupo', 'Eliminando usuario del grupo', {
      usuarioId,
      grupoUuid,
      nombreUsuario: usuario?.nombreCompleto
    });

    try {
      const resultado = await eliminarUsuarioDeGrupo({
        id: usuarioId,
        grupoId: grupoUuid
      });

      showSuccess(
        resultado.message ||
        `Usuario ${usuario?.nombreCompleto || ''} eliminado exitosamente del grupo`
      );

      // Recargar la lista de usuarios
      await loadUsuarios();

      logInfo('useUsuariosGrupo', 'Usuario eliminado exitosamente', {
        usuarioId,
        grupoUuid,
        nombreUsuario: resultado.data?.nombreUsuario,
        nombreGrupo: resultado.data?.nombreGrupo
      });
    } catch (err) {
      const errorMessage = parseBackendError(err, 'Error al eliminar usuario del grupo');

      logError('useUsuariosGrupo', err, `Error al eliminar usuario ${usuarioId} del grupo ${grupoUuid}`);

      showError(errorMessage);
    } finally {
      setIsDeletingUser(null);
    }
  }, [grupoUuid, usuarios, loadUsuarios]);

  // Filtrar usuarios basado en búsqueda
  const usuariosFiltrados = useMemo(() => {
    let filtered = usuarios;

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(usuario =>
        usuario.nombreCompleto.toLowerCase().includes(searchLower) ||
        usuario.id.toLowerCase().includes(searchLower) ||
        usuario.cuip?.toLowerCase().includes(searchLower) ||
        usuario.cup?.toLowerCase().includes(searchLower) ||
        usuario.telefono?.includes(searchTerm.trim())
      );
    }

    return filtered;
  }, [usuarios, searchTerm]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    return {
      total: usuarios.length,
      filtered: usuariosFiltrados.length,
      withPhone: usuarios.filter(u => u.telefono).length,
      withCUIP: usuarios.filter(u => u.cuip).length,
      withCUP: usuarios.filter(u => u.cup).length,
      complete: usuarios.filter(u => u.telefono && u.cuip && u.cup).length
    };
  }, [usuarios, usuariosFiltrados.length]);

  // Manejar selección de usuario
  const selectUser = useCallback((userId: string | null) => {
    setSelectedUserId(userId);
    if (userId) {
      logInfo('useUsuariosGrupo', 'Usuario seleccionado', { userId, grupoUuid });
    }
  }, [grupoUuid]);

  // Manejar clic en usuario (toggle selección)
  const handleUserClick = useCallback((usuario: IUsuarioGrupo) => {
    const newSelectedId = selectedUserId === usuario.id ? null : usuario.id;
    selectUser(newSelectedId);
  }, [selectedUserId, selectUser]);

  // Cargar usuarios al montar o cambiar grupoUuid
  useEffect(() => {
    if (grupoUuid) {
      loadUsuarios();
    }
  }, [grupoUuid, loadUsuarios]);

  // Limpiar selección al cambiar búsqueda
  useEffect(() => {
    setSelectedUserId(null);
  }, [searchTerm]);

  return {
    // Estado
    usuarios,
    grupoInfo,
    usuariosFiltrados,
    selectedUserId,

    // Estados UI
    isLoading,
    isAddingUser,
    isDeletingUser,
    error,
    searchTerm,

    // Acciones
    loadUsuarios,
    addUsuarioToGrupo,
    removeUsuarioFromGrupo,
    setSearchTerm,
    selectUser,
    handleUserClick,

    // Estadísticas
    stats
  };
};