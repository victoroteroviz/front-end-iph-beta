# Componente Estadísticas

## Descripción
Panel principal de estadísticas del sistema IPH que muestra un grid interactivo de tarjetas con diferentes tipos de análisis estadísticos disponibles.

## Estructura de Archivos

```
statistics/
├── Estadisticas.tsx              # Componente principal (orquestador)
├── README.md                     # Documentación
│
├── styles/                       # Estilos CSS
│   └── Estadisticas.css         # Estilos del componente principal
│
├── components/                   # Componentes atómicos
│   ├── layout/                  # Componentes de layout
│   │   ├── EstadisticasHeader.tsx   # Header con título y métricas
│   │   ├── EstadisticasGrid.tsx     # Grid de tarjetas
│   │   └── index.ts                 # Barrel export
│   │
│   ├── cards/                   # Componentes de tarjetas
│   │   ├── StatCard.tsx            # Tarjeta individual de estadística
│   │   ├── UsuarioCard.tsx         # (existente)
│   │   ├── GraficaCard.tsx         # (existente)
│   │   └── ResumenCard.tsx         # (existente)
│   │
│   ├── modals/                  # Componentes modales
│   │   ├── StatisticsModal.tsx     # Modal de estadísticas
│   │   └── StatisticsModal.css     # Estilos del modal
│   │
│   ├── filters/                 # Componentes de filtros
│   ├── charts/                  # Componentes de gráficas
│   ├── tables/                  # Componentes de tablas
│   └── shared/                  # Componentes compartidos
│
├── hooks/                       # Custom Hooks
│   ├── useStatisticsModal.ts       # Lógica del modal
│   └── useEstadisticasPermissions.ts # Control de acceso
│
├── config/                      # Configuraciones
│   ├── statisticsConfig.tsx        # Configuración de tarjetas
│   ├── constants.ts                # Constantes
│   └── index.ts                    # Barrel export
│
├── services/                    # Servicios de API
└── utils/                       # Utilidades
```

## Componente Principal: Estadisticas.tsx

### Responsabilidades
- Orquestación de componentes atómicos
- Manejo de estado global del panel
- Control de acceso por roles
- Gestión del modal de estadísticas

### Componentes Secundarios

#### 1. EstadisticasHeader
**Ubicación:** `components/layout/EstadisticasHeader.tsx`

**Responsabilidades:**
- Renderizar título del panel
- Mostrar métricas rápidas (habilitadas/próximamente)
- Diseño decorativo con gradientes

**Props:**
```typescript
{
  enabledCount: number;  // Número de estadísticas habilitadas
  totalCount: number;    // Número total de estadísticas
}
```

**Performance:**
- Memoizado con `React.memo`
- Solo re-renderiza si cambian los contadores

#### 2. EstadisticasGrid
**Ubicación:** `components/layout/EstadisticasGrid.tsx`

**Responsabilidades:**
- Renderizar grid responsivo de tarjetas
- Gestionar layout del grid
- Propagar eventos de click

**Props:**
```typescript
{
  statistics: IStatisticCard[];           // Array de estadísticas
  onCardClick: (stat: IStatisticCard) => void; // Handler de click
}
```

**Performance:**
- Memoizado con `React.memo`
- Solo re-renderiza si cambia el array o el handler

#### 3. StatCard
**Ubicación:** `components/cards/StatCard.tsx`

**Responsabilidades:**
- Renderizar tarjeta individual
- Manejar interactividad (hover, click, keyboard)
- Mostrar estado habilitado/deshabilitado
- Badge "Próximamente" para tarjetas deshabilitadas

**Props:**
```typescript
{
  stat: IStatisticCard;                   // Datos de la tarjeta
  onClick: (stat: IStatisticCard) => void; // Handler de click
}
```

**Features:**
- Accesibilidad completa (ARIA, keyboard navigation)
- Animaciones smooth con CSS
- Estados visuales claros
- Performance optimizada con callbacks memoizados

## Flujo de Datos

```
Estadisticas (principal)
    │
    ├─► useEstadisticasPermissions (hook)
    │   └─► Control de acceso por roles
    │
    ├─► useStatisticsModal (hook)
    │   └─► Lógica del modal
    │
    ├─► EstadisticasHeader
    │   └─► Muestra métricas (enabledCount, totalCount)
    │
    ├─► EstadisticasGrid
    │   └─► StatCard (x N tarjetas)
    │       └─► onClick → handleCardClick → abre modal
    │
    └─► StatisticsModal
        └─► Muestra contenido según tarjeta seleccionada
```

