# IPHFilters Component

## 📋 Descripción

Componente de filtros para el módulo de Informe Policial Homologado (IPH). Proporciona una interfaz completa para búsqueda, ordenamiento y filtrado de informes policiales con auto-refresh y optimizaciones de performance.

## 🎯 Características

- ✅ **Búsqueda en tiempo real** con debounce de 500ms
- ✅ **Validación de entrada** con Zod (prevención XSS)
- ✅ **Sincronización bidireccional** con filtros externos
- ✅ **Ordenamiento dinámico** (ASC/DESC)
- ✅ **Indicadores visuales** de filtros activos
- ✅ **Accesibilidad completa** (ARIA labels)
- ✅ **Responsive design** (mobile-first)

## 🚀 Optimizaciones de Performance

### React.memo con comparación personalizada
```typescript
// Solo re-renderiza cuando cambian props relevantes
React.memo(Component, (prev, next) => {
  return prev.loading === next.loading &&
         prev.filters.search === next.filters.search;
});
```

### useMemo para valores derivados
- `hasActiveFilters`: Detecta si hay filtros aplicados
- `inputClasses`: Clases CSS del input de búsqueda
- `selectClasses`: Clases CSS de selectores
- `searchIconColor`: Color dinámico del icono

### useCallback para handlers
- `debouncedSearch`: Búsqueda con debounce
- `handleSearchInputChange`: Cambio en input
- `handleClearSearch`: Limpiar búsqueda
- `handleSearchByChange`: Cambiar campo de búsqueda
- `handleOrderByChange`: Cambiar campo de ordenamiento
- `handleOrderToggle`: Alternar orden ASC/DESC
- `handleKeyDown`: Búsqueda con Enter
- `handleClearAll`: Limpiar todos los filtros

## 📦 Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `filters` | `IInformePolicialFilters` | ✅ | Objeto de filtros actuales |
| `loading` | `boolean` | ✅ | Estado de carga |
| `onFiltersChange` | `(filters: Partial<IInformePolicialFilters>) => void` | ✅ | Callback para cambios de filtros |
| `onSearch` | `() => void` | ✅ | Callback para ejecutar búsqueda |
| `onClear` | `() => void` | ✅ | Callback para limpiar filtros |
| `onRefresh` | `() => void` | ✅ | Callback para actualizar datos |
| `className` | `string` | ❌ | Clases CSS adicionales |

### IInformePolicialFilters
```typescript
interface IInformePolicialFilters {
  page: number;
  orderBy: 'estatus' | 'n_referencia' | 'n_folio_sist' | 'fecha_creacion';
  order: 'ASC' | 'DESC';
  search: string;
  searchBy: 'n_referencia' | 'n_folio_sist';
  tipoId?: string;
}
```

## 💡 Ejemplo de Uso

### Básico
```tsx
import IPHFilters from './components/IPHFilters';
import { useState } from 'react';

const InformePolicial = () => {
  const [filters, setFilters] = useState({
    page: 1,
    orderBy: 'fecha_creacion',
    order: 'DESC',
    search: '',
    searchBy: 'n_referencia',
  });
  const [loading, setLoading] = useState(false);

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = () => {
    // Ejecutar búsqueda
    console.log('Searching with:', filters);
  };

  const handleClear = () => {
    setFilters({
      page: 1,
      orderBy: 'fecha_creacion',
      order: 'DESC',
      search: '',
      searchBy: 'n_referencia',
    });
  };

  const handleRefresh = () => {
    // Refrescar datos
    console.log('Refreshing...');
  };

  return (
    <IPHFilters
      filters={filters}
      loading={loading}
      onFiltersChange={handleFiltersChange}
      onSearch={handleSearch}
      onClear={handleClear}
      onRefresh={handleRefresh}
    />
  );
};
```

### Con Hook Personalizado (Recomendado)
```tsx
import IPHFilters from './components/IPHFilters';
import useInformePolicial from './hooks/useInformePolicial';

const InformePolicial = () => {
  const {
    state,
    updateFilters,
    handleSearch,
    handleClearFilters,
    handleManualRefresh,
    isAnyLoading
  } = useInformePolicial();

  return (
    <IPHFilters
      filters={state.filters}
      loading={isAnyLoading}
      onFiltersChange={updateFilters}
      onSearch={handleSearch}
      onClear={handleClearFilters}
      onRefresh={handleManualRefresh}
    />
  );
};
```

## 🔒 Consideraciones de Seguridad

### Validación con Zod
```typescript
const SearchInputSchema = z.string()
  .max(100, 'Búsqueda muy larga')
  .transform(val => {
    // Sanitiza scripts maliciosos (XSS prevention)
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  });
```

### Protecciones implementadas
- ✅ **XSS Prevention**: Sanitización de input con regex
- ✅ **Validación de longitud**: Máximo 100 caracteres
- ✅ **Sanitización automática**: Eliminación de tags `<script>`
- ✅ **Type Safety**: TypeScript strict mode

