/**
 * Ejemplos de uso del LoginService refactorizado
 * Demuestra cómo usar el nuevo servicio de autenticación
 * 
 * ## Características principales demostradas:
 * - Login y logout seguros
 * - Validación de sesiones
 * - Integración con sistema de roles
 * - Manejo de errores robusto
 * - Almacenamiento atómico
 * 
 * @author IPH Development Team
 */

import loginService from '../services/user/login.service';
import { canAccess } from '../helper/role.helper';
import { RoleType } from '../interfaces/role';
import type { LoginCredentials } from '../interfaces/auth';

/**
 * Ejemplo 1: Login básico con manejo de errores
 */
export const exampleBasicLogin = async () => {
  console.log('=== Ejemplo 1: Login Básico ===');
  
  const credentials: LoginCredentials = {
    correo: 'usuario@ejemplo.com',
    password: 'password123'
  };

  try {
    const result = await loginService.login(credentials);
    
    if (result.success) {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', result.user?.profile.nombre_completo);
      console.log('Rol principal:', result.user?.roles.rol_principal.privilegio_nombre);
      console.log('Todos los roles:', result.user?.roles.nombres_roles);
    } else {
      console.log('❌ Login fallido:', result.message);
      console.log('Tipo de error:', result.error?.type);
    }
  } catch (error) {
    console.error('Error inesperado:', error);
  }
};

/**
 * Ejemplo 2: Verificación de autenticación
 */
