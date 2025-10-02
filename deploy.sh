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

# Definir variables de entorno directamente con valores por defecto
# API Configuration
VITE_API_BASE_URL="https://iph01.okip.com.mx"
VITE_APP_ENVIRONMENT="production"

# Roles Configuration (JSON válido con comillas escapadas)
VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]'
VITE_ADMIN_ROLE='[{"id":2,"nombre":"Administrador"}]'
VITE_SUPERIOR_ROLE='[{"id":3,"nombre":"Superior"}]'
VITE_ELEMENTO_ROLE='[{"id":4,"nombre":"Elemento"}]'

# Logging Configuration
VITE_LOG_LEVEL="1"
VITE_LOG_CONSOLE="true"
VITE_LOG_STORAGE="true"
VITE_LOG_MAX_ENTRIES="1000"

# HTTP Configuration
VITE_HTTP_TIMEOUT="30000"
VITE_HTTP_RETRIES="3"
VITE_HTTP_RETRY_DELAY="1000"

# Auth Configuration
VITE_AUTH_HEADER_NAME="Authorization"
VITE_AUTH_HEADER_PREFIX="Bearer"
VITE_AUTH_TOKEN_KEY="auth_token"

# App Configuration
VITE_DEBUG_MODE="false"
VITE_APP_NAME="IPH Frontend"

log_info "Variables de entorno configuradas para producción"

# 1. Build de la imagen Docker con build arguments
log_info "Construyendo imagen Docker con variables de entorno..."
if sudo docker build \
    --build-arg VITE_APP_ENVIRONMENT="$VITE_APP_ENVIRONMENT" \
    --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    --build-arg VITE_SUPERADMIN_ROLE="$VITE_SUPERADMIN_ROLE" \
    --build-arg VITE_ADMIN_ROLE="$VITE_ADMIN_ROLE" \
    --build-arg VITE_SUPERIOR_ROLE="$VITE_SUPERIOR_ROLE" \
    --build-arg VITE_ELEMENTO_ROLE="$VITE_ELEMENTO_ROLE" \
    --build-arg VITE_LOG_LEVEL="$VITE_LOG_LEVEL" \
    --build-arg VITE_LOG_CONSOLE="$VITE_LOG_CONSOLE" \
    --build-arg VITE_LOG_STORAGE="$VITE_LOG_STORAGE" \
    --build-arg VITE_LOG_MAX_ENTRIES="$VITE_LOG_MAX_ENTRIES" \
    --build-arg VITE_HTTP_TIMEOUT="$VITE_HTTP_TIMEOUT" \
    --build-arg VITE_HTTP_RETRIES="$VITE_HTTP_RETRIES" \
    --build-arg VITE_HTTP_RETRY_DELAY="$VITE_HTTP_RETRY_DELAY" \
    --build-arg VITE_AUTH_HEADER_NAME="$VITE_AUTH_HEADER_NAME" \
    --build-arg VITE_AUTH_HEADER_PREFIX="$VITE_AUTH_HEADER_PREFIX" \
    --build-arg VITE_AUTH_TOKEN_KEY="$VITE_AUTH_TOKEN_KEY" \
    --build-arg VITE_DEBUG_MODE="$VITE_DEBUG_MODE" \
    --build-arg VITE_APP_VERSION="$VERSION" \
    --build-arg VITE_APP_NAME="$VITE_APP_NAME" \
    -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente: $IMAGE_NAME:$VERSION"
    log_info "Variables usadas en build:"
    log_info "  - VITE_API_BASE_URL: $VITE_API_BASE_URL"
    log_info "  - VITE_APP_ENVIRONMENT: $VITE_APP_ENVIRONMENT"
    log_info "  - VITE_APP_VERSION: $VERSION"
else
    log_error "Error al construir la imagen Docker"
    exit 1
fi

# 2. Tag de la imagen (versión específica y latest)
log_info "Creando tags para DockerHub..."
if sudo docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Tag creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
else
    log_error "Error al crear el tag de versión"
    exit 1
fi

# Crear también tag 'latest'
if sudo docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Tag 'latest' creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:latest"
else
    log_error "Error al crear el tag 'latest'"
    exit 1
fi

# 3. Push a DockerHub (ambas versiones)
log_info "Subiendo imagen con versión a DockerHub..."
if sudo docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Imagen con versión subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen con versión a DockerHub"
    exit 1
fi

log_info "Subiendo imagen 'latest' a DockerHub..."
if sudo docker push $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Imagen 'latest' subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen 'latest' a DockerHub"
    exit 1
fi

# 4. Deploy con docker-compose
log_info "Desplegando aplicación con docker-compose..."
if sudo docker compose -f docker-compose.yml up -d; then
    log_success "Aplicación desplegada exitosamente"
else
    log_error "Error al desplegar la aplicación"
    exit 1
fi

# 5. Mostrar logs (opcional)
log_info "¿Deseas ver los logs en tiempo real? (y/n)"
read -r show_logs

if [[ $show_logs == "y" || $show_logs == "Y" || $show_logs == "yes" || $show_logs == "YES" ]]; then
    log_info "Mostrando logs en tiempo real... (Ctrl+C para salir)"
    sudo docker logs -f iph-frontend
else
    log_success "Deploy completado. Para ver los logs usa: sudo docker logs -f <container_name>"
fi

log_success "¡Deploy finalizado exitosamente para la versión $VERSION!"
