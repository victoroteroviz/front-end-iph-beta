# 📋 IPH FRONTEND - GUÍA RÁPIDA PARA CLAUDE

## 🎯 CONTEXTO DEL PROYECTO

**Stack:** React 18 + TypeScript 5 + Vite 5 | **Versión:** 3.6.0
**Principios:** SOLID, KISS, DRY | **Patrones:** Singleton, Custom Hooks, Observer, Atomic Components

---

## 🏗️ ESTRUCTURA DE CARPETAS

```
src/
├── components/     # UI por tipo (public/private/shared)
├── services/       # Lógica de negocio y APIs
├── helper/         # Utilities singleton (http, log, security, roles)
├── config/         # Configuraciones centralizadas (env, status, permissions, routes)
├── interfaces/     # Tipos TypeScript
├── utils/          # Funciones auxiliares reutilizables
└── mock/           # Datos de prueba (legacy - en desuso)
```

---

## 🔐 SISTEMA DE ROLES Y PERMISOS

**Helper centralizado:** `/src/helper/role/role.helper.ts`  
**Config:** `/src/config/permissions.config.ts`

### **Jerarquía de Roles**
```typescript
SUPERADMIN (nivel 1) → Admin, Superior, Elemento
ADMIN (nivel 2)      → Superior, Elemento
SUPERIOR (nivel 3)   → Elemento
ELEMENTO (nivel 4)   → Solo acceso propio
```

### **APIs Principales**

```typescript
// Funciones jerárquicas (RECOMENDADAS)
canAccessAdmin(roles)    // SuperAdmin + Admin
canAccessSuperior(roles) // SuperAdmin + Admin + Superior
canAccessElemento(roles) // Todos los roles

// Funciones específicas
isSuperAdmin(roles), isAdmin(roles), isSuperior(roles), isElemento(roles)

// Helper de roles
getUserRoles()  // Obtiene roles con cache 5s + validación Zod
```

**Variables de Entorno:**
```bash
VITE_SUPERADMIN_ROLE=[{"id":1,"nombre":"SuperAdmin"}]
VITE_ADMIN_ROLE=[{"id":2,"nombre":"Administrador"}]
VITE_SUPERIOR_ROLE=[{"id":3,"nombre":"Superior"}]
VITE_ELEMENTO_ROLE=[{"id":4,"nombre":"Elemento"}]
```

---

## 🛠️ HELPERS CRÍTICOS

### **1. Logger Helper** (`src/helper/log/logger.helper.ts`)

```typescript
// Niveles de logging (0 a 5)
logVerbose(module, message, data?)  // Debugging profundo
logDebug(module, message, data?)    // Development
logInfo(module, message, data?)     // Info general
logWarning(module, message, data?)  // Advertencias
logError(module, error, context?)   // Errores
logCritical(module, message, data?) // Críticos

// Especializados
logHttp(method, url, status, duration?, data?)
logAuth(action, success, details?)
```

**Características:** Serialización segura, Buffer circular, Rate limiting, Stack traces, Métricas

### **2. HTTP Helper** (`src/helper/http/http_helper.ts`)

```typescript
httpHelper.get<T>(url, config?)
httpHelper.post<T>(url, body, config?)
httpHelper.put<T>(url, body, config?)
httpHelper.delete<T>(url, config?)

// Configuración
timeout: 30s | retries: 3 | cache: opcional | logging: automático
```

### **3. Security Helper** (`src/helper/security/security.helper.ts`)
- `sanitizeInput()` - Limpia XSS
- `isAccountLocked()` - Rate limiting
- `generateCSRFToken()` - Protección CSRF

### **4. Notification Helper** (`src/helper/notification/notification.helper.ts`)
```typescript
showSuccess(message), showError(message), showInfo(message), showWarning(message)
```

### **5. Status Config** (`src/config/status.config.ts`)
```typescript
getStatusConfig(estatus) // → { color, bgColor, label }
isValidStatus(estatus)   // Validación
getValidStatuses()       // Lista completa

// Estatus: Procesando, Supervisión, Finalizado, N/D
```

---

## 📦 COMPONENTES MIGRADOS (10)