## Sistema de Estilos

### Ubicación
Los estilos están centralizados en `styles/Estadisticas.css`

### Clases CSS Principales

```css
/* Layout */
.estadisticas-content       /* Contenedor principal del grid */
.estadisticas-grid          /* Grid responsivo */

/* Tarjetas */
.stat-card                  /* Tarjeta base */
.stat-card.disabled         /* Tarjeta deshabilitada */
.stat-card-icon             /* Contenedor del icono */
.stat-card-content          /* Contenido de texto */
.stat-card-badge            /* Badge "Próximamente" */

/* Icono */
.stat-icon                  /* Icono SVG */
```

### Responsive Design

- **Desktop (>1024px)**: Grid de 3+ columnas, stats visibles
- **Tablet (769-1024px)**: Grid de 2 columnas
- **Mobile (<768px)**: Grid de 1 columna, animaciones reducidas

## Control de Acceso

### Roles Permitidos
- ✅ **SuperAdmin**: Acceso completo + exportación
- ✅ **Administrador**: Acceso completo + exportación
- ✅ **Superior**: Acceso completo (sin exportación)
- ❌ **Elemento**: SIN ACCESO (redirige a /inicio)

### Hook: useEstadisticasPermissions
```typescript
const { hasAccess, canView, canExport, isLoading } = useEstadisticasPermissions();
```

## Optimizaciones Implementadas

### Performance
1. **Componentes memoizados**: `EstadisticasHeader`, `EstadisticasGrid`, `StatCard`
2. **Callbacks optimizados**: `useCallback` en handlers
3. **Cálculos memoizados**: `useMemo` para métricas
4. **Animaciones GPU**: `transform` y `opacity`

### Accesibilidad
1. **ARIA labels**: `aria-label`, `aria-disabled`
2. **Keyboard navigation**: `tabIndex`, `onKeyDown`
3. **Roles semánticos**: `role="button"`
4. **Focus visible**: Outline claro en focus

### SEO y Semántica
1. **Breadcrumbs**: Navegación jerárquica
2. **Títulos descriptivos**: `<h1>`, `<h3>`
3. **Atributos data**: `data-component="estadisticas"`

## Ejemplo de Uso

```tsx
import Estadisticas from './components/private/components/statistics/Estadisticas';

// En Router
<Route path="estadisticas" element={<Estadisticas />} />
```

## Extensión del Sistema

### Agregar Nueva Tarjeta de Estadística

1. **Configurar en `config/statisticsConfig.tsx`:**
```typescript
{
  id: 'nueva-estadistica',
  titulo: 'Nueva Estadística',
  descripcion: 'Descripción de la nueva estadística',
  icono: <IconoSVG />,
  habilitado: true,
  color: '#COLOR_HEX',
  ruta: '/ruta-asociada'
}
```

2. **Agregar contenido en `StatisticsModal`:**
```tsx
// En StatisticsModal.tsx, agregar caso en switch
case 'nueva-estadistica':
  return <NuevoComponenteEstadistica />;
```

### Deshabilitar Tarjeta

Cambiar `habilitado: false` en `statisticsConfig.tsx`:
```typescript
{
  id: 'mi-estadistica',
  habilitado: false, // Se muestra badge "Próximamente"
  // ... resto de config
}
```

## Métricas de Código

- **Componente principal**: ~100 líneas (reducido de ~165)
- **Componentes atómicos**: 3 nuevos
- **Memoización**: 4 componentes memoizados
- **Hooks personalizados**: 2 (modal, permissions)
- **TypeScript**: 100% tipado estricto

## Próximas Mejoras

- [ ] Tests unitarios con React Testing Library
- [ ] Storybook para componentes atómicos
- [ ] Lazy loading del modal
- [ ] Animaciones con Framer Motion
- [ ] Dark mode support
- [ ] Drag & drop para reordenar tarjetas

## Changelog

### v2.2.0 (2025-10-28)
- ✅ Reorganización en componentes atómicos
- ✅ Estilos movidos a carpeta `styles/`
- ✅ Creados: `EstadisticasHeader`, `EstadisticasGrid`, `StatCard`
- ✅ Componente principal simplificado (~40% menos código)
- ✅ Performance optimizada con memoización
- ✅ Documentación completa

### v2.1.0
- Control de acceso por roles
- Hook `useEstadisticasPermissions`

### v2.0.0
- Atomic Design implementado
- Custom hooks
- StatisticsModal

---

**Última actualización**: 2025-10-28
**Versión**: 2.2.0
**Mantenedor**: Senior Full-Stack Developer Expert
