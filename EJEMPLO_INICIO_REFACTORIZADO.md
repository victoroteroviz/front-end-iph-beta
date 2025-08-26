# EJEMPLO: Componente Inicio Refactorizado

## Integración del servicio getIphCountByUsers()

Una vez que el endpoint esté disponible, aquí tienes el ejemplo de cómo integrar el nuevo servicio en el componente Inicio refactorizado:

```typescript
// src/components/private/dashboard/Inicio.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios refactorizados
import { 
  getResumenEstadisticas,
  getVariacionResumen, 
  getResumenPorSemana,
  getResumenPorMes,
  // !Descomentar cuando este listo el endpoint
  // getIphCountByUsers
} from '../../../services/statistics/iph/statistics.service';

// Sistema de roles actualizado
import { isUserAuthenticated, getUserFromStorage } from '../../../helper/navigation/navigation.helper';
import { hasAccessToRoute } from '../../../helper/navigation/navigation.helper';
import { ALLOWED_ROLES } from '../../../config/env.config';

// Notificaciones y logging
import { showError } from '../../../helper/notification/notification.helper';
import { logInfo, logError } from '../../../helper/log/logger.helper';

// Interfaces
import type { 
  IResumenPorTipo,
  IVariacionResumen,
  IResumenPorSemana,
  IResumenPorMes,
  // !Descomentar cuando este listo el endpoint  
  // IUsuarioIphCountResponse
} from '../../../interfaces/statistics/statistics.interface';

// Subcomponentes (a crear en archivos separados)
import ResumenCard from './cards/ResumenCard';
import GraficaCard from './cards/GraficaCard';
import GraficaSemanaCard from './cards/GraficaSemanaCard';
// !Descomentar cuando este listo el endpoint
// import GraficaUsuarios from './charts/GraficaUsuarios';

const Inicio: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<IResumenPorTipo | null>(null);
  const [variaciones, setVariaciones] = useState<IVariacionResumen | null>(null);
  const [datosPorSemana, setDatosPorSemana] = useState<IResumenPorSemana | null>(null);
  const [datosPorMes, setDatosPorMes] = useState<IResumenPorMes | null>(null);
  
  // !Descomentar cuando este listo el endpoint
  // const [datosUsuarios, setDatosUsuarios] = useState<IUsuarioIphCountResponse | null>(null);
  
  // Estados de controles
  const [semanaOffset, setSemanaOffset] = useState(0);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

  // Verificación de autorización con sistema de roles actualizado
  const verificarAutorizacion = useCallback(() => {
    try {
      if (!isUserAuthenticated()) {
        navigate('/');
        return;
      }

      const userData = getUserFromStorage();
      if (!userData) {
        navigate('/');
        return;
      }

      // Verificar si el usuario tiene acceso (no es solo "elemento")
      const tieneAcceso = userData.roles.some(role => 
        ALLOWED_ROLES.some(allowedRole => 
          allowedRole.id === role.id && allowedRole.nombre.toLowerCase() !== 'elemento'
        )
      );

      setAutorizado(tieneAcceso);
      
      if (!tieneAcceso) {
        logInfo('InicioComponent', 'Acceso denegado para usuario con rol elemento');
      }

    } catch (error) {
      logError('InicioComponent', error, 'Error verificando autorización');
      setAutorizado(false);
    }
  }, [navigate]);

  // Carga de datos con manejo de errores mejorado
  const cargarDatos = useCallback(async () => {
    if (!autorizado) return;
    
    setLoading(true);
    
    try {
      const añoActual = new Date().getFullYear();
      const añoAnterior = añoActual - 1;

      // Cargar todas las estadísticas en paralelo
      const [
        resumenData,
        variacionesData,
        semanaData,
        mesData
      ] = await Promise.allSettled([
        getResumenEstadisticas(añoActual),
        getVariacionResumen(añoActual, añoAnterior),
        getResumenPorSemana(-1),
        getResumenPorMes(anioSeleccionado)
      ]);

      // Procesar resultados
      if (resumenData.status === 'fulfilled') {
        setResumen(resumenData.value);
      } else {
        showError('Error cargando resumen de estadísticas');
        logError('InicioComponent', resumenData.reason, 'Error cargando resumen');
      }

      if (variacionesData.status === 'fulfilled') {
        setVariaciones(variacionesData.value);
      } else {
        showError('Error cargando variaciones');
        logError('InicioComponent', variacionesData.reason, 'Error cargando variaciones');
      }

      if (semanaData.status === 'fulfilled') {
        setDatosPorSemana(semanaData.value);
      } else {
        showError('Error cargando datos por semana');
        logError('InicioComponent', semanaData.reason, 'Error cargando semana');
      }

      if (mesData.status === 'fulfilled') {
        setDatosPorMes(mesData.value);
      } else {
        showError('Error cargando datos por mes');
        logError('InicioComponent', mesData.reason, 'Error cargando mes');
      }

      // !Descomentar cuando este listo el endpoint
      /*
      try {
        const usuariosData = await getIphCountByUsers(
          new Date().getMonth() + 1, // Mes actual
          new Date().getFullYear(),  // Año actual
          1,  // Página 1
          10  // Límite 10
        );
        setDatosUsuarios(usuariosData);
      } catch (error) {
        showError('Error cargando datos de usuarios');
        logError('InicioComponent', error, 'Error cargando datos usuarios');
      }
      */

    } catch (error) {
      showError('Error general cargando dashboard');
      logError('InicioComponent', error, 'Error general dashboard');
    } finally {
      setLoading(false);
    }
  }, [autorizado, anioSeleccionado]);

  // Effects
  useEffect(() => {
    verificarAutorizacion();
  }, [verificarAutorizacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejo de cambios en controles
  const handleAnioChange = useCallback((nuevoAnio: number) => {
    setAnioSeleccionado(nuevoAnio);
  }, []);

  const handleSemanaChange = useCallback((nuevoOffset: number) => {
    setSemanaOffset(nuevoOffset);
  }, []);

  // Estados de carga
  if (autorizado === null || loading) {
    return (
      <div className="min-h-screen p-6 bg-[#f8f0e7] text-[#4d4725] flex items-center justify-center">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen p-6 bg-[#f8f0e7] text-[#4d4725]">
        <h2 className="text-xl font-bold">Acceso restringido</h2>
        <p>No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#f8f0e7] min-h-screen text-[#4d4725]">
      
      {/* Tarjetas de resumen */}
      {resumen && variaciones && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Justicia Cívica */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-4">Justicia Civil</h2>
            <div className="grid grid-cols-2 gap-4">
              <ResumenCard 
                tipo="Con Detenidos" 
                cantidad={resumen.justicia.conDetenido} 
                variacion={variaciones.justicia.con} 
                icono="🪪" 
                positivo 
              />
              <ResumenCard 
                tipo="Sin Detenidos" 
                cantidad={resumen.justicia.sinDetenido} 
                variacion={variaciones.justicia.sin} 
                icono="🧍‍♂️" 
              />
            </div>
          </div>

          {/* Probable Delictivo */}
          <div className="bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-4">Probable Delictivo</h2>
            <div className="grid grid-cols-2 gap-4">
              <ResumenCard 
                tipo="Con Detenidos" 
                cantidad={resumen.delito.conDetenido} 
                variacion={variaciones.delito.con} 
                icono="👮" 
                positivo 
              />
              <ResumenCard 
                tipo="Sin Detenidos" 
                cantidad={resumen.delito.sinDetenido} 
                variacion={variaciones.delito.sin} 
                icono="⛓️" 
                positivo 
              />
            </div>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datosPorSemana && (
          <GraficaSemanaCard 
            titulo="Reportes de IPH Día" 
            data={datosPorSemana} 
            semanaOffset={semanaOffset} 
            onSemanaChange={handleSemanaChange}
          />
        )}
        
        {datosPorMes && (
          <GraficaCard 
            titulo="Reportes de IPH Mensual" 
            data={datosPorMes} 
            anioSeleccionado={anioSeleccionado} 
            onAnioChange={handleAnioChange}
          />
        )}
      </div>
      
      {/* Gráfica de usuarios */}
      {/* !Descomentar cuando este listo el endpoint */}
      {/*
      <div className="mt-6 bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-4">IPH por Usuario</h3>
        {datosUsuarios && (
          <GraficaUsuarios data={datosUsuarios.data} />
        )}
      </div>
      */}
    </div>
  );
};

export default Inicio;
```

