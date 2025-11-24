# 🌍 Guía de Ambientes

Esta guía explica cómo configurar y usar la aplicación en diferentes ambientes (Development, Staging, Production).

---

## 📋 Tabla de Contenidos

- [Ambientes Disponibles](#ambientes-disponibles)
- [Configuración por Ambiente](#configuración-por-ambiente)
- [Deployment por Ambiente](#deployment-por-ambiente)
- [Variables Específicas](#variables-específicas)
- [Nginx / Proxy Setup](#nginx--proxy-setup)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Ambientes Disponibles

### Resumen

| Ambiente | Propósito | URL Ejemplo | Debug |
|----------|-----------|-------------|-------|
| **Development** | Desarrollo local | `http://localhost:5173` | ✅ ON |
| **Staging** | Testing pre-producción | `https://staging.okip.com.mx` | ✅ ON |
| **Production** | Usuarios finales | `https://iph01.okip.com.mx` | ❌ OFF |

---

## ⚙️ Configuración por Ambiente

### Development (Local)

**Uso:** Desarrollo local en tu máquina

#### Método A: npm run dev (Recomendado)

```bash
# 1. Crear .env.development
cat > .env.development <<EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENVIRONMENT=development
VITE_APP_NAME=IPH Development
VITE_APP_VERSION=dev
VITE_DEBUG_MODE=true

# Roles (copiar de .env.example)
VITE_SUPERADMIN_ROLE=[{"id":1,"nombre":"SuperAdmin"}]
VITE_ADMIN_ROLE=[{"id":2,"nombre":"Administrador"}]
VITE_SUPERIOR_ROLE=[{"id":3,"nombre":"Superior"}]
VITE_ELEMENTO_ROLE=[{"id":4,"nombre":"Elemento"}]
EOF

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir http://localhost:5173
```

**Características:**
- Hot Module Replacement (HMR)
- Source maps completos
- Logs detallados en consola
- DevTools habilitados

#### Método B: Docker Local

```bash
# Build imagen
docker build -t front-end-iph:dev .

# Ejecutar
docker run -d -p 4173:4173 \
  --name iph-dev \
  --restart unless-stopped \
  -e API_BASE_URL=http://host.docker.internal:3000 \
  -e APP_ENVIRONMENT=development \
  -e APP_NAME="IPH Development" \
  -e APP_VERSION=dev \
  -e DEBUG_MODE=true \
  front-end-iph:dev

# Ver logs
docker logs -f iph-dev
```

**Nota:** `host.docker.internal` permite al contenedor acceder a servicios en tu localhost.

---

### Staging

**Uso:** Testing antes de producción, demos a clientes

#### Configuración

```bash
docker run -d -p 4173:4173 \
  --name iph-staging \
  --restart unless-stopped \
  -e API_BASE_URL=https://staging-api.okip.com.mx \
  -e APP_ENVIRONMENT=staging \
  -e APP_NAME="IPH Staging" \
  -e APP_VERSION=1.0.0-rc.1 \
  -e DEBUG_MODE=true \
  victoroteroviz/front-end-iph:1.0.0

# Con Docker Compose
cat > docker-compose.staging.yml <<EOF
version: '3.8'
services:
  frontend:
    image: victoroteroviz/front-end-iph:1.0.0
    container_name: iph-staging
    ports:
      - "4173:4173"
    environment:
      - API_BASE_URL=https://staging-api.okip.com.mx
      - APP_ENVIRONMENT=staging
      - APP_NAME=IPH Staging
      - APP_VERSION=1.0.0-rc.1
      - DEBUG_MODE=true
    restart: unless-stopped
    networks:
      - iph-network

networks:
  iph-network:
    driver: bridge
EOF

docker-compose -f docker-compose.staging.yml up -d
```

**Características:**
- URL de API de staging
- Debug mode activado
- Logs completos
- Same code as production (testing exacto)

#### Con Nginx

```nginx
# /etc/nginx/sites-available/iph-staging
server {
    listen 80;
    server_name staging.okip.com.mx;

    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/iph-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Opcional: SSL con Certbot
sudo certbot --nginx -d staging.okip.com.mx
```

---

### Production

**Uso:** Usuarios finales, ambiente productivo

#### Configuración

```bash
docker run -d -p 4173:4173 \
  --name iph-production \
  --restart unless-stopped \
  -e API_BASE_URL=https://iph01.okip.com.mx \
  -e APP_ENVIRONMENT=production \
  -e APP_NAME="IPH Frontend" \
  -e APP_VERSION=1.0.0 \
  -e DEBUG_MODE=false \
  victoroteroviz/front-end-iph:1.0.0

# Con Docker Compose
cat > docker-compose.production.yml <<EOF
version: '3.8'
services:
  frontend:
    image: victoroteroviz/front-end-iph:1.0.0
    container_name: iph-production
    ports:
      - "4173:4173"
    environment:
      - API_BASE_URL=https://iph01.okip.com.mx
      - APP_ENVIRONMENT=production
      - APP_NAME=IPH Frontend
      - APP_VERSION=1.0.0
      - DEBUG_MODE=false
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:4173"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - iph-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  iph-network:
    driver: bridge
EOF

docker-compose -f docker-compose.production.yml up -d
```

**Características:**
- URL de API de producción
- Debug mode **desactivado**
- Logs mínimos (WARN/ERROR only)
- Healthcheck configurado
- Log rotation

#### Con Nginx (Producción)

```nginx
# /etc/nginx/sites-available/iph-production
upstream iph_frontend {
    server localhost:4173;
}

server {
    listen 80;
    server_name iph01.okip.com.mx www.iph01.okip.com.mx;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name iph01.okip.com.mx www.iph01.okip.com.mx;

    # SSL
    ssl_certificate /etc/letsencrypt/live/iph01.okip.com.mx/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iph01.okip.com.mx/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Proxy to frontend
    location / {
        proxy_pass http://iph_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Logs
    access_log /var/log/nginx/iph-access.log;
    error_log /var/log/nginx/iph-error.log;
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/iph-production /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL con Certbot
sudo certbot --nginx -d iph01.okip.com.mx -d www.iph01.okip.com.mx

# Auto-renovación
sudo certbot renew --dry-run
```

---

## 📝 Variables Específicas

### Comparación de Configuraciones

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `API_BASE_URL` | `http://localhost:3000` | `https://staging-api.okip.com.mx` | `https://iph01.okip.com.mx` |
| `APP_ENVIRONMENT` | `development` | `staging` | `production` |
| `DEBUG_MODE` | `true` | `true` | `false` |
| `APP_NAME` | `IPH Development` | `IPH Staging` | `IPH Frontend` |
| Logger min level | `DEBUG` | `DEBUG` | `WARN` |
| Console logs | ✅ Visible | ✅ Visible | ❌ Oculto |
| Source maps | ✅ Full | ✅ Full | ❌ No |

### Comportamiento del Logger

```typescript
// Development: Ve TODO
logDebug('Component', 'Debug info');   // ✅ Visible
logInfo('Component', 'Info');          // ✅ Visible
logWarn('Component', 'Warning');       // ✅ Visible
logError('Component', 'Error');        // ✅ Visible

// Production: Solo warnings/errors
logDebug('Component', 'Debug info');   // ❌ Oculto
logInfo('Component', 'Info');          // ❌ Oculto
logWarn('Component', 'Warning');       // ✅ Visible
logError('Component', 'Error');        // ✅ Visible
```

---

## 🔄 Cambiar de Ambiente

### Sin Rebuild

```bash
# Detener contenedor actual
docker stop iph-frontend

# Iniciar con nueva configuración
docker run -d -p 4173:4173 \
  --name iph-frontend \
  -e API_BASE_URL=https://nueva-url.com \
  -e APP_ENVIRONMENT=production \
  victoroteroviz/front-end-iph:1.0.0
```

### Con Docker Compose

```bash
# Staging
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

---

## 🐛 Troubleshooting

### API calls fallan con CORS

**Problema:**
```
Access to fetch at 'https://api.okip.com.mx' from origin 'http://localhost:4173'
has been blocked by CORS policy
```

**Solución:**

1. **Backend debe permitir el origen:**

```javascript
// Backend (Express ejemplo)
app.use(cors({
  origin: [
    'http://localhost:5173',        // Dev local
    'http://localhost:4173',        // Preview local
    'https://staging.okip.com.mx',  // Staging
    'https://iph01.okip.com.mx'     // Production
  ],
  credentials: true
}));
```

2. **O usar proxy en desarrollo:**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://iph01.okip.com.mx',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

### Variables no se aplican

**Verificar que el entrypoint ejecutó:**

```bash
docker logs iph-frontend | grep ENTRYPOINT

# Debe mostrar:
# [ENTRYPOINT] Configuración runtime:
# - API_BASE_URL: https://...
```

**Ver config.js generado:**

```bash
docker exec iph-frontend cat /app/dist/config.js

# Debe contener:
# window.__RUNTIME_CONFIG__ = { ... }
```

### Contenedor se reinicia constantemente

```bash
# Ver logs
docker logs iph-frontend

# Ver eventos
docker events --filter 'container=iph-frontend'

# Verificar healthcheck
docker inspect iph-frontend | grep -A 10 Health
```

---

## 📊 Monitoreo

### Logs en Tiempo Real

```bash
# Ver últimas 100 líneas
docker logs --tail 100 iph-frontend

# Seguir logs en tiempo real
docker logs -f iph-frontend

# Filtrar por palabra
docker logs iph-frontend 2>&1 | grep ERROR
```

### Métricas

```bash
# Uso de recursos
docker stats iph-frontend

# Info del contenedor
docker inspect iph-frontend

# Verificar que está corriendo
docker ps | grep iph-frontend
```

### Healthcheck

```bash
# Ver estado de salud
docker inspect --format='{{.State.Health.Status}}' iph-frontend

# Ver últimos checks
docker inspect --format='{{json .State.Health}}' iph-frontend | jq
```

---

## 🔗 Referencias

- [Deployment Guide](./DEPLOYMENT.md)
- [Runtime Config Guide](./RUNTIME_CONFIG.md)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Última actualización:** 2025-01-24
**Versión:** 1.0.0
