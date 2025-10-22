/**
 * @fileoverview Mock data para el componente de Ajustes
 * @version 1.0.0
 * @description Datos simulados para desarrollo y testing del sistema de ajustes
 */

import { Settings, Database, Users, Shield, FileText, BarChart3, Palette, Bell } from 'lucide-react';
import type {
  IAjustesResponse,
  IAjusteSeccion,
  IAjustesConfig,
  IAjustesEstadisticas,
  ICatalogo,
  ICatalogoItem
} from '../../../../../../interfaces/ajustes';

/**
 * @constant MOCK_AJUSTES_CONFIG
 * @description Configuración mock para el componente de ajustes
 */
export const MOCK_AJUSTES_CONFIG: IAjustesConfig = {
  titulo: 'Configuración del Sistema',
  subtitulo: 'Administra y personaliza la configuración de tu aplicación IPH',
  mostrarEstadisticas: false,
  temas: {
    primario: '#4d4725',
    secundario: '#b8ab84',
    fondo: '#f8f0e7'
  }
};

/**
 * @constant MOCK_AJUSTES_ESTADISTICAS
 * @description Estadísticas mock del sistema de ajustes
 */
export const MOCK_AJUSTES_ESTADISTICAS: IAjustesEstadisticas = {
  totalSecciones: 8,
  totalOpciones: 24,
  seccionesMasUsadas: [
    { nombre: 'Administración de Catálogos', usos: 45 },
    { nombre: 'Gestión de Usuarios', usos: 32 },
    { nombre: 'Configuración de Seguridad', usos: 28 }
  ],
  ultimaActividad: new Date().toISOString()
};

/**
 * @constant MOCK_AJUSTES_SECCIONES
 * @description Secciones mock del sistema de ajustes
 */
export const MOCK_AJUSTES_SECCIONES: IAjusteSeccion[] = [
  {
    id: 'administracion-catalogos',
    nombre: 'Administración de Catálogos',
    descripcion: 'Gestiona catálogos del sistema como cargos, grados, adscripciones y municipios',
    icono: Database,
    color: '#4d4725',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador'],
    ruta: '/ajustes/catalogos',
    cantidadOpciones: 6,
    ultimaActualizacion: '2024-01-15T10:30:00Z'
  },
  {
    id: 'gestion-usuarios',
    nombre: 'Gestión de Usuarios',
    descripcion: 'Administra usuarios del sistema, roles y permisos',
    icono: Users,
    color: '#b8ab84',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador'],
    ruta: '/ajustes/usuarios',
    cantidadOpciones: 4,
    ultimaActualizacion: '2024-01-14T16:45:00Z'
  },
  {
    id: 'configuracion-seguridad',
    nombre: 'Configuración de Seguridad',
    descripcion: 'Configura políticas de seguridad, autenticación y autorización',
    icono: Shield,
    color: '#8b7355',
    habilitado: true,
    nivelAcceso: ['SuperAdmin'],
    ruta: '/ajustes/seguridad',
    cantidadOpciones: 5,
    ultimaActualizacion: '2024-01-13T09:20:00Z'
  },
  {
    id: 'reportes-sistema',
    nombre: 'Reportes del Sistema',
    descripcion: 'Configura y personaliza reportes automáticos del sistema',
    icono: BarChart3,
    color: '#6b5d47',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador', 'Superior'],
    ruta: '/ajustes/reportes',
    cantidadOpciones: 3,
    ultimaActualizacion: '2024-01-12T14:15:00Z'
  },
  {
    id: 'personalizacion',
    nombre: 'Personalización',
    descripcion: 'Personaliza la apariencia y comportamiento de la aplicación',
    icono: Palette,
    color: '#a89766',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador'],
    ruta: '/ajustes/personalizacion',
    cantidadOpciones: 4,
    ultimaActualizacion: '2024-01-11T11:30:00Z'
  },
  {
    id: 'notificaciones',
    nombre: 'Notificaciones',
    descripcion: 'Configura notificaciones del sistema y alertas',
    icono: Bell,
    color: '#9c8f6b',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    ruta: '/ajustes/notificaciones',
    cantidadOpciones: 3,
    ultimaActualizacion: '2024-01-10T08:45:00Z'
  },
  {
    id: 'documentacion',
    nombre: 'Documentación',
    descripcion: 'Accede a la documentación del sistema y manuales de usuario',
    icono: FileText,
    color: '#7a6f58',
    habilitado: true,
    nivelAcceso: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'],
    ruta: '/ajustes/documentacion',
    cantidadOpciones: 2,
    ultimaActualizacion: '2024-01-09T13:20:00Z'
  },
  {
    id: 'configuracion-general',
    nombre: 'Configuración General',
    descripcion: 'Configuraciones generales del sistema y parámetros globales',
    icono: Settings,
    color: '#655a45',
    habilitado: true,
    nivelAcceso: ['SuperAdmin'],
    ruta: '/ajustes/general',
    cantidadOpciones: 5,
    ultimaActualizacion: '2024-01-08T15:10:00Z'
  }
];

