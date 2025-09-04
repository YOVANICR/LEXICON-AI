/*
  Archivo: frontend/src/utils/debouncer.js
  Propósito: Proporciona una función de "debounce". Esta utilidad de alto orden retrasa la
             ejecución de una función hasta que haya pasado un cierto tiempo sin que se
             vuelva a llamar, lo cual es ideal para optimizar operaciones costosas como
             las llamadas a la API o el re-renderizado.
*/

const Debouncer = (function () {
  'use strict';

  /**
   * Crea una versión "debounced" de una función que retrasa su ejecución.
   * @param {Function} function_to_debounce - La función cuya ejecución se va a retrasar.
   * @param {number} delay_in_ms - El tiempo en milisegundos que se debe esperar antes de ejecutar.
   * @returns {Function} La nueva función "debounced".
   */
  function createDebounce(function_to_debounce, delay_in_ms) {
    let debounce_timer;

    return function(...args) {
      // Cada vez que se llama a esta función, se limpia el temporizador anterior.
      clearTimeout(debounce_timer);
      
      // Se establece un nuevo temporizador.
      debounce_timer = setTimeout(() => {
        // Solo cuando el temporizador se completa, se ejecuta la función original.
        function_to_debounce.apply(this, args);
      }, delay_in_ms);
    }
  }

  return {
    createDebounce,
  };
})();