# Solución al Problema de "Rebote" del Scroll

## 🐛 Problema Original

Cuando el usuario hace scroll lento hacia arriba o abajo, el filtro cambia entre modo normal y modo compacto, causando:

1. **Rebote del scroll** - La barra de scroll "salta" al cambiar el tamaño del filtro
2. **Magnetismo** - El scroll parece "pegarse" cerca del threshold
3. **Pérdida de fluidez** - La interfaz se siente errática e impredecible

### **Causa Raíz**

Cuando el filtro cambia de altura (por ejemplo, de 150px a 80px):
- El navegador ajusta automáticamente la posición del scroll
- El contenido "salta" visualmente hacia arriba o abajo
- El listener de scroll detecta el cambio y puede volver a cambiar el estado
- Esto crea un **bucle de rebote**

---

## ✅ Solución Implementada

### **1. Hysteresis (Histéresis)**

Implementamos diferentes thresholds para activar y desactivar el modo compacto:

```typescript
const THRESHOLD_ACTIVATE = 20;   // Píxeles para ACTIVAR modo compacto
const THRESHOLD_DEACTIVATE = 5;  // Píxeles para DESACTIVAR modo compacto
```

**Cómo funciona:**
```
Scroll Position:
  0px ────────────── Estado inicial (modo normal)
  ↓
  5px ────────────── Threshold desactivar (↑ si viene de modo compacto)
  │
  │  [ZONA NEUTRA]  ← No cambia estado si está dentro
  │
 20px ────────────── Threshold activar (↓ para modo compacto)
  ↓
 50px ────────────── Modo compacto activo
```

**Beneficios:**
- ✅ Evita cambios rápidos cerca del límite
- ✅ Crea una "zona de amortiguación" de 15px
- ✅ El estado solo cambia cuando hay movimiento intencional

---

### **2. Compensación de Scroll**

Cuando el filtro cambia de altura, compensamos el scroll para mantener la posición visual:

```typescript
// Guardar altura ANTES del cambio
const heightBefore = filtrosElement.offsetHeight;

// Aplicar cambio de clases (modo compacto/normal)
filtrosElement.classList.add('is-stuck', 'is-compact');

// Esperar que el DOM se actualice
requestAnimationFrame(() => {
  const heightAfter = filtrosElement.offsetHeight;
  const heightDifference = heightBefore - heightAfter;

  // Ajustar scroll para compensar
  if (Math.abs(heightDifference) > 1) {
    scrollContainer.scrollTop = scrollTop + heightDifference;
  }
});
```

**Ejemplo:**

```
ANTES:                      DESPUÉS (sin compensación):
┌──────────────┐           ┌──────────────┐
│ Filtro 150px │           │ Filtro 80px  │  ← Filtro se redujo 70px
└──────────────┘           └──────────────┘
┌──────────────┐           ┌──────────────┐
│              │           │              │  ← Contenido "salta" 70px arriba
│   Gráfica    │           │   Gráfica    │     (PROBLEMA)
│              │           │              │
└──────────────┘           └──────────────┘

DESPUÉS (con compensación):
┌──────────────┐
│ Filtro 80px  │  ← Filtro se redujo 70px
└──────────────┘
                   ← Ajustamos scroll +70px
┌──────────────┐
│              │  ← Contenido se mantiene en misma
│   Gráfica    │     posición visual (CORRECTO ✅)
│              │
└──────────────┘
```

**Beneficios:**
- ✅ El contenido permanece visualmente estable
- ✅ No hay "saltos" perceptibles
- ✅ La experiencia es fluida y predecible

---

### **3. RequestAnimationFrame Doble**

Usamos dos niveles de `requestAnimationFrame`:

```typescript
// Nivel 1: Detectar scroll
rafId = requestAnimationFrame(() => {
  // Aplicar cambio de clases

  // Nivel 2: Compensar altura
  requestAnimationFrame(() => {
    // Ajustar scrollTop
  });
});
```

**Por qué dos niveles:**
1. **Primer frame**: El navegador aplica las clases CSS
2. **Segundo frame**: El navegador recalcula layout (altura nueva)
3. **Solo entonces**: Podemos medir `offsetHeight` correctamente

---

### **4. Throttle Optimizado**

Reducimos el throttle de 100ms a 16ms (~60fps):

```typescript
const throttledScroll = throttle(handleScroll, 16);
```

**Beneficios:**
- ✅ Más responsivo (60 llamadas/seg máximo)
- ✅ Sincronizado con refresh rate del monitor
- ✅ Menor latencia percibida

---

### **5. Transiciones CSS Optimizadas**

Cambiamos de `transition: all` a transiciones específicas:

