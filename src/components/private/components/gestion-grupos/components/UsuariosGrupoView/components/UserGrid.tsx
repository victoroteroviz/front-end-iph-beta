/**
 * @fileoverview Grid optimizado para mostrar usuarios del grupo
 * @version 1.0.0
 * @description Grid responsivo con funcionalidades avanzadas para mostrar usuarios
 */

import React, { useState, useMemo } from 'react';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Componentes
import { UserCard } from './UserCard';

//+ Interfaces
import type { IUsuarioGrupo } from '../../../../../../../interfaces/usuario-grupo';

interface UserGridProps {
  usuarios: IUsuarioGrupo[];
  isLoading?: boolean;
  onUserClick?: (usuario: IUsuarioGrupo) => void;
  selectedUserId?: string;
  showActions?: boolean;
  enableSorting?: boolean;
  enableViewToggle?: boolean;
}

type SortField = 'nombre' | 'cuip' | 'cup' | 'telefono';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

/**
 * Grid inteligente para mostrar usuarios con opciones de ordenamiento y vista
 */
export const UserGrid: React.FC<UserGridProps> = ({
  usuarios,
  isLoading = false,
  onUserClick,
  selectedUserId,
  showActions = false,
  enableSorting = true,
  enableViewToggle = true
}) => {
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Usuarios ordenados
  const sortedUsuarios = useMemo(() => {
    if (!enableSorting) return usuarios;

    return [...usuarios].sort((a, b) => {
      let aValue: string = '';
      let bValue: string = '';

      switch (sortField) {
        case 'nombre':
          aValue = a.nombreCompleto.toLowerCase();
          bValue = b.nombreCompleto.toLowerCase();
          break;
        case 'cuip':
          aValue = a.cuip?.toLowerCase() || '';
          bValue = b.cuip?.toLowerCase() || '';
          break;
        case 'cup':
          aValue = a.cup?.toLowerCase() || '';
          bValue = b.cup?.toLowerCase() || '';
          break;
        case 'telefono':
          aValue = a.telefono || '';
          bValue = b.telefono || '';
          break;
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [usuarios, sortField, sortDirection, enableSorting]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton: React.FC<{ field: SortField; label: string }> = ({ field, label }) => {
    const isActive = sortField === field;
    const Icon = isActive && sortDirection === 'desc' ? SortDesc : SortAsc;

    return (
      <button
        onClick={() => handleSort(field)}
        className={`
          inline-flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-all
          ${isActive
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }
        `}
      >
        <span>{label}</span>
        <Icon size={14} className={isActive ? 'text-blue-700' : 'text-gray-400'} />
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Skeleton del header de controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Skeleton del grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de ordenamiento y vista */}
      {(enableSorting || enableViewToggle) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Controles de ordenamiento */}
          {enableSorting && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
              <div className="flex items-center space-x-1">
                <SortButton field="nombre" label="Nombre" />
                <SortButton field="cuip" label="CUIP" />
                <SortButton field="cup" label="CUP" />
                <SortButton field="telefono" label="Teléfono" />
              </div>
            </div>
          )}

          {/* Toggle de vista */}
          {enableViewToggle && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Vista:</span>
              <div className="inline-flex rounded-lg border border-gray-300 bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`
                    inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-l-lg transition-all
                    ${viewMode === 'grid'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Grid size={14} />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`
                    inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-r-lg transition-all border-l border-gray-300
                    ${viewMode === 'list'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <List size={14} />
                  <span>Lista</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid de usuarios */}
      <div className={`
        ${viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
        }
      `}>
        {sortedUsuarios.map((usuario) => (
          <UserCard
            key={usuario.id}
            usuario={usuario}
            isSelected={selectedUserId === usuario.id}
            onClick={onUserClick}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Mensaje si no hay usuarios */}
      {sortedUsuarios.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
          >
            <Grid size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron usuarios
          </h3>
          <p className="text-gray-500">
            No hay usuarios que coincidan con los criterios de búsqueda y filtros.
          </p>
        </div>
      )}
    </div>
  );
};

export type { ViewMode, SortField, SortDirection };