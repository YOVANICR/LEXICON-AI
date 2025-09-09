/*
  Archivo: frontend/src/utils/text-processor.js
  Propósito: Proporciona funciones de utilidad para el Procesamiento de Lenguaje Natural (PLN)
             en el lado del cliente, como tokenización (dividir texto en palabras) y
             lematización (encontrar la forma base de una palabra).
  Versión: 2.0 (Mejorada con manejo de errores y depuración)
*/

const TextProcessor = (function () {
  'use strict';
  
  // Expresión regular mejorada para capturar palabras (letras y números Unicode) y apóstrofes.
  const WORD_REGEX = /[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/u;

  /**
   * Divide una cadena de texto en un array de "tokens".
   * Un token es un objeto que representa una palabra o caracteres no alfabéticos.
   * @param {string} text_to_tokenize - El texto de entrada.
   * @returns {Array<{type: 'word' | 'non-word', text: string}>} Un array de objetos token.
   */
  function tokenize(text_to_tokenize) {
    // ==================================================================
    // 1. Bloque try...catch para Manejo de Errores (Como pide el manual)
    // ==================================================================
    try {
      console.log(`[TextProcessor]: Iniciando tokenización...`);

      // Validación robusta de la entrada.
      if (typeof text_to_tokenize !== 'string') {
        console.warn('[TextProcessor]: La entrada no es un string. Se devuelve un array vacío.', text_to_tokenize);
        return [];
      }
      if (text_to_tokenize.length === 0) {
        console.log('[TextProcessor]: La entrada está vacía. Tokenización completada.');
        return [];
      }

      const tokens = [];
      let remaining_text = text_to_tokenize;
      let safety_counter = 0; // Medida de seguridad contra bucles infinitos.
      const MAX_ITERATIONS = text_to_tokenize.length * 2; // Un límite generoso.

      while (remaining_text.length > 0) {
        // Medida de seguridad
        if (++safety_counter > MAX_ITERATIONS) {
          throw new Error('Se ha superado el número máximo de iteraciones. Posible bucle infinito.');
        }

        const match = remaining_text.match(WORD_REGEX);

        if (match) {
          const non_word_part = remaining_text.slice(0, match.index);
          if (non_word_part.length > 0) {
            tokens.push({ type: 'non-word', text: non_word_part });
          }

          const word_part = match[0];
          tokens.push({ type: 'word', text: word_part });
          
          remaining_text = remaining_text.slice(match.index + word_part.length);
        } else {
          tokens.push({ type: 'non-word', text: remaining_text });
          break; 
        }
      }

      console.log(`[TextProcessor]: Tokenización completada. Se encontraron ${tokens.length} tokens.`);
      return tokens;

    } catch (error) {
      // ==================================================================
      // 2. Captura y Muestra de Errores en Consola
      // ==================================================================
      console.error('[TextProcessor]: Ocurrió un error grave durante la tokenización.', {
        mensaje: error.message,
        texto_original: text_to_tokenize,
        stack_trace: error.stack
      });
      // Devolvemos un array vacío para evitar que la aplicación se rompa.
      return [];
    }
  }

  /**
   * Intenta encontrar la forma base (lema) de una palabra.
   * @param {string} word_to_lemmatize - La palabra a lematizar.
   * @returns {string} El lema de la palabra en minúsculas.
   */
  function lemmaOf(word_to_lemmatize) {
    if (typeof word_to_lemmatize !== 'string') return '';
    return word_to_lemmatize.toLowerCase();
  }
  
  // API Pública de la Utilidad
  return {
    tokenize,
    lemmaOf,
  };
})();