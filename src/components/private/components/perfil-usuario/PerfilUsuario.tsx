/**
 * Componente PerfilUsuario - Refactorizado con TypeScript y arquitectura moderna
 * 
 * CARACTERÍSTICAS:
 * - Gestión completa CRUD de usuarios (crear/editar/ver)
 * - Control de acceso por roles (SuperAdmin, Admin, Usuario actual)
 * - Validación robusta con Zod
 * - Sistema de notificaciones integrado
 * - Componentes atómicos reutilizables
 * - Hook personalizado para lógica de negocio
 * - Migrado de localStorage → sessionStorage
 * - Logging completo de eventos
 * 
 * @author Equipo IPH
 * @version 2.0.0
 */

import React, { useEffect } from 'react';
import { User, Mail, Phone, IdCard, Users, MapPin, Briefcase, Award } from 'lucide-react';

// Hook personalizado
import usePerfilUsuario from './hooks/usePerfilUsuario';

// Componentes atómicos
import FormField from './components/FormField';
import RolesSelector from './components/RolesSelector';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButtons from './components/ActionButtons';
import FormSection from './components/FormSection';

// Helpers
import { logInfo } from '../../../../helper/log/logger.helper';

// Interfaces
import type { IPerfilUsuarioProps } from '../../../../interfaces/components/perfilUsuario.interface';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

const PerfilUsuario: React.FC<IPerfilUsuarioProps> = ({
  userId,
  mode = 'edit',
  onSave,
  onCancel,
  className = ''
}) => {
  const {
    state,
    updateFormData,
    handleSubmit,
    handleCancel,
    handleRoleChange,
    canSubmit
  } = usePerfilUsuario();

  const {
    formData,
    formErrors,
    isLoading,
    isSubmitting,
    isCatalogsLoading,
    grados,
    cargos,
    municipios,
    adscripciones,
    sexos,
    rolesDisponibles,
    isEditing,
    canEdit,
    canCreate,
    canViewSensitiveData
  } = state;

  // Log del componente al montar
  useEffect(() => {
    logInfo('PerfilUsuario', 'Componente montado', {
      userId,
      mode,
      isEditing,
      canEdit,
      canCreate
    });
  }, [userId, mode, isEditing, canEdit, canCreate]);

  // Estado de carga general
  if (isLoading || isCatalogsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner 
          size="large" 
          message={isCatalogsLoading ? "Cargando formulario..." : "Cargando datos del usuario..."}
        />
      </div>
    );
  }

  // Verificar permisos
  if (!canEdit && !canCreate) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-600 text-lg font-medium mb-2">
            Acceso Restringido
          </div>
          <p className="text-yellow-700">
            No tienes permisos para {isEditing ? 'editar este usuario' : 'crear usuarios'}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto p-6 font-poppins ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#4d4725] mb-2">
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Modifica la información del usuario y sus permisos'
            : 'Completa todos los campos para crear un nuevo usuario'
          }
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        
        {/* Sección: Información Personal */}
        <FormSection title="Información Personal" icon={User}>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Nombre"
              value={formData.nombre}
              onChange={(value) => updateFormData({ nombre: value })}
              error={formErrors.nombre}
              placeholder="Nombre completo"
              required
              autoComplete="given-name"
            />
            
            <FormField
              label="Primer Apellido"
              value={formData.primerApellido}
              onChange={(value) => updateFormData({ primerApellido: value })}
              error={formErrors.primerApellido}
              placeholder="Primer apellido"
              required
              autoComplete="family-name"
            />
            
            <FormField
              label="Segundo Apellido"
              value={formData.segundoApellido}
              onChange={(value) => updateFormData({ segundoApellido: value })}
              error={formErrors.segundoApellido}
              placeholder="Segundo apellido (opcional)"
              autoComplete="family-name"
            />
            
            <FormField
              label="Sexo"
              type="select"
              value={formData.sexoId}
              onChange={(value) => updateFormData({ sexoId: value })}
              error={formErrors.sexoId}
              options={sexos}
              required
            />
          </div>
        </FormSection>

        {/* Sección: Información de Contacto */}
        <FormSection title="Información de Contacto" icon={Mail}>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Correo Electrónico"
              type="email"
              value={formData.correo}
              onChange={(value) => updateFormData({ correo: value })}
              error={formErrors.correo}
              placeholder="usuario@iph.gob.mx"
              required
              autoComplete="email"
            />
            
            <FormField
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(value) => updateFormData({ telefono: value })}
              error={formErrors.telefono}
              placeholder="5551234567"
              required
              autoComplete="tel"
            />
          </div>
        </FormSection>

        {/* Sección: Identificación */}
        <FormSection title="Identificación" icon={IdCard}>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="CUIP"
              value={formData.cuip}
              onChange={(value) => updateFormData({ cuip: value })}
              error={formErrors.cuip}
              placeholder="Código CUIP"
              required
            />
            
            <FormField
              label="CUP"
              value={formData.cup}
              onChange={(value) => updateFormData({ cup: value })}
              error={formErrors.cup}
              placeholder="Código CUP"
              required
            />
          </div>
        </FormSection>

        {/* Sección: Información Profesional */}
        <FormSection title="Información Profesional" icon={Briefcase}>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Grado"
              type="select"
              value={formData.gradoId}
              onChange={(value) => updateFormData({ gradoId: value })}
              error={formErrors.gradoId}
              options={grados}
              required
            />
            
            <FormField
              label="Cargo"
              type="select"
              value={formData.cargoId}
              onChange={(value) => updateFormData({ cargoId: value })}
              error={formErrors.cargoId}
              options={cargos}
              required
            />
          </div>
        </FormSection>

        {/* Sección: Ubicación */}
        <FormSection title="Ubicación y Adscripción" icon={MapPin}>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="Municipio"
              type="select"
              value={formData.municipioId}
              onChange={(value) => updateFormData({ municipioId: value })}
              error={formErrors.municipioId}
              options={municipios}
              required
            />
            
            <FormField
              label="Adscripción"
              type="select"
              value={formData.adscripcionId}
              onChange={(value) => updateFormData({ adscripcionId: value })}
              error={formErrors.adscripcionId}
              options={adscripciones}
              required
            />
          </div>
        </FormSection>

        {/* Sección: Seguridad (solo para creación) */}
        {!isEditing && (
          <FormSection title="Seguridad" icon={Award}>
            <div className="grid md:grid-cols-1 gap-4">
              <FormField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(value) => updateFormData({ password: value })}
                error={formErrors.password}
                placeholder="Mínimo 8 caracteres"
                required={!isEditing}
                autoComplete="new-password"
              />
              
              {formData.password && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <strong>Requisitos de contraseña:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                      Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                      Al menos una mayúscula
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-red-600'}>
                      Al menos un número
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {/* Sección: Roles (solo si puede editar roles) */}
        {canViewSensitiveData && (
          <FormSection title="Roles y Permisos" icon={Users}>
            <RolesSelector
              rolesDisponibles={rolesDisponibles}
              rolesSeleccionados={formData.rolesSeleccionados}
              onChange={handleRoleChange}
              error={formErrors.rolesSeleccionados}
              disabled={isSubmitting}
              canEditRoles={canViewSensitiveData}
            />
            
            {formData.rolesSeleccionados.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Los cambios en roles afectarán los permisos del usuario 
                  de manera inmediata tras guardar.
                </p>
              </div>
            )}
          </FormSection>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <ActionButtons
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            onSave={onSave || handleSubmit}
            onCancel={onCancel || handleCancel}
          />
        </div>
      </form>
    </div>
  );
};

export default PerfilUsuario;