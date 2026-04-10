/**
 * @fileoverview Constantes de tema para Gestión de Grupos
 * @version 1.0.0
 * @description Centraliza colores y estilos para evitar magic strings
 */

/**
 * Paleta de colores del tema
 */
export const COLORS = {
  primary: 'var(--color-iph-primary)',
  primaryLight: 'var(--color-iph-primary-alpha-08)',
  primaryLight20: 'var(--color-iph-primary-alpha-12)',
  primaryLight40: 'var(--color-iph-primary-alpha-25)',
  primaryBorder: 'var(--color-iph-border-soft)',
  background: 'var(--color-iph-background)',
  
  // Estados
  success: 'var(--color-state-success)',
  successBg: 'var(--color-state-success-bg)',
  successText: 'var(--color-state-success-text)',
  
  error: 'var(--color-state-danger)',
  errorBg: 'var(--color-state-danger-bg)',
  errorText: 'var(--color-state-danger-text)',
  
  warning: 'var(--color-state-warning)',
  warningBg: 'var(--color-state-warning-bg)',
  warningText: 'var(--color-state-warning-text)',
  
  info: 'var(--color-state-info)',
  infoBg: 'var(--color-state-info-bg)',
  infoText: 'var(--color-state-info-text)',
  
  // Neutros
  gray50: 'var(--color-neutral-50)',
  gray100: 'var(--color-neutral-100)',
  gray200: 'var(--color-neutral-200)',
  gray300: 'var(--color-neutral-300)',
  gray400: 'var(--color-neutral-400)',
  gray500: 'var(--color-neutral-500)',
  gray600: 'var(--color-neutral-600)',
  gray700: 'var(--color-neutral-700)',
  gray800: 'var(--color-neutral-800)',
  gray900: 'var(--color-neutral-900)',
  
  white: 'var(--color-neutral-white)',
} as const;

/**
 * Estilos comunes reutilizables
 */
export const COMMON_STYLES = {
  card: 'bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200',
  cardNoBorder: 'bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-200',
  
  button: {
    primary: 'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50',
    secondary: 'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    ghost: 'inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200',
  },
  
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  inputError: 'w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent',
  
  badge: {
    success: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    error: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    warning: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    info: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
  },
  
  iconContainer: 'flex items-center justify-center w-12 h-12 rounded-lg',
} as const;
