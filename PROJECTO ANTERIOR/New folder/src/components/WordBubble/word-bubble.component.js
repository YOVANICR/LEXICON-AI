/*
  Archivo: frontend/src/components/WordBubble/word-bubble.component.js
  Propósito: Gestiona la lógica de la burbuja de información que aparece al
             hacer clic en una palabra. Es responsable de su visibilidad, posición,
             contenido y de manejar las acciones del usuario dentro de ella.
*/

const WordBubbleComponent = (function () {
  'use strict';
  
  let currently_active_lemma = null;

  /**
   * Muestra y posiciona la burbuja para una palabra, y carga su definición.
   * @param {string} lemma - El lema de la palabra.
   * @param {string} surfaceForm - La forma superficial de la palabra.
   * @param {HTMLElement} targetWordElement - El elemento <span> de la palabra que fue clickeada.
   */
  async function showBubbleForWord(lemma, surfaceForm, targetWordElement) {
    currently_active_lemma = lemma;
    const bubble_element = DOM_ELEMENTS.wordBubble;
    DOM_ELEMENTS.wordBubbleTitle.textContent = surfaceForm;

    const word_rect = targetWordElement.getBoundingClientRect();
    bubble_element.style.top = `${window.scrollY + word_rect.bottom + 8}px`;
    bubble_element.style.left = `${Math.max(10, word_rect.left)}px`; // Evita que se salga por la izquierda
    bubble_element.style.display = 'flex';
    
    DOM_ELEMENTS.wordBubbleDefinition.textContent = 'Buscando definición...';
    try {
      const word_info = await ExternalApisService.getWordDefinition(lemma);
      DOM_ELEMENTS.wordBubbleDefinition.textContent = `(${word_info.translation}) ${word_info.definition}`;
    } catch (error) {
      DOM_ELEMENTS.wordBubbleDefinition.textContent = 'No se pudo obtener la definición.';
      console.error('Error al obtener la definición de la palabra:', error);
    }
  }

  function hideBubble() {
    DOM_ELEMENTS.wordBubble.style.display = 'none';
    currently_active_lemma = null;
  }
  
  /**
   * Maneja los clics en los botones de acción (delegación de eventos).
   */
  function handleBubbleActionClick(event) {
    const action_button = event.target.closest('[data-status]');
    if (!action_button || !currently_active_lemma) return;
    
    const new_status = action_button.dataset.status === 'null' ? null : action_button.dataset.status;
    LexiconState.setWordLearningStatus(currently_active_lemma, new_status);
    hideBubble();
  }

  function initialize() {
    try {
      DOM_ELEMENTS.wordBubble.addEventListener('click', handleBubbleActionClick);
      // Ocultar la burbuja si se hace clic fuera de ella.
      document.addEventListener('click', (event) => {
        if (!DOM_ELEMENTS.wordBubble.contains(event.target) && !event.target.closest('.c-reader__word')) {
          hideBubble();
        }
      });
      console.log('Componente de Burbuja de Información inicializado.');
    } catch(error) {
      console.error('Error al inicializar el componente WordBubble.', error);
    }
  }

  return {
    initialize,
    showBubbleForWord,
    hideBubble,
  };
})();