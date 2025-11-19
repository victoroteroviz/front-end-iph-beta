/**
 * Hook personalizado para manejo del componente Usuarios
 * Maneja toda la lógica de negocio separada de la presentación
 *
 * @version 2.3.0
 * @since 2024-01-29
 * @updated 2025-01-31
 *
 * @changes v2.3.0
 * - ✅ Eliminada función duplicada openDeleteModal() (15 líneas)
 * - ✅ Simplificado checkPermissions() - reducción de variables innecesarias
 * - ✅ Optimizado logging en checkPermissions() con cálculo directo
 * - ✅ Eliminados imports no utilizados (isSuperAdmin, isAdmin)
 * - ✅ Reducción total: ~18 líneas eliminadas
 *
 * @changes v2.2.0
 * - ✅ Eliminadas validaciones redundantes con validateExternalRoles()
 * - ✅ Cambiadas funciones "External" por funciones directas del helper
 * - ✅ Eliminadas validaciones duplicadas en handleCreate/Edit/Delete
 * - ✅ Simplificado checkPermissions() (55 → 35 líneas, 36% menos)
 * - ✅ Reducción total de 74 líneas (13% menos código)
 *
 * @changes v2.1.0
 * - ✅ Integración de usePaginationPersistence
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook de paginación persistente
import { usePaginationPersistence } from '../../../../shared/components/pagination';

// Servicios
import { getUsuarios, deleteUsuario } from '../services/crud-user.service';

// Helpers
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';
import {
  getUserRoles,
  isSuperior,
  isElemento,
  isAdministrative
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
  // PAGINACIÓN PERSISTENTE v2.1.0
  // =====================================================

  /**
   * Hook de paginación con persistencia en sessionStorage
   * Mantiene la página actual al navegar entre vistas
   *
   * @see src/components/shared/components/pagination/hooks/usePaginationPersistence.ts
   */
  const {
    currentPage,
    setCurrentPage: setPaginationPage,
    resetPagination: resetPaginationPersistence
  } = usePaginationPersistence({
    key: 'usuarios-pagination',
    itemsPerPage: DEFAULT_USUARIOS_FILTERS.limit,
    logging: false // Desactivado en producción
  });

  // ✅ SINCRONIZAR página del hook persistente con filtros
  useEffect(() => {
    setState(prev => {
      // Solo actualizar si cambió
      if (prev.filters.page !== currentPage) {
        return {
          ...prev,
          filters: { ...prev.filters, page: currentPage }
        };
      }
      return prev;
    });
  }, [currentPage]);

  // =====================================================
  // FUNCIONES DE CONTROL DE ACCESO
  // =====================================================

  /**
   * Calcula y establece permisos del usuario actual
   * NOTA: La validación de acceso básico se hace en el componente padre
   * Este hook solo calcula permisos específicos para funcionalidades
   *
   * @refactored v2.3.0 - Optimizado cálculo de permisos y logging
   * @refactored v2.2.0 - Simplificado con funciones directas del helper
   * @security Usa getUserRoles() con cache + validación Zod automática
   */
  const checkPermissions = useCallback(() => {
    const userRoles = getUserRoles(); // Ya validados con Zod

    logInfo('UsuariosHook', 'Calculando permisos de usuario', {
      rolesCount: userRoles.length
    });

    // Validar que haya roles
    if (userRoles.length === 0) {
      logError(
        'UsuariosHook',
        new Error('Sin roles'),
        'Usuario sin roles en el sistema'
      );
      return false;
    }

    // ✅ Admin y SuperAdmin tienen todos los permisos de gestión
    const canAccessAdminFeatures = isAdministrative();

    // ✅ Calcular permisos de equipo (Superior y Elemento)
    const canViewTeamUsers = isSuperior() || isElemento();

    // Establecer permisos en el estado
    setState(prev => ({
      ...prev,
      canCreateUsers: canAccessAdminFeatures,
      canEditUsers: canAccessAdminFeatures,
      canDeleteUsers: canAccessAdminFeatures,
      canViewAllUsers: canAccessAdminFeatures,
      canViewTeamUsers
    }));

    // Obtener nombres de roles para logging
    const roleNames = userRoles.map(r => r.nombre);

    logInfo('UsuariosHook', 'Permisos calculados correctamente', {
      rolesCount: userRoles.length,
      roles: roleNames,
      isSuperAdmin: roleNames.includes('SuperAdmin'),
      isAdmin: roleNames.includes('Administrador'),
      permissions: {
        canCreate: canAccessAdminFeatures,
        canEdit: canAccessAdminFeatures,
        canDelete: canAccessAdminFeatures
      }
    });

    return true;
  }, []);

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
    // ✅ Resetear paginación cuando cambian filtros (excepto si solo cambia la página)
    const filtersChanged = Object.keys(filters).some(key =>
      key !== 'page' && filters[key as keyof IUsuariosFilters] !== undefined
    );

    if (filtersChanged) {
      resetPaginationPersistence();
    }

    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters, page: 1 } // Reset page when filtering
    }));
  }, [resetPaginationPersistence]);

  const handleSearch = useCallback(() => {
    // ✅ Resetear paginación en búsqueda manual
    resetPaginationPersistence();

    setState(prev => ({ ...prev, filters: { ...prev.filters, page: 1 } }));
    // loadUsuarios se ejecutará por el useEffect de dependencias
  }, [resetPaginationPersistence]);

  const handleClearFilters = useCallback(() => {
    // ✅ Resetear paginación al limpiar filtros
    resetPaginationPersistence();

    setState(prev => ({
      ...prev,
      filters: DEFAULT_USUARIOS_FILTERS
    }));

    logInfo('UsuariosHook', 'Filtros limpiados');
  }, [resetPaginationPersistence]);

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
    // Validación básica
    if (!Number.isInteger(page) || page < 1 || page > state.totalPages) {
      return;
    }

    logInfo('UsuariosHook', 'Página cambiada', {
      from: currentPage,
      to: page
    });

    // ✅ Actualizar en el hook persistente (se guarda automáticamente en sessionStorage)
    setPaginationPage(page);

    // El efecto de sincronización actualizará state.filters.page automáticamente
  }, [state.totalPages, currentPage, setPaginationPage]);

  // =====================================================
  // FUNCIONES DE ACCIONES
  // =====================================================

  /**
   * Navega a la página de creación de usuario
   *
   * @requires Admin o SuperAdmin (validado en checkPermissions)
   * @refactored v2.2.0 - Eliminada validación duplicada
   */
  const handleCreateUser = useCallback(() => {
    if (!state.canCreateUsers) {
      logAuth('create_user_denied', false, { reason: 'Permisos insuficientes' });
      showWarning(
        'Solo Administradores y SuperAdmins pueden crear usuarios',
        'Acceso Denegado'
      );
      return;
    }

    logAuth('create_user_initiated', true);
    navigate('/usuarios/nuevo');
  }, [state.canCreateUsers, navigate]);

  /**
   * Navega a la página de edición de usuario
   *
   * @param usuario - Usuario a editar
   * @requires Admin o SuperAdmin (validado en checkPermissions)
   * @refactored v2.2.0 - Eliminada validación duplicada
   */
  const handleEditUser = useCallback((usuario: IPaginatedUsers) => {
    if (!state.canEditUsers) {
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

    logAuth('edit_user_initiated', true, {
      userId: usuario.id,
      userName: `${usuario.nombre} ${usuario.primer_apellido}`
    });
    navigate(`/usuarios/editar/${usuario.id}`);
  }, [state.canEditUsers, navigate]);

  /**
   * Abre el modal de confirmación para eliminar usuario
   *
   * @param usuario - Usuario a eliminar
   * @requires Admin o SuperAdmin (validado en checkPermissions)
   * @refactored v2.2.0 - Eliminada validación duplicada
   */
  const handleDeleteUser = useCallback((usuario: IPaginatedUsers) => {
    if (!state.canDeleteUsers) {
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
   * NOTA: La validación de acceso ahora se hace en el componente padre
   */
  useEffect(() => {
    // Calcular permisos del usuario
    checkPermissions();

    // Carga inicial de datos
    loadUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Array vacío = solo se ejecuta al montar

  /**
   * Efecto para recargar cuando cambian los filtros
   */
  useEffect(() => {
    // Solo recargar si ya pasó la verificación inicial
    if (state.canViewAllUsers) {
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
    closeDeleteModal,
    confirmDelete,
    refreshData,
    canPerformAction
  };
};

export default useUsuarios;