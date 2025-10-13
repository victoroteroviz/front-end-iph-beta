# 🎯 Sistema de Auto-Colapsar Filtros con Scroll

## ✨ **Funcionalidad Implementada**

Los filtros de fecha ahora se **colapsan automáticamente** cuando el usuario hace scroll hacia abajo, y se **expanden automáticamente** cuando vuelve al inicio del modal.

---

## 🎬 **Comportamiento**

### **Estado Inicial (Modal Abierto)**
```
📅 Filtros de Fecha              [▼]
┌───────────────────────────────────┐
│  Año:  [2025]  Mes: [10]  Día: [13]│
└───────────────────────────────────┘
↓ Usuario puede ver y cambiar filtros
```

### **Usuario Hace Scroll Hacia Abajo (> 80px)**
```
📅 Filtros de Fecha  13/10/2025  [▲]  ← Colapsado
                                        automáticamente
┌─ Contenido Scrolleable ────────────┐
│  📊 Gráficas                        │
│  📈 Más datos                       │
│  ...                                │
```

### **Usuario Vuelve al Inicio (≤ 80px)**
```
📅 Filtros de Fecha              [▼]  ← Expandido
┌───────────────────────────────────┐   automáticamente
│  Año:  [2025]  Mes: [10]  Día: [13]│
└───────────────────────────────────┘
```

---

## ⚙️ **Implementación Técnica**

### **1. Estado de Expansión**
```typescript
const [filtersExpanded, setFiltersExpanded] = useState<boolean>(true);
```
- Inicia como `true` (expandido)
- Se resetea a `true` cada vez que se abre el modal

### **2. Ref al Body Scrolleable**
```typescript
const modalBodyRef = React.useRef<HTMLDivElement>(null);
```
- Referencia al `.statistics-modal-body`
- Permite escuchar eventos de scroll

### **3. Listener de Scroll**
```typescript
useEffect(() => {
  const modalBody = modalBodyRef.current;
  if (!modalBody || statistic.id !== 'justicia-civica') return;

  const SCROLL_THRESHOLD = 80; // Umbral en píxeles

  const handleScroll = () => {
    const scrollTop = modalBody.scrollTop;

    // Colapsar cuando scroll > 80px
    if (scrollTop > SCROLL_THRESHOLD && filtersExpanded) {
      setFiltersExpanded(false);
    }
    // Expandir cuando scroll ≤ 80px
    else if (scrollTop <= SCROLL_THRESHOLD && !filtersExpanded) {
      setFiltersExpanded(true);
    }
  };

  modalBody.addEventListener('scroll', handleScroll, { passive: true });

  return () => {
    modalBody.removeEventListener('scroll', handleScroll);
  };
}, [statistic.id, filtersExpanded]);
```

### **4. Toggle Manual (Opcional)**
```typescript
const toggleFilters = () => {
  const newState = !filtersExpanded;
  setFiltersExpanded(newState);
  
  // Si se expande manualmente, hacer scroll al inicio
  if (newState && modalBodyRef.current) {
    modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

---

## 📊 **Parámetros Configurables**

### **`SCROLL_THRESHOLD` = 80px**
- Distancia de scroll necesaria para activar el colapso
- **Valores recomendados:**
  - `50px` - Colapsa muy rápido (agresivo)
  - `80px` - Balance ideal (recomendado) ✅
  - `120px` - Colapsa más tarde (suave)

### **Transiciones CSS**
```css
.filters-content {
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.3s ease-out, 
              padding 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```
- `0.4s` - Duración de la animación
- `cubic-bezier(0.4, 0, 0.2, 1)` - Curva de aceleración suave

---

## 🎨 **Efectos Visuales**

### **Filtros Expandidos**
```css
.statistics-modal-filters.expanded .filters-content {
  max-height: 500px;
  opacity: 1;
  padding: 0 2rem 1.25rem 2rem;
}
```

### **Filtros Colapsados**
```css
.statistics-modal-filters.collapsed .filters-content {
  max-height: 0;
  opacity: 0;
  padding: 0 2rem;
  pointer-events: none; /* No clickeable */
}

.statistics-modal-filters.collapsed .filters-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Sombra sutil */
}
```

### **Icono Rotativo**
```css
.filters-toggle-icon.expanded {
  transform: rotate(180deg); /* ▼ apunta abajo */
}

.filters-toggle-icon.collapsed {
  transform: rotate(0deg);   /* ▲ apunta arriba */
}
```

---

## 📜 **Logs de Diagnóstico**

### **Al Inicializar**
```
✅ [StatisticsModal] Sistema de auto-colapsar inicializado
```

### **Durante Scroll**
```
📜 [StatisticsModal] Scroll detectado: {
  scrollTop: "95.00",
  threshold: 80,
  filtersExpanded: true
}

