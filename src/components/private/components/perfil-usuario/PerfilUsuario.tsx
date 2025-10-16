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

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, IdCard, Users, MapPin, Briefcase, Award, ArrowLeft } from 'lucide-react';

// Hook personalizado
import usePerfilUsuario from './hooks/usePerfilUsuario';

// Componentes layout
import { Breadcrumbs, type BreadcrumbItem } from '../../layout/breadcrumbs';

// Componentes atómicos
import FormField from './components/FormField';
import RolesSelector from './components/RolesSelector';
import LoadingSpinner from './components/LoadingSpinner';
import ActionButtons from './components/ActionButtons';
import FormSection from './components/FormSection';
import GradosSelector from './components/GradosSelector';
import CargosSelector from './components/CargosSelector';
import MunicipiosSelector from './components/MunicipiosSelector';
import AdscripcionesSelector from './components/AdscripcionesSelector';
import ConfirmationModal from './components/ConfirmationModal';

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
  onCancel,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    state,
    updateFormData,
    handleSubmit,
    handleCancel,
    handleRoleChange,
    canSubmit,
    showConfirmationModal,
    handleConfirmUpdate,
    handleCancelUpdate
  } = usePerfilUsuario();

  // Handler para volver atrás
  const handleGoBack = () => {
    // Si viene de edición de usuario, volver a usuarios
    // Si viene de perfil propio, volver a inicio
    if (location.pathname.includes('/usuarios/')) {
      navigate('/usuarios');
    } else {
      navigate('/inicio');
    }
    logInfo('PerfilUsuario', 'Usuario regresó a la vista anterior');
  };

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

  // Breadcrumbs dinámicos
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [];

    if (location.pathname.includes('/usuarios/')) {
      // Viene de gestión de usuarios
      items.push({ label: 'Gestión de Usuarios', path: '/usuarios' });

      if (location.pathname.includes('/nuevo')) {
        items.push({ label: 'Nuevo Usuario', isActive: true });
      } else if (location.pathname.includes('/editar/')) {
        items.push({
          label: formData.nombre
            ? `Editar: ${formData.nombre} ${formData.primerApellido}`
            : 'Editar Usuario',
          isActive: true
        });
      }
    } else {
      // Es perfil propio
      items.push({ label: 'Mi Perfil', isActive: true });
    }

    return items;
  }, [location.pathname, formData.nombre, formData.primerApellido]);

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
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="perfil-usuario">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner
              size="large"
              message={isCatalogsLoading ? "Cargando formulario..." : "Cargando datos del usuario..."}
            />
          </div>
        </div>
      </div>
    );
  }

  // Verificar permisos
  if (!canEdit && !canCreate) {
    return (
      <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="perfil-usuario">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-yellow-600 text-lg font-medium mb-2 font-poppins">
              Acceso Restringido
            </div>
            <p className="text-yellow-700 font-poppins">
              No tienes permisos para {isEditing ? 'editar este usuario' : 'crear usuarios'}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 ${className}`} data-component="perfil-usuario">
      <div className="max-w-7xl mx-auto">

        {/* Breadcrumbs con botón de regreso */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbItems} />

          <button
            onClick={handleGoBack}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 font-semibold shadow-sm
              text-[#4d4725] bg-white border-gray-300
              hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:scale-105
              active:scale-95
              cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 font-poppins
            "
            title="Volver a la vista anterior"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Regresar</span>
          </button>
        </div>

        {/* Header principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#948b54] rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4d4725] font-poppins">
                {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h1>
              <p className="text-gray-600 font-poppins">
                {isEditing
                  ? 'Modifica la información del usuario y sus permisos'
                  : 'Completa todos los campos para crear un nuevo usuario'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
              placeholder="Segundo apellido"
              required
              autoComplete="family-name"
            />
            
            <FormField
              label="Sexo"
              type="select"
              value={formData.sexoId}
              onChange={(value) => updateFormData({ sexoId: value })}
              error={formErrors.sexoId}
              options={sexos}
              placeholder="Selecciona un sexo"
              showPlaceholderOption={true}
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
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Debe proporcionar al menos uno de los códigos de identificación (CUIP o CUP).
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              label="CUIP (opcional si tiene CUP)"
              value={formData.cuip}
              onChange={(value) => updateFormData({ cuip: value })}
              error={formErrors.cuip}
              placeholder="Código CUIP (mín. 8 caracteres)"
            />

            <FormField
              label="CUP (opcional si tiene CUIP)"
              value={formData.cup}
              onChange={(value) => updateFormData({ cup: value })}
              error={formErrors.cup}
              placeholder="Código CUP (mín. 8 caracteres)"
            />
          </div>
        </FormSection>

        {/* Sección: Información Profesional */}
        <FormSection title="Información Profesional" icon={Briefcase}>
          <div className="grid md:grid-cols-2 gap-4">
            <GradosSelector
              grados={Array.isArray(grados) ? grados.map(g => ({ id: Number(g.id), nombre: g.nombre })) : []}
              selectedGradoId={formData.gradoId}
              onSelect={(gradoId) => updateFormData({ gradoId })}
              error={formErrors.gradoId}
              disabled={isSubmitting}
              loading={isCatalogsLoading}
              required
            />

            <CargosSelector
              cargos={Array.isArray(cargos) ? cargos : []}
              selectedCargoId={formData.cargoId}
              onSelect={(cargoId) => updateFormData({ cargoId })}
              error={formErrors.cargoId}
              loading={isCatalogsLoading}
              disabled={isSubmitting}
              required
            />
          </div>
        </FormSection>

        {/* Sección: Ubicación */}
        <FormSection title="Ubicación y Adscripción" icon={MapPin}>
          <div className="grid md:grid-cols-2 gap-4">
            <MunicipiosSelector
              municipios={Array.isArray(municipios) ? municipios : []}
              selectedMunicipioId={formData.municipioId}
              onSelect={(municipioId) => updateFormData({ municipioId })}
              error={formErrors.municipioId}
              loading={isCatalogsLoading}
              disabled={isSubmitting}
              required
            />
            
            <AdscripcionesSelector
              adscripciones={Array.isArray(adscripciones) ? adscripciones : []}
              selectedAdscripcionId={formData.adscripcionId}
              onSelect={(adscripcionId) => updateFormData({ adscripcionId })}
              error={formErrors.adscripcionId}
              loading={isCatalogsLoading}
              disabled={isSubmitting}
              required
            />
          </div>
        </FormSection>

        {/* Sección: Seguridad (disponible tanto para creación como edición) */}
        <FormSection title="Seguridad" icon={Award}>
          <div className="grid md:grid-cols-1 gap-4">
            {/* Información adicional para modo edición */}
            {isEditing && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Deja este campo vacío si no deseas cambiar la contraseña.
                </p>
              </div>
            )}

            <FormField
              label={isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(value) => updateFormData({ password: value })}
              error={formErrors.password}
              placeholder={isEditing ? "Ingresa nueva contraseña (opcional)" : "Ingresa tu contraseña"}
              required={!isEditing}
              autoComplete="new-password"
            />

              {/* Requisitos de contraseña - Lista dinámica siempre visible */}
              <div className="mt-3 text-sm bg-[#fdf7f1] p-3 rounded-lg border border-[#c2b186]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 bg-[#948b54] rounded-full text-white text-xs font-bold">
                    !
                  </span>
                  <strong className="text-[#4d4725] font-medium">Requisitos de contraseña:</strong>
                </div>
                <ul className="list-none space-y-1.5">
                  <li className={`flex items-center gap-2 transition-colors duration-200 ${
                    formData.password.length >= 8 && formData.password.length <= 12
                      ? 'text-green-600'
                      : 'text-[#6b6b6b]'
                  }`}>
                    <span className={`w-4 h-4 text-center font-bold ${
                      formData.password.length >= 8 && formData.password.length <= 12
                        ? 'text-green-600'
                        : 'text-[#6b6b6b]'
                    }`}>
                      {formData.password.length >= 8 && formData.password.length <= 12 ? '✓' : '•'}
                    </span>
                    Entre 8 y 12 caracteres {formData.password ? `(${formData.password.length}/12)` : ''}
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-200 ${
                    (formData.password.match(/[A-Z]/g) || []).length >= 2
                      ? 'text-green-600'
                      : 'text-[#6b6b6b]'
                  }`}>
                    <span className={`w-4 h-4 text-center font-bold ${
                      (formData.password.match(/[A-Z]/g) || []).length >= 2
                        ? 'text-green-600'
                        : 'text-[#6b6b6b]'
                    }`}>
                      {(formData.password.match(/[A-Z]/g) || []).length >= 2 ? '✓' : '•'}
                    </span>
                    Mínimo 2 letras mayúsculas {formData.password ? `(${(formData.password.match(/[A-Z]/g) || []).length}/2)` : ''}
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-200 ${
                    (formData.password.match(/[0-9]/g) || []).length >= 2
                      ? 'text-green-600'
                      : 'text-[#6b6b6b]'
                  }`}>
                    <span className={`w-4 h-4 text-center font-bold ${
                      (formData.password.match(/[0-9]/g) || []).length >= 2
                        ? 'text-green-600'
                        : 'text-[#6b6b6b]'
                    }`}>
                      {(formData.password.match(/[0-9]/g) || []).length >= 2 ? '✓' : '•'}
                    </span>
                    Mínimo 2 números {formData.password ? `(${(formData.password.match(/[0-9]/g) || []).length}/2)` : ''}
                  </li>
                  <li className={`flex items-center gap-2 transition-colors duration-200 ${
                    (formData.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2
                      ? 'text-green-600'
                      : 'text-[#6b6b6b]'
                  }`}>
                    <span className={`w-4 h-4 text-center font-bold ${
                      (formData.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2
                        ? 'text-green-600'
                        : 'text-[#6b6b6b]'
                    }`}>
                      {(formData.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2 ? '✓' : '•'}
                    </span>
                    Mínimo 2 caracteres especiales {formData.password ? `(${(formData.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length}/2)` : ''}
                  </li>
                </ul>
              </div>
            </div>
          </FormSection>

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
            onSave={handleSubmit}
            onCancel={onCancel || handleCancel}
          />
        </div>
          </form>
        </div>

        {/* Modal de Confirmación para Actualización */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          title="Confirmar Actualización"
          message="¿Está seguro que desea actualizar la información de este usuario? Esta acción modificará permanentemente los datos del usuario en el sistema."
          confirmText="Sí, Actualizar"
          cancelText="Cancelar"
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
          type="warning"
        />
      </div>
    </div>
  );
};

export default PerfilUsuario;