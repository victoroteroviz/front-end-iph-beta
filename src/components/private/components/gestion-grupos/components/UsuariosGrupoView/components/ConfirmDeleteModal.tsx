/**
 * @fileoverview Modal de confirmación para eliminar usuario
 * @version 1.0.0
 * @description Modal reutilizable con animaciones y diseño moderno
 */

import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { COLORS } from '../../../constants';

interface ConfirmDeleteModalProps {
  /** Indica si el modal está abierto */
  isOpen: boolean;
  /** Nombre del usuario a eliminar */
  userName: string;
  /** Nombre del grupo */
  groupName?: string;
  /** Indica si la operación está en progreso */
  isDeleting?: boolean;
  /** Callback al confirmar */
  onConfirm: () => void;
  /** Callback al cancelar */
  onCancel: () => void;
}

/**
 * Modal de confirmación para eliminar usuario del grupo
 */
export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  userName,
  groupName,
  isDeleting = false,
  onConfirm,
  onCancel
}) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop con desenfoque gaussiano y animación */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-all duration-300"
        onClick={!isDeleting ? onCancel : undefined}
        style={{
          animation: 'backdropFadeIn 0.3s ease-out'
        }}
      />

      {/* Modal con animación */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 opacity-100 ring-1 ring-black/5"
        style={{
          animation: 'modalFadeIn 0.3s ease-out',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Botón cerrar */}
        {!isDeleting && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        {/* Icono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          ¿Eliminar usuario del grupo?
        </h2>

        {/* Mensaje */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-3">
            Estás a punto de eliminar a:
          </p>
          <p className="font-semibold text-gray-900 mb-1">
            {userName}
          </p>
          {groupName && (
            <p className="text-sm text-gray-500">
              Del grupo: <span className="font-medium">{groupName}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-4">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-3">
          {/* Botón cancelar */}
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
              ${isDeleting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer active:scale-95'
              }
            `}
          >
            Cancelar
          </button>

          {/* Botón confirmar */}
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
              shadow-sm
              ${isDeleting
                ? 'bg-red-400 text-white cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer active:scale-95'
              }
            `}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Eliminando...
              </span>
            ) : (
              'Sí, eliminar'
            )}
          </button>
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Asegurar que el backdrop blur funcione en todos los navegadores */
        .backdrop-blur-md {
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
};
