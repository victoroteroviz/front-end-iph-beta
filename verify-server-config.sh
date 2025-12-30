#!/bin/bash

# Script de verificación de configuración runtime en el servidor
# Ejecutar en el servidor donde corre docker-compose
# Uso: ./verify-server-config.sh

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VERIFICACIÓN DE CONFIGURACIÓN RUNTIME - IPH FRONTEND ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.yaml" ] && [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ Error: No se encontró docker-compose.yaml en el directorio actual${NC}"
    echo "Por favor ejecuta este script desde el directorio donde está docker-compose.yaml"
    exit 1
fi

COMPOSE_FILE="docker-compose.yaml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

echo -e "${GREEN}✓ Encontrado: $COMPOSE_FILE${NC}"
echo ""

# 1. Verificar archivo .env
echo -e "${BLUE}[1/6] Verificando archivo .env...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Archivo .env encontrado${NC}"
    echo -e "${YELLOW}Variables configuradas:${NC}"
    grep -v "^#" .env | grep -v "^$" | grep "VITE_" | while read line; do
        echo "  $line"
    done
else
    echo -e "${RED}✗ Archivo .env NO encontrado${NC}"
    echo -e "${YELLOW}Crea un archivo .env con tus variables de configuración${NC}"
fi
echo ""

# 2. Verificar configuración de docker-compose
echo -e "${BLUE}[2/6] Verificando configuración de docker-compose...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Variables que docker-compose pasará al contenedor:${NC}"
    docker compose config | grep -A 50 "environment:" | grep "VITE_" | head -20
else
    echo -e "${RED}✗ Docker no está instalado o no está en el PATH${NC}"
fi
echo ""

# 3. Verificar si el contenedor está corriendo
echo -e "${BLUE}[3/6] Verificando estado del contenedor...${NC}"
if docker ps | grep -q "iph-frontend"; then
    echo -e "${GREEN}✓ Contenedor iph-frontend está corriendo${NC}"

    # 4. Verificar variables de entorno en el contenedor
    echo ""
    echo -e "${BLUE}[4/6] Verificando variables en el contenedor en ejecución...${NC}"
    echo -e "${YELLOW}Variables VITE_* dentro del contenedor:${NC}"
    docker exec iph-frontend env | grep "VITE_" | sort

    # 5. Verificar config.js generado
    echo ""
    echo -e "${BLUE}[5/6] Verificando config.js generado...${NC}"
    echo -e "${YELLOW}Contenido de window.__RUNTIME_CONFIG__:${NC}"
    docker exec iph-frontend cat /app/dist/config.js | grep -A 30 "window.__RUNTIME_CONFIG__"

    # 6. Verificar logs del entrypoint
    echo ""
    echo -e "${BLUE}[6/6] Verificando logs del entrypoint...${NC}"
    echo -e "${YELLOW}Últimas líneas del log de inicio:${NC}"
    docker logs iph-frontend 2>&1 | head -30

else
    echo -e "${RED}✗ Contenedor iph-frontend NO está corriendo${NC}"
    echo -e "${YELLOW}Inicia el contenedor con: docker-compose up -d${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Verificación completada${NC}"
echo ""
echo -e "${YELLOW}DIAGNÓSTICO:${NC}"
echo -e "Si ves diferencias entre:"
echo -e "  • Variables en .env"
echo -e "  • Variables en el contenedor"
echo -e "  • Valores en config.js"
echo ""
echo -e "Solución:"
echo -e "  1. Verifica que docker-compose.yaml tenga: ${GREEN}env_file: .env${NC}"
echo -e "  2. Ejecuta: ${GREEN}docker-compose down${NC}"
echo -e "  3. Ejecuta: ${GREEN}docker-compose up -d${NC}"
echo -e "  4. Vuelve a ejecutar este script para verificar"
echo ""
