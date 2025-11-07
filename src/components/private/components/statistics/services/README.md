# 📊 Servicios de Estadísticas - Documentación

## 📦 Contenido

Este directorio contiene los servicios frontend que se comunican con los endpoints de estadísticas del backend.

### ✅ Servicios Implementados

| Servicio | Endpoint Backend | Versión | Estado |
|----------|------------------|---------|--------|
| **estadisticas-rango.service.ts** | `/estadisticas/getRangoIphPorFechaUsuario` | 1.0.0 | ✅ Producción |
| statistics.service.ts | `/estadisticas/*` | - | ✅ Producción |
| estadisticas-usuario-iph.service.ts | `/estadisticas/usuario/*` | - | ✅ Producción |
| get-jc.service.ts | `/estadisticas/jc/*` | - | ✅ Producción |
| probable-delictivo.service.ts | `/estadisticas/delictivo/*` | - | ✅ Producción |

---

## 📄 estadisticas-rango.service.ts

### **Descripción**

Servicio para consultar el listado paginado de IPH filtrado por rango de fechas y usuario.

**Endpoint Backend:** `GET /estadisticas/getRangoIphPorFechaUsuario`

### **Características**

- ✅ **Validación Zod** de response para type safety en runtime
- ✅ **Cache agresivo** (30s) solo para queries sin búsqueda
- ✅ **Construcción manual** de query params complejos
- ✅ **Logging estructurado** (HTTP + Info + Error)
- ✅ **Manejo de errores robusto** (throw silencioso)
- ✅ **Conversión automática** de fechas a ISO string
- ✅ **TypeScript strict mode**
- ✅ **JSDoc completo** en todas las funciones

### **Instalación**

```typescript
import {
  getRangoIphPorUsuario,
  OrdenarEnum,
  type QueryRangoPorUsuarioParams,
  type RangoIphPorUsuarioResponse
} from '@/components/private/components/statistics/services/estadisticas-rango.service';
```

### **API del Servicio**

#### **Función Principal**

```typescript
async function getRangoIphPorUsuario(
  params: QueryRangoPorUsuarioParams = {}
): Promise<RangoIphPorUsuarioResponse>
```

#### **Parámetros (QueryRangoPorUsuarioParams)**

| Parámetro | Tipo | Opcional | Default | Descripción |
|-----------|------|----------|---------|-------------|
| `limite` | `number` | ✅ | `10` | Registros por página (1-100) |
| `pagina` | `number` | ✅ | `1` | Número de página (mínimo 1) |
| `ordenarPor` | `OrdenarEnum` | ✅ | `ASC` | Orden de resultados (ASC/DESC) |
| `buscarPor` | `string` | ✅ | - | Campo por el cual buscar (uuid, nombre) |
| `terminoBusqueda` | `string` | ✅ | - | Término de búsqueda |
| `fechaInicio` | `Date` | ✅ | - | Fecha de inicio del rango |
| `fechaFin` | `Date` | ✅ | - | Fecha de fin del rango |

#### **Respuesta (RangoIphPorUsuarioResponse)**

```typescript
{
  data: RangoIphItem[];        // Array de IPH
  meta: {
    total: number;              // Total de registros
    pagina: number;             // Página actual
    limite: number;             // Límite por página
    totalPaginas: number;       // Total de páginas
    ordenarPor: OrdenarEnum;    // Orden aplicado
  }
}
```

#### **Estructura de RangoIphItem**

```typescript
{
  id: string;                   // UUID del IPH
  fechaCreacion: string | null; // ISO string de fecha
  usuario: {
    id: string;                 // UUID del usuario
    nombre: string | null;
    primerApellido: string | null;
    segundoApellido: string | null;
  } | null;
}
```

---

## 🎯 Ejemplos de Uso

### **Ejemplo 1: Listado Básico**

```typescript
import { getRangoIphPorUsuario } from './estadisticas-rango.service';
import { showError } from '@/helper/notification/notification.helper';

async function loadIphList() {
  try {
    const response = await getRangoIphPorUsuario({
      limite: 10,
      pagina: 1
    });

    console.log(`Total de IPH: ${response.meta.total}`);
    console.log(`Mostrando página ${response.meta.pagina} de ${response.meta.totalPaginas}`);

    response.data.forEach(iph => {
      const nombreCompleto = [
        iph.usuario?.nombre,
        iph.usuario?.primerApellido,
        iph.usuario?.segundoApellido
      ].filter(Boolean).join(' ');

      console.log(`IPH ${iph.id} - Usuario: ${nombreCompleto || 'N/D'}`);
    });

  } catch (error) {
    // El servicio hace throw del error sin notificación
    // El componente decide si mostrar notificación
    showError('Error al cargar el listado de IPH');
    console.error('Error:', error);
  }
}
```

### **Ejemplo 2: Búsqueda por Usuario con Fechas**

```typescript
import { getRangoIphPorUsuario, OrdenarEnum } from './estadisticas-rango.service';

async function searchUserIph() {
  const response = await getRangoIphPorUsuario({
    limite: 20,
    pagina: 1,
    ordenarPor: OrdenarEnum.DESC, // Más recientes primero
    buscarPor: 'nombre',
    terminoBusqueda: 'Juan',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-01-31')
  });

  console.log(`Encontrados ${response.meta.total} IPH de usuarios llamados Juan en enero 2025`);

  return response.data;
}
```

### **Ejemplo 3: Paginación Completa**

```typescript
async function getAllIphData() {
  // Obtener primera página
  const firstPage = await getRangoIphPorUsuario({
    limite: 50,
    pagina: 1,
    ordenarPor: OrdenarEnum.ASC
  });

  const totalPages = firstPage.meta.totalPaginas;
  const allData = [...firstPage.data];

  console.log(`Total de ${firstPage.meta.total} registros en ${totalPages} páginas`);

  // Obtener páginas restantes
  for (let page = 2; page <= totalPages; page++) {
    console.log(`Cargando página ${page}/${totalPages}...`);

    const pageData = await getRangoIphPorUsuario({
      limite: 50,
      pagina: page,
      ordenarPor: OrdenarEnum.ASC
    });

    allData.push(...pageData.data);
  }

  console.log(`Total cargado: ${allData.length} registros`);
  return allData;
}
```

### **Ejemplo 4: Con Custom Hook en React**

```typescript
import { useState, useEffect } from 'react';
import { getRangoIphPorUsuario, type QueryRangoPorUsuarioParams } from './estadisticas-rango.service';
import { showError } from '@/helper/notification/notification.helper';

function useRangoIph(params: QueryRangoPorUsuarioParams) {
  const [data, setData] = useState<RangoIphItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getRangoIphPorUsuario(params);
        setData(response.data);
        setTotal(response.meta.total);
      } catch (error) {
        showError('Error al cargar datos de IPH');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.pagina, params.limite, params.terminoBusqueda]);

  return { data, loading, total };
}

// Uso en componente
function IphListComponent() {
  const [pagina, setPagina] = useState(1);
  const { data, loading, total } = useRangoIph({ limite: 10, pagina });

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>Total de IPH: {total}</h2>
      <ul>
        {data.map(iph => (
          <li key={iph.id}>{iph.id}</li>
        ))}
      </ul>
      <button onClick={() => setPagina(p => p + 1)}>Siguiente Página</button>
    </div>
  );
}
```

---

## 🔧 Configuración Interna

### **Cache Strategy**

El servicio implementa **cache agresivo con estrategia selectiva:**

| Condición | ¿Se cachea? | TTL | Razón |
|-----------|-------------|-----|-------|
| Listado general (sin búsqueda) | ✅ SÍ | 30s | Datos estables, poco cambio |
| Con búsqueda activa (`terminoBusqueda`) | ❌ NO | - | Usuario espera datos actualizados |

