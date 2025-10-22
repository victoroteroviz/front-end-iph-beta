# Utilidades de Estadísticas

**Versión:** 1.0.0
**Creado:** 2025-01-30
**Autor:** Claude Code

## 📋 Descripción

Conjunto de utilidades reutilizables extraídas del sistema mock de estadísticas para uso en producción. Estas funciones proporcionan lógica de negocio independiente de la fuente de datos (mock o API real).

## 🎯 Objetivo

Separar la lógica de transformación, validación y cálculo de estadísticas del código de servicios y mocks, siguiendo los principios SOLID, KISS y DRY establecidos en el proyecto.

## 📁 Estructura

```
src/utils/statistics/
├── transformations.util.ts    # Transformaciones de datos
├── validation.util.ts          # Validaciones y builders
├── index.ts                    # Barrel export
└── README.md                   # Documentación
```

## 🔧 Utilidades Disponibles

### **1. Transformaciones (`transformations.util.ts`)**

#### **Ordenamiento**
```typescript
import { sortByIphCountDesc, sortByIphCountAsc, sortByNameAlpha } from '@/utils/statistics';

// Ordenar por IPH count descendente
const usuarios = [{ nombre_completo: 'Juan', total_iphs: 10 }, { nombre_completo: 'Ana', total_iphs: 20 }];
sortByIphCountDesc(usuarios);
// → [{ nombre: 'Ana', total_iphs: 20 }, { nombre: 'Juan', total_iphs: 10 }]

// Ordenar alfabéticamente
sortByNameAlpha(usuarios);
// → [{ nombre: 'Ana', total_iphs: 20 }, { nombre: 'Juan', total_iphs: 10 }]
```

#### **Cálculo de Estadísticas**
```typescript
import { calculateStatisticsSummary, calculateUserPercentile } from '@/utils/statistics';

const usuarios = [
  { nombre_completo: 'Juan', total_iphs: 45 },
  { nombre_completo: 'Ana', total_iphs: 30 }
];

const stats = calculateStatisticsSummary(usuarios);
// → {
//   totalIphs: 75,
//   promedioIphs: 37.5,
//   maxIphs: 45,
//   minIphs: 30,
//   totalUsuarios: 2
// }

const percentil = calculateUserPercentile(usuarios[0], usuarios);
// → 50 (Juan está en el percentil 50)
```

#### **Agrupación y Filtrado**
```typescript
import { groupByIphRange, filterByMinIphs, getTopPerformers } from '@/utils/statistics';

// Agrupar por rangos
const grouped = groupByIphRange(usuarios, 10);
// → { '40-49': [{ nombre: 'Juan', total_iphs: 45 }], ... }

// Filtrar por mínimo
const filtrados = filterByMinIphs(usuarios, 35);
// → [{ nombre: 'Juan', total_iphs: 45 }]

// Top performers
const top3 = getTopPerformers(usuarios, 3);
// → Array con los 3 usuarios con más IPHs
```

#### **Mapeo de Datos**
```typescript
import { addPercentageContribution } from '@/utils/statistics';

const usuarios = [
  { nombre_completo: 'Juan', total_iphs: 40 },
  { nombre_completo: 'Ana', total_iphs: 60 }
];

const conPorcentaje = addPercentageContribution(usuarios);
// → [
//   { nombre: 'Juan', total_iphs: 40, percentage: 40 },
//   { nombre: 'Ana', total_iphs: 60, percentage: 60 }
// ]
```

---

### **2. Validaciones (`validation.util.ts`)**

#### **Validación de Fechas**
```typescript
import { isValidMonth, isValidYear, normalizeMonth, normalizeYear } from '@/utils/statistics';

// Validar mes
isValidMonth(5);  // → true
isValidMonth(13); // → false

// Validar año
isValidYear(2024); // → true
isValidYear(2019); // → false (menor al mínimo del sistema)

// Normalizar valores
normalizeMonth(13);  // → 1 (ajusta al mes actual)
normalizeYear(2030); // → 2025 (ajusta al año actual)
```

#### **Validación de Paginación**
```typescript
import { validatePagination, calculatePaginationIndices, paginateArray } from '@/utils/statistics';

// Validar parámetros
const validated = validatePagination(1, 10);
// → { page: 1, limit: 10, isValid: true }

// Calcular índices
const indices = calculatePaginationIndices(2, 10);
// → { startIndex: 10, endIndex: 20 }

// Aplicar paginación
const usuarios = [/* 100 usuarios */];
const pagina1 = paginateArray(usuarios, 1, 10);
// → primeros 10 usuarios
```

#### **Builders de Query Params**
```typescript
import { buildIphCountQueryParams, buildVariationQueryParams, buildQueryString } from '@/utils/statistics';

// Construir parámetros validados
const params = buildIphCountQueryParams({ mes: 5, anio: 2024, page: 1, limit: 10 });
// → { mes: 5, anio: 2024, page: 1, limit: 10 }

// Parámetros de variación
const variationParams = buildVariationQueryParams(2024, 2023);
// → { year: 2024, compareTo: 2023 }

// Query string
const queryString = buildQueryString({ mes: 5, anio: 2024 });
// → "mes=5&anio=2024"
```

#### **Validación de Datos**
```typescript
import { isValidUsuarioIphCount, sanitizeUsuarioIphCountArray, isValidApiResponse } from '@/utils/statistics';

// Validar objeto individual
isValidUsuarioIphCount({ nombre_completo: 'Juan', total_iphs: 10 });
// → true

// Sanitizar array
const datos = [
  { nombre_completo: 'Juan', total_iphs: 10 },
  { nombre_completo: '', total_iphs: 5 }, // inválido
];
const limpios = sanitizeUsuarioIphCountArray(datos);
// → [{ nombre_completo: 'Juan', total_iphs: 10 }]

// Validar respuesta de API
const response = { data: [], total: 0, page: 1, limit: 10 };
isValidApiResponse(response); // → true
```

