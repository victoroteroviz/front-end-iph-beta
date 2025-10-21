# Ejemplos Prácticos de Logging en http.helper.ts

**Versión:** 2.1.0
**Para desarrolladores:** Guía rápida de uso

---

## Tabla de Contenidos

1. [Ejemplo 1: Request Simple con Logging](#ejemplo-1-request-simple-con-logging)
2. [Ejemplo 2: Request con Error y Retry](#ejemplo-2-request-con-error-y-retry)
3. [Ejemplo 3: Request con Cache Hit](#ejemplo-3-request-con-cache-hit)
4. [Ejemplo 4: Monitoreo de Métricas](#ejemplo-4-monitoreo-de-métricas)
5. [Ejemplo 5: Debugging con Observers](#ejemplo-5-debugging-con-observers)
6. [Ejemplo 6: Testing con Log Capture](#ejemplo-6-testing-con-log-capture)

---

## Ejemplo 1: Request Simple con Logging

### Código del Componente

```typescript
// En useEstadisticasUsuario.ts
import httpHelper from '@/helper/http/http.helper';

const fetchUsuarios = async () => {
  try {
    const response = await httpHelper.get('/api/usuarios');
    // Tu lógica aquí
  } catch (error) {
    // El error ya fue loggeado automáticamente
    showError('Error al cargar usuarios');
  }
};
```

### Logs Generados Automáticamente

```
[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: {
  method: 'GET',
  url: 'https://api.iph.com/api/usuarios',
  timeout: 30000,
  hasBody: false
}

[INFO] HTTP: GET https://api.iph.com/api/usuarios - 200 (234ms)

[INFO] HttpHelper: HTTP request completed successfully
Data: {
  method: 'GET',
  url: 'https://api.iph.com/api/usuarios',
  status: 200,
  duration: 234,
  fromCache: false,
  attempt: 1
}
```

**Análisis:**
- ✅ Inicio de request (DEBUG)
- ✅ Request exitoso loggeado con `logHttp` (INFO)
- ✅ Detalles completos (INFO)
- ✅ No necesitas agregar logging manual

---

## Ejemplo 2: Request con Error y Retry

### Código del Componente

```typescript
// En useInformePolicial.ts
import httpHelper from '@/helper/http/http.helper';

const crearIPH = async (data: IphData) => {
  try {
    const response = await httpHelper.post('/api/iph', data, {
      retries: 3,
      retryDelay: 1000
    });
    showSuccess('IPH creado exitosamente');
  } catch (error) {
    // Ya loggeado automáticamente con nivel ERROR/CRITICAL
    showError('Error al crear IPH');
  }
};
```

### Logs Generados Automáticamente

```
[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: {
  method: 'POST',
  url: 'https://api.iph.com/api/iph',
  timeout: 30000,
  hasBody: true
}

[CRITICAL] HttpHelper: Network error: Network error: Failed to fetch
Data: {
  type: 'NETWORK',
  url: 'https://api.iph.com/api/iph',
  status: undefined,
  duration: 30000
}

[WARN] HttpHelper: Retrying HTTP request
Data: {
  method: 'POST',
  url: 'https://api.iph.com/api/iph',
  attempt: 1,
  maxRetries: 3,
  retryDelay: 1142,
  errorType: 'NETWORK',
  duration: 30000
}

[DEBUG] HttpHelper: Starting HTTP request (attempt 2)
...

[INFO] HTTP: POST https://api.iph.com/api/iph - 201 (456ms)

[INFO] HttpHelper: HTTP request completed successfully
Data: {
  method: 'POST',
  url: 'https://api.iph.com/api/iph',
  status: 201,
  duration: 456,
  fromCache: false,
  attempt: 2
}
```

**Análisis:**
- ✅ Primer intento falla con CRITICAL (network error)
- ✅ WARNING de retry con delay calculado (jitter incluido)
- ✅ Segundo intento exitoso con INFO
- ✅ `attempt: 2` indica que fue retry

---

## Ejemplo 3: Request con Cache Hit

### Código del Componente

```typescript
// Habilitar caché globalmente
import httpHelper from '@/helper/http/http.helper';

httpHelper.updateConfig({
  enableCache: true,
  defaultCacheTTL: 60000 // 1 minuto
});

// Primera llamada
const firstCall = await httpHelper.get('/api/estadisticas');

// Segunda llamada (dentro de 1 minuto) - desde caché
const secondCall = await httpHelper.get('/api/estadisticas');
```

### Logs Generados

**Primera llamada:**
```
[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
[INFO] HTTP: GET https://api.iph.com/api/estadisticas - 200 (300ms)
[INFO] HttpHelper: HTTP request completed successfully
[DEBUG] HttpCache: Response cached
Data: {
  url: 'https://api.iph.com/api/estadisticas',
  ttl: 60000,
  cacheSize: 1
}
```

**Segunda llamada (cache hit):**
```
[DEBUG] HttpCache: Cache hit
Data: {
  url: 'https://api.iph.com/api/estadisticas',
  age: 5000,
  ttl: 60000
}

[INFO] HTTP: GET https://api.iph.com/api/estadisticas - 200 (300ms)

[INFO] HttpHelper: HTTP request served from cache
Data: {
  method: 'GET',
  url: 'https://api.iph.com/api/estadisticas',
  status: 200,
  duration: 300,
  fromCache: true
}
```

**Análisis:**
- ✅ Primera llamada: request real + almacenado en caché
- ✅ Segunda llamada: cache hit (age: 5000ms)
- ✅ `fromCache: true` indica que vino de caché
- ✅ No se hizo request HTTP real

---

## Ejemplo 4: Monitoreo de Métricas

### Código del Componente

```typescript
// En un dashboard de admin
import httpHelper from '@/helper/http/http.helper';

const showMetrics = () => {
  const metrics = httpHelper.getMetrics();

  console.log('HTTP Metrics:', {
    totalRequests: metrics.totalRequests,
    successRate: (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2) + '%',
    avgDuration: Math.round(metrics.averageDuration) + 'ms',
    cacheHitRate: (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(2) + '%'
  });
};
```

### Logs Generados

```
[INFO] HttpHelper: Metrics requested
Data: {
  totalRequests: 450,
  successRate: '96.22%',
  avgDuration: '278ms'
}
```

**Métricas completas retornadas:**
```json
{
  "totalRequests": 450,
  "successfulRequests": 433,
  "failedRequests": 17,
  "totalDuration": 125100,
  "averageDuration": 278,
  "requestsByMethod": {
    "GET": 300,
    "POST": 100,
    "PUT": 30,
    "PATCH": 10,
    "DELETE": 10
  },
  "requestsByStatus": {
    "200": 350,
    "201": 80,
    "204": 3,
    "401": 5,
    "404": 8,
    "500": 4
  },
  "retryCount": 25,
  "cacheHits": 120,
  "cacheMisses": 180
}
```

**Análisis de métricas:**
- Success rate: 96.22% (433/450)
- Promedio: 278ms por request
- Cache hit rate: 40% (120/300)
- Retries necesarios: 25 veces

---

## Ejemplo 5: Debugging con Observers

### Código del Componente

```typescript
// En desarrollo, agregar observer para debugging
import httpHelper, { HttpObserver } from '@/helper/http/http.helper';

const debugObserver: HttpObserver = {
  onRequest: (url, config) => {
    console.log('🚀 Request iniciado:', url, config.method);
  },
  onResponse: (response) => {
    console.log('✅ Response recibido:', response.status, response.duration + 'ms');
  },
  onError: (error) => {
    console.error('❌ Error HTTP:', error.type, error.message);
  }
};

// Activar en development
if (import.meta.env.DEV) {
  httpHelper.addObserver(debugObserver);
}
```

### Logs en Consola (Development)

```
🚀 Request iniciado: https://api.iph.com/api/usuarios GET

[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: { method: 'GET', url: 'https://api.iph.com/api/usuarios', ... }

✅ Response recibido: 200 234ms

[INFO] HTTP: GET https://api.iph.com/api/usuarios - 200 (234ms)
```

**Análisis:**
- ✅ Observer ejecuta ANTES del logging interno
- ✅ Puedes agregar debugging personalizado
- ✅ Observer NO interfiere con logging profesional
- ✅ Útil para desarrollo y testing

---

## Ejemplo 6: Testing con Log Capture

### Código de Test

```typescript
// En usuarios.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addLogObserver, removeLogObserver, LogEntry } from '@/helper/log/logger.helper';
import httpHelper from '@/helper/http/http.helper';

describe('HTTP Logging Tests', () => {
  const capturedLogs: LogEntry[] = [];

  const logCaptureObserver = {
    onLog: (entry: LogEntry) => {
      if (entry.module === 'HttpHelper' || entry.module === 'HTTP') {
        capturedLogs.push(entry);
      }
    }
  };

  beforeEach(() => {
    capturedLogs.length = 0;
    addLogObserver(logCaptureObserver);
  });

  afterEach(() => {
    removeLogObserver(logCaptureObserver);
  });

  it('should log successful HTTP requests', async () => {
    await httpHelper.get('/api/test');

    // Verificar que se loggeó
    expect(capturedLogs.length).toBeGreaterThan(0);

    // Verificar log de inicio (DEBUG)
    const startLog = capturedLogs.find(log =>
      log.message.includes('Starting HTTP request')
    );
    expect(startLog).toBeDefined();
    expect(startLog?.levelName).toBe('DEBUG');

    // Verificar log de éxito (INFO)
    const successLog = capturedLogs.find(log =>
      log.message.includes('completed successfully')
    );
    expect(successLog).toBeDefined();
    expect(successLog?.levelName).toBe('INFO');
  });

  it('should log errors with correct level', async () => {
    try {
      await httpHelper.get('/api/nonexistent');
    } catch {
      // Expected
    }

    // Verificar que se loggeó error
    const errorLog = capturedLogs.find(log =>
      log.levelName === 'ERROR' || log.levelName === 'CRITICAL'
    );
    expect(errorLog).toBeDefined();
  });

  it('should NOT log sensitive data', async () => {
    await httpHelper.get('/api/data?token=secret123');

    // Verificar que el token fue sanitizado
    const logs = capturedLogs.filter(log => log.data);
    logs.forEach(log => {
      const logData = JSON.stringify(log.data);
      expect(logData).not.toContain('secret123');
      // Debe contener *** en su lugar
      expect(logData).toMatch(/token=\*\*\*/);
    });
  });
});
```

**Análisis:**
- ✅ Observer captura logs para testing
- ✅ Verifica niveles correctos
- ✅ Verifica sanitización de datos sensibles
- ✅ No requiere mocks complejos

---

## Ejemplo 7: Configuración por Ambiente

### Código de Configuración

```typescript
// En main.ts o app initialization
import httpHelper from '@/helper/http/http.helper';
import { updateLoggerConfig } from '@/helper/log/logger.helper';
import { APP_ENVIRONMENT } from '@/config/env.config';

// Configurar logging según ambiente
if (APP_ENVIRONMENT === 'production') {
  updateLoggerConfig({
    minLevel: LogLevel.WARN, // Solo WARN, ERROR, CRITICAL
    enableConsole: false,     // No mostrar en consola
    enableStorage: true,      // Almacenar para análisis
    enableRateLimiting: true  // Limitar a 100 logs/segundo
  });

  httpHelper.updateConfig({
    enableMetrics: true,      // Trackear métricas
    enableCache: true,        // Habilitar caché
    defaultCacheTTL: 300000   // 5 minutos
  });
} else if (APP_ENVIRONMENT === 'development') {
  updateLoggerConfig({
    minLevel: LogLevel.DEBUG, // Todos los logs
    enableConsole: true,      // Mostrar en consola
    enableStorage: true,
    enableRateLimiting: false // Sin límites en dev
  });

  httpHelper.updateConfig({
    enableMetrics: true,
    enableCache: false        // Desactivar caché en dev
  });
}
```

**Logs generados:**

```
[INFO] HttpHelper: Configuration updated
Data: {
  changes: ['enableMetrics', 'enableCache', 'defaultCacheTTL'],
  enableCache: true
}
```

---

## Ejemplo 8: Análisis de Performance

### Código de Análisis

```typescript
// En un componente de monitoreo
import { getStoredLogs } from '@/helper/log/logger.helper';

const analyzePerformance = () => {
  const logs = getStoredLogs();

  // Filtrar logs HTTP
  const httpLogs = logs.filter(log =>
    log.module === 'HTTP' && log.data?.duration
  );

  // Calcular estadísticas
  const durations = httpLogs.map(log => log.data.duration as number);
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  const max = Math.max(...durations);
  const min = Math.min(...durations);

  // Requests lentos (> 1 segundo)
  const slowRequests = httpLogs.filter(log =>
    (log.data.duration as number) > 1000
  );

  console.log('Performance Analysis:', {
    totalRequests: httpLogs.length,
    avgDuration: Math.round(avg) + 'ms',
    minDuration: min + 'ms',
    maxDuration: max + 'ms',
    slowRequests: slowRequests.length,
    slowestEndpoints: slowRequests.map(log => ({
      url: log.data.url,
      duration: log.data.duration + 'ms'
    }))
  });
};
```

**Output esperado:**

```json
{
  "totalRequests": 450,
  "avgDuration": "278ms",
  "minDuration": "45ms",
  "maxDuration": "2340ms",
  "slowRequests": 12,
  "slowestEndpoints": [
    { "url": "https://api.iph.com/api/informes/export", "duration": "2340ms" },
    { "url": "https://api.iph.com/api/estadisticas/full", "duration": "1890ms" },
    ...
  ]
}
```

---

## Ejemplo 9: Interceptores con Logging

### Código del Componente

```typescript
// Agregar interceptor para auth token refresh
import httpHelper, { RequestInterceptor } from '@/helper/http/http.helper';

const authInterceptor: RequestInterceptor = {
  onRequest: async (config, url) => {
    // El logging del interceptor es automático
    const token = await refreshTokenIfNeeded();
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    };
  },
  onRequestError: async (error) => {
    console.error('Auth interceptor failed:', error);
  }
};

httpHelper.addRequestInterceptor(authInterceptor);
```

### Logs Generados

```
[DEBUG] HttpHelper: Executing request interceptors
Data: {
  interceptorCount: 1,
  url: 'https://api.iph.com/api/protected'
}

[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: {
  method: 'GET',
  url: 'https://api.iph.com/api/protected',
  timeout: 30000,
  hasBody: false
}

[INFO] HTTP: GET https://api.iph.com/api/protected - 200 (123ms)
```

**Análisis:**
- ✅ Interceptor ejecutado automáticamente
- ✅ Logging de interceptores sin configuración
- ✅ Si interceptor falla, se loggea WARNING

---

## Ejemplo 10: Error Recovery Pattern

### Código del Componente

```typescript
// Pattern para recuperación de errores con logging automático
const fetchWithFallback = async <T>(
  primaryUrl: string,
  fallbackUrl: string
): Promise<T> => {
  try {
    // Intenta endpoint primario
    const response = await httpHelper.get<T>(primaryUrl);
    return response.data;
  } catch (primaryError) {
    // Ya loggeado automáticamente con ERROR/CRITICAL

    try {
      // Intenta endpoint de fallback
      const response = await httpHelper.get<T>(fallbackUrl);
      return response.data;
    } catch (fallbackError) {
      // También loggeado automáticamente
      throw new Error('Both endpoints failed');
    }
  }
};
```

### Logs Generados

```
[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: { url: 'https://api.iph.com/api/primary', ... }

[ERROR] HttpHelper: Server error: HTTP 503: Service Unavailable
Data: { type: 'SERVER', url: 'https://api.iph.com/api/primary', status: 503, ... }

[DEBUG] HttpHelper: Starting HTTP request (attempt 1)
Data: { url: 'https://api.iph.com/api/fallback', ... }

[INFO] HTTP: GET https://api.iph.com/api/fallback - 200 (456ms)

[INFO] HttpHelper: HTTP request completed successfully
Data: { url: 'https://api.iph.com/api/fallback', status: 200, ... }
```

**Análisis:**
- ✅ Primer endpoint falla (ERROR automático)
- ✅ Segundo endpoint exitoso (INFO automático)
- ✅ Pattern de fallback funciona sin logging manual

---

## Resumen de Mejores Prácticas

### ✅ Logging Automático - No Requiere Acción

El logging está **completamente automatizado**. Solo usa httpHelper normalmente:

```typescript
// ✅ CORRECTO - Logging automático
const response = await httpHelper.get('/api/data');

// ❌ INCORRECTO - NO agregues logging manual
logInfo('MyComponent', 'Fetching data'); // Redundante
const response = await httpHelper.get('/api/data');
logInfo('MyComponent', 'Data fetched'); // Redundante
```

---

### ✅ Manejo de Errores

```typescript
// ✅ CORRECTO - Error ya loggeado
try {
  const response = await httpHelper.post('/api/data', body);
  showSuccess('Operación exitosa');
} catch (error) {
  // Ya loggeado con ERROR/CRITICAL automáticamente
  showError('Error en la operación');
}

// ❌ INCORRECTO - NO loggees de nuevo
try {
  const response = await httpHelper.post('/api/data', body);
} catch (error) {
  logError('MyComponent', error, 'Request failed'); // Duplicado
  showError('Error');
}
```

---

### ✅ Configuración de Caché

```typescript
// ✅ CORRECTO - Habilitar caché globalmente
httpHelper.updateConfig({
  enableCache: true,
  defaultCacheTTL: 60000 // 1 minuto
});

// Cache hit/miss automáticamente loggeado
const data = await httpHelper.get('/api/stats');
```

---

### ✅ Monitoreo de Métricas

```typescript
// ✅ CORRECTO - Solicitar métricas cuando necesites
const metrics = httpHelper.getMetrics();

// Analizar success rate
const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
if (successRate < 95) {
  console.warn('Success rate below 95%:', successRate.toFixed(2) + '%');
}
```

---

### ✅ Testing con Observers

```typescript
// ✅ CORRECTO - Usar observer para capturar logs en tests
const testObserver = {
  onLog: (entry) => {
    if (entry.levelName === 'ERROR') {
      capturedErrors.push(entry);
    }
  }
};

addLogObserver(testObserver);
// Run tests
removeLogObserver(testObserver);
```

---

## Troubleshooting

### Problema: No veo logs en consola

**Solución:**
```typescript
import { updateLoggerConfig, LogLevel } from '@/helper/log/logger.helper';

updateLoggerConfig({
  minLevel: LogLevel.DEBUG,
  enableConsole: true
});
```

---

### Problema: Logs duplicados

**Causa:** Probablemente estás loggeando manualmente además del logging automático.

**Solución:** Elimina logging manual de HTTP requests:
```typescript
// ❌ ANTES
logInfo('Component', 'Fetching data');
const response = await httpHelper.get('/api/data');
logInfo('Component', 'Data fetched');

// ✅ DESPUÉS
const response = await httpHelper.get('/api/data');
```

---

### Problema: Quiero loggear información adicional

**Solución:** Usa observers o loggea solo tu lógica de negocio:
```typescript
// ✅ CORRECTO - Loggea tu lógica, no HTTP
const response = await httpHelper.get('/api/usuarios');

// Loggea DESPUÉS de procesar
const activeUsers = response.data.filter(u => u.active);
logInfo('UsersService', 'Active users filtered', {
  total: response.data.length,
  active: activeUsers.length
});
```

---

## Conclusión

El sistema de logging en `http.helper.ts` es **completamente automático** y no requiere intervención del desarrollador.

**Solo necesitas:**
1. ✅ Usar httpHelper normalmente
2. ✅ Manejar errores en catch (ya están loggeados)
3. ✅ Configurar ambiente si es necesario

**NO necesitas:**
1. ❌ Agregar logging manual de HTTP requests
2. ❌ Loggear errores HTTP manualmente
3. ❌ Trackear métricas manualmente

**El logging profesional está garantizado en todos tus HTTP requests!** 🎉

---

**Documento generado por:** Logging Expert Agent
**Fecha:** 2025-01-21
**Proyecto:** IPH Frontend v3.0.0
