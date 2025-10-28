# Arquitectura del Módulo de Estadísticas

## 🎯 Visión General

El módulo de Estadísticas es un sistema de componentes jerárquicos que permite visualizar diferentes tipos de análisis estadísticos del sistema IPH a través de un panel principal con tarjetas interactivas.

---

## 📊 Jerarquía de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESTADISTICAS.TSX (Principal)                  │
│  Panel con grid de tarjetas de diferentes estadísticas          │
│                                                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Usuario │  │   JC    │  │ Delict. │  │  Mapas  │            │
│  │   IPH   │  │ Cívica  │  │  Prob.  │  │  Calor  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘            │
│       │            │             │                               │
│       │            │             │                               │
│       ▼            ▼             ▼                               │
│  ┌──────────────────────────────────────────────────┐           │
│  │         STATISTICS MODAL (Contenedor)            │           │
│  │  ┌───────────────────────────────────────────┐  │           │
│  │  │  Header con título e ícono                │  │           │
│  │  ├───────────────────────────────────────────┤  │           │
│  │  │  Filtros (opcional, según tipo)           │  │           │
│  │  ├───────────────────────────────────────────┤  │           │
│  │  │  Body (contenido dinámico):               │  │           │
│  │  │                                           │  │           │
│  │  │  ┌─────────────────────────────────┐     │  │           │
│  │  │  │  COMPONENTE HIJO (según ID):    │     │  │           │
│  │  │  │                                 │     │  │           │
│  │  │  │  • UsuariosIphStats            │     │  │           │
│  │  │  │  • EstadisticasJC              │     │  │           │
│  │  │  │  • EstadisticasProbableDelict  │     │  │           │
│  │  │  └─────────────────────────────────┘     │  │           │
│  │  ├───────────────────────────────────────────┤  │           │
│  │  │  Footer con botón cerrar                 │  │           │
│  │  └───────────────────────────────────────────┘  │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estructura de Archivos

