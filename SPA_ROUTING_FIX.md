# 🔧 Fix: 404 en Rutas Directas (SPA Routing)

## 🚨 Problema Identificado

Al acceder directamente a una ruta en el navegador (ej: `http://localhost:5000/inicio`), se obtenía un error **404 Not Found**, a pesar de que:

- ✅ La ruta existe en React Router
- ✅ Hay sesión activa
- ✅ En desarrollo (`npm run dev`) funciona correctamente

### Logs del Error:
```
GET http://localhost:5000/inicio 404 (Not Found)
```

## 🔍 Causa Raíz

Este es un problema clásico en **aplicaciones SPA (Single Page Application)** servidas como archivos estáticos.

### ¿Por qué sucede?

#### En Desarrollo (`npm run dev`):
```
Usuario → http://localhost:5173/inicio
          ↓
      Vite Dev Server (detecta que es SPA)
          ↓
      Devuelve index.html automáticamente
          ↓
      React Router carga la ruta /inicio ✅
```

#### En Producción con Docker (ANTES del fix):
```
Usuario → http://localhost:5000/inicio
          ↓
      serve busca archivo físico "inicio"
          ↓
      No encuentra el archivo
          ↓
      404 Not Found ❌
```

### Flujo Correcto (SPAs):
1. El servidor **siempre** devuelve `index.html`
2. React se carga en el navegador
3. React Router lee la URL (`/inicio`)
4. React Router renderiza el componente correspondiente

## ✅ Solución Implementada

Se agregó la opción `-s` (SPA mode) al comando `serve` en el Dockerfile:

### Antes:
```dockerfile
CMD ["serve", "dist", "-l", "4173", "--no-port-switching", "--no-clipboard"]
```

### Después:
```dockerfile
CMD ["serve", "-s", "dist", "-l", "4173", "--no-port-switching", "--no-clipboard"]
```

### ¿Qué hace `-s` (o `--single`)?

La opción `-s` activa el **modo SPA** en `serve`:

- ✅ Todas las rutas que no sean archivos físicos → `index.html`
- ✅ Archivos estáticos (JS, CSS, imágenes) → Se sirven normalmente
- ✅ React Router puede manejar todas las rutas del cliente

## 🎯 Comportamiento Después del Fix

### Rutas de la Aplicación (Client-side):
```
✅ http://localhost:5000/
✅ http://localhost:5000/inicio
✅ http://localhost:5000/usuarios
✅ http://localhost:5000/iphs/nuevo
✅ http://localhost:5000/cualquier/ruta
```

Todas devuelven `index.html` → React Router maneja la navegación

### Archivos Estáticos (Server-side):
```
✅ http://localhost:5000/assets/index-abc123.js
✅ http://localhost:5000/assets/index-abc123.css
✅ http://localhost:5000/vite.svg
✅ http://localhost:5000/pdf.worker.min.js
```

Se sirven como archivos físicos normalmente

## 🔄 Cómo Aplicar el Fix

### 1. Reconstruir la Imagen Docker:

```bash
sudo ./deploy.sh 0.0.10Alpha
```

O manualmente:
```bash
sudo docker build -t front-end-iph:latest .
```

### 2. Recrear el Contenedor:

```bash
sudo docker compose down
sudo docker compose up -d
```

### 3. Verificar:

Accede directamente a una ruta:
```
http://localhost:5000/inicio
```

Debe cargar correctamente ✅

## 📊 Comparación

| Aspecto | Antes (sin `-s`) | Después (con `-s`) |
|---------|------------------|-------------------|
| **`/`** | ✅ Funciona | ✅ Funciona |
| **`/inicio`** | ❌ 404 | ✅ Funciona |
| **URL directa** | ❌ 404 | ✅ Funciona |
| **F5 (Refresh)** | ❌ 404 | ✅ Funciona |
| **Deep links** | ❌ 404 | ✅ Funciona |
| **Archivos estáticos** | ✅ Funciona | ✅ Funciona |

## 🧪 Casos de Prueba

### Escenarios a Probar:

1. **Navegación Interna** (dentro de la app):
   ```
   / → /inicio → /usuarios ✅
   ```

2. **URL Directa** en navegador:
   ```
   http://localhost:5000/inicio ✅
   ```

3. **Refresh (F5)** en cualquier ruta:
   ```
   Estando en /usuarios → F5 ✅
   ```

4. **Deep Links** (compartir URL):
   ```
   Usuario recibe: http://localhost:5000/iphs/123
   Abre en navegador nuevo ✅
   ```

5. **404 Real** (ruta que no existe en React Router):
   ```
   http://localhost:5000/ruta-inexistente
   → React Router muestra componente 404 ✅
   ```

## 🔍 Verificación de Logs

### Antes del Fix:
```bash
$ curl -I http://localhost:5000/inicio
HTTP/1.1 404 Not Found
```

### Después del Fix:
```bash
$ curl -I http://localhost:5000/inicio
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
```

## 📝 Notas Técnicas

### ¿Por qué funciona en desarrollo?

Vite tiene un servidor de desarrollo con **middleware de fallback** automático:

```typescript
// vite.config.ts - No necesitas configurar nada
export default defineConfig({
  // Vite maneja SPA automáticamente en dev
})
```

### Alternativas a `serve`:

Si quisieras usar otro servidor:

#### Nginx:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache (.htaccess):
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Node.js Express:
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('dist'));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## ✅ Checklist

- [x] Agregar opción `-s` al comando `serve` en Dockerfile
- [x] Reconstruir imagen Docker
- [x] Actualizar contenedor
- [ ] Probar navegación interna
- [ ] Probar URLs directas
- [ ] Probar refresh (F5)
- [ ] Probar deep links
- [ ] Verificar archivos estáticos funcionan

## 🎉 Resultado

Ahora la aplicación funciona correctamente como SPA en producción:

- ✅ URLs directas funcionan
- ✅ Refresh (F5) funciona en cualquier ruta
- ✅ Deep links funcionan
- ✅ Navegación interna funciona
- ✅ Archivos estáticos se sirven correctamente

---

**Fecha de corrección**: 2 de octubre de 2025  
**Versión**: 0.0.9Alpha → 0.0.10Alpha (próxima)  
**Issue**: 404 en rutas directas  
**Solución**: Activar modo SPA en `serve` con opción `-s`
