# Servicios de Usuarios

Servicios para gestión y consulta de usuarios del sistema IPH.

## Estructura

```
src/services/usuarios/
├── buscar-usuario-nombre.service.ts    # Búsqueda de usuarios por nombre
├── usuarios-estadisticas.service.ts    # Estadísticas de usuarios
├── index.ts                            # Barrel exports
└── README.md                           # Esta documentación
```

## Servicios Disponibles

### 1. buscar-usuario-nombre.service.ts

Servicio para búsqueda de usuarios por nombre, apellido o combinación.

**Endpoint:** `GET /api/users-web/buscar-usuario-nombre/:term`

**Nota:** El término de búsqueda se envía como **parámetro de ruta** (`:term`), no como query parameter. El servicio maneja automáticamente la codificación URL para términos con espacios.

#### Función principal

```typescript
import { buscarUsuariosPorNombre } from '@/services/usuarios';

// Búsqueda básica
const usuarios = await buscarUsuariosPorNombre({
  termino: 'Juan'
});

// usuarios: IUsuarioBusqueda[]
// [
//   {
//     id: "uuid",
//     primer_apellido: "García",
//     segundo_apellido: "López",
//     nombre: "Juan Carlos",
//     cuip: "CUIP123456",
//     cup: "CUP123456"
//   }
// ]
```

#### Utilidades disponibles

```typescript
import {
  validarParametrosBusqueda,
  sanitizarTerminoBusqueda,
  formatearNombreCompleto,
  obtenerIniciales
} from '@/services/usuarios';

// Validar parámetros antes de búsqueda
const validacion = validarParametrosBusqueda({ termino: 'Ju' });
// { valido: false, error: 'El término debe tener al menos 2 caracteres' }

// Sanitizar término de búsqueda
const terminoLimpio = sanitizarTerminoBusqueda('  Juan   Carlos  ');
// "Juan Carlos"

// Formatear nombre completo
const nombreCompleto = formatearNombreCompleto(usuario);
// "Juan Carlos García López"

// Obtener iniciales
const iniciales = obtenerIniciales(usuario);
// "JG"
```

#### Configuración Mock/Real

```typescript
// En buscar-usuario-nombre.service.ts
const USE_MOCK_DATA = false; // false = API real, true = datos mock
```

#### Respuesta del endpoint

```json
[
  {
    "id": "e2b3298e-2af0-468c-b0c6-39761cc9ebc6",
    "primer_apellido": "Alvarez",
    "segundo_apellido": "Lopez",
    "nombre": "Tomas",
    "cuip": "CUIP000000",
    "cup": "CUP000000"
  }
]
```

**Características del backend:**
- ✅ Solo usuarios activos (`is_active = true`)
- ✅ Búsqueda flexible en nombre completo y campos individuales
- ✅ Normalización automática (trim + lowercase)
- ✅ Ordenado por nombre y apellido (ASC)
- ✅ **Límite de 20 resultados** por búsqueda
- ✅ Búsqueda con patrón `LIKE '%term%'` (case-insensitive)

#### Manejo de errores

```typescript
try {
  const usuarios = await buscarUsuariosPorNombre({ termino: 'Juan' });
  console.log(`Encontrados ${usuarios.length} usuarios`);
} catch (error) {
  // Error lanzado por el servicio
  console.error('Error en búsqueda:', error);
}
```

### 2. usuarios-estadisticas.service.ts

Servicio para obtener estadísticas de rendimiento de usuarios.

**Funciones disponibles:**

```typescript
import {
  getEstadisticasUsuarios,
  getUsuarioMetricas,
  calcularEstadisticasFromUsers
} from '@/services/usuarios';

// Obtener estadísticas generales
const stats = await getEstadisticasUsuarios();

// Obtener métricas de un usuario específico
const metricas = await getUsuarioMetricas('user-id-123');

// Calcular estadísticas desde lista de usuarios (fallback)
const statsCalculadas = calcularEstadisticasFromUsers(usuarios);
```

## Interfaces

### IUsuarioBusqueda

```typescript
interface IUsuarioBusqueda {
  id: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombre: string;
  cuip: string;
  cup: string;
}
```

### IBuscarUsuarioNombreParams

```typescript
interface IBuscarUsuarioNombreParams {
  termino: string;
}
```

### IBuscarUsuarioNombreResponse

```typescript
type IBuscarUsuarioNombreResponse = IUsuarioBusqueda[];
```

## Patrón de Implementación

Todos los servicios siguen el patrón establecido en el proyecto:

1. **Configuración Mock/Real** - Flag `USE_MOCK_DATA` para alternar
2. **Logging estructurado** - Uso de `logInfo` y `logError`
3. **HttpHelper** - Peticiones HTTP con retry y timeout
4. **Validaciones** - Funciones de utilidad para validar datos
5. **TypeScript completo** - Interfaces tipadas y JSDoc

## Ejemplo de Integración en Componente

```typescript
import { useState, useCallback } from 'react';
import { buscarUsuariosPorNombre, validarParametrosBusqueda } from '@/services/usuarios';
import type { IUsuarioBusqueda } from '@/interfaces/user/crud';

export const useBuscarUsuarios = () => {
  const [usuarios, setUsuarios] = useState<IUsuarioBusqueda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = useCallback(async (termino: string) => {
    // Validar antes de buscar
    const validacion = validarParametrosBusqueda({ termino });
    if (!validacion.valido) {
      setError(validacion.error || 'Parámetros inválidos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await buscarUsuariosPorNombre({ termino });
      setUsuarios(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { usuarios, loading, error, buscar };
};
```

## Testing

Para activar datos mock durante desarrollo o testing:

```typescript
// En buscar-usuario-nombre.service.ts
const USE_MOCK_DATA = true; // Activar mocks
```

Los datos mock incluyen 5 usuarios de ejemplo con estructura idéntica al endpoint real.

## Notas Importantes

- ✅ **Autenticación automática**: HttpHelper incluye token automáticamente
- ✅ **Retry automático**: 3 intentos con backoff exponencial
- ✅ **Timeout**: 10 segundos por defecto
- ✅ **Logging**: Todas las operaciones se registran en consola
- ✅ **Validación**: Parámetros validados antes de enviar al backend
- ✅ **Sanitización**: Términos de búsqueda limpiados automáticamente

## Próximas Mejoras

- [ ] Agregar debouncing en hook de búsqueda
- [ ] Implementar caché de resultados recientes
- [ ] Agregar paginación si el backend lo soporta
- [ ] Filtros adicionales (por rol, por estado, etc.)
