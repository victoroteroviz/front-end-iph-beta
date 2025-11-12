# 📦 GUÍA DE MIGRACIÓN - ENCRYPT HELPER v2.0

**Última actualización:** 2025-01-31
**Versión Objetivo:** 2.0.0
**Versión Legacy:** < 2.0.0

---

## 📋 ÍNDICE

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Breaking Changes](#breaking-changes)
3. [¿Necesito Migrar?](#necesito-migrar)
4. [Escenarios de Migración](#escenarios-de-migración)
5. [Migración Paso a Paso](#migración-paso-a-paso)
6. [Scripts de Migración](#scripts-de-migración)
7. [Testing Post-Migración](#testing-post-migración)
8. [Rollback Plan](#rollback-plan)
9. [FAQ de Migración](#faq-de-migración)
10. [Soporte](#soporte)

---

## 🎯 RESUMEN DE CAMBIOS

### **¿Qué cambió en v2.0?**

| Componente | v1.x (Legacy) | v2.0 (Nueva) | Breaking Change |
|------------|---------------|--------------|-----------------|
| **Passphrase** | Predecible | CSPRNG (segura) | ❌ No |
| **Salt** | Fijo | Único por operación | ✅ **SÍ** |
| **EncryptionResult** | Sin campo `salt` | Con campo `salt` requerido | ✅ **SÍ** |
| **Cache Keys** | Plaintext passphrase | SHA-256 hash | ❌ No |
| **PBKDF2 Iterations** | 10k/100k | 100k/600k | ❌ No (compatible) |
| **Production Validation** | Sin validación | Error bloqueante | ❌ No (mejora) |

### **¿Por qué migrar?**

✅ **Seguridad mejorada:** 6 vulnerabilidades críticas eliminadas (CVSS 47.1 → 0)
✅ **Cumplimiento:** OWASP 2024 y NIST SP 800-63B compliant
✅ **Resistencia:** Protección contra rainbow table attacks y brute force
✅ **Future-proof:** Arquitectura moderna y escalable

---

## 🚨 BREAKING CHANGES

### **1. EncryptionResult - Campo `salt` Requerido**

**❌ Legacy (v1.x):**
```typescript
interface EncryptionResult {
  encrypted: string;
  iv: string;
  algorithm: string;
  timestamp: number;
}
```

**✅ Nueva (v2.0):**
```typescript
interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string; // ← NUEVO CAMPO REQUERIDO
  algorithm: string;
  timestamp: number;
}
```

**Impacto:**
- Datos encriptados con v1.x **NO pueden ser desencriptados con v2.0**
- Intentar desencriptar lanzará error: `"Datos de encriptación incompletos (falta salt)"`
- Requiere re-encriptación o migración manual

### **2. deriveKey() - Retorno Cambiado**

**❌ Legacy (v1.x):**
```typescript
private async deriveKey(passphrase: string): Promise<CryptoKey>
```

**✅ Nueva (v2.0):**
```typescript
private async deriveKey(
  passphrase: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }>
```

**Impacto:**
- Código que use directamente `deriveKey()` necesita actualización
- La mayoría de usuarios NO se ven afectados (método privado)

---

## 🤔 ¿NECESITO MIGRAR?

### **Test Rápido:**

```typescript
// 1. Verificar datos almacenados
const stored = sessionStorage.getItem('userData');
if (stored) {
  const parsed = JSON.parse(stored);

  if (!parsed.salt) {
    console.error('⚠️ DATOS LEGACY DETECTADOS - REQUIERE MIGRACIÓN');
    // Ver sección "Migración Paso a Paso"
  } else {
    console.log('✅ Datos compatibles con v2.0');
  }
}

// 2. Verificar versión del helper
const encryptHelper = EncryptHelper.getInstance();
console.log('Versión:', encryptHelper.getVersion?.()); // v2.0+
```

### **Escenarios:**

| Escenario | ¿Necesita Migración? | Acción Requerida |
|-----------|----------------------|------------------|
| **App nueva** (sin datos previos) | ❌ NO | Ninguna - usar v2.0 directamente |
| **Solo sessionStorage** (datos temporales) | ❌ NO | Re-login natural resuelve el problema |
| **localStorage** con datos críticos | ✅ **SÍ** | Migración manual requerida |
| **Backend** almacena hashes de passwords | ⚠️ PARCIAL | Rehashing en próximo login |
| **Datos en DB** encriptados | ✅ **SÍ** | Migración en lote o incremental |

---

## 📂 ESCENARIOS DE MIGRACIÓN

### **ESCENARIO 1: Datos en sessionStorage (MÁS COMÚN)**

**✅ Solución:** **NO requiere migración.**

**Razón:** Los datos en sessionStorage son temporales y se eliminan al cerrar la pestaña.

**Implementación:**

```typescript
// En el login component o guard
async function handleLogin(credentials: Credentials) {
  // 1. Login normal
  const response = await loginService(credentials);

  // 2. Limpiar sessionStorage legacy (opcional)
  sessionStorage.clear(); // Elimina datos legacy

  // 3. Guardar nuevos datos con v2.0
  const encryptHelper = EncryptHelper.getInstance();
  const encrypted = await encryptHelper.encryptData(
    JSON.stringify(response.user)
  );

  sessionStorage.setItem('userData', JSON.stringify(encrypted));
}
```

**Timeline:** Inmediato (en próximo login)

---

### **ESCENARIO 2: Datos en localStorage (CRÍTICO)**

**⚠️ Solución:** **Requiere migración o re-encriptación.**

#### **Opción A: Regenerar Datos (Recomendada)**

```typescript
// En bootstrap de la aplicación (main.ts o App.tsx)
async function migrateLocalStorage() {
  const keys = ['userSettings', 'preferences', 'savedData']; // Tus keys

  for (const key of keys) {
    const stored = localStorage.getItem(key);
    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);

      // Detectar datos legacy (sin salt)
      if (!parsed.salt) {
        console.warn(`⚠️ Datos legacy detectados en ${key}`);

        // Eliminar datos legacy
        localStorage.removeItem(key);

        // Solicitar al usuario que reconfigure
        showNotification(
          'Se requiere reconfiguración de preferencias por actualización de seguridad'
        );
      }
    } catch (error) {
      console.error(`Error migrando ${key}:`, error);
    }
  }
}

// Ejecutar en bootstrap
if (import.meta.env.PROD) {
  await migrateLocalStorage();
}
```

#### **Opción B: Desencriptar y Re-encriptar (Compleja)**

**⚠️ ADVERTENCIA:** Solo funciona si tienes acceso a la passphrase legacy.

```typescript
// Requiere mantener temporalmente código legacy para desencriptar
async function reEncryptLocalStorage() {
  // 1. Desencriptar con código legacy (v1.x)
  const legacyData = await legacyDecrypt(stored);

  // 2. Re-encriptar con v2.0
  const encryptHelper = EncryptHelper.getInstance();
  const newEncrypted = await encryptHelper.encryptData(legacyData);

  // 3. Guardar en localStorage
  localStorage.setItem(key, JSON.stringify(newEncrypted));

  console.log(`✅ ${key} migrado exitosamente`);
}
```

**Timeline:** 1-2 semanas (requiere testing exhaustivo)

---

### **ESCENARIO 3: Passwords en Base de Datos**

**✅ Solución:** **Rehashing incremental en próximo login.**

**Razón:** Los hashes de passwords almacenan las iteraciones usadas. El helper automáticamente detecta si un hash necesita actualización.

#### **Implementación:**

```typescript
// En el flujo de login
async function handleLogin(username: string, password: string) {
  // 1. Verificar password (usa iteraciones almacenadas en el hash)
  const storedHash = await getUserHashFromDB(username);
  const encryptHelper = EncryptHelper.getInstance();

  const isValid = await encryptHelper.verifyPassword(password, storedHash);

  if (!isValid) {
    throw new Error('Password incorrecto');
  }

  // 2. Verificar si necesita rehashing (iteraciones viejas)
  const needsUpdate = encryptHelper.needsRehash(storedHash);

  if (needsUpdate) {
    // 3. Rehashear con nuevas iteraciones (600k)
    const newHash = await encryptHelper.hashPassword(password);

    // 4. Actualizar en DB
    await updateUserHashInDB(username, newHash);

    logInfo('Security', `Password rehashed para usuario ${username}`, {
      oldIterations: extractIterations(storedHash),
      newIterations: 600000
    });
  }

  // 5. Continuar con login normal
  return { success: true, user: userData };
}

// Helper para extraer iteraciones de hash almacenado
function extractIterations(storedHash: string): number {
  const parts = storedHash.split(':');
  return parseInt(parts[3], 10); // formato: hash:salt:algo:iterations
}
```

**Beneficios:**
- ✅ Sin downtime
- ✅ Migración transparente para usuarios
- ✅ Gradual (solo usuarios activos)
- ✅ Sin riesgo de pérdida de datos

**Timeline:** 30-90 días (todos los usuarios activos migrados)

---

### **ESCENARIO 4: Datos Encriptados en Base de Datos**

**⚠️ Solución:** **Migración en lote o incremental.**

#### **Opción A: Migración en Lote (Downtime)**

```typescript
// Script de migración (ejecutar en mantenimiento programado)
async function migrateAllEncryptedData() {
  const encryptHelper = EncryptHelper.getInstance();

  // 1. Obtener TODAS las filas con datos encriptados
  const records = await db.query(
    'SELECT id, encrypted_field FROM users WHERE encrypted_field IS NOT NULL'
  );

  console.log(`📊 Migrando ${records.length} registros...`);

  for (const record of records) {
    try {
      const encrypted = JSON.parse(record.encrypted_field);

      // 2. Verificar si es legacy (sin salt)
      if (!encrypted.salt) {
        // ❌ NO SE PUEDE DESENCRIPTAR SIN SALT ORIGINAL
        // Opciones:
        // - Marcar como inválido
        // - Solicitar re-input de usuario
        // - Eliminar si no es crítico

        await db.query(
          'UPDATE users SET encrypted_field = NULL, needs_reencryption = TRUE WHERE id = ?',
          [record.id]
        );

        console.warn(`⚠️ Registro ${record.id} marcado para re-input`);
      } else {
        // ✅ Datos v2.0 - no requieren migración
        console.log(`✅ Registro ${record.id} compatible`);
      }
    } catch (error) {
      console.error(`❌ Error migrando registro ${record.id}:`, error);
    }
  }

  console.log('✅ Migración completada');
}

// Ejecutar en ventana de mantenimiento
await migrateAllEncryptedData();
```

#### **Opción B: Migración Incremental (Sin Downtime)**

```typescript
// En cada acceso a datos encriptados
async function getEncryptedUserData(userId: string): Promise<UserData> {
  const record = await db.query('SELECT encrypted_field FROM users WHERE id = ?', [userId]);

  const encrypted = JSON.parse(record.encrypted_field);
  const encryptHelper = EncryptHelper.getInstance();

  // Verificar si es legacy
  if (!encrypted.salt) {
    // Solicitar al usuario que vuelva a ingresar los datos
    throw new MigrationRequiredError(
      'Por favor, actualice sus datos de seguridad'
    );
  }

  // Desencriptar normalmente
  const plaintext = await encryptHelper.decryptData(encrypted);
  return JSON.parse(plaintext);
}
```

**Timeline:** Depende del volumen de datos (días a semanas)

---

## 📝 MIGRACIÓN PASO A PASO

### **Fase 1: Pre-Migración (1-2 días)**

#### **1.1. Auditoría de Datos**

```bash
# Identificar dónde se almacenan datos encriptados
grep -r "encryptData\|decryptData" src/
grep -r "localStorage\|sessionStorage" src/
```

#### **1.2. Backup Completo**

```bash
# Backup de base de datos
pg_dump -h localhost -U user -d iph_db > backup_pre_migration.sql

# Backup de localStorage (manual - pedir a usuarios críticos)
# Usar herramienta: https://github.com/localForage/localForage
```

#### **1.3. Configurar Passphrase Persistente**

```bash
# Generar passphrase segura
openssl rand -base64 32 > .passphrase-prod

# Configurar en Secret Manager (AWS ejemplo)
aws secretsmanager create-secret \
  --name iph-frontend/encrypt-passphrase \
  --secret-string "$(cat .passphrase-prod)"

# Agregar a .env.production
echo "VITE_ENCRYPT_PASSPHRASE=$(cat .passphrase-prod)" >> .env.production
```

---

### **Fase 2: Migración (1 semana)**

#### **2.1. Deploy de v2.0**

```bash
# Actualizar dependencias
npm install

# Build con nueva configuración
npm run build

# Verificar que VITE_ENCRYPT_PASSPHRASE esté configurada
if [ -z "$VITE_ENCRYPT_PASSPHRASE" ]; then
  echo "❌ ERROR: VITE_ENCRYPT_PASSPHRASE no configurada"
  exit 1
fi

# Deploy
npm run deploy
```

#### **2.2. Monitorear Errores**

```typescript
// Agregar logging específico para migración
try {
  const decrypted = await encryptHelper.decryptData(encrypted);
  // Success
} catch (error) {
  if (error.message.includes('falta salt')) {
    logWarning('Migration', 'Datos legacy detectados', {
      userId: currentUser.id,
      timestamp: Date.now()
    });

    // Incrementar métrica
    metrics.increment('migration.legacy_data_detected');
  }

  throw error;
}
```

#### **2.3. Comunicación a Usuarios**

```
📧 Email/Notificación In-App:

Asunto: Actualización de Seguridad - Acción Requerida

Estimado usuario,

Hemos implementado mejoras de seguridad que requieren que actualices tus datos encriptados.

¿Qué debes hacer?
1. Cierra sesión completamente
2. Vuelve a iniciar sesión
3. Si tienes preferencias guardadas, es posible que necesites reconfigurarlas

¿Cuándo? En las próximas 48 horas.

Gracias por tu cooperación.
Equipo de Seguridad IPH
```

---

### **Fase 3: Post-Migración (1-2 semanas)**

#### **3.1. Verificación de Datos**

```typescript
// Script de verificación
async function verifyMigration() {
  const keys = ['userData', 'settings', 'preferences'];

  for (const key of keys) {
    const stored = sessionStorage.getItem(key);
    if (!stored) continue;

    const parsed = JSON.parse(stored);

    if (parsed.salt) {
      console.log(`✅ ${key}: Migrado correctamente`);
    } else {
      console.error(`❌ ${key}: Aún legacy`);
    }
  }
}
```

#### **3.2. Limpieza de Código Legacy**

```typescript
// Eliminar funciones legacy después de 30 días
// - generateDefaultPassphrase() (viejo)
// - Código de desencriptación legacy
// - Fallbacks temporales
```

#### **3.3. Métricas de Éxito**

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| % Usuarios migrados | 95% | [Medir] |
| Errores de desencriptación | < 1% | [Medir] |
| Tiempo promedio de migración | < 5 min | [Medir] |
| Tickets de soporte | < 10 | [Medir] |

---

## 🛠️ SCRIPTS DE MIGRACIÓN

### **Script 1: Detección de Datos Legacy**

```typescript
/**
 * Detecta y reporta datos legacy en storage
 */
async function detectLegacyData(): Promise<LegacyDataReport> {
  const report: LegacyDataReport = {
    localStorage: [],
    sessionStorage: [],
    totalLegacy: 0
  };

  // Revisar localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    try {
      const value = localStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed.encrypted && !parsed.salt) {
        report.localStorage.push({
          key,
          timestamp: parsed.timestamp || null,
          size: value.length
        });
        report.totalLegacy++;
      }
    } catch {
      // Ignorar datos no-JSON
    }
  }

  // Revisar sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;

    try {
      const value = sessionStorage.getItem(key);
      if (!value) continue;

      const parsed = JSON.parse(value);

      if (parsed.encrypted && !parsed.salt) {
        report.sessionStorage.push({
          key,
          timestamp: parsed.timestamp || null,
          size: value.length
        });
        report.totalLegacy++;
      }
    } catch {
      // Ignorar datos no-JSON
    }
  }

  return report;
}

// Usar en consola de desarrollo
detectLegacyData().then(report => {
  console.log('📊 Reporte de Datos Legacy:', report);

  if (report.totalLegacy > 0) {
    console.warn(`⚠️ ${report.totalLegacy} items legacy detectados`);
  } else {
    console.log('✅ Sin datos legacy');
  }
});
```

### **Script 2: Limpieza de Datos Legacy**

```typescript
/**
 * Elimina datos legacy de storage
 *
 * ⚠️ ADVERTENCIA: Datos serán eliminados permanentemente
 */
async function cleanLegacyData(options: { dryRun: boolean } = { dryRun: true }) {
  const report = await detectLegacyData();

  if (report.totalLegacy === 0) {
    console.log('✅ No hay datos legacy para limpiar');
    return;
  }

  console.log(`🗑️  Limpiando ${report.totalLegacy} items legacy...`);

  // localStorage
  for (const item of report.localStorage) {
    if (options.dryRun) {
      console.log(`[DRY RUN] Eliminaría localStorage['${item.key}']`);
    } else {
      localStorage.removeItem(item.key);
      console.log(`✅ Eliminado localStorage['${item.key}']`);
    }
  }

  // sessionStorage
  for (const item of report.sessionStorage) {
    if (options.dryRun) {
      console.log(`[DRY RUN] Eliminaría sessionStorage['${item.key}']`);
    } else {
      sessionStorage.removeItem(item.key);
      console.log(`✅ Eliminado sessionStorage['${item.key}']`);
    }
  }

  if (options.dryRun) {
    console.log('ℹ️  Ejecutar con { dryRun: false } para limpiar realmente');
  } else {
    console.log('✅ Limpieza completada');
  }
}

// Uso:
// 1. Verificar qué se eliminará (dry run)
await cleanLegacyData({ dryRun: true });

// 2. Eliminar realmente
await cleanLegacyData({ dryRun: false });
```

### **Script 3: Migración de Passwords en DB**

```typescript
/**
 * Script de migración para rehashear passwords con nuevas iteraciones
 *
 * Ejecutar: node scripts/migrate-passwords.ts
 */
import { EncryptHelper } from './src/helper/encrypt/encrypt.helper';

async function migratePasswords() {
  const encryptHelper = EncryptHelper.getInstance({ environment: 'production' });

  // Obtener todos los usuarios
  const users = await db.query('SELECT id, password_hash FROM users');

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const user of users) {
    try {
      // Verificar si necesita rehashing
      const needsUpdate = encryptHelper.needsRehash(user.password_hash);

      if (needsUpdate) {
        // ⚠️ NO PODEMOS REHASHEAR SIN EL PASSWORD ORIGINAL
        // Solo podemos marcarlo para rehashing en próximo login

        await db.query(
          'UPDATE users SET needs_password_rehash = TRUE WHERE id = ?',
          [user.id]
        );

        console.log(`⚠️ Usuario ${user.id} marcado para rehashing en próximo login`);
        migrated++;
      } else {
        console.log(`✅ Usuario ${user.id} ya tiene hash actual`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error con usuario ${user.id}:`, error);
      errors++;
    }
  }

  console.log('\n📊 Resumen de Migración:');
  console.log(`  Marcados para rehashing: ${migrated}`);
  console.log(`  Ya actualizados: ${skipped}`);
  console.log(`  Errores: ${errors}`);
}

migratePasswords().catch(console.error);
```

---

## 🧪 TESTING POST-MIGRACIÓN

### **Test Suite Completo:**

```typescript
describe('Migración v2.0', () => {
  describe('Datos Legacy', () => {
    it('debe rechazar datos legacy sin salt', async () => {
      const legacyData = {
        encrypted: 'base64-data',
        iv: 'base64-iv',
        // ❌ Sin salt
        algorithm: 'AES-GCM',
        timestamp: Date.now()
      };

      const helper = EncryptHelper.getInstance();

      await expect(helper.decryptData(legacyData)).rejects.toThrow(
        /incompletos.*salt/i
      );
    });

    it('debe detectar datos legacy correctamente', async () => {
      sessionStorage.setItem('legacy', JSON.stringify({
        encrypted: 'data',
        iv: 'iv'
        // Sin salt
      }));

      const report = await detectLegacyData();
      expect(report.sessionStorage).toHaveLength(1);
      expect(report.sessionStorage[0].key).toBe('legacy');
    });
  });

  describe('Datos v2.0', () => {
    it('debe encriptar y desencriptar correctamente', async () => {
      const helper = EncryptHelper.getInstance();
      const plaintext = 'Test data';

      const encrypted = await helper.encryptData(plaintext);

      // Verificar que tenga salt
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.salt).toHaveLength(44); // Base64 de 32 bytes

      // Desencriptar
      const decrypted = await helper.decryptData(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('debe generar salt único por operación', async () => {
      const helper = EncryptHelper.getInstance();
      const plaintext = 'Test data';

      const encrypted1 = await helper.encryptData(plaintext);
      const encrypted2 = await helper.encryptData(plaintext);

      // Mismo plaintext, diferentes salts
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
    });
  });

  describe('Passwords', () => {
    it('debe detectar hashes que necesitan rehashing', () => {
      const helper = EncryptHelper.getInstance({ environment: 'production' });

      // Hash viejo (10k iteraciones)
      const oldHash = 'hash:salt:SHA-256:10000';
      expect(helper.needsRehash(oldHash)).toBe(true);

      // Hash actual (600k iteraciones)
      const newHash = 'hash:salt:SHA-256:600000';
      expect(helper.needsRehash(newHash)).toBe(false);
    });

    it('debe verificar passwords con iteraciones viejas', async () => {
      // Password hasheado con 10k iteraciones (legacy)
      const password = 'test-password';
      const oldHelper = EncryptHelper.getInstance({
        environment: 'development',
        hashIterations: 10000
      });

      const hash = await oldHelper.hashPassword(password);

      // Verificar con helper actual (600k)
      const newHelper = EncryptHelper.getInstance({ environment: 'production' });
      const isValid = await newHelper.verifyPassword(
        password,
        `${hash.hash}:${hash.salt}:${hash.algorithm}:${hash.iterations}`
      );

      expect(isValid).toBe(true);
    });
  });
});
```

### **Tests Manuales:**

#### **Test 1: Login con Datos Nuevos**
1. Limpiar storage: `localStorage.clear(); sessionStorage.clear();`
2. Login normal
3. Verificar en DevTools: `sessionStorage.userData` debe tener campo `salt`

#### **Test 2: Detección de Legacy**
1. Ejecutar en consola: `detectLegacyData()`
2. Verificar output
3. Si hay legacy: ejecutar `cleanLegacyData({ dryRun: false })`

#### **Test 3: Rehashing de Passwords**
1. Login con cuenta de prueba
2. Verificar en logs: `"Password rehashed for user..."`
3. Verificar en DB: hash debe tener `600000` iteraciones

---

## 🔄 ROLLBACK PLAN

### **Si algo sale mal:**

#### **Opción 1: Rollback de Deploy (Recomendado)**

```bash
# Revertir a versión anterior
git revert HEAD
npm run build
npm run deploy

# O usar backup de build
cp -r backup/dist/ current/dist/
```

#### **Opción 2: Rollback de Base de Datos**

```bash
# Restaurar backup
psql -h localhost -U user -d iph_db < backup_pre_migration.sql
```

#### **Opción 3: Hotfix de Compatibilidad (Temporal)**

```typescript
// Agregar compatibilidad temporal con datos legacy
async function decryptDataWithFallback(encrypted: EncryptionResult): Promise<string> {
  try {
    // Intentar desencriptar con v2.0
    return await encryptHelper.decryptData(encrypted);
  } catch (error) {
    if (error.message.includes('falta salt')) {
      // Fallback a desencriptación legacy
      logWarning('Migration', 'Usando fallback legacy para desencriptar');
      return await legacyDecrypt(encrypted);
    }
    throw error;
  }
}
```

**⚠️ ADVERTENCIA:** Solo usar como último recurso. Resolver la causa raíz.

---

## ❓ FAQ DE MIGRACIÓN

### **Q1: ¿Puedo migrar gradualmente?**

**R:** SÍ. Los passwords se migran automáticamente en próximo login. Para otros datos, puedes implementar migración incremental.

### **Q2: ¿Qué pasa con usuarios inactivos?**

**R:** Usuarios inactivos mantendrán hashes legacy hasta su próximo login. Considera enviar email recordatorio después de 90 días.

### **Q3: ¿Puedo desencriptar datos legacy?**

**R:** NO, no de forma segura. Los datos legacy usaban salt fijo que ya no es accesible. Solución: Solicitar re-input de datos.

### **Q4: ¿La migración afecta la performance?**

**R:** Sí, mínimamente. Las operaciones de hash son ~200ms más lentas, pero prácticamente imperceptible para usuarios.

### **Q5: ¿Cuánto tarda la migración completa?**

**R:**
- sessionStorage: Inmediato (próximo login)
- Passwords: 30-90 días (todos los usuarios activos)
- localStorage: 1-2 semanas (depende de implementación)

### **Q6: ¿Hay downtime?**

**R:** NO. La migración puede hacerse sin downtime usando estrategia incremental.

### **Q7: ¿Qué hacer si un usuario reporta problemas?**

**R:**
1. Verificar logs de errores
2. Limpiar storage: `localStorage.clear(); sessionStorage.clear();`
3. Solicitar re-login
4. Si persiste: revisar configuración de passphrase

### **Q8: ¿Puedo volver a v1.x después?**

**R:** NO recomendado. Una vez que los datos están encriptados con v2.0 (con salt único), no pueden desencriptarse con v1.x.

### **Q9: ¿Los tests automáticos fallarán?**

**R:** Posiblemente. Actualiza mocks y fixtures para incluir campo `salt` en `EncryptionResult`.

### **Q10: ¿Debo notificar a los usuarios?**

**R:** SÍ, especialmente si tienen datos en localStorage. Enviar email/notificación 48h antes de la migración.

---

## 📞 SOPORTE

### **Durante la Migración:**

**Slack:** #migration-support
**Email:** migration@[empresa].com
**Hotline:** [Número de emergencia]

### **Documentación:**

- [SECURITY.md](./SECURITY.md) - Guía completa de seguridad
- [SPRINT1_CAMBIOS_SEC*.md](.) - Detalles técnicos de cambios
- [ENCRYPT_HELPER_PROJECT_README.md](./ENCRYPT_HELPER_PROJECT_README.md) - Documentación del proyecto

### **Responsables:**

- **Migration Lead:** [Nombre]
- **Security Officer:** [Nombre]
- **DevOps Lead:** [Nombre]

---

## ✅ CHECKLIST DE MIGRACIÓN

### **Pre-Migración:**
- [ ] Backup de base de datos creado
- [ ] Passphrase configurada en Secret Manager
- [ ] Variables de entorno actualizadas (.env.production)
- [ ] Tests de migración ejecutados exitosamente
- [ ] Comunicación a usuarios enviada (48h antes)
- [ ] Equipo de soporte notificado

### **Durante Migración:**
- [ ] Deploy de v2.0 completado
- [ ] Monitoreo de errores activo
- [ ] Logs de migración revisados
- [ ] Primeros usuarios migrados exitosamente
- [ ] Métricas de performance aceptables

### **Post-Migración:**
- [ ] 95%+ usuarios migrados
- [ ] Errores de desencriptación < 1%
- [ ] Tickets de soporte resueltos
- [ ] Código legacy eliminado (30 días después)
- [ ] Post-mortem completado
- [ ] Documentación actualizada

---

**Última actualización:** 2025-01-31
**Versión:** 1.0
**Sprint:** 1 - Seguridad Crítica
**Próxima revisión:** 2025-03-31
