/**
 * @fileoverview Gestión de Grupos Optimizada
 * @version 3.0.0
 * @description Componente simplificado para gestión CRUD de grupos
 */

import React from 'react';
import {
  Users,
  Shield,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Breadcrumbs, type BreadcrumbItem } from '../../layout/breadcrumbs';

//+ Hooks personalizados
import { useGestionGruposUnificado } from './hooks/useGestionGruposUnificado';
import { useNavigationHistory } from './hooks/useNavigationHistory';

//+ Componentes
import { SearchInput, GrupoCard, ConfirmDialog } from './components/shared';
import { GrupoForm } from './components/GrupoForm';
import { UsuariosGrupoView } from './components/UsuariosGrupoView';

//+ Constantes
import { COLORS, MESSAGES } from './constants';

//+ Interfaces
import type { IGrupoUsuario } from '../../../../interfaces/usuario-grupo';

/**
 * @component GestionGrupos
 * @description Componente principal para gestión de grupos
 */
const GestionGrupos: React.FC = () => {
  // Estado local para vistas especiales
  const [vistaUsuarios, setVistaUsuarios] = React.useState<{
    mostrar: boolean;
    grupoId: string | null;
    grupoNombre: string | null;
  }>({
    mostrar: false,
    grupoId: null,
    grupoNombre: null,
  });

  // Estado para modal de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = React.useState<{
    isOpen: boolean;
    grupoId: string | null;
    grupoNombre: string | null;
  }>({
    isOpen: false,
    grupoId: null,
    grupoNombre: null,
  });

  // Hook para gestión de grupos (usando API de usuario-grupo)
  const {
    // Estados
    gruposFiltrados,
    vistaActual,
    grupoSeleccionado,
    formulario,
    filtros,

    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Permisos
    permisos,

    // Acciones
    handleCreateGrupo,
    handleUpdateGrupo,
    handleDeleteGrupo,
    setVistaActual,
    selectGrupo,
    updateFormulario,
    updateFiltros,
    resetFormulario,
    loadGrupos,

    // Navegación
    navigateToFormulario,
    navigateToLista,
    goBack,
    scrollToTop,
  } = useGestionGruposUnificado();

  // Hook de navegación para manejo del historial del navegador
  const { pushNavigation: pushNavigationMain, goBack: goBackMain, scrollToTop: scrollToTopMain } = useNavigationHistory({
    onNavigateBack: async () => {
      // Callback personalizado cuando se usa la flecha anterior del navegador
      if (vistaUsuarios.mostrar) {
        // Si estamos en vista de usuarios, volver a la lista y recargar grupos
        setVistaUsuarios({ mostrar: false, grupoId: null, grupoNombre: null });
        await loadGrupos();
        scrollToTopMain();
      } else {
        // Si estamos en formulario, volver a la lista
        setVistaActual('lista');
        resetFormulario();
        scrollToTopMain();
      }
    },
    enableBrowserNavigation: true,
    scrollToTopOnNavigation: true
  });

  // Función para obtener breadcrumbs dinámicos
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    if (vistaUsuarios.mostrar) {
      breadcrumbs.push({
        label: MESSAGES.titles.main,
        path: '#',
        onClick: () => {
          setVistaUsuarios({ mostrar: false, grupoId: null, grupoNombre: null });
          scrollToTopMain();
        }
      });
      breadcrumbs.push({ 
        label: `Usuarios: ${vistaUsuarios.grupoNombre || 'Grupo'}`, 
        isActive: true 
      });
    } else if (vistaActual === 'formulario') {
      breadcrumbs.push({
        label: MESSAGES.titles.main,
        path: '#',
        onClick: () => {
          navigateToLista();
        }
      });
      breadcrumbs.push({
        label: grupoSeleccionado ? MESSAGES.titles.editGrupo : MESSAGES.titles.newGrupo,
        isActive: true
      });
    } else {
      breadcrumbs.push({ label: MESSAGES.titles.main, isActive: true });
    }

    return breadcrumbs;
  };

  // Manejadores de eventos
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (grupoSeleccionado?.id) {
      await handleUpdateGrupo(grupoSeleccionado.id);
    } else {
      await handleCreateGrupo();
    }
  };

  const handleEditGrupo = (grupo: IGrupoUsuario) => {
    const grupoParaEditar = {
      id: grupo.id,
      nombre: grupo.nombreGrupo,
      descripcion: grupo.descripcionGrupo
    };
    navigateToFormulario(grupoParaEditar);
  };

  const handleViewUsuarios = (grupo: IGrupoUsuario) => {
    setVistaUsuarios({
      mostrar: true,
      grupoId: grupo.id,
      grupoNombre: grupo.nombreGrupo,
    });

    // Agregar al historial de navegación
    pushNavigationMain({
      view: 'usuarios',
      grupoId: grupo.id,
      formData: { grupoNombre: grupo.nombreGrupo }
    }, `Usuarios del Grupo: ${grupo.nombreGrupo}`);
  };

  // handleDeleteClick ya no es necesario - lo usamos directo en el botón de eliminación si fuera necesario

  const handleConfirmDelete = async () => {
    if (deleteDialog.grupoId) {
      await handleDeleteGrupo(deleteDialog.grupoId);
      setDeleteDialog({ isOpen: false, grupoId: null, grupoNombre: null });
    }
  };

  // Verificar permisos de acceso
  if (!permisos.canView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {MESSAGES.errors.accessDenied}
          </h2>
          <p className="text-gray-600">
            {MESSAGES.errors.noPermissionView}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8" data-component="gestion-grupos">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={getBreadcrumbs()} />
        </div>

        {/* Vista de Usuarios del Grupo */}
        {vistaUsuarios.mostrar && vistaUsuarios.grupoId && (
          <UsuariosGrupoView
            grupoUuid={vistaUsuarios.grupoId}
            grupoNombre={vistaUsuarios.grupoNombre || undefined}
            onBack={async () => {
              setVistaUsuarios({ mostrar: false, grupoId: null, grupoNombre: null });
              // Recargar grupos para actualizar el contador de usuarios
              await loadGrupos();
              scrollToTopMain();
            }}
          />
        )}

        {/* Vista de Formulario */}
        {!vistaUsuarios.mostrar && vistaActual === 'formulario' && (
          <GrupoForm
            grupo={grupoSeleccionado}
            formulario={formulario}
            isSubmitting={isCreating || isUpdating}
            onSubmit={handleSubmitForm}
            onCancel={() => {
              navigateToLista();
            }}
            onFieldChange={updateFormulario}
          />
        )}

        {/* Vista de Lista */}
        {!vistaUsuarios.mostrar && vistaActual === 'lista' && (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                  >
                    <Shield size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                      {MESSAGES.titles.main}
                    </h1>
                    <p className="text-gray-600">
                      {MESSAGES.descriptions.main}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {permisos.canCreate && (
                    <button
                      onClick={() => {
                        navigateToFormulario();
                      }}
                      disabled={isCreating}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      style={{ backgroundColor: COLORS.primary }}
                    >
                      {isCreating ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                      <span>{MESSAGES.buttons.newGrupo}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Búsqueda y Lista */}
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Header de búsqueda */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
                    Lista de Grupos ({gruposFiltrados.length})
                  </h2>
                </div>
                <SearchInput
                  value={filtros.search || ''}
                  onChange={(value) => updateFiltros({ search: value })}
                  placeholder={MESSAGES.placeholders.searchGrupos}
                  isSearching={isLoading}
                />
              </div>

              {/* Contenido de la lista */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 
                        className="animate-spin mx-auto mb-4" 
                        size={48} 
                        style={{ color: COLORS.primary }} 
                      />
                      <p className="text-gray-600">{MESSAGES.loading.grupos}</p>
                    </div>
                  </div>
                ) : gruposFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {MESSAGES.empty.noGrupos}
                    </h3>
                    <p className="text-gray-500">
                      {filtros.search
                        ? MESSAGES.empty.noResults
                        : MESSAGES.empty.noGruposDescription
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gruposFiltrados.map((grupo: IGrupoUsuario) => (
                      <GrupoCard
                        key={grupo.id}
                        grupo={grupo}
                        onEdit={() => handleEditGrupo(grupo)}
                        onView={() => handleViewUsuarios(grupo)}
                        canEdit={permisos.canEdit}
                        isUpdating={isUpdating}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal de confirmación de eliminación */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Eliminar Grupo"
          message={`¿Estás seguro de que deseas eliminar el grupo "${deleteDialog.grupoNombre}"? Esta acción no se puede deshacer.`}
          type="danger"
          confirmText={MESSAGES.buttons.delete}
          cancelText={MESSAGES.buttons.cancel}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, grupoId: null, grupoNombre: null })}
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default GestionGrupos;
