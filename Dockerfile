# Etapa 1: Build
FROM node:current-alpine AS builder

# Se instalan dependencias necesarias para el build
RUN apk add --no-cache libc6-compat

# Se definen argumentos de build para las variables de entorno de Vite
ARG VITE_API_BASE_URL
ARG VITE_SUPERADMIN_ROLE
ARG VITE_ADMIN_ROLE
ARG VITE_SUPERIOR_ROLE
ARG VITE_ELEMENTO_ROLE
ARG VITE_LOG_LEVEL
ARG VITE_LOG_CONSOLE
ARG VITE_LOG_STORAGE
ARG VITE_LOG_MAX_ENTRIES
ARG VITE_HTTP_TIMEOUT
ARG VITE_HTTP_RETRIES
ARG VITE_HTTP_RETRY_DELAY
ARG VITE_AUTH_HEADER_NAME
ARG VITE_AUTH_HEADER_PREFIX
ARG VITE_AUTH_TOKEN_KEY
ARG VITE_DEBUG_MODE
ARG VITE_APP_VERSION
ARG VITE_APP_NAME

# Se convierten los argumentos a variables de entorno para Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPERADMIN_ROLE=$VITE_SUPERADMIN_ROLE
ENV VITE_ADMIN_ROLE=$VITE_ADMIN_ROLE
ENV VITE_SUPERIOR_ROLE=$VITE_SUPERIOR_ROLE
ENV VITE_ELEMENTO_ROLE=$VITE_ELEMENTO_ROLE
ENV VITE_LOG_LEVEL=$VITE_LOG_LEVEL
ENV VITE_LOG_CONSOLE=$VITE_LOG_CONSOLE
ENV VITE_LOG_STORAGE=$VITE_LOG_STORAGE
ENV VITE_LOG_MAX_ENTRIES=$VITE_LOG_MAX_ENTRIES
ENV VITE_HTTP_TIMEOUT=$VITE_HTTP_TIMEOUT
ENV VITE_HTTP_RETRIES=$VITE_HTTP_RETRIES
ENV VITE_HTTP_RETRY_DELAY=$VITE_HTTP_RETRY_DELAY
ENV VITE_AUTH_HEADER_NAME=$VITE_AUTH_HEADER_NAME
ENV VITE_AUTH_HEADER_PREFIX=$VITE_AUTH_HEADER_PREFIX
ENV VITE_AUTH_TOKEN_KEY=$VITE_AUTH_TOKEN_KEY
ENV VITE_DEBUG_MODE=$VITE_DEBUG_MODE
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_NAME=$VITE_APP_NAME

# Se establece el directorio de trabajo
WORKDIR /app

# Se copian archivos de configuración
COPY package*.json ./

# Se instalan todas las dependencias (incluidas las de desarrollo)
RUN npm ci

# Se copian todos los archivos del proyecto
COPY . .

# Se construye la aplicación con las variables de entorno
RUN npm run build

# Etapa 2: Producción
FROM node:current-alpine AS runner

# Se instala serve para servir archivos estáticos (antes de cambiar usuario)
RUN npm install -g serve

# Se crea usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Se establece el directorio de trabajo
WORKDIR /app

# Se cambian permisos del directorio
RUN chown nextjs:nodejs /app

# Se cambia al usuario no-root
USER nextjs

# Se copian solo los archivos construidos
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

# Se expone el puerto 4173
EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "4173", "--no-port-switching", "--no-clipboard"]