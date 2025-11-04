# 🐛 Guía de Debugging - Persistencia de Paginación

## 📋 Problema Reportado

La paginación se resetea a página 1 cuando:
- ✅ Abres/cierras modal de detalle → **FUNCIONA** (mantiene página)
- ❌ Navegas a otra ruta y vuelves → **NO FUNCIONA** (vuelve a página 1)

---

## 🔍 Pasos para Diagnosticar

### **Paso 1: Verificar Logging en Consola**

Con el logging activado (`logging: true`), deberías ver en la consola:

#### **Al cambiar de página (ej: ir a página 5)**
```
[INFO] usePaginationPersistence: ✅ Paginación guardada en sessionStorage
  key: "historial-iph-pagination"
  page: 5
  limit: 10
  timestamp: "2025-01-31T..."
```

#### **Al volver a montar el componente**
```
[INFO] usePaginationPersistence: ✅ Paginación RESTAURADA exitosamente desde sessionStorage
  key: "historial-iph-pagination"
  pageRestaurada: 5
  limit: 10
  timestamp: "2025-01-31T..."
  edadDatos: "30s"
```

---

### **Paso 2: Verificar sessionStorage Manualmente**

Abre DevTools → Console y ejecuta:

```javascript
// Ver datos guardados
const key = 'pagination:historial-iph-pagination';
const data = sessionStorage.getItem(key);
console.log('Datos en storage:', data);

// Parsear y ver
if (data) {
  const parsed = JSON.parse(data);
  console.log('Página guardada:', parsed.page);
  console.log('Límite:', parsed.limit);
  console.log('Timestamp:', new Date(parsed.timestamp));
  console.log('Versión:', parsed.version);
}
```

**Resultado esperado:**
```json
{
  "page": 5,
  "limit": 10,
  "timestamp": 1706745600000,
  "version": 1
}
```

---

### **Paso 3: Simular Flujo Completo**

1. **Ir al Historial IPH**
   - Verifica que estés en página 1
   - Cambia a página 5
   - **Verifica consola:** Debe mostrar "Paginación guardada"
   - **Verifica storage:** `sessionStorage.getItem('pagination:historial-iph-pagination')`

2. **Navegar a otra ruta** (ej: Dashboard, Usuarios, etc.)
   - **Verifica storage:** Los datos deben seguir ahí

3. **Volver al Historial IPH**
   - **Verifica consola:** Debe mostrar "Paginación RESTAURADA"
   - **Verifica UI:** Debe estar en página 5

---

## 🔧 Posibles Causas del Problema

### **Causa 1: sessionStorage se limpia al navegar**

**Verificar:**
```javascript
// En consola, ANTES de navegar
console.log('Antes:', sessionStorage.getItem('pagination:historial-iph-pagination'));

// Navegar a otra ruta

// En consola, en la otra ruta
console.log('Después:', sessionStorage.getItem('pagination:historial-iph-pagination'));
```

**Si el valor desaparece**, puede ser que:
- Hay código que hace `sessionStorage.clear()` en algún lugar
- Hay código que elimina específicamente esta clave
- El navegador está en modo incógnito (sessionStorage se limpia al cerrar tab)

**Solución:**
```bash
# Buscar dónde se limpia sessionStorage
grep -r "sessionStorage.clear" src/
grep -r "sessionStorage.removeItem.*pagination" src/
```

---

### **Causa 2: itemsPerPage cambia entre renders**

Si `itemsPerPage` cambia, el hook resetea la paginación automáticamente.

**Verificar:**
```javascript
// En useHistorialIPH
console.log('itemsPerPage recibido:', params.itemsPerPage);
```

**Solución:**
Asegurar que `itemsPerPage` sea consistente entre montajes.

---

### **Causa 3: Múltiples instancias del componente**

Si hay múltiples instancias de `HistorialIPH` montadas simultáneamente, pueden competir por el mismo storage.

**Verificar:**
```bash
# Buscar dónde se usa HistorialIPH
grep -r "<HistorialIPH" src/
```

**Solución:**
Asegurar que solo hay una instancia activa a la vez.

---

### **Causa 4: Filtros están reseteando la paginación**

