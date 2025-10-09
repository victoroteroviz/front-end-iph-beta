/**
 * @fileoverview Constantes de mensajes para Gestión de Grupos
 * @version 1.0.0
 * @description Centraliza todos los mensajes de UI para facilitar i18n
 */

export const MESSAGES = {
  // Títulos
  titles: {
    main: 'Gestión de Grupos',
    newGrupo: 'Nuevo Grupo',
    editGrupo: 'Editar Grupo',
    grupoDetail: 'Detalle del Grupo',
    usuariosEnGrupos: 'Usuarios en Grupos',
    asignarUsuario: 'Asignar Usuario a Grupo',
  },

  // Descripciones
  descriptions: {
    main: 'Administra grupos de usuarios del sistema',
    formDescription: 'Complete la información del grupo',
  },

  // Placeholders
  placeholders: {
    searchGrupos: 'Buscar grupos por nombre...',
    nombreGrupo: 'Ej: Grupo Táctico Operativo',
    descripcionGrupo: 'Ej: Unidad especializada en operaciones de alto riesgo y respuesta inmediata',
    usuarioId: 'Ingresa el ID del usuario',
    selectGrupo: 'Selecciona un grupo',
  },

  // Botones
  buttons: {
    newGrupo: 'Nuevo Grupo',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Volver',
    backToList: 'Volver a la lista',
    viewUsers: 'Ver Usuarios',
    assignUser: 'Asignar Usuario',
    createGrupo: 'Crear Grupo',
    updateGrupo: 'Actualizar Grupo',
  },

  // Estados de carga
  loading: {
    grupos: 'Cargando grupos...',
    usuarios: 'Cargando usuarios...',
    estadisticas: 'Cargando estadísticas...',
    creating: 'Creando grupo...',
    updating: 'Actualizando grupo...',
    deleting: 'Eliminando grupo...',
    assigning: 'Asignando usuario...',
  },

  // Estados vacíos
  empty: {
    noGrupos: 'No hay grupos',
    noGruposDescription: 'Aún no se han creado grupos en el sistema',
    noResults: 'No se encontraron grupos que coincidan con tu búsqueda',
    noUsuarios: 'No hay usuarios asignados',
    noUsuariosDescription: 'Este grupo aún no tiene usuarios asignados.',
  },

  // Validaciones
  validation: {
    nombreRequired: 'El nombre del grupo es requerido',
    nombreMinLength: 'El nombre debe tener al menos 3 caracteres',
    nombreMaxLength: 'El nombre no puede exceder 50 caracteres',
    descripcionMaxLength: 'La descripción no puede exceder 200 caracteres',
    usuarioRequired: 'El ID del usuario es requerido',
    grupoRequired: 'Selecciona un grupo',
  },

  // Confirmaciones
  confirmations: {
    deleteGrupo: '¿Estás seguro de que deseas eliminar este grupo?',
    deleteGrupoDetail: 'Esta acción no se puede deshacer. El grupo será eliminado permanentemente.',
    unsavedChanges: 'Tienes cambios sin guardar. ¿Deseas descartarlos?',
  },

  // Mensajes de éxito
  success: {
    grupoCreated: 'Grupo creado exitosamente',
    grupoUpdated: 'Grupo actualizado exitosamente',
    grupoDeleted: 'Grupo eliminado exitosamente',
    usuarioAssigned: 'Usuario asignado exitosamente',
  },

  // Mensajes de error
  errors: {
    loadGrupos: 'Error al cargar los grupos',
    createGrupo: 'Error al crear el grupo',
    updateGrupo: 'Error al actualizar el grupo',
    deleteGrupo: 'Error al eliminar el grupo',
    assignUser: 'Error al asignar el usuario al grupo',
    noPermission: 'No tienes permisos para realizar esta acción',
    accessDenied: 'Acceso Denegado',
    noPermissionView: 'No tienes permisos para acceder a la gestión de grupos.',
  },

  // Etiquetas
  labels: {
    nombreGrupo: 'Nombre del Grupo',
    descripcion: 'Descripción',
    usuarioId: 'ID del Usuario',
    grupo: 'Grupo',
    estado: 'Estado',
    activo: 'Activo',
    inactivo: 'Inactivo',
    totalGrupos: 'Total Grupos',
    gruposActivos: 'Activos',
    gruposInactivos: 'Inactivos',
    cantidadUsuarios: 'usuarios',
  },

  // Estadísticas
  stats: {
    totalUsuarios: 'Total Usuarios',
    usuariosAsignados: 'Asignados',
    usuariosSinGrupo: 'Sin Grupo',
    gruposActivos: 'Grupos Activos',
    gruposInactivos: 'Grupos Inactivos',
  },
} as const;
