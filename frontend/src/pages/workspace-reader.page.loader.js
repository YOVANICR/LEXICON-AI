/*
  Archivo: frontend/src/pages/workspace-reader.page.loader.js
  Propósito: Orquesta la inicialización de todos los componentes y módulos de estado.
*/
const WorkspaceReaderPageLoader = (function () {
  'use strict';

  async function initializePage() {
    try {
      console.log('Cargador de Página: Iniciando carga de datos...');
      
      const [documents_from_api, lexicon_from_api] = await Promise.all([
        BackendApiService.getDocuments(),
        BackendApiService.getLexicon()
      ]);

      DocumentsState.initialize(documents_from_api);
      LexiconState.initialize(lexicon_from_api);
      UserSettingsState.initialize();

      // 3. Inicializa el resto de los componentes de la UI.
      ThemeManager.initialize();
      LibraryComponent.initialize();
      ReaderComponent.initialize();
      LexiconTableComponent.initialize();
      WordBubbleComponent.initialize();
      MainMenuComponent.initialize();
      UploaderPanelComponent.initialize();

      // ==================================================================
      // CORRECCIÓN: AÑADIMOS LA LLAMADA PARA INICIALIZAR EL LAYOUT
      // ==================================================================
      WorkspaceLayoutManager.initialize();

      console.log('Cargador de Página: ¡Aplicación completamente inicializada!');

    } catch (error) {
      console.error('Error crítico al inicializar la página Workspace-Reader.', error);
      // Aquí podrías mostrar un toast si falla la carga inicial
      // ToastHandler.showToast('Error fatal. No se pudo cargar la aplicación.');
    }
  }

  return {
    initializePage,
  };
})();