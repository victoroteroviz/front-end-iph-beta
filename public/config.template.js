// Runtime configuration template
// Este archivo será procesado por el entrypoint de Docker
window.__RUNTIME_CONFIG__ = {
  apiBaseUrl: '${API_BASE_URL}',
  appEnvironment: '${APP_ENVIRONMENT}',
  appName: '${APP_NAME}',
  appVersion: '${APP_VERSION}',
  debugMode: '${DEBUG_MODE}' === 'true'
};
