import { z } from 'zod';
import { logInfo, logWarning, logError } from '../helper/log/logger.helper';
import runtimeConfig from './runtime.config';

// API Base URL - Usa runtime config con fallback a import.meta.env
export const API_BASE_URL = runtimeConfig.apiBaseUrl;

// ==================== SCHEMAS DE VALIDACIÓN ====================

/**
 * Schema Zod para validar la estructura de un rol
 * Protege contra configuraciones incorrectas en .env
 */
const RoleSchema = z.object({
  id: z.number()
    .int('ID de rol debe ser entero')
    .positive('ID de rol debe ser positivo')
    .max(999, 'ID de rol fuera de rango permitido'),
  nombre: z.string()
    .min(1, 'Nombre de rol no puede estar vacío')
    .max(50, 'Nombre de rol demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, 'Nombre de rol contiene caracteres inválidos')
    .refine(
      (val) => ['SuperAdmin', 'Administrador', 'Superior', 'Elemento'].includes(val),
      { message: 'Rol no válido según configuración del sistema' }
    )
});

/**
 * Schema para validar array de roles
 * Asegura que cada variable de entorno sea un array válido
 */
const RolesArraySchema = z.array(RoleSchema)
  .min(1, 'Array de roles debe tener al menos un elemento')
  .max(10, 'Demasiados roles en una sola variable');

/**
 * Función helper para parsear y validar roles desde .env
 *
 * @param envVar - Variable de entorno a parsear
 * @param roleName - Nombre del rol para logging
 * @returns Array de roles validados o array vacío si hay error
 */
const parseAndValidateRole = (envVar: string | undefined, roleName: string): any[] => {
  if (!envVar) {
    logWarning('env.config', `Variable ${roleName} no definida en .env`);
    return [];
  }

  try {
    const parsed = JSON.parse(envVar);

    // Validar que sea array
    if (!Array.isArray(parsed)) {
      logError(
        'env.config',
        { 
          variable: roleName, 
          receivedType: typeof parsed,
          expectedFormat: '[{"id":1,"nombre":"..."}]'
        },
        `${roleName} no es un array`
      );
      return [];
    }

    // Validar estructura con Zod
    const validation = RolesArraySchema.safeParse(parsed);

    if (!validation.success) {
      logError(
        'env.config',
        { variable: roleName, issues: validation.error.issues },
        `${roleName} tiene estructura inválida`
      );
      return [];
    }

    return validation.data;

  } catch (error) {
    logError(
      'env.config',
      error,
      `No se pudo parsear ${roleName}`
    );
    return [];
  }
};

// ==================== CONFIGURACIÓN DE ROLES ====================

/**
 * Roles del sistema parseados y validados desde .env
 * Cada variable debe ser un array JSON válido en formato:
 * [{"id":1,"nombre":"NombreRol"}]
 */
export const SUPERADMIN_ROLE = parseAndValidateRole(
  import.meta.env.VITE_SUPERADMIN_ROLE,
  'VITE_SUPERADMIN_ROLE'
);

export const ADMIN_ROLE = parseAndValidateRole(
  import.meta.env.VITE_ADMIN_ROLE,
  'VITE_ADMIN_ROLE'
);

export const SUPERIOR_ROLE = parseAndValidateRole(
  import.meta.env.VITE_SUPERIOR_ROLE,
  'VITE_SUPERIOR_ROLE'
);

export const ELEMENTO_ROLE = parseAndValidateRole(
  import.meta.env.VITE_ELEMENTO_ROLE,
  'VITE_ELEMENTO_ROLE'
);

// ==================== ALLOWED_ROLES CON VALIDACIÓN ====================

/**
 * Array con todos los roles permitidos del sistema
 * Construido con spread operator después de validación
 *
 * @security Validación Zod aplicada antes del spread
 * @security Verificación adicional de estructura final
 */
const buildAllowedRoles = (): any[] => {
  const roles = [
    ...SUPERADMIN_ROLE,
    ...ADMIN_ROLE,
    ...SUPERIOR_ROLE,
    ...ELEMENTO_ROLE
  ];

  // Validación final: verificar que no haya elementos inválidos
  const validRoles = roles.filter((role) => {
    // Verificar que sea objeto
    if (typeof role !== 'object' || role === null) {
      logError(
        'env.config',
        { roleType: typeof role },
        'Elemento inválido en ALLOWED_ROLES'
      );
      return false;
    }

    // Verificar que tenga las propiedades requeridas
    if (typeof role.id !== 'number' || typeof role.nombre !== 'string') {
      logError(
        'env.config',
        role,
        'Rol con estructura inválida'
      );
      return false;
    }

    return true;
  });

  if (validRoles.length === 0) {
    logError(
      'env.config',
      {
        message: 'El sistema no tiene roles válidos configurados',
        expectedFormat: '[{"id":1,"nombre":"NombreRol"}]'
      },
      'ALLOWED_ROLES está vacío'
    );
  } else if (validRoles.length !== roles.length) {
    logWarning(
      'env.config',
      `${roles.length - validRoles.length} rol(es) inválido(s) filtrado(s) de ALLOWED_ROLES`
    );
  }

  return validRoles;
};

export const ALLOWED_ROLES = buildAllowedRoles();

// Log de inicialización (lazy - se ejecuta después de que todos los módulos estén cargados)
let isLogged = false;
export const logAllowedRolesStatus = () => {
  if (isLogged) return;
  isLogged = true;

  if (ALLOWED_ROLES.length > 0) {
    logInfo(
      'env.config',
      `✅ ALLOWED_ROLES inicializado correctamente con ${ALLOWED_ROLES.length} rol(es)`,
      { roles: ALLOWED_ROLES.map(r => r.nombre) }
    );
  } else {
    logError(
      'env.config',
      { rolesCount: 0 },
      'ALLOWED_ROLES vacío - El sistema no funcionará correctamente'
    );
  }
};

/**
 * Obtiene el ambiente de la aplicación desde variables de entorno
 * con validación explícita
 *
 * @returns El ambiente configurado o 'development' por defecto
 *
 * IMPORTANTE: Esta función valida explícitamente que el valor sea uno
 * de los ambientes permitidos antes de retornarlo, previniendo
 * configuraciones incorrectas que podrían comprometer la seguridad
 * o el comportamiento de la aplicación.
 *
 * @example
 * ```typescript
 * // En .env:
 * VITE_APP_ENVIRONMENT=production
 *
 * // Resultado:
 * APP_ENVIRONMENT === 'production' // ✓
 * ```
 *
 * @since 1.0.0
 * @version 2.0.0 - Fix de precedencia de operadores
 * @version 2.1.0 - Removed logging from initialization to prevent circular dependency
 */
// APP_ENVIRONMENT - Usa runtime config con fallback automático
export const APP_ENVIRONMENT = runtimeConfig.appEnvironment;

// Función para loggear el ambiente (se llama después de la inicialización)
let isEnvLogged = false;
export const logEnvironmentStatus = () => {
  if (isEnvLogged) return;
  isEnvLogged = true;

  const env = import.meta.env.VITE_APP_ENVIRONMENT;

  if (env === 'development' || env === 'staging' || env === 'production') {
    logInfo('env.config', `✅ Ambiente configurado: ${env}`);
  } else if (env !== undefined && env !== null && env !== '') {
    logWarning(
      'env.config',
      `⚠️ Ambiente inválido "${env}". Valores permitidos: development, staging, production. Usando 'development' por defecto.`
    );
  } else {
    logWarning(
      'env.config',
      "⚠️ Variable VITE_APP_ENVIRONMENT no definida. Usando 'development' por defecto."
    );
  }
};