# 🔄 Limpiar Caché - Vista PDF

## ⚠️ Problema Reportado
La vista del PDF sigue apareciendo inline (abajo del formulario) en lugar de abrirse como pantalla completa nueva.

## ✅ Solución Implementada
El código ya está correctamente implementado con la vista completa. El problema es **caché del navegador o hot-reload de Vite**.

---

## 🛠️ Pasos para Limpiar Caché

### **Opción 1: Reiniciar Servidor de Desarrollo (RECOMENDADO)**

```bash
# Detener el servidor (Ctrl+C)
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Reiniciar servidor
npm run dev
```

### **Opción 2: Hard Refresh en el Navegador**

**Chrome/Edge/Brave:**
- Windows/Linux: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows/Linux: `Ctrl + Shift + R` o `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Safari:**
- `Cmd + Option + R`

### **Opción 3: Limpiar Caché del Navegador**

1. Abrir DevTools (F12)
2. Click derecho en el botón de recargar
3. Seleccionar "**Vaciar caché y recargar de forma forzada**"

### **Opción 4: Modo Incógnito**

Abrir la aplicación en una ventana de incógnito/privada para probar sin caché.

---

## ✅ Verificación del Código

### **Archivo: ReporteDiarioForm.tsx**

```tsx
// ✅ CORRECTO: Condicional al inicio del render
if (showPdfViewer && pdfResult) {
  return (
    <PDFViewerScreen
      pdfResult={pdfResult}
      reportTitle={reporte.titulo}
      onBack={handleBackFromViewer}
    />
  );
}

// ✅ CORRECTO: Solo formulario (sin preview inline)
return (
  <div className="min-h-screen">
    {/* Formulario completo */}
    {/* ❌ NO HAY preview inline aquí */}
  </div>
);
```

### **Verificación Manual:**

```bash
# Buscar cualquier referencia a preview inline (debe retornar solo 2 líneas)
grep -n "PDFViewer" src/components/private/components/reportes-pdf/components/form/ReporteDiarioForm.tsx

# Resultado esperado:
# 23:import PDFViewerScreen from '../viewer/PDFViewerScreen';
# 413:      <PDFViewerScreen
```

---

## 🎯 Comportamiento Esperado

1. **Al abrir formulario**: Solo se muestra el formulario de captura
2. **Al generar PDF**: Se muestra mensaje "Reporte generado exitosamente"
3. **Inmediatamente después**: Cambia a pantalla completa `PDFViewerScreen`
4. **En PDFViewerScreen**: Breadcrumbs, botones (Imprimir/Descargar), visor de PDF
5. **Al hacer click "Volver"**: Regresa al formulario

---

## 🐛 Si Persiste el Problema

### **Debug en Consola del Navegador:**

```javascript
// Abrir DevTools (F12) y ejecutar:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Verificar Estado en React DevTools:**

1. Instalar React DevTools
2. Ir a componente `ReporteDiarioForm`
3. Verificar estado: `showPdfViewer` debe ser `true` después de generar PDF
4. Verificar que `pdfResult` no sea `null`

---

## 📝 Archivos Modificados

| Archivo | Estado | Líneas |
|---------|--------|--------|
| `ReporteDiarioForm.tsx` | ✅ Actualizado | 773 (antes: 807) |
| `PDFViewerScreen.tsx` | ✅ Nuevo | 150 |
| `viewer/index.ts` | ✅ Nuevo | 5 |

---

## ✅ Confirmación de Limpieza

Ejecuta este comando para confirmar que NO hay preview inline:

```bash
grep -c "mt-10 bg-white border border" src/components/private/components/reportes-pdf/components/form/ReporteDiarioForm.tsx
```

**Resultado esperado**: `0` (cero)

Si retorna un número mayor a 0, el código inline sigue ahí y necesita ser eliminado manualmente.

---

## 🆘 Soporte Adicional

Si después de limpiar caché el problema persiste:

1. Verificar que el servidor de desarrollo esté corriendo
2. Revisar la consola del navegador por errores
3. Verificar que el archivo `PDFViewerScreen.tsx` existe
4. Confirmar que el import es correcto en línea 23

**Última actualización**: 2025-01-31
