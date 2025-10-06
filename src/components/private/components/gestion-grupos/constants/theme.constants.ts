/**
 * @fileoverview Constantes de tema para Gestión de Grupos
 * @version 1.0.0
 * @description Centraliza colores y estilos para evitar magic strings
 */

/**
 * Paleta de colores del tema
 */
export const COLORS = {
  primary: '#4d4725',
  primaryLight: '#4d472515',
  primaryLight20: '#4d472520',
  primaryLight40: '#4d472540',
  primaryBorder: '#b8ab8440',
  background: '#f8f0e7',
  
  // Estados
  success: '#10b981',
  successBg: '#d1fae5',
  successText: '#065f46',
  
  error: '#ef4444',
  errorBg: '#fee2e2',
  errorText: '#991b1b',
  
  warning: '#f59e0b',
  warningBg: '#fef3c7',
  warningText: '#92400e',
  
  info: '#3b82f6',
  infoBg: '#dbeafe',
  infoText: '#1e40af',
  
  // Neutros
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  white: '#ffffff',
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

/**
 * Dimensiones y espaciados
 */
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

/**
 * Tamaños de iconos
 */
export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
} as const;
