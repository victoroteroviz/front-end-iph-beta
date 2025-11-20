# 📄 Servicio de Generación de PDF - Reporte Diario

> **Versión:** 1.0.0
> **Ubicación:** `/src/components/private/components/reportes-pdf/services/get-reporte-diario-pdf.service.ts`

---

## 📋 Descripción

Servicio profesional enterprise-grade para generar PDFs del reporte diario de uso de aplicación (tablets y laptops) y actividades realizadas.

### ✨ Características

- ✅ **Validación Zod**: Validación runtime enterprise-grade con mensajes de error claros
- ✅ **TypeScript Completo**: Interfaces tipadas para máxima seguridad
- ✅ **Dual Format**: Soporte para `application/json` y `multipart/form-data`
- ✅ **Blob Response**: Retorna Blob para máxima flexibilidad (descarga/preview)
- ✅ **Cache Disabled**: PDFs siempre frescos (no cache)
- ✅ **Logging Detallado**: Debug + Info logs para troubleshooting
- ✅ **Error Handling Robusto**: Tipos de error específicos con contexto
- ✅ **Auto Retry**: 3 reintentos automáticos con backoff exponencial
- ✅ **Timeout Configurable**: 60s por defecto (ajustable)
- ✅ **Helpers Incluidos**: Descarga, preview, creación de URLs
- ✅ **Integración PDFViewer**: Compatible con componente PDFViewer

---

## 🚀 Uso Básico

### 1️⃣ Generar PDF con JSON (Recomendado)

```typescript
import {
  generateReporteDiarioPDF,
  downloadPDFBlob,
  type ReporteDiarioPayload
} from '@/components/private/components/reportes-pdf/services/get-reporte-diario-pdf.service';

// Definir datos del reporte
const reportData: ReporteDiarioPayload = {
  reportDate: '2025-11-18',

  // Sección TABLETS
  usoApp: {
    tabletsEnUso: 18,
    totalTablets: 30,
    registrosElaborados: 150,
    iphJusticiaCivica: 85,
    iphProbableDelictivo: 65
  },

  // Sección LAPTOPS
  usoLaptopApp: {
    laptopsEnUso: 6,
    totalLaptops: 10,
    registrosElaborados: 50
  },

  // Actividades
  activities: [
    {
      title: 'Operativo Preventivo Vespertino',
      description: 'Recorrido en zona centro con cobertura en 5 puntos estratégicos',
      imageUrls: [
        'https://cdn.example.com/operativo-1.jpg',
        'https://cdn.example.com/operativo-2.jpg'
      ]
    }
  ],

  activitiesIncludePageBreak: true
};

// Generar PDF
try {
  const result = await generateReporteDiarioPDF(reportData);

  console.log('PDF generado:', {
    fileName: result.fileName,
    size: result.size,
    duration: result.duration
  });

  // Opción A: Descargar automáticamente
  downloadPDFBlob(result.blob, result.fileName || 'reporte-diario.pdf');

  // Opción B: Usar en PDFViewer component
  // <PDFViewer url={result.url} fileName={result.fileName} />

  // IMPORTANTE: Limpiar URL cuando termine de usar
  // URL.revokeObjectURL(result.url);

} catch (error) {
  console.error('Error generando PDF:', error);
}
```

---

## 📊 Estructura de Datos

### UsoApp (Tablets)

```typescript
interface UsoApp {
  // 🔹 Campos provistos por cliente (REQUERIDOS para mostrar sección)
  tabletsEnUso?: number;      // Tablets actualmente en uso
  totalTablets?: number;       // Total de tablets disponibles
  devicesTitle?: string;       // Título custom (máx 50 chars)

  // 🔹 Campos auto-poblados por backend (opcionales)
  registrosElaborados?: number;
  registrosJusticiaCivica?: number;
  registrosProbableDelictivo?: number;
  iphJusticiaCivica?: number;
  iphJusticiaConDetenidos?: number;
  iphJusticiaSinDetenidos?: number;
  iphProbableDelictivo?: number;
  iphDelictivoConDetenidos?: number;
  iphDelictivoSinDetenidos?: number;
  registrosNuevosSemana?: number;
  registrosNuevosDia?: number;
}
```

