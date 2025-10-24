# 🔒 Sanitización de Logs - Componente Heatmap

**Versión:** 1.0.0
**Fecha:** 2025-01-24
**Prioridad:** CRÍTICA - Seguridad y Privacidad

---

## 📋 Resumen

Este documento describe el sistema de sanitización de coordenadas geográficas implementado en el componente Heatmap para proteger la privacidad del usuario y cumplir con regulaciones de protección de datos (GDPR, LFPDP).

---

## 🚨 Problema Identificado

**ANTES DE LA SANITIZACIÓN:**

Los logs del componente exponían coordenadas exactas del usuario:

```typescript
// ❌ VULNERABLE - Coordenadas exactas en logs
logInfo('useGeolocation', 'Ubicación obtenida', {
  latitude: 19.432608,  // ← Ubicación exacta (precisión ~1 metro)
  longitude: -99.133209
});

// Resultado en DevTools:
// [INFO] useGeolocation: Ubicación obtenida
// Data: { latitude: 19.432608, longitude: -99.133209, accuracy: 10 }
```

**Riesgos:**
- 🔴 **Violación de privacidad**: Ubicación exacta del usuario accesible en logs
- 🔴 **GDPR Non-Compliance**: Datos personales sin consentimiento explícito
- 🔴 **Rastreo de usuarios**: Coordenadas pueden crear perfiles de movimiento
- 🔴 **Exposición de domicilios**: Coordenadas revelan dirección de usuario
- 🔴 **Logs accesibles**: DevTools, Sentry, LogRocket, archivos de log

---

## ✅ Solución Implementada

### **Helper de Sanitización**

**Archivo:** `src/helper/security/security.helper.ts`

```typescript
/**
 * Sanitiza coordenadas geográficas para logging seguro
 * Convierte coordenadas exactas a área aproximada (~10km precisión)
 *
 * @param lat - Latitud (-90 a 90)
 * @param lng - Longitud (-180 a 180)
 * @returns Objeto con datos sanitizados para logging
 */
public sanitizeCoordinatesForLog(lat: number, lng: number): {
  approximateArea: string;
  precision: string;
  hasCoordinates: boolean;
  validRange: boolean;
} {
  // Validar que las coordenadas estén en rango válido
  const validLat = !isNaN(lat) && lat >= -90 && lat <= 90;
  const validLng = !isNaN(lng) && lng >= -180 && lng <= 180;
  const validRange = validLat && validLng;

  if (!validRange) {
    return {
      approximateArea: 'Invalid coordinates',
      precision: 'N/A',
      hasCoordinates: false,
      validRange: false
    };
  }

  // Redondear a 1 decimal (~10km de precisión)
  // Esto oculta la ubicación exacta pero mantiene contexto útil para debugging
  const approxLat = lat.toFixed(1);
  const approxLng = lng.toFixed(1);

  return {
    approximateArea: `${approxLat}, ${approxLng}`,
    precision: '~10km',
    hasCoordinates: true,
    validRange: true
  };
}
```

**Export:**
```typescript
export const sanitizeCoordinatesForLog = (lat: number, lng: number) =>
  securityHelper.sanitizeCoordinatesForLog(lat, lng);
```

---

## 📊 Niveles de Precisión

| Decimales | Precisión | Uso |
|-----------|-----------|-----|
| 0 | ~111 km | ❌ Muy impreciso |
| 1 | **~10 km** | ✅ **IMPLEMENTADO** - Contexto sin revelar ubicación exacta |
| 2 | ~1 km | ⚠️ Puede revelar barrio |
| 3 | ~100 m | ⚠️ Puede revelar manzana |
| 4+ | < 10 m | 🔴 **PROHIBIDO** - Revela ubicación exacta |

**Ejemplo:**
```
Coordenadas exactas: 19.432608, -99.133209
Sanitizadas:         19.4, -99.1 (~10km de radio)

Resultado: Ciudad de México, área general
NO revela: Calle, edificio, domicilio específico
```

---

## 🔧 Implementación en Código

### **1. useGeolocation.ts** ✅ IMPLEMENTADO

```typescript
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';

const coords = {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude
};

// ✅ Sanitizar antes de loggear
const sanitizedLocation = sanitizeCoordinatesForLog(coords.latitude, coords.longitude);

logInfo(MODULE_NAME, 'Ubicación obtenida exitosamente', {
  ...sanitizedLocation,           // { approximateArea: "19.4, -99.1", precision: "~10km", ... }
  accuracy: position.coords.accuracy  // OK: metadata no sensible
});
```

