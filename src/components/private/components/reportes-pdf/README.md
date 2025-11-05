# Componente Reportes PDF

## Descripción
Módulo completo para generación y descarga de reportes en formato PDF. Consume endpoints del backend para generar reportes con datos actualizados del sistema IPH.

## Estructura de Archivos

```
reportes-pdf/
├── ReportesPdf.tsx              # Componente principal (orquestador)
├── README.md                     # Documentación (este archivo)
├── index.ts                      # Barrel exports
│
├── styles/                       # Estilos CSS
│   └── ReportesPdf.css          # Estilos del componente principal
│
├── components/                   # Componentes atómicos
│   ├── layout/                  # Componentes de layout
│   │   ├── ReportesHeader.tsx       # Header con título y métricas
│   │   ├── ReportesGrid.tsx         # Grid de tarjetas
│   │   └── index.ts                 # Barrel export
│   │
│   └── cards/                   # Componentes de tarjetas
│       └── ReporteCard.tsx          # Tarjeta individual de reporte
│
├── hooks/                       # Custom Hooks
│   └── useReportesPdf.ts            # Lógica de generación de PDFs
│
├── config/                      # Configuraciones
│   ├── constants.ts                 # Constantes (colores, endpoints, mensajes)
│   ├── reportesConfig.tsx           # Configuración de tarjetas de reportes
│   └── index.ts                     # Barrel export
│
└── services/                    # Servicios de API
    └── reportes-pdf.service.ts      # Servicio de generación de PDFs
```

## Componente Principal: ReportesPdf.tsx

### Responsabilidades
- Orquestación de componentes atómicos
- Manejo de estado global de generación de PDFs
- Control de acceso por roles
- Gestión de notificaciones y errores

### Componentes Secundarios

#### 1. ReportesHeader
**Ubicación:** `components/layout/ReportesHeader.tsx`

**Responsabilidades:**
- Renderizar título del módulo
- Mostrar métricas rápidas (disponibles/próximamente)
- Diseño decorativo con gradientes

**Props:**
```typescript
{
  enabledCount: number;  // Número de reportes habilitados
  totalCount: number;    // Número total de reportes
}
```

**Performance:**
- Memoizado con `React.memo`
- Solo re-renderiza si cambian los contadores

#### 2. ReportesGrid
**Ubicación:** `components/layout/ReportesGrid.tsx`

**Responsabilidades:**
- Renderizar grid responsivo de tarjetas
- Gestionar layout del grid
- Propagar eventos de click
- Manejar estados de generación

**Props:**
```typescript
{
  reportes: IReporteCard[];              // Array de reportes
  onCardClick: (reporte: IReporteCard) => void; // Handler de click
  generando?: boolean;                   // Hay generación en progreso
  reporteGenerando?: string | null;      // ID del reporte generándose
}
```

**Performance:**
- Memoizado con `React.memo`
- Solo re-renderiza si cambia el array o el handler

#### 3. ReporteCard
**Ubicación:** `components/cards/ReporteCard.tsx`

**Responsabilidades:**
- Renderizar tarjeta individual
- Manejar interactividad (hover, click, keyboard)
- Mostrar estado habilitado/deshabilitado
- Mostrar estado de generación (loading)
- Badge "Próximamente" para tarjetas deshabilitadas

**Props:**
```typescript
{
  reporte: IReporteCard;                  // Datos del reporte
  onClick: (reporte: IReporteCard) => void; // Handler de click
  disabled?: boolean;                     // Tarjeta deshabilitada
  generando?: boolean;                    // Reporte generándose
}
```

**Features:**
- Accesibilidad completa (ARIA, keyboard navigation)
- Animaciones smooth con CSS
- Estados visuales claros
- Performance optimizada con callbacks memoizados

## Flujo de Datos

```
ReportesPdf (principal)
    │
    ├─► useReportesPdf (hook)
    │   ├─► Validación de acceso
    │   ├─► Estado de generación
    │   └─► Funciones: generarReporte, previsualizarReporte, cancelarGeneracion
    │
    ├─► ReportesHeader
    │   └─► Muestra métricas (enabledCount, totalCount)
    │
    └─► ReportesGrid
        └─► ReporteCard (x N tarjetas)
            └─► onClick → generarReporte → llamada a API → descarga PDF
```

