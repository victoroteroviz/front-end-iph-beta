# 📘 Ejemplos Prácticos de Uso del Role Helper v2.0.0

Este documento contiene ejemplos reales de implementación del sistema de validación de roles externos en componentes, servicios y hooks del proyecto IPH.

---

## 📋 Índice
- [Ejemplo 1: Componente de Usuario con Props](#ejemplo-1-componente-de-usuario-con-props)
- [Ejemplo 2: Servicio de Gestión de Usuarios](#ejemplo-2-servicio-de-gestión-de-usuarios)
- [Ejemplo 3: Hook Personalizado de Permisos](#ejemplo-3-hook-personalizado-de-permisos)
- [Ejemplo 4: Guard de Rutas con React Router](#ejemplo-4-guard-de-rutas-con-react-router)
- [Ejemplo 5: Tabla Virtualizada con Permisos](#ejemplo-5-tabla-virtualizada-con-permisos)
- [Ejemplo 6: Formulario Condicional por Rol](#ejemplo-6-formulario-condicional-por-rol)
- [Ejemplo 7: Servicio de API con Validación](#ejemplo-7-servicio-de-api-con-validación)

---

## 🎯 Ejemplo 1: Componente de Usuario con Props

**Caso de uso:** Componente que recibe roles externos y muestra acciones según permisos.

```typescript
// components/UserProfileCard.tsx
import { hasExternalRole, canExternalRoleAccess, validateExternalRoles } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import { useState } from 'react';

type UserProfileCardProps = {
  userId: string;
  userName: string;
  userEmail: string;
  userRoles: IRole[];
  currentUserRoles: IRole[]; // Roles del usuario actual (quien ve el componente)
  onEdit?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onManageRoles?: (userId: string) => void;
};

/**
 * Tarjeta de perfil de usuario con acciones según permisos
 *
 * @example
 * <UserProfileCard
 *   userId="123"
 *   userName="Juan Pérez"
 *   userEmail="juan@example.com"
 *   userRoles={[{ id: 3, nombre: 'Superior' }]}
 *   currentUserRoles={[{ id: 2, nombre: 'Administrador' }]}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
const UserProfileCard = ({
  userId,
  userName,
  userEmail,
  userRoles,
  currentUserRoles,
  onEdit,
  onDelete,
  onManageRoles
}: UserProfileCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Validar roles del usuario mostrado
  const validUserRoles = validateExternalRoles(userRoles);

  // Permisos del usuario actual
  const canEdit = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canDelete = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canManageRoles = hasExternalRole(currentUserRoles, 'SUPERADMIN');

  // Verificar si el usuario tiene roles válidos
  if (validUserRoles.length === 0) {
    return (
      <div className="border border-red-500 rounded-lg p-4 bg-red-50">
        <p className="text-red-700 font-semibold">⚠️ Usuario sin roles válidos</p>
        <p className="text-sm text-gray-600">{userName} ({userEmail})</p>
        {canManageRoles && (
          <button
            onClick={() => onManageRoles?.(userId)}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
          >
            Asignar Roles
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-600">{userEmail}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(userId)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(userId)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Roles */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Roles:</span>
          <div className="flex gap-1">
            {validUserRoles.map(role => (
              <span
                key={role.id}
                className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
              >
                {role.nombre}
              </span>
            ))}
          </div>
          {canManageRoles && onManageRoles && (
            <button
              onClick={() => onManageRoles(userId)}
              className="text-xs text-blue-600 hover:underline"
            >
              Gestionar
            </button>
          )}
        </div>
      </div>

      {/* Detalles (solo visible para admins) */}
      {canEdit && (
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-gray-500 hover:text-gray-700"
        >
          {showDetails ? 'Ocultar detalles ▲' : 'Ver detalles ▼'}
        </button>
      )}

      {showDetails && (
        <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
          <p><strong>ID:</strong> {userId}</p>
          <p><strong>Permisos:</strong></p>
          <ul className="list-disc list-inside ml-2">
            {hasExternalRole(validUserRoles, 'SUPERADMIN') && <li>SuperAdmin (acceso total)</li>}
            {hasExternalRole(validUserRoles, 'ADMIN') && <li>Administrador (gestión completa)</li>}
            {hasExternalRole(validUserRoles, 'SUPERIOR') && <li>Superior (supervisión)</li>}
            {hasExternalRole(validUserRoles, 'ELEMENTO') && <li>Elemento (operativo)</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
```

**Uso del componente:**
```typescript
// pages/Usuarios.tsx
import UserProfileCard from '@/components/UserProfileCard';
import { getUserRoles } from '@/helper/role/role.helper';

const UsuariosPage = () => {
  const currentUserRoles = getUserRoles(); // Desde sessionStorage

  const usuarios = [
    {
      id: '1',
      name: 'Ana García',
      email: 'ana@example.com',
      roles: [{ id: 2, nombre: 'Administrador' }]
    },
    {
      id: '2',
      name: 'Carlos López',
      email: 'carlos@example.com',
      roles: [{ id: 4, nombre: 'Elemento' }]
    }
  ];

  return (
    <div className="grid gap-4">
      {usuarios.map(user => (
        <UserProfileCard
          key={user.id}
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          userRoles={user.roles}
          currentUserRoles={currentUserRoles}
          onEdit={(id) => console.log('Editar', id)}
          onDelete={(id) => console.log('Eliminar', id)}
          onManageRoles={(id) => console.log('Gestionar roles', id)}
        />
      ))}
    </div>
  );
};
```

---

## 🛠️ Ejemplo 2: Servicio de Gestión de Usuarios

**Caso de uso:** Servicio que valida permisos antes de ejecutar operaciones.

```typescript
// services/user/user-management.service.ts
import { hasExternalRole, canExternalRoleAccess, validateExternalRoles } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import { httpHelper } from '@/helper/http/http.helper';
import { logInfo, logWarning, logError } from '@/helper/log/logger.helper';

type CreateUserDto = {
  nombre: string;
  email: string;
  password: string;
  roles: IRole[];
};

type UpdateUserDto = Partial<CreateUserDto>;

/**
 * Servicio de gestión de usuarios con validación de permisos
 */
export class UserManagementService {
  /**
   * Obtiene lista de usuarios
   * Requiere: Admin o superior
   */
  static async getUsers(currentUserRoles: IRole[]) {
    logInfo('UserManagementService', 'Obteniendo lista de usuarios');

    // Validar roles
    const validRoles = validateExternalRoles(currentUserRoles);
    if (validRoles.length === 0) {
      logWarning('UserManagementService', 'Roles inválidos al obtener usuarios');
      throw new Error('Roles de usuario inválidos');
    }

    // Verificar permisos
    if (!canExternalRoleAccess(validRoles, 'ADMIN')) {
      logWarning('UserManagementService', 'Usuario sin permisos para ver usuarios', { validRoles });
      throw new Error('Requiere permisos de Administrador');
    }

    try {
      const response = await httpHelper.get('/api/users');
      logInfo('UserManagementService', 'Usuarios obtenidos correctamente', {
        count: response.data?.length
      });
      return response.data;
    } catch (error) {
      logError('UserManagementService', error, 'Error obteniendo usuarios');
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * Requiere: Admin o superior
   */
  static async createUser(userData: CreateUserDto, currentUserRoles: IRole[]) {
    logInfo('UserManagementService', 'Creando nuevo usuario', {
      email: userData.email
    });

    // Validar roles del usuario actual
    const validCurrentRoles = validateExternalRoles(currentUserRoles);
    if (!canExternalRoleAccess(validCurrentRoles, 'ADMIN')) {
      throw new Error('Requiere permisos de Administrador para crear usuarios');
    }

    // Validar roles que se asignarán al nuevo usuario
    const validNewUserRoles = validateExternalRoles(userData.roles);
    if (validNewUserRoles.length === 0) {
      throw new Error('Debe asignar al menos un rol válido al nuevo usuario');
    }

    // Validar restricciones especiales
    const assigningSuperAdmin = hasExternalRole(validNewUserRoles, 'SUPERADMIN');
    const currentIsSuperAdmin = hasExternalRole(validCurrentRoles, 'SUPERADMIN');

    if (assigningSuperAdmin && !currentIsSuperAdmin) {
      logWarning('UserManagementService', 'Intento de asignar SuperAdmin sin permisos');
      throw new Error('Solo SuperAdmin puede crear usuarios con rol SuperAdmin');
    }

    try {
      const response = await httpHelper.post('/api/users', {
        ...userData,
        roles: validNewUserRoles
      });

      logInfo('UserManagementService', 'Usuario creado correctamente', {
        userId: response.data?.id,
        roles: validNewUserRoles.map(r => r.nombre)
      });

      return response.data;
    } catch (error) {
      logError('UserManagementService', error, 'Error creando usuario');
      throw error;
    }
  }

  /**
   * Actualiza un usuario existente
   * Requiere: Admin o superior
   */
  static async updateUser(
    userId: string,
    updateData: UpdateUserDto,
    currentUserRoles: IRole[]
  ) {
    logInfo('UserManagementService', 'Actualizando usuario', { userId });

    const validCurrentRoles = validateExternalRoles(currentUserRoles);
    if (!canExternalRoleAccess(validCurrentRoles, 'ADMIN')) {
      throw new Error('Requiere permisos de Administrador');
    }

    // Si se actualizan roles, validarlos
    if (updateData.roles) {
      const validNewRoles = validateExternalRoles(updateData.roles);
      if (validNewRoles.length === 0) {
        throw new Error('Roles de actualización inválidos');
      }

      // Verificar restricción de SuperAdmin
      const assigningSuperAdmin = hasExternalRole(validNewRoles, 'SUPERADMIN');
      const currentIsSuperAdmin = hasExternalRole(validCurrentRoles, 'SUPERADMIN');

      if (assigningSuperAdmin && !currentIsSuperAdmin) {
        throw new Error('Solo SuperAdmin puede asignar rol SuperAdmin');
      }

      updateData.roles = validNewRoles;
    }

    try {
      const response = await httpHelper.put(`/api/users/${userId}`, updateData);
      logInfo('UserManagementService', 'Usuario actualizado correctamente', { userId });
      return response.data;
    } catch (error) {
      logError('UserManagementService', error, 'Error actualizando usuario');
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * Requiere: Admin o superior
   */
  static async deleteUser(userId: string, currentUserRoles: IRole[]) {
    logInfo('UserManagementService', 'Eliminando usuario', { userId });

    const validRoles = validateExternalRoles(currentUserRoles);
    if (!canExternalRoleAccess(validRoles, 'ADMIN')) {
      throw new Error('Requiere permisos de Administrador');
    }

    try {
      await httpHelper.delete(`/api/users/${userId}`);
      logInfo('UserManagementService', 'Usuario eliminado correctamente', { userId });
    } catch (error) {
      logError('UserManagementService', error, 'Error eliminando usuario');
      throw error;
    }
  }

  /**
   * Actualiza roles de un usuario
   * Requiere: SuperAdmin
   */
  static async updateUserRoles(
    userId: string,
    newRoles: IRole[],
    currentUserRoles: IRole[]
  ) {
    logInfo('UserManagementService', 'Actualizando roles de usuario', { userId });

    const validCurrentRoles = validateExternalRoles(currentUserRoles);
    if (!hasExternalRole(validCurrentRoles, 'SUPERADMIN')) {
      throw new Error('Solo SuperAdmin puede gestionar roles de usuarios');
    }

    const validNewRoles = validateExternalRoles(newRoles);
    if (validNewRoles.length === 0) {
      throw new Error('Debe proporcionar al menos un rol válido');
    }

    try {
      const response = await httpHelper.patch(`/api/users/${userId}/roles`, {
        roles: validNewRoles
      });

      logInfo('UserManagementService', 'Roles actualizados correctamente', {
        userId,
        newRoles: validNewRoles.map(r => r.nombre)
      });

      return response.data;
    } catch (error) {
      logError('UserManagementService', error, 'Error actualizando roles');
      throw error;
    }
  }
}
```

**Uso del servicio:**
```typescript
// hooks/useUsuarios.ts
import { UserManagementService } from '@/services/user/user-management.service';
import { getUserRoles } from '@/helper/role/role.helper';
import { useState } from 'react';

export const useUsuarios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserRoles = getUserRoles();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await UserManagementService.getUsers(currentUserRoles);
      return users;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      return await UserManagementService.createUser(userData, currentUserRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loadUsers, createUser, loading, error };
};
```

---

## 🎣 Ejemplo 3: Hook Personalizado de Permisos

**Caso de uso:** Hook reutilizable que retorna permisos específicos por módulo.

```typescript
// hooks/useModulePermissions.ts
import { useMemo } from 'react';
import {
  hasExternalRole,
  canExternalRoleAccess,
  validateExternalRoles,
  getUserRoles
} from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

/**
 * Permisos genéricos CRUD
 */
type CrudPermissions = {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

/**
 * Permisos específicos de IPH
 */
type IPHPermissions = CrudPermissions & {
  canViewAll: boolean;
  canViewOwn: boolean;
  canExport: boolean;
  canSupervise: boolean;
};

/**
 * Permisos específicos de Usuarios
 */
type UserPermissions = CrudPermissions & {
  canManageRoles: boolean;
  canResetPasswords: boolean;
  canViewAuditLog: boolean;
};

/**
 * Permisos específicos de Estadísticas
 */
type StatisticsPermissions = {
  canView: boolean;
  canExport: boolean;
  canViewDetailed: boolean;
  canViewGlobal: boolean;
};

/**
 * Hook unificado de permisos por módulo
 * Soporta roles externos o lectura automática desde sessionStorage
 */
export const useModulePermissions = (externalRoles?: IRole[]) => {
  // Obtener roles (externos o sessionStorage)
  const rawRoles = useMemo(() => {
    return externalRoles || getUserRoles();
  }, [externalRoles]);

  // Validar roles
  const validRoles = useMemo(() => {
    return validateExternalRoles(rawRoles);
  }, [rawRoles]);

  // Flags de roles específicos
  const roleFlags = useMemo(() => ({
    isValid: validRoles.length > 0,
    isSuperAdmin: hasExternalRole(validRoles, 'SUPERADMIN'),
    isAdmin: hasExternalRole(validRoles, 'ADMIN'),
    isSuperior: hasExternalRole(validRoles, 'SUPERIOR'),
    isElemento: hasExternalRole(validRoles, 'ELEMENTO'),
    canAccessAdmin: canExternalRoleAccess(validRoles, 'ADMIN'),
    canAccessSuperior: canExternalRoleAccess(validRoles, 'SUPERIOR')
  }), [validRoles]);

  // Permisos de IPH
  const iphPermissions: IPHPermissions = useMemo(() => ({
    canCreate: roleFlags.canAccessSuperior,
    canRead: roleFlags.isValid,
    canUpdate: roleFlags.canAccessAdmin,
    canDelete: roleFlags.canAccessAdmin,
    canViewAll: roleFlags.canAccessSuperior,
    canViewOwn: roleFlags.isElemento,
    canExport: roleFlags.canAccessAdmin,
    canSupervise: roleFlags.canAccessSuperior
  }), [roleFlags]);

  // Permisos de Usuarios
  const userPermissions: UserPermissions = useMemo(() => ({
    canCreate: roleFlags.canAccessAdmin,
    canRead: roleFlags.canAccessAdmin,
    canUpdate: roleFlags.canAccessAdmin,
    canDelete: roleFlags.canAccessAdmin,
    canManageRoles: roleFlags.isSuperAdmin,
    canResetPasswords: roleFlags.canAccessAdmin,
    canViewAuditLog: roleFlags.isSuperAdmin
  }), [roleFlags]);

  // Permisos de Estadísticas
  const statisticsPermissions: StatisticsPermissions = useMemo(() => ({
    canView: roleFlags.canAccessSuperior,
    canExport: roleFlags.canAccessAdmin,
    canViewDetailed: roleFlags.canAccessAdmin,
    canViewGlobal: roleFlags.canAccessSuperior
  }), [roleFlags]);

  return {
    isValid: roleFlags.isValid,
    validRoles,
    roleFlags,
    iph: iphPermissions,
    users: userPermissions,
    statistics: statisticsPermissions
  };
};
```

**Uso del hook:**
```typescript
// components/Dashboard.tsx
import { useModulePermissions } from '@/hooks/useModulePermissions';

const Dashboard = () => {
  const permissions = useModulePermissions();

  if (!permissions.isValid) {
    return <div>Acceso denegado: roles inválidos</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Sección IPH */}
      {permissions.iph.canViewAll && (
        <section>
          <h2>Informes Policiales</h2>
          {permissions.iph.canCreate && <button>Crear IPH</button>}
          {permissions.iph.canExport && <button>Exportar</button>}
        </section>
      )}

      {/* Sección Usuarios */}
      {permissions.users.canRead && (
        <section>
          <h2>Gestión de Usuarios</h2>
          {permissions.users.canCreate && <button>Crear Usuario</button>}
          {permissions.users.canManageRoles && <button>Gestionar Roles</button>}
        </section>
      )}

      {/* Sección Estadísticas */}
      {permissions.statistics.canView && (
        <section>
          <h2>Estadísticas</h2>
          {permissions.statistics.canExport && <button>Exportar</button>}
        </section>
      )}
    </div>
  );
};
```

---

## 🛡️ Ejemplo 4: Guard de Rutas con React Router

**Caso de uso:** Proteger rutas según permisos del usuario.

```typescript
// components/guards/RoleGuard.tsx
import { Navigate } from 'react-router-dom';
import { canExternalRoleAccess, validateExternalRoles, getUserRoles } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import type { SystemRoleType } from '@/config/permissions.config';
import { logWarning } from '@/helper/log/logger.helper';

type RoleGuardProps = {
  requiredRole: SystemRoleType;
  children: React.ReactNode;
  redirectTo?: string;
  externalRoles?: IRole[];
};

/**
 * Guard de rutas basado en roles
 * Redirige si no tiene acceso jerárquico al rol requerido
 */
const RoleGuard = ({
  requiredRole,
  children,
  redirectTo = '/inicio',
  externalRoles
}: RoleGuardProps) => {
  // Obtener roles (externos o sessionStorage)
  const rawRoles = externalRoles || getUserRoles();

  // Validar roles
  const validRoles = validateExternalRoles(rawRoles);

  if (validRoles.length === 0) {
    logWarning('RoleGuard', 'Roles inválidos, redirigiendo', { requiredRole });
    return <Navigate to="/login" replace />;
  }

  // Verificar acceso jerárquico
  const hasAccess = canExternalRoleAccess(validRoles, requiredRole);

  if (!hasAccess) {
    logWarning('RoleGuard', 'Acceso denegado, redirigiendo', {
      requiredRole,
      userRoles: validRoles.map(r => r.nombre)
    });
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
```

**Uso con React Router:**
```typescript
// IPHApp.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleGuard from '@/components/guards/RoleGuard';
import Dashboard from '@/components/private/layout/Dashboard';
import Usuarios from '@/components/private/components/usuarios/Usuarios';
import Estadisticas from '@/components/private/components/statistics/EstadisticasUsuario';

const IPHApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Dashboard />}>
          {/* Ruta para todos (Elemento+) */}
          <Route
            path="inicio"
            element={
              <RoleGuard requiredRole="ELEMENTO">
                <Inicio />
              </RoleGuard>
            }
          />

          {/* Ruta para Superior+ */}
          <Route
            path="estadisticas"
            element={
              <RoleGuard requiredRole="SUPERIOR">
                <Estadisticas />
              </RoleGuard>
            }
          />

          {/* Ruta para Admin+ */}
          <Route
            path="usuarios"
            element={
              <RoleGuard requiredRole="ADMIN">
                <Usuarios />
              </RoleGuard>
            }
          />

          {/* Ruta solo SuperAdmin */}
          <Route
            path="configuracion"
            element={
              <RoleGuard requiredRole="SUPERADMIN">
                <Configuracion />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};
```

---

## 📊 Ejemplo 5: Tabla Virtualizada con Permisos

**Caso de uso:** Tabla que muestra acciones según permisos del usuario.

```typescript
// components/UsuariosVirtualizedTable.tsx
import { FixedSizeList } from 'react-window';
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

const UsuariosVirtualizedTable = ({
  usuarios,
  currentUserRoles,
  onEdit,
  onDelete
}: UsuariosTableProps) => {
  // Calcular permisos una sola vez
  const canEdit = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canDelete = canExternalRoleAccess(currentUserRoles, 'ADMIN');
  const canManageRoles = hasExternalRole(currentUserRoles, 'SUPERADMIN');

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const usuario = usuarios[index];

    return (
      <div style={style} className="flex items-center border-b p-2">
        <div className="flex-1">{usuario.nombre}</div>
        <div className="flex-1">{usuario.email}</div>
        <div className="flex-1">
          {usuario.roles.map(r => r.nombre).join(', ')}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(usuario.id)}
              className="px-2 py-1 bg-blue-500 text-white rounded"
            >
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(usuario.id)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex border-b-2 p-2 font-semibold">
        <div className="flex-1">Nombre</div>
        <div className="flex-1">Email</div>
        <div className="flex-1">Roles</div>
        <div className="w-40">Acciones</div>
      </div>

      {/* Tabla virtualizada */}
      <FixedSizeList
        height={600}
        itemCount={usuarios.length}
        itemSize={50}
        width="100%"
      >
        {Row}
      </FixedSizeList>

      {/* Acciones globales (solo para SuperAdmin) */}
      {canManageRoles && (
        <div className="mt-4 p-4 bg-gray-50">
          <button className="px-4 py-2 bg-green-600 text-white rounded">
            Gestionar Roles del Sistema
          </button>
        </div>
      )}
    </div>
  );
};

export default UsuariosVirtualizedTable;
```

---

## 📝 Ejemplo 6: Formulario Condicional por Rol

**Caso de uso:** Formulario que habilita campos según permisos.

```typescript
// components/UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { hasExternalRole, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';

const userSchema = z.object({
  nombre: z.string().min(3),
  email: z.string().email(),
  roles: z.array(z.object({
    id: z.number(),
    nombre: z.string()
  })).min(1)
});

type UserFormData = z.infer<typeof userSchema>;

type UserFormProps = {
  currentUserRoles: IRole[];
  onSubmit: (data: UserFormData) => void;
};

const UserForm = ({ currentUserRoles, onSubmit }: UserFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  });

  // Permisos
  const canAssignSuperAdmin = hasExternalRole(currentUserRoles, 'SUPERADMIN');
  const canAssignAdmin = canExternalRoleAccess(currentUserRoles, 'ADMIN');

  const availableRoles = [
    { id: 4, nombre: 'Elemento', enabled: canAssignAdmin },
    { id: 3, nombre: 'Superior', enabled: canAssignAdmin },
    { id: 2, nombre: 'Administrador', enabled: canAssignAdmin },
    { id: 1, nombre: 'SuperAdmin', enabled: canAssignSuperAdmin }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Nombre</label>
        <input {...register('nombre')} className="input" />
        {errors.nombre && <span className="text-red-500">{errors.nombre.message}</span>}
      </div>

      <div>
        <label>Email</label>
        <input {...register('email')} type="email" className="input" />
        {errors.email && <span className="text-red-500">{errors.email.message}</span>}
      </div>

      <div>
        <label>Roles</label>
        <div className="space-y-2">
          {availableRoles.map(role => (
            <label key={role.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={role.id}
                disabled={!role.enabled}
                {...register('roles')}
              />
              <span className={!role.enabled ? 'text-gray-400' : ''}>
                {role.nombre}
                {!role.enabled && ' (Sin permisos)'}
              </span>
            </label>
          ))}
        </div>
        {errors.roles && <span className="text-red-500">{errors.roles.message}</span>}
      </div>

      <button type="submit" className="btn-primary">
        Guardar Usuario
      </button>
    </form>
  );
};

export default UserForm;
```

---

## 🌐 Ejemplo 7: Servicio de API con Validación

**Caso de uso:** Servicio que valida roles antes de hacer peticiones a la API.

```typescript
// services/api/secure-api.service.ts
import { validateExternalRoles, canExternalRoleAccess } from '@/helper/role/role.helper';
import type { IRole } from '@/interfaces/role/role.interface';
import type { SystemRoleType } from '@/config/permissions.config';
import { httpHelper } from '@/helper/http/http.helper';

/**
 * Clase wrapper para peticiones API con validación de roles
 */
export class SecureApiService {
  /**
   * GET con validación de roles
   */
  static async secureGet<T>(
    endpoint: string,
    requiredRole: SystemRoleType,
    currentUserRoles: IRole[]
  ): Promise<T> {
    // Validar roles
    const validRoles = validateExternalRoles(currentUserRoles);
    if (validRoles.length === 0) {
      throw new Error('Roles inválidos');
    }

    // Verificar acceso
    if (!canExternalRoleAccess(validRoles, requiredRole)) {
      throw new Error(`Requiere permisos de ${requiredRole} para acceder a este recurso`);
    }

    const response = await httpHelper.get(endpoint);
    return response.data as T;
  }

  /**
   * POST con validación de roles
   */
  static async securePost<T>(
    endpoint: string,
    data: unknown,
    requiredRole: SystemRoleType,
    currentUserRoles: IRole[]
  ): Promise<T> {
    const validRoles = validateExternalRoles(currentUserRoles);
    if (!canExternalRoleAccess(validRoles, requiredRole)) {
      throw new Error(`Requiere permisos de ${requiredRole} para crear este recurso`);
    }

    const response = await httpHelper.post(endpoint, data);
    return response.data as T;
  }

  /**
   * DELETE con validación estricta
   */
  static async secureDelete(
    endpoint: string,
    requiredRole: SystemRoleType,
    currentUserRoles: IRole[]
  ): Promise<void> {
    const validRoles = validateExternalRoles(currentUserRoles);
    if (!canExternalRoleAccess(validRoles, requiredRole)) {
      throw new Error(`Requiere permisos de ${requiredRole} para eliminar este recurso`);
    }

    await httpHelper.delete(endpoint);
  }
}

// Uso del servicio
import { SecureApiService } from '@/services/api/secure-api.service';
import { getUserRoles } from '@/helper/role/role.helper';

const loadUsers = async () => {
  const currentRoles = getUserRoles();

  try {
    const users = await SecureApiService.secureGet(
      '/api/users',
      'ADMIN', // Requiere Admin o superior
      currentRoles
    );
    console.log(users);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

---

## 📚 Resumen de Casos de Uso

| Caso de Uso | Función Principal | Ubicación |
|-------------|------------------|-----------|
| Componente con props | `hasExternalRole`, `canExternalRoleAccess` | Componentes |
| Servicio con validación | `validateExternalRoles` | Servicios |
| Hook personalizado | `useModulePermissions` | Hooks |
| Guard de rutas | `RoleGuard` | Guards |
| Tabla con permisos | Cálculo previo de permisos | Componentes |
| Formulario condicional | Habilitar campos por rol | Formularios |
| API segura | `SecureApiService` | Servicios |

---

**Autor:** Sistema IPH Frontend
**Versión:** 2.0.0
**Fecha:** 2024-01-30
