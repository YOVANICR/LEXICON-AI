document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Declaración de Constantes (Elementos del DOM)
  // ========================================================================

  const openUploaderButton = document.getElementById('openUploaderButton');
  const uploaderOverlay = document.getElementById('uploaderOverlay');
  const uploaderBody = document.getElementById('uploaderBody'); // El cuerpo del panel
  
  const switchToPasteViewButton = document.getElementById('switchToPasteViewButton');
  const sendPastedTextButton = document.getElementById('sendPastedTextButton');
  const pasteTextArea = document.getElementById('pasteTextArea');

  // ========================================================================
  // 2. Definición de Funciones (Lógica de la Aplicación)
  // ========================================================================

  /**
   * Muestra u oculta el panel de carga principal.
   */
  const setUploaderVisibility = (isVisible) => {
    if (isVisible) {
      uploaderOverlay.classList.remove('uploader--hidden');
      uploaderOverlay.setAttribute('aria-hidden', 'false');
    } else {
      uploaderOverlay.classList.add('uploader--hidden');
      uploaderOverlay.setAttribute('aria-hidden', 'true');
      // Asegurarse de que siempre vuelva a la vista principal al cerrar
      switchToMainView(); 
    }
  };

  /**
   * Cambia a la vista principal del panel de carga.
   */
  const switchToMainView = () => {
    uploaderBody.classList.remove('uploader__body--paste-mode');
    pasteTextArea.value = ''; // Limpiar el textarea al salir
  };

  /**
   * Cambia a la vista de pegar texto.
   */
  const switchToPasteView = () => {
    uploaderBody.classList.add('uploader__body--paste-mode');
    pasteTextArea.focus(); // Pone el foco en el textarea
  };

  /**
   * Maneja el cierre del panel al presionar la tecla "Escape".
   */
  const handleEscapeKey = (event) => {
    if (event.key !== 'Escape') return;

    const isUploaderVisible = !uploaderOverlay.classList.contains('uploader--hidden');
    if (!isUploaderVisible) return;

    const isInPasteMode = uploaderBody.classList.contains('uploader__body--paste-mode');

    if (isInPasteMode) {
      switchToMainView(); // Si está en modo pegado, vuelve a la vista principal
    } else {
      setUploaderVisibility(false); // Si está en la vista principal, cierra el panel
    }
  };

  /**
   * Simula el envío del texto y vuelve a la vista principal.
   */
  const sendPastedText = () => {
    const textToUpload = pasteTextArea.value;
    if (textToUpload.trim() !== '') {
      alert('Texto a subir: \n' + textToUpload);
      switchToMainView();
    } else {
      alert('Por favor, introduce algún texto para subir.');
    }
  };


  // ========================================================================
  // 3. Asignación de Eventos (Event Listeners)
  // ========================================================================
  
  openUploaderButton?.addEventListener('click', () => setUploaderVisibility(true));
  uploaderOverlay?.addEventListener('click', (event) => {
    // Cierra el panel solo si se hace clic en el fondo (overlay)
    if (event.target === uploaderOverlay) {
      setUploaderVisibility(false);
    }
  });

  switchToPasteViewButton?.addEventListener('click', switchToPasteView);
  sendPastedTextButton?.addEventListener('click', sendPastedText);
  document.addEventListener('keydown', handleEscapeKey);

});