/**
 * @constant MOCK_CATALOGOS_ITEMS
 * @description Items mock para catálogos específicos
 */
export const MOCK_CATALOGOS_ITEMS: ICatalogoItem[] = [
  {
    id: 1,
    nombre: 'Comandante',
    descripcion: 'Grado de Comandante de la institución',
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    fechaActualizacion: '2024-01-15T10:30:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 2,
    nombre: 'Teniente',
    descripcion: 'Grado de Teniente de la institución',
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  },
  {
    id: 3,
    nombre: 'Sargento',
    descripcion: 'Grado de Sargento de la institución',
    activo: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    creadoPor: 'Sistema'
  }
];

/**
 * @constant MOCK_CATALOGOS
 * @description Catálogos mock disponibles en el sistema
 */
export const MOCK_CATALOGOS: ICatalogo[] = [
  {
    id: 'grados',
    nombre: 'Grados Policiales',
    descripcion: 'Catálogo de grados dentro de la institución policial',
    items: MOCK_CATALOGOS_ITEMS,
    totalItems: MOCK_CATALOGOS_ITEMS.length,
    permisos: {
      leer: true,
      crear: true,
      actualizar: true,
      eliminar: true
    }
  },
  {
    id: 'cargos',
    nombre: 'Cargos',
    descripcion: 'Catálogo de cargos disponibles en el sistema',
    items: [],
    totalItems: 0,
    permisos: {
      leer: true,
      crear: true,
      actualizar: true,
      eliminar: true
    }
  },
  {
    id: 'adscripciones',
    nombre: 'Adscripciones',
    descripcion: 'Catálogo de adscripciones territoriales',
    items: [],
    totalItems: 0,
    permisos: {
      leer: true,
      crear: true,
      actualizar: true,
      eliminar: true
    }
  },
  {
    id: 'municipios',
    nombre: 'Municipios',
    descripcion: 'Catálogo de municipios del estado',
    items: [],
    totalItems: 0,
    permisos: {
      leer: true,
      crear: true,
      actualizar: true,
      eliminar: true
    }
  }
];

/**
 * @function getMockAjustesData
 * @description Simula la respuesta del servicio de ajustes
 * @returns {Promise<IAjustesResponse>} Datos mock de ajustes
 */
export const getMockAjustesData = async (): Promise<IAjustesResponse> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    configuracion: MOCK_AJUSTES_CONFIG,
    secciones: MOCK_AJUSTES_SECCIONES,
    estadisticas: MOCK_AJUSTES_ESTADISTICAS,
    success: true,
    message: 'Configuración de ajustes obtenida exitosamente'
  };
};

/**
 * @function getMockCatalogos
 * @description Simula la respuesta del servicio de catálogos
 * @returns {Promise<ICatalogo[]>} Lista de catálogos mock
 */
export const getMockCatalogos = async (): Promise<ICatalogo[]> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));

  return MOCK_CATALOGOS;
};

/**
 * @function filtrarSeccionesPorRol
 * @description Filtra las secciones de ajustes según el rol del usuario
 * @param {Array<string | { nombre: string }>} userRoles - Roles del usuario actual
 * @returns {IAjusteSeccion[]} Secciones filtradas por rol
 */
export const filtrarSeccionesPorRol = (userRoles: Array<string | { nombre: string }>): IAjusteSeccion[] => {
  const roleNames = userRoles.map(role => typeof role === 'string' ? role : role.nombre);

  return MOCK_AJUSTES_SECCIONES.filter(seccion =>
    seccion.nivelAcceso.some(nivel => roleNames.includes(nivel))
  );
};