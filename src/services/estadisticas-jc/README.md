# Servicios de Estadísticas de Justicia Cívica

Servicios para obtener estadísticas de Justicia Cívica con granularidad diaria, mensual y anual.

## Estructura

```
src/services/estadisticas-jc/
├── get-jc.service.ts    # Servicio principal de estadísticas JC
├── index.ts             # Barrel exports
└── README.md            # Esta documentación
```

## Servicios Disponibles

### 1. getJusticiaCivicaDiaria

Obtiene estadísticas de Justicia Cívica para un día específico.

**Endpoint:** `GET /api/estadisticas/getJusticiaCivicaDiaria/?anio=2025&mes=10&dia=10`

#### Uso

```typescript
import { getJusticiaCivicaDiaria } from '@/services/estadisticas-jc';

// Consultar estadísticas del 10 de octubre de 2025
const estadisticas = await getJusticiaCivicaDiaria({
  anio: 2025,
  mes: 10,
  dia: 10
});

console.log(estadisticas.data.totalConDetenido);  // 15
console.log(estadisticas.data.totalSinDetenido);  // 8
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `anio` | `number` | ✅ | Año a consultar (ej: 2025) |
| `mes` | `number` | ✅ | Mes a consultar (1-12) |
| `dia` | `number` | ✅ | Día a consultar (1-31) |

#### Respuesta

```json
{
  "status": true,
  "message": "Estadísticas obtenidas correctamente",
  "data": {
    "totalConDetenido": 15,
    "totalSinDetenido": 8
  }
}
```

---

### 2. getJusticiaCivicaMensual

Obtiene estadísticas de Justicia Cívica para un mes completo.

**Endpoint:** `GET /api/estadisticas/getJusticiaCivicaMensual/?anio=2025&mes=10`

#### Uso

```typescript
import { getJusticiaCivicaMensual } from '@/services/estadisticas-jc';

// Consultar estadísticas de octubre 2025
const estadisticas = await getJusticiaCivicaMensual({
  anio: 2025,
  mes: 10
});

console.log(estadisticas.data.totalConDetenido);  // 420
console.log(estadisticas.data.totalSinDetenido);  // 180
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `anio` | `number` | ✅ | Año a consultar (ej: 2025) |
| `mes` | `number` | ✅ | Mes a consultar (1-12) |

#### Respuesta

```json
{
  "status": true,
  "message": "Estadísticas mensuales obtenidas correctamente",
  "data": {
    "totalConDetenido": 420,
    "totalSinDetenido": 180
  }
}
```

---

### 3. getJusticiaCivicaAnual

Obtiene estadísticas de Justicia Cívica para un año completo.

**Endpoint:** `GET /api/estadisticas/getJusticiaCivicaAnual/?anio=2025`

#### Uso

