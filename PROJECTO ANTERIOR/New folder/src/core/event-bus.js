/*
  Archivo: frontend/src/core/event-bus.js
  Propósito: Implementa un sistema de comunicación desacoplado (patrón Publish/Subscribe).
             Permite que diferentes módulos se comuniquen entre sí emitiendo y escuchando eventos,
             sin necesidad de conocerse mutuamente, reduciendo el acoplamiento.
*/

const EventBus = (function () {
  'use strict';

  /**
   * @private
   * @type {Object.<string, Array<Function>>}
   * Almacena los eventos y sus suscriptores. La clave es el nombre del evento.
   */
  const eventSubscribers = {};

  /**
   * Se suscribe a un evento específico.
   * @param {string} eventName - El nombre del evento al que se quiere suscribir.
   * @param {Function} callbackFunction - La función que se ejecutará cuando el evento sea publicado.
   */
  function subscribe(eventName, callbackFunction) {
    if (!eventSubscribers[eventName]) {
      eventSubscribers[eventName] = [];
    }
    eventSubscribers[eventName].push(callbackFunction);
    console.log(`EventBus: Nuevo suscriptor para el evento "${eventName}".`);
  }

  /**
   * Publica (emite) un evento, notificando a todos sus suscriptores.
   * @param {string} eventName - El nombre del evento a publicar.
   * @param {*} data - Los datos que se pasarán a los suscriptores.
   */
  function publish(eventName, data) {
    if (!eventSubscribers[eventName]) {
      console.warn(`EventBus: Evento "${eventName}" publicado, pero no hay suscriptores.`);
      return;
    }

    console.log(`EventBus: Publicando evento "${eventName}" con datos:`, data);
    eventSubscribers[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`EventBus: Error al ejecutar un callback para el evento "${eventName}".`, error);
      }
    });
  }

  // Se exponen públicamente los métodos para interactuar con el bus.
  return {
    subscribe,
    publish,
  };
})();