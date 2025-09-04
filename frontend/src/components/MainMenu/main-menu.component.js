/*
  Archivo: frontend/src/components/MainMenu/main-menu.component.js
  Propósito: Gestiona la lógica de los botones de acción en el menú de navegación principal.
*/

const MainMenuComponent = (function () {
  'use strict';
  
  function handleThemeToggleButtonClick() {
    UserSettingsState.toggleTheme();
  }

  function handleFocusModeButtonClick() {
    UserSettingsState.toggleFocusMode();
  }

  function initialize() {
    try {
      const themeToggleButton = document.getElementById('btnTheme');
      const focusModeButton = document.getElementById('btnFocus');
      
      if (themeToggleButton) {
        themeToggleButton.addEventListener('click', handleThemeToggleButtonClick);
      } else {
        console.warn('Componente Menú Principal: No se encontró el botón para cambiar el tema.');
      }

      if (focusModeButton) {
        focusModeButton.addEventListener('click', handleFocusModeButtonClick);
      } else {
        console.warn('Componente Menú Principal: No se encontró el botón para el modo focalizado.');
      }
      
      console.log('Componente de Menú Principal inicializado.');
    } catch (error) {
      console.error('Error al inicializar el Componente de Menú Principal.', error);
    }
  }

  return {
    initialize,
  };
})();