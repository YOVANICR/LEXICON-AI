/*
  Archivo: src/components/UploaderPanel/uploader-panel.component.js
  Propósito: Gestiona la lógica del panel modal de carga de documentos.
             Controla su visibilidad, el cambio entre vistas (principal y pegar texto)
             y las interacciones del usuario dentro del panel.
*/
const UploaderPanelComponent = (function () {
  'use strict';

  /**
   * Muestra el panel modal de carga.
   */
  const openPanel = () => {
    try {
      DOM_ELEMENTS.uploaderOverlay.classList.remove('uploader--hidden');
      DOM_ELEMENTS.uploaderOverlay.setAttribute('aria-hidden', 'false');
    } catch (error) {
      console.error('Error al intentar abrir el panel de carga.', error);
      ToastHandler.showToast(TranslationService.t('toast_uploader_open_error'));
    }
  };

  /**
   * Oculta el panel modal de carga.
   */
  const closePanel = () => {
    try {
      DOM_ELEMENTS.uploaderOverlay.classList.add('uploader--hidden');
      DOM_ELEMENTS.uploaderOverlay.setAttribute('aria-hidden', 'true');
      // Asegurarse de que siempre vuelva a la vista principal al cerrar
      switchToMainView();
    } catch (error) {
      console.error('Error al intentar cerrar el panel de carga.', error);
    }
  };

  /**
   * Cambia a la vista principal (selección de fuente) del panel.
   */
  const switchToMainView = () => {
    DOM_ELEMENTS.uploaderBody?.classList.remove('uploader__body--paste-mode');
    if (DOM_ELEMENTS.pasteTextArea) DOM_ELEMENTS.pasteTextArea.value = '';
  };

  /**
   * Cambia a la vista para pegar texto.
   */
  const switchToPasteView = () => {
    DOM_ELEMENTS.uploaderBody?.classList.add('uploader__body--paste-mode');
    DOM_ELEMENTS.pasteTextArea?.focus();
  };
  /**
   * Simula el envío del texto pegado.
   */
  const sendPastedText = () => {
    const textToUpload = DOM_ELEMENTS.pasteTextArea.value;
    if (textToUpload.trim()) {
      // En una implementación real, esto llamaría a un servicio o al state.
      console.log('Texto a subir:', textToUpload);
      ToastHandler.showToast(TranslationService.t('toast_uploader_text_sent'));
      closePanel(); // Cierra el panel después de enviar
    } else {
      ToastHandler.showToast(TranslationService.t('toast_uploader_empty_text_error'));
    }
  };

  /**
   * Maneja el cierre del panel mediante la tecla 'Escape'.
   * Si está en modo "pegar", vuelve a la vista principal. Si no, cierra el panel.
   */
  const handleEscapeKey = (event) => {
    if (event.key !== 'Escape' || DOM_ELEMENTS.uploaderOverlay.classList.contains('uploader--hidden')) {
      return;
    }

    if (DOM_ELEMENTS.uploaderBody.classList.contains('uploader__body--paste-mode')) {
      switchToMainView();
    } else {
      closePanel();
    }
  };
  /**
   * Inicializa el componente: asigna manejadores de eventos a los elementos del DOM.
   */
  function initialize() {
    try {
      // === NUEVAS LÍNEAS AÑADIDAS ===
      const openUploaderButton = document.getElementById('btnOpenUploader');
      openUploaderButton?.addEventListener('click', openPanel);
      
      DOM_ELEMENTS.closeUploaderBtn?.addEventListener('click', closePanel);
      DOM_ELEMENTS.uploaderOverlay?.addEventListener('click', (event) => {
        if (event.target === DOM_ELEMENTS.uploaderOverlay) {
          closePanel();
        }
      });
      DOM_ELEMENTS.switchToPasteViewButton?.addEventListener('click', switchToPasteView);
      DOM_ELEMENTS.sendPastedTextButton?.addEventListener('click', sendPastedText);
      
      // Manejador global para la tecla Escape
      document.addEventListener('keydown', handleEscapeKey);
      console.log('Componente UploaderPanel inicializado.');
    } catch (error) {
      console.error('Error fatal al inicializar el UploaderPanelComponent.', error);
    }
  }

  // API Pública del Componente
  return {
    initialize,
    openPanel,
    closePanel
  };
})();