### UsoLaptopApp (Laptops)

```typescript
interface UsoLaptopApp {
  // 🔹 Campos provistos por cliente (REQUERIDOS para mostrar sección)
  laptopsEnUso?: number;       // ⚠️ DIFERENTE: laptopsEnUso (no tabletsEnUso)
  totalLaptops?: number;        // ⚠️ DIFERENTE: totalLaptops (no totalTablets)
  devicesTitle?: string;        // Título custom (máx 50 chars)

  // 🔹 Campos auto-poblados por backend (opcionales)
  // ... misma estructura que tablets
}
```

**⚠️ IMPORTANTE:** Los campos de dispositivos son diferentes:
- **Tablets**: `tabletsEnUso` / `totalTablets`
- **Laptops**: `laptopsEnUso` / `totalLaptops`

### Activity (Actividad)

```typescript
interface Activity {
  title?: string;              // Título (máx 200 chars)
  description?: string;        // Descripción (máx 2000 chars)
  imageUrls?: string[];        // URLs de imágenes (máx 5)
}
```

---

## 🎯 Ejemplos Avanzados

### Ejemplo 1: Solo Tablets

```typescript
const result = await generateReporteDiarioPDF({
  reportDate: '2025-11-18',
  usoApp: {
    tabletsEnUso: 18,
    totalTablets: 30,
    devicesTitle: 'TABLETS EN CAMPO' // Título personalizado
  }
});
```

### Ejemplo 2: Solo Laptops

```typescript
const result = await generateReporteDiarioPDF({
  reportDate: '2025-11-18',
  usoLaptopApp: {
    laptopsEnUso: 6,
    totalLaptops: 10,
    devicesTitle: 'LAPTOPS ADMINISTRATIVAS'
  }
});
```

### Ejemplo 3: Tablets + Laptops + Actividades

```typescript
const result = await generateReporteDiarioPDF({
  reportDate: '2025-11-18',

  usoApp: {
    tabletsEnUso: 18,
    totalTablets: 30
  },

  usoLaptopApp: {
    laptopsEnUso: 6,
    totalLaptops: 10
  },

  activities: [
    {
      title: 'Operativo Matutino',
      description: 'Supervisión zona norte',
      imageUrls: ['https://cdn.example.com/img1.jpg']
    },
    {
      title: 'Operativo Vespertino',
      description: 'Supervisión zona sur',
      imageUrls: ['https://cdn.example.com/img2.jpg']
    }
  ],

  activitiesIncludePageBreak: true
});
```

### Ejemplo 4: Con Multipart/Form-Data (Subir Imágenes)

```typescript
import { generateReporteDiarioPDFMultipart } from '@/components/private/components/reportes-pdf/services/get-reporte-diario-pdf.service';

// Crear FormData
const formData = new FormData();

// Fecha del reporte
formData.append('reportDate', '2025-11-18');

// Tablets
formData.append('usoApp[tabletsEnUso]', '18');
formData.append('usoApp[totalTablets]', '30');

// Laptops
formData.append('usoLaptopApp[laptopsEnUso]', '6');
formData.append('usoLaptopApp[totalLaptops]', '10');

// Actividades con archivos de imagen
formData.append('activities[0][title]', 'Operativo vespertino');
formData.append('activities[0][description]', 'Cobertura en sector norte');
formData.append('activities[0]', imageFile1); // File object del input
formData.append('activities[0]', imageFile2); // File object del input

// Generar PDF
const result = await generateReporteDiarioPDFMultipart(formData);
downloadPDFBlob(result.blob, 'reporte-con-imagenes.pdf');
```

### Ejemplo 5: Helpers de Conveniencia

