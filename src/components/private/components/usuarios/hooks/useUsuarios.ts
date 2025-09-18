/**
 * Hook personalizado para manejo del componente Usuarios
 * Maneja toda la lógica de negocio separada de la presentación
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { getUsuarios, deleteUsuario } from '../../../../../services/user/crud-user.service';

// Helpers
import { showSuccess, showError, showWarning, showConfirmation } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// Interfaces
import type {
  IUsuariosState,
  IUsuariosFilters,
  IUseUsuariosReturn,
  UsuariosPermission,
  SortableColumn
} from '../../../../../interfaces/components/usuarios.interface';
import { DEFAULT_USUARIOS_FILTERS } from '../../../../../interfaces/components/usuarios.interface';
import type { IPaginatedUsers } from '../../../../../interfaces/user/crud/get-paginated.users.interface';
import { UserOrderByParams, UserSearchParams, SortOrder } from '../../../../../interfaces/user/crud/user-search-params.enum';

// =====================================================
// ESTADO INICIAL
// =====================================================

const initialState: IUsuariosState = {
  usuarios: [],
  isLoading: false,
  isDeleting: null,
  error: null,
  deleteError: null,
  filters: DEFAULT_USUARIOS_FILTERS,
  totalPages: 1,
  totalUsers: 0,
  canCreateUsers: false,
  canEditUsers: false,
  canDeleteUsers: false,
  canViewAllUsers: false
};

// =====================================================
// HOOK PRINCIPAL
// =====================================================

const useUsuarios = (): IUseUsuariosReturn => {
  const navigate = useNavigate();
  const [state, setState] = useState<IUsuariosState>(initialState);

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================

  const checkPermissions = useCallback(() => {
    // Leer datos del sessionStorage con las keys correctas
    const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
    const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    
    logInfo('UsuariosHook', 'Datos de sessionStorage', { userData, userRoles });
    
    // Determinar permisos basado en roles
    const isSuperAdmin = userRoles.some((role: any) => role.nombre === 'SuperAdmin');
    const isAdmin = userRoles.some((role: any) => role.nombre === 'Administrador');
    const isSuperior = userRoles.some((role: any) => role.nombre === 'Superior');
    const isElemento = userRoles.some((role: any) => role.nombre === 'Elemento');

    setState(prev => ({
      ...prev,
      canCreateUsers: isSuperAdmin || isAdmin,
      canEditUsers: isSuperAdmin || isAdmin,
      canDeleteUsers: isSuperAdmin || isAdmin,
      canViewAllUsers: isSuperAdmin || isAdmin,
      // Elementos y Superiores pueden ver usuarios limitados (por implementar)
      canViewTeamUsers: isSuperior || isElemento
    }));

    logInfo('UsuariosHook', 'Permisos calculados', {
      userRolesCount: userRoles.length,
      roles: userRoles.map((r: any) => r.nombre),
      isSuperAdmin,
      isAdmin,
      isSuperior,
      isElemento,
      canViewAllUsers: isSuperAdmin || isAdmin
    });

    // Verificar acceso básico
    if (!isSuperAdmin && !isAdmin && !isSuperior && !isElemento) {
      showWarning('No tienes permisos para acceder a esta sección', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    return true;
  }, [navigate]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadUsuarios = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = {
        page: state.filters.page,
        orderBy: UserOrderByParams[state.filters.orderBy.toUpperCase() as keyof typeof UserOrderByParams] || UserOrderByParams.NOMBRE,
        order: state.filters.order === 'ASC' ? SortOrder.ASC : SortOrder.DESC,
        search: state.filters.search,
        searchBy: UserSearchParams[state.filters.searchBy.toUpperCase() as keyof typeof UserSearchParams] || UserSearchParams.NOMBRE
      };

      logInfo('UsuariosHook', 'Cargando usuarios', params);

      const response = await getUsuarios(params);

      setState(prev => ({
        ...prev,
        usuarios: response.data || [],
        totalPages: response.totalPages || 1,
        totalUsers: response.total || 0,
        isLoading: false
      }));

      logInfo('UsuariosHook', 'Usuarios cargados exitosamente', {
        cantidad: response.data ? response.data.length : 0,
        totalPages: response.totalPages || 1
      });

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al cargar usuarios';
      logError('UsuariosHook', error, 'Error al cargar usuarios');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      showError(errorMessage, 'Error de Carga');
    }
  }, [state.filters]);


  // =====================================================
  // FUNCIONES DE FILTROS
  // =====================================================

  const updateFilters = useCallback((filters: Partial<IUsuariosFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters, page: 1 } // Reset page when filtering
    }));
  }, []);

  const handleSearch = useCallback(() => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, page: 1 } }));
    // loadUsuarios se ejecutará por el useEffect de dependencias
  }, []);

  const handleClearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_USUARIOS_FILTERS
    }));
    logInfo('UsuariosHook', 'Filtros limpiados');
  }, []);

  const handleSort = useCallback((column: SortableColumn) => {
    setState(prev => {
      const newOrder = prev.filters.orderBy === column && prev.filters.order === 'ASC' 
        ? 'DESC' 
        : 'ASC';
      
      return {
        ...prev,
        filters: {
          ...prev.filters,
          orderBy: column,
          order: newOrder,
          page: 1
        }
      };
    });

    logInfo('UsuariosHook', 'Ordenamiento cambiado', { column, order: state.filters.order });
  }, [state.filters.order]);

  // =====================================================
  // FUNCIONES DE PAGINACIÓN
  // =====================================================

  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > state.totalPages) return;
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, page }
    }));

    logInfo('UsuariosHook', 'Página cambiada', { page });
  }, [state.totalPages]);

  // =====================================================
  // FUNCIONES DE ACCIONES
  // =====================================================

  const handleCreateUser = useCallback(() => {
    if (!state.canCreateUsers) {
      showWarning('No tienes permisos para crear usuarios', 'Acceso Denegado');
      return;
    }

    logInfo('UsuariosHook', 'Navegando a crear usuario');
    navigate('/usuarios/nuevo');
  }, [state.canCreateUsers, navigate]);

  const handleEditUser = useCallback((usuario: IPaginatedUsers) => {
    if (!state.canEditUsers) {
      showWarning('No tienes permisos para editar usuarios', 'Acceso Denegado');
      return;
    }

    logInfo('UsuariosHook', 'Navegando a editar usuario', { userId: usuario.id });
    navigate(`/usuarios/editar/${usuario.id}`);
  }, [state.canEditUsers, navigate]);

  const handleDeleteUser = useCallback(async (usuario: IPaginatedUsers) => {
    if (!state.canDeleteUsers) {
      showWarning('No tienes permisos para eliminar usuarios', 'Acceso Denegado');
      return;
    }

    const confirmed = await showConfirmation(
      '¿Eliminar usuario?',
      `¿Estás seguro de que quieres eliminar a ${usuario.nombre} ${usuario.primer_apellido}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setState(prev => ({ ...prev, isDeleting: usuario.id, deleteError: null }));

    try {
      await deleteUsuario(usuario.id);
      
      showSuccess(`Usuario ${usuario.nombre} ${usuario.primer_apellido} eliminado correctamente`, 'Usuario Eliminado');
      
      logAuth('user_deleted', true, { 
        deletedUserId: usuario.id,
        deletedUserName: `${usuario.nombre} ${usuario.primer_apellido}`
      });

      // Recargar lista
      await loadUsuarios();

    } catch (error) {
      const errorMessage = (error as Error).message || 'Error al eliminar usuario';
      
      setState(prev => ({ 
        ...prev, 
        isDeleting: null,
        deleteError: errorMessage 
      }));

      showError(errorMessage, 'Error al Eliminar');
      
      logError('UsuariosHook', error, `Error al eliminar usuario ID: ${usuario.id}`);
    }
  }, [state.canDeleteUsers, loadUsuarios]);


  // =====================================================
  // FUNCIONES DE UTILIDAD
  // =====================================================

  const refreshData = useCallback(async () => {
    logInfo('UsuariosHook', 'Refrescando datos');
    await loadUsuarios();
  }, [loadUsuarios]);

  const canPerformAction = useCallback((action: string): boolean => {
    switch (action) {
      case 'create': return state.canCreateUsers;
      case 'edit': return state.canEditUsers;
      case 'delete': return state.canDeleteUsers;
      default: return false;
    }
  }, [state.canCreateUsers, state.canEditUsers, state.canDeleteUsers]);

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    const hasAccess = checkPermissions();
    if (!hasAccess) return;

    // Carga inicial
    loadUsuarios();
  }, [checkPermissions, loadUsuarios]);


  // =====================================================
  // VALORES COMPUTADOS
  // =====================================================

  const hasData = useMemo(() => state.usuarios.length > 0, [state.usuarios.length]);

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    state,
    updateFilters,
    handleSearch,
    handleClearFilters,
    handleSort,
    handlePageChange,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    refreshData,
    canPerformAction
  };
};

export default useUsuarios;