```
statistics/
│
├── 📄 Estadisticas.tsx               # ⭐ COMPONENTE PRINCIPAL
│   └── Panel con tarjetas interactivas
│
├── 📄 EstadisticasJC.tsx             # 🔵 COMPONENTE HIJO
│   └── Estadísticas de Justicia Cívica
│
├── 📄 EstadisticasProbableDelictivo.tsx  # 🔵 COMPONENTE HIJO
│   └── Estadísticas de Probable Delictivo
│
├── 📄 README.md                      # Documentación componente principal
├── 📄 ARQUITECTURA.md                # Este archivo
│
├── 📁 styles/                        # Estilos CSS organizados
│   ├── Estadisticas.css             # Estilos del panel principal
│   └── EstadisticasJC.css           # Estilos compartidos JC y PD
│
├── 📁 components/                    # Componentes atómicos
│   ├── layout/                      # Componentes de layout
│   │   ├── EstadisticasHeader.tsx  # Header del panel principal
│   │   ├── EstadisticasGrid.tsx    # Grid de tarjetas
│   │   └── index.ts
│   │
│   ├── cards/                       # Componentes de tarjetas
│   │   ├── StatCard.tsx            # Tarjeta individual (panel)
│   │   ├── EstadisticaJCCard.tsx   # Tarjeta de JC (hijo)
│   │   ├── UsuarioCard.tsx
│   │   ├── GraficaCard.tsx
│   │   ├── GraficaSemanaCard.tsx
│   │   └── ResumenCard.tsx
│   │
│   ├── charts/                      # Componentes de gráficas
│   │   ├── GraficaBarrasJC.tsx     # Gráfica de barras
│   │   ├── GraficaPromedioJC.tsx   # Gráfica de promedio
│   │   └── GraficaUsuarios.tsx     # Gráfica de usuarios
│   │
│   ├── filters/                     # Componentes de filtros
│   │   ├── EstadisticasFilters.tsx # Filtros genéricos
│   │   └── FiltroFechaJC.tsx       # Filtro de fecha JC
│   │
│   ├── modals/                      # Componentes modales
│   │   ├── StatisticsModal.tsx     # ⭐ MODAL CONTENEDOR
│   │   └── StatisticsModal.css
│   │
│   ├── tables/                      # Componentes de tablas
│   │   └── UsuariosIphStats.tsx    # 🔵 COMPONENTE HIJO (tabla)
│   │
│   ├── shared/                      # Componentes compartidos
│   │   ├── Pagination.tsx
│   │   ├── RefreshButton.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── index.ts
│   │
│   └── examples/
│       └── content-examples.tsx
│
├── 📁 hooks/                         # Custom Hooks
│   ├── useEstadisticasJC.ts         # Lógica JC
│   ├── useEstadisticasProbableDelictivo.ts  # Lógica PD
│   ├── useEstadisticasUsuario.ts    # Lógica usuarios
│   ├── useStatisticsModal.ts        # Lógica modal
│   ├── useEstadisticasPermissions.ts # Control acceso
│   └── useScrollSticky.ts           # Scroll sticky
│
├── 📁 sections/                      # Secciones modulares (hijos)
│   ├── EstadisticasJCHeader.tsx     # Header JC
│   ├── EstadisticasJCGraficas.tsx   # Gráficas JC
│   ├── EstadisticasJCResumen.tsx    # Resumen JC
│   ├── EstadisticasJCFooter.tsx     # Footer JC
│   ├── ProbableDelictivoHeader.tsx  # Header PD
│   ├── ProbableDelictivoGraficas.tsx # Gráficas PD
│   ├── ProbableDelictivoResumen.tsx # Resumen PD
│   └── index.ts
│
├── 📁 config/                        # Configuraciones
│   ├── statisticsConfig.tsx         # ⚙️ Config de tarjetas
│   ├── constants.ts                 # Constantes
│   ├── colorsConfig.ts              # Paleta de colores
│   └── index.ts
│
├── 📁 services/                      # Servicios de API
│   ├── get-jc.service.ts            # Servicio JC
│   ├── probable-delictivo.service.ts # Servicio PD
│   ├── estadisticas-usuario-iph.service.ts
│   └── statistics.service.ts
│
└── 📁 utils/                         # Utilidades
    ├── calculosEstadisticos.ts      # Cálculos estadísticos
    ├── formatters.ts                # Formateadores
    └── index.ts
```

---

## 🔄 Flujo de Interacción

### 1. **Panel Principal (Estadisticas.tsx)**

```typescript
Usuario ve el panel
    ↓
Visualiza tarjetas de estadísticas
    ↓
Click en tarjeta específica
    ↓
Se ejecuta handleCardClick(stat)
    ↓
Se abre StatisticsModal con stat seleccionada
```

### 2. **Modal (StatisticsModal.tsx)**

```typescript
Modal recibe: { statistic, isOpen, onClose }
    ↓
Renderiza header con título e ícono
    ↓
Renderiza filtros (si aplica)
    ↓
Switch según statistic.id:
    ├─ 'usuarios-iph' → <UsuariosIphStats />
    ├─ 'justicia-civica' → <EstadisticasJC externalFilters={...} />
    └─ 'hecho-delictivo' → <EstadisticasProbableDelictivo externalFilters={...} />
    ↓
Renderiza footer con botón cerrar
```

### 3. **Componentes Hijos**

```typescript
// EstadisticasJC o EstadisticasProbableDelictivo
Recibe externalFilters (opcional)
    ↓
Si hay externalFilters:
    ├─ NO renderiza filtros internos
    ├─ NO renderiza header propio
    └─ Sincroniza fecha con filtros externos
    ↓
Si NO hay externalFilters:
    ├─ Renderiza header propio
    ├─ Renderiza filtros internos sticky
    └─ Maneja estado de fecha internamente
    ↓
Renderiza gráficas y resumen
```

