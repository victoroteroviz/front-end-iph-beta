/**
 * Servicio para búsqueda de usuarios por nombre
 * Endpoint: GET /api/users-web/buscar-usuario-nombre/:term
 * Implementa patrón mock/real para facilitar migración futura a API real
 *
 * @example
 * // Búsqueda por nombre
 * GET /api/users-web/buscar-usuario-nombre/Juan
 *
 * // Búsqueda por nombre con espacios (se codifica automáticamente)
 * GET /api/users-web/buscar-usuario-nombre/Juan%20Carlos
 */

import { logInfo, logError } from '../../../../../../../helper/log/logger.helper';
import { HttpHelper } from '../../../../../../../helper/http/http.helper';
import { API_BASE_URL } from '../../../../../../../config/env.config';
import type {
  IBuscarUsuarioNombreParams,
  IBuscarUsuarioNombreResponse,
  IUsuarioBusqueda
} from '../../../../../../../interfaces/user/crud';

// =====================================================
// CONFIGURACIÓN MOCK/REAL
// =====================================================

const USE_MOCK_DATA = false; // Cambiar a true solo para testing

// Instancia de HttpHelper configurada
const http: HttpHelper = HttpHelper.getInstance({
  baseURL: API_BASE_URL || '',
  timeout: 10000,
  retries: 3,
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
});

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Busca usuarios por nombre (nombre, apellido o combinación)
 *
 * **Características del backend:**
 * - Búsqueda flexible en nombre completo y campos individuales
 * - Normalización automática (trim + lowercase)
 * - Solo usuarios activos (is_active = true)
 * - Ordenado por nombre y apellido (ASC)
 * - Límite de 20 resultados por búsqueda
 * - Búsqueda con LIKE '%term%' (case-insensitive)
 *
 * @param params - Parámetros de búsqueda
 * @returns Array de usuarios encontrados (máximo 20)
 *
 * @example
 * ```typescript
 * // Búsqueda simple
 * const usuarios = await buscarUsuariosPorNombre({
 *   termino: 'Juan'
 * });
 *
 * // Búsqueda con nombre completo
 * const usuarios = await buscarUsuariosPorNombre({
 *   termino: 'Juan Garcia'
 * });
 * ```
 */
export const buscarUsuariosPorNombre = async (
  params: IBuscarUsuarioNombreParams
): Promise<IBuscarUsuarioNombreResponse> => {
  logInfo('BuscarUsuarioNombreService', 'Iniciando búsqueda de usuarios por nombre', {
    termino: params.termino
  });

  try {
    if (USE_MOCK_DATA) {
      return await getMockBusqueda(params);
    } else {
      return await getRealBusqueda(params);
    }
  } catch (error) {
    logError(
      'BuscarUsuarioNombreService',
      'Error al buscar usuarios por nombre',
      `${error}`
    );
    throw error;
  }
};

// =====================================================
// FUNCIONES REALES (API BACKEND)
// =====================================================

/**
 * Realiza búsqueda real contra el backend
 * @param params - Parámetros de búsqueda
 * @returns Array de usuarios encontrados
 */
const getRealBusqueda = async (
  params: IBuscarUsuarioNombreParams
): Promise<IBuscarUsuarioNombreResponse> => {
  try {
    // Validar que el término de búsqueda no esté vacío
    if (!params.termino || params.termino.trim().length === 0) {
      throw new Error('El término de búsqueda no puede estar vacío');
    }

    // El endpoint usa parámetro de ruta, no query params
    const termino = encodeURIComponent(params.termino.trim());
    const endpoint = `/api/users-web/buscar-usuario-nombre/${termino}`;

    logInfo('BuscarUsuarioNombreService', 'Realizando petición GET', {
      endpoint,
      termino: params.termino
    });

    const response = await http.get<IBuscarUsuarioNombreResponse>(endpoint);

    logInfo('BuscarUsuarioNombreService', 'Búsqueda exitosa', {
      resultados: response.data.length,
      status: response.status
    });

    return response.data;

  } catch (error) {
    logError(
      'BuscarUsuarioNombreService',
      'Error en petición al backend',
      `${error}`
    );

    throw new Error(
      error instanceof Error ? error.message : 'Error al buscar usuarios'
    );
  }
};

