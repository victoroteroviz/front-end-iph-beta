# Logger Helper - Documentación

Un sistema de logging robusto y configurable para aplicaciones frontend, implementando principios SOLID, KISS y DRY con diferentes niveles de log y configuración por ambiente.

## Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Niveles de Log](#niveles-de-log)
- [Uso Básico](#uso-básico)
- [Logging por Módulos](#logging-por-módulos)
- [Configuración por Ambiente](#configuración-por-ambiente)
- [Almacenamiento de Logs](#almacenamiento-de-logs)
- [Helpers Especializados](#helpers-especializados)
- [Ejemplos Completos](#ejemplos-completos)
- [Configuración Avanzada](#configuración-avanzada)
- [Tipos de Datos](#tipos-de-datos)

## Características

- ✅ **Singleton Pattern**: Una sola instancia para toda la aplicación
- ✅ **5 Niveles de logging** (DEBUG, INFO, WARN, ERROR, CRITICAL)
- ✅ **Configuración por ambiente** (development, staging, production)
- ✅ **Consola con colores** para mejor legibilidad
- ✅ **Almacenamiento persistente** en sessionStorage
- ✅ **Stack traces automáticos** para errores
- ✅ **Filtrado por nivel mínimo** configurable
- ✅ **Timestamps automáticos**
- ✅ **Helpers especializados** (HTTP, Auth, Error)
- ✅ **TypeScript** con tipado completo

## Instalación

El logger ya está incluido en el proyecto. Solo necesitas importarlo:

```typescript
import { logger } from './helper/logger.helper';
// o usando helpers específicos
import { logError, logInfo, logHttp, logAuth } from './helper/logger.helper';
```

## Configuración

### Configuración Automática por Ambiente

El logger se configura automáticamente según el ambiente detectado en `APP_ENVIRONMENT`:

```typescript
// Development
- Nivel mínimo: DEBUG
- Consola: habilitada
- Storage: habilitado
- Stack traces: habilitados

// Staging
- Nivel mínimo: INFO
- Consola: habilitada
- Storage: habilitado
- Stack traces: deshabilitados

// Production
- Nivel mínimo: WARN
- Consola: deshabilitada
- Storage: habilitado
- Stack traces: deshabilitados
```

### Configuración Manual

```typescript
import { logger } from './helper/logger.helper';

// Actualizar configuración
logger.updateConfig({
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 2000,
  includeTimestamp: true,
  includeStackTrace: true
});
```

## Niveles de Log

### Jerarquía de Niveles

```typescript
export const LogLevel = {
  DEBUG: 0,    // Información de desarrollo
  INFO: 1,     // Información general
  WARN: 2,     // Advertencias
  ERROR: 3,    // Errores recuperables
  CRITICAL: 4  // Errores críticos
};
```

### Uso de Niveles

```typescript
// Solo se mostrarán logs del nivel configurado o superior
logger.debug('MODULE', 'Información de debug');     // Solo en development
logger.info('MODULE', 'Información general');       // Development y staging
logger.warn('MODULE', 'Advertencia');               // Todos los ambientes
logger.error('MODULE', 'Error recuperable');        // Todos los ambientes
logger.critical('MODULE', 'Error crítico');         // Todos los ambientes
```

## Uso Básico

### Logging Simple

```typescript
import { logger } from './helper/logger.helper';

// Logging básico
logger.info('USER', 'Usuario logueado correctamente');
logger.warn('VALIDATION', 'Campo email vacío');
logger.error('API', 'Error al conectar con el servidor');
```

### Logging con Datos

```typescript
// Con datos adicionales
logger.info('USER', 'Usuario creado', {
  userId: 123,
  email: 'user@example.com',
  timestamp: new Date()
});

// Con objetos complejos
logger.debug('STATE', 'Estado actualizado', {
  previousState: { loading: false },
  newState: { loading: true, data: null }
});
```

### Usando Helpers

```typescript
import { logError, logInfo, logDebug } from './helper/logger.helper';

// Helpers para uso rápido
logInfo('AUTH', 'Sesión iniciada correctamente');
logError('PAYMENT', 'Error procesando pago', { orderId: 'ORD-123' });
logDebug('ROUTER', 'Navegando a nueva ruta', { route: '/dashboard' });
```

## Logging por Módulos

### Organización por Módulos

```typescript
// Módulos comunes
const MODULES = {
  AUTH: 'AUTH',
  API: 'API',
  UI: 'UI',
  ROUTER: 'ROUTER',
  PAYMENT: 'PAYMENT',
  USER: 'USER',
  VALIDATION: 'VALIDATION'
};

// Uso organizado
logger.info(MODULES.AUTH, 'Login exitoso');
logger.error(MODULES.API, 'Timeout en petición');
logger.debug(MODULES.UI, 'Componente renderizado');
```

### Creando Loggers Específicos

```typescript
class AuthLogger {
  static login(success: boolean, email?: string) {
    if (success) {
      logger.info('AUTH', `Login exitoso para ${email}`);
    } else {
      logger.warn('AUTH', `Intento de login fallido para ${email}`);
    }
  }
  
  static logout(email?: string) {
    logger.info('AUTH', `Logout para ${email}`);
  }
  
  static tokenExpired() {
    logger.warn('AUTH', 'Token expirado, redirigiendo al login');
  }
}
```

## Configuración por Ambiente

### Variables de Ambiente

```typescript
// en env.config.ts
export const APP_ENVIRONMENT = process.env.NODE_ENV || 'development';

// El logger usa esta variable para auto-configurarse
```

### Configuraciones Específicas

```typescript
// Development - logging completo
{
  minLevel: LogLevel.DEBUG,
  enableConsole: true,
  enableStorage: true,
  includeStackTrace: true
}

// Staging - logging moderado
{
  minLevel: LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  includeStackTrace: false
}

// Production - logging mínimo
{
  minLevel: LogLevel.WARN,
  enableConsole: false,
  enableStorage: true,
  includeStackTrace: false
}
```

## Almacenamiento de Logs

### Gestión de Logs Almacenados

```typescript
// Obtener logs almacenados
const storedLogs = logger.getStoredLogs();
console.log('Total logs:', storedLogs.length);

// Filtrar logs por nivel
const errors = storedLogs.filter(log => log.level >= LogLevel.ERROR);

// Limpiar logs almacenados
logger.clearStoredLogs();
```

### Exportar Logs

```typescript
class LogExporter {
  static exportToFile() {
    const logs = logger.getStoredLogs();
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.levelName} ${log.module}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  }
  
  static exportToJson() {
    const logs = logger.getStoredLogs();
    const jsonData = JSON.stringify(logs, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }
}
```

## Helpers Especializados

### HTTP Logging

```typescript
import { logHttp } from './helper/logger.helper';

// Logging automático de peticiones HTTP
logHttp('GET', '/api/users', 200, 150);        // Éxito
logHttp('POST', '/api/users', 400, 300, {      // Error con datos
  error: 'Validation failed',
  fields: ['email', 'password']
});

// Integración con servicios HTTP
class ApiService {
  async get(url: string) {
    const start = Date.now();
    try {
      const response = await fetch(url);
      const duration = Date.now() - start;
      
      logHttp('GET', url, response.status, duration);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logHttp('GET', url, 0, duration, { error: error.message });
      throw error;
    }
  }
}
```

### Auth Logging

```typescript
import { logAuth } from './helper/logger.helper';

// Logging de autenticación
logAuth('login', true, { userId: 123 });
logAuth('logout', true);
logAuth('token_refresh', false, { reason: 'Token expired' });

// Servicio de autenticación con logging
class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      logAuth('login', true, { email, userId: response.data.user.id });
      return response.data;
    } catch (error) {
      logAuth('login', false, { email, error: error.message });
      throw error;
    }
  }
}
```

### Error Logging

```typescript
import { logError } from './helper/logger.helper';

// Logging de errores con contexto
try {
  await riskyOperation();
} catch (error) {
  logError('PAYMENT', error, 'Error procesando pago para orden #123');
}

// Handler global de errores
window.addEventListener('error', (event) => {
  logError('GLOBAL', event.error, `Error en ${event.filename}:${event.lineno}`);
});

// Errores de promesas no manejadas
window.addEventListener('unhandledrejection', (event) => {
  logError('PROMISE', event.reason, 'Promise rejection no manejada');
});
```

## Ejemplos Completos

### Sistema de Logging para E-commerce

```typescript
import { logger, logHttp, logAuth, logError } from './helper/logger.helper';

class EcommerceLogger {
  // Logging de productos
  static productView(productId: string, userId?: string) {
    logger.info('PRODUCT', `Producto visualizado: ${productId}`, { userId });
  }
  
  static productSearch(query: string, results: number) {
    logger.info('SEARCH', `Búsqueda: "${query}" - ${results} resultados`);
  }
  
  // Logging de carrito
  static cartAdd(productId: string, quantity: number, userId?: string) {
    logger.info('CART', `Producto agregado al carrito`, {
      productId, quantity, userId
    });
  }
  
  static cartRemove(productId: string, userId?: string) {
    logger.info('CART', `Producto removido del carrito`, { productId, userId });
  }
  
  // Logging de checkout
  static checkoutStart(cartTotal: number, itemCount: number) {
    logger.info('CHECKOUT', `Checkout iniciado`, { cartTotal, itemCount });
  }
  
  static paymentAttempt(method: string, amount: number) {
    logger.info('PAYMENT', `Intento de pago con ${method}`, { amount });
  }
  
  static orderComplete(orderId: string, amount: number, userId?: string) {
    logger.info('ORDER', `Orden completada: ${orderId}`, { amount, userId });
  }
  
  // Logging de errores específicos
  static paymentError(error: any, orderId?: string) {
    logError('PAYMENT', error, `Error en pago${orderId ? ` para orden ${orderId}` : ''}`);
  }
  
  static inventoryError(productId: string, requestedQty: number, availableQty: number) {
    logger.warn('INVENTORY', `Stock insuficiente para producto ${productId}`, {
      requested: requestedQty,
      available: availableQty
    });
  }
}

// Uso en componentes
class ProductComponent {
  onProductView(productId: string) {
    EcommerceLogger.productView(productId, this.currentUser?.id);
  }
  
  onAddToCart(productId: string, quantity: number) {
    try {
      this.cartService.addItem(productId, quantity);
      EcommerceLogger.cartAdd(productId, quantity, this.currentUser?.id);
    } catch (error) {
      logError('CART', error, `Error agregando producto ${productId} al carrito`);
    }
  }
}
```

### Logger para SPA con Router

```typescript
class RouterLogger {
  static navigationStart(from: string, to: string) {
    logger.debug('ROUTER', `Navegación: ${from} → ${to}`);
  }
  
  static navigationComplete(route: string, loadTime: number) {
    logger.info('ROUTER', `Ruta cargada: ${route}`, { loadTime });
  }
  
  static navigationError(route: string, error: any) {
    logError('ROUTER', error, `Error navegando a ${route}`);
  }
  
  static guardBlocked(route: string, guardType: string, reason?: string) {
    logger.warn('ROUTER', `Acceso bloqueado a ${route} por ${guardType}`, { reason });
  }
}

// Integración con React Router o similar
function useRouterLogger() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const start = Date.now();
    RouterLogger.navigationStart(location.pathname, location.pathname);
    
    return () => {
      const loadTime = Date.now() - start;
      RouterLogger.navigationComplete(location.pathname, loadTime);
    };
  }, [location]);
}
```

### Logger de Performance

```typescript
class PerformanceLogger {
  private static measurements: Map<string, number> = new Map();
  
  static startMeasurement(key: string): void {
    this.measurements.set(key, performance.now());
    logger.debug('PERF', `Iniciando medición: ${key}`);
  }
  
  static endMeasurement(key: string): number {
    const start = this.measurements.get(key);
    if (!start) {
      logger.warn('PERF', `No se encontró medición para: ${key}`);
      return 0;
    }
    
    const duration = performance.now() - start;
    this.measurements.delete(key);
    
    const level = duration > 1000 ? 'warn' : duration > 500 ? 'info' : 'debug';
    logger[level]('PERF', `${key} completado en ${duration.toFixed(2)}ms`);
    
    return duration;
  }
  
  static measureAsync<T>(key: string, promise: Promise<T>): Promise<T> {
    this.startMeasurement(key);
    
    return promise
      .then(result => {
        this.endMeasurement(key);
        return result;
      })
      .catch(error => {
        this.endMeasurement(key);
        throw error;
      });
  }
}

// Uso con decoradores o HOCs
function withPerformanceLogging(component: React.Component, name: string) {
  return class extends React.Component {
    componentDidMount() {
      PerformanceLogger.endMeasurement(`render-${name}`);
    }
    
    componentWillMount() {
      PerformanceLogger.startMeasurement(`render-${name}`);
    }
    
    render() {
      return React.createElement(component, this.props);
    }
  };
}
```

## Configuración Avanzada

### Logger Personalizado por Módulo

```typescript
class ModuleLogger {
  constructor(private moduleName: string) {}
  
  debug(message: string, data?: unknown) {
    logger.debug(this.moduleName, message, data);
  }
  
  info(message: string, data?: unknown) {
    logger.info(this.moduleName, message, data);
  }
  
  warn(message: string, data?: unknown) {
    logger.warn(this.moduleName, message, data);
  }
  
  error(message: string, data?: unknown) {
    logger.error(this.moduleName, message, data);
  }
  
  critical(message: string, data?: unknown) {
    logger.critical(this.moduleName, message, data);
  }
}

// Uso en clases
class UserService {
  private logger = new ModuleLogger('USER_SERVICE');
  
  async getUser(id: string) {
    this.logger.debug(`Obteniendo usuario ${id}`);
    try {
      const user = await this.api.get(`/users/${id}`);
      this.logger.info(`Usuario ${id} obtenido correctamente`);
      return user;
    } catch (error) {
      this.logger.error(`Error obteniendo usuario ${id}`, error);
      throw error;
    }
  }
}
```

### Configuración de Filtros

```typescript
class LoggerWithFilters {
  private static sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];
  
  static filterSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const filtered = { ...data };
    
    for (const field of this.sensitiveFields) {
      if (field in filtered) {
        filtered[field] = '[FILTERED]';
      }
    }
    
    return filtered;
  }
  
  static secureLog(level: string, module: string, message: string, data?: unknown) {
    const filteredData = data ? this.filterSensitiveData(data) : undefined;
    logger[level](module, message, filteredData);
  }
}
```

## Tipos de Datos

### Interfaces Principales

```typescript
// Configuración del logger
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  includeTimestamp: boolean;
  includeStackTrace: boolean;
}

// Entrada de log
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  module: string;
  message: string;
  data?: unknown;
  stackTrace?: string;
  environment: string;
}

// Niveles de log
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];
```

## Mejores Prácticas

1. **Usa módulos descriptivos**: Facilita la búsqueda y filtrado de logs
2. **Niveles apropiados**: DEBUG para desarrollo, INFO para eventos importantes, WARN/ERROR para problemas
3. **Datos estructurados**: Incluye contexto relevante en el parámetro `data`
4. **No logs en loops intensivos**: Puede afectar performance
5. **Filtra datos sensibles**: Nunca loguees passwords, tokens, etc.
6. **Mantén mensajes claros**: Descriptivos pero concisos
7. **Usa helpers especializados**: `logHttp`, `logAuth`, `logError` para casos específicos

## Debugging y Monitoreo

### Panel de Logs en Desarrollo

```typescript
// Crear un panel de debugging (solo desarrollo)
if (process.env.NODE_ENV === 'development') {
  const createLogPanel = () => {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed; top: 10px; right: 10px; 
      width: 300px; height: 400px; 
      background: rgba(0,0,0,0.9); color: white; 
      font-family: monospace; font-size: 12px; 
      overflow: auto; z-index: 10000; padding: 10px;
    `;
    
    const updateLogs = () => {
      const logs = logger.getStoredLogs().slice(-20);
      panel.innerHTML = logs.map(log => 
        `<div style="color: ${getLogColor(log.level)}">
          [${log.levelName}] ${log.module}: ${log.message}
        </div>`
      ).join('');
    };
    
    document.body.appendChild(panel);
    setInterval(updateLogs, 1000);
  };
  
  // Activar con Ctrl+Shift+L
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      createLogPanel();
    }
  });
}
```

### Integración con Servicios de Monitoreo

```typescript
class LogMonitoring {
  static async sendCriticalLogs() {
    const criticalLogs = logger.getStoredLogs()
      .filter(log => log.level >= LogLevel.ERROR);
    
    if (criticalLogs.length > 0) {
      // Enviar a servicio de monitoreo (Sentry, LogRocket, etc.)
      await this.sendToMonitoringService(criticalLogs);
    }
  }
  
  private static async sendToMonitoringService(logs: LogEntry[]) {
    // Implementación específica del servicio
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.warn('No se pudieron enviar logs al servidor:', error);
    }
  }
}
```

---

Esta documentación cubre todos los aspectos del Logger Helper. Es un sistema completo de logging que se adapta automáticamente al ambiente y proporciona herramientas poderosas para debugging y monitoreo de aplicaciones frontend.
