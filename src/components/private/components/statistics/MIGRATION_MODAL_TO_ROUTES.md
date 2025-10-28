# Migración: Modal → Navegación con Rutas

## 📋 Resumen de Cambios

Se migró el sistema de estadísticas de **modal dinámico** a **navegación con rutas y breadcrumbs**, mejorando significativamente la experiencia de usuario y la navegabilidad del sistema.

---

## 🎯 Motivación del Cambio

### **Antes (Modal):**
```
Estadisticas.tsx (Panel)
    │
    ├─► Click en tarjeta
    │       ↓
    └─► StatisticsModal (Overlay)
            └─► Renderiza componente hijo dinámicamente
```

**Problemas:**
- ❌ URL no cambia (imposible compartir enlace)
- ❌ No hay historial de navegación (back/forward)
- ❌ Sidebar se oculta o se mantiene detrás del modal
- ❌ Breadcrumbs no reflejan contexto real
- ❌ Pérdida de contexto al refrescar la página
- ❌ SEO pobre (contenido oculto en modal)

### **Después (Navegación):**
```
Estadisticas.tsx (Panel)
    │
    ├─► Click en tarjeta
    │       ↓
    └─► navigate('/estadisticasusuario/justicia-civica')
            ↓
        JusticiaCivicaView (Vista completa)
            ├─► Breadcrumbs jerárquicos
            ├─► Sidebar visible y activo
            └─► EstadisticasJC (componente hijo)
```

**Beneficios:**
- ✅ URL única y compartible
- ✅ Historial de navegación funcional
- ✅ Sidebar siempre visible y contextualizado
- ✅ Breadcrumbs reflejan jerarquía real
- ✅ Persistencia al refrescar
- ✅ Mejor SEO y accesibilidad

---

## 🔄 Cambios Realizados

### **1. Nuevas Rutas en `app-routes.config.tsx`**

Se agregaron 3 rutas hijas para estadísticas:

```typescript
{
  id: 'estadisticasUsuariosIph',
  path: 'estadisticasusuario/usuarios-iph',
  component: UsuariosIphView,
  requiredRoles: ['SuperAdmin', 'Administrador', 'Superior'],
  title: 'Usuarios y Creación de IPH',
  showInSidebar: false  // No aparecen en sidebar
},
{
  id: 'estadisticasJusticiaCivica',
  path: 'estadisticasusuario/justicia-civica',
  component: JusticiaCivicaView,
  ...
},
{
  id: 'estadisticasProbableDelictivo',
  path: 'estadisticasusuario/probable-delictivo',
  component: ProbableDelictivoView,
  ...
}
```

**Características:**
- Rutas anidadas bajo `/estadisticasusuario/`
- Lazy loading automático con `React.lazy()`
- Protegidas con roles (`PrivateRoute`)
- No aparecen en sidebar (solo en breadcrumbs)

---

### **2. Componentes Wrapper con Breadcrumbs**

Se crearon 3 componentes wrapper en `statistics/views/`:

#### **UsuariosIphView.tsx**
```typescript
const UsuariosIphView: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'Usuarios y Creación de IPH', isActive: true }
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      <UsuariosIphStats onError={handleError} />
    </div>
  );
};
```

#### **JusticiaCivicaView.tsx**
```typescript
const JusticiaCivicaView: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'IPH de Justicia Cívica', isActive: true }
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      <EstadisticasJC />  {/* Sin externalFilters */}
    </div>
  );
};
```

#### **ProbableDelictivoView.tsx**
```typescript
const ProbableDelictivoView: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Panel de Estadísticas', path: '/estadisticasusuario' },
    { label: 'IPH de Probable Hecho Delictivo', isActive: true }
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      <EstadisticasProbableDelictivo />  {/* Sin externalFilters */}
    </div>
  );
};
```

**Responsabilidades:**
- Renderizar breadcrumbs con jerarquía correcta
- Proporcionar layout consistente
- Manejar errores globales (en caso de UsuariosIphView)
- Delegar lógica de negocio al componente hijo

---

### **3. Actualización de `Estadisticas.tsx`**

#### **Antes (con Modal):**
```typescript
import { useStatisticsModal } from './hooks/useStatisticsModal';
import StatisticsModal from './components/modals/StatisticsModal';

const { selectedStat, isModalOpen, handleCardClick, handleCloseModal } = useStatisticsModal({
  closeDelay: 300,
  onOpen: (stat) => logDebug('Modal abierto', { stat }),
  onClose: () => logDebug('Modal cerrado')
});

return (
  <div>
    <EstadisticasGrid onCardClick={handleCardClick} />
    {selectedStat && (
      <StatisticsModal
        statistic={selectedStat}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    )}
  </div>
);
```

#### **Después (con Navegación):**
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleCardClick = useCallback((stat: IStatisticCard) => {
  if (!stat.habilitado) return;

  logDebug('Navegando a estadística', {
    statId: stat.id,
    ruta: stat.ruta
  });

  if (stat.ruta) {
    navigate(stat.ruta);
  }
}, [navigate]);

