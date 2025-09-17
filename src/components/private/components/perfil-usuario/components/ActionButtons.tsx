/**
 * Componente atómico ActionButtons
 * Botones de acción para guardar/cancelar
 */

import React from 'react';
import { Save, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ActionButtonsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  isSubmitting,
  canSubmit,
  onSave,
  onCancel,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* Botón Regresar/Cancelar */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-medium font-poppins cursor-pointer disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {isEditing ? 'Cancelar' : 'Regresar'}
      </button>

      {/* Botón Guardar/Crear */}
      <button
        type="button"
        onClick={onSave}
        disabled={!canSubmit || isSubmitting}
        className={`
          flex items-center justify-center px-6 py-2 text-white font-medium rounded transition-all duration-200 font-poppins
          ${canSubmit && !isSubmitting
            ? 'bg-[#948b54] hover:bg-[#7d7548] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="small" color="white" />
            <span className="ml-2">
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
          </>
        )}
      </button>
    </div>
  );
};

export default ActionButtons;