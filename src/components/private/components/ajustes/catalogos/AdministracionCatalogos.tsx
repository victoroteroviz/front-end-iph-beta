/**
 * @fileoverview Mockup de Administración de Catálogos
 * @version 1.0.0
 * @description Vista mockup para administración de catálogos del sistema IPH
 */

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Shield,
  Building,
  MapPin,
  Settings
} from 'lucide-react';

/**
 * @component AdministracionCatalogos
 * @description Mockup visual para la administración de catálogos
 */
const AdministracionCatalogos: React.FC = () => {
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState('cargos');
  const [vistaActual, setVistaActual] = useState<'lista' | 'formulario'>('lista');

  // Mock data para el diseño
  const catalogos = [
    {
      id: 'cargos',
      nombre: 'Cargos',
      descripcion: 'Cargos disponibles en el sistema',
      icono: Users,
      color: '#4d4725',
      total: 15,
      activos: 12
    },
    {
      id: 'grados',
      nombre: 'Grados',
      descripcion: 'Grados policiales del sistema',
      icono: Shield,
      color: '#b8ab84',
      total: 8,
      activos: 8
    },
    {
      id: 'adscripciones',
      nombre: 'Adscripciones',
      descripcion: 'Adscripciones territoriales',
      icono: Building,
      color: '#8b7355',
      total: 25,
      activos: 23
    },
    {
      id: 'gobiernos',
      nombre: 'Gobiernos',
      descripcion: 'Niveles de gobierno',
      icono: MapPin,
      color: '#6b5d47',
      total: 3,
      activos: 3
    },
    {
      id: 'grupos',
      nombre: 'Grupos',
      descripcion: 'Grupos de clasificación',
      icono: Settings,
      color: '#a89766',
      total: 12,
      activos: 10
    }
  ];

  const itemsEjemplo = [
    { id: 1, nombre: 'Director General', descripcion: 'Dirección general de la institución', activo: true, fechaCreacion: '2024-01-15' },
    { id: 2, nombre: 'Subdirector', descripcion: 'Subdirección de área específica', activo: true, fechaCreacion: '2024-01-10' },
    { id: 3, nombre: 'Jefe de Departamento', descripcion: 'Jefatura de departamento operativo', activo: true, fechaCreacion: '2024-01-05' },
    { id: 4, nombre: 'Coordinador', descripcion: 'Coordinación de servicios', activo: false, fechaCreacion: '2024-01-01' },
    { id: 5, nombre: 'Analista', descripcion: 'Análisis y procesamiento de información', activo: true, fechaCreacion: '2023-12-20' }
  ];

  const catalogoActual = catalogos.find(c => c.id === catalogoSeleccionado);
  const IconoCatalogo = catalogoActual?.icono || Database;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{ backgroundColor: '#4d472515', color: '#4d4725' }}
              >
                <Database size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#4d4725' }}>
                  Administración de Catálogos
                </h1>
                <p className="text-gray-600">
                  Gestiona los catálogos del sistema: cargos, grados, adscripciones, gobiernos y grupos
                </p>
              </div>
            </div>
            <button
              onClick={() => setVistaActual('formulario')}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#4d4725' }}
            >
              <Plus size={16} />
              <span>Nuevo Item</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Catálogos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#4d4725' }}>
                Catálogos
              </h3>
              <div className="space-y-2">
                {catalogos.map((catalogo) => {
                  const Icono = catalogo.icono;
                  const isSelected = catalogoSeleccionado === catalogo.id;

                  return (
                    <button
                      key={catalogo.id}
                      onClick={() => setCatalogoSeleccionado(catalogo.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        isSelected ? 'shadow-md' : 'hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: isSelected ? '#f8f0e7' : 'transparent',
                        borderLeft: isSelected ? `4px solid ${catalogo.color}` : '4px solid transparent'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded"
                          style={{
                            backgroundColor: `${catalogo.color}20`,
                            color: catalogo.color
                          }}
                        >
                          <Icono size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm" style={{ color: '#4d4725' }}>
                            {catalogo.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {catalogo.total} items
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {vistaActual === 'lista' ? (
              // Vista de Lista
              <div className="bg-white rounded-xl border border-gray-200">
                {/* Header de la tabla */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-lg"
                        style={{
                          backgroundColor: `${catalogoActual?.color}20`,
                          color: catalogoActual?.color
                        }}
                      >
                        <IconoCatalogo size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                          {catalogoActual?.nombre}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {catalogoActual?.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                        {catalogoActual?.activos} activos
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {catalogoActual?.total} total
                      </span>
                    </div>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder={`Buscar en ${catalogoActual?.nombre.toLowerCase()}...`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Creación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {itemsEjemplo.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium" style={{ color: '#4d4725' }}>
                              {item.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {item.descripcion}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                item.activo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(item.fechaCreacion).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setVistaActual('formulario')}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer con paginación */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando 1 a 5 de 5 resultados
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">
                        Anterior
                      </button>
                      <button
                        className="px-3 py-1 rounded text-sm text-white"
                        style={{ backgroundColor: '#4d4725' }}
                      >
                        1
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Vista de Formulario (Mockup)
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold" style={{ color: '#4d4725' }}>
                    Nuevo {catalogoActual?.nombre.slice(0, -1)} {/* Quita la 's' final */}
                  </h2>
                  <button
                    onClick={() => setVistaActual('lista')}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Volver a la lista
                  </button>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ingrese el nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                        Estado
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#4d4725' }}>
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingrese una descripción"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4">
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
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministracionCatalogos;