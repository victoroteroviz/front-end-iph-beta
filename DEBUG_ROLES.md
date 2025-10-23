# 🐛 Debug: Problema de Acceso al Módulo Usuarios

## ❌ Problema Identificado

El componente `Usuarios` no permitía acceso a pesar de tener rol de **Administrador**.

---

## 🔍 Causa Raíz Encontrada

**Archivo:** `/src/components/private/components/usuarios/hooks/useUsuarios.ts`
**Línea:** 460 (original)

### **Problema: Dependency Array en useEffect**

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (ANTES)
useEffect(() => {
  const hasAccess = checkPermissions();
  if (!hasAccess) return;
  loadUsuarios();
}, [checkPermissions, loadUsuarios]); // ← PROBLEMA AQUÍ
```

**¿Por qué es un problema?**

1. **`checkPermissions` y `loadUsuarios` son funciones `useCallback`**
2. Cada vez que el componente se renderiza, estas funciones pueden cambiar de referencia
3. Cuando cambian → `useEffect` se ejecuta de nuevo
4. `useEffect` llama a `checkPermissions()` → modifica el estado
5. Modificar estado → causa re-render
6. Re-render → funciones cambian de referencia
7. **LOOP INFINITO** o ejecuciones múltiples no deseadas

**Síntomas:**
- El componente se renderiza múltiples veces
- `checkPermissions()` se ejecuta varias veces
- Puede causar redirecciones inesperadas
- Performance degradada

---

## ✅ Solución Implementada

### **1. Separar responsabilidades de los efectos**

```typescript
// ✅ CÓDIGO CORREGIDO (DESPUÉS)

/**
 * Efecto de inicialización
 * Se ejecuta UNA SOLA VEZ al montar el componente
 */
useEffect(() => {
  const hasAccess = checkPermissions();
  if (!hasAccess) return;

  // Carga inicial
  loadUsuarios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Array vacío = solo se ejecuta al montar

/**
 * Efecto para recargar cuando cambian los filtros
 */
useEffect(() => {
  // Solo recargar si ya pasó la verificación inicial
  if (state.canViewAllUsers || state.canViewTeamUsers) {
    loadUsuarios();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  state.filters.page,
  state.filters.orderBy,
  state.filters.order,
  state.filters.search,
  state.filters.searchBy
]);
```

### **2. Explicación de la Corrección**

#### **Efecto 1: Inicialización (ejecuta UNA vez)**
- **Dependency array vacío:** `[]`
- **Se ejecuta:** Solo al montar el componente
- **Responsabilidad:**
  - Verificar permisos (`checkPermissions()`)
  - Cargar datos iniciales (`loadUsuarios()`)
  - Redirigir si no tiene acceso

#### **Efecto 2: Recarga por filtros (ejecuta cuando cambian filtros)**
- **Dependencies:** Filtros de búsqueda/paginación/ordenamiento
- **Se ejecuta:** Solo cuando el usuario cambia filtros
- **Responsabilidad:**
  - Recargar usuarios cuando cambian filtros
  - Validación previa: solo si tiene permisos

### **3. Ventajas de la Solución**

✅ **Performance:**
- Eliminado loop infinito
- `checkPermissions()` se ejecuta UNA sola vez
- Re-renders controlados

✅ **Comportamiento predecible:**
- Carga inicial → 1 vez
- Recarga por filtros → solo cuando cambian

✅ **Debugging más fácil:**
- Logs claros en consola
- Menos ejecuciones = menos ruido

---

## 🧪 Cómo Verificar que Funciona

### **1. Abrir consola del navegador**
Presiona `F12` o `Ctrl+Shift+I`

### **2. Logs esperados al cargar `/usuarios`:**

```
[UsuariosHook] Validando permisos de usuario { rolesCount: 1 }

[RoleHelper] 1 rol(es) externo(s) validado(s) {
  validRoles: [{ id: 2, nombre: 'Administrador' }]
}

[UsuariosHook] Permisos calculados correctamente {
  validRolesCount: 1,
  roles: ['Administrador'],
  isSuperAdmin: false,
  isAdmin: true,
  canCreateUsers: true,
  canEditUsers: true,
  canDeleteUsers: true,
  canViewAllUsers: true
}

[Auth] access_granted {
  section: 'usuarios',
  userRoles: ['Administrador']
}

[UsuariosHook] Cargando usuarios {
  page: 1,
  orderBy: 'nombre',
  order: 'ASC',
  search: '',
  searchBy: 'nombre'
}

[UsuariosHook] Usuarios cargados exitosamente {
  cantidad: 10,
  totalPages: 3
}
```

### **3. Si ves muchas repeticiones de estos logs:**
❌ **Problema:** El loop infinito todavía existe
✅ **Solución:** Verificar que el código esté actualizado

### **4. Si ves `access_denied`:**
```
[Auth] access_denied {
  section: 'usuarios',
  reason: 'Requiere permisos de Administrador',
  userRoles: ['Superior']
}
```
❌ **Problema:** El rol en sessionStorage no es Admin/SuperAdmin
✅ **Verificar:**
```javascript
// En consola del navegador
JSON.parse(sessionStorage.getItem('roles'))
// Debe retornar: [{ id: 2, nombre: 'Administrador' }] o similar
```

---

## 🔍 Debugging Manual

Si aún tienes problemas, ejecuta esto en la consola del navegador:

```javascript
// === SCRIPT DE DEBUGGING ===
console.log('=== DEBUGGING USUARIOS MODULE ===');

// 1. Verificar sessionStorage
const rolesRaw = sessionStorage.getItem('roles');
const userDataRaw = sessionStorage.getItem('user_data');

console.log('1. SessionStorage roles (raw):', rolesRaw);
console.log('2. SessionStorage user_data (raw):', userDataRaw);

// 2. Parsear datos
let roles, userData;
try {
  roles = JSON.parse(rolesRaw || '[]');
  userData = JSON.parse(userDataRaw || '{}');
  console.log('3. Roles parseados:', roles);
  console.log('4. User data parseado:', userData);
} catch (e) {
  console.error('Error parseando JSON:', e);
}

// 3. Verificar estructura de roles
if (Array.isArray(roles) && roles.length > 0) {
  console.log('5. Primer rol:', roles[0]);
  console.log('6. Estructura correcta:', {
    tieneId: typeof roles[0].id === 'number',
    tieneNombre: typeof roles[0].nombre === 'string',
    nombreValor: roles[0].nombre
  });
} else {
  console.warn('⚠️ Roles está vacío o no es un array');
}

// 4. Simular validación
console.log('7. Verificación manual:');
const esAdmin = roles.some(r => r.nombre === 'Administrador');
const esSuperAdmin = roles.some(r => r.nombre === 'SuperAdmin');
console.log('   - Es Administrador:', esAdmin);
console.log('   - Es SuperAdmin:', esSuperAdmin);
console.log('   - Debería tener acceso:', esAdmin || esSuperAdmin);

// 5. Verificar variable de entorno
const allowedRoles = import.meta.env.VITE_ALLOWED_ROLES;
console.log('8. ALLOWED_ROLES env:', allowedRoles);
```

---

## 📋 Checklist de Verificación

Ejecuta estos pasos en orden:

### **Paso 1: Verificar que el código está actualizado**
```bash
# En terminal
git status

# Deberías ver:
# modified:   src/components/private/components/usuarios/hooks/useUsuarios.ts
```

### **Paso 2: Reiniciar el servidor de desarrollo**
```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### **Paso 3: Limpiar caché del navegador**
1. Presiona `Ctrl+Shift+Delete`
2. Selecciona "Cached images and files"
3. Click en "Clear data"
4. Recarga la página con `Ctrl+F5`

### **Paso 4: Verificar sessionStorage**
```javascript
// En consola
sessionStorage.clear(); // Limpiar todo
// Luego hacer login de nuevo
```

### **Paso 5: Login con rol correcto**
- Usuario debe tener rol: `Administrador` o `SuperAdmin`
- Verificar en consola después del login:
```javascript
JSON.parse(sessionStorage.getItem('roles'))
```

### **Paso 6: Navegar a `/usuarios`**
- Debe permitir acceso
- Logs en consola deben mostrar `access_granted`
- Botón "Nuevo Usuario" debe estar visible

---

## 🚨 Si Aún No Funciona

Envía los siguientes datos:

1. **Output del script de debugging** (lo de arriba)
2. **Screenshot de la consola** con los logs
3. **Contenido de sessionStorage:**
   ```javascript
   console.log(sessionStorage)
   ```
4. **Variables de entorno:**
   ```javascript
   console.log({
     superadmin: import.meta.env.VITE_SUPERADMIN_ROLE,
     admin: import.meta.env.VITE_ADMIN_ROLE,
     superior: import.meta.env.VITE_SUPERIOR_ROLE,
     elemento: import.meta.env.VITE_ELEMENTO_ROLE
   })
   ```

---

## 📝 Resumen de Cambios

**Archivo modificado:**
- `/src/components/private/components/usuarios/hooks/useUsuarios.ts`

**Líneas modificadas:**
- 454-460 (antes) → 454-482 (después)

**Cambio principal:**
```diff
- useEffect(() => {
-   const hasAccess = checkPermissions();
-   if (!hasAccess) return;
-   loadUsuarios();
- }, [checkPermissions, loadUsuarios]);

+ useEffect(() => {
+   const hasAccess = checkPermissions();
+   if (!hasAccess) return;
+   loadUsuarios();
+ }, []); // Solo al montar
+
+ useEffect(() => {
+   if (state.canViewAllUsers || state.canViewTeamUsers) {
+     loadUsuarios();
+   }
+ }, [state.filters...]);
```

---

**Fecha:** 2024-01-30
**Autor:** Sistema IPH Frontend
**Status:** ✅ RESUELTO