```typescript
import {
  generateAndDownloadPDF,
  generateAndPreviewPDF
} from '@/components/private/components/reportes-pdf/services/get-reporte-diario-pdf.service';

// Generar y descargar automáticamente
await generateAndDownloadPDF(
  {
    reportDate: '2025-11-18',
    usoApp: { tabletsEnUso: 18, totalTablets: 30 }
  },
  'mi-reporte-diario.pdf'
);

// Generar y abrir en nueva pestaña para preview
await generateAndPreviewPDF({
  reportDate: '2025-11-18',
  usoApp: { tabletsEnUso: 18, totalTablets: 30 }
});
```

---

## ⚙️ Opciones de Configuración

```typescript
interface GeneratePDFOptions {
  timeout?: number;              // Timeout en ms (default: 60000)
  retries?: number;              // Reintentos (default: 3)
  showNotifications?: boolean;   // Mostrar toast notifications (default: true)
  suggestedFileName?: string;    // Nombre de archivo (default: 'reporte-diario.pdf')
}

// Ejemplo con opciones personalizadas
const result = await generateReporteDiarioPDF(
  reportData,
  {
    timeout: 90000,              // 90 segundos para reportes grandes
    retries: 5,                  // 5 reintentos
    showNotifications: false,    // Sin notificaciones automáticas
    suggestedFileName: 'reporte-noviembre-18.pdf'
  }
);
```

---

## 🎨 Integración con PDFViewer

```typescript
import PDFViewer from '@/components/private/common/PDFViewer';
import { generateReporteDiarioPDF, createBlobUrl } from '@/services/...';

function ReporteComponent() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleGenerate = async () => {
    try {
      const result = await generateReporteDiarioPDF({
        reportDate: '2025-11-18',
        usoApp: { tabletsEnUso: 18, totalTablets: 30 }
      });

      setPdfUrl(result.url);
      setFileName(result.fileName || 'reporte.pdf');

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Limpiar URL al desmontar
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div>
      <button onClick={handleGenerate}>Generar Reporte</button>

      {pdfUrl && (
        <PDFViewer
          url={pdfUrl}
          fileName={fileName}
          showPrintButton
          showDownloadButton
        />
      )}
    </div>
  );
}
```

---

## ❌ Manejo de Errores

```typescript
import { PDFServiceError, PDFErrorType } from '@/services/...';

try {
  const result = await generateReporteDiarioPDF(reportData);

} catch (error) {
  if (error instanceof PDFServiceError) {
    switch (error.type) {
      case PDFErrorType.VALIDATION:
        console.error('❌ Datos inválidos:', error.message);
        // Mostrar errores de validación al usuario
        break;

      case PDFErrorType.NO_DATA:
        console.error('⚠️ Sin datos suficientes:', error.message);
        // Pedir al usuario que complete al menos una sección
        break;

      case PDFErrorType.NETWORK:
        console.error('🌐 Error de red:', error.message);
        // Verificar conexión, reintentar
        break;

      case PDFErrorType.AUTH:
        console.error('🔒 Error de autenticación:', error.message);
        // Redirigir a login
        break;

      case PDFErrorType.SERVER:
        console.error('🔥 Error del servidor:', error.message);
        // Mostrar mensaje de error genérico
        break;

      case PDFErrorType.INVALID_PDF:
        console.error('📄 PDF inválido:', error.message);
        // El servidor no devolvió un PDF válido
        break;

      default:
        console.error('❓ Error desconocido:', error.message);
    }

    // Acceder a detalles adicionales
    console.log('Detalles:', error.details);
    console.log('Error original:', error.originalError);
  }
}
```

---

## 📝 Validaciones Importantes

### ⚠️ Reglas de Validación

1. **Al menos una sección con datos**: Debe proporcionar `usoApp`, `usoLaptopApp` o `activities`
2. **Formato de fecha**: `YYYY-MM-DD` (ej: `2025-11-18`)
3. **Números enteros no negativos**: Todos los contadores deben ser ≥ 0
4. **Máximo de imágenes**: 5 imágenes totales en `activities`
5. **Máximo de actividades**: 20 actividades por reporte
6. **URLs válidas**: Las `imageUrls` deben ser URLs completas y válidas

