/*
  Archivo: frontend/src/pages/workspace-reader.page.loader.js
  Propósito: Orquesta la inicialización de todos los componentes y módulos de estado
             necesarios para la página principal del espacio de trabajo (workspace-reader.html).
*/

const WorkspaceReaderPageLoader = (function () {
  'use strict';

  /**
   * Inicializa todos los módulos necesarios para que la página del espacio de trabajo funcione.
   * AHORA INCLUYE LA CARGA DE DATOS DESDE EL BACKEND.
   */
  async function initializePage() {
    try {
      console.log('Cargador de Página: Iniciando carga de datos desde el backend...');
      
      // 1. Cargar los datos iniciales desde el servidor.
      // (NOTA: En una app real, el token de autenticación se enviaría aquí)
      const initial_database_state = await BackendApiService.loadFullDatabase();

      // 2. Inicializar los módulos de estado CON los datos del servidor.
      DocumentsState.initialize(initial_database_state.docs);
      LexiconState.initialize(initial_database_state.lexicon);
      UserSettingsState.initialize();

      // 3. Inicializar los módulos que dependen de la configuración.
      ThemeManager.initialize();

      // 4. Inicializar los componentes de la UI.
      LibraryComponent.initialize();
      ReaderComponent.initialize();
      LexiconTableComponent.initialize();
      WordBubbleComponent.initialize();
      MainMenuComponent.initialize();

      console.log('Cargador de Página: ¡Aplicación completamente inicializada y lista!');

    } catch (error) {
      console.error('Error crítico al inicializar los módulos de la página Workspace-Reader.', error);
      // Podríamos mostrar un mensaje de error en la UI aquí.
    }
  }

  return {
    initializePage,
  };
})();