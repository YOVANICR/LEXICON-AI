/*
  Archivo: src/components/LibraryUploader/library-uploader.component.js
  Propósito: Gestiona la lógica interna del panel de carga de la biblioteca,
             principalmente el cambio entre la vista principal y la de pegar texto.
*/
const LibraryUploaderComponent = (function () {
  'use strict';

  /**
   * Cambia a la vista para pegar texto.
   */
  const switchToPasteView = () => {
    try {
      DOM_ELEMENTS.uploaderBody.classList.add('c-library-uploader__body--paste-mode');
      DOM_ELEMENTS.pasteTextArea?.focus();
    } catch (error) {
      console.error('Error al cambiar a la vista de pegar texto.', error);
    }
  };

  /**
   * Cambia a la vista principal (selección de fuente) del panel.
   * Esta función puede ser llamada por otros componentes si es necesario resetear la vista.
   */
  const switchToMainView = () => {
    try {
      DOM_ELEMENTS.uploaderBody.classList.remove('c-library-uploader__body--paste-mode');
    } catch (error) {
      console.error('Error al cambiar a la vista principal del uploader.', error);
    }
  };

  /**
   * Simula el envío del texto pegado.
   */
  const sendPastedText = () => {
    const textToUpload = DOM_ELEMENTS.pasteTextArea.value;
    if (textToUpload.trim()) {
      console.log('Texto a subir:', textToUpload);
      ToastHandler.showToast(TranslationService.t('toast_uploader_text_sent'));
      // Aquí podrías emitir un evento: EventBus.publish('document:pasted', { text: textToUpload });
      switchToMainView(); // Vuelve a la vista principal después de enviar
    } else {
      ToastHandler.showToast(TranslationService.t('toast_uploader_empty_text_error'));
    }
  };

  /**
   * Inicializa el componente, asignando los manejadores de eventos.
   */
  function initialize() {
    try {
      DOM_ELEMENTS.switchToPasteViewButton?.addEventListener('click', switchToPasteView);
      DOM_ELEMENTS.sendPastedTextButton?.addEventListener('click', sendPastedText);
      console.log('Componente LibraryUploader inicializado.');
    } catch (error) {
      console.error('Error fatal al inicializar el LibraryUploaderComponent.', error);
    }
  }

  // API Pública
  return {
    initialize,
    switchToMainView,
  };
})();