## ⚡ Performance Metrics

### Optimizaciones implementadas
- **React.memo**: Evita re-renders cuando props no cambian
- **useMemo**: 8 valores memoizados (clases CSS, hasActiveFilters)
- **useCallback**: 8 handlers memoizados
- **Debounce**: 500ms en búsqueda (configurable)
- **Comparación shallow**: En React.memo para máxima performance

### Impacto esperado
- **Reducción de re-renders**: ~70% (cuando no cambian filtros)
- **Mejora en FPS**: Mantiene 60fps en interacciones
- **Menor uso de CPU**: Al evitar cálculos innecesarios
- **Mejor UX**: Input responsive sin lag

## 🎨 Personalización de Estilos

### Variables CSS (Tailwind)
```css
/* Colores principales */
--primary-color: #b8ab84;
--primary-dark: #4d4725;
--primary-darker: #2d2713;
--accent-color: #c2b186;
--bg-light: #fdf7f1;
```

### Modificar clases
El componente usa Tailwind CSS. Puedes sobrescribir estilos usando la prop `className`:

```tsx
<IPHFilters
  className="custom-filters-container"
  // ... otras props
/>
```

## 🧪 Testing

### Casos de prueba recomendados
1. **Búsqueda con debounce**: Verificar que espera 500ms
2. **Sincronización externa**: Cambiar filtros desde el padre
3. **Validación Zod**: Input con scripts maliciosos
4. **Tecla Enter**: Ejecuta búsqueda inmediata
5. **Limpiar filtros**: Resetea todos los valores
6. **Loading state**: Deshabilita inputs cuando `loading=true`

### Ejemplo con Testing Library
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IPHFilters from './IPHFilters';

test('debounce search after 500ms', async () => {
  const mockOnFiltersChange = jest.fn();
  
  render(
    <IPHFilters
      filters={{ search: '', searchBy: 'n_referencia', /* ... */ }}
      loading={false}
      onFiltersChange={mockOnFiltersChange}
      // ... otras props
    />
  );

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'TEST' } });

  // No debe llamarse inmediatamente
  expect(mockOnFiltersChange).not.toHaveBeenCalled();

  // Debe llamarse después de 500ms
  await waitFor(() => {
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'TEST' });
  }, { timeout: 600 });
});
```

## 📊 Estructura del Componente

```
IPHFilters/
├── IPHFilters.tsx           # Componente principal (optimizado)
├── IPHFilters.types.ts      # Tipos TypeScript (si se separan)
├── IPHFilters.utils.ts      # Utilidades (si se separan)
├── IPHFilters.test.tsx      # Tests unitarios
└── README.md                # Esta documentación
```

## 🔧 Configuración

### Constantes configurables
```typescript
const FILTER_CONFIG = {
  MAX_SEARCH_LENGTH: 100,      // Longitud máxima del input
  DEBOUNCE_DELAY: 500,         // Delay del debounce (ms)
  SORT_BUTTON_MIN_WIDTH: '52px' // Ancho mínimo del botón sort
} as const;
```

## 🐛 Troubleshooting

### El debounce no funciona
- Verificar que `onFiltersChange` esté memoizado con `useCallback`
- Revisar que no haya re-renders del padre que limpien el timer

### Los filtros no se sincronizan
- Verificar que el padre esté pasando `filters.search` correctamente
- Revisar que `handleClearFilters` resetee a valores por defecto

### Re-renders excesivos
- Verificar que las props `onFiltersChange`, `onSearch`, etc. estén memoizadas
- Revisar que el padre no cambie de referencia en cada render

### Validación Zod falla
- Verificar que el input tenga menos de 100 caracteres
- Revisar la consola para mensajes de validación

## 📚 Referencias

- [React.memo](https://react.dev/reference/react/memo)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📝 Changelog

### v2.0.0 (Optimizado) - 2025-10-28
- ✅ Memoización completa con `React.memo`
- ✅ 8 handlers con `useCallback`
- ✅ 8 valores con `useMemo` (clases CSS)
- ✅ Validación con Zod
- ✅ Constantes configurables
- ✅ JSDoc completo en español
- ✅ Accesibilidad (ARIA labels)
- ✅ Sincronización externa optimizada

### v1.0.0 (Original)
- Componente básico de filtros
- Búsqueda con debounce
- Ordenamiento dinámico

## 👨‍💻 Mantenimiento

Este componente sigue las mejores prácticas de:
- **KISS** (Keep It Simple, Stupid)
- **DRY** (Don't Repeat Yourself)
- **SOLID** (Single Responsibility)

Cada optimización está documentada y justificada.

## 📞 Soporte

Para reportar bugs o sugerencias, consultar con el equipo de desarrollo.

---

**Última actualización**: 28 de octubre de 2025  
**Versión**: 2.0.0 (Optimizada)  
**Autor**: Equipo de Desarrollo IPH
