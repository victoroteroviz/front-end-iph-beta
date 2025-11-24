# 🚀 Guía de Deployment

Esta guía explica cómo hacer deployment del frontend IPH usando Docker con configuración en runtime.

---

## 📋 Tabla de Contenidos

- [Conceptos Clave](#conceptos-clave)
- [Prerequisitos](#prerequisitos)
- [Build de la Imagen](#build-de-la-imagen)
- [Push a DockerHub](#push-a-dockerhub)
- [Deployment en Ambientes](#deployment-en-ambientes)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Conceptos Clave

### Build Único vs Build por Ambiente

#### ❌ Antes (Build por ambiente)

```bash
# Tenías que hacer un build diferente para cada ambiente
./deploy.sh dev     # Build con URLs de dev
./deploy.sh staging # Build con URLs de staging
./deploy.sh prod    # Build con URLs de prod

# Resultado: 3 imágenes diferentes
# Problema: Lento, propenso a errores, difícil de mantener
```

#### ✅ Ahora (Build único)

```bash
# Haces UN SOLO build
./deploy-simple.sh 1.0.0

# Usas la MISMA imagen en todos los ambientes
# Solo cambias las variables de entorno al ejecutar
docker run -e API_BASE_URL=https://dev.api.com ...
docker run -e API_BASE_URL=https://prod.api.com ...

# Resultado: 1 imagen universal
# Ventaja: Rápido, consistente, fácil de mantener
```

---

## 🔧 Prerequisitos

### Software Necesario

```bash
# Node.js (v18+)
node --version

# Docker
docker --version

# Cuenta en DockerHub (para push)
docker login --username tu-usuario
```

### Permisos de Docker

Si obtienes errores de permisos:

```bash
# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Recargar grupos
newgrp docker

# Verificar
docker ps  # Debe funcionar sin sudo
```

---

## 🏗️ Build de la Imagen

### Opción A: Script Automatizado (Recomendado)

```bash
# Build y push automático
./deploy-simple.sh 1.0.0

# Salida esperada:
# ✅ Imagen construida: front-end-iph:1.0.0
# ✅ Tags creados: victoroteroviz/front-end-iph:1.0.0
# ✅ Tag latest: victoroteroviz/front-end-iph:latest
# ✅ Push a DockerHub completado
```

### Opción B: Manual (Paso a Paso)

#### 1. Build de la imagen

```bash
docker build -t front-end-iph:1.0.0 .
```

**Qué hace:**
- Instala dependencias con `npm ci`
- Ejecuta `npm run build`
- Copia `dist/` a la imagen
- Configura entrypoint para runtime config

#### 2. Verificar la imagen

```bash
# Listar imágenes
docker images | grep front-end-iph

# Salida esperada:
# front-end-iph  1.0.0  abc123  2 minutes ago  268MB
```

#### 3. Probar localmente

```bash
docker run -d -p 4173:4173 \
  --name test-frontend \
  -e API_BASE_URL=http://localhost:3000 \
  -e APP_ENVIRONMENT=development \
  front-end-iph:1.0.0

# Ver logs
docker logs -f test-frontend

# Abrir navegador
# http://localhost:4173
```

#### 4. Verificar configuración

```bash
# En el navegador, abre la consola (F12)
console.log(window.__RUNTIME_CONFIG__);

# Debe mostrar:
# {
#   apiBaseUrl: "http://localhost:3000",
#   appEnvironment: "development",
#   ...
# }
```

---

## 📤 Push a DockerHub

### 1. Login a DockerHub

```bash
docker login --username victoroteroviz
# Ingresa tu password cuando te lo pida
```

### 2. Crear tags

```bash
# Tag con versión específica
docker tag front-end-iph:1.0.0 victoroteroviz/front-end-iph:1.0.0

# Tag latest
docker tag front-end-iph:1.0.0 victoroteroviz/front-end-iph:latest
```

### 3. Push a DockerHub

```bash
# Push versión específica
docker push victoroteroviz/front-end-iph:1.0.0

# Push latest
docker push victoroteroviz/front-end-iph:latest
```

### 4. Verificar en DockerHub

Visita: https://hub.docker.com/r/victoroteroviz/front-end-iph

Debes ver:
- Tag `1.0.0`
- Tag `latest`

---

## 🌍 Deployment en Ambientes

### Development

```bash
docker run -d -p 4173:4173 \
  --name iph-frontend-dev \
  --restart unless-stopped \
  -e API_BASE_URL=http://localhost:3000 \
  -e APP_ENVIRONMENT=development \
  -e APP_NAME="IPH Development" \
  -e APP_VERSION=1.0.0 \
  -e DEBUG_MODE=true \
  victoroteroviz/front-end-iph:1.0.0

# Acceder: http://localhost:4173
```

### Staging

```bash
docker run -d -p 4173:4173 \
  --name iph-frontend-staging \
  --restart unless-stopped \
  -e API_BASE_URL=https://staging-api.okip.com.mx \
  -e APP_ENVIRONMENT=staging \
  -e APP_NAME="IPH Staging" \
  -e APP_VERSION=1.0.0 \
  -e DEBUG_MODE=true \
  victoroteroviz/front-end-iph:1.0.0

# Acceder: http://staging.okip.com.mx:4173
```

### Production

```bash
docker run -d -p 4173:4173 \
  --name iph-frontend-prod \
  --restart unless-stopped \
  -e API_BASE_URL=https://iph01.okip.com.mx \
  -e APP_ENVIRONMENT=production \
  -e APP_NAME="IPH Frontend" \
  -e APP_VERSION=1.0.0 \
  -e DEBUG_MODE=false \
  victoroteroviz/front-end-iph:1.0.0

# Acceder: https://iph01.okip.com.mx
```

---

## 🔄 Actualizar a Nueva Versión

### 1. Stop del contenedor actual

```bash
docker stop iph-frontend-prod
docker rm iph-frontend-prod
```

### 2. Pull nueva versión

```bash
docker pull victoroteroviz/front-end-iph:1.0.1
```

### 3. Iniciar con nueva versión

```bash
docker run -d -p 4173:4173 \
  --name iph-frontend-prod \
  --restart unless-stopped \
  -e API_BASE_URL=https://iph01.okip.com.mx \
  -e APP_ENVIRONMENT=production \
  -e DEBUG_MODE=false \
  victoroteroviz/front-end-iph:1.0.1
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to Docker daemon"

```bash
# Verificar que Docker está corriendo
sudo systemctl status docker

# Iniciar Docker si está detenido
sudo systemctl start docker

# Verificar permisos
docker ps  # Si falla, revisa la sección de Prerequisitos
```

### Error: "push access denied"

```bash
# Hacer login nuevamente
docker login --username victoroteroviz

# Si estás usando sudo, haz login con sudo también
sudo docker login --username victoroteroviz
```

### Error: "Port 4173 already in use"

```bash
# Ver qué está usando el puerto
sudo lsof -i :4173

# Detener el contenedor anterior
docker stop $(docker ps -q --filter "publish=4173")

# O usar otro puerto
docker run -d -p 8080:4173 ...
```

### La app no carga / Pantalla en blanco

```bash
# Ver logs del contenedor
docker logs iph-frontend-prod

# Verificar configuración
docker exec iph-frontend-prod cat /app/dist/config.js

# Verificar que el contenedor está corriendo
docker ps | grep front-end-iph
```

### Variables no se están aplicando

```bash
# Verificar que el entrypoint está generando config.js
docker logs iph-frontend-prod | grep "ENTRYPOINT"

# Debe mostrar:
# [ENTRYPOINT] Configuración runtime:
# - API_BASE_URL: https://...

# Si no aparece, el entrypoint no se está ejecutando
# Reconstruye la imagen
docker build --no-cache -t front-end-iph:1.0.0 .
```

### Build falla con error de TypeScript

```bash
# Limpiar cache
rm -rf dist node_modules/.vite

# Reinstalar dependencias
npm ci

# Build nuevamente
npm run build

# Si el error persiste, verificar errores de TypeScript
npx tsc --noEmit
```

---

## 📊 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Ver logs en tiempo real
docker logs -f <container_name>

# Ver logs de las últimas 100 líneas
docker logs --tail 100 <container_name>

# Entrar al contenedor (bash)
docker exec -it <container_name> sh

# Ver uso de recursos
docker stats <container_name>

# Reiniciar contenedor
docker restart <container_name>
```

### Gestión de Imágenes

```bash
# Listar imágenes
docker images

# Eliminar imagen
docker rmi <image_id>

# Eliminar imágenes no usadas
docker image prune

# Ver espacio usado
docker system df
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune -a

# Limpieza completa (cuidado!)
docker system prune -a
```

---

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca commitear secretos reales al repo**
   ```bash
   # ❌ MAL
   git add .env

   # ✅ BIEN
   .env está en .gitignore
   ```

2. **Usar variables de entorno para secretos**
   ```bash
   # Pasar secretos al ejecutar, no hardcodear
   docker run -e API_KEY=${API_KEY} ...
   ```

3. **Actualizar dependencias regularmente**
   ```bash
   npm audit
   npm audit fix
   ```

4. **No ejecutar contenedores como root**
   ```bash
   # El Dockerfile ya usa usuario no-root (nextjs)
   USER nextjs
   ```

---

## 📝 Checklist de Deployment

### Pre-deployment

- [ ] Tests pasan: `npm test`
- [ ] Build local funciona: `npm run build && npm run preview`
- [ ] TypeScript sin errores: `npx tsc --noEmit`
- [ ] Variables de entorno configuradas

### Deployment

- [ ] Build de imagen: `./deploy-simple.sh <version>`
- [ ] Push a DockerHub completado
- [ ] Pull en servidor: `docker pull victoroteroviz/front-end-iph:<version>`
- [ ] Backup del contenedor anterior (si aplica)
- [ ] Iniciar nuevo contenedor con variables correctas
- [ ] Verificar logs: `docker logs -f <container>`

### Post-deployment

- [ ] App carga correctamente
- [ ] Configuración runtime visible: `window.__RUNTIME_CONFIG__`
- [ ] API calls funcionan
- [ ] No hay errores en consola del navegador
- [ ] Funcionalidades críticas probadas

---

## 🔗 Referencias

- [Docker Documentation](https://docs.docker.com/)
- [DockerHub](https://hub.docker.com/)
- [Vite Build Options](https://vitejs.dev/config/build-options.html)
- [Runtime Config Guide](./RUNTIME_CONFIG.md)
- [Environments Guide](./ENVIRONMENTS.md)

---

**Última actualización:** 2025-01-24
**Versión:** 1.0.0
