# 🔧 Corrección de Variables de Entorno en Docker

## 📋 Problema Identificado

La aplicación desplegada en Docker ignoraba las variables de entorno y usaba `localhost` en lugar de la API de producción.

### Causas Raíz:

1. **Variables no se pasaban al build**: El script `deploy.sh` ejecutaba `docker build` sin pasar los `--build-arg`
2. **JSON inválido en roles**: Al cargar variables con `export $(cat .env...)`, las comillas dobles del JSON se perdían
3. **Vite embebe variables en build-time**: Las variables definidas en `docker-compose.yml` con `environment:` no funcionan porque Vite las necesita durante la compilación

## ✅ Soluciones Implementadas

### 1. Script de Deploy Actualizado (`deploy.sh`)

**Antes:**
```bash
docker build -t $IMAGE_NAME:$VERSION .
```

**Después:**
```bash
docker build \
    --build-arg VITE_API_BASE_URL="https://iph01.okip.com.mx/api" \
    --build-arg VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]' \
    # ... más variables
    -t $IMAGE_NAME:$VERSION .
```

### 2. Variables Definidas Directamente en Script

En lugar de cargar desde `.env.production` (que rompe el JSON), las variables se definen directamente en el script:

```bash
VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]'  # JSON válido
```

### 3. Corrección de URLs en Servicios

Se eliminó la concatenación duplicada de `API_BASE_URL`:

**Antes:**
```typescript
const url = `${API_BASE_URL}/${API_BASE_ROUTES.ESTADISTICAS}/getSummary`;
const response = await http.get(url); // http ya tiene baseURL configurada
```

**Después:**
```typescript
const url = `/${API_BASE_ROUTES.ESTADISTICAS}/getSummary`;
const response = await http.get(url); // Usa ruta relativa
```

### 4. Archivos Actualizados

- ✅ `deploy.sh` - Ahora pasa todas las variables como build args
- ✅ `docker-compose.yml` - Usa imagen de Docker Hub
- ✅ `.env.production` - Configuración correcta para producción
- ✅ Servicios (`statistics.service.ts`, `historial-iph.service.ts`, etc.) - Usan rutas relativas

## 🚀 Cómo Usar

### Para Deploy de Producción:

```bash
sudo ./deploy.sh 0.0.9Alpha
```

Este script:
1. ✅ Construye la imagen con variables de producción embebidas
2. ✅ Crea tags para versión específica y `latest`
3. ✅ Sube ambas imágenes a Docker Hub
4. ✅ Despliega con docker-compose

### Para Desarrollo Local:

```bash
npm run dev
```

Usa `.env.development` y el proxy de Vite para `/api/*`

## 🔍 Verificación

Para verificar que las variables están correctas en la imagen compilada:

```bash
# Ver el código compilado
docker run --rm victoroteroviz/front-end-iph:latest cat /app/dist/assets/index-*.js | grep "const It"
```

Debe mostrar:
```javascript
const It = "https://iph01.okip.com.mx/api"  // ✅ API de producción
```

NO debe mostrar:
```javascript
const It = "http://localhost:3000"  // ❌ API de desarrollo
```

## 📝 Notas Importantes

1. **Build-time vs Runtime**: Vite embebe las variables en el código JavaScript durante el build. No se pueden cambiar después.

2. **JSON en Bash**: Usar comillas simples para preservar comillas dobles del JSON:
   ```bash
   VARIABLE='[{"id":1,"nombre":"Test"}]'  # ✅ Correcto
   VARIABLE="[{\"id\":1,\"nombre\":\"Test\"}]"  # ✅ También funciona
   ```

3. **Docker Compose**: Solo sirve para desplegar la imagen ya construida, no afecta las variables embebidas.

## 🔄 Flujo de Variables

```
deploy.sh (variables hardcoded)
    ↓
docker build --build-arg
    ↓
Dockerfile (ARG → ENV)
    ↓
npm run build (Vite lee ENV)
    ↓
Código JavaScript compilado (variables embebidas)
    ↓
Docker Image en Hub
    ↓
docker-compose pull & up
    ↓
Aplicación en producción ✅
```

## 🎯 Resultado

- ✅ API apunta a producción: `https://iph01.okip.com.mx/api`
- ✅ Variables de entorno correctamente embebidas
- ✅ JSON de roles válido
- ✅ Sin duplicación de baseURL en peticiones HTTP
- ✅ Deploy automatizado con versiones

---

**Fecha de corrección**: 2 de octubre de 2025  
**Versión**: 0.0.9Alpha
