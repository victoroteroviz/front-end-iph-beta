# FormSanitizer - Wrapper de Sanitización XSS

Componente wrapper que sanitiza automáticamente los inputs de formularios para prevenir ataques XSS de manera transparente y mantenible.

## ✨ Características

- 🛡️ **Sanitización automática** en `onChange` y `onSubmit`
- 🎯 **Integración transparente** con formularios existentes
- ⚡ **Fácil de quitar** - Solo envuelve, no modifica código existente
- 🔧 **Configurable** - Controla qué campos sanitizar
- 📝 **Mantiene acentos** y caracteres especiales comunes
- 🚫 **Elimina scripts, iframes, event handlers** y protocolos peligrosos

## 📦 Instalación

El componente está en `src/components/common/FormSanitizer/`

```typescript
import { FormSanitizer } from '../components/common/FormSanitizer';
```

## 🚀 Uso Básico

### Envolver formulario existente
```tsx
import { FormSanitizer } from '../components/common/FormSanitizer';

function MiComponente() {
  const handleSubmit = (event, sanitizedData) => {
    console.log('Datos sanitizados:', sanitizedData);
    // sanitizedData = { nombre: "Juan", email: "juan@test.com" }
  };

  return (
    <FormSanitizer onSubmit={handleSubmit}>
      <form>
        <input name="nombre" placeholder="Nombre" />
        <input name="email" placeholder="Email" />
        <button type="submit">Enviar</button>
      </form>
    </FormSanitizer>
  );
}
```

## ⚙️ Configuración Avanzada

### Controlar cuándo sanitizar
```tsx
<FormSanitizer 
  onSubmit={handleSubmit}
  sanitizeOnChange={true}    // Sanitiza mientras escribes (default: true)
  sanitizeOnSubmit={true}    // Sanitiza al enviar (default: true)
>
  <form>
    <input name="nombre" />
  </form>
</FormSanitizer>
```

### Excluir campos específicos
```tsx
<FormSanitizer 
  onSubmit={handleSubmit}
  excludeFields={['password', 'confirmPassword']}
>
  <form>
    <input name="nombre" />        {/* Se sanitiza */}
    <input name="password" />      {/* NO se sanitiza */}
    <input name="confirmPassword" /> {/* NO se sanitiza */}
  </form>
</FormSanitizer>
```

### Con formularios complejos
```tsx
<FormSanitizer 
  onSubmit={handleSubmit}
  className="form-container"
  excludeFields={['codigo_interno']}
>
  <form>
    <div className="form-group">
      <input name="nombre" />
      <input name="apellido" />
    </div>
    
    <textarea name="descripcion" />
    
    <select name="categoria">
      <option value="A">Categoría A</option>
      <option value="B">Categoría B</option>
    </select>
    
    <input name="codigo_interno" /> {/* Este NO se sanitiza */}
  </form>
</FormSanitizer>
```

## 🔒 Qué Previene

### Scripts maliciosos
```typescript
// Input del usuario: <script>alert('XSS')</script>
// Resultado sanitizado: alert('XSS')
```

### Event handlers
```typescript
// Input: <img src="x" onerror="alert('XSS')">
// Resultado: 
```

### Protocolos peligrosos  
```typescript
// Input: javascript:alert('XSS')
// Resultado: alert('XSS')
```

### Mantiene caracteres válidos
```typescript
// Input: "José María - Niño & Niña (Año 2024)"
// Resultado: "José María - Niño & Niña (Año 2024)" ✅
```

## 🔧 Integración con Componentes Existentes

### Con el componente Login
```tsx
// src/components/public/auth/Login.tsx
import { FormSanitizer } from '../../common/FormSanitizer';

const Login = () => {
  const handleSubmit = (event, sanitizedData) => {
    // sanitizedData.usuario y sanitizedData.password están sanitizados
    loginService(sanitizedData);
  };

  return (
    <FormSanitizer 
      onSubmit={handleSubmit}
      excludeFields={['password']} // Las contraseñas no se sanitizan
    >
      <form>
        <input name="usuario" placeholder="Usuario" />
        <input name="password" type="password" placeholder="Contraseña" />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </FormSanitizer>
  );
};
```

### Con formularios de perfil
```tsx
// src/components/private/components/perfil-usuario/PerfilUsuario.tsx
import { FormSanitizer } from '../../../common/FormSanitizer';

const PerfilUsuario = () => {
  const handleSubmit = (event, sanitizedData) => {
    updateProfile(sanitizedData);
  };

  return (
    <FormSanitizer onSubmit={handleSubmit}>
      <form>
        <input name="nombre" />
        <input name="apellido" />
        <textarea name="bio" />
        <button type="submit">Actualizar Perfil</button>
      </form>
    </FormSanitizer>
  );
};
```

## 🚫 Cómo Quitar Fácilmente

Si necesitas desactivar la sanitización:

```tsx
// ANTES (con sanitización)
<FormSanitizer onSubmit={handleSubmit}>
  <form>
    <input name="campo" />
  </form>
</FormSanitizer>

// DESPUÉS (sin sanitización) - Solo quita el wrapper
<form onSubmit={handleSubmit}>
  <input name="campo" />
</form>
```

## 🔍 Logging y Debugging

El componente registra automáticamente:
- Cantidad de campos sanitizados
- Campos excluidos de sanitización  
- Información para debugging

```typescript
// En la consola verás:
// [INFO] FormSanitizer: Formulario sanitizado { fieldsCount: 3, excludedFields: ['password'] }
```

## ⚠️ Consideraciones

1. **Passwords**: Excluir campos de contraseña del `excludeFields`
2. **File inputs**: Se manejan automáticamente sin sanitización
3. **Rendimiento**: Mínimo impacto, solo procesa campos con `name`
4. **React Strict Mode**: Compatible completamente

## 🧪 Testing

```tsx
// Ejemplo de test
import { render, fireEvent } from '@testing-library/react';
import { FormSanitizer } from './FormSanitizer';

test('sanitiza input malicioso', () => {
  let capturedData = {};
  
  const TestForm = () => (
    <FormSanitizer onSubmit={(e, data) => capturedData = data}>
      <form>
        <input name="test" defaultValue="<script>alert('xss')</script>" />
      </form>
    </FormSanitizer>
  );

  const { container } = render(<TestForm />);
  fireEvent.submit(container.querySelector('form'));
  
  expect(capturedData.test).toBe("alert('xss')");
});
```

---

## 📋 Props API

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `ReactElement` | - | Formulario a envolver (requerido) |
| `onSubmit` | `(event, data) => void` | - | Handler del submit con datos sanitizados |
| `sanitizeOnChange` | `boolean` | `true` | Sanitizar mientras el usuario escribe |
| `sanitizeOnSubmit` | `boolean` | `true` | Sanitizar al enviar formulario |
| `excludeFields` | `string[]` | `[]` | Nombres de campos que NO se sanitizan |
| `className` | `string` | - | Clase CSS para el wrapper |
| `autoComplete` | `string` | `'off'` | Atributo autocomplete del form |

## 🛡️ Seguridad

Este wrapper funciona junto con `security.helper.ts` y proporciona una capa adicional de protección XSS sin afectar la funcionalidad existente.

**⚡ Listo para usar en producción**