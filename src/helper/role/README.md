# 🔐 Role Helper - Guía Completa de Uso

## 📋 Índice
- [Descripción General](#descripción-general)
- [Instalación y Setup](#instalación-y-setup)
- [API de Validación de Roles Externos](#api-de-validación-de-roles-externos)
- [Uso en Componentes](#uso-en-componentes)
- [Uso en Servicios](#uso-en-servicios)
- [Uso en Custom Hooks](#uso-en-custom-hooks)
- [Matriz de Permisos](#matriz-de-permisos)
- [Ejemplos Completos](#ejemplos-completos)

---

## 📖 Descripción General

El **Role Helper v2.0.0** es un sistema centralizado de validación de roles que soporta:

✅ **Validación de roles externos** (props, API responses, parámetros de funciones)
✅ **Validación de roles desde sessionStorage** (flujo tradicional)
✅ **Control de acceso jerárquico** automático
✅ **Permisos granulares** por módulo (users, iph, statistics, history)
✅ **TypeScript strict mode** con autocompletado
✅ **Logging estructurado** para debugging

---

## 🚀 Instalación y Setup

### Importar funciones según tu caso de uso:

```typescript
// Para validación de roles EXTERNOS (props, API)
import {
  validateExternalRoles,
  hasExternalRole,
  canExternalRoleAccess
} from '@/helper/role/role.helper';

// Para validación de roles desde sessionStorage
import {
  getUserRoles,
  isSuperAdmin,
  isAdmin,
  canAccess,
  getPermissionsFor
} from '@/helper/role/role.helper';

// Para uso avanzado con TypeScript
import type { IRole } from '@/interfaces/role/role.interface';
import type { SystemRoleType } from '@/config/permissions.config';
```

---

## 🌐 API de Validación de Roles Externos

### 1. `validateExternalRoles(externalRoles: IRole[]): IRole[]`

Valida que los roles externos sean válidos según la configuración del sistema.

**Retorna:** Array de roles válidos (puede estar vacío si ninguno es válido)

```typescript
// Ejemplo 1: Validar roles desde props
type UserCardProps = {
  userRoles: IRole[];
  userName: string;
};

const UserCard = ({ userRoles, userName }: UserCardProps) => {
  const validRoles = validateExternalRoles(userRoles);

  if (validRoles.length === 0) {
    return <div>Usuario sin roles válidos</div>;
  }

  return (
    <div>
      <h3>{userName}</h3>
      <p>Roles: {validRoles.map(r => r.nombre).join(', ')}</p>
    </div>
  );
};
```

```typescript
// Ejemplo 2: Validar roles desde respuesta de API
const fetchUserData = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();

  // Validar roles antes de usarlos
  const validRoles = validateExternalRoles(data.roles);

  if (validRoles.length === 0) {
    throw new Error('Usuario no tiene roles válidos');
  }

  return { ...data, roles: validRoles };
};
```

---

### 2. `hasExternalRole(externalRoles: IRole[], roleType: SystemRoleType): boolean`

Verifica si los roles externos incluyen un rol específico del sistema.

**Parámetros:**
- `externalRoles`: Array de roles a validar
- `roleType`: `'SUPERADMIN' | 'ADMIN' | 'SUPERIOR' | 'ELEMENTO'`

**Retorna:** `true` si tiene el rol Y es válido, `false` en caso contrario

```typescript
// Ejemplo 1: En componente con props
type AdminPanelProps = {
  userRoles: IRole[];
};

const AdminPanel = ({ userRoles }: AdminPanelProps) => {
  const isUserAdmin = hasExternalRole(userRoles, 'ADMIN');

  if (!isUserAdmin) {
    return <div>Acceso denegado</div>;
  }

  return <AdminDashboard />;
};
```

```typescript
// Ejemplo 2: En servicio con parámetros
import { hasExternalRole } from '@/helper/role/role.helper';

const deleteUserService = async (
  targetUserId: string,
  currentUserRoles: IRole[]
) => {
  // Verificar que el usuario actual sea SuperAdmin
  if (!hasExternalRole(currentUserRoles, 'SUPERADMIN')) {
    throw new Error('Solo SuperAdmin puede eliminar usuarios');
  }

  return await fetch(`/api/users/${targetUserId}`, { method: 'DELETE' });
};
```

---

### 3. `canExternalRoleAccess(externalRoles: IRole[], targetRoleType: SystemRoleType): boolean`

Verifica acceso jerárquico - si los roles externos pueden acceder a funcionalidades de un rol específico.

**Jerarquía automática:**
- SuperAdmin (nivel 1) → accede a: Admin, Superior, Elemento
- Admin (nivel 2) → accede a: Superior, Elemento
- Superior (nivel 3) → accede a: Elemento
- Elemento (nivel 4) → solo acceso propio

```typescript
// Ejemplo 1: Componente con permisos jerárquicos
type StatisticsViewProps = {
  userRoles: IRole[];
};

const StatisticsView = ({ userRoles }: StatisticsViewProps) => {
  // Superior y superiores jerárquicos pueden ver estadísticas
  const canViewStats = canExternalRoleAccess(userRoles, 'SUPERIOR');

  if (!canViewStats) {
    return <div>Requiere permisos de Superior o superiores</div>;
  }

  return <StatisticsChart />;
};
```

```typescript
// Ejemplo 2: Hook personalizado con validación jerárquica
const useIPHPermissions = (userRoles: IRole[]) => {
  return useMemo(() => ({
    canCreate: canExternalRoleAccess(userRoles, 'SUPERIOR'), // Superior + Admin + SuperAdmin
    canEdit: canExternalRoleAccess(userRoles, 'ADMIN'),      // Admin + SuperAdmin
    canDelete: hasExternalRole(userRoles, 'SUPERADMIN'),     // Solo SuperAdmin
    canView: canExternalRoleAccess(userRoles, 'ELEMENTO')    // Todos
  }), [userRoles]);
};
```

---

## 🎨 Uso en Componentes

### Caso 1: Componente que recibe roles por props

```typescript
import { hasExternalRole, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

type UserActionsProps = {
  userRoles: IRole[];
  onEdit: () => void;
  onDelete: () => void;
};

const UserActions = ({ userRoles, onEdit, onDelete }: UserActionsProps) => {
  // Validar permisos específicos
  const canEdit = canExternalRoleAccess(userRoles, 'ADMIN'); // Admin o superior
  const canDelete = hasExternalRole(userRoles, 'SUPERADMIN'); // Solo SuperAdmin

  return (
    <div className="flex gap-2">
      {canEdit && (
        <button onClick={onEdit} className="btn-primary">
          Editar
        </button>
      )}
      {canDelete && (
        <button onClick={onDelete} className="btn-danger">
          Eliminar
        </button>
      )}
    </div>
  );
};
```

### Caso 2: Componente que usa sessionStorage (flujo tradicional)

```typescript
import { getUserRoles, getPermissionsFor } from '@/helper/role/role.helper';

const UsuariosPage = () => {
  // Obtener roles desde sessionStorage
  const userRoles = getUserRoles();

  // Obtener permisos granulares para el módulo de usuarios
  const permissions = getPermissionsFor.users(userRoles);

  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      {permissions.canCreate && <button>Crear Usuario</button>}
      {permissions.canEdit && <button>Editar Usuario</button>}
      {permissions.canDelete && <button>Eliminar Usuario</button>}
      {permissions.canManageRoles && <button>Gestionar Roles</button>}
    </div>
  );
};
```

### Caso 3: Componente con validación antes de renderizar

```typescript
import { validateExternalRoles } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

type ProtectedComponentProps = {
  userRoles: IRole[];
  children: React.ReactNode;
};

const ProtectedComponent = ({ userRoles, children }: ProtectedComponentProps) => {
  const validRoles = validateExternalRoles(userRoles);

  if (validRoles.length === 0) {
    return (
      <div className="alert-danger">
        Usuario no tiene roles válidos para esta aplicación.
        Contacte al administrador.
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## 🛠️ Uso en Servicios

### Caso 1: Servicio con parámetros de roles

```typescript
// services/user/delete-user.service.ts
import { hasExternalRole } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import { httpHelper } from '@/helper/http/http.helper';

/**
 * Servicio para eliminar usuario (requiere SuperAdmin)
 * @param targetUserId - ID del usuario a eliminar
 * @param currentUserRoles - Roles del usuario actual
 * @throws Error si no tiene permisos
 */
export const deleteUserService = async (
  targetUserId: string,
  currentUserRoles: IRole[]
): Promise<void> => {
  // Validar permisos antes de ejecutar
  if (!hasExternalRole(currentUserRoles, 'SUPERADMIN')) {
    throw new Error('Operación no permitida: requiere rol SuperAdmin');
  }

  try {
    await httpHelper.delete(`/api/users/${targetUserId}`);
  } catch (error) {
    throw new Error('Error eliminando usuario');
  }
};
```

### Caso 2: Servicio con lógica condicional por rol

```typescript
// services/iph/get-iph-list.service.ts
import { hasExternalRole, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

/**
 * Obtiene lista de IPH según permisos del usuario
 * - Elemento: solo IPH propios
 * - Superior y superiores: todos los IPH
 */
export const getIphListService = async (
  userId: string,
  userRoles: IRole[]
) => {
  // Elemento solo ve sus propios IPH
  if (hasExternalRole(userRoles, 'ELEMENTO')) {
    return await httpHelper.get(`/api/iph/user/${userId}`);
  }

  // Superior y superiores ven todos los IPH
  if (canExternalRoleAccess(userRoles, 'SUPERIOR')) {
    return await httpHelper.get('/api/iph/all');
  }

  throw new Error('Usuario no tiene permisos para ver IPH');
};
```

### Caso 3: Servicio con validación de roles

```typescript
// services/auth/validate-session.service.ts
import { validateExternalRoles } from '@/helper/role/role.helper';

export const validateSessionService = async () => {
  const sessionData = sessionStorage.getItem('user_data');
  const rolesData = sessionStorage.getItem('roles');

  if (!sessionData || !rolesData) {
    throw new Error('Sesión inválida');
  }

  const roles = JSON.parse(rolesData);
  const validRoles = validateExternalRoles(roles);

  if (validRoles.length === 0) {
    sessionStorage.clear();
    throw new Error('Roles de sesión inválidos');
  }

  return { isValid: true, roles: validRoles };
};
```

---

## 🎣 Uso en Custom Hooks

### Ejemplo 1: Hook de permisos para módulo específico

```typescript
// hooks/useIPHPermissions.ts
import { useMemo } from 'react';
import { canExternalRoleAccess, hasExternalRole } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

type IPHPermissions = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canViewOwn: boolean;
};

/**
 * Hook para obtener permisos de IPH basados en roles
 * @param userRoles - Roles del usuario
 * @returns Objeto con permisos booleanos
 */
export const useIPHPermissions = (userRoles: IRole[]): IPHPermissions => {
  return useMemo(() => ({
    canCreate: canExternalRoleAccess(userRoles, 'SUPERIOR'),   // Superior+
    canEdit: canExternalRoleAccess(userRoles, 'ADMIN'),        // Admin+
    canDelete: hasExternalRole(userRoles, 'SUPERADMIN'),       // Solo SuperAdmin
    canViewAll: canExternalRoleAccess(userRoles, 'SUPERIOR'),  // Superior+
    canViewOwn: hasExternalRole(userRoles, 'ELEMENTO')         // Elemento
  }), [userRoles]);
};

// Uso en componente
const IPHList = ({ userRoles }: { userRoles: IRole[] }) => {
  const permissions = useIPHPermissions(userRoles);

  return (
    <div>
      {permissions.canCreate && <button>Crear IPH</button>}
      {permissions.canDelete && <button>Eliminar IPH</button>}
    </div>
  );
};
```

### Ejemplo 2: Hook de validación de acceso a ruta

```typescript
// hooks/useRouteAccess.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import type { SystemRoleType } from '@/config/permissions.config';

/**
 * Hook para proteger rutas según roles
 * Redirige si no tiene acceso
 */
export const useRouteAccess = (
  userRoles: IRole[],
  requiredRole: SystemRoleType,
  redirectTo: string = '/inicio'
) => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasAccess = canExternalRoleAccess(userRoles, requiredRole);

    if (!hasAccess) {
      navigate(redirectTo, { replace: true });
    }
  }, [userRoles, requiredRole, redirectTo, navigate]);
};

// Uso en componente
const AdminPage = ({ userRoles }: { userRoles: IRole[] }) => {
  useRouteAccess(userRoles, 'ADMIN'); // Requiere Admin o superior

  return <div>Panel de Administración</div>;
};
```

---

## 📊 Matriz de Permisos

### Operaciones CRUD por Rol

| Operación | SuperAdmin | Administrador | Superior | Elemento |
|-----------|------------|---------------|----------|----------|
| **create** | ✅ | ✅ | ✅ | ❌ |
| **read** | ✅ | ✅ | ✅ | ✅ |
| **update** | ✅ | ✅ | ❌ | ❌ |
| **delete** | ✅ | ❌ | ❌ | ❌ |
| **admin** | ✅ | ✅ | ❌ | ❌ |
| **superuser** | ✅ | ❌ | ❌ | ❌ |

### Permisos por Módulo

#### Gestión de Usuarios

| Permiso | SuperAdmin | Admin | Superior | Elemento |
|---------|------------|-------|----------|----------|
| Ver usuarios | ✅ | ✅ | ❌ | ❌ |
| Crear usuario | ✅ | ✅ | ❌ | ❌ |
| Editar usuario | ✅ | ✅ | ❌ | ❌ |
| Eliminar usuario | ✅ | ✅ | ❌ | ❌ |
| Gestionar roles | ✅ | ❌ | ❌ | ❌ |

#### IPH (Informes Policiales)

| Permiso | SuperAdmin | Admin | Superior | Elemento |
|---------|------------|-------|----------|----------|
| Ver todos los IPH | ✅ | ✅ | ✅ | ❌ |
| Ver IPH propios | ✅ | ✅ | ✅ | ✅ |
| Crear IPH | ✅ | ✅ | ✅ | ❌ |
| Editar IPH | ✅ | ✅ | ❌ | ❌ |
| Eliminar IPH | ✅ | ✅ | ❌ | ❌ |

#### Estadísticas

| Permiso | SuperAdmin | Admin | Superior | Elemento |
|---------|------------|-------|----------|----------|
| Ver estadísticas | ✅ | ✅ | ✅ | ❌ |
| Exportar datos | ✅ | ✅ | ❌ | ❌ |
| Ver detalles avanzados | ✅ | ✅ | ❌ | ❌ |

#### Historial

| Permiso | SuperAdmin | Admin | Superior | Elemento |
|---------|------------|-------|----------|----------|
| Ver historial | ✅ | ✅ | ❌ | ❌ |
| Exportar historial | ✅ | ✅ | ❌ | ❌ |
| Eliminar registros | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Ejemplos Completos

### Ejemplo Completo 1: Componente de Tabla de Usuarios

```typescript
// components/UsuariosTable.tsx
import { hasExternalRole, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  roles: IRole[];
};

type UsuariosTableProps = {
  usuarios: Usuario[];
  currentUserRoles: IRole[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const UsuariosTable = ({
  usuarios,
  currentUserRoles,
  onEdit,
  onDelete
}: UsuariosTableProps) => {
  // Permisos del usuario actual
  const canEdit = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canDelete = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canManageRoles = hasExternalRole(currentUserRoles, 'SUPERADMIN');

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Roles</th>
          {(canEdit || canDelete) && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {usuarios.map(usuario => (
          <tr key={usuario.id}>
            <td>{usuario.nombre}</td>
            <td>{usuario.email}</td>
            <td>
              {usuario.roles.map(r => r.nombre).join(', ')}
              {canManageRoles && (
                <button className="ml-2 text-sm">Editar Roles</button>
              )}
            </td>
            {(canEdit || canDelete) && (
              <td className="flex gap-2">
                {canEdit && (
                  <button onClick={() => onEdit(usuario.id)}>
                    Editar
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => onDelete(usuario.id)}>
                    Eliminar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsuariosTable;
```

### Ejemplo Completo 2: Servicio de Gestión de IPH

```typescript
// services/iph/iph-manager.service.ts
import { hasExternalRole, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import { httpHelper } from '@/helper/http/http.helper';

export class IphManagerService {
  /**
   * Obtiene lista de IPH según permisos del usuario
   */
  static async getIphList(userId: string, userRoles: IRole[]) {
    // Elemento solo ve sus IPH
    if (hasExternalRole(userRoles, 'ELEMENTO')) {
      return await httpHelper.get(`/api/iph/user/${userId}`);
    }

    // Superior y superiores ven todos
    if (canExternalRoleAccess(userRoles, 'SUPERIOR')) {
      return await httpHelper.get('/api/iph/all');
    }

    throw new Error('Sin permisos para ver IPH');
  }

  /**
   * Crea un nuevo IPH
   */
  static async createIph(data: unknown, userRoles: IRole[]) {
    // Solo Superior y superiores pueden crear
    if (!canExternalRoleAccess(userRoles, 'SUPERIOR')) {
      throw new Error('Requiere permisos de Superior para crear IPH');
    }

    return await httpHelper.post('/api/iph', data);
  }

  /**
   * Actualiza un IPH existente
   */
  static async updateIph(iphId: string, data: unknown, userRoles: IRole[]) {
    // Solo Admin y superiores pueden editar
    if (!canExternalRoleAccess(userRoles, 'ADMIN')) {
      throw new Error('Requiere permisos de Administrador para editar IPH');
    }

    return await httpHelper.put(`/api/iph/${iphId}`, data);
  }

  /**
   * Elimina un IPH
   */
  static async deleteIph(iphId: string, userRoles: IRole[]) {
    // Solo Admin y superiores pueden eliminar
    if (!canExternalRoleAccess(userRoles, 'ADMIN')) {
      throw new Error('Requiere permisos de Administrador para eliminar IPH');
    }

    return await httpHelper.delete(`/api/iph/${iphId}`);
  }
}
```

### Ejemplo Completo 3: Custom Hook con Validación

```typescript
// hooks/useUserPermissions.ts
import { useMemo } from 'react';
import {
  getUserRoles,
  hasExternalRole,
  canExternalRoleAccess,
  validateExternalRoles
} from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

type UserPermissions = {
  isValid: boolean;
  roles: IRole[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canCreateIph: boolean;
  canViewStatistics: boolean;
  canExport: boolean;
};

/**
 * Hook centralizado de permisos de usuario
 * Soporta roles desde sessionStorage o props externos
 */
export const useUserPermissions = (externalRoles?: IRole[]): UserPermissions => {
  return useMemo(() => {
    // Usar roles externos o leer desde sessionStorage
    const rawRoles = externalRoles || getUserRoles();

    // Validar roles
    const validRoles = validateExternalRoles(rawRoles);
    const isValid = validRoles.length > 0;

    if (!isValid) {
      return {
        isValid: false,
        roles: [],
        isSuperAdmin: false,
        isAdmin: false,
        canManageUsers: false,
        canCreateIph: false,
        canViewStatistics: false,
        canExport: false
      };
    }

    return {
      isValid: true,
      roles: validRoles,
      isSuperAdmin: hasExternalRole(validRoles, 'SUPERADMIN'),
      isAdmin: canExternalRoleAccess(validRoles, 'ADMIN'),
      canManageUsers: canExternalRoleAccess(validRoles, 'ADMIN'),
      canCreateIph: canExternalRoleAccess(validRoles, 'SUPERIOR'),
      canViewStatistics: canExternalRoleAccess(validRoles, 'SUPERIOR'),
      canExport: canExternalRoleAccess(validRoles, 'ADMIN')
    };
  }, [externalRoles]);
};

// Uso en componente
const Dashboard = ({ userRoles }: { userRoles?: IRole[] }) => {
  const permissions = useUserPermissions(userRoles);

  if (!permissions.isValid) {
    return <div>Roles inválidos</div>;
  }

  return (
    <div>
      {permissions.isSuperAdmin && <SuperAdminPanel />}
      {permissions.canManageUsers && <UsersButton />}
      {permissions.canCreateIph && <CreateIphButton />}
      {permissions.canViewStatistics && <StatisticsChart />}
    </div>
  );
};
```

---

## 🔍 Debugging y Logging

El sistema incluye logging automático en todas las validaciones:

```typescript
// Logs automáticos en consola del navegador
validateExternalRoles(roles);
// → [RoleHelper] 2 rol(es) externo(s) validado(s)

hasExternalRole(roles, 'ADMIN');
// → [RoleHelper] Verificando rol externo: ADMIN

canExternalRoleAccess(roles, 'SUPERIOR');
// → [RoleHelper] Verificando acceso jerárquico externo: SUPERIOR
```

---

## ⚠️ Errores Comunes

### 1. Roles no válidos
```typescript
// ❌ MAL: No validar roles externos
const hasAccess = hasExternalRole(untrustedRoles, 'ADMIN');

// ✅ BIEN: Siempre validar primero
const validRoles = validateExternalRoles(untrustedRoles);
const hasAccess = hasExternalRole(validRoles, 'ADMIN');
```

### 2. Usar string en lugar de SystemRoleType
```typescript
// ❌ MAL: Typo en nombre de rol
hasExternalRole(roles, 'Administrator'); // No existe

// ✅ BIEN: Usar constantes del sistema
hasExternalRole(roles, 'ADMIN'); // TypeScript autocomplete
```

### 3. No manejar roles vacíos
```typescript
// ❌ MAL: No verificar si hay roles
const canDelete = hasExternalRole(roles, 'SUPERADMIN');

// ✅ BIEN: Validar existencia
const validRoles = validateExternalRoles(roles);
if (validRoles.length === 0) {
  // Manejar caso sin roles
}
const canDelete = hasExternalRole(validRoles, 'SUPERADMIN');
```

---

## 📚 Referencias

- **Archivo principal**: `/src/helper/role/role.helper.ts`
- **Configuración**: `/src/config/permissions.config.ts`
- **Interfaces**: `/src/interfaces/role/role.interface.ts`
- **Variables de entorno**: `.env` (VITE_*_ROLE)

---

**Versión**: 2.0.0
**Última actualización**: 2024-01-30
**Autor**: Sistema IPH Frontend
