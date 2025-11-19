# 🐛 DEBUG - LENTITUD EN INPUTS DE LOGIN

**Fecha:** 2025-01-31
**Prioridad:** 🔴 CRÍTICA (Afecta UX)
**Estado:** 🔍 EN INVESTIGACIÓN

---

## 🚨 PROBLEMA REPORTADO

**Síntoma:** Lentitud notable en los inputs del formulario de login

**Usuario Afectado:** Todos los usuarios en el ambiente actual

**Impacto en UX:** Alto - Los inputs se sienten "trabados" o lentos al escribir

---

## 🔍 ANÁLISIS INICIAL

### **Posibles Causas:**

1. **PBKDF2 con iteraciones altas bloqueando hilo principal**
   - Sprint 1.5 implementó 600k iteraciones en producción
   - 100k iteraciones en desarrollo
   - Estas operaciones son **síncronas** y bloquean el UI

2. **Detección de ambiente incorrecta**
   - `detectEnvironment()` usa `process.env.NODE_ENV` (no disponible en Vite browser)
   - Fallback a hostname puede no ser confiable
   - **DEBE usar `import.meta.env.MODE`** (Vite estándar)

3. **Encriptación durante escritura**
   - ¿Se está ejecutando encriptación en cada keystroke?
   - CacheHelper.setEncrypted() se ejecuta DESPUÉS del login, no durante

---

## 📊 INFORMACIÓN DEL AMBIENTE

### **Configuración Actual (encrypt.helper.ts):**

```typescript
// Detección de ambiente (líneas 720-740)
private detectEnvironment(): 'development' | 'staging' | 'production' {
  // ❌ PROBLEMA: No usa import.meta.env.MODE de Vite
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    // ...
  }

  // Fallback a hostname (puede ser incorrecto)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // ...
  }

  return 'development'; // Default
}
```

### **Iteraciones por Ambiente:**

| Ambiente | Iteraciones | Tiempo Estimado | Estado |
|----------|-------------|-----------------|--------|
| Development | 100,000 | ~50ms | ⚠️ Puede causar lag |
| Staging | 300,000 | ~150ms | 🔴 Lag notable |
| Production | 600,000 | ~300ms | 🔴 Lag severo |

---

## 🧪 PRUEBAS A REALIZAR

### **Test 1: Verificar Ambiente Detectado**

```typescript
// En consola del navegador:
const helper = EncryptHelper.getInstance();
console.log('Ambiente detectado:', helper.getConfig().environment);
console.log('Iteraciones:', helper.getConfig().hashIterations);
console.log('Vite MODE:', import.meta.env.MODE);
console.log('Vite PROD:', import.meta.env.PROD);
```

**Resultado esperado:**
- Ambiente: 'development'
- Iteraciones: 100,000
- Vite MODE: 'development'

### **Test 2: Medir Tiempo de Encriptación**

```typescript
// Test de performance
const helper = EncryptHelper.getInstance();

console.time('encryptData');
await helper.encryptData('test data');
console.timeEnd('encryptData');

console.time('deriveKey');
// Simular derivación de clave
await helper.hashPassword('test password');
console.timeEnd('deriveKey');
```

**Resultado esperado:**
- encryptData: < 100ms
- deriveKey: < 100ms

### **Test 3: Verificar Llamadas Durante Tipeo**

```typescript
// En el componente Login, agregar logs:
onChange={(e) => {
  console.log('onChange triggered');
  console.time('onChange');
  updateFormData({ password: e.target.value });
  console.timeEnd('onChange');
}}
```

**Resultado esperado:**
- onChange: < 5ms (debe ser casi instantáneo)

---

## 💡 SOLUCIONES PROPUESTAS

### **Solución 1: Corregir Detección de Ambiente (INMEDIATA)**

**Problema:** `detectEnvironment()` no usa `import.meta.env.MODE`

**Solución:**
```typescript
private detectEnvironment(): 'development' | 'staging' | 'production' {
  // ✅ CORRECTO: Usar import.meta.env.MODE de Vite
  const viteMode = import.meta.env.MODE;
  const viteProd = import.meta.env.PROD;

  if (viteProd) {
    return 'production';
  }

  if (viteMode === 'staging') {
    return 'staging';
  }

  return 'development';
}
```

**Impacto:** Garantiza que el ambiente correcto sea detectado

**Tiempo:** 5 minutos

---

### **Solución 2: Agregar Logging de Ambiente (DEBUG)**

**Problema:** No hay visibilidad de qué ambiente se está usando

**Solución:**
```typescript
private constructor(config?: Partial<EncryptHelperConfig>) {
  this.config = this.initializeConfig(config);
  this.validateCryptoSupport();

  // ✅ AGREGAR: Log detallado del ambiente
  console.group('🔐 EncryptHelper Inicializado');
  console.log('Ambiente detectado:', this.config.environment);
  console.log('Iteraciones PBKDF2:', this.config.hashIterations);
  console.log('Vite MODE:', import.meta.env.MODE);
  console.log('Vite PROD:', import.meta.env.PROD);
  console.log('Hostname:', window.location.hostname);
  console.groupEnd();
}
```

**Impacto:** Facilita debugging

**Tiempo:** 2 minutos

---

### **Solución 3: Reducir Iteraciones en Development (TEMPORAL)**

**Problema:** 100k iteraciones pueden seguir siendo pesadas para tipeo fluido

**Solución:**
```typescript
const ENVIRONMENT_CONFIGS: Record<string, Partial<EncryptHelperConfig>> = {
  development: {
    hashIterations: 10000, // ← Reducir temporalmente para desarrollo
    enableLogging: true
  },
  // ...
};
```

