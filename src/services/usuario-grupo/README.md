# Servicios de Usuario-Grupo

Servicios para gestión de usuarios dentro de grupos del sistema IPH.

## Estructura

```
src/services/usuario-grupo/
├── usuario-grupo.service.ts          # Servicios generales de usuario-grupo
├── eliminar-usuario-grupo.service.ts # Eliminación de usuario de grupo
├── index.ts                          # Barrel exports
└── README.md                         # Esta documentación
```

## Servicios Disponibles

### 1. eliminar-usuario-grupo.service.ts

Servicio para eliminar un usuario de un grupo específico.

**Endpoint:** `DELETE /api/usuario-grupo/eliminar-usuario-de-grupo/:id/:grupoId`

**Nota:** Utiliza dos parámetros de ruta: `:id` (usuario) y `:grupoId` (grupo).

#### Función principal

```typescript
import { eliminarUsuarioDeGrupo } from '@/services/usuario-grupo';

// Eliminar usuario de grupo
const resultado = await eliminarUsuarioDeGrupo({
  id: 'uuid-usuario',
  grupoId: 'uuid-grupo'
});

// Resultado:
// {
//   status: true,
//   message: "Usuario eliminado del grupo correctamente",
//   data: {
//     nombreUsuario: "Victor Javier Otero Vizcayno",
//     nombreGrupo: "Ejemplo 1"
//   }
// }
```

#### Utilidades disponibles

```typescript
import {
  validarParametrosEliminacion,
  formatearMensajeConfirmacion,
  esEliminacionExitosa
} from '@/services/usuario-grupo';

// Validar parámetros antes de eliminar
const validacion = validarParametrosEliminacion({
  id: 'uuid-usuario',
  grupoId: 'uuid-grupo'
});
// { valido: true }

// Formatear mensaje de confirmación
const mensaje = formatearMensajeConfirmacion(resultado);
// "Victor Javier Otero Vizcayno ha sido eliminado del grupo "Ejemplo 1" exitosamente."

// Verificar si la eliminación fue exitosa
const exitoso = esEliminacionExitosa(resultado);
// true
```

#### Configuración Mock/Real

```typescript
// En eliminar-usuario-grupo.service.ts
const USE_MOCK_DATA = false; // false = API real, true = datos mock
```

#### Respuesta del endpoint

```json
{
  "status": true,
  "message": "Usuario eliminado del grupo correctamente",
  "data": {
    "nombreUsuario": "Victor Javier Otero Vizcayno",
    "nombreGrupo": "Ejemplo 1"
  }
}
```

**Características del backend:**
- ✅ **Transaccional** con nivel READ COMMITTED
- ✅ **Validación previa** de existencia de usuario en grupo
- ✅ **NotFoundException** si usuario no existe en grupo
- ✅ Usa `preload` de TypeORM para actualizar entidad
- ✅ Retorna nombre completo del usuario y nombre del grupo
- ✅ Manejo robusto de errores con rollback automático

#### Manejo de errores

```typescript
try {
  const resultado = await eliminarUsuarioDeGrupo({
    id: 'uuid-usuario',
    grupoId: 'uuid-grupo'
  });

  console.log('✅ Usuario eliminado:', resultado.data.nombreUsuario);
} catch (error) {
  if (error.message.includes('no encontrado')) {
    console.error('❌ Usuario no existe en el grupo');
  } else {
    console.error('❌ Error en eliminación:', error);
  }
}
```

#### Códigos de error comunes

| Status | Descripción |
|--------|-------------|
| `404` | Usuario no encontrado en el grupo especificado |
| `400` | Parámetros inválidos (UUID mal formado) |
| `500` | Error interno del servidor |

### 2. usuario-grupo.service.ts

Servicios generales para gestión de usuarios en grupos.

**Funciones disponibles:**

```typescript
import {
  obtenerUsuariosPorGrupo,
  obtenerUsuariosGruposPorId,
  asignarUsuarioAGrupo,
  obtenerEstadisticasUsuarioGrupo,
  filtrarGruposUsuarios
} from '@/services/usuario-grupo';
```

## Interfaces

### IEliminarUsuarioGrupoParams

```typescript
interface IEliminarUsuarioGrupoParams {
  id: string;       // UUID del usuario
  grupoId: string;  // UUID del grupo
}
```

### IEliminarUsuarioGrupoResponse

```typescript
interface IEliminarUsuarioGrupoResponse {
  status: boolean;
  message: string;
  data: {
    nombreUsuario: string;  // Nombre completo del usuario
    nombreGrupo: string;    // Nombre del grupo
  };
}
```

### IEliminarUsuarioGrupoError

```typescript
interface IEliminarUsuarioGrupoError {
  status: false;
  message: string;
  error?: string;
}
```

## Patrón de Implementación

