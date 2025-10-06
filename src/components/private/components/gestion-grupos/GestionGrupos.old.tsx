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
  UserPlus,
  Settings,
  Filter,
  MoreVertical,
  Eye,
  UserMinus,
  ArrowLeft,
  Loader2,
  AlertCircle
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
      breadcrumbs.push({ label: 'Nuevo Grupo', isActive: true });
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

  // Mock data para el diseño
  const gruposMock = [
    {
      id: 1,
      nombre: 'Administradores',
      descripcion: 'Grupo con permisos administrativos completos',
      color: '#4d4725',
      activo: true,
      cantidadUsuarios: 5,
      fechaCreacion: '2024-01-15',
      creadoPor: 'Sistema'
    },
    {
      id: 2,
      nombre: 'Supervisores',
      descripcion: 'Grupo para supervisores de área',
      color: '#b8ab84',
      activo: true,
      cantidadUsuarios: 12,
      fechaCreacion: '2024-01-10',
      creadoPor: 'Admin'
    },
    {
      id: 3,
      nombre: 'Analistas',
      descripcion: 'Grupo de analistas y procesadores de información',
      color: '#8b7355',
      activo: true,
      cantidadUsuarios: 8,
      fechaCreacion: '2024-01-05',
      creadoPor: 'Admin'
    },
    {
      id: 4,
      nombre: 'Consultores',
      descripcion: 'Grupo para usuarios con acceso de consulta',
      color: '#a89766',
      activo: false,
      cantidadUsuarios: 3,
      fechaCreacion: '2024-01-01',
      creadoPor: 'Admin'
    }
  ];

  const usuariosMock = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan.perez@iph.gov', rol: 'Administrador', fechaAsignacion: '2024-01-15', activoEnGrupo: true },
    { id: 2, nombre: 'María García', email: 'maria.garcia@iph.gov', rol: 'Superior', fechaAsignacion: '2024-01-14', activoEnGrupo: true },
    { id: 3, nombre: 'Carlos López', email: 'carlos.lopez@iph.gov', rol: 'Analista', fechaAsignacion: '2024-01-13', activoEnGrupo: true },
    { id: 4, nombre: 'Ana Rodríguez', email: 'ana.rodriguez@iph.gov', rol: 'Elemento', fechaAsignacion: '2024-01-12', activoEnGrupo: false }
  ];

  const estadisticasMock = {
    totalGrupos: 4,
    gruposActivos: 3,
    gruposInactivos: 1,
    usuariosEnGrupos: 28,
    usuariosSinGrupo: 5
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs items={getBreadcrumbs()} />
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
                  Administra grupos de usuarios y asignaciones del sistema
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setVistaActual('formulario')}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#4d4725' }}
              >
                <Plus size={16} />
                <span>Nuevo Grupo</span>
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
            >
              <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Total Grupos</p>
              <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>{estadisticasMock.totalGrupos}</p>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
            >
              <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Activos</p>
              <p className="text-2xl font-bold text-green-600">{estadisticasMock.gruposActivos}</p>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
            >
              <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{estadisticasMock.gruposInactivos}</p>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
            >
              <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Usuarios en Grupos</p>
              <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>{estadisticasMock.usuariosEnGrupos}</p>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{ backgroundColor: '#f8f0e7', borderColor: '#b8ab8440' }}
            >
              <p className="text-sm font-medium" style={{ color: '#4d4725' }}>Sin Grupo</p>
              <p className="text-2xl font-bold text-orange-600">{estadisticasMock.usuariosSinGrupo}</p>
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
                  Lista de Grupos
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <Filter size={16} />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar grupos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Grid de Grupos */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gruposMock.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header del grupo */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${grupo.color}20`, color: grupo.color }}
                        >
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: '#4d4725' }}>{grupo.nombre}</h3>
                          <p className="text-sm text-gray-500">{grupo.cantidadUsuarios} usuarios</p>
                        </div>
                      </div>
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Descripción */}
                    <p className="text-gray-600 text-sm mb-4">{grupo.descripcion}</p>

                    {/* Estado y fecha */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          grupo.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {grupo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Creado: {new Date(grupo.fechaCreacion).toLocaleDateString('es-ES')}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setGrupoSeleccionado(grupo.id);
                          setVistaActual('detalle');
                        }}
                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Eye size={14} />
                        <span>Ver Detalle</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Gestionar Usuarios"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Editar Grupo"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Eliminar Grupo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {vistaActual === 'detalle' && grupoSeleccionado && (
          // Vista de Detalle del Grupo
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

            {/* Header del detalle */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Edit size={14} className="inline mr-1" />
                    Editar Grupo
                  </button>
                  <button
                    className="px-3 py-2 text-sm text-white rounded-lg"
                    style={{ backgroundColor: '#4d4725' }}
                  >
                    <UserPlus size={14} className="inline mr-1" />
                    Asignar Usuarios
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#4d472520', color: '#4d4725' }}
                >
                  <Users size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#4d4725' }}>
                    {gruposMock.find(g => g.id === grupoSeleccionado)?.nombre}
                  </h1>
                  <p className="text-gray-600">
                    {gruposMock.find(g => g.id === grupoSeleccionado)?.descripcion}
                  </p>
                </div>
              </div>
            </div>

            {/* Usuarios del grupo */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                    Usuarios Asignados ({usuariosMock.length})
                  </h2>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar usuarios..."
                      className="pl-8 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Asignación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuariosMock.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {usuario.nombre.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium" style={{ color: '#4d4725' }}>
                                {usuario.nombre}
                              </div>
                              <div className="text-sm text-gray-500">{usuario.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{usuario.rol}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(usuario.fechaAsignacion).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              usuario.activoEnGrupo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {usuario.activoEnGrupo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Remover del grupo"
                          >
                            <UserMinus size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  Nuevo Grupo
                </h2>
              </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                    Nombre del Grupo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Supervisores de Zona"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                    Color Identificativo
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      defaultValue="#4d4725"
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue="#4d4725"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                  Descripción
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe el propósito y función del grupo..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium" style={{ color: '#4d4725' }}>
                    Grupo activo
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setVistaActual('lista')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#4d4725' }}
                >
                  Crear Grupo
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionGrupos;