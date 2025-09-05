/*
  Archivo: frontend/src/pages/workspace-reader.page.loader.js
  Propósito: Orquesta la inicialización de todos los componentes y módulos de estado
             necesarios para la página principal del espacio de trabajo.
*/
const WorkspaceReaderPageLoader = (function () {
  'use strict';

  async function initializePage() {
    try {
      console.log('Cargador de Página: Iniciando carga de datos...');
      
      // ==========================================================================
      // ANÁLISIS DE ERRORES Y SOLUCIÓN
      // ==========================================================================
      // ERROR IDENTIFICADO: Este archivo llamaba a 'BackendApiService.load()', una función
      //                     que apuntaba a una ruta obsoleta del backend.
      // SOLUCIÓN: Se ha actualizado para usar las nuevas funciones modulares del servicio API.
      //            Ahora utiliza Promise.all para cargar los documentos y el léxico en
      //            paralelo, lo cual es más eficiente.
      // ==========================================================================

      // Flujo de Carga:
      // 1. Llama a los métodos específicos y modulares del servicio API en paralelo.
      const [documents_from_api, lexicon_from_api] = await Promise.all([
        BackendApiService.getDocuments(),
        BackendApiService.getLexicon()
      ]);

      // 2. Inicializa los módulos de estado con los datos obtenidos.
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

      console.log('Cargador de Página: ¡Aplicación completamente inicializada!');

    } catch (error) {
      // Si alguna de las promesas de carga falla, se captura el error aquí.
      console.error('Error crítico al inicializar la página Workspace-Reader.', error);
    }
  }

  return {
    initializePage,
  };
})();