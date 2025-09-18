/**
 * Ejemplos de uso del LoginService refactorizado
 * NOTA: Estos ejemplos están basados en una API anterior y necesitan actualización
 * para funcionar con la implementación actual del servicio de login.
 *
 * ⚠️ ARCHIVO DE EJEMPLO - NO USAR EN PRODUCCIÓN
 *
 * @author IPH Development Team
 */

import { login, logout, isLoggedIn } from '../services/user/login.service';
import { canAccess } from '../helper/role/role.helper';
import type { LoginRequest } from '../interfaces/user/login/login.interface';
import type { ProcessedUserRole } from '../interfaces/auth/auth.interface';

// Mock para roles mientras se actualiza el sistema
const mockRoleType = {
  ELEMENTO: 'Elemento',
  SUPERIOR: 'Superior',
  ADMIN: 'Administrador',
  SUPERADMIN: 'SuperAdmin'
} as const;

/**
 * Ejemplo 1: Login básico con manejo de errores
 */
export const exampleBasicLogin = async () => {
  console.log('=== Ejemplo 1: Login Básico ===');

  const credentials: LoginRequest = {
    correo_electronico: 'usuario@ejemplo.com',
    password: 'password123'
  };

  try {
    // NOTA: La API actual usa login() directamente
    await login(credentials);
    console.log('✅ Login ejecutado');

    // Verificar si está loggeado
    const isLoggedInResult = isLoggedIn();
    console.log('Estado de login:', isLoggedInResult ? 'Autenticado' : 'No autenticado');

  } catch (error) {
    console.error('Error en login:', error);
  }
};

/**
 * Ejemplo 2: Verificación de autenticación
 */
export const exampleAuthCheck = () => {
  console.log('\n=== Ejemplo 2: Verificación de Autenticación ===');

  const isAuth = isLoggedIn();
  console.log('¿Usuario autenticado?', isAuth);

  if (isAuth) {
    // Obtener datos del sessionStorage
    const userData = sessionStorage.getItem('user_data');
    const roles = sessionStorage.getItem('roles');

    if (userData) {
      const user = JSON.parse(userData);
      console.log('Usuario actual:', user.nombre);
      console.log('ID:', user.id);
    }

    if (roles) {
      const userRoles = JSON.parse(roles);
      console.log('Roles:', userRoles.map((r: any) => r.nombre).join(', '));
    }
  } else {
    console.log('No hay sesión activa');
  }
};

/**
 * Ejemplo 3: Integración con sistema de roles
 */
export const exampleRoleIntegration = () => {
  console.log('\n=== Ejemplo 3: Integración con Sistema de Roles ===');

  const roles = sessionStorage.getItem('roles');

  if (!roles) {
    console.log('No hay datos de roles disponibles');
    return;
  }

  const userRoles = JSON.parse(roles);
  console.log('Roles del usuario:', userRoles.map((r: any) => r.nombre));

  // Verificar permisos usando el sistema de roles actualizado
  const permissions = {
    puedeVerUsuarios: canAccess(mockRoleType.ELEMENTO, userRoles),
    puedeEditarUsuarios: canAccess(mockRoleType.SUPERIOR, userRoles),
    puedeEliminarUsuarios: canAccess(mockRoleType.ADMIN, userRoles),
    puedeGestionarRoles: canAccess(mockRoleType.SUPERADMIN, userRoles)
  };

  console.log('Permisos del usuario:', permissions);
};

/**
 * Ejemplo 4: Manejo de múltiples roles
 */
export const exampleMultipleRoles = () => {
  console.log('\n=== Ejemplo 4: Manejo de Múltiples Roles ===');

  const roles = sessionStorage.getItem('roles');

  if (!roles) {
    console.log('No hay usuario autenticado');
    return;
  }

  const userRoles = JSON.parse(roles);

  console.log('Información de roles:');
  console.log('- Total de roles:', userRoles.length);
  console.log('- Nombres de roles:', userRoles.map((r: any) => r.nombre));

  // Mostrar detalles de cada rol
  userRoles.forEach((rol: any, index: number) => {
    console.log(`Rol ${index + 1}:`, {
      nombre: rol.nombre,
      id: rol.id
    });
  });
};

