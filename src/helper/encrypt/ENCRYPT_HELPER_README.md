# 🔐 Encrypt Helper - Documentación Completa

## Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Instalación y Configuración](#instalación-y-configuración)
- [API Completa](#api-completa)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Manejo de Errores](#manejo-de-errores)
- [Configuración Avanzada](#configuración-avanzada)
- [Seguridad](#seguridad)
- [Troubleshooting](#troubleshooting)

---

## Descripción General

El **Encrypt Helper** es un sistema centralizado de encriptación y hashing para el frontend de IPH, diseñado para manejar de manera segura:

- ✅ **Hashing de passwords** con salt y PBKDF2
- ✅ **Encriptación/desencriptación** de datos sensibles
- ✅ **Generación de tokens** seguros
- ✅ **Configuración por ambiente** (development/staging/production)
- ✅ **Logging integrado** con el sistema existente

### Características de Seguridad

- **🔐 PBKDF2** con 100,000 iteraciones (producción)
- **🧂 Salt aleatorio** de 32 bytes para cada password
- **🔑 AES-GCM/CBC** para encriptación simétrica
- **🌐 Web Crypto API** nativa del navegador
- **📊 OWASP 2024** compliance

---

## Instalación y Configuración

### Importación Básica

```typescript
// Importación de la clase principal
import { EncryptHelper } from '../helper/encrypt/encrypt.helper';

// Importación de funciones de conveniencia
import { 
  hashPassword, 
  verifyPassword, 
  encryptData, 
  decryptData,
  generateSecureToken 
} from '../helper/encrypt/encrypt.helper';
```

### Configuración Inicial

```typescript
// Uso con configuración por defecto
const encryptHelper = EncryptHelper.getInstance();

// Uso con configuración personalizada
const encryptHelper = EncryptHelper.getInstance({
  hashIterations: 50000,
  saltLength: 16,
  enableLogging: true
});
```

### Configuración por Ambiente

El helper se auto-configura según el ambiente detectado:

| Ambiente | Iteraciones | Logging | Algoritmo |
|----------|------------|---------|-----------|
| **Development** | 10,000 | ✅ Habilitado | SHA-256 |
| **Staging** | 50,000 | ✅ Habilitado | SHA-256 |
| **Production** | 100,000 | ❌ Deshabilitado | SHA-256 |

---

## API Completa

### Clase Principal: `EncryptHelper`

#### Métodos Estáticos

```typescript
// Obtener instancia singleton
static getInstance(config?: Partial<EncryptHelperConfig>): EncryptHelper

// Ejemplo
const helper = EncryptHelper.getInstance({
  hashIterations: 75000,
  enableLogging: false
});
```

#### Configuración

```typescript
// Actualizar configuración
updateConfig(newConfig: Partial<EncryptHelperConfig>): void

// Obtener configuración actual
getConfig(): EncryptHelperConfig

// Ejemplo
helper.updateConfig({ 
  defaultHashAlgorithm: 'SHA-512',
  encryptionAlgorithm: 'AES-CBC'
});

console.log(helper.getConfig());
```

#### Hashing de Passwords

```typescript
// Generar hash de password
async hashPassword(password: string): Promise<HashResult>

// Verificar password
async verifyPassword(password: string, hash: string): Promise<PasswordVerification>
```

#### Encriptación de Datos

```typescript
// Encriptar datos sensibles
async encryptData(data: string, passphrase?: string): Promise<EncryptionResult>

// Desencriptar datos
async decryptData(encryptedData: EncryptionResult, passphrase?: string): Promise<string>
```

#### Utilidades

```typescript
// Generar token seguro
generateSecureToken(length: number = 32): string
```

### API Funcional (Helper Functions)

Para uso más simple sin instanciar la clase:

```typescript
// Hashing
await hashPassword('miPassword123');
await verifyPassword('miPassword123', hashAlmacenado);

// Encriptación
await encryptData('datos sensibles', 'passphrase opcional');
await decryptData(datosEncriptados, 'passphrase opcional');

// Token
generateSecureToken(64); // Token de 64 caracteres
```

---

## Ejemplos de Uso

### 1. Hashing de Passwords para Registro

```typescript
import { hashPassword } from '../helper/encrypt/encrypt.helper';
import { logInfo } from '../helper/log/logger.helper';

const registerUser = async (userData: { email: string, password: string }) => {
  try {
    // Hash del password antes de enviar al servidor
    const hashResult = await hashPassword(userData.password);
    
    logInfo('UserService', 'Password hasheado exitosamente', {
      algorithm: hashResult.algorithm,
      iterations: hashResult.iterations
    });

    // Enviar al servidor con hash
    const userPayload = {
      ...userData,
      passwordHash: hashResult.hash,
      salt: hashResult.salt,
      hashAlgorithm: hashResult.algorithm,
      iterations: hashResult.iterations
    };

    return await createUser(userPayload);
  } catch (error) {
    logError('UserService', 'Error al hashear password', { error });
    throw new Error('Error procesando registro de usuario');
  }
};
```

### 2. Verificación de Passwords en Login

```typescript
import { verifyPassword } from '../helper/encrypt/encrypt.helper';

const authenticateUser = async (email: string, password: string) => {
  try {
    // Obtener datos del usuario del servidor
    const user = await getUserByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar password
    const verification = await verifyPassword(password, user.passwordHash);
    
    if (!verification.isValid) {
      logWarning('AuthService', 'Intento de login fallido', { 
        email, 
        verificationTime: verification.verificationTime 
      });
      throw new Error('Credenciales inválidas');
    }

    // Verificar si necesita rehashing (algoritmo obsoleto)
    if (verification.needsRehash) {
      logInfo('AuthService', 'Password necesita rehashing', { email });
      // Agendar rehashing en background
      schedulePasswordRehash(user.id, password);
    }

    logInfo('AuthService', 'Login exitoso', { 
      email, 
      verificationTime: verification.verificationTime 
    });

    return { success: true, user };
  } catch (error) {
    logError('AuthService', 'Error en autenticación', { email, error });
    throw error;
  }
};
```

### 3. Encriptación de Datos Sensibles

```typescript
import { encryptData, decryptData } from '../helper/encrypt/encrypt.helper';

// Encriptar datos antes de almacenar en sessionStorage
const saveSecureData = async (key: string, data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    const encrypted = await encryptData(jsonData, 'user-session-key');
    
    sessionStorage.setItem(key, JSON.stringify(encrypted));
    logInfo('SecureStorage', 'Datos encriptados y guardados', { key });
  } catch (error) {
    logError('SecureStorage', 'Error encriptando datos', { key, error });
    throw new Error('Error guardando datos seguros');
  }
};

// Desencriptar datos al leer de sessionStorage
const getSecureData = async (key: string) => {
  try {
    const encryptedData = sessionStorage.getItem(key);
    if (!encryptedData) return null;

    const encrypted = JSON.parse(encryptedData);
    const decrypted = await decryptData(encrypted, 'user-session-key');
    
    return JSON.parse(decrypted);
  } catch (error) {
    logError('SecureStorage', 'Error desencriptando datos', { key, error });
    // Limpiar datos corruptos
    sessionStorage.removeItem(key);
    return null;
  }
};
```

### 4. Generación de Tokens CSRF

```typescript
import { generateSecureToken } from '../helper/encrypt/encrypt.helper';

const generateCSRFToken = (): string => {
  try {
    // Generar token de 32 caracteres
    const token = generateSecureToken(32);
    
    // Guardar en sessionStorage con timestamp
    sessionStorage.setItem('csrf_token', JSON.stringify({
      token,
      timestamp: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000) // 1 hora
    }));

    logInfo('CSRFService', 'Token CSRF generado', { tokenLength: token.length });
    return token;
  } catch (error) {
    logError('CSRFService', 'Error generando token CSRF', { error });
    throw new Error('Error generando token de seguridad');
  }
};
```

### 5. Configuración Dinámica

```typescript
import { EncryptHelper } from '../helper/encrypt/encrypt.helper';

// Ajustar configuración según necesidades de rendimiento
const optimizeForPerformance = () => {
  const helper = EncryptHelper.getInstance();
  
  // Reducir iteraciones para operaciones frecuentes
  helper.updateConfig({
    hashIterations: 25000, // Menos iteraciones para mejor rendimiento
    enableLogging: false   // Deshabilitar logging para mejor rendimiento
  });

  logInfo('EncryptService', 'Configuración optimizada para rendimiento');
};

// Restaurar configuración segura
const restoreSecureConfig = () => {
  const helper = EncryptHelper.getInstance();
  
  helper.updateConfig({
    hashIterations: 100000, // Máxima seguridad
    defaultHashAlgorithm: 'SHA-512',
    enableLogging: true
  });

  logInfo('EncryptService', 'Configuración restaurada para máxima seguridad');
};
```

---

## Manejo de Errores

### Tipos de Errores

El Encrypt Helper maneja varios tipos de errores de manera consistente:

```typescript
// Constantes de errores definidas
const ERROR_MESSAGES = {
  HASH_GENERATION_FAILED: 'Error al generar hash',
  HASH_VERIFICATION_FAILED: 'Error al verificar hash', 
  ENCRYPTION_FAILED: 'Error al encriptar datos',
  DECRYPTION_FAILED: 'Error al desencriptar datos',
  INVALID_INPUT: 'Entrada inválida',
  CRYPTO_NOT_SUPPORTED: 'Web Crypto API no soportada en este navegador',
  INVALID_HASH_FORMAT: 'Formato de hash inválido'
};
```

### Estrategias de Error Handling

#### 1. Try-Catch con Logging Automático

```typescript
const safeHashPassword = async (password: string) => {
  try {
    const result = await hashPassword(password);
    return { success: true, data: result };
  } catch (error) {
    // Error automáticamente loggeado por el helper
    return { 
      success: false, 
      error: error.message || 'Error desconocido en hashing'
    };
  }
};
```

#### 2. Validación de Soporte del Navegador

```typescript
import { EncryptHelper } from '../helper/encrypt/encrypt.helper';

const initializeEncryption = () => {
  try {
    const helper = EncryptHelper.getInstance();
    return { supported: true, helper };
  } catch (error) {
    if (error.message.includes('Web Crypto API no soportada')) {
      // Fallback para navegadores antiguos
      return { 
        supported: false, 
        fallback: 'basic-hash', // Implementar fallback básico
        message: 'Navegador no soporta encriptación avanzada'
      };
    }
    throw error;
  }
};
```

#### 3. Recuperación de Errores de Datos Corruptos

```typescript
const recoverFromCorruptedData = async (key: string) => {
  try {
    return await getSecureData(key);
  } catch (error) {
    logWarning('DataRecovery', 'Datos corruptos detectados', { key, error });
    
    // Limpiar datos corruptos
    sessionStorage.removeItem(key);
    
    // Intentar recuperar desde backup
    const backupKey = `${key}_backup`;
    try {
      const backupData = await getSecureData(backupKey);
      if (backupData) {
        logInfo('DataRecovery', 'Datos recuperados desde backup', { key });
        // Restaurar datos principales
        await saveSecureData(key, backupData);
        return backupData;
      }
    } catch (backupError) {
      logError('DataRecovery', 'Backup también corrupto', { key, backupError });
    }
    
    return null; // No se pudo recuperar
  }
};
```

#### 4. Retry Logic para Operaciones de Red

```typescript
const encryptWithRetry = async (data: string, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await encryptData(data);
      logInfo('EncryptRetry', 'Encriptación exitosa', { attempt });
      return result;
    } catch (error) {
      lastError = error;
      logWarning('EncryptRetry', `Intento ${attempt} fallido`, { 
        attempt, 
        error: error.message,
        remainingAttempts: maxRetries - attempt 
      });
      
      if (attempt < maxRetries) {
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  
  logError('EncryptRetry', 'Todos los intentos de encriptación fallaron', { 
    maxRetries, 
    finalError: lastError 
  });
  throw lastError;
};
```

### Errores Específicos del Helper

#### Error de Navegador No Compatible

```typescript
// Error: Web Crypto API no soportada en este navegador
// Solución: Implementar fallback o mostrar mensaje al usuario

const handleUnsupportedBrowser = () => {
  showError(
    'Tu navegador no soporta las funciones de seguridad requeridas. ' +
    'Por favor actualiza tu navegador o usa Chrome/Firefox/Safari.',
    'Navegador No Compatible'
  );
  
  // Redirigir a página de compatibilidad
  window.location.href = '/browser-compatibility';
};
```

#### Error de Formato de Hash Inválido

```typescript
// Error: Formato de hash inválido
// Solución: Validar formato antes de verificar

const safeVerifyPassword = async (password: string, hash: string) => {
  // Validar formato básico del hash
  if (!hash || typeof hash !== 'string' || hash.length < 32) {
    logWarning('PasswordVerify', 'Hash con formato inválido', { hashLength: hash?.length });
    return { isValid: false, needsRehash: true };
  }
  
  try {
    return await verifyPassword(password, hash);
  } catch (error) {
    if (error.message.includes('Formato de hash inválido')) {
      logWarning('PasswordVerify', 'Hash legacy detectado', { hash: hash.substring(0, 10) + '...' });
      return { isValid: false, needsRehash: true };
    }
    throw error;
  }
};
```

---

## Configuración Avanzada

### Configuración Completa de Interfaces

```typescript
interface EncryptHelperConfig {
  defaultHashAlgorithm: 'SHA-256' | 'SHA-512';
  saltLength: number;                    // Bytes de salt (recomendado: 32)
  hashIterations: number;               // Iteraciones PBKDF2 (min: 10000)
  encryptionAlgorithm: 'AES-GCM' | 'AES-CBC';
  keyLength: number;                    // Bits de clave (128, 192, 256)
  enableLogging: boolean;               // Logging de operaciones
  environment: 'development' | 'staging' | 'production';
}
```

### Configuraciones Predefinidas por Uso

#### Configuración de Alto Rendimiento

```typescript
const performanceConfig = {
  hashIterations: 25000,      // Menos iteraciones
  saltLength: 16,             // Salt más pequeño
  defaultHashAlgorithm: 'SHA-256' as const,
  enableLogging: false       // Sin logging
};

const helper = EncryptHelper.getInstance(performanceConfig);
```

#### Configuración de Máxima Seguridad

```typescript
const maxSecurityConfig = {
  hashIterations: 150000,     // Más iteraciones
  saltLength: 64,             // Salt más grande
  defaultHashAlgorithm: 'SHA-512' as const,
  encryptionAlgorithm: 'AES-GCM' as const,
  keyLength: 256,             // Clave más grande
  enableLogging: true
};

const helper = EncryptHelper.getInstance(maxSecurityConfig);
```

#### Configuración para Testing

```typescript
const testingConfig = {
  hashIterations: 1000,       // Rápido para tests
  saltLength: 8,              // Pequeño para tests
  enableLogging: false       // Sin ruido en tests
};

const helper = EncryptHelper.getInstance(testingConfig);
```

### Monitoreo y Métricas

```typescript
import { EncryptHelper } from '../helper/encrypt/encrypt.helper';

// Obtener métricas de configuración actual
const getEncryptMetrics = () => {
  const helper = EncryptHelper.getInstance();
  const config = helper.getConfig();
  
  return {
    securityLevel: calculateSecurityLevel(config),
    performanceScore: calculatePerformanceScore(config),
    environment: config.environment,
    algorithms: {
      hash: config.defaultHashAlgorithm,
      encryption: config.encryptionAlgorithm
    }
  };
};

const calculateSecurityLevel = (config: EncryptHelperConfig): 'low' | 'medium' | 'high' => {
  const score = 
    (config.hashIterations / 10000) + 
    (config.saltLength / 8) + 
    (config.keyLength / 128) +
    (config.defaultHashAlgorithm === 'SHA-512' ? 2 : 1);
  
  if (score >= 20) return 'high';
  if (score >= 10) return 'medium';
  return 'low';
};
```

---

## Seguridad

### Buenas Prácticas Implementadas

- ✅ **PBKDF2** con mínimo 10,000 iteraciones
- ✅ **Salt único** por cada password
- ✅ **Web Crypto API** nativa (más segura que JavaScript puro)
- ✅ **Configuración por ambiente** (más iteraciones en producción)
- ✅ **Logging de eventos** de seguridad
- ✅ **Validación de entrada** antes de procesamiento
- ✅ **Limpieza de cache** al cambiar algoritmos

### Consideraciones de Seguridad

#### 1. No Almacenar Passwords en Texto Plano

```typescript
// ❌ MAL - Password en texto plano
const userData = {
  email: 'user@example.com',
  password: 'miPassword123'  // ❌ Nunca hacer esto
};

// ✅ BIEN - Solo almacenar hash
const hashResult = await hashPassword('miPassword123');
const userData = {
  email: 'user@example.com',
  passwordHash: hashResult.hash,
  salt: hashResult.salt
};
```

#### 2. Limpiar Variables Sensibles

```typescript
const processPassword = async (password: string) => {
  try {
    const result = await hashPassword(password);
    
    // Limpiar password de memoria
    password = ''; // Ayuda al garbage collector
    
    return result;
  } catch (error) {
    // Limpiar password incluso en error
    password = '';
    throw error;
  }
};
```

#### 3. Validar Entrada Antes de Procesar

```typescript
const validatePasswordInput = (password: string): void => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password debe ser una cadena no vacía');
  }
  
  if (password.length < 8) {
    throw new Error('Password debe tener al menos 8 caracteres');
  }
  
  if (password.length > 128) {
    throw new Error('Password demasiado largo (máximo 128 caracteres)');
  }
};

const safeHashPassword = async (password: string) => {
  validatePasswordInput(password);
  return await hashPassword(password);
};
```

---

## Troubleshooting

### Problemas Comunes y Soluciones

#### 1. Error: "Web Crypto API no soportada"

**Causa:** Navegador muy antiguo o contexto inseguro (HTTP en lugar de HTTPS)

**Soluciones:**
```typescript
// Verificar soporte antes de usar
if (!crypto || !crypto.subtle) {
  console.warn('Web Crypto API no disponible');
  // Implementar fallback o mostrar mensaje al usuario
  return;
}

// Para desarrollo local, usar HTTPS o localhost
// En producción, siempre usar HTTPS
```

#### 2. Performance Lenta en Hashing

**Causa:** Muchas iteraciones configuradas

**Soluciones:**
```typescript
// Para desarrollo, reducir iteraciones temporalmente
if (process.env.NODE_ENV === 'development') {
  helper.updateConfig({ hashIterations: 10000 });
}

// Usar Web Workers para operaciones pesadas
const hashInWorker = async (password: string) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('/hash-worker.js');
    worker.postMessage({ password });
    worker.onmessage = (e) => resolve(e.data);
    worker.onerror = (e) => reject(e);
  });
};
```

#### 3. Datos Encriptados No Se Pueden Leer

**Causa:** Cambio de configuración o datos corruptos

**Soluciones:**
```typescript
// Implementar versionado de datos encriptados
const encryptWithVersion = async (data: string) => {
  const config = helper.getConfig();
  const encrypted = await encryptData(data);
  
  return {
    ...encrypted,
    version: '1.0',
    algorithm: config.encryptionAlgorithm,
    keyLength: config.keyLength
  };
};

// Verificar versión al desencriptar
const decryptWithVersion = async (encryptedData: any) => {
  if (encryptedData.version !== '1.0') {
    logWarning('Decrypt', 'Versión de datos no compatible', { 
      dataVersion: encryptedData.version 
    });
    // Manejar migración o conversión
  }
  
  return await decryptData(encryptedData);
};
```

#### 4. Memory Leaks con Cache de Claves

**Causa:** Cache no se limpia apropiadamente

**Soluciones:**
```typescript
// Limpiar cache periódicamente
const clearCacheIfNeeded = () => {
  const helper = EncryptHelper.getInstance();
  const config = helper.getConfig();
  
  // Limpiar cache cada hora
  setInterval(() => {
    helper.updateConfig({}); // Esto limpia el cache internamente
    logInfo('EncryptHelper', 'Cache de claves limpiado automáticamente');
  }, 60 * 60 * 1000);
};
```

### Logging y Debugging

#### Habilitar Logging Detallado

```typescript
// Habilitar logging para debugging
const helper = EncryptHelper.getInstance({
  enableLogging: true
});

// Ver configuración actual
console.log('Config actual:', helper.getConfig());

// Los logs aparecerán automáticamente en consola y sessionStorage
// Usar logger helper para revisar logs almacenados
import { getStoredLogs } from '../log/logger.helper';
console.log('Logs de encriptación:', getStoredLogs().filter(log => 
  log.module === 'EncryptHelper'
));
```

#### Performance Profiling

```typescript
const profileEncryptOperation = async (data: string) => {
  const startTime = performance.now();
  
  try {
    const result = await encryptData(data);
    const endTime = performance.now();
    
    logInfo('EncryptProfile', 'Operación completada', {
      duration: `${endTime - startTime}ms`,
      dataSize: data.length,
      resultSize: result.encrypted.length
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    logError('EncryptProfile', 'Operación falló', {
      duration: `${endTime - startTime}ms`,
      error: error.message
    });
    throw error;
  }
};
```

---

## Changelog y Versionado

### Versión 1.0.0 (Actual)
- ✅ Estructura base implementada
- ✅ Configuración por ambiente
- ✅ Integración con logger
- ✅ Interfaces TypeScript completas
- ⏳ Funciones de hashing (en desarrollo)
- ⏳ Funciones de encriptación (en desarrollo)
- ⏳ Generación de tokens (en desarrollo)

### Próximas Versiones

**v1.1.0 - Hashing Functions**
- Implementación completa de hashPassword()
- Implementación completa de verifyPassword()
- Soporte para algoritmos legacy

**v1.2.0 - Encryption Functions**
- Implementación de encryptData() / decryptData()
- Soporte para múltiples algoritmos de encriptación
- Key derivation optimizada

**v1.3.0 - Token Generation**
- Generación de tokens seguros
- Soporte para diferentes tipos de tokens
- Integración con CSRF protection

---

## Contribución y Soporte

Para reportar bugs o solicitar features, por favor:

1. Verificar que el error no esté en la lista de troubleshooting
2. Incluir logs relevantes (usar `getStoredLogs()`)
3. Especificar navegador y versión
4. Incluir configuración utilizada

### Contacto

- **Módulo:** `EncryptHelper`
- **Logger Key:** `EncryptHelper`
- **Namespace:** `helper/encrypt`