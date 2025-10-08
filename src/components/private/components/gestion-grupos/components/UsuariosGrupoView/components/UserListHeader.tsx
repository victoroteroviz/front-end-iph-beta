/**
 * @fileoverview Header simplificado para la lista de usuarios del grupo
 * @version 4.0.0
 * @description Header limpio con búsqueda local y búsqueda por API
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Interfaces
import type { IUsuarioGrupo } from '../../../../../../../interfaces/usuario-grupo';
import type { IUsuarioBusqueda } from '../../../../../../../interfaces/user/crud';

//+ Componentes
import { SearchUsuarioInput } from './SearchUsuarioInput';

interface UserListHeaderProps {
  usuarios: IUsuarioGrupo[];
  usuariosFiltrados: IUsuarioGrupo[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddUsuario: (usuario: IUsuarioBusqueda) => void;
  isAddingUser: boolean;
  grupoNombre?: string;
}

/**
 * Header simplificado para la lista de usuarios
 */
export const UserListHeader: React.FC<UserListHeaderProps> = ({
  usuarios,
  usuariosFiltrados,
  searchTerm,
  onSearchChange,
  onAddUsuario,
  isAddingUser,
  grupoNombre
}) => {

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col gap-4">
        {/* Información del grupo */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Usuarios del Grupo
          </h2>
          {grupoNombre && (
            <p className="text-lg" style={{ color: COLORS.primary }}>
              {grupoNombre} <span className="text-gray-500">({usuariosFiltrados.length})</span>
            </p>
          )}
        </div>

        {/* Sección de búsquedas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Búsqueda local (filtro de usuarios existentes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar en el grupo
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Filtrar usuarios del grupo..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{
                  outlineColor: COLORS.primary
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-600 mt-1">
                Mostrando {usuariosFiltrados.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Búsqueda por API (agregar nuevos usuarios) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar usuario al grupo
            </label>
            <SearchUsuarioInput
              placeholder="Buscar usuario por nombre..."
              onUsuarioSelect={onAddUsuario}
              selectedUsuarioId={undefined}
            />
            {isAddingUser && (
              <p className="text-xs text-blue-600 mt-1 flex items-center space-x-1">
                <span className="animate-pulse">●</span>
                <span>Agregando usuario...</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de resultados de búsqueda local */}
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Mostrando <span className="font-semibold">{usuariosFiltrados.length}</span> resultado{usuariosFiltrados.length !== 1 ? 's' : ''} para "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

