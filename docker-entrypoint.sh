#!/bin/sh
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}[ENTRYPOINT]${NC} Iniciando configuración runtime..."

# Valores por defecto si no se pasan variables de entorno
API_BASE_URL="${API_BASE_URL:-https://iph01.okip.com.mx}"
APP_ENVIRONMENT="${APP_ENVIRONMENT:-production}"
APP_NAME="${APP_NAME:-IPH Frontend}"
APP_VERSION="${APP_VERSION:-1.0.0}"
DEBUG_MODE="${DEBUG_MODE:-false}"

echo "${BLUE}[ENTRYPOINT]${NC} Configuración runtime:"
echo "  - API_BASE_URL: ${API_BASE_URL}"
echo "  - APP_ENVIRONMENT: ${APP_ENVIRONMENT}"
echo "  - APP_NAME: ${APP_NAME}"
echo "  - APP_VERSION: ${APP_VERSION}"
echo "  - DEBUG_MODE: ${DEBUG_MODE}"

# Generar config.js desde el template
cat > /app/dist/config.js <<EOF
// Runtime configuration - Generado por Docker entrypoint
// NO modificar manualmente - Este archivo se regenera en cada inicio
window.__RUNTIME_CONFIG__ = {
  apiBaseUrl: '${API_BASE_URL}',
  appEnvironment: '${APP_ENVIRONMENT}',
  appName: '${APP_NAME}',
  appVersion: '${APP_VERSION}',
  debugMode: ${DEBUG_MODE}
};

console.log('✅ Runtime config cargado:', window.__RUNTIME_CONFIG__);
EOF

echo "${GREEN}[ENTRYPOINT]${NC} config.js generado exitosamente"
echo "${BLUE}[ENTRYPOINT]${NC} Iniciando servidor en puerto 4173..."

# Iniciar servidor
exec serve -s /app/dist -l 4173 --no-port-switching --no-clipboard