⬇️ [StatisticsModal] Colapsando filtros
```

### **Al Volver al Inicio**
```
📜 [StatisticsModal] Scroll detectado: {
  scrollTop: "45.00",
  threshold: 80,
  filtersExpanded: false
}

⬆️ [StatisticsModal] Expandiendo filtros
```

### **Toggle Manual**
```
🖱️ [StatisticsModal] Toggle manual de filtros: expandido
```

### **Al Cerrar/Limpiar**
```
🔚 [StatisticsModal] Sistema de auto-colapsar limpiado
```

---

## 🎯 **Ventajas de Esta Implementación**

### **1. UX Mejorada**
- ✅ Más espacio para el contenido al hacer scroll
- ✅ Filtros regresan automáticamente al volver arriba
- ✅ No requiere interacción manual del usuario
- ✅ Transiciones suaves y naturales

### **2. Performance Optimizada**
- ✅ Listener con `passive: true` (mejor rendimiento)
- ✅ Solo se activa para Justicia Cívica
- ✅ Limpieza automática al desmontar

### **3. Flexibilidad**
- ✅ También permite toggle manual (click en header)
- ✅ Scroll automático al expandir manualmente
- ✅ Threshold configurable fácilmente

### **4. Accesibilidad**
- ✅ `aria-label` descriptivo en el botón
- ✅ `title` con tooltip explicativo
- ✅ `pointer-events: none` cuando está colapsado

---

## 🔄 **Flujo Completo**

```
1. Usuario abre modal JC
   ↓
2. Filtros se muestran expandidos (por defecto)
   ↓
3. Usuario hace scroll hacia abajo
   ↓
4. Listener detecta scrollTop > 80px
   ↓
5. setFiltersExpanded(false)
   ↓
6. CSS aplica clase .collapsed
   ↓
7. Transición suave (0.4s)
   ↓
8. Filtros colapsados, más espacio para contenido
   ↓
9. Usuario scrollea hacia arriba
   ↓
10. Listener detecta scrollTop ≤ 80px
    ↓
11. setFiltersExpanded(true)
    ↓
12. CSS remueve clase .collapsed
    ↓
13. Transición suave (0.4s)
    ↓
14. Filtros expandidos de nuevo
```

---

## 🎓 **Casos de Uso**

### **Caso 1: Usuario Explorando Datos**
1. Abre modal → Ve filtros
2. Hace scroll para ver gráficas → Filtros se colapsan
3. Sigue scrolleando → Filtros permanecen colapsados
4. Vuelve arriba para cambiar fecha → Filtros se expanden

### **Caso 2: Usuario Cambiando Filtros Rápidamente**
1. Abre modal → Ve filtros
2. Empieza a hacer scroll → Filtros empiezan a colapsar
3. Click en header de filtros → Scroll automático a top + filtros expandidos
4. Cambia fecha → Gráficas se actualizan

### **Caso 3: Pantalla Pequeña (Móvil)**
1. Abre modal → Filtros ocupan poco espacio
2. Hace scroll mínimo → Filtros se colapsan rápido
3. Más espacio para gráficas → Mejor experiencia móvil

---

## ⚠️ **Consideraciones Importantes**

### **1. Solo para Justicia Cívica**
```typescript
if (!modalBody || statistic.id !== 'justicia-civica') return;
```
Otros tipos de estadísticas no tienen este comportamiento.

### **2. Reset al Abrir Modal**
```typescript
if (isOpen) {
  setFiltersExpanded(true); // Siempre inicia expandido
}
```

### **3. No Causa Loop de Scroll**
- Los filtros están **fuera** del área scrolleable
- No cambian el tamaño del contenido scrolleable
- Solo cambian su propia altura, sin afectar el scroll

### **4. Smooth Scroll en Toggle Manual**
```typescript
modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
```
Mejora la experiencia cuando el usuario hace click en el header colapsado.

---

## 🛠️ **Personalización**

### **Cambiar el Umbral**
```typescript
const SCROLL_THRESHOLD = 100; // Más suave
// const SCROLL_THRESHOLD = 50;  // Más agresivo
```

### **Cambiar Velocidad de Animación**
```css
.filters-content {
  transition: max-height 0.6s /* más lento */,
              opacity 0.4s,
              padding 0.6s;
}
```

### **Deshabilitar Toggle Manual**
Simplemente no usar el evento `onClick` en el header:
```typescript
<div className="filters-header">
  {/* Sin onClick */}
</div>
```

---

## ✨ **Resultado Final**

Una experiencia de usuario fluida donde:
- Los filtros **no estorban** cuando el usuario está explorando datos
- Los filtros **siempre están accesibles** al volver al inicio
- Las transiciones son **suaves y naturales**
- El código es **limpio y mantenible**

**¡La solución perfecta para maximizar el espacio de visualización sin sacrificar accesibilidad!** 🎉
