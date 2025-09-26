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
# 1. Build de la imagen Docker
log_info "Construyendo imagen Docker..."
if sudo docker build -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente: $IMAGE_NAME:$VERSION"
else
    log_error "Error al construir la imagen Docker"
    exit 1
fi


# 2. Tag de la imagen
log_info "Creando tag para DockerHub..."
if sudo docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Tag creado exitosamente: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
else
    log_error "Error al crear el tag"
    exit 1
fi

# 3. Push a DockerHub
log_info "Subiendo imagen a DockerHub..."
if sudo docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Imagen subida exitosamente a DockerHub"
else
    log_error "Error al subir la imagen a DockerHub"
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