## Sistema de Estilos

### Ubicación
Los estilos están centralizados en `styles/ReportesPdf.css`

### Clases CSS Principales

```css
/* Layout */
.reportes-content       /* Contenedor principal del grid */

/* Tarjetas */
.reporte-card           /* Tarjeta base */
.reporte-card-icon      /* Contenedor del icono */

/* Animaciones */
.animate-fadeIn         /* Fade in suave */
.animate-pulse          /* Pulso (generando) */
.animate-spin           /* Rotación (spinner) */
```

### Responsive Design

- **Desktop (>1024px)**: Grid de 3-4 columnas
- **Tablet (640-1024px)**: Grid de 2 columnas
- **Mobile (<640px)**: Grid de 1 columna, animaciones reducidas

## Hook Personalizado: useReportesPdf

### Funcionalidad
Maneja toda la lógica de generación de reportes PDF

### API del Hook

```typescript
const {
  estado,           // Estado completo de generación
  hasAccess,        // Usuario tiene acceso
  generarReporte,   // Función para generar PDF
  previsualizarReporte, // Función para previsualizar
  cancelarGeneracion,   // Función para cancelar
  resetearError,    // Función para resetear errores
  generando,        // Boolean: generación en progreso
  progreso,         // Number: progreso (0-100)
  mensaje,          // String: mensaje de estado
  error,            // String | null: error actual
  reporteActual     // String | null: ID del reporte generándose
} = useReportesPdf();
```

### Ejemplo de Uso

```typescript
// Generar reporte con descarga automática
await generarReporte(reporteCard, filtros);

// Generar reporte con preview (sin descarga)
await previsualizarReporte(reporteCard, filtros);

// Cancelar generación actual
cancelarGeneracion();
```

## Servicio de API: reportes-pdf.service.ts

### Funciones Principales

#### 1. generarReportePdf()
Genera un reporte PDF desde el backend

```typescript
const response = await generarReportePdf(
  '/api/reportes/justicia-civica',
  {
    fechaInicio: '2025-01-01',
    fechaFin: '2025-01-31',
    periodo: 'mes'
  },
  'Justicia Cívica'
);

if (response.success && response.blob) {
  descargarPdf(response.blob, response.filename);
}
```

#### 2. descargarPdf()
Descarga un blob de PDF en el navegador

```typescript
descargarPdf(pdfBlob, 'reporte-justicia-civica-2025-01.pdf');
```

#### 3. previsualizarPdf()
Abre el PDF en una nueva ventana para preview

```typescript
previsualizarPdf(pdfBlob);
```

#### 4. validarFiltros()
Valida que los filtros sean correctos antes de enviar al backend

```typescript
const valido = validarFiltros({
  fechaInicio: '2025-01-01',
  fechaFin: '2025-01-31'
});
```

## Control de Acceso

### Roles Permitidos
- ✅ **SuperAdmin**: Acceso completo
- ✅ **Administrador**: Acceso completo
- ✅ **Superior**: Acceso completo
- ❌ **Elemento**: SIN ACCESO

### Implementación
```typescript
const hasAccess = useMemo(() => canAccessSuperior(getUserRoles()), []);
```

## Configuración de Reportes

### Ubicación
`config/reportesConfig.tsx`

### Agregar Nuevo Reporte

```typescript
{
  id: 'mi-nuevo-reporte',
  titulo: 'Mi Nuevo Reporte',
  descripcion: 'Descripción del reporte',
  icono: <MiIconoSVG />,
  habilitado: true,
  color: '#c2b186',
  endpoint: '/api/reportes/mi-reporte',
  tipo: 'general',
  requiereFiltros: true
}
```

### Deshabilitar Reporte

```typescript
{
  id: 'mi-reporte',
  habilitado: false, // Se muestra badge "Próximamente"
  // ... resto de config
}
```

