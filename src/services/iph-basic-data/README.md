# Servicio de Datos Básicos de IPH

## 📋 Descripción

Servicio para obtener datos básicos de IPH (Informe Policial Homologado) desde el backend. Implementa operaciones de consulta con logging completo, manejo de errores robusto y soporte para datos mock durante el desarrollo.

## 🏗️ Arquitectura

```
src/
├── interfaces/iph-basic-data/
│   ├── iph-basic-data.interface.ts    # Interfaces TypeScript
│   └── index.ts                        # Barrel export
├── services/iph-basic-data/
│   ├── get-basic-iph-data.service.ts  # Servicio principal
│   ├── index.ts                        # Barrel export
│   └── README.md                       # Esta documentación
└── mock/iph-basic-data/
    ├── iph-basic-data.mock.ts         # 50 registros realistas
    └── index.ts                        # Barrel export
```

## 🎯 Funcionalidades

### ✅ `getBasicDataByIphId(id: string)`

Obtiene los datos básicos de un IPH específico por su UUID.

**Validaciones:**
- El IPH debe existir
- El IPH debe estar en estatus "Finalizado"
- El ID debe ser un UUID válido

**Ejemplo:**
```typescript
import { getBasicDataByIphId } from '@/services/iph-basic-data';

try {
  const basicData = await getBasicDataByIphId('123e4567-e89b-12d3-a456-426614174000');

  console.log('Número:', basicData.numero);
  console.log('Tipo:', basicData.tipoIph);
  console.log('Primer Respondiente:',
    `${basicData.primerRespondiente?.nombre} ${basicData.primerRespondiente?.apellidoPaterno}`
  );

} catch (error) {
  console.error('Error:', error.message);
  // Error: "El IPH con ID ... no está finalizado"
  // Error: "No se encontró el IPH con ID ..."
}
```

---

### ✅ `getAllIphs()`

Obtiene todos los IPHs del sistema sin paginación.

**Ejemplo:**
```typescript
import { getAllIphs } from '@/services/iph-basic-data';

try {
  const allIphs = await getAllIphs();

  console.log(`Total de IPHs: ${allIphs.length}`);

  allIphs.forEach(iph => {
    console.log(`${iph.numero} - ${iph.tipoIph} - ${iph.estatus}`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
```

---

### ✅ `getPaginatedIphs(query?: I_PaginationQuery)`

Obtiene IPHs con paginación, ordenamiento y filtros.

**Parámetros:**
```typescript
interface I_PaginationQuery {
  page?: number;                                         // Página (default: 1)
  orderBy?: 'fecha_creacion' | 'fecha_subida' | 'estatus' | 'tipo';  // Campo de orden (default: 'fecha_creacion')
  order?: 'ASC' | 'DESC';                               // Dirección (default: 'DESC')
  type?: string;                                         // Filtro por tipo de IPH
  search?: string;                                       // Término de búsqueda
  searchBy?: 'n_referencia' | 'n_folio_sist';          // Campo de búsqueda (default: 'n_referencia')
}
```

**Ejemplo:**
```typescript
import { getPaginatedIphs } from '@/services/iph-basic-data';

try {
  const result = await getPaginatedIphs({
    page: 1,
    orderBy: 'fecha_creacion',
    order: 'DESC',
    type: 'Accidente vehicular',
    search: 'REF-2024',
    searchBy: 'n_referencia'
  });

  console.log('IPHs en esta página:', result.data.length);
  console.log('Total de IPHs:', result.pagination.totalItems);
  console.log('Página actual:', result.pagination.currentPage);
  console.log('Total de páginas:', result.pagination.totalPages);
  console.log('¿Hay siguiente?', result.pagination.hasNextPage);

  result.data.forEach(iph => {
    console.log(`${iph.numero} - ${iph.tipoIph}`);
  });

} catch (error) {
  console.error('Error:', error.message);
}
```

---

### ✅ `getIphsByUserId(userId: string, query?: I_PaginationQuery)`

Obtiene los IPHs creados por un usuario específico (paginados).

**Ejemplo:**
```typescript
import { getIphsByUserId } from '@/services/iph-basic-data';

try {
  const userIphs = await getIphsByUserId(
    '123e4567-e89b-12d3-a456-426614174000',
    {
      page: 1,
      order: 'DESC'
    }
  );

  console.log(`IPHs del usuario: ${userIphs.pagination.totalItems}`);

  userIphs.data.forEach(iph => {
    console.log(`${iph.numero} - ${iph.fechaCreacion}`);
  });

} catch (error) {
  console.error('Error:', error.message);
  // Error: "No se encontró el usuario con ID ..."
}
```

---

## 🔧 Configuración

### Cambiar entre Mock y API Real

En el archivo `get-basic-iph-data.service.ts`:

```typescript
// Para desarrollo con datos mock
const USE_MOCK_DATA = true;

// Para producción con API real
const USE_MOCK_DATA = false;
```

### Configurar Timeout y Reintentos

```typescript
const http = HttpHelper.getInstance({
  baseURL: API_BASE_URL,
  timeout: 15000,      // 15 segundos
  retries: 3,          // 3 reintentos
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
});
```

---

## 📊 Interfaces TypeScript

### `I_BasicDataDto`

```typescript
interface I_BasicDataDto {
  id: string;
  tipoIph: string;
  delito: string;
  detenido?: string;
  horaDetencion?: string;
  horaPuestaDisposicion?: Date;
  numRND?: string;
  numero: string;
  ubicacion?: I_UbicacionDto;
  fechaCreacion: Date | string;
  tipoDelito: string;
  primerRespondiente?: I_UsuarioDto;
  estatus: string;
  evidencias: string[];
  observaciones: string;
}
```

