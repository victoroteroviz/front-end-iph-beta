# Componente de Estadísticas de Justicia Cívica

Componente completo para visualizar estadísticas de IPH agrupadas por día, mes y año.

## 📋 Índice

- [Descripción](#descripción)
- [Estructura de Archivos](#estructura-de-archivos)
- [Características](#características)
- [Uso](#uso)
- [Componentes](#componentes)
- [Servicios](#servicios)
- [Interfaces](#interfaces)
- [Estilos](#estilos)

## 📖 Descripción

`EstadisticasJC` es un componente modular que muestra estadísticas de Justicia Cívica clasificadas por:
- **Diarias**: IPH de un día específico
- **Mensuales**: IPH de un mes completo
- **Anuales**: IPH de un año completo

Cada estadística muestra:
- Total general de casos
- Total con detenido
- Total sin detenido
- Porcentajes visuales con barras de progreso

## 📁 Estructura de Archivos

```
statistics/
├── EstadisticasJC.tsx                    # Componente principal
├── EstadisticasJC.css                    # Estilos del componente
├── README_JC.md                          # Esta documentación
├── hooks/
│   └── useEstadisticasJC.ts              # Hook personalizado con lógica
└── components/
    ├── EstadisticaJCCard.tsx             # Card individual de estadística
    └── FiltroFechaJC.tsx                 # Filtros de fecha (año/mes/día)
```

## ✨ Características

### 🎯 Funcionalidades Principales

- ✅ **Consultas en tiempo real** a 3 endpoints diferentes
- ✅ **Filtros de fecha** interactivos (año, mes, día)
- ✅ **Carga paralela** de las 3 estadísticas
- ✅ **Resumen comparativo** con métricas calculadas
- ✅ **Estados de carga** individuales por card
- ✅ **Manejo de errores** granular
- ✅ **Diseño responsivo** adaptable
- ✅ **Actualización automática** al cambiar fecha

### 🔧 Características Técnicas

- ✅ **Patrón Atomic Design** con componentes reutilizables
- ✅ **Custom Hook** con separación de lógica/presentación
- ✅ **TypeScript** completo con interfaces tipadas
- ✅ **Logging estructurado** con logInfo/logError
- ✅ **Optimizaciones** con useCallback y useMemo
- ✅ **CSS modular** con BEM naming

## 🚀 Uso

### Importación Básica

```typescript
import EstadisticasJC from '@/components/private/components/statistics/EstadisticasJC';

// En tu componente o router
<EstadisticasJC />
```

### Integración en Router

```typescript
// En IPHApp.tsx o tu archivo de rutas
import EstadisticasJC from './components/private/components/statistics/EstadisticasJC';

<Route path="estadisticas-jc" element={<EstadisticasJC />} />
```

### Uso del Hook (Standalone)

Si solo necesitas la lógica sin la UI:

```typescript
import { useEstadisticasJC } from '@/components/private/components/statistics/hooks/useEstadisticasJC';

const MiComponente = () => {
  const {
    estadisticas,
    loading,
    error,
    fechaSeleccionada,
    obtenerEstadisticasDiarias,
    obtenerEstadisticasMensuales,
    obtenerEstadisticasAnuales
  } = useEstadisticasJC();

  // Usar la lógica según tus necesidades
  useEffect(() => {
    obtenerEstadisticasDiarias({
      anio: 2025,
      mes: 10,
      dia: 8
    });
  }, []);

  return (
    <div>
      {estadisticas.diaria && (
        <p>Total: {estadisticas.diaria.data.totalConDetenido}</p>
      )}
    </div>
  );
};
```

## 🧩 Componentes

### 1. `EstadisticasJC` (Principal)

Componente contenedor que orquesta todo el flujo.

**Responsabilidades:**
- Renderizar header y filtros
- Mostrar grid de 3 cards (diaria, mensual, anual)
- Mostrar resumen comparativo
- Manejar actualización de datos

**Estado:**
- Usa `useEstadisticasJC()` hook
- No tiene estado local propio
- Toda la lógica delegada al hook

### 2. `EstadisticaJCCard`

Card individual para mostrar una estadística.

**Props:**

```typescript
interface EstadisticaJCCardProps {
  tipo: TipoPeriodo;              // 'diaria' | 'mensual' | 'anual'
  datos: RespuestaJC | null;      // Datos de la estadística
  loading: boolean;               // Estado de carga
  error: string | null;           // Mensaje de error
  onClick?: () => void;           // Callback al hacer click
  color?: string;                 // Color primario del card
  icon?: React.ReactNode;         // Ícono del card
}
```

**Características:**
- Calcula automáticamente totales y porcentajes
- Muestra barras de progreso visuales
- Estados: loading, error, datos, empty
- Animaciones suaves en hover

**Ejemplo de uso:**

```typescript
<EstadisticaJCCard
  tipo="diaria"
  datos={estadisticas.diaria}
  loading={loading.diaria}
  error={error.diaria}
  color="#2563eb"
  icon={<span>📊</span>}
/>
```

### 3. `FiltroFechaJC`

Filtros interactivos para seleccionar fecha.

**Props:**

```typescript
interface FiltroFechaJCProps {
  anioInicial: number;
  mesInicial: number;
  diaInicial: number;
  onFechaChange: (anio: number, mes: number, dia: number) => void;
  loading?: boolean;
}
```

**Características:**
- Selectores de año, mes y día
- Botón "Hoy" para fecha actual
- Ajuste automático de días según mes
- Validación de fechas
- Muestra fecha seleccionada formateada

**Ejemplo de uso:**

```typescript
<FiltroFechaJC
  anioInicial={2025}
  mesInicial={10}
  diaInicial={8}
  onFechaChange={(anio, mes, dia) => {
    console.log(`Fecha: ${dia}/${mes}/${anio}`);
  }}
  loading={false}
/>
```

## 🔧 Servicios

### Endpoints Utilizados

El componente consume 3 endpoints del servicio `get-jc.service.ts`:

#### 1. Estadísticas Diarias

```typescript
GET /api/estadisticas/getJusticiaCivicaDiaria/?anio=2025&mes=10&dia=8

// Servicio
import { getJusticiaCivicaDiaria } from '@/services/estadisticas-jc/get-jc.service';

const estadisticas = await getJusticiaCivicaDiaria({
  anio: 2025,
  mes: 10,
  dia: 8
});
```

#### 2. Estadísticas Mensuales

```typescript
GET /api/estadisticas/getJusticiaCivicaMensual/?anio=2025&mes=10

// Servicio
import { getJusticiaCivicaMensual } from '@/services/estadisticas-jc/get-jc.service';

const estadisticas = await getJusticiaCivicaMensual({
  anio: 2025,
  mes: 10
});
```

#### 3. Estadísticas Anuales

```typescript
GET /api/estadisticas/getJusticiaCivicaAnual/?anio=2025

// Servicio
import { getJusticiaCivicaAnual } from '@/services/estadisticas-jc/get-jc.service';

const estadisticas = await getJusticiaCivicaAnual({
  anio: 2025
});
```

### Respuesta del Backend

Todos los endpoints retornan la misma estructura:

```typescript
{
  status: boolean;
  message: string;
  data: {
    totalConDetenido: number;
    totalSinDetenido: number;
  };
}
```

**Ejemplo:**

```json
{
  "status": true,
  "message": "Estadísticas obtenidas correctamente",
  "data": {
    "totalConDetenido": 45,
    "totalSinDetenido": 120
  }
}
```

## 📊 Interfaces

### `RespuestaJC`

```typescript
interface RespuestaJC {
  status: boolean;
  message: string;
  data: {
    totalConDetenido: number;
    totalSinDetenido: number;
  };
}
```

### `ParamsJCDiaria`

```typescript
interface ParamsJCDiaria {
  anio: number;   // Año a consultar
  mes: number;    // Mes (1-12)
  dia: number;    // Día (1-31)
}
```

### `ParamsJCMensual`

```typescript
interface ParamsJCMensual {
  anio: number;   // Año a consultar
  mes: number;    // Mes (1-12)
}
```

### `ParamsJCAnual`

```typescript
interface ParamsJCAnual {
  anio: number;   // Año a consultar
}
```

### `TipoPeriodo`

```typescript
type TipoPeriodo = 'diaria' | 'mensual' | 'anual';
```

## 🎨 Estilos

### Variables de Color

Los cards usan diferentes colores por tipo:

- **Diaria**: `#2563eb` (Azul)
- **Mensual**: `#7c3aed` (Morado)
- **Anual**: `#059669` (Verde)

### Clases CSS Principales

```css
.estadisticas-jc-container      /* Contenedor principal */
.estadisticas-jc-header         /* Header con título */
.estadisticas-jc-filtros        /* Sección de filtros */
.estadisticas-jc-grid           /* Grid de cards */
.estadistica-jc-card            /* Card individual */
.filtro-fecha-jc                /* Filtros de fecha */
.estadisticas-jc-resumen        /* Resumen comparativo */
```

### Personalización

Para cambiar colores, modifica las props `color` en los cards:

```typescript
<EstadisticaJCCard
  tipo="diaria"
  color="#your-color-here"  // Tu color personalizado
  // ...otras props
/>
```

## 🔄 Hook: `useEstadisticasJC`

### API Completa

```typescript
const {
  // Estados
  estadisticas: {
    diaria: RespuestaJC | null,
    mensual: RespuestaJC | null,
    anual: RespuestaJC | null
  },
  loading: {
    diaria: boolean,
    mensual: boolean,
    anual: boolean
  },
  error: {
    diaria: string | null,
    mensual: string | null,
    anual: string | null
  },
  fechaSeleccionada: {
    anio: number,
    mes: number,
    dia: number
  },

  // Funciones de consulta
  obtenerEstadisticasDiarias: (params: ParamsJCDiaria) => Promise<RespuestaJC>,
  obtenerEstadisticasMensuales: (params: ParamsJCMensual) => Promise<RespuestaJC>,
  obtenerEstadisticasAnuales: (params: ParamsJCAnual) => Promise<RespuestaJC>,
  obtenerTodasLasEstadisticas: () => Promise<void>,

  // Funciones de manipulación
  actualizarFecha: (anio?: number, mes?: number, dia?: number) => void,
  limpiarEstadisticas: (tipo: TipoPeriodo) => void,
  limpiarTodasLasEstadisticas: () => void,

  // Utilidades
  calcularTotalGeneral: (datos: RespuestaJC | null) => number,
  hayDatosCargados: (tipo: TipoPeriodo) => boolean,
  estaCargandoAlguna: () => boolean,
  obtenerMensajeError: () => string | null
} = useEstadisticasJC();
```

### Funciones Principales

#### `obtenerEstadisticasDiarias()`

```typescript
await obtenerEstadisticasDiarias({
  anio: 2025,
  mes: 10,
  dia: 8
});
// Actualiza estadisticas.diaria
```

#### `obtenerTodasLasEstadisticas()`

```typescript
await obtenerTodasLasEstadisticas();
// Carga las 3 estadísticas en paralelo
```

#### `actualizarFecha()`

```typescript
actualizarFecha(2025, 10, 8);
// Actualiza fecha seleccionada y recarga estadísticas
```

#### `calcularTotalGeneral()`

```typescript
const total = calcularTotalGeneral(estadisticas.diaria);
// Retorna: totalConDetenido + totalSinDetenido
```

## 📈 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                   EstadisticasJC                        │
│                                                         │
│  ┌───────────────────────────────────────────────┐     │
│  │         useEstadisticasJC() Hook              │     │
│  │                                               │     │
│  │  1. useEffect() → obtenerTodasLasEstadisticas│     │
│  │  2. Promise.all([diaria, mensual, anual])   │     │
│  │  3. Actualiza estados individuales           │     │
│  └───────────────────────────────────────────────┘     │
│                         ↓                               │
│  ┌───────────────────────────────────────────────┐     │
│  │            FiltroFechaJC                      │     │
│  │  Cambia fecha → actualizarFecha()            │     │
│  └───────────────────────────────────────────────┘     │
│                         ↓                               │
│  ┌───────────────────────────────────────────────┐     │
│  │  EstadisticaJCCard × 3 (diaria/mensual/anual) │     │
│  │  - Muestra datos                              │     │
│  │  - Calcula porcentajes                        │     │
│  │  - Renderiza barras de progreso               │     │
│  └───────────────────────────────────────────────┘     │
│                         ↓                               │
│  ┌───────────────────────────────────────────────┐     │
│  │           Resumen Comparativo                 │     │
│  │  - Total diario, mensual, anual               │     │
│  │  - Promedio diario calculado                  │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 🐛 Manejo de Errores

### Estados de Error

Cada estadística tiene su propio estado de error:

```typescript
if (error.diaria) {
  console.error('Error en estadísticas diarias:', error.diaria);
}

if (error.mensual) {
  console.error('Error en estadísticas mensuales:', error.mensual);
}

if (error.anual) {
  console.error('Error en estadísticas anuales:', error.anual);
}
```

### Try-Catch en Servicios

Los servicios lanzan errores descriptivos:

```typescript
try {
  const estadisticas = await getJusticiaCivicaDiaria({ anio, mes, dia });
} catch (error) {
  // error.message contiene descripción del error
  console.error(error.message);
}
```

## 🧪 Testing

### Prueba Manual

1. Abrir componente en el navegador
2. Verificar que se carguen las 3 estadísticas
3. Cambiar fecha en filtros
4. Verificar que se actualicen los datos
5. Probar botón "Hoy"
6. Probar botón "Actualizar"

### Casos de Prueba

- ✅ Carga inicial con fecha actual
- ✅ Cambio de año en filtros
- ✅ Cambio de mes (ajuste de días)
- ✅ Cambio de día
- ✅ Botón "Hoy"
- ✅ Botón "Actualizar"
- ✅ Manejo de errores de red
- ✅ Respuesta vacía del backend
- ✅ Diseño responsivo en móvil

## 📱 Responsive Design

El componente es completamente responsivo:

### Desktop (> 768px)
- Grid de 3 columnas
- Header horizontal
- Filtros en fila

### Tablet (768px)
- Grid de 2 columnas
- Header vertical
- Filtros en fila

### Mobile (< 768px)
- Grid de 1 columna
- Header apilado
- Filtros apilados
- Botones de ancho completo

## 🔒 Permisos y Roles

**Control de acceso:**
- Por defecto, accesible para todos los roles autenticados
- Para restringir, añadir validación en el router:

```typescript
import { canAccessSuperior } from '@/config/permissions.config';

// Solo SuperAdmin, Admin y Superior
<Route
  path="estadisticas-jc"
  element={
    canAccessSuperior(userRoles)
      ? <EstadisticasJC />
      : <Navigate to="/unauthorized" />
  }
/>
```

## 🚀 Mejoras Futuras

- [ ] Exportar estadísticas a PDF
- [ ] Exportar estadísticas a Excel
- [ ] Gráficas con recharts o chart.js
- [ ] Comparación entre períodos
- [ ] Filtros adicionales (región, tipo, etc.)
- [ ] Caché de consultas recientes
- [ ] Modo offline con datos guardados
- [ ] Historial de consultas

## 📝 Changelog

### v1.0.0 (2025-10-08)
- ✅ Implementación inicial completa
- ✅ Hook personalizado `useEstadisticasJC`
- ✅ Componentes atómicos (Card, Filtros)
- ✅ Integración con 3 endpoints
- ✅ Diseño responsivo
- ✅ Documentación completa

## 👥 Contribuidores

- Claude Code Assistant (Implementación inicial)

## 📄 Licencia

Este componente es parte del proyecto IPH Frontend.
