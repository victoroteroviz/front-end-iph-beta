# DetalleIPH Component

## Descripción

Componente modal que muestra información detallada de un registro IPH (Informe Policial Homologado). Integrado completamente con el servicio `getBasicDataByIphId` para obtener datos reales desde el backend.

## Ubicación

```
src/components/private/components/historial-iph/components/DetalleIPH.tsx
```

## Características

### ✅ Funcionalidades Implementadas

- **Carga dinámica de datos**: Obtiene información completa desde el backend mediante `useDetalleIPH` hook
- **Sistema de tabs**: Organiza la información en pestañas (General, Evidencias)
- **Galería de evidencias**: Visualización de evidencias fotográficas con modal de ampliación
- **Navegación de imágenes**: Permite navegar entre evidencias con botones anterior/siguiente y teclado (ESC para cerrar)
- **Estados de carga**: Muestra skeleton y estados de carga mientras obtiene datos del servidor
- **Manejo de errores**: Gestión robusta de errores con fallback a datos locales
- **Construcción de URLs**: Construcción automática de URLs de evidencias con `API_BASE_URL`

### 🎨 UI/UX

- **Diseño responsive**: Adaptable a diferentes tamaños de pantalla
- **Paleta de colores**: Mantiene el diseño original (#4d4725, #f8f0e7, #b8ab84)
- **Animaciones suaves**: Transiciones y efectos hover
- **Accesibilidad**: Labels ARIA y navegación por teclado

## Estructura de Datos

### Input Props

```typescript
interface DetalleIPHProps {
  /** Registro IPH del historial a mostrar */
  registro: RegistroHistorialIPH;

  /** Callback para cerrar el modal */
  onClose: () => void;

  /** Clase CSS adicional (opcional) */
  className?: string;
}
```

### Datos del Servicio

El componente utiliza la interface `I_BasicDataDto` del servicio:

```typescript
interface I_BasicDataDto {
  id: string;
  numero: string;
  tipoIph: string;
  delito: string;
  tipoDelito: string;
  estatus: string;
  fechaCreacion: Date | string;
  ubicacion?: {
    calle?: string;
    colonia?: string;
    estado?: string;
    municipio?: string;
    ciudad?: string;
  };
  primerRespondiente?: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  evidencias: string[];
  observaciones: string;
}
```

## Dependencias

### Hooks Personalizados

- **`useDetalleIPH`**: Hook que encapsula la lógica de carga de datos básicos del IPH
  - Ubicación: `../hooks/useDetalleIPH.ts`
  - Maneja estados de carga, error y datos

### Servicios

- **`getBasicDataByIphId`**: Servicio que obtiene los datos básicos de un IPH por ID
  - Ubicación: `src/services/iph-basic-data/get-basic-iph-data.service.ts`
  - Endpoint: `/api/iph-web/getBasicDataByIph/:id`

### Configuración

- **`getStatusConfig`**: Helper para obtener configuración visual de estatus
  - Ubicación: `src/config/status.config.ts`
  - Proporciona colores y etiquetas para cada estatus

### Helpers

- **Logger**: `logInfo`, `logDebug`, `logError` para trazabilidad
- **API_BASE_URL**: Configuración de URL base del backend

## Uso

```tsx
import DetalleIPH from './components/DetalleIPH';

// En el componente padre
const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroHistorialIPH | null>(null);

<DetalleIPH
  registro={registroSeleccionado}
  onClose={() => setRegistroSeleccionado(null)}
/>
```

## Sistema de Tabs

### Tab 1: Información General

Muestra:
- Número de referencia del IPH
- Fecha y hora de creación
- Ubicación del incidente
- Tipo de delito y tipo de IPH
- Primer respondiente
- Observaciones del caso

### Tab 2: Evidencias (condicional)

- Solo se muestra si `displayData.evidencias.length > 0`
- Grid responsive de miniaturas (2-4 columnas según viewport)
- Click en miniatura abre modal de visualización
- Navegación con botones y contador de imágenes
- Lazy loading y manejo de errores de carga

## Estados del Componente

### Estado de Datos

1. **Cargando datos del servidor**: Muestra indicador de carga
2. **Datos cargados exitosamente**: Badge verde en header y footer
3. **Error al cargar datos**: Badge rojo con mensaje de error, fallback a datos locales
4. **Datos locales**: Badge amarillo cuando solo se muestran datos del registro inicial

### Flujo de Datos

```
┌─────────────────────────────────┐
│   RegistroHistorialIPH (prop)   │
│  (datos iniciales/mínimos)      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│      useDetalleIPH hook         │
│  Llama a getBasicDataByIphId    │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    I_BasicDataDto (completo)    │
│   datosBasicos del servidor     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│     displayData (calculado)     │
│ Prioriza datosBasicos, fallback │
│    a registro si hay error      │
└─────────────────────────────────┘
```

## Configuración de Estatus

Los estatus se configuran mediante `STATUS_CONFIG` en `src/config/status.config.ts`:

```typescript
{
  Activo: { color: '#10b981', bgColor: '#dcfce7', label: 'Activo' },
  Inactivo: { color: '#6b7280', bgColor: '#f3f4f6', label: 'Inactivo' },
  Pendiente: { color: '#f59e0b', bgColor: '#fef3c7', label: 'Pendiente' },
  Cancelado: { color: '#ef4444', bgColor: '#fee2e2', label: 'Cancelado' },
  'N/D': { color: '#6b7280', bgColor: '#e5e7eb', label: 'No Disponible' }
}
```

## Construcción de URLs de Evidencias

El componente construye automáticamente las URLs completas de las evidencias:

```typescript
const buildEvidenciaUrl = (url: string): string => {
  // URL completa (http:// o https://) → retornar tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Ruta relativa con / → API_BASE_URL + url
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  // Ruta relativa sin / → API_BASE_URL + / + url
  return `${API_BASE_URL}/${url}`;
};
```

## Manejo de Imágenes

### Miniaturas

- Grid responsive con aspect ratio 1:1
- Efecto hover con zoom y overlay
- Número de evidencia en badge superior izquierdo
- Icono de ZoomIn en overlay

### Modal de Visualización

- Fondo oscuro con blur
- Imagen centrada con `object-contain`
- Contador de imágenes (ej: "3 / 10")
- Botones de navegación anterior/siguiente
- Botón de cerrar (X) en esquina superior derecha
- Navegación con teclado (ESC para cerrar)
- Fallback SVG si la imagen no carga

## Logging y Trazabilidad

El componente utiliza el sistema de logging del proyecto:

```typescript
// Montaje/desmontaje del componente
logInfo('DetalleIPH', 'Componente montado', { registroId });

// Renderizado de miniaturas
logDebug('DetalleIPH', 'Renderizando miniatura', { index, url });

// Errores de carga de imágenes
logError('DetalleIPH', 'Imagen no disponible', errorMessage);
```

## Consideraciones Técnicas

### Performance

- `useCallback` para funciones que se pasan como props
- Construcción eficiente de URLs sin re-renders innecesarios
- Cleanup de event listeners en useEffect

### Seguridad

- Sanitización de URLs de evidencias
- Validación de existencia de datos antes de renderizar
- Manejo seguro de errores de red

### Accesibilidad

- Labels ARIA en botones
- Navegación por teclado (ESC para cerrar modal)
- Contraste adecuado de colores
- Semántica HTML correcta

## Testing

### Casos de Prueba Recomendados

1. **Carga exitosa de datos del servidor**
   - Verificar que se muestran los datos del servicio
   - Badge verde en footer

2. **Error al cargar datos**
   - Verificar fallback a datos locales
   - Badge rojo con mensaje de error

3. **Sin evidencias**
   - Tab de evidencias no debe aparecer
   - Mostrar mensaje "No hay evidencias disponibles"

4. **Con evidencias**
   - Verificar construcción correcta de URLs
   - Navegación entre imágenes funcional
   - Modal se cierra con ESC

5. **Formateo de fechas**
   - Verificar formato en español (es-MX)
   - Formato de 12 horas con AM/PM

## Changelog

### v2.0.0 (2024-01-30)

- ✅ Eliminados todos los datos dummy y mocks
- ✅ Integración completa con `I_BasicDataDto` del servicio
- ✅ Configuración de estatus movida a `status.config.ts`
- ✅ Eliminado tab de "Seguimiento" (no existe en backend)
- ✅ Simplificada estructura de datos
- ✅ Mejorada documentación y logging

### v1.0.0 (2024-01-29)

- 🎉 Versión inicial con integración parcial al servicio
- Datos básicos desde `getBasicDataByIphId`
- Sistema de tabs y galería de evidencias

## Mantenimiento

### Para agregar nuevos campos del servicio:

1. Verificar que el campo exista en `I_BasicDataDto`
2. Agregarlo a la sección correspondiente del JSX
3. Actualizar esta documentación

### Para modificar colores de estatus:

1. Editar `src/config/status.config.ts`
2. Los cambios se reflejan automáticamente en todos los componentes que usen `getStatusConfig()`

## Archivos Relacionados

- **Componente**: `DetalleIPH.tsx`
- **Hook**: `../hooks/useDetalleIPH.ts`
- **Servicio**: `src/services/iph-basic-data/get-basic-iph-data.service.ts`
- **Interface**: `src/interfaces/iph-basic-data/iph-basic-data.interface.ts`
- **Config**: `src/config/status.config.ts`
- **Helpers**: `src/helper/log/logger.helper.ts`

---

**Última actualización**: 2024-01-30
**Versión**: 2.0.0
**Mantenedor**: Sistema IPH Frontend