**Cache Key Format:**
```
rango-iph:limite=10:ordenarPor=ASC:pagina=1:fechaInicio=2025-01-01T00:00:00.000Z
```

**Performance:**
- Cache L1 hit: ~0.5-1ms (memoria)
- Cache L2 hit: ~5-10ms (localStorage)
- Backend request: ~100-300ms (depende de DB)

### **Logging**

El servicio implementa **logging estructurado en múltiples niveles:**

```typescript
// 1. Inicio de operación
logInfo('EstadisticasRangoService', 'Iniciando consulta', { parametros, transformados });

// 2. HTTP request/response
logHttp('GET', '/estadisticas/getRangoIphPorFechaUsuario', 200, 150, { total: 42 });

// 3. Eventos importantes
logInfo('EstadisticasRangoService', 'Datos obtenidos desde cache', { cacheKey, total });

// 4. Errores
logError('EstadisticasRangoService', error, 'Error HTTP en petición');
```

### **Validación Zod**

Todos los datos de respuesta son validados en runtime:

```typescript
// ✅ Validación automática
const validatedData = RangoIphPorUsuarioResponseSchema.parse(response.data);

// ❌ Si la validación falla, se lanza ZodError con detalles
// El servicio convierte ZodError en mensaje user-friendly
```

### **Manejo de Errores**

El servicio es **silencioso** (no muestra notificaciones), delegando esa responsabilidad al componente:

```typescript
try {
  const data = await getRangoIphPorUsuario(params);
  // Éxito
} catch (error) {
  // El servicio hace throw del error original
  // El componente decide cómo manejarlo:
  // - Mostrar notificación
  // - Mostrar mensaje inline
  // - Loggear para debugging
  // - Reintentar
}
```

**Tipos de errores que puede lanzar:**
1. `Error` - Validación de parámetros frontend
2. `HttpError` - Error del backend (status >= 400)
3. `Error` (con mensaje user-friendly) - Validación Zod falló

---

## 📈 Performance y Optimizaciones

### **1. Cache Two-Level**

```typescript
// L1: Memoria (Map) - Ultra rápido
const l1Hit = CacheHelper.get(key, false);

// L2: localStorage - Persistente entre recargas
// Automático si L1 miss
```

**Beneficios:**
- 90-95% más rápido para consultas repetidas
- Reduce carga en backend
- Mejora UX (respuesta instantánea)

### **2. Validación Frontend**

```typescript
// Validar antes de enviar al backend
if (limite < 1 || limite > 100) {
  throw new Error('El límite debe estar entre 1 y 100');
}
```

**Beneficios:**
- Previene requests inválidos
- Ahorra ancho de banda
- Feedback instantáneo al usuario

### **3. Construcción Eficiente de URLs**

```typescript
// Usando URLSearchParams para encoding correcto
const searchParams = new URLSearchParams();
validParams.forEach(([key, value]) => {
  searchParams.append(key, String(value));
});
```

**Beneficios:**
- Encoding automático de caracteres especiales
- Compatibilidad cross-browser
- Previene errores de formato

---

## 🧪 Testing Sugerido

### **Unit Tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getRangoIphPorUsuario, OrdenarEnum } from './estadisticas-rango.service';