```typescript
import { getJusticiaCivicaAnual } from '@/services/estadisticas-jc';

// Consultar estadísticas del año 2025
const estadisticas = await getJusticiaCivicaAnual({
  anio: 2025
});

console.log(estadisticas.data.totalConDetenido);  // 5040
console.log(estadisticas.data.totalSinDetenido);  // 2160
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `anio` | `number` | ✅ | Año a consultar (ej: 2025) |

#### Respuesta

```json
{
  "status": true,
  "message": "Estadísticas anuales obtenidas correctamente",
  "data": {
    "totalConDetenido": 5040,
    "totalSinDetenido": 2160
  }
}
```

---

## Interfaces

### RespuestaJC

Respuesta compartida por todos los endpoints de JC.

```typescript
interface RespuestaJC {
  status: boolean;    // Indica si la petición fue exitosa
  message: string;    // Mensaje descriptivo
  data: {
    totalConDetenido: number;   // Total de casos con detenido
    totalSinDetenido: number;   // Total de casos sin detenido
  };
}
```

### ParamsJCDiaria

```typescript
interface ParamsJCDiaria {
  anio: number;   // Año (ej: 2025)
  mes: number;    // Mes (1-12)
  dia: number;    // Día (1-31)
}
```

### ParamsJCMensual

```typescript
interface ParamsJCMensual {
  anio: number;   // Año (ej: 2025)
  mes: number;    // Mes (1-12)
}
```

### ParamsJCAnual

```typescript
interface ParamsJCAnual {
  anio: number;   // Año (ej: 2025)
}
```

---

## Patrón de Implementación

Todos los servicios siguen el patrón establecido en el proyecto:

1. **HttpHelper** - Peticiones HTTP con retry y timeout automático
2. **Logging estructurado** - `logInfo` y `logError` para trazabilidad
3. **TypeScript completo** - Interfaces tipadas con validación
4. **Manejo de errores robusto** - Try/catch con mensajes descriptivos
5. **JSDoc detallado** - Documentación inline para cada función

---

## Ejemplo de Integración en Componente

### Hook personalizado

```typescript
import { useState, useCallback } from 'react';
import {
  getJusticiaCivicaDiaria,
  getJusticiaCivicaMensual,
  getJusticiaCivicaAnual
} from '@/services/estadisticas-jc';
import type { RespuestaJC } from '@/interfaces/estadisticas-jc';
import { showError } from '@/helper/notification/notification.helper';

