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
  
  // Estados de controles
  const [controls, setControls] = useState<DashboardControls>({
    semanaOffset: 0,
    anioSeleccionado: new Date().getFullYear(),
    setSemanaOffset: (offset) => {
      setControls(prev => ({
        ...prev,
        semanaOffset: typeof offset === 'function' ? offset(prev.semanaOffset) : offset
      }));
    },
    setAnioSeleccionado: (anio) => {
      setControls(prev => ({
        ...prev,
        anioSeleccionado: anio
      }));
    }
  });

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

  // Carga optimizada de datos con Promise.allSettled
  const cargarDatos = useCallback(async () => {
    if (state.autorizado === false) return; // Solo retornar si explícitamente no autorizado
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const añoActual = controls.anioSeleccionado;
      const añoAnterior = añoActual - 1;

      // Cargar todos los datos en paralelo
      const resultados = await Promise.allSettled([
        getResumenEstadisticas(añoActual),
        getVariacionResumen(añoActual, añoAnterior),
        getResumenPorSemana(controls.semanaOffset),
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
  }, [state.autorizado, controls.anioSeleccionado, controls.semanaOffset]);

  // Effects
  useEffect(() => {
    verificarAutorizacion();
  }, [verificarAutorizacion]);

  useEffect(() => {
    if (state.autorizado === true) {
      cargarDatos();
    }
  }, [state.autorizado, cargarDatos]);

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
    semanaOffset: controls.semanaOffset,
    anioSeleccionado: controls.anioSeleccionado,
    setSemanaOffset: controls.setSemanaOffset,
    setAnioSeleccionado: controls.setAnioSeleccionado,
    
    // Funciones
    recargarDatos: cargarDatos
  };
};

export default useInicioDashboard;