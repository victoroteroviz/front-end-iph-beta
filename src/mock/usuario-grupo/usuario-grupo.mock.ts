/**
 * @fileoverview Mock data para usuario-grupo
 * @version 1.0.0
 * @description Datos de prueba que simulan las respuestas del backend usuario-grupo
 */

import type {
  IGrupoUsuario,
  IGrupoUsuarioCreado,
  IObtenerUsuariosPorGrupo,
  IUsuarioGrupo,
  IEstadisticasUsuarioGrupo
} from '../../interfaces/usuario-grupo';

/**
 * Mock data para grupos con estadísticas de usuarios
 */
export const gruposUsuariosMockData: IGrupoUsuario[] = [
  {
    id: '1',
    nombreGrupo: 'Administradores',
    estatus: true,
    descripcionGrupo: 'Grupo con permisos administrativos completos del sistema',
    cantidadUsuarios: 5
  },
  {
    id: '2',
    nombreGrupo: 'Supervisores',
    estatus: true,
    descripcionGrupo: 'Grupo para supervisores de área y jefes de departamento',
    cantidadUsuarios: 12
  },
  {
    id: '3',
    nombreGrupo: 'Analistas',
    estatus: true,
    descripcionGrupo: 'Grupo de analistas y procesadores de información',
    cantidadUsuarios: 8
  },
  {
    id: '4',
    nombreGrupo: 'Consultores',
    estatus: false,
    descripcionGrupo: 'Grupo para usuarios con acceso de consulta únicamente',
    cantidadUsuarios: 3
  }
];

/**
 * Mock data para usuarios específicos por grupo
 */
export const usuariosPorGrupoMockData: Record<string, IUsuarioGrupo[]> = {
  '1': [
    {
      id: 'user-1',
      nombreCompleto: 'Juan Carlos Pérez Hernández',
      cuip: 'CUIP001',
      cup: 'CUP001',
      telefono: '5551234567'
    },
    {
      id: 'user-2',
      nombreCompleto: 'María Elena García López',
      cuip: 'CUIP002',
      cup: 'CUP002',
      telefono: '5552345678'
    }
  ],
  '2': [
    {
      id: 'user-3',
      nombreCompleto: 'Carlos Alberto Rodríguez Martínez',
      cuip: 'CUIP003',
      cup: 'CUP003',
      telefono: '5553456789'
    },
    {
      id: 'user-4',
      nombreCompleto: 'Ana Patricia Sánchez Jiménez',
      cuip: 'CUIP004',
      cup: 'CUP004',
      telefono: '5554567890'
    }
  ],
  '3': [
    {
      id: 'user-5',
      nombreCompleto: 'Luis Fernando Torres Vázquez',
      cuip: 'CUIP005',
      cup: 'CUP005',
      telefono: '5555678901'
    }
  ],
  '4': [
    {
      id: 'user-6',
      nombreCompleto: 'Rosa María Flores Guerrero',
      cuip: 'CUIP006',
      cup: 'CUP006',
      telefono: '5556789012'
    }
  ]
};

/**
 * Simula el servicio GET /api/usuario-grupo/obtener-usuarios-por-grupo
 */
export const obtenerUsuariosPorGrupoMock = async (): Promise<IGrupoUsuario[]> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...gruposUsuariosMockData];
};

/**
 * Simula el servicio GET /api/usuario-grupo/obtener-usuarios-por-grupo/:id
 */
export const obtenerUsuariosGruposPorIdMock = async (id: string): Promise<IObtenerUsuariosPorGrupo> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));

  // Buscar el grupo
  const grupo = gruposUsuariosMockData.find(g => g.id === id);

  if (!grupo) {
    throw new Error('Grupo no encontrado');
  }

  // Obtener usuarios del grupo
  const usuarios = usuariosPorGrupoMockData[id] || [];

  return {
    id: grupo.id,
    nombre: grupo.nombreGrupo,
    data: usuarios,
    status: true,
    message: 'Usuarios obtenidos correctamente'
  };
};

/**
 * Simula el servicio POST /api/usuario-grupo/asignar-usuario-a-grupo
 */
export const asignarUsuarioAGrupoMock = async (usuarioId: string, grupoId: string): Promise<IGrupoUsuarioCreado> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Validaciones básicas
  if (!usuarioId || usuarioId.trim() === '') {
    throw new Error('El ID del usuario es requerido y no puede estar vacío');
  }

  if (!grupoId || grupoId.trim() === '') {
    throw new Error('El ID del grupo es requerido y no puede estar vacío');
  }

  // Verificar que el grupo existe
  const grupo = gruposUsuariosMockData.find(g => g.id === grupoId);
  if (!grupo) {
    throw new Error(`Grupo con ID '${grupoId}' no encontrado`);
  }

  // Verificar que el usuario no esté ya asignado
  const yaAsignado = Object.values(usuariosPorGrupoMockData)
    .flat()
    .some(user => user.id === usuarioId);

  if (yaAsignado) {
    throw new Error('El usuario ya está asignado a un grupo');
  }

  // Simular asignación exitosa
  const nuevoUsuario: IUsuarioGrupo = {
    id: usuarioId,
    nombreCompleto: `Usuario Mock ${usuarioId}`,
    cuip: `CUIP${usuarioId}`,
    cup: `CUP${usuarioId}`,
    telefono: '5551234567'
  };

  // Agregar usuario al grupo
  if (!usuariosPorGrupoMockData[grupoId]) {
    usuariosPorGrupoMockData[grupoId] = [];
  }
  usuariosPorGrupoMockData[grupoId].push(nuevoUsuario);

  // Actualizar contador del grupo
  const grupoIndex = gruposUsuariosMockData.findIndex(g => g.id === grupoId);
  if (grupoIndex !== -1) {
    gruposUsuariosMockData[grupoIndex].cantidadUsuarios++;
  }

  return {
    status: true,
    message: 'Usuario asignado al grupo correctamente',
    data: {
      nombreUsuario: nuevoUsuario.nombreCompleto,
      nombreGrupo: grupo.nombreGrupo
    }
  };
};

/**
 * Función helper para obtener estadísticas generales
 */
export const obtenerEstadisticasUsuarioGrupoMock = async (): Promise<IEstadisticasUsuarioGrupo> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  const totalUsuarios = Object.values(usuariosPorGrupoMockData)
    .flat().length;

  const gruposActivos = gruposUsuariosMockData.filter(g => g.estatus).length;
  const gruposInactivos = gruposUsuariosMockData.filter(g => !g.estatus).length;

  return {
    totalGrupos: gruposUsuariosMockData.length,
    totalUsuarios: totalUsuarios + 10, // Simular usuarios adicionales sin grupo
    usuariosAsignados: totalUsuarios,
    usuariosSinGrupo: 10,
    gruposActivos,
    gruposInactivos
  };
};