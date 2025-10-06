/**
 * @fileoverview Mock data para grupos
 * @version 1.0.0
 * @description Datos de prueba que simulan las respuestas del backend
 */

import { IGrupo, IResponseGrupo } from '../../interfaces/grupos';

/**
 * Mock data para grupos - simula la respuesta de GET /api/grupo
 */
export const gruposMockData: IGrupo[] = [
  {
    id: '1',
    nombre: 'Administradores'
  },
  {
    id: '2',
    nombre: 'Supervisores'
  },
  {
    id: '3',
    nombre: 'Analistas'
  },
  {
    id: '4',
    nombre: 'Consultores'
  }
];

/**
 * Simula el servicio GET /api/grupo
 */
export const getGruposMock = async (): Promise<IGrupo[]> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...gruposMockData];
};

/**
 * Simula el servicio POST /api/grupo
 */
export const createGrupoMock = async (nombre: string): Promise<IResponseGrupo> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simular creación exitosa
  const newId = (gruposMockData.length + 1).toString();
  gruposMockData.push({ id: newId, nombre });

  return {
    status: true,
    message: 'Grupo creado exitosamente',
    data: {
      nombre
    }
  };
};

/**
 * Simula el servicio PATCH /api/grupo/:id
 */
export const updateGrupoMock = async (id: string, nombre: string): Promise<IResponseGrupo> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 600));

  // Buscar el grupo
  const grupoIndex = gruposMockData.findIndex(g => g.id === id);

  if (grupoIndex === -1) {
    throw new Error('Grupo no encontrado');
  }

  // Actualizar el grupo
  gruposMockData[grupoIndex].nombre = nombre;

  return {
    status: true,
    message: 'Grupo actualizado exitosamente',
    data: {
      nombre
    }
  };
};

/**
 * Simula el servicio DELETE /api/grupo/:id
 */
export const deleteGrupoMock = async (id: string): Promise<IResponseGrupo> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 700));

  // Buscar el grupo
  const grupoIndex = gruposMockData.findIndex(g => g.id === id);

  if (grupoIndex === -1) {
    throw new Error('Grupo no encontrado');
  }

  const grupoName = gruposMockData[grupoIndex].nombre;

  // Simular eliminación (soft delete)
  gruposMockData.splice(grupoIndex, 1);

  return {
    status: true,
    message: 'Grupo eliminado exitosamente',
    data: {
      nombre: grupoName
    }
  };
};