/*
  Archivo: frontend/src/components/MainMenu/main-menu.component.js
  Propósito: Gestiona la lógica de los botones de acción en el menú de navegación principal.
*/

const MainMenuComponent = (function () {
  'use strict';
  
  function handleThemeToggleButtonClick() {
    try {
      document.body.classList.toggle('dark');
    } catch (error) {
      console.error('Error al cambiar el tema:', error);
      ToastHandler.showToast(TranslationService.t('toast_theme_change_error'));
    }
  }

  function handleUserAccountClick() {
    try {
      console.log('Se hizo clic en la sección de cuenta de usuario.');
      ToastHandler.showToast(TranslationService.t('toast_account_in_development'));
    } catch (error)
    {
      console.error('Error al interactuar con la cuenta de usuario:', error);
      ToastHandler.showToast(TranslationService.t('toast_account_error'));
    }
  }
  
  function populateLanguageDropdown() {
    const dropdown = document.getElementById('langDropdown');
    const availableLanguages = TranslationService.getAvailableLanguages();

    if (!dropdown || !availableLanguages) return;
    
    dropdown.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (const [code, name] of Object.entries(availableLanguages)) {
      const link = document.createElement('a');
      link.href = '#';
      link.dataset.lang = code;
      link.textContent = name;
      fragment.appendChild(link);
    }
    
    dropdown.appendChild(fragment);
  }

  function handleLanguageButtonClick() {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
      dropdown.classList.toggle('is-hidden');
    }
  }

  /**
   * Maneja el clic en una opción de idioma del menú desplegable.
   * MEJORADO para ser más robusto.
   * @param {Event} event - El objeto del evento de clic.
   */
  function handleLanguageOptionClick(event) {
    event.preventDefault();
    // Nos aseguramos de que el clic fue en un enlace <a> con el atributo data-lang
    const languageLink = event.target.closest('a[data-lang]');
    
    if (!languageLink) return; // Si se hizo clic en otra parte del dropdown, no hacer nada.

    const selectedLang = languageLink.dataset.lang;
    
    if (selectedLang) {
      // La lógica de `try/catch` ahora está dentro de `TranslationService.changeLanguage`
      TranslationService.changeLanguage(selectedLang);
      document.getElementById('langDropdown').classList.add('is-hidden');
    }
  }
  
  function translateComponent() {
    // Esta función se mantiene por si se necesita en el futuro.
  }

  function initialize() {
    try {
      const themeToggleButton = document.getElementById('btnTheme');
      const userAccountSection = document.getElementById('userAccountSection');
      const languageButton = document.getElementById('btnLang');
      const languageDropdown = document.getElementById('langDropdown');

      if (themeToggleButton) {
        themeToggleButton.addEventListener('click', handleThemeToggleButtonClick);
      } else {
        console.warn('MainMenuComponent: No se encontró el botón para cambiar el tema.');
      }
      
      if (languageButton && languageDropdown) {
        populateLanguageDropdown();
        languageButton.addEventListener('click', handleLanguageButtonClick);
        languageDropdown.addEventListener('click', handleLanguageOptionClick);
      } else {
        console.warn('MainMenuComponent: No se encontraron los elementos del selector de idioma.');
      }

      if (userAccountSection) {
        userAccountSection.addEventListener('click', handleUserAccountClick);
      } else {
        console.warn('MainMenuComponent: No se encontró la sección de cuenta de usuario.');
      }
      
      console.log('Componente de Menú Principal inicializado.');
    } catch (error) {
      console.error('Error al inicializar el Componente de Menú Principal.', error);
      ToastHandler.showToast(TranslationService.t('toast_main_menu_load_error'));
    }
  }

  /**
   * @private
   * Maneja la reproducción o pausa de la música ambiental al hacer clic en el botón.
   * También gestiona el estado visual del botón (activo/inactivo).
   */
  function handleMusicPlayerButtonClick() {
    const musicPlayer = document.getElementById('ambientMusicPlayer');
    const musicButton = document.getElementById('btnMusicPlayer');

    // Verificación de seguridad para evitar errores si los elementos no existen.
    if (!musicPlayer || !musicButton) {
      console.warn('MainMenuComponent: No se encontró el reproductor de música o su botón.');
      return;
    }

    try {
      if (musicPlayer.paused) {
        musicPlayer.play();
        musicButton.classList.add('is-active');
        musicButton.title = "Pausar música";
      } else {
        musicPlayer.pause();
        musicButton.classList.remove('is-active');
        musicButton.title = "Reproducir música";
      }
    } catch (error) {
      console.error('Error al intentar controlar el reproductor de música.', error);
    }
  }

  return {
    initialize,
  };
})();