describe('estadisticas-rango.service', () => {
  it('debe validar parámetros inválidos', async () => {
    await expect(
      getRangoIphPorUsuario({ limite: 101 })
    ).rejects.toThrow('El límite debe estar entre 1 y 100');
  });

  it('debe transformar fechas a ISO string', async () => {
    const mockHttpHelper = vi.spyOn(httpHelper, 'get').mockResolvedValue({
      data: mockResponse,
      status: 200
    });

    await getRangoIphPorUsuario({
      fechaInicio: new Date('2025-01-01')
    });

    expect(mockHttpHelper).toHaveBeenCalledWith(
      expect.stringContaining('fechaInicio=2025-01-01T00:00:00.000Z'),
      expect.any(Object)
    );
  });

  it('debe usar cache para listados generales', async () => {
    const mockCache = vi.spyOn(CacheHelper, 'get');

    await getRangoIphPorUsuario({ limite: 10, pagina: 1 });

    expect(mockCache).toHaveBeenCalled();
  });

  it('NO debe usar cache para búsquedas', async () => {
    const mockCache = vi.spyOn(CacheHelper, 'get');

    await getRangoIphPorUsuario({
      terminoBusqueda: 'Juan'
    });

    // Cache no se llama porque hay búsqueda activa
    expect(mockCache).not.toHaveBeenCalled();
  });
});
```

### **Integration Tests**

```typescript
describe('estadisticas-rango.service - Integration', () => {
  it('debe obtener datos del backend real', async () => {
    const response = await getRangoIphPorUsuario({
      limite: 5,
      pagina: 1
    });

    expect(response.data).toBeInstanceOf(Array);
    expect(response.meta.total).toBeGreaterThanOrEqual(0);
    expect(response.meta.pagina).toBe(1);
    expect(response.meta.limite).toBe(5);
  });
});
```

---

## 🔒 Seguridad

### **1. Sanitización de Logs**

```typescript
// URLs con tokens son sanitizadas antes de loggear
fullUrl: fullUrl.replace(/token=[^&]*/g, 'token=***')
```

### **2. Validación de Entrada**

```typescript
// Parámetros validados en frontend antes de enviar
if (pagina < 1) {
  throw new Error('La página debe ser al menos 1');
}
```

### **3. Autenticación**

```typescript
// Token incluido automáticamente por httpHelper
await httpHelper.get(fullUrl, {
  includeAuth: true // ← Token desde sessionStorage
});
```

---

## 📝 Mantenimiento

### **Cuando actualizar el servicio:**

1. **Backend cambia estructura de respuesta**
   - Actualizar interfaces TypeScript
   - Actualizar schemas Zod
   - Ejecutar tests

2. **Backend agrega nuevos filtros**
   - Agregar parámetros a `QueryRangoPorUsuarioParams`
   - Actualizar función `transformParams()`
   - Documentar en README

3. **Cambios en performance**
   - Ajustar `CACHE_TTL` si es necesario
   - Revisar estrategia de `shouldCache()`

---

## 🐛 Troubleshooting

### **Problema: "La respuesta del servidor no cumple con el formato esperado"**

**Causa:** La respuesta del backend no pasa la validación Zod.

**Solución:**
1. Verificar que el backend esté retornando la estructura correcta
2. Revisar los schemas Zod en el servicio
3. Comprobar logs en consola para ver el detalle del error

```typescript
// Ver detalles del error de validación
import { z } from 'zod';

try {
  await getRangoIphPorUsuario(params);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Detalles de validación:', error.issues);
  }
}
```

### **Problema: Cache no se actualiza**

**Causa:** Los datos están cacheados y el TTL no ha expirado.

**Solución:**
```typescript
// Limpiar cache manualmente
import CacheHelper from '@/helper/cache/cache.helper';

CacheHelper.clear(false, 'estadisticas');

// Luego volver a consultar
await getRangoIphPorUsuario(params);
```

### **Problema: Búsquedas muy lentas**

**Causa:** Las búsquedas no usan cache (por diseño).

**Solución:**
- Si las búsquedas son lentas, el problema está en el backend
- Considerar agregar índices en la DB
- Optimizar queries SQL en el backend

---

## 📚 Referencias

- [HTTP Helper Documentation](../../../../../helper/http/http.helper.ts)
- [Logger Helper Documentation](../../../../../helper/log/logger.helper.ts)
- [Cache Helper Documentation](../../../../../helper/cache/cache.helper.ts)
- [Zod Documentation](https://zod.dev/)

---

**Última actualización:** 2025-01-31
**Versión:** 1.0.0
**Autor:** Sistema IPH
