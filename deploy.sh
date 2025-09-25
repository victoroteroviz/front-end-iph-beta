#!/bin/bash

# Script para build, tag, push y deploy de la aplicación front-end-iph
# Uso: ./deploy.sh <version>
# Ejemplo: ./deploy.sh 1.0.0 o ./deploy.sh 1.2

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
    echo "Ejemplo: $0 1.0.0 o $0 1.2"
    exit 1
fi

VERSION=$1
IMAGE_NAME="front-end-iph"
DOCKER_USERNAME="victoroteroviz"
CONTAINER_NAME="iph-frontend"

# Validar que la versión no esté vacía
if [ -z "$VERSION" ]; then
    log_error "La versión no puede estar vacía"
    exit 1
fi

log_info "Iniciando deploy de $IMAGE_NAME:$VERSION"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    log_error "No se encontraron los archivos necesarios (package.json, Dockerfile)"
    log_error "Asegúrate de ejecutar el script desde el directorio raíz del proyecto"
    exit 1
fi

# 0. Limpiar contenedores anteriores
log_info "Limpiando contenedores anteriores..."
if sudo docker compose down 2>/dev/null; then
    log_success "Contenedores anteriores detenidos"
else
    log_warning "No había contenedores ejecutándose"
fi

# 1. Build de la imagen Docker con argumentos
log_info "Construyendo imagen Docker con variables de entorno..."
if sudo docker build \
    --build-arg VITE_API_BASE_URL="https://iph01.okip.com.mx" \
    --build-arg VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]' \
    --build-arg VITE_ADMIN_ROLE='[{"id":2,"nombre":"Administrador"}]' \
    --build-arg VITE_SUPERIOR_ROLE='[{"id":3,"nombre":"Superior"}]' \
    --build-arg VITE_ELEMENTO_ROLE='[{"id":4,"nombre":"Elemento"}]' \
    --build-arg VITE_LOG_LEVEL="1" \
    --build-arg VITE_LOG_CONSOLE="true" \
    --build-arg VITE_LOG_STORAGE="true" \
    --build-arg VITE_LOG_MAX_ENTRIES="1000" \
    --build-arg VITE_HTTP_TIMEOUT="30000" \
    --build-arg VITE_HTTP_RETRIES="3" \
    --build-arg VITE_HTTP_RETRY_DELAY="1000" \
    --build-arg VITE_AUTH_HEADER_NAME="Authorization" \
    --build-arg VITE_AUTH_HEADER_PREFIX="Bearer" \
    --build-arg VITE_AUTH_TOKEN_KEY="auth_token" \
    --build-arg VITE_DEBUG_MODE="false" \
    --build-arg VITE_APP_VERSION="1.0.0" \
    --build-arg VITE_APP_NAME="IPH Frontend" \
    -t $IMAGE_NAME:$VERSION .; then
    log_success "Imagen construida exitosamente: $IMAGE_NAME:$VERSION"
else
    log_error "Error al construir la imagen Docker"
    exit 1
fi

# También crear tag latest
log_info "Creando tag latest..."
if sudo docker tag $IMAGE_NAME:$VERSION $IMAGE_NAME:latest; then
    log_success "Tag latest creado exitosamente"
else
    log_error "Error al crear el tag latest"
    exit 1
fi

# 2. Tag de la imagen para DockerHub
log_info "Creando tags para DockerHub..."
if sudo docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
    log_success "Tag versionado creado: $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
else
    log_error "Error al crear el tag versionado"
    exit 1
fi

if sudo docker tag $IMAGE_NAME:$VERSION $DOCKER_USERNAME/$IMAGE_NAME:latest; then
    log_success "Tag latest creado: $DOCKER_USERNAME/$IMAGE_NAME:latest"
else
    log_error "Error al crear el tag latest"
    exit 1
fi

# 3. Push a DockerHub
log_info "¿Deseas subir la imagen a DockerHub? (y/n)"
read -r push_to_hub

if [[ $push_to_hub == "y" || $push_to_hub == "Y" || $push_to_hub == "yes" || $push_to_hub == "YES" ]]; then
    log_info "Subiendo imagen versionada a DockerHub..."
    if sudo docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION; then
        log_success "Imagen versionada subida exitosamente a DockerHub"
    else
        log_error "Error al subir la imagen versionada a DockerHub"
        exit 1
    fi

    log_info "Subiendo imagen latest a DockerHub..."
    if sudo docker push $DOCKER_USERNAME/$IMAGE_NAME:latest; then
        log_success "Imagen latest subida exitosamente a DockerHub"
    else
        log_error "Error al subir la imagen latest a DockerHub"
        exit 1
    fi
else
    log_warning "Saltando subida a DockerHub"
fi

# 4. Deploy con docker-compose
log_info "Desplegando aplicación con docker-compose..."
if sudo docker compose up -d; then
    log_success "Aplicación desplegada exitosamente"
else
    log_error "Error al desplegar la aplicación"
    exit 1
fi

# 5. Verificar que el contenedor esté ejecutándose
log_info "Verificando estado del contenedor..."
sleep 3
if sudo docker compose ps | grep -q "Up"; then
    log_success "Contenedor ejecutándose correctamente"
    log_info "Aplicación disponible en: http://localhost:5000"
else
    log_error "El contenedor no se está ejecutando correctamente"
    log_info "Mostrando logs del contenedor..."
    sudo docker compose logs --tail=20
    exit 1
fi

# 6. Mostrar información útil
log_info "==================== INFORMACIÓN DEL DEPLOYMENT ===================="
echo -e "${GREEN}Versión desplegada:${NC} $VERSION"
echo -e "${GREEN}Imagen local:${NC} $IMAGE_NAME:$VERSION"
echo -e "${GREEN}URL de la aplicación:${NC} http://localhost:5000"
echo -e "${GREEN}Estado del contenedor:${NC}"
sudo docker compose ps

# 7. Mostrar logs (opcional)
log_info "¿Deseas ver los logs en tiempo real? (y/n)"
read -r show_logs

if [[ $show_logs == "y" || $show_logs == "Y" || $show_logs == "yes" || $show_logs == "YES" ]]; then
    log_info "Mostrando logs en tiempo real... (Ctrl+C para salir)"
    sudo docker compose logs -f
else
    log_info "Para ver los logs usa: sudo docker compose logs -f"
fi

log_success "¡Deploy finalizado exitosamente para la versión $VERSION!"
echo -e "${BLUE}Comandos útiles:${NC}"
echo "  - Ver logs: sudo docker compose logs -f"
echo "  - Detener: sudo docker compose down"
echo "  - Reiniciar: sudo docker compose restart"
echo "  - Entrar al contenedor: sudo docker compose exec frontend sh"