**⚠️ ADVERTENCIA:** Solo para desarrollo local. NO para staging/producción.

**Impacto:** Mejora UX en desarrollo sin afectar seguridad en producción

**Tiempo:** 1 minuto

---

### **Solución 4: Implementar Web Workers (DEFINITIVA - Sprint 2)**

**Problema:** PBKDF2 bloquea hilo principal del navegador

**Solución:** Mover PBKDF2 a Web Worker

```typescript
// worker.ts
self.onmessage = async (e) => {
  const { passphrase, salt, iterations } = e.data;

  // PBKDF2 en worker (no bloquea UI)
  const key = await deriveKeyInWorker(passphrase, salt, iterations);

  self.postMessage({ key });
};

// encrypt.helper.ts
private async deriveKeyAsync(passphrase: string): Promise<CryptoKey> {
  return new Promise((resolve) => {
    const worker = new Worker('crypto-worker.ts');

    worker.onmessage = (e) => {
      resolve(e.data.key);
      worker.terminate();
    };

    worker.postMessage({ passphrase, salt, iterations });
  });
}
```

**Impacto:** UX fluida incluso con 600k iteraciones

**Tiempo:** 4-8 horas (tarea PERF-007)

---

### **Solución 5: Debouncing de Validaciones (SI APLICA)**

**Problema:** Si se ejecuta validación en cada keystroke, puede causar lag

**Solución:**
```typescript
// Debounce de 300ms
const debouncedValidate = useMemo(
  () => debounce((value: string) => {
    if (validateOnChange) {
      validateInput(value);
    }
  }, 300),
  []
);

onChange={(e) => {
  updateFormData({ password: e.target.value });
  debouncedValidate(e.target.value); // ← Debounced
}}
```

**Impacto:** Reduce validaciones innecesarias

**Tiempo:** 30 minutos

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### **Paso 1: Diagnóstico (5 minutos)**

```bash
# En navegador, ejecutar en consola:
const helper = EncryptHelper.getInstance();
console.log('Config:', {
  environment: helper.getConfig().environment,
  iterations: helper.getConfig().hashIterations,
  viteMode: import.meta.env.MODE,
  viteProd: import.meta.env.PROD,
  hostname: window.location.hostname
});
```

### **Paso 2: Corregir Detección de Ambiente (5 minutos)**

```typescript
// Archivo: src/helper/encrypt/encrypt.helper.ts
// Líneas: 720-740
// Cambio: Usar import.meta.env.MODE en lugar de process.env.NODE_ENV
```

### **Paso 3: Verificar Mejoría (2 minutos)**

```bash
# Recargar app
# Verificar en consola que ambiente sea 'development'
# Probar inputs de login - deben ser fluidos
```

### **Paso 4: Si Persiste - Reducir Iteraciones Temporalmente (1 minuto)**

```typescript
// Solo para desarrollo local
development: {
  hashIterations: 10000, // Temporal
}
```

### **Paso 5: Planificar Web Workers (Sprint 2)**

- Agregar tarea PERF-007 al backlog
- Estimar 6-8 horas
- Prioridad: Alta

---

## 📈 MÉTRICAS DE ÉXITO

| Métrica | Antes | Objetivo | Estado |
|---------|-------|----------|--------|
| Tiempo onChange | ? | < 5ms | 🔍 Por medir |
| Tiempo encryptData | ? | < 100ms | 🔍 Por medir |
| Iteraciones (dev) | ? | 10k-100k | 🔍 Por verificar |
| Ambiente detectado | ? | 'development' | 🔍 Por verificar |
| UX percibida | Lento | Fluido | 🔍 Por validar |

---

## 🐛 LOGS ESPERADOS

### **Log Correcto (OK):**
```
🔐 EncryptHelper Inicializado
  Ambiente detectado: development
  Iteraciones PBKDF2: 100000
  Vite MODE: development
  Vite PROD: false
  Hostname: localhost
```

### **Log Incorrecto (PROBLEMA):**
```
🔐 EncryptHelper Inicializado
  Ambiente detectado: production  ← ❌ INCORRECTO en desarrollo
  Iteraciones PBKDF2: 600000      ← ❌ Demasiado pesado
  Vite MODE: development
  Vite PROD: false
  Hostname: localhost
```

---

## 📝 NOTAS ADICIONALES

- **Vite vs Node:** Vite usa `import.meta.env`, NO `process.env`
- **Browser vs Server:** `process` puede no estar disponible en navegador
- **Performance:** PBKDF2 es CPU-intensive, siempre bloquea el hilo principal si es síncrono
- **UX Target:** Inputs deben responder en < 16ms (60 FPS)

---

## ✅ CHECKLIST DE RESOLUCIÓN

- [ ] Verificar ambiente detectado en consola
- [ ] Verificar iteraciones PBKDF2 en consola
- [ ] Medir tiempo de encryptData (debe ser < 100ms)
- [ ] Medir tiempo de onChange (debe ser < 5ms)
- [ ] Corregir detectEnvironment() para usar import.meta.env.MODE
- [ ] Agregar logging detallado de configuración
- [ ] Reducir iteraciones en development si es necesario (temporal)
- [ ] Verificar que inputs sean fluidos después del fix
- [ ] Planificar implementación de Web Workers (Sprint 2)
- [ ] Documentar solución final

---

**Siguiente Paso:** Ejecutar diagnóstico (Paso 1) y reportar resultados
**Tiempo Estimado de Resolución:** 10-15 minutos (fix inmediato)
**Solución Definitiva:** Web Workers (Sprint 2, 6-8 horas)
