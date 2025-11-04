# 👤 UserProfileBreadcrumb - Componente de Perfil en Breadcrumbs

**Versión:** 1.0.0
**Ubicación:** `/src/components/shared/components/breadcrumbs/UserProfileBreadcrumb.tsx`

---

## 📋 DESCRIPCIÓN

Componente **completamente independiente** para mostrar el perfil del usuario en breadcrumbs. No requiere props obligatorias y obtiene los datos directamente desde `user.helper.ts`.

### **Características**

- ✅ **Totalmente independiente** - No depende de props externas
- ✅ **Auto-reactivo** - Usa `useUserData` hook para actualizaciones automáticas
- ✅ **Flexible** - Múltiples variantes (completo, compacto, extendido)
- ✅ **Avatar inteligente** - Foto o iniciales automáticas
- ✅ **Type-safe** - 100% TypeScript
- ✅ **Accesible** - ARIA labels y semántica correcta

---

## 🚀 USO RÁPIDO

### **Importación**

```typescript
import { UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs';
// O importación específica
import { UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs/UserProfileBreadcrumb';
```

### **Uso Básico (Sin Props)**

```typescript
import { UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs';

const MyLayout = () => {
  return (
    <div>
      <UserProfileBreadcrumb />
    </div>
  );
};
```

**Resultado:**
```
[Avatar] Juan Pérez
```

---

## 📚 EJEMPLOS DE USO

### **1. Uso Básico en Layout**

```typescript
import { UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs';

const DashboardLayout = () => {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Dashboard</h1>

      {/* Componente independiente */}
      <UserProfileBreadcrumb />
    </header>
  );
};
```

---

### **2. Con Breadcrumbs Existente**

```typescript
import { Breadcrumbs, UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs';

const PageHeader = () => {
  const breadcrumbItems = [
    { label: 'Inicio', path: '/inicio' },
    { label: 'Configuración', isActive: true }
  ];

  return (
    <div className="flex items-center justify-between">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Agregar perfil al final */}
      <UserProfileBreadcrumb />
    </div>
  );
};
```

---

### **3. Configuración Personalizada**

```typescript
<UserProfileBreadcrumb
  profilePath="/mi-cuenta"      // Ruta personalizada
  avatarSize={32}                // Avatar más grande
  showAvatar={true}              // Mostrar avatar
  showName={true}                // Mostrar nombre
  includeSecondLastName={false}  // Solo primer apellido
  className="custom-style"       // Clase CSS adicional
/>
```

---

### **4. Con onClick Personalizado**

```typescript
<UserProfileBreadcrumb
  onClick={() => {
    console.log('Usuario clickeó en su perfil');
    // Lógica personalizada antes de navegar
    analytics.track('profile_clicked');
    navigate('/perfil');
  }}
/>
```

---

### **5. Variante Compacta (Solo Avatar)**

```typescript
import { UserProfileBreadcrumbCompact } from '@/components/shared/components/breadcrumbs';

<UserProfileBreadcrumbCompact
  avatarSize={28}
  profilePath="/perfil"
/>
```

**Resultado:**
```
[Avatar]
```

---

### **6. Variante Extendida (Con Segundo Apellido)**

```typescript
import { UserProfileBreadcrumbExtended } from '@/components/shared/components/breadcrumbs';

<UserProfileBreadcrumbExtended
  avatarSize={24}
/>
```

**Resultado:**
```
[Avatar] Juan Pérez García
```

---

### **7. En Topbar/Navbar**

```typescript
const Topbar = () => {
  return (
    <nav className="bg-white shadow-sm px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />

          {/* Perfil del usuario */}
          <UserProfileBreadcrumb
            avatarSize={32}
            profilePath="/perfil-usuario"
          />
        </div>
      </div>
    </nav>
  );
};
```

---

### **8. Con Dropdown de Opciones**

```typescript
import { useState } from 'react';
import { UserProfileBreadcrumb } from '@/components/shared/components/breadcrumbs';

const UserMenu = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <UserProfileBreadcrumb
        onClick={() => setShowDropdown(!showDropdown)}
      />

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg">
          <a href="/perfil" className="block px-4 py-2 hover:bg-gray-100">
            Ver Perfil
          </a>
          <a href="/configuracion" className="block px-4 py-2 hover:bg-gray-100">
            Configuración
          </a>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 VARIANTES DISPONIBLES

### **UserProfileBreadcrumb** (Principal)
Componente completo con todas las opciones configurables.

```typescript
<UserProfileBreadcrumb
  profilePath="/perfil"
  showAvatar={true}
  showName={true}
  avatarSize={24}
  includeSecondLastName={false}
  className=""
  onClick={undefined}
/>
```

### **UserProfileBreadcrumbCompact**
Solo muestra el avatar (sin nombre).

```typescript
<UserProfileBreadcrumbCompact avatarSize={28} />
```

### **UserProfileBreadcrumbExtended**
Muestra nombre completo con segundo apellido.

```typescript
<UserProfileBreadcrumbExtended />
```

---

## ⚙️ PROPS

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `profilePath` | `string` | `'/perfil'` | Ruta a la que navegar al hacer click |
| `showAvatar` | `boolean` | `true` | Si debe mostrar el avatar |
| `showName` | `boolean` | `true` | Si debe mostrar el nombre |
| `avatarSize` | `number` | `24` | Tamaño del avatar en píxeles |
| `className` | `string` | `''` | Clase CSS adicional |
| `onClick` | `() => void` | `undefined` | Callback personalizado (sobrescribe navegación) |
| `includeSecondLastName` | `boolean` | `false` | Incluir segundo apellido en el nombre |

---

## 🔄 ESTADOS DEL COMPONENTE

### **Con Foto de Perfil**
```
[📷 Foto] Juan Pérez
```

### **Sin Foto (Iniciales)**
```
[JP] Juan Pérez
```

### **Sin Datos de Usuario**
El componente no renderiza nada (retorna `null`).

---

## 🎯 INTEGRACIÓN CON HELPER

El componente usa internamente:

```typescript
import { useUserData } from '@/components/shared/hooks/useUserData';

const {
  fullName,      // "Juan Pérez García"
  avatar,        // "/path/to/avatar.jpg"
  hasProfilePhoto, // true/false
  initials,      // "JP"
  hasData        // true/false
} = useUserData({
  immediate: true,
  nameFormat: { includeSecondLastName },
  useDefaultAvatar: true
});
```

---

## 🧪 TESTING SUGERIDO

```typescript
describe('UserProfileBreadcrumb', () => {
  it('debe renderizar con datos de usuario', () => {
    // Mock sessionStorage con datos de usuario
    sessionStorage.setItem('user_data', JSON.stringify({
      id: '123',
      nombre: 'Juan',
      primer_apellido: 'Pérez',
      foto: '/avatar.jpg'
    }));

    render(<UserProfileBreadcrumb />);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByAltText('Avatar del usuario')).toBeInTheDocument();
  });

  it('no debe renderizar sin datos de usuario', () => {
    sessionStorage.clear();

    const { container } = render(<UserProfileBreadcrumb />);

    expect(container.firstChild).toBeNull();
  });

  it('debe navegar al hacer click', () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));

    render(<UserProfileBreadcrumb profilePath="/mi-perfil" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/mi-perfil');
  });

  it('debe mostrar iniciales si no hay foto', () => {
    sessionStorage.setItem('user_data', JSON.stringify({
      id: '123',
      nombre: 'Juan',
      primer_apellido: 'Pérez'
      // Sin foto
    }));

    render(<UserProfileBreadcrumb />);

    expect(screen.getByText('JP')).toBeInTheDocument();
  });
});
```

---

## 📦 DEPENDENCIAS

- `react` - Framework principal
- `react-router-dom` - Navegación
- `lucide-react` - Iconos (User icon como fallback)
- `@/helper/user/user.helper` - Obtención de datos de usuario
- `@/components/shared/hooks/useUserData` - Custom hook React

---

## 🔗 ARCHIVOS RELACIONADOS

| Archivo | Descripción |
|---------|-------------|
| `UserProfileBreadcrumb.tsx` | Componente principal |
| `useUserData.ts` | Custom hook para datos de usuario |
| `user.helper.ts` | Helper con lógica de usuario |
| `user-data.interface.ts` | Interfaces TypeScript |

---

## 💡 VENTAJAS DE ESTA IMPLEMENTACIÓN

1. ✅ **Zero Props Requeridas** - Funciona out-of-the-box
2. ✅ **Independiente** - No acopla con props de componente padre
3. ✅ **Reutilizable** - Usa en cualquier parte de la app
4. ✅ **Performance** - Cache automático con TTL 5s
5. ✅ **Type-Safe** - TypeScript completo
6. ✅ **Accesible** - ARIA labels correctos
7. ✅ **Flexible** - Múltiples variantes y configuración
8. ✅ **Mantenible** - Lógica centralizada en helper

---

## 🚨 IMPORTANTE

- El componente retorna `null` si no hay datos de usuario en sessionStorage
- Asegúrate de que el usuario esté autenticado antes de usar este componente
- Los datos se obtienen automáticamente, no necesitas pasarlos por props
- El avatar por defecto se muestra automáticamente si no hay foto

---

## 📝 CHANGELOG

### **v1.0.0** (2025-01-31)
- ✅ Implementación inicial
- ✅ Soporte para avatar con foto o iniciales
- ✅ 3 variantes: Principal, Compacta, Extendida
- ✅ Integración completa con user.helper
- ✅ Custom hook useUserData creado
- ✅ 100% TypeScript con props tipadas

---

**Última actualización:** 2025-01-31
**Versión:** 1.0.0
**Autor:** IPH Frontend Team
