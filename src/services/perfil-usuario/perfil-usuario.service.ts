/**
 * Servicio para gestión de perfiles de usuario
 * Implementa patrón mock/real para facilitar desarrollo y testing
 */

import { logInfo, logError } from '../../helper/log/logger.helper';
import { getUserById, createUsuario as createUsuarioAPI, updateUsuario as updateUsuarioAPI } from '../user/crud-user.service';
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
  ICreatedUser,
  UserRole
} from '../../interfaces/user/crud/crud-user.interface';
import type { 
  ICatalogsResponse, 
  IRolesResponse,
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
    logError('PerfilUsuarioService', error, `Error al obtener usuario - id: ${id}`);
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
      return await createUsuarioAPI(userData);
    }
  } catch (error) {
    logError('PerfilUsuarioService', error, 'Error al crear usuario');
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
      return await updateUsuarioAPI(id, userData);
    }
  } catch (error) {
    logError('PerfilUsuarioService', error, `Error al actualizar usuario - id: ${id}`);
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
      logInfo('PerfilUsuarioService', 'Usando datos mock');
      return await getMockCatalogs();
    } else {
      logInfo('PerfilUsuarioService', 'Usando API real, ejecutando peticiones...');

      const [grados, cargos, municipios, adscripciones, sexos] = await Promise.all([
        getGrados(),
        getCargos(),
        getMunicipios(),
        getAdscripciones(),
        getSexos()
      ]);

      logInfo('PerfilUsuarioService', 'Catálogos obtenidos de la API', {
        gradosCount: Array.isArray(grados) ? grados.length : 'No es array',
        cargosCount: Array.isArray(cargos) ? cargos.length : 'No es array',
        municipiosCount: Array.isArray(municipios) ? municipios.length : 'No es array'
      });

      return { grados: grados as any, cargos: cargos as any, municipios: municipios as any, adscripciones, sexos: sexos as any };
    }
  } catch (error) {
    logError('PerfilUsuarioService', error, 'Error al cargar catálogos');
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
    logError('PerfilUsuarioService', error, 'Error al obtener roles');
    throw error;
  }
};

// =====================================================
// UTILIDADES DE USER ROLES
// =====================================================

/**
 * Construye la estructura user_roles para el backend NestJS
 * Coincide exactamente con lo que espera el UpdateUsersWebDto
 * Implementa la lógica de los custom validators:
 * - RequireIdPrivilegioIfIdIsNull: Si no hay ID, debe tener id_privilegio
 * - ForbidIdPrivilegioIfIdExists: Si hay ID, no debe tener id_privilegio
 *
 * @param rolesSeleccionados - Roles seleccionados en el form
 * @param rolesUsuarios - Roles existentes del usuario
 * @returns Estructura para el backend NestJS que cumple con UserRoleUpdateDto[]
 */
export const construirUserRoles = (
  rolesSeleccionados: number[],
  rolesUsuarios: any[]
): UserRole[] => {
  logInfo('PerfilUsuarioService', 'Construyendo user_roles para NestJS UpdateUsersWebDto', {
    seleccionados: rolesSeleccionados,
    existentes: rolesUsuarios.length
  });

  const resultado: UserRole[] = [];

  // 1. Procesar roles existentes (UPDATE) - Cumple con ForbidIdPrivilegioIfIdExists
  rolesUsuarios.forEach(rolExistente => {
    const userRole: UserRole = {
      id: rolExistente.id.toString(), // Backend espera string en UpdateUsersWebDto
      is_active: rolesSeleccionados.includes(rolExistente.privilegioId)
      // NO incluir id_privilegio para roles existentes (ForbidIdPrivilegioIfIdExists)
    };
    resultado.push(userRole);
  });

  // 2. Agregar roles nuevos (INSERT) - Cumple con RequireIdPrivilegioIfIdIsNull
  const rolesNuevos = rolesSeleccionados.filter(privilegioId =>
    !rolesUsuarios.some(r => r.privilegioId === privilegioId)
  );

  rolesNuevos.forEach(privilegioId => {
    const userRole: UserRole = {
      // NO incluir id para roles nuevos (será null/undefined)
      id_privilegio: privilegioId, // REQUERIDO para roles nuevos (RequireIdPrivilegioIfIdIsNull)
      is_active: true
    };
    resultado.push(userRole);
  });

  logInfo('PerfilUsuarioService', 'User roles construidos para UpdateUsersWebDto', {
    totalRoles: resultado.length,
    rolesExistentes: rolesUsuarios.length,
    rolesNuevos: rolesNuevos.length,
    validationCompliant: true
  });

  return resultado;
};

/**
 * Convierte datos del formulario a ICreateUser para crear usuario
 * @param formData - Datos del formulario
 * @returns Payload para crear usuario
 */
