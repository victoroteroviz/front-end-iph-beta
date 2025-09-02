# PROYECTO IPH FRONTEND

## ESTADO ACTUAL DEL PROYECTO

**Versión:** 3.0.0  
**Componentes migrados:** Login, Dashboard, Inicio, EstadisticasUsuario, HistorialIPH, IphOficial, InformePolicial, PerfilUsuario, Usuarios, InformeEjecutivo

## ARQUITECTURA IMPLEMENTADA

### **Principios Aplicados**
- ✅ **SOLID** - Single Responsibility, Open/Closed, etc.
- ✅ **KISS** - Keep It Simple Stupid
- ✅ **DRY** - Don't Repeat Yourself

### **Patrones de Diseño**
- ✅ **Singleton** - Para helpers (HTTP, Security, Navigation, Notification, Logger)
- ✅ **Custom Hooks** - Separación lógica/presentación
- ✅ **Observer Pattern** - Sistema de notificaciones
- ✅ **Builder Pattern** - Configuración de helpers
- ✅ **Atomic Components** - Componentes reutilizables por funcionalidad

## ESTRUCTURA DE ARCHIVOS ESTABLECIDA

### **Para Servicios:**
```
src/
├── interfaces/[nombre]/
│   ├── [nombre].interface.ts
│   └── index.ts
├── services/[nombre]/
│   └── [metodo]-[nombre].service.ts
└── mock/[nombre]/
    ├── [nombre].mock.ts
    └── index.ts
```

### **Para Helpers:**
```
src/helper/
├── [nombre]/
│   └── [nombre].helper.ts
```

### **Para Componentes:**
```
src/components/[tipo]/components/[nombre]/
├── [Nombre].tsx                    # Componente principal
├── README.md                       # Documentación completa
├── hooks/
│   └── use[Nombre].ts             # Hook personalizado
├── components/
│   └── [SubComponente].tsx        # Componentes atómicos
└── sections/
    └── [Seccion].tsx              # Secciones específicas
```

## CONFIGURACIÓN CORREGIDA

### **Variables de Entorno (.env)**
```bash
VITE_SUPERADMIN_ROLE=[{"id":1,"nombre":"SuperAdmin"}]
VITE_ADMIN_ROLE=[{"id":2,"nombre":"Administrador"}]
VITE_SUPERIOR_ROLE=[{"id":3,"nombre":"Superior"}]  
VITE_ELEMENTO_ROLE=[{"id":4,"nombre":"Elemento"}]
```

### **Config TypeScript (env.config.ts)**
```typescript
export const ALLOWED_ROLES = [
  ...SUPERADMIN_ROLE,
  ...ADMIN_ROLE, 
  ...SUPERIOR_ROLE,
  ...ELEMENTO_ROLE
];
```

## HELPERS REUTILIZABLES

### **1. Security Helper**
- `sanitizeInput()` - Limpia inputs XSS
- `recordFailedAttempt()` - Rate limiting  
- `isAccountLocked()` - Control de bloqueos
- `generateCSRFToken()` - Protección CSRF

### **2. Navigation Helper**
- `getRouteForUser()` - Determina ruta por usuario
- `isUserAuthenticated()` - Verifica autenticación
- `hasAccessToRoute()` - Control de acceso

### **3. Notification Helper**
- `showSuccess()`, `showError()`, `showInfo()`, `showWarning()`
- Sistema de suscripción integrado

## COMPONENTES MIGRADOS COMPLETAMENTE

### **1. Login** (`src/components/public/auth/Login.tsx`)
- ✅ TypeScript completo con Zod
- ✅ Medidas de seguridad (rate limiting, CSRF)
- ✅ Hook personalizado useLoginLogic
- ✅ Sistema de notificaciones integrado

### **2. Dashboard** (`src/components/private/layout/Dashboard.tsx`)
- ✅ Layout principal con sidebar y topbar
- ✅ Componentes atómicos (Sidebar, Topbar, UserDropdown)
- ✅ Sistema de roles con filtrado de navegación
- ✅ Hooks personalizados (useUserSession, useClickOutside)

### **3. Inicio** (`src/components/private/components/home/Inicio.tsx`)
- ✅ Dashboard con estadísticas
- ✅ Componentes atómicos (ResumenCard, GraficaCard)
- ✅ Hook personalizado useInicioDashboard
- ✅ Servicios integrados getIphCountByUsers

### **4. EstadisticasUsuario** (`src/components/private/components/statistics/EstadisticasUsuario.tsx`)
- ✅ Estadísticas por usuario con filtros
- ✅ Componentes atómicos (UsuarioCard, Filters, Pagination)
- ✅ Hook personalizado useEstadisticasUsuario
- ✅ Paginación completa y estados de carga

### **5. HistorialIPH** (`src/components/private/components/historial-iph/HistorialIPH.tsx`)
- ✅ Historial completo de IPHs con filtros avanzados
- ✅ Sistema de mocks organizados con JSDoc TODO para API real
- ✅ Componentes atómicos (HistorialTable, FiltrosHistorial, Paginacion)
- ✅ Vista detalle dummy para futuro desarrollo
- ✅ Hook personalizado useHistorialIPH con control de roles

### **6. IphOficial** (`src/components/private/components/iph-oficial/IphOficial.tsx`)
- ✅ Vista detallada de IPH oficial por ID
- ✅ Integración real con servicio existente getIphById
- ✅ Transformación I_IPHById (servidor) → IphOficialData (componente)
- ✅ Hook personalizado useIphOficial con useParams
- ✅ Secciones atómicas (6 secciones principales implementadas)
- ✅ Sistema adaptable mock/API real con USE_MOCK_DATA flag

### **7. PerfilUsuario** (`src/components/private/components/perfil-usuario/PerfilUsuario.tsx`)
- ✅ Gestión completa de perfiles de usuario (crear/editar/ver propio perfil)
- ✅ Formulario con validación Zod y react-select para roles múltiples
- ✅ Control de acceso granular basado en roles y operaciones
- ✅ Hook personalizado usePerfilUsuario con lógica de negocio separada
- ✅ Integración con servicios de catálogos (cargos, grados, adscripciones, municipios)
- ✅ Sistema de carga de archivos para fotos de perfil

### **8. Usuarios** (`src/components/private/components/usuarios/Usuarios.tsx`)
- ✅ Gestión completa de usuarios del sistema con funcionalidades CRUD
- ✅ Componentes atómicos especializados (UsuariosTable, VirtualizedTable, Pagination)
- ✅ Sistema de filtros avanzado con búsqueda por múltiples campos
- ✅ Tabla virtualizada con react-window para rendimiento con grandes datasets
- ✅ Estadísticas de usuarios con tarjetas informativas (mock data)
- ✅ Modal de estadísticas detalladas por usuario (dummy data)
- ✅ Hook personalizado useUsuarios con control de permisos completo
- ✅ Sistema de ordenamiento y paginación integrado
- ✅ Estados de carga, error y eliminación con notificaciones

