/**
 * Enum para los parámetros de búsqueda de usuarios
 * Basado en los campos de la entidad UserEntity y las relaciones asociadas
 */
export enum UserSearchParams {
  // Campos de texto del usuario
  NOMBRE = 'nombre',
  PRIMER_APELLIDO = 'primer_apellido',
  SEGUNDO_APELLIDO = 'segundo_apellido',
  NOMBRE_COMPLETO = 'nombre_completo', // Búsqueda combinada de nombre + apellidos

  // Campos de contacto e identificación
  CORREO_ELECTRONICO = 'correo_electronico',
  TELEFONO = 'telefono',
  CUIP = 'cuip',
  CUP = 'cup',

  // Relaciones con otras entidades (se busca por el nombre de la relación)
  GRADO = 'grado',
  CARGO = 'cargo',
  ADSCRIPCION = 'adscripcion',

  // Campos adicionales útiles para búsqueda
  MUNICIPIO = 'municipio',
  SEXO = 'sexo'
}

/**
 * Enum para los parámetros de ordenamiento de usuarios
 * Define por qué campos se puede ordenar la lista de usuarios
 */
export enum UserOrderByParams {
  NOMBRE = 'nombre',
  PRIMER_APELLIDO = 'primer_apellido',
  SEGUNDO_APELLIDO = 'segundo_apellido',
  CORREO_ELECTRONICO = 'correo_electronico',
  TELEFONO = 'telefono',
  CUIP = 'cuip',
  CUP = 'cup',
  IS_ACTIVE = 'is_active',
  IS_VERIFIC = 'is_verific',
  ULTIMA_CONEXION = 'ultima_conexion',
  FECHA_REGISTRO = 'fecha_registro',
  FECHA_MODIFICACION = 'fecha_modificacion',

  // Ordenamiento por relaciones (se ordena por el nombre de la relación)
  GRADO_NOMBRE = 'grado.nombre',
  CARGO_NOMBRE = 'cargo.nombre',
  ADSCRIPCION_NOMBRE = 'adscripcion.nombre',
  MUNICIPIO_NOMBRE = 'municipio.nombre'
}

/**
 * Enum para el orden de la consulta
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

/**
 * Type helper para los valores válidos de búsqueda
 */
export type UserSearchBy = keyof typeof UserSearchParams;

/**
 * Type helper para los valores válidos de ordenamiento
 */
export type UserOrderBy = keyof typeof UserOrderByParams;