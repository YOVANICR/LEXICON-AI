/*
  Archivo: frontend/src/core/app.initializer.js
  Propósito: Este es el punto de entrada principal de toda la aplicación del lado del cliente.
             Se encarga de inicializar los manejadores de errores globales y de delegar el control
             al cargador de página (`.page.loader.js`) apropiado según la URL actual.
*/

// Se utiliza un Módulo IIFE (Immediately Invoked Function Expression) para encapsular la lógica y evitar contaminar el scope global.
(function (window, document) {
  'use strict';

  /**
   * Determina qué página se ha cargado y llama al cargador correspondiente.
   * Esta función actúa como un enrutador del lado del cliente muy simple.
   * @returns {void}
   */
  function initializeCurrentPageModule() {
    try {
      // Obtenemos la ruta del archivo de la URL para identificar la página.
      const pathName = window.location.pathname.split('/').pop();

      // En un futuro, aquí habría un 'switch' o un mapeo para las diferentes páginas.
      // Por ahora, cargamos directamente el módulo de la página principal.
      if (pathName === 'workspace-reader.html') {
        console.log('Inicializador: Detectada la página del espacio de trabajo. Cargando módulo...');
        // Suponiendo que los módulos se cargarán a través de <script type="module"> o un bundler en el futuro.
        // Por ahora, asumimos que los objetos están disponibles en el scope global.
        WorkspaceReaderPageLoader.initializePage();
      } else {
        // Manejo para otras páginas como landing.html, authentication.html, etc.
        console.log(`Inicializador: Página no reconocida (${pathName}), no se carga ningún módulo.`);
      }
    } catch (error) {
      console.error('Error catastrófico durante la inicialización de la página. La aplicación podría no funcionar.', error);
    }
  }

  /**
   * Punto de arranque principal que se ejecuta cuando el DOM está completamente cargado.
   * @listens DOMContentLoaded
   */
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar el manejador de errores global INMEDIATAMENTE.
    // Esto es crucial para capturar cualquier error que ocurra durante el resto de la inicialización.
    GlobalErrorHandler.initialize();

    // 2. Proceder a inicializar la lógica de la página actual.
    initializeCurrentPageModule();
  });

})(window, document);