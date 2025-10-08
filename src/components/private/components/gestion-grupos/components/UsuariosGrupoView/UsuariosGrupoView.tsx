/**
 * @fileoverview Componente mejorado para ver y gestionar usuarios de un grupo
 * @version 3.0.0
 * @description Vista detallada con búsqueda local, búsqueda por API y asignación de usuarios
 */

import React from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { COLORS, MESSAGES } from '../../constants';

//+ Hooks personalizados
import { useUsuariosGrupo } from './hooks/useUsuariosGrupo';

//+ Componentes atómicos
import { UserListHeader, UserGrid, ConfirmDeleteModal } from './components';

interface UsuariosGrupoViewProps {
  grupoUuid: string; // UUID del grupo padre
  grupoNombre?: string;
  onBack: () => void;
}

/**
 * Componente que muestra y gestiona los usuarios de un grupo específico
 * - Búsqueda local de usuarios ya asignados al grupo
 * - Búsqueda por API para agregar nuevos usuarios
 * - Asignación automática de usuarios al grupo
 */
export const UsuariosGrupoView: React.FC<UsuariosGrupoViewProps> = ({
  grupoUuid,
  grupoNombre,
  onBack,
}) => {
  // Estado local para el modal de confirmación
  const [deleteModalState, setDeleteModalState] = React.useState<{
    isOpen: boolean;
    usuarioId: string | null;
    usuarioNombre: string | null;
  }>({
    isOpen: false,
    usuarioId: null,
    usuarioNombre: null
  });

  // Hook personalizado con toda la lógica
  const {
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
    handleUserClick
  } = useUsuariosGrupo({ grupoUuid, grupoNombre });

  // Abrir modal de confirmación
  const handleDeleteClick = (usuarioId: string) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    setDeleteModalState({
      isOpen: true,
      usuarioId,
      usuarioNombre: usuario?.nombreCompleto || null
    });
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (deleteModalState.usuarioId) {
      await removeUsuarioFromGrupo(deleteModalState.usuarioId);
      // Cerrar modal después de la operación
      setDeleteModalState({ isOpen: false, usuarioId: null, usuarioNombre: null });
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    if (!isDeletingUser) {
      setDeleteModalState({ isOpen: false, usuarioId: null, usuarioNombre: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de retorno */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Volver a la lista</span>
        </button>

        {/* Botón de actualizar (solo visible si hay datos) */}
        {!isLoading && !error && usuarios.length > 0 && (
          <button
            onClick={loadUsuarios}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm cursor-pointer"
          >
            <RefreshCw size={16} />
            <span className="font-medium">Actualizar</span>
          </button>
        )}
      </div>

      {/* Estado de error */}
      {!isLoading && error && (
        <div className="bg-white rounded-xl border border-red-200 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadUsuarios}
              className="inline-flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-colors duration-200 cursor-pointer"
              style={{ backgroundColor: COLORS.primary }}
            >
              <RefreshCw size={16} />
              <span>Reintentar</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header mejorado con estadísticas y filtros */}
          <div className="p-6 border-b border-gray-200" style={{ backgroundColor: COLORS.background }}>
            <UserListHeader
              usuarios={usuarios}
              usuariosFiltrados={usuariosFiltrados}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddUsuario={addUsuarioToGrupo}
              isAddingUser={isAddingUser}
              grupoNombre={grupoInfo?.nombre || grupoNombre}
            />
          </div>

          {/* Contenido del grid */}
          <div className="p-6">
            {/* Lista vacía */}
            {!isLoading && usuarios.length === 0 && (
              <div className="text-center py-12">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
                >
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {MESSAGES.empty.noUsuarios}
                </h3>
                <p className="text-gray-500">
                  {MESSAGES.empty.noUsuariosDescription}
                </p>
              </div>
            )}

            {/* Grid mejorado de usuarios */}
            {(isLoading || usuarios.length > 0) && (
              <UserGrid
                usuarios={usuariosFiltrados}
                isLoading={isLoading}
                onUserClick={handleUserClick}
                onUserDelete={handleDeleteClick}
                deletingUserId={isDeletingUser}
                selectedUserId={selectedUserId || undefined}
                showActions={false}
                enableSorting={!isLoading && usuarios.length > 1}
                enableViewToggle={!isLoading && usuarios.length > 3}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        userName={deleteModalState.usuarioNombre || 'Usuario'}
        groupName={grupoInfo?.nombre || grupoNombre}
        isDeleting={isDeletingUser === deleteModalState.usuarioId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
