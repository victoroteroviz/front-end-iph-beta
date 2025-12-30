# 🚀 Guía de Deployment - IPH Frontend

## 📋 Tabla de Contenidos
1. [Arquitectura Runtime Configuration](#arquitectura-runtime-configuration)
2. [Build y Deploy desde Local](#build-y-deploy-desde-local)
3. [Configuración en el Servidor](#configuración-en-el-servidor)
4. [Troubleshooting](#troubleshooting)
5. [Migración desde Build-time Config](#migración-desde-build-time-config)

---

## 🏗️ Arquitectura Runtime Configuration

### **Concepto**

Esta aplicación usa **Runtime Configuration**, lo que significa:

- ✅ **Una sola imagen Docker** sirve para todos los entornos (dev, staging, prod)
- ✅ **Configuración externa** via variables de entorno en el servidor
- ✅ **Sin rebuild** para cambiar configuración (solo restart)
- ✅ **config.js generado dinámicamente** al iniciar el contenedor

### **Flujo Completo**

```
┌─────────────────────────────────────────┐
│  FASE 1: BUILD (Local o CI/CD)         │
│  ./deploy.sh 1.0.0                      │
│  ├─ docker build (sin variables)        │
│  ├─ docker tag                          │
│  └─ docker push → DockerHub             │
│                                          │
│  Resultado: Imagen genérica             │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│  FASE 2: DEPLOY (Servidor)             │
│  docker-compose up -d                   │
│  ├─ Lee .env del servidor               │
│  ├─ Pasa variables al contenedor        │
│  └─ docker-entrypoint.sh ejecuta:       │
│     ├─ Lee variables de entorno         │
│     ├─ Genera /app/dist/config.js       │
│     └─ Inicia servidor                  │
│                                          │
│  Resultado: App con config del servidor │
└─────────────────────────────────────────┘
```

---

## 📦 Build y Deploy desde Local

### **Requisitos**
- Docker instalado
- Acceso a DockerHub (docker login)

### **Paso 1: Build y Push**

```bash
# En tu máquina local
cd /ruta/del/proyecto

# Ejecutar script de deploy con versión
./deploy.sh 1.0.0

# El script automáticamente:
# 1. Construye imagen genérica (sin variables)
# 2. Crea tags: victoroteroviz/front-end-iph:1.0.0 y :latest
# 3. Sube a DockerHub
```

**Output esperado:**
```
[INFO] Build genérico (runtime configuration)
[SUCCESS] Imagen construida exitosamente
📦 Imagen genérica lista para deployment
⚙️  La configuración se realizará en RUNTIME con docker-compose
```

### **Paso 2: Verificar imagen en DockerHub**

```bash
# Opcional: verificar que la imagen se subió
docker pull victoroteroviz/front-end-iph:latest
```

---

## ⚙️ Configuración en el Servidor

### **Estructura de Archivos en el Servidor**

```
/srv/iph-frontend/
├── docker-compose.yaml
├── .env                    ← Variables de configuración
└── verify-server-config.sh ← Script de verificación (opcional)
```

### **Paso 1: Configurar Variables (.env)**

Crea o edita `/srv/iph-frontend/.env`:

```bash
# =====================================================
# CONFIGURACIÓN DE PRODUCCIÓN - IPH FRONTEND
# =====================================================

# API Configuration
VITE_API_BASE_URL=https://iph01.okip.com.mx
VITE_APP_ENVIRONMENT=production

# Roles del Sistema
VITE_SUPERADMIN_ROLE=[{"id":1,"nombre":"SuperAdmin"}]
VITE_ADMIN_ROLE=[{"id":2,"nombre":"Administrador"}]
VITE_SUPERIOR_ROLE=[{"id":3,"nombre":"Superior"}]
VITE_ELEMENTO_ROLE=[{"id":4,"nombre":"Elemento"}]

# Logger Config (producción)
VITE_LOG_LEVEL=WARN
VITE_LOG_CONSOLE=false
VITE_LOG_STORAGE=true
VITE_LOG_MAX_ENTRIES=1000

# HTTP Config
VITE_HTTP_TIMEOUT=30000
VITE_HTTP_RETRIES=3
VITE_HTTP_RETRY_DELAY=1000

# Auth Config
VITE_AUTH_HEADER_NAME=Authorization
VITE_AUTH_HEADER_PREFIX=Bearer
VITE_AUTH_TOKEN_KEY=auth_token

# App Config
VITE_DEBUG_MODE=false
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=IPH Frontend

# Traefik Config (si aplica)
DOCKER_NETWORK_ID=iph-frontend
VIRTUAL_HOST=siriph.okip.com.mx
```

### **Paso 2: Verificar docker-compose.yaml**

Asegúrate que tenga la configuración correcta:

```yaml
services:
  frontend:
    image: victoroteroviz/front-end-iph:latest
    container_name: iph-frontend
    restart: always

    # IMPORTANTE: Esto permite que docker-compose lea el .env
    # automáticamente (archivo en el mismo directorio)
    # Si quieres ser explícito, agrega:
    # env_file:
    #   - .env

    environment:
      # Estas líneas toman valores del .env
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
      - VITE_APP_ENVIRONMENT=${VITE_APP_ENVIRONMENT}
      - VITE_SUPERADMIN_ROLE=${VITE_SUPERADMIN_ROLE}
      - VITE_ADMIN_ROLE=${VITE_ADMIN_ROLE}
      - VITE_SUPERIOR_ROLE=${VITE_SUPERIOR_ROLE}
      - VITE_ELEMENTO_ROLE=${VITE_ELEMENTO_ROLE}
      - VITE_LOG_LEVEL=${VITE_LOG_LEVEL}
      - VITE_LOG_CONSOLE=${VITE_LOG_CONSOLE}
      - VITE_LOG_STORAGE=${VITE_LOG_STORAGE}
      - VITE_LOG_MAX_ENTRIES=${VITE_LOG_MAX_ENTRIES}
      - VITE_HTTP_TIMEOUT=${VITE_HTTP_TIMEOUT}
      - VITE_HTTP_RETRIES=${VITE_HTTP_RETRIES}
      - VITE_HTTP_RETRY_DELAY=${VITE_HTTP_RETRY_DELAY}
      - VITE_AUTH_HEADER_NAME=${VITE_AUTH_HEADER_NAME}
      - VITE_AUTH_HEADER_PREFIX=${VITE_AUTH_HEADER_PREFIX}
      - VITE_AUTH_TOKEN_KEY=${VITE_AUTH_TOKEN_KEY}
      - VITE_DEBUG_MODE=${VITE_DEBUG_MODE}
      - VITE_APP_VERSION=${VITE_APP_VERSION}
      - VITE_APP_NAME=${VITE_APP_NAME}

    networks:
      - traefik

    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${DOCKER_NETWORK_ID}-frontend.rule=Host(`${VIRTUAL_HOST}`)"
      - "traefik.http.routers.${DOCKER_NETWORK_ID}-frontend.entrypoints=websecure"
      - "traefik.http.routers.${DOCKER_NETWORK_ID}-frontend.tls.certresolver=myresolver"
      - "traefik.http.services.${DOCKER_NETWORK_ID}-frontend.loadbalancer.server.port=4173"

    ports:
      - "5000:4173"

networks:
  traefik:
    external: true
```

### **Paso 3: Desplegar o Actualizar**

```bash
# Ir al directorio del servidor
cd /srv/iph-frontend

# Opción A: Primer deployment
docker-compose up -d

# Opción B: Actualizar a nueva versión
docker-compose pull        # Descarga última imagen
docker-compose down        # Detiene contenedor actual
docker-compose up -d       # Inicia con nueva imagen

# Opción C: Solo cambiar configuración (sin nueva imagen)
docker-compose down        # Detiene contenedor
# Edita .env con nuevas variables
docker-compose up -d       # Inicia con nueva configuración
```

### **Paso 4: Verificar Deployment**

```bash
# Ver logs del inicio
docker logs iph-frontend | head -20

# Deberías ver:
# [ENTRYPOINT] Configuración runtime:
#   - API_BASE_URL: https://iph01.okip.com.mx  ← Debe coincidir con tu .env
#   - APP_ENVIRONMENT: production
#   - LOG_LEVEL: WARN
# [ENTRYPOINT] config.js generado exitosamente

# Verificar variables en el contenedor
docker exec iph-frontend env | grep VITE_API_BASE_URL

# Verificar config.js generado
docker exec iph-frontend cat /app/dist/config.js | grep apiBaseUrl
# Debe mostrar: apiBaseUrl: 'https://iph01.okip.com.mx'  ← De tu .env
```

### **Paso 5: Usar Script de Verificación (Opcional)**

```bash
# Copiar script al servidor
scp verify-server-config.sh usuario@servidor:/srv/iph-frontend/

# En el servidor
cd /srv/iph-frontend
chmod +x verify-server-config.sh
./verify-server-config.sh

# El script muestra:
# - Variables en .env
# - Variables que docker-compose pasará
# - Variables en el contenedor
# - config.js generado
# - Logs del entrypoint
```

---

## 🔧 Troubleshooting

### **Problema: config.js tiene valores incorrectos**

**Diagnóstico:**
```bash
docker exec iph-frontend cat /app/dist/config.js | grep apiBaseUrl
# Muestra: apiBaseUrl: 'https://iph01.okip.com.mx'
# Pero tu .env tiene: VITE_API_BASE_URL=https://test-siriph-api.okip.com.mx
```

**Solución:**
```bash
# El config.js se genera al INICIAR el contenedor
# Si cambiaste el .env después, necesitas recrear:
docker-compose down
docker-compose up -d

# Verificar de nuevo
docker logs iph-frontend | head -20
```

---

### **Problema: Variables no se cargan del .env**

**Diagnóstico:**
```bash
# Ver qué variables ve docker-compose
docker compose config | grep VITE_API_BASE_URL

# Si está vacío, el .env no se está leyendo
```

**Solución:**
```bash
# Opción 1: Agregar env_file explícito a docker-compose.yaml
services:
  frontend:
    env_file:
      - .env
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Opción 2: Verificar que .env está en el mismo directorio que docker-compose.yaml
ls -la /srv/iph-frontend/.env

# Opción 3: Verificar formato del .env (sin BOM, encoding UTF-8)
file .env
# Debe mostrar: .env: ASCII text
```

---

### **Problema: Contenedor usa valores de fallback**

**Diagnóstico:**
```bash
docker logs iph-frontend | grep "API_BASE_URL"
# Muestra: API_BASE_URL: https://iph01.okip.com.mx
# Este es el valor por defecto del entrypoint.sh
```

**Causa:** El contenedor no recibió las variables de entorno.

**Solución:**
```bash
# Verificar que docker-compose.yaml pasa las variables
docker compose config | grep -A 30 "environment:"

# Si no aparecen, agregar a docker-compose.yaml:
environment:
  - VITE_API_BASE_URL=${VITE_API_BASE_URL}
  # ... resto de variables

# Recrear contenedor
docker-compose down && docker-compose up -d
```

---

## 🔄 Migración desde Build-time Config

Si anteriormente usabas `--build-arg` en el build:

### **Cambios Necesarios**

1. **✅ Ya hecho:** `deploy.sh` simplificado (sin --build-arg)
2. **✅ Ya hecho:** `Dockerfile` sin ARG (solo runtime)
3. **⚠️ Pendiente:** Configurar `.env` en el servidor

### **Ventajas del Cambio**

| Antes (Build-time) | Ahora (Runtime) |
|-------------------|-----------------|
| Una imagen por entorno | ✅ Una imagen para todos |
| Rebuild para cambiar config | ✅ Solo restart |
| Config embebida | ✅ Config externa |
| 3+ imágenes en DockerHub | ✅ 1 imagen (latest + versiones) |
| 10-15 min para cambio | ✅ 5 segundos para cambio |

---

## 📝 Resumen de Comandos

### **Local (Build & Deploy)**
```bash
./deploy.sh 1.0.0
```

### **Servidor (Primera vez)**
```bash
cd /srv/iph-frontend
nano .env              # Configurar variables
docker-compose up -d
docker logs iph-frontend | head -20
```

### **Servidor (Actualizar imagen)**
```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

### **Servidor (Cambiar configuración)**
```bash
nano .env              # Editar variables
docker-compose down
docker-compose up -d
```

### **Servidor (Verificar)**
```bash
./verify-server-config.sh
# o manualmente:
docker exec iph-frontend env | grep VITE_
docker exec iph-frontend cat /app/dist/config.js | grep apiBaseUrl
```

---

## 🎯 Checklist de Deployment

- [ ] Build ejecutado: `./deploy.sh <version>`
- [ ] Imagen en DockerHub verificada
- [ ] `.env` configurado en servidor con variables correctas
- [ ] `docker-compose.yaml` tiene `environment` con `${VARIABLES}`
- [ ] Contenedor iniciado: `docker-compose up -d`
- [ ] Logs verificados: `docker logs iph-frontend | head -20`
- [ ] config.js correcto: `docker exec iph-frontend cat /app/dist/config.js`
- [ ] App accesible en el dominio configurado

---

**Última actualización:** 2025-01-30
**Versión:** 1.0.0 - Runtime Configuration
