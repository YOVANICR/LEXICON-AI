/* ==========================================================================
Archivo: frontend/src/features/lexicon/state/vocabulary.model.js
Propósito: (Modelo) Gestiona el estado y la lógica del vocabulario del usuario.
========================================================================== */
const VocabularyModel = (() => {
  let lexicon = {};
  let onDataChange = () => {};

  // Este array contendrá un historial de las respuestas obtenidas para la palabra actual
  // para permitir la "regeneración" o rotación entre ellas.
  let currentWordResponses = [];
  let currentResponseIndex = 0;

  function init(initialLexicon, onDataChangeCallback) {
    lexicon = initialLexicon || {};
    onDataChange = onDataChangeCallback;
  }

  function _persist() {
    onDataChange();
  }

  function processWordClick(lemma, surfaceForm, currentDocId) {
    const rec = lexicon[lemma] || { lemma, isPhrase: false, forms: [], seen: 0, docs: {} };
    rec.seen = (rec.seen || 0) + 1;
    rec.forms = Array.from(new Set([...(rec.forms || []), surfaceForm]));

    if (currentDocId) {
      rec.docs[currentDocId] = (rec.docs[currentDocId] || 0) + 1;
    }

    rec.updatedAt = Date.now();
    rec.createdAt ??= Date.now();
    lexicon[lemma] = rec;
    _persist();
  }

  function processPhraseSelection(phrase, currentDocId) {
    const lemma = phrase.toLowerCase().trim();
    if (!lemma) return;

    const rec = lexicon[lemma] || { lemma, isPhrase: true, forms: [], seen: 0, docs: {} };
    rec.isPhrase = true;
    rec.seen = (rec.seen || 0) + 1;
    rec.forms = Array.from(new Set([...(rec.forms || []), phrase]));

    if (currentDocId) {
      rec.docs[currentDocId] = (rec.docs[currentDocId] || 0) + 1;
    }

    rec.updatedAt = Date.now();
    rec.createdAt ??= Date.now();
    lexicon[lemma] = rec;
    _persist();
  }

  function setWordStatus(lemma, status) {
    if (!lexicon[lemma]) return;

    if (status) {
      lexicon[lemma].status = status;
    } else {
      delete lexicon[lemma].status;
    }

    lexicon[lemma].updatedAt = Date.now();
    _persist();
  }

  function importFromCSV(data) {
    let importedCount = 0;
    data.forEach(row => {
      const lemma = row.lemma?.trim();
      if (lemma) {
        const entry = lexicon[lemma] || { lemma, forms: [], docs: {}, createdAt: Date.now() };
        entry.isPhrase = lemma.includes(' ');
        const newStatus = row.status?.trim();

        if (newStatus && Object.values(Helpers.STATUS).includes(newStatus)) {
          entry.status = newStatus;
        }

        entry.updatedAt = Date.now();
        lexicon[lemma] = entry;
        importedCount++;
      }
    });

    if (importedCount > 0) {
      _persist();
    }
    return importedCount;
  }

  async function getWordDefinition(text, targetLangCode = 'es') {
    const isSingleWord = !text.includes(' ');
    
    // Reiniciar el historial si es una nueva palabra/frase
    if (text !== currentWordResponses[0]?.originalText) {
        currentWordResponses = [];
        currentResponseIndex = 0;
    }

    // Si ya hemos buscado una vez, intentamos obtener otra respuesta del historial
    // o simplemente volvemos a la primera si no hay más opciones
    if (currentWordResponses.length > 0 && currentResponseIndex < currentWordResponses.length -1) {
        currentResponseIndex++;
        return currentWordResponses[currentResponseIndex].info;
    } else if (currentWordResponses.length > 0) {
        // Si llegamos al final, volvemos a la primera respuesta
        currentResponseIndex = 0;
        return currentWordResponses[0].info;
    }

    // URLs para ambas APIs
    const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}`;
    const definitionUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`;
    
    let translation = 'traducción no encontrada';
    let definition = 'Definiciones solo para palabras individuales.'; // Por defecto para frases
    
    try {
      const promises = [fetch(translationUrl)];
      if (isSingleWord) {
        promises.push(fetch(definitionUrl));
        definition = 'definición no encontrada'; // Fallback para palabras
      }

      const responses = await Promise.all(promises);

      // Procesamos la respuesta de la traducción
      if (responses[0].ok) {
        const translationData = await responses[0].json();
        // Intentar obtener la traducción desde el primer match para variar si hay varios
        const translatedText = translationData.responseData?.translatedText;
        if (translatedText && translatedText !== text) { // Asegurarse que no sea la misma palabra
            translation = translatedText;
        } else if (translationData.matches && translationData.matches.length > 0) {
            // Intentar con otras coincidencias si la primera no fue buena
            for (const match of translationData.matches) {
                if (match.translation && match.translation !== text) {
                    translation = match.translation;
                    break;
                }
            }
        }
      }

      // Procesamos la respuesta de la definición (si es una palabra)
      if (isSingleWord && responses[1] && responses[1].ok) {
        const definitionData = await responses[1].json();
        // Intentar obtener una definición diferente si hay múltiples
        if (definitionData.length > 0 && definitionData[0].meanings && definitionData[0].meanings.length > 0) {
            // Recoger todas las definiciones posibles
            const allDefinitions = definitionData.flatMap(entry => 
                entry.meanings.flatMap(meaning => 
                    meaning.definitions.map(def => def.definition)
                )
            );
            // Intentar encontrar una definición que no sea la que ya está mostrada (si la hubiera)
            if (allDefinitions.length > 0) {
                const currentDefinitionText = currentWordResponses.length > 0 ? currentWordResponses[currentResponseIndex].info.definition : '';
                const newDefinition = allDefinitions.find(def => def !== currentDefinitionText);
                definition = newDefinition || allDefinitions[0]; // Usar la nueva o la primera si no hay otra
            } else {
                definition = 'No se encontró definición.';
            }
        }
      }
      
      const result = { translation, definition };
      
      // Guardar la respuesta en el historial
      currentWordResponses.push({ originalText: text, targetLangCode, info: result });
      currentResponseIndex = currentWordResponses.length - 1; // Apuntar a la última respuesta añadida

      return result;

    } catch (error) {
      console.error('Error al contactar las APIs externas:', error);
      DOM.toast('Error de red al buscar información.');
      return {
        translation: 'error',
        definition: 'No se pudo conectar a los servicios. Revisa tu conexión.'
      };
    }
  }

  function getLexiconState() {
    return lexicon;
  }

  // API Pública del Módulo
  return {
    init,
    processWordClick,
    processPhraseSelection,
    setWordStatus,
    importFromCSV,
    getLexicon: () => lexicon,
    getWordDefinition,
    getLexiconState,
  };
})();