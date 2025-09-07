/*
  Archivo: frontend/src/i18n/translation.service.js
  Propósito: Servicio principal que carga y provee las traducciones de la interfaz
             de usuario desde los archivos JSON de localización.
*/

const TranslationService = (function () {
  'use strict';

  /**
   * @private
   * Almacena las cadenas de texto del idioma actualmente cargado.
   * @type {Object.<string, string>}
   */
  let current_language_strings = {};

  /**
   * Carga el archivo de idioma correspondiente.
   * @param {string} [language_code='es'] - El código del idioma a cargar ('es', 'en').
   */
  async function initialize(language_code = 'es') {
    try {
      const response = await fetch(`../src/i18n/locales/${language_code}.json`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo de idioma para: ${language_code}`);
      }
      current_language_strings = await response.json();
      console.log(`Servicio de Traducción: Idioma '${language_code}' cargado exitosamente.`);
    } catch (error) {
      console.error('Error al inicializar el Servicio de Traducción:', error);
      // Cargar un objeto vacío para evitar que la aplicación se rompa.
      current_language_strings = {};
    }
  }

  /**
   * Obtiene la cadena de texto traducida para una clave dada.
   * @param {string} key - La clave de la cadena de texto (ej. "library_title").
   * @returns {string} La cadena traducida o la clave misma si no se encuentra.
   */
  function translate(key) {
    return current_language_strings[key] || key;
  }
  
  // Alias común para la función de traducción.
  const t = translate;

  return {
    initialize,
    translate,
    t,
  };
})();