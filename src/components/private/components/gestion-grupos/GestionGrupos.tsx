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
  X,
  UserPlus,
  BarChart3,
  Eye
} from 'lucide-react';
import { Breadcrumbs, BreadcrumbItem } from '../../layout/breadcrumbs';

//+ Hooks personalizados
import { useGestionGrupos } from './hooks/useGestionGrupos';
import { useUsuarioGrupo } from './hooks/useUsuarioGrupo';

/**
 * @component GestionGrupos
 * @description Componente completo para gestión de grupos con servicios reales
 */
const GestionGrupos: React.FC = () => {
  // Estado para controlar la pestaña activa
  const [pestanaActiva, setPestanaActiva] = React.useState<'grupos' | 'usuarios-grupos'>('grupos');

  // Hook para gestión de grupos básica
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

  // Hook para gestión de usuarios en grupos
  const usuarioGrupoHook = useUsuarioGrupo();

  // Cargar datos iniciales al montar el componente
  React.useEffect(() => {
    // Cargar grupos con usuarios para las tarjetas principales
    usuarioGrupoHook.loadGruposConUsuarios();
  }, []);

  // Función para manejar navegación del breadcrumb
  const handleBreadcrumbNavigation = (action: string) => {
    switch (action) {
      case 'gestion-grupos':
        setPestanaActiva('grupos');
        setVistaActual('lista');
        break;
      case 'usuarios-grupos':
        setPestanaActiva('usuarios-grupos');
        usuarioGrupoHook.setVistaUsuarioGrupo('grupos-estadisticas');
        break;
      default:
        setVistaActual('lista');
        break;
    }
  };

  // Función para obtener breadcrumbs dinámicos según la vista
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];

    // Solo agregar rutas con path si no están activas
    if (pestanaActiva === 'usuarios-grupos') {
      breadcrumbs.push({
        label: 'Gestión de Grupos',
        path: '#',
        onClick: () => handleBreadcrumbNavigation('gestion-grupos')
      });
      breadcrumbs.push({ label: 'Usuarios en Grupos', isActive: true });
    } else if (vistaActual === 'formulario') {
      breadcrumbs.push({
        label: 'Gestión de Grupos',
        path: '#',
        onClick: () => handleBreadcrumbNavigation('gestion-grupos')
      });
      breadcrumbs.push({
        label: grupoSeleccionado ? 'Editar Grupo' : 'Nuevo Grupo',
        isActive: true
      });
    } else if (vistaActual === 'detalle' && grupoSeleccionado) {
      breadcrumbs.push({
        label: 'Gestión de Grupos',
        path: '#',
        onClick: () => handleBreadcrumbNavigation('gestion-grupos')
      });
      breadcrumbs.push({ label: `Detalle: ${grupoSeleccionado.nombre}`, isActive: true });
    } else {
      breadcrumbs.push({ label: 'Gestión de Grupos', isActive: true });
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
        <div className="mb-8">
          <Breadcrumbs items={getBreadcrumbs()} />
        </div>

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

            {/* Navegación por pestañas */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setPestanaActiva('grupos')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors duration-200 border-b-2 ${
                    pestanaActiva === 'grupos'
                      ? 'border-[#4d4725] text-[#4d4725] bg-[#f8f0e7]'
                      : 'border-transparent text-gray-600 hover:text-[#4d4725] hover:border-gray-300'
                  }`}
                >
                  <Users size={20} />
                  <span>Gestión de Grupos</span>
                </button>
                <button
                  onClick={() => {
                    setPestanaActiva('usuarios-grupos');
                    usuarioGrupoHook.loadGruposConUsuarios();
                    usuarioGrupoHook.loadEstadisticasCompletas();
                  }}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors duration-200 border-b-2 ${
                    pestanaActiva === 'usuarios-grupos'
                      ? 'border-[#4d4725] text-[#4d4725] bg-[#f8f0e7]'
                      : 'border-transparent text-gray-600 hover:text-[#4d4725] hover:border-gray-300'
                  }`}
                >
                  <UserPlus size={20} />
                  <span>Usuarios en Grupos</span>
                </button>
              </div>
            </div>

            {pestanaActiva === 'grupos' && vistaActual === 'lista' && (
              // Vista de Lista de Grupos desde Usuario-Grupo API
              <div className="bg-white rounded-xl border border-gray-200">
                {/* Header de búsqueda */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                      Lista de Grupos ({usuarioGrupoHook.gruposFiltrados.length})
                    </h2>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar grupos por nombre..."
                      value={usuarioGrupoHook.filtros.search || ''}
                      onChange={(e) => usuarioGrupoHook.updateFiltros({ search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Lista de Grupos */}
                <div className="p-6">
                  {usuarioGrupoHook.isLoadingGrupos ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#4d4725' }} />
                        <p className="text-gray-600">Cargando grupos...</p>
                      </div>
                    </div>
                  ) : usuarioGrupoHook.gruposFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos</h3>
                      <p className="text-gray-500">
                        {usuarioGrupoHook.filtros.search
                          ? 'No se encontraron grupos que coincidan con tu búsqueda'
                          : 'Aún no se han creado grupos en el sistema'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {usuarioGrupoHook.gruposFiltrados.map((grupo) => (
                        <div
                          key={grupo.id}
                          onClick={() => {
                            usuarioGrupoHook.setGrupoSeleccionadoId(grupo.id);
                            usuarioGrupoHook.loadUsuariosDelGrupo(grupo.id);
                            usuarioGrupoHook.setVistaUsuarioGrupo('usuarios-grupo');
                          }}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
                                <h3 className="font-semibold" style={{ color: '#4d4725' }}>{grupo.nombreGrupo}</h3>
                                <p className="text-sm text-gray-500">{grupo.cantidadUsuarios} usuarios</p>
                              </div>
                            </div>
                          </div>

                          {/* Descripción del grupo */}
                          <div className="mb-4">
                            <p className="text-gray-600 text-sm">
                              {grupo.descripcionGrupo || 'Sin descripción'}
                            </p>
                          </div>

                          {/* Estado */}
                          <div className="mb-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                grupo.estatus
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {grupo.estatus ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                            {permisos.canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Convertir IGrupoUsuario a IGrupo para el formulario
                                  const grupoParaEditar = {
                                    id: grupo.id,
                                    nombre: grupo.nombreGrupo
                                  };
                                  handleEditGrupo(grupoParaEditar);
                                }}
                                disabled={isUpdating}
                                className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50 transition-colors duration-200"
                                title="Editar Grupo"
                              >
                                {isUpdating ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <Edit size={16} />
                                )}
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                usuarioGrupoHook.setGrupoSeleccionadoId(grupo.id);
                                usuarioGrupoHook.loadUsuariosDelGrupo(grupo.id);
                                usuarioGrupoHook.setVistaUsuarioGrupo('usuarios-grupo');
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                              title="Ver Usuarios del Grupo"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {pestanaActiva === 'grupos' && vistaActual === 'formulario' && (
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

            {/* Pestaña de Usuarios en Grupos */}
            {pestanaActiva === 'usuarios-grupos' && (
              <div className="space-y-6">
                {/* Estadísticas de Usuarios en Grupos */}
                {usuarioGrupoHook.estadisticasCompletas && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#4d4725' }}>
                      📊 Estadísticas de Usuarios en Grupos
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Total Usuarios</p>
                        <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>
                          {usuarioGrupoHook.estadisticasCompletas.totalUsuarios}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Asignados</p>
                        <p className="text-2xl font-bold text-green-600">
                          {usuarioGrupoHook.estadisticasCompletas.usuariosAsignados}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Sin Grupo</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {usuarioGrupoHook.estadisticasCompletas.usuariosSinGrupo}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Grupos Activos</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {usuarioGrupoHook.estadisticasCompletas.gruposActivos}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Grupos Inactivos</p>
                        <p className="text-2xl font-bold text-red-600">
                          {usuarioGrupoHook.estadisticasCompletas.gruposInactivos}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}>
                        <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Total Grupos</p>
                        <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>
                          {usuarioGrupoHook.estadisticasCompletas.totalGrupos}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grupos con información de usuarios */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                        Grupos y Usuarios ({usuarioGrupoHook.gruposFiltrados.length})
                      </h2>
                      {usuarioGrupoHook.permisos.canAssignUsers && (
                        <button
                          onClick={() => usuarioGrupoHook.setVistaUsuarioGrupo('asignar-usuario')}
                          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
                          style={{ backgroundColor: '#4d4725' }}
                        >
                          <UserPlus size={16} />
                          <span>Asignar Usuario</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Search size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar grupos..."
                        value={usuarioGrupoHook.filtros.search || ''}
                        onChange={(e) => usuarioGrupoHook.updateFiltros({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    {usuarioGrupoHook.isLoadingGrupos ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="animate-spin mx-auto mb-4" size={48} style={{ color: '#4d4725' }} />
                          <p className="text-gray-600">Cargando grupos con usuarios...</p>
                        </div>
                      </div>
                    ) : usuarioGrupoHook.gruposFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="mx-auto mb-4 text-gray-400" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos</h3>
                        <p className="text-gray-500">
                          {usuarioGrupoHook.filtros.search
                            ? 'No se encontraron grupos que coincidan con tu búsqueda'
                            : 'Aún no se han creado grupos con usuarios en el sistema'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {usuarioGrupoHook.gruposFiltrados.map((grupo) => (
                          <div
                            key={grupo.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: '#4d472520', color: '#4d4725' }}
                                >
                                  <Users size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold" style={{ color: '#4d4725' }}>{grupo.nombreGrupo}</h3>
                                  <p className="text-sm text-gray-500">{grupo.cantidadUsuarios} usuarios</p>
                                </div>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">{grupo.descripcionGrupo}</p>

                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  grupo.estatus
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {grupo.estatus ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => {
                                  usuarioGrupoHook.setGrupoSeleccionadoId(grupo.id);
                                  usuarioGrupoHook.loadUsuariosDelGrupo(grupo.id);
                                  usuarioGrupoHook.setVistaUsuarioGrupo('usuarios-grupo');
                                }}
                                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                              >
                                <Eye size={14} />
                                <span>Ver Usuarios</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vista de usuarios del grupo */}
                {usuarioGrupoHook.vistaUsuarioGrupo === 'usuarios-grupo' && usuarioGrupoHook.grupoSeleccionadoId && (
                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => usuarioGrupoHook.setVistaUsuarioGrupo('grupos-estadisticas')}
                            className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                          >
                            <ArrowLeft size={16} />
                            <span>Volver</span>
                          </button>
                          <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                            Usuarios del Grupo ({usuarioGrupoHook.usuariosDelGrupo.length})
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {usuarioGrupoHook.isLoadingUsuarios ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="animate-spin mr-2" size={24} style={{ color: '#4d4725' }} />
                          <span className="text-gray-600">Cargando usuarios...</span>
                        </div>
                      ) : usuarioGrupoHook.usuariosDelGrupo.length === 0 ? (
                        <div className="text-center py-8">
                          <UserPlus className="mx-auto mb-4 text-gray-400" size={48} />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios asignados</h3>
                          <p className="text-gray-500">Este grupo aún no tiene usuarios asignados.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {usuarioGrupoHook.usuariosDelGrupo.map((usuario) => (
                            <div
                              key={usuario.id}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                            >
                              <h4 className="font-semibold text-gray-900 mb-2">{usuario.nombreCompleto}</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>ID:</strong> {usuario.id}</p>
                                {usuario.cuip && <p><strong>CUIP:</strong> {usuario.cuip}</p>}
                                {usuario.cup && <p><strong>CUP:</strong> {usuario.cup}</p>}
                                {usuario.telefono && <p><strong>Teléfono:</strong> {usuario.telefono}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulario de asignación de usuario */}
                {usuarioGrupoHook.vistaUsuarioGrupo === 'asignar-usuario' && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                        Asignar Usuario a Grupo
                      </h2>
                      <button
                        onClick={() => {
                          usuarioGrupoHook.setVistaUsuarioGrupo('grupos-estadisticas');
                          usuarioGrupoHook.resetFormularioAsignacion();
                        }}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        usuarioGrupoHook.handleAsignarUsuario();
                      }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                            ID del Usuario *
                          </label>
                          <input
                            type="text"
                            value={usuarioGrupoHook.formularioAsignacion.usuarioId}
                            onChange={(e) => usuarioGrupoHook.updateFormularioAsignacion('usuarioId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              usuarioGrupoHook.formularioAsignacion.errors.usuarioId ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Ingresa el ID del usuario"
                            disabled={usuarioGrupoHook.isAsignando}
                          />
                          {usuarioGrupoHook.formularioAsignacion.errors.usuarioId && (
                            <p className="mt-1 text-sm text-red-600">{usuarioGrupoHook.formularioAsignacion.errors.usuarioId}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                            Grupo *
                          </label>
                          <select
                            value={usuarioGrupoHook.formularioAsignacion.grupoId}
                            onChange={(e) => usuarioGrupoHook.updateFormularioAsignacion('grupoId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              usuarioGrupoHook.formularioAsignacion.errors.grupoId ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={usuarioGrupoHook.isAsignando}
                          >
                            <option value="">Selecciona un grupo</option>
                            {usuarioGrupoHook.gruposConUsuarios
                              .filter(g => g.estatus)
                              .map((grupo) => (
                                <option key={grupo.id} value={grupo.id}>
                                  {grupo.nombreGrupo} ({grupo.cantidadUsuarios} usuarios)
                                </option>
                              ))}
                          </select>
                          {usuarioGrupoHook.formularioAsignacion.errors.grupoId && (
                            <p className="mt-1 text-sm text-red-600">{usuarioGrupoHook.formularioAsignacion.errors.grupoId}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            usuarioGrupoHook.setVistaUsuarioGrupo('grupos-estadisticas');
                            usuarioGrupoHook.resetFormularioAsignacion();
                          }}
                          disabled={usuarioGrupoHook.isAsignando}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={usuarioGrupoHook.isAsignando || !usuarioGrupoHook.formularioAsignacion.usuarioId.trim() || !usuarioGrupoHook.formularioAsignacion.grupoId.trim()}
                          className="inline-flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
                          style={{ backgroundColor: '#4d4725' }}
                        >
                          {usuarioGrupoHook.isAsignando ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <UserPlus size={16} />
                          )}
                          <span>Asignar Usuario</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionGrupos;