# PerfilUsuario Component

## Descripción
Componente refactorizado para la gestión completa de perfiles de usuario (crear, editar y ver). Implementa las mejores prácticas de arquitectura moderna con TypeScript, control de acceso por roles y componentes atómicos reutilizables.

## Características

### ✅ **Arquitectura Moderna**
- **TypeScript completo** con interfaces tipadas
- **Hook personalizado** `usePerfilUsuario` para separación de lógica
- **Componentes atómicos** reutilizables
- **Validación robusta** con Zod
- **Logging estructurado** integrado

### ✅ **Control de Acceso**
- **SuperAdmin/Admin**: CRUD completo de usuarios
- **Usuario actual**: Solo editar su propio perfil  
- **Elementos/Superiores**: Solo ver su información

### ✅ **Funcionalidades**
- Crear nuevos usuarios con validación completa
- Editar usuarios existentes
- Gestión de roles multiselección
- Integración con catálogos (grados, cargos, municipios, etc.)
- Sistema de notificaciones visual
- Migrado de localStorage → sessionStorage

### ✅ **Seguridad**
- Validación client-side robusta
- Sanitización de inputs
- Control de acceso por roles
- Logging de todas las operaciones
- Tokens CSRF (preparado)

## Estructura de Archivos

```
src/components/private/components/perfil-usuario/
├── PerfilUsuario.tsx              # Componente principal
├── README.md                      # Esta documentación
├── hooks/
│   └── usePerfilUsuario.ts       # Hook personalizado
└── components/                    # Componentes atómicos
    ├── FormField.tsx             # Campo de formulario reutilizable
    ├── RolesSelector.tsx         # Selector de roles multiselección
    ├── LoadingSpinner.tsx        # Spinner de carga
    ├── ActionButtons.tsx         # Botones guardar/cancelar
    └── FormSection.tsx           # Sección de formulario con icono
```

## Uso

### Crear nuevo usuario
```tsx
import PerfilUsuario from './components/private/components/perfil-usuario/PerfilUsuario';

<Route path="/usuarios/nuevo" element={<PerfilUsuario mode="create" />} />
```

### Editar usuario existente
```tsx
<Route path="/usuarios/editar/:id" element={<PerfilUsuario mode="edit" />} />
```

### Ver perfil (solo lectura)
```tsx
<Route path="/perfil" element={<PerfilUsuario mode="view" />} />
```

## Servicios Integrados

### **CRUD de Usuarios**
- `getUserById()` - Obtener usuario por ID
- `createUsuario()` - Crear nuevo usuario
- `updateUsuario()` - Actualizar usuario existente

### **Catálogos**
- `getGrados()` - Lista de grados
- `getCargos()` - Lista de cargos  
- `getMunicipios()` - Lista de municipios
- `getAdscripciones()` - Lista de adscripciones
- `getSexos()` - Lista de sexos

### **Roles**
- `getRoles()` - Lista de roles disponibles
- `construirUserRoles()` - Construcción de estructura user_roles

## Estados del Componente

### **Loading States**
- `isLoading` - Cargando datos del usuario
- `isCatalogsLoading` - Cargando catálogos
- `isSubmitting` - Enviando formulario

### **Permission States**
- `canEdit` - Puede editar usuario
- `canCreate` - Puede crear usuario
- `canViewSensitiveData` - Puede ver/editar roles

### **Form States**
- `formData` - Datos del formulario
- `formErrors` - Errores de validación
- `isFormValid` - Validación general

## Validaciones Implementadas

### **Campos Obligatorios**
- Nombre, primer apellido, correo, teléfono
- CUIP, CUP, grado, cargo, municipio, adscripción, sexo
- Al menos un rol seleccionado
- Contraseña (solo para creación)

### **Validaciones Específicas**
- **Email**: Formato válido
- **Teléfono**: 10-15 dígitos, formato válido
- **Nombres**: Solo letras y espacios
- **Contraseña**: Mínimo 8 caracteres (creación)

## Sistema de Notificaciones

### **Mensajes de Éxito**
- Usuario creado correctamente
- Usuario actualizado correctamente

### **Mensajes de Error**
- Errores de validación específicos por campo
- Errores del servidor parseados automáticamente
- Errores de permisos y acceso

### **Mensajes de Advertencia**
- Acceso denegado por roles
- Cambios no guardados

## Logging

Todas las operaciones se loggean automáticamente:

```typescript
logInfo('PerfilUsuario', 'Usuario actualizado', { id: userId });
logError('PerfilUsuario', 'Error al crear usuario', { error });
```

## Integración con Rutas

### **Rutas Recomendadas**
```tsx
// IPHApp.tsx
<Route path="/usuarios/nuevo" element={<PerfilUsuario />} />
<Route path="/usuarios/editar/:id" element={<PerfilUsuario />} />
<Route path="/perfil" element={<PerfilUsuario />} />
```

### **Navegación en Sidebar**
```typescript
// Solo para SuperAdmin y Admin
{
  name: 'Usuarios',
  path: '/usuarios',
  icon: Users,
  allowedRoles: ['SuperAdmin', 'Administrador']
}
```

## Dependencies

### **Required**
- `react-select` - Selector multiselección de roles
- `zod` - Validación de esquemas
- `lucide-react` - Iconos
- `react-router-dom` - Navegación

### **Internal**
- `usePerfilUsuario` - Hook personalizado
- `showSuccess/showError` - Sistema de notificaciones
- `logInfo/logError` - Sistema de logging
- `sanitizeInput` - Helpers de seguridad

## Migración de localStorage → sessionStorage

✅ **Completamente migrado**
- Datos de usuario leídos desde `sessionStorage`
- Mayor seguridad (datos se borran al cerrar pestaña)
- Consistente con toda la aplicación

## TODO / Mejoras Futuras

### **Funcionalidades Pendientes**
- [ ] Upload de foto de perfil
- [ ] Historial de cambios del usuario
- [ ] Exportar datos del usuario
- [ ] Validación server-side integrada

### **Optimizaciones**
- [ ] Lazy loading de catálogos grandes
- [ ] Cache de catálogos en sessionStorage
- [ ] Debounce en validaciones en tiempo real
- [ ] Paginación para roles con muchas opciones

## Testing

### **Tests Recomendados**
- [ ] Renderizado con diferentes roles
- [ ] Validaciones del formulario
- [ ] Integración con servicios
- [ ] Estados de carga y error
- [ ] Navegación y permisos

### **Test Commands**
```bash
# Unit tests
npm test PerfilUsuario

# Integration tests  
npm test usePerfilUsuario

# E2E tests
npm run e2e:perfil-usuario
```

---

## Changelog

### **v2.0.0** (2025-01-29)
- ✅ Refactorización completa a TypeScript
- ✅ Implementación de hook personalizado
- ✅ Componentes atómicos reutilizables
- ✅ Sistema de validación con Zod
- ✅ Control de acceso por roles
- ✅ Migración localStorage → sessionStorage
- ✅ Sistema de notificaciones visual
- ✅ Logging estructurado integrado

### **v1.0.0** (Legacy)
- Componente original en JavaScript
- Uso de SweetAlert2
- localStorage para datos de usuario