Todos los servicios siguen el patrón establecido en el proyecto:

1. **Configuración Mock/Real** - Flag `USE_MOCK_DATA` para alternar
2. **Logging estructurado** - Uso de `logInfo` y `logError`
3. **HttpHelper** - Peticiones HTTP con retry y timeout
4. **Validaciones** - Funciones de utilidad para validar UUIDs
5. **TypeScript completo** - Interfaces tipadas y JSDoc

## Ejemplo de Integración en Componente

```typescript
import { useState } from 'react';
import { eliminarUsuarioDeGrupo, validarParametrosEliminacion } from '@/services/usuario-grupo';
import { showSuccess, showError } from '@/helper/notification/notification.helper';

export const useEliminarUsuario = () => {
  const [loading, setLoading] = useState(false);

  const eliminar = async (usuarioId: string, grupoId: string) => {
    // Validar antes de eliminar
    const validacion = validarParametrosEliminacion({
      id: usuarioId,
      grupoId
    });

    if (!validacion.valido) {
      showError(validacion.error || 'Parámetros inválidos');
      return null;
    }

    setLoading(true);

    try {
      const resultado = await eliminarUsuarioDeGrupo({
        id: usuarioId,
        grupoId
      });

      showSuccess(
        `${resultado.data.nombreUsuario} eliminado del grupo "${resultado.data.nombreGrupo}"`
      );

      return resultado;
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Error al eliminar usuario del grupo'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { eliminar, loading };
};
```

## Ejemplo con Confirmación Modal

```typescript
import { eliminarUsuarioDeGrupo } from '@/services/usuario-grupo';
import { showSuccess, showError, showWarning } from '@/helper/notification/notification.helper';

const handleEliminarUsuario = async (
  usuarioId: string,
  grupoId: string,
  nombreUsuario: string,
  nombreGrupo: string
) => {
  // Mostrar confirmación
  const confirmar = window.confirm(
    `¿Estás seguro de eliminar a ${nombreUsuario} del grupo "${nombreGrupo}"?`
  );

  if (!confirmar) {
    showWarning('Operación cancelada');
    return;
  }

  try {
    const resultado = await eliminarUsuarioDeGrupo({
      id: usuarioId,
      grupoId
    });

    showSuccess(resultado.message);

    // Recargar lista de usuarios del grupo
    await recargarUsuarios(grupoId);
  } catch (error) {
    showError('Error al eliminar usuario del grupo');
    console.error(error);
  }
};
```

## Testing

Para activar datos mock durante desarrollo o testing:

```typescript
// En eliminar-usuario-grupo.service.ts
const USE_MOCK_DATA = true; // Activar mocks
```

El mock retorna:
```json
{
  "status": true,
  "message": "Usuario eliminado del grupo correctamente",
  "data": {
    "nombreUsuario": "Victor Javier Otero Vizcayno (MOCK)",
    "nombreGrupo": "Grupo de Ejemplo (MOCK)"
  }
}
```

## Validaciones Implementadas

### Validación de UUIDs

El servicio valida automáticamente:
- ✅ Presencia de `id` y `grupoId`
- ✅ Formato UUID v4 válido
- ✅ Longitud correcta (36 caracteres con guiones)

**Formato UUID esperado:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Validación de Respuesta

Utilidades para verificar respuesta del servidor:
```typescript
// Verificar si la operación fue exitosa
if (esEliminacionExitosa(resultado)) {
  console.log('✅ Eliminación confirmada');
}

// Obtener mensaje formateado
const mensaje = formatearMensajeConfirmacion(resultado);
```

## Notas Importantes

- ✅ **Autenticación automática**: HttpHelper incluye token automáticamente
- ✅ **Retry automático**: 3 intentos con backoff exponencial
- ✅ **Timeout**: 10 segundos por defecto
- ✅ **Logging**: Todas las operaciones se registran en consola
- ✅ **Validación UUID**: Parámetros validados antes de enviar al backend
- ✅ **Transaccional**: Backend garantiza atomicidad de operación
- ⚠️ **Irreversible**: La eliminación no se puede deshacer (implementar confirmación en UI)

## Códigos de Estado HTTP

| Código | Significado | Acción Recomendada |
|--------|-------------|-------------------|
| `200` | Éxito | Mostrar mensaje de confirmación |
| `400` | Parámetros inválidos | Validar UUIDs antes de enviar |
| `404` | Usuario no encontrado en grupo | Verificar que el usuario pertenece al grupo |
| `500` | Error del servidor | Reintentar o contactar soporte |

## Próximas Mejoras

- [ ] Agregar endpoint para eliminación en lote
- [ ] Implementar soft delete (marcar como inactivo en lugar de eliminar)
- [ ] Agregar logs de auditoría para eliminaciones
- [ ] Implementar confirmación con contraseña para operaciones críticas
