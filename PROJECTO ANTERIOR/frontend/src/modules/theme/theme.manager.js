/*
  Archivo: frontend/src/modules/theme/theme.manager.js
  Propósito: Módulo de responsabilidad única para gestionar el tema visual (oscuro/claro).
             Escucha los cambios de estado y aplica la clase CSS correspondiente al body.
*/

const ThemeManager = (function () {
  'use strict';
  
  /**
   * @private
   * Aplica el tema visual al documento.
   * @param {Object} eventData - El objeto del evento que contiene el nombre del tema.
   */
  function applyTheme(eventData) {
    const theme_name = eventData.theme;
    if (theme_name === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    console.log(`Gestor de Tema: Tema '${theme_name}' aplicado.`);
  }

  /**
   * Inicializa el gestor de tema.
   */
  function initialize() {
    try {
      EventBus.subscribe('settings:themeChanged', applyTheme);
      console.log('Gestor de Tema inicializado y suscrito a los cambios.');
    } catch (error) {
      console.error('Error al inicializar el Gestor de Tema.', error);
    }
  }

  return {
    initialize,
  };
})();