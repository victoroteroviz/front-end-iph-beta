/**
 * Componente VirtualizedTable
 * Tabla virtualizada para renderizar grandes conjuntos de datos de forma eficiente
 */

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  BarChart3, 
  User,
  Users
} from 'lucide-react';
import type { IUsuariosTableProps } from '../../../../../interfaces/components/usuarios.interface';
import type { IPaginatedUsers } from '../../../../../interfaces/user/crud/get-paginated.users.interface';

const ROW_HEIGHT = 80;
const VISIBLE_ROWS = 10;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

const VirtualizedTable: React.FC<IUsuariosTableProps> = ({
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
  
  const columns = useMemo(() => [
    { key: 'nombre', label: 'Nombre', width: '35%', sortable: true },
    { key: 'cuip', label: 'CUIP', width: '15%', sortable: true },
    { key: 'gradoId', label: 'Grado', width: '15%', sortable: true },
    { key: 'cargoId', label: 'Cargo', width: '15%', sortable: true },
    { key: 'actions', label: 'Acciones', width: '20%', sortable: false }
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

  // Componente de fila virtualizada
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const usuario = usuarios[index];
    
    return (
      <div style={style} className="flex items-center border-b border-gray-200 hover:bg-gray-50 px-6">
        
        {/* Nombre - 35% */}
        <div className="flex items-center" style={{ width: '35%' }}>
          <div className="flex-shrink-0 h-10 w-10 mr-4">
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
              className={`h-10 w-10 rounded-full bg-[#948b54] flex items-center justify-center ${usuario.photo ? 'hidden' : ''}`}
            >
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate font-poppins">
              {formatUserName(usuario)}
            </div>
            <div className="text-sm text-gray-500 truncate font-poppins">
              {usuario.correo_electronico}
            </div>
          </div>
        </div>

        {/* CUIP - 15% */}
        <div className="text-sm text-gray-900 font-poppins font-mono truncate" style={{ width: '15%' }}>
          {usuario.cuip || 'N/A'}
        </div>

        {/* Grado - 15% */}
        <div className="text-sm text-gray-900 font-poppins truncate" style={{ width: '15%' }}>
          {usuario.grado?.nombre || 'N/A'}
        </div>

        {/* Cargo - 15% */}
        <div className="text-sm text-gray-900 font-poppins truncate" style={{ width: '15%' }}>
          {usuario.cargo?.nombre || 'N/A'}
        </div>

        {/* Acciones - 20% */}
        <div className="flex items-center gap-1" style={{ width: '20%' }}>
          <button
            onClick={() => onViewStats(usuario)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors duration-150 font-poppins"
            title="Ver estadísticas"
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Stats
          </button>

          {canEdit && (
            <button
              onClick={() => onEdit(usuario)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors duration-150 font-poppins"
              title="Editar usuario"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Editar
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(usuario)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors duration-150 font-poppins"
              title="Eliminar usuario"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    );
  }, [usuarios, canEdit, canDelete, onEdit, onDelete, onViewStats]);

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

      {/* Header de tabla */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center px-6 py-3">
          {columns.map((column) => (
            <div
              key={column.key}
              style={{ width: column.width }}
              className={`text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none rounded px-2 py-1' : ''
              }`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-1">
                <span>{column.label}</span>
                {column.sortable && getSortIcon(column.key)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista virtualizada */}
      <div style={{ height: `${Math.min(CONTAINER_HEIGHT, usuarios.length * ROW_HEIGHT)}px` }}>
        <List
          height={Math.min(CONTAINER_HEIGHT, usuarios.length * ROW_HEIGHT)}
          itemCount={usuarios.length}
          itemSize={ROW_HEIGHT}
          overscanCount={5}
        >
          {Row}
        </List>
      </div>

      {/* Footer con información adicional */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 font-poppins">
          <div>
            Mostrando {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
          </div>
          <div className="text-xs text-gray-500">
            Tabla virtualizada para mejor rendimiento
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable;