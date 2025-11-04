/**
 * @fileoverview Interfaces para datos de usuario almacenados en sessionStorage
 * @version 1.0.0
 * @description Define la estructura de datos del usuario después del login
 */

/**
 * Interface para datos básicos del usuario almacenados en sessionStorage
 *
 * @interface UserData
 * @description Estructura que coincide con los datos guardados en sessionStorage
 * después de un login exitoso (ver login.service.ts:152-160)
 *
 * @property {string} id - ID único del usuario
 * @property {string} nombre - Primer nombre del usuario
 * @property {string} primer_apellido - Primer apellido del usuario
 * @property {string} [segundo_apellido] - Segundo apellido (opcional)
 * @property {string} [foto] - URL o path de la foto de perfil (opcional)
 *
 * @example
 * ```typescript
 * const userData: UserData = {
 *   id: '123',
 *   nombre: 'Juan',
 *   primer_apellido: 'Pérez',
 *   segundo_apellido: 'García',
 *   foto: '/assets/avatars/juan.jpg'
 * };
 * ```
 */
export interface UserData {
  /** ID único del usuario */
  id: string;

  /** Primer nombre del usuario */
  nombre: string;

  /** Primer apellido del usuario */
  primer_apellido: string;

  /** Segundo apellido del usuario (opcional) */
  segundo_apellido?: string;

  /** URL o path de la foto de perfil (opcional) */
  foto?: string;
}

/**
 * Interface para el contexto completo del usuario con metadata adicional
 *
 * @interface UserContext
 * @description Contexto extendido que incluye datos del usuario y metadata útil
 *
 * @property {UserData} userData - Datos básicos del usuario
 * @property {string} fullName - Nombre completo formateado
 * @property {string | null} avatarUrl - URL de la foto de perfil o null
 * @property {boolean} hasAvatar - Indica si el usuario tiene foto de perfil
 *
 * @example
 * ```typescript
 * const context: UserContext = {
 *   userData: { id: '123', nombre: 'Juan', ... },
 *   fullName: 'Juan Pérez García',
 *   avatarUrl: '/assets/avatars/juan.jpg',
 *   hasAvatar: true
 * };
 * ```
 */
export interface UserContext {
  /** Datos básicos del usuario */
  userData: UserData;

  /** Nombre completo formateado */
  fullName: string;

  /** URL de la foto de perfil o null si no tiene */
  avatarUrl: string | null;

  /** Indica si el usuario tiene foto de perfil */
  hasAvatar: boolean;
}

/**
 * Type para opciones de formateo de nombre
 *
 * @type FormatNameOptions
 * @description Opciones para personalizar el formateo del nombre completo
 *
 * @property {boolean} [includeSecondLastName=true] - Incluir segundo apellido
 * @property {boolean} [uppercase=false] - Convertir a mayúsculas
 * @property {boolean} [firstNameOnly=false] - Solo el primer nombre
 *
 * @example
 * ```typescript
 * const options: FormatNameOptions = {
 *   includeSecondLastName: true,
 *   uppercase: false,
 *   firstNameOnly: false
 * };
 * ```
 */
export type FormatNameOptions = {
  /** Incluir segundo apellido en el nombre completo */
  includeSecondLastName?: boolean;

  /** Convertir el nombre a mayúsculas */
  uppercase?: boolean;

  /** Retornar solo el primer nombre */
  firstNameOnly?: boolean;
};
