/**
 * @fileoverview Componente de formulario para crear/editar grupos
 * @version 1.0.0
 * @description Formulario reutilizable para la gestión de grupos
 */

import React from 'react';
import { Save, X, ArrowLeft, Loader2, Shield, FileText, User } from 'lucide-react';
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
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm cursor-pointer disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <ArrowLeft size={16} />
          <span className="font-medium">Volver a la lista</span>
        </button>
      </div>

      {/* Tarjeta del formulario */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header mejorado */}
        <div className="border-b border-gray-100 p-6 pb-4">
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{ backgroundColor: COLORS.primaryLight20, color: COLORS.primary }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                {isEditMode ? MESSAGES.titles.editGrupo : MESSAGES.titles.newGrupo}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {MESSAGES.descriptions.formDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6">

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Campo: Nombre del Grupo */}
          <div className="space-y-2">
            <label
              htmlFor="nombre"
              className="flex items-center space-x-2 text-sm font-medium"
              style={{ color: COLORS.primary }}
            >
              <User size={16} />
              <span>{MESSAGES.labels.nombreGrupo}</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="nombre"
                type="text"
                value={formulario.nombre}
                onChange={(e) => onFieldChange('nombre', e.target.value)}
                className={`${
                  formulario.errors.nombre
                    ? COMMON_STYLES.input.replace('border-gray-300', 'border-red-300 focus:ring-red-500')
                    : COMMON_STYLES.input
                } transition-all duration-200`}
                placeholder={MESSAGES.placeholders.nombreGrupo}
                disabled={isSubmitting}
                maxLength={50}
                autoFocus
              />
              {/* Indicador de estado */}
              {formulario.nombre.trim() && !formulario.errors.nombre && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            {formulario.errors.nombre && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{formulario.errors.nombre}</span>
              </p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Nombre identificativo del grupo</span>
              <span className={formulario.nombre.length > 40 ? 'text-orange-500' : ''}>
                {formulario.nombre.length}/50 caracteres
              </span>
            </div>
          </div>

          {/* Campo: Descripción */}
          <div className="space-y-2">
            <label
              htmlFor="descripcion"
              className="flex items-center space-x-2 text-sm font-medium"
              style={{ color: COLORS.primary }}
            >
              <FileText size={16} />
              <span>{MESSAGES.labels.descripcion}</span>
              <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <div className="relative">
              <textarea
                id="descripcion"
                value={formulario.descripcion}
                onChange={(e) => onFieldChange('descripcion', e.target.value)}
                className={`${
                  formulario.errors.descripcion
                    ? COMMON_STYLES.input.replace('border-gray-300', 'border-red-300 focus:ring-red-500')
                    : COMMON_STYLES.input
                } resize-none transition-all duration-200`}
                placeholder={MESSAGES.placeholders.descripcionGrupo}
                disabled={isSubmitting}
                rows={4}
                maxLength={200}
              />
              {/* Indicador de progreso visual */}
              <div className="absolute bottom-2 right-2 opacity-50">
                <div className="w-1 h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-t from-blue-500 to-green-400 transition-all duration-300"
                    style={{
                      height: `${(formulario.descripcion.length / 200) * 100}%`,
                      backgroundColor: formulario.descripcion.length > 180 ? '#ef4444' :
                                      formulario.descripcion.length > 150 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            </div>
            {formulario.errors.descripcion && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{formulario.errors.descripcion}</span>
              </p>
            )}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Describe el propósito y función del grupo</span>
              <span className={formulario.descripcion.length > 180 ? 'text-red-500' :
                             formulario.descripcion.length > 150 ? 'text-orange-500' : 'text-gray-500'}>
                {formulario.descripcion.length}/200 caracteres
              </span>
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {isEditMode ? 'Modifica la información del grupo' : 'Todos los campos con * son obligatorios'}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className={`${COMMON_STYLES.button.secondary} hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed`}
                >
                  <X size={16} />
                  <span>{MESSAGES.buttons.cancel}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !formulario.nombre.trim()}
                  className={`inline-flex items-center space-x-2 px-6 py-2.5 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer`}
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
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
