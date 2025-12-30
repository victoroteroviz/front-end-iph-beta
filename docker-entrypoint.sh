#!/bin/sh
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}[ENTRYPOINT]${NC} Iniciando configuración runtime..."

# =============================================================================
# VARIABLES DE ENTORNO - Valores por defecto si no se pasan
# =============================================================================

# App Config
API_BASE_URL="${VITE_API_BASE_URL:-https://iph01.okip.com.mx}"
APP_ENVIRONMENT="${VITE_APP_ENVIRONMENT:-production}"
APP_NAME="${VITE_APP_NAME:-IPH Frontend}"
APP_VERSION="${VITE_APP_VERSION:-1.0.0}"
DEBUG_MODE="${VITE_DEBUG_MODE:-false}"

# Roles (JSON strings)
SUPERADMIN_ROLE="${VITE_SUPERADMIN_ROLE:-[{\"id\":1,\"nombre\":\"SuperAdmin\"}]}"
ADMIN_ROLE="${VITE_ADMIN_ROLE:-[{\"id\":2,\"nombre\":\"Administrador\"}]}"
SUPERIOR_ROLE="${VITE_SUPERIOR_ROLE:-[{\"id\":3,\"nombre\":\"Superior\"}]}"
ELEMENTO_ROLE="${VITE_ELEMENTO_ROLE:-[{\"id\":4,\"nombre\":\"Elemento\"}]}"

# Logger Config
LOG_LEVEL="${VITE_LOG_LEVEL:-WARN}"
LOG_CONSOLE="${VITE_LOG_CONSOLE:-false}"
LOG_STORAGE="${VITE_LOG_STORAGE:-true}"
LOG_MAX_ENTRIES="${VITE_LOG_MAX_ENTRIES:-1000}"

# HTTP Config
HTTP_TIMEOUT="${VITE_HTTP_TIMEOUT:-30000}"
HTTP_RETRIES="${VITE_HTTP_RETRIES:-3}"
HTTP_RETRY_DELAY="${VITE_HTTP_RETRY_DELAY:-1000}"

# Auth Config
AUTH_HEADER_NAME="${VITE_AUTH_HEADER_NAME:-Authorization}"
AUTH_HEADER_PREFIX="${VITE_AUTH_HEADER_PREFIX:-Bearer}"
AUTH_TOKEN_KEY="${VITE_AUTH_TOKEN_KEY:-auth_token}"

echo "${BLUE}[ENTRYPOINT]${NC} Configuración runtime:"
echo "  - API_BASE_URL: ${API_BASE_URL}"
echo "  - APP_ENVIRONMENT: ${APP_ENVIRONMENT}"
echo "  - APP_NAME: ${APP_NAME}"
echo "  - APP_VERSION: ${APP_VERSION}"
echo "  - DEBUG_MODE: ${DEBUG_MODE}"
echo "  - LOG_LEVEL: ${LOG_LEVEL}"

# =============================================================================
# GENERAR config.js
# =============================================================================
cat > /app/dist/config.js <<EOF
// Runtime configuration - Generado por Docker entrypoint
// NO modificar manualmente - Este archivo se regenera en cada inicio
// Generado: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

window.__RUNTIME_CONFIG__ = {
  // App Config
  apiBaseUrl: '${API_BASE_URL}',
  appEnvironment: '${APP_ENVIRONMENT}',
  appName: '${APP_NAME}',
  appVersion: '${APP_VERSION}',
  debugMode: ${DEBUG_MODE},

  // Roles
  superadminRole: ${SUPERADMIN_ROLE},
  adminRole: ${ADMIN_ROLE},
  superiorRole: ${SUPERIOR_ROLE},
  elementoRole: ${ELEMENTO_ROLE},

  // Logger Config
  logLevel: '${LOG_LEVEL}',
  logConsole: ${LOG_CONSOLE},
  logStorage: ${LOG_STORAGE},
  logMaxEntries: ${LOG_MAX_ENTRIES},

  // HTTP Config
  httpTimeout: ${HTTP_TIMEOUT},
  httpRetries: ${HTTP_RETRIES},
  httpRetryDelay: ${HTTP_RETRY_DELAY},

  // Auth Config
  authHeaderName: '${AUTH_HEADER_NAME}',
  authHeaderPrefix: '${AUTH_HEADER_PREFIX}',
  authTokenKey: '${AUTH_TOKEN_KEY}'
};

console.log('✅ Runtime config cargado:', window.__RUNTIME_CONFIG__.appEnvironment, window.__RUNTIME_CONFIG__.appVersion);
EOF

echo "${GREEN}[ENTRYPOINT]${NC} config.js generado exitosamente"
echo "${BLUE}[ENTRYPOINT]${NC} Iniciando servidor en puerto 4173..."

# Iniciar servidor
exec serve -s /app/dist -l 4173 --no-port-switching --no-clipboard
