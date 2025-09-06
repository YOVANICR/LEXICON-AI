/*
  Archivo: frontend/src/components/MainMenu/main-menu.component.js
  Propósito: Gestiona la lógica de los botones de acción en el menú de navegación principal.
  (VERSIÓN ACTUALIZADA PARA EL BOTÓN DE TEMA)
*/

const MainMenuComponent = (function () {
  'use strict';
  
  function handleThemeToggleButtonClick() {
    try {
      // Toggle la clase 'dark' en el body, que CSS usará para cambiar los iconos y estilos
      document.body.classList.toggle('dark');
      // Puedes guardar esta preferencia en UserSettingsState si lo tienes implementado
      // UserSettingsState.toggleTheme();
    } catch (error) {
      console.error('Error al cambiar el tema:', error);
      ToastHandler.showToast('No se pudo cambiar el tema.');
    }
  }

  function handleUserAccountClick() {
    try {
      console.log('Se hizo clic en la sección de cuenta de usuario.');
      ToastHandler.showToast('Funcionalidad de cuenta en desarrollo!');
    } catch (error) {
      console.error('Error al interactuar con la cuenta de usuario:', error);
      ToastHandler.showToast('Error en la sección de cuenta.');
    }
  }

  function initialize() {
    try {
      const themeToggleButton = document.getElementById('btnTheme');
      const userAccountSection = document.getElementById('userAccountSection');
      
      if (themeToggleButton) {
        themeToggleButton.addEventListener('click', handleThemeToggleButtonClick);
        // Establecer el estado inicial del icono de tema si ya hay un tema guardado
        if (document.body.classList.contains('dark')) {
          themeToggleButton.classList.add('is-active'); // Esto podría no ser necesario si CSS lo maneja directamente
        }
      } else {
        console.warn('MainMenuComponent: No se encontró el botón para cambiar el tema.');
      }

      if (userAccountSection) {
        userAccountSection.addEventListener('click', handleUserAccountClick);
      } else {
        console.warn('MainMenuComponent: No se encontró la sección de cuenta de usuario.');
      }
      
      console.log('Componente de Menú Principal inicializado.');
    } catch (error) {
      console.error('Error al inicializar el Componente de Menú Principal.', error);
      ToastHandler.showToast('Error al cargar el menú principal.');
    }
  }

  return {
    initialize,
  };
})();