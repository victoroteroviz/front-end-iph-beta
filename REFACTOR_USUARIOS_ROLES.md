# 🔐 Refactorización: Control de Roles en Componente Usuarios

## 📋 Resumen

Se ha implementado el sistema centralizado de validación de roles (Role Helper v2.0.0) en el componente `Usuarios`, reemplazando la lógica manual de verificación de roles por el sistema estandarizado del proyecto.

**Fecha:** 2024-01-30
**Componente afectado:** `/src/components/private/components/usuarios/`
**Archivo modificado:** `hooks/useUsuarios.ts`

---

## 🎯 Objetivo

**Proteger la gestión de usuarios** para que **solo SuperAdmin y Admin** puedan:
- ✅ Acceder al módulo de usuarios
- ✅ Crear nuevos usuarios
- ✅ Editar usuarios existentes
- ✅ Eliminar usuarios

---

## ⚙️ Cambios Implementados

### **1. Imports Actualizados**

```typescript
// ANTES (líneas 12-14)
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';

// DESPUÉS (líneas 12-20)
import { showSuccess, showError, showWarning } from '../../../../../helper/notification/notification.helper';
import { logInfo, logError, logAuth } from '../../../../../helper/log/logger.helper';
import {
  getUserRoles,
  validateExternalRoles,
  canExternalRoleAccess,
  hasExternalRole
} from '../../../../../helper/role/role.helper';
```

**Funciones importadas:**
- `getUserRoles()` - Obtiene roles desde sessionStorage
- `validateExternalRoles()` - Valida que los roles sean válidos
- `canExternalRoleAccess()` - Verifica acceso jerárquico
- `hasExternalRole()` - Verifica rol específico

---

### **2. Función `checkPermissions()` Refactorizada**

#### **ANTES (líneas 60-101):**
```typescript
const checkPermissions = useCallback(() => {
  // Leer datos del sessionStorage con las keys correctas
  const userData = JSON.parse(sessionStorage.getItem('user_data') || '{}');
  const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');

  // Determinar permisos basado en roles
  const isSuperAdmin = userRoles.some((role: any) => role.nombre === 'SuperAdmin');
  const isAdmin = userRoles.some((role: any) => role.nombre === 'Administrador');
  const isSuperior = userRoles.some((role: any) => role.nombre === 'Superior');
  const isElemento = userRoles.some((role: any) => role.nombre === 'Elemento');

  setState(prev => ({
    ...prev,
    canCreateUsers: isSuperAdmin || isAdmin,
    canEditUsers: isSuperAdmin || isAdmin,
    canDeleteUsers: isSuperAdmin || isAdmin,
    canViewAllUsers: isSuperAdmin || isAdmin,
    canViewTeamUsers: isSuperior || isElemento
  }));

  // Verificar acceso básico
  if (!isSuperAdmin && !isAdmin && !isSuperior && !isElemento) {
    showWarning('No tienes permisos para acceder a esta sección', 'Acceso Restringido');
    navigate('/inicio');
    return false;
  }

  return true;
}, [navigate]);
```

**Problemas detectados:**
- ❌ Parsing manual de `sessionStorage`
- ❌ Lógica dispersa de validación de roles
- ❌ Uso de `any` para tipos
- ❌ No valida que los roles sean válidos según la configuración del sistema

---

#### **DESPUÉS (líneas 66-149):**
```typescript
/**
 * Verifica y establece permisos del usuario actual
 * Usa el sistema centralizado de validación de roles (role.helper v2.0.0)
 *
 * @returns true si tiene acceso, false si debe redirigir
 */
const checkPermissions = useCallback(() => {
  // Obtener roles desde sessionStorage usando el helper
  const userRoles = getUserRoles();

  logInfo('UsuariosHook', 'Validando permisos de usuario', {
    rolesCount: userRoles.length
  });

  // Validar que los roles sean válidos según la configuración del sistema
  const validRoles = validateExternalRoles(userRoles);

  if (validRoles.length === 0) {
    logError(
      'UsuariosHook',
      new Error('Roles inválidos'),
      'Usuario sin roles válidos en el sistema'
    );
    showWarning('No tienes roles válidos para acceder a esta sección', 'Acceso Restringido');
    navigate('/inicio');
    return false;
  }

  // Verificar roles específicos usando el helper centralizado
  const isSuperAdmin = hasExternalRole(validRoles, 'SUPERADMIN');
  const isAdmin = hasExternalRole(validRoles, 'ADMIN');
  const isSuperior = hasExternalRole(validRoles, 'SUPERIOR');
  const isElemento = hasExternalRole(validRoles, 'ELEMENTO');

  // Verificar acceso jerárquico (Admin y superiores)
  const canAccessAdminFeatures = canExternalRoleAccess(validRoles, 'ADMIN');

  // Establecer permisos en el estado
  // Solo SuperAdmin y Admin pueden gestionar usuarios
  setState(prev => ({
    ...prev,
    canCreateUsers: canAccessAdminFeatures,  // Admin o SuperAdmin
    canEditUsers: canAccessAdminFeatures,    // Admin o SuperAdmin
    canDeleteUsers: canAccessAdminFeatures,  // Admin o SuperAdmin
    canViewAllUsers: canAccessAdminFeatures, // Admin o SuperAdmin
    canViewTeamUsers: isSuperior || isElemento // Superior/Elemento (funcionalidad futura)
  }));

  logInfo('UsuariosHook', 'Permisos calculados correctamente', {
    validRolesCount: validRoles.length,
    roles: validRoles.map(r => r.nombre),
    isSuperAdmin,
    isAdmin,
    isSuperior,
    isElemento,
    canCreateUsers: canAccessAdminFeatures,
    canEditUsers: canAccessAdminFeatures,
    canDeleteUsers: canAccessAdminFeatures,
    canViewAllUsers: canAccessAdminFeatures
  });

  // Verificar acceso básico a la sección de usuarios
  // Solo Admin y SuperAdmin pueden acceder
  if (!canAccessAdminFeatures) {
    logAuth('access_denied', false, {
      section: 'usuarios',
      reason: 'Requiere permisos de Administrador',
      userRoles: validRoles.map(r => r.nombre)
    });
    showWarning(
      'Solo Administradores y SuperAdmins pueden acceder a la gestión de usuarios',
      'Acceso Restringido'
    );
    navigate('/inicio');
    return false;
  }

  logAuth('access_granted', true, {
    section: 'usuarios',
    userRoles: validRoles.map(r => r.nombre)
  });

  return true;
}, [navigate]);
```

**Mejoras implementadas:**
- ✅ Usa `getUserRoles()` para lectura segura de sessionStorage
- ✅ Valida roles con `validateExternalRoles()`
- ✅ TypeScript strict (sin `any`)
- ✅ Logging estructurado detallado
- ✅ Validación jerárquica con `canExternalRoleAccess()`
- ✅ Mensajes de error específicos

---

### **3. Función `handleCreateUser()` Mejorada**

#### **ANTES (líneas 214-222):**
```typescript
const handleCreateUser = useCallback(() => {
  if (!state.canCreateUsers) {
    showWarning('No tienes permisos para crear usuarios', 'Acceso Denegado');
    return;
  }

  logInfo('UsuariosHook', 'Navegando a crear usuario');
  navigate('/usuarios/nuevo');
}, [state.canCreateUsers, navigate]);
```

**Problema:** Solo verifica el estado, no valida en tiempo real.

---

#### **DESPUÉS (líneas 262-289):**
```typescript
/**
 * Navega a la página de creación de usuario
 * Requiere: Admin o SuperAdmin
 */
const handleCreateUser = useCallback(() => {
  // Doble validación: estado + verificación en tiempo real
  const currentRoles = getUserRoles();
  const canCreate = canExternalRoleAccess(currentRoles, 'ADMIN');

  if (!state.canCreateUsers || !canCreate) {
    logAuth('create_user_denied', false, {
      reason: 'Permisos insuficientes',
      statePermission: state.canCreateUsers,
      runtimePermission: canCreate
    });
    showWarning(
      'Solo Administradores y SuperAdmins pueden crear usuarios',
      'Acceso Denegado'
    );
    return;
  }

  logInfo('UsuariosHook', 'Navegando a crear usuario');
  logAuth('create_user_initiated', true, {
    userRoles: currentRoles.map(r => r.nombre)
  });
  navigate('/usuarios/nuevo');
}, [state.canCreateUsers, navigate]);
```

