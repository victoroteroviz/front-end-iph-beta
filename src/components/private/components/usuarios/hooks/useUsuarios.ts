/**
 * Hook personalizado para manejo del componente Usuarios
 * Maneja toda la lógica de negocio separada de la presentación
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { getUsuarios, deleteUsuario } from '../services/crud-user.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';
import {
  getUserRoles,
  validateExternalRoles,
  canExternalRoleAccess,
  hasExternalRole
} from '../../../../../helper/role/role.helper';

// Interfaces
import type {
  IUsuariosState,
  IUsuariosFilters,
  IUseUsuariosReturn,
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
  canViewAllUsers: false,
  deleteModalOpen: false,
  usuarioToDelete: null
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

  /**
   * Verifica y establece permisos del usuario actual
   * Usa el sistema centralizado de validación de roles (role.helper v2.0.0)
   *
   * @returns true si tiene acceso, false si debe redirigir
   */
  const checkPermissions = useCallback(() => {
    // Obtener roles desde sessionStorage usando el helper
    const userRoles = getUserRoles();

    logInfo('UsuariosHook', 'Validando permisos de usuario', {
      rolesCount: userRoles.length
    });

    // Validar que los roles sean válidos según la configuración del sistema
    const validRoles = validateExternalRoles(userRoles);

    if (validRoles.length === 0) {
      logError(
        'UsuariosHook',
        new Error('Roles inválidos'),
        'Usuario sin roles válidos en el sistema'
      );
      showWarning('No tienes roles válidos para acceder a esta sección', 'Acceso Restringido');
      navigate('/inicio');
      return false;
    }

    // Verificar roles específicos usando el helper centralizado
    const isSuperAdmin = hasExternalRole(validRoles, 'SuperAdmin');
    const isAdmin = hasExternalRole(validRoles, 'Administrador');
    const isSuperior = hasExternalRole(validRoles, 'Superior');
    const isElemento = hasExternalRole(validRoles, 'Elemento');

    // Verificar acceso jerárquico (Admin y superiores)
    const canAccessAdminFeatures = canExternalRoleAccess(validRoles, 'Administrador');

    // Establecer permisos en el estado
    // Solo SuperAdmin y Admin pueden gestionar usuarios
    setState(prev => ({
      ...prev,
      canCreateUsers: canAccessAdminFeatures,  // Admin o SuperAdmin
      canEditUsers: canAccessAdminFeatures,    // Admin o SuperAdmin
      canDeleteUsers: canAccessAdminFeatures,  // Admin o SuperAdmin
      canViewAllUsers: canAccessAdminFeatures, // Admin o SuperAdmin
      canViewTeamUsers: isSuperior || isElemento // Superior/Elemento (funcionalidad futura)
    }));

    logInfo('UsuariosHook', 'Permisos calculados correctamente', {
      validRolesCount: validRoles.length,
      roles: validRoles.map(r => r.nombre),
      isSuperAdmin,
      isAdmin,
      isSuperior,
      isElemento,
      canCreateUsers: canAccessAdminFeatures,
      canEditUsers: canAccessAdminFeatures,
      canDeleteUsers: canAccessAdminFeatures,
      canViewAllUsers: canAccessAdminFeatures
    });

    // Verificar acceso básico a la sección de usuarios
    // Solo Admin y SuperAdmin pueden acceder
    if (!canAccessAdminFeatures) {
      logAuth('access_denied', false, {
        section: 'usuarios',
        reason: 'Requiere permisos de Administrador',
        userRoles: validRoles.map(r => r.nombre)
      });
      showWarning(
        'Solo Administradores y SuperAdmins pueden acceder a la gestión de usuarios',
        'Acceso Restringido'
      );
      navigate('/inicio');
      return false;
    }

    logAuth('access_granted', true, {
      section: 'usuarios',
      userRoles: validRoles.map(r => r.nombre)
    });

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

  /**
   * Navega a la página de creación de usuario
   * Requiere: Admin o SuperAdmin
   */
  const handleCreateUser = useCallback(() => {
    // Doble validación: estado + verificación en tiempo real
    const currentRoles = getUserRoles();
    const canCreate = canExternalRoleAccess(currentRoles, 'Administrador');

    if (!state.canCreateUsers || !canCreate) {
      logAuth('create_user_denied', false, {
        reason: 'Permisos insuficientes',
        statePermission: state.canCreateUsers,
        runtimePermission: canCreate
      });
      showWarning(
        'Solo Administradores y SuperAdmins pueden crear usuarios',
        'Acceso Denegado'
      );
      return;
    }

    logInfo('UsuariosHook', 'Navegando a crear usuario');
    logAuth('create_user_initiated', true, {
      userRoles: currentRoles.map(r => r.nombre)
    });
    navigate('/usuarios/nuevo');
  }, [state.canCreateUsers, navigate]);

  /**
   * Navega a la página de edición de usuario
   * Requiere: Admin o SuperAdmin
   */
  const handleEditUser = useCallback((usuario: IPaginatedUsers) => {
    // Doble validación: estado + verificación en tiempo real
    const currentRoles = getUserRoles();
    const canEdit = canExternalRoleAccess(currentRoles, 'Administrador');

    if (!state.canEditUsers || !canEdit) {
      logAuth('edit_user_denied', false, {
        userId: usuario.id,
        reason: 'Permisos insuficientes'
      });
      showWarning(
        'Solo Administradores y SuperAdmins pueden editar usuarios',
        'Acceso Denegado'
      );
      return;
    }

    logInfo('UsuariosHook', 'Navegando a editar usuario', { userId: usuario.id });
    logAuth('edit_user_initiated', true, {
      userId: usuario.id,
      userName: `${usuario.nombre} ${usuario.primer_apellido}`
    });
    navigate(`/usuarios/editar/${usuario.id}`);
  }, [state.canEditUsers, navigate]);

  /**
   * Abre el modal de confirmación para eliminar usuario
   * Requiere: Admin o SuperAdmin
   */
  const handleDeleteUser = useCallback((usuario: IPaginatedUsers) => {
    // Doble validación: estado + verificación en tiempo real
    const currentRoles = getUserRoles();
    const canDelete = canExternalRoleAccess(currentRoles, 'Administrador');

    if (!state.canDeleteUsers || !canDelete) {
      logAuth('delete_user_denied', false, {
        userId: usuario.id,
        reason: 'Permisos insuficientes'
      });
      showWarning(
        'Solo Administradores y SuperAdmins pueden eliminar usuarios',
        'Acceso Denegado'
      );
      return;
    }

    // Abrir el modal de confirmación
    setState(prev => ({
      ...prev,
      deleteModalOpen: true,
      usuarioToDelete: usuario,
      deleteError: null
    }));

    logInfo('UsuariosHook', 'Modal de eliminación abierto', {
      userId: usuario.id,
      userName: `${usuario.nombre} ${usuario.primer_apellido}`
    });
  }, [state.canDeleteUsers]);

  // Abrir modal de eliminación
  const openDeleteModal = useCallback((usuario: IPaginatedUsers) => {
    if (!state.canDeleteUsers) {
      showWarning('No tienes permisos para eliminar usuarios', 'Acceso Denegado');
      return;
    }

    setState(prev => ({
      ...prev,
      deleteModalOpen: true,
      usuarioToDelete: usuario,
      deleteError: null
    }));

    logInfo('UsuariosHook', 'Modal de eliminación abierto', { userId: usuario.id });
  }, [state.canDeleteUsers]);

  // Cerrar modal de eliminación
  const closeDeleteModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      deleteModalOpen: false,
      usuarioToDelete: null,
      deleteError: null
    }));

    logInfo('UsuariosHook', 'Modal de eliminación cerrado');
  }, []);

  // Confirmar eliminación desde el modal
  const confirmDelete = useCallback(async () => {
    const usuario = state.usuarioToDelete;
    
    if (!usuario) {
      logError('UsuariosHook', new Error('No hay usuario para eliminar'), 'confirmDelete');
      return;
    }

    setState(prev => ({ ...prev, isDeleting: usuario.id, deleteError: null }));

    try {
      await deleteUsuario(usuario.id);
      
      showSuccess(`Usuario ${usuario.nombre} ${usuario.primer_apellido} eliminado correctamente`, 'Usuario Eliminado');
      
      logAuth('user_deleted', true, { 
        deletedUserId: usuario.id,
        deletedUserName: `${usuario.nombre} ${usuario.primer_apellido}`
      });

      // Cerrar modal
      setState(prev => ({
        ...prev,
        deleteModalOpen: false,
        usuarioToDelete: null,
        isDeleting: null
      }));

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
  }, [state.usuarioToDelete, loadUsuarios]);


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

  /**
   * Efecto de inicialización
   * Se ejecuta UNA SOLA VEZ al montar el componente
   */
  useEffect(() => {
    const hasAccess = checkPermissions();
    if (!hasAccess) return;

    // Carga inicial
    loadUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Array vacío = solo se ejecuta al montar

  /**
   * Efecto para recargar cuando cambian los filtros
   */
  useEffect(() => {
    // Solo recargar si ya pasó la verificación inicial
    if (state.canViewAllUsers || state.canViewTeamUsers) {
      loadUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.filters.page,
    state.filters.orderBy,
    state.filters.order,
    state.filters.search,
    state.filters.searchBy
  ]);


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
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    refreshData,
    canPerformAction
  };
};

export default useUsuarios;