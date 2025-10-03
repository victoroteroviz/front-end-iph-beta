# 📊 Resumen de Configuración de Estadísticas

## ✅ Estructura Creada

```
src/components/private/components/statistics/config/
├── index.ts                  ← Exportaciones centralizadas
├── statisticsConfig.tsx      ← Configuración de tarjetas (ARCHIVO PRINCIPAL)
├── constants.ts              ← Constantes y utilidades
├── examples.tsx              ← Ejemplos de nuevas tarjetas
└── README.md                 ← Documentación completa
```

## 🎯 Archivos Principales

### 1. **statisticsConfig.tsx** 
**Archivo para editar las tarjetas**

Este es el archivo que debes modificar para:
- ✏️ Agregar nuevas tarjetas de estadísticas
- 🎨 Cambiar colores de tarjetas existentes
- 📝 Editar títulos y descripciones
- ⚡ Habilitar/deshabilitar tarjetas
- 🔗 Actualizar rutas de navegación

### 2. **constants.ts**
Constantes reutilizables para mantener consistencia:
- Paleta de colores (`STATISTICS_COLORS`)
- Rutas predefinidas (`STATISTICS_ROUTES`)
- Funciones helper útiles

### 3. **examples.tsx**
Plantillas de tarjetas listas para copiar y pegar.

## 🚀 Cómo Agregar una Nueva Tarjeta (Guía Rápida)

1. **Abre el archivo**: `statisticsConfig.tsx`

2. **Copia este código** y pégalo dentro del array `statisticsCardsConfig`:

```typescript
{
  id: 'mi-estadistica',                    // ← ID único
  titulo: 'Mi Nueva Estadística',          // ← Título visible
  descripcion: 'Descripción breve',        // ← Descripción
  icono: (                                 // ← Icono SVG (de Heroicons)
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="stat-icon">
      <path strokeLinecap="round" strokeLinejoin="round" d="..." />
    </svg>
  ),
  habilitado: true,                        // ← true o false
  color: STATISTICS_COLORS.SUCCESS,        // ← Usar constante de color
  ruta: '/estadisticas/mi-estadistica'     // ← Ruta de navegación
}
```

3. **Personaliza** los valores según tus necesidades

4. **Guarda** el archivo

5. **¡Listo!** La tarjeta aparecerá automáticamente

## 🎨 Colores Disponibles

Usa `STATISTICS_COLORS` para mantener consistencia:

```typescript
// Colores IPH
STATISTICS_COLORS.IPH_PRIMARY     // Dorado/beige principal
STATISTICS_COLORS.IPH_SECONDARY   // Beige claro
STATISTICS_COLORS.IPH_DARK        // Marrón oscuro

// Colores de estado
STATISTICS_COLORS.SUCCESS         // Verde
STATISTICS_COLORS.WARNING         // Ámbar/Amarillo
STATISTICS_COLORS.DANGER          // Rojo
STATISTICS_COLORS.INFO            // Cyan

// Colores adicionales
STATISTICS_COLORS.INDIGO
STATISTICS_COLORS.VIOLET
STATISTICS_COLORS.PURPLE
STATISTICS_COLORS.PINK
STATISTICS_COLORS.ORANGE
STATISTICS_COLORS.EMERALD
```

## 📦 Funciones Útiles

```typescript
import { 
  getEnabledStatisticCards,     // Obtener solo tarjetas habilitadas
  getDisabledStatisticCards,    // Obtener solo tarjetas deshabilitadas
  getStatisticCardById,         // Buscar tarjeta por ID
  getColorByCategory,           // Obtener color por categoría
  titleToId,                    // Convertir título a ID
  generateRouteFromTitle        // Generar ruta desde título
} from './config';
```

## 💡 Ejemplos Comunes

### Deshabilitar temporalmente una tarjeta

```typescript
{
  id: 'marketing',
  titulo: 'Estadísticas de Marketing',
  descripcion: '...',
  icono: <svg>...</svg>,
  habilitado: false,  // ← Cambiar a false
  color: STATISTICS_COLORS.ORANGE,
  ruta: '/estadisticas/marketing'
}
```

### Cambiar el color de una tarjeta

```typescript
{
  id: 'ventas',
  titulo: 'Estadísticas de Ventas',
  descripcion: '...',
  icono: <svg>...</svg>,
  habilitado: true,
  color: STATISTICS_COLORS.DANGER,  // ← Cambiar aquí
  ruta: '/estadisticas/ventas'
}
```

### Agregar categoría al título

```typescript
{
  id: 'ventas-mensuales',
  titulo: 'Ventas Mensuales',  // ← Título más específico
  descripcion: 'Análisis detallado de ventas por mes',
  icono: <svg>...</svg>,
  habilitado: true,
  color: STATISTICS_COLORS.SUCCESS,
  ruta: '/estadisticas/ventas-mensuales'
}
```

## 🔍 Recursos para Iconos

- **Heroicons**: https://heroicons.com/ (Recomendado - consistente con el proyecto)
- **Lucide Icons**: https://lucide.dev/
- **Remix Icon**: https://remixicon.com/

## 📚 Documentación Completa

Para más detalles, consulta: `./config/README.md`

## ⚠️ Notas Importantes

1. **IDs únicos**: Asegúrate de que cada tarjeta tenga un `id` único
2. **Consistencia**: Usa las constantes de colores para mantener consistencia visual
3. **Clase CSS**: Mantén `className="stat-icon"` en todos los SVG
4. **Testing**: Prueba con `habilitado: false` antes de publicar nuevas funciones
5. **Orden**: Las tarjetas se muestran en el orden del array

## 🛠️ Solución de Problemas

**Problema**: La tarjeta no aparece
- ✅ Verifica que el objeto esté dentro del array `statisticsCardsConfig`
- ✅ Revisa que la sintaxis del objeto sea correcta (comas, llaves)

**Problema**: El icono no se muestra
- ✅ Asegúrate de incluir `className="stat-icon"` en el SVG
- ✅ Verifica que el path del SVG sea válido

**Problema**: El color no se aplica
- ✅ Usa constantes de `STATISTICS_COLORS`
- ✅ Verifica que el color sea un string hexadecimal válido

---

**¿Necesitas ayuda?** Consulta `examples.tsx` para ver plantillas listas para usar.