**Mejoras:**
- ✅ **Doble validación**: estado + verificación en tiempo real
- ✅ Logging de auditoría con `logAuth()`
- ✅ Mensaje específico para permisos insuficientes
- ✅ JSDoc descriptivo

---

### **4. Función `handleEditUser()` Mejorada**

#### **ANTES (líneas 224-232):**
```typescript
const handleEditUser = useCallback((usuario: IPaginatedUsers) => {
  if (!state.canEditUsers) {
    showWarning('No tienes permisos para editar usuarios', 'Acceso Denegado');
    return;
  }

  logInfo('UsuariosHook', 'Navegando a editar usuario', { userId: usuario.id });
  navigate(`/usuarios/editar/${usuario.id}`);
}, [state.canEditUsers, navigate]);
```

---

#### **DESPUÉS (líneas 291-318):**
```typescript
/**
 * Navega a la página de edición de usuario
 * Requiere: Admin o SuperAdmin
 */
const handleEditUser = useCallback((usuario: IPaginatedUsers) => {
  // Doble validación: estado + verificación en tiempo real
  const currentRoles = getUserRoles();
  const canEdit = canExternalRoleAccess(currentRoles, 'ADMIN');

  if (!state.canEditUsers || !canEdit) {
    logAuth('edit_user_denied', false, {
      userId: usuario.id,
      reason: 'Permisos insuficientes'
    });
    showWarning(
      'Solo Administradores y SuperAdmins pueden editar usuarios',
      'Acceso Denegado'
    );
    return;
  }

  logInfo('UsuariosHook', 'Navegando a editar usuario', { userId: usuario.id });
  logAuth('edit_user_initiated', true, {
    userId: usuario.id,
    userName: `${usuario.nombre} ${usuario.primer_apellido}`
  });
  navigate(`/usuarios/editar/${usuario.id}`);
}, [state.canEditUsers, navigate]);
```

**Mejoras:**
- ✅ Doble validación
- ✅ Logging de auditoría detallado
- ✅ Información del usuario en logs

---

### **5. Función `handleDeleteUser()` Mejorada**

#### **ANTES (líneas 234-249):**
```typescript
const handleDeleteUser = useCallback((usuario: IPaginatedUsers) => {
  if (!state.canDeleteUsers) {
    showWarning('No tienes permisos para eliminar usuarios', 'Acceso Denegado');
    return;
  }

  // Abrir el modal de confirmación
  setState(prev => ({
    ...prev,
    deleteModalOpen: true,
    usuarioToDelete: usuario,
    deleteError: null
  }));

  logInfo('UsuariosHook', 'Modal de eliminación abierto', { userId: usuario.id });
}, [state.canDeleteUsers]);
```

---

#### **DESPUÉS (líneas 320-353):**
```typescript
/**
 * Abre el modal de confirmación para eliminar usuario
 * Requiere: Admin o SuperAdmin
 */
const handleDeleteUser = useCallback((usuario: IPaginatedUsers) => {
  // Doble validación: estado + verificación en tiempo real
  const currentRoles = getUserRoles();
  const canDelete = canExternalRoleAccess(currentRoles, 'ADMIN');

  if (!state.canDeleteUsers || !canDelete) {
    logAuth('delete_user_denied', false, {
      userId: usuario.id,
      reason: 'Permisos insuficientes'
    });
    showWarning(
      'Solo Administradores y SuperAdmins pueden eliminar usuarios',
      'Acceso Denegado'
    );
    return;
  }

  // Abrir el modal de confirmación
  setState(prev => ({
    ...prev,
    deleteModalOpen: true,
    usuarioToDelete: usuario,
    deleteError: null
  }));

  logInfo('UsuariosHook', 'Modal de eliminación abierto', {
    userId: usuario.id,
    userName: `${usuario.nombre} ${usuario.primer_apellido}`
  });
}, [state.canDeleteUsers]);
```

**Mejoras:**
- ✅ Doble validación
- ✅ Logging de auditoría
- ✅ Información completa del usuario

---

## 🛡️ Matriz de Permisos Implementada

