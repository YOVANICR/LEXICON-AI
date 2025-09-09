// src/components/UploaderPanel/uploader-panel.component.js

const UploaderPanelComponent = (function () {
  'use strict';

  // Almacenar referencias del DOM
  let uploaderOverlay, uploaderBody, pasteTextArea;

  const setUploaderVisibility = (isVisible) => {
    if (!uploaderOverlay) return;
    if (isVisible) {
      uploaderOverlay.classList.remove('uploader--hidden');
    } else {
      uploaderOverlay.classList.add('uploader--hidden');
      switchToMainView();
    }
  };

  const switchToMainView = () => {
    if (uploaderBody) uploaderBody.classList.remove('c-uploader-body--paste-mode');
    if (pasteTextArea) pasteTextArea.value = '';
  };

  const switchToPasteView = () => {
    if (uploaderBody) uploaderBody.classList.add('c-uploader-body--paste-mode');
    if (pasteTextArea) pasteTextArea.focus();
  };

  
  /**
   * @private
   * Se ejecuta cuando el usuario hace clic en el botón de enviar texto.
   * Pasa el texto al gestor de estado y cierra el panel.
   */
  const sendPastedText = () => {
    try {
      // Asegurarse de que el textarea y su valor existen
      if (!pasteTextArea || pasteTextArea.value.trim() === '') {
        // En lugar de un alert, podríamos usar un ToastHandler en el futuro
        alert('Por favor, introduce algún texto para subir.');
        return;
      }
      
      const textToProcess = pasteTextArea.value;
      
      // Llama a la nueva función en el gestor de estado
      DocumentsState.addAndSelectPastedText(textToProcess);
      
      // Cierra el panel de carga
      setUploaderVisibility(false);

    } catch (error) {
      console.error('UploaderPanel: Error al enviar el texto pegado.', error);
    }
  };


  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && !uploaderOverlay.classList.contains('uploader--hidden')) {
      if (uploaderBody.classList.contains('c-uploader-body--paste-mode')) {
        switchToMainView();
      } else {
        setUploaderVisibility(false);
      }
    }
  };

  function initialize() {
    try {
      // Guardar elementos del DOM
      uploaderOverlay = document.getElementById('uploaderOverlay');
      uploaderBody = document.getElementById('uploaderBody');
      pasteTextArea = document.getElementById('pasteTextArea');
      
      const openUploaderButton = document.getElementById('btnOpenUploader');
      const switchToPasteViewButton = document.getElementById('switchToPasteViewButton');
      const sendPastedTextButton = document.getElementById('sendPastedTextButton');
      const switchToMainViewButton = document.getElementById('switchToMainViewButton'); // ✨ Botón "Volver"

      // Asignar eventos
      openUploaderButton?.addEventListener('click', () => setUploaderVisibility(true));
      uploaderOverlay?.addEventListener('click', (event) => {
        if (event.target === uploaderOverlay) {
          setUploaderVisibility(false);
        }
      });

      switchToPasteViewButton?.addEventListener('click', switchToPasteView);
      sendPastedTextButton?.addEventListener('click', sendPastedText);
      switchToMainViewButton?.addEventListener('click', switchToMainView); // ✨ Evento para "Volver"
      document.addEventListener('keydown', handleEscapeKey);

      console.log('Componente UploaderPanel inicializado.');
    } catch (error) {
      console.error('Error al inicializar el UploaderPanelComponent.', error);
    }
  }

  return {
    initialize,
  };
})();