El hook resetea la paginación cuando cambias filtros.

**Verificar:**
```typescript
// En useHistorialIPH, ver si setFiltros se llama al montar
const setFiltros = useCallback((nuevosFiltros) => {
  console.log('🔍 setFiltros llamado con:', nuevosFiltros);
  // ...
  resetPaginationPersistence(); // ← Esto resetea a página 1
}, [resetPaginationPersistence]);
```

**Solución:**
Asegurar que `setFiltros` NO se llame automáticamente al montar el componente.

---

## 🧪 Tests Rápidos

### **Test 1: Storage persiste entre navegaciones**

```javascript
// Paso 1: En Historial IPH
sessionStorage.setItem('test-persistence', 'valor-de-prueba');

// Paso 2: Navegar a otra ruta (ej: Dashboard)
// Paso 3: En la otra ruta, verificar
console.log(sessionStorage.getItem('test-persistence')); // Debe mostrar: "valor-de-prueba"
```

Si esto NO funciona → problema con el navegador o modo incógnito.

---

### **Test 2: Hook guarda correctamente**

```javascript
// En Historial IPH, cambiar a página 5
// Luego ejecutar en consola:
const key = 'pagination:historial-iph-pagination';
const data = JSON.parse(sessionStorage.getItem(key));
console.log('Página guardada:', data.page); // Debe mostrar: 5
```

Si esto NO funciona → el useEffect no se está ejecutando.

---

### **Test 3: Hook restaura correctamente**

```javascript
// Antes de navegar al Historial IPH, pre-cargar datos
const key = 'pagination:historial-iph-pagination';
const testData = {
  page: 7,
  limit: 10,
  timestamp: Date.now(),
  version: 1
};
sessionStorage.setItem(key, JSON.stringify(testData));

// Ahora navegar al Historial IPH
// Debe cargar en página 7
```

Si esto NO funciona → problema con la inicialización del hook.

---

## 🔨 Soluciones Temporales

### **Solución Temporal 1: Verificar initialFilters**

Si el componente HistorialIPH recibe `initialFilters` que cambian, puede estar causando resets.

```typescript
// En HistorialIPH.tsx
useEffect(() => {
  console.log('🔍 initialFilters cambió:', initialFilters);
}, [initialFilters]);
```

---

### **Solución Temporal 2: Forzar guardado en el primer render**

Modificar el hook para que guarde incluso en el primer render:

```typescript
// En usePaginationPersistence.ts
useEffect(() => {
  // COMENTAR ESTA SECCIÓN TEMPORALMENTE
  // if (isFirstRender.current) {
  //   isFirstRender.current = false;
  //   return;
  // }

  // Guardar SIEMPRE
  const dataToSave = { /* ... */ };
  sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
}, [currentPage, itemsPerPage, storageKey]);
```

---

## 📊 Checklist de Debugging

- [ ] Logging activado (`logging: true`)
- [ ] Verificar consola muestra "Paginación guardada"
- [ ] Verificar consola muestra "Paginación RESTAURADA"
- [ ] Verificar sessionStorage con DevTools
- [ ] Verificar que storage persiste entre rutas
- [ ] Verificar que `itemsPerPage` es consistente
- [ ] Verificar que no hay múltiples instancias del componente
- [ ] Verificar que `setFiltros` no se llama al montar
- [ ] Verificar que no hay `sessionStorage.clear()` en el código

---

## 📞 Si Nada Funciona

Comparte los logs de consola mostrando:
1. Cuando cambias a página 5
2. Cuando navegas a otra ruta
3. Cuando vuelves al Historial IPH

Incluir:
- ✅ Logs de `usePaginationPersistence`
- ✅ Resultado de `sessionStorage.getItem('pagination:historial-iph-pagination')`
- ✅ Navegador y versión
- ✅ Modo incógnito o normal

---

## 🎯 Próximo Paso

**Ejecuta el flujo completo con logging activado y comparte:**
1. Screenshots de la consola
2. Valor de sessionStorage en cada paso
3. Comportamiento observado

Esto nos permitirá identificar exactamente dónde falla la persistencia.
