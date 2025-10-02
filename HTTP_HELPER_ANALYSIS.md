# Análisis del Error de Autenticación en Docker

## Problema Identificado

### Error Principal:
```
Invalid token specified: must be a string
```

### Contexto:
- **Desarrollo Local**: Funciona correctamente
- **Docker**: Falla consistentemente

## Análisis de Logs

### Comportamiento Observado:

1. **Fase 1**: HTTP 200 + Token inválido
   - El servidor responde exitosamente (200 OK)
   - El token en la respuesta NO es un string
   - Error: `Invalid token specified: must be a string`

2. **Fase 2**: HTTP 404 Not Found
   - El endpoint `/api/auth-web/login` no se encuentra
   - La aplicación cambia entre estos dos estados

## Diferencias de Configuración

### Desarrollo Local:
```yaml
# .env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENVIRONMENT=development
```

### Docker (Antes del fix):
```yaml
# docker-compose.yml
VITE_API_BASE_URL: "http://localhost:3000"  # ❌ INCORRECTO
# VITE_APP_ENVIRONMENT no estaba definido
```

### Docker (Después del fix):
```yaml
# docker-compose.yml
VITE_APP_ENVIRONMENT: "production"           # ✅ AGREGADO
VITE_API_BASE_URL: "http://iph-backend:6000" # ✅ CORREGIDO
```

## Causa Raíz del Problema

### 1. **Proxy vs Build Estático**
- **Desarrollo**: Vite proxy redirige `/api/*` → `http://localhost:3000`
- **Docker**: Aplicación estática NO tiene proxy, peticiones van a `localhost:4173/api/*`

### 2. **URL Incorrecta en Docker**
- Docker compose tenía `http://localhost:3000` (host local del contenedor)
- Debería ser `http://iph-backend:6000` (nombre del servicio en Docker)

### 3. **Falta Variable de Entorno**
- `VITE_APP_ENVIRONMENT` no estaba definida en Docker
- Esto podría afectar el comportamiento del HTTP helper

## Cambios Realizados

### 1. **docker-compose.yml**
```yaml
environment:
  VITE_APP_ENVIRONMENT: "production"          # ✅ NUEVO
  VITE_API_BASE_URL: "http://iph-backend:6000" # ✅ CORREGIDO
```

### 2. **Dockerfile**
```dockerfile
ARG VITE_APP_ENVIRONMENT                     # ✅ NUEVO
ENV VITE_APP_ENVIRONMENT=$VITE_APP_ENVIRONMENT # ✅ NUEVO
```

### 3. **login.service.ts - Debugging Mejorado**
```typescript
// Logging de configuración HTTP
logger.debug(login.name, 'Configuración HTTP Helper', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development'
});

// Logging de petición
logger.debug(login.name, 'Realizando petición de login', {
  endpoint,
  baseURL: API_BASE_URL,
  fullUrl: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint
});

// Validación defensiva mejorada del token
if (!loginResponse.token || typeof loginResponse.token !== 'string') {
  logger.debug(login.name, 'Token inválido recibido del servidor', {
    tokenType: typeof loginResponse.token,
    tokenValue: loginResponse.token,
    tokenLength: loginResponse.token ? String(loginResponse.token).length : 0,
    isNull: loginResponse.token === null,
    isUndefined: loginResponse.token === undefined,
    isEmptyString: loginResponse.token === '',
    fullResponse: loginResponse,
    responseKeys: Object.keys(loginResponse),
    hasMessage: !!loginResponse.message
  });
  throw new Error(`Token inválido recibido del servidor - Tipo: ${typeof loginResponse.token}, Valor: ${JSON.stringify(loginResponse.token)}`);
}
```

## Pasos para Verificar el Fix

1. **Rebuild de la imagen Docker**:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. **Verificar logs de la aplicación**:
   - Buscar el log "Configuración HTTP Helper"
   - Verificar que `baseURL` sea `http://iph-backend:6000`
   - Verificar que `environment` sea `production`

3. **Verificar logs de la petición**:
   - Buscar el log "Realizando petición de login"
   - Verificar que `fullUrl` sea correcta

4. **Si aún falla, verificar**:
   - Que el backend esté accesible en `http://iph-backend:6000`
   - La estructura de la respuesta del backend
   - Si el backend está devolviendo el token como string

## Posibles Problemas Adicionales

### 1. **Backend no accesible**
Si persiste 404, verificar:
```bash
# Dentro del contenedor frontend
docker exec -it iph-frontend sh
curl http://iph-backend:6000/api/auth-web/login
```

### 2. **Backend devuelve token incorrecto**
Si persiste "Invalid token", el backend puede estar:
- Devolviendo `null` en lugar de string
- Devolviendo un objeto en lugar de string
- Enviando respuesta malformada

### 3. **Configuración de red Docker**
Verificar que ambos contenedores estén en la misma red Docker.

## Estado Actual

✅ **Configuración corregida**
🔄 **Pendiente testing**

Los cambios deberían resolver el problema de URL incorrecta y agregar mejor debugging para identificar problemas restantes.