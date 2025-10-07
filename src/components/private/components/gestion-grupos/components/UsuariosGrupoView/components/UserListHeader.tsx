/**
 * @fileoverview Header simplificado para la lista de usuarios del grupo
 * @version 3.0.0
 * @description Header limpio con búsqueda para usuarios del grupo
 */

import React from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Interfaces
import type { IUsuarioGrupo } from '../../../../../../../interfaces/usuario-grupo';

interface UserListHeaderProps {
  usuarios: IUsuarioGrupo[];
  usuariosFiltrados: IUsuarioGrupo[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddUser?: () => void;
  grupoNombre?: string;
}

/**
 * Header simplificado para la lista de usuarios
 */
export const UserListHeader: React.FC<UserListHeaderProps> = ({
  usuariosFiltrados,
  searchTerm,
  onSearchChange,
  onAddUser,
  grupoNombre
}) => {

  return (
    <div className="space-y-4">
      {/* Header principal */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

        {/* Control de búsqueda y acciones */}
        <div className="flex items-center space-x-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

          {/* Botón Agregar Usuario */}
          {onAddUser && (
            <button
              onClick={onAddUser}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ backgroundColor: COLORS.primary }}
            >
              <UserPlus size={20} />
              <span>Agregar Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* Indicador de resultados de búsqueda */}
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

