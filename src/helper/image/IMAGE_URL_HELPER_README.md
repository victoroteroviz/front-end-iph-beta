# Image URL Helper - Documentación

## Descripción

Helper centralizado para el manejo de URLs de imágenes en el sistema IPH. Proporciona funciones para construir URLs correctas basadas en diferentes tipos de rutas de imagen.

## Tipos de Rutas Soportadas

### 1. **Absolute URL** (`absolute-url`)
URLs completas que incluyen protocolo
```
https://example.com/image.jpg
http://servidor.com/foto.png
```

### 2. **Uploads** (`uploads`)
Rutas que empiezan con "uploads/" (patrón principal de la DB)
```
uploads/iph/54d98380-585c-4db0-99de-452c2d3e31f4/tarjeta-informativa/foto_2_1756747897125.jpg
uploads/users/profile/avatar.jpg
```

### 3. **Server Absolute** (`server-absolute`)
Rutas absolutas del servidor que empiezan con "/"
```
/api/files/image.jpg
/static/images/logo.png
```

### 4. **Mobile** (`mobile`)
Rutas de aplicaciones móviles (Android/iOS)
```
/data/user/0/com.example.okip_iph/app_flutter/GUGN01123060520252247/foto_lugar_001.jpg
/storage/emulated/0/Pictures/IMG_001.jpg
```

### 5. **Relative** (`relative`)
Rutas relativas sin prefijo
```
images/photo.jpg
documents/file.pdf
```

## Funciones Principales

### `buildImageUrl(imagePath: string, context?: string): string`

Construye la URL final para una imagen basada en su ruta.

```typescript
import { buildImageUrl } from '../helper/image/image-url.helper';

// Ruta de uploads (más común)
const url1 = buildImageUrl('uploads/iph/foto.jpg');
// Resultado: https://api.okip.com.mx/uploads/iph/foto.jpg

// URL completa
const url2 = buildImageUrl('https://external.com/image.jpg');
// Resultado: https://external.com/image.jpg

// Ruta móvil
const url3 = buildImageUrl('/data/user/0/app/photo.jpg');
// Resultado: https://api.okip.com.mx/files/mobile/data/user/0/app/photo.jpg
```

### `detectImagePathType(path: string): ImagePathType`

Detecta automáticamente el tipo de ruta.

```typescript
import { detectImagePathType } from '../helper/image/image-url.helper';

const type1 = detectImagePathType('uploads/iph/foto.jpg');
// Resultado: 'uploads'

const type2 = detectImagePathType('https://example.com/img.jpg');
// Resultado: 'absolute-url'
```

### `analyzeImagePath(imagePath: string): ImagePathAnalysis`

Proporciona un análisis completo de la ruta.

```typescript
import { analyzeImagePath } from '../helper/image/image-url.helper';

const analysis = analyzeImagePath('uploads/iph/photo.jpg');
console.log(analysis);
// {
//   type: 'uploads',
//   originalPath: 'uploads/iph/photo.jpg',
//   cleanPath: 'uploads/iph/photo.jpg',
//   finalUrl: 'https://api.okip.com.mx/uploads/iph/photo.jpg',
//   isValid: true
// }
```

### `validateImageUrl(imageUrl: string): Promise<boolean>`

Valida si una URL de imagen es accesible.

```typescript
import { validateImageUrl } from '../helper/image/image-url.helper';

const isValid = await validateImageUrl('https://api.okip.com.mx/uploads/photo.jpg');
console.log(isValid); // true o false
```

### `buildMultipleImageUrls(imagePaths: string[], context?: string): string[]`

Construye múltiples URLs de forma eficiente.

```typescript
import { buildMultipleImageUrls } from '../helper/image/image-url.helper';

const paths = [
  'uploads/iph/photo1.jpg',
  'uploads/iph/photo2.jpg',
  'https://external.com/photo3.jpg'
];

const urls = buildMultipleImageUrls(paths, 'gallery');
// Retorna array de URLs construidas
```

## Uso en Componentes

### Ejemplo en AnexosGallery

```typescript
import React from 'react';
import { buildImageUrl } from '../../../../../helper/image/image-url.helper';

const AnexosGallery: React.FC = ({ anexos }) => {
  return (
    <div>
      {anexos.map((anexo, index) => (
        <img
          key={anexo.id}
          src={buildImageUrl(anexo.ruta_foto, `anexo_${anexo.id}`)}
          alt={anexo.descripcion || `Anexo ${index + 1}`}
          onError={() => console.log('Error cargando imagen')}
        />
      ))}
    </div>
  );
};
```

### Ejemplo en otros componentes

```typescript
import { buildImageUrl, analyzeImagePath } from '../helper/image/image-url.helper';

// En un componente de perfil de usuario
const avatarUrl = buildImageUrl(user.avatar_path, 'user_avatar');

// Para validar antes de mostrar
const pathInfo = analyzeImagePath(document.file_path);
if (pathInfo.isValid) {
  // Mostrar imagen
}
```

## Configuración

El helper utiliza `API_BASE_URL` de la configuración del entorno:

```typescript
// src/config/env.config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

Asegúrate de configurar correctamente:

```bash
# .env
VITE_API_BASE_URL=https://iph-api.okip.com.mx
```

## Logging

Todas las operaciones se registran automáticamente:

- **Información**: Construcción exitosa de URLs
- **Errores**: Rutas inválidas, URLs no accesibles
- **Debug**: Análisis detallado de rutas

## Beneficios

1. **Centralización**: Una sola fuente de verdad para URLs de imagen
2. **Flexibilidad**: Soporta múltiples tipos de rutas
3. **Debugging**: Logging detallado para troubleshooting
4. **Reutilización**: Se puede usar en cualquier componente
5. **Mantenibilidad**: Cambios centralizados afectan toda la app
6. **Type Safety**: TypeScript completo con interfaces

## Migración

Para componentes existentes que usen URLs hardcodeadas:

```typescript
// Antes ❌
const imageUrl = `https://iph-api.okip.com.mx${anexo.ruta_foto}`;

// Después ✅
import { buildImageUrl } from '../helper/image/image-url.helper';
const imageUrl = buildImageUrl(anexo.ruta_foto, 'componente_contexto');
```

## Testing

```typescript
import { buildImageUrl, detectImagePathType } from '../helper/image/image-url.helper';

// Test de tipos de ruta
expect(detectImagePathType('uploads/test.jpg')).toBe('uploads');
expect(detectImagePathType('https://example.com/test.jpg')).toBe('absolute-url');

// Test de construcción de URL
expect(buildImageUrl('uploads/test.jpg')).toContain('/uploads/test.jpg');
```
