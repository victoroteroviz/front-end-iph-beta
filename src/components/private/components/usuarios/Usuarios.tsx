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

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#948b54] rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#4d4725] font-poppins">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 font-poppins">
              Administra los usuarios del sistema IPH
            </p>
          </div>
        </div>

        {/* Botón de refrescar */}
        <button
          onClick={refreshData}
          disabled={state.isLoading}
          className="
            flex items-center gap-2 px-4 py-2 text-sm font-medium
            text-gray-700 bg-white border border-gray-300 rounded-lg
            hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150 font-poppins shadow-sm
          "
        >
          <RefreshCw className={`h-4 w-4 ${state.isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>


      {/* Filtros de búsqueda */}
      <UsuariosFilters
        filters={state.filters}
        loading={state.isLoading}
        canCreate={state.canCreateUsers}
        onFiltersChange={updateFilters}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        onCreate={handleCreateUser}
      />

      {/* Indicador de estado de eliminación */}
      {state.isDeleting && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800 font-poppins">
            Eliminando usuario...
          </span>
        </div>
      )}

      {/* Error de eliminación */}
      {state.deleteError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800 font-poppins">
            Error al eliminar: {state.deleteError}
          </span>
        </div>
      )}

      {/* Error general */}
      {state.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
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

      {/* Paginación - Solo mostrar si no se usa virtualización */}
      {!shouldUseVirtualization && state.totalPages > 1 && (
        <Pagination
          currentPage={state.filters.page}
          totalPages={state.totalPages}
          totalItems={state.totalUsers}
          onPageChange={handlePageChange}
          loading={state.isLoading}
        />
      )}


      {/* Información adicional */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 font-poppins">
              Información del Sistema
            </h3>
            <ul className="mt-2 text-xs text-gray-600 space-y-1 font-poppins">
              <li>• La paginación se adapta automáticamente al número de usuarios</li>
              <li>• Los permisos se basan en el rol del usuario actual</li>
              {shouldUseVirtualization && (
                <li>• Usando tabla virtualizada para mejor rendimiento con muchos usuarios</li>
              )}
              <li>• Todos los filtros y ordenamientos funcionan en tiempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;