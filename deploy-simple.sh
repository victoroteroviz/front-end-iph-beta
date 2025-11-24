#!/bin/bash

# Script simplificado para build y deploy con runtime config
# Uso: ./deploy-simple.sh <version>
# Ejemplo: ./deploy-simple.sh 1.0.0

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
    echo "Ejemplo: $0 1.0.0"
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
log_info "✨ NUEVO: Build único para TODOS los ambientes"
log_info "Variables se configuran en RUNTIME con docker run -e"

# 1. Build de la imagen Docker (sin variables de entorno)
log_info "Construyendo imagen Docker universal..."
if docker build -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente: $IMAGE_NAME:$VERSION"
    log_info ""
    log_info "📦 Esta imagen funciona en CUALQUIER ambiente:"
    log_info "   docker run -e API_BASE_URL=https://dev.api.com ..."
    log_info "   docker run -e API_BASE_URL=https://prod.api.com ..."
    log_info ""
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
log_info ""
log_info "📦 Imágenes disponibles en DockerHub:"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:latest"
log_info ""
log_info "🚀 Ejemplo de uso:"
log_info ""
log_info "# Desarrollo:"
log_info "docker run -d -p 4173:4173 \\"
log_info "  -e API_BASE_URL=http://localhost:3000 \\"
log_info "  -e APP_ENVIRONMENT=development \\"
log_info "  -e DEBUG_MODE=true \\"
log_info "  $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
log_info ""
log_info "# Producción:"
log_info "docker run -d -p 4173:4173 \\"
log_info "  -e API_BASE_URL=https://iph01.okip.com.mx \\"
log_info "  -e APP_ENVIRONMENT=production \\"
log_info "  -e DEBUG_MODE=false \\"
log_info "  $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
