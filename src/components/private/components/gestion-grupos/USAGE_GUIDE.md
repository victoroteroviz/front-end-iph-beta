# 🎯 Guía Rápida de Uso - Componentes Optimizados

## 📦 Importaciones Centralizadas

```typescript
// En lugar de importar colores y estilos inline:
// ❌ style={{ backgroundColor: '#4d4725' }}

// Usa:
// ✅ 
import { COLORS, COMMON_STYLES, MESSAGES } from './constants';
import { SearchInput, StatsCard, GrupoCard, ConfirmDialog } from './components/shared';
import { useDebounce } from './hooks/useDebounce';
```

---

## 🎨 Uso de Constantes de Tema

### Antes
```typescript
<div style={{ backgroundColor: '#4d4725', color: '#ffffff' }}>
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    Guardar
  </button>
</div>
```

### Después
```typescript
import { COLORS, COMMON_STYLES } from './constants';

<div style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
  <button 
    className={COMMON_STYLES.button.primary}
    style={{ backgroundColor: COLORS.primary }}
  >
    {MESSAGES.buttons.save}
  </button>
</div>
```

---

## 🔍 Búsqueda con Debounce

### Antes (sin optimización)
```typescript
// ❌ Se ejecuta en cada tecla presionada
const [search, setSearch] = useState('');

const filtered = useMemo(() => {
  return grupos.filter(g => 
    g.nombre.toLowerCase().includes(search.toLowerCase())
  );
}, [grupos, search]); // Se recalcula en cada letra

<input 
  value={search} 
  onChange={(e) => setSearch(e.target.value)} 
/>
```

### Después (con debounce)
```typescript
// ✅ Se ejecuta 300ms después de que el usuario deja de escribir
import { useDebounce } from './hooks/useDebounce';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const filtered = useMemo(() => {
  return grupos.filter(g => 
    g.nombre.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
}, [grupos, debouncedSearch]); // Se recalcula solo después del delay

<SearchInput 
  value={search} 
  onChange={setSearch}
  placeholder={MESSAGES.placeholders.searchGrupos}
/>
```

---

## 📊 Tarjetas de Estadísticas

### Antes
```typescript
// ❌ Código repetido para cada tarjeta
<div className="p-4 rounded-lg border" style={{ backgroundColor: '#f8f0e7' }}>
  <p className="text-sm font-medium" style={{ color: '#4d4725' }}>
    Total Grupos
  </p>
  <p className="text-2xl font-bold" style={{ color: '#4d4725' }}>
    {totalGrupos}
  </p>
</div>
```

### Después
```typescript
// ✅ Componente reutilizable
import { StatsCard } from './components/shared';

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatsCard
    label={MESSAGES.labels.totalGrupos}
    value={totalGrupos}
    valueColor="primary"
    isLoading={isLoading}
  />
  <StatsCard
    label={MESSAGES.labels.gruposActivos}
    value={gruposActivos}
    valueColor="success"
  />
  <StatsCard
    label={MESSAGES.labels.gruposInactivos}
    value={gruposInactivos}
    valueColor="error"
  />
</div>
```

---

## 🎴 Tarjetas de Grupos

### Antes
```typescript
// ❌ 50+ líneas de JSX duplicado
{grupos.map((grupo) => (
  <div 
    key={grupo.id} 
    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg"
  >
    <div className="flex items-center space-x-3">
      <div style={{ backgroundColor: '#4d472520' }}>
        <Users size={20} />
      </div>
      <div>
        <h3 style={{ color: '#4d4725' }}>{grupo.nombreGrupo}</h3>
        <p className="text-sm text-gray-500">{grupo.cantidadUsuarios} usuarios</p>
      </div>
    </div>
    {/* ... más JSX ... */}
  </div>
))}
```

### Después
```typescript
// ✅ Componente memoizado, 1 línea
import { GrupoCard } from './components/shared';

{grupos.map((grupo) => (
  <GrupoCard
    key={grupo.id}
    grupo={grupo}
    onEdit={handleEditGrupo}
    onView={handleViewGrupo}
    onClick={handleSelectGrupo}
    canEdit={permisos.canEdit}
    isUpdating={isUpdating}
  />
))}
```

---

## 💬 Confirmaciones

### Antes
```typescript
// ❌ Diálogo nativo del navegador
const handleDelete = async (id: string) => {
  if (!window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) {
    return;
  }
  
  await deleteGrupo(id);
};
```

### Después
```typescript
// ✅ Modal personalizado con mejor UX
import { ConfirmDialog } from './components/shared';

const [deleteDialog, setDeleteDialog] = useState({
  isOpen: false,
  grupoId: null
});

const handleDeleteClick = (grupo) => {
  setDeleteDialog({
    isOpen: true,
    grupoId: grupo.id
  });
};

const handleConfirmDelete = async () => {
  await deleteGrupo(deleteDialog.grupoId);
  setDeleteDialog({ isOpen: false, grupoId: null });
};

// En el JSX:
<ConfirmDialog
  isOpen={deleteDialog.isOpen}
  title={MESSAGES.confirmations.deleteGrupo}
  message={`¿Eliminar el grupo permanentemente? Esta acción no se puede deshacer.`}
  type="danger"
  confirmText={MESSAGES.buttons.delete}
  cancelText={MESSAGES.buttons.cancel}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteDialog({ isOpen: false, grupoId: null })}
  isLoading={isDeleting}
/>
```

