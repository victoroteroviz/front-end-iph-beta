# Configuración de Estadísticas

Esta carpeta contiene la configuración centralizada para las tarjetas de estadísticas de la aplicación.

## 📁 Estructura

```
config/
├── statisticsConfig.tsx    # Configuración de todas las tarjetas de estadísticas
├── constants.ts            # Constantes, colores y funciones helper
├── examples.tsx            # Ejemplos de nuevas tarjetas
├── index.ts               # Exportaciones centralizadas
└── README.md              # Esta documentación
```

## 🎯 Uso

### Importar la configuración

```typescript
import { 
  statisticsCardsConfig, 
  getEnabledStatisticCards,
  STATISTICS_COLORS,
  getStatisticRoute
} from './config';
```

### Funciones disponibles

**Gestión de tarjetas:**
- **`statisticsCardsConfig`**: Array completo de todas las tarjetas configuradas
- **`getStatisticCardById(id: string)`**: Obtiene una tarjeta específica por su ID
- **`getEnabledStatisticCards()`**: Retorna solo las tarjetas habilitadas
- **`getDisabledStatisticCards()`**: Retorna solo las tarjetas deshabilitadas

**Constantes:**
- **`STATISTICS_COLORS`**: Paleta de colores estandarizada
- **`STATISTICS_CATEGORIES`**: Categorías de estadísticas
- **`STATISTICS_ROUTES`**: Rutas predefinidas
- **`ANIMATION_CONFIG`**: Configuración de animaciones
- **`ICON_SIZES`**: Tamaños de iconos
- **`BREAKPOINTS`**: Breakpoints responsive

**Utilidades:**
- **`getStatisticRoute(id: string)`**: Genera la ruta completa para una estadística
- **`isValidHexColor(color: string)`**: Valida si un color es hexadecimal válido
- **`getColorByCategory(category: string)`**: Obtiene el color recomendado por categoría
- **`titleToId(title: string)`**: Convierte un título a ID válido
- **`generateRouteFromTitle(title: string)`**: Genera una ruta desde un título

## ⚙️ Cómo agregar una nueva tarjeta de estadística

1. Abre el archivo `statisticsConfig.tsx`
2. Agrega un nuevo objeto al array `statisticsCardsConfig`:

```typescript
{
  id: 'mi-nueva-estadistica',
  titulo: 'Mi Nueva Estadística',
  descripcion: 'Descripción de lo que muestra esta estadística',
  icono: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      {/* Path del icono SVG */}
    </svg>
  ),
  habilitado: true, // false para mostrar como "próximamente"
  color: '#4f46e5', // Color del icono y borde
  ruta: '/estadisticas/mi-nueva-estadistica' // Ruta de navegación
}
```

## 🎨 Paleta de colores recomendada

Usa las constantes de `STATISTICS_COLORS` para mantener consistencia:

```typescript
import { STATISTICS_COLORS } from './config';

// Colores IPH
STATISTICS_COLORS.IPH_PRIMARY     // '#948b54' - Dorado/beige
STATISTICS_COLORS.IPH_SECONDARY   // '#c2b186' - Beige claro
STATISTICS_COLORS.IPH_DARK        // '#4d4725' - Marrón oscuro
STATISTICS_COLORS.IPH_LIGHT       // '#fdf7f1' - Beige muy claro

// Colores de estado
STATISTICS_COLORS.SUCCESS         // '#059669' - Verde
STATISTICS_COLORS.WARNING         // '#f59e0b' - Ámbar
STATISTICS_COLORS.DANGER          // '#dc2626' - Rojo
STATISTICS_COLORS.INFO            // '#0891b2' - Cyan

// Colores adicionales
STATISTICS_COLORS.INDIGO          // '#4f46e5'
STATISTICS_COLORS.VIOLET          // '#7c3aed'
STATISTICS_COLORS.PURPLE          // '#8b5cf6'
STATISTICS_COLORS.PINK            // '#be185d'
STATISTICS_COLORS.ORANGE          // '#ea580c'
// ... y más
```

## 🔧 Propiedades de una tarjeta

| Propiedad | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id` | `string` | ✅ | Identificador único de la tarjeta |
| `titulo` | `string` | ✅ | Título que se muestra en la tarjeta |
| `descripcion` | `string` | ✅ | Descripción breve de la estadística |
| `icono` | `React.ReactNode` | ✅ | Componente SVG del icono |
| `habilitado` | `boolean` | ✅ | Define si la tarjeta está activa o "próximamente" |
| `color` | `string` | ❌ | Color hexadecimal del icono y borde |
| `ruta` | `string` | ❌ | Ruta de navegación al hacer clic |

## 📝 Ejemplos

### Usar constantes de colores

```typescript
import { STATISTICS_COLORS } from './config';

{
  id: 'ventas',
  titulo: 'Estadísticas de Ventas',
  descripcion: 'Visualiza el rendimiento de ventas',
  icono: <svg>...</svg>,
  habilitado: true,
  color: STATISTICS_COLORS.SUCCESS, // ← Usar constante
  ruta: '/estadisticas/ventas'
}
```

### Generar ruta automáticamente

```typescript
import { generateRouteFromTitle } from './config';

const ruta = generateRouteFromTitle('Estadísticas de Ventas');
// Resultado: '/estadisticas/estadisticas-de-ventas'
```

### Obtener color por categoría

```typescript
import { getColorByCategory, STATISTICS_CATEGORIES } from './config';

const color = getColorByCategory(STATISTICS_CATEGORIES.FINANCIAL);
// Resultado: '#7c3aed' (Violet)
```

### Deshabilitar una tarjeta temporalmente

```typescript
{
  id: 'marketing',
  titulo: 'Estadísticas de Marketing',
  descripcion: 'Analiza campañas, conversiones y ROI',
  icono: <svg>...</svg>,
  habilitado: false, // ← Mostrar como "próximamente"
  color: '#ea580c',
  ruta: '/estadisticas/marketing'
}
```

### Cambiar el color de una tarjeta

```typescript
import { STATISTICS_COLORS } from './config';

{
  id: 'ventas',
  titulo: 'Estadísticas de Ventas',
  descripcion: 'Visualiza el rendimiento de ventas',
  icono: <svg>...</svg>,
  habilitado: true,
  color: STATISTICS_COLORS.DANGER, // ← Usar constante
  ruta: '/estadisticas/ventas'
}
```

### Obtener solo tarjetas habilitadas

```typescript
import { getEnabledStatisticCards } from './config/statisticsConfig';

const estadisticasActivas = getEnabledStatisticCards();
console.log(estadisticasActivas); // Solo tarjetas con habilitado: true
```

## 🔍 Iconos SVG

Para agregar iconos, puedes usar:
- **Heroicons**: https://heroicons.com/
- **Lucide Icons**: https://lucide.dev/
- Cualquier SVG personalizado

### Ejemplo de icono Heroicons:

```typescript
icono: (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)
```

## 🚀 Tips

1. **Mantén la consistencia**: Usa colores de la paleta definida
2. **Descripciones claras**: Escribe descripciones concisas y descriptivas
3. **IDs únicos**: Asegúrate de que cada tarjeta tenga un ID único
4. **Testing**: Prueba con `habilitado: false` antes de activar una nueva tarjeta
5. **Orden**: Las tarjetas se muestran en el orden del array

## 📚 Documentación adicional

- Interface completa: `/src/interfaces/IStatistic.ts`
- Componente principal: `/src/components/private/components/statistics/Estadisticas.tsx`
- Estilos: `/src/components/private/components/statistics/Estadisticas.css`