export const buildCreateUserPayload = (formData: any): ICreateUser => {
  const rolesSeleccionados = formData.rolesSeleccionados.map((r: any) => r.value);

  const payload: ICreateUser = {
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
    password_hash: formData.password,
    roles: rolesSeleccionados
  };

  return payload;
};

/**
 * Convierte datos del formulario a IUpdateUser para actualización en NestJS
 * Mapea correctamente los campos del frontend al formato que espera UpdateUsersWebDto
 *
 * @param formData - Datos del formulario (camelCase frontend)
 * @param rolesUsuarios - Roles existentes del usuario
 * @returns Payload para el backend NestJS (snake_case backend)
 */
export const buildUpdateUserPayload = (
  formData: any,
  rolesUsuarios: any[] = []
): IUpdateUser => {
  const rolesSeleccionados = formData.rolesSeleccionados.map((r: any) => r.value);
  const user_roles = construirUserRoles(rolesSeleccionados, rolesUsuarios);

  // Mapeo explícito frontend camelCase → backend snake_case para UpdateUsersWebDto
  const payload: IUpdateUser = {
    // Campos de texto - cumplen con @IsString() y @Length()
    nombre: formData.nombre.trim(),
    primer_apellido: formData.primerApellido.trim(),
    segundo_apellido: formData.segundoApellido.trim(),
    correo_electronico: formData.correo.trim(), // @IsEmail()
    telefono: formData.telefono.trim(),

    // Códigos de identificación - pueden ser vacíos o con longitud mínima
    cuip: formData.cuip?.trim() || '',
    cup: formData.cup?.trim() || '',

    // IDs de catálogos - @IsNumber() @IsInt() @IsPositive()
    gradoId: parseInt(formData.gradoId, 10),
    cargoId: parseInt(formData.cargoId, 10),
    municipioId: parseInt(formData.municipioId, 10),
    adscripcionId: parseInt(formData.adscripcionId, 10),
    sexoId: parseInt(formData.sexoId, 10),

    // Campo booleano por defecto
    is_verific: true,

    // Array de roles que cumple con UserRoleUpdateDto[] y custom validators
    user_roles
  };

  logInfo('PerfilUsuarioService', 'Payload construido para UpdateUsersWebDto', {
    camposBasicos: Object.keys(payload).filter(k => k !== 'user_roles').length,
    totalRoles: user_roles.length,
    validStructure: true
  });

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
    id: id,
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
    ],
    photo: undefined,
    is_active: true,
    is_verific: true,
    ultima_conexion: new Date().toISOString(),
    fecha_registro: new Date().toISOString()
  } as unknown as IGetUserById;
};

const createMockUser = async (userData: ICreateUser): Promise<ICreatedUser> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    id: Date.now().toString(),
    ...userData,
    is_active: true,
    ultima_conexion: new Date().toISOString(),
    fecha_registro: new Date().toISOString(),
    fecha_modificacion: new Date().toISOString()
  } as ICreatedUser;
};

const updateMockUser = async (id: string, userData: IUpdateUser): Promise<ICreatedUser> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    id: id,
    ...userData,
    is_active: true,
    ultima_conexion: new Date().toISOString(),
    password_hash: 'mock_hash',
    fecha_registro: new Date().toISOString(),
    fecha_modificacion: new Date().toISOString()
  } as ICreatedUser;
};

const getMockCatalogs = async (): Promise<ICatalogsResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    grados: [{ id: 1, nombre: 'Capitán' }, { id: 2, nombre: 'Teniente' }],
    cargos: [{ id: 1, nombre: 'Investigador' }, { id: 2, nombre: 'Analista' }],
    municipios: [
      {
        id: 1,
        nombre: 'Guadalajara',
        estado: { id: 1, nombre: 'Jalisco', codigo: 'JAL' }
      },
      {
        id: 2,
        nombre: 'Zapopan',
        estado: { id: 1, nombre: 'Jalisco', codigo: 'JAL' }
      },
      {
        id: 3,
        nombre: 'Monterrey',
        estado: { id: 2, nombre: 'Nuevo León', codigo: 'NL' }
      }
    ],
    adscripciones: [
      {
        id: 1,
        nombre: 'Comisaría Centro',
        institucion: {
          id: 1,
          nombre_corto: 'SSP',
          nombre_largo: 'Secretaría de Seguridad Pública',
          codigo: 'SSP-001'
        }
      },
      {
        id: 2,
        nombre: 'Comisaría Norte',
        institucion: {
          id: 1,
          nombre_corto: 'SSP',
          nombre_largo: 'Secretaría de Seguridad Pública',
          codigo: 'SSP-002'
        }
      },
      {
        id: 3,
        nombre: 'Dirección General',
        institucion: {
          id: 2,
          nombre_corto: 'FGE',
          nombre_largo: 'Fiscalía General del Estado',
          codigo: 'FGE-001'
        }
      }
    ],
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