export const useEstadisticasJC = () => {
  const [loading, setLoading] = useState(false);
  const [estadisticas, setEstadisticas] = useState<RespuestaJC | null>(null);

  const obtenerDiaria = useCallback(async (
    anio: number,
    mes: number,
    dia: number
  ) => {
    setLoading(true);
    try {
      const data = await getJusticiaCivicaDiaria({ anio, mes, dia });
      setEstadisticas(data);
      return data;
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Error al obtener estadísticas diarias'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerMensual = useCallback(async (
    anio: number,
    mes: number
  ) => {
    setLoading(true);
    try {
      const data = await getJusticiaCivicaMensual({ anio, mes });
      setEstadisticas(data);
      return data;
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Error al obtener estadísticas mensuales'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerAnual = useCallback(async (anio: number) => {
    setLoading(true);
    try {
      const data = await getJusticiaCivicaAnual({ anio });
      setEstadisticas(data);
      return data;
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Error al obtener estadísticas anuales'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    estadisticas,
    obtenerDiaria,
    obtenerMensual,
    obtenerAnual
  };
};
```

### Componente de ejemplo

```typescript
import { useEffect } from 'react';
import { useEstadisticasJC } from './hooks/useEstadisticasJC';

export const EstadisticasJCPanel = () => {
  const { loading, estadisticas, obtenerMensual } = useEstadisticasJC();

  useEffect(() => {
    // Obtener estadísticas del mes actual al montar
    const hoy = new Date();
    obtenerMensual(hoy.getFullYear(), hoy.getMonth() + 1);
  }, [obtenerMensual]);

  if (loading) {
    return <div>Cargando estadísticas...</div>;
  }

  if (!estadisticas) {
    return <div>No hay datos disponibles</div>;
  }

  return (
    <div className="estadisticas-jc-panel">
      <h2>Estadísticas de Justicia Cívica</h2>
      <div className="estadisticas-grid">
        <div className="card">
          <h3>Con Detenido</h3>
          <p className="total">{estadisticas.data.totalConDetenido}</p>
        </div>
        <div className="card">
          <h3>Sin Detenido</h3>
          <p className="total">{estadisticas.data.totalSinDetenido}</p>
        </div>
        <div className="card">
          <h3>Total General</h3>
          <p className="total">
            {estadisticas.data.totalConDetenido + estadisticas.data.totalSinDetenido}
          </p>
        </div>
      </div>
    </div>
  );
};
```

---

## Manejo de Errores

```typescript
try {
  const estadisticas = await getJusticiaCivicaDiaria({
    anio: 2025,
    mes: 10,
    dia: 10
  });

  console.log('✅ Estadísticas obtenidas:', estadisticas.data);
} catch (error) {
  if (error.message.includes('No se encontraron')) {
    console.error('❌ No hay datos para esta fecha');
  } else if (error.message.includes('timeout')) {
    console.error('❌ Tiempo de espera agotado');
  } else {
    console.error('❌ Error desconocido:', error);
  }
}
```

---

## Códigos de Error Comunes

| Status | Descripción | Acción Recomendada |
|--------|-------------|-------------------|
| `200` | Éxito | Procesar datos normalmente |
| `400` | Parámetros inválidos | Validar formato de fecha |
| `404` | No hay datos para el período | Mostrar mensaje "Sin datos" |
| `500` | Error interno del servidor | Reintentar o contactar soporte |
| `TIMEOUT` | Tiempo de espera agotado | Verificar conexión de red |

---

## Configuración HTTP

El servicio utiliza la configuración estándar de HttpHelper:

```typescript
{
  baseURL: API_BASE_URL,      // Desde env.config.ts
  timeout: 10000,             // 10 segundos
  retries: 3,                 // 3 reintentos automáticos
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
}
```

---

## Logging

Todos los servicios registran logs estructurados:

### Logs de información
```
[INFO] EstadisticasJC: Consultando estadísticas diarias de JC
{
  anio: 2025,
  mes: 10,
  dia: 10
}
```

### Logs de éxito
```
[INFO] EstadisticasJC: Estadísticas diarias obtenidas exitosamente
{
  totalConDetenido: 15,
  totalSinDetenido: 8
}
```

### Logs de error
```
[ERROR] EstadisticasJC: Error al obtener estadísticas diarias (2025-10-10)
Error: Network error
```

---

## Validaciones Implementadas

### Validación de respuesta
- ✅ Verifica que `status` sea `true`
- ✅ Valida presencia de `data`
- ✅ Comprueba estructura de `totalConDetenido` y `totalSinDetenido`

### Validación de parámetros
- ⚠️ **Nota**: La validación de rangos (mes 1-12, día 1-31) debe implementarse en el componente

```typescript
// Ejemplo de validación en componente
const validarFecha = (anio: number, mes: number, dia?: number): boolean => {
  if (mes < 1 || mes > 12) {
    showError('El mes debe estar entre 1 y 12');
    return false;
  }

  if (dia !== undefined && (dia < 1 || dia > 31)) {
    showError('El día debe estar entre 1 y 31');
    return false;
  }

  if (anio < 2000 || anio > 2100) {
    showError('Año fuera de rango válido');
    return false;
  }

  return true;
};
```

---

## Notas Importantes

- ✅ **Autenticación automática**: HttpHelper incluye token de sesión
- ✅ **Retry automático**: 3 intentos con backoff exponencial
- ✅ **Timeout**: 10 segundos por defecto
- ✅ **Logging completo**: Todas las operaciones se registran
- ✅ **TypeScript estricto**: Validación en compile-time
- ⚠️ **Validación de fechas**: Implementar en componente (mes 1-12, día válido según mes)
- ⚠️ **Zona horaria**: Los datos se procesan según zona horaria del servidor

---

## Próximas Mejoras

- [ ] Agregar endpoint para rango de fechas personalizado
- [ ] Implementar caché de estadísticas para reducir llamadas al servidor
- [ ] Agregar comparativas entre períodos (mes actual vs. mes anterior)
- [ ] Implementar exportación de estadísticas a PDF/Excel
- [ ] Agregar gráficas de tendencias temporales
- [ ] Implementar filtros adicionales (por zona, turno, etc.)

---

## Soporte

Para problemas con este servicio:

1. Verificar logs en consola del navegador
2. Revisar estado de la conexión con el servidor
3. Validar que el token de autenticación esté presente
4. Contactar al equipo de backend si el problema persiste

**Módulo de logging**: `EstadisticasJC`
**Ruta base**: `/api/estadisticas`