### `I_UbicacionDto`

```typescript
interface I_UbicacionDto {
  calle?: string;
  colonia?: string;
  estado?: string;
  municipio?: string;
  ciudad?: string;
}
```

### `I_UsuarioDto`

```typescript
interface I_UsuarioDto {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}
```

---

## 📝 Logging

El servicio implementa logging en 4 niveles:

### **DEBUG** - Información de desarrollo
```typescript
logDebug('IphBasicDataService', 'getBasicDataByIphId - Iniciando consulta', { id });
```

### **VERBOSE** - Detalles de peticiones HTTP
```typescript
logVerbose('IphBasicDataService', 'Realizando petición HTTP', {
  method: 'GET',
  endpoint,
  params
});
```

### **INFO** - Operaciones exitosas
```typescript
logInfo('IphBasicDataService', 'Datos obtenidos exitosamente', {
  iphId: response.data.id,
  numero: response.data.numero,
  duration: `${response.duration}ms`
});
```

### **ERROR** - Errores y excepciones
```typescript
logError('IphBasicDataService', errorMessage, {
  function: 'getBasicDataByIphId',
  id,
  error,
  stack: (error as Error).stack
});
```

---

## 🚨 Manejo de Errores

El servicio proporciona mensajes de error específicos:

```typescript
// IPH no finalizado
throw new Error('El IPH con ID ... no está finalizado y no se pueden obtener sus datos básicos');

// IPH no encontrado
throw new Error('No se encontró el IPH con ID ...');

// Usuario no encontrado
throw new Error('No se encontró el usuario con ID ...');

// Respuesta vacía
throw new Error('Respuesta vacía del servidor');

// Datos incompletos
throw new Error('Datos incompletos recibidos del servidor');
```

---

## 🧪 Testing con Mocks

El servicio incluye **50 IPHs mock realistas** para desarrollo:

```typescript
// Habilitar mocks
const USE_MOCK_DATA = true;

// Los mocks incluyen:
// - 50 IPHs con datos realistas
// - 5 ubicaciones diferentes
// - 7 primer respondientes
// - Múltiples tipos de IPH y delitos
// - Fechas aleatorias en los últimos 90 días
// - Paginación funcional
// - Búsqueda y filtros operativos
```

---

## 🎯 Uso en Componentes React

### Con Custom Hook

```typescript
// hooks/useIphBasicData.ts
import { useState, useEffect } from 'react';
import { getBasicDataByIphId } from '@/services/iph-basic-data';
import type { I_BasicDataDto } from '@/interfaces/iph-basic-data';

export const useIphBasicData = (id: string) => {
  const [data, setData] = useState<I_BasicDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getBasicDataByIphId(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  return { data, loading, error };
};
```

### En Componente

```typescript
// components/IphDetail.tsx
import { useIphBasicData } from '@/hooks/useIphBasicData';

const IphDetail = ({ id }: { id: string }) => {
  const { data, loading, error } = useIphBasicData(id);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No se encontró el IPH</div>;

  return (
    <div>
      <h2>IPH: {data.numero}</h2>
      <p>Tipo: {data.tipoIph}</p>
      <p>Delito: {data.delito}</p>
      <p>Estatus: {data.estatus}</p>

      {data.ubicacion && (
        <div>
          <h3>Ubicación</h3>
          <p>{data.ubicacion.calle}</p>
          <p>{data.ubicacion.colonia}, {data.ubicacion.municipio}</p>
        </div>
      )}

      {data.primerRespondiente && (
        <div>
          <h3>Primer Respondiente</h3>
          <p>
            {data.primerRespondiente.nombre}{' '}
            {data.primerRespondiente.apellidoPaterno}{' '}
            {data.primerRespondiente.apellidoMaterno}
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 📚 Endpoints del Backend

```
Base URL: /api/iph-web

GET  /api/iph-web/getBasicDataByIph/:id    - Obtener datos básicos por ID
GET  /api/iph-web                          - Obtener todos los IPHs
GET  /api/iph-web/paginated                - Obtener IPHs paginados
GET  /api/iph-web/getIphsByUser/:id        - Obtener IPHs por usuario
```

---

## ✨ Características Implementadas

- ✅ **TypeScript completo** con interfaces tipadas
- ✅ **Logging en 4 niveles** (verbose, debug, info, error)
- ✅ **Manejo robusto de errores** con mensajes específicos
- ✅ **Sistema de reintentos** con backoff exponencial
- ✅ **Timeout configurable** (15 segundos por defecto)
- ✅ **Datos mock realistas** (50 IPHs)
- ✅ **Paginación completa** con metadata
- ✅ **Filtros y búsqueda** funcionales
- ✅ **Documentación JSDoc** completa
- ✅ **Patrón mock/real** fácil de alternar
- ✅ **Validaciones de entrada** y respuesta
- ✅ **Transformación automática** de fechas

---

## 🔄 Migración de Mock a API Real

Cuando el backend esté listo:

1. Cambiar `USE_MOCK_DATA = false` en el servicio
2. Verificar que `API_BASE_URL` esté configurada correctamente en `.env`
3. Probar cada endpoint individualmente
4. Verificar logs en consola para debugging

---

## 🤝 Contribuciones

Este servicio sigue los patrones establecidos del proyecto:

- ✅ SOLID, KISS, DRY
- ✅ Singleton para HttpHelper
- ✅ camelCase para variables
- ✅ PascalCase para interfaces
- ✅ kebab-case para carpetas
- ✅ SNAKE_CASE para constantes
