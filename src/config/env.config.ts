import { z } from 'zod';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
    console.warn(`[env.config] Variable ${roleName} no definida en .env`);
    return [];
  }

  try {
    const parsed = JSON.parse(envVar);

    // Validar que sea array
    if (!Array.isArray(parsed)) {
      console.error(
        `[env.config] ERROR CRÍTICO: ${roleName} no es un array. ` +
        `Formato esperado: [{"id":1,"nombre":"..."}]. ` +
        `Recibido: ${typeof parsed}`
      );
      return [];
    }

    // Validar estructura con Zod
    const validation = RolesArraySchema.safeParse(parsed);

    if (!validation.success) {
      console.error(
        `[env.config] ERROR CRÍTICO: ${roleName} tiene estructura inválida:`,
        validation.error.issues
      );
      return [];
    }

    return validation.data;

  } catch (error) {
    console.error(
      `[env.config] ERROR CRÍTICO: No se pudo parsear ${roleName}:`,
      error instanceof Error ? error.message : 'Error desconocido'
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
      console.error(
        `[env.config] ERROR: Elemento inválido en ALLOWED_ROLES (tipo: ${typeof role})`
      );
      return false;
    }

    // Verificar que tenga las propiedades requeridas
    if (typeof role.id !== 'number' || typeof role.nombre !== 'string') {
      console.error(
        `[env.config] ERROR: Rol con estructura inválida:`,
        role
      );
      return false;
    }

    return true;
  });

  if (validRoles.length === 0) {
    console.error(
      '[env.config] ERROR CRÍTICO: ALLOWED_ROLES está vacío. ' +
      'El sistema no tiene roles válidos configurados. ' +
      'Verifica tu archivo .env y asegúrate de usar el formato: ' +
      '[{"id":1,"nombre":"NombreRol"}]'
    );
  } else if (validRoles.length !== roles.length) {
    console.warn(
      `[env.config] ADVERTENCIA: ${roles.length - validRoles.length} rol(es) inválido(s) filtrado(s) de ALLOWED_ROLES`
    );
  }

  return validRoles;
};

export const ALLOWED_ROLES = buildAllowedRoles();

// Log de inicialización
if (ALLOWED_ROLES.length > 0) {
  console.info(
    `[env.config] ✅ ALLOWED_ROLES inicializado correctamente con ${ALLOWED_ROLES.length} rol(es)`,
    ALLOWED_ROLES.map(r => r.nombre)
  );
} else {
  console.error(
    '[env.config] ❌ ALLOWED_ROLES vacío - El sistema no funcionará correctamente'
  );
}

function getAppEnvironment(): 'development' | 'staging' | 'production' {
  return import.meta.env.VITE_APP_ENVIRONMENT as 'development' | 'staging' | 'production' || 'development';
}

export const APP_ENVIRONMENT = getAppEnvironment();