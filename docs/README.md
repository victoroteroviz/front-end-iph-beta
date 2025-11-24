# 📚 Documentación IPH Frontend

Bienvenido a la documentación del proyecto IPH Frontend.

## 📖 Índice de Documentación

### 🚀 Deployment y Configuración

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment
  - Build de imágenes Docker
  - Push a DockerHub
  - Troubleshooting

- **[RUNTIME_CONFIG.md](./RUNTIME_CONFIG.md)** - Sistema de configuración en runtime
  - Cómo funcionan las variables en runtime
  - Diferencias con build-time config
  - Orden de precedencia

- **[ENVIRONMENTS.md](./ENVIRONMENTS.md)** - Uso en diferentes ambientes
  - Development
  - Staging
  - Production
  - Configuraciones específicas por ambiente

### 🏗️ Arquitectura

- **[ARCHITECTURE.md](../CLAUDE.md)** - Arquitectura del proyecto (ver CLAUDE.md)

---

## 🚀 Quick Start

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir http://localhost:5173
```

### Build para Producción

```bash
# Build local
npm run build

# Preview del build
npm run preview
```

### Deploy con Docker

```bash
# Build imagen universal (una sola vez)
./deploy-simple.sh 1.0.0

# Ejecutar en desarrollo
docker run -d -p 4173:4173 \
  -e API_BASE_URL=http://localhost:3000 \
  -e APP_ENVIRONMENT=development \
  victoroteroviz/front-end-iph:1.0.0

# Ejecutar en producción
docker run -d -p 4173:4173 \
  -e API_BASE_URL=https://iph01.okip.com.mx \
  -e APP_ENVIRONMENT=production \
  victoroteroviz/front-end-iph:1.0.0
```

---

## 📝 Documentos por Tema

### Para Desarrolladores
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Cómo hacer deploy
- [RUNTIME_CONFIG.md](./RUNTIME_CONFIG.md) - Configuración dinámica

### Para DevOps
- [ENVIRONMENTS.md](./ENVIRONMENTS.md) - Configuración de ambientes
- [DEPLOYMENT.md](./DEPLOYMENT.md) - CI/CD y Docker

### Para Arquitectura
- [CLAUDE.md](../CLAUDE.md) - Estructura del proyecto
- [RUNTIME_CONFIG.md](./RUNTIME_CONFIG.md) - Sistema de configuración

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la sección de Troubleshooting en [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Verifica los logs del contenedor: `docker logs <container_name>`
3. Revisa la configuración en [ENVIRONMENTS.md](./ENVIRONMENTS.md)

---

**Versión:** 3.7.0
**Última actualización:** 2025-01-24