| Acción | SuperAdmin | Admin | Superior | Elemento |
|--------|------------|-------|----------|----------|
| **Acceder al módulo** | ✅ | ✅ | ❌ | ❌ |
| **Ver lista de usuarios** | ✅ | ✅ | ❌ | ❌ |
| **Crear usuario** | ✅ | ✅ | ❌ | ❌ |
| **Editar usuario** | ✅ | ✅ | ❌ | ❌ |
| **Eliminar usuario** | ✅ | ✅ | ❌ | ❌ |
| **Ver botón "Nuevo Usuario"** | ✅ | ✅ | ❌ | ❌ |

---

## 🔍 Flujo de Validación

### **1. Al cargar el componente:**
```
Usuario accede → useUsuarios.checkPermissions()
                 ↓
              getUserRoles() (lee sessionStorage)
                 ↓
              validateExternalRoles() (valida contra sistema)
                 ↓
              validRoles.length === 0? → Redirige a /inicio
                 ↓
              canExternalRoleAccess(validRoles, 'ADMIN')
                 ↓
              false? → Redirige a /inicio
                 ↓
              true → Establece permisos en estado
                 ↓
              Renderiza componente
```

### **2. Al hacer clic en "Nuevo Usuario":**
```
Click en botón → handleCreateUser()
                 ↓
              getUserRoles() (lectura en tiempo real)
                 ↓
              canExternalRoleAccess(currentRoles, 'ADMIN')
                 ↓
              false? → showWarning() + logAuth('denied')
                 ↓
              true → navigate('/usuarios/nuevo') + logAuth('initiated')
```

### **3. Protección en UI:**
```
UsuariosFilters.tsx (línea 155):
{canCreate && (
  <button onClick={onCreate}>
    Nuevo Usuario
  </button>
)}
```
**Si `canCreate === false`, el botón NO se renderiza.**

---

## 📊 Logging de Auditoría

Todas las operaciones ahora generan logs de auditoría:

### **Acceso al módulo:**
```typescript
// Acceso denegado
logAuth('access_denied', false, {
  section: 'usuarios',
  reason: 'Requiere permisos de Administrador',
  userRoles: ['Superior']
});

// Acceso concedido
logAuth('access_granted', true, {
  section: 'usuarios',
  userRoles: ['Administrador']
});
```

### **Creación de usuario:**
```typescript
// Intento denegado
logAuth('create_user_denied', false, {
  reason: 'Permisos insuficientes',
  statePermission: false,
  runtimePermission: false
});

// Creación iniciada
logAuth('create_user_initiated', true, {
  userRoles: ['SuperAdmin']
});
```

### **Edición de usuario:**
```typescript
logAuth('edit_user_initiated', true, {
  userId: '123',
  userName: 'Juan Pérez'
});
```

### **Eliminación de usuario:**
```typescript
logAuth('delete_user_denied', false, {
  userId: '456',
  reason: 'Permisos insuficientes'
});
```

---

## ✅ Verificaciones de Seguridad

### **1. Validación Doble (Defense in Depth):**
- ✅ Validación en `checkPermissions()` al montar componente
- ✅ Validación en tiempo real en cada acción (crear/editar/eliminar)
- ✅ Control en UI (botones no se renderizan si no hay permiso)

### **2. Validación de Roles:**
- ✅ Roles se validan contra `ALLOWED_ROLES` del `.env`
- ✅ Verificación de ID + nombre (doble validación)
- ✅ Si roles inválidos → redirige a `/inicio`

### **3. Jerarquía Automática:**
- ✅ `canExternalRoleAccess(roles, 'ADMIN')` → true si es Admin o SuperAdmin
- ✅ SuperAdmin hereda permisos de Admin
- ✅ Basado en configuración centralizada (`permissions.config.ts`)

### **4. Logging Completo:**
- ✅ Todos los intentos de acceso se registran
- ✅ Intentos denegados incluyen razón
- ✅ Acciones exitosas incluyen datos del usuario

---

## 🧪 Casos de Prueba Recomendados

### **Test 1: Usuario sin roles**
```
Dado: Usuario con roles = []
Cuando: Intenta acceder a /usuarios
Entonces: Redirige a /inicio + warning "No tienes roles válidos"
```