### ✅ Ejemplos Válidos

```typescript
// ✅ CORRECTO - Solo tablets
{ usoApp: { tabletsEnUso: 18, totalTablets: 30 } }

// ✅ CORRECTO - Solo laptops
{ usoLaptopApp: { laptopsEnUso: 6, totalLaptops: 10 } }

// ✅ CORRECTO - Solo actividades
{ activities: [{ title: 'Operativo', description: 'Descripción' }] }

// ✅ CORRECTO - Tablets + Laptops
{
  usoApp: { tabletsEnUso: 18, totalTablets: 30 },
  usoLaptopApp: { laptopsEnUso: 6, totalLaptops: 10 }
}
```

### ❌ Ejemplos Inválidos

```typescript
// ❌ ERROR - Sin datos
{}

// ❌ ERROR - Formato de fecha incorrecto
{ reportDate: '18/11/2025' }  // Debe ser '2025-11-18'

// ❌ ERROR - Campos mezclados incorrectamente
{
  usoApp: {
    laptopsEnUso: 6  // ❌ Debe ser tabletsEnUso
  }
}

// ❌ ERROR - Números negativos
{ usoApp: { tabletsEnUso: -5 } }

// ❌ ERROR - URL inválida
{
  activities: [{
    imageUrls: ['not-a-valid-url']  // ❌ Debe ser URL completa
  }]
}
```

---

## 🔧 Helpers Disponibles

### `createBlobUrl(blob: Blob): string`
Crea una URL de objeto desde un Blob. **Debe ser revocada** con `URL.revokeObjectURL()`.

### `downloadPDFBlob(blob: Blob, fileName: string): void`
Descarga un Blob como archivo. Limpia automáticamente la URL temporal.

### `openPDFInNewTab(blob: Blob): void`
Abre un Blob PDF en nueva pestaña para preview.

### `validatePayload(payload: unknown): ReporteDiarioPayload`
Valida manualmente un payload con Zod. Útil para validación previa.

---

## 🐛 Troubleshooting

### Problema: "No se proporcionó información para generar el reporte diario"

**Causa:** Payload vacío o sin datos significativos.

**Solución:** Asegurarse de enviar al menos una sección con datos:

```typescript
// ❌ MAL
const result = await generateReporteDiarioPDF({});

// ✅ BIEN
const result = await generateReporteDiarioPDF({
  usoApp: { tabletsEnUso: 18, totalTablets: 30 }
});
```

### Problema: "Formato de fecha inválido"

**Causa:** Fecha en formato incorrecto.

**Solución:** Usar formato `YYYY-MM-DD`:

```typescript
// ❌ MAL
reportDate: '18/11/2025'

// ✅ BIEN
reportDate: '2025-11-18'
```

### Problema: Campos de laptops no se reflejan

**Causa:** Usar campos de tablets en sección de laptops.

**Solución:** Usar campos correctos:

```typescript
// ❌ MAL
usoLaptopApp: {
  tabletsEnUso: 6,      // ❌ Campo incorrecto
  totalTablets: 10      // ❌ Campo incorrecto
}

// ✅ BIEN
usoLaptopApp: {
  laptopsEnUso: 6,      // ✅ Campo correcto
  totalLaptops: 10      // ✅ Campo correcto
}
```

---

## 📚 Referencias

- **Servicio:** `/src/components/private/components/reportes-pdf/services/get-reporte-diario-pdf.service.ts`
- **HTTP Helper:** `/src/helper/http/http.helper.ts`
- **Logger Helper:** `/src/helper/log/logger.helper.ts`
- **Notification Helper:** `/src/helper/notification/notification.helper.ts`
- **PDFViewer Component:** `/src/components/private/common/PDFViewer.tsx`

---

**Última actualización:** 2025-11-20
**Versión:** 1.0.0
