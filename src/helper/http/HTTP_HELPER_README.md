# HTTP Helper - Documentación

Una clase robusta para el manejo de peticiones HTTP en aplicaciones frontend, implementando principios SOLID, KISS y DRY.

## Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso Básico](#uso-básico)
- [Métodos HTTP](#métodos-http)
- [Autenticación](#autenticación)
- [Upload de Archivos](#upload-de-archivos)
- [Manejo de Errores](#manejo-de-errores)
- [Configuración Avanzada](#configuración-avanzada)
- [Ejemplos Completos](#ejemplos-completos)
- [Tipos de Datos](#tipos-de-datos)

## Características

- ✅ **Singleton Pattern**: Una sola instancia para toda la aplicación
- ✅ **Reintentos automáticos** con backoff exponencial
- ✅ **Timeout configurable** para evitar peticiones colgadas
- ✅ **Autenticación automática** con tokens Bearer
- ✅ **Múltiples tipos de contenido** (JSON, FormData, URL-encoded, texto plano)
- ✅ **Logging integrado** para debugging
- ✅ **Manejo robusto de errores** con tipos específicos
- ✅ **TypeScript** con tipado completo
- ✅ **Upload de archivos** simplificado

## Instalación

El helper ya está incluido en el proyecto. Solo necesitas importarlo:

```typescript
import { httpHelper } from './helper/http.helper';
// o
import httpHelper from './helper/http.helper';
```

## Configuración

### Configuración Inicial

```typescript
import { HttpHelper } from './helper/http.helper';

// Configuración básica al crear la instancia
const http = HttpHelper.getInstance({
  baseURL: 'https://api.miapp.com',
  timeout: 10000, // 10 segundos
  retries: 2,
  defaultHeaders: {
    'X-App-Version': '1.0.0'
  }
});
```

### Actualizar Configuración

```typescript
// Actualizar configuración después de la inicialización
httpHelper.updateConfig({
  baseURL: 'https://api-prod.miapp.com',
  timeout: 15000
});
```

## Uso Básico

### GET Request

```typescript
// GET simple
const response = await httpHelper.get('/users');
console.log(response.data); // Array de usuarios

// GET con parámetros de query (manual)
const user = await httpHelper.get('/users/123');

// GET con headers personalizadas
const data = await httpHelper.get('/protected-endpoint', {
  headers: {
    'Custom-Header': 'valor'
  }
});
```

### POST Request

```typescript
// POST con JSON
const newUser = {
  name: 'Juan Pérez',
  email: 'juan@example.com'
};

const response = await httpHelper.post('/users', newUser);
console.log(response.data); // Usuario creado
```

## Métodos HTTP

### GET

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Con tipado TypeScript
const response = await httpHelper.get<User[]>('/users');
const users: User[] = response.data;
```

### POST

```typescript
const userData = { name: 'Ana', email: 'ana@test.com' };

// Crear usuario
const response = await httpHelper.post<User>('/users', userData);
const newUser: User = response.data;
```

### PUT

```typescript
const updatedData = { name: 'Ana María', email: 'ana.maria@test.com' };

// Actualizar usuario completo
const response = await httpHelper.put<User>('/users/123', updatedData);
```

### PATCH

```typescript
const partialUpdate = { name: 'Ana María' };

// Actualización parcial
const response = await httpHelper.patch<User>('/users/123', partialUpdate);
```

### DELETE

```typescript
// Eliminar usuario
const response = await httpHelper.delete('/users/123');
console.log(response.status); // 204 o 200
```

## Autenticación

### Configuración Automática

El helper está configurado para obtener automáticamente el token del `sessionStorage`:

```typescript
// El token se obtiene automáticamente de sessionStorage.getItem('auth_token')
const response = await httpHelper.get('/protected-data');
```

### Deshabilitar Autenticación

```typescript
// Para endpoints públicos
const response = await httpHelper.get('/public-data', {
  includeAuth: false
});
```

### Token Personalizado

```typescript
// Configurar getter personalizado
httpHelper.updateConfig({
  authTokenGetter: () => localStorage.getItem('custom_token'),
  authHeaderName: 'X-Auth-Token',
  authHeaderPrefix: 'Token'
});
```

## Upload de Archivos

### Upload Simple

```typescript
const fileInput = document.getElementById('file') as HTMLInputElement;
const file = fileInput.files[0];

const response = await httpHelper.uploadFile('/upload', file);
console.log(response.data); // Respuesta del servidor
```

### Upload con Datos Adicionales

```typescript
const file = fileInput.files[0];
const additionalData = {
  userId: '123',
  category: 'documents'
};

const response = await httpHelper.uploadFile('/upload', file, additionalData);
```

### Upload Manual con FormData

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('description', 'Mi documento');

const response = await httpHelper.post('/upload', formData, {
  contentType: 'multipart/form-data'
});
```

## Manejo de Errores

### Tipos de Error

```typescript
import { HttpError } from './helper/http.helper';

try {
  const response = await httpHelper.get('/endpoint');
} catch (error) {
  const httpError = error as HttpError;
  
  switch (httpError.type) {
    case 'NETWORK':
      console.log('Error de conexión');
      break;
    case 'TIMEOUT':
      console.log('Timeout de la petición');
      break;
    case 'AUTH':
      console.log('Error de autenticación');
      // Redirigir al login
      break;
    case 'CLIENT':
      console.log('Error del cliente (4xx)');
      break;
    case 'SERVER':
      console.log('Error del servidor (5xx)');
      break;
    case 'PARSE':
      console.log('Error parseando la respuesta');
      break;
  }
  
  console.log(`Status: ${httpError.status}`);
  console.log(`URL: ${httpError.url}`);
  console.log(`Duración: ${httpError.duration}ms`);
}
```

### Reintentos Personalizados

```typescript
// Configurar reintentos por petición
const response = await httpHelper.get('/unreliable-endpoint', {
  retries: 5,
  retryDelay: 2000 // 2 segundos
});
```

## Configuración Avanzada

### Timeout Personalizado

```typescript
// Timeout específico para una petición larga
const response = await httpHelper.post('/heavy-processing', data, {
  timeout: 60000 // 1 minuto
});
```

### Headers Personalizadas

```typescript
const response = await httpHelper.get('/api/data', {
  headers: {
    'Accept-Language': 'es-ES',
    'Custom-Header': 'value'
  }
});
```

### Diferentes Tipos de Contenido

```typescript
// Enviar como URL-encoded
const response = await httpHelper.post('/form', formData, {
  contentType: 'application/x-www-form-urlencoded'
});

// Enviar como texto plano
const response = await httpHelper.post('/text', 'Texto plano', {
  contentType: 'text/plain'
});
```

## Ejemplos Completos

### Sistema de Login

```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await httpHelper.post<LoginResponse>(
        '/auth/login',
        credentials,
        { includeAuth: false } // No incluir token en login
      );
      
      // Guardar token para futuras peticiones
      sessionStorage.setItem('auth_token', response.data.token);
      
      return response.data;
    } catch (error) {
      const httpError = error as HttpError;
      
      if (httpError.type === 'AUTH') {
        throw new Error('Credenciales incorrectas');
      }
      
      throw new Error('Error de conexión');
    }
  }
  
  async logout(): Promise<void> {
    try {
      await httpHelper.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('auth_token');
    }
  }
}
```

### CRUD Completo

```typescript
interface User {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

class UserService {
  private basePath = '/users';
  
  async getAll(): Promise<User[]> {
    const response = await httpHelper.get<User[]>(this.basePath);
    return response.data;
  }
  
  async getById(id: number): Promise<User> {
    const response = await httpHelper.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }
  
  async create(user: Omit<User, 'id'>): Promise<User> {
    const response = await httpHelper.post<User>(this.basePath, user);
    return response.data;
  }
  
  async update(id: number, user: Partial<User>): Promise<User> {
    const response = await httpHelper.patch<User>(`${this.basePath}/${id}`, user);
    return response.data;
  }
  
  async delete(id: number): Promise<void> {
    await httpHelper.delete(`${this.basePath}/${id}`);
  }
}
```

### Upload con Progress

```typescript
class FileUploadService {
  async uploadWithProgress(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Para progress, necesitarías usar XMLHttpRequest o una implementación personalizada
    // Este es un ejemplo básico
    return httpHelper.uploadFile('/files/upload', file, {
      type: file.type,
      size: file.size.toString()
    });
  }
  
  async uploadMultiple(files: File[]): Promise<any[]> {
    const uploads = files.map(file => this.uploadWithProgress(file));
    return Promise.all(uploads);
  }
}
```

## Tipos de Datos

### Interfaces Principales

```typescript
// Configuración de petición
interface HttpRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  contentType?: 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded' | 'text/plain';
  includeAuth?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Respuesta HTTP
interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  url: string;
  duration: number;
}

// Error HTTP
interface HttpError {
  type: 'NETWORK' | 'TIMEOUT' | 'AUTH' | 'CLIENT' | 'SERVER' | 'PARSE' | 'UNKNOWN';
  message: string;
  status?: number;
  statusText?: string;
  url: string;
  duration: number;
  originalError?: unknown;
  response?: Response;
}
```

## Mejores Prácticas

1. **Usar TypeScript**: Siempre especifica los tipos de respuesta
2. **Manejar errores**: Implementa manejo de errores específico por tipo
3. **Configuración centralizada**: Usa la configuración global para settings comunes
4. **Logging**: El helper ya incluye logging, úsalo para debugging
5. **Timeouts apropiados**: Ajusta timeouts según el tipo de operación
6. **Reintentos inteligentes**: No todos los endpoints necesitan reintentos

## Debugging

El helper incluye logging automático. Para ver los logs en consola:

```typescript
// Los logs aparecen automáticamente en la consola del navegador
// Formato: [HTTP] GET /api/users - 200 (150ms)
```

Para logging personalizado, puedes usar el logger helper:

```typescript
import { logHttp, logError } from './helper/logger.helper';
```

---

Esta documentación cubre todos los aspectos principales del HTTP Helper. Para casos de uso específicos o preguntas adicionales, consulta el código fuente en `src/helper/http.helper.ts`.
