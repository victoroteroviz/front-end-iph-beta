/**
 * Componente de demostración para probar el sistema de notificaciones
 * Solo para desarrollo - remover en producción
 */

import React from 'react';
import { showSuccess, showError, showInfo, showWarning, clearAllNotifications } from '../index';

const NotificationDemo: React.FC = () => {
  const handleTestSuccess = () => {
    showSuccess('¡Operación completada exitosamente!', 'Éxito');
  };

  const handleTestError = () => {
    showError('Ha ocurrido un error inesperado. Por favor, intenta nuevamente.', 'Error');
  };

  const handleTestInfo = () => {
    showInfo('Esta es información importante para el usuario.', 'Información');
  };

  const handleTestWarning = () => {
    showWarning('Advertencia: Revisa los datos antes de continuar.', 'Advertencia');
  };

  const handleTestMultiple = () => {
    showSuccess('Primera notificación de éxito');
    setTimeout(() => showError('Segunda notificación de error'), 500);
    setTimeout(() => showInfo('Tercera notificación informativa'), 1000);
    setTimeout(() => showWarning('Cuarta notificación de advertencia'), 1500);
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <div className="p-8 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        🔔 Demo Sistema de Notificaciones
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button 
          onClick={handleTestSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          ✅ Probar Éxito
        </button>
        
        <button 
          onClick={handleTestError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          ❌ Probar Error
        </button>
        
        <button 
          onClick={handleTestInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ℹ️ Probar Info
        </button>
        
        <button 
          onClick={handleTestWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          ⚠️ Probar Advertencia
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleTestMultiple}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          🚀 Probar Múltiples
        </button>
        
        <button 
          onClick={handleClearAll}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          🗑️ Limpiar Todo
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-medium mb-2">📋 Características del Sistema:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✅ Auto-close configurable por notificación</li>
          <li>✅ Diferentes tipos: success, error, info, warning</li>
          <li>✅ Animaciones de entrada y salida</li>
          <li>✅ Barra de progreso para auto-close</li>
          <li>✅ Logging automático integrado</li>
          <li>✅ Máximo 5 notificaciones simultáneas</li>
          <li>✅ Portal rendering (aparece sobre todo)</li>
          <li>✅ Responsive y accesible</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;