1. **Login** - Auth con Zod, rate limiting, CSRF
2. **Dashboard** - Layout con sidebar/topbar, filtrado de navegación por roles
3. **Inicio** - Dashboard con estadísticas
4. **EstadisticasUsuario** - Stats por usuario con filtros
5. **HistorialIPH** - Historial con filtros + **DetalleIPH v2.0** (100% API sin mocks)
6. **IphOficial** - Vista detallada de IPH
7. **InformePolicial** - Lista de IPH con auto-refresh y filtros por rol
8. **PerfilUsuario** - CRUD perfiles con validación Zod
9. **Usuarios** - Sistema CRUD con tabla virtualizada
10. **InformeEjecutivo** - Vista de lectura con mapas (react-leaflet) y export PDF

---

## 🔧 PATRÓN DE IMPLEMENTACIÓN

### **Estructura de Componente**
```
src/components/[tipo]/components/[nombre]/
├── [Nombre].tsx          # Componente principal
├── README.md             # Documentación
├── hooks/
│   └── use[Nombre].ts   # Lógica de negocio separada
├── components/
│   └── [Atomic].tsx     # Componentes atómicos
└── sections/
    └── [Section].tsx    # Secciones específicas
```

### **Validación de Roles en Componentes**

```typescript
// PATRÓN RECOMENDADO (Opción A+B: Defense in Depth + Centralización)

import { getUserRoles } from '@/helper/role/role.helper';
import { canAccessAdmin } from '@/config/permissions.config';

// En hooks personalizados
const permisos = useMemo(() => {
  const userRoles = getUserRoles();  // ← Cache 5s + Zod automático
  
  return {
    canCreate: canAccessAdmin(userRoles),
    canEdit: canAccessAdmin(userRoles),
    canView: canAccessSuperior(userRoles)
  };
}, []);
```

### **Logging Estructurado**

```typescript
import { logInfo, logError, logWarning } from '@/helper/log/logger.helper';

// Logging de acciones
logInfo('ComponentName', 'Acción realizada', { userId, timestamp });

// Logging de errores
try {
  await operation();
} catch (error) {
  logError('ComponentName', error, 'Contexto del error');
}
```

### **Notificaciones**

```typescript
import { showSuccess, showError } from '@/helper/notification/notification.helper';

try {
  await saveData();
  showSuccess('Datos guardados exitosamente');
} catch (error) {
  showError('Error al guardar los datos');
}
```

---

## 🚀 SERVICIOS

**Patrón API-First** (sin mocks):
```typescript
// src/services/[modulo]/[operacion]-[modulo].service.ts
import httpHelper from '@/helper/http/http_helper';

export const getData = async (params: Params): Promise<Response> => {
  const response = await httpHelper.get<ResponseDto>('/api/endpoint', {
    timeout: 15000,
    retries: 3
  });
  return transformResponse(response.data);
};
```

**Servicios Implementados (11):**
- `login.service.ts`, `statistics.service.ts`, `historial-iph.service.ts` (v2.0 - 100% API)
- `iph-oficial.service.ts`, `informe-policial.service.ts`, `perfil-usuario.service.ts`
- `usuarios-estadisticas.service.ts`, `informe-ejecutivo.service.ts`
- `get-basic-iph-data.service.ts` (usado por DetalleIPH)

---

## 📊 MÉTRICAS DEL PROYECTO

**Componentes:** 10 migrados completamente  
**Interfaces:** 30+ TypeScript  
**Servicios:** 11 implementados (1 refactorizado sin mocks)  
**Hooks personalizados:** 13 (4 refactorizados v2.0)  
**Componentes atómicos:** 40+  
**Utilidades:** 3 (`utils/historial-iph/`)  
**Reducción de código:** ~124 líneas eliminadas en refactorizaciones

---

## 🔄 MIGRACIÓN DE CÓDIGO LEGACY

### **sessionStorage vs localStorage**
```typescript
// ✅ CORRECTO (seguro)
sessionStorage.getItem('userData')

// ❌ EVITAR (inseguro)
localStorage.getItem('userData')
```

### **Validación de Roles**
```typescript
// ❌ ANTES (código duplicado)
const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
const isAdmin = userRoles.some(r => r.nombre === 'Administrador');

// ✅ DESPUÉS (centralizado)
import { getUserRoles } from '@/helper/role/role.helper';
import { isAdmin } from '@/config/permissions.config';

const userRoles = getUserRoles();
const hasAdminAccess = isAdmin(userRoles);
```