**Resultado en logs:**
```
[INFO] useGeolocation: Ubicación obtenida exitosamente
Data: {
  approximateArea: "19.4, -99.1",
  precision: "~10km",
  hasCoordinates: true,
  validRange: true,
  accuracy: 10
}
```

---

### **2. useHeatmap.ts** ✅ IMPLEMENTADO

```typescript
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';

const fetchCenterAddress = useCallback(async (lat: number, lng: number) => {
  try {
    setCenterAddressLoading(true);
    const address = await getSimpleAddress(lat, lng);
    setCenterAddress(address);

    // ✅ Sanitizar coordenadas antes de loggear
    const sanitizedLocation = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Dirección del centro obtenida', {
      ...sanitizedLocation,
      address  // OK: Dirección textual ya es pública en UI
    });
  } catch (error) {
    logError(MODULE_NAME, error as Error, 'Error obteniendo dirección del centro');
    setCenterAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  } finally {
    setCenterAddressLoading(false);
  }
}, []);
```

---

### **3. reverse-geocoding.service.ts** ✅ IMPLEMENTADO

```typescript
import { sanitizeCoordinatesForLog } from '../../../../../../helper/security/security.helper';

export const getReverseGeocoding = async (
  lat: number,
  lng: number
): Promise<I_ReverseGeocodingResult> => {
  try {
    // ✅ Sanitizar antes de loggear
    const sanitizedLocation = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Iniciando geocoding reverso', sanitizedLocation);

    // ... petición API

    // ✅ Sanitizar al loggear éxito
    const sanitizedLocationSuccess = sanitizeCoordinatesForLog(lat, lng);
    logInfo(MODULE_NAME, 'Geocoding reverso exitoso', {
      ...sanitizedLocationSuccess,
      address: result.displayName
    });

    return result;
  } catch (error) {
    logError(MODULE_NAME, error as Error, 'Error en geocoding reverso');
    // ...
  }
};
```

---

## ✅ Validación

### **Checklist de Seguridad**

- [x] ✅ `useGeolocation.ts:85` - Coordenadas sanitizadas
- [x] ✅ `useHeatmap.ts:160` - Coordenadas sanitizadas
- [x] ✅ `reverse-geocoding.service.ts:67` - Coordenadas sanitizadas
- [x] ✅ `reverse-geocoding.service.ts:106` - Coordenadas sanitizadas
- [x] ✅ No hay coordenadas exactas en ningún `logInfo`, `logDebug`, `logError`

### **Verificación Manual**

**Pasos:**
1. Abrir aplicación en modo desarrollo
2. Abrir DevTools → Console
3. Activar Heatmap
4. Aceptar permiso de geolocalización
5. Mover el mapa
6. Buscar logs en console

**Buscar:**
- ❌ `latitude: 19.432608` (coordenadas exactas)
- ❌ `lat: 19.432608`
- ❌ `lng: -99.133209`
- ✅ `approximateArea: "19.4, -99.1"` (sanitizadas)
- ✅ `precision: "~10km"`

---

## 📖 Buenas Prácticas

### **SIEMPRE Sanitizar:**

```typescript
// ✅ CORRECTO
const sanitized = sanitizeCoordinatesForLog(lat, lng);
logInfo('MODULE', 'Mensaje', sanitized);

// ✅ CORRECTO - Con datos adicionales
const sanitized = sanitizeCoordinatesForLog(lat, lng);
logInfo('MODULE', 'Mensaje', {
  ...sanitized,
  additionalData: 'value'
});
```

### **NUNCA Loggear Coordenadas Exactas:**

```typescript
// ❌ PROHIBIDO
logInfo('MODULE', 'Mensaje', { lat, lng });

// ❌ PROHIBIDO
logDebug('MODULE', 'Coordenadas del usuario', {
  latitude: user.lat,
  longitude: user.lng
});

// ❌ PROHIBIDO
console.log('User location:', lat, lng);
```

---

## 🔍 Casos Especiales

### **1. Logs de Debug con Coordenadas de Clusters**

**Archivo:** `get-coordenadas-mapa-calor.service.ts`

**Situación:** Loggea coordenadas de clusters obtenidos del servidor (NO del usuario).

