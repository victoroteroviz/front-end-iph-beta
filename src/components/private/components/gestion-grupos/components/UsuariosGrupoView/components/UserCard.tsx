/**
 * @fileoverview Componente atómico para tarjeta de usuario
 * @version 2.0.0
 * @description Tarjeta individual optimizada para mostrar información de usuario con acción de eliminar
 */

import React from 'react';
import { UserCircle, Phone, Hash, IdCard, Trash2, Loader2 } from 'lucide-react';
import { COLORS } from '../../../constants';

//+ Interfaces
import type { IUsuarioGrupo } from '../../../../../../../interfaces/usuario-grupo';

interface UserCardProps {
  usuario: IUsuarioGrupo;
  onDelete?: (usuarioId: string) => void;
  isDeleting?: boolean;
  showActions?: boolean;
}

/**
 * Componente que renderiza una tarjeta de usuario con información detallada
 */
export const UserCard: React.FC<UserCardProps> = React.memo(({
  usuario,
  onDelete,
  isDeleting = false,
  showActions = false
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && !isDeleting) {
      onDelete(usuario.id);
    }
  };

  return (
    <div
      className={`
        relative bg-white border-2 rounded-xl p-5 transition-all duration-300
        border-gray-200
        ${isDeleting && 'opacity-60'}
      `}
    >
      {/* Botón de eliminar en la esquina superior derecha */}
      {onDelete && showActions && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10 hover:scale-125 hover:rotate-6 active:scale-110"
          style={{
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
          title="Eliminar Usuario del Grupo"
        >
          {isDeleting ? (
            <Loader2 className="animate-spin cursor-pointer" size={18} />
          ) : (
            <Trash2 className="cursor-pointer" size={18} />
          )}
        </button>
      )}

      {/* Header del usuario */}
      <div className="flex items-start space-x-4 mb-4 pr-8">{/* Agregado pr-8 para espacio del botón */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
        >
          <UserCircle size={28} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 break-words">
            {usuario.nombreCompleto}
          </h3>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Hash size={12} />
            <span className="font-mono">{usuario.id}</span>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="space-y-3">
        {/* CUIP */}
        {usuario.cuip && (
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IdCard size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CUIP</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{usuario.cuip}</p>
            </div>
          </div>
        )}

        {/* CUP */}
        {usuario.cup && (
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <IdCard size={16} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">CUP</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{usuario.cup}</p>
            </div>
          </div>
        )}

        {/* Teléfono */}
        {usuario.telefono && (
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
              <p className="text-sm font-semibold text-gray-900">{usuario.telefono}</p>
            </div>
          </div>
        )}
      </div>

      {/* Badge de estado si no tiene información adicional */}
      {!usuario.cuip && !usuario.cup && !usuario.telefono && (
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Información limitada
          </span>
        </div>
      )}
    </div>
  );
});

UserCard.displayName = 'UserCard';