/**
 * Ejemplo 5: Logout y limpieza
 */
export const exampleLogout = async () => {
  console.log('\n=== Ejemplo 5: Logout ===');

  const wasAuthenticated = isLoggedIn();
  console.log('Estado antes del logout:', wasAuthenticated ? 'Autenticado' : 'No autenticado');

  if (wasAuthenticated) {
    const userData = sessionStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('Cerrando sesión de:', user.nombre);
    }

    await logout();

    console.log('Estado después del logout:', isLoggedIn() ? 'Autenticado' : 'No autenticado');
  } else {
    console.log('No hay sesión para cerrar');
  }
};

/**
 * Ejemplo 6: Manejo de errores comunes
 */
export const exampleErrorHandling = async () => {
  console.log('\n=== Ejemplo 6: Manejo de Errores ===');

  try {
    // Error de credenciales vacías
    console.log('1. Credenciales vacías:');
    await login({ correo_electronico: '', password: '' });
    console.log('Login exitoso (inesperado)');
  } catch (error) {
    console.log('Error capturado:', (error as Error).message);
  }

  try {
    // Error de credenciales incorrectas
    console.log('\n2. Credenciales incorrectas:');
    await login({
      correo_electronico: 'wrong@example.com',
      password: 'wrongpassword'
    });
    console.log('Login exitoso (inesperado)');
  } catch (error) {
    console.log('Error capturado:', (error as Error).message);
  }
};

/**
 * Ejemplo 7: Configuración del servicio
 */
export const exampleServiceConfiguration = () => {
  console.log('\n=== Ejemplo 7: Configuración del Servicio ===');

  // NOTA: La API actual no expone configuración
  console.log('La configuración del servicio actual se maneja internamente');
  console.log('Las configuraciones se pueden modificar en env.config.ts');
};

/**
 * Ejemplo 8: Simulación de flujo completo
 */
export const exampleCompleteFlow = async () => {
  console.log('\n=== Ejemplo 8: Flujo Completo de Autenticación ===');

  try {
    // 1. Verificar estado inicial
    console.log('1. Estado inicial:', isLoggedIn() ? 'Autenticado' : 'No autenticado');

    // 2. Intentar login
    console.log('2. Intentando login...');
    await login({
      correo_electronico: 'admin@iph.com',
      password: 'admin123'
    });

    console.log('3. Login ejecutado');

    // 4. Verificar autenticación
    console.log('4. Verificando autenticación:', isLoggedIn());

    // 5. Obtener datos del usuario
    const userData = sessionStorage.getItem('user_data');
    if (userData) {
      const user = JSON.parse(userData);
      console.log('5. Usuario autenticado:', user.nombre);
    }

    // 6. Verificar permisos
    const roles = sessionStorage.getItem('roles');
    if (roles) {
      const userRoles = JSON.parse(roles);
      const isAdmin = canAccess(mockRoleType.ADMIN, userRoles);
      console.log('6. ¿Es administrador?', isAdmin);
    }

    // 7. Logout
    console.log('7. Cerrando sesión...');
    await logout();
    console.log('8. Estado final:', isLoggedIn() ? 'Autenticado' : 'No autenticado');

  } catch (error) {
    console.log('Error en el flujo:', (error as Error).message);
  }
};

/**
 * Función principal para ejecutar todos los ejemplos
 * ⚠️ Comentar en producción
 */
export const runAllExamples = async () => {
  console.log('🚀 Iniciando ejemplos del LoginService...\n');
  
  try {
    await exampleBasicLogin();
    exampleAuthCheck();
    exampleRoleIntegration();
    exampleMultipleRoles();
    exampleLogout();
    await exampleErrorHandling();
    exampleServiceConfiguration();
    await exampleCompleteFlow();
    
    console.log('\n✅ Todos los ejemplos completados');
  } catch (error) {
    console.error('\n❌ Error ejecutando ejemplos:', error);
  }
};

// Ejecutar ejemplos automáticamente (comentar en producción)
// runAllExamples();
