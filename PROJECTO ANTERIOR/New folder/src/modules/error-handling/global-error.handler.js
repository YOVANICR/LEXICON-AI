/*
  Archivo: frontend/src/modules/error-handling/global-error.handler.js
  Propósito: Implementa un manejador de errores global para capturar todas las excepciones
             de JavaScript no controladas. Esto previene que la aplicación se rompa por completo
             y permite un logging centralizado de los errores.
*/

const GlobalErrorHandler = (function (window) {
  'use strict';

  /**
   * Inicializa el manejador de errores global, asignando una función a window.onerror.
   * @returns {void}
   */
  function initialize() {
    window.onerror = function (errorMessage, sourceUrl, lineNumber, columnNumber, errorObject) {
      console.error('================ MANEJADOR GLOBAL DE ERRORES CAPTURÓ UNA EXCEPCIÓN ================');
      console.error('Mensaje: ', errorMessage);
      console.error('Fuente: ', sourceUrl);
      console.error(`Ubicación: Línea ${lineNumber}, Columna ${columnNumber}`);
      console.error('Objeto del Error: ', errorObject);
      console.error('================================================================================');

      // En un entorno de producción, aquí se enviaría esta información a un servicio de logging
      // como Sentry, LogRocket, o un endpoint propio.
      // Ejemplo: ErrorLoggingService.log({ errorMessage, sourceUrl, ... });
      
      // Se retorna 'true' para prevenir que el error se muestre en la consola del navegador por defecto.
      return true;
    };
    
    console.log('Manejador de errores global inicializado.');
  }

  return {
    initialize,
  };
})(window);