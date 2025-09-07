/*
  Archivo: frontend/src/modules/notifications/toast.handler.js
  Propósito: Módulo reutilizable para mostrar notificaciones flotantes (toasts).
             Centraliza la lógica de visualización y ocultación de toasts para que
             pueda ser invocado desde cualquier parte de la aplicación.
*/

const ToastHandler = (function () {
  'use strict';
  
  /**
   * @private
   * Almacena la referencia al temporizador para poder limpiarlo si se muestra un nuevo toast.
   */
  let toastTimer = null;
  
  /**
   * Muestra un mensaje de notificación en la pantalla.
   * @param {string} message - El mensaje que se mostrará en el toast.
   * @param {number} [duration=2000] - La duración en milisegundos que el toast será visible.
   */
  function showToast(message, duration = 2000) {
    try {
      const toastElement = DOM_ELEMENTS.toastNotification;
      
      toastElement.textContent = message;
      toastElement.style.display = 'block';
      
      // Si ya hay un temporizador activo, lo limpiamos para que el nuevo toast respete su propia duración.
      clearTimeout(toastTimer);
      
      toastTimer = setTimeout(() => {
        toastElement.style.display = 'none';
      }, duration);
    } catch (error) {
      console.error('Error al intentar mostrar la notificación toast.', error);
      // Como fallback, mostramos una alerta simple si el toast falla.
      alert(message);
    }
  }

  // API Pública del Módulo
  return {
    showToast,
  };
})();