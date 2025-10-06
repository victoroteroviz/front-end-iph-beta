/**
 * @fileoverview Componente de tarjeta de grupo reutilizable
 * @version 1.0.0
 * @description Tarjeta para mostrar información de un grupo (DRY)
 */

import React from 'react';
import { Users, Edit, Eye, Loader2 } from 'lucide-react';
import { COLORS, COMMON_STYLES } from '../../constants/theme.constants';
import type { IGrupoUsuario } from '../../../../../../interfaces/usuario-grupo';

interface GrupoCardProps {
  grupo: IGrupoUsuario;
  onEdit?: (grupo: IGrupoUsuario) => void;
  onView?: (grupo: IGrupoUsuario) => void;
  onClick?: (grupo: IGrupoUsuario) => void;
  showActions?: boolean;
  isUpdating?: boolean;
  canEdit?: boolean;
}

/**
 * Componente de tarjeta de grupo reutilizable y memoizado
 * Evita re-renders innecesarios con React.memo
 */
export const GrupoCard: React.FC<GrupoCardProps> = React.memo(({
  grupo,
  onEdit,
  onView,
  onClick,
  showActions = true,
  isUpdating = false,
  canEdit = false,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(grupo);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(grupo);
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(grupo);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${COMMON_STYLES.card} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Header del grupo */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
          >
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: COLORS.primary }}>
              {grupo.nombreGrupo}
            </h3>
            <p className="text-sm text-gray-500">
              {grupo.cantidadUsuarios} {grupo.cantidadUsuarios === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción del grupo */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-2">
          {grupo.descripcionGrupo || 'Sin descripción'}
        </p>
      </div>

      {/* Estado */}
      <div className="mb-4">
        <span
          className={
            grupo.estatus
              ? COMMON_STYLES.badge.success
              : COMMON_STYLES.badge.error
          }
        >
          {grupo.estatus ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
          {canEdit && onEdit && (
            <button
              onClick={handleEdit}
              disabled={isUpdating}
              className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50 transition-colors duration-200"
              title="Editar Grupo"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Edit size={16} />
              )}
            </button>
          )}
          {onView && (
            <button
              onClick={handleView}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              title="Ver Usuarios del Grupo"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para optimizar re-renders
  return (
    prevProps.grupo.id === nextProps.grupo.id &&
    prevProps.grupo.nombreGrupo === nextProps.grupo.nombreGrupo &&
    prevProps.grupo.cantidadUsuarios === nextProps.grupo.cantidadUsuarios &&
    prevProps.grupo.estatus === nextProps.grupo.estatus &&
    prevProps.isUpdating === nextProps.isUpdating
  );
});

GrupoCard.displayName = 'GrupoCard';
