/**
 * Servicio para estadísticas de usuarios
 * Implementa patrón mock/real para facilitar migración futura a API real
 */

import { logInfo, logError } from '../../helper/log/logger.helper';
// import { HttpHelper } from '../../helper/http/http.helper'; // Para futuras implementaciones reales
// import { API_BASE_URL } from '../../config/env.config'; // Para futuras implementaciones reales
import type {
  IEstadisticasUsuarios,
  IUsuarioMetricas,
  IEstadisticasResponse,
  IUsuarioMetricasResponse
} from '../../interfaces/components/usuarios.interface';
import type { IPaginatedUsers } from '../../interfaces/user/crud/get-paginated.users.interface';

// =====================================================
// CONFIGURACIÓN MOCK/REAL
// =====================================================

const USE_MOCK_DATA = true; // Cambiar a false cuando API esté lista

// TODO: Descomentar cuando se implemente API real
// const http: HttpHelper = HttpHelper.getInstance({
//   baseURL: API_BASE_URL || '',
//   timeout: 10000,
//   retries: 3,
//   defaultHeaders: {
//     'Content-Type': 'application/json'
//   }
// });

// =====================================================
// FUNCIONES PRINCIPALES
// =====================================================

/**
 * Obtiene estadísticas generales de usuarios
 * @returns Estadísticas de rendimiento de usuarios
 */
export const getEstadisticasUsuarios = async (): Promise<IEstadisticasResponse> => {
  logInfo('UsuariosEstadisticasService', 'Obteniendo estadísticas generales');
  
  try {
    if (USE_MOCK_DATA) {
      return await getMockEstadisticas();
    } else {
      return await getRealEstadisticas();
    }
  } catch (error) {
    logError('UsuariosEstadisticasService', 'Error al obtener estadísticas', { error });
    throw error;
  }
};

/**
 * Obtiene métricas específicas de un usuario
 * @param userId - ID del usuario
 * @returns Métricas detalladas del usuario
 */
export const getUsuarioMetricas = async (userId: string): Promise<IUsuarioMetricasResponse> => {
  logInfo('UsuariosEstadisticasService', 'Obteniendo métricas de usuario', { userId });
  
  try {
    if (USE_MOCK_DATA) {
      return await getMockUsuarioMetricas(userId);
    } else {
      return await getRealUsuarioMetricas(userId);
    }
  } catch (error) {
    logError('UsuariosEstadisticasService', 'Error al obtener métricas de usuario', { userId, error });
    throw error;
  }
};

/**
 * Calcula estadísticas basadas en lista de usuarios (fallback)
 * @param usuarios - Lista de usuarios para calcular estadísticas
 * @returns Estadísticas calculadas
 */
export const calcularEstadisticasFromUsers = (usuarios: IPaginatedUsers[]): IEstadisticasUsuarios => {
  logInfo('UsuariosEstadisticasService', 'Calculando estadísticas desde lista de usuarios', {
    totalUsuarios: usuarios.length
  });

  if (usuarios.length === 0) {
    return getDefaultEstadisticas();
  }

  // Simulación de cálculos reales basados en usuarios existentes
  const usuarioAleatorio1 = usuarios[Math.floor(Math.random() * usuarios.length)];
  const usuarioAleatorio2 = usuarios[Math.floor(Math.random() * usuarios.length)];
  const usuarioAleatorio3 = usuarios[Math.floor(Math.random() * usuarios.length)];

  return {
    masIph: {
      id: usuarioAleatorio1.id,
      nombre: `${usuarioAleatorio1.nombre} ${usuarioAleatorio1.primer_apellido}`,
      descripcion: `${Math.floor(Math.random() * 50) + 20} IPH creados`,
      imagen: usuarioAleatorio1.photo || getDefaultAvatar(),
      color: 'green'
    },
    mejorTiempo: {
      id: usuarioAleatorio2.id,
      nombre: `${usuarioAleatorio2.nombre} ${usuarioAleatorio2.primer_apellido}`,
      descripcion: `${Math.floor(Math.random() * 30) + 70}% efectividad`,
      imagen: usuarioAleatorio2.photo || getDefaultAvatar(),
      color: 'green'
    },
    peorRendimiento: {
      id: usuarioAleatorio3.id,
      nombre: `${usuarioAleatorio3.nombre} ${usuarioAleatorio3.primer_apellido}`,
      descripcion: `${Math.floor(Math.random() * 10) + 1} IPH completados`,
      imagen: usuarioAleatorio3.photo || getDefaultAvatar(),
      color: 'red'
    }
  };
};

// =====================================================
// FUNCIONES MOCK (DATOS DE DESARROLLO)
// =====================================================