// =====================================================
// FUNCIONES MOCK (DATOS DE DESARROLLO)
// =====================================================

// TODO: Remover cuando API real esté completamente implementada
// @JSDoc - Estas funciones simulan respuestas del backend

/**
 * Simula búsqueda de usuarios (solo para desarrollo)
 * @param params - Parámetros de búsqueda
 * @returns Mock de respuesta con usuarios filtrados
 */
const getMockBusqueda = async (
  params: IBuscarUsuarioNombreParams
): Promise<IBuscarUsuarioNombreResponse> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));

  logInfo('BuscarUsuarioNombreService', 'Usando datos MOCK', {
    termino: params.termino,
    advertencia: 'Cambiar USE_MOCK_DATA a false para usar API real'
  });

  const mockUsuarios: IUsuarioBusqueda[] = getMockUsuarios();

  // Filtrar por término de búsqueda
  const terminoLower = params.termino.toLowerCase().trim();
  const usuariosFiltrados = mockUsuarios.filter(usuario => {
    const nombreCompleto = `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`.toLowerCase();
    return nombreCompleto.includes(terminoLower);
  });

  return usuariosFiltrados;
};

/**
 * Datos mock de usuarios para testing
 * Basados en la estructura real del endpoint
 */
const getMockUsuarios = (): IUsuarioBusqueda[] => [
  {
    id: 'e2b3298e-2af0-468c-b0c6-39761cc9ebc6',
    primer_apellido: 'Alvarez',
    segundo_apellido: 'Lopez',
    nombre: 'Tomas',
    cuip: 'CUIP000000',
    cup: 'CUP000000'
  },
  {
    id: 'f3c4409f-3bf1-579d-c1d7-40872dd0fcd7',
    primer_apellido: 'García',
    segundo_apellido: 'López',
    nombre: 'Juan Carlos',
    cuip: 'GALJ850315HDFRPN01',
    cup: 'CUP000001'
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    primer_apellido: 'Martínez',
    segundo_apellido: 'Hernández',
    nombre: 'María Elena',
    cuip: 'MAHM900520MDFRRL02',
    cup: 'CUP000002'
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    primer_apellido: 'Rodríguez',
    segundo_apellido: 'Sánchez',
    nombre: 'Carlos Alberto',
    cuip: 'ROSC880710HDFDNR03',
    cup: 'CUP000003'
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    primer_apellido: 'López',
    segundo_apellido: 'Ramírez',
    nombre: 'Ana Patricia',
    cuip: 'LORA920815MDFPMN04',
    cup: 'CUP000004'
  }
];

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Valida los parámetros de búsqueda
 * @param params - Parámetros a validar
 * @returns true si son válidos, error si no
 */
export const validarParametrosBusqueda = (
  params: IBuscarUsuarioNombreParams
): { valido: boolean; error?: string } => {
  if (!params.termino || params.termino.trim().length === 0) {
    return {
      valido: false,
      error: 'El término de búsqueda no puede estar vacío'
    };
  }

  if (params.termino.trim().length < 2) {
    return {
      valido: false,
      error: 'El término de búsqueda debe tener al menos 2 caracteres'
    };
  }

  return { valido: true };
};

/**
 * Sanitiza el término de búsqueda
 * @param termino - Término a sanitizar
 * @returns Término limpio y seguro
 */
export const sanitizarTerminoBusqueda = (termino: string): string => {
  return termino
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .slice(0, 100); // Máximo 100 caracteres
};

/**
 * Formatea el nombre completo de un usuario
 * @param usuario - Usuario a formatear
 * @returns Nombre completo formateado
 */
export const formatearNombreCompleto = (usuario: IUsuarioBusqueda): string => {
  return `${usuario.nombre} ${usuario.primer_apellido} ${usuario.segundo_apellido}`.trim();
};

/**
 * Obtiene las iniciales de un usuario
 * @param usuario - Usuario
 * @returns Iniciales del usuario
 */
export const obtenerIniciales = (usuario: IUsuarioBusqueda): string => {
  const nombre = usuario.nombre.charAt(0).toUpperCase();
  const apellido = usuario.primer_apellido.charAt(0).toUpperCase();
  return `${nombre}${apellido}`;
};