return (
  <div>
    <EstadisticasGrid onCardClick={handleCardClick} />
  </div>
);
```

**Cambios:**
- ✅ Eliminado `useStatisticsModal`
- ✅ Eliminado `StatisticsModal` del render
- ✅ Reemplazado por `useNavigate` de React Router
- ✅ `handleCardClick` navega a `stat.ruta`

---

### **4. Actualización de Rutas en Configuración**

#### **`constants.ts`:**
```typescript
export const STATISTICS_ROUTES = {
  BASE: '/estadisticasusuario',
  USUARIOS_IPH: '/estadisticasusuario/usuarios-iph',
  JUSTICIA_CIVICA: '/estadisticasusuario/justicia-civica',
  PROBABLE_DELICTIVO: '/estadisticasusuario/probable-delictivo',
  // Legacy routes (deprecadas)
  VENTAS: '/estadisticas/ventas',
  ...
};
```

#### **`statisticsConfig.tsx`:**
```typescript
export const statisticsCardsConfig: IStatisticCard[] = [
  {
    id: 'usuarios-iph',
    titulo: 'Usuarios y Creación de IPH',
    ...
    ruta: STATISTICS_ROUTES.USUARIOS_IPH  // ✅ Actualizado
  },
  {
    id: 'justicia-civica',
    titulo: 'IPH de Justicia Cívica',
    ...
    ruta: STATISTICS_ROUTES.JUSTICIA_CIVICA  // ✅ Actualizado
  },
  {
    id: 'hecho-delictivo',
    titulo: 'IPH de Probable Hecho Delictivo',
    ...
    ruta: STATISTICS_ROUTES.PROBABLE_DELICTIVO  // ✅ Actualizado
  }
];
```

---

## 📂 Estructura de Archivos Actualizada

```
statistics/
├── Estadisticas.tsx                      # ✅ Actualizado (sin modal)
├── EstadisticasJC.tsx                    # Sin cambios
├── EstadisticasProbableDelictivo.tsx     # Sin cambios
│
├── views/                                # 🆕 NUEVA CARPETA
│   ├── UsuariosIphView.tsx              # 🆕 Wrapper con breadcrumbs
│   ├── JusticiaCivicaView.tsx           # 🆕 Wrapper con breadcrumbs
│   ├── ProbableDelictivoView.tsx        # 🆕 Wrapper con breadcrumbs
│   └── index.ts                          # Barrel export
│
├── components/
│   ├── modals/
│   │   ├── StatisticsModal.tsx          # ⚠️ DEPRECADO (no se usa)
│   │   └── StatisticsModal.css
│   └── ...
│
├── hooks/
│   ├── useStatisticsModal.ts            # ⚠️ DEPRECADO (no se usa)
│   └── ...
│
└── config/
    ├── constants.ts                      # ✅ Actualizado
    └── statisticsConfig.tsx              # ✅ Actualizado
```

---

## 🚀 Flujo de Navegación Actual

### **Escenario: Usuario consulta estadísticas de Justicia Cívica**

```
1. Usuario entra a /estadisticasusuario
   └─ Visualiza Panel de Estadísticas (Estadisticas.tsx)
      ├─ Breadcrumb: [🏠 Inicio] > [Panel de Estadísticas]
      └─ Sidebar: "Estadísticas" marcado como activo

2. Usuario hace click en tarjeta "IPH de Justicia Cívica"
   └─ navigate('/estadisticasusuario/justicia-civica')

3. Sistema carga JusticiaCivicaView.tsx (lazy)
   └─ Renderiza vista completa
      ├─ Breadcrumb: [🏠 Inicio] > [Panel de Estadísticas] > [IPH de Justicia Cívica]
      ├─ Sidebar: "Estadísticas" sigue activo
      └─ Componente: <EstadisticasJC /> (con header y filtros propios)

4. Usuario puede:
   ├─ Regresar con botón "Atrás" del navegador
   ├─ Click en "Panel de Estadísticas" del breadcrumb
   └─ Compartir URL con otros usuarios
```

---

## 🎨 Beneficios Visuales y UX

### **Breadcrumbs Contextuales:**
```
Antes: [🏠 Inicio] > [Panel de Estadísticas]
        ↓ (click en tarjeta → modal)
        [🏠 Inicio] > [Panel de Estadísticas]  ← No cambia

Ahora: [🏠 Inicio] > [Panel de Estadísticas]
        ↓ (click en tarjeta → navegación)
        [🏠 Inicio] > [Panel de Estadísticas] > [IPH de Justicia Cívica]
```

### **Sidebar Siempre Visible:**
```
Antes: Sidebar oculto o detrás de modal (depende de diseño)

Ahora: Sidebar siempre visible con "Estadísticas" marcado activo
```

### **URLs Compartibles:**
```
Antes: https://app.iph.com/estadisticasusuario
        (modal no cambia URL)

Ahora: https://app.iph.com/estadisticasusuario/justicia-civica
        (URL única para cada estadística)
```

---

## 🔧 Compatibilidad con Componentes Hijos

Los componentes hijos **no necesitaron cambios** porque ya estaban preparados:

### **EstadisticasJC y EstadisticasProbableDelictivo:**
```typescript
interface Props {
  externalFilters?: {
    anio: number;
    mes: number;
    dia: number;
  };
}

