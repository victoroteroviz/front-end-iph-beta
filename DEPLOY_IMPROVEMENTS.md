# 🚀 Mejoras en el Script de Deploy

## 📌 Cambio Implementado

Se mejoró el script `deploy.sh` para **cargar variables desde `.env.production`** en lugar de tenerlas hardcodeadas.

## ✅ Ventajas

### Antes (Hardcodeado):
```bash
# ❌ Valores duplicados y difíciles de mantener
VITE_API_BASE_URL="https://iph01.okip.com.mx/api"
VITE_SUPERADMIN_ROLE='[{"id":1,"nombre":"SuperAdmin"}]'
# ... etc
```

**Problemas:**
- 🔴 Duplicación de configuración
- 🔴 Cambios requieren editar el script bash
- 🔴 Difícil de mantener sincronizado

### Después (Desde .env.production):
```bash
# ✅ Función que carga desde archivo
load_env_file ".env.production"
```

**Ventajas:**
- ✅ **Única fuente de verdad**: `.env.production`
- ✅ **Fácil de modificar**: Solo editar archivo `.env`
- ✅ **Preserva formato JSON**: Maneja correctamente comillas
- ✅ **Fallback automático**: Usa valores por defecto si falta el archivo
- ✅ **Logging detallado**: Muestra qué variables se cargaron

## 🔧 Función `load_env_file`

La nueva función:

```bash
load_env_file() {
    local env_file=$1
    
    # Leer línea por línea preservando comillas
    while IFS= read -r line || [ -n "$line" ]; do
        # Ignorar comentarios y líneas vacías
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        
        # Extraer y exportar variables
        if [[ $line =~ ^([A-Z_]+)=(.*)$ ]]; then
            var_name="${BASH_REMATCH[1]}"
            var_value="${BASH_REMATCH[2]}"
            export "$var_name=$var_value"
        fi
    done < "$env_file"
}
```

### Características:
- 📝 Lee línea por línea
- 🔍 Ignora comentarios automáticamente
- 📦 Preserva formato JSON con comillas
- 🛡️ Manejo de errores robusto

## 📁 Estructura de Archivos

```
├── .env                    # Desarrollo (con proxy Vite)
├── .env.production         # Producción (URL completa con /api)
├── .env.development        # Desarrollo explícito
└── deploy.sh               # Script que lee .env.production
```

## 🎯 Uso

### Modificar Configuración de Producción:

1. Editar `.env.production`:
   ```bash
   VITE_API_BASE_URL=https://nueva-url.com/api
   ```

2. Ejecutar deploy:
   ```bash
   sudo ./deploy.sh 0.0.10Alpha
   ```

3. ✅ El script carga automáticamente las nuevas variables

### Variables Cargadas:

El script muestra un log de las variables cargadas:
```
[INFO] Cargando variables desde .env.production
[INFO]   ✓ VITE_API_BASE_URL=https://iph01.okip.com.mx/api
[INFO]   ✓ VITE_APP_ENVIRONMENT=production
[INFO]   ✓ VITE_SUPERADMIN_ROLE cargado
[INFO]   ✓ VITE_LOG_LEVEL=1
[SUCCESS] Variables de entorno cargadas correctamente
```

## 🔐 Seguridad

- Los valores de `*_ROLE` no se muestran completos en logs (muy largos)
- Variables sensibles solo se cargan, no se imprimen
- Fallback seguro si falta el archivo

## 📋 Checklist de Deploy

- [ ] Verificar `.env.production` tiene valores correctos
- [ ] Ejecutar `sudo ./deploy.sh <version>`
- [ ] Verificar logs muestran variables correctas
- [ ] Confirmar imagen sube a Docker Hub
- [ ] Verificar aplicación usa API de producción

## 🆚 Comparación

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Fuente de config** | Hardcoded en script | `.env.production` |
| **Mantenibilidad** | 🔴 Baja | ✅ Alta |
| **Formato JSON** | ⚠️ Manual | ✅ Automático |
| **Sincronización** | 🔴 Manual | ✅ Automática |
| **Errores** | ⚠️ Sin validación | ✅ Con fallback |
| **Logs** | ❌ Mínimos | ✅ Detallados |

## 🎉 Resultado

Ahora solo necesitas:

1. **Editar** `.env.production` cuando cambien configuraciones
2. **Ejecutar** `./deploy.sh <version>`
3. **Listo** ✅ Todo se configura automáticamente

---

**Fecha**: 2 de octubre de 2025  
**Versión mejorada**: 0.0.9Alpha+