---

## 🎨 Sistema de Estilos Compartidos

### **EstadisticasJC.css** - Estilos Compartidos

Este archivo CSS es compartido por:
- ✅ **EstadisticasJC.tsx**
- ✅ **EstadisticasProbableDelictivo.tsx**

**Clases CSS principales:**

```css
/* Contenedor */
.estadisticas-jc-container
.statistics-modal-body .estadisticas-jc-container

/* Header */
.estadisticas-jc-header
.header-title
.header-subtitle
.btn-refresh

/* Filtros con scroll sticky */
.estadisticas-jc-filtros
.estadisticas-jc-filtros.is-compact
.filtro-fecha-jc

/* Gráficas */
.estadisticas-jc-graficas
.graficas-grid
.grafica-card

/* Resumen */
.estadisticas-jc-resumen
.resumen-grid
.resumen-item

/* Footer */
.estadisticas-jc-footer

/* Estados */
.card-loading, .card-error, .card-empty
```

**Razón del compartir estilos:**
- Ambos componentes tienen la misma estructura visual
- Mismas clases CSS para consistencia
- DRY (Don't Repeat Yourself)
- Facilita mantenimiento centralizado

---

## 🧩 Componentes por Nivel

### **Nivel 1: Componente Principal**

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| **Estadisticas** | `Estadisticas.tsx` | Panel principal, orquestación de tarjetas |

### **Nivel 2: Componentes Contenedores**

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| **StatisticsModal** | `components/modals/StatisticsModal.tsx` | Modal que renderiza componentes hijos |

### **Nivel 3: Componentes Hijos (Renderizados en Modal)**

| Componente | Archivo | ID Tarjeta | Descripción |
|------------|---------|------------|-------------|
| **UsuariosIphStats** | `components/tables/UsuariosIphStats.tsx` | `usuarios-iph` | Tabla de usuarios y creación IPH |
| **EstadisticasJC** | `EstadisticasJC.tsx` | `justicia-civica` | Gráficas de Justicia Cívica |
| **EstadisticasProbableDelictivo** | `EstadisticasProbableDelictivo.tsx` | `hecho-delictivo` | Gráficas de Probable Delictivo |

### **Nivel 4: Componentes Atómicos (Reutilizables)**

| Tipo | Componentes |
|------|-------------|
| **Layout** | `EstadisticasHeader`, `EstadisticasGrid` |
| **Cards** | `StatCard`, `EstadisticaJCCard`, `UsuarioCard`, `GraficaCard` |
| **Charts** | `GraficaBarrasJC`, `GraficaPromedioJC`, `GraficaUsuarios` |
| **Filters** | `EstadisticasFilters`, `FiltroFechaJC` |
| **Shared** | `Pagination`, `RefreshButton`, `ErrorMessage` |

### **Nivel 5: Secciones (Modulares)**

| Sección | Usada en | Responsabilidad |
|---------|----------|-----------------|
| `EstadisticasJCHeader` | EstadisticasJC | Header con título y botón refresh |
| `EstadisticasJCGraficas` | EstadisticasJC | Renderiza gráficas diaria/mensual/anual |
| `EstadisticasJCResumen` | EstadisticasJC | Resumen con métricas |
| `EstadisticasJCFooter` | EstadisticasJC | Footer con info y timestamp |

---

## 🔧 Custom Hooks

| Hook | Responsabilidad |
|------|-----------------|
| **useEstadisticasJC** | Lógica de negocio para Justicia Cívica |
| **useEstadisticasProbableDelictivo** | Lógica de negocio para Probable Delictivo |
| **useEstadisticasUsuario** | Lógica de negocio para estadísticas de usuarios |
| **useStatisticsModal** | Manejo del modal (apertura/cierre) |
| **useEstadisticasPermissions** | Control de acceso por roles |
| **useScrollSticky** | Comportamiento sticky de filtros |

---

## 🎭 Patrones de Diseño Aplicados

### 1. **Atomic Design**
- **Átomos**: Botones, inputs, iconos
- **Moléculas**: Cards, filtros
- **Organismos**: Grids, modales
- **Templates**: Secciones modulares
- **Pages**: Estadisticas.tsx (principal)

### 2. **Compound Components**
```typescript
// Estadisticas usa componentes compuestos
<EstadisticasHeader />
<EstadisticasGrid />
<StatisticsModal />
```

### 3. **Container/Presentational**
- **Container**: `EstadisticasJC` con hook `useEstadisticasJC`
- **Presentational**: `EstadisticasJCGraficas`, `EstadisticasJCResumen`

### 4. **Render Props / Children Pattern**
```typescript
// Modal renderiza hijos dinámicamente según ID
{renderStatisticContent()}
```

### 5. **Custom Hooks Pattern**
- Separación de lógica de negocio de presentación
- Reutilización de lógica compleja

---

## 🚀 Optimizaciones Implementadas

### **Performance**
- ✅ Componentes memoizados (`React.memo`)
- ✅ Callbacks optimizados (`useCallback`)
- ✅ Cálculos memoizados (`useMemo`)
- ✅ CSS con `contain: layout style`
- ✅ Transiciones GPU (`transform`, `opacity`)
- ✅ Event listeners con `{ passive: true }`

### **Scroll Sticky Optimizado**
```typescript
// Sistema anti-loop en scroll sticky
if (scrollDiff > 60) {
  // Ignorar saltos causados por cambios de altura
  return;
}
```

### **Lazy Loading**
- Modal se renderiza solo cuando `isOpen === true`
- Componentes hijos se cargan bajo demanda

---

## 📝 Convenciones de Código

### **Nomenclatura**

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `EstadisticasJC` |
| Hooks | `use` + PascalCase | `useEstadisticasJC` |
| Servicios | camelCase + `.service.ts` | `get-jc.service.ts` |
| Estilos | kebab-case + `.css` | `estadisticas-jc.css` |
| Constantes | UPPER_SNAKE_CASE | `COMPACT_THRESHOLD` |

### **Props Interface**
```typescript
// Siempre documentar props
interface ComponentProps {
  /** Descripción del prop */
  propName: Type;
}
```

### **JSDoc Comments**
```typescript
/**
 * Descripción del componente
 * @pattern Patrón aplicado
 * @uses Dependencias clave
 * @version Versión actual
 */
```

---

## 🔐 Control de Acceso

| Rol | Panel Principal | Justicia Cívica | Probable Delictivo | Usuarios IPH |
|-----|----------------|-----------------|--------------------|--------------|
| **SuperAdmin** | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Superior** | ✅ | ✅ | ✅ | ✅ |
| **Elemento** | ❌ | ❌ | ❌ | ❌ |

---

## 🧪 Testing Strategy (Recomendado)

### **Nivel 1: Unit Tests**
```typescript
// Probar componentes atómicos aislados
test('StatCard renderiza correctamente', () => {
  // ...
});
```

### **Nivel 2: Integration Tests**
```typescript
// Probar interacción entre componentes
test('Click en tarjeta abre modal', () => {
  // ...
});
```

### **Nivel 3: E2E Tests**
```typescript
// Probar flujo completo de usuario
test('Usuario puede ver estadísticas de JC', () => {
  // ...
});
```

---

## 📚 Próximos Pasos

- [ ] Implementar lazy loading de componentes hijos
- [ ] Agregar tests unitarios
- [ ] Crear Storybook para componentes atómicos
- [ ] Implementar dark mode
- [ ] Agregar animaciones con Framer Motion
- [ ] Optimizar bundle size con code splitting

---

**Última actualización**: 2025-10-28
**Versión**: 1.0.0
**Mantenedor**: Senior Full-Stack Developer Expert
