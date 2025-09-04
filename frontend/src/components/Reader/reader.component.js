/*
  Archivo: frontend/src/components/Reader/reader.component.js
  Propósito: Gestiona la lógica y el renderizado del panel Lector principal.
             Es responsable de mostrar el texto del documento activo y manejar
             las interacciones del usuario con ese texto.
*/

const ReaderComponent = (function () {
  'use strict';
  
  /**
   * Renderiza el contenido de un documento en el panel del lector.
   */
  function renderDocumentContent(eventData) {
    const documentObject = eventData ? eventData.document : null;
    const reader_container = DOM_ELEMENTS.readerContainer;

    reader_container.innerHTML = '';
    
    if (!documentObject || typeof documentObject.text !== 'string') {
      reader_container.innerHTML = '<p class="u-text-muted">Selecciona un documento de tu biblioteca para empezar a leer.</p>';
      DOM_ELEMENTS.currentDocumentTitle.textContent = 'Sin documento';
      return;
    }
    
    const tokens = TextProcessor.tokenize(documentObject.text);
    const fragment = document.createDocumentFragment();
    
    tokens.forEach(token => {
      if (token.type === 'word') {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'c-reader__word';
        wordSpan.textContent = token.text;
        wordSpan.dataset.lemma = TextProcessor.lemmaOf(token.text);
        fragment.appendChild(wordSpan);
      } else {
        fragment.appendChild(document.createTextNode(token.text));
      }
    });
    
    reader_container.appendChild(fragment);
    DOM_ELEMENTS.currentDocumentTitle.textContent = documentObject.title;
  }
  
  /**
   * Maneja los clics dentro del contenedor del lector.
   */
  function handleReaderClick(event) {
    const clicked_word_element = event.target.closest('.c-reader__word');
    if (clicked_word_element && clicked_word_element.dataset.lemma) {
      const lemma = clicked_word_element.dataset.lemma;
      const surfaceForm = clicked_word_element.textContent;
      WordBubbleComponent.showBubbleForWord(lemma, surfaceForm, clicked_word_element);
    }
  }

  /**
   * Actualiza el resaltado visual de una palabra cuando su estado cambia.
   */
  function updateWordHighlight(eventData) {
    const { lemma, entry } = eventData;
    const new_status = entry.status;
    const word_spans_in_reader = document.querySelectorAll(`.c-reader__word[data-lemma="${lemma}"]`);
    
    // Función de ayuda para obtener el color RGB del estado
    const getColorForStatus = (status) => {
        if (status === 'known') return '45,164,78';
        if (status === 'learning') return '210,153,34';
        if (status === 'unknown') return '215,58,73';
        return null;
    };

    const color_rgb = getColorForStatus(new_status);
    
    word_spans_in_reader.forEach(span => {
      if (color_rgb) {
        // La opacidad la controlará una variable global en el futuro
        span.style.backgroundColor = `rgba(${color_rgb}, 0.25)`;
      } else {
        span.style.backgroundColor = 'transparent';
      }
    });
  }
function handleReaderClick(event) {
    const clicked_word_element = event.target.closest('.c-reader__word');
    if (clicked_word_element && clicked_word_element.dataset.lemma) {
      const lemma = clicked_word_element.dataset.lemma;
      const surfaceForm = clicked_word_element.textContent;
      WordBubbleComponent.showBubbleForWord(lemma, surfaceForm, clicked_word_element);
    }
  }


/**
   * Activa o desactiva los estilos visuales para el modo de lectura focalizada.
   */
    function applyFocusModeVisuals(eventData) {
    const is_active = eventData.isActive;
    DOM_ELEMENTS.readerContainer.classList.toggle('focus-mode-active', is_active);
    console.log(`Componente Lector: Modo Focalizado ${is_active ? 'activado' : 'desactivado'}.`);
  }


  function initialize() {
    try {
      EventBus.subscribe('documents:documentSelected', renderDocumentContent);
      EventBus.subscribe('lexicon:wordUpdated', updateWordHighlight);
      
      DOM_ELEMENTS.readerContainer.addEventListener('click', handleReaderClick);
      
      renderDocumentContent(null);
      
      console.log('Componente Lector inicializado.');
    } catch (error) {
      console.error('Error al inicializar el componente Lector.', error);
    }
  }

  return {
    initialize,
  };
})();