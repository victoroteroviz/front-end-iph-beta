import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios
import { 
  getResumenEstadisticas,
  getVariacionResumen, 
  getResumenPorSemana,
  getResumenPorMes,
  //! Descomentar cuando este listo el endpoint
  // getIphCountByUsers
} from '../../../../../services/statistics/iph/statistics.service';

// Sistema de roles
import { isUserAuthenticated, getUserFromStorage } from '../../../../../helper/navigation/navigation.helper';
import { ALLOWED_ROLES } from '../../../../../config/env.config';

// Notificaciones y logging
import { showError } from '../../../../../helper/notification/notification.helper';
import { logError } from '../../../../../helper/log/logger.helper';

// Context
import { useScrollContext } from '../../../../../contexts/ScrollContext';

// Interfaces
import type { 
  IResumenPorTipo,
  IVariacionResumen,
  IResumenPorSemana,
  IResumenPorMes,
  //! Descomentar cuando este listo el endpoint  
  // IUsuarioIphCountResponse
} from '../../../../../interfaces/statistics/statistics.interface';

interface DashboardState {
  autorizado: boolean | null;
  loading: boolean;
  resumen: IResumenPorTipo;
  variaciones: IVariacionResumen;
  datosPorSemana: IResumenPorSemana | null;
  datosPorMes: IResumenPorMes | null;
  //! Descomentar cuando este listo el endpoint
  // datosUsuarios: IUsuarioIphCountResponse | null;
}

interface DashboardControls {
  semanaOffset: number;
  anioSeleccionado: number;
  setSemanaOffset: (offset: number | ((prev: number) => number)) => void;
  setAnioSeleccionado: (anio: number) => void;
}

const useInicioDashboard = () => {
  const navigate = useNavigate();
  const { preserveScrollPosition, restoreScrollPosition } = useScrollContext();
  
  // Estados principales
  const [state, setState] = useState<DashboardState>({
    autorizado: null,
    loading: true,
    resumen: { 
      justicia: { conDetenido: 0, sinDetenido: 0 }, 
      delito: { conDetenido: 0, sinDetenido: 0 } 
    },
    variaciones: { 
      justicia: { con: 0, sin: 0 }, 
      delito: { con: 0, sin: 0 } 
    },
    datosPorSemana: null,
    datosPorMes: null,
    //! Descomentar cuando este listo el endpoint
    // datosUsuarios: null,
  });
  
  // Estados de controles - SEPARADOS para evitar recreación
  const [semanaOffset, setSemanaOffsetState] = useState(0);
  const [anioSeleccionado, setAnioSeleccionadoState] = useState(new Date().getFullYear());

  // Funciones de carga específicas (declarar antes de las funciones que las usan)
  const cargarDatosPorAnio = useCallback(async (anio: number) => {
    try {
      const añoAnterior = anio - 1;

      // Solo cargar datos que dependen del año
      const resultados = await Promise.allSettled([
        getResumenEstadisticas(anio),
        getVariacionResumen(anio, añoAnterior),
        getResumenPorMes(anio)
      ]);

      const [resumenResult, variacionesResult, mesResult] = resultados;

      setState(prev => {
        const newState = { ...prev };

        if (resumenResult.status === 'fulfilled') {
          newState.resumen = resumenResult.value;
        }

        if (variacionesResult.status === 'fulfilled') {
          newState.variaciones = variacionesResult.value;
        }

        if (mesResult.status === 'fulfilled') {
          newState.datosPorMes = mesResult.value;
        }

        return newState;
      });

    } catch (error) {
      logError('useInicioDashboard', error, 'Error cargando datos por año');
    }
  }, []);

  const cargarDatosPorSemana = useCallback(async (offset: number) => {
    try {
      const resultado = await getResumenPorSemana(offset);
      setState(prev => ({ ...prev, datosPorSemana: resultado }));
    } catch (error) {
      logError('useInicioDashboard', error, 'Error cargando datos por semana');
    }
  }, []);

  // Funciones memoizadas estables - DECLARADAS DESPUÉS de las funciones de carga
  const setSemanaOffset = useCallback((offset: number | ((prev: number) => number)) => {
    if (typeof offset === 'function') {
      setSemanaOffsetState(prev => {
        const newVal = offset(prev);
        cargarDatosPorSemana(newVal);
        return newVal;
      });
    } else {
      setSemanaOffsetState(offset);
      cargarDatosPorSemana(offset);
    }
  }, [cargarDatosPorSemana]);

  const setAnioSeleccionado = useCallback((anio: number) => {
    // Cambiar el estado local inmediatamente
    setAnioSeleccionadoState(anio);

    // Cargar solo los datos que dependen del año (sin recargar todo)
    cargarDatosPorAnio(anio);
  }, [cargarDatosPorAnio]);

  // Verificación de autorización
  const verificarAutorizacion = useCallback(() => {
    try {
      // Verificar autenticación básica
      if (!isUserAuthenticated()) {
        logError('useInicioDashboard', 'Usuario no autenticado', 'Redirigiendo a login');
        navigate('/');
        return false;
      }

      // Obtener datos del usuario desde sessionStorage
      const userData = getUserFromStorage();
      if (!userData || !userData.roles || userData.roles.length === 0) {
        logError('useInicioDashboard', 'No se encontraron datos de usuario o roles', 'Redirigiendo a login');
        navigate('/');
        return false;
      }

      // Verificar que el usuario tenga roles válidos del sistema
      const tieneRolesValidos = userData.roles.some(userRole => 
        ALLOWED_ROLES.some(allowedRole => allowedRole.id === userRole.id)
      );

      if (!tieneRolesValidos) {
        logError('useInicioDashboard', 'Usuario no tiene roles válidos', 'Acceso denegado');
        setState(prev => ({ ...prev, autorizado: false }));
        return false;
      }

      // Verificar que NO sea solo "elemento" (acceso restringido)
      const esElementoUnicamente = userData.roles.length === 1 && 
        userData.roles.some(userRole =>
          ALLOWED_ROLES.some(allowedRole => 
            allowedRole.id === userRole.id && 
            allowedRole.nombre.toLowerCase() === 'elemento'
          )
        );

      // Otorgar acceso si no es elemento únicamente
      const autorizado = !esElementoUnicamente;
      setState(prev => ({ ...prev, autorizado }));

      if (esElementoUnicamente) {
        logError('useInicioDashboard', 'Usuario con rol elemento únicamente', 'Acceso restringido');
      }

      return autorizado;

    } catch (error) {
      logError('useInicioDashboard', error, 'Error verificando autorización');
      setState(prev => ({ ...prev, autorizado: false }));
      return false;
    }
  }, [navigate]);

  // Carga inicial de datos (solo se ejecuta una vez)
  const cargarDatosIniciales = useCallback(async () => {
    if (state.autorizado === false) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const añoActual = new Date().getFullYear(); // Usar año actual, no el estado
      const añoAnterior = añoActual - 1;
      const offsetInicial = 0; // Usar offset inicial

      // Cargar todos los datos en paralelo para carga inicial
      const resultados = await Promise.allSettled([
        getResumenEstadisticas(añoActual),
        getVariacionResumen(añoActual, añoAnterior),
        getResumenPorSemana(offsetInicial),
        getResumenPorMes(añoActual)
      ]);

      // Procesar resultados
      const [resumenResult, variacionesResult, semanaResult, mesResult] = resultados;

      const newState = { ...state };

      if (resumenResult.status === 'fulfilled') {
        newState.resumen = resumenResult.value;
      } else {
        showError('Error cargando resumen de estadísticas');
        logError('useInicioDashboard', resumenResult.reason, 'Error cargando resumen');
      }

      if (variacionesResult.status === 'fulfilled') {
        newState.variaciones = variacionesResult.value;
      } else {
        showError('Error cargando variaciones');
        logError('useInicioDashboard', variacionesResult.reason, 'Error cargando variaciones');
      }

      if (semanaResult.status === 'fulfilled') {
        newState.datosPorSemana = semanaResult.value;
      } else {
        showError('Error cargando datos por semana');
        logError('useInicioDashboard', semanaResult.reason, 'Error cargando semana');
      }

      if (mesResult.status === 'fulfilled') {
        newState.datosPorMes = mesResult.value;
      } else {
        showError('Error cargando datos por mes');
        logError('useInicioDashboard', mesResult.reason, 'Error cargando mes');
      }

      //! Descomentar cuando este listo el endpoint
      /*
      try {
        const usuariosData = await getIphCountByUsers(
          new Date().getMonth() + 1, // Mes actual
          new Date().getFullYear(),  // Año actual
          1,  // Página 1
          10  // Límite 10
        );
        newState.datosUsuarios = usuariosData;
      } catch (error) {
        showError('Error cargando datos de usuarios');
        logError('useInicioDashboard', error, 'Error cargando datos usuarios');
      }
      */

      setState(prev => ({ ...prev, ...newState, loading: false }));

    } catch (error) {
      showError('Error general cargando dashboard');
      logError('useInicioDashboard', error, 'Error general dashboard');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.autorizado]);

  // Effects
  useEffect(() => {
    verificarAutorizacion();
  }, [verificarAutorizacion]);

  useEffect(() => {
    if (state.autorizado === true) {
      cargarDatosIniciales();
    }
  }, [state.autorizado, cargarDatosIniciales]);

  return {
    // Estados
    autorizado: state.autorizado,
    loading: state.loading,
    resumen: state.resumen,
    variaciones: state.variaciones,
    datosPorSemana: state.datosPorSemana,
    datosPorMes: state.datosPorMes,
    //! Descomentar cuando este listo el endpoint
    // datosUsuarios: state.datosUsuarios,
    
    // Controles
    semanaOffset,
    anioSeleccionado,
    setSemanaOffset,
    setAnioSeleccionado,
    
    // Funciones
    recargarDatos: cargarDatosIniciales
  };
};

export default useInicioDashboard;