---

## ⚠️ REGLAS IMPORTANTES

### **Seguridad**
- ✅ NUNCA loggear contraseñas, tokens, API keys sin sanitizar
- ✅ SIEMPRE usar `sanitizeInput()` para inputs de usuario
- ✅ SIEMPRE validar roles con helpers centralizados

### **Performance**
- ✅ Usar `useMemo` para cálculos costosos
- ✅ Usar `useCallback` para funciones pasadas como props
- ✅ Implementar lazy loading para componentes pesados
- ✅ Cache automático en `getUserRoles()` (5s TTL)

### **Código Limpio**
- ✅ Seguir principios SOLID, KISS, DRY
- ✅ Documentar con JSDoc funciones públicas
- ✅ Usar TypeScript strict mode
- ✅ Separar lógica (hooks) de presentación (componentes)

---

## 📝 COMANDOS ÚTILES

```bash
npm run dev      # Desarrollo → http://localhost:5173
npm run build    # Build producción
npx tsc --noEmit # Verificar tipos
npm run lint     # Linting
```

---

## 🎯 PATRONES ESTABLECIDOS

### **1. Refactorización de Validación de Roles**
- Eliminar parsing manual de sessionStorage
- Usar `getUserRoles()` del helper
- Usar funciones jerárquicas (`canAccessAdmin`, etc.)
- Reducción típica: 60-90% de código

### **2. Refactorización sin Mocks**
1. Identificar dependencias mock
2. Centralizar configuraciones UI en `/src/config/`
3. Eliminar datos dummy
4. Usar servicios API reales
5. Fallback inteligente a datos locales

### **3. Defense in Depth**
- Validación en múltiples capas (guard + componente)
- Logging estructurado en cada capa
- Error handling robusto

---

## 🔗 REFERENCIAS RÁPIDAS

**Configuraciones Centralizadas:**
- `/src/config/env.config.ts` - Variables de entorno
- `/src/config/status.config.ts` - Estatus de IPH
- `/src/config/permissions.config.ts` - Sistema de roles
- `/src/config/app-routes.config.tsx` - Configuración de rutas

**Helpers:**
- `/src/helper/role/role.helper.ts` - Gestión de roles
- `/src/helper/log/logger.helper.ts` - Sistema de logging
- `/src/helper/http/http_helper.ts` - Cliente HTTP
- `/src/helper/security/security.helper.ts` - Seguridad
- `/src/helper/notification/notification.helper.ts` - Notificaciones

**Utilidades:**
- `/src/utils/historial-iph/` - Transformaciones y validaciones para IPH

---

## 📝 CHANGELOG

### **v3.6.0** (2025-01-31) 🔄 PERSISTENCIA DE PAGINACIÓN
**Implementación de usePaginationPersistence en InformePolicial**

#### **Cambios Principales:**
1. ✅ **Hook usePaginationPersistence** - Creado hook reutilizable compartido
   - Persistencia automática en sessionStorage
   - TTL de 1 hora para datos guardados
   - Validación de datos con versión
   - Logging detallado para debugging
   - Zero dependencies (solo React)

2. ✅ **Integración en InformePolicial** (v2.1.0)
   - Hook `useIphActivo.ts` actualizado
   - Separación de estado de paginación (UI vs metadata)
   - Sincronización bidireccional con filtros
   - Reset automático al cambiar filtros (no al cambiar página)
   - Debug panel agregado temporalmente

3. ✅ **Integración en HistorialIPH** (v2.1.0)
   - Hook `useHistorialIPH.ts` actualizado
   - Misma arquitectura que InformePolicial
   - Debug panel agregado temporalmente
   - Logging activado para diagnosticar problemas

4. ✅ **Componente PaginationDebugPanel**
   - Panel visual para debugging en tiempo real
   - Muestra página actual vs storage
   - Validación de consistencia
   - Botones para log y clear storage

#### **Componentes Afectados:**
| Componente | Versión | Cambios |
|------------|---------|---------|
| `useHistorialIPH.ts` | v2.1.0 | Integración completa de persistencia |
| `useIphActivo.ts` | v2.1.0 | Integración completa de persistencia |
| `HistorialIPH.tsx` | - | Agregado debug panel |
| `iph-activo.tsx` | - | Agregado debug panel |