### **Test 2: Usuario Elemento**
```
Dado: Usuario con rol "Elemento"
Cuando: Intenta acceder a /usuarios
Entonces: Redirige a /inicio + warning "Solo Administradores..."
```

### **Test 3: Usuario Superior**
```
Dado: Usuario con rol "Superior"
Cuando: Intenta acceder a /usuarios
Entonces: Redirige a /inicio + warning "Solo Administradores..."
```

### **Test 4: Usuario Admin**
```
Dado: Usuario con rol "Administrador"
Cuando: Accede a /usuarios
Entonces: Muestra lista de usuarios + botón "Nuevo Usuario"
Cuando: Click en "Nuevo Usuario"
Entonces: Navega a /usuarios/nuevo
```

### **Test 5: Usuario SuperAdmin**
```
Dado: Usuario con rol "SuperAdmin"
Cuando: Accede a /usuarios
Entonces: Muestra lista de usuarios + botón "Nuevo Usuario"
Cuando: Click en editar usuario
Entonces: Navega a /usuarios/editar/:id
Cuando: Click en eliminar usuario
Entonces: Abre modal de confirmación
```

### **Test 6: Roles inválidos**
```
Dado: Usuario con roles = [{ id: 999, nombre: 'RolInvalido' }]
Cuando: Intenta acceder a /usuarios
Entonces: Redirige a /inicio + warning "Roles inválidos"
```

---

## 📦 Archivos Afectados

### **Modificados:**
- ✅ `/src/components/private/components/usuarios/hooks/useUsuarios.ts`
  - Líneas 15-20: Nuevos imports
  - Líneas 66-149: `checkPermissions()` refactorizado
  - Líneas 262-289: `handleCreateUser()` mejorado
  - Líneas 291-318: `handleEditUser()` mejorado
  - Líneas 320-353: `handleDeleteUser()` mejorado

### **Sin cambios (ya protegidos):**
- ✅ `/src/components/private/components/usuarios/Usuarios.tsx`
  - Ya usa `state.canCreateUsers` del hook
- ✅ `/src/components/private/components/usuarios/components/UsuariosFilters.tsx`
  - Botón "Nuevo Usuario" ya está protegido con `{canCreate && ...}`

---

## 🚀 Próximos Pasos

1. **Probar en desarrollo:**
   ```bash
   npm run dev
   ```

2. **Verificar con diferentes roles:**
   - Login como Elemento → debe redirigir
   - Login como Superior → debe redirigir
   - Login como Admin → debe permitir acceso completo
   - Login como SuperAdmin → debe permitir acceso completo

3. **Revisar logs en consola del navegador:**
   - Verificar logs de `UsuariosHook`
   - Verificar logs de `access_granted` / `access_denied`
   - Verificar logs de `create_user_initiated`, `edit_user_initiated`, etc.

4. **Aplicar mismo patrón a otros componentes:**
   - HistorialIPH
   - EstadisticasUsuario
   - PerfilUsuario
   - etc.

---

## 📚 Referencias

- **Documentación completa:** `/src/helper/role/README.md`
- **Ejemplos de uso:** `/EXAMPLES_ROLE_HELPER.md`
- **Configuración de permisos:** `/src/config/permissions.config.ts`
- **Role Helper:** `/src/helper/role/role.helper.ts`

---

## 📝 Notas Adicionales

### **¿Por qué doble validación?**
La validación doble (estado + tiempo real) previene:
- Manipulación de estado en DevTools
- Cambios en sessionStorage después de montar componente
- Race conditions en renderizado

### **¿Por qué usar `canExternalRoleAccess` en lugar de `hasExternalRole`?**
- `hasExternalRole(roles, 'ADMIN')` → true solo si tiene "Administrador"
- `canExternalRoleAccess(roles, 'ADMIN')` → true si tiene "Administrador" O "SuperAdmin" (jerarquía)

### **¿El sistema es retrocompatible?**
Sí, el código existente sigue funcionando. Los componentes que no han migrado aún pueden usar el patrón antiguo sin problemas.

---

**Autor:** Sistema IPH Frontend
**Versión:** 2.0.0
**Fecha:** 2024-01-30
