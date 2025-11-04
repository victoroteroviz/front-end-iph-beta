# usePaginationPersistence Hook

## 📋 Descripción

Hook personalizado reutilizable que proporciona **persistencia automática** del estado de paginación usando `sessionStorage`. Permite que los usuarios mantengan su posición en la paginación al:

- ✅ Navegar entre vistas y volver
- ✅ Abrir/cerrar modales o detalles
- ✅ Refrescar componentes
- ✅ Cambiar pestañas o secciones

## 🎯 Problema que Resuelve

**Antes:**
```typescript
// ❌ PROBLEMA: Paginación se reinicia a página 1
Usuario en página 5 → Click en "Ver detalle" → Modal abre → Modal cierra → Usuario vuelve a página 1
```

**Después:**
```typescript
// ✅ SOLUCIÓN: Paginación se mantiene
Usuario en página 5 → Click en "Ver detalle" → Modal abre → Modal cierra → Usuario sigue en página 5
```

## 🚀 Instalación y Uso

### Importación

```typescript
import { usePaginationPersistence } from '@/components/shared/components/pagination';
```

### Uso Básico

```typescript
const MyComponent = () => {
  const {
    currentPage,
    setCurrentPage,
    resetPagination,
    clearPersistence
  } = usePaginationPersistence({
    key: 'my-component-pagination',
    itemsPerPage: 10
  });

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  );
};
```

### Uso en Hook Personalizado

```typescript
export const useMyData = (params) => {
  // Hook compartido para persistencia
  const {
    currentPage,
    setCurrentPage,
    resetPagination
  } = usePaginationPersistence({
    key: 'my-data-pagination',
    itemsPerPage: params.itemsPerPage,
    logging: true // Habilitar en desarrollo
  });

  // Resto de la lógica del hook...
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData({ page: currentPage, limit: params.itemsPerPage });
  }, [currentPage, params.itemsPerPage]);

  return {
    data,
    currentPage,
    setCurrentPage,
    resetPagination
  };
};
```

## 📖 API

### Configuración (UsePaginationPersistenceConfig)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `key` | `string` | **requerido** | Clave única para identificar la paginación en sessionStorage |
| `itemsPerPage` | `number` | `10` | Número de items por página |
| `initialPage` | `number` | `1` | Página inicial si no hay nada guardado |
| `logging` | `boolean` | `false` | Habilitar logging detallado para debugging |
| `ttl` | `number` | `3600000` (1 hora) | Tiempo de vida de la paginación guardada en ms |

### Retorno (UsePaginationPersistenceReturn)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `currentPage` | `number` | Página actual (1-indexed) |
| `setCurrentPage` | `(page: number) => void` | Función para cambiar la página (persiste automáticamente) |
| `resetPagination` | `() => void` | Resetea la paginación a la página inicial |
| `clearPersistence` | `() => void` | Limpia completamente la persistencia de sessionStorage |
| `wasRestored` | `boolean` | Indica si la paginación fue restaurada desde sessionStorage |

## 💡 Ejemplos de Uso

### Ejemplo 1: Componente de Lista Simple

```typescript
const UsersList = () => {
  const { currentPage, setCurrentPage } = usePaginationPersistence({
    key: 'users-list-pagination',
    itemsPerPage: 20
  });

  const { data, totalPages } = useUsers({ page: currentPage, limit: 20 });

  return (
    <>
      <UserTable data={data} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
```

### Ejemplo 2: Con Filtros (Resetear al Cambiar Filtros)

```typescript
const ProductsList = () => {
  const [filters, setFilters] = useState({ category: '', search: '' });

  const {
    currentPage,
    setCurrentPage,
    resetPagination
  } = usePaginationPersistence({
    key: 'products-list-pagination',
    itemsPerPage: 15
  });

  // Resetear paginación cuando cambien los filtros
  useEffect(() => {
    resetPagination();
  }, [filters, resetPagination]);

  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />
      <ProductsGrid products={products} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};
```

### Ejemplo 3: Con Debugging Habilitado

```typescript
const DebugComponent = () => {
  const pagination = usePaginationPersistence({
    key: 'debug-pagination',
    itemsPerPage: 10,
    logging: true // ✅ Ver logs en consola
  });

  // Ver en consola:
  // - Cuándo se restaura la paginación
  // - Cuándo se guarda en sessionStorage
  // - Errores de validación
  // - TTL expirado

  return <div>...</div>;
};
```

### Ejemplo 4: Limpiar Todas las Paginaciones (Logout)

```typescript
import { clearAllPaginationPersistence } from '@/components/shared/components/pagination';

const LogoutButton = () => {
  const handleLogout = () => {
    // Limpiar todas las paginaciones persistidas
    clearAllPaginationPersistence();

    // Limpiar sesión
    sessionStorage.clear();

    // Redirect to login
    navigate('/login');
  };

  return <button onClick={handleLogout}>Cerrar Sesión</button>;
};
```