#### **Nuevos Archivos:**
- `/src/components/shared/components/pagination/hooks/usePaginationPersistence.ts` (~500 líneas)
- `/src/components/shared/components/pagination/hooks/PaginationDebugPanel.tsx` (~200 líneas)
- `/DEBUGGING_PAGINATION.md` - Guía completa de debugging

#### **Métricas:**
| Métrica | Valor |
|---------|-------|
| Storage Key Format | `pagination:{key}` |
| TTL Default | 1 hora (3600000ms) |
| Version System | v1 (con soporte para migraciones) |
| Logging | Activado en desarrollo |
| Cache | 5s TTL en getUserRoles() |

**Archivos modificados:**
- `/src/components/private/components/iph-activo/hooks/useIphActivo.ts` - v2.1.0
- `/src/components/private/components/iph-activo/iph-activo.tsx` - Debug panel agregado
- `/src/components/private/components/historial-iph/hooks/useHistorialIPH.ts` - v2.1.0
- `/src/components/private/components/historial-iph/HistorialIPH.tsx` - Debug panel agregado
- `/src/components/shared/components/pagination/index.ts` - Exports actualizados

**Issue resuelto:**
✅ Paginación se mantiene al navegar entre vistas (HistorialIPH e InformePolicial)

---

### **v3.5.0** (2025-01-31) 🎯 REFACTORIZACIÓN MAYOR
**Centralización Completa de Roles en app-routes.config.tsx**

#### **Cambios Principales:**
1. ✅ **Constantes ROLE_GROUPS** - Eliminada duplicación de arrays hardcoded
   - `ALL_AUTHENTICATED`: ['SuperAdmin', 'Administrador', 'Superior', 'Elemento']
   - `MANAGEMENT`: ['SuperAdmin', 'Administrador', 'Superior']
   - `ADMIN_ONLY`: ['SuperAdmin', 'Administrador']
   - `SUPER_ADMIN_ONLY`: ['SuperAdmin']

2. ✅ **getSidebarRoutes()** refactorizado (v2.0.0)
   - Eliminado parámetro `userRole: string`
   - Usa `getUserRoles()` centralizado (cache 5s + Zod)
   - Usa `hasAnyRole()` del helper
   - Validación automática contra ALLOWED_ROLES

3. ✅ **userHasAccessToRoute()** refactorizado (v2.0.0)
   - Eliminado parámetro `userRole: string`
   - Usa `getUserRoles()` centralizado (cache 5s + Zod)
   - Usa `hasAnyRole()` del helper
   - Validación automática contra ALLOWED_ROLES

4. ✅ **APP_ROUTES simplificado**
   - 18 arrays hardcoded → 4 constantes reutilizables
   - Reducción de ~78% en duplicación de código
   - Mantenimiento simplificado (cambio en 1 lugar)

#### **Métricas de Mejora:**
| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Arrays hardcoded | 18 | 4 | -78% |
| Validaciones manuales | 2 | 0 | -100% |
| Usa helper centralizado | ❌ | ✅ | +100% |
| Cache automático | ❌ | ✅ (5s TTL) | Performance++ |
| Validación Zod | ❌ | ✅ | Seguridad++ |

**Archivos modificados:**
- `/src/config/app-routes.config.tsx` - v2.0.0 (centralización completa)

---

### **v3.4.6** (2025-01-31)
**Corrección de Acceso - HistorialIPH**
- ✅ Corregido acceso a HistorialIPH para TODOS los roles autenticados
- ✅ Actualizado `app-routes.config.tsx:126` - agregados 'Superior' y 'Elemento' a requiredRoles
- ✅ Alineación con documentación del componente (todos los roles pueden acceder)
- ✅ Solución al error: `[WARN] PrivateRoute: Acceso denegado: Rol insuficiente` para rol Elemento

**Archivo modificado:**
- `/src/config/app-routes.config.tsx` - requiredRoles: `['SuperAdmin', 'Administrador', 'Superior', 'Elemento']`

---

**Última actualización:** 2025-01-31
**Versión:** 3.6.0
**Estado:** ✅ Sistema funcional con arquitectura moderna centralizada + persistencia de paginación