```css
/* ANTES (lento y poco específico) */
transition: all 0.3s ease;

/* DESPUÉS (rápido y preciso) */
transition: padding 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

**cubic-bezier(0.4, 0, 0.2, 1)** = Material Design "ease-out"
- Comienza rápido
- Termina suave
- Sensación natural

---

## 📊 Resultados

### **Antes:**
- ❌ Rebote del scroll al cambiar modo
- ❌ Bucle infinito cerca del threshold
- ❌ Contenido "salta" visualmente
- ❌ Scroll se reinicia inesperadamente
- ❌ Barra de progreso errática

### **Después:**
- ✅ Transición fluida sin rebote
- ✅ Estado estable en zona neutra
- ✅ Contenido permanece en posición visual
- ✅ Scroll continuo y predecible
- ✅ Barra de progreso suave

---

## 🧪 Cómo Probar

### **Test 1: Scroll Lento Hacia Abajo**
1. Abrir el modal de estadísticas
2. Hacer scroll **muy lento** hacia abajo
3. **Verificar**: El filtro se compacta sin que el contenido "salte"
4. **Verificar**: No hay rebote del scroll

### **Test 2: Scroll Lento Hacia Arriba**
1. Estar en modo compacto (scroll abajo)
2. Hacer scroll **muy lento** hacia arriba
3. **Verificar**: El filtro se expande sin que el contenido "salte"
4. **Verificar**: No hay bucle de cambios entre estados

### **Test 3: Zona Neutra**
1. Hacer scroll hasta ~15px (entre thresholds)
2. Detener el scroll
3. **Verificar**: El estado NO cambia continuamente
4. **Verificar**: El filtro permanece estable

### **Test 4: Barra de Progreso**
1. Abrir DevTools → Console
2. Observar la barra de scroll lateral
3. Hacer scroll lento continuo
4. **Verificar**: La barra crece de forma continua
5. **Verificar**: NO hay saltos o reinicios

---

## ⚙️ Configuración Ajustable

### **Thresholds de Hysteresis**

```typescript
// En EstadisticasJC.tsx línea 88-89
const THRESHOLD_ACTIVATE = 20;    // Aumentar para activar más tarde
const THRESHOLD_DEACTIVATE = 5;   // Disminuir para desactivar antes
```

**Recomendaciones:**
- **Gap pequeño (10-15px)**: Respuesta más rápida, puede ser inestable
- **Gap medio (15-20px)**: Balance perfecto ✅ (actual)
- **Gap grande (20-30px)**: Muy estable, pero menos responsivo

### **Throttle del Scroll**

```typescript
// En EstadisticasJC.tsx línea 151
const throttledScroll = throttle(handleScroll, 16);
```

**Valores sugeridos:**
- **8ms**: Muy fluido, alto CPU (120fps)
- **16ms**: Perfecto ✅ (60fps - actual)
- **32ms**: Suave, bajo CPU (30fps)

---

## 🔧 Debugging

### **Si el scroll sigue rebotando:**

1. **Aumentar el gap de hysteresis:**
   ```typescript
   const THRESHOLD_ACTIVATE = 25;
   const THRESHOLD_DEACTIVATE = 5;
   // Gap = 20px
   ```

2. **Verificar que la compensación funciona:**
   ```typescript
   // Agregar log temporal
   console.log('Height diff:', heightDifference);
   console.log('ScrollTop before:', scrollTop);
   console.log('ScrollTop after:', scrollContainer.scrollTop);
   ```

3. **Revisar transiciones CSS:**
   ```css
   /* Asegurar que no haya 'transition: all' */
   /* Buscar y reemplazar con transiciones específicas */
   ```

### **Si el modo compacto no se activa:**

1. **Reducir threshold de activación:**
   ```typescript
   const THRESHOLD_ACTIVATE = 15; // Probar con valor menor
   ```

2. **Verificar selector del contenedor:**
   ```typescript
   console.log('Scroll container:', scrollContainer);
   console.log('Container scrollTop:', scrollContainer?.scrollTop);
   ```

---

## 📚 Conceptos Técnicos

### **Hysteresis (Histéresis)**
Fenómeno donde el estado de un sistema depende de su historia. En UX:
- Evita oscilaciones rápidas entre estados
- Crea zonas de estabilidad
- Mejora la predictibilidad

### **Scroll Compensation**
Técnica para mantener la posición visual del contenido cuando elementos sticky/fixed cambian de tamaño:
- Medir altura antes del cambio
- Aplicar el cambio
- Ajustar `scrollTop` por la diferencia
- Resultado: contenido "anclado" visualmente

### **Double RAF (RequestAnimationFrame)**
Patrón para garantizar que los cálculos de layout sean precisos:
- **RAF 1**: Cambio de DOM (agregar/quitar clases)
- **RAF 2**: Navegador recalcula layout
- **Entonces**: Medir propiedades como `offsetHeight`

---

## 🚀 Mejoras Futuras

- [ ] Implementar `IntersectionObserver` como alternativa más eficiente
- [ ] Usar `ResizeObserver` para detectar cambios de altura automáticamente
- [ ] Agregar soporte para scroll horizontal
- [ ] Implementar smooth scrolling nativo con `scroll-behavior: smooth`
- [ ] Optimizar con CSS `content-visibility` para elementos fuera de viewport

---

## 📖 Referencias

- [MDN: Scroll Anchoring](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-anchor)
- [Web.dev: Hysteresis in UX](https://web.dev/articles/building-a-switch-component#hysteresis)
- [CSS Tricks: Sticky Headers](https://css-tricks.com/position-sticky-and-table-headers/)

---

**Autor**: Claude Code Assistant
**Fecha**: 2025-10-10
**Versión**: 2.0.0 - Scroll Bounce Fix
