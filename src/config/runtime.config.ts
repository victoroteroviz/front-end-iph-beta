/**
 * Runtime Configuration Helper
 *
 * Este módulo maneja configuración que puede cambiar en runtime (Docker)
 * sin necesidad de rebuild.
 *
 * ORDEN DE PRECEDENCIA:
 * 1. window.__RUNTIME_CONFIG__ (Docker runtime - MAYOR prioridad)
 * 2. import.meta.env.VITE_* (Build time - desarrollo local)
 * 3. Valores por defecto (MENOR prioridad)
 *
 * @example
 * // En Docker:
 * docker run -e API_BASE_URL=https://prod.api.com app
 *
 * // En desarrollo local:
 * npm run dev (lee .env.development)
 */

// Tipos para runtime config
interface RuntimeConfig {
  apiBaseUrl: string;
  appEnvironment: 'development' | 'staging' | 'production';
  appName: string;
  appVersion: string;
  debugMode: boolean;
}

// Extender Window interface para incluir nuestro config
declare global {
  interface Window {
    __RUNTIME_CONFIG__?: Partial<RuntimeConfig>;
  }
}

/**
 * Obtiene un valor de configuración con orden de precedencia:
 * 1. Runtime config (Docker)
 * 2. Build time env (Vite)
 * 3. Valor por defecto
 */
function getConfigValue<T>(
  runtimeKey: keyof RuntimeConfig,
  viteEnvKey: string,
  defaultValue: T
): T {
  // 1. Intentar obtener de runtime config (Docker)
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) {
    const runtimeValue = window.__RUNTIME_CONFIG__[runtimeKey];
    if (runtimeValue !== undefined && runtimeValue !== null) {
      return runtimeValue as T;
    }
  }

  // 2. Intentar obtener de import.meta.env (build time)
  if (import.meta.env[viteEnvKey]) {
    const envValue = import.meta.env[viteEnvKey];

    // Manejar conversión de tipos
    if (typeof defaultValue === 'boolean') {
      return (envValue === 'true' || envValue === true) as T;
    }

    return envValue as T;
  }

  // 3. Usar valor por defecto
  return defaultValue;
}

/**
 * Configuración de la aplicación con soporte para runtime
 *
 * DESARROLLO LOCAL:
 * - Lee de .env.development
 * - Valores hardcoded en el build
 *
 * DOCKER/PRODUCCIÓN:
 * - Lee de window.__RUNTIME_CONFIG__
 * - Inyectado por docker-entrypoint.sh
 * - Se puede cambiar sin rebuild
 */
export const runtimeConfig = {
  /**
   * URL base del API
   * Docker: docker run -e API_BASE_URL=https://api.prod.com
   * Local: VITE_API_BASE_URL en .env
   */
  get apiBaseUrl(): string {
    return getConfigValue(
      'apiBaseUrl',
      'VITE_API_BASE_URL',
      'http://localhost:3000'
    );
  },

  /**
   * Ambiente de la aplicación
   * Docker: docker run -e APP_ENVIRONMENT=production
   * Local: VITE_APP_ENVIRONMENT en .env
   */
  get appEnvironment(): 'development' | 'staging' | 'production' {
    const env = getConfigValue(
      'appEnvironment',
      'VITE_APP_ENVIRONMENT',
      'development'
    );

    // Validar que sea un valor válido
    if (env === 'development' || env === 'staging' || env === 'production') {
      return env;
    }

    return 'development';
  },

  /**
   * Nombre de la aplicación
   * Docker: docker run -e APP_NAME="IPH Production"
   * Local: VITE_APP_NAME en .env
   */
  get appName(): string {
    return getConfigValue(
      'appName',
      'VITE_APP_NAME',
      'IPH Frontend'
    );
  },

  /**
   * Versión de la aplicación
   * Docker: docker run -e APP_VERSION=2.0.0
   * Local: VITE_APP_VERSION en .env
   */
  get appVersion(): string {
    return getConfigValue(
      'appVersion',
      'VITE_APP_VERSION',
      '1.0.0'
    );
  },

  /**
   * Modo de debugging
   * Docker: docker run -e DEBUG_MODE=true
   * Local: VITE_DEBUG_MODE en .env
   */
  get debugMode(): boolean {
    return getConfigValue(
      'debugMode',
      'VITE_DEBUG_MODE',
      false
    );
  },

  /**
   * Verifica si hay configuración de runtime disponible
   */
  get hasRuntimeConfig(): boolean {
    return typeof window !== 'undefined' && !!window.__RUNTIME_CONFIG__;
  },

  /**
   * Obtiene toda la configuración actual (útil para debugging)
   */
  getAll(): RuntimeConfig {
    return {
      apiBaseUrl: this.apiBaseUrl,
      appEnvironment: this.appEnvironment,
      appName: this.appName,
      appVersion: this.appVersion,
      debugMode: this.debugMode
    };
  }
};

// Export por defecto para compatibilidad
export default runtimeConfig;

/**
 * Hook para logging de configuración (llamar desde main.tsx)
 */
export function logRuntimeConfig() {
  const config = runtimeConfig.getAll();
  const source = runtimeConfig.hasRuntimeConfig ? 'Runtime (Docker)' : 'Build time (Vite)';

  console.log('📋 Configuración cargada:', {
    source,
    config,
    hasRuntimeConfig: runtimeConfig.hasRuntimeConfig
  });
}
