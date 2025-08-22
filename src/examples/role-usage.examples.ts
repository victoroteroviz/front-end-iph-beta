/**
 * Ejemplos de uso del sistema de roles IPH
 * Demuestra cómo utilizar los helpers y servicios de roles
 */

import { 
  createUserContext, 
  isSuperAdmin, 
  isAdmin, 
  canAccess, 
  findRoleByName,
  validateMultipleRoles,
  getAvailableRoles
} from '../helper/role.helper';
import { RoleType } from '../interfaces/role';

/**
 * Ejemplo 1: Validación básica de roles
 */
export const exampleBasicValidation = () => {
  // Simular un usuario con rol de Administrador
  const adminRole = findRoleByName('Administrador');
  if (!adminRole) {
    console.error('Admin role not found');
    return;
  }

  const userContext = createUserContext(123, adminRole, 'juan.admin');

  // Verificar si es SuperAdmin (debería ser false)
  console.log('Is SuperAdmin:', isSuperAdmin(userContext)); // false

  // Verificar si es Admin o superior (debería ser true)
  console.log('Is Admin or higher:', isAdmin(userContext)); // true

  // Verificar acceso específico
  console.log('Can access Superior functions:', canAccess(userContext, RoleType.SUPERIOR)); // true (jerárquico)
  console.log('Can access SuperAdmin functions:', canAccess(userContext, RoleType.SUPERADMIN)); // false
};

/**
 * Ejemplo 2: Validación estricta vs jerárquica
 */
export const exampleStrictVsHierarchical = () => {
  const superiorRole = findRoleByName('Superior');
  if (!superiorRole) {
    console.error('Superior role not found');
    return;
  }

  const userContext = createUserContext(456, superiorRole, 'maria.superior');

  // Validación jerárquica (por defecto) - puede acceder a funciones de Elemento
  console.log('Can access Elemento (hierarchical):', canAccess(userContext, RoleType.ELEMENTO)); // true

  // Validación estricta - solo puede acceder a funciones exactas de Superior
  console.log('Can access Elemento (strict):', canAccess(userContext, RoleType.ELEMENTO, true)); // false
  console.log('Can access Superior (strict):', canAccess(userContext, RoleType.SUPERIOR, true)); // true
};

/**
 * Ejemplo 3: Validación de múltiples roles
 */
export const exampleMultipleRoles = () => {
  const elementoRole = findRoleByName('Elemento');
  if (!elementoRole) {
    console.error('Elemento role not found');
    return;
  }

  const userContext = createUserContext(789, elementoRole, 'carlos.elemento');

  // Verificar si tiene alguno de los roles administrativos
  const adminRoles = [RoleType.SUPERADMIN, RoleType.ADMIN];
  const validation = validateMultipleRoles(userContext, adminRoles);
  
  console.log('Has admin roles:', validation.isValid); // false
  console.log('Validation message:', validation.message);

  // Verificar si tiene algún rol válido del sistema
  const allRoles = [RoleType.SUPERADMIN, RoleType.ADMIN, RoleType.SUPERIOR, RoleType.ELEMENTO];
  const anyRoleValidation = validateMultipleRoles(userContext, allRoles);
  
  console.log('Has any valid role:', anyRoleValidation.isValid); // true
  console.log('Matched role:', anyRoleValidation.matchedRole); // 'elemento'
};

/**
 * Ejemplo 4: Listar roles disponibles
 */
export const exampleListRoles = () => {
  const roles = getAvailableRoles();
  console.log('Available roles:', roles);
  
  roles.forEach(role => {
    console.log(`- ${role.nombre} (ID: ${role.id})`);
  });
};

/**
 * Ejemplo 5: Uso en un componente simulado
 */
export const exampleComponentUsage = (currentUserId: number, currentUserRole: string) => {
  const userRole = findRoleByName(currentUserRole);
  if (!userRole) {
    console.error(`Role ${currentUserRole} not found`);
    return { canViewUsers: false, canEditUsers: false, canDeleteUsers: false };
  }

  const userContext = createUserContext(currentUserId, userRole);

  // Diferentes niveles de acceso según el rol
  const permissions = {
    canViewUsers: canAccess(userContext, RoleType.ELEMENTO), // Todos pueden ver
    canEditUsers: canAccess(userContext, RoleType.SUPERIOR), // Superior o mayor
    canDeleteUsers: canAccess(userContext, RoleType.ADMIN), // Admin o mayor
    canManageRoles: canAccess(userContext, RoleType.SUPERADMIN, true), // Solo SuperAdmin
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
  requiredRole: RoleType
): boolean => {
  const userRole = findRoleByName(currentUserRole);
  if (!userRole) {
    console.error('User role not found, access denied');
    return false;
  }

  const userContext = createUserContext(currentUserId, userRole);
  const hasAccess = canAccess(userContext, requiredRole);

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
exampleRouteGuard(200, 'Superior', RoleType.ADMIN);
*/