## Interfaces TypeScript

### IReporteCard
```typescript
interface IReporteCard {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  habilitado: boolean;
  color?: string;
  endpoint: string;
  tipo?: 'justicia-civica' | 'probable-delictivo' | 'general' | 'usuarios' | 'personalizado';
  requiereFiltros?: boolean;
  parametros?: Record<string, any>;
}
```

### IReporteFiltros
```typescript
interface IReporteFiltros {
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  periodo?: 'dia' | 'semana' | 'mes' | 'anio' | 'personalizado';
  usuarioId?: string;
  tipoIph?: 'justicia-civica' | 'probable-delictivo' | 'todos';
  [key: string]: any;
}
```

### IReporteEstado
```typescript
interface IReporteEstado {
  generando: boolean;
  progreso?: number;
  mensaje?: string;
  error?: string | null;
  reporteId?: string | null;
}
```

## Optimizaciones Implementadas

### Performance
1. **Componentes memoizados**: `ReportesHeader`, `ReportesGrid`, `ReporteCard`
2. **Callbacks optimizados**: `useCallback` en handlers
3. **Cálculos memoizados**: `useMemo` para métricas
4. **Animaciones GPU**: `transform` y `opacity`

### Accesibilidad
1. **ARIA labels**: `aria-label`, `aria-disabled`
2. **Keyboard navigation**: `tabIndex`, `onKeyDown`
3. **Roles semánticos**: `role="button"`
4. **Focus visible**: Outline claro en focus

### Seguridad
1. **Sanitización de inputs**: Uso de `sanitizeInput()` en filtros
2. **Validación de filtros**: Antes de enviar al backend
3. **Logging completo**: Todas las operaciones se loggean
4. **Timeout configurable**: 2 minutos por defecto

## Ejemplo de Uso

```tsx
import ReportesPdf from './components/private/components/reportes-pdf';

// En Router
<Route path="reportes-pdf" element={<ReportesPdf />} />
```

## Integración con Backend

### Requisitos del Backend

Los endpoints del backend deben:
1. Aceptar POST con filtros en el body
2. Retornar un blob de PDF
3. Incluir header `Content-Type: application/pdf`
4. Incluir header `Content-Disposition` con nombre de archivo (opcional)

### Ejemplo de Endpoint Backend (Node.js + Express)

```javascript
router.post('/api/reportes/justicia-civica', async (req, res) => {
  try {
    const filtros = req.body;

    // Generar PDF con los filtros
    const pdfBuffer = await generarPdfJusticiaCivica(filtros);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-jc.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Próximas Mejoras

- [ ] Modal con filtros avanzados para reportes
- [ ] Histórico de reportes generados
- [ ] Programación de reportes automáticos
- [ ] Envío de reportes por correo
- [ ] Templates personalizables
- [ ] Reportes en otros formatos (Excel, CSV)

## Troubleshooting

### El PDF no se descarga
- Verificar que el endpoint del backend esté respondiendo
- Verificar que el backend retorne `Content-Type: application/pdf`
- Revisar console del navegador para errores
- Verificar que no esté bloqueado el popup (si usas previsualizar)

### Error de timeout
- Aumentar `REPORTES_TIEMPOS.TIMEOUT_GENERACION` en `constants.ts`
- Optimizar generación en el backend
- Usar cache en el backend si es posible

### Reportes no aparecen
- Verificar que `habilitado: true` en `reportesConfig.tsx`
- Verificar que el usuario tenga los permisos correctos
- Revisar logs del helper de roles

## Changelog

### v1.0.0 (2025-11-04)
- ✅ Componente completo implementado
- ✅ 8 tipos de reportes configurados
- ✅ Sistema de generación desde backend
- ✅ Validación de acceso por roles
- ✅ Estados de loading y error
- ✅ Descarga y preview de PDFs
- ✅ Componentes atómicos con memoización
- ✅ Documentación completa

---

**Última actualización**: 2025-11-04
**Versión**: 1.0.0
**Autor**: Senior Full-Stack Developer
