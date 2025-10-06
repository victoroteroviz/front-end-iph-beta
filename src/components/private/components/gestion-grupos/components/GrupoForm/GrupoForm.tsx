/**
 * @fileoverview Componente de formulario para crear/editar grupos
 * @version 1.0.0
 * @description Formulario reutilizable para la gestión de grupos
 */

import React from 'react';
import { Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { COLORS, MESSAGES, COMMON_STYLES } from '../../constants';

//+ Interfaces
import type { IGrupo } from '../../../../../../interfaces/grupos';

interface GrupoFormProps {
  grupo?: IGrupo | null;
  formulario: {
    nombre: string;
    descripcion: string;
    errors: {
      nombre?: string;
      descripcion?: string;
    };
  };
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFieldChange: (field: 'nombre' | 'descripcion', value: string) => void;
}

/**
 * Componente de formulario para crear/editar grupos
 */
export const GrupoForm: React.FC<GrupoFormProps> = ({
  grupo,
  formulario,
  isSubmitting,
  onSubmit,
  onCancel,
  onFieldChange,
}) => {
  const isEditMode = !!grupo;

  return (
    <div className="space-y-6">
      {/* Botón de retorno */}
      <div className="flex items-center justify-start">
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Volver a la lista</span>
        </button>
      </div>

      {/* Tarjeta del formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
            {isEditMode ? MESSAGES.titles.editGrupo : MESSAGES.titles.newGrupo}
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Campo: Nombre del Grupo */}
          <div>
            <label 
              htmlFor="nombre" 
              className="block text-sm font-medium mb-2" 
              style={{ color: COLORS.primary }}
            >
              {MESSAGES.labels.nombreGrupo} <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={formulario.nombre}
              onChange={(e) => onFieldChange('nombre', e.target.value)}
              className={
                formulario.errors.nombre 
                  ? COMMON_STYLES.input.replace('border-gray-300', 'border-red-300 focus:ring-red-500')
                  : COMMON_STYLES.input
              }
              placeholder={MESSAGES.placeholders.nombreGrupo}
              disabled={isSubmitting}
              maxLength={50}
              autoFocus
            />
            {formulario.errors.nombre && (
              <p className="mt-1 text-sm text-red-600">
                {formulario.errors.nombre}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formulario.nombre.length}/50 caracteres
            </p>
          </div>

          {/* Campo: Descripción */}
          <div>
            <label 
              htmlFor="descripcion" 
              className="block text-sm font-medium mb-2" 
              style={{ color: COLORS.primary }}
            >
              {MESSAGES.labels.descripcion}
            </label>
            <textarea
              id="descripcion"
              value={formulario.descripcion}
              onChange={(e) => onFieldChange('descripcion', e.target.value)}
              className={`${
                formulario.errors.descripcion 
                  ? COMMON_STYLES.input.replace('border-gray-300', 'border-red-300 focus:ring-red-500')
                  : COMMON_STYLES.input
              } resize-none`}
              placeholder={MESSAGES.placeholders.descripcionGrupo}
              disabled={isSubmitting}
              rows={3}
              maxLength={200}
            />
            {formulario.errors.descripcion && (
              <p className="mt-1 text-sm text-red-600">
                {formulario.errors.descripcion}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formulario.descripcion.length}/200 caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={COMMON_STYLES.button.secondary}
            >
              <X size={16} />
              <span>{MESSAGES.buttons.cancel}</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !formulario.nombre.trim()}
              className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              style={{ backgroundColor: COLORS.primary }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {isEditMode ? MESSAGES.buttons.updateGrupo : MESSAGES.buttons.createGrupo}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
