/**
 * Mock data para estadísticas del historial IPH
 * Datos ficticios calculados basados en los registros
 */

import type { EstadisticasHistorial } from '../../interfaces/components/historialIph.interface';
import { registrosMockData } from './registros.mock';

/**
 * Calcula estadísticas basadas en los registros mock
 */
const calculateEstadisticas = (): EstadisticasHistorial => {
  const total_registros = registrosMockData.length;
  
  // Contar por estatus
  const activos = registrosMockData.filter(r => r.estatus === 'Activo').length;
  const inactivos = registrosMockData.filter(r => r.estatus === 'Inactivo').length;
  const pendientes = registrosMockData.filter(r => r.estatus === 'Pendiente').length;
  const cancelados = registrosMockData.filter(r => r.estatus === 'Cancelado').length;
  
  // Calcular registros del mes actual
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear();
  
  const total_mes_actual = registrosMockData.filter(registro => {
    const fechaRegistro = new Date(registro.fecha);
    return (
      fechaRegistro.getMonth() + 1 === mesActual &&
      fechaRegistro.getFullYear() === anioActual
    );
  }).length;
  
  // Calcular promedio diario (basado en 30 días)
  const promedio_diario = Math.round((total_mes_actual / 30) * 10) / 10;
  
  return {
    total_registros,
    activos,
    inactivos,
    pendientes,
    cancelados,
    total_mes_actual,
    promedio_diario
  };
};

/**
 * Estadísticas mock calculadas
 */
export const estadisticasMockData: EstadisticasHistorial = calculateEstadisticas();

/**
 * Función para obtener estadísticas con filtros aplicados
 */
export const getEstadisticasWithFilters = (
  registrosFiltrados: import('../../interfaces/components/historialIph.interface').RegistroHistorialIPH[]
): EstadisticasHistorial => {
  const total_registros = registrosFiltrados.length;
  
  // Contar por estatus en registros filtrados
  const activos = registrosFiltrados.filter(r => r.estatus === 'Activo').length;
  const inactivos = registrosFiltrados.filter(r => r.estatus === 'Inactivo').length;
  const pendientes = registrosFiltrados.filter(r => r.estatus === 'Pendiente').length;
  const cancelados = registrosFiltrados.filter(r => r.estatus === 'Cancelado').length;
  
  // Calcular registros del mes actual en los filtrados
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear();
  
  const total_mes_actual = registrosFiltrados.filter(registro => {
    const fechaRegistro = new Date(registro.fecha);
    return (
      fechaRegistro.getMonth() + 1 === mesActual &&
      fechaRegistro.getFullYear() === anioActual
    );
  }).length;
  
  // Calcular promedio diario basado en registros filtrados
  const promedio_diario = Math.round((total_mes_actual / 30) * 10) / 10;
  
  return {
    total_registros,
    activos,
    inactivos,
    pendientes,
    cancelados,
    total_mes_actual,
    promedio_diario
  };
};

/**
 * Configuraciones adicionales para estadísticas
 */
export const estatusConfig = {
  Activo: {
    color: '#10b981', // green-500
    bgColor: '#dcfce7', // green-100
    label: 'Activos'
  },
  Inactivo: {
    color: '#6b7280', // gray-500
    bgColor: '#f3f4f6', // gray-100
    label: 'Inactivos'
  },
  Pendiente: {
    color: '#f59e0b', // amber-500
    bgColor: '#fef3c7', // amber-100
    label: 'Pendientes'
  },
  Cancelado: {
    color: '#ef4444', // red-500
    bgColor: '#fee2e2', // red-100
    label: 'Cancelados'
  },
  'N/D': {
    color: '#6b7280', // gray-500
    bgColor: '#e5e7eb', // gray-200
    label: 'No Disponible'
  }
} as const;

/**
 * Opciones de tipos de delito para filtros
 */
export const tiposDelitoOptions = [
  'Robo a casa habitación',
  'Asalto a transeúnte',
  'Alteración del orden público',
  'Hurto menor',
  'Daños a propiedad privada',
  'Violencia intrafamiliar',
  'Robo a establecimiento',
  'Accidente de tránsito',
  'Vandalismo',
  'Extravío de menores',
  'Riña callejera',
  'Disturbios en establecimiento',
  'Robo de vehículo',
  'Agresión física',
  'Actos contra la flora y fauna'
] as const;