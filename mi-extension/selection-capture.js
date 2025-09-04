/* ==========================================================================
   Archivo: extension/selection-capture.js
   Propósito: Captura texto seleccionado y muestra una burbuja UI personalizada.
   (Versión Robusta y Verificada)
   ========================================================================== */

(function () {
  // Evitar que el script se ejecute múltiples veces en la misma página.
  if (window.__LI_SELECTION_RUNNING__) return;
  window.__LI_SELECTION_RUNNING__ = true;

  let bubbleElement;
  let bubbleTitleElement;

  // --- 1. CREACIÓN DE LA BURBUJA (se ejecuta una sola vez) ---
  function createCaptureBubble() {
    // Si la burbuja ya existe en el DOM, no hacer nada.
    if (document.getElementById('li-capture-bubble-instance')) return;

    bubbleElement = document.createElement('div');
    bubbleElement.id = 'li-capture-bubble-instance';
    bubbleElement.className = 'li-capture-bubble';

    bubbleTitleElement = document.createElement('div');
    bubbleTitleElement.className = 'li-capture-bubble__title';
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'li-capture-bubble__actions';

    const statuses = [
      { text: 'No aprendida', status: 'unknown' },
      { text: 'En proceso', status: 'learning' },
      { text: 'Aprendida', status: 'known' },
      { text: 'Quitar estado', status: 'none' }
    ];

    statuses.forEach(({ text, status }) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = `li-capture-bubble__btn li-capture-bubble__btn--${status}`;
      button.dataset.status = status;
      actionsContainer.appendChild(button);
    });

    bubbleElement.appendChild(bubbleTitleElement);
    bubbleElement.appendChild(actionsContainer);
    document.body.appendChild(bubbleElement);

    // Listener para los botones de la burbuja.
    actionsContainer.addEventListener('click', (e) => {
      const button = e.target.closest('[data-status]');
      if (button) {
        const word = bubbleElement.dataset.wordToSave;
        const status = button.dataset.status;
        
        chrome.runtime.sendMessage({
          action: "saveSelectedWord",
          payload: { word, status }
        });

        hideBubble();
      }
    });
  }

  // --- 2. FUNCIONES PARA MOSTRAR Y OCULTAR LA BURBUJA ---
  function showBubble(selectedText, rangeOrElement) {
    if (!bubbleElement) createCaptureBubble();

    bubbleElement.dataset.wordToSave = selectedText;
    bubbleTitleElement.innerHTML = `Guardar <strong>"${selectedText}"</strong> como:`;

    // Obtener las coordenadas del texto seleccionado o del elemento.
    const rect = rangeOrElement.getBoundingClientRect();
    const bubbleWidth = 340;
    
    let left = window.scrollX + rect.left + (rect.width / 2) - (bubbleWidth / 2);
    let top = window.scrollY + rect.bottom + 8;

    if (left < 10) left = 10;
    if (left + bubbleWidth > window.innerWidth - 10) {
      left = window.innerWidth - bubbleWidth - 10;
    }
    
    bubbleElement.style.left = `${left}px`;
    bubbleElement.style.top = `${top}px`;
    bubbleElement.style.display = 'block';
  }

  function hideBubble() {
    if (bubbleElement) {
      bubbleElement.style.display = 'none';
    }
  }

  // --- 3. LISTENERS DE EVENTOS ---

  // Atajo Ctrl+Shift+X para texto normal seleccionado.
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "x") {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText && selection.rangeCount > 0) {
        e.preventDefault();
        e.stopPropagation();
        showBubble(selectedText, selection.getRangeAt(0));
      }
    }
  });

  // Clic derecho en una palabra ya resaltada.
  document.addEventListener("contextmenu", (e) => {
    const span = e.target.closest(".li-highlight");
    if (!span) return;

    // ¡Acciones clave!
    e.preventDefault(); // Evita que aparezca el menú contextual del navegador.
    e.stopImmediatePropagation(); // Evita que cualquier OTRO listener (como el del script viejo) se ejecute.

    const selectedText = span.textContent.trim();
    if (selectedText) {
      showBubble(selectedText, span); // Usamos el propio span para el posicionamiento.
    }
  }, true); // Usar "capturing phase" para que este listener se ejecute antes que otros.

  // Ocultar la burbuja si se hace clic en cualquier otro lugar.
  document.addEventListener('mousedown', (e) => {
    if (bubbleElement && bubbleElement.style.display === 'block') {
      if (!bubbleElement.contains(e.target) && !e.target.closest('.li-highlight')) {
        hideBubble();
      }
    }
  }, true);

})();