// TODO: Remover cuando API real esté disponible
// @JSDoc - Estas funciones simulan respuestas del backend

const getMockEstadisticas = async (): Promise<IEstadisticasResponse> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockData: IEstadisticasUsuarios = {
    masIph: {
      id: '1',
      nombre: 'María López Hernández',
      descripcion: '42 IPH creados este mes',
      imagen: '', // Usará ícono de fallback
      color: 'green'
    },
    mejorTiempo: {
      id: '2',
      nombre: 'Luis Martínez García',
      descripcion: '87% de efectividad promedio',
      imagen: '', // Usará ícono de fallback
      color: 'green'
    },
    peorRendimiento: {
      id: '3',
      nombre: 'Carlos González Ruiz',
      descripción: '8 IPH pendientes de completar',
      imagen: '', // Usará ícono de fallback
      color: 'red'
    }
  };

  return {
    success: true,
    data: mockData
  };
};

const getMockUsuarioMetricas = async (userId: string): Promise<IUsuarioMetricasResponse> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const mockMetricas: IUsuarioMetricas = {
    totalIph: Math.floor(Math.random() * 100) + 10,
    iphCompletados: Math.floor(Math.random() * 80) + 5,
    iphPendientes: Math.floor(Math.random() * 20) + 1,
    tiempoPromedio: `${Math.floor(Math.random() * 48) + 12} horas`,
    efectividad: `${Math.floor(Math.random() * 30) + 65}%`,
    ranking: Math.floor(Math.random() * 50) + 1,
    tendencia: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
  };

  return {
    success: true,
    data: mockMetricas
  };
};

const getDefaultEstadisticas = (): IEstadisticasUsuarios => ({
  masIph: {
    id: 'default',
    nombre: 'Usuario Ejemplo',
    descripcion: 'Sin datos disponibles',
    imagen: getDefaultAvatar(),
    color: 'blue'
  },
  mejorTiempo: {
    id: 'default',
    nombre: 'Usuario Ejemplo',
    descripcion: 'Sin datos disponibles',
    imagen: getDefaultAvatar(),
    color: 'blue'
  },
  peorRendimiento: {
    id: 'default',
    nombre: 'Usuario Ejemplo',
    descripcion: 'Sin datos disponibles',
    imagen: getDefaultAvatar(),
    color: 'blue'
  }
});

const getDefaultAvatar = (): string => ''; // Retorna vacío para usar ícono de fallback en componente

// =====================================================
// FUNCIONES REALES (PARA FUTURA IMPLEMENTACIÓN)
// =====================================================

// TODO: Implementar cuando API esté disponible
// @JSDoc - Estas funciones se conectarán al backend real

const getRealEstadisticas = async (): Promise<IEstadisticasResponse> => {
  // TODO: Reemplazar con llamada real al API
  // const response = await http.get('/api/usuarios/estadisticas');
  // return response.data;
  
  throw new Error('API de estadísticas no implementada aún');
};

const getRealUsuarioMetricas = async (userId: string): Promise<IUsuarioMetricasResponse> => {
  // TODO: Reemplazar con llamada real al API
  // const response = await http.get(`/api/usuarios/${userId}/metricas`);
  // return response.data;
  
  throw new Error(`API de métricas de usuario ${userId} no implementada aún`);
};

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Valida si las estadísticas son válidas
 */
export const validarEstadisticas = (estadisticas: IEstadisticasUsuarios): boolean => {
  return !!(
    estadisticas.masIph?.nombre &&
    estadisticas.mejorTiempo?.nombre &&
    estadisticas.peorRendimiento?.nombre
  );
};

/**
 * Formatea métricas para visualización
 */
export const formatearMetricas = (metricas: IUsuarioMetricas): Record<string, string> => {
  return {
    'Total IPH': metricas.totalIph.toString(),
    'Completados': metricas.iphCompletados.toString(),
    'Pendientes': metricas.iphPendientes.toString(),
    'Tiempo Promedio': metricas.tiempoPromedio,
    'Efectividad': metricas.efectividad,
    'Ranking': `#${metricas.ranking}`
  };
};

/**
 * Obtiene el color de tendencia
 */
export const getTendenciaColor = (tendencia: 'up' | 'down' | 'stable'): string => {
  const colores = {
    up: 'text-green-600',
    down: 'text-red-600', 
    stable: 'text-gray-600'
  };
  return colores[tendencia];
};

/**
 * Obtiene el ícono de tendencia
 */
export const getTendenciaIcon = (tendencia: 'up' | 'down' | 'stable'): string => {
  const iconos = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  };
  return iconos[tendencia];
};