**Análisis:**
- ✅ **Permitido en DEBUG**: Solo activo en desarrollo
- ✅ **Datos agregados**: Coordenadas de clusters, no de usuarios individuales
- ⚠️ **Recomendación**: Considerar sanitizar si los clusters contienen pocas ubicaciones

**Ejemplo actual:**
```typescript
// Logs de DEBUG con coordenadas de clusters (servidor)
logDebug(MODULE_NAME, 'Muestra de coordenadas (primeras 5)', {
  sampleSize: sampleCoordinates.length,
  coordinates: sampleCoordinates // ← Array de clusters del servidor
});
```

**Recomendación Futura:**
Si los clusters contienen pocas ubicaciones (< 10 IPH), considerar sanitizar:

```typescript
const sanitizedSample = sampleCoordinates.map(coord => ({
  ...coord,
  latitud: parseFloat(coord.latitud.toFixed(2)),  // ~1km precisión
  longitud: parseFloat(coord.longitud.toFixed(2))
}));

logDebug(MODULE_NAME, 'Muestra de coordenadas (primeras 5)', {
  sampleSize: sanitizedSample.length,
  coordinates: sanitizedSample
});
```

---

### **2. Coordenadas en Fallback de Error**

**Archivo:** `useHeatmap.ts:166`

```typescript
// Fallback cuando falla obtener dirección
setCenterAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
```

**Análisis:**
- ⚠️ **Visible en UI**: Esto se muestra al usuario en la interfaz
- ✅ **Aceptable**: Es el centro del MAPA (visible públicamente), no ubicación del usuario
- ✅ **4 decimales**: ~10m precisión, razonable para centro del mapa

**NO requiere cambio** porque:
1. Son coordenadas del centro del mapa (visible en UI)
2. NO son coordenadas del usuario
3. Se usa solo como fallback visual

---

## 📚 Referencias

### **Regulaciones de Privacidad:**
- **GDPR (EU)**: General Data Protection Regulation
  - Artículo 9: Datos de geolocalización como "datos personales"
  - Requiere consentimiento explícito y minimización de datos

- **LFPDP (México)**: Ley Federal de Protección de Datos Personales
  - Artículo 3, fracción VI: Datos personales sensibles
  - Artículo 8: Consentimiento expreso

### **Estándares Técnicos:**
- **OWASP**: Logging sensitive data
  - https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

- **ISO 27001**: Information Security Management
  - Control A.18.1.3: Protection of records

---

## 🛠️ Mantenimiento

### **Al Agregar Nuevos Logs con Coordenadas:**

1. **SIEMPRE** importar helper:
   ```typescript
   import { sanitizeCoordinatesForLog } from '@/helper/security/security.helper';
   ```

2. **SIEMPRE** sanitizar antes de loggear:
   ```typescript
   const sanitized = sanitizeCoordinatesForLog(lat, lng);
   logInfo('MODULE', 'Message', sanitized);
   ```

3. **Auditar** periódicamente:
   ```bash
   # Buscar logs con coordenadas sin sanitizar
   grep -r "logInfo.*lat.*lng" src/
   grep -r "logDebug.*latitude.*longitude" src/
   ```

---

## ✅ Resultado Final

### **Logs ANTES vs DESPUÉS:**

**ANTES (VULNERABLE):**
```
[INFO] useGeolocation: Ubicación obtenida exitosamente
Data: {
  latitude: 19.432608,   ← 🔴 Ubicación exacta
  longitude: -99.133209, ← 🔴 Revela domicilio
  accuracy: 10
}
```

**DESPUÉS (SEGURO):**
```
[INFO] useGeolocation: Ubicación obtenida exitosamente
Data: {
  approximateArea: "19.4, -99.1",  ← ✅ Área general (~10km)
  precision: "~10km",               ← ✅ Contexto útil
  hasCoordinates: true,             ← ✅ Metadata
  validRange: true,                 ← ✅ Validación
  accuracy: 10                      ← ✅ Metadata no sensible
}
```

---

## 📞 Contacto

**Para preguntas sobre privacidad y seguridad:**
- Email: security@iph.gob.mx
- Slack: #security-team
- Documentación: `/docs/SECURITY.md`

---

**Última actualización:** 2025-01-24
**Versión:** 1.0.0
**Aprobado por:** Equipo de Seguridad IPH
