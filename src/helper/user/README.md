# 👤 User Helper - Sistema de Gestión de Datos de Usuario

**Versión:** 1.0.0
**Ubicación:** `/src/helper/user/user.helper.ts`
**Patrón:** Singleton + Cache + Validación Zod

---

## 📋 DESCRIPCIÓN

Helper centralizado para la gestión de datos de usuario almacenados en `sessionStorage`. Proporciona una API simple y segura para obtener, formatear y validar información del usuario actual.

### **Características Principales**

- ✅ **Validación Zod Runtime** - Protección contra datos corruptos y XSS
- ✅ **Sistema de Cache** - TTL de 5 segundos para optimizar performance
- ✅ **Singleton Pattern** - Instancia única y consistente en toda la aplicación
- ✅ **Formateo Flexible** - Múltiples opciones para formatear nombres
- ✅ **Gestión de Avatares** - Soporte para avatares personalizados y por defecto
- ✅ **Logging Estructurado** - Trazabilidad completa de operaciones
- ✅ **Sanitización Automática** - Limpieza de sessionStorage corrupto
- ✅ **Type Safety** - TypeScript completo con interfaces

---

## 🚀 USO RÁPIDO

### **Importación**

```typescript
// Funciones individuales (RECOMENDADO)
import { getUserData, getUserFullName, getUserAvatar } from '@/helper/user/user.helper';

// Clase completa (para casos avanzados)
import { userHelper, UserHelper } from '@/helper/user/user.helper';

// Interfaces
import type { UserData, UserContext } from '@/interfaces/user/user-data.interface';
```

### **Ejemplos Básicos**

```typescript
// 1. Obtener datos completos del usuario
const userData = getUserData();
if (userData) {
  console.log(userData.id);              // "123"
  console.log(userData.nombre);          // "Juan"
  console.log(userData.primer_apellido); // "Pérez"
}

// 2. Obtener nombre completo formateado
const fullName = getUserFullName();      // "Juan Pérez García"

// 3. Obtener avatar
const avatar = getUserAvatar();          // URL del avatar o default

// 4. Verificar si tiene datos
if (hasUserData()) {
  // Usuario tiene datos válidos
}
```

---

## 📚 API COMPLETA

### **1. Obtención de Datos**

#### **`getUserData(): UserData | null`**

Obtiene los datos completos del usuario desde sessionStorage.

```typescript
const userData = getUserData();

if (userData) {
  console.log(userData.id);               // ID único del usuario
  console.log(userData.nombre);           // Primer nombre
  console.log(userData.primer_apellido);  // Primer apellido
  console.log(userData.segundo_apellido); // Segundo apellido (opcional)
  console.log(userData.foto);             // URL de foto (opcional)
}
```

**Características:**
- ✅ Validación Zod automática
- ✅ Cache de 5 segundos
- ✅ Retorna `null` si no hay datos o son inválidos
- ✅ Sanitiza datos corruptos automáticamente

---

#### **`getUserId(): string | null`**

Obtiene solo el ID del usuario.

```typescript
const userId = getUserId(); // "123" o null
```

---

#### **`hasUserData(): boolean`**

Verifica si existen datos de usuario válidos.

```typescript
if (hasUserData()) {
  // Usuario autenticado con datos válidos
} else {
  // Redirigir a login
  navigate('/login');
}
```

---

### **2. Formateo de Nombres**

#### **`getUserFullName(options?: FormatNameOptions): string`**

Obtiene el nombre completo con opciones de formateo.

**Opciones:**
```typescript
interface FormatNameOptions {
  includeSecondLastName?: boolean; // Default: true
  uppercase?: boolean;             // Default: false
  firstNameOnly?: boolean;         // Default: false
}
```

**Ejemplos:**