### **9. InformeEjecutivo** (`src/components/private/components/informe-ejecutivo/InformeEjecutivo.tsx`)
- ✅ Vista de solo lectura para informes ejecutivos con exportación PDF
- ✅ Integración completa con react-leaflet para mapas interactivos
- ✅ 10+ componentes atómicos especializados (SectionWrapper, MapSection, AnexosGallery, etc.)
- ✅ Galería de imágenes con modal de visualización y navegación
- ✅ Exportación PDF funcional con patrón mock/configurable para futuro
- ✅ Mantenimiento del diseño original con colores específicos (#c2b186, #fdf7f1)
- ✅ Hook personalizado useInformeEjecutivo con control de acceso granular
- ✅ Transformación adaptativa de datos desde getIphById existente
- ✅ Estados de carga por sección y manejo de errores robusto
- ✅ Modal de galería con navegación entre imágenes y lazy loading

### **10. InformePolicial** (`src/components/private/components/informe-policial/InformePolicial.tsx`)
- ✅ Lista completa de informes policiales con filtros avanzados
- ✅ Integración con servicios existentes getAllIph y getIphByUser
- ✅ Control de acceso por roles (Elemento ve solo propios, otros ven global)
- ✅ Auto-refresh configurable cada 5 minutos con control manual
- ✅ Sistema de búsqueda debounced por referencia y folio
- ✅ Componentes atómicos especializados (IPHCard, IPHFilters, IPHPagination, AutoRefreshIndicator)
- ✅ Hook personalizado useInformePolicial con lógica de negocio completa
- ✅ Estados de carga con skeleton cards y manejo robusto de errores
- ✅ Diseño moderno manteniendo paleta original (#4d4725, #b8ab84, #f8f0e7)
- ✅ Paginación avanzada con información de elementos visibles

## SISTEMA DE SERVICIOS

### **Servicios Implementados:**
- `login.service.ts` - Autenticación con ALLOWED_ROLES
- `statistics.service.ts` - getIphCountByUsers implementado
- `historial-iph.service.ts` - Servicio completo con mocks y JSDoc TODO
- `iph-oficial.service.ts` - Integrado con getIphById existente
- `informe-policial.service.ts` - Integrado con getAllIph y getIphByUser, control por roles
- `perfil-usuario.service.ts` - Gestión de perfiles con integración catálogos
- `usuarios-estadisticas.service.ts` - Estadísticas de usuarios con patrón mock/real
- `informe-ejecutivo.service.ts` - Adaptador getIphById con exportación PDF mock/real

### **Patrón de Servicios Mock:**
```typescript
const USE_MOCK_DATA = true; // Cambiar a false para API real

export const getDataFunction = async (params) => {
  if (USE_MOCK_DATA) {
    return await getMockData(params);
  } else {
    return await getRealAPIData(params);
  }
};
```

## CONFIGURACIÓN DE RUTAS

### **IPHApp.tsx - Sistema de Rutas:**
```typescript
<Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/" element={<Dashboard />}>
      <Route path="inicio" element={<Inicio />} />
      <Route path="estadisticasusuario" element={<EstadisticasUsuario />} />
      <Route path="historialiph" element={<HistorialIPH />} />
      <Route path="informepolicial" element={<InformePolicial />} />
      <Route path="iphoficial/:id" element={<IphOficial />} />
      <Route path="informeejecutivo/:id" element={<InformeEjecutivo />} />
      
      {/* Rutas de gestión de usuarios refactorizadas */}
      <Route path="usuarios" element={<Usuarios />} />
      <Route path="usuarios/nuevo" element={<PerfilUsuario />} />
      <Route path="usuarios/editar/:id" element={<PerfilUsuario />} />
      <Route path="perfil" element={<PerfilUsuario />} />
    </Route>
  </Routes>
</Router>
```

## SISTEMA DE ROLES Y PERMISOS

### **🎯 Arquitectura Híbrida Implementada (v3.1.0)**

**Enfoque:** Hardcodeado para DX + Validación dinámica contra .env  
**Archivo:** `/src/config/permissions.config.ts`  
**Helper:** `/src/helper/role/role.helper.ts`

#### **📋 Definición de Roles del Sistema:**
```typescript
export const SYSTEM_ROLES = {
  SUPERADMIN: [{ id: 1, nombre: 'SuperAdmin' }],
  ADMIN: [{ id: 2, nombre: 'Administrador' }], 
  SUPERIOR: [{ id: 3, nombre: 'Superior' }],
  ELEMENTO: [{ id: 4, nombre: 'Elemento' }]
} as const;
```

#### **🔄 Jerarquía Automática por Orden:**
- **SUPERADMIN (nivel 1)** → Acceso a: Admin, Superior, Elemento
- **ADMIN (nivel 2)** → Acceso a: Superior, Elemento  
- **SUPERIOR (nivel 3)** → Acceso a: Elemento
- **ELEMENTO (nivel 4)** → Solo acceso propio

#### **🔒 Validación Doble Segura:**
- **ID + Nombre**: Previene manipulación de roles
- **Contra ALLOWED_ROLES**: Solo roles válidos del .env funcionan
- **TypeScript**: Autocompletado y validación compile-time

### **🚀 APIs Disponibles:**

#### **Funciones Específicas:**
```typescript
import { isSuperAdmin, isAdmin, isSuperior, isElemento } from '@/config/permissions.config';

// Uso en componentes
const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
const hasAccess = isSuperAdmin(userRoles); // ← TypeScript autocomplete
```

#### **Funciones Jerárquicas:**
```typescript
import { canAccessAdmin, canAccessSuperior } from '@/config/permissions.config';

// Acceso jerárquico automático
const canManageUsers = canAccessAdmin(userRoles); // SuperAdmin + Admin
const canViewStats = canAccessSuperior(userRoles); // SuperAdmin + Admin + Superior
```

#### **Funciones Genéricas:**
```typescript
import { hasRole, hasHierarchicalAccess, SystemRoleType } from '@/config/permissions.config';

// Con autocompletado TypeScript
const isSuper = hasRole(userRoles, 'SUPERADMIN'); // ← Valida string
const canAccess = hasHierarchicalAccess(userRoles, 'SUPERIOR'); // ← Jerarquía
```

### **🎮 Control de Acceso por Componente:**

#### **Nivel 1 - SuperAdmin:**
- **Componentes**: Todos + Configuración del sistema
- **Operaciones**: Gestión de roles, configuración global

#### **Nivel 2 - Admin:**  
- **Componentes**: Inicio, Estadísticas, Usuarios, IPH, Historial
- **Operaciones**: CRUD completo, gestión de usuarios

#### **Nivel 3 - Superior:**
- **Componentes**: Inicio, Estadísticas, IPH, InformeEjecutivo
- **Operaciones**: Supervisión, reportes, IPH avanzado

#### **Nivel 4 - Elemento:**
- **Componentes**: IPH, InformeEjecutivo (solo lectura), Perfil  
- **Operaciones**: IPH básico, consulta propia

### **📝 Patrón de Implementación en Componentes:**

#### **Opción A - Función Específica:**
```typescript
// En useUsuarios.ts
import { canAccessAdmin } from '@/config/permissions.config';

const checkPermissions = useCallback(() => {
  const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
  return {
    canManage: canAccessAdmin(userRoles), // SuperAdmin + Admin
    canView: true // Todos pueden ver
  };
}, []);
```

#### **Opción B - Función Genérica:**
```typescript
// En useHistorialIPH.ts  
import { hasRole } from '@/config/permissions.config';

const hasAccess = useMemo(() => {
  const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
  return hasRole(userRoles, 'SUPERADMIN') || hasRole(userRoles, 'ADMIN');
}, []);
```

#### **Opción C - Jerarquía Automática:**
```typescript
// En useInformeEjecutivo.ts
import { canAccessElemento } from '@/config/permissions.config';

const canView = useMemo(() => {
  const userRoles = JSON.parse(sessionStorage.getItem('roles') || '[]');
  return canAccessElemento(userRoles); // Todos los roles pueden acceder
}, []);
```

### **⚙️ Variables de Entorno:**
```bash
VITE_SUPERADMIN_ROLE=[{"id":1,"nombre":"SuperAdmin"}]
VITE_ADMIN_ROLE=[{"id":2,"nombre":"Administrador"}]
VITE_SUPERIOR_ROLE=[{"id":3,"nombre":"Superior"}]  
VITE_ELEMENTO_ROLE=[{"id":4,"nombre":"Elemento"}]
```

### **🔧 Ventajas del Sistema Híbrido:**
- ✅ **Performance**: Sin parsing constante de .env
- ✅ **DX**: Autocompletado TypeScript perfecto  
- ✅ **Seguridad**: Validación doble ID + nombre
- ✅ **Flexibilidad**: Configuración por ambiente
- ✅ **Mantenibilidad**: Un solo lugar para cambios
- ✅ **Testing**: Mocks simples y directos

### **📊 Migración de Código Legacy:**
```typescript
// ANTES (patrón disperso)
const isSuperAdmin = userRoles.some((role: any) => role.nombre === 'SuperAdmin');
const isAdmin = userRoles.some((role: any) => role.nombre === 'Administrador');

// DESPUÉS (centralizado)
import { isSuperAdmin, isAdmin } from '@/config/permissions.config';
const hasSuperAccess = isSuperAdmin(userRoles);
const hasAdminAccess = isAdmin(userRoles);
```

## SISTEMA DE MOCKS

### **Estructura de Mocks:**
```
src/mock/
├── historial-iph/
│   ├── registros.mock.ts      # 15 registros realistas
│   ├── estadisticas.mock.ts   # Estadísticas calculadas
│   └── index.ts               # Barrel export
└── iph-oficial/
    ├── iphOficial.mock.ts     # Basado en I_IPHById real
    └── index.ts               # Barrel export
```

### **Características de Mocks:**
- ✅ **Datos realistas** basados en interfaces del servidor
- ✅ **Funciones helper** para filtrado y paginación
- ✅ **JSDoc TODO** completo para implementación real
- ✅ **Barrel exports** para fácil importación

## MIGRACIÓN DE localStorage → sessionStorage

**Decisión arquitectural:** Migrar de localStorage a sessionStorage
- ✅ **Mayor seguridad** - Los datos se borran al cerrar tab
- ✅ **Implementado en todos los componentes**
- ✅ **Dashboard, hooks y servicios actualizados**

```typescript
// Antes (inseguro)
localStorage.getItem('userData')

// Ahora (seguro)
sessionStorage.getItem('userData')
```

## PATRONES ESTABLECIDOS PARA MIGRACIONES

### **1. Análisis Profundo del Código Legacy:**
- Identificar lógica de negocio existente
- Mapear flujos de datos y estados
- Documentar comportamientos y side effects
- Evaluar dependencias y servicios
- Detectar patrones de diseño presentes

### **2. Estructura de Refactorización:**
1. **Interfaces** - Crear interfaces tipadas completas
2. **Mocks** - Implementar datos realistas 
3. **Servicios** - Adaptables con flag mock/real
4. **Hook personalizado** - Lógica de negocio separada
5. **Componentes atómicos** - Separar por funcionalidad
6. **Componente principal** - Integrar todo
7. **Documentación** - README.md completo

### **3. Integración con Arquitectura:**
```typescript
// Siempre seguir este patrón
import { ALLOWED_ROLES } from '../config/env.config';
import { logInfo } from '../helper/log/logger.helper';
import { showSuccess } from '../helper/notification/notification.helper';

// Control de roles
const hasAccess = userRoles.some(role => 
  allowedRoleNames.includes(role.nombre)
);

// Logging estructurado
logInfo('ComponentName', 'Acción realizada', { data });

// Notificaciones consistentes
showSuccess('Operación completada exitosamente');
```

## DEPENDENCIAS ACTUALIZADAS

```json
{
  "zod": "^latest",
  "react-router-dom": "^latest",
  "@types/react-router-dom": "^latest",
  "lucide-react": "^latest",
  "@fontsource/poppins": "^latest"
}
```

## COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build  
npm run build

# Verificar tipos
npx tsc --noEmit

# Linting
npm run lint
```

## PRÓXIMOS COMPONENTES PENDIENTES

- **InformePolicial** - Creación/edición de IPH
- **InformeEjecutivo** - Reportes gerenciales

## NOTAS IMPORTANTES

### **Seguridad:**
- ✅ Helpers implementan medidas robustas
- ✅ No exposición de datos sensibles en logs
- ✅ Validación client-side y preparada para server-side
- ✅ sessionStorage para mayor seguridad

### **Rendimiento:**
- ✅ Componentes memoizados donde es necesario
- ✅ Lazy loading preparado
- ✅ Bundle optimizado con Vite
- ✅ Skeletons y estados de carga

### **Mantenibilidad:**
- ✅ Código autodocumentado con JSDoc
- ✅ Interfaces tipadas previenen errores
- ✅ Patrones consistentes en toda la aplicación
- ✅ Helpers reutilizables reducen duplicación
- ✅ Documentación completa por componente

### **Activación de APIs Reales:**
```typescript
// En cada servicio, cambiar:
const USE_MOCK_DATA = false;

// Los componentes automáticamente usarán datos reales
```

---

## STATUS ACTUAL

**✅ COMPONENTES COMPLETADOS:**
- Login - Autenticación completa
- Dashboard - Layout principal con sidebar
- Inicio - Dashboard con estadísticas  
- EstadisticasUsuario - Estadísticas por usuario
- HistorialIPH - Historial con filtros avanzados
- IphOficial - Vista detallada integrada con getIphById
- InformePolicial - Lista de IPH con auto-refresh y filtros por rol
- PerfilUsuario - Gestión completa de perfiles de usuario
- Usuarios - Sistema CRUD completo con tabla virtualizada
- InformeEjecutivo - Vista de solo lectura con mapas y exportación PDF

**🔄 SISTEMA FUNCIONANDO:**
- Rutas configuradas y funcionando
- Control de acceso por roles implementado
- Servicios integrados (mock y reales)
- Sistema de logging y notificaciones activo
- sessionStorage implementado en todo el sistema

**📊 MÉTRICAS:**
- **10 componentes** completamente migrados
- **30+ interfaces** TypeScript creadas
- **10 servicios** implementados con patrón mock/real
- **40+ componentes atómicos** reutilizables
- **8 hooks personalizados** implementados
- **Integración react-leaflet** para mapas interactivos
- **2 componentes con virtualización** para alto rendimiento
- **Sistema de exportación PDF** configurable mock/real

**Servidor de desarrollo:** `npm run dev` → http://localhost:5173/

**Status:** ✅ **Sistema completamente funcional con arquitectura moderna**