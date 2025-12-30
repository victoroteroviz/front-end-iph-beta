#!/bin/bash

# Script para build, tag, push y deploy de la aplicación back-end_iph
# Uso: ./deploy.sh <version>
# Ejemplo: ./deploy.sh 0.14.0 o ./deploy.sh 1.0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si se proporcionó la versión
if [ $# -eq 0 ]; then
    log_error "Debes proporcionar una versión como parámetro"
    echo "Uso: $0 <version>"
    echo "Ejemplo: $0 0.14.0 o $0 1.0"
    exit 1
fi

VERSION=$1
IMAGE_NAME="front-end-iph"
DOCKER_USERNAME="victoroteroviz"

# Validar que la versión no esté vacía
if [ -z "$VERSION" ]; then
    log_error "La versión no puede estar vacía"
    exit 1
fi

log_info "Iniciando deploy de $IMAGE_NAME:$VERSION"

# =====================================================
# NOTA: Ya NO cargamos variables de .env.production
# =====================================================
# El build ahora es genérico (sin variables embebidas)
# Las variables se configuran en RUNTIME en el servidor
# mediante docker-compose.yml + .env del servidor

log_info "Build genérico (runtime configuration) - No se requiere .env.production"

# =====================================================
# IMPORTANTE - RUNTIME CONFIGURATION
# =====================================================
# Esta imagen usa RUNTIME CONFIGURATION (no build-time)
# Las variables de entorno se configuran cuando se ejecuta el contenedor,
# NO durante el build. Esto permite:
#   ✅ Una sola imagen para dev, staging y producción
#   ✅ Cambiar configuración sin rebuild (solo restart)
#   ✅ Mayor flexibilidad y menor tamaño de registro
#
# La configuración se realiza en docker-compose.yml del servidor
# usando variables de entorno o archivos .env
# =====================================================

# 1. Build de la imagen Docker (SIN variables de entorno)
log_info "Construyendo imagen Docker..."
log_info "NOTA: Esta es una imagen genérica (runtime configuration)"
log_info "Las variables se configurarán en el servidor al ejecutar el contenedor"

if docker build -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente: $IMAGE_NAME:$VERSION"
    log_info ""
    log_info "📦 Imagen genérica lista para deployment"
    log_info "⚙️  La configuración se realizará en RUNTIME con docker-compose"
    log_info ""
    log_info "Ejemplo de uso en el servidor:"
    log_info "  1. Configurar variables en .env del servidor"
    log_info "  2. docker-compose down"
    log_info "  3. docker-compose up -d"
    log_info "  4. Verificar con: docker logs iph-frontend | head -20"
else
    log_error "Error al construir la imagen Docker"
    exit 1
fi

# 2. Tag de la imagen (versión específica y latest)
log_info "Creando tags para DockerHub..."
if docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Tag creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
else
    log_error "Error al crear el tag de versión"
    exit 1
fi

# Crear también tag 'latest'
if docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Tag 'latest' creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:latest"
else
    log_error "Error al crear el tag 'latest'"
    exit 1
fi

# 3. Push a DockerHub (ambas versiones)
log_info "Subiendo imagen con versión a DockerHub..."
if docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Imagen con versión subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen con versión a DockerHub"
    exit 1
fi

log_info "Subiendo imagen 'latest' a DockerHub..."
if docker push $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Imagen 'latest' subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen 'latest' a DockerHub"
    exit 1
fi

log_success "¡Deploy finalizado exitosamente para la versión $VERSION!"
log_info "Imágenes disponibles en DockerHub:"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:latest"
