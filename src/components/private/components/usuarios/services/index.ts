/**
 * Barrel export para servicios de usuarios
 * Centraliza todas las exportaciones relacionadas con gestión de usuarios
 */

// Servicio de estadísticas de usuarios
export {
  getEstadisticasUsuarios,
  getUsuarioMetricas,
  calcularEstadisticasFromUsers,
  validarEstadisticas,
  formatearMetricas,
  getTendenciaColor,
  getTendenciaIcon
} from './usuarios-estadisticas.service';

// Servicio de búsqueda de usuarios por nombre
export {
  buscarUsuariosPorNombre,
  validarParametrosBusqueda,
  sanitizarTerminoBusqueda,
  formatearNombreCompleto,
  obtenerIniciales
} from '../../gestion-grupos/components/UsuariosGrupoView/services/buscar-usuario-nombre.service';
