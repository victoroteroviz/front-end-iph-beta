/**
 * Componente Usuarios
 * Gestión completa de usuarios del sistema con funcionalidades CRUD
 * Migrado completamente a TypeScript con arquitectura moderna
 */

import React, { useEffect } from 'react';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';

// Hooks
import useUsuarios from './hooks/useUsuarios';

// Componentes
import UsuariosFilters from './components/UsuariosFilters';
import UsuariosTable from './components/UsuariosTable';
import VirtualizedTable from './components/VirtualizedTable';
import Pagination from './components/Pagination';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { Breadcrumbs, type BreadcrumbItem } from '../../layout/breadcrumbs';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Configuración
const USE_VIRTUALIZATION = false; // Cambiar a true para tablas con >100 usuarios

interface UsuariosProps {
  className?: string;
}

const Usuarios: React.FC<UsuariosProps> = ({ 
  className = '' 
}) => {
  const {
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
    refreshData
  } = useUsuarios();

  useEffect(() => {
    logInfo('Usuarios', 'Componente montado', {
      totalUsuarios: state.usuarios.length,
      canCreateUsers: state.canCreateUsers,
      canEditUsers: state.canEditUsers,
      canDeleteUsers: state.canDeleteUsers
    });
  }, [state.usuarios.length, state.canCreateUsers, state.canEditUsers, state.canDeleteUsers]);

  // Determinar si usar tabla virtualizada
  const shouldUseVirtualization = USE_VIRTUALIZATION && state.usuarios.length > 50;
  const TableComponent = shouldUseVirtualization ? VirtualizedTable : UsuariosTable;

  // Breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Gestión de Usuarios', isActive: true }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-component="usuarios">
      <div className={`max-w-7xl mx-auto ${className}`}>

        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#948b54] rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-600 font-poppins">
                  Administra los usuarios del sistema IPH
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón de refrescar */}
              <button
                onClick={refreshData}
                disabled={state.isLoading}
                className="
                  flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-white bg-[#4d4725] rounded-lg
                  hover:bg-[#3a3519] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200 font-poppins
                "
              >
                <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Búsqueda y Lista */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Header de filtros */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#4d4725] font-poppins">
                Lista de Usuarios ({state.totalUsers})
              </h2>
            </div>
            <UsuariosFilters
              filters={state.filters}
              loading={state.isLoading}
              canCreate={state.canCreateUsers}
              onFiltersChange={updateFilters}
              onSearch={handleSearch}
              onClear={handleClearFilters}
              onCreate={handleCreateUser}
            />
          </div>

          {/* Contenido de la lista */}
          <div className="p-6">
            {/* Mensajes de estado inline */}
            {state.isDeleting && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800 font-poppins">
                  Eliminando usuario...
                </span>
              </div>
            )}

            {state.deleteError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800 font-poppins">
                  Error al eliminar: {state.deleteError}
                </span>
              </div>
            )}

            {state.error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800 font-poppins">
                    Error al cargar usuarios
                  </p>
                  <p className="text-xs text-red-700 font-poppins">
                    {state.error}
                  </p>
                </div>
              </div>
            )}

            {/* Tabla de usuarios */}
            <TableComponent
              usuarios={state.usuarios}
              loading={state.isLoading}
              filters={state.filters}
              canEdit={state.canEditUsers}
              canDelete={state.canDeleteUsers}
              onSort={handleSort}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          </div>

          {/* Paginación - Solo mostrar si no se usa virtualización */}
          {!shouldUseVirtualization && state.totalPages > 1 && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-4">
              <Pagination
                currentPage={state.filters.page}
                totalPages={state.totalPages}
                totalItems={state.totalUsers}
                onPageChange={handlePageChange}
                loading={state.isLoading}
              />
            </div>
          )}
        </div>

        {/* Modal de Confirmación de Eliminación */}
        <DeleteConfirmModal
          isOpen={state.deleteModalOpen}
          usuario={state.usuarioToDelete}
          isDeleting={state.isDeleting !== null}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />
      </div>
    </div>
  );
};

export default Usuarios;