# Se usa imagen oficial de Node.js basada en Alpine Linux
FROM node:18-alpine

# Se crea un usuario no-root para mayor seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Se establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Se copian los archivos de configuración del proyecto al contenedor
COPY package*.json ./

# Se instalan las dependencias del proyecto (incluyendo dev dependencies para el build)
RUN npm ci && npm cache clean --force

# Se copian todos los archivos del proyecto al contenedor
COPY --chown=nextjs:nodejs . .

# Se construye la aplicación para producción
RUN npm run build

# Se cambia al usuario no-root
USER nextjs

# Se expone el puerto 4173 para Vite preview
EXPOSE 4173

# Se verifica que Node.js funcione
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Se define el comando para iniciar la aplicación
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]