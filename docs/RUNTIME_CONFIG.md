# ⚙️ Sistema de Configuración en Runtime

Esta guía explica cómo funciona el sistema de configuración dinámica que permite cambiar variables sin reconstruir la aplicación.

---

## 📋 Tabla de Contenidos

- [¿Qué es Runtime Config?](#qué-es-runtime-config)
- [¿Por qué es importante?](#por-qué-es-importante)
- [Cómo Funciona](#cómo-funciona)
- [Variables Disponibles](#variables-disponibles)
- [Orden de Precedencia](#orden-de-precedencia)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Desarrollo Local](#desarrollo-local)
- [FAQ](#faq)

---

## 🎯 ¿Qué es Runtime Config?

**Runtime Config** es un sistema que permite configurar la aplicación **en el momento de ejecución** en lugar de en el momento de compilación.

### Diferencia Clave

#### ❌ Build-time Config (Antes)

```typescript
// Valor hardcoded durante npm run build
const API_URL = "https://iph01.okip.com.mx";

// Problema: Para cambiar la URL necesitas:
// 1. Modificar .env
// 2. npm run build (7+ segundos)
// 3. Rebuild Docker image
// 4. Push a DockerHub
// 5. Pull en servidor
// 6. Reiniciar contenedor
```

#### ✅ Runtime Config (Ahora)

```typescript
// Valor inyectado al iniciar el contenedor
const API_URL = window.__RUNTIME_CONFIG__.apiBaseUrl;

// Para cambiar la URL solo necesitas:
// 1. Reiniciar contenedor con nueva variable
docker restart iph-frontend
```

---

## 💡 ¿Por qué es importante?

### Ventajas

1. **Una imagen para todos los ambientes**
   ```bash
   # Misma imagen, diferentes configs
   docker run -e API_BASE_URL=dev.api.com app:1.0.0
   docker run -e API_BASE_URL=prod.api.com app:1.0.0
   ```

2. **Cambios rápidos sin rebuild**
   ```bash
   # Antes: 5-10 minutos (rebuild + deploy)
   # Ahora: 5 segundos (restart)
   docker restart iph-frontend
   ```

3. **Menos errores**
   - No hay builds diferentes por ambiente
   - La misma imagen que testeaste en staging va a producción
   - Menos "funciona en mi máquina"

4. **Facilita CI/CD**
   ```yaml
   # GitHub Actions / Jenkins
   - Build image once
   - Test with test config
   - Deploy to prod with prod config
   ```

---

## 🔧 Cómo Funciona

### Flujo Completo

```
1. npm run build
   ↓
   Genera dist/ SIN variables hardcoded

2. docker build
   ↓
   Copia dist/ + docker-entrypoint.sh

3. docker run -e API_BASE_URL=...
   ↓
   docker-entrypoint.sh se ejecuta

4. Script genera /app/dist/config.js
   ↓
   window.__RUNTIME_CONFIG__ = {
     apiBaseUrl: "valor-desde-env",
     ...
   }

5. index.html carga config.js
   ↓
   <script src="/config.js"></script>

6. App lee window.__RUNTIME_CONFIG__
   ↓
   import runtimeConfig from '@/config/runtime.config'
   const apiUrl = runtimeConfig.apiBaseUrl
```

### Archivos Involucrados

| Archivo | Propósito |
|---------|-----------|
| `docker-entrypoint.sh` | Script que genera config.js en runtime |
| `index.html` | Carga config.js antes de la app |
| `src/config/runtime.config.ts` | Helper para leer la config |
| `src/config/env.config.ts` | Usa runtime.config internamente |

---

## 📝 Variables Disponibles

### Variables Soportadas

```typescript
interface RuntimeConfig {
  apiBaseUrl: string;           // URL del backend
  appEnvironment: string;       // development | staging | production
  appName: string;              // Nombre de la app
  appVersion: string;           // Versión de la app
  debugMode: boolean;           // Activar logs extra
  superadminRole: unknown;      // [{"id":1,"nombre":"SuperAdmin"}]
  adminRole: unknown;           // [{"id":2,"nombre":"Administrador"}]
  superiorRole: unknown;        // [{"id":3,"nombre":"Superior"}]
  elementoRole: unknown;        // [{"id":4,"nombre":"Elemento"}]
}
```

> ⚠️ **Nota (2026-08-24):** los 4 roles se agregaron a runtime config en
> esta fecha — antes solo se leían de `import.meta.env.VITE_*_ROLE`
> (build-time), así que cambiarlos en Docker/Kubernetes no tenía ningún
> efecto sin reconstruir la imagen. Ver
> `kubernetes/iph-frontend/DESPLIEGUE_TROUBLESHOOTING.md` sección 10.2 para
> el detalle del bug y el fix. A diferencia de los demás campos (strings u
> booleans), estos llegan como **array** desde `window.__RUNTIME_CONFIG__`
> y como **string JSON** desde `import.meta.env` — el parseo/validación
> vive en `src/config/env.config.ts` (`parseAndValidateRole`), no en
> `getConfigValue()`.

### Uso en Docker

```bash
docker run -d \
  -e API_BASE_URL=https://iph01.okip.com.mx \
  -e APP_ENVIRONMENT=production \
  -e APP_NAME="IPH Frontend" \
  -e APP_VERSION=1.0.0 \
  -e DEBUG_MODE=false \
  victoroteroviz/front-end-iph:1.0.0
```

### Valores por Defecto

Si no pasas una variable, se usa el valor por defecto:

```typescript
{
  apiBaseUrl: 'http://localhost:3000',     // ← Default
  appEnvironment: 'development',           // ← Default
  appName: 'IPH Frontend',                 // ← Default
  appVersion: '1.0.0',                     // ← Default
  debugMode: false                         // ← Default
}
```

---

## 🎚️ Orden de Precedencia

El sistema busca valores en este orden:

```
1. window.__RUNTIME_CONFIG__  (Docker runtime)    ← MAYOR prioridad
   ↓ si no existe
2. import.meta.env.VITE_*     (Build time)
   ↓ si no existe
3. Valores por defecto                            ← MENOR prioridad
```

### Ejemplo

```typescript
// Escenario 1: Docker con runtime config
docker run -e API_BASE_URL=https://prod.api.com ...
// runtimeConfig.apiBaseUrl = "https://prod.api.com" ✅ Desde Docker

// Escenario 2: Desarrollo local
npm run dev  // Lee .env.development
// runtimeConfig.apiBaseUrl = "http://localhost:3000" ✅ Desde .env

// Escenario 3: Sin configuración
npm run build && npm run preview  // Sin .env ni Docker
// runtimeConfig.apiBaseUrl = "http://localhost:3000" ✅ Default
```

---

## 💻 Ejemplos de Uso

### En Componentes de React

```typescript
import runtimeConfig from '@/config/runtime.config';

function MyComponent() {
  // Leer configuración
  const apiUrl = runtimeConfig.apiBaseUrl;
  const isProduction = runtimeConfig.appEnvironment === 'production';

  // Usar en API calls
  useEffect(() => {
    fetch(`${apiUrl}/api/users`)
      .then(r => r.json())
      .then(data => console.log(data));
  }, [apiUrl]);

  // Condicionales por ambiente
  if (isProduction) {
    return <ProductionFeature />;
  }

  return <DevelopmentFeature />;
}
```

### En Servicios

```typescript
// src/services/api.service.ts
import runtimeConfig from '@/config/runtime.config';
import axios from 'axios';

// Crear instancia con URL dinámica
const api = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  timeout: 30000
});

export const getUsers = () => api.get('/users');
export const getProfile = (id: string) => api.get(`/users/${id}`);
```

### En Configuraciones

```typescript
// src/config/logger.config.ts
import runtimeConfig from '@/config/runtime.config';

export const loggerConfig = {
  enabled: runtimeConfig.debugMode,
  level: runtimeConfig.appEnvironment === 'production' ? 'warn' : 'debug',
  storage: runtimeConfig.appEnvironment !== 'development'
};
```

### Debugging en Consola

```javascript
// En el navegador (F12 → Console)

// Ver toda la configuración
console.log(window.__RUNTIME_CONFIG__);

// Ver config parseada
console.log(runtimeConfig.getAll());

// Ver si usa runtime o build-time
console.log('Usa runtime:', runtimeConfig.hasRuntimeConfig);
```

---

## 🏠 Desarrollo Local

### Opción A: Desarrollo Normal (Recomendado)

```bash
# Usa .env.development automáticamente
npm run dev

# runtimeConfig lee de import.meta.env.VITE_*
```

**Crear `.env.development`:**

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENVIRONMENT=development
VITE_APP_NAME=IPH Local
VITE_DEBUG_MODE=true
```

### Opción B: Simular Runtime Config

```bash
# 1. Build de la app
npm run build

# 2. Crear config.js manualmente
cat > dist/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  apiBaseUrl: 'http://localhost:3000',
  appEnvironment: 'development',
  appName: 'IPH Local Test',
  appVersion: '1.0.0-dev',
  debugMode: true
};
console.log('✅ Runtime config cargado:', window.__RUNTIME_CONFIG__);
EOF

# 3. Servir
npm run preview

# 4. Abrir http://localhost:4173
```

### Opción C: Docker Local

```bash
# Build imagen
docker build -t front-end-iph:local .

# Ejecutar con config local
docker run -d -p 4173:4173 \
  --name test-local \
  -e API_BASE_URL=http://host.docker.internal:3000 \
  -e APP_ENVIRONMENT=development \
  -e DEBUG_MODE=true \
  front-end-iph:local

# Ver logs
docker logs -f test-local

# Abrir http://localhost:4173
```

---

## ❓ FAQ

### ¿Puedo cambiar la URL sin reiniciar el contenedor?

**No.** Las variables se leen al iniciar el contenedor. Necesitas:

```bash
docker restart iph-frontend
```

O detener y reiniciar con nuevas variables:

```bash
docker stop iph-frontend
docker rm iph-frontend
docker run -e API_BASE_URL=nueva-url ...
```

### ¿Qué pasa si olvido pasar una variable?

Se usa el valor por defecto. Ejemplo:

```bash
# Sin -e API_BASE_URL
docker run -d -p 4173:4173 victoroteroviz/front-end-iph:1.0.0

# Usará: http://localhost:3000 (default)
```

### ¿Puedo agregar nuevas variables?

Sí, sigue estos pasos:

1. **Agregar al entrypoint:**

```bash
# docker-entrypoint.sh
NEW_VAR="${NEW_VAR:-default-value}"

cat > /app/dist/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  // ... otras vars
  newVar: '${NEW_VAR}'
};
EOF
```

2. **Agregar al TypeScript:**

```typescript
// src/config/runtime.config.ts
interface RuntimeConfig {
  // ... otras vars
  newVar: string;
}

export const runtimeConfig = {
  // ... otros getters
  get newVar(): string {
    return getConfigValue('newVar', 'VITE_NEW_VAR', 'default');
  }
};
```

3. **Rebuild imagen:**

```bash
docker build -t front-end-iph:1.0.1 .
```

### ¿Funciona con docker-compose?

Sí:

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    image: victoroteroviz/front-end-iph:1.0.0
    ports:
      - "4173:4173"
    environment:
      - API_BASE_URL=https://iph01.okip.com.mx
      - APP_ENVIRONMENT=production
      - APP_NAME=IPH Frontend
      - DEBUG_MODE=false
    restart: unless-stopped
```

### ¿Puedo ver qué config se aplicó?

Sí, de varias formas:

```bash
# 1. Ver logs del entrypoint
docker logs iph-frontend | grep ENTRYPOINT

# 2. Ver el archivo config.js generado
docker exec iph-frontend cat /app/dist/config.js

# 3. En el navegador (Console)
console.log(window.__RUNTIME_CONFIG__);
```

### ¿Es seguro exponer la configuración en window?

**Parcialmente.** Solo pon en runtime config valores que ya son públicos:

✅ **Seguro:**
- URL del API (ya visible en Network tab)
- Nombre de la app
- Versión
- Ambiente (dev/prod)

❌ **Inseguro:**
- API keys privadas
- Tokens de autenticación
- Passwords
- Secrets reales

Ver más en: [Seguridad Frontend](../CLAUDE.md#seguridad)

---

## 🔗 Referencias

- [Deployment Guide](./DEPLOYMENT.md)
- [Environments Guide](./ENVIRONMENTS.md)
- [Docker Entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Última actualización:** 2025-01-24
**Versión:** 1.0.0
