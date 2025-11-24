# Etapa 1: Build
FROM node:current-alpine AS builder

# Se instalan dependencias necesarias para el build
RUN apk add --no-cache libc6-compat

# NOTA: Ya NO necesitamos pasar variables de entorno aquí
# Las variables se configurarán en RUNTIME con el entrypoint script

# Se establece el directorio de trabajo
WORKDIR /app

# Se copian archivos de configuración y scripts necesarios para postinstall
COPY package*.json ./
COPY scripts ./scripts

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

# Se copia el entrypoint script (antes de cambiar a usuario no-root)
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Se expone el puerto 4173
EXPOSE 4173

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Entrypoint que genera config.js en runtime y luego inicia serve
ENTRYPOINT ["/app/docker-entrypoint.sh"]