## 🔧 Características Técnicas

### Persistencia con sessionStorage

- ✅ **Automática**: Se guarda en cada cambio de página
- ✅ **Validación**: Verifica integridad de datos antes de restaurar
- ✅ **TTL**: Datos obsoletos se eliminan automáticamente (default: 1 hora)
- ✅ **Versionado**: Sistema de versiones para migraciones futuras

### Seguridad y Robustez

- ✅ **Type-safe**: 100% TypeScript con tipos estrictos
- ✅ **Error handling**: Try-catch en todas las operaciones de storage
- ✅ **Validación**: Validación de tipos en runtime
- ✅ **Fallback**: Si falla la restauración, usa página inicial

### Performance

- ✅ **Lazy initialization**: Solo lee storage en el primer render
- ✅ **Debounced writes**: No escribe en cada render innecesario
- ✅ **Memoization**: Callbacks memoizados con useCallback
- ✅ **Zero re-renders**: No causa re-renders innecesarios del padre

## 📊 Estructura de Datos en sessionStorage

```typescript
// Clave: "pagination:my-component-pagination"
{
  "page": 5,
  "limit": 10,
  "timestamp": 1706745600000,
  "version": 1
}
```

## 🎨 Integración con useHistorialIPH

Ejemplo real del proyecto:

```typescript
// src/components/private/components/historial-iph/hooks/useHistorialIPH.ts

export const useHistorialIPH = (params) => {
  // ✅ Hook compartido para persistencia
  const {
    currentPage,
    setCurrentPage: setPaginationPage,
    resetPagination: resetPaginationPersistence
  } = usePaginationPersistence({
    key: 'historial-iph-pagination',
    itemsPerPage: params.itemsPerPage,
    logging: false
  });

  // Metadata del backend (total, totalPages)
  const [paginacionMeta, setPaginacionMeta] = useState({
    total: 0,
    totalPages: 0
  });

  // Combinar paginación persistida con metadata del backend
  const paginacion = useMemo(() => ({
    page: currentPage,
    limit: params.itemsPerPage,
    total: paginacionMeta.total,
    totalPages: paginacionMeta.totalPages
  }), [currentPage, params.itemsPerPage, paginacionMeta]);

  // Al cambiar filtros, resetear paginación
  const setFiltros = useCallback((nuevosFiltros) => {
    setFiltrosState(prev => ({ ...prev, ...nuevosFiltros }));
    resetPaginationPersistence(); // ✅ Volver a página 1
  }, [resetPaginationPersistence]);

  // Al cambiar página, usa función del hook
  const setCurrentPage = useCallback((page) => {
    if (page < 1 || page > paginacion.totalPages) return;
    setPaginationPage(page); // ✅ Persiste automáticamente
  }, [paginacion.totalPages, setPaginationPage]);

  return {
    paginacion,
    setCurrentPage,
    setFiltros,
    // ...
  };
};
```

## 🐛 Debugging

### Habilitar Logging

```typescript
const pagination = usePaginationPersistence({
  key: 'my-pagination',
  itemsPerPage: 10,
  logging: true // ✅ Habilitar logs
});
```

### Ver datos en sessionStorage

```javascript
// En DevTools Console
sessionStorage.getItem('pagination:my-pagination')
// Output: {"page":5,"limit":10,"timestamp":1706745600000,"version":1}
```

### Limpiar manualmente

```javascript
// Limpiar una paginación específica
sessionStorage.removeItem('pagination:my-pagination');

// Limpiar todas las paginaciones
clearAllPaginationPersistence();
```

## ⚠️ Consideraciones

### Cuándo NO usar este hook

- ❌ Paginación del lado del cliente (arrays en memoria) - mejor usar `useState` simple
- ❌ Paginación que debe resetearse SIEMPRE (ej: wizards, formularios multi-paso)
- ❌ Datos que NO deben persistir entre sesiones

### Cuándo SÍ usar este hook

- ✅ Paginación del lado del servidor (API calls)
- ✅ Tablas grandes con muchos datos
- ✅ Vistas donde el usuario puede navegar y volver
- ✅ Componentes con modales/detalles que se abren y cierran

## 🔄 Versionamiento

**v1.0.0** (2025-01-31)
- ✅ Versión inicial
- ✅ Persistencia con sessionStorage
- ✅ Validación y TTL
- ✅ Logging opcional
- ✅ TypeScript completo

## 📝 Licencia

Parte del proyecto IPH Frontend - Uso interno

---

**¿Preguntas o sugerencias?** Contacta al equipo de desarrollo.
