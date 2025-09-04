/*
  Archivo: frontend/src/state/lexicon.state.js
  Propósito: Gestiona el estado del léxico del usuario (el vocabulario). Es la única fuente
             de verdad para las palabras y frases guardadas. Notifica a la aplicación
             de los cambios a través del EventBus.
*/

const LexiconState = (function () {
  'use strict';
  
  /**
   * @private
   * @type {Object.<string, Object>}
   * El objeto que almacena en memoria el léxico del usuario, donde la clave es el lema.
   */
  let user_lexicon = {};

  /**
   * Carga el estado inicial del léxico.
   * @param {Object} initialLexicon - El objeto de léxico cargado desde el servidor.
   */
  function initialize(initialLexicon = {}) {
    user_lexicon = initialLexicon;
    console.log('Estado de Léxico inicializado.');
  }

  /**
   * Procesa el clic en una palabra, actualizando o creando su entrada en el léxico.
   * @param {string} lemma - El lema (forma base) de la palabra.
   * @param {string} surfaceForm - La forma superficial de la palabra (cómo apareció en el texto).
   */
  function processWordClick(lemma, surfaceForm) {
    const lexicon_entry = user_lexicon[lemma] || {
      lemma: lemma,
      isPhrase: false,
      forms: [],
      seen: 0,
      createdAt: Date.now()
    };
    
    lexicon_entry.seen = (lexicon_entry.seen || 0) + 1;
    lexicon_entry.forms = Array.from(new Set([...(lexicon_entry.forms || []), surfaceForm]));
    lexicon_entry.updatedAt = Date.now();
    
    user_lexicon[lemma] = lexicon_entry;
    
    // Notifica a la aplicación que el léxico ha cambiado para que la UI se actualice.
    EventBus.publish('lexicon:wordUpdated', { lemma: lemma, entry: lexicon_entry });
  }
  
  /**
   * Establece el estado de aprendizaje de una palabra.
   * @param {string} lemma - El lema de la palabra a actualizar.
   * @param {string|null} newStatus - El nuevo estado ('unknown', 'learning', 'known') o null para quitarlo.
   */
  function setWordLearningStatus(lemma, newStatus) {
    if (user_lexicon[lemma]) {
      if (newStatus) {
        user_lexicon[lemma].status = newStatus;
      } else {
        delete user_lexicon[lemma].status;
      }
      user_lexicon[lemma].updatedAt = Date.now();
      
      // Notifica el cambio.
      EventBus.publish('lexicon:wordUpdated', { lemma: lemma, entry: user_lexicon[lemma] });
    }
  }

  /**
   * Obtiene el léxico completo.
   * @returns {Object} El objeto de léxico del usuario.
   */
  function getFullLexicon() {
    return user_lexicon;
  }

  // API Pública del Módulo de Estado
  return {
    initialize,
    processWordClick,
    setWordLearningStatus,
    getFullLexicon,
  };
})();