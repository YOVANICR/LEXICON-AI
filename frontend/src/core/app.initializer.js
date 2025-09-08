/*
  Archivo: frontend/src/core/app.initializer.js
  Propósito:
    Este es el punto de entrada principal de toda la aplicación del lado del cliente.
    Se encarga de CARGAR DINÁMICAMENTE todos los scripts necesarios, inicializar
    los manejadores de errores y delegar el control al cargador de página apropiado.
*/

(function (window, document) {
  'use strict';

  /**
   * Lista de scripts que la aplicación necesita cargar en orden.
   * El orden es importante: primero core, luego i18n, luego utils, etc.
   * @type {string[]}
   */
  const APPLICATION_SCRIPTS = [
    // Core
    '../src/core/dom-elements.js',
    '../src/core/event-bus.js',
    // i18n (Debe cargarse antes que los componentes que lo usan)
    '../src/i18n/language-detector.js',
    '../src/i18n/translation.service.js',
    '../src/i18n/ui-translator.js',
    // Utils
    '../src/utils/debouncer.js',
    '../src/utils/text-processor.js',
    // Modules
    '../src/modules/error-handling/global-error.handler.js',
    '../src/modules/notifications/toast.handler.js',
    '../src/modules/theme/theme.manager.js',
    // Services
    '../src/services/backend-api.service.js',
    '../src/services/external-apis.service.js',
    // State
    '../src/state/documents.state.js',
    '../src/state/lexicon.state.js',
    '../src/state/user-settings.state.js',
    '../src/state/user-session.state.js',
    // Components
    '../src/components/Library/library.component.js',
    '../src/components/Reader/reader.component.js',
    '../src/components/LexiconTable/lexicon-table.component.js',
    '../src/components/WordBubble/word-bubble.component.js',
    '../src/components/MainMenu/main-menu.component.js',
    '../src/components/UserProfileForm/user-profile-form.component.js',
    '../src/components/WorkspaceLayout/workspace-layout.component.js',
    '../src/components/UploaderPanel/uploader-panel.component.js',
    // Page Loader
    '../src/pages/workspace-reader.page.loader.js'
  ];

  /**
   * Carga dinámica de scripts de manera secuencial.
   * @param {string} scriptPath - Ruta relativa del script.
   * @returns {Promise<void>}
   */
  function loadScript(scriptPath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Error al cargar el script: ${scriptPath}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Recorre la lista de scripts y los carga todos en orden.
   * Si alguno falla, detiene la ejecución con un error.
   * @returns {Promise<void>}
   */
  async function loadApplicationScripts() {
    console.log('Cargador: Iniciando carga de scripts...');
    for (const path of APPLICATION_SCRIPTS) {
      try {
        await loadScript(path);
      } catch (error) {
        console.error(error);
        throw new Error('No se pudo continuar con la carga de la aplicación.');
      }
    }
    console.log('Cargador: Todos los scripts se han cargado.');
  }

  /**
   * Inicializa el módulo de página en función del archivo HTML actual.
   * Actualmente soporta `workspace-reader.html`.
   * @returns {void}
   */
  function initializeCurrentPageModule() {
    try {
      const pathName = window.location.pathname.split('/').pop();
      if (pathName === 'workspace-reader.html') {
        console.log('Inicializador: Detectada la página del espacio de trabajo. Cargando módulo...');
        WorkspaceReaderPageLoader.initializePage();
      } else {
        console.log(`Inicializador: Página no reconocida (${pathName}), no se carga ningún módulo.`);
      }
    } catch (error) {
      console.error('Error catastrófico durante la inicialización de la página.', error);
    }
  }

  /**
   * Punto de arranque principal que se ejecuta cuando el DOM está completamente cargado.
   * @listens DOMContentLoaded
   */
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      // 1. Cargar todos los scripts de la aplicación.
      await loadApplicationScripts();

      // 2. Inicializar el manejador de errores global.
      GlobalErrorHandler.initialize();

      // 3. Detectar e inicializar el servicio de traducción con el idioma correcto.
      const initialLang = LanguageDetector.detectInitialLanguage();
      await TranslationService.initialize(initialLang);
      document.documentElement.lang = initialLang; // Actualizar el atributo lang del HTML

      // 4. Inicializar traductor de UI para aplicar traducciones al DOM (tooltips incluidos).
      if (window.UITranslator && typeof UITranslator.initialize === 'function') {
        UITranslator.initialize();
      } else {
        console.warn('UITranslator no está disponible o no tiene método initialize().');
      }
      

      // 5. Proceder a inicializar la lógica de la página actual.
      initializeCurrentPageModule();

    } catch (error) {
      console.error('Fallo crítico en el arranque de la aplicación.', error);
      document.body.innerHTML =
        '<p style="color: red; padding: 20px;">Error fatal: La aplicación no pudo cargarse.</p>';
    }
  });

})(window, document);
