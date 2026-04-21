#!/bin/bash

# Script para build (AMD64), tag, push y deploy de la aplicación frontend-iph
# Uso: ./deploy.sh <version>

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verificar si se proporcionó la versión
if [ $# -eq 0 ]; then
    log_error "Debes proporcionar una versión como parámetro"
    echo "Uso: $0 <version>"
    exit 1
fi

VERSION=$1
IMAGE_NAME="frontend-iph"
DOCKER_USERNAME="tomalvarez17" 

if [ -z "$VERSION" ]; then
    log_error "La versión no puede estar vacía"
    exit 1
fi

log_info "Iniciando deploy de $IMAGE_NAME:$VERSION para plataforma linux/amd64"
log_info "Build genérico (runtime configuration) - No se requiere .env.production"

# 1. Build de la imagen Docker (FORZANDO AMD64)
log_info "Construyendo imagen Docker para AMD64..."
log_info "NOTA: Esta es una imagen genérica (runtime configuration)"

# --- CAMBIO REALIZADO: Agregado --platform linux/amd64 ---
if docker build --platform linux/amd64 -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente (AMD64): $IMAGE_NAME:$VERSION"
    log_info ""
    log_info "📦 Imagen genérica lista para deployment en servidores Linux"
    log_info "⚙️  La configuración se realizará en RUNTIME con docker-compose"
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

if docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Tag 'latest' creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:latest"
else
    log_error "Error al crear el tag 'latest'"
    exit 1
fi

# 3. Push a DockerHub (ambas versiones)
# IMPORTANTE: Asegúrate de haber hecho 'docker login' antes de correr el script
log_info "Subiendo imagen con versión a DockerHub..."
if docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Imagen con versión subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen. Verifica tu sesión con 'docker login'"
    exit 1
fi

log_info "Subiendo imagen 'latest' a DockerHub..."
if docker push $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Imagen 'latest' subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen 'latest'"
    exit 1
fi

log_success "¡Deploy finalizado exitosamente para la versión $VERSION (AMD64)!"
log_info "Imágenes disponibles en DockerHub para el server:"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:latest"