## Características del Servicio Implementado

### Parámetros Configurables:
- **`mes`**: Número del 1-12 (por defecto: mes actual)
- **`anio`**: Año de consulta (por defecto: año actual) 
- **`page`**: Página para paginación (por defecto: 1)
- **`limit`**: Registros por página (por defecto: 10)

### Valores por Defecto con Date:
```typescript
mes: number = new Date().getMonth() + 1    // Mes actual (1-12)
anio: number = new Date().getFullYear()    // Año actual
page: number = 1                           // Primera página
limit: number = 10                         // 10 registros (como legacy)
```

### Respuesta Tipada:
```typescript
interface IUsuarioIphCountResponse {
  data: IUsuarioIphCount[];  // Array de usuarios con IPH
  total?: number;            // Total de registros
  page?: number;             // Página actual
  limit?: number;            // Límite por página
}

interface IUsuarioIphCount {
  nombre_completo: string;   // Nombre del usuario
  total_iphs: number;        // Cantidad de IPHs
  photo: string;             // URL de foto
}
```

## Instrucciones de Activación

1. **Cuando el endpoint esté listo:**
   - Descomentar las líneas marcadas con `//!Descomentar cuando este listo el endpoint`
   - Verificar que el endpoint responda en la ruta esperada
   - Probar con diferentes parámetros

2. **Testing recomendado:**
   ```typescript
   // Probar con diferentes parámetros
   await getIphCountByUsers(7, 2025, 1, 10);  // Julio 2025
   await getIphCountByUsers();                // Valores por defecto
   ```

## Estado Actual
✅ **Servicio implementado y tipado**  
✅ **Parámetros configurables con valores por defecto**  
✅ **Documentación completa**  
⏳ **Esperando endpoint del backend**