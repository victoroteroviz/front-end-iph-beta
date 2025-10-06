/**
 * @fileoverview Gestión de Grupos con Lógica Real
 * @version 2.0.0
 * @description Componente completo para gestión de grupos con servicios reales
 */

import React from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { Breadcrumbs, IBreadcrumbItem } from '../../../shared/breadcrumbs';

//+ Hook personalizado
import { useGestionGrupos } from './hooks/useGestionGrupos';

/**
 * @component GestionGrupos
 * @description Componente completo para gestión de grupos con servicios reales
 */
const GestionGrupos: React.FC = () => {
  // Hook personalizado con toda la lógica de negocio
  const {
    // Estados
    grupos,
    gruposFiltrados,
    vistaActual,
    grupoSeleccionado,
    formulario,
    filtros,
    estadisticas,

    // Estados de carga
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Permisos
    permisos,

    // Acciones
    loadGrupos,
    handleCreateGrupo,
    handleUpdateGrupo,
    handleDeleteGrupo,
    setVistaActual,
    selectGrupo,
    updateFormulario,
    updateFiltros,
    resetFormulario,
    validateForm
  } = useGestionGrupos();

  // Función para obtener breadcrumbs dinámicos según la vista
  const getBreadcrumbs = (): IBreadcrumbItem[] => {
    const breadcrumbs: IBreadcrumbItem[] = [
      { label: 'Gestión de Grupos', path: '/gestion-grupos' }
    ];

    if (vistaActual === 'formulario') {
      breadcrumbs.push({
        label: grupoSeleccionado ? 'Editar Grupo' : 'Nuevo Grupo',
        isActive: true
      });
    } else if (vistaActual === 'detalle' && grupoSeleccionado) {
      breadcrumbs.push({ label: `Detalle: ${grupoSeleccionado.nombre}`, isActive: true });
    } else {
      breadcrumbs[0].isActive = true;
    }

    return breadcrumbs;
  };

  // Función para manejar el envío del formulario
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (grupoSeleccionado?.id) {
      // Modo edición
      await handleUpdateGrupo(grupoSeleccionado.id);
    } else {
      // Modo creación
      await handleCreateGrupo();
    }
  };

  // Función para iniciar edición
  const handleEditGrupo = (grupo: any) => {
    selectGrupo(grupo);
    setVistaActual('formulario');
  };

  // Verificar permisos de acceso
  if (!permisos.canView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la gestión de grupos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={getBreadcrumbs()} />

        {/* Estado de carga principal */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#4d4725' }} />
              <p className="text-gray-600">Cargando grupos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{ backgroundColor: '#4d472515', color: '#4d4725' }}
                  >
                    <Users size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#4d4725' }}>
                      Gestión de Grupos
                    </h1>
                    <p className="text-gray-600">
                      Administra grupos de usuarios del sistema
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {permisos.canCreate && (
                    <button
                      onClick={() => {
                        resetFormulario();
                        setVistaActual('formulario');
                      }}
                      disabled={isCreating}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                      style={{ backgroundColor: '#4d4725' }}
                    >
                      {isCreating ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                      <span>Nuevo Grupo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Total Grupos</p>
                  <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>{estadisticas.totalGrupos}</p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Activos</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.gruposActivos}</p>
                </div>
                <div
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.gruposInactivos}</p>
                </div>
              </div>
            </div>

            {vistaActual === 'lista' && (
              // Vista de Lista de Grupos
              <div className="bg-white rounded-xl border border-gray-200">
                {/* Header de búsqueda */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                      Lista de Grupos ({gruposFiltrados.length})
                    </h2>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar grupos por nombre..."
                      value={filtros.search || ''}
                      onChange={(e) => updateFiltros({ search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Lista de Grupos */}
                <div className="p-6">
                  {gruposFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos</h3>
                      <p className="text-gray-500">
                        {filtros.search
                          ? 'No se encontraron grupos que coincidan con tu búsqueda'
                          : 'Aún no se han creado grupos en el sistema'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gruposFiltrados.map((grupo) => (
                        <div
                          key={grupo.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                        >
                          {/* Header del grupo */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: '#4d472520', color: '#4d4725' }}
                              >
                                <Users size={20} />
                              </div>
                              <div>
                                <h3 className="font-semibold" style={{ color: '#4d4725' }}>{grupo.nombre}</h3>
                                <p className="text-sm text-gray-500">ID: {grupo.id}</p>
                              </div>
                            </div>
                          </div>

                          {/* Estado activo */}
                          <div className="mb-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Activo
                            </span>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                            {permisos.canEdit && (
                              <button
                                onClick={() => handleEditGrupo(grupo)}
                                disabled={isUpdating}
                                className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                                title="Editar Grupo"
                              >
                                {isUpdating ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <Edit size={16} />
                                )}
                              </button>
                            )}
                            {permisos.canDelete && (
                              <button
                                onClick={() => handleDeleteGrupo(grupo.id!)}
                                disabled={isDeleting}
                                className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                                title="Eliminar Grupo"
                              >
                                {isDeleting ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {vistaActual === 'formulario' && (
              // Vista de Formulario
              <div className="space-y-6">
                {/* Botón de retorno prominente */}
                <div className="flex items-center justify-start">
                  <button
                    onClick={() => setVistaActual('lista')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                  >
                    <ArrowLeft size={16} />
                    <span className="font-medium">Volver a la lista</span>
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                      {grupoSeleccionado ? 'Editar Grupo' : 'Nuevo Grupo'}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmitForm} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                        Nombre del Grupo *
                      </label>
                      <input
                        type="text"
                        value={formulario.nombre}
                        onChange={(e) => updateFormulario('nombre', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formulario.errors.nombre ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Administradores de Sistema"
                        disabled={isCreating || isUpdating}
                      />
                      {formulario.errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{formulario.errors.nombre}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setVistaActual('lista')}
                        disabled={isCreating || isUpdating}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isCreating || isUpdating || !formulario.nombre.trim()}
                        className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                        style={{ backgroundColor: '#4d4725' }}
                      >
                        {(isCreating || isUpdating) ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Save size={16} />
                        )}
                        <span>
                          {grupoSeleccionado ? 'Actualizar Grupo' : 'Crear Grupo'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionGrupos;