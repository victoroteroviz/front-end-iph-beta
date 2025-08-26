/**
 * Servicio para gestión de perfiles de usuario
 * Implementa patrón mock/real para facilitar desarrollo y testing
 */

import { logInfo, logError } from '../../helper/log/logger.helper';
import { getUserById, createUsuario, updateUsuario } from '../user/crud-user.service';
import { getRoles } from '../roles/get-roles.service';
import { getGrados } from '../catalogs/grados.service';
import { getCargos } from '../catalogs/cargos.service';
import { getMunicipios } from '../catalogs/municipios.service';
import { getAdscripciones } from '../catalogs/adscripciones.service';
import { getSexos } from '../catalogs/sexos.service';

import type { 
  IGetUserById, 
  ICreateUser, 
  IUpdateUser, 
  ICreatedUser 
} from '../../interfaces/user/crud/crud-user.interface';
import type { IRole } from '../../interfaces/role/role.interface';
import type { 
  ICatalogsResponse, 
  IRolesResponse,
  IPerfilUsuarioPayload,
  IUserRoleOperation 
} from '../../interfaces/components/perfilUsuario.interface';

// =====================================================
// CONFIGURACIÓN MOCK/REAL
// =====================================================

const USE_MOCK_DATA = false; // Cambiar a true para usar datos mock

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Obtiene un usuario por ID
 * @param id - ID del usuario
 * @returns Datos del usuario
 */
export const getUsuarioById = async (id: string): Promise<IGetUserById> => {
  logInfo('PerfilUsuarioService', 'Obteniendo usuario por ID', { id });
  
  try {
    if (USE_MOCK_DATA) {
      return await getMockUserById(id);
    } else {
      return await getUserById(id);
    }
  } catch (error) {
    logError('PerfilUsuarioService', 'Error al obtener usuario', { id, error });
    throw error;
  }
};

/**
 * Crea un nuevo usuario
 * @param userData - Datos del usuario a crear
 * @returns Usuario creado
 */
export const createUsuario = async (userData: ICreateUser): Promise<ICreatedUser> => {
  logInfo('PerfilUsuarioService', 'Creando nuevo usuario', { 
    email: userData.correo_electronico 
  });
  
  try {
    if (USE_MOCK_DATA) {
      return await createMockUser(userData);
    } else {
      return await createUsuario(userData);
    }
  } catch (error) {
    logError('PerfilUsuarioService', 'Error al crear usuario', { error });
    throw error;
  }
};

/**
 * Actualiza un usuario existente
 * @param id - ID del usuario
 * @param userData - Datos actualizados
 * @returns Usuario actualizado
 */
export const updateUsuario = async (id: string, userData: IUpdateUser): Promise<ICreatedUser> => {
  logInfo('PerfilUsuarioService', 'Actualizando usuario', { id });
  
  try {
    if (USE_MOCK_DATA) {
      return await updateMockUser(id, userData);
    } else {
      return await updateUsuario(id, userData);
    }
  } catch (error) {
    logError('PerfilUsuarioService', 'Error al actualizar usuario', { id, error });
    throw error;
  }
};

/**
 * Obtiene todos los catálogos necesarios para el formulario
 * @returns Catálogos combinados
 */
export const getCatalogos = async (): Promise<ICatalogsResponse> => {
  logInfo('PerfilUsuarioService', 'Cargando catálogos');
  
  try {
    if (USE_MOCK_DATA) {
      return await getMockCatalogs();
    } else {
      const [grados, cargos, municipios, adscripciones, sexos] = await Promise.all([
        getGrados(),
        getCargos(),
        getMunicipios(),
        getAdscripciones(),
        getSexos()
      ]);
      
      return { grados, cargos, municipios, adscripciones, sexos };
    }
  } catch (error) {
    logError('PerfilUsuarioService', 'Error al cargar catálogos', { error });
    throw error;
  }
};

/**
 * Obtiene los roles disponibles
 * @returns Lista de roles
 */
export const getRolesDisponibles = async (): Promise<IRolesResponse> => {
  logInfo('PerfilUsuarioService', 'Obteniendo roles disponibles');
  
  try {
    if (USE_MOCK_DATA) {
      return await getMockRoles();
    } else {
      const roles = await getRoles();
      return { roles };
    }
  } catch (error) {
    logError('PerfilUsuarioService', 'Error al obtener roles', { error });
    throw error;
  }
};

// =====================================================
// UTILIDADES DE USER ROLES
// =====================================================

/**
 * Construye la estructura user_roles para el backend
 * Mantiene la lógica original del componente legacy
 * 
 * @param rolesSeleccionados - Roles seleccionados en el form
 * @param rolesUsuarios - Roles existentes del usuario
 * @returns Estructura para el backend
 */
export const construirUserRoles = (
  rolesSeleccionados: number[], 
  rolesUsuarios: any[]
): IUserRoleOperation[] => {
  logInfo('PerfilUsuarioService', 'Construyendo user_roles', {
    seleccionados: rolesSeleccionados,
    existentes: rolesUsuarios.length
  });

  // 1. Activar o desactivar los que ya tenía
  const actualizados = rolesUsuarios.map(r => ({
    id: r.id,
    is_active: rolesSeleccionados.includes(r.privilegioId),
  }));

  // 2. Agregar nuevos (que no existían antes)
  const nuevos = rolesSeleccionados
    .filter(idPrivilegio => !rolesUsuarios.some(r => r.privilegioId === idPrivilegio))
    .map(idPrivilegio => ({ 
      id_privilegio: idPrivilegio, 
      is_active: true 
    }));

  // 3. Combinar todo
  const resultado = [...actualizados, ...nuevos];
  
  logInfo('PerfilUsuarioService', 'User roles construidos', {
    actualizados: actualizados.length,
    nuevos: nuevos.length,
    total: resultado.length
  });

  return resultado;
};

/**
 * Convierte datos del formulario a payload para el backend
 * @param formData - Datos del formulario
 * @param rolesUsuarios - Roles existentes del usuario
 * @param isEditing - Si es edición o creación
 * @returns Payload para el backend
 */
export const buildUserPayload = (
  formData: any,
  rolesUsuarios: any[] = [],
  isEditing: boolean = false
): IPerfilUsuarioPayload => {
  const rolesSeleccionados = formData.rolesSeleccionados.map((r: any) => r.value);
  const user_roles = construirUserRoles(rolesSeleccionados, rolesUsuarios);

  const payload: IPerfilUsuarioPayload = {
    nombre: formData.nombre,
    primer_apellido: formData.primerApellido,
    segundo_apellido: formData.segundoApellido,
    correo_electronico: formData.correo,
    telefono: formData.telefono,
    cuip: formData.cuip,
    cup: formData.cup,
    gradoId: parseInt(formData.gradoId),
    cargoId: parseInt(formData.cargoId),
    municipioId: parseInt(formData.municipioId),
    adscripcionId: parseInt(formData.adscripcionId),
    sexoId: parseInt(formData.sexoId),
    is_verific: true,
    user_roles
  };

  // Solo agregar password si es creación y hay contraseña
  if (!isEditing && formData.password) {
    payload.password_hash = formData.password;
  }

  return payload;
};

// =====================================================
// FUNCIONES MOCK (para desarrollo/testing)
// =====================================================

// TODO: Implementar cuando USE_MOCK_DATA = true
// @JSDoc - Estas funciones deberían implementarse para pruebas sin backend

const getMockUserById = async (id: string): Promise<IGetUserById> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data basado en la interfaz real
  return {
    id: parseInt(id),
    nombre: 'Juan',
    primer_apellido: 'Pérez',
    segundo_apellido: 'García',
    correo_electronico: 'juan.perez@iph.gob.mx',
    telefono: '5551234567',
    cuip: 'CUIP123456',
    cup: 'CUP789012',
    grado: { id: 1, nombre: 'Capitán' },
    cargo: { id: 1, nombre: 'Investigador' },
    municipio: { id: 1, nombre: 'Guadalajara' },
    adscripcion: { id: 1, nombre: 'Región Centro' },
    sexo: { id: 1, nombre: 'Masculino' },
    user_roles: [
      { id: 1, privilegioId: 2, is_active: true },
      { id: 2, privilegioId: 3, is_active: true }
    ]
  } as IGetUserById;
};

const createMockUser = async (userData: ICreateUser): Promise<ICreatedUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: Date.now(), ...userData } as ICreatedUser;
};

const updateMockUser = async (id: string, userData: IUpdateUser): Promise<ICreatedUser> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { id: parseInt(id), ...userData } as ICreatedUser;
};

const getMockCatalogs = async (): Promise<ICatalogsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    grados: [{ id: 1, nombre: 'Capitán' }, { id: 2, nombre: 'Teniente' }],
    cargos: [{ id: 1, nombre: 'Investigador' }, { id: 2, nombre: 'Analista' }],
    municipios: [{ id: 1, nombre: 'Guadalajara' }, { id: 2, nombre: 'Zapopan' }],
    adscripciones: [{ id: 1, nombre: 'Región Centro' }, { id: 2, nombre: 'Región Norte' }],
    sexos: [{ id: 1, nombre: 'Masculino' }, { id: 2, nombre: 'Femenino' }]
  };
};

const getMockRoles = async (): Promise<IRolesResponse> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    roles: [
      { id: 1, nombre: 'SuperAdmin' },
      { id: 2, nombre: 'Administrador' },
      { id: 3, nombre: 'Superior' },
      { id: 4, nombre: 'Elemento' }
    ]
  };
};