```typescript
// Nombre completo con ambos apellidos
getUserFullName();
// → "Juan Pérez García"

// Solo nombre y primer apellido
getUserFullName({ includeSecondLastName: false });
// → "Juan Pérez"

// Solo el primer nombre
getUserFullName({ firstNameOnly: true });
// → "Juan"

// Nombre en mayúsculas
getUserFullName({ uppercase: true });
// → "JUAN PÉREZ GARCÍA"

// Combinación de opciones
getUserFullName({
  includeSecondLastName: false,
  uppercase: true
});
// → "JUAN PÉREZ"
```

---

#### **`getFirstName(): string`**

Obtiene solo el primer nombre.

```typescript
const firstName = getFirstName(); // "Juan"
```

---

#### **`getFirstLastName(): string`**

Obtiene solo el primer apellido.

```typescript
const lastName = getFirstLastName(); // "Pérez"
```

---

#### **`getSecondLastName(): string | null`**

Obtiene el segundo apellido si existe.

```typescript
const secondLastName = getSecondLastName(); // "García" o null
```

---

#### **`getUserInitials(): string`**

Obtiene las iniciales del usuario (útil para avatares).

```typescript
const initials = getUserInitials(); // "JP" (Juan Pérez)

// Uso en avatar
<div className="avatar">
  {hasAvatar() ? (
    <img src={getUserAvatar()} />
  ) : (
    <span>{getUserInitials()}</span>
  )}
</div>
```

---

### **3. Gestión de Avatares**

#### **`getUserAvatar(useDefault?: boolean): string | null`**

Obtiene la URL del avatar del usuario.

**Parámetros:**
- `useDefault` (boolean) - Si retornar avatar por defecto cuando no hay foto (default: `true`)

```typescript
// Con fallback a avatar por defecto
const avatar = getUserAvatar(true);
// → "/assets/images/default-avatar.png" si no hay foto

// Sin fallback
const avatar = getUserAvatar(false);
// → null si no hay foto

// Uso en componente
<img
  src={getUserAvatar()}
  alt="Avatar"
  className="rounded-full"
/>
```

---

#### **`hasAvatar(): boolean`**

Verifica si el usuario tiene foto de perfil configurada.

```typescript
if (hasAvatar()) {
  // Mostrar avatar personalizado
  <img src={getUserAvatar()} />
} else {
  // Mostrar iniciales o avatar por defecto
  <div className="avatar-initials">
    {getUserInitials()}
  </div>
}
```

---

### **4. Contexto Completo**

#### **`getUserContext(): UserContext | null`**

Obtiene el contexto completo del usuario con metadata útil.

```typescript
const context = getUserContext();

if (context) {
  console.log(context.userData);    // UserData completo
  console.log(context.fullName);    // "Juan Pérez García"
  console.log(context.avatarUrl);   // URL del avatar
  console.log(context.hasAvatar);   // true/false
}

// Uso en componente
const UserProfile = () => {
  const context = getUserContext();

  if (!context) return <LoginPrompt />;

  return (
    <div>
      <img src={context.avatarUrl} />
      <h2>{context.fullName}</h2>
    </div>
  );
};
```

---

### **5. Gestión de Cache**

#### **`invalidateUserCache(): void`**

Invalida el cache manualmente. Útil después de actualizar el perfil.

```typescript
// Después de actualizar perfil
const updateProfile = async (newData: UserData) => {
  await api.updateProfile(newData);

  // Actualizar sessionStorage
  sessionStorage.setItem('user_data', JSON.stringify(newData));

  // Invalidar cache para forzar reload
  invalidateUserCache();

  // Próxima llamada leerá los nuevos datos
  const updated = getUserData();
};
```

---

#### **`clearUserData(): void`**

Limpia los datos de usuario del helper y sessionStorage.

```typescript
// En logout
const handleLogout = () => {
  clearUserData(); // Limpia user_data
  // También limpiar roles, token, etc.
  navigate('/login');
};
```

---

## 🎯 CASOS DE USO COMUNES

### **1. Mostrar Nombre en Header/Navbar**

```typescript
import { getUserFullName } from '@/helper/user/user.helper';

const Navbar: React.FC = () => {
  const userName = getUserFullName({ includeSecondLastName: false });

  return (
    <nav>
      <span>Bienvenido, {userName}</span>
    </nav>
  );
};
```

---

### **2. Avatar con Fallback a Iniciales**

```typescript
import { getUserAvatar, hasAvatar, getUserInitials } from '@/helper/user/user.helper';

const UserAvatar: React.FC = () => {
  return (
    <div className="avatar">
      {hasAvatar() ? (
        <img
          src={getUserAvatar()}
          alt="Avatar"
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
          {getUserInitials()}
        </div>
      )}
    </div>
  );
};
```

---

### **3. Perfil de Usuario Completo**

```typescript
import { getUserContext } from '@/helper/user/user.helper';

const UserProfile: React.FC = () => {
  const context = getUserContext();

  if (!context) {
    return <div>No hay datos de usuario</div>;
  }

  const { userData, fullName, avatarUrl, hasAvatar } = context;

  return (
    <div className="profile">
      <img src={avatarUrl} alt="Avatar" />
      <h2>{fullName}</h2>
      <p>ID: {userData.id}</p>
      {hasAvatar && <span>✓ Foto personalizada</span>}
    </div>
  );
};
```

---

### **4. Breadcrumb con Perfil**

```typescript
import { getUserFullName, getUserAvatar } from '@/helper/user/user.helper';
import { User } from 'lucide-react';

const ProfileBreadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const fullName = getUserFullName();
  const avatar = getUserAvatar();

  return (
    <button
      onClick={() => navigate('/perfil')}
      className="flex items-center gap-2 text-sm hover:text-gray-800"
    >
      <img
        src={avatar}
        alt="Avatar"
        className="w-6 h-6 rounded-full"
      />
      <span>{fullName}</span>
    </button>
  );
};
```

---

### **5. Guard de Ruta con Validación de Usuario**

```typescript
import { hasUserData } from '@/helper/user/user.helper';
import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!hasUserData()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

---

### **6. Logging con Contexto de Usuario**

```typescript
import { getUserId } from '@/helper/user/user.helper';
import { logInfo } from '@/helper/log/logger.helper';

const trackAction = (action: string) => {
  const userId = getUserId();

  logInfo('UserActions', `Acción: ${action}`, {
    userId,
    timestamp: Date.now()
  });
};
```

---

## 🔒 SEGURIDAD

### **Validación Zod**

Todos los datos son validados automáticamente con el siguiente schema:

```typescript
const UserDataSchema = z.object({
  id: z.string()
    .min(1, 'ID de usuario no puede estar vacío')
    .max(100, 'ID de usuario demasiado largo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID contiene caracteres inválidos'),

  nombre: z.string()
    .min(1, 'Nombre no puede estar vacío')
    .max(100, 'Nombre demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'Caracteres inválidos'),

  primer_apellido: z.string()
    .min(1, 'Apellido requerido')
    .max(100, 'Apellido demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'Caracteres inválidos'),

  segundo_apellido: z.string().optional(),
  foto: z.string().max(500).optional()
});
```

### **Protección contra:**

- ✅ **XSS** - Validación de caracteres permitidos
- ✅ **Datos corruptos** - Sanitización automática
- ✅ **Inyección** - Regex estrictos para nombres
- ✅ **Overflow** - Límites de longitud en strings
- ✅ **Type coercion** - Validación estricta de tipos

---

## ⚡ PERFORMANCE

### **Sistema de Cache**

- **TTL:** 5 segundos
- **Evita:** Lecturas repetidas de sessionStorage
- **Optimización:** Primera llamada lee storage, siguientes usan cache

```typescript
// Primera llamada (t=0s)
const userData1 = getUserData(); // Lee sessionStorage + valida Zod

// Segunda llamada (t=2s)
const userData2 = getUserData(); // Retorna desde cache (rápido)

// Tercera llamada (t=6s)
const userData3 = getUserData(); // Cache expirado, re-valida
```

### **Benchmark estimado:**

| Operación | Sin Cache | Con Cache | Mejora |
|-----------|-----------|-----------|--------|
| getUserData() | ~2-3ms | ~0.01ms | **200x** |
| getUserFullName() | ~2-3ms | ~0.02ms | **150x** |

---

## 🧪 TESTING SUGERIDO

```typescript
describe('UserHelper', () => {
  beforeEach(() => {
    sessionStorage.clear();
    invalidateUserCache();
  });

  describe('getUserData', () => {
    it('debe retornar null si no hay datos', () => {
      expect(getUserData()).toBeNull();
    });

    it('debe retornar datos válidos desde sessionStorage', () => {
      const mockData = {
        id: '123',
        nombre: 'Juan',
        primer_apellido: 'Pérez',
        segundo_apellido: 'García',
        foto: '/avatar.jpg'
      };

      sessionStorage.setItem('user_data', JSON.stringify(mockData));

      const result = getUserData();
      expect(result).toEqual(mockData);
    });

    it('debe sanitizar datos corruptos', () => {
      sessionStorage.setItem('user_data', 'invalid-json');

      const result = getUserData();
      expect(result).toBeNull();
      expect(sessionStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('getUserFullName', () => {
    beforeEach(() => {
      const mockData = {
        id: '123',
        nombre: 'Juan',
        primer_apellido: 'Pérez',
        segundo_apellido: 'García'
      };
      sessionStorage.setItem('user_data', JSON.stringify(mockData));
    });

    it('debe formatear nombre completo', () => {
      expect(getUserFullName()).toBe('Juan Pérez García');
    });

    it('debe omitir segundo apellido si se especifica', () => {
      expect(getUserFullName({ includeSecondLastName: false }))
        .toBe('Juan Pérez');
    });

    it('debe retornar solo primer nombre', () => {
      expect(getUserFullName({ firstNameOnly: true }))
        .toBe('Juan');
    });

    it('debe convertir a mayúsculas', () => {
      expect(getUserFullName({ uppercase: true }))
        .toBe('JUAN PÉREZ GARCÍA');
    });
  });

  describe('Cache', () => {
    it('debe usar cache en múltiples llamadas', () => {
      const mockData = {
        id: '123',
        nombre: 'Juan',
        primer_apellido: 'Pérez'
      };
      sessionStorage.setItem('user_data', JSON.stringify(mockData));

      const spy = jest.spyOn(Storage.prototype, 'getItem');

      getUserData(); // Primera llamada
      getUserData(); // Segunda llamada (cache)

      expect(spy).toHaveBeenCalledTimes(1); // Solo una lectura
    });

    it('debe invalidar cache después de TTL', async () => {
      const mockData = {
        id: '123',
        nombre: 'Juan',
        primer_apellido: 'Pérez'
      };
      sessionStorage.setItem('user_data', JSON.stringify(mockData));

      getUserData(); // Primera llamada

      // Esperar 6 segundos (TTL = 5s)
      await new Promise(resolve => setTimeout(resolve, 6000));

      const spy = jest.spyOn(Storage.prototype, 'getItem');
      getUserData(); // Debe re-leer

      expect(spy).toHaveBeenCalled();
    });
  });
});
```

---

## 🔗 INTEGRACIÓN CON OTROS HELPERS

### **Con Role Helper**

```typescript
import { getUserFullName, getUserId } from '@/helper/user/user.helper';
import { getUserRoles, isSuperAdmin } from '@/helper/role/role.helper';

const UserCard = () => {
  const fullName = getUserFullName();
  const userId = getUserId();
  const roles = getUserRoles();
  const isAdmin = isSuperAdmin(roles);

  return (
    <div>
      <h3>{fullName}</h3>
      <p>ID: {userId}</p>
      {isAdmin && <span className="badge">Administrador</span>}
    </div>
  );
};
```

### **Con Logger Helper**

```typescript
import { getUserId } from '@/helper/user/user.helper';
import { logInfo } from '@/helper/log/logger.helper';

const trackUserAction = (action: string, details?: any) => {
  logInfo('UserActions', action, {
    userId: getUserId(),
    timestamp: Date.now(),
    ...details
  });
};
```

---

## 📊 ESTRUCTURA DE DATOS

### **UserData (sessionStorage)**

```typescript
{
  "id": "123",
  "nombre": "Juan",
  "primer_apellido": "Pérez",
  "segundo_apellido": "García",
  "foto": "/assets/avatars/user-123.jpg"
}
```

### **UserContext (helper)**

```typescript
{
  userData: {
    id: "123",
    nombre: "Juan",
    primer_apellido: "Pérez",
    segundo_apellido: "García",
    foto: "/assets/avatars/user-123.jpg"
  },
  fullName: "Juan Pérez García",
  avatarUrl: "/assets/avatars/user-123.jpg",
  hasAvatar: true
}
```

---

## 🛠️ TROUBLESHOOTING

### **Problema: getUserData() retorna null**

**Causas posibles:**
1. Usuario no ha iniciado sesión
2. sessionStorage corrupto
3. Datos no cumplen validación Zod

**Solución:**
```typescript
const userData = getUserData();

if (!userData) {
  // Verificar login
  if (!sessionStorage.getItem('token')) {
    navigate('/login');
  } else {
    // sessionStorage corrupto, hacer logout
    logWarning('UserHelper', 'Datos corruptos, forzando logout');
    handleLogout();
  }
}
```

---

### **Problema: Cache no se actualiza después de cambiar perfil**

**Solución:**
```typescript
// Después de actualizar perfil
sessionStorage.setItem('user_data', JSON.stringify(newData));
invalidateUserCache(); // ← IMPORTANTE
```

---

### **Problema: Nombre se muestra sin acentos**

**Causa:** Validación Zod permite acentos, pero puede haber problema en el guardado.

**Verificar:**
```typescript
const userData = getUserData();
console.log(userData?.nombre); // Verificar si tiene acentos

// Si no tiene, actualizar sessionStorage con encoding correcto
```

---

## 📝 CHANGELOG

### **v1.0.0** (2025-01-31)

**Features:**
- ✅ Implementación inicial con Singleton pattern
- ✅ Validación Zod runtime completa
- ✅ Sistema de cache con TTL 5s
- ✅ Formateo flexible de nombres
- ✅ Gestión de avatares con fallback
- ✅ Funciones de conveniencia para uso directo
- ✅ Logging estructurado
- ✅ Sanitización automática de datos corruptos
- ✅ JSDoc completo con ejemplos
- ✅ TypeScript strict mode

**Security:**
- ✅ Protección contra XSS
- ✅ Validación regex estricta
- ✅ Límites de longitud en strings
- ✅ Type safety completo

**Performance:**
- ✅ Cache con TTL para reducir I/O
- ✅ Optimizaciones de formateo
- ✅ Lazy validation

---

## 🔗 REFERENCIAS

- **Patrón base:** `/src/helper/role/role.helper.ts`
- **Interfaces:** `/src/interfaces/user/user-data.interface.ts`
- **Origen de datos:** `/src/components/public/auth/services/login.service.ts:152-160`
- **Logger:** `/src/helper/log/logger.helper.ts`
- **Documentación Zod:** https://zod.dev

---

## 👥 CONTRIBUCIÓN

Al modificar este helper:

1. ✅ Mantener compatibilidad con patrón de role.helper
2. ✅ Actualizar schema Zod si cambia estructura de sessionStorage
3. ✅ Agregar tests para nuevas funciones
4. ✅ Documentar con JSDoc completo
5. ✅ Actualizar este README
6. ✅ Actualizar CLAUDE.md del proyecto

---

## 📄 LICENCIA

IPH Frontend - Uso interno

---

**Última actualización:** 2025-01-31
**Versión:** 1.0.0
**Autor:** IPH Frontend Team