---

## 🎯 Memoización de Componentes

### Cuándo usar React.memo

```typescript
// ✅ Usa React.memo cuando:
// 1. El componente se renderiza frecuentemente
// 2. El componente recibe las mismas props a menudo
// 3. El componente tiene render costoso

const GrupoCard = React.memo(({ grupo, onEdit }) => {
  return (
    <div>
      {/* Contenido del componente */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada (opcional)
  return prevProps.grupo.id === nextProps.grupo.id &&
         prevProps.grupo.cantidadUsuarios === nextProps.grupo.cantidadUsuarios;
});
```

### Cuándo NO usar React.memo

```typescript
// ❌ No uses React.memo si:
// 1. El componente siempre recibe props diferentes
// 2. El componente es muy simple
// 3. Las props cambian en cada render

// Ejemplo de componente simple que no necesita memo:
const SimpleButton = ({ onClick, label }) => (
  <button onClick={onClick}>{label}</button>
);
```

---

## 📈 Ejemplo Completo: Lista de Grupos Optimizada

```typescript
import React, { useState, useMemo } from 'react';
import { 
  COLORS, 
  COMMON_STYLES, 
  MESSAGES 
} from './constants';
import { 
  SearchInput, 
  StatsCard, 
  GrupoCard, 
  ConfirmDialog 
} from './components/shared';
import { useDebounce } from './hooks/useDebounce';
import { useGestionGrupos } from './hooks/useGestionGrupos';

export const GruposListOptimized: React.FC = () => {
  // Hook con lógica de negocio
  const {
    grupos,
    isLoading,
    isDeleting,
    permisos,
    handleDeleteGrupo,
  } = useGestionGrupos();

  // Estado local de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ 
    isOpen: false, 
    grupoId: null 
  });

  // Búsqueda optimizada con debounce
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Filtrado memoizado
  const filteredGrupos = useMemo(() => {
    if (!debouncedSearch) return grupos;
    
    return grupos.filter(g => 
      g.nombreGrupo.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [grupos, debouncedSearch]);

  // Estadísticas memoizadas
  const stats = useMemo(() => ({
    total: grupos.length,
    activos: grupos.filter(g => g.estatus).length,
    inactivos: grupos.filter(g => !g.estatus).length,
  }), [grupos]);

  // Handlers
  const handleEditGrupo = (grupo) => {
    console.log('Editar', grupo);
  };

  const handleViewGrupo = (grupo) => {
    console.log('Ver', grupo);
  };

  const handleDeleteClick = (grupo) => {
    setDeleteDialog({ isOpen: true, grupoId: grupo.id });
  };

  const handleConfirmDelete = async () => {
    await handleDeleteGrupo(deleteDialog.grupoId);
    setDeleteDialog({ isOpen: false, grupoId: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header con estadísticas */}
      <div className="mb-6">
        <h1 
          className="text-2xl font-bold mb-4" 
          style={{ color: COLORS.primary }}
        >
          {MESSAGES.titles.main}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label={MESSAGES.labels.totalGrupos}
            value={stats.total}
            valueColor="primary"
            isLoading={isLoading}
          />
          <StatsCard
            label={MESSAGES.labels.gruposActivos}
            value={stats.activos}
            valueColor="success"
            isLoading={isLoading}
          />
          <StatsCard
            label={MESSAGES.labels.gruposInactivos}
            value={stats.inactivos}
            valueColor="error"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={MESSAGES.placeholders.searchGrupos}
          isSearching={isLoading}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Lista de grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrupos.map((grupo) => (
          <GrupoCard
            key={grupo.id}
            grupo={grupo}
            onEdit={handleEditGrupo}
            onView={handleViewGrupo}
            onClick={handleDeleteClick}
            canEdit={permisos.canEdit}
            isUpdating={isDeleting}
          />
        ))}
      </div>

      {/* Modal de confirmación */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={MESSAGES.titles.deleteGrupo}
        message={MESSAGES.confirmations.deleteGrupoDetail}
        type="danger"
        confirmText={MESSAGES.buttons.delete}
        cancelText={MESSAGES.buttons.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, grupoId: null })}
        isLoading={isDeleting}
      />
    </div>
  );
};
```

---

## 🎓 Checklist de Optimización

Cuando agregues nuevos componentes, verifica:

- [ ] ✅ Usa `COLORS` y `COMMON_STYLES` en lugar de estilos inline
- [ ] ✅ Usa `MESSAGES` para todos los textos
- [ ] ✅ Aplica `useDebounce` en búsquedas/filtros
- [ ] ✅ Usa `React.memo` en componentes que se renderizan frecuentemente
- [ ] ✅ Usa `useMemo` para cálculos costosos
- [ ] ✅ Usa `useCallback` para funciones pasadas como props
- [ ] ✅ Extrae componentes repetidos a `components/shared`
- [ ] ✅ Documenta props con TypeScript interfaces

---

## 📚 Recursos

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Nota**: Estos patrones y componentes están diseñados para ser escalables y mantenibles. Úsalos como base para futuros desarrollos.
