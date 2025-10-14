/**
 * Modal de Confirmación de Eliminación
 * Modal personalizado para confirmar la eliminación de usuarios
 */

import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import type { IPaginatedUsers } from '../../../../../interfaces/user/crud/get-paginated.users.interface';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  usuario: IPaginatedUsers | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  usuario,
  isDeleting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay con desenfoque gaussiano */}
      <div 
        className="absolute inset-0 backdrop-blur-md bg-white/30 transition-all"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-900 font-poppins">
                Confirmar Eliminación
              </h3>
            </div>
            {!isDeleting && (
              <button
                onClick={onCancel}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="mb-4">
            <p className="text-gray-700 font-poppins mb-3">
              ¿Estás seguro de que quieres eliminar al siguiente usuario?
            </p>
            
            {/* Información del usuario */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-poppins">Nombre:</span>
                  <span className="text-sm font-semibold text-gray-900 font-poppins">
                    {usuario.nombre} {usuario.primer_apellido} {usuario.segundo_apellido}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-poppins">Email:</span>
                  <span className="text-sm font-medium text-gray-900 font-poppins">
                    {usuario.correo_electronico}
                  </span>
                </div>
                {usuario.cuip && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-poppins">CUIP:</span>
                    <span className="text-sm font-medium text-gray-900 font-poppins">
                      {usuario.cuip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-poppins">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
              Se eliminarán todos los datos asociados al usuario.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="
                px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                border border-gray-300 rounded-lg
                hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
                transition-colors duration-200 font-poppins
              "
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium 
                text-white bg-red-600 rounded-lg
                hover:bg-red-700 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer
                transition-colors duration-200 font-poppins
              "
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Sí, Eliminar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
