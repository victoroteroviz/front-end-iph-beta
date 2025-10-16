# Implementación de Eliminación de Grupos

## 📋 Resumen de Cambios

Se ha implementado la funcionalidad de eliminación de grupos directamente desde las tarjetas (cards) del componente `GestionGrupos`. Ahora cada tarjeta de grupo muestra un botón de eliminar en la esquina superior derecha cuando el usuario tiene los permisos necesarios.

## 🎯 Características Implementadas

### 1. **Botón de Eliminación en GrupoCard**
- Ubicado en la esquina superior derecha de cada tarjeta
- Solo visible cuando el usuario tiene permisos de eliminación (`canDelete`)
- Icono de papelera (`Trash2`) con estados hover y loading
- Animación de spinner durante el proceso de eliminación

### 2. **Modal de Confirmación**
- Diálogo de confirmación antes de eliminar un grupo
- Muestra el nombre del grupo a eliminar
- Opciones de confirmar o cancelar
- Previene eliminaciones accidentales

### 3. **Control de Permisos**
- Verifica permisos de usuario antes de mostrar el botón
- Integrado con el sistema de roles existente
- Respeta las configuraciones de `canDelete` del hook

### 4. **Estados de Carga**
- Indicador visual durante la eliminación
- Deshabilita el botón mientras se procesa
- Feedback inmediato al usuario

## 📁 Archivos Modificados

### 1. `GrupoCard.tsx`
**Ubicación:** `src/components/private/components/gestion-grupos/components/shared/GrupoCard.tsx`

**Cambios realizados:**
```typescript
// Nuevas props agregadas
interface GrupoCardProps {
  // ... props existentes
  onDelete?: (grupo: IGrupoUsuario) => void;  // ✨ NUEVO
  isDeleting?: boolean;                        // ✨ NUEVO
  canDelete?: boolean;                         // ✨ NUEVO
}
```

**Características:**
- ✅ Botón de eliminar en esquina superior derecha
- ✅ Estado de loading durante eliminación
- ✅ Evento `onClick` con `stopPropagation` para no activar el click de la tarjeta
- ✅ Estilos hover rojo para indicar acción destructiva
- ✅ Tooltip informativo
- ✅ Optimización con `React.memo` incluye `isDeleting` en comparación

### 2. `GestionGrupos.tsx`
**Ubicación:** `src/components/private/components/gestion-grupos/GestionGrupos.tsx`

**Cambios realizados:**

#### Nueva función de manejo:
```typescript
const handleDeleteClick = (grupo: IGrupoUsuario) => {
  setDeleteDialog({
    isOpen: true,
    grupoId: grupo.id,
    grupoNombre: grupo.nombreGrupo
  });
};
```

#### Props actualizadas en GrupoCard:
```typescript
<GrupoCard
  key={grupo.id}
  grupo={grupo}
  onEdit={() => handleEditGrupo(grupo)}
  onView={() => handleViewUsuarios(grupo)}
  onDelete={() => handleDeleteClick(grupo)}  // ✨ NUEVO
  canEdit={permisos.canEdit}
  canDelete={permisos.canDelete}              // ✨ NUEVO
  isUpdating={isUpdating}
  isDeleting={isDeleting}                     // ✨ NUEVO
/>
```

#### Modal de confirmación existente:
```typescript
<ConfirmDialog
  isOpen={deleteDialog.isOpen}
  title="Eliminar Grupo"
  message={`¿Estás seguro de que deseas eliminar el grupo "${deleteDialog.grupoNombre}"? Esta acción no se puede deshacer.`}
  type="danger"
  confirmText={MESSAGES.buttons.delete}
  cancelText={MESSAGES.buttons.cancel}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteDialog({ isOpen: false, grupoId: null, grupoNombre: null })}
  isLoading={isDeleting}
/>
```

## 🔄 Flujo de Eliminación

```
1. Usuario hace clic en botón de eliminar (🗑️) en GrupoCard
   ↓
2. Se activa handleDeleteClick(grupo)
   ↓
3. Se abre el modal de confirmación (ConfirmDialog)
   ↓
4. Usuario confirma la eliminación
   ↓
5. Se ejecuta handleConfirmDelete()
   ↓
6. Se llama a handleDeleteGrupo(id) del hook
   ↓
7. El servicio deleteGrupo() hace la petición DELETE a la API
   ↓
8. Se muestra notificación de éxito o error
   ↓
9. Se recarga la lista de grupos
   ↓
10. Se cierra el modal
```

## 🎨 Estilos y UX

### Botón de Eliminar
```css
- Posición: absolute top-3 right-3
- Color normal: text-gray-400
- Color hover: text-red-600 con bg-red-50
- Transición suave: duration-200
- Tamaño icono: 18px
- Padding: 8px (p-2)
- Border radius: rounded-lg
- z-index: 10 (encima del contenido de la tarjeta)
```

### Estados Visuales
- **Normal:** Icono gris sutil
- **Hover:** Icono rojo con fondo rojo claro
- **Loading:** Spinner animado
- **Disabled:** Opacidad 50%, cursor not-allowed

## 🔐 Permisos y Seguridad

### Control de Acceso
```typescript
// El botón solo se muestra si:
canDelete && onDelete
```

### Validaciones
1. **Frontend:** Verifica permisos antes de mostrar el botón
2. **Confirmación:** Requiere confirmación explícita del usuario
3. **Backend:** El servicio valida permisos en la API (401, 403)

### Manejo de Errores
```typescript
// Errores específicos del servicio:
- 404: Grupo no encontrado
- 409: Grupo ya eliminado
- 403: Sin permisos
- 401: Sesión expirada
- 500: Error del servidor
```

## 📊 Integración con Sistema Existente

### Servicio de Grupos
El botón utiliza el servicio existente en `grupos.service.ts`:

```typescript
export const deleteGrupo = async (id: string): Promise<IResponseGrupo>
```

**Características:**
- ✅ Validación de ID requerido
- ✅ Encoding de URL para seguridad
- ✅ Manejo de errores HTTP
- ✅ Logs detallados
- ✅ Soporte para mock data
- ✅ Timeout y reintentos configurables

### Hook Unificado
Se utiliza `useGestionGruposUnificado` que expone:

```typescript
{
  isDeleting: boolean,           // Estado de eliminación
  permisos: { canDelete: boolean },  // Permisos del usuario
  handleDeleteGrupo: (id: string) => Promise<void>  // Función de eliminación
}
```

## 🧪 Testing Sugerido

### Casos de Prueba
1. **Visualización del Botón**
   - ✓ Botón visible con permisos `canDelete`
   - ✓ Botón oculto sin permisos

2. **Funcionalidad**
   - ✓ Click abre modal de confirmación
   - ✓ Confirmación elimina el grupo
   - ✓ Cancelación cierra modal sin eliminar
   - ✓ Loading state durante eliminación

3. **Manejo de Errores**
   - ✓ Error 404: Grupo no encontrado
   - ✓ Error 403: Sin permisos
   - ✓ Error 500: Error del servidor
   - ✓ Timeout de red

4. **UX**
   - ✓ Hover effect funciona correctamente
   - ✓ Tooltip muestra información
   - ✓ No se activa click de la tarjeta al eliminar
   - ✓ Notificaciones de éxito/error

## 📝 Notas Técnicas

### Optimizaciones
- **React.memo:** El componente GrupoCard está memoizado para evitar re-renders innecesarios
- **stopPropagation:** Previene que el click en eliminar active el click de la tarjeta
- **z-index:** El botón está encima del contenido para evitar conflictos visuales

### Consideraciones
- La eliminación es **soft delete** (según el servicio)
- Se recarga toda la lista después de eliminar
- El modal de confirmación previene eliminaciones accidentales
- Los logs detallados facilitan el debugging

## 🚀 Próximos Pasos Sugeridos

1. **Testing Automatizado**
   - Unit tests para GrupoCard
   - Integration tests para el flujo completo
   - Tests de permisos

2. **Mejoras de UX**
   - Animación de salida al eliminar
   - Undo (deshacer) en notificación
   - Confirmación con doble click

3. **Analítica**
   - Tracking de eliminaciones
   - Métricas de uso del feature

## ✅ Checklist de Implementación

- [x] Botón de eliminar agregado a GrupoCard
- [x] Props `onDelete`, `isDeleting`, `canDelete` implementadas
- [x] Handler `handleDeleteClick` creado
- [x] Modal de confirmación conectado
- [x] Integración con `handleDeleteGrupo` del hook
- [x] Control de permisos implementado
- [x] Estados de loading manejados
- [x] Estilos y UX implementados
- [x] Optimizaciones de React.memo actualizadas
- [x] Errores de lint corregidos
- [x] Documentación creada

## 📚 Referencias

- **Servicio:** `src/services/grupos/grupos.service.ts`
- **Hook:** `src/components/private/components/gestion-grupos/hooks/useGestionGruposUnificado.ts`
- **Componente Card:** `src/components/private/components/gestion-grupos/components/shared/GrupoCard.tsx`
- **Componente Principal:** `src/components/private/components/gestion-grupos/GestionGrupos.tsx`
- **Modal:** `src/components/private/components/gestion-grupos/components/shared/ConfirmDialog.tsx`

---

**Fecha de implementación:** 15 de Octubre, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Completado
