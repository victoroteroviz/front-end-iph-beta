/**
 * Ejemplos de uso del sistema de roles IPH
 * NOTA: Estos ejemplos están basados en una API anterior y necesitan actualización
 * para funcionar con la implementación actual del sistema de roles.
 *
 * ⚠️ ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 */

import { canAccess } from '../helper/role/role.helper';
import type { IRole } from '../interfaces/role/role.interface';

// Mock para funciones que no existen en la implementación actual
const mockCreateUserContext = (id: number, role: IRole, username?: string) => ({ id, role, username });
const mockIsSuperAdmin = () => false;
const mockIsAdmin = () => false;
const mockFindRoleByName = (name: string): IRole | null => ({ id: 1, nombre: name });
const mockValidateMultipleRoles = () => ({ isValid: false, message: 'Mock validation' });
const mockGetAvailableRoles = (): IRole[] => [
  { id: 1, nombre: 'SuperAdmin' },
  { id: 2, nombre: 'Administrador' },
  { id: 3, nombre: 'Superior' },
  { id: 4, nombre: 'Elemento' }
];

// Mock para tipos de roles
const mockRoleType = {
  SUPERADMIN: 'SuperAdmin',
  ADMIN: 'Administrador',
  SUPERIOR: 'Superior',
  ELEMENTO: 'Elemento'
} as const;

type MockRoleType = typeof mockRoleType[keyof typeof mockRoleType];

/**
 * Ejemplo 1: Validación básica de roles
 */
export const exampleBasicValidation = () => {
  // Simular un usuario con rol de Administrador
  const adminRole = mockFindRoleByName('Administrador');
  if (!adminRole) {
    console.error('Admin role not found');
    return;
  }

  const userContext = mockCreateUserContext(123, adminRole, 'juan.admin');

  // Verificar si es SuperAdmin (debería ser false)
  console.log('Is SuperAdmin:', mockIsSuperAdmin()); // false

  // Verificar si es Admin o superior (debería ser true)
  console.log('Is Admin or higher:', mockIsAdmin()); // true

  // Verificar acceso específico (usando mock ya que la API actual es diferente)
  const roles = [adminRole];
  console.log('Can access Superior functions:', canAccess(mockRoleType.SUPERIOR, roles)); // ejemplo simplificado
  console.log('Can access SuperAdmin functions:', canAccess(mockRoleType.SUPERADMIN, roles)); // ejemplo simplificado
};

/**
 * Ejemplo 2: Validación estricta vs jerárquica
 */
export const exampleStrictVsHierarchical = () => {
  const superiorRole = mockFindRoleByName('Superior');
  if (!superiorRole) {
    console.error('Superior role not found');
    return;
  }

  const userContext = mockCreateUserContext(456, superiorRole, 'maria.superior');
  const roles = [superiorRole];

  // Validación jerárquica (por defecto) - puede acceder a funciones de Elemento
  console.log('Can access Elemento (hierarchical):', canAccess(mockRoleType.ELEMENTO, roles)); // ejemplo simplificado

  // NOTA: La validación estricta vs jerárquica requiere actualización en la API actual
  console.log('Can access Elemento (strict): MOCK - función no disponible en API actual');
  console.log('Can access Superior (strict):', canAccess(mockRoleType.SUPERIOR, roles));
};

/**
 * Ejemplo 3: Validación de múltiples roles
 */
export const exampleMultipleRoles = () => {
  const elementoRole = mockFindRoleByName('Elemento');
  if (!elementoRole) {
    console.error('Elemento role not found');
    return;
  }

  const userContext = mockCreateUserContext(789, elementoRole, 'carlos.elemento');

  // Verificar si tiene alguno de los roles administrativos
  const adminRoles = [mockRoleType.SUPERADMIN, mockRoleType.ADMIN];
  const validation = mockValidateMultipleRoles();

  console.log('Has admin roles:', validation.isValid); // false
  console.log('Validation message:', validation.message);

  // NOTA: La validación de múltiples roles requiere actualización en la API actual
  console.log('Multiple role validation: MOCK - función simplificada');
};

/**
 * Ejemplo 4: Listar roles disponibles
 */
export const exampleListRoles = () => {
  const roles = mockGetAvailableRoles();
  console.log('Available roles:', roles);

  roles.forEach((role: IRole) => {
    console.log(`- ${role.nombre} (ID: ${role.id})`);
  });
};

/**
 * Ejemplo 5: Uso en un componente simulado
 */
export const exampleComponentUsage = (currentUserId: number, currentUserRole: string) => {
  const userRole = mockFindRoleByName(currentUserRole);
  if (!userRole) {
    console.error(`Role ${currentUserRole} not found`);
    return { canViewUsers: false, canEditUsers: false, canDeleteUsers: false };
  }

  const userContext = mockCreateUserContext(currentUserId, userRole);
  const roles = [userRole];

  // Diferentes niveles de acceso según el rol (adaptado a API actual)
  const permissions = {
    canViewUsers: canAccess(mockRoleType.ELEMENTO, roles), // Todos pueden ver
    canEditUsers: canAccess(mockRoleType.SUPERIOR, roles), // Superior o mayor
    canDeleteUsers: canAccess(mockRoleType.ADMIN, roles), // Admin o mayor
    canManageRoles: canAccess(mockRoleType.SUPERADMIN, roles), // Solo SuperAdmin
  };

  console.log(`Permissions for ${currentUserRole}:`, permissions);
  return permissions;
};

/**
 * Ejemplo 6: Guard para rutas (simulado)
 */
export const exampleRouteGuard = (
  currentUserId: number,
  currentUserRole: string,
  requiredRole: MockRoleType
): boolean => {
  const userRole = mockFindRoleByName(currentUserRole);
  if (!userRole) {
    console.error('User role not found, access denied');
    return false;
  }

  const userContext = mockCreateUserContext(currentUserId, userRole);
  const roles = [userRole];
  const hasAccess = canAccess(requiredRole, roles);

  if (!hasAccess) {
    console.warn(`Access denied: User ${currentUserId} with role ${currentUserRole} cannot access ${requiredRole} route`);
  } else {
    console.log(`Access granted: User ${currentUserId} can access ${requiredRole} route`);
  }

  return hasAccess;
};

// Ejecutar ejemplos (comentar en producción)
/*
console.log('=== Role System Examples ===');
console.log('\n1. Basic Validation:');
exampleBasicValidation();

console.log('\n2. Strict vs Hierarchical:');
exampleStrictVsHierarchical();

console.log('\n3. Multiple Roles:');
exampleMultipleRoles();

console.log('\n4. List Roles:');
exampleListRoles();

console.log('\n5. Component Usage (Admin):');
exampleComponentUsage(100, 'Administrador');

console.log('\n6. Route Guard (Superior accessing Admin route):');
exampleRouteGuard(200, 'Superior', mockRoleType.ADMIN);
*/
