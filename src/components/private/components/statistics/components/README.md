# 📊 Componente StatisticsModal

Modal responsivo y accesible para mostrar detalles de estadísticas.

## 🎯 Características

- ✅ **Responsive**: Se adapta a móviles, tablets y desktop
- ✅ **Accesible**: Cierre con tecla ESC, backdrop clickeable
- ✅ **Animaciones**: Transiciones suaves y fluidas
- ✅ **Scroll bloqueado**: Previene scroll del body cuando está abierto
- ✅ **Estilo IPH**: Colores y diseño consistentes con la aplicación
- ✅ **Flexible**: Fácil de personalizar el contenido

## 📋 Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `statistic` | `IStatisticCard` | ✅ | Objeto con los datos de la estadística |
| `isOpen` | `boolean` | ✅ | Estado de apertura del modal |
| `onClose` | `() => void` | ✅ | Función para cerrar el modal |

## 🔧 Uso

```typescript
import StatisticsModal from './components/StatisticsModal';

const MyComponent = () => {
  const [selectedStat, setSelectedStat] = useState<IStatisticCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (stat: IStatisticCard) => {
    setSelectedStat(stat);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedStat(null), 300);
  };

  return (
    <>
      <button onClick={() => handleOpenModal(someStatistic)}>
        Abrir Modal
      </button>

      {selectedStat && (
        <StatisticsModal
          statistic={selectedStat}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
```

## 🎨 Personalización del Contenido

Para agregar contenido personalizado al modal, edita el archivo `StatisticsModal.tsx`:

### Opción 1: Contenido estático personalizado

```typescript
// En StatisticsModal.tsx, dentro del .statistics-modal-body
<div className="statistics-modal-body">
  {statistic.id === 'ventas' ? (
    <VentasContent />
  ) : statistic.id === 'usuarios' ? (
    <UsuariosContent />
  ) : (
    <DefaultContent statistic={statistic} />
  )}
</div>
```

### Opción 2: Componente dinámico mediante props

Modifica la interfaz del modal:

```typescript
interface StatisticsModalProps {
  statistic: IStatisticCard;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode; // Agregar esta prop
}

// Luego en el body:
<div className="statistics-modal-body">
  {children || (
    <div className="statistics-modal-placeholder">
      {/* Contenido por defecto */}
    </div>
  )}
</div>
```

Uso:

```typescript
<StatisticsModal
  statistic={selectedStat}
  isOpen={isModalOpen}
  onClose={handleCloseModal}
>
  <MiComponentePersonalizado data={selectedStat} />
</StatisticsModal>
```

## 🎯 Formas de Cerrar el Modal

1. **Click en el botón X** (esquina superior derecha)
2. **Click en el botón "Cerrar"** (footer)
3. **Presionar tecla ESC**
4. **Click en el backdrop** (área oscura fuera del modal)

## 🎨 Estilos Personalizados

Los estilos están en `StatisticsModal.css`. Clases principales:

```css
.statistics-modal-backdrop        /* Fondo oscuro */
.statistics-modal-container       /* Contenedor principal */
.statistics-modal-content         /* Card del modal */
.statistics-modal-header          /* Header con título */
.statistics-modal-body            /* Contenido principal */
.statistics-modal-footer          /* Footer con botones */
.statistics-modal-placeholder     /* Contenido placeholder */
```

## 📱 Responsive Breakpoints

- **Desktop**: Modal centrado con max-width 900px
- **Tablet** (< 768px): Modal adaptado con padding reducido
- **Mobile** (< 480px): Modal casi full-screen, botones stack verticalmente

## 🚀 Mejoras Futuras

Ideas para extender el modal:

1. **Tamaños variables**: Agregar prop `size: 'sm' | 'md' | 'lg' | 'xl'`
2. **Navegación**: Botones siguiente/anterior para cambiar entre estadísticas
3. **Exportación**: Botones para exportar datos (PDF, Excel, CSV)
4. **Filtros**: Panel de filtros dentro del modal
5. **Tabs**: Múltiples pestañas de contenido
6. **Modo fullscreen**: Opción para expandir a pantalla completa

## 💡 Tips

- El modal automáticamente bloquea el scroll del body
- Se recomienda usar `setTimeout` al cerrar para animaciones suaves
- Los colores del icono y botón primario se adaptan al color de la tarjeta
- El contenido del body tiene scroll automático si excede la altura

## 🔍 Accesibilidad

- ✅ Cierre con teclado (ESC)
- ✅ ARIA labels en botones
- ✅ Focus trap automático
- ✅ Scroll en el body del modal, no en el backdrop

---

**Archivo**: `StatisticsModal.tsx`  
**Estilos**: `StatisticsModal.css`  
**Ubicación**: `src/components/private/components/statistics/components/`