---

## 📊 Constantes Exportadas

```typescript
import {
  VALID_MONTH_RANGE,
  PAGINATION_LIMITS,
  MIN_YEAR,
  getMaxYear
} from '@/utils/statistics';

// Rangos de meses válidos
console.log(VALID_MONTH_RANGE); // → { min: 1, max: 12 }

// Límites de paginación
console.log(PAGINATION_LIMITS);
// → {
//   minPage: 1,
//   maxPage: 10000,
//   minLimit: 1,
//   maxLimit: 100,
//   defaultLimit: 10
// }

// Año mínimo del sistema
console.log(MIN_YEAR); // → 2020

// Año máximo dinámico
console.log(getMaxYear()); // → año actual + 1
```

---

## 🔄 Migración desde Mock

### **Antes (en mock):**
```typescript
// src/mock/statistics/estadisticas-usuarios.mock.ts
export const getMockIphCountByUsers = async (mes, anio, page, limit) => {
  // Ordenar
  filteredData.sort((a, b) => b.total_iphs - a.total_iphs);

  // Paginar
  const startIndex = (page - 1) * limit;
  const paginatedData = filteredData.slice(startIndex, startIndex + limit);

  return { data: paginatedData, total, page, limit };
};
```

### **Después (con utils):**
```typescript
// En cualquier servicio o componente
import { sortByIphCountDesc, paginateArray } from '@/utils/statistics';

export const getIphCountByUsers = async (mes, anio, page, limit) => {
  const data = await fetchFromAPI(mes, anio);

  // Reutilizar lógica
  sortByIphCountDesc(data);
  const paginatedData = paginateArray(data, page, limit);

  return { data: paginatedData, total: data.length, page, limit };
};
```

---

## ✅ Casos de Uso

### **1. Servicio de API Real**
```typescript
import { buildIphCountQueryParams, sanitizeUsuarioIphCountArray } from '@/utils/statistics';

export const getIphCountByUsers = async (mes, anio, page, limit) => {
  // Validar y normalizar parámetros
  const params = buildIphCountQueryParams({ mes, anio, page, limit });

  const response = await http.get(`/api/estadisticas?${buildQueryString(params)}`);

  // Sanitizar respuesta
  const cleanData = sanitizeUsuarioIphCountArray(response.data.data);

  return {
    ...response.data,
    data: cleanData
  };
};
```

### **2. Componente de Estadísticas**
```typescript
import { calculateStatisticsSummary, getTopPerformers } from '@/utils/statistics';

const useEstadisticas = () => {
  const [usuarios, setUsuarios] = useState([]);

  const stats = useMemo(() => calculateStatisticsSummary(usuarios), [usuarios]);
  const top10 = useMemo(() => getTopPerformers(usuarios, 10), [usuarios]);

  return { stats, top10 };
};
```

### **3. Mock Mejorado**
```typescript
import { sortByIphCountDesc, paginateArray } from '@/utils/statistics';

export const getMockIphCountByUsers = async (mes, anio, page, limit) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simular delay

  let data = [...mockUsuariosIphCount];
  sortByIphCountDesc(data);
  const paginatedData = paginateArray(data, page, limit);

  return { data: paginatedData, total: data.length, page, limit };
};
```

---

## 🧪 Testing

### **Ejemplos de Pruebas**
```typescript
import { calculateStatisticsSummary, validatePagination, normalizeMonth } from '@/utils/statistics';

describe('Statistics Utils', () => {
  test('calculateStatisticsSummary - datos válidos', () => {
    const usuarios = [
      { nombre_completo: 'Juan', total_iphs: 45 },
      { nombre_completo: 'Ana', total_iphs: 30 }
    ];
    const stats = calculateStatisticsSummary(usuarios);

    expect(stats.totalIphs).toBe(75);
    expect(stats.promedioIphs).toBe(37.5);
    expect(stats.maxIphs).toBe(45);
    expect(stats.minIphs).toBe(30);
    expect(stats.totalUsuarios).toBe(2);
  });

  test('validatePagination - valores inválidos', () => {
    const result = validatePagination(-1, 200);

    expect(result.page).toBe(1); // Normalizado
    expect(result.limit).toBe(10); // Normalizado
    expect(result.isValid).toBe(false);
  });

  test('normalizeMonth - mes inválido', () => {
    const result = normalizeMonth(13);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(12);
  });
});
```

---

## 📚 Documentación Relacionada

- **Servicio de Estadísticas:** `src/components/private/components/statistics/services/statistics.service.ts`
- **Mock de Estadísticas:** `src/mock/statistics/estadisticas-usuarios.mock.ts`
- **Interfaces:** `src/interfaces/statistics/statistics.interface.ts`
- **CLAUDE.md:** Documentación general del proyecto

---

## 🔄 Changelog

### **v1.0.0** (2025-01-30)
- ✅ Creación inicial de utilidades de estadísticas
- ✅ Extracción de lógica reutilizable desde mock
- ✅ 20+ funciones de transformación y validación
- ✅ Documentación completa con ejemplos
- ✅ Constantes de configuración exportadas
- ✅ Barrel export para importaciones limpias

---

## 🚀 Próximos Pasos

1. **Migrar servicio `statistics.service.ts`** para usar estas utilidades
2. **Refactorizar mock** para usar funciones extraídas
3. **Agregar tests unitarios** para cada utilidad
4. **Integrar en componente `EstadisticasUsuario`**

---

**Última actualización:** 2025-01-30
**Autor:** Claude Code
**Licencia:** Proyecto IPH Frontend
