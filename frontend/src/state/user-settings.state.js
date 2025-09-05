/*
  Archivo: frontend/src/state/user-settings.state.js
  Propósito: Gestiona y persiste en localStorage las configuraciones del cliente (tema, zoom, etc.).
*/

const UserSettingsState = (function () {
  'use strict';
  
  let current_theme = 'light';
  let is_focus_mode_active = false;

  /**
   * @private
   * Guarda una configuración en localStorage de forma segura, manejando posibles errores.
   * @param {string} key - La clave para guardar.
   * @param {string} value - El valor a guardar.
   */
  function saveSettingToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`No se pudo guardar la configuración '${key}' en localStorage.`, error);
    }
  }

  function toggleTheme() {
    current_theme = current_theme === 'light' ? 'dark' : 'light';
    saveSettingToLocalStorage('user_theme', current_theme);
    EventBus.publish('settings:themeChanged', { theme: current_theme });
  }

  function toggleFocusMode() {
    is_focus_mode_active = !is_focus_mode_active;
    saveSettingToLocalStorage('user_focus_mode', is_focus_mode_active);
    EventBus.publish('settings:focusModeChanged', { isActive: is_focus_mode_active });
  }

  function initialize() {
    try {
      const saved_theme = localStorage.getItem('user_theme');
      if (saved_theme === 'dark' || saved_theme === 'light') {
        current_theme = saved_theme;
      }
      const saved_focus_mode = localStorage.getItem('user_focus_mode');
      is_focus_mode_active = saved_focus_mode === 'true';
    } catch (error) {
      console.error('No se pudo leer la configuración desde localStorage.', error);
    }

    EventBus.publish('settings:themeChanged', { theme: current_theme });
    EventBus.publish('settings:focusModeChanged', { isActive: is_focus_mode_active });
    console.log(`Estado de Configuración inicializado. Tema: ${current_theme}, Modo Focalizado: ${is_focus_mode_active}`);
  }

  return {
    initialize,
    toggleTheme,
    toggleFocusMode,
  };
})();