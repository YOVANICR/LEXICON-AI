/*
  Archivo: frontend/src/state/lexicon.state.js
  Propósito: Gestiona el estado del léxico del usuario (el vocabulario).
*/

const LexiconState = (function () {
  'use strict';
  
  let user_lexicon = {};

  /**
   * @private
   * Una versión "debounced" de la función de guardado para optimizar las llamadas a la API.
   * Espera 1500ms (1.5s) después de la última modificación antes de guardar en el servidor.
   */
  const debouncedSaveLexicon = Debouncer.createDebounce(() => {
    BackendApiService.saveFullDatabase({ lexicon: user_lexicon }); // Solo guardamos el léxico por ahora
  }, 1500);

  function initialize(initialLexicon = {}) {
    user_lexicon = initialLexicon;
    EventBus.publish('lexicon:fullListLoaded', { lexicon: user_lexicon });
    console.log('Estado de Léxico inicializado.');
  }

  /**
   * Establece el estado de aprendizaje de una palabra y programa un guardado.
   * @param {string} lemma - El lema de la palabra a actualizar.
   * @param {string|null} newStatus - El nuevo estado ('unknown', 'learning', 'known') o null para quitarlo.
   */
  function setWordLearningStatus(lemma, newStatus) {
    if (!user_lexicon[lemma]) {
        // Si la palabra no existe (ej. una palabra nueva del texto), la creamos primero.
        user_lexicon[lemma] = { lemma, isPhrase: false, forms: [], seen: 1, createdAt: Date.now() };
    }

    if (newStatus) {
      user_lexicon[lemma].status = newStatus;
    } else {
      delete user_lexicon[lemma].status;
    }
    user_lexicon[lemma].updatedAt = Date.now();
    
    // Notifica inmediatamente a la UI para que se actualice al instante.
    EventBus.publish('lexicon:wordUpdated', { lemma: lemma, entry: user_lexicon[lemma] });

    // Llama a la función de guardado optimizada.
    debouncedSaveLexicon();
  }

  function getFullLexicon() {
    return user_lexicon;
  }

  return {
    initialize,
    setWordLearningStatus,
    getFullLexicon,
  };
})();