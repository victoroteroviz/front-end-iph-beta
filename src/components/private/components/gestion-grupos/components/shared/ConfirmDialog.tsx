/**
 * @fileoverview Modal de confirmación reutilizable
 * @version 1.0.0
 * @description Modal personalizado para confirmaciones con mejor UX que window.confirm
 */

import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { COLORS, COMMON_STYLES } from '../../constants/theme.constants';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

/**
 * Modal de confirmación personalizado
 * Reemplaza window.confirm con mejor UX y accesibilidad
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeColors = {
    danger: { bg: COLORS.errorBg, text: COLORS.errorText, icon: COLORS.error },
    warning: { bg: COLORS.warningBg, text: COLORS.warningText, icon: COLORS.warning },
    info: { bg: COLORS.infoBg, text: COLORS.infoText, icon: COLORS.info },
  };

  const colors = typeColors[type];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.bg }}
            >
              <AlertCircle size={20} style={{ color: colors.icon }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`${COMMON_STYLES.button.secondary} cursor-pointer disabled:cursor-not-allowed`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: type === 'danger' ? COLORS.error : COLORS.primary
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';
