/*
  Archivo: frontend/src/services/external-apis.service.js
  Propósito: Centraliza las llamadas a APIs de terceros (traducción, diccionario).
*/

const ExternalApisService = (function () {
  'use strict';
  
  async function getWordDefinition(text, targetLangCode = 'es') {
    const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}`;
    const definitionUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text)}`;
    
    try {
      const responses = await Promise.all([
        fetch(translationUrl),
        !text.includes(' ') ? fetch(definitionUrl) : Promise.resolve(null)
      ]);

      let translation = 'traducción no encontrada';
      let definition = 'definición no disponible';

      if (responses[0] && responses[0].ok) {
        const data = await responses[0].json();
        translation = data.responseData?.translatedText || translation;
      }
      
      if (responses[1] && responses[1].ok) {
        const data = await responses[1].json();
        definition = data[0]?.meanings[0]?.definitions[0]?.definition || definition;
      }
      
      return { translation, definition };

    } catch (error) {
      console.error('Servicio Externo: Error al contactar APIs.', error);
      throw error;
    }
  }

  return {
    getWordDefinition,
  };
})();