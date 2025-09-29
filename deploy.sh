#!/bin/bash

# ====================================================================
# 🚀 SCRIPT DE DESPLIEGUE IPH - PRODUCCIÓN OPTIMIZADA
# ====================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# ============================================
# 🔧 CONFIGURACIÓN INICIAL
# ============================================

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    log_error "Archivo .env no encontrado. Copia .env.production.example a .env y configúralo."
    exit 1
fi

# Cargar variables de entorno
source .env

log_info "🚀 Iniciando despliegue de IPH..."
log_info "📦 Dominio: ${VIRTUAL_HOST}"
log_info "🌐 Network ID: ${DOCKER_NETWORK_ID:-iph}"

# ============================================
# 🔍 VERIFICACIONES PREVIAS
# ============================================

log_info "🔍 Verificando dependencias..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

# Verificar red de Traefik
if ! docker network ls | grep -q "traefik"; then
    log_warning "Red 'traefik' no encontrada. Asegúrate de que Traefik esté corriendo."
fi

# Verificar red de base de datos
if ! docker network ls | grep -q "iph-vault"; then
    log_warning "Red 'iph-vault' no encontrada. Asegúrate de que la base de datos esté disponible."
fi

log_success "✅ Verificaciones completadas"

# ============================================
# 🛑 DETENER SERVICIOS EXISTENTES
# ============================================

log_info "🛑 Deteniendo servicios existentes..."

# Detener contenedores si existen
docker stop iph-frontend iph-backend 2>/dev/null || true
docker rm iph-frontend iph-backend 2>/dev/null || true

log_success "✅ Servicios detenidos"

# ============================================
# 🌐 CREAR REDES
# ============================================

log_info "🌐 Configurando redes..."

# Crear red interna si no existe
if ! docker network ls | grep -q "iph-internal"; then
    docker network create \
        --driver bridge \
        --subnet=172.22.0.0/16 \
        --gateway=172.22.0.1 \
        iph-internal
    log_success "✅ Red 'iph-internal' creada"
else
    log_info "🔄 Red 'iph-internal' ya existe"
fi

# ============================================
# 🚀 DESPLEGAR SERVICIOS
# ============================================

log_info "🚀 Desplegando servicios..."

# Usar docker-compose unified
if [ -f "docker-compose-unified.yaml" ]; then
    log_info "📦 Usando configuración unificada..."
    docker-compose -f docker-compose-unified.yaml up -d
else
    log_error "Archivo docker-compose-unified.yaml no encontrado"
    exit 1
fi

log_success "✅ Servicios desplegados"

# ============================================
# 🔍 VERIFICAR SALUD DE SERVICIOS
# ============================================

log_info "🔍 Verificando salud de servicios..."

# Esperar a que los servicios estén listos
sleep 10

# Verificar backend
log_info "🔧 Verificando backend..."
for i in {1..30}; do
    if docker exec iph-backend wget --no-verbose --tries=1 --spider http://localhost:6000/api/health 2>/dev/null; then
        log_success "✅ Backend está funcionando"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "❌ Backend no responde después de 5 minutos"
        docker logs iph-backend --tail 50
        exit 1
    fi
    log_info "⏳ Esperando backend... ($i/30)"
    sleep 10
done

# Verificar frontend
log_info "🎨 Verificando frontend..."
for i in {1..30}; do
    if docker exec iph-frontend wget --no-verbose --tries=1 --spider http://localhost:4173 2>/dev/null; then
        log_success "✅ Frontend está funcionando"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "❌ Frontend no responde después de 5 minutos"
        docker logs iph-frontend --tail 50
        exit 1
    fi
    log_info "⏳ Esperando frontend... ($i/30)"
    sleep 10
done

# ============================================
# 📊 RESUMEN FINAL
# ============================================

log_success "🎉 ¡Despliegue completado exitosamente!"
echo ""
log_info "📋 Resumen del despliegue:"
log_info "   🌐 Frontend: https://${VIRTUAL_HOST}"
log_info "   🔧 Backend: https://api.${VIRTUAL_HOST}"
log_info "   🐳 Contenedores: iph-frontend, iph-backend"
log_info "   🌐 Redes: traefik, iph-vault, iph-internal"
echo ""
log_info "📝 Comandos útiles:"
log_info "   📊 Ver logs: docker logs iph-frontend -f"
log_info "   📊 Ver logs: docker logs iph-backend -f"
log_info "   🔍 Estado: docker ps"
log_info "   🛑 Detener: docker-compose -f docker-compose-unified.yaml down"
echo ""
log_success "✨ El sistema IPH está listo para usar!"