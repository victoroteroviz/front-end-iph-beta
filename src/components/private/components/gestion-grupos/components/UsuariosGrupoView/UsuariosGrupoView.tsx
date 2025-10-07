/**
 * @fileoverview Componente mejorado para ver usuarios de un grupo
 * @version 2.0.0
 * @description Vista detallada y optimizada de los usuarios asignados a un grupo específico
 */

import React from 'react';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { COLORS, MESSAGES } from '../../constants';

//+ Hooks personalizados
import { useUsuariosGrupo } from './hooks/useUsuariosGrupo';

//+ Componentes atómicos
import { UserListHeader, UserGrid } from './components';

interface UsuariosGrupoViewProps {
  grupoId: string;
  grupoNombre?: string;
  onBack: () => void;
}

/**
 * Componente que muestra los usuarios de un grupo específico con funcionalidades avanzadas
 */
export const UsuariosGrupoView: React.FC<UsuariosGrupoViewProps> = ({
  grupoId,
  grupoNombre,
  onBack,
}) => {
  // Hook personalizado con toda la lógica
  const {
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
    handleUserClick
  } = useUsuariosGrupo({ grupoId, grupoNombre });

  // Handler para agregar usuario
  const handleAddUser = () => {
    // TODO: Implementar lógica para agregar usuario al grupo
    console.log('Agregar usuario al grupo:', grupoId);
    // Aquí se puede abrir un modal o navegar a otra vista
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
              onAddUser={handleAddUser}
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
                selectedUserId={selectedUserId || undefined}
                showActions={false}
                enableSorting={!isLoading && usuarios.length > 1}
                enableViewToggle={!isLoading && usuarios.length > 3}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