export const exampleAuthCheck = () => {
  console.log('\n=== Ejemplo 2: Verificación de Autenticación ===');
  
  const isAuth = loginService.isAuthenticated();
  console.log('¿Usuario autenticado?', isAuth);

  if (isAuth) {
    const currentUser = loginService.getCurrentUser();
    if (currentUser) {
      console.log('Usuario actual:', currentUser.profile.nombre_completo);
      console.log('ID:', currentUser.profile.id);
      console.log('Rol principal:', currentUser.roles.rol_principal.privilegio_nombre);
      
      // Obtener información de sesión
      const sessionInfo = loginService.getSessionInfo();
      if (sessionInfo) {
        console.log('Sesión creada:', new Date(sessionInfo.created_at));
        console.log('Expira:', new Date(sessionInfo.expires_at));
        console.log('Última actividad:', new Date(sessionInfo.last_activity));
      }
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
  
  const userContext = loginService.getUserRoleContext();
  
  if (!userContext) {
    console.log('No hay contexto de usuario disponible');
    return;
  }

  console.log('Contexto de usuario creado:', {
    userId: userContext.userId,
    rol: userContext.currentRole.nombre,
    username: userContext.username
  });

  // Verificar permisos usando el sistema de roles
  const permissions = {
    puedeVerUsuarios: canAccess(userContext, RoleType.ELEMENTO),
    puedeEditarUsuarios: canAccess(userContext, RoleType.SUPERIOR),
    puedeEliminarUsuarios: canAccess(userContext, RoleType.ADMIN),
    puedeGestionarRoles: canAccess(userContext, RoleType.SUPERADMIN, true)
  };

  console.log('Permisos del usuario:', permissions);
};

/**
 * Ejemplo 4: Manejo de múltiples roles
 */
export const exampleMultipleRoles = () => {
  console.log('\n=== Ejemplo 4: Manejo de Múltiples Roles ===');
  
  const currentUser = loginService.getCurrentUser();
  
  if (!currentUser) {
    console.log('No hay usuario autenticado');
    return;
  }

  const rolesData = currentUser.roles;
  
  console.log('Información de roles:');
  console.log('- Rol principal:', rolesData.rol_principal.privilegio_nombre);
  console.log('- Total de roles:', rolesData.roles.length);
  console.log('- Nombres de roles:', rolesData.nombres_roles);
  console.log('- IDs de privilegios:', rolesData.privilegio_ids);

  // Mostrar detalles de cada rol
  rolesData.roles.forEach((rol, index) => {
    console.log(`Rol ${index + 1}:`, {
      nombre: rol.privilegio_nombre,
      id: rol.privilegio_id,
      esPrincipal: rol.es_principal,
      fechaAsignacion: new Date(rol.fecha_registro)
    });
  });
};

/**
 * Ejemplo 5: Logout y limpieza
 */
export const exampleLogout = () => {
  console.log('\n=== Ejemplo 5: Logout ===');
  
  const wasAuthenticated = loginService.isAuthenticated();
  console.log('Estado antes del logout:', wasAuthenticated ? 'Autenticado' : 'No autenticado');
  
  if (wasAuthenticated) {
    const currentUser = loginService.getCurrentUser();
    console.log('Cerrando sesión de:', currentUser?.profile.nombre_completo);
    
    loginService.logout();
    
    console.log('Estado después del logout:', loginService.isAuthenticated() ? 'Autenticado' : 'No autenticado');
    console.log('Usuario actual:', loginService.getCurrentUser());
  } else {
    console.log('No hay sesión para cerrar');
  }
};

/**
 * Ejemplo 6: Manejo de errores comunes
 */
export const exampleErrorHandling = async () => {
  console.log('\n=== Ejemplo 6: Manejo de Errores ===');
  
  // Error de credenciales vacías
  console.log('1. Credenciales vacías:');
  const emptyResult = await loginService.login({ correo: '', password: '' });
  console.log('Resultado:', emptyResult.success ? 'Éxito' : emptyResult.message);
  console.log('Tipo de error:', emptyResult.error?.type);

  // Error de credenciales incorrectas
  console.log('\n2. Credenciales incorrectas:');
  const wrongResult = await loginService.login({ 
    correo: 'wrong@example.com', 
    password: 'wrongpassword' 
  });
  console.log('Resultado:', wrongResult.success ? 'Éxito' : wrongResult.message);
  console.log('Tipo de error:', wrongResult.error?.type);
};

/**
 * Ejemplo 7: Configuración del servicio
 */
export const exampleServiceConfiguration = () => {
  console.log('\n=== Ejemplo 7: Configuración del Servicio ===');
  
  // Actualizar configuración
  loginService.updateConfig({
    useEncryption: true,
    validateTokenExpiration: true,
    tokenExpirationWarning: 600000, // 10 minutos
    autoCleanStorage: true
  });
  
  console.log('Configuración actualizada');
  
  // El servicio aplicará la nueva configuración en futuras operaciones
};

/**
 * Ejemplo 8: Simulación de flujo completo
 */
export const exampleCompleteFlow = async () => {
  console.log('\n=== Ejemplo 8: Flujo Completo de Autenticación ===');
  
  // 1. Verificar estado inicial
  console.log('1. Estado inicial:', loginService.isAuthenticated() ? 'Autenticado' : 'No autenticado');
  
  // 2. Intentar login
  console.log('2. Intentando login...');
  const loginResult = await loginService.login({
    correo: 'admin@iph.com',
    password: 'admin123'
  });
  
  if (loginResult.success) {
    console.log('3. Login exitoso');
    
    // 4. Verificar autenticación
    console.log('4. Verificando autenticación:', loginService.isAuthenticated());
    
    // 5. Obtener datos del usuario
    const user = loginService.getCurrentUser();
    console.log('5. Usuario autenticado:', user?.profile.nombre_completo);
    
    // 6. Verificar permisos
    const userContext = loginService.getUserRoleContext();
    if (userContext) {
      const isAdmin = canAccess(userContext, RoleType.ADMIN);
      console.log('6. ¿Es administrador?', isAdmin);
    }
    
    // 7. Actualizar actividad
    loginService.updateActivity();
    console.log('7. Actividad actualizada');
    
    // 8. Logout
    console.log('8. Cerrando sesión...');
    loginService.logout();
    console.log('9. Estado final:', loginService.isAuthenticated() ? 'Autenticado' : 'No autenticado');
    
  } else {
    console.log('3. Login fallido:', loginResult.message);
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
