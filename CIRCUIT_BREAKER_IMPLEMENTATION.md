# 🔄 Circuit Breaker Pattern - Documentación Técnica

**Versión:** 2.2.0
**Fecha:** 2025-01-31
**Estado:** ✅ PRODUCCIÓN
**Nivel:** 🎖️ **Enterprise/Military Grade**

---

## 📋 Tabla de Contenidos

1. [¿Qué es Circuit Breaker?](#qué-es-circuit-breaker)
2. [¿Por qué lo necesitamos?](#por-qué-lo-necesitamos)
3. [Arquitectura](#arquitectura)
4. [Estados del Circuit Breaker](#estados-del-circuit-breaker)
5. [Configuración](#configuración)
6. [Uso Básico](#uso-básico)
7. [API Pública](#api-pública)
8. [Casos de Uso](#casos-de-uso)
9. [Métricas y Observabilidad](#métricas-y-observabilidad)
10. [Troubleshooting](#troubleshooting)

---

## 🤔 ¿Qué es Circuit Breaker?

Circuit Breaker es un patrón de diseño de resiliencia que **previene cascading failures** en sistemas distribuidos. Funciona como un interruptor eléctrico:

- ✅ **CLOSED**: Funcionamiento normal, requests pasan
- 🔴 **OPEN**: Servicio detectado como caído, rechaza requests inmediatamente
- 🟡 **HALF_OPEN**: Probando si el servicio se recuperó

---

## 🚨 ¿Por qué lo necesitamos?

### Problema Sin Circuit Breaker

```typescript
// ❌ Backend caído → cada request espera 30s timeout
for (let i = 0; i < 100; i++) {
  try {
    await httpHelper.get('/api/failing-service'); // 30s timeout
  } catch (error) {
    console.log('Failed'); // Después de 30 segundos
  }
}
// Total: 100 * 30s = 50 MINUTOS de espera
// Resultado: App congelada, timeouts acumulativos, UX horrible
```

### Solución Con Circuit Breaker

```typescript
// ✅ Después de 3 fallos → OPEN (rechaza inmediatamente)
for (let i = 0; i < 100; i++) {
  try {
    await httpHelper.get('/api/failing-service');
  } catch (error) {
    console.log('Failed instantly'); // Rechazado en <1ms
  }
}
// Total: 3 * 30s + 97 * 0.001s = ~90 segundos
// Resultado: App responsiva, fail-fast, mejor UX
```

**Beneficios:**
- ⚡ **Fail-fast**: Rechaza requests inmediatamente cuando detecta fallo
- 🛡️ **Previene cascading failures**: No sobrecarga servicios caídos
- 🔄 **Auto-recovery**: Detecta automáticamente cuando el servicio se recupera
- 📊 **Observabilidad**: Métricas en tiempo real del estado de servicios
- 💰 **Ahorra recursos**: No desperdicia CPU/memoria/red en requests condenados

---

## 🏗️ Arquitectura

### Diagrama de Estados

```
┌─────────────────────────────────────────────────┐
│                   CLOSED                        │
│           (Funcionamiento Normal)               │
│                                                 │
│  • Permite todos los requests                   │
│  • Monitorea tasa de fallos                     │
│  • Cuenta: failures / totalRequests             │
└──────────────┬──────────────────────────────────┘
               │
               │ Fallo ≥ 50% en 3+ requests
               │
               ↓
┌─────────────────────────────────────────────────┐
│                    OPEN                         │
│              (Circuito Abierto)                 │
│                                                 │
│  • Rechaza TODOS los requests (fail-fast)       │
│  • Duración: 30 segundos (configurable)         │
│  • Error: "Circuit breaker is OPEN"             │
└──────────────┬──────────────────────────────────┘
               │
               │ Después de 30s
               │
               ↓
┌─────────────────────────────────────────────────┐
│                 HALF_OPEN                       │
│             (Probando Recovery)                 │
│                                                 │
│  • Permite MAX 3 requests de prueba             │
│  • Si 2 éxitos consecutivos → CLOSED            │
│  • Si 1 fallo → OPEN (retry en 30s)             │
└──────────────┬──────────────────────────────────┘
               │
               │ 2 éxitos consecutivos
               │
               ↓
         (Vuelve a CLOSED)
```

### Implementación Técnica

**Archivo:** `/src/helper/http/http.helper.ts`

**Clases:**
1. `CircuitBreaker` (lines 611-866)
   - State machine completa
   - Métricas por instancia
   - Logging automático

2. `HttpHelper` (lines 872+)
   - `Map<string, CircuitBreaker>` para tracking por endpoint
   - Integración transparente en `executeWithRetries()`
   - API pública para gestión

**Key Generator:**
```typescript
// Format: "METHOD:origin/path"
getCircuitBreakerKey(url: string, method: HttpMethod): string
// Ejemplo: "GET:http://api.example.com/users"
```

---

## ⚙️ Configuración

### Configuración por Defecto

```typescript
{
  enabled: true,
  failureThreshold: 0.5,        // 50% de requests deben fallar
  successThreshold: 2,           // 2 éxitos consecutivos para cerrar
  openDuration: 30000,           // 30 segundos en estado OPEN
  halfOpenMaxRequests: 3,        // 3 requests de prueba en HALF_OPEN
  volumeThreshold: 3             // Mínimo 3 requests para evaluar
}
```

### Cambiar Configuración Global

```typescript
import httpHelper from '@/helper/http/http_helper';

// Más agresivo (desarrollo)
httpHelper.updateConfig({
  circuitBreaker: {
    failureThreshold: 0.3,      // 30% de fallos → OPEN
    successThreshold: 1,         // 1 éxito → CLOSED
    openDuration: 10000,         // 10 segundos
    volumeThreshold: 2           // Min 2 requests
  }
});

// Más conservador (producción)
httpHelper.updateConfig({
  circuitBreaker: {
    failureThreshold: 0.7,      // 70% de fallos → OPEN
    successThreshold: 3,         // 3 éxitos → CLOSED
    openDuration: 60000,         // 1 minuto
    volumeThreshold: 10          // Min 10 requests
  }
});

// Deshabilitar (no recomendado)
httpHelper.updateConfig({
  circuitBreaker: {
    enabled: false
  }
});
```

### Parámetros Explicados

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `enabled` | boolean | `true` | Habilita/deshabilita circuit breaker |
| `failureThreshold` | number | `0.5` | % de fallos para abrir circuito (0.0-1.0) |
| `successThreshold` | number | `2` | Éxitos consecutivos para cerrar circuito |
| `openDuration` | number | `30000` | Milisegundos en estado OPEN antes de HALF_OPEN |
| `halfOpenMaxRequests` | number | `3` | Max requests simultáneos en HALF_OPEN |
| `volumeThreshold` | number | `3` | Min requests antes de evaluar tasa de fallos |

---

## 🚀 Uso Básico

### 1. Uso Transparente (Zero Config)

```typescript
import httpHelper from '@/helper/http/http_helper';

// ✅ Circuit breaker se aplica automáticamente
try {
  const response = await httpHelper.get('/api/users');
  console.log('Success:', response.data);
} catch (error) {
  if (error.details?.circuitBreakerState === 'OPEN') {
    console.log('🔴 Servicio temporalmente no disponible');
    // Mostrar mensaje amigable al usuario
  } else {
    console.log('❌ Error:', error.message);
  }
}
```

### 2. Detección de Estado del Circuit Breaker

```typescript
try {
  await httpHelper.post('/api/data', payload);
} catch (error) {
  // Verificar si el error es por circuit breaker
  if (error.type === 'NETWORK' && error.details?.circuitBreakerState) {
    switch (error.details.circuitBreakerState) {
      case 'OPEN':
        console.log('🔴 Servicio caído, reintentando en:', error.details.waitTime, 'segundos');
        break;
      case 'HALF_OPEN':
        console.log('🟡 Servicio en recuperación, intenta más tarde');
        break;
    }
  }
}
```

---

## 📡 API Pública

### 1. `getCircuitBreakerMetrics(endpoint?, method?)`

Obtiene métricas de circuit breaker(s).

**Uso:**

```typescript
// Métricas de un endpoint específico
const metrics = httpHelper.getCircuitBreakerMetrics('/api/users', 'GET');
console.log(metrics);
// {
//   state: 'CLOSED',
//   failures: 0,
//   successes: 10,
//   totalRequests: 10,
//   lastSuccessTime: 1706745600000,
//   stateChangedAt: 1706745500000
// }

// Métricas de TODOS los endpoints
const allMetrics = httpHelper.getCircuitBreakerMetrics();
for (const [key, metrics] of allMetrics.entries()) {
  console.log(`${key}: ${metrics.state}`);
}
// GET:http://api.com/users: CLOSED
// POST:http://api.com/orders: OPEN
// GET:http://api.com/products: HALF_OPEN
```

**Retorno:** `CircuitBreakerMetrics | Map<string, CircuitBreakerMetrics> | null`

```typescript
interface CircuitBreakerMetrics {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureTime?: number;      // Unix timestamp
  lastSuccessTime?: number;       // Unix timestamp
  stateChangedAt: number;         // Unix timestamp
  nextAttemptAt?: number;         // Unix timestamp (solo en OPEN)
}
```

---

### 2. `resetCircuitBreaker(endpoint, method)`

Resetea manualmente un circuit breaker específico.

**Uso:**

```typescript
// Resetear circuit breaker de un endpoint
const success = httpHelper.resetCircuitBreaker('/api/users', 'GET');
if (success) {
  console.log('✅ Circuit breaker reseteado');
} else {
  console.log('❌ Circuit breaker no encontrado');
}
```

**Cuándo usar:**
- Después de un deploy que soluciona el problema
- Mantenimiento programado finalizado
- Testing manual

---

### 3. `resetAllCircuitBreakers()`

Resetea TODOS los circuit breakers.

**Uso:**

```typescript
const count = httpHelper.resetAllCircuitBreakers();
console.log(`✅ ${count} circuit breakers reseteados`);
```

**Cuándo usar:**
- Después de un mantenimiento general
- Reset global del sistema
- ⚠️ Usar con precaución en producción

---

### 4. `getCircuitBreakerStatus()`

Vista rápida del estado de todos los circuit breakers agrupados.

**Uso:**

```typescript
const status = httpHelper.getCircuitBreakerStatus();
console.log(status);
// {
//   closed: ['GET:http://api.com/users', 'POST:http://api.com/orders'],
//   open: ['GET:http://api.com/slow-service'],
//   halfOpen: [],
//   total: 3
// }

// Alertar si hay servicios caídos
if (status.open.length > 0) {
  console.warn('⚠️ Servicios caídos:', status.open);
}
```

---

## 💼 Casos de Uso

### Caso 1: Backend Temporalmente Caído

**Escenario:** El backend tiene un deploy y está caído por 2 minutos.

**Sin Circuit Breaker:**
```typescript
// Usuario hace 20 clicks en "Cargar Datos"
// Cada request espera 30s timeout
// Total: 20 * 30s = 10 minutos de congelamiento
```

**Con Circuit Breaker:**
```typescript
// Request 1-3: Fallan después de 30s (90s total)
// Circuit breaker → OPEN
// Request 4-20: Fallan instantáneamente (<1ms)
// Total: ~90 segundos
// UX: Usuario ve mensaje "Servicio temporalmente no disponible"
```

---

### Caso 2: Servicio Lento (Rate Limited)

**Escenario:** API externa está rate-limited y responde con 429.

```typescript
// Circuit breaker detecta 50% de 429 errors → OPEN
// Deja de bombardear la API por 30s
// Después de 30s → HALF_OPEN (prueba con requests limitados)
// Si la API se recuperó → CLOSED
```

---

### Caso 3: Monitoreo en Dashboard

```typescript
// Component de monitoreo
useEffect(() => {
  const interval = setInterval(() => {
    const status = httpHelper.getCircuitBreakerStatus();

    // Update UI
    setOpenCircuits(status.open.length);
    setHalfOpenCircuits(status.halfOpen.length);

    // Alerta crítica
    if (status.open.length > 3) {
      notificationHelper.showError('Multiple servicios caídos');
    }
  }, 5000); // Cada 5 segundos

  return () => clearInterval(interval);
}, []);
```

---

### Caso 4: Reset Manual Post-Deploy

```typescript
// Después de un deploy exitoso
async function postDeployCleanup() {
  // Limpiar circuit breakers que puedan estar abiertos
  const count = httpHelper.resetAllCircuitBreakers();
  console.log(`Reset ${count} circuit breakers`);

  // Limpiar caché
  httpHelper.clearCache();

  // Verificar health
  const status = httpHelper.getCircuitBreakerStatus();
  console.log('All services:', status.closed.length);
}
```

---

## 📊 Métricas y Observabilidad

### Logs Automáticos

El circuit breaker loggea automáticamente todas las transiciones de estado:

```typescript
// Transición a OPEN (CRÍTICO)
logCritical('CircuitBreaker', '🔴 Circuit breaker OPEN for GET /api/users', {
  previousState: 'CLOSED',
  failures: 5,
  totalRequests: 10,
  failureRate: '50.00%',
  openDuration: 30000,
  nextAttemptAt: '2025-01-31T12:30:00.000Z'
});

// Transición a HALF_OPEN (WARNING)
logWarning('CircuitBreaker', '🟡 Circuit breaker HALF_OPEN for GET /api/users', {
  previousState: 'OPEN',
  testRequests: 3
});

// Transición a CLOSED (INFO)
logInfo('CircuitBreaker', '🟢 Circuit breaker CLOSED for GET /api/users', {
  previousState: 'HALF_OPEN',
  successes: 2,
  failures: 0,
  totalRequests: 2
});
```

### Dashboard de Monitoreo (Ejemplo)

```typescript
import httpHelper from '@/helper/http/http_helper';

function CircuitBreakerDashboard() {
  const [metrics, setMetrics] = useState<Map<string, CircuitBreakerMetrics>>();

  useEffect(() => {
    const interval = setInterval(() => {
      const allMetrics = httpHelper.getCircuitBreakerMetrics();
      setMetrics(allMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics || metrics.size === 0) {
    return <div>No circuit breakers activos</div>;
  }

  return (
    <div>
      <h2>Circuit Breaker Status</h2>
      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Estado</th>
            <th>Failures</th>
            <th>Successes</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(metrics.entries()).map(([key, metric]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <span className={`badge badge-${metric.state.toLowerCase()}`}>
                  {metric.state === 'CLOSED' && '🟢'}
                  {metric.state === 'OPEN' && '🔴'}
                  {metric.state === 'HALF_OPEN' && '🟡'}
                  {metric.state}
                </span>
              </td>
              <td>{metric.failures}</td>
              <td>{metric.successes}</td>
              <td>{metric.totalRequests}</td>
              <td>
                <button onClick={() => {
                  const [method, url] = key.split(':');
                  httpHelper.resetCircuitBreaker(url, method as HttpMethod);
                }}>
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔧 Troubleshooting

### Problema 1: Circuit Breaker Abre Demasiado Rápido

**Síntoma:** Circuit breaker se abre después de solo 1-2 fallos.

**Solución:**
```typescript
httpHelper.updateConfig({
  circuitBreaker: {
    failureThreshold: 0.7,  // Aumentar a 70%
    volumeThreshold: 5       // Requerir más requests
  }
});
```

---

### Problema 2: Circuit Breaker No Se Cierra

**Síntoma:** Circuit breaker permanece en OPEN o HALF_OPEN.

**Diagnóstico:**
```typescript
const metrics = httpHelper.getCircuitBreakerMetrics('/api/endpoint', 'GET');
console.log(metrics);

// Verificar:
// 1. Estado actual
// 2. nextAttemptAt (cuándo intentará recovery)
// 3. Successes en HALF_OPEN (necesita 2 por defecto)
```

**Solución:**
```typescript
// Reducir success threshold
httpHelper.updateConfig({
  circuitBreaker: {
    successThreshold: 1  // Solo 1 éxito necesario
  }
});

// O resetear manualmente
httpHelper.resetCircuitBreaker('/api/endpoint', 'GET');
```

---

### Problema 3: "Circuit breaker not found"

**Síntoma:** `getCircuitBreakerMetrics()` retorna `null`.

**Causa:** No se ha hecho ningún request a ese endpoint aún.

**Solución:**
```typescript
// Circuit breakers se crean bajo demanda
// Hacer al menos 1 request primero
await httpHelper.get('/api/endpoint');

// Ahora sí existe
const metrics = httpHelper.getCircuitBreakerMetrics('/api/endpoint', 'GET');
```

---

### Problema 4: Muchos Circuit Breakers en Memoria

**Síntoma:** `getCircuitBreakerStatus().total` es muy alto (>100).

**Solución:**
```typescript
// Limpiar circuit breakers no usados
// (Resetear también limpia el Map si actualizas config)
httpHelper.updateConfig({
  circuitBreaker: { enabled: true }  // Re-aplica config
});

// O implementar cleanup manual (feature pendiente)
```

---

## 📚 Referencias

### Estándares y Patrones

- **Martin Fowler - Circuit Breaker Pattern**
  https://martinfowler.com/bliki/CircuitBreaker.html

- **Microsoft Azure - Circuit Breaker Pattern**
  https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker

- **Netflix Hystrix** (inspiración)
  https://github.com/Netflix/Hystrix

### Implementación

- **Archivo:** `/src/helper/http/http.helper.ts` (v2.2.0)
- **Lines:** 611-866 (CircuitBreaker class)
- **Lines:** 880+ (HttpHelper integration)

### Testing

- ⏳ **Pendiente:** Unit tests
- ⏳ **Pendiente:** Integration tests
- ⏳ **Pendiente:** Load tests

---

## 🎯 Próximos Pasos

1. ✅ **Implementación Base** - COMPLETADO
2. ⏳ **Testing Exhaustivo** - PENDIENTE
3. ⏳ **Dashboard de Monitoreo** - PENDIENTE
4. ⏳ **Métricas en Backend** - PENDIENTE
5. ⏳ **Alertas Automáticas** - PENDIENTE

---

**Documentado por:** Claude Code
**Última actualización:** 2025-01-31
**Versión del documento:** 1.0.0
