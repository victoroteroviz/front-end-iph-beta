/**
 * Componente atómico UsuariosTable
 * Tabla de usuarios con ordenamiento, acciones y estados de carga
 */

import React, { useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  BarChart3, 
  User,
  Loader2,
  AlertCircle,
  Users
} from 'lucide-react';
import type { IUsuariosTableProps } from '../../../../../interfaces/components/usuarios.interface';
import type { IPaginatedUsers } from '../../../../../interfaces/user/crud/get-paginated.users.interface';

const UsuariosTable: React.FC<IUsuariosTableProps> = ({
  usuarios,
  loading,
  filters,
  canEdit,
  canDelete,
  onSort,
  onEdit,
  onDelete,
  onViewStats,
  className = ''
}) => {
  
  // Configuración de columnas
  const columns = useMemo(() => [
    { 
      key: 'nombre', 
      label: 'Nombre', 
      sortable: true,
      className: 'min-w-48'
    },
    { 
      key: 'cuip', 
      label: 'CUIP', 
      sortable: true,
      className: 'min-w-32'
    },
    { 
      key: 'gradoId', 
      label: 'Grado', 
      sortable: true,
      className: 'min-w-32'
    },
    { 
      key: 'cargoId', 
      label: 'Cargo', 
      sortable: true,
      className: 'min-w-32'
    },
    { 
      key: 'actions', 
      label: 'Acciones', 
      sortable: false,
      className: 'min-w-48'
    }
  ], []);

  const getSortIcon = (columnKey: string) => {
    if (filters.orderBy !== columnKey) {
      return <ChevronUp className="h-4 w-4 text-gray-300" />;
    }
    return filters.order === 'ASC' 
      ? <ChevronUp className="h-4 w-4 text-[#948b54]" />
      : <ChevronDown className="h-4 w-4 text-[#948b54]" />;
  };

  const handleSort = (columnKey: string) => {
    if (loading) return;
    onSort(columnKey);
  };

  const formatUserName = (usuario: IPaginatedUsers): string => {
    const parts = [
      usuario.nombre,
      usuario.primer_apellido,
      usuario.segundo_apellido
    ].filter(Boolean);
    return parts.join(' ');
  };

  // Estados de carga y vacío
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#948b54] mb-4" />
          <p className="text-gray-600 font-poppins">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-600 font-poppins">
            {filters.search 
              ? `No hay usuarios que coincidan con "${filters.search}"`
              : 'No hay usuarios registrados en el sistema'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#4d4725] font-poppins">
              Lista de Usuarios
            </h2>
            <p className="text-sm text-gray-600 font-poppins">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Users className="h-6 w-6 text-[#948b54]" />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header de tabla */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                    ${column.className}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body de tabla */}
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(usuarios) && usuarios.map((usuario) => (
              <tr 
                key={usuario.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Nombre */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {usuario.photo ? (
                        <img 
                          src={usuario.photo} 
                          alt={formatUserName(usuario)}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div 
                        className={`
                          h-10 w-10 rounded-full bg-[#948b54] flex items-center justify-center
                          ${usuario.photo ? 'hidden' : ''}
                        `}
                      >
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 font-poppins">
                        {formatUserName(usuario)}
                      </div>
                      <div className="text-sm text-gray-500 font-poppins">
                        {usuario.correo_electronico}
                      </div>
                    </div>
                  </div>
                </td>

                {/* CUIP */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-poppins font-mono">
                    {usuario.cuip || 'N/A'}
                  </div>
                </td>

                {/* Grado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-poppins">
                    {usuario.grado?.nombre || 'N/A'}
                  </div>
                </td>

                {/* Cargo */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-poppins">
                    {usuario.cargo?.nombre || 'N/A'}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    
                    {/* Botón Ver Estadísticas */}
                    <button
                      onClick={() => onViewStats(usuario)}
                      className="
                        inline-flex items-center px-2 py-1 text-xs font-medium
                        text-blue-700 bg-blue-100 rounded hover:bg-blue-200
                        transition-colors duration-150 font-poppins
                      "
                      title="Ver estadísticas"
                    >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Stats
                    </button>

                    {/* Botón Editar */}
                    {canEdit && (
                      <button
                        onClick={() => onEdit(usuario)}
                        className="
                          inline-flex items-center px-2 py-1 text-xs font-medium
                          text-green-700 bg-green-100 rounded hover:bg-green-200
                          transition-colors duration-150 font-poppins
                        "
                        title="Editar usuario"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                    )}

                    {/* Botón Eliminar */}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(usuario)}
                        className="
                          inline-flex items-center px-2 py-1 text-xs font-medium
                          text-red-700 bg-red-100 rounded hover:bg-red-200
                          transition-colors duration-150 font-poppins
                        "
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 font-poppins">
          <div>
            Mostrando {Array.isArray(usuarios) ? usuarios.length : 0} usuario{(Array.isArray(usuarios) ? usuarios.length : 0) !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            {filters.search && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>Filtrado por: {filters.searchBy}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosTable;