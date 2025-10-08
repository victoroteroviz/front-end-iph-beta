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

# Función para cargar variables de entorno desde archivo .env preservando formato JSON
load_env_file() {
    local env_file=$1
    
    if [ ! -f "$env_file" ]; then
        log_error "Archivo $env_file no encontrado"
        return 1
    fi
    
    log_info "Cargando variables desde $env_file"
    
    # Leer línea por línea preservando comillas y espacios
    while IFS= read -r line || [ -n "$line" ]; do
        # Ignorar líneas vacías y comentarios
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Extraer nombre y valor de la variable
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            
            # Exportar la variable preservando el valor exacto
            export "$var_name=$var_value"
            
            # Log de variables cargadas (ocultar valores sensibles de roles por ser muy largos)
            if [[ $var_name == *"ROLE"* ]]; then
                log_info "  ✓ $var_name cargado"
            else
                log_info "  ✓ $var_name=$var_value"
            fi
        fi
    done < "$env_file"
    
    return 0
}

# Cargar variables desde .env.production
if ! load_env_file ".env.production"; then
    log_warning "No se pudo cargar .env.production, usando valores por defecto"
    
    # Valores por defecto como fallback
    export VITE_API_BASE_URL="https://iph01.okip.com.mx"
    export VITE_APP_ENVIRONMENT="production"
    export VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]'
    export VITE_ADMIN_ROLE='[{"id":2,"nombre":"Administrador"}]'
    export VITE_SUPERIOR_ROLE='[{"id":3,"nombre":"Superior"}]'
    export VITE_ELEMENTO_ROLE='[{"id":4,"nombre":"Elemento"}]'
    export VITE_LOG_LEVEL="1"
    export VITE_LOG_CONSOLE="true"
    export VITE_LOG_STORAGE="true"
    export VITE_LOG_MAX_ENTRIES="1000"
    export VITE_HTTP_TIMEOUT="30000"
    export VITE_HTTP_RETRIES="3"
    export VITE_HTTP_RETRY_DELAY="1000"
    export VITE_AUTH_HEADER_NAME="Authorization"
    export VITE_AUTH_HEADER_PREFIX="Bearer"
    export VITE_AUTH_TOKEN_KEY="auth_token"
    export VITE_DEBUG_MODE="false"
    export VITE_APP_NAME="IPH Frontend"
fi

log_success "Variables de entorno cargadas correctamente"

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

log_success "¡Deploy finalizado exitosamente para la versión $VERSION!"
log_info "Imágenes disponibles en DockerHub:"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:$VERSION"
log_info "  - $DOCKER_USERNAME/$IMAGE_NAME:latest"
