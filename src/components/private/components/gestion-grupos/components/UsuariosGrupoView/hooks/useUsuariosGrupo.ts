/**
 * @fileoverview Hook personalizado para manejo de usuarios del grupo
 * @version 2.0.0
 * @description Lógica separada para gestión de usuarios y búsqueda
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

//+ Interfaces
import type { IUsuarioGrupo, IObtenerUsuariosPorGrupo } from '../../../../../../../interfaces/usuario-grupo';

//+ Servicios
import { obtenerUsuariosGruposPorId } from '../../../../../../../services/usuario-grupo';

//+ Helpers
import { logInfo, logError } from '../../../../../../../helper/log/logger.helper';
import { showError } from '../../../../../../../helper/notification/notification.helper';

interface UseUsuariosGrupoParams {
  grupoId: string;
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
  error: string | null;
  searchTerm: string;

  // Acciones
  loadUsuarios: () => Promise<void>;
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
  grupoId,
  grupoNombre
}: UseUsuariosGrupoParams): UseUsuariosGrupoReturn => {
  // Estados principales
  const [usuarios, setUsuarios] = useState<IUsuarioGrupo[]>([]);
  const [grupoInfo, setGrupoInfo] = useState<IObtenerUsuariosPorGrupo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Cargar usuarios del grupo
  const loadUsuarios = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    logInfo('useUsuariosGrupo', 'Cargando usuarios del grupo', {
      grupoId,
      grupoNombre
    });

    try {
      const resultado = await obtenerUsuariosGruposPorId(grupoId);
      setGrupoInfo(resultado);
      setUsuarios(resultado.data || []);

      logInfo('useUsuariosGrupo', 'Usuarios cargados exitosamente', {
        grupoId,
        grupoNombre: resultado.nombre,
        totalUsuarios: resultado.data?.length || 0
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      logError('useUsuariosGrupo', 'Error al cargar usuarios', err);
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [grupoId, grupoNombre]);

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
      logInfo('useUsuariosGrupo', 'Usuario seleccionado', { userId, grupoId });
    }
  }, [grupoId]);

  // Manejar clic en usuario (toggle selección)
  const handleUserClick = useCallback((usuario: IUsuarioGrupo) => {
    const newSelectedId = selectedUserId === usuario.id ? null : usuario.id;
    selectUser(newSelectedId);
  }, [selectedUserId, selectUser]);

  // Cargar usuarios al montar o cambiar grupoId
  useEffect(() => {
    if (grupoId) {
      loadUsuarios();
    }
  }, [grupoId, loadUsuarios]);

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
    error,
    searchTerm,

    // Acciones
    loadUsuarios,
    setSearchTerm,
    selectUser,
    handleUserClick,

    // Estadísticas
    stats
  };
};