// Lógica interna:
if (externalFilters) {
  // Modo modal: no renderiza header ni filtros
  return <GraficasYResumen />;
} else {
  // Modo vista completa: renderiza todo
  return (
    <>
      <Header />
      <Filtros />
      <GraficasYResumen />
      <Footer />
    </>
  );
}
```

**Resultado:**
- ✅ En modal (deprecated): `<EstadisticasJC externalFilters={...} />`
- ✅ En vista completa: `<EstadisticasJC />` (sin props)

### **UsuariosIphStats:**
```typescript
interface Props {
  onError: (message: string) => void;
}

// Ya era autocontenido, solo necesita prop onError
// Funciona perfecto en vista completa
```

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Modal (Antes) | Navegación (Ahora) |
|---------|---------------|-------------------|
| **URL única** | ❌ No | ✅ Sí |
| **Compartir enlace** | ❌ No | ✅ Sí |
| **Historial browser** | ❌ No funciona bien | ✅ Funciona perfecto |
| **Sidebar visible** | ⚠️ Depende de diseño | ✅ Siempre visible |
| **Breadcrumbs** | ⚠️ No cambian | ✅ Contextuales |
| **Refrescar página** | ❌ Pierde estado | ✅ Mantiene vista |
| **SEO** | ❌ Contenido oculto | ✅ Contenido indexable |
| **Accesibilidad** | ⚠️ Modal trap | ✅ Navegación estándar |
| **Performance** | ⚠️ Lazy load manual | ✅ Route-based lazy |

---

## ⚠️ Componentes Deprecados

### **NO ELIMINAR (aún pueden estar en uso en código legacy)**

Los siguientes componentes quedan deprecados pero se mantienen por compatibilidad:

```typescript
// ⚠️ DEPRECADO - No usar en nuevo código
components/modals/StatisticsModal.tsx
components/modals/StatisticsModal.css
hooks/useStatisticsModal.ts
```

**Razón de mantenerlos:**
- Puede haber código legacy que aún los importe
- Facilita rollback en caso de problemas
- Permite migración gradual si se agregan nuevos tipos de estadísticas

**Plan futuro:**
- [ ] Eliminar imports deprecados del codebase
- [ ] Remover componentes en v4.0.0

---

## 🧪 Testing Recomendado

### **1. Navegación Básica:**
```
✅ Click en tarjeta navega a ruta correcta
✅ URL cambia correctamente
✅ Breadcrumbs se actualizan
✅ Sidebar mantiene "Estadísticas" activo
```

### **2. Historial del Navegador:**
```
✅ Botón "Atrás" regresa al panel
✅ Botón "Adelante" vuelve a la estadística
✅ Breadcrumb "Panel de Estadísticas" navega correctamente
```

### **3. Refresh de Página:**
```
✅ Refrescar en /estadisticasusuario/justicia-civica mantiene vista
✅ Datos se cargan correctamente después de refresh
✅ Breadcrumbs se renderizan correctamente
```

### **4. Roles y Permisos:**
```
✅ Elemento no puede acceder (redirects)
✅ Superior puede ver estadísticas
✅ Admin y SuperAdmin acceden normalmente
```

### **5. URLs Compartidas:**
```
✅ Copiar/pegar URL abre estadística directamente
✅ Compartir enlace con otro usuario funciona
✅ Query params se preservan (si se agregan filtros en URL)
```

---

## 📝 Changelog

### **v3.3.0 - Migración Modal → Navegación** (2025-10-28)

#### ✨ Nuevas Funcionalidades
- ✅ Sistema de navegación con rutas para estadísticas
- ✅ 3 vistas wrapper con breadcrumbs
- ✅ URLs compartibles para cada tipo de estadística
- ✅ Historial de navegación funcional

#### 🔧 Mejoras
- ✅ Sidebar siempre visible y contextualizado
- ✅ Breadcrumbs jerárquicos y clickeables
- ✅ Mejor SEO y accesibilidad
- ✅ Lazy loading por ruta (automático)

#### 🗂️ Archivos Modificados
- `src/config/app-routes.config.tsx` - 3 rutas nuevas
- `src/components/private/components/statistics/Estadisticas.tsx` - Navegación
- `src/components/private/components/statistics/config/constants.ts` - Rutas
- `src/components/private/components/statistics/config/statisticsConfig.tsx` - Rutas

#### 🆕 Archivos Creados
- `statistics/views/UsuariosIphView.tsx`
- `statistics/views/JusticiaCivicaView.tsx`
- `statistics/views/ProbableDelictivoView.tsx`
- `statistics/views/index.ts`
- `statistics/MIGRATION_MODAL_TO_ROUTES.md`

#### ⚠️ Archivos Deprecados (no eliminados)
- `components/modals/StatisticsModal.tsx`
- `components/modals/StatisticsModal.css`
- `hooks/useStatisticsModal.ts`

---

**Última actualización**: 2025-10-28
**Versión**: 3.3.0
**Autor**: Senior Full-Stack Developer Expert
